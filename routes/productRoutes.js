const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require('multer');
const authMiddleware = require('../middleware/auth');
const productController = require('../controllers/products')

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
      cb(null, './uploads/');
    },
    filename: function(req, file, cb) {
      cb(null, Date.now() + file.originalname);
    }
  });
  
  const fileFilter =  (req, file, cb) => {

    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    //accept a file
    cb(null, true);
    } else {
    // reject a file
    cb(null, false);
    }
  };

const upload = multer({
    storage: storage, 
    limit: {fileSize: 1024 * 1024 * 5},
    fileFilter: fileFilter
});

const Product = require("../models/product");

router.get("/", productController.product_get_all);

router.post("/",authMiddleware, upload.single('productImage'), productController.product_create);

router.get("/:productId", productController.product_get_one_ById);

router.patch("/:productId", authMiddleware, productController.product_update_byId);

router.delete("/:productId", authMiddleware, productController.product_delete_byId);

module.exports = router;
