const express = require('express');
const router = express.Router();
const moderatorAuthMiddleware = require('../middleware/authModerator');
const imageSetupController = require('../controllers/image');
const {upload} = require('../multerStorage');


router.get('/', moderatorAuthMiddleware, imageSetupController.images_get_all);

router.get('/:imageId', moderatorAuthMiddleware, imageSetupController.image_get_one_ById );

router.post('/', moderatorAuthMiddleware, upload.single('imageName'), imageSetupController.image_create);

router.delete('/:imageId', moderatorAuthMiddleware, upload.single('imageName'),imageSetupController.image_delete_byId);

module.exports = router;