const express = require('express');
const router = express.Router();
const moderatorAuthMiddleware = require('../middleware/authModerator');
const orderController = require('../controllers/orders');
const userAuthMiddleware = require('../middleware/authUser');

router.get('/', moderatorAuthMiddleware, orderController.order_get_all);

router.post('/', userAuthMiddleware, orderController.order_create);

router.get('/:orderId', moderatorAuthMiddleware, orderController.order_get_ById );

router.patch('/:orderId', moderatorAuthMiddleware, orderController.order_update_ById);

router.delete('/:orderId', moderatorAuthMiddleware, orderController.order_delete_ById);

module.exports = router;