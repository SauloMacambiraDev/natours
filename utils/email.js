const nodemailer = require('nodemailer');
const hbs = require('express-handlebars');
const htmlToText = require('html-to-text');
const hbsHelpers = require('./hbsHelpers');
const path = require('path');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = 'Saulo de Melo Macambira <goleiro041@gmail.com>'
  }

  newTransport() {
    if (process.env.NODE_ENV.trim()  === 'production') {
      // Sendgrid = Real Email service provider in production
      return 1;
    }

    // IF process.env.NODE_ENV === 'development'
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    return transporter;
  }

  // Send the actual email
  async send(template, subject) {
    // 1) Render HTML based on HandlebarsJs template engine

    const handlebars = hbs.create({
      layoutsDir: path.resolve(__dirname,'..', 'views', 'layouts'),
      partialsDir: path.resolve(__dirname,'..', 'views', 'partials'),
      extname: '.hbs',
      defaultLayout: 'baseEmail',
      helpers: hbsHelpers
    });

    /*
      handlebars.render('full-path-to-view',context, options).then(function(hbsTemplate){
        hbsTemplate contains the rendered html, do something with it...
        handlebars.render() returns a Promise with the compiled html
      });
    */
    const html = await handlebars.renderView(`${__dirname}/../views/email/${template}.hbs`, {
      name: this.firstName,
      url: this.url,
      subject
    } );

    // 2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html)
    }

    // 3) Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours Family!');
  }

  async sendPasswordReset(){
    await this.send('passwordReset', 'Your password reset token (valid for only 10 minutes)');
  }
}

// options object holds information about: email, subject line, email content and may me other stuffs
// const sendEmail = async options => {
//     // 1) Create a transporter
//     const transporter = nodemailer.createTransport({ //example using Gmail service which accepts only 500 emails per day as limit. And after that, soon or later, it'll be blocked by spam
//       host: process.env.EMAIL_HOST,
//       port: process.env.EMAIL_PORT,
//       auth: {
//         user: process.env.EMAIL_USERNAME,
//         pass: process.env.EMAIL_PASSWORD
//       }
//       // Activate in gmail "less secure app" option
//     })

//     // 2) Define the email options
//     const mailOptions = {
//       from: `Natours <${process.env.EMAIL_FROM}>`,
//       to: options.email,
//       subject: options.subject,
//       text: options.message
//       // html: //convert this message to HTML
//     }

//     // 3) Actually send the email
//     await transporter.sendMail(mailOptions)
// }

// module.exports = sendEmail

// OBS.: Good services to deliver email: Sendgrid and Mailgun
