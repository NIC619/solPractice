const GC_tree_based_ORAM = artifacts.require("GC_tree_based_ORAM");

function gen_key(num_bits) {
	var key = new Uint8Array(num_bits);
	for (var i = 0; i < num_bits; i++) {
		key[i] = Math.floor((Math.random() * 256));
	}
	return key;
}
gen_node = gen_key;

contract('GC_tree_based_ORAM', (accounts) => {
	it('should set correct owner', async () => {
		const GC_tree_based_ORAMInstance = await GC_tree_based_ORAM.deployed();
		const owner = await GC_tree_based_ORAMInstance.owner.call();

		assert.equal(owner, accounts[0], "Incorrect owner");
	});
	it('should successfully update nodes and leaf indices', async () => {
		const GC_tree_based_ORAMInstance = await GC_tree_based_ORAM.deployed();
		const tree_height = await GC_tree_based_ORAMInstance.TREE_HEIGHT.call();
		const num_nodes = 2**tree_height - 1;
		const num_buckets = await GC_tree_based_ORAMInstance.NUM_BUCKETS.call();
		const num_leaf_nodes = await GC_tree_based_ORAMInstance.NUM_LEAF_NODES.call();

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
		await GC_tree_based_ORAMInstance.update_nodes(node_indices, nodes_array);

		for (var i = 1; i <= num_nodes; i++) {
			var node = await GC_tree_based_ORAMInstance.read_node.call(i);
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
		const first_leaf_node_index = await GC_tree_based_ORAMInstance.FIRST_LEAF_NODE_INDEX.call();
		const last_leaf_node_index = await GC_tree_based_ORAMInstance.LAST_LEAF_NODE_INDEX.call();
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

		var leaf_node_indices_array = Object.keys(leaf_node_indices_of_data_nodes);;
		var leaf_node_indices = Object.values(leaf_node_indices_of_data_nodes);
		await GC_tree_based_ORAMInstance.update_leaf_node_indices(leaf_node_indices_array, leaf_node_indices);

		for (var index of leaf_node_indices_array) {
			var leaf_node_index = await GC_tree_based_ORAMInstance.read_leaf_node_index.call(index);
			assert.equal(leaf_node_index.toNumber(), leaf_node_indices_of_data_nodes[index], "Incorrect leaf node index");
		}
	});
});