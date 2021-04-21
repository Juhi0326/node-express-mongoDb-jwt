const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require('multer');
const adminAuthMiddleware = require('../middleware/authAdmin');
const userAuthMiddleware = require('../middleware/authUser');
const productController = require('../controllers/products');

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

router.get("/", userAuthMiddleware, productController.product_get_all);

router.post("/",adminAuthMiddleware, upload.single('productImage'), productController.product_create);

router.get("/:productId", userAuthMiddleware, productController.product_get_one_ById);

router.patch("/:productId", adminAuthMiddleware, productController.product_update_byId);

router.delete("/:productId", adminAuthMiddleware, productController.product_delete_byId);

module.exports = router;
