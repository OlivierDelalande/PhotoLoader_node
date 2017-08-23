// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const formidable = require('formidable');
const fs = require('fs');
const config = {
    //projectId: 'a1be77b9425df2844f0674e2c0257cff2b2ba6d9',
    projectId: 'doppleruploadfile',
    keyFilename: './keyfile.json'
};
const storage = require('@google-cloud/storage')(config);

//const gcs = storage({
//    projectId: 'doppleruploadfile',
//    keyFilename: './keyfile.json'
//});

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

            const bucket = storage.bucket('deuploadfile');

            bucket.upload(files.name, function(err, file) {
                if (!err) {
                    // "zebra.jpg" is now in your bucket.
                }
                console.log(file);
            });

            res.status(200).json({
                test: 'wwww.picture.com',
                test2: files
            });
        });
    });

exports.api = functions.https.onRequest(app);