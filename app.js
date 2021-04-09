const express = require('express');
const app = express();
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orders');

app.use('/products', productRoutes);
app.use('/orders', orderRoutes);

module.exports = app;