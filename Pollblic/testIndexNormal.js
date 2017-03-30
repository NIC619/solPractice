// Set up
var fs = require('fs');
var funcPoll = require("./funcPollPromise.js");
var funcIndex = require("./funcIndexPromise.js");
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

web3.eth.contract(abiIndex).new( {from: web3.eth.accounts[0], data: binaryIndex, gas: 4700000}, function(err, contractIndex){
	if(err) console.log(err);
	else {
		if (typeof contractIndex.address !== 'undefined') {
			console.log('contractIndex mined! address: ' + contractIndex.address + ' transactionHash: ' + contractIndex.transactionHash);
			var id = 0xace;
			var totalNeeded = 2;
			var owner = web3.eth.accounts[0];
			var price = 3;
			var title = "simple two question poll";
			var lifeTime = 60*15;
			var paymentLockTime = 2;
			var ifEncrypt = false;
			var encryptionKey = 0x0;
			var numberOfQuestions = 2

			var contractPoll;

			funcIndex.newPoll(contractIndex, owner, id, totalNeeded, price, title, lifeTime, paymentLockTime, ifEncrypt, encryptionKey,  numberOfQuestions).then(function(){
				return funcIndex.getAddrByID(contractIndex, id);
			}).then(function(_addr){
				contractPoll = web3.eth.contract(abiPoll).at(_addr);
				return funcIndex.getOwnerByID(contractIndex, id);
			}).then(function(){
				console.log("-----------deploy Poll complete-----------");
				console.log("Poll starts with " + web3.fromWei(web3.eth.getBalance(contractIndex.address), "ether") + " ether");
				console.log("--------------------------------------------");
				return funcIndex.getUserAnswered(contractIndex, web3.eth.accounts[1]);
			}).catch(function(exception){
				//console.log(exception);
				throw new Error(exception);
			}).then(function(){
				console.log("-----------start working on Poll-----------");
				return funcPoll.addQ(contractPoll, owner, 0, 3, "Q1: short answer", 0, []);
			}).then(function(){
				return funcPoll.addQ(contractPoll, owner, 1, 1, "Q2: single answer", 3, ["A1", "A2", "A3"]);
			}).then(function(){
				console.log("addQ done");
				console.log("--------------------------------------------");
				return funcPoll.openP(contractPoll, owner);
			}).catch(function(exception){
				// console.log(exception);
				throw new Error(exception);
			}).then(function(){
				console.log("contractPoll status: " + contractPoll.contractStatus().toString());
				return funcPoll.addA(contractPoll, web3.eth.accounts[1], 0, "blabla",[]);
			}).then(function(){
				return funcPoll.addA(contractPoll, web3.eth.accounts[1], 1, "", [2]);
			}).then(function(){
				console.log("addA done!");
				console.log("--------------------------------------------");
			// 	return funcPoll.getA(contractPoll, web3.eth.accounts[1], 0);
			// }).then(function(){
			// 	funcPoll.getA(contractPoll, web3.eth.accounts[1], 1);
			// }).then(function(){
			// 	console.log("getA done!");
			// 	console.log("--------------------------------------------");
				return funcPoll.getUserStatus(contractPoll, web3.eth.accounts[1]);
			}).then(function(){
				console.log("total answered: " + contractPoll.totalAnswered());
				return funcPoll.revealA(contractPoll, owner, web3.eth.accounts[1], 0, "blablablo", []);
			}).then(function(){
				return funcPoll.revealA(contractPoll, owner, web3.eth.accounts[1], 1, "", [3]);
			}).then(function(){
				console.log("revealA done!");
				return funcPoll.getRevealA(contractPoll, web3.eth.accounts[1], 0);
			}).then(function(){
				return funcPoll.getRevealA(contractPoll, web3.eth.accounts[1], 1);
			}).then(function(){
				// console.log("getRevealA done!");
				console.log("--------------------------------------------");
				return funcPoll.getUserStatus(contractPoll, web3.eth.accounts[1]);
			}).catch(function(exception){
				console.log(exception);
				throw new Error(exception);
			}).then(function(){
				return funcPoll.addA(contractPoll, web3.eth.accounts[2], 1, "", [0]);
			}).then(function(){
				return funcPoll.addA(contractPoll, web3.eth.accounts[2], 0, "ass0", [1]);
			}).then(function(){
				console.log("addA2 done!");
				console.log("--------------------------------------------");
				console.log("total answered: " + contractPoll.totalAnswered());
				console.log("contractPoll status: " + contractPoll.contractStatus().toString());
				return funcPoll.getUserStatus(contractPoll, web3.eth.accounts[2]);
			}).catch(function(exception){
				// console.log(exception);
				throw new Error(exception);
			}).then(function(){
				return funcPoll.withD(contractPoll, web3.eth.accounts[2], paymentLockTime);
			}).then(function(){
				console.log("remaining ether in Index: " + web3.fromWei(web3.eth.getBalance(contractIndex.address), "ether") );
				return funcIndex.getUserAnswered(contractIndex, web3.eth.accounts[1]);
			}).then(function(){
				return funcIndex.getUserAccepted(contractIndex, web3.eth.accounts[1]);
			}).then(function(){
				return funcIndex.getUserAnswered(contractIndex, web3.eth.accounts[2]);
			}).then(function(){
				return funcIndex.getUserAccepted(contractIndex, web3.eth.accounts[2]);
			}).then(function(){
				return funcPoll.withD(contractPoll, web3.eth.accounts[1], paymentLockTime);
			}).then(function(){
				console.log("test Normal done!");
				console.log("--------------------------------------------");
			}).catch(function(exception){
				console.log(exception);
			})
		}
	}
});

// web3.eth.contract(abiIndex).new( {from: web3.eth.accounts[0], data: binaryIndex, gas: 4700000},function(err, contract){
// 	if(err) console.log(err);
// 	else {
// 		if (typeof contract.address !== 'undefined') {
//          	// console.log('Contract mined! address: ' + contract.address + ' transactionHash: ' + contract.transactionHash);
// 			var id = 0xace;
// 			var totalNeeded = 2;
// 			var owner = web3.eth.accounts[0];
// 			var price = 3;
// 			var title = "simple two question poll";
// 			var lifeTime = 60*15;
// 			var paymentLockTime = 60*5;
// 			var ifEncrypt = false;
// 			var encryptionKey = 0x0;
// 			var numberOfQuestions = 2;
// 			funcIndex.newPoll(contract, owner, id, totalNeeded, price, title, lifeTime, paymentLockTime, ifEncrypt, encryptionKey,  numberOfQuestions, function(){
// 				funcIndex.getAddrByID(contract, id, function(){
// 					funcIndex.getOwnerByID(contract, id, function(){
// 						// funcIndex.getStatusByID(contract, id, function(){
// 							console.log("deploy Poll complete.");
// 							console.log("Poll starts with " + web3.fromWei(web3.eth.getBalance(contract.address), "ether") + " ether");
// 							var user = web3.eth.accounts[1];
// 							funcIndex.getUserAnswered(contract, user, function(){

// 							});
// 						// });
// 					});
// 				});
// 			});
//     	}
// 	}
// });
