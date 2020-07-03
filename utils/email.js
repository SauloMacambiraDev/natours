const nodemailer = require('nodemailer')

// options object holds information about: email, subject line, email content and may me other stuffs
const sendEmail = async options => {
    // 1) Create a transporter
    const transporter = nodemailer.createTransport({ //example using Gmail service which accepts only 500 emails per day as limit. And after that, soon or later, it'll be blocked by spam
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
      // Activate in gmail "less secure app" option
    })

    // 2) Define the email options
    const mailOptions = {
      from: 'Saulo de Melo Macambira <goleiro041@gmail.com>',
      to: options.email,
      subject: options.subject,
      text: options.message
      // html: //convert this message to HTML
    }

    // 3) Actually send the email
    await transporter.sendMail(mailOptions)
}

module.exports = sendEmail

// OBS.: Good services to deliver email: Sendgrid and Mailgun
