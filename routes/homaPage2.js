const express = require('express');
const router = express.Router();
const moderatorAuthMiddleware = require('../middleware/authModerator');
const homeSetupController2 = require('../controllers/homePage2');
const {upload} = require('../multerStorage');

router.get('/', homeSetupController2.homePage2_get_all);

router.post('/', moderatorAuthMiddleware, upload.single('titleImagePath'), homeSetupController2.homePage2_create);

router.patch('/titleSetup', moderatorAuthMiddleware, upload.single('titleImagePath'), homeSetupController2.homePage2_TitleChange);

router.patch('/headingSetup', moderatorAuthMiddleware, upload.single('headingImagePath'), homeSetupController2.homePage2_HeadingChange);

module.exports = router;