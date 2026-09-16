const express = require("express");
const rateLimit = require("express-rate-limit");

const asyncHandler =
  require("../utils/asyncHandler");

const {
  register,
  login,
  verifyOtpCode,
  resendOtp,
  me,
  logout,
} = require("../controllers/authController");

const {
  requireAdmin,
} = require("../middleware/auth");

const router = express.Router();

// ============================================================
// COMMON RATE-LIMIT SETTINGS
// ============================================================

const commonLimiterOptions = {
  standardHeaders: true,
  legacyHeaders: false,
};

// ============================================================
// REGISTRATION LIMITER
//
// Registration is rare for a CMS.
// ============================================================

const registerLimiter = rateLimit({
  ...commonLimiterOptions,

  windowMs:
    60 * 60 * 1000,

  limit:
    5,

  message: {
    success: false,
    message:
      "Too many registration attempts. Please try again later.",
  },
});

// ============================================================
// LOGIN LIMITER
//
// Protects password authentication from repeated attempts.
// ============================================================

const loginLimiter = rateLimit({
  ...commonLimiterOptions,

  windowMs:
    15 * 60 * 1000,

  limit:
    10,

  message: {
    success: false,
    message:
      "Too many sign-in attempts. Please wait before trying again.",
  },
});

// ============================================================
// OTP VERIFICATION LIMITER
//
// The OTP record itself also enforces a maximum number
// of incorrect attempts.
// ============================================================

const verifyOtpLimiter = rateLimit({
  ...commonLimiterOptions,

  windowMs:
    10 * 60 * 1000,

  limit:
    10,

  message: {
    success: false,
    message:
      "Too many verification attempts. Please wait before trying again.",
  },
});

// ============================================================
// OTP RESEND LIMITER
//
// Much stricter because every successful request can send
// an email and create a new OTP.
// ============================================================

const resendOtpLimiter = rateLimit({
  ...commonLimiterOptions,

  windowMs:
    15 * 60 * 1000,

  limit:
    3,

  message: {
    success: false,
    message:
      "Too many verification-code requests. Please wait before requesting another code.",
  },
});

// ============================================================
// REGISTER
//
// POST /api/auth/register
// ============================================================

router.post(
  "/register",
  registerLimiter,
  asyncHandler(register)
);

// ============================================================
// LOGIN
//
// POST /api/auth/login
//
// Password is verified first.
// A successful password check triggers OTP.
// ============================================================

router.post(
  "/login",
  loginLimiter,
  asyncHandler(login)
);

// ============================================================
// VERIFY OTP
//
// POST /api/auth/verify-otp
// ============================================================

router.post(
  "/verify-otp",
  verifyOtpLimiter,
  asyncHandler(verifyOtpCode)
);

// ============================================================
// RESEND OTP
//
// POST /api/auth/resend-otp
// ============================================================

router.post(
  "/resend-otp",
  resendOtpLimiter,
  asyncHandler(resendOtp)
);

// ============================================================
// CURRENT AUTHENTICATED CMS USER
//
// GET /api/auth/me
// ============================================================

router.get(
  "/me",
  requireAdmin,
  asyncHandler(me)
);

// ============================================================
// LOGOUT
//
// POST /api/auth/logout
// ============================================================

router.post(
  "/logout",
  requireAdmin,
  asyncHandler(logout)
);

// ============================================================
// EXPORT
// ============================================================

module.exports = router;