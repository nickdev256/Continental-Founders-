import React, {
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
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import "./AdminAuth.css";


const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";


export default function AdminRegister() {

  const navigate =
    useNavigate();


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


  // Shared props for the two password inputs.
  const passwordField = (id, name, visible, placeholder) => ({
    id,
    name,
    type: visible ? "text" : "password",
    value: form[name],
    placeholder,
    autoComplete: "new-password",
    disabled: loading,
    onChange: handleChange,
    required: true,
  });

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
          <span className="al-eyebrow al-visual__eyebrow">
            Continental Founders
          </span>

          <h1>
            Build the next chapter.{" "}
            <em>Start here.</em>
          </h1>

          <p>
            Create your Continental Founders account and access the
            secure workspace supporting founders, institutions and
            opportunity.
          </p>
        </div>

        <div className="al-visual__footer">
          <strong>CONTINENTAL FOUNDERS™</strong>
          <span>Building a more inclusive tomorrow</span>
        </div>

      </section>


      {/* ======================================================
          REGISTER PANEL
      ====================================================== */}

      <section className="al-panel">

        <div className="al-panel__top">
          <span className="al-eyebrow">CMS Registration</span>

          <Link to="/" className="al-panel__back">
            <ArrowLeft size={16} aria-hidden="true" />
            Return to Continental Founders
          </Link>
        </div>

        <div className="al-card">

          <ol className="al-steps" aria-label="Registration steps">
            <li className="is-current" aria-current="step">
              <span>1</span>
              Create account
            </li>
            <li>
              <span>2</span>
              Verify email
            </li>
          </ol>

          <div className="al-card__heading">
            <span className="al-card__icon">
              <ShieldCheck size={28} strokeWidth={1.6} aria-hidden="true" />
            </span>

            <h2>Create your account.</h2>

            <p>
              Register with your personal email address. Verification is
              required before access is activated.
            </p>
          </div>

          <form
            className="al-form"
            onSubmit={
              handleSubmit
            }
          >

            <div className="al-field">
              <label htmlFor="register-name">Full name</label>

              <div className="al-input">
                <UserRound size={19} strokeWidth={1.6} aria-hidden="true" />

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

            <div className="al-field">
              <label htmlFor="register-email">Personal email address</label>

              <div className="al-input">
                <Mail size={19} strokeWidth={1.6} aria-hidden="true" />

                <input
                  id="register-email"
                  type="email"
                  name="email"
                  value={
                    form.email
                  }
                  placeholder="your@email.com"
                  autoComplete="email"
                  inputMode="email"
                  autoCapitalize="none"
                  spellCheck={false}
                  disabled={
                    loading
                  }
                  onChange={
                    handleChange
                  }
                  aria-describedby="register-email-note"
                  required
                />
              </div>

              <span className="al-field__note" id="register-email-note">
                Your verification code will be sent to this email.
              </span>
            </div>

            <div className="al-field">
              <label htmlFor="register-password">Password</label>

              <div className="al-input">
                <LockKeyhole size={19} strokeWidth={1.6} aria-hidden="true" />

                <input
                  {...passwordField(
                    "register-password",
                    "password",
                    showPassword,
                    "Create a password"
                  )}
                  aria-describedby={form.password ? "register-rules" : undefined}
                />

                <button
                  type="button"
                  className="al-input__toggle"
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
                  aria-pressed={showPassword}
                >
                  {showPassword ? (
                    <EyeOff size={19} aria-hidden="true" />
                  ) : (
                    <Eye size={19} aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            {form.password && (
              <ul className="al-rules" id="register-rules" aria-label="Password requirements">
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
              </ul>
            )}

            <div className="al-field">
              <label htmlFor="register-confirm-password">Confirm password</label>

              <div className="al-input">
                <LockKeyhole size={19} strokeWidth={1.6} aria-hidden="true" />

                <input
                  {...passwordField(
                    "register-confirm-password",
                    "confirmPassword",
                    showConfirmPassword,
                    "Confirm your password"
                  )}
                />

                <button
                  type="button"
                  className="al-input__toggle"
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
                  aria-pressed={showConfirmPassword}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={19} aria-hidden="true" />
                  ) : (
                    <Eye size={19} aria-hidden="true" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="al-alert" role="alert">
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
                  ? "Creating account..."
                  : "Create account"}
              </span>

              {!loading && <ArrowRight size={18} aria-hidden="true" />}
            </button>

          </form>

          <div className="al-note">
            <ShieldCheck size={20} strokeWidth={1.6} aria-hidden="true" />

            <p>
              Your account becomes active only after your email
              verification code is confirmed. CMS permissions are managed
              securely by Continental Founders.
            </p>
          </div>

          <div className="al-register">
            <span>Already have an account?</span>

            <Link to="/admin/login">
              Sign in
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>

        </div>

      </section>

    </main>

  );

}


function PasswordRequirement({
  passed,
  text,
}) {

  return (
    <li className={passed ? "is-met" : ""}>
      <span className="al-rules__icon" aria-hidden="true">
        {passed && <Check size={11} strokeWidth={3} />}
      </span>

      <span>
        {text}
        <span className="al-visually-hidden">
          {passed ? " (met)" : " (not yet met)"}
        </span>
      </span>
    </li>
  );

}
