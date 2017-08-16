//var http = require('http');
//
//var server = http.createServer(function(req, res) {
//    res.writeHead(200);
//    res.end('Salut tout le monde !');
//});
//server.listen(8080);

var express = require('express');

var app = express();

app.get('/test', function(req, res) {
    res.setHeader('Content-Type', 'text/plain');
    res.end('Vous êtes à l\'accueil');
});

app.listen(8080);