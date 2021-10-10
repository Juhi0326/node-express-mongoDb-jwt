const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: '../.env' });
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const emailModule = require('../modules/email')
const nodemailer = require('nodemailer');


exports.user_signUp = (req, res, next) => {
  if (req.body.password === '') {
    return res.status(409).json({
      message: 'missing password',
    });
  }
  User.find({ email: req.body.email })
    .exec()
    .then((user) => {
      if (user.length >= 1) {
        return res.status(409).json({
          message: 'Email is already exist!',
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
              userName: req.body.userName,
              email: req.body.email,
              password: hash,
              role: req.body.role,
            });
            user
              .save()
              .then((result) => {
                res.status(201).json({
                  message: 'user created!',
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
          messages: 'Auth failed!',
        });
      }
      bcrypt.compare(req.body.password, user[0].password, (err, result) => {
        if (err) {
          return res.status(404).json({
            messages: 'Auth failed!',
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
            { expiresIn: '24h' }
          );

          return res.status(200).json({
            message: 'Auth successful',
            accessToken: token,
            userName: user[0].userName,
            role: user[0].role,
          });
        }
        res.status(404).json({
          messages: 'Auth failed!',
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
        message: 'User is deleted.',
      });
    })
    .catch((err) => {
      res.status(500).json({
        Error: err,
      });
    });
};
const usePasswordHashToMakeToken = ({
  password: passwordHash,
  _id: userId,
  createdAt
}) => {
  console.log(process.env.password_reset_secret_JWT_KEY)
  const secret = passwordHash + "-" + createdAt
  const token = jwt.sign({ userId }, secret, {
    expiresIn: '3h' // 1 hour
  })
  return token
}
exports.sendPasswordResetEmail = async (req, res) => {
  console.log(req.body)
  const { email } = req.body
  let user
  try {
    user = await User.findOne({ email }).exec()
  } catch (err) {
    res.status(404).json("No user with that email")
  }
  const token = usePasswordHashToMakeToken(user)

  const url = emailModule.getPasswordResetURL(user, token)
  const emailTemplate = emailModule.resetPasswordTemplate(user, url)

  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  let mailOptions = {
    from: 'NOREPLY',
    to: 'juhi0326@gmail.com',
    subject: 'password reset email',
    html: `<p>hi ${user.userName || user.email}! </p>
    <p> this is the link:</p>
    <a href=${url}>${url}</a>
    `
  }
  transporter.sendMail(mailOptions, function (err, data) {
    if (err) {
      console.log(err)
      return res.status(500).json({
        messages: 'Error sending email!',
      });
    } else {
      console.log('email sent!')
      return res.status(200).json({
        messages: 'email sent!',
      });
    }
  })
}

exports.receiveNewPassword = (req, res) => {
  const { userId, token } = req.params
  const { password } = req.body
  User.findOne({ _id: userId })
    .then(user => {
      const secret = user.password + "-" + user.createdAt
      jwt.verify(token, secret, function (error) {
        if (error) {
          console.log('error')
          return res.status(402).json({
            messages: 'token is wrong or expired',
          });
        }
        const payload = jwt.decode(token, secret)
        if (payload.userId === user.id) {
          bcrypt.genSalt(10, function (err, salt) {
            if (err) return
            bcrypt.hash(password, salt, function (err, hash) {
              if (err) return
              User.findOneAndUpdate({ _id: userId }, { password: hash })
                .then(() => res.status(202).json("Password changed accepted"))
                .catch(err => res.status(500).json(err))
            })
          })
        }
      })
    })
    .catch(() => {
      res.status(404).json("Invalid user")
    })
}
