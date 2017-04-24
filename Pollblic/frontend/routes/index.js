var mongoose = require('mongoose');
var markers = mongoose.model('markerGeo');
var reportRecords = mongoose.model('reportRecord');
var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({
	dest: 	'./public/gallery',
	limits: {	fileSize:	5242880},
	fileFilter: function(req, file, cb) {
		var type = file.mimetype;
		//console.log(type);
		var typeArray = type.split("/");
		if (typeArray[0] == "image") {
			cb(null, true);
		}else {
			cb(null, false);
  }
	}
})

/* GET home page. */
router.get('/', function(req, res) {
	res.render('layout_body', {title: 'OverHere'});
});

router.get('/delete', function(req, res) {
	markers.find().remove().exec();
	res.redirect('http://localhost:14741');
})

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

router.get('/allLocations', function(req,res) {
	var location_list = [];
	markers.find(function(err,marker_list){
		//console.log(marker_list);
		console.log(marker_list.length);
		for (i in marker_list){
			location_list.push(marker_list[i]);
		}
		//console.log(location_list);
		res.send(location_list);
	});
	
});
/*
router.get('/newLocation', function(req,res) {
	var newMarker = new markers();
	//console.log('name: ' + req.query.name);
	newMarker.lat = req.query.lat;
	newMarker.lng = req.query.lng;
	newMarker.names = req.query.name;
	newMarker.title = req.query.title;
	newMarker.save();
	res.send("complete");
});
*/
router.get('/searchByTitle', function(req, res) {
	// console.log(req.query.title);
	markers.find({ title: req.query.title}, function(err, searchResults){
		if(doc===undefined) {
			res.send([]);
		}
		else {
			res.send(searchResults);
		}
	});
});

router.get('/reportRecords', function(req, res) {
	reportRecords.find(function(err, _reportRecordList){
		// console.log(_reportRecordList);
		res.render('layoutReportRecord', {title: 'OverHere', reportRecordList: _reportRecordList});
	});
});

router.post('/reportPhoto', function(req, res) {
	console.log("Photo ID: " + req.body.photoID + " reported.");
	console.log("with reason: " + req.body.reason);
	var newReportRecord = new reportRecords();
	newReportRecord.photoID = req.body.photoID;
	newReportRecord.reason = req.body.reason;
	newReportRecord.save();
	res.send("Successful Report");
});

router.post('/newLocation', upload.array('img', 3) , function(req, res) {
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

router.post('/newPhoto', upload.array('img', 3) , function(req, res) {
	if(req.body.id == undefined) {
		res.send("Please specify a registered location for uploading");
		return;
	}
	markers.findById( req.body.id ,function(err, doc){
		//console.log(doc);
		if(req.files.length == 0) {
			res.send("No Files");
			return;
		}
		var _photoIDs = doc.photoIDs;
		for (i in req.files) {
			_photoIDs.push(req.files[i].filename);
		}
		if(doc.names.indexOf(req.body.name) == -1) {
			doc.names.push(req.body.name);
		}
		doc.save();
		res.send("Success");
	});
	
});


module.exports = router;
