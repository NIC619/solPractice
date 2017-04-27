var fs = require('fs');
var mongoose = require('mongoose');
var pollRecords = mongoose.model('pollRecord');
var express = require('express');
var router = express.Router();
var Web3 = require('Web3');
var web3 = new Web3();

/* web3 set up */
if(!web3.currentProvider)
	web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));
var indexContractAddr = '';
var indexContractABI = JSON.parse( fs.readFileSync('../backend/compile/Index.abi', 'utf-8') );

/* GET home page. */
router.get('/', function(req, res) {
	pollRecords.find(function(err, _pollRecordList) {
		// web3.eth.getAccounts(function(err, _accounts){
		// 	console.log(_accounts);
		// });
		res.render('layout_body', {title: 'Pollblic', pollRecordList: _pollRecordList});
	});
});

router.get('/surroundingLocations', function(req, res){
	var surroundingList = [];
	//console.log("lat: " + req.query.lat + ", lng: " + req.query.lng);
	//console.log("" + (req.query.lng -1.5) + "," + (req.query.lng+1.5));
	
	markers.find(
			{ 
				lat : { 
					$gt : (req.query.lat - req.query.latDis/2),
					$lt : (+req.query.lat + req.query.latDis/2)
				}, 
				lng : { 
					$gt : (req.query.lng - req.query.lngDis/2),
					$lt : (+req.query.lng + req.query.lngDis/2)
				} 
			}, function(err, list){
				//console.log(list);
				res.send(list);
	});
});

router.get('/search', function(req, res) {
	if( req.query.title && req.query.owner ) {
		pollRecords.find({ title: req.query.title , owner: req.query.owner }, function( err, searchResults ) {
			if( searchResults === undefined ) {
				res.render( 'layout_body', { title: 'Pollblic', pollRecordList: [] });
			}
			else {
				res.render( 'layout_body', { title: 'Pollblic', pollRecordList: _pollRecordList });
			}
		});
	}
	else if ( req.query.title ) {
		pollRecords.find({ title: req.query.title }, function( err, searchResults ) {
			if( searchResults === undefined ) {
				res.render( 'layout_body', { title: 'Pollblic', pollRecordList: [] });
			}
			else {
				res.render( 'layout_body', { title: 'Pollblic', pollRecordList: _pollRecordList });
			}
		});
	}
	else if ( req.query.owner ) {
		pollRecords.find({ owner: req.query.owner }, function( err, searchResults ) {
			if( searchResults === undefined ) {
				res.render( 'layout_body', { title: 'Pollblic', pollRecordList: [] });
			}
			else {
				res.render( 'layout_body', { title: 'Pollblic', pollRecordList: _pollRecordList });
			}
		});
	}
	else{
		res.render('layout_body', {title: 'Pollblic', pollRecordList: []});
	}
});

router.get('/reportRecords', function(req, res) {
	reportRecords.find(function(err, _reportRecordList){
		// console.log(_reportRecordList);
		res.render('layoutReportRecord', {title: 'OverHere', reportRecordList: _reportRecordList});
	});
});

router.post('/newLocation', function(req, res) {
	var newMarker = new markers();
	//console.log(req.body.name);
	if(req.body.lat == undefined || req.body.lng == undefined) {
		res.send("Please specify a location");
		return;
	}
	markers.find({ lat: req.body.lat, lng: req.body.lng }, function(err, doc){
		if(doc===undefined) {
			res.send("Location already registered")
			return;
		}
	});
	if(req.files.length == 0) {
			res.send("No Files");
			return;
	}
	var _photoIDs = [];
	for (i in req.files) {
		_photoIDs.push(req.files[i].filename);
	}
	
	newMarker.lat = req.body.lat;
	newMarker.lng = req.body.lng;
	newMarker.names = [req.body.name];
	newMarker.title = req.body.title;
	newMarker.dir = req.body.dir;
	newMarker.photoIDs = _photoIDs;
	newMarker.save();
	res.send("Success");
});


module.exports = router;
