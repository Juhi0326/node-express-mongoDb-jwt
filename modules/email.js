const nodemailer = require('../node_modules/nodemailer');
//require('dotenv').config({ path: '../.env' });

/* exports.transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASSWORD
  }
})
 */
exports.getPasswordResetURL = (user, token) =>
  `http://localhost:8081/users/receive_new_password/${user._id}/${token}`

/* exports.resetPasswordTemplate = (user, url) => {
  const from = process.env.EMAIL
  const to = user.email
  const subject = "Password Reset Link"
  const html = `
  <p>Hey ${user.displayName || user.email},</p>
  <p>We heard that you lost your password. Sorry about that!</p>
  <p>But don’t worry! You can use the following link to reset your password:</p>
  <a href=${url}>${url}</a>
  <p>If you don’t use this link within 1 hour, it will expire.</p>
  <p>Do something outside today! </p>
  `

  return { from, to, subject, html }
} */