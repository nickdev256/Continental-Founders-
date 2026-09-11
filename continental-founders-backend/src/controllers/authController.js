const jwt =
  require("jsonwebtoken");

const {
  z,
} =
  require("zod");

const {
  supabaseAdmin,
  supabaseAuth,
} =
  require("../config/supabase");

const {
  createAndSendOtp,
  verifyOtp,
} =
  require("../services/otpService");


/* ============================================================
   VALIDATION SCHEMAS
============================================================ */

const registerSchema =
  z.object({

    fullName:
      z
        .string()
        .trim()
        .min(
          2,
          "Full name is required."
        )
        .max(
          120,
          "Full name is too long."
        ),

    email:
      z
        .string()
        .email(
          "Enter a valid email address."
        ),

    password:
      z
        .string()
        .min(
          8,
          "Password must contain at least 8 characters."
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

  });


const loginSchema =
  z.object({

    email:
      z
        .string()
        .email(
          "Enter a valid email address."
        ),

    password:
      z
        .string()
        .min(
          8,
          "Password must contain at least 8 characters."
        ),

  });


const otpSchema =
  z.object({

    email:
      z
        .string()
        .email(),

    otp:
      z
        .string()
        .regex(
          /^\d{6}$/,
          "Verification code must contain exactly 6 digits."
        ),

    purpose:
      z
        .enum([
          "registration",
          "login",
        ])
        .optional(),

  });


const resendOtpSchema =
  z.object({

    email:
      z
        .string()
        .email(),

    purpose:
      z
        .enum([
          "registration",
          "login",
        ])
        .optional(),

  });


/* ============================================================
   CREATE CMS SESSION TOKEN
============================================================ */

function createToken(
  profile
) {

  if (!process.env.JWT_SECRET) {

    throw new Error(
      "JWT_SECRET is missing from environment variables."
    );

  }


  return jwt.sign(

    {
      sub:
        profile.id,

      email:
        profile.email,

      role:
        profile.role,
    },

    process.env.JWT_SECRET,

    {
      expiresIn:
        process.env.JWT_EXPIRES_IN ||
        "1d",
    }

  );

}


/* ============================================================
   SAFE PROFILE
============================================================ */

function toSafeUser(
  profile
) {

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
      profile.role,

    status:
      profile.status,

  };

}


/* ============================================================
   GET PROFILE BY EMAIL
============================================================ */

async function getProfileByEmail(
  email
) {

  const cleanEmail =
    String(
      email || ""
    )
      .trim()
      .toLowerCase();


  const {
    data,
    error,
  } =
    await supabaseAdmin
      .from(
        "profiles"
      )
      .select(
        "*"
      )
      .eq(
        "email",
        cleanEmail
      )
      .maybeSingle();


  if (error) {

    console.error(
      "Profile lookup error:",
      error
    );


    throw new Error(
      "Unable to retrieve account information."
    );

  }


  return data;

}


/* ============================================================
   GET PROFILE BY ID
============================================================ */

async function getProfileById(
  id
) {

  const {
    data,
    error,
  } =
    await supabaseAdmin
      .from(
        "profiles"
      )
      .select(
        "*"
      )
      .eq(
        "id",
        id
      )
      .maybeSingle();


  if (error) {

    console.error(
      "Profile lookup error:",
      error
    );


    throw new Error(
      "Unable to retrieve account information."
    );

  }


  return data;

}


/* ============================================================
   REGISTER FOUNDER
============================================================ */

