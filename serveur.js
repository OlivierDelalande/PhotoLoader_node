//var http = require('http');
//
//var server = http.createServer(function(req, res) {
//    res.writeHead(200);
//    res.end('Salut tout le monde !');
//});
//server.listen(8080);

var express = require('express');

var app = express();

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE, OPTIONS');
    next();
});

app.get('/', function(req, res) {
    res.setHeader('Content-Type', 'text/plain');
    res.status(200).json({
        test : 'succeedeed'
    });
});



app.listen(8080);