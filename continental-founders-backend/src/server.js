require("dotenv").config();

const app = require("./app");

const PORT =
  process.env.PORT || 5000;


// ============================================================
// START SERVER
// ============================================================

function start() {
  app.listen(PORT, () => {
    console.log(
      `Continental Founders API running on http://localhost:${PORT}`
    );

    console.log(
      `Health check: http://localhost:${PORT}/api/health`
    );

    console.log(
      "Database: Supabase"
    );
  });
}


// ============================================================
// START
// ============================================================

try {
  start();
} catch (error) {
  console.error(
    "Failed to start server:",
    error
  );

  process.exit(1);
}