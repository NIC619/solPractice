var fs = require('fs');
var express = require('express');
var router = express.Router();
var Web3 = require('Web3');
var web3 = new Web3();

var _title = "Drug Supply Chain System";

/* web3 set up */
if(!web3.currentProvider)
	web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));

// Get contract abi & bytecode
var abiDrugSupplyChainRecord = JSON.parse( fs.readFileSync('../compile/DrugSupplyChainRecord.abi', 'utf-8') );
var bytecodeDrugSupplyChainRecord = fs.readFileSync('../compile/DrugSupplyChainRecord.bytecode', 'utf-8');

var deployDrugSupplyChainRecord = require("../../functions/deployDrugSupplyChainRecord.js");
var funcDrugSupplyChainRecord = require("../../functions/funcDrugSupplyChainRecord.js");
var contractDrugSupplyChainRecord;
var authority = web3.eth.accounts[0];
var drugManufacturers = [web3.eth.accounts[1], web3.eth.accounts[2], web3.eth.accounts[3]];
var isAdmin = false;

/* DEVELOPEMENT FUNCTIONS */
router.get('/deploy', function(req, res) {
	//deploy contract
	var _debugMsg = "";

	deployDrugSupplyChainRecord.deploy(web3, abiDrugSupplyChainRecord, bytecodeDrugSupplyChainRecord, authority).then(function(instance){
		contractDrugSupplyChainRecord = instance;
		console.log("Add drug manufacturer 1:", drugManufacturers[0]);
		return funcDrugSupplyChainRecord.addNewParticipant(contractDrugSupplyChainRecord, drugManufacturers[0]);
	}).then(function() {
		console.log("Add drug manufacturer 2:", drugManufacturers[1]);
		return funcDrugSupplyChainRecord.addNewParticipant(contractDrugSupplyChainRecord, drugManufacturers[1]);
	}).then(function() {
		console.log("Add drug manufacturer 3:", drugManufacturers[2]);
		return funcDrugSupplyChainRecord.addNewParticipant(contractDrugSupplyChainRecord, drugManufacturers[2]);
	}).then(function() {
		res.render('index', {title: _title, isAuthorized: isAdmin, drugManufacturerList: drugManufacturers, debugMsg: _debugMsg});
		// res.redirect('/');
	}).catch(function(exception) {
		console.log("Error while deploying contract and adding initial participants");
		_debugMsg = "Contract initiation failed";
		res.render('index', {title: _title, isAuthorized: isAdmin, drugManufacturerList: drugManufacturers, debugMsg: _debugMsg});
	});
});



/* GET home page */
router.get('/', function(req, res) {
	var _debugMsg = "";

	if(contractDrugSupplyChainRecord == undefined) {
		deployDrugSupplyChainRecord.deploy(web3, abiDrugSupplyChainRecord, bytecodeDrugSupplyChainRecord, authority).then(function(instance){
			contractDrugSupplyChainRecord = instance;
			console.log("Add drug manufacturer 1:", drugManufacturers[0]);
			return funcDrugSupplyChainRecord.addNewParticipant(contractDrugSupplyChainRecord, drugManufacturers[0]);
		}).then(function() {
			console.log("Add drug manufacturer 2:", drugManufacturers[1]);
			return funcDrugSupplyChainRecord.addNewParticipant(contractDrugSupplyChainRecord, drugManufacturers[1]);
		}).then(function() {
			console.log("Add drug manufacturer 3:", drugManufacturers[2]);
			return funcDrugSupplyChainRecord.addNewParticipant(contractDrugSupplyChainRecord, drugManufacturers[2]);
		}).then(function() {
			res.render('index', {title: _title, isAuthorized: isAdmin, drugManufacturerList: drugManufacturers, debugMsg: _debugMsg});
			return Promise.resolve();
		}).catch(function(exception) {
			console.log("Error while deploying contract and adding initial participants");
			_debugMsg = "Contract initiation failed";
			res.render('index', {title: _title, isAuthorized: isAdmin, drugManufacturerList: drugManufacturers, debugMsg: _debugMsg});
		});
	}
	else {
		res.render('index', {title: _title, isAuthorized: isAdmin, drugManufacturerList: drugManufacturers, debugMsg: _debugMsg});
	}
});

