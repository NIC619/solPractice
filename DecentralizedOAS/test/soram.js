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
    await SORAMInstance.write.call(0, graffity, []).catch(function(error) {
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
    console.log(data_blocks_graffity);
    await SORAMInstance.write.call(1, index_block_graffity, data_blocks_graffity)
  });
});
