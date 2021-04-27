const Product = require("../models/product");
const mongoose = require("mongoose");
const fs = require("fs");

exports.product_get_all = (req, res, next) => {
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
};

exports.product_create = (req, res, next) => {
  console.log(req.file);
  const product = new Product({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    price: req.body.price,
    productImage: req.file.path,
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
  //check request picture
  let target = null;
  req.body.forEach(function (arrayItem) {
    Object.keys(arrayItem).forEach((key) => {
      if (arrayItem[key] === "Picture") {
        let newPicture = "";
        newPicture = arrayItem.value;
        let dot = newPicture.indexOf(".");
        newPicture = newPicture.substring(8, dot);

        let directory_name =
          "C:/Users/juhi0/OneDrive/Dokumentumok/Node js/node-express-mongoDb-jwt/uploads";
        let filenames = fs.readdirSync(directory_name);

        target = filenames.filter((file) => {
          return file.indexOf(newPicture) >= 0 ? true : false;
        });
      }
    });
  });

  if (target.length === 0) {
    res.status(404).json({
      message: "there is not a picture with this file name!",
    });
  } else {
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
  }
};

exports.product_delete_byId = (req, res, next) => {
  const id = req.params.productId;
  Product.findById(id)
    .exec()
    .then((product) => {
      if (!product) {
        return res.status(404).json({
          messages: "there is not a product with this id!",
        });
      } else {
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
