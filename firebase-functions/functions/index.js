const functions = require('firebase-functions');
const admin = require('firebase-admin');
const serviceAccount = require("./keyfile.json");

admin.initializeApp(functions.config({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://photo-loader.firebaseio.com",
    storageBucket: "gs://photo-loader.appspot.com/"
}).firebase);

//admin.initializeApp({
//    credential: admin.credential.cert(serviceAccount),
//    databaseURL:  "https://photo-loader.firebaseio.com",
//    storageBucket: "gs://photo-loader.appspot.com/"
//});

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const multer = require('multer');
const format = require('util').format;

const fs = require('fs');
const sharp = require('sharp');
const stream = require('stream');

app.use(function (req, res, next) { //allow cross origin requests
    res.setHeader("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");
    res.header("Access-Control-Allow-Origin", "http://localhost:4200");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Credentials", true);
    next();
});

app.use(bodyParser.json());

const store = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
        const datetimestamp = Date.now();
        cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1]);
    }
});

const upload = multer({
    storage: multer.memoryStorage()
}).any();


app.post('/uploads', function (req, res) {
    upload(req, res, function (err) {

        let buffer = req.files[0].buffer;

        let tab = req.files[0].originalname.split('.');
        let name = tab[0];
        let extension = tab[1];
        let pictureSizes = JSON.parse(req.body.sizes);

        let pictures = [];
        for (i = 1; i < pictureSizes.length; i++) {
            pictures[i] = name + pictureSizes[i].width + "." + extension;
        }
        pictures[0] = name + pictureSizes[0].width + "." + extension;

        let promiseArray = [];

        for (i = 0 ; i < pictureSizes.length; i++ ) {
            promiseArray.push(resize(buffer, pictures[i], pictureSizes[i].width, pictureSizes[i].height));
        }

        Promise.all(promiseArray).then(values => {

            res.status(200).json({
                pictures: pictures
            });
        }, err => {
            console.log('err', err);
            res.send('Loading error')
        });

        //    //blobDeleteProcess('RG300.jpg');
        //
    });
});


let resize = function (picture, name, width, height) {
    return sharp(picture)
        .resize(width, height)
        .crop()
        .toBuffer()
        .then(buffer => {
            return blobCreateProcess(name, buffer);
        })
        .catch((err) => {
            console.error('ERROR:', err);
        });
};


let blobCreateProcess = function (fileName, buffer) {
    let bucket = admin.storage().bucket();
    let blob = bucket.file('images/' + fileName);
    let blobStream = blob.createWriteStream();

    return new Promise((resolve, reject) => {

        blobStream.on('error', (err) => {
            console.error(err);
            reject(err);
        });

        blobStream.on('finish', () => {

            blob
                .makePublic()
                .then((data) => {
                    resolve('publicUrl');
                })
                .catch((err) => {
                    console.error('ERROR:', err);
                    reject(err);
                });
        });
        blobStream.end(buffer);
    });

};

let blobDeleteProcess = function (fileName) {

    // Deletion needs a filename with its extension

    let blob = bucket.file(fileName);

    blob
        .delete()
        .then(() => {
            console.log('blob deleted');
        })
        .catch((err) => {
            console.error('ERROR:', err);
        });
};

exports.api = functions.https.onRequest(app);

//app.listen('3001', function(){
//    console.log('running on 3001');
//});