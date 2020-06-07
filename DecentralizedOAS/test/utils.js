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

function get_OR_entry_result(entry) {
	if(entry == 0) return 0;
	else return 1;
}

function garbling_OR_entries(x_0, x_1, y_0, y_1, z_0, z_1) {
	return [xor(xor(x_0, y_0), z_0), xor(xor(x_0, y_1), z_1), xor(xor(x_1, y_0), z_1), xor(xor(x_1, y_1), z_1)];
}

function get_AND_entry_result(entry) {
	if(entry == 3) return 1;
	else return 0;
}

function garbling_AND_entries(x_0, x_1, y_0, y_1, z_0, z_1) {
	return [xor(xor(x_0, y_0), z_0), xor(xor(x_0, y_1), z_0), xor(xor(x_1, y_0), z_0), xor(xor(x_1, y_1), z_1)];
}

function get_XOR_entry_result(entry) {
	if(entry == 0 || entry == 3) return 0;
	else return 1;
}

function garbling_XOR_entries(x_0, x_1, y_0, y_1, z_0, z_1) {
	return [xor(xor(x_0, y_0), z_0), xor(xor(x_0, y_1), z_1), xor(xor(x_1, y_0), z_1), xor(xor(x_1, y_1), z_0)];
}

function get_NAND_entry_result(entry) {
	if(entry == 3) return 0;
	else return 1;
}

function garbling_NAND_entries(x_0, x_1, y_0, y_1, z_0, z_1) {
	return [xor(xor(x_0, y_0), z_1), xor(xor(x_0, y_1), z_1), xor(xor(x_1, y_0), z_1), xor(xor(x_1, y_1), z_0)];
}

function gen_update_label_table(old_0, old_1, new_0, new_1) {
	return [
		xor(old_0, new_0),
		xor(old_1, new_1),
		web3.utils.keccak256(web3.utils.bytesToHex(new_0)),
		web3.utils.keccak256(web3.utils.bytesToHex(new_1)),
	];
}

function decrypt_update_label_entries(entry_0, entry_1, input, hash_digest_0, hash_digest_1) {
	var result = xor(input, entry_0);
	var result_hash_digest = web3.utils.keccak256(web3.utils.bytesToHex((result)));
	if((result_hash_digest == hash_digest_0) || (result_hash_digest == hash_digest_1)) {
		return result
	}
	result = xor(input, entry_1);
	result_hash_digest = web3.utils.keccak256(web3.utils.bytesToHex((result)));
	if((result_hash_digest == hash_digest_0) || (result_hash_digest == hash_digest_1)) {
		return result
	} else {
		throw 'Decrypt update lable entries failed: hash digest of result does not match';
	}
}

module.exports = {
    gen_key: gen_key,
    xor: xor,
    get_entry_index: get_entry_index,
    get_OR_entry_result: get_OR_entry_result,
    garbling_OR_entries: garbling_OR_entries,
    get_AND_entry_result: get_AND_entry_result,
    garbling_AND_entries: garbling_AND_entries,
    get_XOR_entry_result: get_XOR_entry_result,
    garbling_XOR_entries: garbling_XOR_entries,
    get_NAND_entry_result: get_NAND_entry_result,
    garbling_NAND_entries: garbling_NAND_entries,
    gen_update_label_table: gen_update_label_table,
    decrypt_update_label_entries: decrypt_update_label_entries,
}