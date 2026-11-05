import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";

import {
  ArrowDown,
  ArrowRight,
  Building2,
  HelpCircle,
  Route,
  Sprout,
  Users,
} from "lucide-react";

import "./OurModel.css";


/* ============================================================
   CONTENT
============================================================ */

const heroThemes = ["People", "Partnerships", "Opportunity", "Impact"];

const stages = [
  ["Discover", "Understand institutional priorities, strengths, needs, and the opportunity for collaboration."],
  ["Align", "Bring the right stakeholders together around shared objectives and realistic expectations."],
  ["Design", "Shape the partnership architecture, roles, pathways, and initial areas of activity."],
  ["Activate", "Move from planning to practical programs, conversations, exchanges, and collaboration."],
  ["Learn", "Review what is working, what is changing, and where the relationship can create more value."],
];

const designQuestions = [
  "What does each institution want to achieve?",
  "What strengths can each bring?",
  "Who needs to be involved?",
  "What can be done now, and what needs more groundwork?",
];

const lenses = [
  {
    icon: Building2,
    tone: "gold",
    title: "Institutional fit",
    text: "We consider whether the relationship aligns with real priorities, capabilities, and institutional interests.",
  },
  {
    icon: Users,
    tone: "blue",
    title: "People & trust",
    text: "The quality of the people involved shapes whether a partnership can survive beyond the first meeting.",
  },
  {
    icon: Route,
    tone: "navy",
    title: "Practical pathways",
    text: "A strong partnership has a next step: a program, conversation, research connection, exchange, or shared initiative.",
  },
  {
    icon: Sprout,
    tone: "gold",
    title: "Sustainability",
    text: "We encourage relationships that can mature through stewardship, learning, and realistic resourcing.",
  },
];

const number = (index) => String(index + 1).padStart(2, "0");


/* ============================================================
   SCROLL REVEAL
   Content stays visible if scripts fail or motion is reduced.
============================================================ */

function useReveal(ref) {
  useEffect(() => {
    const root = ref.current;

    if (
      !root ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return undefined;
    }

    root.classList.add("om-page--reveal");

    let pending = [...root.querySelectorAll("[data-reveal]")];
    let frame = 0;

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
  }, [ref]);
}


/* ============================================================
   OUR MODEL
============================================================ */

