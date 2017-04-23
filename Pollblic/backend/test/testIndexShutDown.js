// ENV
var inputShutDownTime;
if(process.argv.length == 2) inputShutDownTime = Math.random()*5000;
else inputShutDownTime = process.argv[2];
// shut down in 500 milli second will shut down before user2 answer but after user1 answer which will allow user1 to get his payment
// shut down after 1000 milli second will shut down after both users answer

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
var abiPoll = JSON.parse( fs.readFileSync('../compile/Poll.abi', 'utf-8') );
var binaryPoll = fs.readFileSync('../compile/Poll.bytecode', 'utf-8');
var abiIndex = JSON.parse( fs.readFileSync('../compile/Index.abi', 'utf-8') );
var binaryIndex = fs.readFileSync('../compile/Index.bytecode', 'utf-8');


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
			var paymentLockTime = 3;
			var ifEncrypt = false;
			var encryptionKey = 0x0;
			var numberOfQuestions = 2

			var contractPoll;

			funcIndex.newPoll(contractIndex, owner, id, totalNeeded, price, title, lifeTime, paymentLockTime, ifEncrypt, encryptionKey,  numberOfQuestions).then(function(){
				return funcIndex.getAddrByID(contractIndex, id);
			}).then(function(_addr){
				contractPoll = web3.eth.contract(abiPoll).at(_addr);
                setTimeout( function (){
									contractPoll.shutDownPoll({
                                            from: owner,
                                            gas: 300000
                                        }, function(err, tx_id){
                                            if(err) console.log("in shutP: " + err);
                                            else {
                                                console.log("contractPoll status: " + contractPoll.contractStatus().toString());
										        console.log("contractPoll shutted down in " + ( (contractPoll.shutDownTime()) - ((new Date()).getTime()/1000) ) + " seconds...");
                                            }
									}
									);
								}
								,inputShutDownTime);
				return funcIndex.getOwnerByID(contractIndex, id);
			}).then(function(){
				console.log("-----------deploy Poll complete-----------");
				console.log("contractPoll status: " + contractPoll.contractStatus().toString());
				console.log("Poll starts with " + web3.fromWei(web3.eth.getBalance(contractIndex.address), "ether") + " ether");
				console.log("--------------------------------------------");
				return funcIndex.getUserAnswered(contractIndex, web3.eth.accounts[1]);
			}).catch(function(exception){
				// console.log(exception);
				// throw new Error(exception);
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
				// throw new Error(exception);
			}).then(function(){
				// the result of contractStatust call here is not up to date
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
			// 	return funcPoll.getUserStatus(contractPoll, web3.eth.accounts[1]);
			// }).then(function(){
			// 	console.log("total answered: " + contractPoll.totalAnswered());
			// 	return funcPoll.revealA(contractPoll, owner, web3.eth.accounts[1], 0, "blablablo", []);
			// }).then(function(){
			// 	return funcPoll.revealA(contractPoll, owner, web3.eth.accounts[1], 1, "", [3]);
			// }).then(function(){
			// 	console.log("revealA done!");
			// 	return funcPoll.getRevealA(contractPoll, web3.eth.accounts[1], 0);
			// }).then(function(){
			// 	return funcPoll.getRevealA(contractPoll, web3.eth.accounts[1], 1);
			// }).then(function(){
			// 	console.log("getRevealA done!");
			// 	console.log("--------------------------------------------");
				return funcPoll.getUserStatus(contractPoll, web3.eth.accounts[1]);
			}).catch(function(exception){
				// console.log(exception);
				// throw new Error(exception);
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
				// throw new Error(exception);
			}).then(function(){
				return funcPoll.withD(contractPoll, web3.eth.accounts[1], paymentLockTime);
				// return funcPoll.withD(contractPoll, web3.eth.accounts[2], 0);
			}).then(function(){
				console.log("remaining ether in Index: " + web3.fromWei(web3.eth.getBalance(contractIndex.address), "ether") );
				return funcIndex.getUserAnswered(contractIndex, web3.eth.accounts[1]);
			}).then(function(){
				return funcIndex.getUserAccepted(contractIndex, web3.eth.accounts[1]);
			}).then(function(){
				return funcIndex.getUserAnswered(contractIndex, web3.eth.accounts[2]);
			}).then(function(){
				return funcIndex.getUserAccepted(contractIndex, web3.eth.accounts[2]);
			// }).then(function(){
			// 	return funcPoll.withD(contractPoll, web3.eth.accounts[1], paymentLockTime);
			}).then(function(){
				console.log("contractPoll status: " + contractPoll.contractStatus().toString());
				console.log("Poll ends with " + web3.fromWei(web3.eth.getBalance(contractIndex.address), "ether") + " ether");
				console.log("test Normal done!");
				console.log("--------------------------------------------");
			}).catch(function(exception){
				// console.log(exception);
			})
		}
	}
});