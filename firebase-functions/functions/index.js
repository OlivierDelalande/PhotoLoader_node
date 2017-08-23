// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
//const multer = require("multer");
const formidable = require('formidable');
const http = require('http');
const util = require('util');

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
    next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

    app.get('/', function (req, res) {
        res.setHeader('Content-Type', 'text/plain');
        res.status(200).send('welcome in node');
    });

    app.post('/', function (req, res) {
        const frontjson = req.body;
        console.log('json from front', frontjson);
        res.status(200).json({
            test: 'wwww.google.com'
        });
    });

    app.post('/upload', function (req, res) {

        const form = new formidable.IncomingForm();
        form.parse(req, function(err, fields, files) {
            if (err) {

                // Check for and handle any errors here.

                console.error(err.message);
                return;
            }
            console.log('files', files);
            console.log('req',req);
            console.log('req',req.body);
            res.status(200).json({
                test: 'wwww.picture.com',
                test2: files
            });
        //    res.writeHead(200, {'content-type': 'text/plain'});
        //    res.write('received upload:\n\n');
        //
        //    // This last line responds to the form submission with a list of the parsed data and files.
        //
        //    res.end(util.inspect({fields: fields, files: files}));
        //});
        //return;
        //
        //console.log('picture back');
        //console.log('req',req);
        //console.log('req',req.body);
        //res.status(200).json({
        //    test: 'wwww.picture.com'
        });
    });

//app.post("/upload", multer({dest: "./uploads/"}).array("logo angular.png", 12), function(req, res) {
//    res.send(req.files);
//});

exports.api = functions.https.onRequest(app);

//var form = new formidable.IncomingForm();
//form.parse(req, function(err, fields, files) {
//    if (err) {
//
//        // Check for and handle any errors here.
//
//        console.error(err.message);
//        return;
//    }
//    res.writeHead(200, {'content-type': 'text/plain'});
//    res.write('received upload:\n\n');
//
//    // This last line responds to the form submission with a list of the parsed data and files.
//
//    res.end(util.inspect({fields: fields, files: files}));
//});
//return;
