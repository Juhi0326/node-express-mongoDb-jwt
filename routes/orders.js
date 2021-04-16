const express = require("express");
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const orderController = require('../controllers/orders');

router.get("/", authMiddleware, orderController.order_get_all);

router.post("/", authMiddleware, orderController.order_create);

router.get("/:orderId", authMiddleware, orderController.order_get_ById );

router.patch("/:orderId", authMiddleware, orderController.order_update_ById);

router.delete("/:orderId", authMiddleware, orderController.order_delete_ById);

module.exports = router;
