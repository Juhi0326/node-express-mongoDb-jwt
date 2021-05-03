const express = require('express');
const router = express.Router();
const homeController = require('../controllers/home');

router.get('/', homeController.homePage_get_all);

module.exports = router;