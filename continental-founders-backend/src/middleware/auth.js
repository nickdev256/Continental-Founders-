const jwt = require("jsonwebtoken");

const {
  supabaseAdmin,
} = require("../config/supabase");

// ============================================================
// CONFIGURATION
// ============================================================

const SESSION_COOKIE_NAME =
  "cf_admin_session";

const CMS_ROLES = new Set([
  "founder",
  "admin",
  "super_admin",
]);

const ACTIVE_STATUS = "active";

// These values must match the values used when signing
// the admin session token.
const JWT_ISSUER =
  "continental-founders-api";

const JWT_AUDIENCE =
  "continental-founders-admin";

// ============================================================
// REQUIRE CMS AUTHENTICATION
// ============================================================

async function requireAdmin(req, res, next) {
  try {
    // ========================================================
    // GET SESSION TOKEN
    // ========================================================

    const cookieToken =
      req.cookies?.[SESSION_COOKIE_NAME];

    const authHeader =
      typeof req.headers.authorization === "string"
        ? req.headers.authorization.trim()
        : "";

    let bearerToken = null;

    if (authHeader) {
      const match = authHeader.match(
        /^Bearer\s+([^\s]+)$/i
      );

      if (!match) {
        return res.status(401).json({
          success: false,
          message: "Invalid authorization header.",
        });
      }

      bearerToken = match[1];
    }

    // Prefer the HttpOnly cookie.
    const token =
      cookieToken || bearerToken;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    // ========================================================
    // VERIFY SERVER CONFIGURATION
    // ========================================================

    const jwtSecret =
      process.env.JWT_SECRET;

    if (!jwtSecret) {
      console.error(
        "[AUTH] JWT_SECRET is not configured."
      );

      return res.status(500).json({
        success: false,
        message:
          "Authentication service is unavailable.",
      });
    }

    // ========================================================
    // VERIFY JWT
    // ========================================================

    const decoded = jwt.verify(
      token,
      jwtSecret,
      {
        algorithms: ["HS256"],
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
      }
    );

    if (
      !decoded ||
      typeof decoded !== "object" ||
      typeof decoded.sub !== "string" ||
      !decoded.sub.trim()
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid session.",
      });
    }

    const userId =
      decoded.sub.trim();

    // ========================================================
    // LOAD CURRENT PROFILE
    //
    // Never trust role/status claims from the JWT.
    // Current authorization comes from the database.
    // ========================================================

    const {
      data: profile,
      error: profileError,
    } = await supabaseAdmin
      .from("profiles")
      .select(
        "id, full_name, email, role, status, email_verified_at"
      )
      .eq("id", userId)
      .maybeSingle();

    if (profileError) {
      console.error(
        "[AUTH] Profile lookup failed:",
        profileError.message
      );

      return res.status(503).json({
        success: false,
        message:
          "Unable to verify your session at this time.",
      });
    }

    if (!profile) {
      return res.status(401).json({
        success: false,
        message: "Invalid session.",
      });
    }

    // ========================================================
    // NORMALIZE AUTHORIZATION VALUES
    // ========================================================

    const status =
      typeof profile.status === "string"
        ? profile.status.trim().toLowerCase()
        : "";

    const role =
      typeof profile.role === "string"
        ? profile.role.trim().toLowerCase()
        : "";

    // ========================================================
    // CHECK ACCOUNT STATUS
    // ========================================================

    if (status !== ACTIVE_STATUS) {
      return res.status(403).json({
        success: false,

        message:
          status === "disabled"
            ? "This account has been disabled."
            : "This account is not active.",
      });
    }

    // ========================================================
    // CHECK CMS ROLE
    // ========================================================

    if (!CMS_ROLES.has(role)) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have permission to access the CMS.",
      });
    }

    // ========================================================
    // ATTACH MINIMUM SAFE PROFILE
    // ========================================================

    req.admin = {
      id: profile.id,
      full_name: profile.full_name,
      email: profile.email,
      role,
      status,
      email_verified_at:
        profile.email_verified_at,
    };

    return next();
  } catch (error) {
    // ========================================================
    // EXPECTED JWT FAILURES
    // ========================================================

    if (error?.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message:
          "Your session has expired. Please sign in again.",
      });
    }

    if (
      error?.name === "JsonWebTokenError" ||
      error?.name === "NotBeforeError"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid session.",
      });
    }

    // ========================================================
    // UNEXPECTED FAILURE
    // ========================================================

    console.error(
      "[AUTH] Unexpected authentication error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Authentication service is temporarily unavailable.",
    });
  }
}

// ============================================================
// ROLE AUTHORIZATION
// ============================================================

function requireRole(...roles) {
  const allowedRoles = new Set(
    roles
      .filter(
        (role) =>
          typeof role === "string"
      )
      .map((role) =>
        role.trim().toLowerCase()
      )
      .filter(Boolean)
  );

  return function roleMiddleware(
    req,
    res,
    next
  ) {
    if (!req.admin) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const currentRole =
      typeof req.admin.role === "string"
        ? req.admin.role
            .trim()
            .toLowerCase()
        : "";

    if (!allowedRoles.has(currentRole)) {
      return res.status(403).json({
        success: false,
        message:
          "You do not have permission to perform this action.",
      });
    }

    return next();
  };
}

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  requireAdmin,
  requireRole,
};