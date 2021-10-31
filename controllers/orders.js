const Order = require('../models/order');
const Product = require('../models/product');
const User = require('../models/user')
const loadash = require('lodash');
const mongoose = require('mongoose');

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
            fullCharge: doc.fullCharge,
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
        return res.status(404).json({
          message: 'user not found',
        });
      }
    }).catch((err) => {
      console.log(err);
      res.status(500).json({
        message: 'user not found',
        Error: err,
      });
    })

    Product.find()
      .exec()
      .then((products) => {
        if (!products) {
          return res.status(404).json({
            message: 'Products not found',
          });
        }
        const error = []
        let errorIds = ''
        let paramProducts = req.body.products || []
        let fullCharge = null
        paramProducts.map(obj => {
          loadash.forEach(obj, function (value, key) {
            if (key == '_id') {
              let talalat = products.filter(product => JSON.stringify(product._id) === JSON.stringify(value._id));
              if (talalat.length === 0) {
                error.push(value)
              } else {
                console.log(talalat[0].price)
                //obj = {...obj, price: talalat[0].price, productName: talalat[0].name }
                obj = Object.assign(obj, { price: talalat[0].price }, { productName: talalat[0].name }, { storno: false })
                console.log(obj)
                console.log(obj.quantity)
                if (obj.quantity < 1) {
                  errorIds = obj._id._id
                  throw new Error(`Products with this ids: ( ${errorIds} ) can not be 0!`)
                }
                fullCharge += talalat[0].price * obj.quantity
              }
            }
          })
        })
        if (error.length > 0) {
          error.forEach(err => {
            console.log(err._id)
            errorIds += err._id + ','
          })
          errorIds = errorIds.substring(0, errorIds.length - 1)
          throw new Error(`Products with this ids: ( ${errorIds} ) not found`)
        }
        console.log(paramProducts)
        const order = new Order({
          _id: mongoose.Types.ObjectId(),
          products: paramProducts,
          user: req.body.userId,
          fullCharge: fullCharge,
          accountAddress: req.body.accountAddress,
          deliveryAddress: req.body.deliveryAddress,
        });

        /* így kell beküldeni postman-ből:
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
        res.status(200).json({
          message: 'Order created successfully!',
          createdOrder: {
            _id: result._id,
            products: result.products,
            user: result.user,
            fullCharge: result.fullCharge,
            accountAddress: result.accountAddress,
            deliveryAddress: result.deliveryAddress
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
  } catch (error) {
    console.log(error)
  }

};
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
  let updateObject = {}
  const error = []
  let tempFullCharge = null;
  console.log(req.body.userId)
  if (req.body.userId !== '') {
    try {
      await User.findById(req.body.userId).then((user) => {
        if (!user) {
          return res.status(404).json({
            message: 'user not found',
          });
        }
      })
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: 'user not found',
        Error: error,
      });
    }
  }
  await Order.findById(id)
    .exec()
    .then((order) => {
      console.log(order._doc)
      tempOrderObject = Object.assign(tempOrderObject, order._doc)
    }).catch((err) => {
      console.log(err)
    })
  loadash.forEach(req.body, function (value, key) {
    if (key === 'products' && loadash.isEmpty(value) === false) {
      loadash.forEach(value, function (value2, key2) {
        if (key2 === 'change' && value2.length !== 0) {
          for (let index = 0; index < value2.length; index++) {
            const element = value2[index];
            let index2 = tempOrderObject.products.findIndex(element => {
              if (JSON.stringify(element._id) == JSON.stringify(value2[index].productId._id)) {
                return true;
              }
            });
            if (index2 > -1) {
              updateObject = {
                ...updateObject, ...{
                  ['products.' + index2 + '.quantity']: value2[index].quantity,
                  ['products.' + index2 + '.storno']: value2[index].storno
                }
              }
              tempOrderObject.products[index2].storno = value2[index].storno
              tempOrderObject.products[index2].quantity = value2[index].quantity
            } else {
              error.push(`There is no product with this id (${JSON.stringify(value2[index].productId._id)}) in this order`)
            }
          }
        }
      })
    }
    
    if (key === 'userId' && loadash.isEmpty(value) === false) {
      updateObject = { ...updateObject, ...{ user: req.body.userId } }
    }
    if (key === 'accountAddress' && loadash.isEmpty(value) === false) {
      console.log(value)
      updateObject = { ...updateObject, ...{ accountAddress: req.body.accountAddress } }
    }
    if (key === 'deliveryAddress' && loadash.isEmpty(value) === false) {
      console.log(value)
      updateObject = { ...updateObject, ...{ deliveryAddress: req.body.deliveryAddress } }
    }
  })
  if (loadash.isEmpty(error) === false) {
    return res.status(404).json({
      messages: error,
    });
  }
  console.log(tempOrderObject)
  loadash.forEach(tempOrderObject, function (value, key){
    if (key === 'products') {
      loadash.forEach(value, function (value2, key2) {
        if (value2.storno === true) {
          tempFullCharge += 0
        } else {
          tempFullCharge += value2.price * value2.quantity
        }
      });
    }
  });
  updateObject = {
    ...updateObject, ...{fullCharge: tempFullCharge   
    }
  }
console.log(updateObject)
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
    .catch((err) => {
      console.log(err)
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
