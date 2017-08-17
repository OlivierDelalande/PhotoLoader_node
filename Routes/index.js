const express = require('express');
const router = express.Router();

router.get('/', function(req, res) {
    res.setHeader('Content-Type', 'text/plain');
    res.status(200).send('welcome in node');
});

router.post('/', function(req, res) {
    const frontjson = req.body;
    console.log('json from front', frontjson);
    res.status(200).json({
        test : 'wwww.google.com'
    });
});


module.exports = router;