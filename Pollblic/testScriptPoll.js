var Web3 = require('web3');
var web3 = new Web3();

if(!web3.currentProvider)
	web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));

var Poll = require("./Poll.json");
// console.log(Poll.abi);
var abiPoll = web3.eth.contract(Poll.abi);
var binaryPoll = Poll.unlinked_binary;
var _ifEncrypt = false;
var _encryptionKey = 0x0;
var _numberOfQuestions = 2;
var _owner = web3.eth.accounts[0];

var instance = abiPoll.new(_owner, _ifEncrypt, _encryptionKey, _numberOfQuestions, {from: web3.eth.accounts[0], data: binaryPoll, gas: 4700000},function(err, contract){
	if(err) console.log(err);
	else {
		// console.log(contract.transactionHash);
		if (typeof contract.address !== 'undefined') {
         	console.log('Contract mined! address: ' + contract.address + ' transactionHash: ' + contract.transactionHash);
			addQ(contract, 0, 3, "finally", 0, []);
    	}
	}
});

function addQ(instance, _questionNumber, _questionType, _question, _numberOfOptions, _options) {
	instance.addQuestion.sendTransaction(_questionNumber, _questionType, _question, _numberOfOptions, _options, {from: web3.eth.accounts[0], gas: 300000}, function(err, result){
		console.log("tx id: " + result);
		getQ(_questionNumber);
	});
}
function getQ(instnace, _questionNumber) {
	instance.getQuestion.call(_questionNumber, function(err,result){
		console.log(result);
	})
}
