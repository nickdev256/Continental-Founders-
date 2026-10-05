const API_URL = String(
  import.meta.env.VITE_API_URL || "http://localhost:5000"
)
  .trim()
  .replace(/\/+$/, "");

const ROOT = "/api/cfcv";
const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

function applicationPath(id) {
  if (!UUID.test(String(id || ""))) {
    throw new CfcvApiError("Invalid application ID.", {
      code: "INVALID_INPUT",
    });
  }

  return `${ROOT}/admin/applications/${id}`;
}

function readRetryAfter(value) {
  if (!value) return null;

  const seconds = Number(value);

  if (Number.isFinite(seconds) && seconds >= 0) {
    return Math.ceil(seconds);
  }

  const date = Date.parse(value);

  return Number.isFinite(date)
    ? Math.max(0, Math.ceil((date - Date.now()) / 1000))
    : null;
}

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

  const abortFromCaller = () => controller.abort();

  if (signal?.aborted) {
    throw new CfcvApiError("The request was cancelled.", {
      code: "ABORTED",
    });
  }

  signal?.addEventListener("abort", abortFromCaller, {
    once: true,
  });

  const timeout = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  try {
    const isFormData = body instanceof FormData;
    const hasBody = body !== undefined && body !== null;

    const response = await fetch(`${API_URL}${endpoint}`, {
      method,
      credentials: publicRequest ? "omit" : "include",
      cache: "no-store",
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...(hasBody && !isFormData
          ? { "Content-Type": "application/json" }
          : {}),
      },
      ...(hasBody
        ? {
            body: isFormData ? body : JSON.stringify(body),
          }
        : {}),
    });

    const raw = await response.text();
    let data = null;

    try {
      data = JSON.parse(raw);
    } catch {
      // The response may contain a non-JSON server error.
    }

    if (!response.ok) {
      let fallback = "The request failed. Please try again.";

      if (response.status === 401) {
        fallback =
          "Your admin session has expired. Sign in again.";
      } else if (response.status === 403) {
        fallback =
          "You do not have permission to perform this action.";
      } else if (response.status === 409) {
        fallback = publicRequest
          ? "This submission key conflicts with another payload. Confirm the existing application before submitting again."
          : "This application changed. Reload it before saving again.";
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
        ? data.fields
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
          : "The request was cancelled.",
        {
          code: timedOut ? "TIMEOUT" : "ABORTED",
        }
      );
    }

    throw new CfcvApiError(
      "Unable to reach the server. Check your connection before trying again.",
      {
        code: "NETWORK_ERROR",
      }
    );
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", abortFromCaller);
  }
}

export function createSubmissionKey() {
  return globalThis.crypto.randomUUID();
}

export async function submitCfcvApplication(
  { application, resume, submissionKey },
  { signal } = {}
) {
  if (
    !application ||
    typeof application !== "object" ||
    Array.isArray(application)
  ) {
    throw new CfcvApiError(
      "Application details are required.",
      {
        status: 400,
        code: "INVALID_INPUT",
      }
    );
  }

  if (
    !(resume instanceof Blob) ||
    typeof resume.name !== "string" ||
    !resume.name
  ) {
    throw new CfcvApiError("Choose your résumé file.", {
      status: 400,
      code: "INVALID_INPUT",
      field: "resume",
      fields: ["resume"],
    });
  }

  if (!UUID.test(String(submissionKey || ""))) {
    throw new CfcvApiError(
      "A valid submission key is required.",
      {
        status: 400,
        code: "INVALID_INPUT",
      }
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

  if (!resume.size || resume.size > 5 * 1024 * 1024) {
    throw new CfcvApiError(
      !resume.size
        ? "Your résumé file is empty."
        : "Your résumé must be 5 MB or smaller.",
      {
        status: 400,
        code: "INVALID_INPUT",
        field: "resume",
        fields: ["resume"],
      }
    );
  }

  if (
    !resumeTypes[extension] ||
    (resume.type && resume.type !== resumeTypes[extension])
  ) {
    throw new CfcvApiError(
      "Please upload a PDF, DOC, or DOCX résumé.",
      {
        status: 400,
        code: "INVALID_INPUT",
        field: "resume",
        fields: ["resume"],
      }
    );
  }

  const formData = new FormData();

  formData.append("application", JSON.stringify(application));
  formData.append("submissionKey", submissionKey);
  formData.append("resume", resume, resume.name);

  const data = await request(`${ROOT}/applications`, {
    method: "POST",
    body: formData,
    signal,
    timeoutMs: 120_000,
    publicRequest: true,
  });

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

export function getCfcvStats({ signal } = {}) {
  return request(`${ROOT}/admin/stats`, { signal });
}

export function getCfcvApplications(
  filters = {},
  { signal } = {}
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
      query.set(key, String(value));
    }
  }

  const suffix = query.toString();

  return request(
    `${ROOT}/admin/applications${
      suffix ? `?${suffix}` : ""
    }`,
    { signal }
  );
}

export function getCfcvApplication(id, { signal } = {}) {
  return request(applicationPath(id), { signal });
}

export function getCfcvResume(id, { signal } = {}) {
  return request(`${applicationPath(id)}/resume`, {
    signal,
  });
}

export function getCfcvHistory(id, { signal } = {}) {
  return request(`${applicationPath(id)}/history`, {
    signal,
  });
}

export function getCfcvEmails(id, { signal } = {}) {
  return request(`${applicationPath(id)}/emails`, {
    signal,
  });
}

export function previewCfcvEmail(
  id,
  review,
  { signal } = {}
) {
  return request(`${applicationPath(id)}/email-preview`, {
    method: "POST",
    body: review,
    signal,
  });
}

export function saveCfcvReview(
  id,
  review,
  { signal } = {}
) {
  if (
    !Number.isInteger(review?.expectedVersion) ||
    review.expectedVersion < 1
  ) {
    throw new CfcvApiError(
      "Reload the application before saving. Its version is required.",
      {
        code: "INVALID_INPUT",
      }
    );
  }

  return request(applicationPath(id), {
    method: "PATCH",
    body: review,
    signal,
  });
}