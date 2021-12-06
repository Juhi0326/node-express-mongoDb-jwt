const express = require('express');
const router = express.Router();
const moderatorAuthMiddleware = require('../middleware/authModerator');
const homeSetupController2 = require('../controllers/homePage2');
const {upload} = require('../multerStorage');

router.get('/', homeSetupController2.homePage2_get_all);

router.post('/', moderatorAuthMiddleware, upload.single('titleImagePath'), homeSetupController2.homePage2_create);

module.exports = router;