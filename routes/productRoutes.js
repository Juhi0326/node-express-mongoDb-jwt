const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const adminAuthMiddleware = require('../middleware/authAdmin');
const userAuthMiddleware = require('../middleware/authUser');
const productController = require('../controllers/products');
const {upload} = require('../multerStorage');


router.get("/", userAuthMiddleware, productController.product_get_all);

router.post("/",adminAuthMiddleware, upload.single('productImage'), productController.product_create);

router.get("/:productId", userAuthMiddleware, productController.product_get_one_ById);

router.patch("/:productId", adminAuthMiddleware, productController.product_update_byId);

router.delete("/:productId", adminAuthMiddleware, productController.product_delete_byId);

module.exports = router;
