const getTransporter = require('../config/email');

async function sendEmail({ subject, html, replyTo }) {
  const transporter = getTransporter();

  if (!transporter) {
    console.warn('Email transport is not configured; skipping email notification.');
    return;
  }

  await transporter.sendMail({
    from: `"Continental Founders Website" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_TO || process.env.EMAIL_USER,
    replyTo,
    subject,
    html,
  });
}

module.exports = sendEmail;
