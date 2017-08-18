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

app.use('/', index);
app.listen(8080);