require("dotenv").config();

// ============================================================
// CONFIGURATION
// ============================================================

const PORT = Number(
  process.env.PORT || 5000
);

const HOST =
  process.env.HOST || "0.0.0.0";

const NODE_ENV =
  process.env.NODE_ENV || "development";

const SHUTDOWN_TIMEOUT_MS = Number(
  process.env.SHUTDOWN_TIMEOUT_MS || 40000
);

// ============================================================
// SERVER STATE
// ============================================================

let server = null;

let stopEmailWorker =
  async () => {};

let shuttingDown = false;

let requestedExitCode = 0;

// ============================================================
// ERROR LOGGING
// ============================================================

function logError(label, error) {
  console.error(label, {
    name:
      error?.name || "Error",

    code:
      error?.code || null,

    message:
      typeof error?.message === "string"
        ? error.message
        : "Unknown error",
  });
}

// ============================================================
// GRACEFUL SHUTDOWN
//
// Stop claiming email jobs and accepting HTTP connections.
// Await the active email job and existing HTTP requests.
// ============================================================

async function shutdown(
  signal,
  exitCode = 0
) {
  requestedExitCode = Math.max(
    requestedExitCode,
    exitCode
  );

  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  console.log(
    `[SERVER] ${signal}: stopping HTTP server and CFCV email worker.`
  );

  // Use a valid fallback even when invalid configuration
  // caused startup to fail.
  const timeoutMs =
    Number.isInteger(SHUTDOWN_TIMEOUT_MS)
    && SHUTDOWN_TIMEOUT_MS >= 1000
    && SHUTDOWN_TIMEOUT_MS <= 120000
      ? SHUTDOWN_TIMEOUT_MS
      : 40000;

  const timeout = setTimeout(
    () => {
      console.error(
        `[SERVER] Forced shutdown after ${timeoutMs / 1000} seconds. Unfinished email jobs remain in the database for recovery.`
      );

      try {
        server?.closeAllConnections?.();
      } finally {
        process.exit(1);
      }
    },
    timeoutMs
  );

  try {
    // The worker stops polling immediately and waits
    // for any active claim or email request to finish.
    const workerClosed = Promise.resolve(
      stopEmailWorker()
    );

    const httpClosed = new Promise(
      (resolve, reject) => {
        if (!server) {
          return resolve();
        }

        server.close(
          (error) => {
            if (
              error
              && error.code !==
                "ERR_SERVER_NOT_RUNNING"
            ) {
              return reject(error);
            }

            resolve();
          }
        );

        server.closeIdleConnections?.();
      }
    );

    const results =
      await Promise.allSettled([
        workerClosed,
        httpClosed,
      ]);

    for (const result of results) {
      if (
        result.status === "rejected"
      ) {
        requestedExitCode = 1;

        logError(
          "[SERVER] Shutdown error.",
          result.reason
        );
      }
    }

    clearTimeout(timeout);

    console.log(
      "[SERVER] Continental Founders API stopped."
    );

    process.exit(
      requestedExitCode
    );
  } catch (error) {
    clearTimeout(timeout);

    logError(
      "[SERVER] Unable to complete shutdown.",
      error
    );

    process.exit(1);
  }
}

// ============================================================
// PROCESS SIGNALS AND ERRORS
//
// Register before loading application modules.
// ============================================================

process.once(
  "SIGINT",
  () => {
    void shutdown("SIGINT");
  }
);

process.once(
  "SIGTERM",
  () => {
    void shutdown("SIGTERM");
  }
);

process.on(
  "uncaughtException",
  (error) => {
    logError(
      "[SERVER] Uncaught exception.",
      error
    );

    void shutdown(
      "UNCAUGHT_EXCEPTION",
      1
    );
  }
);

process.on(
  "unhandledRejection",
  (reason) => {
    logError(
      "[SERVER] Unhandled promise rejection.",
      reason
    );

    void shutdown(
      "UNHANDLED_REJECTION",
      1
    );
  }
);

