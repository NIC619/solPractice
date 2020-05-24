const SORAM = artifacts.require("SORAM");
const XOREncrypt = artifacts.require("XOREncrypt");
const GarbledCircuit = artifacts.require("GarbledCircuit");
const GC_tree_based_ORAM = artifacts.require("GC_tree_based_ORAM");

module.exports = function (deployer, network, accounts) {
	deployer.deploy(SORAM, 3);
	deployer.deploy(XOREncrypt);
	deployer.deploy(GarbledCircuit);
	deployer.deploy(GC_tree_based_ORAM, 3);
};