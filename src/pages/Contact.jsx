import React, { useState } from "react";
import { Mail, ArrowUpRight, CheckCircle2 } from "lucide-react";
import "./Contact.css";

const initialForm = {
  name: "",
  organization: "",
  email: "",
  country: "",
  partnership: "",
  message: ""
};

export default function Contact() {
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);

  function update(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function submit(event) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <>
      <section className="page-hero">
        <div className="container page-hero__inner">
          <div>
            <span className="eyebrow eyebrow--light">Contact</span>
            <h1>Let's build something useful together.</h1>
          </div>
          <div className="page-hero__aside">
            <p>
              Whether you represent a university, research institution, foundation,
              nonprofit, or company, we would like to understand what you are exploring.
            </p>
          </div>
        </div>
      </section>

      <section className="section contact-page">
        <div className="container contact-grid">
          <div className="contact-info">
            <span className="eyebrow">Start here</span>
            <h2 className="display">Tell us what you're trying to build.</h2>
            <p>
              A useful first conversation can be as simple as explaining your organization,
              the opportunity you see, and the type of relationship you want to explore.
            </p>

            <div className="contact-detail">
              <Mail size={18} />
              <div>
                <span>Email</span>
                <a href="mailto:partnerships@continentalfounders.org">partnerships@continentalfounders.org</a>
              </div>
            </div>

            <div className="contact-detail">
              <ArrowUpRight size={18} />
              <div>
                <span>Geographic focus</span>
                <p>United States & Africa</p>
              </div>
            </div>
          </div>

          <div className="contact-form-wrap">
            {submitted ? (
              <div className="contact-success">
                <CheckCircle2 size={38} />
                <h3>Thank you.</h3>
                <p>Your message has been captured in this demo workflow. Connect the form to your preferred email or CRM before production launch.</p>
                <button onClick={() => { setSubmitted(false); setForm(initialForm); }}>Send another message</button>
              </div>
            ) : (
              <form className="contact-form" onSubmit={submit}>
                <div className="form-row">
                  <label>
                    Your name
                    <input required name="name" value={form.name} onChange={update} />
                  </label>
                  <label>
                    Organization
                    <input required name="organization" value={form.organization} onChange={update} />
                  </label>
                </div>

                <div className="form-row">
                  <label>
                    Email address
                    <input required type="email" name="email" value={form.email} onChange={update} />
                  </label>
                  <label>
                    Country / region
                    <input name="country" value={form.country} onChange={update} />
                  </label>
                </div>

                <label>
                  What are you exploring?
                  <select required name="partnership" value={form.partnership} onChange={update}>
                    <option value="">Select one</option>
                    <option>University partnership</option>
                    <option>Research / knowledge exchange</option>
                    <option>Strategic partnership</option>
                    <option>Program / convening</option>
                    <option>Other</option>
                  </select>
                </label>

                <label>
                  Tell us more
                  <textarea required name="message" rows="7" value={form.message} onChange={update} placeholder="Share the opportunity, priority area, institutions or organizations involved, and what you hope to achieve." />
                </label>

                <button className="contact-submit" type="submit">
                  Send partnership inquiry <ArrowUpRight size={17} />
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}