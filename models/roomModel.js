const mongoose = require('mongoose');
const { stringify } = require('querystring');
const Schema = mongoose.Schema;

mongoose.Promise = require('bluebird');

// NEEDS UPDATING FOR ROOM ATTRIBUTES
const roomSchema = new Schema({
	creator: {
		type: String,
		trim: true,
	},
	title: {
		type: String,
		trim: true,
	},
	price: {
		type: Number,
		default: 0,
	},
	description: {
		type: String,
		trim: true,
	},
	details: {
		type: String,
		trim: true,
	},
	location: {
		type: String,
		trim: true,
	},
	propertyType: {
		type: String,
		trim: true,
	},
	photoFileNames: [
		{
			type: String,
			trim: true,
			unique: true,
		},
	],
	guestsNum: {
		type: Number,
		default: 0,
	},
	bedroomsNum: {
		type: Number,
		default: 0,
	},
	bedsNum: {
		type: Number,
		default: 0,
	},
	bathsNum: {
		type: Number,
		default: 0,
	},
});

module.exports = mongoose.model('rooms', roomSchema);
