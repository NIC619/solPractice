// Set up
var funcPoll = require("./funcPoll.js");
var Web3 = require('web3');
var web3 = new Web3();
if(!web3.currentProvider)
	web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));

// Get contract abi & bytecode
// Poll
var Poll = require("./Poll.json");
// console.log(Poll.abi);
var abiPoll = web3.eth.contract(Poll.abi);
var binaryPoll = Poll.unlinked_binary;

// Contract constructor arguments
// Poll
var _id = 0xace;
var _owner = web3.eth.accounts[0];
var _expireTime = (new Date()).getTime() + 1000*60*15;
var _totalNeeded = 2;
var _ifEncrypt = false;
var _encryptionKey = 0x0;
var _paymentLockTime = 1000*60*5;
var _numberOfQuestions = 2;

console.log("I still have " + web3.fromWei( web3.eth.getBalance(web3.eth.accounts[0]), "ether" ) + " ether");

abiPoll.new(_id, _owner, _expireTime, _totalNeeded, _ifEncrypt, _encryptionKey, _paymentLockTime, _numberOfQuestions, {from: web3.eth.accounts[0], data: binaryPoll, gas: 4700000},function(err, contract){
	if(err) console.log(err);
	else {
		if (typeof contract.address !== 'undefined') {
         	//console.log('Contract mined! address: ' + contract.address + ' transactionHash: ' + contract.transactionHash);
			//console.log("contract status: " + contract.contractStatus().toString());
			console.log( (contract.expireTime() - (new Date()).getTime() )/1000 + " seconds left until contract close...");
			funcPoll.addQ(contract, web3.eth.accounts[0], 0, 3, "Q1: short answer", 0, [],function(tx_id){
				funcPoll.addQ(contract, web3.eth.accounts[0], 1, 1, "Q2: single answer", 3, ["A1", "A2", "A3"], function(tx_id){
					console.log("addQ done!");
					// getQ(contract, 0, function(){
					// 	getQ(contract, 1, function(){
					// 		console.log("getQ done!");
					// 	});
					// });
					funcPoll.openP(contract, web3.eth.accounts[0], function(){
						//console.log("contract status: " + contract.contractStatus().toString());
						funcPoll.addA(contract, web3.eth.accounts[1], 0, "blabla",[], function(tx_id){
							funcPoll.addA(contract, web3.eth.accounts[1], 1, "", [2], function(tx_id){
								console.log("addA done!");
								funcPoll.getA(contract, web3.eth.accounts[1], 0, function(){
									funcPoll.getA(contract, web3.eth.accounts[1], 1, function(){
										console.log("getA done!");
									});
								});
								console.log("total answered: " + contract.totalAnswered());
								funcPoll.revealA(contract, web3.eth.accounts[0], web3.eth.accounts[1], 0, "blabla", [], function(tx_id){
									funcPoll.revealA(contract, web3.eth.accounts[0], web3.eth.accounts[1],1,"",[1], function(tx_id){
										console.log("revealA done!");
										funcPoll.getRevealA(contract, web3.eth.accounts[1], 0, function(){
											funcPoll.getRevealA(contract, web3.eth.accounts[1], 1, function(){
												console.log("getRevealA done!");
												funcPoll.getUserStatus(web3.eth.accounts[1], function(){

												});
											});
										});
									});
								});
								funcPoll.addA(contract, web3.eth.accounts[2], 1, "", [0], function(tx_id){
									funcPoll.addA(contract, web3.eth.accounts[2], 0, "asso",[], function(tx_id){
										console.log("addA2 done!");
										console.log("total answered: " + contract.totalAnswered());
										console.log("contract status: " + contract.contractStatus().toString());
										funcPoll.getUserStatus(web3.eth.accounts[2], function(){

										});
									});
								});
							});
						});
					});	
				});
			});
    	}
	}
});
