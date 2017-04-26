var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var pollRecord = new Schema({
	id: String,
	title: String,
	address: String,
	owner: String,
	price: Number,
	totalNeeded: Number
});

mongoose.model('pollRecord', pollRecord);
mongoose.connect('mongodb://localhost/PollblicDatabase');