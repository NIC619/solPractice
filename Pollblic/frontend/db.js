var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var markerGeo = new Schema({
	lat: Number,
	lng: Number,
	names: [String],
	title: String,
	dir: String,
	photoIDs: [String]
});
var reportRecord = new Schema({
	photoID: String,
	reason: String
})

mongoose.model('markerGeo', markerGeo);
mongoose.model('reportRecord', reportRecord);
mongoose.connect('mongodb://localhost/OverHereDatabase');