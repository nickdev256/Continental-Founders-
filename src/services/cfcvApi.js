// ============================================================
// API CONFIGURATION
//
// Example:
// VITE_API_URL=https://continental-founders-1.onrender.com
//
// Do not append /api to VITE_API_URL.
// ============================================================

const API_URL = String(
  import.meta.env.VITE_API_URL || "http://localhost:5000"
)
  .trim()
  .replace(/\/+$/, "");

const ROOT = "/api/cfcv";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ============================================================
// API ERROR
// ============================================================

export class CfcvApiError extends Error {
  constructor(
    message,
    {
      status = 0,
      code = "REQUEST_FAILED",
      fields = [],
      field = "",
      details = null,
      retryAfter = null,
    } = {}
  ) {
    super(message);

    this.name = "CfcvApiError";
    this.status = status;
    this.code = code;
    this.fields = fields;
    this.field = field;
    this.details = details;
    this.retryAfter = retryAfter;
  }
}

function invalidInput(message, field = "") {
  return new CfcvApiError(message, {
    status: 400,
    code: "INVALID_INPUT",
    field,
    fields: field ? [field] : [],
  });
}

// ============================================================
// APPLICATION PATH
// ============================================================

function applicationPath(id) {
  if (
    typeof id !== "string" ||
    !UUID.test(id)
  ) {
    throw invalidInput(
      "Invalid application ID."
    );
  }

  return `${ROOT}/admin/applications/${id.toLowerCase()}`;
}

// ============================================================
// RETRY-AFTER HEADER
// ============================================================

function readRetryAfter(value) {
  if (!value) {
    return null;
  }

  const seconds = Number(value);

  if (
    Number.isFinite(seconds) &&
    seconds >= 0
  ) {
    return Math.ceil(seconds);
  }

  const date = Date.parse(value);

  return Number.isFinite(date)
    ? Math.max(
        0,
        Math.ceil((date - Date.now()) / 1000)
      )
    : null;
}

// ============================================================
// REQUEST HELPER
//
// Admin requests use the existing session cookie.
//
// Requests are not automatically retried because a failed
// response does not prove that a submission, save, or deletion
// failed on the server.
// ============================================================

async function request(
  endpoint,
  {
    method = "GET",
    body,
    signal,
    timeoutMs = 30_000,
    publicRequest = false,
  } = {}
) {
  const controller = new AbortController();

  let timedOut = false;

  const abortFromCaller = () => {
    controller.abort();
  };

  if (signal?.aborted) {
    throw new CfcvApiError(
      "The request was cancelled.",
      {
        code: "ABORTED",
      }
    );
  }

  signal?.addEventListener(
    "abort",
    abortFromCaller,
    {
      once: true,
    }
  );

  const timeout = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  try {
    const isFormData =
      body instanceof FormData;

    const hasBody =
      body !== undefined &&
      body !== null;

    const response = await fetch(
      `${API_URL}${endpoint}`,
      {
        method,

        credentials:
          publicRequest ? "omit" : "include",

        cache: "no-store",
        signal: controller.signal,

        headers: {
          Accept: "application/json",

          ...(hasBody && !isFormData
            ? {
                "Content-Type": "application/json",
              }
            : {}),
        },

        ...(hasBody
          ? {
              body: isFormData
                ? body
                : JSON.stringify(body),
            }
          : {}),
      }
    );

    const raw = await response.text();

    let data = null;

    try {
      data = JSON.parse(raw);
    } catch {
      // A proxy or server error may not be JSON.
    }

    if (!response.ok) {
      let fallback =
        "The request failed. Please try again.";

      if (response.status === 401) {
        fallback =
          "Your admin session has expired. Sign in again.";
      } else if (response.status === 403) {
        fallback =
          "You do not have permission to perform this action.";
      } else if (response.status === 404) {
        fallback =
          "The requested application or endpoint was not found.";
      } else if (response.status === 409) {
        fallback = publicRequest
          ? "This submission key conflicts with another payload. Confirm the existing application before submitting again."
          : "This application changed. Reload it before saving or deleting.";
      } else if (response.status === 429) {
        fallback =
          "Too many requests. Please wait before trying again.";
      }

      const code =
        response.status === 409
          ? "CONFLICT"
          : response.status === 429
            ? "RATE_LIMITED"
            : "HTTP_ERROR";

      const fields = Array.isArray(data?.fields)
        ? data.fields.filter(
            (field) => typeof field === "string"
          )
        : typeof data?.field === "string"
          ? [data.field]
          : [];

      throw new CfcvApiError(
        typeof data?.message === "string"
          ? data.message
          : fallback,
        {
          status: response.status,
          code,
          fields,

          field:
            typeof data?.field === "string"
              ? data.field
              : "",

          details: data,

          retryAfter: readRetryAfter(
            response.headers.get("Retry-After")
          ),
        }
      );
    }

    if (
      !data ||
      typeof data !== "object" ||
      Array.isArray(data) ||
      data.success !== true
    ) {
      throw new CfcvApiError(
        "The server did not confirm this request. Check the result before trying again.",
        {
          status: response.status,
          code: "INVALID_RESPONSE",
        }
      );
    }

    return data;
  } catch (error) {
    if (error instanceof CfcvApiError) {
      throw error;
    }

    if (controller.signal.aborted) {
      throw new CfcvApiError(
        timedOut
          ? "The request timed out. It may have reached the server. Check the result before trying again."
          : "The request was cancelled. It may have reached the server; check the result before retrying a change.",
        {
          code:
            timedOut ? "TIMEOUT" : "ABORTED",
        }
      );
    }

    throw new CfcvApiError(
      "Unable to confirm the server response. Check your connection and the result before trying again.",
      {
        code: "NETWORK_ERROR",
      }
    );
  } finally {
    clearTimeout(timeout);

    signal?.removeEventListener(
      "abort",
      abortFromCaller
    );
  }
}

