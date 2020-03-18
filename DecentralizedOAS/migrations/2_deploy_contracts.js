const SORAM = artifacts.require("SORAM");
const XOREncrypt = artifacts.require("XOREncrypt");

module.exports = function (deployer, network, accounts) {
	deployer.deploy(SORAM, 3);
	deployer.deploy(XOREncrypt);
};