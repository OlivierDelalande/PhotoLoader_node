const functions = require('firebase-functions');
const admin = require('firebase-admin');
const serviceAccount = require("./keyfile.json");

admin.initializeApp(functions.config({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://photo-loader.firebaseio.com",
    storageBucket: "gs://photo-loader.appspot.com/"
}).firebase);

exports.loadPictures = functions.https.onRequest((req, res) => {

    res.setHeader("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");
    res.header("Access-Control-Allow-Origin", "http://localhost:4200");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Credentials", true);

    const multer = require('multer');
    const sharp = require('sharp');
    const stream = require('stream');
    const bodyParser = require('body-parser');

    const upload = multer({
        storage: multer.memoryStorage()
    }).any();

    upload(req, res, function (err) {

        let buffer = req.files[0].buffer;
        console.log('buffer', buffer);

        let path = req.body.path;
        console.log('path', path);
        let tab = req.files[0].originalname.split('.');
        let name = tab[0];
        let extension = tab[1];
        let pictureSizes = [
            {
                "width": 400,
                "height": 250,
            },
            {
                "width": 550,
                "height": 450,
            },
            {
                "width": 900,
                "height": 750,
            }
        ];

        let pictures = [];
        for (i = 1; i < pictureSizes.length; i++) {
            pictures[i] = name + pictureSizes[i].width + "." + extension;
        }
        pictures[0] = name + pictureSizes[0].width + "." + extension;

        let promiseArray = [];

        for (i = 0 ; i < pictureSizes.length; i++ ) {
            promiseArray.push(resize(buffer, pictures[i], pictureSizes[i].width, pictureSizes[i].height, path));
        }

        Promise.all(promiseArray).then(values => {

            console.log('values', values);

            res.status(200).json({
                pictures: values
            });
        }, err => {
            console.log('err', err);
            res.send('Loading error')
        });

    });

    let resize = function (picture, name, width, height, path) {

        if (width == height) {
            return sharp(picture)
                .resize(width, height)
                .crop()
                .toBuffer()
                .then(buffer => {
                    return blobCreateProcess(name, buffer, path);
                })
                .catch((err) => {
                    console.error('ERROR:', err);
                });
        } else {
            return sharp(picture)
                .resize(width, height)
                .max()
                .toBuffer()
                .then(buffer => {
                    return blobCreateProcess(name, buffer, path);
                })
                .catch((err) => {
                    console.error('ERROR:', err);
                });
        }
    };


    let blobCreateProcess = function (fileName, buffer, path) {
        let bucket = admin.storage().bucket();
        let file = bucket.file(path + fileName);
        let stream = file.createWriteStream();

        return new Promise((resolve, reject) => {

            stream.on('error', (err) => {
                console.error(err);
                reject(err);
            });

            stream.on('finish', () => {

                file
                    .makePublic()
                    .then(() => {
                        resolve({
                            name: fileName,
                            url: `https://storage.googleapis.com/${functions.config().firebase.storageBucket}/${path}${fileName}`,
                            ref: path + fileName
                        });
                    })
                    .catch((err) => {
                        console.error('ERROR:', err);
                        reject(err);
                    });
            });
            stream.end(buffer);
        });
    };

});



