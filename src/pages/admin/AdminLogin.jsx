import React, {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useLocation,
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


// ============================================================
// ADMIN LOGIN
// ============================================================

export default function AdminLogin() {

  const navigate =
    useNavigate();

  const location =
    useLocation();


  const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000";


  // ==========================================================
  // STATE
  // ==========================================================

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


  // ==========================================================
  // CHECK EXISTING SERVER SESSION
  // ==========================================================

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
          result.user ||
          result.admin ||
          result.data?.user;


        if (!user) {

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
    API_URL,
    navigate,
  ]);


  // ==========================================================
  // LOGIN
  // ==========================================================

  async function handleSubmit(
    event
  ) {

    event.preventDefault();


    const cleanEmail =
      email
        .trim()
        .toLowerCase();


    // ========================================================
    // VALIDATION
    // ========================================================

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

      setLoading(true);

      setError("");


      // ======================================================
      // VERIFY EMAIL + PASSWORD
      //
      // The backend does NOT create final CMS access here.
      // It sends an OTP first.
      // ======================================================

      const response =
        await fetch(
          `${API_URL}/api/auth/login`,
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
          result.message ||
          result.error ||
          "Incorrect email or password."
        );

      }


      // ======================================================
      // REQUIRE OTP STAGE
      // ======================================================

      const otpRequired =
        result.otpRequired ??
        result.otp_required ??
        result.data?.otpRequired ??
        result.data?.otp_required ??
        false;


      if (
        !otpRequired
      ) {

        throw new Error(
          "The server did not request OTP verification."
        );

      }


      // ======================================================
      // GET EMAIL
      // ======================================================

      const pendingEmail =
        result.email ||
        result.user?.email ||
        result.admin?.email ||
        result.data?.email ||
        result.data?.user?.email ||
        result.data?.admin?.email ||
        cleanEmail;


      // ======================================================
      // GET OTP PURPOSE
      //
      // This is important because a pending verification
      // account may receive a REGISTRATION OTP even when
      // arriving from the login page.
      // ======================================================

      const purpose =
        result.purpose ||
        result.data?.purpose ||
        "login";


      if (
        purpose !== "login" &&
        purpose !== "registration"
      ) {

        throw new Error(
          "The server returned an invalid verification type."
        );

      }


      // ======================================================
      // SAVE TEMPORARY OTP DATA
      // ======================================================

      sessionStorage.setItem(
        "cf_pending_admin_email",
        pendingEmail
      );


      sessionStorage.setItem(
        "cf_otp_purpose",
        purpose
      );


      // ======================================================
      // CLEAR OLD FRONTEND AUTH DATA
      // ======================================================

      localStorage.removeItem(
        "cf_admin_user"
      );


      localStorage.removeItem(
        "cf_admin_token"
      );


      // ======================================================
      // REDIRECT TO OTP
      // ======================================================

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
        requestError instanceof
          TypeError &&
        requestError.message.includes(
          "fetch"
        )
      ) {

        setError(
          "Unable to connect to the Continental Founders server. Make sure the backend is running."
        );

      } else {

        setError(
          requestError.message ||
          "Unable to sign in."
        );

      }

    } finally {

      setLoading(false);

    }

  }


  // ==========================================================
  // LOADING EXISTING SESSION
  // ==========================================================

  if (
    checkingSession
  ) {

    return (

      <main
        className="admin-login"
      >

        <section
          className="admin-login__panel"
        >

          <div
            className="admin-login__content"
          >

            <div
              className="admin-login__security-icon"
            >

              <ShieldCheck
                size={25}
                strokeWidth={1.6}
              />

            </div>


            <span
              className="admin-login__eyebrow"
            >
              SECURE CMS ACCESS
            </span>


            <h1>
              Checking your session.
            </h1>


            <p
              className="admin-login__intro"
            >
              Please wait while we verify
              whether you already have an
              active Continental Founders
              CMS session.
            </p>

          </div>

        </section>


        <section
          className="admin-login__visual"
          aria-hidden="true"
        >

          <div
            className="admin-login__visual-overlay"
          />


          <div
            className="admin-login__visual-content"
          >

            <span
              className="admin-login__visual-eyebrow"
            >
              CONTINENTAL FOUNDERS
            </span>


            <h2>
              Talent is
              <br />

              everywhere.
              <br />

              <em>
                Access is not.
              </em>
            </h2>

          </div>

        </section>

      </main>

    );

  }


  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <main className="admin-login">

      <section className="admin-login__panel">

        <div className="admin-login__brand">

          <Link
            to="/"
            className="admin-login__brand-link"
            aria-label="Continental Founders home"
          >

            <img
              src="/assets/continental-founders-logo.png"
              alt="Continental Founders"
            />

          </Link>


          <span>
            CMS ADMINISTRATION
          </span>

        </div>


        <div className="admin-login__content">

          <div className="admin-login__security-icon">

            <ShieldCheck
              size={25}
              strokeWidth={1.6}
            />

          </div>


          <span className="admin-login__eyebrow">
            SECURE FOUNDER ACCESS
          </span>


          <h1>
            Welcome back.
          </h1>


          <p className="admin-login__intro">

            Sign in using the email address
            connected to your Continental
            Founders account. A verification
            code will be sent to your personal
            email before CMS access is granted.

          </p>


          <form
            className="admin-login__form"
            onSubmit={
              handleSubmit
            }
          >

            <div className="admin-login__field">

              <label htmlFor="admin-email">
                Email Address
              </label>


              <div className="admin-login__input-wrapper">

                <Mail
                  size={18}
                  strokeWidth={1.6}
                  aria-hidden="true"
                />


                <input
                  id="admin-email"
                  type="email"
                  name="email"
                  value={
                    email
                  }
                  placeholder="Enter your personal email"
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


                    if (
                      error
                    ) {

                      setError("");

                    }

                  }}
                  required
                />

              </div>

            </div>


            <div className="admin-login__field">

              <label htmlFor="admin-password">
                Password
              </label>


              <div className="admin-login__input-wrapper">

                <LockKeyhole
                  size={18}
                  strokeWidth={1.6}
                  aria-hidden="true"
                />


                <input
                  id="admin-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
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


                    if (
                      error
                    ) {

                      setError("");

                    }

                  }}
                  required
                />


                <button
                  type="button"
                  className="admin-login__password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (
                        current
                      ) =>
                        !current
                    )
                  }
                  disabled={
                    loading
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >

                  {showPassword ? (

                    <EyeOff
                      size={18}
                      strokeWidth={1.7}
                    />

                  ) : (

                    <Eye
                      size={18}
                      strokeWidth={1.7}
                    />

                  )}

                </button>

              </div>

            </div>


            {error && (

              <div
                className="admin-login__error"
                role="alert"
              >

                {error}

              </div>

            )}


            <button
              type="submit"
              className="admin-login__submit"
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
                strokeWidth={1.8}
              />

            </button>

          </form>


          <div className="admin-login__register">

            <span>
              New Continental Founders member?
            </span>


            <Link to="/admin/register">
              Create account
            </Link>

          </div>


          <div className="admin-login__security-note">

            <LockKeyhole
              size={15}
              strokeWidth={1.7}
            />

            <p>

              Password verification alone
              does not grant CMS access.
              A one-time verification code
              must also be confirmed.

            </p>

          </div>

        </div>


        <div className="admin-login__footer">

          <span>
            Continental Founders™
          </span>

          <span>
            Content Management System
          </span>

        </div>

      </section>


      <section
        className="admin-login__visual"
        aria-hidden="true"
      >

        <div className="admin-login__visual-overlay" />


        <div className="admin-login__visual-content">

          <span className="admin-login__visual-eyebrow">
            CONTINENTAL FOUNDERS
          </span>


          <h2>
            Talent is
            <br />

            everywhere.
            <br />

            <em>
              Access is not.
            </em>
          </h2>


          <p>

            One central workspace for
            managing the content,
            relationships, opportunities,
            and stories that move the
            Continental Founders ecosystem
            forward.

          </p>


          <div className="admin-login__visual-line" />

        </div>

      </section>

    </main>

  );

}