const GarbledCircuit = artifacts.require("GarbledCircuit");

function gen_key(num_bits) {
	var key = new Uint8Array(num_bits);
	for (var i = 0; i < num_bits; i++) {
		key[i] = Math.floor((Math.random() * 256));
	}
	return key;
}

// Assume index of gate starts with 0
//    g_0
//   /   \
// g_1   g_2
//    etc.
function get_parent_gate_index(index) {
	if(index == 0) throw 'Try to get parent gate of gate 0';
	else {
		return Math.floor((index - 1) / 2)
	}
}

function xor(a, b) {
	if(a.length != b.length) throw 'XORing array with different length';
	var c = new Uint8Array(a.length);
	for (var i = 0; i < a.length; i++) {
		c[i] = a[i] ^ b[i];
	}
	return c;
}

function garbled_NAND_result(x_0, x_1, y_0, y_1, z_0, z_1) {
	return [xor(xor(x_0, y_0), z_1), xor(xor(x_0, y_1), z_1), xor(xor(x_1, y_0), z_1), xor(xor(x_1, y_1), z_0)];
}

contract('GarbledCircuit', () => {
	it('should successfully deploy 2 bit circuit', async () => {
		const GarbledCircuitInstance = await GarbledCircuit.deployed();

		// Layout of tables, i.e. gates
		//        t_0
		//      /     \
		//    t_1     t_2
		//   /  \     /  \
		// t_3  t_4  t_5  t_6
		const num_input_bits = 2;
		const num_gttables = Math.pow(2, num_input_bits) - 1;
		var ttables = new Array(num_gttables);
		var gttables = new Array(num_gttables);
		// Generate truth tables and garbled truth tables 
		for (var i = 0; i < num_gttables; i++) {
			var ttable = new Object();
			var gttable = new Array(4);
			var gttable;
			ttable.x_0 = gen_key(32);
			ttable.x_1 = gen_key(32);
			ttable.y_0 = gen_key(32);
			ttable.y_1 = gen_key(32);
			if(i == 0) {
				ttable.z_0 = gen_key(32);
				ttable.z_1 = gen_key(32);
			} else {
				parent_gate = ttables[get_parent_gate_index(i)];
				if(i % 2 == 1) {
					ttable.z_0 = parent_gate.x_0;
					ttable.z_1 = parent_gate.x_1;
				} else {
					ttable.z_0 = parent_gate.y_0;
					ttable.z_1 = parent_gate.y_1;
				}
			}
			ttables[i] = ttable;
			gttable = garbled_NAND_result(ttable.x_0, ttable.x_1, ttable.y_0, ttable.y_1, ttable.z_0, ttable.z_1);
			gttables[i] = gttable;
		}

		// Sample half of inputs
		// inputs are for gates in the bottom layer
		var start_index = num_input_bits - 1;
		var half_inputs = new Array(num_input_bits);
		for (var i = 0; i < num_input_bits; i++) {
			var bit_index = Math.floor((Math.random() * 2));
			if(bit_index == 0) {
				half_inputs[i] = ttables[start_index + i].y_0;
			} else {
				half_inputs[i] = ttables[start_index + i].y_1;
			}
		}

		// Garbled circuit results
		var bit_results = [ttables[0].z_0, ttables[0].z_1];

		// Deploy the circuit
		await GarbledCircuitInstance.deploy(num_input_bits, half_inputs, gttables, bit_results);

		// Verify content of deployed circuit
		for (var i = 0; i < num_input_bits; i++) {
			var input = await GarbledCircuitInstance.read_inputs_of_gate.call(start_index + i);
			assert.equal(input[1], web3.utils.bytesToHex(half_inputs[i]), "Incorrect half of inputs");
		}
		for (var i = 0; i < num_gttables; i++) {
			var gtt = await GarbledCircuitInstance.read_gtt.call(i);
			for (var j = 0; j < 4; j++) {
				assert.equal(gtt[j], web3.utils.bytesToHex(gttables[i][j]), "Incorrect entry content");
			}
		}
		var results = await GarbledCircuitInstance.read_bit_results.call(0);
		assert.equal(results[0], web3.utils.bytesToHex(bit_results[0]), "Incorrect bit results");
		assert.equal(results[1], web3.utils.bytesToHex(bit_results[1]), "Incorrect bit results");
	});
});