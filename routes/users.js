const express = require('express');
const router = express.Router();
const adminAuthMiddleware = require('../middleware/authAdmin');

require('dotenv').config({ path: '../../express-jwt/.env'})

const userController = require('../controllers/users');


router.post('/signup', userController.user_signUp);

router.post('/login', userController.user_login);

router.delete('/:userId', userController.user_delete);

router.post('/reset-password', userController.sendPasswordResetEmail)

router.post('/receive_new_password/:userId/:token', userController.receiveNewPassword)

router.get('/', adminAuthMiddleware, userController.user_get_all)

module.exports = router;
