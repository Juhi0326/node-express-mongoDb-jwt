const express = require('express');
const app = express();
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');
const homeRoute= require('./routes/home');
const homeSetup = require('./routes/homeSetup');
const imageSetupRoutes = require('./routes/image');
const mongoose = require('mongoose');
const morgan = require('morgan');
require('dotenv').config();


// database connection
const dbURI = `mongodb+srv://juhi:${process.env.dbPass}@cluster0.hnfsi.mongodb.net/express-API?retryWrites=true&w=majority`;

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex:true })
  .then((result) => {
  console.log('db connected');
}).catch((err) => console.log(err));


app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 
  'Origin, X-Requested-With, Content-Type, Accept, Authorization');

  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'POST, PUT, PATCH, GET, DELETE');
    return res.status(200).json({});
  }
  next();
});

app.use('/home', homeRoute);
app.use('/home-setup', homeSetup);
app.use('/image-setup', imageSetupRoutes);
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/users', userRoutes);

app.use((req, res, next) => {
  const error = new Error('page not found');
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});

module.exports = app;
