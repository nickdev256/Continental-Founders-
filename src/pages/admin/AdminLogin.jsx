import React, {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  MailCheck,
  ShieldCheck,
} from "lucide-react";

import "./AdminAuth.css";


/* ============================================================
   CONFIG
============================================================ */

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";


/* ============================================================
   ADMIN LOGIN
============================================================ */

export default function AdminLogin() {

  const navigate =
    useNavigate();


  /* ==========================================================
     STATE
  ========================================================== */

  const [
    email,
    setEmail,
  ] =
    useState("");


  const [
    password,
    setPassword,
  ] =
    useState("");


  const [
    showPassword,
    setShowPassword,
  ] =
    useState(false);


  const [
    loading,
    setLoading,
  ] =
    useState(false);


  const [
    checkingSession,
    setCheckingSession,
  ] =
    useState(true);


  const [
    error,
    setError,
  ] =
    useState("");


  // Warn when Caps Lock is on while typing the password.
  const [
    capsLock,
    setCapsLock,
  ] =
    useState(false);

  function trackCapsLock(event) {
    if (typeof event.getModifierState === "function") {
      setCapsLock(event.getModifierState("CapsLock"));
    }
  }


  /* ==========================================================
     CHECK EXISTING SESSION
  ========================================================== */

  useEffect(() => {

    let active =
      true;


    async function checkExistingSession() {

      try {

        const response =
          await fetch(
            `${API_URL}/api/auth/me`,
            {
              method:
                "GET",

              credentials:
                "include",

              headers: {
                Accept:
                  "application/json",
              },
            }
          );


        if (
          !response.ok
        ) {

          if (
            active
          ) {

            setCheckingSession(
              false
            );

          }

          return;

        }


        let result = {};


        try {

          result =
            await response.json();

        } catch {

          result = {};

        }


        const user =
          result?.user ||
          result?.admin ||
          result?.data?.user ||
          null;


        if (
          !user
        ) {

          if (
            active
          ) {

            setCheckingSession(
              false
            );

          }

          return;

        }


        const role =
          String(
            user.role ||
            ""
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

          if (
            active
          ) {

            setCheckingSession(
              false
            );

          }

          return;

        }


        if (
          user.status &&
          user.status !==
            "active"
        ) {

          if (
            active
          ) {

            setCheckingSession(
              false
            );

          }

          return;

        }


        const safeUser = {

          id:
            user.id ||
            null,

          email:
            user.email ||
            "",

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
            safeUser
          )
        );


        localStorage.removeItem(
          "cf_admin_token"
        );


        if (
          active
        ) {

          navigate(
            "/admin",
            {
              replace:
                true,
            }
          );

        }

      } catch (
        sessionError
      ) {

        console.error(
          "Existing CMS session check failed:",
          sessionError
        );


        if (
          active
        ) {

          setCheckingSession(
            false
          );

        }

      }

    }


    checkExistingSession();


    return () => {

      active =
        false;

    };

  }, [
    navigate,
  ]);


  /* ==========================================================
     LOGIN
  ========================================================== */

  async function handleSubmit(
    event
  ) {

    event.preventDefault();


    const cleanEmail =
      email
        .trim()
        .toLowerCase();


    if (
      !cleanEmail ||
      !password
    ) {

      setError(
        "Please enter your email address and password."
      );

      return;

    }


    if (
      password.length <
      8
    ) {

      setError(
        "Password must contain at least 8 characters."
      );

      return;

    }


    try {

      setLoading(
        true
      );

      setError(
        ""
      );


      const response =
        await fetch(
          `${API_URL}/api/auth/login`,
          {
            method:
              "POST",

            credentials:
              "include",

            headers: {
              "Content-Type":
                "application/json",

              Accept:
                "application/json",
            },

            body:
              JSON.stringify({
                email:
                  cleanEmail,

                password,
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
          result?.message ||
          result?.error ||
          "Incorrect email or password."
        );

      }


      const otpRequired =
        result?.otpRequired ??
        result?.otp_required ??
        result?.data?.otpRequired ??
        result?.data?.otp_required ??
        false;


      if (
        !otpRequired
      ) {

        throw new Error(
          "The server did not request OTP verification."
        );

      }


      const pendingEmail =
        result?.email ||
        result?.user?.email ||
        result?.admin?.email ||
        result?.data?.email ||
        result?.data?.user?.email ||
        result?.data?.admin?.email ||
        cleanEmail;


      const purpose =
        result?.purpose ||
        result?.data?.purpose ||
        "login";


      if (
        purpose !==
          "login" &&
        purpose !==
          "registration"
      ) {

        throw new Error(
          "The server returned an invalid verification type."
        );

      }


      sessionStorage.setItem(
        "cf_pending_admin_email",
        pendingEmail
      );


      sessionStorage.setItem(
        "cf_otp_purpose",
        purpose
      );


      localStorage.removeItem(
        "cf_admin_user"
      );


      localStorage.removeItem(
        "cf_admin_token"
      );


      navigate(
        "/admin/verify-otp",
        {
          replace:
            true,

          state: {
            email:
              pendingEmail,

            purpose,
          },
        }
      );

    } catch (
      requestError
    ) {

      console.error(
        "Admin login error:",
        requestError
      );


      if (
        requestError instanceof
          TypeError
      ) {

        setError(
          "Unable to connect to the Continental Founders server."
        );

      } else {

        setError(
          requestError?.message ||
          "Unable to sign in."
        );

      }

    } finally {

      setLoading(
        false
      );

    }

  }


  /* ==========================================================
     SESSION CHECK SCREEN
  ========================================================== */

  if (
    checkingSession
  ) {

    return (

      <main className="al-loading" aria-busy="true">

        <div className="al-loading__card">

          <span className="al-loading__icon">
            <ShieldCheck size={30} strokeWidth={1.6} aria-hidden="true" />
          </span>

          <span className="al-eyebrow">Secure CMS Access</span>

          <h1>Verifying your session</h1>

          <p>
            Please wait while we confirm your Continental Founders
            administration session.
          </p>

          <span className="al-loading__bar" aria-hidden="true" />

        </div>

      </main>

    );

  }


  /* ==========================================================
     RENDER
  ========================================================== */

  return (

    <main className="al-page">

      {/* ======================================================
          BRAND PANEL
      ====================================================== */}

      <section className="al-visual" aria-label="Continental Founders">

        <img
          className="al-visual__photo"
          src="/assets/images/admin-login-africa.webp"
          alt=""
        />

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

          <h1>
            Talent is everywhere.{" "}
            <em>Access is not.</em>
          </h1>

          <p>
            A global platform connecting founders, universities,
            professionals, markets and opportunity across Africa and
            beyond.
          </p>

        </div>

        <div className="al-visual__footer">
          <strong>CONTINENTAL FOUNDERS™</strong>
          <span>Building a more inclusive tomorrow</span>
        </div>

      </section>


      {/* ======================================================
          SIGN-IN PANEL
      ====================================================== */}

      <section className="al-panel">

        <div className="al-panel__top">
          <span className="al-eyebrow">CMS Administration</span>

          <Link to="/" className="al-panel__back">
            <ArrowLeft size={16} aria-hidden="true" />
            Return to Continental Founders
          </Link>
        </div>

        <div className="al-card">

          {/* Two steps: password here, then the emailed code */}
          <ol className="al-steps" aria-label="Sign-in steps">
            <li className="is-current" aria-current="step">
              <span>1</span>
              Sign in
            </li>
            <li>
              <span>2</span>
              Verify code
            </li>
          </ol>

          <div className="al-card__heading">
            <span className="al-card__icon">
              <ShieldCheck size={28} strokeWidth={1.6} aria-hidden="true" />
            </span>

            <h2>Welcome back.</h2>

            <p>
              Sign in to access the Continental Founders Content
              Management System.
            </p>
          </div>

          <form
            className="al-form"
            onSubmit={
              handleSubmit
            }
          >

            <div className="al-field">

              <label htmlFor="admin-email">
                Email address
              </label>

              <div className="al-input">

                <Mail size={19} strokeWidth={1.6} aria-hidden="true" />

                <input
                  id="admin-email"
                  name="email"
                  type="email"
                  value={
                    email
                  }
                  placeholder="your@email.com"
                  autoComplete="email"
                  inputMode="email"
                  autoCapitalize="none"
                  spellCheck={false}
                  disabled={
                    loading
                  }
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? "admin-login-error" : undefined}
                  onChange={(
                    event
                  ) => {

                    setEmail(
                      event.target.value
                    );

                    if (
                      error
                    ) {

                      setError(
                        ""
                      );

                    }

                  }}
                  required
                />

              </div>

            </div>


            <div className="al-field">

              <label htmlFor="admin-password">
                Password
              </label>

              <div className="al-input">

                <LockKeyhole size={19} strokeWidth={1.6} aria-hidden="true" />

                <input
                  id="admin-password"
                  name="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={
                    password
                  }
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  disabled={
                    loading
                  }
                  aria-invalid={Boolean(error)}
                  aria-describedby={
                    [error && "admin-login-error", capsLock && "admin-caps-lock"]
                      .filter(Boolean)
                      .join(" ") || undefined
                  }
                  onKeyDown={trackCapsLock}
                  onKeyUp={trackCapsLock}
                  onBlur={() => setCapsLock(false)}
                  onChange={(
                    event
                  ) => {

                    setPassword(
                      event.target.value
                    );

                    if (
                      error
                    ) {

                      setError(
                        ""
                      );

                    }

                  }}
                  required
                />

                <button
                  type="button"
                  className="al-input__toggle"
                  disabled={
                    loading
                  }
                  onClick={() =>
                    setShowPassword(
                      (
                        current
                      ) =>
                        !current
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  aria-pressed={showPassword}
                >

                  {showPassword ? (
                    <EyeOff size={19} aria-hidden="true" />
                  ) : (
                    <Eye size={19} aria-hidden="true" />
                  )}

                </button>

              </div>

              {capsLock && (
                <span className="al-field__hint" id="admin-caps-lock">
                  Caps Lock is on.
                </span>
              )}

            </div>


            {error && (

              <div
                className="al-alert"
                id="admin-login-error"
                role="alert"
              >
                <AlertCircle size={18} aria-hidden="true" />
                <span>{error}</span>
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
                  : "Continue securely"}
              </span>

              {!loading && <ArrowRight size={18} aria-hidden="true" />}

            </button>

          </form>


          <div className="al-note">

            <MailCheck size={20} strokeWidth={1.6} aria-hidden="true" />

            <p>
              A one-time verification code will be sent to your email
              before CMS access is granted.
            </p>

          </div>

          <div className="al-register">

            <span>
              New to Continental Founders?
            </span>

            <Link to="/admin/register">
              Create an account
              <ArrowRight size={15} aria-hidden="true" />
            </Link>

          </div>

        </div>

      </section>

    </main>

  );

}
