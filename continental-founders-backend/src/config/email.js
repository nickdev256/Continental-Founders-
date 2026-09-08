const nodemailer = require('nodemailer');

function getTransporter() {
  const {
    EMAIL_HOST,
    EMAIL_PORT,
    EMAIL_SECURE,
    EMAIL_USER,
    EMAIL_APP_PASSWORD,
  } = process.env;

  if (!EMAIL_HOST || !EMAIL_USER || !EMAIL_APP_PASSWORD) {
    return null;
  }

  return nodemailer.createTransport({
    host: EMAIL_HOST,
    port: Number(EMAIL_PORT || 465),
    secure: String(EMAIL_SECURE || 'true') === 'true',
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_APP_PASSWORD,
    },
  });
}

module.exports = getTransporter;