/* GET log in */
router.get('/login', function(req, res) {
	isAdmin = true;
	res.redirect('/');
});

/* GET log out */
router.get('/logout', function(req, res) {
	isAdmin = false;
	res.redirect('/');
});

/* GET manufacturer detail */
router.get('/getDrugsByManufacturer', function(req, res) {
	var _debugMsg = "";
	if(contractDrugSupplyChainRecord == undefined) {
		_debugMsg = "Contract not yet deployed!";
		res.render('index', {title: _title, isAuthorized: isAdmin, drugManufacturerList: drugManufacturers, debugMsg: _debugMsg});
	}
	else {
		console.log("Manufacturer detail inquery received, manufacturer: " + req.query.addr);
		funcDrugSupplyChainRecord.getDrugsAmountByOwner(contractDrugSupplyChainRecord, authority, req.query.addr).then(function(amount){
			if(amount.toString() == 0) {
				console.log("Manufacturer detail inquery processed, drug list owned by this manufacturer: []");
				res.render('manufacturer', {title: _title, isAuthorized: isAdmin, drugManufacturerList: drugManufacturers, drugList: [], debugMsg: _debugMsg});
				return Promise.reject();
			}
			else {
				var promiseList = [];
				for(let i=0 ; i<amount ; i++) {
					promiseList.push(funcDrugSupplyChainRecord.getDrugsOwnedByOwner(contractDrugSupplyChainRecord, authority, req.query.addr, i));
				}
				return Promise.all(promiseList);
			}
		}).then(function(_drugList){
			console.log("Manufacturer detail inquery processed, drug list owned by this manufacturer: " + _drugList);
 			res.render('manufacturer', {title: _title, isAuthorized: isAdmin, drugManufacturerList: drugManufacturers, drugList: _drugList, debugMsg: _debugMsg});
		}).catch(function(exception) {
			console.log("Get manufacturer detail terminated.");
		});
	}
});

