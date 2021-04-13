const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Product = require('../models/product')

router.get('/', (req, res, next) => {
    res.status(200).json({
        message: 'this is a get request from product routes'
    });
});

router.post('/', (req, res, next) => {
    // const product = {
    //     name: req.body.name,
    //     price: req.body.price
    // }
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name: req.body.name,
        price: req.body.price
    });
    product.save().then((result) => {
        console.log(result);
    }).catch((err) => {
        console.log(err);
    });

    res.status(200).json({
        message: 'this is a post request from product routes',
        createdProduct: product
    });
});

router.get('/:productId', (req, res, next) => {
    const id = req.params.productId;
    res.status(200).json({
        message: 'this is a get request from product routes',
        id: id
    });
});

router.patch('/:productId', (req, res, next) => {
    const id = req.params.productId;
    res.status(201).json({
        message: 'updated product',
        id: id
    })
});

router.delete('/:productId', (req, res, next) => {
    const id = req.params.productId;
    res.status(200).json({
        message: 'deleted product',
        id: id
    })
});

module.exports = router;