const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { transporter, getPasswordResetURL, resetPasswordTemplate } = require('../modules/email');


exports.user_signUp = (req, res, next) => {
  if (req.body.password === '') {
    return res.status(409).json({
      message: 'missing password',
    });
  }
  /*Min character = 6
  Max character = 10
  Min 1 lowercase character
  Min 1 uppercase character
  Min 1 number
  Min 1 special characters */
  const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[ -/:-@\[-`{-~]).{6,10}$/g
  if (pattern.test(req.body.password) === false) {
    return res.status(409).json({
      message: 'invalid password',
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
    expiresIn: '1h' // 1 hour
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

  const url = getPasswordResetURL(user, token)
  const emailTemplate = resetPasswordTemplate(user, url)


  let mailOptions = {
    from: 'NOREPLY',
    to: user.email,
    subject: 'password reset link',
    html: `
    <p>Hey ${user.userName || user.email},</p>
    <p>We heard that you lost your password. Sorry about that!</p>
    <p>But don’t worry! You can use the following link to reset your password:</p>
    <a href=${url}>${url}</a>
    <p>If you don’t use this link within 1 hour, it will expire.</p>
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
  /*Min character = 6
    Max character = 10
    Min 1 lowercase character
    Min 1 uppercase character
    Min 1 number
    Min 1 special characters */
  const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[ -/:-@\[-`{-~]).{6,10}$/g
  if (pattern.test(req.body.password) === false) {
    return res.status(409).json({
      message: 'invalid password',
    });
  }
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
