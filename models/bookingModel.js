const mongoose = require('mongoose');
const { stringify } = require('querystring');
const Schema = mongoose.Schema;

mongoose.Promise = require('bluebird');

// NEEDS UPDATING FOR ROOM ATTRIBUTES
const bookingSchema = new Schema({
	userID: {
		type: String,
		trim: true,
	},
	roomID: {
		type: String,
		trim: true,
	},
	startDate: {
		type: Date,
		default: 0,
	},
	endDate: {
		type: Date,
		trim: true,
	},
	guestsAmount: {
		type: Number,
		default: 0,
	},
	amountPaid: {
		type: Number,
		default: 0,
	},
});

module.exports = mongoose.model('booking', bookingSchema);