// ============================================================
// STARTUP MESSAGE
//
// Worker status comes from startCfcvEmailWorker().
// Local URLs are for development.
// ============================================================

function printStartupMessage(
  workerStarted
) {
  const base =
    `http://localhost:${PORT}`;

  const workerEnabled =
    process.env.CFCV_EMAIL_WORKER_ENABLED === "true";

  const workerStatus = workerStarted
    ? "Started; polling the email queue"
    : workerEnabled
      ? "Not started; check worker configuration"
      : "Disabled";

  console.log(
    "\n============================================================"
  );

  console.log(
    " CONTINENTAL FOUNDERS API"
  );

  console.log(
    "============================================================"
  );

  console.log(
    `Environment:       ${NODE_ENV}`
  );

  console.log(
    `Listening on:      ${HOST}:${PORT}`
  );

  console.log(
    `Local API:         ${base}/api`
  );

  console.log(
    `Health check:      ${base}/api/health`
  );

  console.log(
    `CFCV submissions:  ${base}/api/cfcv/applications`
  );

  console.log(
    `CFCV admin stats:  ${base}/api/cfcv/admin/stats`
  );

  console.log(
    `CFCV applications: ${base}/api/cfcv/admin/applications`
  );

  console.log(
    `CFCV email worker: ${workerStatus}`
  );

  console.log(
    "Database:          Supabase"
  );

  console.log(
    "============================================================\n"
  );
}

// ============================================================
// START HTTP SERVER AND EMAIL WORKER
// ============================================================

function startServer() {
  if (
    !Number.isInteger(PORT)
    || PORT < 1
    || PORT > 65535
  ) {
    throw new Error(
      "PORT must be an integer between 1 and 65535."
    );
  }

  if (
    !Number.isInteger(SHUTDOWN_TIMEOUT_MS)
    || SHUTDOWN_TIMEOUT_MS < 1000
    || SHUTDOWN_TIMEOUT_MS > 120000
  ) {
    throw new Error(
      "SHUTDOWN_TIMEOUT_MS must be an integer between 1000 and 120000."
    );
  }

  // Load after dotenv and inside the startup error handler.
  const app = require("./app");

  const {
    startCfcvEmailWorker,
    stopCfcvEmailWorker,
  } = require(
    "./services/cfcvEmailWorker"
  );

  if (
    typeof startCfcvEmailWorker !== "function"
    || typeof stopCfcvEmailWorker !== "function"
  ) {
    throw new Error(
      "CFCV email worker exports are missing."
    );
  }

  stopEmailWorker =
    stopCfcvEmailWorker;

  server = app.listen(
    PORT,
    HOST,
    () => {
      if (shuttingDown) {
        return;
      }

      try {
        const workerStarted =
          startCfcvEmailWorker() === true;

        printStartupMessage(
          workerStarted
        );
      } catch (error) {
        logError(
          "[SERVER] Failed to initialize the email worker.",
          error
        );

        void shutdown(
          "WORKER_STARTUP_ERROR",
          1
        );
      }
    }
  );

  server.on(
    "error",
    (error) => {
      if (
        error.code === "EADDRINUSE"
      ) {
        console.error(
          `[SERVER] Port ${PORT} is already in use.`
        );
      } else if (
        error.code === "EACCES"
      ) {
        console.error(
          `[SERVER] Permission denied for port ${PORT}.`
        );
      } else {
        logError(
          "[SERVER] HTTP server error.",
          error
        );
      }

      void shutdown(
        "SERVER_ERROR",
        1
      );
    }
  );

  return server;
}

// ============================================================
// START APPLICATION
// ============================================================

try {
  startServer();
} catch (error) {
  logError(
    "[SERVER] Failed to start Continental Founders API.",
    error
  );

  void shutdown(
    "STARTUP_ERROR",
    1
  );
}