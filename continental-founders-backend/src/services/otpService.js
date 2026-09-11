const crypto =
  require("crypto");

const bcrypt =
  require("bcryptjs");

const {
  supabaseAdmin,
} =
  require("../config/supabase");

const sendEmail =
  require("../utils/sendEmail");


/* ============================================================
   OTP CONFIGURATION
============================================================ */

const OTP_EXPIRY_MINUTES =
  10;

const MAX_OTP_ATTEMPTS =
  5;


/* ============================================================
   GENERATE 6-DIGIT OTP
============================================================ */

function generateOtp() {

  return crypto
    .randomInt(
      100000,
      1000000
    )
    .toString();

}


/* ============================================================
   BUILD OTP EMAIL
============================================================ */

function buildOtpEmail({
  otp,
  purpose,
}) {

  const isRegistration =
    purpose ===
    "registration";


  const subject =
    isRegistration
      ? "Verify your Continental Founders account"
      : "Your Continental Founders login code";


  const heading =
    isRegistration
      ? "Verify your account"
      : "Complete your sign in";


  const description =
    isRegistration
      ? "Use the verification code below to confirm your email address and complete your Continental Founders registration."
      : "Use the verification code below to complete your secure Continental Founders CMS sign in.";


  const text = `
${heading}

${description}

Your verification code is:

${otp}

This code expires in ${OTP_EXPIRY_MINUTES} minutes.

If you did not request this code, you can ignore this email.

Continental Founders
  `.trim();


  const html = `
    <!DOCTYPE html>

    <html>

      <body
        style="
          margin: 0;
          padding: 0;
          background: #f5f1e8;
          font-family: Arial, Helvetica, sans-serif;
          color: #13263a;
        "
      >

        <div
          style="
            width: 100%;
            padding: 40px 16px;
            box-sizing: border-box;
          "
        >

          <div
            style="
              max-width: 600px;
              margin: 0 auto;
              background: #ffffff;
              border-radius: 14px;
              overflow: hidden;
              box-shadow: 0 16px 40px rgba(7, 26, 46, 0.08);
            "
          >

            <!-- =============================================
                 HEADER
            ============================================== -->

            <div
              style="
                background: #071a2e;
                padding: 30px 36px;
              "
            >

              <div
                style="
                  color: #d7bd82;
                  font-size: 12px;
                  font-weight: 700;
                  letter-spacing: 2px;
                "
              >
                CONTINENTAL FOUNDERS
              </div>

              <div
                style="
                  margin-top: 8px;
                  color: rgba(255,255,255,0.7);
                  font-size: 12px;
                "
              >
                Secure Account Verification
              </div>

            </div>


            <!-- =============================================
                 BODY
            ============================================== -->

            <div
              style="
                padding: 42px 36px;
              "
            >

              <h1
                style="
                  margin: 0 0 16px;
                  color: #071a2e;
                  font-family: Georgia, 'Times New Roman', serif;
                  font-size: 30px;
                  font-weight: 500;
                  line-height: 1.2;
                "
              >
                ${heading}
              </h1>


              <p
                style="
                  margin: 0 0 30px;
                  color: #6f7a85;
                  font-size: 14px;
                  line-height: 1.7;
                "
              >
                ${description}
              </p>


              <!-- ===========================================
                   OTP BOX
              ============================================ -->

              <div
                style="
                  margin-bottom: 28px;
                  padding: 28px 20px;
                  background: #f5f1e8;
                  border: 1px solid #e8dfcd;
                  border-radius: 10px;
                  text-align: center;
                "
              >

                <div
                  style="
                    margin-bottom: 12px;
                    color: #8d8066;
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 1.7px;
                  "
                >
                  VERIFICATION CODE
                </div>


                <div
                  style="
                    color: #071a2e;
                    font-size: 38px;
                    font-weight: 700;
                    letter-spacing: 10px;
                  "
                >
                  ${otp}
                </div>

              </div>


              <!-- ===========================================
                   EXPIRY
              ============================================ -->

              <p
                style="
                  margin: 0 0 15px;
                  color: #6f7a85;
                  font-size: 14px;
                  line-height: 1.6;
                "
              >
                This code expires in
                <strong>
                  ${OTP_EXPIRY_MINUTES} minutes
                </strong>.
              </p>


              <!-- ===========================================
                   SECURITY
              ============================================ -->

              <p
                style="
                  margin: 0;
                  color: #9099a2;
                  font-size: 12px;
                  line-height: 1.6;
                "
              >
                Never share this verification code with anyone.
                Continental Founders will never ask you to send
                this code by email or message.
              </p>

            </div>


            <!-- =============================================
                 FOOTER
            ============================================== -->

            <div
              style="
                padding: 20px 36px;
                border-top: 1px solid #eceff1;
                color: #8c959e;
                font-size: 11px;
              "
            >

              Continental Founders™

            </div>

          </div>

        </div>

      </body>

    </html>
  `;


  return {
    subject,
    text,
    html,
  };

}


