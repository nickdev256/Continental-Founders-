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

/* ============================================================
   COMMON RATE-LIMIT SETTINGS
============================================================ */

const commonLimiterOptions = {
  standardHeaders: true,
  legacyHeaders: false,
};

/* ============================================================
   REGISTRATION LIMITER

   Registration is protected against abuse while allowing
   enough attempts during CMS development and testing.

   20 attempts per 15 minutes per client.
============================================================ */

const registerLimiter = rateLimit({
  ...commonLimiterOptions,

  windowMs:
    15 * 60 * 1000,

  limit:
    20,

  message: {
    success: false,
    message:
      "Too many registration attempts. Please wait a few minutes before trying again.",
  },
});

/* ============================================================
   LOGIN LIMITER

   Protects password authentication from repeated attempts.
============================================================ */

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

/* ============================================================
   OTP VERIFICATION LIMITER

   The OTP record itself should also enforce its own maximum
   number of incorrect verification attempts.
============================================================ */

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

/* ============================================================
   OTP RESEND LIMITER

   This remains stricter because each successful request can
   generate a new OTP and send another email.
============================================================ */

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

/* ============================================================
   REGISTER

   POST /api/auth/register
============================================================ */

router.post(
  "/register",
  registerLimiter,
  asyncHandler(register)
);

/* ============================================================
   LOGIN

   POST /api/auth/login

   Password authentication happens inside the controller.
   A successful login can then trigger OTP verification.
============================================================ */

router.post(
  "/login",
  loginLimiter,
  asyncHandler(login)
);

/* ============================================================
   VERIFY OTP

   POST /api/auth/verify-otp
============================================================ */

router.post(
  "/verify-otp",
  verifyOtpLimiter,
  asyncHandler(verifyOtpCode)
);

/* ============================================================
   RESEND OTP

   POST /api/auth/resend-otp
============================================================ */

router.post(
  "/resend-otp",
  resendOtpLimiter,
  asyncHandler(resendOtp)
);

/* ============================================================
   CURRENT AUTHENTICATED CMS USER

   GET /api/auth/me
============================================================ */

router.get(
  "/me",
  requireAdmin,
  asyncHandler(me)
);

/* ============================================================
   LOGOUT

   POST /api/auth/logout
============================================================ */

router.post(
  "/logout",
  requireAdmin,
  asyncHandler(logout)
);

/* ============================================================
   EXPORT
============================================================ */

module.exports = router;