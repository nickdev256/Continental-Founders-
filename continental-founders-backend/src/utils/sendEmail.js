const getTransporter =
  require("../config/email");


/* ============================================================
   SEND EMAIL
============================================================ */

async function sendEmail({
  to,
  subject,
  html,
  text,
  replyTo,
}) {

  const transporter =
    getTransporter();


  if (!transporter) {

    console.warn(
      "Email transport is not configured; skipping email notification."
    );

    return {
      success: false,
      skipped: true,
    };

  }


  /* ==========================================================
     RECIPIENT

     If "to" is provided:
     send directly to that address.

     Otherwise:
     preserve existing website behaviour and send to EMAIL_TO.
  ========================================================== */

  const recipient =
    to ||
    process.env.EMAIL_TO ||
    process.env.EMAIL_USER;


  if (!recipient) {

    throw new Error(
      "No email recipient is configured."
    );

  }


  /* ==========================================================
     FROM
  ========================================================== */

  const from =
    `"Continental Founders" <${process.env.EMAIL_USER}>`;


  /* ==========================================================
     EMAIL OPTIONS
  ========================================================== */

  const mailOptions = {

    from,

    to:
      recipient,

    subject,

    html,

  };


  if (text) {

    mailOptions.text =
      text;

  }


  if (replyTo) {

    mailOptions.replyTo =
      replyTo;

  }


  /* ==========================================================
     SEND
  ========================================================== */

  const info =
    await transporter.sendMail(
      mailOptions
    );


  return {
    success: true,

    messageId:
      info.messageId,
  };

}


module.exports =
  sendEmail;