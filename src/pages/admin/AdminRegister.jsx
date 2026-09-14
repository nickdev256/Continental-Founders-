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


/* ============================================================
   CONFIG
============================================================ */

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";


/* ============================================================
   ADMIN REGISTER
============================================================ */

export default function AdminRegister() {

  const navigate =
    useNavigate();


  /* ==========================================================
     STATE
  ========================================================== */

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


  /* ==========================================================
     FORM CHANGE
  ========================================================== */

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


    if (error) {
      setError("");
    }

  }


  /* ==========================================================
     PASSWORD CHECKS
  ========================================================== */

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


  /* ==========================================================
     REGISTER
  ========================================================== */

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


      const response =
        await fetch(
          `${API_URL}/api/auth/register`,
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


      if (!response.ok) {

        throw new Error(
          result?.message ||
          result?.error ||
          "Unable to create your account."
        );

      }


      const otpRequired =
        result?.otpRequired ??
        result?.otp_required ??
        result?.data?.otpRequired ??
        result?.data?.otp_required ??
        false;


      if (!otpRequired) {

        throw new Error(
          "The server did not request email verification."
        );

      }


      const pendingEmail =
        result?.email ||
        result?.user?.email ||
        result?.data?.email ||
        result?.data?.user?.email ||
        email;


      const purpose =
        result?.purpose ||
        result?.data?.purpose ||
        "registration";


      if (
        purpose !==
        "registration"
      ) {

        throw new Error(
          "The server returned an invalid registration verification type."
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
          TypeError
      ) {

        setError(
          "Unable to connect to the Continental Founders server."
        );

      } else {

        setError(
          registrationError?.message ||
          "Unable to create your account."
        );

      }

    } finally {

      setLoading(false);

    }

  }


  /* ==========================================================
     RENDER
  ========================================================== */

  return (

    <main className="cf-admin-register">

      {/* ======================================================
          LEFT VISUAL SIDE
      ====================================================== */}

      <section className="cf-admin-register__visual">

        <div className="cf-admin-register__visual-background" />

        <div className="cf-admin-register__visual-shade" />


        <div className="cf-admin-register__visual-top">

          <Link
            to="/"
            className="cf-admin-register__brand"
            aria-label="Continental Founders home"
          >

            <img
              src="/assets/continental-founders-logo.png"
              alt="Continental Founders"
            />

          </Link>


          <div className="cf-admin-register__keywords">

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


        <div className="cf-admin-register__visual-copy">

          <span className="cf-admin-register__eyebrow">
            CONTINENTAL FOUNDERS
          </span>


          <h1>

            Build the
            <br />

            next chapter.

            <em>
              Start here.
            </em>

          </h1>


          <div className="cf-admin-register__visual-description">

            <span className="cf-admin-register__gold-line" />


            <p>
              Create your Continental Founders
              account and access the secure
              workspace supporting founders,
              institutions and opportunity.
            </p>

          </div>

        </div>


        <div className="cf-admin-register__visual-footer">

          <strong>
            CONTINENTAL FOUNDERS™
          </strong>

          <span>
            PEOPLE · IDEAS · OPPORTUNITIES · IMPACT
          </span>

        </div>

      </section>


      {/* ======================================================
          REGISTRATION SIDE
      ====================================================== */}

      <section className="cf-admin-register__form-side">

        <div className="cf-admin-register__cms-label">
          CMS REGISTRATION
        </div>


        <div className="cf-admin-register__card">

          <div className="cf-admin-register__shield">

            <ShieldCheck
              size={36}
              strokeWidth={1.45}
            />

          </div>


          <div className="cf-admin-register__heading">

            <h2>
              Create your account.
            </h2>


            <p>
              Register with your personal
              email address. Verification
              is required before access is
              activated.
            </p>

          </div>


          <form
            className="cf-admin-register__form"
            onSubmit={
              handleSubmit
            }
          >

            {/* FULL NAME */}

            <div className="cf-admin-register__field">

              <label htmlFor="register-name">
                Full name
              </label>


              <div className="cf-admin-register__input">

                <UserRound
                  size={19}
                  strokeWidth={1.5}
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


            {/* EMAIL */}

            <div className="cf-admin-register__field">

              <label htmlFor="register-email">
                Personal email address
              </label>


              <div className="cf-admin-register__input">

                <Mail
                  size={19}
                  strokeWidth={1.5}
                />


                <input
                  id="register-email"
                  type="email"
                  name="email"
                  value={
                    form.email
                  }
                  placeholder="your@email.com"
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


              <span className="cf-admin-register__field-note">
                Your verification code will be sent to this email.
              </span>

            </div>


            {/* PASSWORD */}

            <div className="cf-admin-register__field">

              <label htmlFor="register-password">
                Password
              </label>


              <div className="cf-admin-register__input">

                <LockKeyhole
                  size={19}
                  strokeWidth={1.5}
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
                  className="cf-admin-register__password-toggle"
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


            {/* PASSWORD REQUIREMENTS */}

            {form.password && (

              <div className="cf-admin-register__requirements">

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


            {/* CONFIRM PASSWORD */}

            <div className="cf-admin-register__field">

              <label htmlFor="register-confirm-password">
                Confirm password
              </label>


              <div className="cf-admin-register__input">

                <LockKeyhole
                  size={19}
                  strokeWidth={1.5}
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
                  className="cf-admin-register__password-toggle"
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
                className="cf-admin-register__error"
                role="alert"
              >

                {error}

              </div>

            )}


            {/* SUBMIT */}

            <button
              type="submit"
              className="cf-admin-register__submit"
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
              />

            </button>

          </form>


          <div className="cf-admin-register__security-note">

            <ShieldCheck
              size={19}
              strokeWidth={1.55}
            />


            <p>
              Your account is activated
              only after your email
              verification code is confirmed.
              CMS permissions remain controlled
              by Continental Founders.
            </p>

          </div>


          <div className="cf-admin-register__login">

            <p>
              Already have an account?
            </p>


            <Link to="/admin/login">

              Sign in

              <ArrowRight
                size={15}
              />

            </Link>

          </div>


          <div className="cf-admin-register__card-footer">

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
          className="cf-admin-register__return"
        >
          Return to Continental Founders
        </Link>

      </section>

    </main>

  );

}


/* ============================================================
   PASSWORD REQUIREMENT
============================================================ */

function PasswordRequirement({
  passed,
  text,
}) {

  return (

    <div
      className={
        passed
          ? "cf-admin-register__requirement cf-admin-register__requirement--passed"
          : "cf-admin-register__requirement"
      }
    >

      <span className="cf-admin-register__requirement-icon">

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