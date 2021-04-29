const Product = require("../models/product");
const mongoose = require("mongoose");
const Image = require("../models/image");
const fs = require("fs");
const PATH = require("path");

exports.product_get_all = (req, res, next) => {
  Product.find()
    .select("-__v")
    .exec()
    .then((docs) => {
      const response = {
        count: docs.length,
        products: docs.map((doc) => {
          return {
            name: doc.name,
            price: doc.price,
            productImage: doc.image,
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
};

exports.product_create = (req, res, next) => {
  Image.findById(req.body.imageId)
    .then((image) => {
      if (!image) {
        return res.status(404).json({
          message: "Image not found",
        });
      }
      const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        imageId: image,
      });
      return product.save();
    })
    .then((result) => {
      console.log(result);
      res.status(201).json({
        message: "Created new product successfully!",
        createdProduct: {
          name: result.name,
          price: result.price,
          image: result.image,
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
};

exports.product_get_one_ById = (req, res, next) => {
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
};

exports.product_update_byId = (req, res, next) => {
 
  const id = req.params.productId;
  /*
    így kell lekérni postman-ből:
    [{"propName" : "name", "value": "Mikrohullámú Sütő"}
  ]
    */
  let imageId = "";
  const updateOps = {};
  for (const ops of req.body) {
    if (ops.propName === "imageId") {
      imageId = ops.value;
    }
    updateOps[ops.propName] = ops.value;
  }

 //check request image
  Image.findById(imageId).then((image) => {
    if (!image) {
      return res.status(404).json({
        message: "Image not found",
      });
    } else {
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
    }
  });
};

exports.product_delete_byId = (req, res, next) => {
  const id = req.params.productId;
  const pathFile = PATH.resolve("");
  Product.findById(id)
    .exec()
    .then((product) => {
      if (!product) {
        return res.status(404).json({
          messages: "there is not a product with this id!",
        });
      } else {
        fs.unlink(pathFile + "\\" + product.productImage, (err) => {
          if (err) {
            console.log(err);
          } else {
            console.log("sikerült!");
          }
        });
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
    .catch((err) => {
      return res.status(500).json({
        Error: err,
      });
    });
};