// ============================================================
// CREATE SUBMISSION KEY
//
// Keep the same key when retrying the same submission.
// ============================================================

export function createSubmissionKey() {
  if (
    typeof globalThis.crypto?.randomUUID !== "function"
  ) {
    throw new CfcvApiError(
      "Open this application using HTTPS or localhost in a supported browser.",
      {
        code: "UNSUPPORTED_BROWSER",
      }
    );
  }

  return globalThis.crypto.randomUUID();
}

// ============================================================
// PUBLIC: SUBMIT APPLICATION
// ============================================================

export async function submitCfcvApplication(
  {
    application,
    resume,
    submissionKey,
  } = {},
  {
    signal,
  } = {}
) {
  if (
    !application ||
    typeof application !== "object" ||
    Array.isArray(application)
  ) {
    throw invalidInput(
      "Application details are required."
    );
  }

  if (
    !(resume instanceof Blob) ||
    typeof resume.name !== "string" ||
    !resume.name
  ) {
    throw invalidInput(
      "Choose your résumé file.",
      "resume"
    );
  }

  if (
    typeof submissionKey !== "string" ||
    !UUID.test(submissionKey)
  ) {
    throw invalidInput(
      "A valid submission key is required.",
      "submissionKey"
    );
  }

  const resumeTypes = {
    pdf: "application/pdf",
    doc: "application/msword",

    docx:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  };

  const extension = resume.name
    .split(".")
    .pop()
    .toLowerCase();

  if (
    !resume.size ||
    resume.size > 5 * 1024 * 1024
  ) {
    throw invalidInput(
      !resume.size
        ? "Your résumé file is empty."
        : "Your résumé must be 5 MB or smaller.",
      "resume"
    );
  }

  if (
    !Object.hasOwn(resumeTypes, extension) ||
    (
      resume.type &&
      resume.type !== resumeTypes[extension]
    )
  ) {
    throw invalidInput(
      "Please upload a PDF, DOC, or DOCX résumé.",
      "resume"
    );
  }

  // Some browsers supply an empty MIME type.
  // Use the accepted extension to supply it.
  // The backend still validates the actual file signature.

  const upload = resume.type
    ? resume
    : new Blob(
        [resume],
        {
          type: resumeTypes[extension],
        }
      );

  const formData = new FormData();

  formData.append(
    "application",
    JSON.stringify(application)
  );

  formData.append(
    "submissionKey",
    submissionKey
  );

  formData.append(
    "resume",
    upload,
    resume.name
  );

  const data = await request(
    `${ROOT}/applications`,
    {
      method: "POST",
      body: formData,
      signal,
      timeoutMs: 120_000,
      publicRequest: true,
    }
  );

  if (
    typeof data.applicationReference !== "string" ||
    !data.applicationReference.trim()
  ) {
    throw new CfcvApiError(
      "The server did not return an application reference. Retry with the same submission key.",
      {
        code: "INVALID_RESPONSE",
      }
    );
  }

  return data;
}

// ============================================================
// ADMIN: STATISTICS
// ============================================================

export function getCfcvStats(
  {
    signal,
  } = {}
) {
  return request(
    `${ROOT}/admin/stats`,
    {
      signal,
    }
  );
}

// ============================================================
// ADMIN: APPLICATION LIST
// ============================================================

