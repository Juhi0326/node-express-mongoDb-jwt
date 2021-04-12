const express = require("express");
const app = express();
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orders");
const morgan = require("morgan");

app.use(morgan("dev"));

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use("/products", productRoutes);
app.use("/orders", orderRoutes);

app.use((req, res, next) => {
  const error = new Error("page not found");
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
