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
		res.render('index', {title: _title, isAuthorized: true, drugManufacturerList: drugManufacturers, debugMsg: _debugMsg});
		// res.redirect('/');
	}).catch(function(exception) {
		console.log("Error while deploying contract and adding initial participants");
		_debugMsg = "Contract initiation failed";
		res.render('index', {title: _title, isAuthorized: true, drugManufacturerList: drugManufacturers, debugMsg: _debugMsg});
	});
});



/* GET home page */
router.get('/', function(req, res) {
	var _debugMsg = "";

	if(contractDrugSupplyChainRecord == undefined) {
		_debugMsg = "Contract not yet deployed!";
	}
	res.render('index', {title: _title, isAuthorized: true, drugManufacturerList: drugManufacturers, debugMsg: _debugMsg});
});

/* GET manufacturer detail */
router.get('/getDrugsByManufacturer', function(req, res) {
	var _debugMsg = "";
	if(contractDrugSupplyChainRecord == undefined) {
		_debugMsg = "Contract not yet deployed!";
		res.render('index', {title: _title, isAuthorized: true, drugManufacturerList: drugManufacturers, debugMsg: _debugMsg});
	}
	else {
		console.log("Manufacturer detail inquery received, manufacturer: " + req.query.addr);
		funcDrugSupplyChainRecord.getDrugsAmountByOwner(contractDrugSupplyChainRecord, authority, req.query.addr).then(function(amount){
			if(amount.toString() == 0) {
				console.log("Manufacturer detail inquery processed, drug list owned by this manufacturer: []");
				res.render('manufacturer', {title: _title, isAuthorized: true, drugManufacturerList: drugManufacturers, drugList: [], debugMsg: _debugMsg});
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
 			res.render('manufacturer', {title: _title, isAuthorized: true, drugManufacturerList: drugManufacturers, drugList: _drugList, debugMsg: _debugMsg});
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
		res.render('index', {title: _title, isAuthorized: true, drugManufacturerList: drugManufacturers, drug: drugDetail, upstreamDrugList: _upstreamDrugList, downstreamDrugList: _downstreamDrugList, debugMsg: _debugMsg});
	}
	else {
		console.log("Drug detail inquery received, drug name: " + req.query.name);
		drugDetail = {"name": req.query.name};
		funcDrugSupplyChainRecord.getDrugOwner(contractDrugSupplyChainRecord, authority, req.query.name).then(function(owner){
			drugDetail["owner"] = owner;
			if(owner == "0x0000000000000000000000000000000000000000") {
				_debugMsg = "Drug '" + req.query.name + "' not found.";
				console.log(_debugMsg);
				res.render('drug', {title: _title, isAuthorized: true, drugManufacturerList: drugManufacturers, drug: drugDetail, upstreamDrugList: _upstreamDrugList, downstreamDrugList: _downstreamDrugList, debugMsg: _debugMsg});
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
			console.log("Drug detail inquery processed, drug detail: " + drugDetail);
 			res.render('drug', {title: _title, isAuthorized: true, drugManufacturerList: drugManufacturers, drug: drugDetail, upstreamDrugList: _upstreamDrugList, downstreamDrugList: _downstreamDrugList, debugMsg: _debugMsg});
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
		res.render('index', {title: _title, isAuthorized: true, drugManufacturerList: drugManufacturers, debugMsg: _debugMsg});
	}
	else {
		res.render('newDrug', {title: _title, isAuthorized: true, drugManufacturerList: drugManufacturers, debugMsg: _debugMsg});
	}
});

/* POST new drug */
router.post('/addNewDrug', function(req, res) {
	var _debugMsg = "";
	if(contractDrugSupplyChainRecord == undefined) {
		_debugMsg = "Contract not yet deployed!";
		res.render('index', {title: _title, isAuthorized: true, drugManufacturerList: drugManufacturers, debugMsg: _debugMsg});
	}
	else {
		console.log("Receive a request to add new drug: " + req.body.name);
		funcDrugSupplyChainRecord.getDrugOwner(contractDrugSupplyChainRecord, authority, req.query.name).then(function(owner){
			if(owner != "0x0000000000000000000000000000000000000000") {
				_debugMsg = "Drug has already been registered!";
				res.render('newDrug', {title: _title, isAuthorized: true, drugManufacturerList: drugManufacturers, debugMsg: _debugMsg});
			}
			else {
				return funcDrugSupplyChainRecord.addNewDrug(contractDrugSupplyChainRecord, req.body.owner, req.body.name, req.body.manuDate, req.body.expDate, req.body.amount);
			}
		}).catch(function(exception){
			_debugMsg = "Failed to add new drug";
			res.render('newDrug', {title: _title, isAuthorized: true, drugManufacturerList: drugManufacturers, debugMsg: _debugMsg});
		}).then(function() {
			return funcDrugSupplyChainRecord.getDrugDetail(contractDrugSupplyChainRecord, authority, req.body.name);
		}).then(function(_drugDetail){
			console.log("Request to add new drug processed, drug name: " + req.body.name);
			res.redirect("/getDrugByName?name=" + req.body.name);
 			// res.render('drug', {title: _title, isAuthorized: true, drugManufacturerList: drugManufacturers, drug: drugDetail, debugMsg: _debugMsg});
		}).catch(function(exception){
			_debugMsg = "Failed to add new drug";
			res.render('newDrug', {title: _title, isAuthorized: true, drugManufacturerList: drugManufacturers, debugMsg: _debugMsg});
		});
	}
});

module.exports = router;
