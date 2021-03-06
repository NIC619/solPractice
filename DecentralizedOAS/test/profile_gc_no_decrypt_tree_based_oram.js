const GCNoDecryptTreeBasedORAM = artifacts.require("GCNoDecryptTreeBasedORAM");

const utils = require('./utils');
gen_key = utils.gen_key;
gen_node = gen_key;
get_entry_index = utils.get_entry_index;
get_OR_entry_result = utils.get_OR_entry_result;
garbling_OR_entries = utils.garbling_OR_entries;
get_AND_entry_result = utils.get_AND_entry_result;
garbling_AND_entries = utils.garbling_AND_entries;
get_XOR_entry_result = utils.get_XOR_entry_result;
garbling_XOR_entries = utils.garbling_XOR_entries;
gen_update_label_table = utils.gen_update_label_table;
decrypt_update_label_entries = utils.decrypt_update_label_entries;

contract('GCNoDecryptTreeBasedORAM', (accounts) => {
	var GCNoDecryptTreeBasedORAMInstance;
	var num_inputs;
	var num_gttables;
	var table_indices;
	var indices_of_dummy_tables;
	var num_results;
	var table_type;
	var table_relation;
	var same_entry_tables;
	var indices_of_end_tables;
	var indices_of_initial_input_tables;
	var execution_sequence;

	var label_updates;
	var update_input_label_gttable;
	var ttables;
	var gttables;
	var bit_in_each_y_input;
	var half_inputs;
	var inputs_to_each_table;

	it('1st Write/Flush of 4 pos circuit', async () => {
		startTime =new Date().getTime();
		GCNoDecryptTreeBasedORAMInstance = await GCNoDecryptTreeBasedORAM.new(3);
		endTime = new Date().getTime();
		console.debug('Elapsed time:', (endTime - startTime), 'ms');
		redeploy_tx_receipt = await web3.eth.getTransactionReceipt(GCNoDecryptTreeBasedORAMInstance.transactionHash);
		console.log("\nGas used for deploy height 3 GC tree based ORAM:", redeploy_tx_receipt['gasUsed']);
		const tree_height = await GCNoDecryptTreeBasedORAMInstance.TREE_HEIGHT.call();
		const num_nodes = 2**tree_height - 1;
		const num_buckets = await GCNoDecryptTreeBasedORAMInstance.NUM_BUCKETS.call();
		const num_leaf_nodes = await GCNoDecryptTreeBasedORAMInstance.NUM_LEAF_NODES.call();

		// Update all nodes in the tree
		var nodes = new Object();
		for (var i = 1; i <= num_nodes; i++) {
			nodes[i] = new Array(num_buckets);
			for (var j = 0; j < num_buckets; j++) {
				nodes[i][j] = gen_node(32);
			}
		}
		var node_indices = Object.keys(nodes);
		var nodes_array = Object.values(nodes);
		startTime =new Date().getTime();
		// This tx updates 3 node to benchmark the time and gas usage of updating one branch of nodes
		tx = await GCNoDecryptTreeBasedORAMInstance.update_nodes(node_indices.slice(0, 3), nodes_array.slice(0, 3));
		endTime = new Date().getTime();
		console.log("\nGas used for 1st `Write/Flush` of a 4 pos circuit:", tx['receipt']['gasUsed']);
		console.debug('Elapsed time:', (endTime - startTime), 'ms');
		// This tx updates all the nodes
		tx = await GCNoDecryptTreeBasedORAMInstance.update_nodes(node_indices, nodes_array);

		for (var i = 1; i <= num_nodes; i++) {
			var node = await GCNoDecryptTreeBasedORAMInstance.read_node.call(i);
			for (var j = 0; j < num_buckets; j++) {
				assert.equal(node[j], web3.utils.bytesToHex(nodes[i][j]), "Incorrect node content");
			}
		}

		// Choose data nodes
		// Assume the number of data nodes is the same as `num_leaf_nodes`
		var data_node_indices = new Array(num_leaf_nodes);
		var index;
		for (var i = 0; i < num_leaf_nodes; i++) {
			index = Math.floor((Math.random() * num_nodes)) + 1;
			while(data_node_indices.indexOf(index) >= 0) {
				index = Math.floor((Math.random() * num_nodes)) + 1;
			}
			data_node_indices[i] = index;
		}
		// Choose leaf node for each data node
		const first_leaf_node_index = await GCNoDecryptTreeBasedORAMInstance.FIRST_LEAF_NODE_INDEX.call();
		const last_leaf_node_index = await GCNoDecryptTreeBasedORAMInstance.LAST_LEAF_NODE_INDEX.call();
		var leaf_node_indices_of_data_nodes = new Object();
		for(var data_node_index of data_node_indices) {
			var leaf_or_right;
			var cur_node_index = data_node_index;
			while(cur_node_index < first_leaf_node_index) {
				var leaf_or_right = Math.floor(Math.random() * 2);
				if(leaf_or_right == 0) {
					cur_node_index = cur_node_index * 2;
				} else {
					cur_node_index = cur_node_index * 2 + 1;
				}
			}
			leaf_node_indices_of_data_nodes[data_node_index] = cur_node_index;
		}

		// Read whole branch and check if data node is contained in the branch
		for(var data_node_index of data_node_indices) {
			var leaf_node_index = leaf_node_indices_of_data_nodes[data_node_index];
			var branch = await GCNoDecryptTreeBasedORAMInstance.read_branch.call(leaf_node_index);
			var found_match = false;
			for(node of branch) {
				for (var j = 0; j < num_buckets; j++) {
					if(node[j] != web3.utils.bytesToHex(nodes[data_node_index][j])) break;
					else {
						if(j == num_buckets - 1) found_match = true;
					}
				}
			}
			assert.equal(found_match, true, "Data not found in the branch");
		}
	});
	it('initial deploy of 4 pos circuits', async () => {
		// Layout of tables in /4_pos_circuit_simplified_example.png
		num_inputs = 6;
		num_gttables = 11;
		table_indices = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
		indices_of_dummy_tables = [];
		num_results = 2;
		table_type = new Object();
		table_type["XOR"] = [1, 2, 3, 4, 5, 6];
		table_type["OR"] = [7, 8, 9];
		table_type["AND"] = [10, 11];
		// Format of table relation entry: [child_table_index, parent_table_index, is_input_x_to_parent_table]
		// and for is_input_x_to_parent_table, 1 means yes, 0 means no
		table_relation = [
			[1, 7, 1],
			[2, 7, 0],
			[3, 8, 1],
			[4, 8, 0],
			[5, 9, 1],
			[6, 9, 0],
			[7, 10, 1],
			[7, 11, 1],
			[8, 10, 0],
			[9, 11, 0],
		];
		// entry in same_entry_tables represents two tables that share same input
		// Format of same_entry_tables entry: [table_1, is_input_x, table_2, is_input_x]
		// For example: [3, 1, 1, 0] means that input x of table 3 share the same input as input y of table 1
		same_entry_tables = [[11, 1, 10, 1]];
		indices_of_end_tables = [10, 11];
		indices_of_initial_input_tables = [1, 2, 3, 4, 5, 6];
		execution_sequence = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

		ttables = new Object();
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
		label_updates = new Array(num_inputs);
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
		gttables = new Object();
		for (var i of table_indices) {
			var ttable = ttables[i];
			gttable = ttable.fn_garbling(ttable.x_0, ttable.x_1, ttable.y_0, ttable.y_1, ttable.z_0, ttable.z_1);
			gttables[i] = gttable;
		}

		// Generate half of initial inputs according to inputs in /4_pos_circuit_result_simplified_example.png
		bit_in_each_y_input = [1, 1, 1, 0, 0, 1];
		half_inputs = new Array(num_inputs);
		inputs_to_each_table = new Object();
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
		startTime =new Date().getTime();
		tx = await GCNoDecryptTreeBasedORAMInstance.initial_deploy(
			num_inputs,
			table_relation,
			table_indices,
			gttables_array,
			table_output_hash_digests,
			indices_of_initial_input_tables,
			half_inputs,
			indices_of_end_tables,
			outputs,
			label_updates,
		);
		endTime = new Date().getTime();
		console.log("\nGas used for 1st `UpdateGC`(initial deploy) of a 4 pos circuit:", tx['receipt']['gasUsed']);
		console.debug('Elapsed time:', (endTime - startTime), 'ms');

		// Verify content of deployed circuit
		for (var index of table_indices) {
			var gtt = await GCNoDecryptTreeBasedORAMInstance.read_gtt.call(index);
			for (var j = 0; j < 4; j++) {
				assert.equal(gtt[j], web3.utils.bytesToHex(gttables[index][j]), "Incorrect entry content");
			}
		}
		for (var index of table_indices) {
			var parent_table_indices = await GCNoDecryptTreeBasedORAMInstance.read_parent_table_indices.call(index);
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
			var input = await GCNoDecryptTreeBasedORAMInstance.read_inputs_of_table.call(table_index);
			assert.equal(input[1], web3.utils.bytesToHex(half_inputs[i]), "Incorrect half of inputs");
		}
		for (var i = 0; i < indices_of_end_tables.length; i++) {
			var table_index = indices_of_end_tables[i];
			var results = await GCNoDecryptTreeBasedORAMInstance.read_outputs_of_table.call(table_index);
			assert.equal(results[0], web3.utils.bytesToHex(outputs[i][0]), "Incorrect bit results");
			assert.equal(results[1], web3.utils.bytesToHex(outputs[i][1]), "Incorrect bit results");
		}

		// Verify label updates
		update_input_label_gttable = new Object();
		var uploaded_label_updates = await GCNoDecryptTreeBasedORAMInstance.read_label_updates.call(indices_of_initial_input_tables);
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
	});
	it('2nd Write/Flush of 4 pos circuit', async () => {
		const tree_height = await GCNoDecryptTreeBasedORAMInstance.TREE_HEIGHT.call();
		const num_nodes = 2**tree_height - 1;
		const num_buckets = await GCNoDecryptTreeBasedORAMInstance.NUM_BUCKETS.call();
		const num_leaf_nodes = await GCNoDecryptTreeBasedORAMInstance.NUM_LEAF_NODES.call();

		// Update all nodes in the tree
		var nodes = new Object();
		for (var i = 1; i <= num_nodes; i++) {
			nodes[i] = new Array(num_buckets);
			for (var j = 0; j < num_buckets; j++) {
				nodes[i][j] = gen_node(32);
			}
		}
		var node_indices = Object.keys(nodes);
		var nodes_array = Object.values(nodes);
		startTime =new Date().getTime();
		// This tx updates 3 node to benchmark the time and gas usage of updating one branch of nodes
		tx = await GCNoDecryptTreeBasedORAMInstance.update_nodes(node_indices.slice(0, 3), nodes_array.slice(0, 3));
		endTime = new Date().getTime();
		console.log("\nGas used for 2nd `Write/Flush` of a 4 pos circuit:", tx['receipt']['gasUsed']);
		console.debug('Elapsed time:', (endTime - startTime), 'ms');
		// This tx updates all the nodes
		tx = await GCNoDecryptTreeBasedORAMInstance.update_nodes(node_indices, nodes_array);

		for (var i = 1; i <= num_nodes; i++) {
			var node = await GCNoDecryptTreeBasedORAMInstance.read_node.call(i);
			for (var j = 0; j < num_buckets; j++) {
				assert.equal(node[j], web3.utils.bytesToHex(nodes[i][j]), "Incorrect node content");
			}
		}

		// Choose data nodes
		// Assume the number of data nodes is the same as `num_leaf_nodes`
		var data_node_indices = new Array(num_leaf_nodes);
		var index;
		for (var i = 0; i < num_leaf_nodes; i++) {
			index = Math.floor((Math.random() * num_nodes)) + 1;
			while(data_node_indices.indexOf(index) >= 0) {
				index = Math.floor((Math.random() * num_nodes)) + 1;
			}
			data_node_indices[i] = index;
		}
		// Choose leaf node for each data node
		const first_leaf_node_index = await GCNoDecryptTreeBasedORAMInstance.FIRST_LEAF_NODE_INDEX.call();
		const last_leaf_node_index = await GCNoDecryptTreeBasedORAMInstance.LAST_LEAF_NODE_INDEX.call();
		var leaf_node_indices_of_data_nodes = new Object();
		for(var data_node_index of data_node_indices) {
			var leaf_or_right;
			var cur_node_index = data_node_index;
			while(cur_node_index < first_leaf_node_index) {
				var leaf_or_right = Math.floor(Math.random() * 2);
				if(leaf_or_right == 0) {
					cur_node_index = cur_node_index * 2;
				} else {
					cur_node_index = cur_node_index * 2 + 1;
				}
			}
			leaf_node_indices_of_data_nodes[data_node_index] = cur_node_index;
		}

		// Read whole branch and check if data node is contained in the branch
		for(var data_node_index of data_node_indices) {
			var leaf_node_index = leaf_node_indices_of_data_nodes[data_node_index];
			var branch = await GCNoDecryptTreeBasedORAMInstance.read_branch.call(leaf_node_index);
			var found_match = false;
			for(node of branch) {
				for (var j = 0; j < num_buckets; j++) {
					if(node[j] != web3.utils.bytesToHex(nodes[data_node_index][j])) break;
					else {
						if(j == num_buckets - 1) found_match = true;
					}
				}
			}
			assert.equal(found_match, true, "Data not found in the branch");
		}
	});
	it('UpdateGC of 4 pos circuits', async () => {
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
			ttables[index] = ttable;
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

		// Generate half of initial inputs according to inputs in /4_pos_redeploy_circuit_result_simplified_example.png
		bit_in_each_y_input = [0, 0, 1, 1, 0, 1];
		half_inputs = new Array(num_inputs);
		inputs_to_each_table = new Object();
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

		gttables_array = Object.values(gttables);
		var table_output_hash_digests = new Array();
		for (var index of table_indices) {
			var ttable = ttables[index];
			table_output_hash_digests.push(ttable.output_hash_digests);
		}

		// Deploy the circuit
		startTime =new Date().getTime();
		tx = await GCNoDecryptTreeBasedORAMInstance.redeploy(
			table_indices,
			gttables_array,
			table_output_hash_digests,
			indices_of_initial_input_tables,
			half_inputs,
			indices_of_end_tables,
			outputs,
			label_updates,
		);
		endTime = new Date().getTime();
		console.log("\nGas used for 2nd `UpdateGC` of a 4 pos circuit:", tx['receipt']['gasUsed']);
		console.debug('Elapsed time:', (endTime - startTime), 'ms');

		// Verify content of deployed circuit
		for (var index of table_indices) {
			var gtt = await GCNoDecryptTreeBasedORAMInstance.read_gtt.call(index);
			for (var j = 0; j < 4; j++) {
				assert.equal(gtt[j], web3.utils.bytesToHex(gttables[index][j]), "Incorrect entry content");
			}
		}
		for (var index of table_indices) {
			var parent_table_indices = await GCNoDecryptTreeBasedORAMInstance.read_parent_table_indices.call(index);
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
			var input = await GCNoDecryptTreeBasedORAMInstance.read_inputs_of_table.call(table_index);
			assert.equal(input[1], web3.utils.bytesToHex(half_inputs[i]), "Incorrect half of inputs");
		}
		for (var i = 0; i < indices_of_end_tables.length; i++) {
			var table_index = indices_of_end_tables[i];
			var results = await GCNoDecryptTreeBasedORAMInstance.read_outputs_of_table.call(table_index);
			assert.equal(results[0], web3.utils.bytesToHex(outputs[i][0]), "Incorrect bit results");
			assert.equal(results[1], web3.utils.bytesToHex(outputs[i][1]), "Incorrect bit results");
		}

		// Verify label updates
		var uploaded_label_updates = await GCNoDecryptTreeBasedORAMInstance.read_label_updates.call(indices_of_initial_input_tables);
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
	});

	it('1st Write/Flush of 8 pos circuit', async () => {
		startTime =new Date().getTime();
		GCNoDecryptTreeBasedORAMInstance = await GCNoDecryptTreeBasedORAM.new(4);
		endTime = new Date().getTime();
		console.debug('Elapsed time:', (endTime - startTime), 'ms');
		redeploy_tx_receipt = await web3.eth.getTransactionReceipt(GCNoDecryptTreeBasedORAMInstance.transactionHash);
		console.log("\nGas used for deploy height 4 GC tree based ORAM:", redeploy_tx_receipt['gasUsed']);
		const tree_height = await GCNoDecryptTreeBasedORAMInstance.TREE_HEIGHT.call();
		const num_nodes = 2**tree_height - 1;
		const num_buckets = await GCNoDecryptTreeBasedORAMInstance.NUM_BUCKETS.call();
		const num_leaf_nodes = await GCNoDecryptTreeBasedORAMInstance.NUM_LEAF_NODES.call();

		// Update all nodes in the tree
		var nodes = new Object();
		for (var i = 1; i <= num_nodes; i++) {
			nodes[i] = new Array(num_buckets);
			for (var j = 0; j < num_buckets; j++) {
				nodes[i][j] = gen_node(32);
			}
		}
		var node_indices = Object.keys(nodes);
		var nodes_array = Object.values(nodes);
		startTime =new Date().getTime();
		// This tx updates 4 node to benchmark the time and gas usage of updating one branch of nodes
		tx = await GCNoDecryptTreeBasedORAMInstance.update_nodes(node_indices.slice(0, 4), nodes_array.slice(0, 4));
		endTime = new Date().getTime();
		console.log("\nGas used for 1st `Write/Flush` of a 8 pos circuit:", tx['receipt']['gasUsed']);
		console.debug('Elapsed time:', (endTime - startTime), 'ms');
		// This tx updates all the nodes
		tx = await GCNoDecryptTreeBasedORAMInstance.update_nodes(node_indices, nodes_array);

		for (var i = 1; i <= num_nodes; i++) {
			var node = await GCNoDecryptTreeBasedORAMInstance.read_node.call(i);
			for (var j = 0; j < num_buckets; j++) {
				assert.equal(node[j], web3.utils.bytesToHex(nodes[i][j]), "Incorrect node content");
			}
		}

		// Choose data nodes
		// Assume the number of data nodes is the same as `num_leaf_nodes`
		var data_node_indices = new Array(num_leaf_nodes);
		var index;
		for (var i = 0; i < num_leaf_nodes; i++) {
			index = Math.floor((Math.random() * num_nodes)) + 1;
			while(data_node_indices.indexOf(index) >= 0) {
				index = Math.floor((Math.random() * num_nodes)) + 1;
			}
			data_node_indices[i] = index;
		}
		// Choose leaf node for each data node
		const first_leaf_node_index = await GCNoDecryptTreeBasedORAMInstance.FIRST_LEAF_NODE_INDEX.call();
		const last_leaf_node_index = await GCNoDecryptTreeBasedORAMInstance.LAST_LEAF_NODE_INDEX.call();
		var leaf_node_indices_of_data_nodes = new Object();
		for(var data_node_index of data_node_indices) {
			var leaf_or_right;
			var cur_node_index = data_node_index;
			while(cur_node_index < first_leaf_node_index) {
				var leaf_or_right = Math.floor(Math.random() * 2);
				if(leaf_or_right == 0) {
					cur_node_index = cur_node_index * 2;
				} else {
					cur_node_index = cur_node_index * 2 + 1;
				}
			}
			leaf_node_indices_of_data_nodes[data_node_index] = cur_node_index;
		}

		// Read whole branch and check if data node is contained in the branch
		for(var data_node_index of data_node_indices) {
			var leaf_node_index = leaf_node_indices_of_data_nodes[data_node_index];
			var branch = await GCNoDecryptTreeBasedORAMInstance.read_branch.call(leaf_node_index);
			var found_match = false;
			for(node of branch) {
				for (var j = 0; j < num_buckets; j++) {
					if(node[j] != web3.utils.bytesToHex(nodes[data_node_index][j])) break;
					else {
						if(j == num_buckets - 1) found_match = true;
					}
				}
			}
			assert.equal(found_match, true, "Data not found in the branch");
		}
	});
	it('initial deploy of 8 pos circuits', async () => {
		// Layout of tables in /8_pos_circuit_simplified_example.png
		num_inputs = 21;
		num_gttables = 44;
		table_indices = [...Array(44).keys()].map(x => ++x);
		indices_of_dummy_tables = [];
		num_results = 3;
		table_type = new Object();
		table_type["XOR"] = [...Array(21).keys()].map(x => ++x);
		table_type["OR"] = [...Array(14).keys()].map(x => x+22);
		table_type["AND"] = [...Array(9).keys()].map(x => x+36);
		// Format of table relation entry: [child_table_index, parent_table_index, is_input_x_to_parent_table]
		// and for is_input_x_to_parent_table, 1 means yes, 0 means no
		table_relation = [
			[1, 22, 1],
			[2, 22, 0],
			[3, 29, 0],
			[4, 23, 1],
			[5, 23, 0],
			[6, 30, 0],
			[7, 24, 1],
			[8, 24, 0],
			[9, 31, 0],
			[10, 25, 1],
			[11, 25, 0],
			[12, 32, 0],
			[13, 26, 1],
			[14, 26, 0],
			[15, 33, 0],
			[16, 27, 1],
			[17, 27, 0],
			[18, 34, 0],
			[19, 28, 1],
			[20, 28, 0],
			[21, 35, 0],
			[22, 29, 1],
			[23, 30, 1],
			[24, 31, 1],
			[25, 32, 1],
			[26, 33, 1],
			[27, 34, 1],
			[28, 35, 1],
			[29, 36, 1],
			[29, 38, 1],
			[29, 40, 1],
			[30, 36, 0],
			[30, 38, 0],
			[31, 37, 1],
			[31, 40, 0],
			[32, 37, 0],
			[33, 39, 1],
			[33, 41, 1],
			[34, 39, 0],
			[35, 41, 0],
			[36, 42, 1],
			[37, 42, 0],
			[38, 43, 1],
			[39, 43, 0],
			[40, 44, 1],
			[41, 44, 0],
		];
		// entry in same_entry_tables represents two tables that share same input
		// Format of same_entry_tables entry: [table_1, is_input_x, table_2, is_input_x]
		// For example: [3, 1, 1, 0] means that input x of table 3 share the same input as input y of table 1
		same_entry_tables = [
			[38, 1, 36, 1],
			[40, 1, 36, 1],
			[38, 0, 36, 0],
			[40, 0, 37, 1],
			[41, 1, 39, 1],
		];
		indices_of_end_tables = [42, 43, 44];
		indices_of_initial_input_tables = [...Array(21).keys()].map(x => ++x);
		execution_sequence = [...Array(44).keys()].map(x => ++x);

		ttables = new Object();
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
		label_updates = new Array(num_inputs);
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
		gttables = new Object();
		for (var i of table_indices) {
			var ttable = ttables[i];
			gttable = ttable.fn_garbling(ttable.x_0, ttable.x_1, ttable.y_0, ttable.y_1, ttable.z_0, ttable.z_1);
			gttables[i] = gttable;
		}

		// Generate half of initial inputs according to inputs in /8_pos_circuit_result_example.png
		bit_in_each_y_input = [0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 0, 1, 0, 0, 0, 1, 1, 0, 0, 1, 0];
		if(bit_in_each_y_input.length != 21) throw 'Wrong y inputs';
		half_inputs = new Array(num_inputs);
		inputs_to_each_table = new Object();
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
		startTime =new Date().getTime();
		tx = await GCNoDecryptTreeBasedORAMInstance.initial_deploy(
			num_inputs,
			table_relation,
			table_indices,
			gttables_array,
			table_output_hash_digests,
			indices_of_initial_input_tables,
			half_inputs,
			indices_of_end_tables,
			outputs,
			label_updates,
			{ gas: 15000000 },
		);
		endTime = new Date().getTime();
		console.log("\nGas used for 1st `UpdateGC`(initial deploy) of a 4 pos circuit:", tx['receipt']['gasUsed']);
		console.debug('Elapsed time:', (endTime - startTime), 'ms');

		// Verify content of deployed circuit
		for (var index of table_indices) {
			var gtt = await GCNoDecryptTreeBasedORAMInstance.read_gtt.call(index);
			for (var j = 0; j < 4; j++) {
				assert.equal(gtt[j], web3.utils.bytesToHex(gttables[index][j]), "Incorrect entry content");
			}
		}
		for (var index of table_indices) {
			var parent_table_indices = await GCNoDecryptTreeBasedORAMInstance.read_parent_table_indices.call(index);
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
			var input = await GCNoDecryptTreeBasedORAMInstance.read_inputs_of_table.call(table_index);
			assert.equal(input[1], web3.utils.bytesToHex(half_inputs[i]), "Incorrect half of inputs");
		}
		for (var i = 0; i < indices_of_end_tables.length; i++) {
			var table_index = indices_of_end_tables[i];
			var results = await GCNoDecryptTreeBasedORAMInstance.read_outputs_of_table.call(table_index);
			assert.equal(results[0], web3.utils.bytesToHex(outputs[i][0]), "Incorrect bit results");
			assert.equal(results[1], web3.utils.bytesToHex(outputs[i][1]), "Incorrect bit results");
		}

		// Verify label updates
		update_input_label_gttable = new Object();
		var uploaded_label_updates = await GCNoDecryptTreeBasedORAMInstance.read_label_updates.call(indices_of_initial_input_tables);
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
	});
	it('2nd Write/Flush of 8 pos circuit', async () => {
		const tree_height = await GCNoDecryptTreeBasedORAMInstance.TREE_HEIGHT.call();
		const num_nodes = 2**tree_height - 1;
		const num_buckets = await GCNoDecryptTreeBasedORAMInstance.NUM_BUCKETS.call();
		const num_leaf_nodes = await GCNoDecryptTreeBasedORAMInstance.NUM_LEAF_NODES.call();

		// Update all nodes in the tree
		var nodes = new Object();
		for (var i = 1; i <= num_nodes; i++) {
			nodes[i] = new Array(num_buckets);
			for (var j = 0; j < num_buckets; j++) {
				nodes[i][j] = gen_node(32);
			}
		}
		var node_indices = Object.keys(nodes);
		var nodes_array = Object.values(nodes);
		startTime =new Date().getTime();
		// This tx updates 4 node to benchmark the time and gas usage of updating one branch of nodes
		tx = await GCNoDecryptTreeBasedORAMInstance.update_nodes(node_indices.slice(0, 4), nodes_array.slice(0, 4));
		endTime = new Date().getTime();
		console.log("\nGas used for 2nd `Write/Flush` of a 8 pos circuit:", tx['receipt']['gasUsed']);
		console.debug('Elapsed time:', (endTime - startTime), 'ms');
		// This tx updates all the nodes
		tx = await GCNoDecryptTreeBasedORAMInstance.update_nodes(node_indices, nodes_array);

		for (var i = 1; i <= num_nodes; i++) {
			var node = await GCNoDecryptTreeBasedORAMInstance.read_node.call(i);
			for (var j = 0; j < num_buckets; j++) {
				assert.equal(node[j], web3.utils.bytesToHex(nodes[i][j]), "Incorrect node content");
			}
		}

		// Choose data nodes
		// Assume the number of data nodes is the same as `num_leaf_nodes`
		var data_node_indices = new Array(num_leaf_nodes);
		var index;
		for (var i = 0; i < num_leaf_nodes; i++) {
			index = Math.floor((Math.random() * num_nodes)) + 1;
			while(data_node_indices.indexOf(index) >= 0) {
				index = Math.floor((Math.random() * num_nodes)) + 1;
			}
			data_node_indices[i] = index;
		}
		// Choose leaf node for each data node
		const first_leaf_node_index = await GCNoDecryptTreeBasedORAMInstance.FIRST_LEAF_NODE_INDEX.call();
		const last_leaf_node_index = await GCNoDecryptTreeBasedORAMInstance.LAST_LEAF_NODE_INDEX.call();
		var leaf_node_indices_of_data_nodes = new Object();
		for(var data_node_index of data_node_indices) {
			var leaf_or_right;
			var cur_node_index = data_node_index;
			while(cur_node_index < first_leaf_node_index) {
				var leaf_or_right = Math.floor(Math.random() * 2);
				if(leaf_or_right == 0) {
					cur_node_index = cur_node_index * 2;
				} else {
					cur_node_index = cur_node_index * 2 + 1;
				}
			}
			leaf_node_indices_of_data_nodes[data_node_index] = cur_node_index;
		}

		// Read whole branch and check if data node is contained in the branch
		for(var data_node_index of data_node_indices) {
			var leaf_node_index = leaf_node_indices_of_data_nodes[data_node_index];
			var branch = await GCNoDecryptTreeBasedORAMInstance.read_branch.call(leaf_node_index);
			var found_match = false;
			for(node of branch) {
				for (var j = 0; j < num_buckets; j++) {
					if(node[j] != web3.utils.bytesToHex(nodes[data_node_index][j])) break;
					else {
						if(j == num_buckets - 1) found_match = true;
					}
				}
			}
			assert.equal(found_match, true, "Data not found in the branch");
		}
	});
	it('UpdateGC of 8 pos circuits', async () => {
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
			ttables[index] = ttable;
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

		// Garbled circuit results
		var outputs = new Array(num_results);
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
		startTime =new Date().getTime();
		tx = await GCNoDecryptTreeBasedORAMInstance.redeploy(
			table_indices,
			gttables_array,
			table_output_hash_digests,
			indices_of_initial_input_tables,
			half_inputs,
			indices_of_end_tables,
			outputs,
			label_updates,
		);
		endTime = new Date().getTime();
		console.log("\nGas used for 2nd `UpdateGC` of a 8 pos circuit:", tx['receipt']['gasUsed']);
		console.debug('Elapsed time:', (endTime - startTime), 'ms');

		// Verify content of deployed circuit
		for (var index of table_indices) {
			var gtt = await GCNoDecryptTreeBasedORAMInstance.read_gtt.call(index);
			for (var j = 0; j < 4; j++) {
				assert.equal(gtt[j], web3.utils.bytesToHex(gttables[index][j]), "Incorrect entry content");
			}
		}
		for (var index of table_indices) {
			var parent_table_indices = await GCNoDecryptTreeBasedORAMInstance.read_parent_table_indices.call(index);
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
			var input = await GCNoDecryptTreeBasedORAMInstance.read_inputs_of_table.call(table_index);
			assert.equal(input[1], web3.utils.bytesToHex(half_inputs[i]), "Incorrect half of inputs");
		}
		for (var i = 0; i < indices_of_end_tables.length; i++) {
			var table_index = indices_of_end_tables[i];
			var results = await GCNoDecryptTreeBasedORAMInstance.read_outputs_of_table.call(table_index);
			assert.equal(results[0], web3.utils.bytesToHex(outputs[i][0]), "Incorrect bit results");
			assert.equal(results[1], web3.utils.bytesToHex(outputs[i][1]), "Incorrect bit results");
		}

		// Verify label updates
		var uploaded_label_updates = await GCNoDecryptTreeBasedORAMInstance.read_label_updates.call(indices_of_initial_input_tables);
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
	});
});