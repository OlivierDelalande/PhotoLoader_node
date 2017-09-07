//const functions = require('firebase-functions');
//const admin = require('firebase-admin');
//admin.initializeApp(functions.config().firebase);

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const multer = require('multer');
const format = require('util').format;
const fs = require('fs');
const gcs = require('@google-cloud/storage')({
    projectId: 'doppleruploadfile',
    keyFilename: './keyfile.json'
});
const bucket = gcs.bucket('deuploadfile');
const sharp = require('sharp');

app.use(function (req, res, next) { //allow cross origin requests
    res.setHeader("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");
    res.header("Access-Control-Allow-Origin", "http://localhost:4200");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Credentials", true);
    next();
});

app.use(bodyParser.json());

const storage = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
        const datetimestamp = Date.now();
        cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1]);
    }
});

const upload = multer({ // multer settings
    storage: multer.memoryStorage()
}).any();

app.get('/', function (req, res, next) {
// render the index page, and pass data to it.
    res.send('working');
});

app.post('/uploads', function (req, res) {

    //console.log('req.body', req.body);
    //console.log('req', req);

    upload(req, res, function (err) {

        console.log('body', req.body);
        console.log('files', req.files);

        let buffer = req.files[0].buffer;

        let tab = req.files[0].originalname.split('.')
        let name = tab[0];
        let extension = tab[1];
        let pictureSizes = JSON.parse(req.body.sizes);

        console.log('pictureSizes.length', pictureSizes.length);
        console.log('pictureSizes', pictureSizes);

        let pictures = [];
        for (i = 1; i < pictureSizes.length; i++) {
            pictures[i] = name + pictureSizes[i].width + "." + extension;
        }

        pictures[0] = name + pictureSizes[0].width + "." + extension;

        let promiseArray = [];

        for (i = 0 ; i < pictureSizes.length; i++ ) {
            promiseArray.push(resize(buffer, pictures[i], pictureSizes[i].width, pictureSizes[i].height));
        }

        console.log('promiseArray', promiseArray);

        Promise.all(promiseArray).then(values => {
            console.log('values end', values);

            res.status(200).json({
                url1: values[0],
                url2: values[1],
                url3: values[2],
            });
        }, err => {
            console.log('err', err);
        });

        //blobDeleteProcess('RG300.jpg');

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

    let blob = bucket.file(fileName);
    let blobStream = blob.createWriteStream();

    blobStream.on('error', (err) => {
        console.error(err);
    });

    return new Promise((resolve, reject) => {
        blobStream.on('finish', () => {
            const publicUrl = format(`https://storage.googleapis.com/${bucket.name}/${blob.name}`);

            blob
                .makePublic()
                .then(() => {
                    resolve(publicUrl);
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

//exports.api = functions.https.onRequest(app);

app.listen('3001', function(){
    console.log('running on 3001...');
});
