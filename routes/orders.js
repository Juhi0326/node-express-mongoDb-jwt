const { request } = require("express");
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const Product = require("../models/product");
const Order = require("../models/order");

router.get("/", (req, res, next) => {
  Order.find()
    .populate("product", "-__v")
    .select("-_v")
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
});
router.post("/", (req, res, next) => {
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
});

router.get("/:orderId", (req, res, next) => {
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
});

router.patch("/:orderId", (req, res, next) => {
  const id = req.params.orderId;
  /*
    így kell lekérni postman-ből:
    [{"propName" : "product", "value": "product id"}
  ]
    */
  const updateOps = {};
  for (const ops of req.body) {
    updateOps[ops.propName] = ops.value;
  }
  Order.updateOne({ _id: id }, { $set: updateOps })
    .exec()
    .then((result) => {
      console.log(result);
      res.status(200).json({
        message: "Order updated",
        request: {
          type: "PATCH",
          url: "http://localhost:8081/orders/",
          updatedOrderId: req.params.orderId,
        },
      });
    })
    .catch((err) => {
      res.status(500).json({
        Error: err,
      });
    });
});

router.delete("/:orderId", (req, res, next) => {
  Order.deleteOne({ _id: req.params.orderId })
    .exec()
    .then((order) => {
      res.status(200).json({
        message: "Order deleted",
        request: {
          type: "POST",
          url: "http://localhost:8081/orders",
          productId: { name: "ID", quantity: "Number" },
          id: _id,
        },
      });
    })
    .catch((err) => {
      res.status(500).json({
        message: "Order not found",
        Error: err,
      });
    });
});

module.exports = router;
