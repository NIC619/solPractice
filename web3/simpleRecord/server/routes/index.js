var fs = require('fs');
var express = require('express');
var router = express.Router();
var Web3 = require('Web3');
var web3 = new Web3();

var _title = "Simple Record";

/* web3 set up */
if(!web3.currentProvider)
	web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));

var simpleRecordABI = JSON.parse( fs.readFileSync('../compile/simpleRecord.abi', 'utf-8') );
var simpleRecordBytecode = fs.readFileSync('../compile/simpleRecord.bytecode', 'utf-8');
var deployContract = require("../../functions/deploySimpleRecord.js");
var funcSimpleRecord = require("../../functions/funcSimpleRecord.js");
var simpleRecordContract;
var authority = web3.eth.accounts[0];
var authorities = [web3.eth.accounts[1]];
var patients = [web3.eth.accounts[2], web3.eth.accounts[3], web3.eth.accounts[4]];

var _candidateNameList = ["Alice", "Bob", "Carol"];

/* DEVELOPEMENT FUNCTIONS */
router.get('/deploy', function(req, res) {
	//deploy contract
	
	deployContract.deploy(web3, simpleRecordABI, simpleRecordBytecode, authorities, authority, function(instance){
		simpleRecordContract = instance;
		res.redirect('/');
	});
});



/* GET home page */
router.get('/', function(req, res) {
	var _patientDataList = [];
	var _debugMsg = "";
	if(simpleRecordContract != undefined) {
		for(var i = 0; i < authorities.length; i++) {
			console.log("Authority " + authorities[i] + " qualified? " + simpleRecordContract.isAuthorities(authorities[i]));
		}
	}
	else {
		_debugMsg = "Contract not yet deployed!";
	}
	res.render('index', {title: _title, patientDataList: _patientDataList, debugMsg: _debugMsg});
});

/* GET new patient data */
router.get('/newRecord', function(req, res) {
	var _debugMsg = "";
	if(simpleRecordContract == undefined) {
		_debugMsg = "Contract not yet deployed!";
		res.render('index', {title: _title, patientDataList: [], debugMsg: _debugMsg});
	}
	else {
		res.render('newRecord', {title: _title, patientDataList: [], debugMsg: _debugMsg});
	}
});

/* POST new patient data */
router.post('/newRecord', function(req, res) {
	console.log("new Record for " + req.body.addr);
	simpleRecordContract.newPatientData(req.body.addr, req.body.name, req.body.sex, req.body.age, req.body.bdate,
										req.body.mednumber, req.body.id, req.body.record, req.body.status, req.body.content,
										{from: authority, gas: 1000000}, function(err, txid){
		if(err) {
			console.log("Error in newPatientData");
			res.render('index', {title: _title, patientDataList: [], debugMsg: "Error adding record!"});
		}
		else {
			var patientData = {};
			patientData["addr"] = req.body.addr;
			patientData["name"] = req.body.name;
			patientData["sex"] = req.body.sex;
			patientData["age"] = req.body.age;
			patientData["bdate"] = req.body.bdate;
			patientData["mednumber"] = req.body.mednumber;
			patientData["id"] = req.body.id;
			patientData["record"] = req.body.record;
			patientData["status"] = req.body.status;
			patientData["content"] = req.body.content;
			console.log("add new patient data success: " + JSON.stringify(patientData, null, 4));
	
			res.render('index', {title: _title, patientDataList: [patientData], debugMsg: ""});
		}
	});
	
});

/* GET modify patient data*/
router.get('/modify', function(req, res) {
	var _debugMsg = ""
	if(simpleRecordContract === undefined) {
		_debugMsg = "Contract not yet deployed!";
		res.render('index', {title: _title, patientDataList: [], debugMsg: _debugMsg});
		return;
	}
	var patientData = {};
	patientData["addr"] = req.query.addr;
	patientData["name"] = simpleRecordContract.getName(req.query.addr);
	patientData["sex"] = simpleRecordContract.getSex(req.query.addr);
	patientData["age"] = simpleRecordContract.getAge(req.query.addr).toString();
	patientData["bdate"] = simpleRecordContract.getBirthdate(req.query.addr);
	patientData["mednumber"] = simpleRecordContract.getMednumber(req.query.addr);
	patientData["id"] = simpleRecordContract.getId(req.query.addr);
	patientData["record"] = simpleRecordContract.getRecord(req.query.addr).toString();
	patientData["status"] = simpleRecordContract.getStatus(req.query.addr);
	simpleRecordContract.getContent(req.query.addr, function(err, content){
		if(err) {
			_debugMsg = "Error in reading patient data";
			console.log(_debugMsg);
			res.render('modify', {title: _title, patientDataList: [], debugMsg: _debugMsg});
		}
		else {
			if(content) {
				patientData["content"] = content
				console.log("complete reading patient data: " + JSON.stringify(patientData, null, 4));
				res.render('modify', {title: _title, patientDataList: [patientData], debugMsg: ""});
			}
		}
	});
});

/* POST modify patient data*/
router.post('/modify', function(req, res) {
	console.log("modify Record for " + req.body.addr);
	var _debugMsg = "";
	funcSimpleRecord.getName(simpleRecordContract, authority, req.body.addr).then(function(name){
		if(name !== req.body.name) {
			console.log("change patient name from " + name + " to " + req.body.name);
			funcSimpleRecord.modifyName(simpleRecordContract, authority, req.body.addr, req.body.name).catch(function(){});
		}
		return funcSimpleRecord.getSex(simpleRecordContract, authority, req.body.addr);
	}).then(function(sex){
		if(sex !== req.body.sex) {
			console.log("change patient sex from " + sex + " to " + req.body.sex);
			funcSimpleRecord.modifySex(simpleRecordContract, authority, req.body.addr, req.body.sex).catch(function(){});
		}
	// 	return funcSimpleRecord.getAge(simpleRecordContract, authority, req.body.addr);
	// }).then(function(age){
		res.redirect('/');
	}).catch(function(exception){
		console.log(exception);
		_debugMsg = "Error modifying patient data";
		res.render('modify', {title: _title, patientDataList: [], debugMsg: _debugMsg});
	})
});

/* GET patient data*/
router.get('/query', function(req, res) {
	if(req.query.type == "name") {
		simpleRecordContract.getName(req.query.addr, function(err, name){
			if(err) {
				res.send("ERROR");
			}
			else {
				if(name) {
					res.send(name)
				}
			}
		});
	}
	else if(req.query.sex == "sex") {
		simpleRecordContract.getSex(req.query.addr, function(err, sex){
			if(err) {
				res.send("ERROR");
			}
			else {
				if(sex) {
					res.send(sex)
				}
			}
		});
	}
	else if(req.query.age == "age") {
		simpleRecordContract.getAge(req.query.addr, function(err, age){
			if(err) {
				res.send("ERROR");
			}
			else {
				if(age) {
					res.send(age)
				}
			}
		});
	}
});





module.exports = router;
