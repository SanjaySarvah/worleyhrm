const nodemailer = require('nodemailer');

module.exports = async function sendEmail(to, subject, text) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.HRM_MAIL,
      pass: process.env.HRM_PASSWORD
    }
  });

  await transporter.sendMail({
    from: `"WOrley Ventures HRM" <${process.env.HRM_MAIL}>`,
    to,
    subject,
    text
  });
};
