// Set up
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
var _paymentLockTime = 60*5;
var _numberOfQuestions = 2;

console.log("I still have " + web3.fromWei( web3.eth.getBalance(web3.eth.accounts[0]), "ether" ) + " ether");

abiPoll.new(_id, _owner, _expireTime, _totalNeeded, _ifEncrypt, _encryptionKey, _paymentLockTime, _numberOfQuestions, {from: web3.eth.accounts[0], data: binaryPoll, gas: 4700000},function(err, contract){
	if(err) console.log(err);
	else {
		if (typeof contract.address !== 'undefined') {
         	//console.log('Contract mined! address: ' + contract.address + ' transactionHash: ' + contract.transactionHash);
			//console.log("contract status: " + contract.contractStatus().toString());
			console.log( (contract.expireTime() - (new Date()).getTime() )/1000 + " seconds left until contract close...");
			addQ(contract, 0, 3, "Q1: short answer", 0, [],function(tx_id){
				addQ(contract, 1, 1, "Q2: single answer", 3, ["A1", "A2", "A3"], function(tx_id){
					console.log("addQ done!");
					// shutP(contract,function(){
					// 	console.log("contract status: " + contract.contractStatus().toString());
					// 	// console.log("contract.shutDownTime(): " + contract.shutDownTime());
					// 	// console.log("current time: " + (new Date()).getTime() );
					// 	console.log("contract shutted down in " + ( (contract.shutDownTime()) - ((new Date()).getTime()/1000) ) + " seconds...");
					// });

					openP(contract, function(){
						console.log("contract status: " + contract.contractStatus().toString());
						addA(contract, web3.eth.accounts[1], 0, "blabla",[], function(tx_id){
							addA(contract, web3.eth.accounts[1], 1, "", [2], function(tx_id){
								console.log("addA done!");
								console.log("total answered: " + contract.totalAnswered());
								addA(contract, web3.eth.accounts[2], 1, "", [0], function(tx_id){
									addA(contract, web3.eth.accounts[2], 0, "asso",[], function(tx_id){
										console.log("addA2 done!");
										console.log("total answered: " + contract.totalAnswered());
										console.log("contract status: " + contract.contractStatus().toString());
									});
								});
							});
						});
					});	
					setTimeout( function (){
									shutP(contract,function(){
										console.log("contract status: " + contract.contractStatus().toString());
										console.log("contract shutted down in " + ( (contract.shutDownTime()) - ((new Date()).getTime()/1000) ) + " seconds...");
									}
									);
								}
								,300);
				});
			});
    	}
	}
});

function addQ(instance, _questionNumber, _questionType, _question, _numberOfOptions, _options, cb) {
	instance.addQuestion.sendTransaction(_questionNumber, _questionType, _question, _numberOfOptions, _options, {from: web3.eth.accounts[0], gas: 300000}, function(err, result){
		if(err) {
			console.log("in addQ: " + err);
			return;
		}
		else {
			console.log("addQ tx id: " + result);
		}
		cb(result);
	});
}
function getQ(instance, _questionNumber, cb) {
	instance.getQuestion(_questionNumber, function(err,result){
		if(err) {
			console.log("in getQ: " + err);
			return;
		}
		else {
			console.log(result[0].toString());
		}
		cb();
	})
}
function addA(instance, _user, _questionNumber,_shortAnswer, _choices, cb) {
	instance.addAnswer(_questionNumber, _shortAnswer, _choices, {from: _user, gas: 300000}, function(err, tx_id){
		if(err) {
			console.log("in addA: " + err);
			return;
		}
		else {
			console.log("addA tx id: " + tx_id);
		}
		cb();
	})
}
function getA(instance, _user, _questionNumber, cb) {
	instance.getAnswer(_user, _questionNumber, function(err, result){
		if(err) {
			console.log("in getA: " + err);
			return;
		}
		else {
			var ans = "short answer: " + result[0] + ", choice: ";
			for(var i = 0; i < result[1].length ; i++) {
				console.log(result[1][i].toString() + " ");
			}
		}
		cb();
	})
}
function openP(instance, cb) {
	instance.openPoll({from: web3.eth.accounts[0], gas: 300000}, function(err, tx_id){
		if(err) {
			console.log("in openP: " + err);
			return;
		}
		else {
			console.log("contract open!");
		}
		cb();
	});
}
function shutP(instance, cb) {
	instance.shutDownPoll({from: web3.eth.accounts[0], gas: 300000}, function(err, tx_id){
		if(err) {
			console.log("in shutP: " + err);
			return;
		}
		else {
			console.log("contract shutted down!");
		}
		cb();
	});
}