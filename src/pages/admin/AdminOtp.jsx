import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  KeyRound,
  Mail,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

import "./AdminOtp.css";


// ============================================================
// ADMIN OTP VERIFICATION
// ============================================================

export default function AdminOtp() {

  const navigate =
    useNavigate();

  const location =
    useLocation();

  const inputRefs =
    useRef([]);


  const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000";


  // ==========================================================
  // GET AUTH INFORMATION
  // ==========================================================

  const loginEmail =
    location.state?.email ||
    sessionStorage.getItem(
      "cf_pending_admin_email"
    ) ||
    "";


  const otpPurpose =
    location.state?.purpose ||
    sessionStorage.getItem(
      "cf_otp_purpose"
    ) ||
    "login";


  // ==========================================================
  // STATE
  // ==========================================================

  const [
    otp,
    setOtp,
  ] =
    useState([
      "",
      "",
      "",
      "",
      "",
      "",
    ]);


  const [
    loading,
    setLoading,
  ] =
    useState(false);


  const [
    resending,
    setResending,
  ] =
    useState(false);


  const [
    error,
    setError,
  ] =
    useState("");


  const [
    message,
    setMessage,
  ] =
    useState("");


  const [
    countdown,
    setCountdown,
  ] =
    useState(60);


  // ==========================================================
  // PROTECT OTP PAGE
  // ==========================================================

  useEffect(() => {

    if (!loginEmail) {

      navigate(
        "/admin/login",
        {
          replace: true,
        }
      );

      return;
    }


    sessionStorage.setItem(
      "cf_pending_admin_email",
      loginEmail
    );


    sessionStorage.setItem(
      "cf_otp_purpose",
      otpPurpose
    );

  }, [
    loginEmail,
    otpPurpose,
    navigate,
  ]);


  // ==========================================================
  // AUTO FOCUS FIRST INPUT
  // ==========================================================

  useEffect(() => {

    const timer =
      window.setTimeout(
        () => {

          inputRefs.current[
            0
          ]?.focus();

        },
        100
      );


    return () =>
      window.clearTimeout(
        timer
      );

  }, []);


  // ==========================================================
  // COUNTDOWN
  // ==========================================================

  useEffect(() => {

    if (
      countdown <= 0
    ) {

      return undefined;

    }


    const timer =
      window.setInterval(
        () => {

          setCountdown(
            (current) =>
              Math.max(
                0,
                current - 1
              )
          );

        },
        1000
      );


    return () => {

      window.clearInterval(
        timer
      );

    };

  }, [
    countdown,
  ]);


  // ==========================================================
  // OTP INPUT CHANGE
  // ==========================================================

  function handleOtpChange(
    index,
    value
  ) {

    const cleanValue =
      value.replace(
        /\D/g,
        ""
      );


    if (!cleanValue) {

      const updatedOtp = [
        ...otp,
      ];

      updatedOtp[index] =
        "";

      setOtp(
        updatedOtp
      );

      return;
    }


    const digit =
      cleanValue.slice(-1);


    const updatedOtp = [
      ...otp,
    ];

    updatedOtp[index] =
      digit;

    setOtp(
      updatedOtp
    );


    setError("");
    setMessage("");


    if (
      index < 5
    ) {

      inputRefs.current[
        index + 1
      ]?.focus();

    }

  }


  // ==========================================================
  // KEYBOARD NAVIGATION
  // ==========================================================

  function handleKeyDown(
    index,
    event
  ) {

    if (
      event.key ===
        "Backspace" &&
      !otp[index] &&
      index > 0
    ) {

      inputRefs.current[
        index - 1
      ]?.focus();

    }


    if (
      event.key ===
        "ArrowLeft" &&
      index > 0
    ) {

      inputRefs.current[
        index - 1
      ]?.focus();

    }


    if (
      event.key ===
        "ArrowRight" &&
      index < 5
    ) {

      inputRefs.current[
        index + 1
      ]?.focus();

    }

  }


  // ==========================================================
  // PASTE OTP
  // ==========================================================

  function handlePaste(
    event
  ) {

    event.preventDefault();


    const pastedValue =
      event.clipboardData
        .getData("text")
        .replace(
          /\D/g,
          ""
        )
        .slice(
          0,
          6
        );


    if (!pastedValue) {

      return;

    }


    const updatedOtp = [
      "",
      "",
      "",
      "",
      "",
      "",
    ];


    pastedValue
      .split("")
      .forEach(
        (
          digit,
          index
        ) => {

          updatedOtp[index] =
            digit;

        }
      );


    setOtp(
      updatedOtp
    );


    const focusIndex =
      Math.min(
        pastedValue.length,
        6
      ) - 1;


    inputRefs.current[
      focusIndex
    ]?.focus();


    setError("");
    setMessage("");

  }


  // ==========================================================
  // VERIFY OTP
  // ==========================================================

  async function handleVerify(
    event
  ) {

    event.preventDefault();


    const code =
      otp.join("");


    if (
      code.length !== 6
    ) {

      setError(
        "Please enter the complete 6-digit verification code."
      );

      return;

    }


    try {

      setLoading(true);
      setError("");
      setMessage("");


      const response =
        await fetch(
          `${API_URL}/api/auth/verify-otp`,
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            credentials:
              "include",

            body:
              JSON.stringify({
                email:
                  loginEmail
                    .trim()
                    .toLowerCase(),

                otp:
                  code,

                purpose:
                  otpPurpose,
              }),
          }
        );


      let result = {};


      try {

        result =
          await response.json();

      } catch {

        result = {};

      }


      if (
        !response.ok
      ) {

        throw new Error(
          result.message ||
          result.error ||
          "The verification code is incorrect or has expired."
        );

      }


      // ======================================================
      // GET VERIFIED USER
      // ======================================================

      const user =
        result.user ||
        result.data?.user;


      if (!user) {

        throw new Error(
          "Verification succeeded, but no user information was returned."
        );

      }


      // ======================================================
      // VERIFY CMS ROLE
      // ======================================================

      const role =
        String(
          user.role || ""
        ).toLowerCase();


      const allowedRoles = [
        "founder",
        "admin",
        "super_admin",
      ];


      if (
        !allowedRoles.includes(
          role
        )
      ) {

        throw new Error(
          "This account does not have access to the Continental Founders CMS."
        );

      }


      // ======================================================
      // SAVE SAFE USER INFORMATION
      //
      // This is only for frontend display.
      // Authentication is handled by the HttpOnly cookie.
      // ======================================================

      const adminUser = {

        id:
          user.id ||
          null,

        email:
          user.email ||
          loginEmail,

        name:
          user.name ||
          user.fullName ||
          user.full_name ||
          "CMS User",

        role:
          user.role,

        status:
          user.status ||
          "active",

      };


      localStorage.setItem(
        "cf_admin_user",
        JSON.stringify(
          adminUser
        )
      );


      // ======================================================
      // REMOVE ANY OLD TOKEN STORAGE
      // ======================================================

      localStorage.removeItem(
        "cf_admin_token"
      );


      // ======================================================
      // REMOVE TEMPORARY AUTH DATA
      // ======================================================

      sessionStorage.removeItem(
        "cf_pending_admin_email"
      );


      sessionStorage.removeItem(
        "cf_otp_purpose"
      );


      // ======================================================
      // ENTER CMS
      // ======================================================

      navigate(
        "/admin",
        {
          replace: true,
        }
      );

    } catch (
      verificationError
    ) {

      console.error(
        "OTP verification error:",
        verificationError
      );


      if (
        verificationError instanceof
          TypeError &&
        verificationError.message.includes(
          "fetch"
        )
      ) {

        setError(
          "Unable to connect to the Continental Founders server. Make sure the backend is running."
        );

      } else {

        setError(
          verificationError.message ||
          "Unable to verify the code."
        );

      }

    } finally {

      setLoading(false);

    }

  }


  // ==========================================================
  // RESEND OTP
  // ==========================================================

  async function handleResend() {

    if (
      countdown > 0 ||
      resending
    ) {

      return;

    }


    try {

      setResending(true);
      setError("");
      setMessage("");


      const response =
        await fetch(
          `${API_URL}/api/auth/resend-otp`,
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            credentials:
              "include",

            body:
              JSON.stringify({
                email:
                  loginEmail
                    .trim()
                    .toLowerCase(),

                purpose:
                  otpPurpose,
              }),
          }
        );


      let result = {};


      try {

        result =
          await response.json();

      } catch {

        result = {};

      }


      if (
        !response.ok
      ) {

        throw new Error(
          result.message ||
          result.error ||
          "Unable to send another verification code."
        );

      }


      setOtp([
        "",
        "",
        "",
        "",
        "",
        "",
      ]);


      setCountdown(
        60
      );


      setMessage(
        result.message ||
        "A new verification code has been sent."
      );


      window.setTimeout(
        () => {

          inputRefs.current[
            0
          ]?.focus();

        },
        100
      );

    } catch (
      resendError
    ) {

      console.error(
        "OTP resend error:",
        resendError
      );


      setError(
        resendError.message ||
        "Unable to resend the verification code."
      );

    } finally {

      setResending(false);

    }

  }


  // ==========================================================
  // BACK TO LOGIN
  // ==========================================================

  function handleBackToLogin() {

    sessionStorage.removeItem(
      "cf_pending_admin_email"
    );


    sessionStorage.removeItem(
      "cf_otp_purpose"
    );


    localStorage.removeItem(
      "cf_admin_token"
    );


    navigate(
      "/admin/login",
      {
        replace: true,
      }
    );

  }


  // ==========================================================
  // MASK EMAIL
  // ==========================================================

  function maskEmail(
    emailAddress
  ) {

    if (
      !emailAddress ||
      !emailAddress.includes(
        "@"
      )
    ) {

      return emailAddress;

    }


    const [
      name,
      domain,
    ] =
      emailAddress.split(
        "@"
      );


    const visible =
      name.slice(
        0,
        Math.min(
          2,
          name.length
        )
      );


    return `${visible}${"*".repeat(
      Math.max(
        3,
        name.length -
          visible.length
      )
    )}@${domain}`;

  }


  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <main className="admin-otp">

      <section className="admin-otp__panel">

        <div className="admin-otp__brand">

          <a
            href="/"
            className="admin-otp__brand-link"
            aria-label="Continental Founders home"
          >

            <img
              src="/assets/continental-founders-logo.png"
              alt="Continental Founders"
            />

          </a>


          <span>
            CMS SECURITY
          </span>

        </div>


        <div className="admin-otp__content">

          <div className="admin-otp__security-icon">

            <ShieldCheck
              size={26}
              strokeWidth={1.6}
            />

          </div>


          <span className="admin-otp__eyebrow">
            TWO-STEP VERIFICATION
          </span>


          <h1>
            Verify your identity.
          </h1>


          <p className="admin-otp__intro">

            {otpPurpose ===
            "registration"
              ? "We sent a six-digit verification code to the email address you used to create your Continental Founders account."
              : "We sent a six-digit security code to your registered Continental Founders account email."}

          </p>


          <div className="admin-otp__email">

            <Mail
              size={17}
              strokeWidth={1.7}
            />

            <span>
              {maskEmail(
                loginEmail
              )}
            </span>

          </div>


          <form
            className="admin-otp__form"
            onSubmit={
              handleVerify
            }
          >

            <label className="admin-otp__label">
              Verification Code
            </label>


            <div
              className="admin-otp__inputs"
              onPaste={
                handlePaste
              }
            >

              {otp.map(
                (
                  digit,
                  index
                ) => (

                  <input
                    key={
                      index
                    }

                    ref={(
                      element
                    ) => {

                      inputRefs.current[
                        index
                      ] =
                        element;

                    }}

                    type="text"

                    inputMode="numeric"

                    autoComplete={
                      index === 0
                        ? "one-time-code"
                        : "off"
                    }

                    maxLength={1}

                    value={
                      digit
                    }

                    disabled={
                      loading
                    }

                    aria-label={`Verification digit ${
                      index + 1
                    }`}

                    onChange={(
                      event
                    ) =>
                      handleOtpChange(
                        index,
                        event.target.value
                      )
                    }

                    onKeyDown={(
                      event
                    ) =>
                      handleKeyDown(
                        index,
                        event
                      )
                    }
                  />

                )
              )}

            </div>


            {error && (

              <div
                className="admin-otp__error"
                role="alert"
              >

                {error}

              </div>

            )}


            {message && (

              <div
                className="admin-otp__success"
                role="status"
              >

                {message}

              </div>

            )}


            <button
              type="submit"
              className="admin-otp__verify"
              disabled={
                loading
              }
            >

              <span>

                {loading
                  ? "Verifying..."
                  : "Verify & Continue"}

              </span>


              <ArrowRight
                size={18}
                strokeWidth={1.8}
              />

            </button>

          </form>


          <div className="admin-otp__resend">

            <p>
              Didn't receive the code?
            </p>


            <button
              type="button"
              onClick={
                handleResend
              }
              disabled={
                countdown > 0 ||
                resending
              }
            >

              <RefreshCw
                size={14}
                strokeWidth={1.8}
              />

              {resending
                ? "Sending..."
                : countdown > 0
                  ? `Resend in ${countdown}s`
                  : "Resend code"}

            </button>

          </div>


          <button
            type="button"
            className="admin-otp__back"
            onClick={
              handleBackToLogin
            }
          >

            <ArrowLeft
              size={15}
              strokeWidth={1.8}
            />

            Back to sign in

          </button>

        </div>


        <div className="admin-otp__footer">

          <span>
            Continental Founders™
          </span>

          <span>
            Secure CMS Access
          </span>

        </div>

      </section>


      <section
        className="admin-otp__visual"
        aria-hidden="true"
      >

        <div className="admin-otp__overlay" />


        <div className="admin-otp__visual-content">

          <KeyRound
            size={31}
            strokeWidth={1.4}
          />


          <span>
            SECURE ACCESS
          </span>


          <h2>
            One more step.
          </h2>


          <p>

            Continental Founders CMS access
            is protected with additional
            identity verification for
            authorized users.

          </p>


          <div className="admin-otp__line" />

        </div>

      </section>

    </main>

  );

}