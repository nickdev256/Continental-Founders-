const jwt = require("jsonwebtoken");
const { z } = require("zod");

const {
  supabaseAdmin,
  supabaseAuth,
} = require("../config/supabase");

const {
  createAndSendOtp,
  verifyOtp,
} = require("../services/otpService");

// ============================================================
// CONSTANTS
// ============================================================

const SESSION_COOKIE_NAME =
  "cf_admin_session";

const JWT_ISSUER =
  "continental-founders-api";

const JWT_AUDIENCE =
  "continental-founders-admin";

const SESSION_MAX_AGE =
  8 * 60 * 60 * 1000;

const CMS_ROLES = new Set([
  "founder",
  "admin",
  "super_admin",
]);

// ============================================================
// VALIDATION
// ============================================================

const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Full name is required.")
      .max(120, "Full name is too long."),

    email: z
      .string()
      .trim()
      .email("Enter a valid email address."),

    password: z
      .string()
      .min(
        8,
        "Password must contain at least 8 characters."
      )
      .max(
        128,
        "Password is too long."
      )
      .regex(
        /[A-Z]/,
        "Password must contain an uppercase letter."
      )
      .regex(
        /[a-z]/,
        "Password must contain a lowercase letter."
      )
      .regex(
        /\d/,
        "Password must contain a number."
      ),
  })
  .strict();

const loginSchema = z
  .object({
    email: z
      .string()
      .trim()
      .email("Enter a valid email address."),

    password: z
      .string()
      .min(8)
      .max(128),
  })
  .strict();

const otpSchema = z
  .object({
    email: z
      .string()
      .trim()
      .email(),

    otp: z
      .string()
      .regex(
        /^\d{6}$/,
        "Verification code must contain exactly 6 digits."
      ),

    purpose: z
      .enum([
        "registration",
        "login",
      ])
      .optional(),
  })
  .strict();

const resendOtpSchema = z
  .object({
    email: z
      .string()
      .trim()
      .email(),

    purpose: z
      .enum([
        "registration",
        "login",
      ])
      .optional(),
  })
  .strict();

// ============================================================
// HELPERS
// ============================================================

function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

function normalizeRole(role) {
  return String(role || "")
    .trim()
    .toLowerCase();
}

function normalizeStatus(status) {
  return String(status || "")
    .trim()
    .toLowerCase();
}

// ============================================================
// SESSION COOKIE OPTIONS
// ============================================================

function getSessionCookieOptions() {
  const isProduction =
    process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,

    sameSite:
      isProduction
        ? "none"
        : "lax",

    maxAge:
      SESSION_MAX_AGE,

    path: "/",
  };
}

// ============================================================
// COOKIE CLEAR OPTIONS
//
// maxAge must not be supplied when clearing.
// ============================================================

function getClearCookieOptions() {
  const {
    maxAge,
    ...options
  } = getSessionCookieOptions();

  return options;
}

// ============================================================
// CREATE CMS SESSION TOKEN
// ============================================================

function createToken(profile) {
  const secret =
    process.env.JWT_SECRET;

  if (!secret) {
    throw new Error(
      "JWT_SECRET is missing from environment variables."
    );
  }

  return jwt.sign(
    {
      sub: String(profile.id),
    },
    secret,
    {
      algorithm: "HS256",

      expiresIn:
        process.env.JWT_EXPIRES_IN ||
        "8h",

      issuer:
        JWT_ISSUER,

      audience:
        JWT_AUDIENCE,
    }
  );
}

// ============================================================
// SAFE PROFILE
// ============================================================

function toSafeUser(profile) {
  return {
    id:
      profile.id,

    email:
      profile.email,

    name:
      profile.full_name,

    fullName:
      profile.full_name,

    role:
      normalizeRole(
        profile.role
      ),

    status:
      normalizeStatus(
        profile.status
      ),
  };
}

// ============================================================
// GET PROFILE BY EMAIL
// ============================================================

async function getProfileByEmail(email) {
  const cleanEmail =
    normalizeEmail(email);

  const {
    data,
    error,
  } = await supabaseAdmin
    .from("profiles")
    .select(
      "id, full_name, email, role, status, email_verified_at, created_at, updated_at"
    )
    .eq(
      "email",
      cleanEmail
    )
    .maybeSingle();

  if (error) {
    console.error(
      "[AUTH] Profile lookup failed:",
      error.message
    );

    throw new Error(
      "Unable to retrieve account information."
    );
  }

  return data;
}

// ============================================================
// REGISTER
// ============================================================

