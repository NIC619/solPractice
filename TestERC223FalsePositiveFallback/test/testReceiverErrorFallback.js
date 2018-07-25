var ErrorFallbackReceiver = artifacts.require("./ErrorFallbackReceiver.sol");
var TokenContractDontCheckMagicNumber = artifacts.require("./TokenContractDontCheckMagicNumber.sol");

contract('testReceiverErrorFallback', function(accounts) {
  it("transfer should fail because fallback function throws in receiver contract", function() {
    transfer_amount = 1000;
    return TokenContractDontCheckMagicNumber.deployed().then(function(instance) {
      TokenContract = instance;
      return ErrorFallbackReceiver.deployed();
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
