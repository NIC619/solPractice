const SORAM = artifacts.require("SORAM");
const XOREncrypt = artifacts.require("XOREncrypt");
const GarbledCircuit = artifacts.require("GarbledCircuit");
const GCTreeBasedORAM = artifacts.require("GCTreeBasedORAM");
const GCNoDecryptTreeBasedORAM = artifacts.require("GCNoDecryptTreeBasedORAM");

module.exports = function (deployer, network, accounts) {
	deployer.deploy(SORAM, 3);
	deployer.deploy(XOREncrypt);
	deployer.deploy(GarbledCircuit);
	deployer.deploy(GCTreeBasedORAM, 3);
	deployer.deploy(GCNoDecryptTreeBasedORAM, 3);
};