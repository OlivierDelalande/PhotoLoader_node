const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const index = require('./functions/Routes/index');

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
    next();
});

app.use(bodyParser.json());

app.get('/', function(req, res) {
    res.setHeader('Content-Type', 'text/plain');
    res.status(200).send('welcome in node');
});

app.post('/', function(req, res) {
    const frontjson = req.body;
    console.log('json from front', frontjson);
    res.status(200).json({
        test : 'wwww.google.com'
    });
});

app.listen(8080);