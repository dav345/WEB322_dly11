/*
======================================================
Assignment 2 - Responsive, Handlebars, Forms Processing and Email
Course:			WEB 322
Author:			David Ly
Email:			dly11@myseneca.ca
Date:			2020-10-28
======================================================
*/

// MODULES - REQUIRES
const dotenv = require('dotenv');
dotenv.config();
console.log(process.env);
//
const express = require('express');
const app = express();
//
const bodyParser = require('body-parser');
//
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const _ = require('underscore');
//
const exphbs = require('express-handlebars');
//
const clientSessions = require('client-sessions');
//
const nodemailer = require('nodemailer');
//
const mongoose = require('mongoose');
//
const bcrypt = require('bcryptjs');

//
// MODULES - CUSTOM
// DB config
const config = require('./js/config');
//
const UserModel = require('./models/userModel');
const RoomModel = require('./models/roomModel'); //
const BookingModel = require('./models/bookingModel'); //
const { response } = require('express');

//
// MODULES - INITIALIZATION
//var justStarted = true;
const PHOTODIRECTORY = './public/photos/';
//
const HTTP_PORT = process.env.PORT || 8080;

// FUNCTIONS

// start-up
function onHttpStart() {
	console.log('Express http server listening on: ' + HTTP_PORT);
}
// check signed-in or not
function checkLogin(req, res, next) {
	if (!req.session.user) {
		req.session.reset();

		req.session.validationErrorsSI =
			'&#x26a0; Unauthorized access, please Sign-In.';
		return res.redirect('/home#signInModal');
	} else {
		next();
	}
}
// CHECK-ADMIN FUNC
function checkAdmin(req, res, next) {
	if (!req.session.user) {
		req.session.reset();

		req.session.validationErrorsSI =
			'&#x26a0; Unauthorized access - please Sign-In as an Admin.';
		return res.redirect('/home#signInModal');
	} else {
		if (!req.session.user.isAdmin) {
			req.session.reset();

			req.session.validationErrorsSI =
				'&#x26a0; Administrators only - please Sign-In as an Admin.';
			return res.redirect('/home#signInModal');
		} else {
			next();
		}
	}
}

// make sure the photos folder exists
// if not create it
if (!fs.existsSync(PHOTODIRECTORY)) {
	fs.mkdirSync(PHOTODIRECTORY);
}

// multer requires a few options to be setup to store files with file extensions
// by default it won't store extensions for security reasons
const storage = multer.diskStorage({
	destination: PHOTODIRECTORY,
	filename: (req, file, cb) => {
		cb(
			null,
			req.session.user.username +
				'_' +
				Date.now() +
				'_' +
				Math.floor(Math.random() * 9999 + 1) +
				path.extname(file.originalname)
		);
	},
});

// tell multer to use the diskStorage function for naming files instead of the default.
const upload = multer({ storage: storage });

// 'express-handlebars' related
app.engine(
	'.hbs',
	exphbs({
		extname: '.hbs',
		defaultLayout: 'main',
	})
);
app.set('view engine', '.hbs');

// APP USEs

app.use(express.static('./views/'));
app.use(express.static('./public/'));

// 'client-sessions' cookies related
app.use(
	clientSessions({
		cookieName: 'session',
		secret: 'web322_asgn345',
		duration: 60 * 60 * 1000,
		activeDuration: 30 * 60 * 1000,
	})
);

// 'mongoose' related
mongoose.connect(config.dbconn, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useCreateIndex: true,
});
// log when the DB is connected
mongoose.connection.on('open', () => {
	console.log('Database connection open.');
});

// 'nodemailer' related
var transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: process.env.EMAILER_ADDR,
		pass: process.env.EMAILER_PASS,
	},
});

// 'body-parser' RELATED
app.use(bodyParser.urlencoded({ extended: false }));

//////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////

// ////////////////// ROUTES - GET ///////////////////////////////////

//#region GET-ROUTES
app.get('/', (req, res) => {
	res.redirect('/home');
});

app.get('/user-registration', (req, res) => {
	res.redirect('/home#signUpModal');
});

app.get('/home', (req, res) => {
	// if (justStarted) {
	// 	//req.session.validationErrorsSI = '';
	// 	//req.session.validationErrorsSU = '';
	// 	req.session.reset();

	// 	justStarted = false;
	// }

	res.render('home', {
		validationMsgsSI: req.session.validationErrorsSI,
		validationMsgsSU: req.session.validationErrorsSU,
		user: req.session.user,
	}); // ===== RENDER =====
});

