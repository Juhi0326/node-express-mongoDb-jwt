const express = require('express');
const router = express.Router();
const moderatorAuthMiddleware = require('../middleware/authModerator');
const homeSetupController = require('../controllers/homeSetup');
const {upload} = require('../multerStorage');


router.get('/', homeSetupController.homePage_get_all);

router.post('/', moderatorAuthMiddleware, upload.single('Picture'), homeSetupController.homePage_create);

router.patch('/', moderatorAuthMiddleware, homeSetupController.homePage_update);

router.delete('/', moderatorAuthMiddleware, homeSetupController.homePage_delete);

module.exports = router;