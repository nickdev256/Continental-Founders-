const { Resend } = require("resend");

// ============================================================
// RESEND CLIENT
// ============================================================

let resendClient = null;

function getResendClient() {
  const apiKey =
    process.env.RESEND_API_KEY;

  if (!apiKey) {
    return null;
  }

  if (!resendClient) {
    resendClient =
      new Resend(apiKey);
  }

  return resendClient;
}

// ============================================================
// SEND EMAIL
// ============================================================

async function sendEmail({
  to,
  subject,
  html,
  text,
  replyTo,
}) {
  // ==========================================================
  // CONFIGURATION
  // ==========================================================

  const resend =
    getResendClient();

  if (!resend) {
    console.error(
      "[EMAIL] RESEND_API_KEY is not configured."
    );

    throw new Error(
      "Email service is not configured."
    );
  }

  // ==========================================================
  // RECIPIENT
  // ==========================================================

  const recipient =
    to ||
    process.env.EMAIL_TO;

  if (!recipient) {
    throw new Error(
      "No email recipient is configured."
    );
  }

  // ==========================================================
  // FROM
  // ==========================================================

  const from =
    process.env.EMAIL_FROM ||
    "Continental Founders <noreply@continentalfounders.org>";

  // ==========================================================
  // MESSAGE
  // ==========================================================

  const message = {
    from,
    to: recipient,
    subject,
  };

  if (html) {
    message.html = html;
  }

  if (text) {
    message.text = text;
  }

  if (replyTo) {
    message.replyTo = replyTo;
  }

  // ==========================================================
  // SEND THROUGH RESEND
  // ==========================================================

  try {
    const {
      data,
      error,
    } = await resend.emails.send(
      message
    );

    if (error) {
      console.error(
        "[EMAIL] Resend rejected email:",
        {
          name: error.name,
          message: error.message,
        }
      );

      throw new Error(
        "Unable to send email."
      );
    }

    return {
      success: true,
      messageId:
        data?.id || null,
    };
  } catch (error) {
    console.error(
      "[EMAIL] Email delivery failed:",
      error?.message ||
        "Unknown email error"
    );

    throw error;
  }
}

module.exports = sendEmail;