app.get('/search-listings', (req, res) => {
	RoomModel.find()
		.lean()
		.exec()
		.then((rooms) => {
			console.log(rooms);

			res.render('search_listings', {
				validationMsgsSI: req.session.validationErrorsSI,
				validationMsgsSU: req.session.validationErrorsSU,
				user: req.session.user,
				rooms: rooms,
				hasRooms: !!rooms.length,
			}); // ===== RENDER =====
		});
});

app.get('/search-listings/:location', (req, res) => {
	const location = req.params.location;

	const query = {
		location: { $regex: new RegExp(`^${location}$`), $options: 'i' },
	};

	RoomModel.find(query)
		.lean()
		.exec()
		.then((rooms) => {
			console.log(rooms);

			res.render('search_listings', {
				validationMsgsSI: req.session.validationErrorsSI,
				validationMsgsSU: req.session.validationErrorsSU,
				user: req.session.user,
				rooms: rooms,
				hasRooms: !!rooms.length,
			}); // ===== RENDER =====
		});
});

// ///////// TEMP - MOVE TO POST SECT LATER
app.post('/search-listings', (req, res) => {
	const location = req.body.location;

	const query = {
		location: { $regex: new RegExp(`^${location}$`), $options: 'i' },
	};

	RoomModel.find(query)
		.lean()
		.exec()
		.then((rooms) => {
			console.log(rooms);

			res.render('search_listings', {
				validationMsgsSI: req.session.validationErrorsSI,
				validationMsgsSU: req.session.validationErrorsSU,
				user: req.session.user,
				rooms: rooms,
				hasRooms: !!rooms.length,
			}); // ===== RENDER =====
		});
});

app.get('/bnb-details/:roomID', (req, res) => {
	const roomID = req.params.roomID;

	RoomModel.findOne({ _id: roomID })
		.lean()
		.exec()
		.then((room) => {
			console.log(room);

			res.render('bnb_details', {
				validationMsgsSI: req.session.validationErrorsSI,
				validationMsgsSU: req.session.validationErrorsSU,
				user: req.session.user,
				room: room,
			}); // ===== RENDER =====
		});
});

app.get('/bnb-details-exp', (req, res) => {
	res.render('bnb_details_exp', {
		validationMsgsSI: req.session.validationErrorsSI,
		validationMsgsSU: req.session.validationErrorsSU,
		user: req.session.user,
	}); // ===== RENDER =====
});

app.get('/book-now', checkLogin, (req, res) => {
	res.render('book_now', {
		validationMsgsSI: req.session.validationErrorsSI,
		validationMsgsSU: req.session.validationErrorsSU,
		user: req.session.user,
	}); // ===== RENDER =====
});

