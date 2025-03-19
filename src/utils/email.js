const nodemailer = require("nodemailer");
//! in after time change this function to class and add functions as methods

const sendEmail = async (opt) => {
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  const mailOptions = {
    form: "kasse imad <kasseimad81@gmail.com>",
    to: opt.email,
    subject: opt.subject,
    text: opt.message,
  };
  await transport.sendMail(mailOptions);
};

class SendEmail {
  constructor() {}
  async sendWelcomEmail(opt) {
    await sendEmail(opt); // change this after time
  }

  async sendRestPassword(opt) {
    await sendEmail(opt);// change this after time
  }
}

module.exports = sendEmail;
