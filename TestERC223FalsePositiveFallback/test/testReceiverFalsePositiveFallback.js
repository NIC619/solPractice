var FalsePositiveFallbackReceiver = artifacts.require("./FalsePositiveFallbackReceiver.sol");
var TokenContractDontCheckMagicNumber = artifacts.require("./TokenContractDontCheckMagicNumber.sol");

contract('testReceiverFalsePositiveFallback', function(accounts) {
  it("transfer should work because token contract does not check returned value", function() {
    transfer_amount = 1000;
    return TokenContractDontCheckMagicNumber.deployed().then(function(instance) {
      TokenContract = instance;
      return FalsePositiveFallbackReceiver.deployed();
    }).then(function(instance) {
      Receiver = instance;
      return TokenContract.getBalance.call(Receiver.address);
    }).then(function(prevReceiverBalance) {
      assert.equal(prevReceiverBalance.valueOf(), 0, "Reciever starts with 0 token");
      return TokenContract.transfer(Receiver.address, transfer_amount);
    }).then(function() {
      return TokenContract.getBalance.call(Receiver.address);
    }).then(function(curReceiverBalance) {
      assert.equal(curReceiverBalance.valueOf(), transfer_amount, "Reciever should receive " + transfer_amount + " token");
    });
  });
});
