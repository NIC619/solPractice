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
			var id = 0xace;
			var totalNeeded = 2;
			var owner = web3.eth.accounts[0];
			var price = 3;
			var title = "simple two question poll";
			var lifeTime = 60*15;
			var paymentLockTime = 60*5;
			var ifEncrypt = false;
			var encryptionKey = 0x0;
			var numberOfQuestions = 2;
			funcIndex.newPoll(contract, owner, id, totalNeeded, price, title, lifeTime, paymentLockTime, ifEncrypt, encryptionKey,  numberOfQuestions, function(){
				funcIndex.getAddrByID(contract, id, function(){
					funcIndex.getOwnerByID(contract, id, function(){
						// funcIndex.getStatusByID(contract, id, function(){
							console.log("deploy Poll complete.");
							console.log("Poll starts with " + web3.fromWei(web3.eth.getBalance(contract.address), "ether") + " ether");
							var user = web3.eth.accounts[1];
							funcIndex.getUserAnswered(contract, user, function(){

							});
						// });
					});
				});
			});
    	}
	}
});
