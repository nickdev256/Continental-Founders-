const jwt =
  require("jsonwebtoken");

const {
  supabaseAdmin,
} =
  require("../config/supabase");


/* ============================================================
   REQUIRE CMS AUTHENTICATION
============================================================ */

async function requireAdmin(
  req,
  res,
  next
) {

  try {

    /* ========================================================
       GET TOKEN

       Preferred:
       HttpOnly cookie created after OTP verification.

       Fallback:
       Bearer token, useful during transition/testing.
    ======================================================== */

    const cookieToken =
      req.cookies?.cf_admin_session ||
      null;


    const authHeader =
      req.headers.authorization ||
      "";


    const bearerToken =
      authHeader.startsWith(
        "Bearer "
      )
        ? authHeader.slice(7)
        : null;


    const token =
      cookieToken ||
      bearerToken;


    if (!token) {

      return res
        .status(401)
        .json({

          success:
            false,

          message:
            "Authentication required.",

        });

    }


    /* ========================================================
       VERIFY JWT
    ======================================================== */

    if (
      !process.env.JWT_SECRET
    ) {

      console.error(
        "JWT_SECRET is missing from environment variables."
      );


      return res
        .status(500)
        .json({

          success:
            false,

          message:
            "Authentication service is not configured.",

        });

    }


    const decoded =
      jwt.verify(
        token,
        process.env.JWT_SECRET
      );


    if (
      !decoded?.sub
    ) {

      return res
        .status(401)
        .json({

          success:
            false,

          message:
            "Invalid session.",

        });

    }


    /* ========================================================
       LOAD CURRENT PROFILE FROM SUPABASE

       Do not rely only on the role/status stored inside the JWT.
       We check the current database record every request.
    ======================================================== */

    const {
      data:
        profile,

      error:
        profileError,
    } =
      await supabaseAdmin
        .from(
          "profiles"
        )
        .select(
          "id, full_name, email, role, status, email_verified_at, created_at, updated_at"
        )
        .eq(
          "id",
          decoded.sub
        )
        .maybeSingle();


    if (profileError) {

      console.error(
        "Authentication profile lookup error:",
        profileError
      );


      return res
        .status(500)
        .json({

          success:
            false,

          message:
            "Unable to verify your session.",

        });

    }


    if (!profile) {

      return res
        .status(401)
        .json({

          success:
            false,

          message:
            "Invalid session.",

        });

    }


    /* ========================================================
       CHECK ACCOUNT STATUS
    ======================================================== */

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
            profile.status ===
            "disabled"
              ? "This account has been disabled."
              : "This account is not active.",

        });

    }


    /* ========================================================
       CHECK CMS ROLE
    ======================================================== */

    const allowedRoles =
      [
        "founder",
        "admin",
        "super_admin",
      ];


    if (
      !allowedRoles.includes(
        profile.role
      )
    ) {

      return res
        .status(403)
        .json({

          success:
            false,

          message:
            "You do not have permission to access the CMS.",

        });

    }


    /* ========================================================
       ATTACH SAFE PROFILE TO REQUEST
    ======================================================== */

    req.admin =
      profile;


    next();

  } catch (
    error
  ) {

    if (
      error?.name ===
      "TokenExpiredError"
    ) {

      return res
        .status(401)
        .json({

          success:
            false,

          message:
            "Your session has expired. Please sign in again.",

        });

    }


    if (
      error?.name ===
      "JsonWebTokenError"
    ) {

      return res
        .status(401)
        .json({

          success:
            false,

          message:
            "Invalid session.",

        });

    }


    console.error(
      "Authentication middleware error:",
      error
    );


    return res
      .status(401)
      .json({

        success:
          false,

        message:
          "Unable to authenticate this session.",

      });

  }

}


/* ============================================================
   OPTIONAL ROLE CHECKER

   We can use this later for sensitive CMS actions.
============================================================ */

function requireRole(
  ...roles
) {

  return function roleMiddleware(
    req,
    res,
    next
  ) {

    if (
      !req.admin
    ) {

      return res
        .status(401)
        .json({

          success:
            false,

          message:
            "Authentication required.",

        });

    }


    if (
      !roles.includes(
        req.admin.role
      )
    ) {

      return res
        .status(403)
        .json({

          success:
            false,

          message:
            "You do not have permission to perform this action.",

        });

    }


    next();

  };

}


/* ============================================================
   EXPORTS
============================================================ */

module.exports = {
  requireAdmin,
  requireRole,
};