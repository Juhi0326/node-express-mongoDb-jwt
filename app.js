require('dotenv').config({ path: '.env' });
const express = require('express');
const app = express();
const product2Routes = require('./routes/product2Routes')
const orderRoutes = require('./routes/orders');
const userRoutes = require('./routes/users');
const homePageRoutes = require('./routes/homaPage2');
const mongoose = require('mongoose');
const morgan = require('morgan');


// database connection
const dbURI = process.env.URI;

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true,  useFindAndModify: false, useCreateIndex:true })
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
  'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-access-token');

  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'POST, PUT, PATCH, GET, DELETE');
    return res.status(200).json({});
  }
  next();
});
app.use('/uploads', express.static('uploads'));


app.use('/homePage', homePageRoutes);
app.use('/products2', product2Routes);
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
