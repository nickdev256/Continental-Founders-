const {
  createClient,
} = require("@supabase/supabase-js");

// ============================================================
// ENVIRONMENT VARIABLES
//
// server.js loads dotenv before importing this module.
// ============================================================

function requiredEnv(name) {
  const value = String(
    process.env[name] || ""
  ).trim();

  if (!value) {
    throw new Error(
      `${name} is missing from environment variables.`
    );
  }

  return value;
}

const supabaseUrl =
  requiredEnv("SUPABASE_URL");

const supabaseServiceRoleKey =
  requiredEnv("SUPABASE_SERVICE_ROLE_KEY");

const supabaseAnonKey =
  requiredEnv("SUPABASE_ANON_KEY");

// ============================================================
// URL VALIDATION
// ============================================================

let parsedUrl;

try {
  parsedUrl = new URL(supabaseUrl);
} catch {
  throw new Error(
    "SUPABASE_URL must be a valid HTTP or HTTPS URL."
  );
}

if (
  !["http:", "https:"].includes(parsedUrl.protocol)
  || parsedUrl.username
  || parsedUrl.password
  || parsedUrl.search
  || parsedUrl.hash
) {
  throw new Error(
    "SUPABASE_URL must be an HTTP or HTTPS project URL without credentials, query parameters or fragments."
  );
}

// ============================================================
// SERVER ADMIN CLIENT
//
// Used by existing backend database operations,
// the CFCV controller and the CFCV email worker.
//
// Keep the service-role key exclusively in the backend.
// Do not sign users into this shared administrative client.
// ============================================================

const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  }
);

// ============================================================
// AUTH CLIENT
//
// Uses the anon key for existing backend auth operations.
// ============================================================

const supabaseAuth = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  }
);

// ============================================================
// COMPATIBLE EXPORTS
//
// Existing direct import:
//
// const supabase = require("../config/supabase");
//
// CFCV controller and worker:
//
// const {
//   supabaseAdmin,
// } = require("../config/supabase");
// ============================================================

module.exports = supabaseAdmin;

module.exports.supabase =
  supabaseAdmin;

module.exports.supabaseAdmin =
  supabaseAdmin;

module.exports.supabaseAuth =
  supabaseAuth;