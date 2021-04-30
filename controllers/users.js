const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config({ path: "../.env" });
const jwt = require("jsonwebtoken");
const User = require("../models/user");

exports.user_signUp = (req, res, next) => {
  User.find({ email: req.body.email })
    .exec()
    .then((user) => {
      if (user.length >= 1) {
        return res.status(409).json({
          message: "Email is already exist!",
        });
      } else {
        bcrypt.hash(req.body.password, 10, (err, hash) => {
          if (err) {
            return res.status(500).json({
              Error: err,
            });
          } else {
            const user = new User({
              _id: new mongoose.Types.ObjectId(),
              email: req.body.email,
              password: hash,
              role: req.body.role,
            });
            user
              .save()
              .then((result) => {
                res.status(201).json({
                  message: "user created!",
                });
              })
              .catch((err) => {
                console.log(err);
                res.status(500).json({
                  Error: err,
                });
              });
          }
        });
      }
    });
};

exports.user_login = (req, res, next) => {
  User.find({ email: req.body.email })
    .exec()
    .then((user) => {
      if (user < 1) {
        return res.status(404).json({
          messages: "Auth failed!",
        });
      }
      bcrypt.compare(req.body.password, user[0].password, (err, result) => {
        if (err) {
          return res.status(404).json({
            messages: "Auth failed!",
          });
        }
        if (result) {
          console.log(user[0].role);
          const token = jwt.sign(
            {
              email: user[0].email,
              userId: user[0]._id,
              role: user[0].role,
            },
            process.env.secret_JWT_KEY,
            { expiresIn: "24h" }
          );

          return res.status(200).json({
            message: "Auth successful",
            token,
            role: user[0].role,
          });
        }
        res.status(404).json({
          messages: "Auth failed!",
        });
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        Error: err,
      });
    });
};

exports.user_delete = (req, res, next) => {
  User.deleteOne({ _id: req.params.userId })
    .exec()
    .then((result) => {
      res.status(201).json({
        message: "User is deleted.",
      });
    })
    .catch((err) => {
      res.status(500).json({
        Error: err,
      });
    });
};
