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

/* GET new patient data */
router.get('/newRecord', function(req, res) {
	var _debugMsg = "";
	if(contractDrugSupplyChainRecord == undefined) {
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
	contractDrugSupplyChainRecord.newPatientData(req.body.addr, req.body.name, req.body.sex, req.body.age, req.body.bdate,
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
// router.get('/modify', function(req, res) {
// 	var _debugMsg = ""
// 	if(contractDrugSupplyChainRecord === undefined) {
// 		_debugMsg = "Contract not yet deployed!";
// 		res.render('index', {title: _title, patientDataList: [], debugMsg: _debugMsg});
// 		return;
// 	}
// 	var patientData = {};
// 	patientData["addr"] = req.query.addr;
// 	patientData["name"] = contractDrugSupplyChainRecord.getName(req.query.addr);
// 	patientData["sex"] = contractDrugSupplyChainRecord.getSex(req.query.addr);
// 	patientData["age"] = contractDrugSupplyChainRecord.getAge(req.query.addr).toString();
// 	patientData["bdate"] = contractDrugSupplyChainRecord.getBirthdate(req.query.addr);
// 	patientData["mednumber"] = contractDrugSupplyChainRecord.getMednumber(req.query.addr);
// 	patientData["id"] = contractDrugSupplyChainRecord.getId(req.query.addr);
// 	patientData["record"] = contractDrugSupplyChainRecord.getRecord(req.query.addr).toString();
// 	patientData["status"] = contractDrugSupplyChainRecord.getStatus(req.query.addr);
// 	contractDrugSupplyChainRecord.getContent(req.query.addr, function(err, content){
// 		if(err) {
// 			_debugMsg = "Error in reading patient data";
// 			console.log(_debugMsg);
// 			res.render('modify', {title: _title, patientDataList: [], debugMsg: _debugMsg});
// 		}
// 		else {
// 			if(content) {
// 				patientData["content"] = content
// 				console.log("complete reading patient data: " + JSON.stringify(patientData, null, 4));
// 				res.render('modify', {title: _title, patientDataList: [patientData], debugMsg: ""});
// 			}
// 		}
// 	});
// });

/* POST modify patient data*/
router.post('/modify', function(req, res) {
	console.log("modify Record for " + req.body.addr);
	var _debugMsg = "";
	var newPatientData = {};
	newPatientData["addr"] = req.body.addr;
	newPatientData["name"] = req.body.name;
	newPatientData["sex"] = req.body.sex;
	newPatientData["age"] = req.body.age;
	newPatientData["bdate"] = req.body.bdate;
	newPatientData["mednumber"] = req.body.mednumber;
	newPatientData["id"] = req.body.id;
	newPatientData["record"] = req.body.record;
	newPatientData["status"] = req.body.status;
	newPatientData["content"] = req.body.content;

	var oldPatientData = {};
	oldPatientData["addr"] = req.body.addr;
	oldPatientData["name"] = req.body.oldname;
	oldPatientData["sex"] = req.body.oldsex;
	oldPatientData["age"] = req.body.oldage;
	oldPatientData["bdate"] = req.body.oldbdate;
	oldPatientData["mednumber"] = req.body.oldmednumber;
	oldPatientData["id"] = req.body.oldid;
	oldPatientData["record"] = req.body.oldrecord;
	oldPatientData["status"] = req.body.oldstatus;
	oldPatientData["content"] = req.body.oldcontent;
	var patientData = {};

	Promise.resolve().then(function(){
		if(oldPatientData.name != newPatientData.name) {
			return funcDrugSupplyChainRecord.modifyName(contractDrugSupplyChainRecord, authority, req.body.addr, newPatientData.name);
		}
		else {
			return Promise.resolve();
		}
	}).then(function(){
		oldPatientData.name = newPatientData.name;
		if(oldPatientData.sex != newPatientData.sex) {
			return funcDrugSupplyChainRecord.modifySex(contractDrugSupplyChainRecord, authority, req.body.addr, newPatientData.sex);
		}
		else {
			return Promise.resolve();
		}
	}).then(function(){
		oldPatientData.sex = newPatientData.sex;
		if(oldPatientData.age != newPatientData.age) {
			return funcDrugSupplyChainRecord.modifyAge(contractDrugSupplyChainRecord, authority, req.body.addr, newPatientData.age);
		}
		else {
			return Promise.resolve();
		}
	}).then(function(){
		oldPatientData.age = newPatientData.age;
		if(oldPatientData.bdate != newPatientData.bdate) {
			return funcDrugSupplyChainRecord.modifyBirthdate(contractDrugSupplyChainRecord, authority, req.body.addr, newPatientData.bdate);
		}
		else {
			return Promise.resolve();
		}
	}).then(function(){
		oldPatientData.bdate = newPatientData.bdate;
		if(oldPatientData.mednumber != newPatientData.mednumber) {
			return funcDrugSupplyChainRecord.modifyMednumber(contractDrugSupplyChainRecord, authority, req.body.addr, newPatientData.mednumber);
		}
		else {
			return Promise.resolve();
		}
	}).then(function(){
		oldPatientData.mednumber = newPatientData.mednumber;
		if(oldPatientData.id != newPatientData.id) {
			return funcDrugSupplyChainRecord.modifyId(contractDrugSupplyChainRecord, authority, req.body.addr, newPatientData.id);
		}
		else {
			return Promise.resolve();
		}
	}).then(function(){
		oldPatientData.id = newPatientData.id;
		if(oldPatientData.record != newPatientData.record) {
			return funcDrugSupplyChainRecord.modifyRecord(contractDrugSupplyChainRecord, authority, req.body.addr, newPatientData.record);
		}
		else {
			return Promise.resolve();
		}
	}).then(function(){
		oldPatientData.record = newPatientData.record;
		if(oldPatientData.status != newPatientData.status) {
			return funcDrugSupplyChainRecord.modifyStatus(contractDrugSupplyChainRecord, authority, req.body.addr, newPatientData.status);
		}
		else {
			return Promise.resolve();
		}
	}).then(function(){
		oldPatientData.status = newPatientData.status;
		if(oldPatientData.content != newPatientData.content) {
			return funcDrugSupplyChainRecord.modifyContent(contractDrugSupplyChainRecord, authority, req.body.addr, newPatientData.content);
		}
		else {
			return Promise.resolve();
		}
	}).then(function(){
		oldPatientData.content = newPatientData.content;
		res.render('modify', {title: _title, patientDataList: [oldPatientData], debugMsg: _debugMsg});
	}).catch(function(exception){
		console.log(exception);
		_debugMsg = "Error modifying patient data";
		res.render('modify', {title: _title, patientDataList: [oldPatientData], debugMsg: _debugMsg});
	})
});

/* GET patient data by address */
router.get('/getPatientDataByAddr', function(req, res) {
	var _debugMsg = ""
	if(contractDrugSupplyChainRecord === undefined) {
		_debugMsg = "Contract not yet deployed!";
		res.render('index', {title: _title, patientDataList: [], debugMsg: _debugMsg});
		return;
	}
	var patientData = {};
	patientData["addr"] = req.query.addr;
	funcDrugSupplyChainRecord.getAge(contractDrugSupplyChainRecord, authority, req.query.addr).then(function(age){
		patientData["age"] = age.toString();
		return funcDrugSupplyChainRecord.getSex(contractDrugSupplyChainRecord, authority, req.query.addr);
	}).then(function(sex){
		patientData["sex"] = sex;
		return funcDrugSupplyChainRecord.getName(contractDrugSupplyChainRecord, authority, req.query.addr);
	}).then(function(name){
		patientData["name"] = name;
		return funcDrugSupplyChainRecord.getBirthdate(contractDrugSupplyChainRecord, authority, req.query.addr);
	}).then(function(bdate){
		patientData["bdate"] = bdate;
		return funcDrugSupplyChainRecord.getMednumber(contractDrugSupplyChainRecord, authority, req.query.addr);
	}).then(function(mednumber){
		patientData["mednumber"] = mednumber;
		return funcDrugSupplyChainRecord.getId(contractDrugSupplyChainRecord, authority, req.query.addr);
	}).then(function(id){
		patientData["id"] = id;
		return funcDrugSupplyChainRecord.getRecord(contractDrugSupplyChainRecord, authority, req.query.addr);
	}).then(function(record){
		patientData["record"] = record.toString();
		return funcDrugSupplyChainRecord.getStatus(contractDrugSupplyChainRecord, authority, req.query.addr);
	}).then(function(status){
		patientData["status"] = status;
		return funcDrugSupplyChainRecord.getContent(contractDrugSupplyChainRecord, authority, req.query.addr);
	}).then(function(content){
		patientData["content"] = content;
		res.render('modify', {title: _title, patientDataList: [patientData], debugMsg: _debugMsg});
	}).catch(function(exception){
		console.log(exception);
		_debugMsg = "Error fetching patient data or data not exist";
		res.render('index', {title: _title, patientDataList: [], debugMsg: _debugMsg});
	})
})

/* GET patient data by attributes*/
// router.get('/query', function(req, res) {
// 	if(req.query.type == "name") {
// 		contractDrugSupplyChainRecord.getName(req.query.addr, function(err, name){
// 			if(err) {
// 				res.send("ERROR");
// 			}
// 			else {
// 				if(name) {
// 					res.send(name)
// 				}
// 			}
// 		});
// 	}
// 	else if(req.query.sex == "sex") {
// 		contractDrugSupplyChainRecord.getSex(req.query.addr, function(err, sex){
// 			if(err) {
// 				res.send("ERROR");
// 			}
// 			else {
// 				if(sex) {
// 					res.send(sex)
// 				}
// 			}
// 		});
// 	}
// 	else if(req.query.age == "age") {
// 		contractDrugSupplyChainRecord.getAge(req.query.addr, function(err, age){
// 			if(err) {
// 				res.send("ERROR");
// 			}
// 			else {
// 				if(age) {
// 					res.send(age)
// 				}
// 			}
// 		});
// 	}
// });





module.exports = router;
