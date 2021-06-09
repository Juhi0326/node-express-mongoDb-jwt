const Product = require('../models/product');
const mongoose = require('mongoose');
const Image = require('../models/image');

exports.product_get_all = (req, res, next) => {
  Product.find()
    .select('-__v')
    .exec()
    .then((docs) => {
      const response = {
        count: docs.length,
        products: docs.map((doc) => {
          return {
            name: doc.name,
            price: doc.price,
            description: doc.description,
            productImage: doc.image,
            _id: doc._id,
            request: {
              type: 'GET',
              url: 'http://localhost:8081/products/' + doc._id,
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
          message: 'Image not found',
        });
      }
      const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price,
        description: req.body.description,
        imageId: req.body.imageId,
        imagePath: image.imagePath
      });
      return product.save();
    })
    .then((result) => {
      console.log(result);
      res.status(201).json({
        message: 'Created new product successfully!',
        createdProduct: {
          name: result.name,
          price: result.price,
          description: result.description,
          imageId: result.imageId,
          imagePath: result.imagePath,
          id: result._id,
          request: {
            type: 'GET',
            url: 'http://localhost:8081/products/' + result._id,
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
    .select('-__v')
    .exec()
    .then((doc) => {
      if (doc) {
        console.log(doc);
        res.status(200).json({
          product: doc,
          request: {
            type: 'GET',
            url: 'http://localhost:8081/products',
          },
        });
      } else {
        res.status(404).json({
          message: 'There is not a product with this id!',
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
    [{'propName' : 'name', 'value': 'Mikrohullámú Sütő'}
  ]
    */
  let imageId = '';
  const updateOps = {};
  for (const ops of req.body) {
    if (ops.propName === 'imageId') {
      imageId = ops.value;
    }
    updateOps[ops.propName] = ops.value;
  }
  //check request image
  if (imageId !== '') {
    Image.findById(imageId)
      .then((image) => {
        if (!image) {
          return res.status(404).json({
            message: 'Image not found',
          });
        }
        Product.findById(id).then((product) => {
          if (!product) {
            return res.status(404).json({
              message: 'there is not a product with this id!',
            });
          }
        });
        const imgPath =  {imagePath: image.imagePath}
        const mergedOps = {...updateOps,...imgPath}
        Product.updateOne({ _id: id }, { $set: mergedOps })
          .exec()
          .then((result) => {
            res.status(200).json({
              message: 'Product updated',
              request: {
                type: 'PATCH',
                url: 'http://localhost:8081/products/' + id,
              },
            });
          })
          .catch((err) => {
            res.status(500).json({
              Error: err,
            });
          });
      })
      .catch((err) => {
        res.status(500).json({
          Error: err,
        });
      });
  } else {
    Product.findById(id).then((product) => {
      if (!product) {
        return res.status(404).json({
          message: 'there is not a product with this id!',
        });
      }
    });
    Product.updateOne({ _id: id }, { $set: updateOps })
      .exec()
      .then((result) => {
        res.status(200).json({
          message: 'Product updated',
          request: {
            type: 'PATCH',
            url: 'http://localhost:8081/products/' + id,
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
          messages: 'there is not a product with this id!',
        });
      } else {
        Product.deleteOne({ _id: id })
          .exec()
          .then((result) => {
            res.status(200).json({
              message: 'product deleted successfully!',
              request: {
                type: 'DELETE',
                url: 'http://localhost:8081/products',
                body: { name: product.name, price: product.price },
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
