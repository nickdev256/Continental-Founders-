require("dotenv").config();

const app = require("./app");

const PORT =
  process.env.PORT || 5000;


// ============================================================
// START SERVER
// ============================================================

function start() {

  const server =
    app.listen(
      PORT,
      () => {

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

        console.log(
          `API Server:     http://localhost:${PORT}`
        );

        console.log(
          `Health Check:   http://localhost:${PORT}/api/health`
        );

        console.log("");

        console.log(
          "PUBLIC APIs"
        );

        console.log(
          "------------------------------------------------------------"
        );

        console.log(
          `Events:         http://localhost:${PORT}/api/events`
        );

        console.log(
          `Insights:       http://localhost:${PORT}/api/insights`
        );

        console.log(
          `Universities:   http://localhost:${PORT}/api/universities`
        );

        console.log(
          `Partnerships:   http://localhost:${PORT}/api/partnerships`
        );

        console.log(
          `Contact:        http://localhost:${PORT}/api/contact`
        );

        console.log(
          `Newsletter:     http://localhost:${PORT}/api/newsletter`
        );

        console.log("");

        console.log(
          "AUTH / ADMIN"
        );

        console.log(
          "------------------------------------------------------------"
        );

        console.log(
          `Authentication: http://localhost:${PORT}/api/auth`
        );

        console.log(
          `Dashboard:      http://localhost:${PORT}/api/admin/dashboard`
        );

        console.log("");

        console.log(
          `Database:       Supabase`
        );

        console.log(
          `Environment:    ${process.env.NODE_ENV || "development"}`
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
    );


  // ==========================================================
  // SERVER ERROR
  // ==========================================================

  server.on(
    "error",
    (error) => {

      console.error("");
      console.error(
        "============================================================"
      );

      console.error(
        " SERVER ERROR"
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


  // ==========================================================
  // GRACEFUL SHUTDOWN
  // ==========================================================

  function shutdown(signal) {

    console.log("");

    console.log(
      `${signal} received. Shutting down Continental Founders API...`
    );


    server.close(
      () => {

        console.log(
          "Server stopped successfully."
        );

        process.exit(0);
      }
    );

  }


  process.on(
    "SIGINT",
    () =>
      shutdown(
        "SIGINT"
      )
  );


  process.on(
    "SIGTERM",
    () =>
      shutdown(
        "SIGTERM"
      )
  );

}


// ============================================================
// START APPLICATION
// ============================================================

try {

  start();

} catch (error) {

  console.error(
    "Failed to start Continental Founders API:",
    error
  );

  process.exit(1);

}