/*
------------------------------------------------------
Assignment 1 - User Interface (UX)

Course:			WEB 322
Author:			David Ly
Email:			dly11@myseneca.ca
Date:			  2020-10-11
------------------------------------------------------ 
*/

// setup our requires
var express = require('express');
var app = express();

var HTTP_PORT = process.env.PORT || 8080;

var path = require('path');

// call this function after the http server starts listening for requests
function onHttpStart() {
	console.log('Express http server listening on: ' + HTTP_PORT);
}

app.use(express.static('static'));

app.get('/', (req, res) => {
	res.redirect('/home');
});

app.get('/home', (req, res) => {
	res.sendFile(path.join(__dirname, '/views/index.html'));
});

app.get('/search-listings', (req, res) => {
	res.sendFile(path.join(__dirname, '/views/listings_search.html'));
});

app.get('/bnb-details', (req, res) => {
	res.sendFile(path.join(__dirname, '/views/bnb_details.html'));
});

app.get('/user-registration', (req, res) => {
	res.redirect('/home#signUpModal');
});

app.get('/book-now', (req, res) => {
	res.sendFile(path.join(__dirname, '/views/book_now.html'));
});

app.get('/upload-bnb', (req, res) => {
	res.sendFile(path.join(__dirname, '/views/upload_bnb.html'));
});

// start the server to listen on HTTP_PORT
app.listen(HTTP_PORT, onHttpStart);
