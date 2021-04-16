const express = require("express");
const router = express.Router();

require('dotenv').config({ path: '../../express-jwt/.env'})

const userController = require('../controllers/users');


router.post("/signup", userController.user_signUp);

router.post("/login", userController.user_login);

router.delete("/:userId", userController.user_delete);

module.exports = router;