/* GET drug detail */
router.get('/getDrugByName', function(req, res) {
	var _debugMsg = "";
	var drugDetail;
	var _upstreamDrugList = [];
	var _downstreamDrugList = [];
	if(contractDrugSupplyChainRecord == undefined) {
		_debugMsg = "Contract not yet deployed!";
		res.render('index', {title: _title, isAuthorized: isAdmin, drugManufacturerList: drugManufacturers, drug: drugDetail, upstreamDrugList: _upstreamDrugList, downstreamDrugList: _downstreamDrugList, debugMsg: _debugMsg});
	}
	else {
		console.log("Drug detail inquery received, drug name: " + req.query.name);
		drugDetail = {"name": req.query.name};
		funcDrugSupplyChainRecord.getDrugOwner(contractDrugSupplyChainRecord, authority, req.query.name).then(function(owner){
			drugDetail["owner"] = owner;
			if(owner == "0x0000000000000000000000000000000000000000") {
				_debugMsg = "Drug '" + req.query.name + "' not found.";
				console.log(_debugMsg);
				res.render('drug', {title: _title, isAuthorized: isAdmin, drugManufacturerList: drugManufacturers, drug: drugDetail, upstreamDrugList: _upstreamDrugList, downstreamDrugList: _downstreamDrugList, debugMsg: _debugMsg});
				return Promise.reject();
			}
			else {
				return funcDrugSupplyChainRecord.getDrugDetail(contractDrugSupplyChainRecord, authority, req.query.name);
			}
		}).then(function(_drugDetail){
			drugDetail["amount"] = _drugDetail[1].toString();
			drugDetail["manuDate"] = _drugDetail[2];
			drugDetail["expDate"] = _drugDetail[3];
			drugDetail["upstreamDrugAmount"] = _drugDetail[4].toString();
			drugDetail["downstreamDrugAmount"] = _drugDetail[5].toString();
			console.log("Drug detail inquery processed, drug name: " + req.query.name);
			var upstreamPromiseList = [];
			for(let i=1 ; i<=drugDetail["upstreamDrugAmount"] ; i++) {
				upstreamPromiseList.push(funcDrugSupplyChainRecord.getUpstreamDrugInfoByIndex(contractDrugSupplyChainRecord, authority, req.query.name, i));
			}
			return Promise.all(upstreamPromiseList);
		}).then(function(upstreamDrugDetails) {
			console.log("Drug detail - upstream drugs inquery processed, amount of upstream drugs: " + upstreamDrugDetails.length);
			_upstreamDrugList = upstreamDrugDetails;
			var downstreamPromiseList = [];
			for(let i=1 ; i<=drugDetail["downstreamDrugAmount"] ; i++) {
				downstreamPromiseList.push(funcDrugSupplyChainRecord.getDownstreamDrugInfoByIndex(contractDrugSupplyChainRecord, authority, req.query.name, i));
			}
			return Promise.all(downstreamPromiseList);
		}).then(function(downstreamDrugDetails) {
			console.log("Drug detail - downstream drugs inquery processed, amount of downstream drugs: " + downstreamDrugDetails.length);
			_downstreamDrugList = downstreamDrugDetails;
 			res.render('drug', {title: _title, isAuthorized: isAdmin, drugManufacturerList: drugManufacturers, drug: drugDetail, upstreamDrugList: _upstreamDrugList, downstreamDrugList: _downstreamDrugList, debugMsg: _debugMsg});
		}).catch(function(exception) {
			console.log("Get drug detail terminated.");
		});
	}
});

/* GET new drug */
router.get('/addNewDrug', function(req, res) {
	var _debugMsg = "";

	if(contractDrugSupplyChainRecord == undefined) {
		_debugMsg = "Contract not yet deployed!";
		res.render('index', {title: _title, isAuthorized: isAdmin, drugManufacturerList: drugManufacturers, debugMsg: _debugMsg});
	}
	else {
		if (isAdmin == false) {
			_debugMsg = "Only authorized person can add new drug record";
		}
		res.render('newDrug', {title: _title, isAuthorized: isAdmin, drugManufacturerList: drugManufacturers, debugMsg: _debugMsg});
	}
});

/* POST new drug */
router.post('/addNewDrug', function(req, res) {
	var _debugMsg = "";
	if(contractDrugSupplyChainRecord == undefined) {
		_debugMsg = "Contract not yet deployed!";
		res.render('index', {title: _title, isAuthorized: isAdmin, drugManufacturerList: drugManufacturers, debugMsg: _debugMsg});
	}
	else if(isAdmin == false) {
		_debugMsg = "Only authorized person can add new drug record";
		res.render('newDrug', {title: _title, isAuthorized: isAdmin, drugManufacturerList: drugManufacturers, debugMsg: _debugMsg});
	}
	else {
		console.log("Receive a request to add new drug: " + req.body.name);
		funcDrugSupplyChainRecord.getDrugOwner(contractDrugSupplyChainRecord, authority, req.body.name).then(function(owner){
			if(owner != "0x0000000000000000000000000000000000000000") {
				_debugMsg = "Drug has already been registered!";
				return Promise.reject();
			}
			else {
				return funcDrugSupplyChainRecord.addNewDrug(contractDrugSupplyChainRecord, req.body.owner, req.body.name, req.body.manuDate, req.body.expDate, req.body.amount);
			}
		}).then(function(_drugDetail){
			console.log("Request to add new drug processed, drug name: " + req.body.name);
			res.redirect("/getDrugByName?name=" + req.body.name);
		}).catch(function(exception){
			if(_debugMsg.length == 0) {
				_debugMsg = "Failed to add new drug";
			}
			console.log(_debugMsg);
			res.render('newDrug', {title: _title, isAuthorized: isAdmin, drugManufacturerList: drugManufacturers, debugMsg: _debugMsg});
		});
	}
});

