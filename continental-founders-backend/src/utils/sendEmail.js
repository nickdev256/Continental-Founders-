const { Resend } =
  require("resend");


// ============================================================
// STATE
// ============================================================

let resendClient =
  null;

let currentApiKey =
  null;


// ============================================================
// CONFIGURATION
// ============================================================

function getEmailConfig() {
  const apiKey =
    String(
      process.env.RESEND_API_KEY ||
      ""
    ).trim();

  const from =
    String(
      process.env.EMAIL_FROM ||
      "Continental Founders <noreply@continentalfounders.org>"
    ).trim();

  const defaultRecipient =
    String(
      process.env.EMAIL_TO ||
      ""
    ).trim();

  return {
    apiKey,
    from,
    defaultRecipient,
  };
}


// ============================================================
// GET RESEND CLIENT
// ============================================================

function getResendClient() {
  const {
    apiKey,
  } =
    getEmailConfig();


  if (!apiKey) {
    return null;
  }


  // Re-create client if environment configuration changes
  // while using a development process manager.
  if (
    !resendClient ||
    currentApiKey !== apiKey
  ) {
    resendClient =
      new Resend(
        apiKey
      );

    currentApiKey =
      apiKey;
  }


  return resendClient;
}


// ============================================================
// NORMALIZE RECIPIENTS
// ============================================================

function normalizeRecipients(
  value
) {
  if (!value) {
    return [];
  }


  if (
    Array.isArray(
      value
    )
  ) {
    return value
      .map(
        (recipient) =>
          String(
            recipient ||
            ""
          ).trim()
      )
      .filter(Boolean);
  }


  return String(value)
    .split(",")
    .map(
      (recipient) =>
        recipient.trim()
    )
    .filter(Boolean);
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
  const {
    from,
    defaultRecipient,
  } =
    getEmailConfig();


  // ==========================================================
  // RESEND CLIENT
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

  const recipients =
    normalizeRecipients(
      to ||
      defaultRecipient
    );


  if (
    recipients.length === 0
  ) {
    console.error(
      "[EMAIL] No recipient was supplied."
    );

    throw new Error(
      "No email recipient is configured."
    );
  }


  // ==========================================================
  // SENDER
  // ==========================================================

  if (!from) {
    console.error(
      "[EMAIL] EMAIL_FROM is not configured."
    );

    throw new Error(
      "Email sender is not configured."
    );
  }


  // ==========================================================
  // SUBJECT
  // ==========================================================

  const cleanSubject =
    String(
      subject ||
      ""
    ).trim();


  if (!cleanSubject) {
    throw new Error(
      "Email subject is required."
    );
  }


  // ==========================================================
  // CONTENT
  // ==========================================================

  if (
    !html &&
    !text
  ) {
    throw new Error(
      "Email content is required."
    );
  }


  // ==========================================================
  // MESSAGE
  // ==========================================================

  const message = {
    from,
    to:
      recipients,
    subject:
      cleanSubject,
  };


  if (html) {
    message.html =
      html;
  }


  if (text) {
    message.text =
      text;
  }


  if (replyTo) {
    message.replyTo =
      replyTo;
  }


  // ==========================================================
  // SEND
  // ==========================================================

  try {
    const {
      data,
      error,
    } =
      await resend.emails.send(
        message
      );


    // ========================================================
    // RESEND API ERROR
    // ========================================================

    if (error) {
      console.error(
        "[EMAIL] Resend rejected email:",
        {
          name:
            error?.name ||
            null,

          message:
            error?.message ||
            "Unknown Resend error",

          statusCode:
            error?.statusCode ||
            null,
        }
      );


      throw new Error(
        error?.message ||
        "Unable to send email."
      );
    }


    // ========================================================
    // SUCCESS
    // ========================================================

    console.log(
      "[EMAIL] Email sent successfully.",
      {
        messageId:
          data?.id ||
          null,

        recipients:
          recipients.length,
      }
    );


    return {
      success:
        true,

      messageId:
        data?.id ||
        null,
    };

  } catch (error) {
    console.error(
      "[EMAIL] Email delivery failed:",
      {
        name:
          error?.name ||
          "Error",

        message:
          error?.message ||
          "Unknown email error",
      }
    );


    throw error;
  }
}


// ============================================================
// EXPORT
// ============================================================

module.exports =
  sendEmail;