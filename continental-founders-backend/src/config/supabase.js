const {
  createClient,
} = require("@supabase/supabase-js");


/* ============================================================
   ENVIRONMENT VARIABLES
============================================================ */

const supabaseUrl =
  process.env.SUPABASE_URL;

const supabaseServiceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAnonKey =
  process.env.SUPABASE_ANON_KEY;


/* ============================================================
   VALIDATE ENVIRONMENT
============================================================ */

if (!supabaseUrl) {
  throw new Error(
    "SUPABASE_URL is missing from environment variables."
  );
}


if (!supabaseServiceRoleKey) {
  throw new Error(
    "SUPABASE_SERVICE_ROLE_KEY is missing from environment variables."
  );
}


if (!supabaseAnonKey) {
  throw new Error(
    "SUPABASE_ANON_KEY is missing from environment variables."
  );
}


/* ============================================================
   SERVER ADMIN CLIENT

   Uses the service-role key.

   Use this client for:
   - Database operations
   - Creating founder accounts
   - Updating profiles
   - OTP records
   - Server-side administrative operations

   NEVER expose this client/key to the frontend.
============================================================ */

const supabase =
  createClient(
    supabaseUrl,
    supabaseServiceRoleKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );


/* ============================================================
   AUTH CLIENT

   Uses the anon key.

   This client is used when we need normal Supabase
   authentication behaviour such as checking a founder's
   email and password.
============================================================ */

const supabaseAuth =
  createClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );


/* ============================================================
   EXPORTS

   Keep "supabase" so your existing backend files that use:

   const supabase = require("../config/supabase");

   do not suddenly break.

   The extra clients are attached as properties.
============================================================ */

module.exports =
  supabase;

module.exports.supabase =
  supabase;

module.exports.supabaseAdmin =
  supabase;

module.exports.supabaseAuth =
  supabaseAuth;