async function register(
  req,
  res
) {

  const input =
    registerSchema.parse(
      req.body
    );


  const fullName =
    input.fullName
      .trim();


  const email =
    input.email
      .trim()
      .toLowerCase();


  /* ==========================================================
     CHECK EXISTING PROFILE
  ========================================================== */

  const existingProfile =
    await getProfileByEmail(
      email
    );


  if (existingProfile) {

    return res
      .status(409)
      .json({

        success:
          false,

        message:
          "An account already exists with this email address.",

      });

  }


  /* ==========================================================
     CREATE SUPABASE AUTH USER
  ========================================================== */

  const {
    data:
      authData,

    error:
      authError,
  } =
    await supabaseAdmin
      .auth
      .admin
      .createUser({

        email,

        password:
          input.password,

        /*
          Continental Founders handles its own
          registration OTP verification.
        */

        email_confirm:
          true,

        user_metadata: {

          full_name:
            fullName,

        },

      });


  if (
    authError ||
    !authData?.user
  ) {

    console.error(
      "Supabase account creation error:",
      authError
    );


    return res
      .status(400)
      .json({

        success:
          false,

        message:
          authError?.message ||
          "Unable to create your account.",

      });

  }


  const userId =
    authData.user.id;


  /* ==========================================================
     CREATE PROFILE
  ========================================================== */

  const {
    error:
      profileError,
  } =
    await supabaseAdmin
      .from(
        "profiles"
      )
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
      "Profile creation error:",
      profileError
    );


    /* ========================================================
       ROLLBACK AUTH USER
    ======================================================== */

    try {

      await supabaseAdmin
        .auth
        .admin
        .deleteUser(
          userId
        );

    } catch (
      rollbackError
    ) {

      console.error(
        "Registration rollback error:",
        rollbackError
      );

    }


    return res
      .status(500)
      .json({

        success:
          false,

        message:
          "Unable to create the founder profile.",

      });

  }


  /* ==========================================================
     SEND REGISTRATION OTP
  ========================================================== */

  try {

    await createAndSendOtp({

      userId,

      email,

      purpose:
        "registration",

    });

  } catch (
    otpError
  ) {

    console.error(
      "Registration OTP error:",
      otpError
    );


    return res
      .status(500)
      .json({

        success:
          false,

        otpRequired:
          true,

        email,

        purpose:
          "registration",

        message:
          "Your account was created, but the verification email could not be sent. Please request a new verification code.",

      });

  }


  /* ==========================================================
     SUCCESS
  ========================================================== */

  return res
    .status(201)
    .json({

      success:
        true,

      otpRequired:
        true,

      email,

      purpose:
        "registration",

      message:
        "Account created. A verification code has been sent to your personal email.",

    });

}


/* ============================================================
   LOGIN
============================================================ */

