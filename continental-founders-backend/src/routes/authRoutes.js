const express =
  require("express");

const rateLimit =
  require("express-rate-limit");

const asyncHandler =
  require("../utils/asyncHandler");

const {
  register,
  login,
  verifyOtpCode,
  resendOtp,
  me,
  logout,
} =
  require("../controllers/authController");

const {
  requireAdmin,
} =
  require("../middleware/auth");


const router =
  express.Router();


/* ============================================================
   AUTH RATE LIMITER

   Protect registration and login from repeated requests.
============================================================ */

const authLimiter =
  rateLimit({

    windowMs:
      15 * 60 * 1000,

    limit:
      20,

    standardHeaders:
      "draft-8",

    legacyHeaders:
      false,

    message: {

      success:
        false,

      message:
        "Too many authentication attempts. Please wait a few minutes and try again.",

    },

  });


/* ============================================================
   OTP RATE LIMITER

   Protect OTP verification and resend endpoints.
============================================================ */

const otpLimiter =
  rateLimit({

    windowMs:
      10 * 60 * 1000,

    limit:
      15,

    standardHeaders:
      "draft-8",

    legacyHeaders:
      false,

    message: {

      success:
        false,

      message:
        "Too many verification attempts. Please wait before trying again.",

    },

  });


/* ============================================================
   REGISTER

   POST /api/auth/register
============================================================ */

router.post(
  "/register",

  authLimiter,

  asyncHandler(
    register
  )
);


/* ============================================================
   LOGIN

   POST /api/auth/login

   Password is checked first.
   Successful password authentication triggers OTP.
============================================================ */

router.post(
  "/login",

  authLimiter,

  asyncHandler(
    login
  )
);


/* ============================================================
   VERIFY OTP

   POST /api/auth/verify-otp

   Final CMS session is created only after successful OTP.
============================================================ */

router.post(
  "/verify-otp",

  otpLimiter,

  asyncHandler(
    verifyOtpCode
  )
);


/* ============================================================
   RESEND OTP

   POST /api/auth/resend-otp
============================================================ */

router.post(
  "/resend-otp",

  otpLimiter,

  asyncHandler(
    resendOtp
  )
);


/* ============================================================
   CURRENT USER

   GET /api/auth/me
============================================================ */

router.get(
  "/me",

  requireAdmin,

  asyncHandler(
    me
  )
);


/* ============================================================
   LOGOUT

   POST /api/auth/logout
============================================================ */

router.post(
  "/logout",

  requireAdmin,

  asyncHandler(
    logout
  )
);


/* ============================================================
   EXPORT
============================================================ */

module.exports =
  router;