const Product2 = require('../models/product2');
const mongoose = require('mongoose');
const fs = require("fs");
const PATH = require("path");
const { countDiscountedPrice } = require('../modules/services/productService');
const { deleteImageFromServer } = require('../modules/services/imageService');
const { parseInt } = require('lodash');

exports.product2_get_all = (req, res, next) => {
    Product2.find()
        .select('-__v')
        .exec()
        .then((docs) => {
            const response = {
                count: docs.length,
                products: docs.map((doc) => {
                    return {
                        name: doc.name,
                        price: doc.price,
                        discountedPrice: doc.discountedPrice,
                        discountPercentage: doc.discountPercentage,
                        description: doc.description,
                        imagePath: doc.imagePath,
                        _id: doc._id,
                        createdAt: doc.createdAt,
                        updatedAt: doc.updatedAt,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:8081/products2/' + doc._id,
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

exports.product2_get_one_ById = (req, res, next) => {
    const id = req.params.productId;
    Product2.findById(id)
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

exports.product2_create = (req, res, next) => {
    let discountedPrice = null
    let price = parseInt(req.body.price)
    let discountPercentage = parseInt(req.body.discountPercentage)
    discountedPrice = countDiscountedPrice(discountPercentage, price)
    const product2 = new Product2({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: price,
        discountedPrice: discountedPrice,
        discountPercentage: discountPercentage,
        description: req.body.description,
        imagePath: req.file.path
    });
    product2.save()
        .then((result) => {
            console.log(result);
            res.status(201).json({
                message: 'Created new product successfully!',
                createdProduct: {
                    name: result.name,
                    price: result.price,
                    discountedPrice: result.discountedPrice,
                    discountPercentage: result.discountPercentage + '%',
                    description: result.description,
                    imagePath: result.imagePath,
                    id: result._id,
                    createdAt: result.createdAt,
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
exports.product2_update_byId = async (req, res, next) => {
    let oldImage = null
    const id = req.params.productId
    try {
        const product = await Product2.findById(id)
        if (!product) {
            throw new Error('missing product')
        }
        let updateOps = {}
        updateOps = { ...product }
        if (req.file) {
            oldImage = updateOps._doc.imagePath
            updateOps._doc.imagePath = req.file.path
            deleteImageFromServer(oldImage)
        }
        //console.log(updateOps._doc.imagePath)
        if (req.body.discountPercentage && req.body.discountPercentage !== '0') {
            if (req.body.price) {
                let price = parseInt(req.body.price)
                let discountPercentage = parseInt(req.body.discountPercentage)
                updateOps._doc.price = price
                updateOps._doc.discountedPrice = countDiscountedPrice(discountPercentage, price)
                updateOps._doc.discountPercentage = discountPercentage
            } else {
                let discountPercentage = parseInt(req.body.discountPercentage)
                updateOps._doc.discountedPrice = countDiscountedPrice(discountPercentage, updateOps._doc.price)
                updateOps._doc.discountPercentage = discountPercentage
            }
        }
        if (req.body.description) {
            updateOps._doc.description = req.body.description
        }
        if (req.body.name) {
            updateOps._doc.name = req.body.name
        }
        Product2.updateOne({ _id: id }, { $set: updateOps })
            .exec()
            .then((result) => {
                res.status(200).json({
                    message: 'Product updated',
                    request: {
                        type: 'PATCH',
                        url: 'http://localhost:8081/products2/' + id,
                    },
                });
            })
            .catch((err) => {
                res.status(500).json({
                    Error: err,
                });
            });
    } catch (err) {
        console.log(err);
         res.status(500).json({
            error: err.message,
        });
    }
}

exports.product2_delete_byId = (req, res, next) => {
    const id = req.params.productId;
    Product2.findById(id)
        .exec()
        .then((product) => {
            console.log(product._doc.imagePath)
            let oldImage = product._doc.imagePath
            if (!product) {
                return res.status(404).json({
                    messages: 'there is not a product with this id!',
                });
            } else {
                Product2.deleteOne({ _id: id })
                    .exec()
                    .then((result) => {
                        deleteImageFromServer(oldImage)
                        res.status(200).json({
                            message: 'product deleted successfully!',
                            request: {
                                type: 'DELETE',
                                url: 'http://localhost:8081/products2',
                                body: { name: product.name, price: product.price },
                                id: id,
                            },
                        });
                    })
                    .catch((err) => {
                        console.log(err)
                        res.status(500).json({
                            Error: err,
                        });
                    });
            }
        })
        .catch((err) => {
            console.log(err)
            return res.status(500).json({
                Error: err,
            });
        });
};