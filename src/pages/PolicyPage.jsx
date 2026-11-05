import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";
import "./SimplePage.css";

// Same address as the Contact page
const CONTACT_EMAIL = "continentalfounders.info@gmail.com";

// Placeholder pages for the footer's policy links.
// Replace the notice with the approved policy text when it is ready.
const POLICIES = {
  privacy: {
    eyebrow: "Privacy",
    title: "Privacy policy",
    name: "privacy policy",
    lead: "How Continental Founders collects, uses and protects personal information.",
    topic: "privacy",
  },
  terms: {
    eyebrow: "Terms",
    title: "Terms of use",
    name: "terms of use",
    lead: "The terms that apply when you use the Continental Founders website.",
    topic: "the terms of use",
  },
  accessibility: {
    eyebrow: "Accessibility",
    title: "Accessibility statement",
    name: "accessibility statement",
    lead: "Our commitment to a website that everyone can use.",
    topic: "accessibility",
  },
};

export default function PolicyPage({ policy }) {
  const page = POLICIES[policy];

  return (
    <main className="spg-page">
      <section className="spg-hero">
        <div className="spg-container">
          <span className="spg-eyebrow">{page.eyebrow}</span>

          <h1>{page.title}</h1>

          <p className="spg-hero__lead">{page.lead}</p>
        </div>
      </section>

      <section className="spg-body">
        <div className="spg-container">
          <div className="spg-notice">
            <h2>This page is being prepared.</h2>

            <p>
              We are finalising our full {page.name} and will publish
              it here soon. If you have a question about{" "}
              {page.topic} in the meantime, email us at{" "}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>{" "}
              and our team will respond.
            </p>
          </div>

          <div className="spg-actions">
            <Link
              className="spg-button spg-button--gold"
              to="/"
            >
              <ArrowLeft size={18} aria-hidden="true" />
              Return home
            </Link>

            <a
              className="spg-button spg-button--outline"
              href={`mailto:${CONTACT_EMAIL}`}
            >
              <Mail size={18} aria-hidden="true" />
              Email our team
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
