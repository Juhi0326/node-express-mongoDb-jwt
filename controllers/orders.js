const Order = require("../models/order");
const Product = require("../models/product");
const mongoose = require("mongoose");

exports.order_get_all = (req, res, next) => {
  Order.find()
    .populate("product", "-__v")
    .select("-__v")
    .exec()
    .then((docs) => {
      res.status(200).json({
        count: docs.length,
        orders: docs.map((doc) => {
          return {
            _id: doc._id,
            product: doc.product,
            quantity: doc.quantity,
            request: {
              type: "GET",
              url: "http://localhost:8081/orders/" + doc._id,
            },
          };
        }),
      });
    })
    .catch((err) => {
      res.status(500).json({
        Error: err,
      });
    });
};

exports.order_create = (req, res, next) => {
  Product.findById(req.body.productId)
    .then((product) => {
      if (!product) {
        return res.status(404).json({
          message: "Product not found",
        });
      }
      const order = new Order({
        _id: mongoose.Types.ObjectId(),
        quantity: req.body.quantity,
        product: req.body.productId,
      });
      return order.save();
    })
    .then((result) => {
      res.status(200).json({
        message: "Order created successfully!",
        createdOrder: {
          _id: result._id,
          product: result.product,
          quantity: result.quantity,
        },
        request: {
          type: "POST",
          url: "http://localhost:8081/orders/" + result._id,
        },
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        message: "Product not found",
        Error: err,
      });
    });
};

exports.order_get_ById = (req, res, next) => {
  Order.findById(req.params.orderId)
    .populate("product", "-__v")
    .exec()
    .then((order) => {
      if (!order) {
        return res.status(404).json({
          message: "Order not found",
        });
      }
      res.status(200).json({
        order: order,
        request: {
          type: "GET",
          url: "http://localhost:8081/orders",
        },
      });
    })
    .catch((err) => {
      res.status(500).json({
        message: "Order not found",
        Error: err,
      });
    });
};

exports.order_update_ById = (req, res, next) => {
  const id = req.params.orderId;
  /*
      így kell lekérni postman-ből:
      [{"propName" : "product", "value": "product id"}
    ]
      */
    let productId = "";
    const updateOps = {};
    for (const ops of req.body) {
      if (ops.propName === "productId") {
        productId = ops.value;
      }
      updateOps[ops.propName] = ops.value;
    }
  
    //check product
    Product.findById(productId).then((product) => {
      if (!product) {
        return res.status(404).json({
          message: "product not found",
        });
      } 
      Order.findById(id).then((order) => {
        if (!order) {
          return res.status(404).json({
            message: 'there is not an order with this id!'
          })
        }
      })
        Order.updateOne({ _id: id }, { $set: updateOps })
          .exec()
          .then((result) => {
            res.status(200).json({
              message: "order updated",
              request: {
                type: "PATCH",
                url: "http://localhost:8081/orders/" + id,
              },
            });
          })
          .catch((err) => {
            res.status(500).json({
              Error: err,
            });
          });
      
    }).catch((err) => {
      res.status(500).json({
        Error: err,
      });
    });
};

exports.order_delete_ById = (req, res, next) => {
  const id = req.params.orderId;
  Order.findById(id)
    .exec()
    .then((order) => {
      if (!order) {
        return res.status(404).json({
          messages: "there is not an order with this id!",
        });
      } else {
        Order.deleteOne({ _id: id })
          .exec()
          .then((order) => {
            res.status(200).json({
              message: "Order deleted successfully!",
              request: {
                type: "DELETE",
                url: "http://localhost:8081/orders",
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
      res.status(500).json({
        Error: err,
      });
    });
};