async function login(
  req,
  res
) {

  const input =
    loginSchema.parse(
      req.body
    );


  const email =
    input.email
      .trim()
      .toLowerCase();


  /* ==========================================================
     VERIFY EMAIL + PASSWORD THROUGH SUPABASE
  ========================================================== */

  let authData =
    null;

  let authError =
    null;


  try {

    const authResult =
      await supabaseAuth
        .auth
        .signInWithPassword({

          email,

          password:
            input.password,

        });


    authData =
      authResult.data;


    authError =
      authResult.error;

  } catch (
    unexpectedAuthError
  ) {

    console.error(
      "Unexpected Supabase login exception:",
      {
        message:
          unexpectedAuthError?.message,

        name:
          unexpectedAuthError?.name,

        code:
          unexpectedAuthError?.code,

        status:
          unexpectedAuthError?.status,
      }
    );


    return res
      .status(500)
      .json({

        success:
          false,

        message:
          "Unable to verify your login at the moment.",

      });

  }


  /* ==========================================================
     LOG REAL SUPABASE ERROR

     This is intentionally backend-only.
     Passwords and secrets are never logged.
  ========================================================== */

  if (authError) {

    console.error(
      "Supabase login error:",
      {
        message:
          authError.message,

        status:
          authError.status,

        code:
          authError.code,

        name:
          authError.name,
      }
    );

  }


  /* ==========================================================
     AUTHENTICATION FAILED
  ========================================================== */

  if (
    authError ||
    !authData?.user
  ) {

    return res
      .status(401)
      .json({

        success:
          false,

        message:
          "Incorrect email or password.",

      });

  }


  /* ==========================================================
     AUTH USER DEBUG
  ========================================================== */

  console.log(
    "Supabase login successful:",
    {
      userId:
        authData.user.id,

      email:
        authData.user.email,
    }
  );


  /* ==========================================================
     LOAD PROFILE
  ========================================================== */

  const profile =
    await getProfileByEmail(
      email
    );


  if (!profile) {

    console.error(
      "Authenticated Supabase user has no Continental Founders profile:",
      {
        userId:
          authData.user.id,

        email,
      }
    );


    return res
      .status(403)
      .json({

        success:
          false,

        message:
          "Your Continental Founders profile could not be found.",

      });

  }


  /* ==========================================================
     VERIFY AUTH USER MATCHES PROFILE
  ========================================================== */

  if (
    profile.id !==
    authData.user.id
  ) {

    console.error(
      "Auth/Profile ID mismatch:",
      {
        authUserId:
          authData.user.id,

        profileId:
          profile.id,

        email,
      }
    );


    return res
      .status(403)
      .json({

        success:
          false,

        message:
          "Your account information could not be verified.",

      });

  }


  /* ==========================================================
     DISABLED ACCOUNT
  ========================================================== */

  if (
    profile.status ===
    "disabled"
  ) {

    return res
      .status(403)
      .json({

        success:
          false,

        message:
          "This account has been disabled.",

      });

  }


  /* ==========================================================
     PENDING EMAIL VERIFICATION

     Send registration OTP again.
  ========================================================== */

  if (
    profile.status ===
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

    } catch (
      otpError
    ) {

      console.error(
        "Pending verification OTP error:",
        otpError
      );


      return res
        .status(500)
        .json({

          success:
            false,

          otpRequired:
            true,

          email:
            profile.email,

          purpose:
            "registration",

          message:
            "Your password was accepted, but the verification email could not be sent.",

        });

    }


    return res.json({

      success:
        true,

      otpRequired:
        true,

      email:
        profile.email,

      purpose:
        "registration",

      message:
        "Please verify your email address. A new verification code has been sent.",

    });

  }


  /* ==========================================================
     OTHER NON-ACTIVE STATUS
  ========================================================== */

  if (
    profile.status !==
    "active"
  ) {

    return res
      .status(403)
      .json({

        success:
          false,

        message:
          "Your account is not currently active.",

      });

  }


  /* ==========================================================
     SEND LOGIN OTP

     IMPORTANT:
     Final CMS access is NOT granted yet.
  ========================================================== */

  try {

    await createAndSendOtp({

      userId:
        profile.id,

      email:
        profile.email,

      purpose:
        "login",

    });

  } catch (
    otpError
  ) {

    console.error(
      "Login OTP error:",
      otpError
    );


    return res
      .status(500)
      .json({

        success:
          false,

        otpRequired:
          true,

        email:
          profile.email,

        purpose:
          "login",

        message:
          "Your password was accepted, but the login verification email could not be sent.",

      });

  }


  /* ==========================================================
     SUCCESS
  ========================================================== */

  return res.json({

    success:
      true,

    otpRequired:
      true,

    email:
      profile.email,

    purpose:
      "login",

    message:
      "Password accepted. A verification code has been sent to your personal email.",

  });

}


/* ============================================================
   VERIFY OTP
============================================================ */