app.get('/book-now/confirmed', checkLogin, (req, res) => {
	// req.session.tempBooking = {
	// 	user: req.session.user,
	// 	roomID: roomID,
	// 	startDate: startDate,
	// 	endDate: endDate,
	// 	price: price,
	// 	guestsAmount: guestsAmount,
	// 	daysDiff: daysDiff,
	// 	roomCharge: roomCharge,
	// 	guestFee: guestFee,
	// 	guestCharge: guestCharge,
	// 	amountPaid: amountPaid,
	// 	room: room,
	// };

	if (req.session.tempBooking) {
		console.log('req.session.tempBooking found - will continue: ');

		const tempBooking = req.session.tempBooking;

		const NewBooking = new BookingModel({
			userID: req.session.user.userID,
			roomID: tempBooking.roomID,
			startDate: tempBooking.startDate,
			endDate: tempBooking.endDate,
			guestsAmount: tempBooking.guestsAmount,
			amountPaid: tempBooking.amountPaid,
		});

		NewBooking.save()
			.then((response) => {
				console.log('New Booking saved fine.');

				///////////////////////////////////////////////

				// EMAIL the USER
				console.log('Going to email them');
				let emailOptions = {
					from: process.env.EMAILER_ADDR,
					to: req.session.user.email,
					subject: 'Booking Confirmed Email from EarthBnB',
					html: `<h3>Hello ${req.session.user.firstName}!</h3>
						<p>Thank you for booking with us! Here's a copy of your booking details.</p>
						<div class="row d-flex justify-content-center mt-2">
						<div class="card bg-transparent border-0" style="max-width: 540px;">
						  <div class="row no-gutters">
							<div class="col-md-8">
							  <div class="card-body small ">
								<h6 class="card-subtitle mb-2 text-muted font-weight-light "> ${tempBooking.room.propertyType} ·
								  ${tempBooking.room.location} </h6>
								<h5 class="card-title font-weight-light "> ${tempBooking.room.title} </h5>
								<h6 class="card-subtitle mb-2 text-muted font-weight-light "> ${tempBooking.room.bedsNum} bed(s) ·
								  ${tempBooking.room.bathsNum} bath(s) </h6>
							  </div>
							</div>
						  </div>
						</div>
					  </div>
					  <table class="table col-md-8">
						<tbody>
						  <tr>
							<th scope="row">$ ${tempBooking.price} x ${tempBooking.daysDiff} nights</th>
							<td class="text-right">$ ${tempBooking.roomCharge}</td>
						  </tr>
						  <tr>
							<th scope="row">Guest fee ($20 per guest)</th>
							<td class="text-right">$ ${tempBooking.guestCharge}</td>
						  </tr>
						  <tr>
							<th scope="row">Total <span class="small">(CAD)</span></th>
							<td class="font-weight-bold text-right ">$ ${tempBooking.amountPaid}</td>
						  </tr>
						</tbody>
					  </table>`,
				};
				transporter.sendMail(emailOptions, (error, info) => {
					if (error) {
						console.log('ERROR: ' + error);
					} else {
						console.log('SUCCESS: ' + info.response);
					}
				});

				// GOTO DASHBOARD
				return res.redirect('/dashboard');
			})
			.catch((err) => {
				localMessage = 'There was an error saving the booking: ';

				console.log(localMessage + err);

				return res.redirect('/dashboard');
			});
	} else {
		console.log('req.session.tempBooking NOT FOUND - going to home page ');
		return res.redirect('/home');
	}

	// res.render('book_now', {
	// 	validationMsgsSI: req.session.validationErrorsSI,
	// 	validationMsgsSU: req.session.validationErrorsSU,
	// 	user: req.session.user,
	// }); // ===== RENDER =====
});

app.get('/upload-bnb', checkAdmin, (req, res) => {
	res.render('upload_bnb', {
		user: req.session.user,
	}); // ===== RENDER =====
});

app.get('/upload-bnb/edit', checkAdmin, (req, res) => {
	res.redirect('/dashboard/uploaded-rooms');
});

app.get('/upload-bnb/edit/:roomID', checkAdmin, (req, res) => {
	const roomID = req.params.roomID;

	RoomModel.findOne({ _id: roomID })
		.lean()
		.exec()
		.then((room) => {
			res.render('upload_bnb', {
				user: req.session.user,
				room: room,
				hasPhotos: !!room.photoFileNames.length,
				// editMode: true,
			});

			console.log('room.photoFileNames.length: ' + room.photoFileNames.length);
			console.log('room.photoFileNames: ' + room.photoFileNames);
		})
		.catch((err) => {
			localMessage = 'There was an error finding your room to edit';

			console.log(err);

			res.render('upload_bnb', {
				user: req.session.user,
				message: localMessage,
			});
		});
});

app.get('/upload-bnb/delete/:roomID', checkAdmin, (req, res) => {
	const roomID = req.params.roomID;

	RoomModel.findOne({ _id: roomID })
		.lean()
		.exec()
		.then((room) => {
			console.log(
				'Just got into RoomModel.findOne. Doing forEach delete photos next...'
			);

			_.each(room.photoFileNames, (filename) => {
				fs.unlink(PHOTODIRECTORY + filename, (err) => {
					if (err) {
						console.log(err);
						return res.redirect('back');
					}
					console.log('Removed file : ' + filename);
				});
			});

			console.log('forEach delete photos done. RoomModel.deleteOne next...');

			RoomModel.deleteOne({ _id: roomID })
				.then(() => {
					// redirect to home page once the removal is done.
					return res.redirect('back');
				})
				.catch((err) => {
					// if there was an error removing the photo, log it, and redirect.
					console.log('RoomModel.deleteOne err: ' + err);
					return res.redirect('back');
				});
		})
		.catch((err) => {
			localMessage = 'There was an error finding your room to delete: ';

			console.log(localMessage + err);

			return res.redirect('back');
		});
});

