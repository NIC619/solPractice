// Set up
var fs = require('fs');
var funcPoll = require("./funcPoll.js");
var funcIndex = require("./funcIndex.js");
var Web3 = require('web3');
var web3 = new Web3();
if(!web3.currentProvider)
	web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));

// Get contract abi & bytecode
// Poll
// var Poll = require("./Poll.json");
// console.log(Poll.abi);
var abiPoll = JSON.parse( fs.readFileSync('./Poll.abi', 'utf-8') );
var binaryPoll = fs.readFileSync('./Poll.bytecode', 'utf-8');
var abiIndex = JSON.parse( fs.readFileSync('./Index.abi', 'utf-8') );
var binaryIndex = fs.readFileSync('./Index.bytecode', 'utf-8');

// Contract constructor arguments


console.log("I still have " + web3.fromWei( web3.eth.getBalance(web3.eth.accounts[0]), "ether" ) + " ether");

web3.eth.contract(abiIndex).new( {from: web3.eth.accounts[0], data: binaryIndex, gas: 4700000},function(err, contract){
	if(err) console.log(err);
	else {
		if (typeof contract.address !== 'undefined') {
         	// console.log('Contract mined! address: ' + contract.address + ' transactionHash: ' + contract.transactionHash);
			var _id = 0xace;
			var _totalNeeded = 2;
			var _owner = web3.eth.accounts[0];
			var _price = 3;
			var _title = "simple two question poll";
			var _lifeTime = 60*15;
			var _paymentLockTime = 60*5;
			var _ifEncrypt = false;
			var _encryptionKey = 0x0;
			var _numberOfQuestions = 2;
			funcIndex.newPoll(contract, web3.eth.accounts[0], _id, _totalNeeded, _price, _title, _lifeTime, _paymentLockTime, _ifEncrypt, _encryptionKey,  _numberOfQuestions, function(){
				funcIndex.getAddrByID(contract, _id, function(_addr){
					console.log("deploy Poll complete.");
					console.log("Poll starts with " + web3.fromWei(web3.eth.getBalance(contract.address), "ether") + " ether");
					
				});
			});
    	}
	}
});