async function verifyOtpCode(
  req,
  res
) {

  const input =
    otpSchema.parse(
      req.body
    );


  const email =
    input.email
      .trim()
      .toLowerCase();


  /* ==========================================================
     FIND PROFILE
  ========================================================== */

  const profile =
    await getProfileByEmail(
      email
    );


  if (!profile) {

    return res
      .status(404)
      .json({

        success:
          false,

        message:
          "Account not found.",

      });

  }


  if (
    profile.status ===
    "disabled"
  ) {

    return res
      .status(403)
      .json({

        success:
          false,

        message:
          "This account has been disabled.",

      });

  }


  /* ==========================================================
     DETERMINE OTP PURPOSE
  ========================================================== */

  const purpose =
    input.purpose ||
    (
      profile.status ===
      "pending_verification"
        ? "registration"
        : "login"
    );


  /* ==========================================================
     VERIFY OTP
  ========================================================== */

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

    return res
      .status(400)
      .json({

        success:
          false,

        message:
          result.message ||
          "Invalid verification code.",

      });

  }


  /* ==========================================================
     REGISTRATION OTP

     Activate founder account.
  ========================================================== */

  let currentProfile =
    profile;


  if (
    purpose ===
    "registration"
  ) {

    const now =
      new Date()
        .toISOString();


    const {
      data:
        updatedProfile,

      error:
        updateError,
    } =
      await supabaseAdmin
        .from(
          "profiles"
        )
        .update({

          status:
            "active",

          email_verified_at:
            now,

          updated_at:
            now,

        })
        .eq(
          "id",
          profile.id
        )
        .select(
          "*"
        )
        .single();


    if (updateError) {

      console.error(
        "Profile activation error:",
        updateError
      );


      return res
        .status(500)
        .json({

          success:
            false,

          message:
            "Your code was verified, but the account could not be activated.",

        });

    }


    currentProfile =
      updatedProfile;

  }


  /* ==========================================================
     CHECK ACTIVE STATUS
  ========================================================== */

  if (
    currentProfile.status !==
    "active"
  ) {

    return res
      .status(403)
      .json({

        success:
          false,

        message:
          "This account is not active.",

      });

  }


  /* ==========================================================
     CREATE FINAL CMS SESSION
  ========================================================== */

  const token =
    createToken(
      currentProfile
    );


  /* ==========================================================
     HTTP-ONLY SESSION COOKIE
  ========================================================== */

  res.cookie(
    "cf_admin_session",
    token,
    {

      httpOnly:
        true,

      secure:
        process.env.NODE_ENV ===
        "production",

      sameSite:
        process.env.NODE_ENV ===
        "production"
          ? "none"
          : "lax",

      maxAge:
        24 *
        60 *
        60 *
        1000,

      path:
        "/",

    }
  );


  /* ==========================================================
     RETURN SAFE USER
  ========================================================== */

  return res.json({

    success:
      true,

    user:
      toSafeUser(
        currentProfile
      ),

    message:
      purpose ===
      "registration"
        ? "Your email has been verified and your account is active."
        : "Sign in successful.",

  });

}


/* ============================================================
   RESEND OTP
============================================================ */

async function resendOtp(
  req,
  res
) {

  const input =
    resendOtpSchema.parse(
      req.body
    );


  const email =
    input.email
      .trim()
      .toLowerCase();


  const profile =
    await getProfileByEmail(
      email
    );


  /* ==========================================================
     GENERIC RESPONSE FOR UNKNOWN EMAIL
  ========================================================== */

  if (!profile) {

    return res.json({

      success:
        true,

      message:
        "If this account exists, a verification code has been sent.",

    });

  }


  /* ==========================================================
     DISABLED
  ========================================================== */

  if (
    profile.status ===
    "disabled"
  ) {

    return res
      .status(403)
      .json({

        success:
          false,

        message:
          "This account has been disabled.",

      });

  }


  /* ==========================================================
     PURPOSE
  ========================================================== */

  const purpose =
    input.purpose ||
    (
      profile.status ===
      "pending_verification"
        ? "registration"
        : "login"
    );


  /* ==========================================================
     PREVENT REGISTRATION OTP FOR ACTIVE ACCOUNT
  ========================================================== */

  if (
    purpose ===
      "registration" &&
    profile.status ===
      "active"
  ) {

    return res
      .status(400)
      .json({

        success:
          false,

        message:
          "This email address has already been verified.",

      });

  }


  /* ==========================================================
     SEND OTP
  ========================================================== */

  await createAndSendOtp({

    userId:
      profile.id,

    email:
      profile.email,

    purpose,

  });


  return res.json({

    success:
      true,

    email:
      profile.email,

    purpose,

    message:
      "A new verification code has been sent to your personal email.",

  });

}


/* ============================================================
   CURRENT AUTHENTICATED USER
============================================================ */

async function me(
  req,
  res
) {

  return res.json({

    success:
      true,

    user:
      toSafeUser(
        req.admin
      ),

  });

}


/* ============================================================
   LOGOUT
============================================================ */

async function logout(
  req,
  res
) {

  res.clearCookie(
    "cf_admin_session",
    {

      httpOnly:
        true,

      secure:
        process.env.NODE_ENV ===
        "production",

      sameSite:
        process.env.NODE_ENV ===
        "production"
          ? "none"
          : "lax",

      path:
        "/",

    }
  );


  return res.json({

    success:
      true,

    message:
      "Signed out successfully.",

  });

}


/* ============================================================
   EXPORTS
============================================================ */

module.exports = {
  register,
  login,
  verifyOtpCode,
  resendOtp,
  me,
  logout,
};