var NormalReceiver = artifacts.require("./NormalReceiver.sol");
var FalsePositiveFallbackReceiver = artifacts.require("./FalsePositiveFallbackReceiver.sol");
var TokenContractCheckMagicNumber = artifacts.require("./TokenContractCheckMagicNumber.sol");

contract('testERC223TransferCheckReturnedValue', function(accounts) {
  it("transfer should work", function() {
    transfer_amount = 1000;
    return TokenContractCheckMagicNumber.deployed().then(function(instance) {
      TokenContract = instance;
      return NormalReceiver.deployed();
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
  it("transfer should not work because token contract will check returned value", function() {
    transfer_amount = 1000;
    return TokenContractCheckMagicNumber.deployed().then(function(instance) {
      TokenContract = instance;
      return FalsePositiveFallbackReceiver.deployed();
    }).then(function(instance) {
      Receiver = instance;
      return TokenContract.getBalance.call(Receiver.address);
    }).then(function(prevReceiverBalance) {
      assert.equal(prevReceiverBalance.valueOf(), 0, "Reciever starts with 0 token");
      return TokenContract.transfer(Receiver.address, transfer_amount);
    }).catch(function() {
      return TokenContract.getBalance.call(Receiver.address);
    }).then(function(curReceiverBalance) {
      assert.equal(curReceiverBalance.valueOf(), 0, "Reciever should not receive any token");
    });
  });
});
