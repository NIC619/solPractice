// Set up
var fs = require('fs');
var deployDrugSupplyChainRecord = require("../functions/deployDrugSupplyChainRecord.js");
var funcDrugSupplyChainRecord = require("../functions/funcDrugSupplyChainRecord.js");
var Web3 = require('web3');
var web3 = new Web3();
if(!web3.currentProvider)
	web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));

// Get contract abi & bytecode
var abiDrugSupplyChainRecord = JSON.parse( fs.readFileSync('../compile/DrugSupplyChainRecord.abi', 'utf-8') );
var bytecodeDrugSupplyChainRecord = fs.readFileSync('../compile/DrugSupplyChainRecord.bytecode', 'utf-8');

// Contract constructor arguments

console.log("I still have " + web3.fromWei( web3.eth.getBalance(web3.eth.accounts[0]), "ether" ) + " ether");

var authority = web3.eth.accounts[0];
var participants = [web3.eth.accounts[1], web3.eth.accounts[2], web3.eth.accounts[3]];
var contractDrugSupplyChainRecord;

deployDrugSupplyChainRecord.deploy(web3, abiDrugSupplyChainRecord, bytecodeDrugSupplyChainRecord, authority).then(function(instance){
	contractDrugSupplyChainRecord = instance;

	console.log("Add participant 1:", participants[0]);
	return funcDrugSupplyChainRecord.addNewParticipant(contractDrugSupplyChainRecord, participants[0])
}).then(function(){
	console.log("Add participant 2:", participants[1]);
	return funcDrugSupplyChainRecord.addNewParticipant(contractDrugSupplyChainRecord, participants[1])
}).then(function(){
	console.log("Add participant 3:", participants[2]);
	return funcDrugSupplyChainRecord.addNewParticipant(contractDrugSupplyChainRecord, participants[2])
}).then(function(){
	console.log("Add new drug by participant 1");
	return funcDrugSupplyChainRecord.addNewDrug(contractDrugSupplyChainRecord, participants[0], "Drug_A", "2017/12/15", "2022/12/15", 500);
}).then(function(){
	return funcDrugSupplyChainRecord.getDrugOwner(contractDrugSupplyChainRecord, authority, "Drug_A");
}).then(function(owner){
	console.log("Owner of drug name 'Drug_A':", owner);
	console.log("Try adding same drug by participant 2");
	return funcDrugSupplyChainRecord.addNewDrug(contractDrugSupplyChainRecord, participants[1], "Drug_A", "2017/07/10", "2022/06/30", 300);
}).catch(function(exception){
	console.log("Failed");
	console.log("Add new drug by participant 2");
	return funcDrugSupplyChainRecord.addNewDrug(contractDrugSupplyChainRecord, participants[1], "Drug_B", "2017/07/10", "2022/06/30", 300);
}).then(function(){
	console.log("Add new drug by participant 3");
	return funcDrugSupplyChainRecord.addNewDrug(contractDrugSupplyChainRecord, participants[2], "Drug_C", "2017/10/01", "2019/10/31", 1000);
}).then(function(){
	console.log("Participant 2 try adding drug stream B -> B, 300 unit")
	return funcDrugSupplyChainRecord.addDrugStream(contractDrugSupplyChainRecord, participants[1], "Drug_B", "Drug_B", 300);
}).catch(function(exception){
	console.log("Failed");
	console.log("Participant 3 try adding drug stream A -> B, 300 unit")
	return funcDrugSupplyChainRecord.addDrugStream(contractDrugSupplyChainRecord, participants[2], "Drug_A", "Drug_B", 300);
}).catch(function(exception){
	console.log("Failed");
	console.log("Participant 1 add drug stream A -> B, 300 unit")
	return funcDrugSupplyChainRecord.addDrugStream(contractDrugSupplyChainRecord, participants[0], "Drug_A", "Drug_B", 300);
}).then(function(){
	console.log("Participant 2 add drug stream A -> B, 300 unit")
	return funcDrugSupplyChainRecord.addDrugStream(contractDrugSupplyChainRecord, participants[1], "Drug_A", "Drug_B", 300);
}).then(function(){
	return funcDrugSupplyChainRecord.getUpstreamDrugInfo(contractDrugSupplyChainRecord, authority, "Drug_B", "Drug_A");
}).then(function(upstreamInfo){
	console.log("Updated info of Drug_B's upstream Drug_A");
	console.log("Amount:", upstreamInfo[0].toString(), ", Owner ack:", upstreamInfo[1], ", Upstream owner ack:", upstreamInfo[2]);
	return funcDrugSupplyChainRecord.getDownStreamDrugInfo(contractDrugSupplyChainRecord, authority, "Drug_A", "Drug_B");
}).then(function(downstreamInfo){
	console.log("Info of Drug_A's downstream Drug_B");
	console.log("Amount:", downstreamInfo[0].toString(), ", Owner ack:", downstreamInfo[1], ", Downstream owner ack:", downstreamInfo[2]);
	return funcDrugSupplyChainRecord.isDrugDistributeValid(contractDrugSupplyChainRecord, authority, "Drug_B");
}).then(function(isValid){
	console.log("is distribution of drug B valid:", isValid);
	console.log("Participant 3 add drug stream A -> C, 500 unit");
	return funcDrugSupplyChainRecord.addDrugStream(contractDrugSupplyChainRecord, participants[2], "Drug_A", "Drug_C", 500);
}).then(function(){
	console.log("Participant 1 add drug stream A -> C, 500 unit");
	return funcDrugSupplyChainRecord.addDrugStream(contractDrugSupplyChainRecord, participants[0], "Drug_A", "Drug_C", 500);
}).then(function(){
	return funcDrugSupplyChainRecord.getUpstreamDrugInfo(contractDrugSupplyChainRecord, authority, "Drug_C", "Drug_A");
}).then(function(upstreamInfo){
	console.log("Updated info of Drug_C's upstream Drug_A");
	console.log("Amount:", upstreamInfo[0].toString(), ", Owner ack:", upstreamInfo[1], ", Upstream owner ack:", upstreamInfo[2]);
	return funcDrugSupplyChainRecord.isDrugDistributeValid(contractDrugSupplyChainRecord, authority, "Drug_A");
}).then(function(isValid){
	console.log("is distribution of drug A valid:", isValid);
}).catch(function(exception){
	console.log(exception);
})
