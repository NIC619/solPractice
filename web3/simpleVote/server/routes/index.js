var fs = require('fs');
var express = require('express');
var router = express.Router();
var Web3 = require('Web3');
var web3 = new Web3();

var _title = "Simple Vote";

/* web3 set up */
if(!web3.currentProvider)
	web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));

var simpleVoteAddr = '';
var simpleVoteABI = JSON.parse( fs.readFileSync('../compile/simpleVote.abi', 'utf-8') );
var simpleVoteContract;
var user = web3.eth.accounts[0];
var candidates = [web3.eth.accounts[1], web3.eth.accounts[2], web3.eth.accounts[3]];
var _candidateNameList = ["Alice", "Bob", "Carol"];

/* DEVELOPEMENT FUNCTIONS */
router.get('/deploy', function(req, res) {
	//deploy contract
	var deployContract = require("../../functions/deploySimpleVote.js");
	var simpleVoteBytecode = fs.readFileSync('../compile/simpleVote.bytecode', 'utf-8');
	
	deployContract.deploy(web3, simpleVoteABI, simpleVoteBytecode, candidates, user, function(addr){
		simpleVoteAddr = addr;
		simpleVoteContract = web3.eth.contract(simpleVoteABI).at(simpleVoteAddr);
		var _voteCountList = [];
		for(var i = 0; i < candidates.length; i++) {
			// simpleVoteContract.votesReceived(candidates[i], function(err, voteCount) {
			// 	if(err) {
			// 		console.log("Error getting vote count!");
			// 	}
			// 	else {
			// 		console.log(voteCount);
			// 		_voteCountList.push(voteCount);					
			// 	}
			// });
			_voteCountList.push(simpleVoteContract.votesReceived(candidates[i]));
		}
		// console.log(_voteCountList);
		res.render('index', {title: _title, voteCountList: _voteCountList, candidateNameList: _candidateNameList, debugMsg: ""});
	});
});



/* GET home page */
router.get('/', function(req, res) {
	var _voteCountList = [];
	var _debugMsg = "";
	if(simpleVoteAddr != '') {
		for(var i = 0; i < candidates.length; i++) {
			// simpleVoteContract.votesReceived(candidates[i], function(err, voteCount) {
			// 	if(err) {
			// 		console.log("Error getting vote count!");
			// 	}
			// 	else {
			// 		console.log(voteCount);
			// 		_voteCountList.push(voteCount);					
			// 	}
			// });
			_voteCountList.push(simpleVoteContract.votesReceived(candidates[i]));
		}
	}
	else {
		_debugMsg = "Contract not yet deployed!";
	}
	// console.log(_voteCountList);
	res.render('index', {title: _title, voteCountList: _voteCountList, candidateNameList: _candidateNameList, debugMsg: _debugMsg});
});

/* POST vote */
router.post('/vote', function(req, res) {
	console.log("vote for " + candidates[req.body.candidateNumber]);
	simpleVoteContract.vote(candidates[req.body.candidateNumber], {from: user, gas: 300000}, function(err, txid){
		if(err) {
			console.log("Error in vote()");
			res.send("Error voting!");
		}
		else {
			console.log("Vote success");
			simpleVoteContract.votesReceived(candidates[req.body.candidateNumber], function(err, voteCount){
				res.send(voteCount);
			});
		}
	});
	
});

/* GET  */
router.get('/', function(req, res) {
	
});





module.exports = router;
