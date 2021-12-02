const nodemailer = require('../node_modules/nodemailer');

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL, 
    pass: process.env.EMAIL_PASSWORD
  }
})

const getPasswordResetURL = (user, token) =>
  `http://localhost:8080/users/addNewPassword/${user._id}/${token}`

const resetPasswordTemplate = (user, url) => {
  const from = 'NOREPLY'
  const to = user.email
  const subject = "Password Reset Link"
  const html = `
  <p>Hey ${user.userName || user.email},</p>
  <p>We heard that you lost your password. Sorry about that!</p>
  <p>But don’t worry! You can use the following link to reset your password:</p>
  <a href=${url}>${url}</a>
  <p>If you don’t use this link within 1 hour, it will expire.</p>
  `

  return { from, to, subject, html }
}

module.exports = {transporter, getPasswordResetURL, resetPasswordTemplate}