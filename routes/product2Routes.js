const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const adminAuthMiddleware = require('../middleware/authAdmin');
const userAuthMiddleware = require('../middleware/authUser');
const productController = require('../controllers/product2');
const {upload} = require('../multerStorage');

router.get('/', productController.product2_get_all);

router.get('/:productId', productController.product2_get_one_ById);

router.post('/',adminAuthMiddleware, upload.single('productImage'), productController.product2_create);

router.patch('/:productId', upload.single('productImage'), productController.product2_update_byId)

router.delete('/:productId', adminAuthMiddleware, productController.product2_delete_byId);


module.exports = router;