const nodemailer = require("nodemailer");

function getTransporter() {
  const {
    EMAIL_HOST,
    EMAIL_PORT,
    EMAIL_SECURE,
    EMAIL_USER,
    EMAIL_APP_PASSWORD,
  } = process.env;

  if (
    !EMAIL_HOST ||
    !EMAIL_USER ||
    !EMAIL_APP_PASSWORD
  ) {
    console.warn(
      "Email configuration is incomplete."
    );

    return null;
  }

  const port = Number(
    EMAIL_PORT || 587
  );

  const secure =
    String(
      EMAIL_SECURE || "false"
    ).toLowerCase() === "true";

  return nodemailer.createTransport({
    host: EMAIL_HOST,

    port,

    secure,

    requireTLS:
      port === 587,

    auth: {
      user: EMAIL_USER,
      pass: EMAIL_APP_PASSWORD,
    },

    tls: {
      minVersion: "TLSv1.2",
    },

    connectionTimeout: 20000,
    greetingTimeout: 20000,
    socketTimeout: 30000,
  });
}

module.exports = getTransporter;