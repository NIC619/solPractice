const GarbledCircuit = artifacts.require("GarbledCircuit");

const utils = require('./utils');
gen_key = utils.gen_key;
xor = utils.xor;
get_entry_index = utils.get_entry_index;
get_OR_entry_result = utils.get_OR_entry_result;
garbling_OR_entries = utils.garbling_OR_entries;
get_AND_entry_result = utils.get_AND_entry_result;
garbling_AND_entries = utils.garbling_AND_entries;
get_XOR_entry_result = utils.get_XOR_entry_result;
garbling_XOR_entries = utils.garbling_XOR_entries;
get_NAND_entry_result = utils.get_NAND_entry_result;
garbling_NAND_entries = utils.garbling_NAND_entries;
gen_update_label_table = utils.gen_update_label_table;
decrypt_update_label_entries = utils.decrypt_update_label_entries;


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
		// and for is_input_x_to_parent_table, 1 means yes, 0 means no
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
		// For example: [3, 1, 1, 0] means that input x of table 3 share the same input as input y of table 1
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
						ttable.x_0 = entries[0];
						ttable.x_1 = entries[1];
					} else {
						ttable.y_0 = entries[0];
						ttable.y_1 = entries[1];
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
			if(ttable.input_x === undefined) {
				ttable.input_x = new Object();
			}
			if(table_relation[i][2] == 1) {
				ttable.input_x[table_relation[i][1]] = 1;
				ttable.z_0 = parent_table.x_0;
				ttable.z_1 = parent_table.x_1;
			} else {
				ttable.input_x[table_relation[i][1]] = 0;
				ttable.z_0 = parent_table.y_0;
				ttable.z_1 = parent_table.y_1;
			}
			ttable.output_hash_digests = [
				web3.utils.keccak256(web3.utils.bytesToHex(ttable.z_0)),
				web3.utils.keccak256(web3.utils.bytesToHex(ttable.z_1)),
			];
		}
		// Generate z(output of table) for end tables
		for (var index of indices_of_end_tables) {
			var ttable = ttables[index];
			ttable.z_0 = gen_key(32);
			ttable.z_1 = gen_key(32);
			ttable.output_hash_digests = [
				web3.utils.keccak256(web3.utils.bytesToHex(ttable.z_0)),
				web3.utils.keccak256(web3.utils.bytesToHex(ttable.z_1)),
			];
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

		var table_output_hash_digests = new Array();
		for (var index of table_indices) {
			var ttable = ttables[index];
			table_output_hash_digests.push(ttable.output_hash_digests);
		}

		// Deploy the circuit
		await GarbledCircuitInstance.initial_deploy(
			num_inputs,
			table_relation,
			table_indices,
			gttables,
			table_output_hash_digests,
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
			var output_hash_digests = await GarbledCircuitInstance.read_output_hash_digests_of_table.call(i);
			for (var j = 0; j < 2; j++) {
				assert.equal(output_hash_digests[j], ttables[i].output_hash_digests[j], "Incorrect entry content");
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
		var entry_result_of_end_tables = new Object();
		for (var table_index of execution_sequence) {
			var ttable = ttables[table_index];
			var entry_index = get_entry_index(inputs_to_each_table[table_index].x, inputs_to_each_table[table_index].y);
			var entry_result = ttable.fn_get_entry_result(entry_index);
			// Record entry result for end tables
			if(indices_of_end_tables.indexOf(table_index) >= 0) {
				entry_result_of_end_tables[table_index] = entry_result;
			}
			if(ttable.parent_table_indices === undefined) continue;
			// Fill in entry result for parent table if this is not an end table
			for (var parent_table_index of ttable.parent_table_indices) {
				if(inputs_to_each_table[parent_table_index] === undefined) {
					inputs_to_each_table[parent_table_index] = new Object();
				}
				if(ttable.input_x[parent_table_index] == undefined) throw 'No indication of x or y input';
				else if(ttable.input_x[parent_table_index] == 1) {
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
			execution_sequence,
			indices_of_end_tables,
		);
		// Verify that result is correct
		for (table_index in entry_result_of_end_tables) {
			var decryption_result = await GarbledCircuitInstance.read_decryption_result.call(table_index);
			assert.equal(decryption_result, entry_result_of_end_tables[table_index], "Incorrect results");
		}

	});

	it('should successfully run update input label circuit', async () => {
		var old_0 = gen_key(32);
		var old_1 = gen_key(32);
		var new_0 = gen_key(32);
		var new_1 = gen_key(32);

		[entry_0, entry_1, output_hash_digest_0, output_hash_digest_1] = gen_update_label_table(old_0, old_1, new_0, new_1);
		var result = decrypt_update_label_entries(entry_0, entry_1, old_0, output_hash_digest_0, output_hash_digest_1);
		assert.equal(web3.utils.bytesToHex(result), web3.utils.bytesToHex(new_0), "Incorrect decrypt result");
		result = decrypt_update_label_entries(entry_0, entry_1, old_1, output_hash_digest_0, output_hash_digest_1);
		assert.equal(web3.utils.bytesToHex(result), web3.utils.bytesToHex(new_1), "Incorrect decrypt result");
	});

	it('should successfully deploy and decrypt the 4 pos example circuit', async () => {
		const GarbledCircuitInstance = await GarbledCircuit.new();

		// Layout of tables in /4_pos_circuit_example.png

		const num_inputs = 8;
		const num_gttables = 13;
		var table_indices = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
		var indices_of_dummy_tables = [4, 8];
		const num_results = 2;
		var table_type = new Object()
		table_type["XOR"] = [1, 2, 3, 4, 5, 6, 7, 8];
		table_type["OR"] = [9, 10, 11];
		table_type["AND"] = [12, 13];
		// Format of table relation entry: [child_table_index, parent_table_index, is_input_x_to_parent_table]
		// and for is_input_x_to_parent_table, 1 means yes, 0 means no
		var table_relation = [
			[1, 9, 1],
			[2, 10, 1],
			[3, 11, 1],
			[5, 9, 0],
			[6, 10, 0],
			[7, 11 ,0],
			[9, 12, 1],
			[9, 13, 1],
			[10, 12, 0],
			[11, 13, 0],
		];
		// entry in same_entry_tables represents two tables that share same input
		// Format of same_entry_tables entry: [table_1, is_input_x, table_2, is_input_x]
		// For example: [3, 1, 1, 0] means that input x of table 3 share the same input as input y of table 1
		var same_entry_tables = [[13, 1, 12, 1]];
		var indices_of_end_tables = [12, 13];
		var indices_of_initial_input_tables = [1, 2, 3, 4, 5, 6, 7, 8];
		var execution_sequence = [1, 2, 3, 5, 6, 7, 9, 10, 11, 12, 13];

		var ttables = new Object();
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
						ttable.x_0 = entries[0];
						ttable.x_1 = entries[1];
					} else {
						ttable.y_0 = entries[0];
						ttable.y_1 = entries[1];
					}
				}
			}
			// shuffled sequence:;
			ttable.shuffled_sequence = [0, 1, 2, 3];
			ttables[index] = ttable;
		}
		// Generate input label update gttable for next round
		var label_updates = new Array(num_inputs);
		for (var i = 0; i < indices_of_initial_input_tables.length; i++) {
			var table_index = indices_of_initial_input_tables[i];
			var ttable = ttables[table_index];
			var new_y_0 = gen_key(32);
			var new_y_1 = gen_key(32);

			label_updates[i] = [entry_0, entry_1, output_hash_digest_0, output_hash_digest_1] = gen_update_label_table(ttable.y_0, ttable.y_1, new_y_0, new_y_1);
		}
		// Fill in table type
		for (var type in table_type) {
			if(type == "OR") {
				for (var table_index of table_type[type]) {
					ttables[table_index].fn_get_entry_result = get_OR_entry_result;
					ttables[table_index].fn_garbling = garbling_OR_entries;
				}
			} else if(type == "AND") {
				for (var table_index of table_type[type]) {
					ttables[table_index].fn_get_entry_result = get_AND_entry_result;
					ttables[table_index].fn_garbling = garbling_AND_entries;
				}
			} else if(type == "XOR") {
				for (var table_index of table_type[type]) {
					ttables[table_index].fn_get_entry_result = get_XOR_entry_result;
					ttables[table_index].fn_garbling = garbling_XOR_entries;
				}
			}
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
			if(ttable.input_x === undefined) {
				ttable.input_x = new Object();
			}
			if(table_relation[i][2] == 1) {
				ttable.input_x[table_relation[i][1]] = 1;
				ttable.z_0 = parent_table.x_0;
				ttable.z_1 = parent_table.x_1;
			} else {
				ttable.input_x[table_relation[i][1]] = 0;
				ttable.z_0 = parent_table.y_0;
				ttable.z_1 = parent_table.y_1;
			}
			ttable.output_hash_digests = [
				web3.utils.keccak256(web3.utils.bytesToHex(ttable.z_0)),
				web3.utils.keccak256(web3.utils.bytesToHex(ttable.z_1)),
			];
		}
		// Generate z(output of table) for dummy tables
		for (var index of indices_of_dummy_tables) {
			var ttable = ttables[index];
			ttable.z_0 = gen_key(32);
			ttable.z_1 = gen_key(32);
			ttable.output_hash_digests = [
				web3.utils.keccak256(web3.utils.bytesToHex(ttable.z_0)),
				web3.utils.keccak256(web3.utils.bytesToHex(ttable.z_1)),
			];
		}
		// Generate z(output of table) for end tables
		for (var index of indices_of_end_tables) {
			var ttable = ttables[index];
			ttable.z_0 = gen_key(32);
			ttable.z_1 = gen_key(32);
			ttable.output_hash_digests = [
				web3.utils.keccak256(web3.utils.bytesToHex(ttable.z_0)),
				web3.utils.keccak256(web3.utils.bytesToHex(ttable.z_1)),
			];
		}
		// Generate garbled truth tables
		var gttables = new Object();
		for (var i of table_indices) {
			var ttable = ttables[i];
			gttable = ttable.fn_garbling(ttable.x_0, ttable.x_1, ttable.y_0, ttable.y_1, ttable.z_0, ttable.z_1);
			gttables[i] = gttable;
		}

		// Generate half of initial inputs according to inputs in /4_pos_circuit_result_example.png
		var bit_in_each_y_input = [1, 1, 0, 0, 1, 0, 1, 0];
		var expected_result = [1, 0];
		var half_inputs = new Array(num_inputs);
		var inputs_to_each_table = new Object();
		for (var i = 0; i < indices_of_initial_input_tables.length; i++) {
			var table_index = indices_of_initial_input_tables[i];
			var bit_index = bit_in_each_y_input[i];
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

		var gttables_array = Object.values(gttables);
		var table_output_hash_digests = new Array();
		for (var index of table_indices) {
			var ttable = ttables[index];
			table_output_hash_digests.push(ttable.output_hash_digests);
		}

		// Deploy the circuit
		await GarbledCircuitInstance.initial_deploy(
			num_inputs,
			table_relation,
			table_indices,
			gttables_array,
			table_output_hash_digests,
			indices_of_initial_input_tables,
			half_inputs,
			indices_of_end_tables,
			outputs,
		);

		// Verify content of deployed circuit
		for (var index of table_indices) {
			var gtt = await GarbledCircuitInstance.read_gtt.call(index);
			for (var j = 0; j < 4; j++) {
				assert.equal(gtt[j], web3.utils.bytesToHex(gttables[index][j]), "Incorrect entry content");
			}
		}
		for (var index of table_indices) {
			var parent_table_indices = await GarbledCircuitInstance.read_parent_table_indices.call(index);
			if(indices_of_dummy_tables.indexOf(index) >= 0) {
				assert.equal(parent_table_indices.length, 0, "Dummy table does not have parent table");
				continue;
			}
			if(indices_of_end_tables.indexOf(index) >= 0) {
				assert.equal(parent_table_indices.length, 0, "End table should not have parent table");
				continue;
			}
			for (var i = 0; i < ttables[index].parent_table_indices.length; i++) {
				assert.equal(ttables[index].parent_table_indices[i], parent_table_indices[i].toNumber(), "Incorrect parent table indices");
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

		// Upload label updates info
		await GarbledCircuitInstance.update_labels(indices_of_initial_input_tables, label_updates);

		// Verify label updates
		var update_input_label_gttable = new Object();
		var uploaded_label_updates = await GarbledCircuitInstance.read_label_updates.call(indices_of_initial_input_tables);
		for (var i = 0; i < indices_of_initial_input_tables.length; i++) {
			var table_index = indices_of_initial_input_tables[i];
			for (var j = 0; j < 2; j++) {
				assert.equal(uploaded_label_updates[i][j], web3.utils.bytesToHex(label_updates[i][j]), "Incorrect label");
			}
			for (var j = 2; j < 4; j++) {
				assert.equal(uploaded_label_updates[i][j], label_updates[i][j], "Incorrect label hash digest");
			}
			update_input_label_gttable[table_index] = new Object();
			update_input_label_gttable[table_index].entry_0 = web3.utils.hexToBytes(uploaded_label_updates[i][0]);
			update_input_label_gttable[table_index].entry_1 = web3.utils.hexToBytes(uploaded_label_updates[i][1]);
			update_input_label_gttable[table_index].output_hash_digest_0 = uploaded_label_updates[i][2];
			update_input_label_gttable[table_index].output_hash_digest_1 = uploaded_label_updates[i][3];
		}

		// Generate other half of inputs according to inputs in /4_pos_circuit_result_example.png
		var bit_in_each_x_input = [0, 0, 0, 0, 1, 1, 1, 1];
		var other_half_inputs = new Array(num_inputs);
		for (var i = 0; i < indices_of_initial_input_tables.length; i++) {
			var table_index = indices_of_initial_input_tables[i];
			var bit_index = bit_in_each_x_input[i];
			if(bit_index == 0) {
				other_half_inputs[i] = ttables[table_index].x_0;
				inputs_to_each_table[table_index].x = 0;
			} else {
				other_half_inputs[i] = ttables[table_index].x_1;
				inputs_to_each_table[table_index].x = 1;
			}
		}

		// Compute final entry sequence
		var entry_result_of_end_tables = new Object();
		for (var table_index of execution_sequence) {
			var ttable = ttables[table_index];
			var entry_index = get_entry_index(inputs_to_each_table[table_index].x, inputs_to_each_table[table_index].y);
			var entry_result = ttable.fn_get_entry_result(entry_index);
			// Record entry result for end tables
			if(indices_of_end_tables.indexOf(table_index) >= 0) {
				entry_result_of_end_tables[table_index] = entry_result;
			}
			if(ttable.parent_table_indices === undefined) continue;
			// Fill in entry result for parent table if this is not an end table
			for (var parent_table_index of ttable.parent_table_indices) {
				if(inputs_to_each_table[parent_table_index] === undefined) {
					inputs_to_each_table[parent_table_index] = new Object();
				}
				if(ttable.input_x[parent_table_index] == undefined) throw 'No indication of x or y input';
				else if(ttable.input_x[parent_table_index] == 1) {
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
			execution_sequence,
			indices_of_end_tables,
		);
		// Verify that result is correct
		for (table_index of indices_of_end_tables) {
			var decryption_result = await GarbledCircuitInstance.read_decryption_result.call(table_index);
			assert.equal(decryption_result.toNumber(), expected_result[indices_of_end_tables.indexOf(table_index)], "Incorrect results");
		}

		// Re-deploy with new circuit entries and inputs

		// Generate x,y inputs for each truth tables
		for (var index of table_indices) {
			var ttable = ttables[index];
			ttable.x_0 = gen_key(32);
			ttable.x_1 = gen_key(32);
			// Update input label
			if(indices_of_initial_input_tables.indexOf(index) >= 0) {
				var gttable = update_input_label_gttable[index];
				ttable.y_0 = decrypt_update_label_entries(gttable.entry_0, gttable.entry_1, ttable.y_0, gttable.output_hash_digest_0, gttable.output_hash_digest_1);
				ttable.y_1 = decrypt_update_label_entries(gttable.entry_0, gttable.entry_1, ttable.y_1, gttable.output_hash_digest_0, gttable.output_hash_digest_1);
			} else {
				ttable.y_0 = gen_key(32);
				ttable.y_1 = gen_key(32);
			}
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
						ttable.x_0 = entries[0];
						ttable.x_1 = entries[1];
					} else {
						ttable.y_0 = entries[0];
						ttable.y_1 = entries[1];
					}
				}
			}
			// shuffled sequence:;
			ttable.shuffled_sequence = [0, 1, 2, 3];
		}
		// Generate input label update gttable for next round
		for (var i = 0; i < indices_of_initial_input_tables.length; i++) {
			var table_index = indices_of_initial_input_tables[i];
			var ttable = ttables[table_index];
			var new_y_0 = gen_key(32);
			var new_y_1 = gen_key(32);

			label_updates[i] = [entry_0, entry_1, output_hash_digest_0, output_hash_digest_1] = gen_update_label_table(ttable.y_0, ttable.y_1, new_y_0, new_y_1);
		}
		// Fill in child table's outputs(i.e., parent table's input)
		for (var i = 0; i < table_relation.length; i++) {
			var ttable = ttables[table_relation[i][0]];
			var parent_table = ttables[table_relation[i][1]];
			if(table_relation[i][2] == 1) {
				ttable.z_0 = parent_table.x_0;
				ttable.z_1 = parent_table.x_1;
			} else {
				ttable.z_0 = parent_table.y_0;
				ttable.z_1 = parent_table.y_1;
			}
			ttable.output_hash_digests = [
				web3.utils.keccak256(web3.utils.bytesToHex(ttable.z_0)),
				web3.utils.keccak256(web3.utils.bytesToHex(ttable.z_1)),
			];
		}
		// Generate z(output of table) for dummy tables
		for (var index of indices_of_dummy_tables) {
			var ttable = ttables[index];
			ttable.z_0 = gen_key(32);
			ttable.z_1 = gen_key(32);
			ttable.output_hash_digests = [
				web3.utils.keccak256(web3.utils.bytesToHex(ttable.z_0)),
				web3.utils.keccak256(web3.utils.bytesToHex(ttable.z_1)),
			];
		}
		// Generate z(output of table) for end tables
		for (var index of indices_of_end_tables) {
			var ttable = ttables[index];
			ttable.z_0 = gen_key(32);
			ttable.z_1 = gen_key(32);
			ttable.output_hash_digests = [
				web3.utils.keccak256(web3.utils.bytesToHex(ttable.z_0)),
				web3.utils.keccak256(web3.utils.bytesToHex(ttable.z_1)),
			];
		}
		// Generate garbled truth tables
		for (var i of table_indices) {
			var ttable = ttables[i];
			gttables[i] = ttable.fn_garbling(ttable.x_0, ttable.x_1, ttable.y_0, ttable.y_1, ttable.z_0, ttable.z_1);
		}

		// Generate half of initial inputs
		// The inputs generated are not yet shuffled 
		for (var i = 0; i < indices_of_initial_input_tables.length; i++) {
			var table_index = indices_of_initial_input_tables[i];
			var bit_index = bit_in_each_y_input[i];
			if(bit_index == 0) {
				half_inputs[i] = ttables[table_index].y_0;
				inputs_to_each_table[table_index].y = 0;
			} else {
				half_inputs[i] = ttables[table_index].y_1;
				inputs_to_each_table[table_index].y = 1;
			}
		}

		// Garbled circuit results
		for (var i = 0; i < indices_of_end_tables.length; i++) {
			var table_index = indices_of_end_tables[i];
			outputs[i] = [ttables[table_index].z_0, ttables[table_index].z_1];
		}

		gttables_array = Object.values(gttables);
		var table_output_hash_digests = new Array();
		for (var index of table_indices) {
			var ttable = ttables[index];
			table_output_hash_digests.push(ttable.output_hash_digests);
		}

		// Deploy the circuit
		await GarbledCircuitInstance.redeploy(
			table_indices,
			gttables_array,
			table_output_hash_digests,
			indices_of_initial_input_tables,
			half_inputs,
			indices_of_end_tables,
			outputs,
		);

		// Upload label updates info
		await GarbledCircuitInstance.update_labels(indices_of_initial_input_tables, label_updates);

		// Verify label updates
		uploaded_label_updates = await GarbledCircuitInstance.read_label_updates.call(indices_of_initial_input_tables);
		for (var i = 0; i < indices_of_initial_input_tables.length; i++) {
			var table_index = indices_of_initial_input_tables[i];
			for (var j = 0; j < 2; j++) {
				assert.equal(uploaded_label_updates[i][j], web3.utils.bytesToHex(label_updates[i][j]), "Incorrect label");
			}
			for (var j = 2; j < 4; j++) {
				assert.equal(uploaded_label_updates[i][j], label_updates[i][j], "Incorrect label hash digest");
			}
			update_input_label_gttable[table_index].entry_0 = web3.utils.hexToBytes(uploaded_label_updates[i][0]);
			update_input_label_gttable[table_index].entry_1 = web3.utils.hexToBytes(uploaded_label_updates[i][1]);
			update_input_label_gttable[table_index].output_hash_digest_0 = uploaded_label_updates[i][2];
			update_input_label_gttable[table_index].output_hash_digest_1 = uploaded_label_updates[i][3];
		}

		// Generate half of initial inputs according to inputs in /4_pos_redeploy_circuit_example.png
		// This time the input bits are shuffled and so are different from inputs in /4_pos_circuit_result_example.png
		bit_in_each_y_input = [0, 1, 1, 0, 0, 1, 0, 1];
		expected_result = [1, 1];
		for (var i = 0; i < indices_of_initial_input_tables.length; i++) {
			var table_index = indices_of_initial_input_tables[i];
			var bit_index = bit_in_each_y_input[i];
			if(bit_index == 0) {
				half_inputs[i] = ttables[table_index].y_0;
				inputs_to_each_table[table_index].y = 0;
			} else {
				half_inputs[i] = ttables[table_index].y_1;
				inputs_to_each_table[table_index].y = 1;
			}
		}
		// Shuffle the garbled inputs
		await GarbledCircuitInstance.shuffle_garbled_inputs(
			indices_of_initial_input_tables,
			half_inputs,
		);

		// Verify content of deployed circuit
		for (var index of table_indices) {
			var gtt = await GarbledCircuitInstance.read_gtt.call(index);
			for (var j = 0; j < 4; j++) {
				assert.equal(gtt[j], web3.utils.bytesToHex(gttables[index][j]), "Incorrect entry content");
			}
		}
		for (var index of table_indices) {
			var parent_table_indices = await GarbledCircuitInstance.read_parent_table_indices.call(index);
			if(indices_of_dummy_tables.indexOf(index) >= 0) {
				assert.equal(parent_table_indices.length, 0, "Dummy table does not have parent table");
				continue;
			}
			if(indices_of_end_tables.indexOf(index) >= 0) {
				assert.equal(parent_table_indices.length, 0, "End table should not have parent table");
				continue;
			}
			for (var i = 0; i < ttables[index].parent_table_indices.length; i++) {
				assert.equal(ttables[index].parent_table_indices[i], parent_table_indices[i].toNumber(), "Incorrect parent table indices");
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

		// Generate other half of inputs according to inputs in /4_pos_redeploy_circuit_result_example.png
		bit_in_each_x_input = [0, 0, 0, 0, 1, 1, 1, 1];
		for (var i = 0; i < indices_of_initial_input_tables.length; i++) {
			var table_index = indices_of_initial_input_tables[i];
			var bit_index = bit_in_each_x_input[i];
			if(bit_index == 0) {
				other_half_inputs[i] = ttables[table_index].x_0;
				inputs_to_each_table[table_index].x = 0;
			} else {
				other_half_inputs[i] = ttables[table_index].x_1;
				inputs_to_each_table[table_index].x = 1;
			}
		}

		// Compute final entry sequence
		for (var table_index of execution_sequence) {
			var ttable = ttables[table_index];
			var entry_index = get_entry_index(inputs_to_each_table[table_index].x, inputs_to_each_table[table_index].y);
			var entry_result = ttable.fn_get_entry_result(entry_index);
			// Record entry result for end tables
			if(indices_of_end_tables.indexOf(table_index) >= 0) {
				entry_result_of_end_tables[table_index] = entry_result;
			}
			if(ttable.parent_table_indices === undefined) continue;
			// Fill in entry result for parent table if this is not an end table
			for (var parent_table_index of ttable.parent_table_indices) {
				if(ttable.input_x[parent_table_index] == undefined) throw 'No indication of x or y input';
				else if(ttable.input_x[parent_table_index] == 1) {
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
			execution_sequence,
			indices_of_end_tables,
		);
		// Verify that result is correct
		for (table_index of indices_of_end_tables) {
			var decryption_result = await GarbledCircuitInstance.read_decryption_result.call(table_index);
			assert.equal(decryption_result.toNumber(), expected_result[indices_of_end_tables.indexOf(table_index)], "Incorrect results");
		}
	});
});