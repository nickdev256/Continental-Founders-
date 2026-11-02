import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  KeyRound,
  Mail,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

import "./AdminAuth.css";


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


  const [
    approvalRequired,
    setApprovalRequired,
  ] =
    useState(false);


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
    if (approvalRequired) {
      return undefined;
    }


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

  }, [
    approvalRequired,
  ]);


  // ==========================================================
  // COUNTDOWN
  // ==========================================================

  useEffect(() => {
    if (
      countdown <= 0 ||
      approvalRequired
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
    approvalRequired,
  ]);


  // ==========================================================
  // CLEAR TEMPORARY AUTH DATA
  // ==========================================================

  function clearPendingAuthData() {
    sessionStorage.removeItem(
      "cf_pending_admin_email"
    );

    sessionStorage.removeItem(
      "cf_otp_purpose"
    );

    localStorage.removeItem(
      "cf_admin_token"
    );
  }


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
      event.key === "Backspace" &&
      !otp[index] &&
      index > 0
    ) {
      inputRefs.current[
        index - 1
      ]?.focus();
    }


    if (
      event.key === "ArrowLeft" &&
      index > 0
    ) {
      inputRefs.current[
        index - 1
      ]?.focus();
    }


    if (
      event.key === "ArrowRight" &&
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


      if (!response.ok) {
        throw new Error(
          result.message ||
          result.error ||
          "The verification code is incorrect or has expired."
        );
      }


      // ======================================================
      // REGISTRATION VERIFIED — WAITING FOR APPROVAL
      //
      // No CMS session is created at this stage.
      // ======================================================

      if (
        result.approvalRequired ===
        true
      ) {
        clearPendingAuthData();

        localStorage.removeItem(
          "cf_admin_user"
        );

        setOtp([
          "",
          "",
          "",
          "",
          "",
          "",
        ]);

        setApprovalRequired(
          true
        );

        setMessage(
          result.message ||
          "Your email has been verified. Your CMS account is awaiting approval."
        );

        return;
      }


      // ======================================================
      // LOGIN OTP SUCCESS
      //
      // A login OTP should return the authenticated user.
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
        )
          .trim()
          .toLowerCase();


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
      // VERIFY ACTIVE STATUS
      // ======================================================

      const status =
        String(
          user.status || ""
        )
          .trim()
          .toLowerCase();


      if (
        status !== "active"
      ) {
        throw new Error(
          "This CMS account is not currently active."
        );
      }


      // ======================================================
      // SAVE SAFE DISPLAY INFORMATION
      //
      // This is NOT authentication.
      // Authentication remains in the HttpOnly cookie.
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
          user.status,
      };


      localStorage.setItem(
        "cf_admin_user",
        JSON.stringify(
          adminUser
        )
      );


      // ======================================================
      // NEVER STORE AUTH TOKEN IN LOCAL STORAGE
      // ======================================================

      localStorage.removeItem(
        "cf_admin_token"
      );


      // ======================================================
      // REMOVE TEMPORARY OTP DATA
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
          "Unable to connect to the Continental Founders server. Please try again."
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
      resending ||
      approvalRequired
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


      if (!response.ok) {
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
    clearPendingAuthData();

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
    <main className="al-page">

      {/* ======================================================
          BRAND PANEL
      ====================================================== */}

      <section className="al-visual" aria-label="Secure access">

        <img className="al-visual__photo" src="/assets/a.webp" alt="" />

        <Link
          to="/"
          className="al-visual__brand"
          aria-label="Continental Founders home"
        >
          <img
            src="/assets/continental-founders-logo.webp"
            alt="Continental Founders"
          />
        </Link>

        <div className="al-visual__copy">
          <span className="al-eyebrow al-visual__eyebrow">
            <KeyRound size={16} aria-hidden="true" />
            Secure Access
          </span>

          <h1>
            {approvalRequired
              ? "Identity verified."
              : "One more step."}
          </h1>

          <p>
            {approvalRequired
              ? "Your email has been confirmed. CMS access becomes available after your account has been approved."
              : "Continental Founders CMS access is protected with additional identity verification for authorized users."}
          </p>
        </div>

        <div className="al-visual__footer">
          <strong>Continental Founders™</strong>
          <span>Secure CMS Access</span>
        </div>

      </section>


      {/* ======================================================
          VERIFY PANEL
      ====================================================== */}

      <section className="al-panel">

        <div className="al-panel__top">
          <span className="al-eyebrow">CMS Security</span>

          <button
            type="button"
            className="al-panel__back al-panel__back--button"
            onClick={handleBackToLogin}
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Back to sign in
          </button>
        </div>

        <div className="al-card">

          <ol className="al-steps" aria-label="Sign-in steps">
            <li className="is-done">
              <span>1</span>
              {otpPurpose === "registration" ? "Create account" : "Sign in"}
            </li>
            <li
              className={approvalRequired ? "is-done" : "is-current"}
              aria-current={approvalRequired ? undefined : "step"}
            >
              <span>2</span>
              Verify code
            </li>
          </ol>

          {approvalRequired ? (
            <>
              <div className="al-card__heading">
                <span className="al-card__icon">
                  <CheckCircle2 size={28} strokeWidth={1.6} aria-hidden="true" />
                </span>

                <span className="al-eyebrow">Email Verified</span>

                <h2>Verification complete.</h2>

                <p>
                  Your email address has been successfully verified. Your
                  Continental Founders CMS account is now awaiting approval
                  before access can be granted.
                </p>
              </div>

              {message && (
                <div className="al-success" role="status">
                  <CheckCircle2 size={18} aria-hidden="true" />
                  <span>{message}</span>
                </div>
              )}

              <button
                type="button"
                className="al-submit al-submit--full"
                onClick={
                  handleBackToLogin
                }
              >
                <span>Return to sign in</span>
                <ArrowRight size={18} aria-hidden="true" />
              </button>
            </>
          ) : (
            <>
              <div className="al-card__heading">
                <span className="al-card__icon">
                  <ShieldCheck size={28} strokeWidth={1.6} aria-hidden="true" />
                </span>

                <span className="al-eyebrow">Two-Step Verification</span>

                <h2>Verify your identity.</h2>

                <p>
                  {otpPurpose ===
                  "registration"
                    ? "We sent a six-digit verification code to the email address you used to create your Continental Founders account."
                    : "We sent a six-digit security code to your registered Continental Founders account email."}
                </p>

                <span className="al-email-chip">
                  <Mail size={16} aria-hidden="true" />
                  {maskEmail(
                    loginEmail
                  )}
                </span>
              </div>

              <form
                className="al-form"
                onSubmit={
                  handleVerify
                }
              >

                <fieldset className="al-field al-field--code">
                  <legend>Verification code</legend>

                  <div
                    className="al-code"
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
                          className={digit ? "is-filled" : ""}
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
                          aria-invalid={Boolean(error)}
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
                </fieldset>

                {error && (
                  <div className="al-alert" role="alert">
                    <AlertCircle size={18} aria-hidden="true" />
                    <span>{error}</span>
                  </div>
                )}

                {message && (
                  <div className="al-success" role="status">
                    <CheckCircle2 size={18} aria-hidden="true" />
                    <span>{message}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="al-submit"
                  disabled={
                    loading
                  }
                >
                  {loading ? (
                    <span className="al-submit__spinner" aria-hidden="true" />
                  ) : null}

                  <span>
                    {loading
                      ? "Verifying..."
                      : "Verify & continue"}
                  </span>

                  {!loading && <ArrowRight size={18} aria-hidden="true" />}
                </button>

              </form>

              <div className="al-resend">
                <span>Didn't receive the code?</span>

                <button
                  type="button"
                  onClick={
                    handleResend
                  }
                  disabled={
                    countdown > 0 ||
                    resending
                  }
                  aria-live="polite"
                >
                  <RefreshCw size={14} aria-hidden="true" />

                  {resending
                    ? "Sending..."
                    : countdown > 0
                      ? `Resend in ${countdown}s`
                      : "Resend code"}
                </button>
              </div>
            </>
          )}

        </div>

      </section>

    </main>
  );
}