app.get('/dashboard', checkLogin, (req, res) => {
	res.render('dashboard', {
		dashboard_home: true,
		user: req.session.user,
	}); // ===== RENDER =====
});
// DASH - UPLOADED ROOMS ============================ RE-USE CODE FOR PUBLIC ROOM SEARCH
app.get('/dashboard/uploaded-rooms', checkAdmin, (req, res) => {
	RoomModel.find()
		.lean()
		.exec()
		.then((rooms) => {
			console.log(rooms);

			res.render('dashboard', {
				dashboard_rooms: true,
				rooms: rooms,
				hasRooms: !!rooms.length,
				user: req.session.user,
			}); // ===== RENDER =====
		});
});

app.get('/dashboard/my-bookings', checkLogin, (req, res) => {
	BookingModel.find({ userID : req.session.user.userID })
		.lean()
		.exec()
		.then((bookings) => {
			console.log(bookings);

			res.render('dashboard', {
				dashboard_bookings: true,
				bookings: bookings,
				hasBookings: !!bookings.length,
				user: req.session.user,
			}); // ===== RENDER =====
		});
});

app.get('/sign-out-process', (req, res) => {
	req.session.reset();

	res.redirect('/home');
});
//#endregion

// ////////////////// ROUTES - POST ///////////////////////////////////

app.post('/book-now', checkLogin, (req, res) => {
	//const userID = req.session.user.uid;
	const roomID = req.body.roomID;
	const startDate = req.body.checkIn;
	const endDate = req.body.checkOut;
	const price = req.body.price;
	const guestsAmount = req.body.guestsAmount;

	const date1 = new Date(startDate);
	const date2 = new Date(endDate);
	let timeDiff = Math.abs(date2.getTime() - date1.getTime());
	let daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

	let roomCharge = Math.round(daysDiff * price * 100) / 100;
	console.log('roomCharge is: ' + roomCharge);

	const guestFee = 20;
	let guestCharge = Math.round(guestsAmount * guestFee * 100) / 100; // $20 per Guest
	console.log('guestCharge is: ' + guestCharge);

	let amountPaid = roomCharge + guestCharge;
	console.log('amountPaid is: ' + amountPaid);

	RoomModel.findOne({ _id: roomID })
		.lean()
		.exec()
		.then((room) => {
			console.log(room);

			req.session.tempBooking = {
				user: req.session.user,
				roomID: roomID,
				startDate: startDate,
				endDate: endDate,
				price: price,
				guestsAmount: guestsAmount,
				daysDiff: daysDiff,
				roomCharge: roomCharge,
				guestFee: guestFee,
				guestCharge: guestCharge,
				amountPaid: amountPaid,
				room: room,
			};

			res.render('book_now', {
				user: req.session.user,
				roomID: roomID,
				startDate: startDate,
				endDate: endDate,
				price: price,
				guestsAmount: guestsAmount,
				daysDiff: daysDiff,
				roomCharge: roomCharge,
				guestFee: guestFee,
				guestCharge: guestCharge,
				amountPaid: amountPaid,
				room: room,
			}); // ===== RENDER =====
		});
});

app.post('/upload-bnb', checkAdmin, upload.array('photos', 5), (req, res) => {
	let localMessage = 'Your room was uploaded successfully';

	let filenames = req.files.map(function (file) {
		return file.filename; // or file.originalname
	});

	const NewRoom = new RoomModel({
		creator: req.session.user.username,
		title: req.body.title,
		price: req.body.price,
		description: req.body.description,
		details: req.body.details,
		location: req.body.location,
		propertyType: req.body.propertyType,
		photoFileNames: filenames,
		guestsNum: req.body.guests,
		bedroomsNum: req.body.bedrooms,
		bedsNum: req.body.beds,
		bathsNum: req.body.baths,
	});

	NewRoom.save()
		.then((response) => {
			console.log('New uploaded Room saved fine.');

			return res.redirect('/dashboard/uploaded-rooms');
		})
		.catch((err) => {
			localMessage = 'There was an error uploading your new room: ';

			console.log(localMessage + err);

			return res.redirect('/dashboard/uploaded-rooms');
		});
});

