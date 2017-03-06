var Web3 = require('Web3');
var web3 = new Web3();
var async = require('async');
var express = require('express')
var bodyParser = require('body-parser');
var engine = require('ejs-mate');
var app = express()

// view engine setup
//app.engine('ejs' , engine);
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'ejs');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

var contract_address = "";//fill in address of the contract
var contract_api = [{"constant":false,"inputs":[{"name":"amount","type":"uint256"}],"name":"consume","outputs":[{"name":"sufficient","type":"bool"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"user","type":"address"},{"name":"amount","type":"uint256"}],"name":"allocate","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[{"name":"addr","type":"address"}],"name":"getBalance","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"inputs":[],"payable":false,"type":"constructor"}];
var account;
var pswd="";//fill in your account passphrase


if(!web3.currentProvider)
	web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));


app.get('/', function (req, res) {
	web3.eth.getAccounts(function(err, accs) {
		if (err != null) {
		  	res.send("There was an error fetching your accounts.");
			return;
		}

		if (accs.length == 0) {
		  	res.send("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
		  	return;
		}

		account = accs[0];
		var res_json = [];
		for(var i=0 ; i < accs.length ;i++) {
			var data = {account: accs[i], balance: web3.eth.getBalance(accs[i])};
			res_json.push(data);
		}
		res.send(res_json);
	});	
})

app.get('/allocate',function (req, res) {
	var simple_token = web3.eth.contract(contract_api).at(contract_address);
	var res_json;
	web3.personal.unlockAccount(account,pswd,10000);
	console.log("Preparing to allocate " + req.query.amount + " tokens to " + req.query.user + "...");

  	simple_token.allocate.sendTransaction(req.query.user, req.query.amount, {from: account}, function(err, tx_id) {
    	
    	if(err!=null){
    		console.log(err);
    		res_json = { result: "error: " + err};
    		res.send(res_json);
    	}
		else{
			console.log("Transaction sent with ID: " + tx_id);
			res_json = { result: "Transaction ID: " + tx_id + " waiting for confirmations..."};
			res.send(res_json);
		}
	});
		
})

app.get('/check_confirmation',function (req, res) {
	var tx_id = req.query.tx_id;
		console.log("Querying Transaction: " + tx_id + "...");

	var confirmed = false;
	async.whilst(
		function() {return (confirmed == false)},
		function(next) {
			web3.eth.getTransaction(tx_id, function(err, tx){
				//console.log(tx.blockNumber);
				if(tx.blockNumber == null)
					next();
				else {
					if(web3.eth.blockNumber >= (tx.blockNumber + 10)) {
						console.log("confirmed!");
						confirmed = true;
						next();
					}
					else
						next();
				}
			});
		},
		function(err){
			console.log("Transaction ID: " + tx_id + " has been confirmed");
			var res_json = { result: "Transaction ID: " + tx_id + " has been confirmed"};
			res.send(res_json);
		}
	);	
})

app.post('/consume',function (req, res) {
	var simple_token = web3.eth.contract(contract_api).at(contract_address);
	var res_json;
	web3.personal.unlockAccount(req.body.user, req.body.pswd, 10000);
	console.log("Preparing to consume " + req.body.amount + " tokens from " + req.body.user + "...");

  	simple_token.consume.sendTransaction(req.body.amount, {from: req.body.user}, function(err, tx_id) {
    	
    	if(err!=null){
    		console.log(err);
    		res_json = { result: "error: " + err};
    		res.send(res_json);
    	}
		else{
			console.log("Transaction sent with ID: " + tx_id);
			res_json = { result: "Transaction ID: " + tx_id + " waiting for confirmations..."};
			res.send(res_json);
		}
	});
		
})

app.get('/get_balance',function (req, res) {
	var simple_token = web3.eth.contract(contract_api).at(contract_address);
	var res_json;
	
	console.log("Querying balance of " + req.query.user + "...");

  	simple_token.getBalance.call(req.query.user, function(err, balance) {
    	
    	if(err!=null){
    		console.log(err);
    		res_json = { result: "error: " + err};
    		res.send(res_json);
    	}
		else{
			console.log("User " + req.query.user + " has " + balance + " tokens");
			res_json = { result: "User " + req.query.user + " has " + balance + " tokens"};
			res.send(res_json);
		}
	});
		
})

app.listen(3000, function () {
  console.log('listening on port 3000')
})