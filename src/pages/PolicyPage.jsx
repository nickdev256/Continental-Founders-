import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Ban, Cookie, Mail, ShieldCheck } from "lucide-react";
import "./SimplePage.css";

// Same address as the Contact page
const CONTACT_EMAIL = "continentalfounders.info@gmail.com";

// A real photo from US Africa Business Week, under the navy tint.
const HERO_PHOTO = "/assets/gallery/DZ9A0696.webp";

const MailLink = () => <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;

/* ============================================================
   PRIVACY POLICY
   Written from what the website actually does (forms, storage,
   outside services). Have it reviewed before relying on it legally,
   and update "updated" whenever the text changes.
============================================================ */

const PRIVACY = {
  eyebrow: "Privacy",
  title: "Privacy policy",
  lead: "How Continental Founders collects, uses and protects personal information.",
  updated: "15 November 2026",
  summary: [
    {
      icon: ShieldCheck,
      title: "Only what you send us",
      text: "We collect the information you choose to share through our forms.",
    },
    {
      icon: Ban,
      title: "Never sold",
      text: "We don't sell your personal information or use it for advertising.",
    },
    {
      icon: Cookie,
      title: "No tracking cookies",
      text: "This website doesn't use advertising or analytics cookies.",
    },
  ],
  sections: [
    {
      id: "who-we-are",
      title: "Who we are",
      body: (
        <p>
          Continental Founders™ is a nonprofit organization that connects
          founders, universities, businesses and institutions across Africa
          and the United States. This policy explains how we handle personal
          information collected through our website,
          www.continentalfounders.org.
        </p>
      ),
    },
    {
      id: "information-we-collect",
      title: "Information we collect",
      body: (
        <>
          <p>We only collect information you give us through the website:</p>
          <ul>
            <li>
              <strong>Contact form:</strong> your name, organization, email
              address, country or region (optional), the type of partnership
              you are exploring, and your message.
            </li>
            <li>
              <strong>Newsletter:</strong> your email address.
            </li>
            <li>
              <strong>CFCV fellowship applications:</strong> your contact
              details (name, email, phone, country and city), your background
              and skills, information about your venture and team, your goals
              and availability, and the CV or résumé you upload.
            </li>
          </ul>
          <p>
            We don't ask for payment details or government identification
            numbers on this website.
          </p>
        </>
      ),
    },
    {
      id: "how-we-use-it",
      title: "How we use your information",
      body: (
        <ul>
          <li>To reply to your inquiry and arrange a conversation.</li>
          <li>To send the newsletter updates you signed up for.</li>
          <li>
            To review fellowship applications and run the admissions process,
            including assessments, interviews and track placement.
          </li>
          <li>To plan and improve our programs and events.</li>
          <li>To meet our legal obligations.</li>
        </ul>
      ),
    },
    {
      id: "sharing",
      title: "When we share information",
      body: (
        <>
          <p>We don't sell or rent your personal information. We only share it:</p>
          <ul>
            <li>
              with the people involved in reviewing your inquiry or
              application;
            </li>
            <li>
              with service providers that host our website and store form
              submissions on our behalf;
            </li>
            <li>when the law requires it; or</li>
            <li>when you have asked us to.</li>
          </ul>
        </>
      ),
    },
    {
      id: "cookies",
      title: "Cookies and outside services",
      body: (
        <>
          <p>
            This website doesn't use advertising or analytics cookies. When you
            submit a fellowship application, your browser keeps a temporary
            reference for that session so the same application isn't sent
            twice. It is removed when you close the tab.
          </p>
          <p>
            Our fonts are loaded from Google Fonts, so your browser connects to
            Google's servers when a page loads. Links to LinkedIn, Instagram,
            Facebook, YouTube and Google Maps take you to those services, which
            have their own privacy policies.
          </p>
        </>
      ),
    },
    {
      id: "retention",
      title: "How long we keep it",
      body: (
        <p>
          We keep personal information only as long as we need it for the
          purpose you shared it for: to handle your inquiry, to run the
          admissions cycle you applied to, or until you unsubscribe from the
          newsletter. After that we delete it, unless the law requires us to
          keep it longer.
        </p>
      ),
    },
    {
      id: "security",
      title: "Keeping it secure",
      body: (
        <p>
          The website uses secure (HTTPS) connections, and access to
          submissions is limited to authorised team members who sign in with
          a one-time verification code. No method of storing or sending
          information online is completely secure, but we work to protect
          what you share with us.
        </p>
      ),
    },
    {
      id: "your-rights",
      title: "Your choices and rights",
      body: (
        <>
          <p>You can ask us at any time to:</p>
          <ul>
            <li>tell you what personal information we hold about you;</li>
            <li>correct information that is wrong or out of date;</li>
            <li>delete your information; or</li>
            <li>stop sending you newsletter updates.</li>
          </ul>
          <p>
            Email <MailLink /> and we will respond. Depending on where you live,
            you may have further rights under local data protection law.
          </p>
        </>
      ),
    },
    {
      id: "children",
      title: "Children",
      body: (
        <p>
          Our website and programs are intended for adults. We don't knowingly
          collect personal information from children under 16. If you believe
          a child has sent us information, please contact us and we will
          delete it.
        </p>
      ),
    },
    {
      id: "changes",
      title: "Changes to this policy",
      body: (
        <p>
          We may update this policy as our programs and website change. When
          we do, we will change the date at the top of this page.
        </p>
      ),
    },
    {
      id: "contact",
      title: "Contact us",
      body: (
        <p>
          Questions about this policy or your personal information? Email us
          at <MailLink />.
        </p>
      ),
    },
  ],
};

