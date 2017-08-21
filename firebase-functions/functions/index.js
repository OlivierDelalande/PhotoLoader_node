// The Cloud Functions for Firebase SDK to create Cloud Functions and setup triggers.
const functions = require('firebase-functions');

// The Firebase Admin SDK to access the Firebase Realtime Database.
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
//var path = require('path');

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
    next();
});

app.use(bodyParser.json());

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
        console.log(req);
        console.log('reqBody', req.body.files);
        //const frontjson = req.body;
        //console.log('json from picture node', frontjson);
        res.status(200).json({
            test: 'wwww.picture.com'
        });
    });

exports.api = functions.https.onRequest(app);

