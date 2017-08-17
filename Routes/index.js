var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
    res.setHeader('Content-Type', 'text/plain');
    res.status(200).json({
        test : 'succeedeed'
    });
});

module.exports = router;