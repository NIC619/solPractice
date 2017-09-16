// Set up
var fs = require('fs');
var deploySimpleRecord = require("../functions/deploySimpleRecord.js");
var funcSimpleRecord = require("../functions/funcSimpleRecord.js");
var Web3 = require('web3');
var web3 = new Web3();
if(!web3.currentProvider)
	web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));

// Get contract abi & bytecode
var abiSimpleRecord = JSON.parse( fs.readFileSync('../compile/simpleRecord.abi', 'utf-8') );
var bytecodeSimpleRecord = fs.readFileSync('../compile/simpleRecord.bytecode', 'utf-8');

// Contract constructor arguments

console.log("I still have " + web3.fromWei( web3.eth.getBalance(web3.eth.accounts[0]), "ether" ) + " ether");

var authority = web3.eth.accounts[0];
var authorities = [web3.eth.accounts[1]];
var patients = [web3.eth.accounts[2], web3.eth.accounts[3], web3.eth.accounts[4]];

deploySimpleRecord.deploy(web3, abiSimpleRecord, bytecodeSimpleRecord , authorities, authority, function(contractSimpleRecord){
	
	console.log("input new data for patient", patients[0]);
	funcSimpleRecord.newPatientData(contractSimpleRecord, authority, patients[0], "Alice", "F", 28,
									"1989/3/11", "9206453", "633", 3, "First time", "None").then(function(){
		console.log("Patient ", contractSimpleRecord.getName(patients[0])," with ID ", contractSimpleRecord.getId(patients[0]), " registered.")
		console.log("input new data for patient", patients[1]);
		return funcSimpleRecord.newPatientData(contractSimpleRecord, authority, patients[1], "Bob", "M", 19,
												"1998/7/28", "2405931", "594", 6, "First time", "None");
	}).then(function(){
		console.log("Patient ", contractSimpleRecord.getName(patients[1])," with Birthdate ", contractSimpleRecord.getBirthdate(patients[1]), " registered.")		
		console.log("input new data for patient", patients[2]);
		return funcSimpleRecord.newPatientData(contractSimpleRecord, authority, patients[2], "Carl", "M", 64,
		"1953/1/31", "728533", "103", 1, "Inactive", "None");
	}).then(function(){
		console.log("Patient with medical number ", contractSimpleRecord.getMednumber(patients[2])," is ", contractSimpleRecord.getAge(patients[2]).toString(), " years old.")		
		console.log("--------------------------------------------");				
	}).catch(function(exception){
		console.log(exception);
	})
});

