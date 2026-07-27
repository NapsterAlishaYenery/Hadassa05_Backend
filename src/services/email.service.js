// services/email.service.js
const transporter = require('../config/email.config');
const { COMPANY_INFO } = require('../constants/constants');

const sendMailService = async ({ to, subject, html }) => {
  const mailOptions = {
    from: `"${COMPANY_INFO.name}" <${process.env.EMAIL_SENDER}>`,
    to,
    subject,
    html,
  };

  return await transporter.sendMail(mailOptions);
};

module.exports = { sendMailService };