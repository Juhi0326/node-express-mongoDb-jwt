const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Product = require("../models/product");

router.get("/", (req, res, next) => {
  Product.find()
    .exec()
    .then((docs) => {
        if (docs.length>0) {
            res.status(200).json(docs);
        } else {
            res.status(200).json({
                message: 'There is no any product!'
            })
        } 
    })
    .catch((err) => {
      res.status(500).json({
        Error: err,
      });
    });
});

router.post("/", (req, res, next) => {
  const product = new Product({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    price: req.body.price,
  });
  product
    .save()
    .then((result) => {
      console.log(result);
      res.status(200).json({
        message: "this is a post request from product routes",
        createdProduct: result,
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
    .exec()
    .then((doc) => {
      if (doc) {
        console.log(doc);
        res.status(200).json(doc);
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

router.patch("/:productId", (req, res, next) => {
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
  Product.updateOne({_id: id}, {$set: updateOps})
  .exec()
  .then((result) => {
      res.status(200).json(result);
  })
  .catch((err) => {
      res.status(500).json({
          Error: err
      })
  })
});

router.delete("/:productId", (req, res, next) => {
  const id = req.params.productId;
  Product.remove({_id: id})
  .exec()
  .then((result) => {
      res.status(200).json(result);
  })
  .catch((err) => {
      res.status(500).json({
          Error: err
      })
  })
});

module.exports = router;
