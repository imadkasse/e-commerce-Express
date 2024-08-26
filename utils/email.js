const nodemailer = require("nodemailer");

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

module.exports = sendEmail;
