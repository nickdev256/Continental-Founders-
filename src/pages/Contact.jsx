import React, { useState } from "react";

import {
  Mail,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import "./Contact.css";

const initialForm = {
  name: "",
  organization: "",
  email: "",
  country: "",
  partnership: "",
  message: "",
};

export default function Contact() {
  const [form, setForm] = useState(initialForm);

  const [submitted, setSubmitted] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  function update(event) {
    const {
      name,
      value,
    } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  }

  async function submit(event) {
    event.preventDefault();

    setSubmitting(true);
    setError("");

    try {
      const response = await fetch(
        `${
          import.meta.env.VITE_API_URL ||
          "http://localhost:5000"
        }/api/contact`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            name: form.name,
            organization:
              form.organization,
            email: form.email,
            country: form.country,
            partnership:
              form.partnership,
            message: form.message,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to send your inquiry."
        );
      }

      setSubmitted(true);
      setForm(initialForm);
    } catch (error) {
      console.error(
        "Contact submission error:",
        error
      );

      setError(
        error.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <section className="page-hero">
        <div className="container page-hero__inner">
          <div>
            <span className="eyebrow eyebrow--light">
              Contact
            </span>

            <h1>
              Let's build something useful
              together.
            </h1>
          </div>

          <div className="page-hero__aside">
            <p>
              Whether you represent a
              university, research
              institution, foundation,
              nonprofit, or company, we
              would like to understand
              what you are exploring.
            </p>
          </div>
        </div>
      </section>

      <section className="section contact-page">
        <div className="container contact-grid">

          <div className="contact-info">

            <span className="eyebrow">
              Start here
            </span>

            <h2 className="display">
              Tell us what you're trying
              to build.
            </h2>

            <p>
              A useful first conversation
              can be as simple as
              explaining your
              organization, the
              opportunity you see, and
              the type of relationship
              you want to explore.
            </p>

            <div className="contact-detail">

              <Mail size={18} />

              <div>
                <span>Email</span>

                <a href="mailto:continentalfounders.info@gmail.com">
                  continentalfounders.info@gmail.com
                </a>
              </div>

            </div>

            <div className="contact-detail">

              <ArrowUpRight
                size={18}
              />

              <div>
                <span>
                  Geographic focus
                </span>

                <p>
                  United States & Africa
                </p>
              </div>

            </div>
          </div>

          <div className="contact-form-wrap">

            {submitted ? (

              <div className="contact-success">

                <CheckCircle2
                  size={38}
                />

                <h3>
                  Thank you.
                </h3>

                <p>
                  Your partnership inquiry
                  has been submitted
                  successfully. Our team
                  will review it and get
                  back to you.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setSubmitted(false);
                    setForm(
                      initialForm
                    );
                    setError("");
                  }}
                >
                  Send another message
                </button>

              </div>

            ) : (

              <form
                className="contact-form"
                onSubmit={submit}
              >

                {error && (
                  <div className="contact-error">

                    <AlertCircle
                      size={18}
                    />

                    <span>
                      {error}
                    </span>

                  </div>
                )}

                <div className="form-row">

                  <label>
                    Your name

                    <input
                      required
                      name="name"
                      value={form.name}
                      onChange={update}
                    />
                  </label>

                  <label>
                    Organization

                    <input
                      required
                      name="organization"
                      value={
                        form.organization
                      }
                      onChange={update}
                    />
                  </label>

                </div>

                <div className="form-row">

                  <label>
                    Email address

                    <input
                      required
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={update}
                    />
                  </label>

                  <label>
                    Country / region

                    <input
                      name="country"
                      value={
                        form.country
                      }
                      onChange={update}
                    />
                  </label>

                </div>

                <label>
                  What are you exploring?

                  <select
                    required
                    name="partnership"
                    value={
                      form.partnership
                    }
                    onChange={update}
                  >
                    <option value="">
                      Select one
                    </option>

                    <option value="University partnership">
                      University
                      partnership
                    </option>

                    <option value="Research / knowledge exchange">
                      Research /
                      knowledge exchange
                    </option>

                    <option value="Strategic partnership">
                      Strategic
                      partnership
                    </option>

                    <option value="Program / convening">
                      Program /
                      convening
                    </option>

                    <option value="Other">
                      Other
                    </option>
                  </select>
                </label>

                <label>
                  Tell us more

                  <textarea
                    required
                    name="message"
                    rows="7"
                    value={
                      form.message
                    }
                    onChange={update}
                    placeholder="Share the opportunity, priority area, institutions or organizations involved, and what you hope to achieve."
                  />
                </label>

                <button
                  className="contact-submit"
                  type="submit"
                  disabled={submitting}
                >

                  {submitting
                    ? "Sending..."
                    : "Send partnership inquiry"}

                  {!submitting && (
                    <ArrowUpRight
                      size={17}
                    />
                  )}

                </button>

              </form>

            )}

          </div>

        </div>
      </section>
    </>
  );
}