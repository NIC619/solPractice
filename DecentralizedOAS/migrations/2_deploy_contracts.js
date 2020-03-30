const SORAM = artifacts.require("SORAM");
const XOREncrypt = artifacts.require("XOREncrypt");
const GarbledCircuit = artifacts.require("GarbledCircuit");

module.exports = function (deployer, network, accounts) {
	deployer.deploy(SORAM, 3);
	deployer.deploy(XOREncrypt);
	deployer.deploy(GarbledCircuit);
};