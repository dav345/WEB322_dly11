const mongoose = require('mongoose');
const { stringify } = require('querystring');
const Schema = mongoose.Schema;

mongoose.Promise = require('bluebird');

const userSchema = new Schema({
	username: {
		type: String,
		unique: true,
		lowercase: true,
		trim: true,
	},

	password: String,

	email: {
		type: String,
		unique: true,
		lowercase: true,
		trim: true,
	},

	firstName: {
		type: String,
		trim: true,
	},

	lastName: {
		type: String,
		trim: true,
	},

	/*	birthdate: {
		type: Date,
		trim: true,
	},	*/

	isAdmin: Boolean,
});

module.exports = mongoose.model('users', userSchema);
