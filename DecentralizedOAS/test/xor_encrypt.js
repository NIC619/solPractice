const XOREncrypt = artifacts.require("XOREncrypt");

contract('XOREncrypt', () => {
	it('should successfully encrypt', async () => {
		const XOREncryptInstance = await XOREncrypt.deployed();
		const plain_text = new Uint8Array(32);
		for (var i = 0; i < plain_text.length; i++) {
			plain_text[i] = Math.floor((Math.random() * 256));
		}
		var key = new Uint8Array(32);
		for (var i = 0; i < key.length; i++) {
			key[i] =  Math.floor((Math.random() * 256));
		}
		key[31] = 0;
		var cipher_text = await XOREncryptInstance.encrypt.call(key, plain_text);

		var cipher_text_bytes = cipher_text.toArray('big', 32);
		var decrypt_result = await XOREncryptInstance.encrypt.call(key, cipher_text_bytes);
		assert.equal(web3.utils.bytesToHex(decrypt_result.toArray('big', 32)), web3.utils.bytesToHex(plain_text), "Mismatched decryption and plain text");
	});
});