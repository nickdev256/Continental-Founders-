import React, {
  useEffect,
  useRef,
} from "react";

import {
  ArrowRight,
  Building2,
  FileText,
  Globe2,
  Network,
  Quote,
  TrendingUp,
  Users,
} from "lucide-react";

import { Link } from "react-router-dom";

import "./GovernmentDevelopment.css";


/* ============================================================
   DATA
   Cards cycle through the site's gold, navy and blue accents.
============================================================ */

const engagementAreas = [
  {
    icon: FileText,
    title: "Policy Collaboration",
    text:
      "Engage around policies, frameworks, and enabling environments that strengthen entrepreneurship, innovation, and enterprise growth.",
    color: "gold",
  },
  {
    icon: Building2,
    title: "Program Funding",
    text:
      "Support programs and initiatives that strengthen founder development, innovation, commercial readiness, and economic participation.",
    color: "navy",
  },
  {
    icon: Network,
    title: "Market Access",
    text:
      "Create pathways into new markets through institutional, commercial, university, investor, and business networks.",
    color: "blue",
  },
  {
    icon: TrendingUp,
    title: "SME Development",
    text:
      "Support small and growing enterprises with knowledge, partnerships, market pathways, expertise, and growth opportunities.",
    color: "gold",
  },
];


const benefits = [
  {
    icon: Users,
    title: "Access Entrepreneurial Talent",
    color: "gold",
  },
  {
    icon: TrendingUp,
    title: "Support Enterprise Development",
    color: "navy",
  },
  {
    icon: Globe2,
    title: "Unlock Regional and Global Partnerships",
    color: "blue",
  },
];


const impactWords = [
  "People",
  "Ideas",
  "Partnerships",
  "Global Impact",
];


/* ============================================================
   PAGE
============================================================ */