/* ============================================================
   INVALIDATE PREVIOUS OTP CODES
============================================================ */

async function invalidatePreviousOtps({
  userId,
  purpose,
}) {

  const {
    error,
  } =
    await supabaseAdmin
      .from(
        "admin_otp_codes"
      )
      .update({
        used: true,
      })
      .eq(
        "user_id",
        userId
      )
      .eq(
        "purpose",
        purpose
      )
      .eq(
        "used",
        false
      );


  if (error) {

    console.error(
      "Unable to invalidate previous OTP codes:",
      error
    );

    throw new Error(
      "Unable to prepare verification code."
    );

  }

}


/* ============================================================
   CREATE AND SEND OTP
============================================================ */

async function createAndSendOtp({
  userId,
  email,
  purpose,
}) {

  if (!userId) {

    throw new Error(
      "User ID is required to create an OTP."
    );

  }


  if (!email) {

    throw new Error(
      "Email address is required to create an OTP."
    );

  }


  if (
    purpose !== "registration" &&
    purpose !== "login"
  ) {

    throw new Error(
      "Invalid OTP purpose."
    );

  }


  const cleanEmail =
    email
      .trim()
      .toLowerCase();


  /* ==========================================================
     GENERATE CODE
  ========================================================== */

  const otp =
    generateOtp();


  /* ==========================================================
     HASH CODE

     The plain OTP is never stored in Supabase.
  ========================================================== */

  const codeHash =
    await bcrypt.hash(
      otp,
      10
    );


  /* ==========================================================
     EXPIRATION
  ========================================================== */

  const expiresAt =
    new Date(
      Date.now() +
      OTP_EXPIRY_MINUTES *
        60 *
        1000
    ).toISOString();


  /* ==========================================================
     INVALIDATE OLD OTP
  ========================================================== */

  await invalidatePreviousOtps({
    userId,
    purpose,
  });


  /* ==========================================================
     SAVE NEW OTP
  ========================================================== */

  const {
    data:
      otpRecord,

    error:
      insertError,
  } =
    await supabaseAdmin
      .from(
        "admin_otp_codes"
      )
      .insert({

        user_id:
          userId,

        email:
          cleanEmail,

        purpose,

        code_hash:
          codeHash,

        expires_at:
          expiresAt,

        attempts:
          0,

        used:
          false,

      })
      .select(
        "id, expires_at"
      )
      .single();


  if (insertError) {

    console.error(
      "OTP database insert error:",
      insertError
    );

    throw new Error(
      "Unable to create verification code."
    );

  }


  /* ==========================================================
     BUILD EMAIL
  ========================================================== */

  const emailContent =
    buildOtpEmail({
      otp,
      purpose,
    });


  /* ==========================================================
     SEND OTP TO FOUNDER'S PERSONAL EMAIL
  ========================================================== */

  try {

    const result =
      await sendEmail({

        to:
          cleanEmail,

        subject:
          emailContent.subject,

        text:
          emailContent.text,

        html:
          emailContent.html,

      });


    if (
      !result ||
      result.skipped
    ) {

      throw new Error(
        "Email transport is not configured."
      );

    }

  } catch (
    emailError
  ) {

    console.error(
      "OTP email error:",
      emailError
    );


    /*
      Invalidate the OTP if the email could
      not be delivered.
    */

    await supabaseAdmin
      .from(
        "admin_otp_codes"
      )
      .update({
        used: true,
      })
      .eq(
        "id",
        otpRecord.id
      );


    throw new Error(
      "Unable to send verification email."
    );

  }


  return {

    success:
      true,

    expiresAt:
      otpRecord.expires_at,

    expiresInMinutes:
      OTP_EXPIRY_MINUTES,

  };

}