/* GET add drug stream*/
router.get('/addDrugStream', function(req, res) {
	var _debugMsg = "";

	if(contractDrugSupplyChainRecord == undefined) {
		_debugMsg = "Contract not yet deployed!";
		res.render('index', {title: _title, isAuthorized: isAdmin, drugManufacturerList: drugManufacturers, debugMsg: _debugMsg});
	}
	else {
		console.log("Receive a request to add drug stream for drug: " + req.query.name);
		if (isAdmin == false) {
			_debugMsg = "Only authorized person can add drug stream record";
		}
		res.render('addDrugStream', {title: _title, isAuthorized: isAdmin, owner: req.query.addr, drugName: req.query.name, upOrDownStream: req.query.stream, debugMsg: _debugMsg});
	}
});

/* POST add drug stream*/
router.post('/addDrugStream', function(req, res) {
	var _debugMsg = "";

	if(contractDrugSupplyChainRecord == undefined) {
		_debugMsg = "Contract not yet deployed!";
		res.render('index', {title: _title, isAuthorized: isAdmin, drugManufacturerList: drugManufacturers, debugMsg: _debugMsg});
	}
	else if(isAdmin == false) {
		_debugMsg = "Only authorized person can add drug stream record";
		res.render('addDrugStream', {title: _title, isAuthorized: isAdmin, owner: req.body.owner, drugName: req.body.drugName, upOrDownStream: req.body.stream, debugMsg: _debugMsg});
	}
	else {
		var promiseList = [];
		promiseList.push(funcDrugSupplyChainRecord.getDrugOwner(contractDrugSupplyChainRecord, authority, req.body.drugName));
		promiseList.push(funcDrugSupplyChainRecord.getDrugOwner(contractDrugSupplyChainRecord, authority, req.body.otherDrugName));

		Promise.all(promiseList).then(function(owners){
			console.log("Owners of the two drug: " + owners[0] + ", " + owners[1]);
			if(owners[0] == "0x0000000000000000000000000000000000000000") {
				_debugMsg = "Failed to add drug stream, drug '" + req.body.drugName + "' is not registered";
				console.log(_debugMsg);
				return Promise.reject();
			}
			else if(owners[1] == "0x0000000000000000000000000000000000000000") {
				_debugMsg = "Failed to add drug stream, drug '" + req.body.otherDrugName + "' is not registered";
				console.log(_debugMsg);
				return Promise.reject();
			}
			else {
				if(req.body.stream == "up") {
					upstreamDrug = req.body.otherDrugName;
					downstreamDrug = req.body.drugName;
				}
				else {
					upstreamDrug = req.body.drugName;
					downstreamDrug = req.body.otherDrugName;
				}
				return funcDrugSupplyChainRecord.addDrugStream(contractDrugSupplyChainRecord, req.body.owner, upstreamDrug, downstreamDrug, req.body.amount);
			}
		}).then(function() {
			console.log("Request to add drug stream processed, drug: " + req.body.drugName);
			res.redirect('/getDrugByName?name=' + req.body.drugName);
			return Promise.resolve();
		}).catch(function(exception) {
			if(_debugMsg.length == 0) {
				_debugMsg = "Failed to add drug stream";
			}
			console.log(_debugMsg);
			res.render('addDrugStream', {title: _title, isAuthorized: isAdmin, owner: req.body.owner, drugName: req.body.drugName, upOrDownStream: req.body.stream, debugMsg: _debugMsg});
		})
	}
});

module.exports = router;
