const express = require("express");
const router = express.Router();
const moderatorAuthMiddleware = require('../middleware/authModerator');
const homeController = require('../controllers/home');



router.get("/", homeController.homePage_get_all);

router.post("/", moderatorAuthMiddleware, homeController.homePage_create);

router.patch("/", moderatorAuthMiddleware, homeController.homePage_update);

router.delete("/", moderatorAuthMiddleware, homeController.homePage_delete);

module.exports = router;