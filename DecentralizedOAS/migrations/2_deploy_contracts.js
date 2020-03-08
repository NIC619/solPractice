const SORAM = artifacts.require("SORAM");

module.exports = function (deployer, network, accounts) {
	deployer.deploy(SORAM, 3);
};