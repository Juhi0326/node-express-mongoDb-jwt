const express = require("express");
const router = express.Router();
const moderatorAuthMiddleware = require('../middleware/authModerator');
const homeController = require('../controllers/home');
const {upload} = require('../multerStorage');


router.get("/", homeController.homePage_get_all);

router.post("/", moderatorAuthMiddleware, upload.single('Picture'), homeController.homePage_create);

router.patch("/", moderatorAuthMiddleware, homeController.homePage_update);

router.delete("/", moderatorAuthMiddleware, homeController.homePage_delete);

module.exports = router;