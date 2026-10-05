const { Resend } = require("resend");

// ============================================================
// CLIENT STATE
// ============================================================

let resendClient = null;
let currentApiKey = null;

// ============================================================
// CONFIGURATION
// ============================================================

function getEmailConfig() {
  return {
    apiKey: String(
      process.env.RESEND_API_KEY || ""
    ).trim(),

    from: String(
      process.env.EMAIL_FROM ||
        "Continental Founders <noreply@continentalfounders.org>"
    ).trim(),

    defaultRecipient: String(
      process.env.EMAIL_TO || ""
    ).trim(),

    defaultReplyTo: String(
      process.env.EMAIL_REPLY_TO || ""
    ).trim(),
  };
}

function isEmailConfigured() {
  const config = getEmailConfig();

  return Boolean(config.apiKey && config.from);
}

function getResendClient() {
  const { apiKey } = getEmailConfig();

  if (!apiKey) {
    return null;
  }

  if (!resendClient || currentApiKey !== apiKey) {
    resendClient = new Resend(apiKey);
    currentApiKey = apiKey;
  }

  return resendClient;
}

// ============================================================
// EMAIL ERRORS
//
// The queue worker uses retryable to decide whether to retry
// automatically or flag a job for administrator review.
// ============================================================

class EmailSendError extends Error {
  constructor(
    message,
    {
      retryable = false,
      statusCode = null,
      providerErrorName = null,
    } = {}
  ) {
    super(message);

    this.name = "EmailSendError";
    this.retryable = retryable;
    this.statusCode = statusCode;
    this.providerErrorName = providerErrorName;
  }
}

// ============================================================
// RECIPIENT NORMALIZATION
// ============================================================

function normalizeRecipients(value) {
  if (value === undefined || value === null) {
    return [];
  }

  const values = Array.isArray(value)
    ? value
    : String(value).split(",");

  return [
    ...new Set(
      values
        .map((recipient) =>
          String(recipient ?? "").trim()
        )
        .filter(Boolean)
    ),
  ];
}

function validateRecipients(recipients, label) {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (
    recipients.some(
      (recipient) =>
        recipient.length > 320 ||
        !emailPattern.test(recipient)
    )
  ) {
    throw new EmailSendError(
      `${label} contains an invalid email address.`
    );
  }
}

// ============================================================
// SEND EMAIL
//
// Supported arguments:
//
// {
//   to,
//   subject,
//   html,
//   text,
//   replyTo,
//   from,
//   idempotencyKey
// }
//
// Queue retries must supply the SAME payload and key.
// ============================================================

async function sendEmail({
  to,
  subject,
  html,
  text,
  replyTo,
  from: explicitFrom,
  idempotencyKey,
} = {}) {
  const config = getEmailConfig();
  const resend = getResendClient();

  if (!resend) {
    throw new EmailSendError(
      "RESEND_API_KEY is not configured."
    );
  }

  // Default recipient is used only when no recipient was
  // supplied. An explicitly empty recipient must fail.
  const recipients = normalizeRecipients(
    to === undefined || to === null
      ? config.defaultRecipient
      : to
  );

  if (!recipients.length) {
    throw new EmailSendError(
      "An email recipient is required."
    );
  }

  validateRecipients(recipients, "Recipient");

  const from = String(
    explicitFrom === undefined || explicitFrom === null
      ? config.from
      : explicitFrom
  ).trim();

  if (!from || /[\r\n]/.test(from)) {
    throw new EmailSendError(
      "A valid email sender is required."
    );
  }

  const cleanSubject = String(
    subject ?? ""
  ).trim();

  if (!cleanSubject || /[\r\n]/.test(cleanSubject)) {
    throw new EmailSendError(
      "A valid email subject is required."
    );
  }

  const htmlContent =
    html === undefined || html === null
      ? ""
      : String(html);

  const textContent =
    text === undefined || text === null
      ? ""
      : String(text);

  if (!htmlContent.trim() && !textContent.trim()) {
    throw new EmailSendError(
      "Email content is required."
    );
  }

  const replyToRecipients = normalizeRecipients(
    replyTo === undefined || replyTo === null
      ? config.defaultReplyTo
      : replyTo
  );

  validateRecipients(replyToRecipients, "Reply-to");

  const cleanIdempotencyKey = String(
    idempotencyKey ?? ""
  ).trim();

  if (
    idempotencyKey !== undefined &&
    idempotencyKey !== null &&
    (
      !cleanIdempotencyKey ||
      cleanIdempotencyKey.length > 256
    )
  ) {
    throw new EmailSendError(
      "The email idempotency key must contain 1–256 characters."
    );
  }

  const message = {
    from,
    to: recipients,
    subject: cleanSubject,
  };

  if (htmlContent.trim()) {
    message.html = htmlContent;
  }

  if (textContent.trim()) {
    message.text = textContent;
  }

  if (replyToRecipients.length) {
    message.replyTo =
      replyToRecipients.length === 1
        ? replyToRecipients[0]
        : replyToRecipients;
  }

  let result;

  try {
    result = cleanIdempotencyKey
      ? await resend.emails.send(
          message,
          {
            idempotencyKey: cleanIdempotencyKey,
          }
        )
      : await resend.emails.send(message);
  } catch {
    // A network failure can occur after the provider accepts
    // a request. Retry using the same payload and key.
    throw new EmailSendError(
      "The email provider request could not be completed.",
      {
        retryable: true,
      }
    );
  }

  const { data, error } = result || {};

  if (error) {
    const numericStatus = Number(error.statusCode);

    const statusCode =
      Number.isInteger(numericStatus) &&
      numericStatus >= 100 &&
      numericStatus <= 599
        ? numericStatus
        : null;

    const providerErrorName = String(
      error.name || "provider_error"
    );

    const permanentErrors = new Set([
      "validation_error",
      "missing_required_field",
      "invalid_access",
      "restricted_api_key",
      "invalid_api_key",
      "missing_api_key",
      "invalid_idempotent_request",
    ]);

    const retryable =
      statusCode !== null
        ? (
            statusCode === 408 ||
            statusCode === 429 ||
            statusCode >= 500
          )
        : !permanentErrors.has(providerErrorName);

    throw new EmailSendError(
      String(
        error.message ||
          "The email provider rejected the request."
      ),
      {
        retryable,
        statusCode,
        providerErrorName,
      }
    );
  }

  if (!data?.id) {
    // Treat this as an uncertain outcome and use the same
    // idempotency key if the worker retries.
    throw new EmailSendError(
      "The email provider did not confirm acceptance.",
      {
        retryable: true,
      }
    );
  }

  return {
    success: true,
    messageId: data.id,
    status: "accepted",
  };
}

// ============================================================
// EXPORTS
//
// Existing imports remain supported:
//
// const sendEmail = require("../utils/sendEmail");
//
// The worker can also access:
//
// sendEmail.getEmailConfig()
// sendEmail.isEmailConfigured()
// ============================================================

module.exports = sendEmail;

module.exports.getEmailConfig = getEmailConfig;
module.exports.isEmailConfigured = isEmailConfigured;
module.exports.EmailSendError = EmailSendError;