export default function OurModel() {
  const pageRef = useRef(null);

  useReveal(pageRef);

  return (
    <main className="om-page" ref={pageRef}>

      {/* ======================================================
          HERO
      ====================================================== */}

      <section className="om-hero">

        <div className="om-hero__media" aria-hidden="true">
          <img src="/assets/hero.webp" alt="" fetchPriority="high" />
        </div>

        <div className="om-container om-hero__inner">

          <span className="om-eyebrow om-eyebrow--light">Our model</span>

          <h1>
            From introduction to institutional <em>collaboration.</em>
          </h1>

          <p className="om-hero__lead">
            A partnership is not a single event. It is a process
            of discovery, alignment, design, activation, and
            learning.
          </p>

          <ul className="om-hero__themes" aria-label="What our model is built on">
            {heroThemes.map((theme) => (
              <li key={theme}>{theme}</li>
            ))}
          </ul>

          <div className="om-hero__footer">
            <a href="#om-pathway" className="om-button om-button--gold">
              See the five stages
              <ArrowDown size={18} aria-hidden="true" />
            </a>

            <p className="om-hero__statement">
              A stronger Africa. A more connected world.
            </p>
          </div>

        </div>

      </section>


      {/* ======================================================
          HOW WE THINK
      ====================================================== */}

      <section className="om-section om-intro">

        <div className="om-container om-split">

          <figure className="om-photo om-photo--portrait" data-reveal>
            <img
              src="/assets/n.webp"
              alt="Students and university leaders building meaningful relationships"
              loading="lazy"
            />
          </figure>

          <div className="om-split__content" data-reveal>

            <span className="om-eyebrow">How we think</span>

            <h2>
              We focus on the architecture behind meaningful
              relationships.
            </h2>

            <p className="om-lead">
              Our model gives partners a common language for moving
              from an initial point of connection to practical
              collaboration. It is structured enough to create clarity,
              while flexible enough to respect the context of each
              institution.
            </p>

            <p className="om-quote">
              Building relationships that create lasting opportunity.
            </p>

          </div>

        </div>

      </section>


      {/* ======================================================
          THE PATHWAY
      ====================================================== */}

      <section className="om-section om-pathway" id="om-pathway">

        <div className="om-container">

          <header className="om-heading om-heading--light" data-reveal>
            <span className="om-eyebrow om-eyebrow--light">The pathway</span>

            <h2>Five stages. One shared objective: useful collaboration.</h2>

            <p>
              Each engagement can move at a different pace. The sequence
              gives partners a way to understand what needs to happen next.
            </p>
          </header>

          <ol className="om-stages" data-reveal>
            {stages.map(([title, text], index) => (
              <li className="om-stage" key={title}>
                <span className="om-stage__number" aria-hidden="true">
                  {number(index)}
                </span>

                <h3>
                  <span className="om-visually-hidden">
                    Stage {index + 1}:{" "}
                  </span>
                  {title}
                </h3>

                <p>{text}</p>
              </li>
            ))}
          </ol>

        </div>

      </section>


      {/* ======================================================
          PARTNERSHIP DESIGN
      ====================================================== */}

      <section className="om-section om-design">

        <div className="om-container om-split om-split--reverse">

          <figure className="om-photo om-photo--wide" data-reveal>
            <img
              src="/assets/partnership-design.webp"
              alt="African founders and professionals collaborating on research, innovation, and partnership strategy"
              loading="lazy"
            />
          </figure>

          <div className="om-split__content" data-reveal>

            <span className="om-eyebrow">Partnership design</span>

            <h2>The right relationship starts with the right questions.</h2>

            <ul className="om-questions">
              {designQuestions.map((question) => (
                <li key={question}>
                  <HelpCircle size={20} aria-hidden="true" />
                  <span>{question}</span>
                </li>
              ))}
            </ul>

            <p className="om-lead">
              These questions help turn broad interest into a partnership
              that has a credible reason to exist and a practical path
              forward.
            </p>

          </div>

        </div>

      </section>


      {/* ======================================================
          FOUR LENSES
      ====================================================== */}

      <section className="om-section om-lenses">

        <div className="om-container">

          <header className="om-heading" data-reveal>
            <span className="om-eyebrow">Four lenses</span>

            <h2>What we look for before a partnership moves forward.</h2>

            <p>
              Strong relationships require more than shared interest. We
              consider alignment, trust, practical opportunity, and the
              potential for long-term value.
            </p>
          </header>

          <ul className="om-lenses__grid" data-reveal>
            {lenses.map(({ icon: Icon, tone, title, text }, index) => (
              <li className={`om-lens om-lens--${tone}`} key={title}>
                <div className="om-lens__top">
                  <span className="om-lens__icon">
                    <Icon size={24} aria-hidden="true" />
                  </span>
                  <span className="om-lens__number" aria-hidden="true">
                    {number(index)}
                  </span>
                </div>

                <h3>{title}</h3>

                <p>{text}</p>
              </li>
            ))}
          </ul>

        </div>

      </section>


      {/* ======================================================
          VENTURES
      ====================================================== */}

      <section className="om-section om-ventures">

        <div className="om-container om-ventures__grid">

          <div className="om-ventures__content" data-reveal>

            <span className="om-eyebrow">From potential to global opportunity</span>

            <h2>Meet the founders building what comes next</h2>

            <p className="om-lead">
              Continental Founders supports ambitious founders and
              emerging fellows by connecting them to knowledge,
              mentorship, university expertise, strategic
              relationships, markets, and pathways to opportunity.
            </p>

            <p>
              Our goal is to help promising founders strengthen their
              foundations, validate their ideas, expand their networks,
              access new markets, and position themselves for
              sustainable commercial growth.
            </p>

            <Link to="/ventures" className="om-button om-button--navy">
              Explore our Founders
              <ArrowRight size={18} aria-hidden="true" />
            </Link>

          </div>

          <aside className="om-purpose" data-reveal>

            <span className="om-eyebrow om-eyebrow--light">Our purpose</span>

            <strong className="om-purpose__title">
              Talent is everywhere.
              <span> Access is not.</span>
            </strong>

            <p>
              Continental Founders is building an ecosystem around
              founders and their ventures connecting talent with
              the people, institutions, markets, knowledge, and
              opportunities needed to grow.
            </p>

          </aside>

        </div>

      </section>


      {/* ======================================================
          BUILD WITH US
      ====================================================== */}

      <section className="om-section om-cta">

        <div className="om-container">

          <div className="om-cta__card" data-reveal>

            <div className="om-cta__content">

              <span className="om-eyebrow om-eyebrow--light">Build with us</span>

              <h2>
                Strong ecosystems are built through meaningful
                collaboration.
              </h2>

              <p>
                Whether you represent a university, investor, company,
                institution, sponsor, or strategic organization,
                Continental Founders creates pathways to work together
                around founders, innovation, and shared opportunity.
              </p>

              <Link to="/contact" className="om-button om-button--gold">
                Start a conversation
                <ArrowRight size={18} aria-hidden="true" />
              </Link>

            </div>

            <figure className="om-cta__photo">
              <img
                src="/assets/c.webp"
                alt="Building meaningful collaboration across communities"
                loading="lazy"
              />
            </figure>

          </div>

        </div>

      </section>

    </main>
  );
}
