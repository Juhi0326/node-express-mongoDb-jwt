const express = require("express");
const router = express.Router();

const imageSetupController = require('../controllers/image');
const {upload} = require('../multerStorage');


router.get("/", imageSetupController.images_get_all);

router.get("/:imageId", imageSetupController.image_get_one_ById );

router.post("/", upload.single('imageName'), imageSetupController.image_create);

router.delete("/:imageId", upload.single('imageName'),imageSetupController.image_delete_byId);

module.exports = router;