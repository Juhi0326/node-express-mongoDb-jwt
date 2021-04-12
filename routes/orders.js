const express = require('express');
const router = express.Router();

router.get('/', (req, res, next) => {
    res.status(200).json({
        message: 'this is a get request from order routes'
    });
});

router.post('/', (req, res, next) => {
    const order = {
        productId: req.body.productId,
        quantity: req.body.quantity
    }
    res.status(200).json({
        message: 'this is a post request from order routes',
        createdOrder: order
    });
});

router.get('/:orderId', (req, res, next) => {
    const id = req.params.orderId;
    res.status(200).json({
        message: 'this is a get request from order routes',
        id: id
    });
});

router.patch('/:orderId', (req, res, next) => {
    const id = req.params.orderId;
    res.status(201).json({
        message: 'updated order',
        id: id
    })
});

router.delete('/:orderId', (req, res, next) => {
    const id = req.params.orderId;
    res.status(200).json({
        message: 'deleted order',
        id: id
    })
});

module.exports = router;