async function register(req, res) {
  const input =
    registerSchema.parse(
      req.body
    );

  const fullName =
    input.fullName.trim();

  const email =
    normalizeEmail(
      input.email
    );

  // ==========================================================
  // EXISTING PROFILE
  // ==========================================================

  const existingProfile =
    await getProfileByEmail(
      email
    );

  if (existingProfile) {
    return res.status(409).json({
      success: false,

      message:
        "An account already exists with this email address.",
    });
  }

  // ==========================================================
  // CREATE SUPABASE AUTH USER
  // ==========================================================

  let authResult;

  try {
    authResult =
      await supabaseAdmin
        .auth
        .admin
        .createUser({
          email,

          password:
            input.password,

          email_confirm:
            true,

          user_metadata: {
            full_name:
              fullName,
          },
        });
  } catch (error) {
    console.error(
      "[AUTH] Supabase account creation unavailable:",
      error?.message
    );

    return res.status(503).json({
      success: false,

      message:
        "The authentication service is temporarily unavailable.",
    });
  }

  const {
    data: authData,
    error: authError,
  } = authResult;

  if (
    authError ||
    !authData?.user
  ) {
    console.error(
      "[AUTH] Supabase account creation failed:",
      authError?.message
    );

    return res.status(400).json({
      success: false,

      message:
        "Unable to create your account.",
    });
  }

  const userId =
    authData.user.id;

  // ==========================================================
  // CREATE PROFILE
  // ==========================================================

  const {
    error: profileError,
  } = await supabaseAdmin
    .from("profiles")
    .insert({
      id:
        userId,

      full_name:
        fullName,

      email,

      role:
        "founder",

      status:
        "pending_verification",
    });

  if (profileError) {
    console.error(
      "[AUTH] Profile creation failed:",
      profileError.message
    );

    try {
      await supabaseAdmin
        .auth
        .admin
        .deleteUser(
          userId
        );
    } catch (rollbackError) {
      console.error(
        "[AUTH] Registration rollback failed:",
        rollbackError?.message
      );
    }

    return res.status(500).json({
      success: false,

      message:
        "Unable to create the founder profile.",
    });
  }

  // ==========================================================
  // SEND REGISTRATION OTP
  // ==========================================================

  try {
    await createAndSendOtp({
      userId,
      email,
      purpose:
        "registration",
    });
  } catch (error) {
    console.error(
      "[AUTH] Registration OTP failed:",
      error?.message
    );

    return res.status(500).json({
      success: false,
      otpRequired: true,
      email,
      purpose:
        "registration",

      message:
        "Your account was created, but the verification email could not be sent. Please request a new verification code.",
    });
  }

  return res.status(201).json({
    success: true,
    otpRequired: true,
    email,
    purpose:
      "registration",

    message:
      "Account created. A verification code has been sent to your email.",
  });
}

// ============================================================
// LOGIN
// ============================================================

