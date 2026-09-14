import React, {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";

import "./AdminLogin.css";


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


  /* ==========================================================
     CHECK EXISTING SESSION
  ========================================================== */

  useEffect(() => {

    let active = true;


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


        if (!response.ok) {

          if (active) {
            setCheckingSession(false);
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


        if (!user) {

          if (active) {
            setCheckingSession(false);
          }

          return;

        }


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

          if (active) {
            setCheckingSession(false);
          }

          return;

        }


        if (
          user.status &&
          user.status !== "active"
        ) {

          if (active) {
            setCheckingSession(false);
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


        if (active) {

          navigate(
            "/admin",
            {
              replace: true,
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


        if (active) {
          setCheckingSession(false);
        }

      }

    }


    checkExistingSession();


    return () => {

      active = false;

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
      password.length < 8
    ) {

      setError(
        "Password must contain at least 8 characters."
      );

      return;

    }


    try {

      setLoading(true);

      setError("");


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


      if (!response.ok) {

        throw new Error(
          result?.message ||
          result?.error ||
          "Incorrect email or password."
        );

      }


      /* ======================================================
         OTP REQUIRED
      ====================================================== */

      const otpRequired =
        result?.otpRequired ??
        result?.otp_required ??
        result?.data?.otpRequired ??
        result?.data?.otp_required ??
        false;


      if (!otpRequired) {

        throw new Error(
          "The server did not request OTP verification."
        );

      }


      /* ======================================================
         EMAIL
      ====================================================== */

      const pendingEmail =
        result?.email ||
        result?.user?.email ||
        result?.admin?.email ||
        result?.data?.email ||
        result?.data?.user?.email ||
        result?.data?.admin?.email ||
        cleanEmail;


      /* ======================================================
         OTP PURPOSE
      ====================================================== */

      const purpose =
        result?.purpose ||
        result?.data?.purpose ||
        "login";


      if (
        purpose !== "login" &&
        purpose !== "registration"
      ) {

        throw new Error(
          "The server returned an invalid verification type."
        );

      }


      /* ======================================================
         TEMP OTP STORAGE
      ====================================================== */

      sessionStorage.setItem(
        "cf_pending_admin_email",
        pendingEmail
      );


      sessionStorage.setItem(
        "cf_otp_purpose",
        purpose
      );


      /* ======================================================
         CLEAR OLD LOCAL AUTH
      ====================================================== */

      localStorage.removeItem(
        "cf_admin_user"
      );


      localStorage.removeItem(
        "cf_admin_token"
      );


      /* ======================================================
         GO TO OTP PAGE
      ====================================================== */

      navigate(
        "/admin/verify-otp",
        {
          replace: true,

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
        requestError instanceof TypeError
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

      setLoading(false);

    }

  }


  /* ==========================================================
     SESSION CHECK SCREEN
  ========================================================== */

  if (checkingSession) {

    return (

      <main className="cf-admin-login-loading">

        <div className="cf-admin-login-loading__box">

          <div className="cf-admin-login-loading__icon">

            <ShieldCheck
              size={30}
              strokeWidth={1.5}
            />

          </div>


          <span>
            SECURE CMS ACCESS
          </span>


          <h1>
            Verifying your session
          </h1>


          <p>
            Please wait while Continental
            Founders checks your active
            administration session.
          </p>


          <div className="cf-admin-login-loading__dots">

            <i />
            <i />
            <i />

          </div>

        </div>

      </main>

    );

  }


  /* ==========================================================
     RENDER
  ========================================================== */

  return (

    <main className="cf-admin-login">

      {/* ======================================================
          LEFT BRAND SIDE
      ====================================================== */}

      <section className="cf-admin-login__visual">

        <div className="cf-admin-login__visual-background" />

        <div className="cf-admin-login__visual-shade" />


        {/* TOP */}

        <div className="cf-admin-login__visual-top">

          <Link
            to="/"
            className="cf-admin-login__brand"
            aria-label="Continental Founders home"
          >

            <img
              src="/assets/continental-founders-logo.png"
              alt="Continental Founders"
            />

          </Link>


          <div className="cf-admin-login__keywords">

            <span>
              PEOPLE
            </span>

            <span>
              IDEAS
            </span>

            <span>
              OPPORTUNITIES
            </span>

            <span>
              IMPACT
            </span>

          </div>

        </div>


        {/* MAIN MESSAGE */}

        <div className="cf-admin-login__visual-copy">

          <h1>

            Talent is
            <br />

            everywhere.

            <em>
              Access is not.
            </em>

          </h1>


          <div className="cf-admin-login__visual-description">

            <span className="cf-admin-login__gold-line" />

            <p>
              A global platform connecting
              founders, universities,
              professionals, markets and
              opportunity across Africa and
              beyond.
            </p>

          </div>

        </div>


        {/* SIDE WORDS */}

        <div className="cf-admin-login__vertical-list">

          <span>
            FOUNDERS
          </span>

          <span>
            COMMUNITY
          </span>

          <span>
            CAPITAL
          </span>

          <span>
            OPPORTUNITY
          </span>

          <span>
            A BRIGHTER TOMORROW
          </span>

          <div />

        </div>


        {/* FOOT */}

        <div className="cf-admin-login__visual-footer">

          <strong>
            CONTINENTAL FOUNDERS™
          </strong>

          <span>
            BUILDING A MORE INCLUSIVE TOMORROW
          </span>

        </div>

      </section>


      {/* ======================================================
          RIGHT LOGIN AREA
      ====================================================== */}

      <section className="cf-admin-login__form-side">

        <div className="cf-admin-login__cms-label">
          CMS ADMINISTRATION
        </div>


        <div className="cf-admin-login__card">

          {/* SECURITY ICON */}

          <div className="cf-admin-login__shield">

            <ShieldCheck
              size={37}
              strokeWidth={1.45}
            />

          </div>


          {/* HEADING */}

          <div className="cf-admin-login__heading">

            <h2>
              Welcome back.
            </h2>


            <p>
              Sign in to access the
              Continental Founders Content
              Management System.
            </p>

          </div>


          {/* FORM */}

          <form
            className="cf-admin-login__form"
            onSubmit={
              handleSubmit
            }
          >

            {/* EMAIL */}

            <div className="cf-admin-login__field">

              <label htmlFor="admin-email">
                Email address
              </label>


              <div className="cf-admin-login__input">

                <Mail
                  size={19}
                  strokeWidth={1.5}
                />


                <input
                  id="admin-email"
                  name="email"
                  type="email"
                  value={
                    email
                  }
                  placeholder="your@email.com"
                  autoComplete="email"
                  disabled={
                    loading
                  }
                  onChange={(
                    event
                  ) => {

                    setEmail(
                      event.target.value
                    );


                    if (error) {
                      setError("");
                    }

                  }}
                  required
                />

              </div>

            </div>


            {/* PASSWORD */}

            <div className="cf-admin-login__field">

              <label htmlFor="admin-password">
                Password
              </label>


              <div className="cf-admin-login__input">

                <LockKeyhole
                  size={19}
                  strokeWidth={1.5}
                />


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
                  onChange={(
                    event
                  ) => {

                    setPassword(
                      event.target.value
                    );


                    if (error) {
                      setError("");
                    }

                  }}
                  required
                />


                <button
                  type="button"
                  className="cf-admin-login__password-toggle"
                  disabled={
                    loading
                  }
                  onClick={() =>
                    setShowPassword(
                      (current) =>
                        !current
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >

                  {showPassword ? (

                    <EyeOff
                      size={19}
                    />

                  ) : (

                    <Eye
                      size={19}
                    />

                  )}

                </button>

              </div>

            </div>


            {/* ERROR */}

            {error && (

              <div
                className="cf-admin-login__error"
                role="alert"
              >

                {error}

              </div>

            )}


            {/* SUBMIT */}

            <button
              type="submit"
              className="cf-admin-login__submit"
              disabled={
                loading
              }
            >

              <span>

                {loading
                  ? "Verifying..."
                  : "Continue Securely"}

              </span>


              <ArrowRight
                size={18}
              />

            </button>

          </form>


          {/* DIVIDER */}

          <div className="cf-admin-login__divider">

            <span />

            <small>
              SECURITY
            </small>

            <span />

          </div>


          {/* OTP NOTE */}

          <div className="cf-admin-login__security-note">

            <LockKeyhole
              size={20}
              strokeWidth={1.6}
            />


            <p>
              Password verification alone
              does not grant CMS access.
              A one-time verification code
              will be sent to your email.
            </p>

          </div>


          {/* REGISTER */}

          <div className="cf-admin-login__register">

            <p>
              New to Continental Founders?
            </p>


            <Link to="/admin/register">

              Create an account

              <ArrowRight
                size={15}
              />

            </Link>

          </div>


          {/* CARD FOOTER */}

          <div className="cf-admin-login__card-footer">

            <span>
              PEOPLE
            </span>

            <i />

            <span>
              IDEAS
            </span>

            <i />

            <span>
              OPPORTUNITIES
            </span>

            <i />

            <span>
              IMPACT
            </span>

          </div>

        </div>


        <Link
          to="/"
          className="cf-admin-login__return"
        >
          Return to Continental Founders
        </Link>

      </section>

    </main>

  );

}