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
            console.log('files', files.uploadFile);


            const fs = require('fs');
            const gcs = require('@google-cloud/storage')({
                projectId: 'doppleruploadfile',
                keyFilename: './keyfile.json'
            });

            const bucket = gcs.bucket('deuploadfile');

            const blob = bucket.file(files.uploadFile.name);
            const blobStream = blob.createWriteStream();

            blobStream.on('error', (err) => {
                next(err);
            });

            blobStream.on('finish', () => {
                // The public URL can be used to directly access the file via HTTP.
                const publicUrl = format(`https://storage.googleapis.com/${bucket.name}/${blob.name}`);
                console.log('publicUrl', publicUrl);
                res.status(200).send(publicUrl);
            });
            //bucket.upload(files.uploadFile.path+ files.uploadFile.name, function(err, file) {
            //    if (!err) {
            //        console.log(file);
            //    }
            //    console.error(err);
            //});

            //const mypath = files.uploadFile.path.replace('/tmp/', '');
            //console.log('mypath', mypath);
            //
            //const tmp = 'storage.googleapis.com/deuploadfile/' + mypath;
            //console.log('tmp', tmp);
            //
            //res.status(200).json({
            //    url: publicUrl,
            //    test2: files
            //});
        });
    });

exports.api = functions.https.onRequest(app);

