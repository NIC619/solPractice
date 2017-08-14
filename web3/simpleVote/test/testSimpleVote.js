// Set up
var fs = require('fs');
var funcSimpleVote = require("../functions/funcSimpleVote.js");
var Web3 = require('web3');
var web3 = new Web3();
if(!web3.currentProvider)
	web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));

// Get contract abi & bytecode
var abiSimpleVote = JSON.parse( fs.readFileSync('../compile/simpleVote.abi', 'utf-8') );
var bytecodeSimpleVote = fs.readFileSync('../compile/simpleVote.bytecode', 'utf-8');

// Contract constructor arguments

console.log("I still have " + web3.fromWei( web3.eth.getBalance(web3.eth.accounts[0]), "ether" ) + " ether");

var user = web3.eth.accounts[0];
var candidates = [web3.eth.accounts[1], web3.eth.accounts[2], web3.eth.accounts[3]];

web3.eth.contract(abiSimpleVote).new(candidates, {from: web3.eth.accounts[0], data: bytecodeSimpleVote, gas: 4700000}, function(err, contractSimpleVote){
	if(err) console.log(err);
	else {
		if (typeof contractSimpleVote.address !== 'undefined') {
			console.log('contractSimpleVote mined! address: ' + contractSimpleVote.address + ' transactionHash: ' + contractSimpleVote.transactionHash);

			for(var i = 0; i < candidates.length; i++) {
				console.log("candidate #" + i + " has " + contractSimpleVote.votesReceived(candidates[i]) + " votes");
			}

			console.log("vote for candidate#0");
			funcSimpleVote.vote(contractSimpleVote, user, candidates[0]).then(function(){
				console.log("vote for candidate#1");
				return funcSimpleVote.vote(contractSimpleVote, user, candidates[1]);
			}).then(function(){
				console.log("vote for candidate#1");
				return funcSimpleVote.vote(contractSimpleVote, user, candidates[1]);
			}).then(function(){
				console.log("vote for candidate#0");
				return funcSimpleVote.vote(contractSimpleVote, user, candidates[0]);
			}).then(function(){
				console.log("vote for candidate#1");
				return funcSimpleVote.vote(contractSimpleVote, user, candidates[1]);
			}).then(function(){
				console.log("--------------------------------------------");				
				for(var i = 0; i < candidates.length; i++) {
					console.log("candidate #" + i + " has " + contractSimpleVote.votesReceived(candidates[i]) + " votes");
				}
			}).catch(function(exception){
				console.log(exception);
			})
		}
	}
});

