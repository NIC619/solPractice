var Web3 = require('Web3');
var web3 = new Web3();
var express = require('express')
var bodyParser = require('body-parser');
var app = express()

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

var contract_address = "";//fill in address of the contract
var account,message="";


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
		var res_html_head = '<head> <title>ecrevoer contract</title><link rel="stylesheet" type="text/css" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css" ></head>';
		var intro = 'ecrecover is a built-in function to compute which address sign the specific message, it takes the message and the signature as parameters and return an address.'
		var res_html_body = '<body><h1>ECRecover</h1><h4>' + intro + '</h4><h3>Your address is ' + account + '</span></h3>\
					<br><h3>Sign a message using your address here: </h3><br>\
					<form id="sign" action="/sign" method="POST" accept-charset="utf-8">\
					<input type="text" name="msg" placeholder="Ethereum"></input>\
 					<br><input type="submit" value="Sign" /></form><hr>\
 					<br><h3>Enter a msg and a signature to see who signs it: </h3><br>\
					<form id="recover" action="/recover" method="POST" accept-charset="utf-8">\
					<input type="text" name="msg" placeholder="Ethereum"></input><br>\
					<input type="text" name="sig" placeholder="input a sigature consist of 130 hex digits"></input>\
 					<br><input type="submit" value="Recover" /></form><hr>\
 					<span id="status"> ' + message + '</span></body>';
		res.send('<!DOCTYPE html><html>' + res_html_head + res_html_body + '</html>');
	});	
})

app.post('/sign',function (req, res) {
	var msg = req.body.msg;
	var hashed_msg = web3.sha3(msg);
	
	web3.personal.unlockAccount(account,"",10000);//fill in your passphrase
  	web3.eth.sign(account, hashed_msg, function(err, result) {
    	
    	if(err!=null){
    		console.log(err);
    		res.send(err);
    	}
		else{
			message = 'signed message: ' + result;
			var res_html_head = '<head> <title>ecrevoer contract</title><link rel="stylesheet" type="text/css" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css" ></head>';
			var intro = 'ecrecover is a built-in function to compute which address sign the specific message, it takes the message and the signature as parameters and return an address.'
			var res_html_body = '<body><h1>ECRecover</h1><h4>' + intro + '</h4><h3>Your address is ' + account + '</span></h3>\
					<br><h3>Sign a message using your address here: </h3><br>\
					<form id="sign" action="/sign" method="POST" accept-charset="utf-8">\
					<input type="text" name="msg" placeholder="Ethereum"></input>\
 					<br><input type="submit" value="Sign" /></form><hr>\
 					<br><h3>Enter a msg and a signature to see who signs it: </h3><br>\
					<form id="recover" action="/recover" method="POST" accept-charset="utf-8">\
					<input type="text" name="msg" placeholder="Ethereum"></input><br>\
					<input type="text" name="sig" placeholder="input a sigature consist of 130 hex digits"></input>\
 					<br><input type="submit" value="Recover" /></form><hr>\
 					<span id="status"> ' + message + '</span></body>';
			res.send('<!DOCTYPE html><html>' + res_html_head + res_html_body + '</html>');

		}
	});
		
})

app.post('/recover',function (req, res) {
	var ecrecover = web3.eth.contract([{"constant":true,"inputs":[{"name":"_hsh","type":"bytes32"},{"name":"_v","type":"uint8"},{"name":"_r","type":"bytes32"},{"name":"_s","type":"bytes32"}],"name":"check","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"}]).at(contract_address);
	var msg = req.body.msg;
	var hashed_msg = web3.sha3(msg);
	var sig = req.body.sig;
	var r = '0x' + sig.substring(0,64);
	var s = '0x' + sig.substring(64,128);
	var v = (sig.substring(128,130) == '01' ? 1 : 0) + 27;

  	ecrecover.check.call(hashed_msg, v, r, s, function(err, result) {
    	
    	if(err!=null){
    		message = err;
    		console.log(err);
    		res.send(err);
    	}
		else{
			message = result + ' signed this message';
			var res_html_head = '<head> <title>ecrevoer contract</title><link rel="stylesheet" type="text/css" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css" ></head>';
			var intro = 'ecrecover is a built-in function to compute which address sign the specific message, it takes the message and the signature as parameters and return an address.'
			var res_html_body = '<body><h1>ECRecover</h1><h4>' + intro + '</h4><h3>Your address is ' + account + '</span></h3>\
					<br><h3>Sign a message using your address here: </h3><br>\
					<form id="sign" action="/sign" method="POST" accept-charset="utf-8">\
					<input type="text" name="msg" placeholder="Ethereum"></input>\
 					<br><input type="submit" value="Sign" /></form><hr>\
 					<br><h3>Enter a msg and a signature to see who signs it: </h3><br>\
					<form id="recover" action="/recover" method="POST" accept-charset="utf-8">\
					<input type="text" name="msg" placeholder="Ethereum"></input><br>\
					<input type="text" name="sig" placeholder="input a sigature consist of 130 hex digits"></input>\
 					<br><input type="submit" value="Recover" /></form><hr>\
 					<span id="status"> ' + message + '</span></body>';
			res.send('<!DOCTYPE html><html>' + res_html_head + res_html_body + '</html>');

		}
	});
		
})

app.listen(3000, function () {
  console.log('listening on port 3000')
})