export default function GovernmentDevelopment() {
  // Reveal sections as they scroll into view. Anything already
  // above the fold (or skipped by a fast jump) is shown at once.
  const pageRef = useRef(null);

  useEffect(() => {
    const root = pageRef.current;

    if (
      !root ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return undefined;
    }

    root.classList.add("gd-page--reveal");

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
  }, []);

  return (
    <main className="gd-page" ref={pageRef}>

      {/* ======================================================
          HERO
      ====================================================== */}

      <section className="gd-hero">

        <div className="gd-hero__media" aria-hidden="true">
          <img
            src="/assets/government/government-hero.webp"
            alt=""
            fetchPriority="high"
          />
        </div>

        <div className="gd-container gd-hero__inner">

          <div className="gd-hero__content">

            <span className="gd-eyebrow gd-eyebrow--light">
              Government & Development Institutions
            </span>

            <h1>
              <span>Public institutions.</span>{" "}
              <em>Real opportunity.</em>
            </h1>

            <p>
              Partnering with governments and development institutions
              to turn policy, programs, market access, and institutional
              resources into inclusive economic and commercial opportunity.
            </p>

            <div className="gd-hero__actions">
              <Link
                to="/contact"
                className="gd-button gd-button--gold"
              >
                Explore partnership
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </div>

          </div>

          <figure className="gd-hero__quote">
            <Quote size={26} aria-hidden="true" />

            <blockquote>
              When institutions and entrepreneurs move together,
              nations move forward.
            </blockquote>
          </figure>

        </div>

      </section>


      {/* Impact strip */}

      <div className="gd-strip" aria-hidden="true">
        <div className="gd-container gd-strip__inner">
          {impactWords.map((word) => (
            <span key={word}>{word}</span>
          ))}
        </div>
      </div>


      {/* ======================================================
          WHY PARTNER WITH US
      ====================================================== */}

      <section className="gd-section gd-bridge">

        <div className="gd-container gd-bridge__grid">

          <figure className="gd-bridge__visual" data-reveal>

            <div className="gd-bridge__main">
              <img
                src="/assets/government/institutional-meeting.webp"
                alt="Institutional leaders in discussion"
                loading="lazy"
              />
            </div>

            <div className="gd-bridge__secondary">
              <img
                src="/assets/government/government-building.webp"
                alt="Government institution building"
                loading="lazy"
              />
            </div>

          </figure>


          <div className="gd-bridge__content" data-reveal>

            <span className="gd-eyebrow">
              Why Partner With Us
            </span>

            <h2>A bridge between policy and possibility.</h2>

            <p>
              Continental Founders helps government and development
              institutions connect their priorities with high-potential
              founders, businesses, universities, and strategic partners —
              turning institutional ambition into practical pathways
              for enterprise and opportunity.
            </p>

            <ul className="gd-benefits">
              {benefits.map(({ icon: Icon, title, color }) => (
                <li
                  key={title}
                  className={`gd-benefit gd-tone--${color}`}
                >
                  <span className="gd-icon">
                    <Icon size={22} aria-hidden="true" />
                  </span>

                  <h3>{title}</h3>
                </li>
              ))}
            </ul>

          </div>

        </div>

      </section>


      {/* ======================================================
          ENGAGEMENT PATHWAYS
      ====================================================== */}

      <section className="gd-section gd-section--soft gd-pathways">

        <div className="gd-container">

          <header className="gd-heading gd-heading--split" data-reveal>
            <div>
              <span className="gd-eyebrow">How Institutions Can Engage</span>
              <h2>Multiple pathways for greater impact.</h2>
            </div>

            <p>
              We work with governments and development institutions
              across several key areas, with partnership models
              designed around institutional priorities and goals.
            </p>
          </header>

          <ul className="gd-pathways__grid" data-reveal>
            {engagementAreas.map(({ icon: Icon, title, text, color }, index) => (
              <li
                key={title}
                className={`gd-pathway gd-tone--${color}`}
              >
                <div className="gd-pathway__top">
                  <span className="gd-icon">
                    <Icon size={24} aria-hidden="true" />
                  </span>

                  <span className="gd-pathway__number">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ul>

          <div className="gd-pathways__action">
            <Link
              to="/strategic-partners"
              className="gd-button gd-button--navy"
            >
              See our partner plan
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>

        </div>

      </section>


      {/* ======================================================
          CASE STUDY
      ====================================================== */}

      <section className="gd-section gd-case">

        <div className="gd-container gd-case__grid">

          <figure className="gd-case__media" data-reveal>
            <img
              src="/assets/government/government-case-study.webp"
              alt="Urban commercial district representing national entrepreneurship development"
              loading="lazy"
            />
          </figure>

          <div className="gd-case__content" data-reveal>

            <span className="gd-eyebrow">In Focus</span>

            <h2>Partnering for National Entrepreneurship Strategies</h2>

            <p>
              Explore how institutional partners can align economic
              development priorities with founder support,
              enterprise growth, and stronger entrepreneurial ecosystems.
            </p>

            <Link
              to="/insights"
              className="gd-text-link"
            >
              Read the case study
              <ArrowRight size={16} aria-hidden="true" />
            </Link>

            <blockquote className="gd-case__quote">
              <Quote size={22} aria-hidden="true" />

              <p>
                Development is not just about aid.
                It’s about opportunity.
              </p>

              <cite>Continental Founders</cite>
            </blockquote>

          </div>

        </div>

      </section>


      {/* ======================================================
          FINAL CTA
      ====================================================== */}

      <section className="gd-cta">

        <div className="gd-container">

          <div className="gd-cta__card" data-reveal>

            <img
              src="/assets/government/government-cta.webp"
              alt=""
              loading="lazy"
            />

            <div className="gd-cta__content">

              <span className="gd-eyebrow gd-eyebrow--light">
                Let&apos;s Build Together
              </span>

              <h2>From institutional priorities to real-world impact.</h2>

              <p>
                Connect with our team to explore partnership opportunities
                across policy, enterprise development, markets, and
                institutional collaboration.
              </p>

              <div className="gd-cta__actions">
                <Link
                  to="/contact"
                  className="gd-button gd-button--gold"
                >
                  Start a conversation
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
              </div>

            </div>

            <p className="gd-cta__side" aria-hidden="true">
              {impactWords.map((word) => (
                <span key={word}>{word}.</span>
              ))}
            </p>

          </div>

        </div>

      </section>

    </main>
  );
}
