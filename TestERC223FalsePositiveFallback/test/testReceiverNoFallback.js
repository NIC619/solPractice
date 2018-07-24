var NoFallbackReceiver = artifacts.require("./NoFallbackReceiver.sol");
var TokenContractDontCheckMagicNumber = artifacts.require("./TokenContractDontCheckMagicNumber.sol");

contract('testReceiverNoFallback', function(accounts) {
  it("transfer should fail because no fallback function in receiver contract", function() {
    transfer_amount = 1000;
    return TokenContractDontCheckMagicNumber.deployed().then(function(instance) {
      TokenContract = instance;
      return NoFallbackReceiver.deployed();
    }).then(function(instance) {
      Receiver = instance;
      return TokenContract.transfer(Receiver.address, transfer_amount);
    }).catch(function(exception) {
      return TokenContract.getBalance.call(Receiver.address);
    }).then(function(curReceiverBalance) {
      assert.equal(curReceiverBalance.valueOf(), 0, "Reciever should not receive any token");
    });
  });
});
