const Order = require('../models/order');
const Product = require('../models/product');
const User = require('../models/user')
const loadash = require('lodash');
const mongoose = require('mongoose');
const { checkProducts, compileOrderUpdateObject } = require('../modules/services/orderService')

exports.order_get_all = (req, res, next) => {
  Order.find()
    .populate('product', '-__v')
    .select('-__v')
    .exec()
    .then((docs) => {
      res.status(200).json({
        count: docs.length,
        orders: docs.map((doc) => {
          return {
            _id: doc._id,
            products: doc.products,
            quantity: doc.quantity,
            user: doc.user,
            fullProductPrice: doc.fullProductPrice,
            accountAddress: doc.accountAddress,
            deliveryAddress: doc.deliveryAddress,
            request: {
              type: 'GET',
              url: 'http://localhost:8081/orders/' + doc._id,
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

exports.order_create = async (req, res, next) => {
  try {
    await User.findById(req.body.userId).then((user) => {
      if (!user) {
        throw new Error('user not found')
      }
    })
  } catch (error) {
    return res.status(404).json({
      message: 'user not found',
    });
  }

  Product.find()
    .exec()
    .then((products) => {
      if (!products) {
        return res.status(404).json({
          message: 'Products not found',
        });
      }
      let paramProducts = req.body.products || []
      // logic in orderService
      const productArray = checkProducts(paramProducts, products)
      //get fullProductPrice variable
      let fullProductPrice = productArray[productArray.length - 1].fullProductPrice
      //delete fullProductPrice from productArray
      productArray.pop()
      const order = new Order({
        _id: mongoose.Types.ObjectId(),
        products: productArray,
        user: req.body.userId,
        fullProductPrice: fullProductPrice,
        accountAddress: req.body.accountAddress,
        deliveryAddress: req.body.deliveryAddress,
        status: 'active'
      });

      /* így kell beküldeni postman-ből:
      send from postman
{  "products": [
  {"_id":{ "_id": "60bf53d36ffbb46420444e8a"}, "quantity":100},
  {"_id":{ "_id": "60c785d3b257f155285a9e14"}, "quantity":8}
    
 ],
  "userId":"61482bf79ac7f650f0119714",
   "accountAddress": {
          "postCode": 1031,
          "Location": "Budapest",
          "street": "valami utca",
          "houseNUmber": 3,
          "otherAddressData": ""
        },
        "deliveryAddress": {
          "postCode": 1031,
          "Location": "Budapest",
          "street": "valami tér",
          "houseNUmber": 3,
          "otherAddressData": ""
        }
}
      */

      console.log(order)
      return order.save();
    })
    .then((result) => {
      console.log(result)
      res.status(200).json({
        message: 'Order created successfully!',
        createdOrder: {
          _id: result._id,
          products: result.products,
          user: result.user,
          fullProductPrice: result.fullProductPrice,
          accountAddress: result.accountAddress,
          deliveryAddress: result.deliveryAddress,
          status: result.status
        },
        request: {
          type: 'POST',
          url: 'http://localhost:8081/orders/' + result._id,
        },
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        message: err.message
      });
    });
}

exports.order_get_ById = (req, res, next) => {
  Order.findById(req.params.orderId)
    .populate('product', '-__v')
    .exec()
    .then((order) => {
      if (!order) {
        return res.status(404).json({
          message: 'Order not found',
        });
      }
      res.status(200).json({
        order: order,
        request: {
          type: 'GET',
          url: 'http://localhost:8081/orders',
        },
      });
    })
    .catch((err) => {
      res.status(500).json({
        message: 'Order not found',
        Error: err,
      });
    });
};
exports.order_update_ById = async (req, res, next) => {
  /*
  így kell beküldeni postman-ből:
  {
    "products": {
        "change": [
            {
                "productId": {
                    "_id": "60c785d3b257f155285a9e14"
                },
                "quantity": 500,
                "storno": true
            },
            {
                "productId": {
                    "_id": "60bf53d36ffbb46420444e8a"
                },
                "quantity": 18,
                "storno": false
            }
        ]
    },
    "userId": "61482ba39ac7f650f0119712",
    "accountAddress": {
        "postCode": 1035,
        "Location": "Budapest",
        "street": "Juhász Gyula utca",
        "houseNUmber": 36,
        "otherAddressData": ""
    },
    "deliveryAddress": {
        "postCode": 1039,
        "Location": "Budapest",
        "street": "Őrlő köz",
        "houseNUmber": 3,
        "otherAddressData": ""
    }
}
  */
  const id = req.params.orderId;
  let tempOrderObject = {}
  const error = []
  let tempfullProductPrice = null;

  try {
    if (req.body.userId) {
      await User.findById(req.body.userId).then((user) => {
        if (!user) {
          throw new Error('User not found')
        }
      })
    }
    await Order.findById(id)
      .exec()
      .then((order) => {
        if (!order) {
          throw new Error('Order not found')
        }
        tempOrderObject = Object.assign(tempOrderObject, order._doc)
      })
    const orderObject = req.body;
    updateObject = compileOrderUpdateObject(tempOrderObject, updateObject, orderObject);
    Order.updateOne(
      { _id: id },
      {
        $set: updateObject
      }
    )
      .exec()
      .then((result) => {
        res.status(200).json({
          message: 'order updated',
          request: {
            type: 'PATCH',
            url: 'http://localhost:8081/orders/' + id,
          },
        });
      })
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }

};

exports.closeOrderById = (req, res, next) => {

  if (req.body.status !== 'orderStorno' && req.body.status !== 'completed') {
    return res.status(404).json({
      message: 'order status have to be "completed", or orderStorno!',
    });
  }

  Order.findById(req.params.orderId)
    .exec()
    .then((order) => {
      if (!order) {
        return res.status(404).json({
          message: 'Order not found',
        });
      }
      Order.updateOne(
        { _id: req.params.orderId },
        {
          $set: { status: req.body.status }
        }
      )
        .exec()
        .then((result) => {
          res.status(200).json({
            message: 'order updated',
            request: {
              'new order status': req.body.status,
              type: 'PATCH',
              url: 'http://localhost:8081/orders/' + req.params.orderId,
            },
          });
        })
    }).catch((err) => {
      return res.status(500).json({
        message: err.message,
      });
    })

}
exports.order_delete_ById = (req, res, next) => {
  const id = req.params.orderId;
  Order.findById(id)
    .exec()
    .then((order) => {
      if (!order) {
        return res.status(404).json({
          messages: 'there is not an order with this id!',
        });
      } else {
        Order.deleteOne({ _id: id })
          .exec()
          .then((order) => {
            res.status(200).json({
              message: 'Order deleted successfully!',
              request: {
                type: 'DELETE',
                url: 'http://localhost:8081/orders',
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