async function login(req, res) {
  const input =
    loginSchema.parse(
      req.body
    );

  const email =
    normalizeEmail(
      input.email
    );

  // ==========================================================
  // VERIFY PASSWORD THROUGH SUPABASE
  // ==========================================================

  let authResult;

  try {
    authResult =
      await supabaseAuth
        .auth
        .signInWithPassword({
          email,

          password:
            input.password,
        });
  } catch (error) {
    console.error(
      "[AUTH] Supabase login unavailable:",
      error?.message
    );

    return res.status(503).json({
      success: false,

      message:
        "The authentication service is temporarily unavailable. Please try again.",
    });
  }

  const {
    data: authData,
    error: authError,
  } = authResult;

  if (
    authError ||
    !authData?.user
  ) {
    return res.status(401).json({
      success: false,

      message:
        "Incorrect email or password.",
    });
  }

  // ==========================================================
  // LOAD CMS PROFILE
  // ==========================================================

  let profile;

  try {
    profile =
      await getProfileByEmail(
        email
      );
  } catch (error) {
    console.error(
      "[AUTH] Profile lookup after login failed:",
      error?.message
    );

    return res.status(503).json({
      success: false,

      message:
        "Your account could not be verified at this time.",
    });
  }

  if (!profile) {
    return res.status(403).json({
      success: false,

      message:
        "Your Continental Founders profile could not be found.",
    });
  }

  // ==========================================================
  // AUTH USER / PROFILE MATCH
  // ==========================================================

  if (
    String(profile.id) !==
    String(authData.user.id)
  ) {
    console.error(
      "[AUTH] Authentication/profile ID mismatch."
    );

    return res.status(403).json({
      success: false,

      message:
        "Your account information could not be verified.",
    });
  }

  const status =
    normalizeStatus(
      profile.status
    );

  const role =
    normalizeRole(
      profile.role
    );

  // ==========================================================
  // ROLE CHECK
  // ==========================================================

  if (
    !CMS_ROLES.has(role)
  ) {
    return res.status(403).json({
      success: false,

      message:
        "You do not have permission to access the CMS.",
    });
  }

  // ==========================================================
  // DISABLED
  // ==========================================================

  if (
    status === "disabled"
  ) {
    return res.status(403).json({
      success: false,

      message:
        "This account has been disabled.",
    });
  }

  // ==========================================================
  // PENDING EMAIL VERIFICATION
  // ==========================================================

  if (
    status ===
    "pending_verification"
  ) {
    try {
      await createAndSendOtp({
        userId:
          profile.id,

        email:
          profile.email,

        purpose:
          "registration",
      });
    } catch (error) {
      console.error(
        "[AUTH] Registration OTP resend failed:",
        error?.message
      );

      return res.status(500).json({
        success: false,
        otpRequired: true,

        email:
          profile.email,

        purpose:
          "registration",

        message:
          "Your password was accepted, but the verification email could not be sent.",
      });
    }

    return res.json({
      success: true,
      otpRequired: true,

      email:
        profile.email,

      purpose:
        "registration",

      message:
        "Please verify your email address. A new verification code has been sent.",
    });
  }

  // ==========================================================
  // PENDING ADMIN APPROVAL
  // ==========================================================

  if (
    status ===
    "pending_approval"
  ) {
    return res.status(403).json({
      success: false,
      approvalRequired: true,

      message:
        "Your email has been verified. Your CMS account is awaiting approval.",
    });
  }

  // ==========================================================
  // MUST BE ACTIVE
  // ==========================================================

  if (
    status !== "active"
  ) {
    return res.status(403).json({
      success: false,

      message:
        "Your account is not currently active.",
    });
  }

  // ==========================================================
  // SEND LOGIN OTP
  // ==========================================================

  try {
    await createAndSendOtp({
      userId:
        profile.id,

      email:
        profile.email,

      purpose:
        "login",
    });
  } catch (error) {
    console.error(
      "[AUTH] Login OTP failed:",
      error?.message
    );

    return res.status(500).json({
      success: false,
      otpRequired: true,

      email:
        profile.email,

      purpose:
        "login",

      message:
        "Your password was accepted, but the login verification email could not be sent.",
    });
  }

  return res.json({
    success: true,
    otpRequired: true,

    email:
      profile.email,

    purpose:
      "login",

    message:
      "Password accepted. A verification code has been sent to your email.",
  });
}

// ============================================================
// VERIFY OTP
// ============================================================

