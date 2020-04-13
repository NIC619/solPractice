const GarbledCircuit = artifacts.require("GarbledCircuit");

function gen_key(num_bits) {
	var key = new Uint8Array(num_bits);
	for (var i = 0; i < num_bits; i++) {
		key[i] = Math.floor((Math.random() * 256));
	}
	return key;
}

function xor(a, b) {
	if(a.length != b.length) throw 'XORing array with different length';
	var c = new Uint8Array(a.length);
	for (var i = 0; i < a.length; i++) {
		c[i] = a[i] ^ b[i];
	}
	return c;
}

// 0: x_0, y_0
// 1: x_0, y_1
// 2: x_1, y_0
// 3: x_1, y_1
function get_entry_index(x, y) {
	if(x == 0 && y == 0) return 0;
	else if(x == 0 && y == 1) return 1;
	else if(x == 1 && y == 0) return 2;
	else if(x == 1 && y == 1) return 3;
	else throw 'Invalid x,y values';
}

function get_NAND_entry_result(entry) {
	if(entry == 3) return 0;
	else return 1;
}

function garbling_NAND_entries(x_0, x_1, y_0, y_1, z_0, z_1) {
	return [xor(xor(x_0, y_0), z_1), xor(xor(x_0, y_1), z_1), xor(xor(x_1, y_0), z_1), xor(xor(x_1, y_1), z_0)];
}

