const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const multer = require('multer');
const authMiddleware = require('../middleware/auth');

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

router.get("/", (req, res, next) => {
  Product.find()
    .select("-_v")
    .exec()
    .then((docs) => {
      const response = {
        count: docs.length,
        products: docs.map((doc) => {
          return {
            name: doc.name,
            price: doc.price,
            productImage: doc.productImage,
            _id: doc._id,
            request: {
              type: "GET",
              url: "http://localhost:8081/products/" + doc._id,
            },
          };
        }),
      };
      res.status(200).json(response);
    })
    .catch((err) => {
      res.status(500).json({
        Error: err,
      });
    });
});

router.post("/",authMiddleware, upload.single('productImage'), (req, res, next) => {
    console.log(req.file);
  const product = new Product({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    price: req.body.price,
    productImage: req.file.path
  });
  product
    .save()
    .then((result) => {
      console.log(result);
      res.status(201).json({
        message: "Created new product successfully!",
        createdProduct: {
          name: result.name,
          price: result.price,
          id: result._id,
          request: {
            type: "GET",
            url: "http://localhost:8081/products/" + result._id,
          },
        },
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

router.get("/:productId", (req, res, next) => {
  const id = req.params.productId;
  Product.findById(id)
    .select("-__v")
    .exec()
    .then((doc) => {
      if (doc) {
        console.log(doc);
        res.status(200).json({
          product: doc,
          request: {
            type: "GET",
            url: "http://localhost:8081/products",
          },
        });
      } else {
        res.status(404).json({
          message: "There is not a product with this id!",
        });
      }
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
      });
    });
});

router.patch("/:productId", authMiddleware, (req, res, next) => {
  const id = req.params.productId;
  /*
  így kell lekérni postman-ből:
  [{"propName" : "name", "value": "Mikrohullámú Sütő"}
]
  */
  const updateOps = {};
  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }
  Product.updateOne({ _id: id }, { $set: updateOps })
    .exec()
    .then((result) => {
      res.status(200).json({
        message: "Product updated",
        request: {
          type: "PATCH",
          url: "http://localhost:8081/products/" + id,
        },
      });
    })
    .catch((err) => {
      res.status(500).json({
        Error: err,
      });
    });
});

router.delete("/:productId", authMiddleware, (req, res, next) => {
  const id = req.params.productId;
  Product.findById(id)
  .exec()
  .then(product => {
    if (!product) {
      return res.status(404).json({
        messages: 'there is not a product with this id!'
      })
    }
    else {
      Product.deleteOne({ _id: id })
      .exec()
      .then((result) => {
        res.status(200).json({
          message: "product deleted successfully!",
          request: {
            type: "DELETE",
            url: "http://localhost:8081/products",
            body: { name: "String", price: "Number" },
            id: id,
          },
        });
      })
      .catch((err) => {
        res.status(500).json({
          Error: err,
        });
      });
    }
  })
  .catch(err => {
    return res.status(500).json({
     Error: err
    })
  })
 
});

module.exports = router;
