import React, {
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import "./AdminRegister.css";


// ============================================================
// CONTINENTAL FOUNDERS
// CMS ACCOUNT REGISTRATION
// ============================================================

export default function AdminRegister() {

  const navigate =
    useNavigate();


  const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000";


  // ==========================================================
  // STATE
  // ==========================================================

  const [
    form,
    setForm,
  ] =
    useState({
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    });


  const [
    showPassword,
    setShowPassword,
  ] =
    useState(false);


  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] =
    useState(false);


  const [
    loading,
    setLoading,
  ] =
    useState(false);


  const [
    error,
    setError,
  ] =
    useState("");


  // ==========================================================
  // FORM CHANGE
  // ==========================================================

  function handleChange(
    event
  ) {

    const {
      name,
      value,
    } =
      event.target;


    setForm(
      (current) => ({
        ...current,

        [name]:
          value,
      })
    );


    if (
      error
    ) {

      setError("");

    }

  }


  // ==========================================================
  // PASSWORD CHECKS
  // ==========================================================

  const passwordChecks = {

    length:
      form.password.length >= 8,

    uppercase:
      /[A-Z]/.test(
        form.password
      ),

    lowercase:
      /[a-z]/.test(
        form.password
      ),

    number:
      /\d/.test(
        form.password
      ),

  };


  // ==========================================================
  // REGISTER
  // ==========================================================

  async function handleSubmit(
    event
  ) {

    event.preventDefault();


    const fullName =
      form.fullName
        .trim();


    const email =
      form.email
        .trim()
        .toLowerCase();


    // ========================================================
    // VALIDATION
    // ========================================================

    if (
      !fullName ||
      !email ||
      !form.password ||
      !form.confirmPassword
    ) {

      setError(
        "Please complete all required fields."
      );

      return;

    }


    if (
      fullName.length < 2
    ) {

      setError(
        "Please enter your full name."
      );

      return;

    }


    if (
      !passwordChecks.length
    ) {

      setError(
        "Your password must contain at least 8 characters."
      );

      return;

    }


    if (
      !passwordChecks.uppercase ||
      !passwordChecks.lowercase ||
      !passwordChecks.number
    ) {

      setError(
        "Your password must contain an uppercase letter, lowercase letter, and number."
      );

      return;

    }


    if (
      form.password !==
      form.confirmPassword
    ) {

      setError(
        "The passwords do not match."
      );

      return;

    }


    try {

      setLoading(true);
      setError("");


      // ======================================================
      // REGISTER WITH BACKEND
      // ======================================================

      const response =
        await fetch(
          `${API_URL}/api/auth/register`,
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
                fullName,
                email,
                password:
                  form.password,
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
          "Unable to create your account."
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
          "The server did not request email verification."
        );

      }


      // ======================================================
      // GET EMAIL FROM BACKEND
      // ======================================================

      const pendingEmail =
        result.email ||
        result.user?.email ||
        result.data?.email ||
        result.data?.user?.email ||
        email;


      // ======================================================
      // GET OTP PURPOSE
      // ======================================================

      const purpose =
        result.purpose ||
        result.data?.purpose ||
        "registration";


      if (
        purpose !== "registration"
      ) {

        throw new Error(
          "The server returned an invalid registration verification type."
        );

      }


      // ======================================================
      // STORE TEMPORARY OTP INFORMATION
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
      // CLEAR OLD AUTH DATA
      // ======================================================

      localStorage.removeItem(
        "cf_admin_user"
      );


      localStorage.removeItem(
        "cf_admin_token"
      );


      // ======================================================
      // GO TO OTP VERIFICATION
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
      registrationError
    ) {

      console.error(
        "Admin registration error:",
        registrationError
      );


      if (
        registrationError instanceof
          TypeError &&
        registrationError.message.includes(
          "fetch"
        )
      ) {

        setError(
          "Unable to connect to the Continental Founders server. Make sure the backend is running."
        );

      } else {

        setError(
          registrationError.message ||
          "Unable to create your account."
        );

      }

    } finally {

      setLoading(false);

    }

  }


  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <main className="admin-register">

      <section className="admin-register__panel">

        <div className="admin-register__brand">

          <Link
            to="/"
            className="admin-register__brand-link"
            aria-label="Continental Founders home"
          >

            <img
              src="/assets/continental-founders-logo.png"
              alt="Continental Founders"
            />

          </Link>


          <span>
            CMS ACCESS
          </span>

        </div>


        <div className="admin-register__content">

          <div className="admin-register__security-icon">

            <ShieldCheck
              size={25}
              strokeWidth={1.6}
            />

          </div>


          <span className="admin-register__eyebrow">
            FOUNDER REGISTRATION
          </span>


          <h1>
            Create your account.
          </h1>


          <p className="admin-register__intro">

            Register using your personal
            email address. A verification
            code will be sent to that email
            before your account is activated.

          </p>


          <form
            className="admin-register__form"
            onSubmit={
              handleSubmit
            }
          >

            <div className="admin-register__field">

              <label htmlFor="register-name">
                Full Name
              </label>


              <div className="admin-register__input-wrapper">

                <UserRound
                  size={18}
                  strokeWidth={1.6}
                  aria-hidden="true"
                />


                <input
                  id="register-name"
                  type="text"
                  name="fullName"
                  value={
                    form.fullName
                  }
                  placeholder="Enter your full name"
                  autoComplete="name"
                  disabled={
                    loading
                  }
                  onChange={
                    handleChange
                  }
                  required
                />

              </div>

            </div>


            <div className="admin-register__field">

              <label htmlFor="register-email">
                Personal Email Address
              </label>


              <div className="admin-register__input-wrapper">

                <Mail
                  size={18}
                  strokeWidth={1.6}
                  aria-hidden="true"
                />


                <input
                  id="register-email"
                  type="email"
                  name="email"
                  value={
                    form.email
                  }
                  placeholder="Enter your personal email"
                  autoComplete="email"
                  disabled={
                    loading
                  }
                  onChange={
                    handleChange
                  }
                  required
                />

              </div>


              <span className="admin-register__field-note">
                Your verification code will be sent to this email.
              </span>

            </div>


            <div className="admin-register__field">

              <label htmlFor="register-password">
                Password
              </label>


              <div className="admin-register__input-wrapper">

                <LockKeyhole
                  size={18}
                  strokeWidth={1.6}
                  aria-hidden="true"
                />


                <input
                  id="register-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  value={
                    form.password
                  }
                  placeholder="Create a password"
                  autoComplete="new-password"
                  disabled={
                    loading
                  }
                  onChange={
                    handleChange
                  }
                  required
                />


                <button
                  type="button"
                  className="admin-register__password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (current) =>
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


            {form.password && (

              <div className="admin-register__requirements">

                <PasswordRequirement
                  passed={
                    passwordChecks.length
                  }
                  text="At least 8 characters"
                />


                <PasswordRequirement
                  passed={
                    passwordChecks.uppercase
                  }
                  text="One uppercase letter"
                />


                <PasswordRequirement
                  passed={
                    passwordChecks.lowercase
                  }
                  text="One lowercase letter"
                />


                <PasswordRequirement
                  passed={
                    passwordChecks.number
                  }
                  text="One number"
                />

              </div>

            )}


            <div className="admin-register__field">

              <label htmlFor="register-confirm-password">
                Confirm Password
              </label>


              <div className="admin-register__input-wrapper">

                <LockKeyhole
                  size={18}
                  strokeWidth={1.6}
                  aria-hidden="true"
                />


                <input
                  id="register-confirm-password"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  name="confirmPassword"
                  value={
                    form.confirmPassword
                  }
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  disabled={
                    loading
                  }
                  onChange={
                    handleChange
                  }
                  required
                />


                <button
                  type="button"
                  className="admin-register__password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(
                      (current) =>
                        !current
                    )
                  }
                  disabled={
                    loading
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >

                  {showConfirmPassword ? (

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
                className="admin-register__error"
                role="alert"
              >

                {error}

              </div>

            )}


            <button
              type="submit"
              className="admin-register__submit"
              disabled={
                loading
              }
            >

              <span>

                {loading
                  ? "Creating account..."
                  : "Create Account"}

              </span>


              <ArrowRight
                size={18}
                strokeWidth={1.8}
              />

            </button>

          </form>


          <div className="admin-register__login">

            <span>
              Already have an account?
            </span>


            <Link to="/admin/login">
              Sign in
            </Link>

          </div>


          <div className="admin-register__security-note">

            <ShieldCheck
              size={15}
              strokeWidth={1.7}
            />


            <p>

              Your account is activated only
              after your personal email
              verification code is confirmed.
              CMS permissions are controlled
              securely by Continental Founders.

            </p>

          </div>

        </div>


        <div className="admin-register__footer">

          <span>
            Continental Founders™
          </span>

          <span>
            Secure CMS Registration
          </span>

        </div>

      </section>


      <section
        className="admin-register__visual"
        aria-hidden="true"
      >

        <div className="admin-register__visual-overlay" />


        <div className="admin-register__visual-content">

          <span className="admin-register__visual-eyebrow">
            CONTINENTAL FOUNDERS
          </span>


          <h2>
            Build.
            <br />

            Connect.
            <br />

            <em>
              Move forward.
            </em>
          </h2>


          <p>

            A secure workspace for the
            people building and managing
            the Continental Founders
            ecosystem.

          </p>


          <div className="admin-register__visual-line" />

        </div>

      </section>

    </main>

  );

}


// ============================================================
// PASSWORD REQUIREMENT
// ============================================================

function PasswordRequirement({
  passed,
  text,
}) {

  return (

    <div
      className={
        passed
          ? "admin-register__requirement admin-register__requirement--passed"
          : "admin-register__requirement"
      }
    >

      <span className="admin-register__requirement-icon">

        {passed && (

          <Check
            size={11}
            strokeWidth={2.5}
          />

        )}

      </span>


      <span>
        {text}
      </span>

    </div>

  );

}