/////////////////////////////  ///////////////////////////
app.post(
	'/upload-bnb/edit/update-a-room',
	checkAdmin,
	upload.array('photos', 5),
	(req, res) => {
		//

		let localMessage = 'Your room details were uploaded successfully';

		let filenames = req.files.map(function (file) {
			return file.filename; // or file.originalname
		});

		console.log('filenames Arr: ' + filenames);

		if (!!filenames.length) {
			console.log('Now in the IF cond PLUS FILES. Trying info update...');

			RoomModel.updateOne(
				{ _id: req.body.roomID },
				{
					$set: {
						title: req.body.title,
						price: req.body.price,
						description: req.body.description,
						details: req.body.details,
						location: req.body.location,
						propertyType: req.body.propertyType,
						guestsNum: req.body.guests,
						bedroomsNum: req.body.bedrooms,
						bedsNum: req.body.beds,
						bathsNum: req.body.baths,
					},
					$push: { photoFileNames: { $each: filenames } },
				}
			)
				.exec()
				.then(() => {
					console.log('Room ' + req.body.roomID + ' updated successfully');

					return res.redirect('/dashboard/uploaded-rooms');
				})
				.catch((err) => {
					console.log(
						'An error occurred while updating the Room (PLUS FILES): ' + err
					);

					return res.redirect('back');
				});
		} else {
			console.log('Now in the IF cond NO FILES. Trying info update...');

			RoomModel.updateOne(
				{ _id: req.body.roomID },
				{
					$set: {
						title: req.body.title,
						price: req.body.price,
						description: req.body.description,
						details: req.body.details,
						location: req.body.location,
						propertyType: req.body.propertyType,
						guestsNum: req.body.guests,
						bedroomsNum: req.body.bedrooms,
						bedsNum: req.body.beds,
						bathsNum: req.body.baths,
					},
				}
			)
				.exec()
				.then(() => {
					console.log('Room ' + req.body.roomID + ' updated successfully');

					return res.redirect('/dashboard/uploaded-rooms');
				})
				.catch((err) => {
					console.log(
						'An error occurred while updating the Room (NO FILES): ' + err
					);

					return res.redirect('back');
				});
		}
	}
);

app.post('/upload-bnb/edit/remove-a-photo', checkAdmin, (req, res) => {
	const roomID = req.body.roomID;
	//const photoIndex = req.body.photoIndex;
	const photoFileName = req.body.photoFileName;

	console.log(roomID);
	console.log(photoFileName);

	RoomModel.updateOne(
		{ _id: roomID },
		{
			$pullAll: { photoFileNames: [photoFileName] },
		}
	)
		.exec()
		.then(() => {
			// now remove the file from the file system.
			fs.unlink(PHOTODIRECTORY + photoFileName, (err) => {
				if (err) {
					return console.log('fs unlink err: ' + err);
				}
				console.log('Removed file : ' + photoFileName);
			});
			// redirect to home page once the removal is done.
			return res.redirect('back');
		})
		.catch((err) => {
			// if there was an error removing the photo, log it, and redirect.
			console.log(`An ERROR occurred: ${err}`);
			return res.redirect('back');
		});
});

// Sign-IN PROCESS
app.post('/sign-in-process', (req, res) => {
	// CLEAR Sign-UP validation errors
	//req.session.validationErrorsSU = '';
	req.session.reset();

	// put 'body' values into var
	const FORM_DATA = req.body;

	// CLEAN the INPUT
	const username = FORM_DATA.username.toString().trim().toLowerCase();
	console.log('username: ' + username);

	const password = FORM_DATA.password.toString();
	//console.log('password: ' + password);

	// IF BLANKS
	let blanks = username === '' || password === '';

	if (blanks) {
		req.session.validationErrorsSI =
			'&#x26a0; Both username and password are required.';

		return res.redirect('/home#signInModal');
	} else {
		//req.session.validationErrorsSI = '';
		req.session.reset();
	}

	UserModel.findOne({ username: username })
		.exec()
		.then((usr) => {
			if (!usr) {
				req.session.validationErrorsSI = '&#x26a0; Username does not exist.';

				return res.redirect('/home#signInModal');
			} else {
				// Pull the password "hash" value from the DB and compare it to "myPassword123" (match)
				bcrypt.compare(password, usr.password).then((is_hash_matched) => {
					// is_hash_matched === true or false

					console.log('Did the HASHes match?: ' + is_hash_matched);

					// IF PASSWORD MATCHES
					if (is_hash_matched) {
						req.session.reset();

						req.session.user = {
							userID: usr._id,
							username: usr.username,
							email: usr.email,
							firstName: usr.firstName,
							lastName: usr.lastName,
							isAdmin: usr.isAdmin,
						};

						console.log('User session details so far: ' + req.session.user);
						//req.session.validationErrorsSI = '';

						return res.redirect('/dashboard');
					} else {
						req.session.validationErrorsSI = '&#x26a0; Password incorrect.';

						return res.redirect('/home#signInModal');
					}
				});
			}
		})
		.catch((err) => {
			console.log(`An ERROR occurred: ${err}`);
		});
});

