import React, { useRef, useState } from "react";

import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Globe2,
  Handshake,
  Mail,
  Rocket,
  Send,
} from "lucide-react";

import { Link } from "react-router-dom";

import "./Contact.css";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

const CONTACT_EMAIL = "continentalfounders.info@gmail.com";

const initialForm = {
  name: "",
  organization: "",
  email: "",
  country: "",
  partnership: "",
  message: "",
};

// Values are sent to the backend as-is; keep them unchanged.
const interests = [
  "University partnership",
  "Research / knowledge exchange",
  "Strategic partnership",
  "Program / convening",
  "Other",
];

const nextSteps = [
  {
    title: "We review your inquiry",
    text: "Our team reads every message to understand your organization and goals.",
  },
  {
    title: "We reply by email",
    text: "We get back to you to arrange a first conversation.",
  },
  {
    title: "We explore it together",
    text: "We shape the partnership or program that fits what you want to build.",
  },
];

// Visitors who came for something specific can go straight there.
const otherRoutes = [
  {
    icon: Rocket,
    title: "Apply to CF Fellows",
    to: "/cfcv/apply",
  },
  {
    icon: Handshake,
    title: "Become a partner",
    to: "/strategic-partners",
  },
  {
    icon: CalendarDays,
    title: "See upcoming events",
    to: "/events",
  },
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(form) {
  const errors = {};

  if (!form.name.trim()) errors.name = "Please enter your name.";
  if (!form.organization.trim()) errors.organization = "Please enter your organization.";

  if (!form.email.trim()) {
    errors.email = "Please enter your email address.";
  } else if (!EMAIL_PATTERN.test(form.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }

  if (!form.partnership) errors.partnership = "Please choose what you are exploring.";
  if (!form.message.trim()) errors.message = "Please tell us a little more.";

  return errors;
}

export default function Contact() {
  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const formRef = useRef(null);

  function update(event) {
    const { name, value } = event.target;

    setForm((current) => ({ ...current, [name]: value }));

    if (fieldErrors[name]) {
      setFieldErrors((current) => ({ ...current, [name]: "" }));
    }

    if (error) {
      setError("");
    }
  }

  async function submit(event) {
    event.preventDefault();

    const errors = validate(form);

    if (Object.keys(errors).length) {
      setFieldErrors(errors);

      // Take the visitor to the first thing that needs fixing.
      const first = Object.keys(errors)[0];
      formRef.current?.querySelector(`[name="${first}"]`)?.focus();
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          organization: form.organization,
          email: form.email,
          country: form.country,
          partnership: form.partnership,
          message: form.message,
        }),
      });

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(data.message || "Unable to send your inquiry.");
      }

      setSubmitted(true);
      setForm(initialForm);
      setFieldErrors({});
    } catch (submitError) {
      console.error("Contact submission error:", submitError);

      // A network failure only says "Failed to fetch".
      setError(
        submitError instanceof TypeError
          ? `We could not send your message right now. Please try again shortly, or email us at ${CONTACT_EMAIL}.`
          : submitError.message || "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  // Shared props for a text field and its error message.
  function fieldProps(name) {
    return {
      id: `contact-${name}`,
      name,
      value: form[name],
      onChange: update,
      "aria-invalid": Boolean(fieldErrors[name]),
      "aria-describedby": fieldErrors[name] ? `contact-${name}-error` : undefined,
    };
  }

  function fieldError(name) {
    if (!fieldErrors[name]) return null;

    return (
      <span className="ct-field__error" id={`contact-${name}-error`}>
        {fieldErrors[name]}
      </span>
    );
  }

  return (
    <main className="ct-page">

      {/* ======================================================
          HERO
      ====================================================== */}

      <section className="ct-hero">

        <div className="ct-hero__media" aria-hidden="true">
          <img src="/assets/v.webp" alt="" fetchPriority="high" />
        </div>

        <div className="ct-container ct-hero__inner">

          <div className="ct-hero__content">
            <span className="ct-eyebrow ct-eyebrow--light">Contact</span>

            <h1>
              Let's build something <em>useful together.</em>
            </h1>
          </div>

          <p className="ct-hero__aside">
            Whether you represent a university, research institution,
            foundation, nonprofit, or company, we would like to
            understand what you are exploring.
          </p>

        </div>

      </section>


      {/* ======================================================
          FORM + DETAILS
      ====================================================== */}

      <section className="ct-section">

        <div className="ct-container ct-grid">

          {/* Left: what to expect and other ways to reach us */}

          <aside className="ct-info">

            <span className="ct-eyebrow">Start Here</span>

            <h2>Tell us what you're trying to build.</h2>

            <p className="ct-info__lead">
              A useful first conversation can be as simple as explaining
              your organization, the opportunity you see, and the type of
              relationship you want to explore.
            </p>

            <ul className="ct-details">
              <li>
                <span className="ct-details__icon">
                  <Mail size={20} aria-hidden="true" />
                </span>

                <span>
                  <small>Email</small>
                  <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
                </span>
              </li>

              <li>
                <span className="ct-details__icon ct-details__icon--blue">
                  <Globe2 size={20} aria-hidden="true" />
                </span>

                <span>
                  <small>Geographic focus</small>
                  <strong>United States &amp; Africa</strong>
                </span>
              </li>
            </ul>

            <div className="ct-steps">
              <h3>What happens next</h3>

              <ol>
                {nextSteps.map(({ title, text }, index) => (
                  <li key={title}>
                    <span className="ct-steps__number">{index + 1}</span>

                    <span>
                      <strong>{title}</strong>
                      <span>{text}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>

          </aside>


          {/* Right: the form */}

          <div className="ct-card">

            {submitted ? (

              <div className="ct-success" role="status">
                <span className="ct-success__icon">
                  <CheckCircle2 size={36} aria-hidden="true" />
                </span>

                <h3>Thank you.</h3>

                <p>
                  Your partnership inquiry has been submitted
                  successfully. Our team will review it and get back
                  to you.
                </p>

                <button
                  type="button"
                  className="ct-button ct-button--outline"
                  onClick={() => {
                    setSubmitted(false);
                    setForm(initialForm);
                    setError("");
                  }}
                >
                  Send another message
                </button>
              </div>

            ) : (

              <form
                ref={formRef}
                className="ct-form"
                onSubmit={submit}
                noValidate
              >

                <div className="ct-form__head">
                  <h3>Send us a message</h3>
                  <p>Fields marked <span aria-hidden="true">*</span><span className="ct-visually-hidden">with an asterisk</span> are required.</p>
                </div>

                {error && (
                  <div className="ct-alert" role="alert">
                    <AlertCircle size={18} aria-hidden="true" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="ct-form__row">
                  <label className="ct-field" htmlFor="contact-name">
                    <span className="ct-field__label">Your name <i>*</i></span>
                    <input {...fieldProps("name")} autoComplete="name" />
                    {fieldError("name")}
                  </label>

                  <label className="ct-field" htmlFor="contact-organization">
                    <span className="ct-field__label">Organization <i>*</i></span>
                    <input {...fieldProps("organization")} autoComplete="organization" />
                    {fieldError("organization")}
                  </label>
                </div>

                <div className="ct-form__row">
                  <label className="ct-field" htmlFor="contact-email">
                    <span className="ct-field__label">Email address <i>*</i></span>
                    <input {...fieldProps("email")} type="email" autoComplete="email" />
                    {fieldError("email")}
                  </label>

                  <label className="ct-field" htmlFor="contact-country">
                    <span className="ct-field__label">
                      Country / region <em>Optional</em>
                    </span>
                    <input {...fieldProps("country")} autoComplete="country-name" />
                  </label>
                </div>

                <fieldset
                  className="ct-field ct-interests"
                  aria-invalid={Boolean(fieldErrors.partnership)}
                  aria-describedby={
                    fieldErrors.partnership ? "contact-partnership-error" : undefined
                  }
                >
                  <legend className="ct-field__label">
                    What are you exploring? <i>*</i>
                  </legend>

                  <div className="ct-interests__options">
                    {interests.map((option) => (
                      <label
                        key={option}
                        className={form.partnership === option ? "is-selected" : ""}
                      >
                        <input
                          type="radio"
                          name="partnership"
                          value={option}
                          checked={form.partnership === option}
                          onChange={update}
                        />
                        {option}
                      </label>
                    ))}
                  </div>

                  {fieldError("partnership")}
                </fieldset>

                <label className="ct-field" htmlFor="contact-message">
                  <span className="ct-field__label">Tell us more <i>*</i></span>
                  <textarea
                    {...fieldProps("message")}
                    rows="6"
                    placeholder="Share the opportunity, priority area, institutions or organizations involved, and what you hope to achieve."
                  />
                  {fieldError("message")}
                </label>

                <button
                  className="ct-button ct-button--gold ct-form__submit"
                  type="submit"
                  disabled={submitting}
                >
                  {submitting ? "Sending..." : "Send partnership inquiry"}
                  {submitting ? null : <Send size={17} aria-hidden="true" />}
                </button>

              </form>

            )}

          </div>

        </div>

      </section>


      {/* ======================================================
          OTHER ROUTES
      ====================================================== */}

      <section className="ct-routes">
        <div className="ct-container">
          <div className="ct-routes__card">
            <h2>Looking for something else?</h2>

            <ul>
              {otherRoutes.map(({ icon: Icon, title, to }) => (
                <li key={to}>
                  <Link to={to}>
                    <span className="ct-routes__icon">
                      <Icon size={20} aria-hidden="true" />
                    </span>
                    {title}
                    <ArrowRight size={18} aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

    </main>
  );
}
