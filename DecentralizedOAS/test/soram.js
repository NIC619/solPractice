const SORAM = artifacts.require("SORAM");

contract('SORAM', (accounts) => {
	it('should set correct owner and max layer in SORAM', async () => {
		const SORAMInstance = await SORAM.deployed();
		const owner = await SORAMInstance.owner.call();
		const max_layer = await SORAMInstance.max_layer.call();

		assert.equal(owner, accounts[0], "Incorrect owner");
		assert.equal(max_layer.valueOf(), 3, "Incorrect max layer");
	});
	it('should fail to write to layer 0', async () => {
		const SORAMInstance = await SORAM.deployed();
		const graffity = new Uint8Array(32);
		graffity[0] = 33;
		await SORAMInstance.write(0, graffity, []).catch(function (error) {
			console.error(error);
		});
	});
	it('should successfully write to first layer', async () => {
		const SORAMInstance = await SORAM.deployed();
		const index_block_graffity = new Uint8Array(32);
		index_block_graffity[0] = 33;
		var data_blocks_graffity = new Array(4);
		for (var i = 0; i < data_blocks_graffity.length; i++) {
			var tmp = new Uint8Array(32);
			for (var j = 0; j < 32; j++) {
				tmp[j] = j + i;
			}
			data_blocks_graffity[i] = tmp;
		}
		await SORAMInstance.write(1, index_block_graffity, data_blocks_graffity);
	});
	it('should successfully read index block', async () => {
		const SORAMInstance = await SORAM.deployed();
		const index_block_graffity = new Uint8Array(32);
		index_block_graffity[0] = 33;
		var data_blocks_graffity = new Array(4);
		for (var i = 0; i < data_blocks_graffity.length; i++) {
			var tmp = new Uint8Array(32);
			for (var j = 0; j < 32; j++) {
				tmp[j] = j + i;
			}
			data_blocks_graffity[i] = tmp;
		}
		await SORAMInstance.write(1, index_block_graffity, data_blocks_graffity);
		var index_block = await SORAMInstance.read_index_block.call(1);
		assert.equal(index_block, web3.utils.bytesToHex(index_block_graffity), "Mismatched index block");
	});
	it('should successfully read data blocks by layer', async () => {
		const SORAMInstance = await SORAM.deployed();
		const index_block_graffity = new Uint8Array(32);
		index_block_graffity[0] = 33;
		var data_blocks_graffity = new Array(4);
		for (var i = 0; i < data_blocks_graffity.length; i++) {
			var tmp = new Uint8Array(32);
			for (var j = 0; j < 32; j++) {
				tmp[j] = j + i;
			}
			data_blocks_graffity[i] = tmp;
		}
		await SORAMInstance.write(1, index_block_graffity, data_blocks_graffity);
		var data_blocks = await SORAMInstance.read_data_blocks_by.call(1);
		for (var i = 0; i < data_blocks_graffity.length; i++) {
			assert.equal(data_blocks[i], web3.utils.bytesToHex(data_blocks_graffity[i]), "Mismatched index block");
		}
	});
	it('should successfully read data block at (layer, index)', async () => {
		const SORAMInstance = await SORAM.deployed();
		const index_block_graffity = new Uint8Array(32);
		index_block_graffity[0] = 33;
		var data_blocks_graffity = new Array(4);
		for (var i = 0; i < data_blocks_graffity.length; i++) {
			var tmp = new Uint8Array(32);
			for (var j = 0; j < 32; j++) {
				tmp[j] = j + i;
			}
			data_blocks_graffity[i] = tmp;
		}
		await SORAMInstance.write(1, index_block_graffity, data_blocks_graffity);
		for (var index = 0; index < 4; index++) {
			var data_block = await SORAMInstance.read_data_block_at.call(1, index);
			assert.equal(data_block, web3.utils.bytesToHex(data_blocks_graffity[index]), "Mismatched index block");
		}
	});
	it('should successfully write again', async () => {
		const SORAMInstance = await SORAM.deployed();
		const index_block_graffity = new Uint8Array(32);
		index_block_graffity[0] = 33;
		var data_blocks_graffity = new Array(4);
		// First write
		for (var i = 0; i < data_blocks_graffity.length; i++) {
			var tmp = new Uint8Array(32);
			for (var j = 0; j < 32; j++) {
				tmp[j] = j + i;
			}
			data_blocks_graffity[i] = tmp;
		}
		await SORAMInstance.write(1, index_block_graffity, data_blocks_graffity);
		var index = 0;
		var data_block = await SORAMInstance.read_data_block_at.call(1, index);
		assert.equal(data_block, web3.utils.bytesToHex(data_blocks_graffity[index]), "Mismatched index block");

		// Second write
		for (var i = 0; i < data_blocks_graffity.length; i++) {
			var tmp = new Uint8Array(32);
			for (var j = 0; j < 32; j++) {
				tmp[j] = j + i + 3;
			}
			data_blocks_graffity[i] = tmp;
		}
		await SORAMInstance.write(1, index_block_graffity, data_blocks_graffity);
		data_block = await SORAMInstance.read_data_block_at.call(1, index);
		assert.equal(data_block, web3.utils.bytesToHex(data_blocks_graffity[index]), "Mismatched index block");
	});
});