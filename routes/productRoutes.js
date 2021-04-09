const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
    res.status(200).json({
        message: 'this is a get request from product routes'
    });
});

router.post('/', (req, res, next) => {
    res.status(200).json({
        message: 'this is a post request from product routes'
    });
});

module.exports = router;