// Sign-UP PROCESS
app.post('/sign-up-process', (req, res) => {
	// CLEAR Sign-IN validation errors
	//req.session.validationErrorsSI = '';
	req.session.reset();

	// put 'body' values into var
	const FORM_DATA = req.body;

	// CLEAN the INPUT
	const username = FORM_DATA.username.toString().trim().toLowerCase();
	console.log('username: ' + username);

	const password = FORM_DATA.password.toString();
	//console.log('password: ' + password);

	const email = FORM_DATA.email.toString().trim().toLowerCase();
	console.log('email: ' + email);

	const fName = FORM_DATA.fName.toString().trim();
	console.log('fName: ' + fName);

	const lName = FORM_DATA.lName.toString().trim();
	console.log('lName: ' + lName);

	//const birthdate = FORM_DATA.birthdate; // IDEA: MAYBE CANCEL THIS ON HTML?
	//console.log('birthdate: ' + birthdate);

	// REGEX
	const passRegEx = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9]{6,12}$/;
	const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	const namesRegEx = /^[A-Za-z0-9_-]*$/;

	// IF BLANKS
	let blanks =
		username === '' ||
		password === '' ||
		email === '' ||
		fName === '' ||
		lName === '';
	//birthdate === '';

	if (blanks) {
		req.session.validationErrorsSU = '&#x26a0; ALL fields must be filled in.';

		return res.redirect('/home#signUpModal');
	} else {
		//req.session.validationErrorsSU = '';
		req.session.reset();
	}

	// IF VIOLATES REGEX
	function checkRegExWithMsg(value, regEx, message) {
		if (!value.match(regEx)) {
			req.session.validationErrorsSU +=
				(req.session.validationErrorsSU ? '<br>' : '') + message;
		}
	}

	checkRegExWithMsg(
		username,
		namesRegEx,
		'&#x26a0; Username: only letters / numbers / dashes / underscores allowed.'
	);
	checkRegExWithMsg(
		password,
		passRegEx,
		'<br>&#x26a0; Password must be: 6-12 characters, numbers and letters (at least 1 CAPITAL) only.'
	);
	checkRegExWithMsg(email, emailRegEx, '<br>&#x26a0; Email must be valid.');
	checkRegExWithMsg(
		fName,
		namesRegEx,
		'<br>&#x26a0; First Name: only letters / numbers / dashes / underscores allowed.'
	);
	checkRegExWithMsg(
		lName,
		namesRegEx,
		'<br>&#x26a0; Last Name: only letters / numbers / dashes / underscores allowed.'
	);

	// CONCAT ERRORS AND DISPLAY
	if (req.session.validationErrorsSU) {
		return res.redirect('/home#signUpModal');
	}

	// WHEN VALIDATED:

	UserModel.findOne({ $or: [{ username: username }, { email: email }] })
		.exec()
		.then((usr) => {
			console.log('usr Object query results: ' + usr);

			if (!usr) {
				////////// NEW USER + SAVE USER //////////

				console.log(
					'Validation errs so far: ' + req.session.validationErrorsSU
				);

				console.log('HASHING the PASSWORD now ');

				// Encrypt the plain text: "myPassword123"
				bcrypt
					.hash(password, 10)
					.then((hashed_pass) => {
						// Hash the password using a Salt that was generated using 10 rounds
						// TODO: Store the resulting "hash" value in the DB

						console.log('HASHED Pass: ' + hashed_pass);

						var NewUser = new UserModel({
							username: username,
							password: hashed_pass,
							email: email,
							firstName: fName,
							lastName: lName,
							//isAdmin: false
						});

						console.log('got here! - CREATED NewUser model var');

						NewUser.save((err) => {
							if (err) {
								console.log(
									'There was an ERROR CREATING/SAVING NewUser: ' + err
								);
							} else {
								console.log('NewUser was CREATED');
							}
						});

						console.log('got here 2! - SAVED NewUser model var');

						///////////////////////////////////////////////

						// EMAIL the USER
						console.log('Going to email them');
						let emailOptions = {
							from: process.env.EMAILER_ADDR,
							to: FORM_DATA.email,
							subject: 'Registration Email from EarthBnB',
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

						// "SIGN-IN" the USER
						console.log('Going to sign-in them');
						req.session.user = {
							username: username,
							email: email,
							firstName: fName,
							lastName: lName,
						};

						// GOTO DASHBOARD
						return res.redirect('/dashboard');
					})
					.catch((err) => {
						console.log(err); // Show any errors that occurred during the HASHING process
					});
			} else {
				// IF USER EXISTS
				console.log('NewUser acct already exists - did not do anything');

				req.session.validationErrorsSU =
					'&#x26a0; Either username or email has already been used before.';

				console.log(
					'Validation errs so far: ' + req.session.validationErrorsSU
				);

				return res.redirect('/home#signUpModal'); // MOVE OUT
			}
		})
		.catch((err) => {
			console.log(`An error occurred: ${err}`);
		});

	///////////////////////////////////////////
});

