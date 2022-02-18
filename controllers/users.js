const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Order = require('../models/order');
const loadash = require('lodash');
const { transporter, getPasswordResetURL, resetPasswordTemplate } = require('../modules/email');
const { deleteImageFromServer } = require('../modules/services/imageService');

exports.user_signUp2 = (req, res, next) => {
  if (req.body.password === '') {
    return res.status(409).json({
      message: 'missing password',
    });
  }
  /*Min character = 6
  Max character = 20
  Min 1 lowercase character
  Min 1 uppercase character
  Min 1 number
  Min 1 special characters */
  const pattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[ -/:-@\[-`{-~]).{6,20}$/g
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
          }
          if (req.file) {
            //user with image
            const user = new User({
              _id: new mongoose.Types.ObjectId(),
              userName: req.body.userName,
              email: req.body.email,
              password: hash,
              role: req.body.role,
              imagePath: req.file.path,
              cart: {
                items: [],
              }
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
          } else {
            //user without image
            const user = new User({
              _id: new mongoose.Types.ObjectId(),
              userName: req.body.userName,
              email: req.body.email,
              password: hash,
              role: req.body.role,
              cart: {
                items: [],
              }
            });
            user
              .save()
              .then((result) => {
                console.log(result)
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
            userImage: user[0].imagePath,
            email: user[0].email,
            userId: user[0]._id,
            cart: user.cart
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

exports.user_get_all = (req, res, next) => {
  User.find()
    .select('-__v')
    .exec()
    .then((docs) => {
      const response = {
        count: docs.length,
        users: docs.map((doc) => {
          return {
            userName: doc.userName,
            email: doc.email,
            role: doc.role,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
            _id: doc._id,
            request: {
              type: 'GET',
              url: 'http://localhost:8081/users/' + doc._id,
            },
          };
        }),
      };
      res.status(200).json(response);
    })
    .catch((err) => {
      0
      res.status(500).json({
        Error: err,
      });
    })
}

exports.user_get_by_id = (req, res, next) => {
  const id = req.params.userId;
  User.findById(id)
    .exec()
    .then((doc) => {
      if (!doc) {
        throw new Error('There is no user with this id!')
      }
      res.status(200).json({
        userName: doc.userName,
        email: doc.email,
        role: doc.role,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
        userImage: doc.imagePath,
        userId: doc._id,
        request: {
          type: 'GET',
          url: 'http://localhost:8081/users/' + doc._id,
        }
      });
    })
    .catch((err) => {
      res.status(500).json({
        Error: err,
      });
    })
}

exports.user_delete = (req, res, next) => {
  User.deleteOne({ _id: req.params.userId })
    .exec()
    .then((result) => {
      res.status(200).json({
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
    user = await User.findOne({ email }).exec().then((user) => {
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
    }).catch((err) => {
      console.log(err)
      throw new Error('nincs ilyen email cím')
    })

  } catch (err) {
    return res.status(404).json({
      Error: err.message
    })
  }
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

exports.order_get_all_by_userId = async (req, res, next) => {
  const id = req.params.userId
  console.log(id)
  try {
    await User.findById(id).then((user) => {
      if (!user) {
        throw new Error('user not found')
      }
    })
  } catch (error) {
    return res.status(404).json({
      message: 'user not found',
    });
  }

  Order.find()
    .select('-__v')
    .exec()
    .then((orders) => {
      res.status(200).json({
        count: orders.length,
        orders: orders.map((doc) => {
          let myOrders = orders.filter(order => JSON.stringify(id) === JSON.stringify(order.user));
          if (loadash.isEmpty(myOrders) === true) {
            throw new Error('There is no order with this user')
          }
          return {
            myOrders
          };
        }),
      });
    }).catch((err) => {
      res.status(500).json({
        Error: err.message,
      });
    })
}

exports.change_user_data_by_userId = async (req, res, next) => {
  let oldImage = null
  let updateOps = {}
  const id = req.params.userId
  console.log(id)
  let hash = null
  try {
    await User.findById(id).then((user) => {
      if (!user) {
        throw new Error('user not found')
      }
      updateOps = { ...updateOps, ...user._doc }
      console.log(updateOps)
      if (req.body.password) {
        bcrypt.genSalt(10, function (err, salt) {
          if (err) {
            throw new Error(err.message)
          }
          bcrypt.hash(req.body.password, salt, function (err, hash) {
            if (err) {
              throw new Error(err.message)
            }
            console.log(hash)
            updateOps.password = hash
            console.log(updateOps.password)
            req.body.userName ? updateOps.userName = req.body.userName : updateOps.userName
            req.body.email ? updateOps.email = req.body.email : updateOps.email
            req.body.role ? updateOps.role = req.body.role : updateOps.role
            if (req.file) {
              oldImage = updateOps.imagePath
              updateOps.imagePath = req.file.path
            }
            User.findOneAndUpdate({ _id: id }, updateOps)
              .then(() => {
                if (oldImage !== null) {
                  deleteImageFromServer(oldImage)
                }
                res.status(200).json("user updated")

              })
              .catch((err) => {
                throw new Error(err.message)
              }
              )
          })
        })
      } else {
        req.body.userName ? updateOps.userName = req.body.userName : updateOps.userName
        req.body.email ? updateOps.email = req.body.email : updateOps.email
        req.body.role ? updateOps.role = req.body.role : updateOps.role
        if (req.file) {
          oldImage = updateOps.imagePath
          updateOps.imagePath = req.file.path
        }
        User.findOneAndUpdate({ _id: id }, updateOps)
          .then(() => {
            if (oldImage !== null) {
              deleteImageFromServer(oldImage)
            }
            res.status(200).json("user updated")
          })
          .catch((err) => {
            throw new Error(err.message)
          }
          )
      }
    })
  } catch (error) {
    return res.status(404).json({
      message: error.message
    });
  }
}

exports.change_user_myData_by_myUserId = async (req, res, next) => {
  let oldImage = null
  let updateOps = {}
  const id = req.params.userId
  console.log(id)
  let hash = null
  try {
    await User.findById(id).then((user) => {
      if (!user) {
        throw new Error('user not found')
      }
      updateOps = { ...updateOps, ...user._doc }
      console.log(updateOps)
      if (req.body.role) {
        throw new Error('changing role is not accepted!')
      }
      if (req.body.password && req.body.password != 'null') {
        bcrypt.genSalt(10, function (err, salt) {
          if (err) {
            throw new Error(err.message)
          }
          bcrypt.hash(req.body.password, salt, function (err, hash) {
            if (err) {
              throw new Error(err.message)
            }
            console.log(hash)
            updateOps.password = hash
            console.log(updateOps.password)
            if (req.body.userName && req.body.userName !== 'null') {
              updateOps.userName = req.body.userName
            }
            if (req.body.email && req.body.email !== 'null') {
              updateOps.email = req.body.email
            }
            if (req.file) {
              oldImage = updateOps.imagePath
              updateOps.imagePath = req.file.path
            }
            User.findOneAndUpdate({ _id: id }, updateOps)
              .then((response) => {
                if (req.file) {
                  deleteImageFromServer(oldImage)
                }
                console.log(response)
                res.status(200).json("user updated")
              })
              .catch((err) => {
                throw new Error(err.message)
              }
              )
          })
        })
      } else {
        if (req.body.userName && req.body.userName !== 'null') {
          updateOps.userName = req.body.userName
        }
        if (req.body.email && req.body.email !== 'null') {
          updateOps.email = req.body.email
        }
        if (req.file) {
          oldImage = updateOps.imagePath
          updateOps.imagePath = req.file.path
        }
        User.findOneAndUpdate({ _id: id }, updateOps)
          .then(() => {
            if (req.file) {
              deleteImageFromServer(oldImage)
            }

            res.status(200).json("user updated")
          })
          .catch((err) => {
            throw new Error(err.message)
          }
          )
      }
    })
  } catch (error) {
    return res.status(404).json({
      message: error.message
    });
  }
}

exports.change_user_cart_by_myUserId = async (req, res, next) => {
  let cart = {}
  const id = req.params.userId
  console.log(id)
  try {
    await User.findById(id).then((user) => {
      if (!user) {
        throw new Error('user not found')
      }
      cart = { ...cart, ...req.body }
      console.log(cart)
        User.updateOne({ _id: id }, { $set: {cart} })
          .then(() => {
            res.status(200).json("cart is updated")
          })
          .catch((err) => {
            throw new Error(err.message)
          }
          )
    })
  } catch (error) {
    return res.status(404).json({
      message: error.message
    });
  }
}

exports.get_cart_ByUserId = (req, res, next) => {
  const id = req.params.userId;
  User.findById(id)
      .select('-__v')
      .exec()
      .then((doc) => {
          if (doc) {
              console.log(doc.cart);
              res.status(200).json({
                  cart: doc.cart,
              });
          } else {
              res.status(404).json({
                  message: 'There is no user with this id!',
              });
          }
      })
      .catch((err) => {
          res.status(500).json({
              error: err,
          });
      });
};

