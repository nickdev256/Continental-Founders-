const { supabaseAdmin: db } = require("../config/supabase");

const TABLE = "cfcv_email_jobs";
const RETRY_WINDOW_MS = 23 * 60 * 60 * 1000;
const LEASE_MS = 5 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 30000;
const POLL_MS = 10000;

let running = false;
let timer = null;
let active = null;

// ============================================================
// CONFIGURATION
// ============================================================

function getConfig() {
  return {
    enabled:
      process.env.CFCV_EMAIL_WORKER_ENABLED === "true",

    apiKey: String(
      process.env.RESEND_API_KEY || ""
    ).trim(),

    from: String(
      process.env.EMAIL_FROM || ""
    ).trim(),

    replyTo:
      String(
        process.env.EMAIL_REPLY_TO || ""
      ).trim() || null,
  };
}

// ============================================================
// SAVE ONLY WHILE THIS WORKER OWNS THE CLAIM
// ============================================================

async function saveJob(job, changes) {
  const { data, error } = await db
    .from(TABLE)
    .update(changes)
    .eq("id", job.id)
    .eq("status", "sending")
    .eq("lock_token", job.lock_token)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(
      "Unable to save email queue state."
    );
  }

  return Boolean(data);
}

// ============================================================
// RETRY DELAY
// ============================================================

function retryDelay(job, retryAfter) {
  const backoff = Math.min(
    3600000,
    30000 * 2 ** (job.attempts - 1)
  );

  const jitter =
    Math.floor(Math.random() * 5000);

  let providerDelay = 0;

  if (retryAfter) {
    const seconds = Number(retryAfter);

    providerDelay = Number.isFinite(seconds)
      ? Math.max(0, seconds * 1000)
      : Math.max(
          0,
          Date.parse(retryAfter) - Date.now()
        ) || 0;
  }

  return Math.max(
    backoff + jitter,
    providerDelay
  );
}

// ============================================================
// RESCHEDULE OR REQUIRE MANUAL REVIEW
// ============================================================

async function finishFailure(
  job,
  retryable,
  reason,
  retryAfter
) {
  const deadline =
    Date.parse(job.first_attempt_at)
    + RETRY_WINDOW_MS;

  const nextAttempt =
    Date.now() + retryDelay(job, retryAfter);

  const canRetry =
    retryable
    && job.attempts < 8
    && Number.isFinite(deadline)
    && nextAttempt < deadline;

  await saveJob(job, {
    status:
      canRetry ? "pending" : "needs_review",

    next_attempt_at:
      canRetry
        ? new Date(nextAttempt).toISOString()
        : null,

    locked_at: null,
    lock_token: null,
    last_error: reason,
  });
}

// ============================================================
// PROCESS ONE CLAIMED EMAIL
// ============================================================