async function verifyOtpCode(
  req,
  res
) {
  const input =
    otpSchema.parse(
      req.body
    );

  const email =
    normalizeEmail(
      input.email
    );

  const profile =
    await getProfileByEmail(
      email
    );

  if (!profile) {
    return res.status(400).json({
      success: false,

      message:
        "Unable to verify this account.",
    });
  }

  const status =
    normalizeStatus(
      profile.status
    );

  if (
    status === "disabled"
  ) {
    return res.status(403).json({
      success: false,

      message:
        "This account has been disabled.",
    });
  }

  // ==========================================================
  // DETERMINE PURPOSE
  // ==========================================================

  const purpose =
    input.purpose ||
    (
      status ===
      "pending_verification"
        ? "registration"
        : "login"
    );

  // Registration OTP is only valid while awaiting
  // initial email verification.

  if (
    purpose === "registration" &&
    status !==
      "pending_verification"
  ) {
    return res.status(400).json({
      success: false,

      message:
        "This account is not awaiting email verification.",
    });
  }

  // Login OTP is only meaningful for an active account.

  if (
    purpose === "login" &&
    status !== "active"
  ) {
    return res.status(403).json({
      success: false,

      message:
        status ===
        "pending_approval"
          ? "Your CMS account is awaiting approval."
          : "This account is not active.",
    });
  }

  // ==========================================================
  // VERIFY OTP
  // ==========================================================

  const result =
    await verifyOtp({
      userId:
        profile.id,

      email:
        profile.email,

      otp:
        input.otp,

      purpose,
    });

  if (!result.valid) {
    return res.status(400).json({
      success: false,

      message:
        result.message ||
        "Invalid verification code.",
    });
  }

  // ==========================================================
  // REGISTRATION VERIFICATION
  //
  // Email verification DOES NOT grant CMS access.
  // ==========================================================

  if (
    purpose === "registration"
  ) {
    const now =
      new Date().toISOString();

    const {
      data: updatedProfile,
      error: updateError,
    } = await supabaseAdmin
      .from("profiles")
      .update({
        status:
          "pending_approval",

        email_verified_at:
          now,

        updated_at:
          now,
      })
      .eq(
        "id",
        profile.id
      )
      .eq(
        "status",
        "pending_verification"
      )
      .select(
        "id, full_name, email, role, status, email_verified_at"
      )
      .maybeSingle();

    if (
      updateError ||
      !updatedProfile
    ) {
      console.error(
        "[AUTH] Profile verification update failed:",
        updateError?.message
      );

      return res.status(500).json({
        success: false,

        message:
          "Your code was verified, but the account status could not be updated.",
      });
    }

    return res.json({
      success: true,
      approvalRequired: true,

      user:
        toSafeUser(
          updatedProfile
        ),

      message:
        "Your email has been verified. Your CMS account is now awaiting approval.",
    });
  }

  // ==========================================================
  // LOGIN OTP: RELOAD PROFILE
  //
  // Check status/role again after OTP verification before
  // issuing a session.
  // ==========================================================

  const currentProfile =
    await getProfileByEmail(
      email
    );

  if (!currentProfile) {
    return res.status(401).json({
      success: false,

      message:
        "Unable to verify this account.",
    });
  }

  const currentStatus =
    normalizeStatus(
      currentProfile.status
    );

  const currentRole =
    normalizeRole(
      currentProfile.role
    );

  if (
    currentStatus !== "active" ||
    !CMS_ROLES.has(currentRole)
  ) {
    return res.status(403).json({
      success: false,

      message:
        "This account is not authorized to access the CMS.",
    });
  }

  // ==========================================================
  // CREATE SESSION
  // ==========================================================

  const token =
    createToken(
      currentProfile
    );

  res.cookie(
    SESSION_COOKIE_NAME,
    token,
    getSessionCookieOptions()
  );

  return res.json({
    success: true,

    user:
      toSafeUser(
        currentProfile
      ),

    message:
      "Sign in successful.",
  });
}

// ============================================================
// RESEND OTP
// ============================================================

async function resendOtp(
  req,
  res
) {
  const input =
    resendOtpSchema.parse(
      req.body
    );

  const email =
    normalizeEmail(
      input.email
    );

  const genericResponse = {
    success: true,

    message:
      "If this account is eligible, a verification code has been sent.",
  };

  const profile =
    await getProfileByEmail(
      email
    );

  if (!profile) {
    return res.json(
      genericResponse
    );
  }

  const status =
    normalizeStatus(
      profile.status
    );

  const role =
    normalizeRole(
      profile.role
    );

  if (
    status === "disabled" ||
    !CMS_ROLES.has(role)
  ) {
    return res.json(
      genericResponse
    );
  }

  const purpose =
    input.purpose ||
    (
      status ===
      "pending_verification"
        ? "registration"
        : "login"
    );

  // ==========================================================
  // REGISTRATION RESEND
  // ==========================================================

  if (
    purpose === "registration"
  ) {
    if (
      status !==
      "pending_verification"
    ) {
      return res.json(
        genericResponse
      );
    }
  }

  // ==========================================================
  // LOGIN RESEND
  // ==========================================================

  if (
    purpose === "login"
  ) {
    if (
      status !== "active"
    ) {
      return res.json(
        genericResponse
      );
    }
  }

  // ==========================================================
  // SEND
  // ==========================================================

  try {
    await createAndSendOtp({
      userId:
        profile.id,

      email:
        profile.email,

      purpose,
    });
  } catch (error) {
    console.error(
      "[AUTH] OTP resend failed:",
      error?.message
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to send a new verification code.",
    });
  }

  return res.json({
    success: true,

    email:
      profile.email,

    purpose,

    message:
      "A new verification code has been sent to your email.",
  });
}

// ============================================================
// CURRENT AUTHENTICATED USER
// ============================================================

async function me(req, res) {
  if (!req.admin) {
    return res.status(401).json({
      success: false,

      message:
        "No authenticated CMS session was found.",
    });
  }

  return res.json({
    success: true,

    user:
      toSafeUser(
        req.admin
      ),
  });
}

// ============================================================
// LOGOUT
// ============================================================

async function logout(req, res) {
  res.clearCookie(
    SESSION_COOKIE_NAME,
    getClearCookieOptions()
  );

  return res.json({
    success: true,

    message:
      "Signed out successfully.",
  });
}

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  register,
  login,
  verifyOtpCode,
  resendOtp,
  me,
  logout,
};