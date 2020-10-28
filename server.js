/*
======================================================
Assignment 2 - Responsive, Handlebars, Forms Processing and Email
Course:			WEB 322
Author:			David Ly
Email:			dly11@myseneca.ca
Date:			2020-10-28
======================================================
*/

// MODULES - REQUIRED
var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
// var multer = require('multer');
var nodemailer = require('nodemailer');
const hbs = require('express-handlebars');

// MODULES - INITIALIZATION
var HTTP_PORT = process.env.PORT || 8080;

// 'body-parser' related
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false });

// 'multer' related
// const STORAGE = multer.diskStorage({
// 	destination: './public/photos/',
// 	filename: function name(req, file, cb) {
// 		cb(null, Date.now() + path.extname(file.originalname));
// 	},
// });

// const UPLOAD = multer({ storage: STORAGE });

// 'nodemailer' related
var transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: 'webx22.dly11.testacct@gmail.com',
		pass: 'WEB422Web322web222',
	},
});

// 'express-handlebars' related
app.engine(
	'.hbs',
	hbs({
		extname: '.hbs',
		defaultLayout: 'main',
	})
);

app.set('view engine', '.hbs');

// FUNCTIONS - START-UP
function onHttpStart() {
	console.log('Express http server listening on: ' + HTTP_PORT);
}

// CURRENT USER OBJ
var currentUser = {
	fName: '',
};

// ROUTES - USE
app.use(express.static('static'));
app.use(express.static('views'));
app.use(express.static('public'));

// ROUTES - GET
app.get('/', (req, res) => {
	res.redirect('/home');
});
app.get('/user-registration', (req, res) => {
	res.redirect('/home#signUpModal');
});
app.get('/home', (req, res) => {
	res.render('home', { data: currentUser });
});
app.get('/search-listings', (req, res) => {
	res.render('search_listings', { data: currentUser });
});
app.get('/bnb-details', (req, res) => {
	res.render('bnb_details', { data: currentUser });
});
app.get('/book-now', (req, res) => {
	if (currentUser.fName) {
		res.render('book_now', { data: currentUser });
	} else {
		res.redirect('/home');
	}
});
app.get('/upload-bnb', (req, res) => {
	if (currentUser.fName) {
		res.render('upload_bnb', { data: currentUser });
	} else {
		res.redirect('/home');
	}
});
app.get('/dashboard', (req, res) => {
	if (currentUser.fName) {
		res.render('dashboard', { data: currentUser });
	} else {
		res.redirect('/home');
	}
});

// ROUTES - POST

app.get('/sign-out-process', urlencodedParser, (req, res) => {
	currentUser.fName = '';

	res.redirect('/home');
});

app.post('/sign-in-process', urlencodedParser, (req, res) => {
	const FORM_DATA = req.body;

	currentUser.fName = FORM_DATA.email;

	res.redirect('back');
});

app.post('/sign-up-process', urlencodedParser, (req, res) => {
	const FORM_DATA = req.body;

	currentUser.fName = FORM_DATA.fName;

	let emailOptions = {
		from: 'webx22.dly11.testacct@gmail.com',
		to: FORM_DATA.email,
		subject: 'Registration Email from EarthBnB (TEST)',
		html:
			'Hello ' +
			FORM_DATA.fName +
			'</p><p>Thank you for registering with EarthBnB!</p>',
	};

	transporter.sendMail(emailOptions, (error, info) => {
		if (error) {
			console.log('ERROR: ' + error);
		} else {
			console.log('SUCCESS: ' + info.response);
		}
	});

	res.redirect('/dashboard');
});

/////////////// CLASS EXAMPLE ///////////////////////////////////
// app.post('/contact-for-process', UPLOAD.single('photo'), (req, res) => {
// 	const FORM_DATA = req.body;
// 	const FILE_DATA = req.file;

// 	const DATA_OUTPUT =
// 		'Your submission was received: <br/><br/>' +
// 		'Your form data was: <br/>' +
// 		JSON.stringify(FORM_DATA) +
// 		'<br/><br/>' +
// 		'Your file data was: <br/>' +
// 		JSON.stringify(FILE_DATA) +
// 		'<br/><br/>' +
// 		'This is the uploaded image: <br/>' +
// 		"<img src='/photos/" +
// 		FILE_DATA.filename +
// 		"'/><br/><br/>" +
// 		'Welcome <strong>' +
// 		FORM_DATA.fname +
// 		' ' +
// 		FORM_DATA.lname +
// 		'</strong> to the world of form processing';
// 	res.send(DATA_OUTPUT);

// 	let emailOptions = {
// 		from: 'webx22.dly11.testacct@gmail.com',
// 		to: FORM_DATA.email,
// 		subject: 'Test email from Node.js using nodemailer',
// 		html:
// 			'Hello ' +
// 			FORM_DATA.fname +
// 			'</p><p>Thank-you for filling out our form.</p>',
// 	};

// 	transporter.sendMail(emailOptions, (error, info) => {
// 		if (error) {
// 			console.log('ERROR: ' + error);
// 		} else {
// 			console.log('SUCCESS: ' + info.response);
// 		}
// 	});
// });

// start the server to listen on HTTP_PORT
app.listen(HTTP_PORT, onHttpStart);