contract('GarbledCircuit', () => {
	it('should successfully deploy and decrypt a 7 tables circuit', async () => {
		const GarbledCircuitInstance = await GarbledCircuit.new();

		// Layout of tables
		//        t_6
		//      /     \
		//    t_4     t_5
		//   /  \     /  \
		// t_0  t_1  t_2  t_3

		const num_inputs = 4;
		const num_gttables = 7;
		var table_indices = [0, 1, 2, 3, 4, 5, 6];
		const num_results = 1;
		// Format of table relation entry: [child_table_index, parent_table_index, is_input_x_to_parent_table]
		// and for is_input_x_to_parent_table, 1 means yes, 0 means
		// This table relation means:
		// paretn table of table 0 is input x of table 4
		// paretn table of table 1 is input y of table 4
		// paretn table of table 2 is input x of table 5
		// paretn table of table 3 is input y of table 5
		// paretn table of table 4 is input x of table 6
		// paretn table of table 5 is input y of table 6
		var table_relation = [[0, 4, 1], [1, 4, 0], [2, 5, 1], [3, 5, 0], [4, 6, 1], [5, 6, 0]];
		// entry in same_entry_tables represents two tables that share same input
		// Format of same_entry_tables entry: [table_1, is_input_x, table_2, is_input_x]
		// For example: [3, 1, 1, 0] means that input y of table 3 share the same input as input x of table 1
		var same_entry_tables = [];
		var indices_of_end_tables = [6];
		var indices_of_initial_input_tables = [0, 1, 2, 3];
		var execution_sequence = [0, 1, 2, 3, 4, 5, 6];

		var ttables = new Array(num_gttables);
		// Generate x,y inputs for each truth tables
		for (var index of table_indices) {
			var ttable = new Object();
			ttable.x_0 = gen_key(32);
			ttable.x_1 = gen_key(32);
			ttable.y_0 = gen_key(32);
			ttable.y_1 = gen_key(32);
			// Fix tables' inputs that share the same input
			for (var pair of same_entry_tables) {
				var table_index_1 = pair[0];
				if(index == table_index_1) {
					var table_1_is_input_x = pair[1];
					var table_index_2 = pair[2];
					var table_2_is_input_x = pair[3];
					var entries = new Array(2);
					if(table_2_is_input_x == 1) {
						entries[0] = ttables[table_index_2].x_0;
						entries[1] = ttables[table_index_2].x_1;
					} else {
						entries[0] = ttables[table_index_2].y_0;
						entries[1] = ttables[table_index_2].y_1;
					}
					if(table_1_is_input_x == 1) {
						ttables[table_index_2].x_0 = entries[0];
						ttables[table_index_2].x_1 = entries[1];
					} else {
						ttables[table_index_2].y_0 = entries[0];
						ttables[table_index_2].y_1 = entries[1];
					}
				}
			}
			// shuffled sequence:;
			ttable.shuffled_sequence = [0, 1, 2, 3];
			ttable.fn_get_entry_result = get_NAND_entry_result;
			ttables[index] = ttable;
		}
		// Build relation between tables
		for (var i = 0; i < table_relation.length; i++) {
			var ttable = ttables[table_relation[i][0]];
			if(ttable.parent_table_indices !== undefined) {
				ttable.parent_table_indices.push(table_relation[i][1]);
			} else {
				ttable.parent_table_indices = [table_relation[i][1]];
			}
			var parent_table = ttables[table_relation[i][1]];
			if(table_relation[i][2] == 1) {
				ttable.input_x = 1;
				ttable.z_0 = parent_table.x_0;
				ttable.z_1 = parent_table.x_1;
			} else {
				ttable.input_x = 0;
				ttable.z_0 = parent_table.y_0;
				ttable.z_1 = parent_table.y_1;
			}
		}
		// Generate z(output of table) for end tables
		for (var i = 0; i < indices_of_end_tables.length; i++) {
			var ttable = ttables[indices_of_end_tables[i]];
			ttable.z_0 = gen_key(32);
			ttable.z_1 = gen_key(32);
		}
		// Generate garbled truth tables
		var gttables = new Array(num_gttables);
		for (var i = 0; i < num_gttables; i++) {
			var ttable = ttables[i];
			gttable = garbling_NAND_entries(ttable.x_0, ttable.x_1, ttable.y_0, ttable.y_1, ttable.z_0, ttable.z_1);
			gttables[i] = gttable;
		}

		// Sample half of initial inputs
		var half_inputs = new Array(num_inputs);
		var inputs_to_each_table = new Object();
		for (var i = 0; i < indices_of_initial_input_tables.length; i++) {
			var table_index = indices_of_initial_input_tables[i];
			var bit_index = Math.floor((Math.random() * 2));
			inputs_to_each_table[table_index] = new Object();
			if(bit_index == 0) {
				half_inputs[i] = ttables[table_index].y_0;
				inputs_to_each_table[table_index].y = 0;
			} else {
				half_inputs[i] = ttables[table_index].y_1;
				inputs_to_each_table[table_index].y = 1;
			}
		}

		// Garbled circuit results
		var outputs = new Array(num_results);
		for (var i = 0; i < indices_of_end_tables.length; i++) {
			var table_index = indices_of_end_tables[i];
			outputs[i] = [ttables[table_index].z_0, ttables[table_index].z_1];
		}

		// Deploy the circuit
		await GarbledCircuitInstance.deploy(
			num_inputs,
			table_relation,
			table_indices,
			gttables,
			indices_of_initial_input_tables,
			half_inputs,
			indices_of_end_tables,
			outputs,
		);

		// Verify content of deployed circuit
		for (var i = 0; i < num_gttables; i++) {
			var gtt = await GarbledCircuitInstance.read_gtt.call(i);
			for (var j = 0; j < 4; j++) {
				assert.equal(gtt[j], web3.utils.bytesToHex(gttables[i][j]), "Incorrect entry content");
			}
		}
		for (var i = 0; i < indices_of_initial_input_tables.length; i++) {
			var table_index = indices_of_initial_input_tables[i];
			var input = await GarbledCircuitInstance.read_inputs_of_table.call(table_index);
			assert.equal(input[1], web3.utils.bytesToHex(half_inputs[i]), "Incorrect half of inputs");
		}
		for (var i = 0; i < indices_of_end_tables.length; i++) {
			var table_index = indices_of_end_tables[i];
			var results = await GarbledCircuitInstance.read_outputs_of_table.call(table_index);
			assert.equal(results[0], web3.utils.bytesToHex(outputs[i][0]), "Incorrect bit results");
			assert.equal(results[1], web3.utils.bytesToHex(outputs[i][1]), "Incorrect bit results");
		}

		// Sample the other half of initial inputs
		var other_half_inputs = new Array(num_inputs);
		for (var i = 0; i < indices_of_initial_input_tables.length; i++) {
			var table_index = indices_of_initial_input_tables[i];
			var bit_index = Math.floor((Math.random() * 2));
			if(bit_index == 0) {
				other_half_inputs[i] = ttables[table_index].x_0;
				inputs_to_each_table[table_index].x = 0;
			} else {
				other_half_inputs[i] = ttables[table_index].x_1;
				inputs_to_each_table[table_index].x = 1;
			}
		}

		// Compute final entry sequence
		var entry_sequence = new Array(execution_sequence.length);
		var entry_result_of_end_tables = new Object();
		for (var i = 0; i < execution_sequence.length; i++) {
			var table_index = execution_sequence[i];
			var ttable = ttables[table_index];
			var entry_index = get_entry_index(inputs_to_each_table[i].x, inputs_to_each_table[i].y);
			entry_sequence[i] = [execution_sequence[i], ttable.shuffled_sequence.indexOf(entry_index)];
			var entry_result = ttable.fn_get_entry_result(entry_index);
			// Record entry result for end tables
			if(indices_of_end_tables.indexOf(table_index) >= 0) {
				entry_result_of_end_tables[table_index] = entry_result;
			}
			// Fill in entry result for parent table if this is not an end table
			if(ttable.parent_table_indices === undefined) continue;
			for (var parent_table_index of ttable.parent_table_indices) {
				if(inputs_to_each_table[parent_table_index] === undefined) {
					inputs_to_each_table[parent_table_index] = new Object();
				}
				if(ttable.input_x == undefined) throw 'No indication of x or y input';
				else if(ttable.input_x == 1) {
					inputs_to_each_table[parent_table_index].x = entry_result;
				} else {
					inputs_to_each_table[parent_table_index].y = entry_result;
				}
			}
		}

		// Decrypt
		await GarbledCircuitInstance.decrypt(
			indices_of_initial_input_tables,
			other_half_inputs,
			entry_sequence,
			indices_of_end_tables,
		);
		// Verify that result is correct
		for (table_index in entry_result_of_end_tables) {
			var decryption_result = await GarbledCircuitInstance.read_decryption_result.call(table_index);
			assert.equal(decryption_result, entry_result_of_end_tables[table_index], "Incorrect results");
		}

	});
});