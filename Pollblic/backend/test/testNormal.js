// Set up
var fs = require('fs');
var funcPoll = require("../function/funcPollPromise.js");
var funcIndex = require("../function/funcIndexPromise.js");
var Web3 = require('web3');
var web3 = new Web3();
if(!web3.currentProvider)
	web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));

// Get contract abi & bytecode
// Poll
// var Poll = require("./Poll.json");
// console.log(Poll.abi);
var abiPoll = JSON.parse( fs.readFileSync('../compile/Poll.abi', 'utf-8') );
var binaryPoll = fs.readFileSync('../compile/Poll.bytecode', 'utf-8');
var abiIndex = JSON.parse( fs.readFileSync('../compile/Index.abi', 'utf-8') );
var binaryIndex = fs.readFileSync('../compile/Index.bytecode', 'utf-8');

// Contract constructor arguments
//
var contractStatus = ["Preparing", "Open", "Shutdown"];
var questionType = ["NotSet", "SingleChoice", "MultipleChoice", "ShortAnswer"];

console.log("Still have " + web3.fromWei( web3.eth.getBalance(web3.eth.accounts[0]), "ether" ) + " ether");

web3.eth.contract(abiIndex).new( {from: web3.eth.accounts[0], data: binaryIndex, gas: 4700000}, function(err, contractIndex){
	if(err) console.log(err);
	else {
		if (typeof contractIndex.address !== 'undefined') {
			console.log('contractIndex mined! address: ' + contractIndex.address + ' transactionHash: ' + contractIndex.transactionHash);
			var id = 0xace;
			var totalNeeded = 2;
			var owner = web3.eth.accounts[0];
			var price = 3; // ether
			var title = "simple two question poll";
			var lifeTime = 60; // block
			var periodForAnswerReview = 0; // block
			var numberOfQuestions = 2;
			// var ifEncrypt = false;
			// var encryptionKey = 0x0;

			var contractPoll;

			funcIndex.newPoll(contractIndex, owner, id,
				totalNeeded, price, title, lifeTime,
				periodForAnswerReview,  numberOfQuestions
				// ifEncrypt, encryptionKey
			).then(function(){
				return funcIndex.getPollAddrByID(contractIndex, id);
			}).then(function(_addr){
				contractPoll = web3.eth.contract(abiPoll).at(_addr);
				return funcIndex.getPollOwnerByID(contractIndex, id);
			}).then(function(_owner){
				console.log(owner);
				console.log("-----------deploy Poll complete-----------");
				console.log("contractPoll status: " + contractStatus[contractPoll.contractStatus().toString()]);
				console.log("Poll starts with " + web3.fromWei(web3.eth.getBalance(contractPoll.address), "ether") + " ether");
				console.log("--------------------------------------------");
			// 	return;
			// }).catch(function(exception){
				//console.log(exception);
				// throw new Error(exception);
			// }).then(function(){
				console.log("-----------start working on Poll-----------");
				return funcPoll.addQuestion(contractPoll, owner, 0, 3, "Q1: short answer", 0, []);
			}).then(function(){
				return funcPoll.addQuestion(contractPoll, owner, 1, 2, "Q2: multiple answer", 5, ["A1", "A2", "A3", "A4", "A5"]);
			}).then(function(){
				console.log("addQuestion done");
				console.log("--------------------------------------------");
				return funcPoll.getQuestion(contractPoll, 1);
			}).then(function([_questionType, _question]){
				console.log("Question 2: " + questionType[_questionType] + ", " + _question);
				return funcPoll.getQuestionChoice(contractPoll, 1, 4);
			}).then(function(_choice){
				console.log("Choice 5: " + _choice);
				return funcPoll.openPoll(contractPoll, owner);
			}).catch(function(exception){
				// console.log(exception);
				throw new Error(exception);
			}).then(function(){
				// the result of contractStatust call here is a little delayed
				console.log("contractPoll status: " + contractStatus[contractPoll.contractStatus().toString()]);
				return funcPoll.addAnswer(contractPoll, web3.eth.accounts[1], 0, "blabla",[]);
			}).then(function(){
				return funcPoll.addAnswer(contractPoll, web3.eth.accounts[1], 1, "ok", [2,3,4]);
			}).then(function(){
				console.log("addAnswer done!");
				console.log("total answered in poll: " + contractPoll.totalAnswered());
				console.log("--------------------------------------------");
			// 	return funcPoll.getA(contractPoll, web3.eth.accounts[1], 0);
			// }).then(function(){
			// 	funcPoll.getA(contractPoll, web3.eth.accounts[1], 1);
			// }).then(function(){
			// 	console.log("getA done!");
			// 	console.log("--------------------------------------------");
			// 	return funcPoll.revealA(contractPoll, owner, web3.eth.accounts[1], 0, "blablablo", []);
			// }).then(function(){
			// 	return funcPoll.revealA(contractPoll, owner, web3.eth.accounts[1], 1, "", [3]);
			// }).then(function(){
			// 	console.log("revealA done!");
			// 	return funcPoll.getRevealA(contractPoll, web3.eth.accounts[1], 0);
			// }).then(function(){
			// 	return funcPoll.getRevealA(contractPoll, web3.eth.accounts[1], 1);
			// }).then(function(){
				// console.log("getRevealA done!");
				// console.log("--------------------------------------------");
			// 	return funcPoll.getUserStatus(contractPoll, web3.eth.accounts[1]);
			// }).catch(function(exception){
				// console.log(exception);
				// throw new Error(exception);
			// }).then(function(){
				return funcPoll.addAnswer(contractPoll, web3.eth.accounts[2], 1, "", [0]);
			}).then(function(){
				return funcPoll.addAnswer(contractPoll, web3.eth.accounts[2], 0, "ass0", [1]);
			}).then(function(){
				console.log("addAnswer2 done!");
				console.log("total answered in poll: " + contractPoll.totalAnswered());
				console.log("--------------------------------------------");
				console.log("contractPoll status: " + contractStatus[contractPoll.contractStatus().toString()]);
				// return funcPoll.getUserStatus(contractPoll, web3.eth.accounts[2]);
			// }).catch(function(exception){
				// console.log(exception);
				// throw new Error(exception);
			// }).then(function(){
				return funcPoll.userWithdraw(contractPoll, web3.eth.accounts[1]);
				// return funcPoll.userWithdraw(contractPoll, web3.eth.accounts[2], 0);
			}).then(function(){
				console.log("remaining ether in Poll: " + web3.fromWei(web3.eth.getBalance(contractPoll.address), "ether") + " ether");
			// 	return funcIndex.getUserAnswered(contractIndex, web3.eth.accounts[1]);
			// }).then(function(){
			// 	return funcIndex.getUserAccepted(contractIndex, web3.eth.accounts[1]);
			// }).then(function(){
			// 	return funcIndex.getUserAnswered(contractIndex, web3.eth.accounts[2]);
			// }).then(function(){
			// 	return funcIndex.getUserAccepted(contractIndex, web3.eth.accounts[2]);
			// }).then(function(){
			// 	return funcPoll.userWithdraw(contractPoll, web3.eth.accounts[1], periodForAnswerReview);
			// }).then(function(){
			// 	console.log("contractPoll status: " + contractPoll.contractStatus().toString());
				// console.log("Poll ends with " + web3.fromWei(web3.eth.getBalance(contractIndex.address), "ether") + " ether");
				console.log("test Normal done!");
				console.log("--------------------------------------------");
			}).catch(function(exception){
				// console.log(exception);
			})
		}
	}
});

function sleeping(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

async function sleep(ms) {
	// console.log('Taking a break...');
	await sleeping(ms);
	// console.log('Two second later');
}

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
// 			var periodForAnswerReview = 60*5;
// 			var ifEncrypt = false;
// 			var encryptionKey = 0x0;
// 			var numberOfQuestions = 2;
// 			funcIndex.newPoll(contract, owner, id, totalNeeded, price, title, lifeTime, periodForAnswerReview, ifEncrypt, encryptionKey,  numberOfQuestions, function(){
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
