// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const formidable = require('formidable');

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
            res.status(200).json({
                test: 'wwww.picture.com',
                test2: files
            });
        });
    });

exports.api = functions.https.onRequest(app);