/* ============================================================
   VERIFY OTP
============================================================ */

async function verifyOtp({
  userId,
  email,
  otp,
  purpose,
}) {

  if (
    !userId ||
    !email ||
    !otp ||
    !purpose
  ) {

    return {
      valid: false,

      message:
        "Verification information is incomplete.",
    };

  }


  const cleanEmail =
    email
      .trim()
      .toLowerCase();


  /* ==========================================================
     GET MOST RECENT ACTIVE OTP
  ========================================================== */

  const {
    data:
      otpRecord,

    error:
      lookupError,
  } =
    await supabaseAdmin
      .from(
        "admin_otp_codes"
      )
      .select(
        "*"
      )
      .eq(
        "user_id",
        userId
      )
      .eq(
        "email",
        cleanEmail
      )
      .eq(
        "purpose",
        purpose
      )
      .eq(
        "used",
        false
      )
      .order(
        "created_at",
        {
          ascending: false,
        }
      )
      .limit(1)
      .maybeSingle();


  if (lookupError) {

    console.error(
      "OTP lookup error:",
      lookupError
    );

    throw new Error(
      "Unable to verify the code."
    );

  }


  if (!otpRecord) {

    return {

      valid:
        false,

      message:
        "No active verification code was found. Request a new code.",

    };

  }


  /* ==========================================================
     CHECK EXPIRATION
  ========================================================== */

  const isExpired =
    new Date(
      otpRecord.expires_at
    ).getTime() <=
    Date.now();


  if (isExpired) {

    await supabaseAdmin
      .from(
        "admin_otp_codes"
      )
      .update({
        used: true,
      })
      .eq(
        "id",
        otpRecord.id
      );


    return {

      valid:
        false,

      message:
        "This verification code has expired. Request a new code.",

    };

  }


  /* ==========================================================
     CHECK ATTEMPTS
  ========================================================== */

  if (
    otpRecord.attempts >=
    MAX_OTP_ATTEMPTS
  ) {

    await supabaseAdmin
      .from(
        "admin_otp_codes"
      )
      .update({
        used: true,
      })
      .eq(
        "id",
        otpRecord.id
      );


    return {

      valid:
        false,

      message:
        "Too many incorrect attempts. Request a new verification code.",

    };

  }


  /* ==========================================================
     COMPARE CODE
  ========================================================== */

  const matches =
    await bcrypt.compare(
      String(otp),
      otpRecord.code_hash
    );


  if (!matches) {

    const newAttempts =
      otpRecord.attempts + 1;


    await supabaseAdmin
      .from(
        "admin_otp_codes"
      )
      .update({

        attempts:
          newAttempts,

        used:
          newAttempts >=
          MAX_OTP_ATTEMPTS,

      })
      .eq(
        "id",
        otpRecord.id
      );


    const remainingAttempts =
      Math.max(
        0,
        MAX_OTP_ATTEMPTS -
          newAttempts
      );


    return {

      valid:
        false,

      message:
        remainingAttempts > 0
          ? `Incorrect verification code. ${remainingAttempts} attempt${remainingAttempts === 1 ? "" : "s"} remaining.`
          : "Too many incorrect attempts. Request a new verification code.",

    };

  }


  /* ==========================================================
     OTP SUCCESS

     Mark it used so it cannot be replayed.
  ========================================================== */

  const {
    error:
      updateError,
  } =
    await supabaseAdmin
      .from(
        "admin_otp_codes"
      )
      .update({

        used:
          true,

      })
      .eq(
        "id",
        otpRecord.id
      );


  if (updateError) {

    console.error(
      "OTP completion error:",
      updateError
    );

    throw new Error(
      "Unable to complete verification."
    );

  }


  return {

    valid:
      true,

    message:
      "Verification successful.",

  };

}


/* ============================================================
   EXPORTS
============================================================ */

module.exports = {
  createAndSendOtp,
  verifyOtp,
};