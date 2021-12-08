const express = require('express');
const router = express.Router();
const moderatorAuthMiddleware = require('../middleware/authModerator');
const homeSetupController2 = require('../controllers/homePage2');
const {upload} = require('../multerStorage');

router.get('/', homeSetupController2.homePage2_get_all);

router.post('/', moderatorAuthMiddleware, upload.single('titleImagePath'), homeSetupController2.homePage2_create);

router.patch('/titleSetup', moderatorAuthMiddleware, upload.single('titleImagePath'), homeSetupController2.homePage2_TitleChange);

router.patch('/headingSetup', moderatorAuthMiddleware, upload.single('headingImagePath'), homeSetupController2.homePage2_HeadingChange);

router.patch('/introductionSetup', moderatorAuthMiddleware, upload.single('introductionImagePath'), homeSetupController2.homePage2_IntroductionChange);

router.patch('/section_1Setup', moderatorAuthMiddleware, upload.single('section_1ImagePath'), homeSetupController2.homePage2_Section_1Change);

router.patch('/section_2Setup', moderatorAuthMiddleware, upload.single('section_2ImagePath'), homeSetupController2.homePage2_Section_2Change);

router.patch('/section_3Setup', moderatorAuthMiddleware, upload.single('section_3ImagePath'), homeSetupController2.homePage2_Section_3Change);

router.patch('/section_4Setup', moderatorAuthMiddleware, upload.single('section_4ImagePath'), homeSetupController2.homePage2_Section_4Change);

router.patch('/section_5Setup', moderatorAuthMiddleware, upload.single('section_5ImagePath'), homeSetupController2.homePage2_Section_5Change);

router.patch('/section_6Setup', moderatorAuthMiddleware, upload.single('section_6ImagePath'), homeSetupController2.homePage2_Section_6Change);

module.exports = router;