async function processJob(job, config) {
  const deadline =
    Date.parse(job.first_attempt_at)
    + RETRY_WINDOW_MS;

  const leaseEnd =
    Date.parse(job.locked_at) + LEASE_MS;

  // A slow database response may have consumed the lease.
  // Leave an expired lease for a fresh claimant.
  if (
    !Number.isFinite(leaseEnd)
    || Date.now() + REQUEST_TIMEOUT_MS + 5000 >= leaseEnd
  ) {
    return;
  }

  if (
    !Number.isFinite(deadline)
    || Date.now() + REQUEST_TIMEOUT_MS >= deadline
  ) {
    await finishFailure(
      job,
      false,
      "The automatic retry window has ended."
    );

    return;
  }

  const payload = job.provider_payload;

  if (
    !payload
    || typeof payload !== "object"
    || Array.isArray(payload)
    || !payload.from
    || !Array.isArray(payload.to)
    || !payload.to.length
    || !payload.subject
    || typeof payload.text !== "string"
  ) {
    await finishFailure(
      job,
      false,
      "The frozen email payload is invalid."
    );

    return;
  }

  let response;
  let result;

  try {
    response = await fetch(
      "https://api.resend.com/emails",
      {
        method: "POST",

        headers: {
          Authorization:
            `Bearer ${config.apiKey}`,

          "Content-Type":
            "application/json",

          "Idempotency-Key":
            `cfcv-email/${job.id}`,
        },

        // Preserve the stored payload on every retry.
        body: JSON.stringify(payload),

        signal:
          AbortSignal.timeout(
            REQUEST_TIMEOUT_MS
          ),
      }
    );

    const body = await response.text();

    try {
      result = JSON.parse(body);
    } catch {
      result = null;
    }
  } catch {
    // A timeout does not prove that the email was rejected.
    // Retry using the same payload and idempotency key.
    await finishFailure(
      job,
      true,
      "Email provider response was uncertain."
    );

    return;
  }

  if (response.ok) {
    if (
      !result
      || typeof result.id !== "string"
      || !result.id.trim()
    ) {
      await finishFailure(
        job,
        true,
        "Provider acceptance could not be confirmed."
      );

      return;
    }

    // Keep this outside the send catch.
    // If saving acceptance fails, the lease expires and
    // the same provider request can be replayed.
    await saveJob(job, {
      status: "accepted",

      provider_message_id:
        result.id,

      accepted_at:
        new Date().toISOString(),

      next_attempt_at: null,
      locked_at: null,
      lock_token: null,
      last_error: null,
    });

    return;
  }

  const concurrentRequest =
    response.status === 409
    && result?.name ===
      "concurrent_idempotent_requests";

  const retryable =
    response.status === 408
    || response.status === 429
    || response.status >= 500
    || concurrentRequest;

  // Avoid storing provider response bodies containing
  // applicant information.
  await finishFailure(
    job,
    retryable,
    `Email provider rejected the request (HTTP ${response.status}).`,
    response.headers.get("retry-after")
  );
}

// ============================================================
// CLAIM AND PROCESS ONE JOB
// ============================================================

async function runCfcvEmailWorkerOnce() {
  // Prevent overlapping runs within this process.
  if (active) {
    return active;
  }

  active = (async () => {
    const config = getConfig();

    if (!config.enabled) {
      return false;
    }

    if (
      !db
      || !config.apiKey
      || !config.from
    ) {
      throw new Error(
        "Configure Supabase, RESEND_API_KEY and EMAIL_FROM."
      );
    }

    const { data, error } = await db.rpc(
      "cfcv_claim_email_job",
      {
        p_from: config.from,
        p_reply_to: config.replyTo,
      }
    );

    if (error) {
      throw new Error(
        "Unable to claim a CFCV email job."
      );
    }

    const job =
      Array.isArray(data)
        ? data[0]
        : data;

    if (!job) {
      return false;
    }

    if (
      !job.id
      || !job.lock_token
      || job.status !== "sending"
    ) {
      throw new Error(
        "The email claim returned an invalid lease."
      );
    }

    await processJob(job, config);

    return true;
  })();

  try {
    return await active;
  } finally {
    active = null;
  }
}

// ============================================================
// POLLING
// ============================================================

async function poll() {
  if (!running) {
    return;
  }

  try {
    await runCfcvEmailWorkerOnce();
  } catch (error) {
    console.error(
      "[CFCV EMAIL WORKER]",
      error.message
    );
  } finally {
    if (running) {
      timer = setTimeout(
        poll,
        POLL_MS
      );

      timer.unref?.();
    }
  }
}

// ============================================================
// START
// ============================================================

function startCfcvEmailWorker() {
  if (running) {
    return true;
  }

  const config = getConfig();

  if (!config.enabled) {
    return false;
  }

  if (
    !db
    || !config.apiKey
    || !config.from
  ) {
    console.error(
      "[CFCV EMAIL WORKER] Missing required configuration."
    );

    return false;
  }

  running = true;

  void poll();

  return true;
}

// ============================================================
// STOP AND FINISH ANY ACTIVE JOB
// ============================================================

async function stopCfcvEmailWorker() {
  running = false;

  if (timer) {
    clearTimeout(timer);
  }

  timer = null;

  if (active) {
    await active.catch(() => {});
  }
}

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  startCfcvEmailWorker,
  stopCfcvEmailWorker,
  runCfcvEmailWorkerOnce,
};