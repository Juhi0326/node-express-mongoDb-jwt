const express = require('express');
const router = express.Router();
const adminAuthMiddleware = require('../middleware/authAdmin');
const userAuthMiddleware = require('../middleware/authUser');

require('dotenv').config({ path: '../../express-jwt/.env'})

const userController = require('../controllers/users');


router.post('/signup', userController.user_signUp);

router.post('/signup2', upload.single('userImage'), userController.user_signUp2);

router.post('/login', userController.user_login);

router.delete('/:userId', userController.user_delete);

router.post('/reset-password', userController.sendPasswordResetEmail)

router.post('/receive_new_password/:userId/:token', userController.receiveNewPassword)

router.get('/', adminAuthMiddleware, userController.user_get_all)

router.get('/:userId', userAuthMiddleware, userController.user_get_by_id)

router.get('/my-orders/:userId', userAuthMiddleware, userController.order_get_all_by_userId)

router.patch('/admin/:userId', upload.single('userImage'), adminAuthMiddleware, userController.change_user_data_by_userId )

router.patch('/:userId', upload.single('userImage'), userAuthMiddleware, userController.change_user_myData_by_myUserId)

module.exports = router;