export function getCfcvApplications(
  filters = {},
  {
    signal,
  } = {}
) {
  const query = new URLSearchParams();

  for (const key of [
    "page",
    "pageSize",
    "search",
    "status",
    "admissionsStage",
    "track",
    "geography",
  ]) {
    const value = filters[key];

    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      query.set(
        key,
        String(value)
      );
    }
  }

  const suffix = query.toString();

  return request(
    `${ROOT}/admin/applications${
      suffix ? `?${suffix}` : ""
    }`,
    {
      signal,
    }
  );
}

// ============================================================
// ADMIN: APPLICATION DETAILS
// ============================================================

export function getCfcvApplication(
  id,
  {
    signal,
  } = {}
) {
  return request(
    applicationPath(id),
    {
      signal,
    }
  );
}

// ============================================================
// ADMIN: RÉSUMÉ LINKS
//
// Existing callers default to download mode.
//
// Example:
// getCfcvResume(id, { mode: "view" })
//
// The controller returns both viewUrl and downloadUrl.
// These functions retrieve links; they do not open a window.
// ============================================================

export function getCfcvResume(
  id,
  {
    signal,
    mode = "download",
  } = {}
) {
  if (
    !["view", "download"].includes(mode)
  ) {
    throw invalidInput(
      "Choose view or download for résumé access."
    );
  }

  return request(
    `${applicationPath(id)}/resume?mode=${mode}`,
    {
      signal,
    }
  );
}

export function getCfcvResumeView(
  id,
  {
    signal,
  } = {}
) {
  return getCfcvResume(
    id,
    {
      signal,
      mode: "view",
    }
  );
}

export function getCfcvResumeDownload(
  id,
  {
    signal,
  } = {}
) {
  return getCfcvResume(
    id,
    {
      signal,
      mode: "download",
    }
  );
}

// ============================================================
// ADMIN: REVIEW HISTORY
// ============================================================

export function getCfcvHistory(
  id,
  {
    signal,
  } = {}
) {
  return request(
    `${applicationPath(id)}/history`,
    {
      signal,
    }
  );
}

// ============================================================
// ADMIN: EMAIL QUEUE
// ============================================================

export function getCfcvEmails(
  id,
  {
    signal,
  } = {}
) {
  return request(
    `${applicationPath(id)}/emails`,
    {
      signal,
    }
  );
}

// ============================================================
// REVIEW VALIDATION
// ============================================================

function validateReview(review) {
  if (
    !review ||
    typeof review !== "object" ||
    Array.isArray(review)
  ) {
    throw invalidInput(
      "Review details are required."
    );
  }

  if (
    !Number.isSafeInteger(review.expectedVersion) ||
    review.expectedVersion < 1
  ) {
    throw invalidInput(
      "Reload the application before saving. Its version is required.",
      "expectedVersion"
    );
  }
}

// ============================================================
// ADMIN: PREVIEW FEEDBACK
//
// This request does not save the review or send an email.
// ============================================================

export function previewCfcvEmail(
  id,
  review,
  {
    signal,
  } = {}
) {
  validateReview(review);

  return request(
    `${applicationPath(id)}/email-preview`,
    {
      method: "POST",

      body: {
        ...review,
        notifyApplicant: true,
      },

      signal,
    }
  );
}

// ============================================================
// ADMIN: SAVE REVIEW AND QUEUE FEEDBACK
//
// The controller and SQL perform the actual save and queuing.
// Queued is not the same as delivered.
// ============================================================

export function saveCfcvReview(
  id,
  review,
  {
    signal,
  } = {}
) {
  validateReview(review);

  return request(
    applicationPath(id),
    {
      method: "PATCH",

      body: {
        ...review,
        notifyApplicant: true,
      },

      signal,
    }
  );
}

// ============================================================
// ADMIN: DELETE APPLICATION
//
// Example:
//
// deleteCfcvApplication(application.id, {
//   expectedVersion: application.version,
//   confirmationReference: enteredReference,
// });
//
// The admin page must show any resumeCleanupPending warning
// returned by the server.
// ============================================================

export function deleteCfcvApplication(
  id,
  {
    expectedVersion,
    confirmationReference,
  } = {},
  {
    signal,
  } = {}
) {
  if (
    !Number.isSafeInteger(expectedVersion) ||
    expectedVersion < 1
  ) {
    throw invalidInput(
      "Reload the application before deleting. Its version is required.",
      "expectedVersion"
    );
  }

  if (
    typeof confirmationReference !== "string" ||
    !confirmationReference.trim()
  ) {
    throw invalidInput(
      "Enter the application reference to confirm deletion.",
      "confirmationReference"
    );
  }

  return request(
    applicationPath(id),
    {
      method: "DELETE",

      body: {
        expectedVersion,

        confirmationReference:
          confirmationReference.trim(),
      },

      signal,
    }
  );
}