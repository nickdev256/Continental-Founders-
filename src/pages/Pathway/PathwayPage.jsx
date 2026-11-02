import { useEffect, useRef, useState } from "react";

import {
  ArrowRight,
  Check,
  CheckCircle2,
  Download,
  Plus,
} from "lucide-react";

import { Link } from "react-router-dom";

import {
  COMMUNITY_OPTIONS,
  PATHWAY_LIST,
  PATHWAYS,
  SHARED_FAQ,
} from "./pathways";

import "./PathwayPage.css";

/* ============================================================
   FELLOWSHIP PATHWAY PAGE
   One layout for Genesis, Ascend and Horizon. Each page passes
   its key; the words come from pathways.js.
============================================================ */

export default function PathwayPage({ pathway }) {
  const content = PATHWAYS[pathway];
  const current = PATHWAY_LIST.find((item) => item.key === pathway);
  const [submitted, setSubmitted] = useState(false);

  // Builds a text file in the browser. Nothing is sent anywhere:
  // the form says so, and the prototype note explains why.
  function handleSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;

    if (!form.reportValidity()) return;

    const formData = new FormData(form);

    const lines = [content.form.draftTitle, "DRAFT ONLY — NOT SUBMITTED", ""];

    for (const [key, value] of formData.entries()) {
      if (key === "ack") continue;

      lines.push(`${key.replaceAll("_", " ").toUpperCase()}: ${value}`);
    }

    const blob = new Blob([lines.join("\n")], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = content.form.fileName;

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.setTimeout(() => URL.revokeObjectURL(url), 1000);

    setSubmitted(true);
  }

  // Reveal sections as they scroll into view. Anything already
  // above the fold (or skipped by a fast jump) is shown at once.
  const pageRef = useRef(null);

  useEffect(() => {
    const root = pageRef.current;

    setSubmitted(false);

    if (
      !root ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return undefined;
    }

    root.classList.add("pw-page--reveal");

    let pending = [...root.querySelectorAll("[data-reveal]")];
    let frame = 0;

    // Moving between pathways reuses this page, so start fresh.
    pending.forEach((element) => element.classList.remove("is-visible"));

    const reveal = () => {
      frame = 0;
      const limit = window.innerHeight * 0.92;

      pending = pending.filter((element) => {
        if (element.getBoundingClientRect().top < limit) {
          element.classList.add("is-visible");
          return false;
        }

        return true;
      });

      if (!pending.length) {
        window.removeEventListener("scroll", schedule);
        window.removeEventListener("resize", schedule);
      }
    };

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(reveal);
    };

    reveal();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [pathway]);

  const id = (name) => `${pathway}-${name}`;
  const { hero } = content;

  return (
    <main className={`pw-page pw-page--${pathway}`} ref={pageRef}>

      {/* ======================================================
          PATHWAY BAR
      ====================================================== */}

      <div className="pw-bar">
        <div className="pw-container pw-bar__inner">

          <nav className="pw-bar__links" aria-label="Fellowship pathways">
            {PATHWAY_LIST.map((item) => (
              <Link
                key={item.key}
                to={item.path}
                className={item.key === pathway ? "is-active" : ""}
                aria-current={item.key === pathway ? "page" : undefined}
              >
                {item.name.charAt(0) + item.name.slice(1).toLowerCase()}
              </Link>
            ))}
          </nav>

          <a className="pw-button pw-button--gold pw-bar__cta" href="#interest">
            Express interest
            <ArrowRight size={16} aria-hidden="true" />
          </a>

        </div>
      </div>


      {/* ======================================================
          HERO
      ====================================================== */}

      <section className="pw-hero" id="top">

        <div className="pw-hero__media" aria-hidden="true">
          <img src={current.image} alt="" fetchPriority="high" />
        </div>

        <div className="pw-container pw-hero__inner">

          <div className="pw-hero__content">
            <span className="pw-hero__eyebrow">
              <b>{hero.number}</b>
              {hero.eyebrow}
            </span>

            <h1>
              <span>{hero.lines[0]}</span>{" "}
              <em>{hero.lines[1]}</em>
            </h1>

            <p>{hero.text}</p>

            <div className="pw-hero__actions">
              <a className="pw-button pw-button--gold" href="#interest">
                Express my interest
                <ArrowRight size={18} aria-hidden="true" />
              </a>

              <a className="pw-button pw-button--ghost" href="#pathways">
                Explore all pathways
              </a>
            </div>
          </div>

          <aside className="pw-hero__card">
            <span className="pw-hero__card-label">{hero.cardLabel}</span>

            <h2>
              {current.name}
              <br />
              {current.tagline}
            </h2>

            <p>One Cohort. Two Continents. Three Pathways. One Shared Future.</p>

            <span className="pw-pill">Africa + U.S. African diaspora</span>
          </aside>

        </div>

      </section>


      {/* ======================================================
          DOES THIS SOUND LIKE YOU?
      ====================================================== */}

      <section className="pw-section">
        <div className="pw-container pw-split">

          <header className="pw-heading" data-reveal>
            <span className="pw-eyebrow">Recognize yourself</span>
            <h2>Does this sound like you?</h2>
            <p>
              You don't have to decide your final Fellowship placement
              before expressing interest.
            </p>
          </header>

          <ul className="pw-fit" data-reveal>
            {content.fit.map((item) => (
              <li key={item}>
                <span className="pw-fit__check">
                  <Check size={16} strokeWidth={3} aria-hidden="true" />
                </span>
                {item}
              </li>
            ))}
          </ul>

        </div>
      </section>


      {/* ======================================================
          CHALLENGES
      ====================================================== */}

      <section className="pw-section pw-section--soft">
        <div className="pw-container">

          <header className="pw-heading pw-heading--center" data-reveal>
            <span className="pw-eyebrow">Your challenges</span>
            <h2>What we help you work through</h2>
          </header>

          <ul className="pw-challenges" data-reveal>
            {content.challenges.map(({ icon: Icon, title, text }) => (
              <li key={title}>
                <div className="pw-challenges__problem">
                  <span className="pw-icon">
                    <Icon size={20} aria-hidden="true" />
                  </span>
                  <strong>{title}</strong>
                </div>

                <p>
                  <ArrowRight size={16} aria-hidden="true" />
                  {text}
                </p>
              </li>
            ))}
          </ul>

        </div>
      </section>


      {/* ======================================================
          YOUR VALUE
      ====================================================== */}

      <section className="pw-section">
        <div className="pw-container">

          <header className="pw-heading pw-heading--wide" data-reveal>
            <span className="pw-eyebrow">Your value</span>
            <h2>{content.valueTitle}</h2>
            <p>
              Receive stage-appropriate development while collaborating
              with founders at different stages across Africa and the
              U.S. African diaspora. The aim is stronger business
              capability and relationships that may grow into future
              partnerships and trade.
            </p>
          </header>

          <ul className="pw-value" data-reveal>
            {content.value.map(({ icon: Icon, title, text }, index) => (
              <li key={title} className={`pw-tone--${["gold", "navy", "blue"][index % 3]}`}>
                <span className="pw-icon">
                  <Icon size={22} aria-hidden="true" />
                </span>
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ul>

        </div>
      </section>


      {/* ======================================================
          THREE PATHWAYS
      ====================================================== */}

      <section className="pw-section pw-section--soft" id="pathways">
        <div className="pw-container">

          <header className="pw-heading pw-heading--wide" data-reveal>
            <span className="pw-eyebrow">Our difference</span>
            <h2>Three pathways. One shared cohort.</h2>
            <p>
              Genesis, Ascend, and Horizon are not isolated programs.
              Founders learn together, exchange experience, and build
              lasting cross-continental professional relationships, with
              pathway-specific learning matched to their business needs.
            </p>
          </header>

          <ul className="pw-paths" data-reveal>
            {PATHWAY_LIST.map((item) => {
              const isCurrent = item.key === pathway;

              return (
                <li key={item.key} className={`pw-path pw-path--${item.key}`}>
                  <Link
                    to={item.path}
                    aria-current={isCurrent ? "page" : undefined}
                    className={isCurrent ? "is-current" : ""}
                  >
                    <img src={item.image} alt={item.imageAlt} loading="lazy" />

                    <span className="pw-path__body">
                      <small>{item.stage}</small>
                      <strong>{item.name}</strong>
                      <span>{item.tagline}</span>
                    </span>

                    {isCurrent && (
                      <span className="pw-path__here">You are here</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="pw-band" data-reveal>
            <h2>Connecting Talent. Building Across Continents.</h2>
            <p>
              Build the relationships today that may become tomorrow's
              collaborations, partnerships, and international trade
              opportunities.
            </p>
          </div>

        </div>
      </section>


      {/* ======================================================
          EXPRESSION OF INTEREST
      ====================================================== */}

      <section className="pw-section pw-interest" id="interest">
        <div className="pw-container pw-split pw-split--form">

          <header className="pw-heading pw-interest__intro" data-reveal>
            <span className="pw-eyebrow">Next step</span>
            <h2>Express your interest in {content.name}</h2>
            <p>
              Tell us where you are today and what support would help.
              This is an expression-of-interest draft, not an application
              submission, admissions decision, or final pathway placement.
            </p>
          </header>

          <div className="pw-formcard">
            <form onSubmit={handleSubmit}>

              <div className="pw-form__row">
                <div className="pw-field">
                  <label htmlFor={id("fullname")}>Full name <i>*</i></label>
                  <input
                    autoComplete="name"
                    id={id("fullname")}
                    name="fullname"
                    required
                  />
                </div>

                <div className="pw-field">
                  <label htmlFor={id("email")}>Email address <i>*</i></label>
                  <input
                    autoComplete="email"
                    id={id("email")}
                    name="email"
                    type="email"
                    required
                  />
                </div>

                <div className="pw-field">
                  <label htmlFor={id("community")}>Founder community <i>*</i></label>
                  <select
                    id={id("community")}
                    name="community"
                    defaultValue=""
                    required
                  >
                    <option value="" disabled>
                      Select one
                    </option>
                    {COMMUNITY_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pw-field">
                  <label htmlFor={id("location")}>City and country <i>*</i></label>
                  <input
                    id={id("location")}
                    name="location"
                    placeholder="e.g. Accra, Ghana or Atlanta, USA"
                    required
                  />
                </div>
              </div>

              {content.form.questions.map(({ name, label, placeholder }) => (
                <div className="pw-field" key={name}>
                  <label htmlFor={id(name)}>{label}</label>
                  <textarea id={id(name)} name={name} placeholder={placeholder} />
                </div>
              ))}

              <label className="pw-check" htmlFor={id("unsure")}>
                <input id={id("unsure")} name="unsure" type="checkbox" value="yes" />
                <span>
                  I'm not sure this is my best pathway. Please help me
                  find my lane.
                </span>
              </label>

              <label className="pw-check" htmlFor={id("ack")}>
                <input id={id("ack")} name="ack" type="checkbox" required />
                <span>
                  I understand this page prepares a local draft only.
                  No information is transmitted to Continental Founders,
                  and this is not an admission decision.
                </span>
              </label>

              <button className="pw-button pw-button--gold pw-form__submit" type="submit">
                Download my interest draft
                <Download size={18} aria-hidden="true" />
              </button>

              {submitted && (
                <div className="pw-toast" role="status">
                  <CheckCircle2 size={18} aria-hidden="true" />
                  Your draft has been downloaded as a text file. It has
                  not been submitted.
                </div>
              )}

              <p className="pw-note">
                Prototype only. A public launch requires an approved
                privacy notice, secure form endpoint, consent record,
                accessible confirmation process, and human admissions
                review.
              </p>

            </form>
          </div>

        </div>
      </section>


      {/* ======================================================
          FAQ
      ====================================================== */}

      <section className="pw-section pw-section--soft">
        <div className="pw-container pw-split">

          <header className="pw-heading" data-reveal>
            <span className="pw-eyebrow">Good to know</span>
            <h2>Frequently asked questions</h2>
          </header>

          <div className="pw-faq" data-reveal>
            {[...content.faqs, SHARED_FAQ].map(({ q, a }) => (
              <details key={q}>
                <summary>
                  {q}
                  <Plus size={20} aria-hidden="true" />
                </summary>
                <p>{a}</p>
              </details>
            ))}
          </div>

        </div>
      </section>


      {/* ======================================================
          FINAL CTA
      ====================================================== */}

      <section className="pw-cta">
        <div className="pw-container">
          <div className="pw-cta__card" data-reveal>

            <img src={current.image} alt="" loading="lazy" />

            <div className="pw-cta__content">
              <span className="pw-eyebrow pw-eyebrow--light">Your future network</span>

              <h2>Your business journey doesn't have to happen in isolation.</h2>

              <p>
                Join a community of entrepreneurs building businesses and
                meaningful relationships across two continents.
              </p>

              <a className="pw-button pw-button--gold" href="#interest">
                Explore {content.name}
                <ArrowRight size={18} aria-hidden="true" />
              </a>
            </div>

          </div>
        </div>
      </section>


      {/* ======================================================
          CONCEPT NOTE (was this page's own footer)
      ====================================================== */}

      <aside className="pw-concept">
        <div className="pw-container pw-concept__inner">
          <strong>CONTINENTAL FOUNDERS™</strong>
          <p>Connecting Talent. Building Across Continents.</p>
          <p>
            Website concept for review. Cohort dates, fees, delivery,
            admission criteria, and funding arrangements remain to be
            confirmed.
          </p>
        </div>
      </aside>

    </main>
  );
}
