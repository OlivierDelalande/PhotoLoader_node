const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

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

app.use(function(req, res, next) { //allow cross origin requests
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
        cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length -1]);
    }
});

const upload = multer({ // multer settings
    storage: multer.memoryStorage()
}).single('picture');

app.get('/', function(req, res, next) {
// render the index page, and pass data to it.
    res.send('working');
});


app.post('/uploads', function(req, res) {

    upload(req, res, function (err) {

        let pictureSizes = [
            {
                width: 600,
                height: 600
            },
            {
                width: 300,
                height: 300
            },
            {
                width: 150,
                height: 150
            }
        ];

        let buffer = req.file.buffer;
        let name = req.file.originalname;

        let name2 = name + pictureSizes[1].width;
        let name3 = name + pictureSizes[2].width;
        name = name + pictureSizes[0].width;

        let promiseArray = [
            resize(buffer, name, pictureSizes[0].width, pictureSizes[0].height),
            resize(buffer, name2, pictureSizes[1].width, pictureSizes[1].height),
            resize(buffer, name3, pictureSizes[2].width, pictureSizes[2].height),
        ];

        Promise.all(promiseArray).then(values => {
            console.log('values', values);

            res.status(200).json({
                url: 'publicUrl'
            });
        }, err => {
            console.log('err', err)
        });

    });
});

let resize = function (picture, name, width, height) {
    console.log('inside resize');

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
                    console.log('publicUrl', publicUrl);
                    resolve(fileName, publicUrl);
                })
                .catch((err) => {
                    console.error('ERROR:', err);
                    reject(err);
                });

        });
    });

    blobStream.end(buffer);

};

let blobDeleteProcess = function (fileName) {

    let blob = bucket.file(fileName);

    blob
        .delete()
        .then(() => {
            console.log('public');
        })
        .then(() => {
            console.log('blob deleted');
        })
        .catch((err) => {
            console.error('ERROR:', err);
        });
};

exports.api = functions.https.onRequest(app);

//app.listen('3001', function(){
//    console.log('running on 3001...');
//});
