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
		const num_bits = 2;
		const num_gttables = Math.pow(2, num_bits) - 1;
		// const num_gttables = 1;
		var ttables = new Array(num_gttables);
		var gttables = new Array(num_gttables);
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

		var bit_results = [ttables[0].z_0, ttables[0].z_1];
		await GarbledCircuitInstance.deploy(num_bits, gttables, bit_results);
		for (var i = 0; i < num_gttables; i++) {
			var gtt = await GarbledCircuitInstance.read_gtt.call(i);
			for (var j = 0; j < 4; j++) {
				assert.equal(gtt[j], web3.utils.bytesToHex(gttables[i][j]), "Mismatched entry content");
			}
		}
	});
});