/* ============================================================
   PAGES STILL BEING WRITTEN
============================================================ */

const PLACEHOLDERS = {
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

/* ============================================================
   PAGE
============================================================ */

function Hero({ page }) {
  return (
    <section className="spg-hero">
      <div className="spg-hero__media" aria-hidden="true">
        <img src={HERO_PHOTO} alt="" fetchPriority="high" />
      </div>

      <div className="spg-container">
        <span className="spg-eyebrow">{page.eyebrow}</span>
        <h1>{page.title}</h1>
        <p className="spg-hero__lead">{page.lead}</p>
        {page.updated && (
          <p className="spg-hero__meta">Last updated {page.updated}</p>
        )}
      </div>
    </section>
  );
}

// Highlights the section currently on screen in the contents list.
function useActiveSection(ids) {
  const [active, setActive] = useState(ids[0]);

  useEffect(() => {
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-25% 0px -65% 0px" }
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [ids]);

  return active;
}

function FullPolicy({ page }) {
  const ids = page.sections.map((section) => section.id);
  const active = useActiveSection(ids);

  return (
    <main className="spg-page">
      <Hero page={page} />

      <section className="spg-body spg-policy">
        <div className="spg-container">
          <ul className="spg-summary">
            {page.summary.map(({ icon: Icon, title, text }) => (
              <li key={title}>
                <span className="spg-summary__icon">
                  <Icon size={20} aria-hidden="true" />
                </span>
                <strong>{title}</strong>
                <span>{text}</span>
              </li>
            ))}
          </ul>

          <div className="spg-policy__layout">
            <nav className="spg-toc" aria-label="On this page">
              <span className="spg-toc__title">On this page</span>
              <ol>
                {page.sections.map((section, index) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className={active === section.id ? "is-active" : undefined}
                      aria-current={active === section.id ? "true" : undefined}
                    >
                      <span aria-hidden="true">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {section.title}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>

            <article className="spg-article">
              {page.sections.map((section, index) => (
                <section key={section.id} id={section.id} className="spg-article__section">
                  <h2>
                    <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                    {section.title}
                  </h2>
                  {section.body}
                </section>
              ))}

              <div className="spg-actions">
                <a className="spg-button spg-button--gold" href={`mailto:${CONTACT_EMAIL}`}>
                  <Mail size={18} aria-hidden="true" />
                  Email our team
                </a>

                <Link className="spg-button spg-button--outline" to="/">
                  <ArrowLeft size={18} aria-hidden="true" />
                  Return home
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}

function Placeholder({ page }) {
  return (
    <main className="spg-page">
      <Hero page={page} />

      <section className="spg-body">
        <div className="spg-container">
          <div className="spg-notice">
            <h2>This page is being prepared.</h2>

            <p>
              We are finalising our full {page.name} and will publish
              it here soon. If you have a question about{" "}
              {page.topic} in the meantime, email us at <MailLink />{" "}
              and our team will respond.
            </p>
          </div>

          <div className="spg-actions">
            <Link className="spg-button spg-button--gold" to="/">
              <ArrowLeft size={18} aria-hidden="true" />
              Return home
            </Link>

            <a className="spg-button spg-button--outline" href={`mailto:${CONTACT_EMAIL}`}>
              <Mail size={18} aria-hidden="true" />
              Email our team
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function PolicyPage({ policy }) {
  if (policy === "privacy") return <FullPolicy page={PRIVACY} />;
  return <Placeholder page={PLACEHOLDERS[policy]} />;
}
