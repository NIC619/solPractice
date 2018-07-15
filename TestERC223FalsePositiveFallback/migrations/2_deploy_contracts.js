var NormalReceiver = artifacts.require("./NormalReceiver.sol");
var ErrorFallbackReceiver = artifacts.require("./ErrorFallbackReceiver.sol");
var FalsePositiveFallbackReceiver = artifacts.require("./FalsePositiveFallbackReceiver.sol");
var NoFallbackReceiver = artifacts.require("./NoFallbackReceiver.sol");
var TokenContractCheckMagicNumber = artifacts.require("./TokenContractCheckMagicNumber.sol");
var TokenContractDontCheckMagicNumber = artifacts.require("./TokenContractDontCheckMagicNumber.sol");

module.exports = function(deployer) {
  deployer.deploy(NormalReceiver);
  deployer.deploy(ErrorFallbackReceiver);
  deployer.deploy(FalsePositiveFallbackReceiver);
  deployer.deploy(NoFallbackReceiver);
  deployer.deploy(TokenContractCheckMagicNumber);
  deployer.deploy(TokenContractDontCheckMagicNumber);
};
