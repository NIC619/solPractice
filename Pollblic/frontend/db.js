var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var pollRecord = new Schema({
	ifOpen: Boolean,
	id: String,
	title: String,
	duration: Number,
	address: String,
	owner: String,
	price: Number,
	totalNeeded: Number,
	numberOfQuestion: Number,
	paymentLockTime: Number,
	ifEncrypt: Boolean,
	encryptionKey: String
});

mongoose.model('pollRecord', pollRecord);
mongoose.connect('mongodb://localhost/PollblicDatabase');