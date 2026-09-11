require("dotenv").config();

const app = require("./app");


// ============================================================
// CONFIGURATION
// ============================================================

const PORT =
  Number(
    process.env.PORT
  ) || 5000;


const HOST =
  process.env.HOST ||
  "0.0.0.0";


const NODE_ENV =
  process.env.NODE_ENV ||
  "development";


// ============================================================
// START SERVER
// ============================================================

function startServer() {

  const server =
    app.listen(
      PORT,
      HOST,
      () => {

        printStartupMessage();

      }
    );


  // ==========================================================
  // SERVER ERROR HANDLER
  // ==========================================================

  server.on(
    "error",
    (error) => {

      console.error("");

      console.error(
        "============================================================"
      );

      console.error(
        " CONTINENTAL FOUNDERS SERVER ERROR"
      );

      console.error(
        "============================================================"
      );


      if (
        error.code ===
        "EADDRINUSE"
      ) {

        console.error(
          `Port ${PORT} is already in use.`
        );

        console.error(
          "Stop the process using this port or use another PORT in your .env file."
        );

      } else if (
        error.code ===
        "EACCES"
      ) {

        console.error(
          `Permission denied while trying to use port ${PORT}.`
        );

      } else {

        console.error(
          error
        );

      }


      console.error(
        "============================================================"
      );

      console.error("");

      process.exit(1);

    }
  );


  // ==========================================================
  // GRACEFUL SHUTDOWN
  // ==========================================================

  let shuttingDown =
    false;


  function shutdown(
    signal
  ) {

    if (
      shuttingDown
    ) {

      return;

    }


    shuttingDown =
      true;


    console.log("");

    console.log(
      "============================================================"
    );

    console.log(
      ` ${signal} RECEIVED`
    );

    console.log(
      "============================================================"
    );

    console.log(
      "Shutting down Continental Founders API..."
    );


    server.close(
      () => {

        console.log(
          "HTTP server closed successfully."
        );

        console.log(
          "Continental Founders API stopped successfully."
        );

        console.log(
          "============================================================"
        );

        console.log("");

        process.exit(0);

      }
    );


    setTimeout(
      () => {

        console.error(
          "Forced shutdown after timeout."
        );

        process.exit(1);

      },
      10000
    ).unref();

  }


  process.once(
    "SIGINT",
    () =>
      shutdown(
        "SIGINT"
      )
  );


  process.once(
    "SIGTERM",
    () =>
      shutdown(
        "SIGTERM"
      )
  );


  return server;

}


// ============================================================
// STARTUP MESSAGE
// ============================================================

function printStartupMessage() {

  const localBaseUrl =
    `http://localhost:${PORT}`;


  console.log("");

  console.log(
    "============================================================"
  );

  console.log(
    " CONTINENTAL FOUNDERS API"
  );

  console.log(
    "============================================================"
  );

  console.log("");


  // ==========================================================
  // SERVER
  // ==========================================================

  console.log(
    "SERVER"
  );

  console.log(
    "------------------------------------------------------------"
  );

  console.log(
    `API Server:            ${localBaseUrl}`
  );

  console.log(
    `Health Check:          ${localBaseUrl}/api/health`
  );

  console.log(
    `API Root:              ${localBaseUrl}/api`
  );

  console.log("");


  // ==========================================================
  // PUBLIC APIs
  // ==========================================================

  console.log(
    "PUBLIC APIs"
  );

  console.log(
    "------------------------------------------------------------"
  );

  console.log(
    `Published Events:      ${localBaseUrl}/api/events/published`
  );

  console.log(
    `Published Insights:    ${localBaseUrl}/api/insights/published`
  );

  console.log(
    `Insight Details:       ${localBaseUrl}/api/insights/:slug`
  );

  console.log(
    `Universities:          ${localBaseUrl}/api/universities`
  );

  console.log(
    `Partnerships:          ${localBaseUrl}/api/partnerships`
  );

  console.log(
    `Contact:               ${localBaseUrl}/api/contact`
  );

  console.log(
    `Newsletter:            ${localBaseUrl}/api/newsletter`
  );

  console.log(
    `Newsletter Subscribe:  ${localBaseUrl}/api/newsletter/subscribe`
  );

  console.log("");


  // ==========================================================
  // ADMIN CMS APIs
  // ==========================================================

  console.log(
    "ADMIN CMS APIs"
  );

  console.log(
    "------------------------------------------------------------"
  );

  console.log(
    `Events CMS:            ${localBaseUrl}/api/events`
  );

  console.log(
    `Insights CMS:          ${localBaseUrl}/api/insights`
  );

  console.log(
    `Dashboard:             ${localBaseUrl}/api/admin/dashboard`
  );

  console.log("");


  // ==========================================================
  // AUTHENTICATION
  // ==========================================================

  console.log(
    "AUTHENTICATION"
  );

  console.log(
    "------------------------------------------------------------"
  );

  console.log(
    `Auth API:              ${localBaseUrl}/api/auth`
  );

  console.log(
    `Login:                 ${localBaseUrl}/api/auth/login`
  );

  console.log(
    `Register:              ${localBaseUrl}/api/auth/register`
  );

  console.log(
    `Verify OTP:            ${localBaseUrl}/api/auth/verify-otp`
  );

  console.log(
    `Current Admin:         ${localBaseUrl}/api/auth/me`
  );

  console.log(
    `Logout:                ${localBaseUrl}/api/auth/logout`
  );

  console.log("");


  // ==========================================================
  // SYSTEM
  // ==========================================================

  console.log(
    "SYSTEM"
  );

  console.log(
    "------------------------------------------------------------"
  );

  console.log(
    "Database:              Supabase"
  );

  console.log(
    `Environment:           ${NODE_ENV}`
  );

  console.log(
    `Port:                  ${PORT}`
  );

  console.log(
    `Host:                  ${HOST}`
  );

  console.log("");


  console.log(
    "============================================================"
  );

  console.log(
    " Server started successfully"
  );

  console.log(
    "============================================================"
  );

  console.log("");

}


// ============================================================
// PROCESS ERROR HANDLING
// ============================================================

process.on(
  "uncaughtException",
  (error) => {

    console.error("");

    console.error(
      "============================================================"
    );

    console.error(
      " UNCAUGHT EXCEPTION"
    );

    console.error(
      "============================================================"
    );

    console.error(
      error
    );

    console.error(
      "============================================================"
    );

    console.error("");

    process.exit(1);

  }
);


process.on(
  "unhandledRejection",
  (reason) => {

    console.error("");

    console.error(
      "============================================================"
    );

    console.error(
      " UNHANDLED PROMISE REJECTION"
    );

    console.error(
      "============================================================"
    );

    console.error(
      reason
    );

    console.error(
      "============================================================"
    );

    console.error("");

    process.exit(1);

  }
);


// ============================================================
// START APPLICATION
// ============================================================

try {

  startServer();

} catch (
  error
) {

  console.error("");

  console.error(
    "============================================================"
  );

  console.error(
    " FAILED TO START CONTINENTAL FOUNDERS API"
  );

  console.error(
    "============================================================"
  );

  console.error(
    error
  );

  console.error(
    "============================================================"
  );

  console.error("");

  process.exit(1);

}