// FIRST TIME USER & ADMIN CREATION
app.get('/firstrunsetup', (req, res) => {
	// Description: IF EXISTS, DON'T RE-CREATE

	// FIND TEST USER
	UserModel.findOne({ username: 'testuser' })
		.exec()
		.then((usr) => {
			if (!usr) {
				let password = 'userPass322';
				console.log('HASHING the PASSWORD now: ' + password);

				bcrypt
					.hash(password, 10)
					.then((hashed_pass) => {
						// Hash the password using a Salt that was generated using 10 rounds
						// TODO: Store the resulting "hash" value in the DB

						console.log('HASHED Pass: ' + hashed_pass);

						var TestUser = new UserModel({
							username: 'testuser',
							password: hashed_pass,
							email: 'testuser@myseneca.ca',
							firstName: 'TestUser',
							lastName: 'Account',
							//isAdmin: false
						});
						console.log('got here! - CREATED TestUser model var');

						TestUser.save((err) => {
							console.log('Error: ' + err + ';');
							if (err) {
								console.log('There was an ERROR CREATING TestUser: ' + err);
							} else {
								console.log('TestUser was CREATED');
							}
						});
						console.log('got here 2! - SAVED TestUser model var' + TestUser);
					})
					.catch((err) => {
						console.log(err); // Show any errors that occurred during the HASHING process
					});
			} else {
				console.log('TestUser acct already exists - did not do anything');
			}
		})
		.catch((err) => {
			console.log(`An error occurred: ${err}`);
		});

	// FIND TEST ADMIN
	UserModel.findOne({ username: 'testadmin' })
		.exec()
		.then((usr) => {
			if (!usr) {
				let password = 'adminPass322';
				console.log('HASHING the PASSWORD now: ' + password);

				bcrypt
					.hash(password, 10)
					.then((hashed_pass) => {
						// Hash the password using a Salt that was generated using 10 rounds
						// TODO: Store the resulting "hash" value in the DB

						console.log('HASHED Pass: ' + hashed_pass);

						var TestAdmin = new UserModel({
							username: 'testadmin',
							password: hashed_pass,
							firstName: 'TestAdmin',
							lastName: 'Account',
							email: 'testadmin@myseneca.ca',
							isAdmin: true,
						});
						console.log(
							'got here! - CREATED TestAdmin model var: ' + TestAdmin
						);

						TestAdmin.save((err) => {
							console.log('Error: ' + err + ';');
							if (err) {
								console.log('There was an ERROR CREATING TestAdmin: ' + err);
							} else {
								console.log('TestAdmin was CREATED');
							}
						});
						console.log('got here 2! - SAVED TestAdmin model var');
					})
					.catch((err) => {
						console.log(err); // Show any errors that occurred during the HASHING process
					});
			} else {
				console.log('TestAdmin acct already exists - did not do anything');
			}
		})
		.catch((err) => {
			console.log(`An error occurred: ${err}`);
		});

	res.redirect('/');
});

// CATCH NON-EXISTENT ROUTES
app.get('*', (req, res) => {
	res.redirect('/home');
});

app.post('*', (req, res) => {
	res.redirect('/home');
});

// start the server to listen on HTTP_PORT
app.listen(HTTP_PORT, onHttpStart);
