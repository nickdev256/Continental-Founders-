import React from "react";

import {
  ArrowRight,
  Building2,
  CirclePlay,
  FileText,
  Globe2,
  Network,
  TrendingUp,
  Users,
  Download,
} from "lucide-react";

import { Link } from "react-router-dom";

import "./GovernmentDevelopment.css";


/* ============================================================
   DATA
============================================================ */

const engagementAreas = [
  {
    number: "01",
    icon: FileText,
    title: "Policy Collaboration",
    text:
      "Engage around policies, frameworks, and enabling environments that strengthen entrepreneurship, innovation, and enterprise growth.",
  },
  {
    number: "02",
    icon: Building2,
    title: "Program Funding",
    text:
      "Support programs and initiatives that strengthen founder development, innovation, commercial readiness, and economic participation.",
  },
  {
    number: "03",
    icon: Network,
    title: "Market Access",
    text:
      "Create pathways into new markets through institutional, commercial, university, investor, and business networks.",
  },
  {
    number: "04",
    icon: TrendingUp,
    title: "SME Development",
    text:
      "Support small and growing enterprises with knowledge, partnerships, market pathways, expertise, and growth opportunities.",
  },
];
/* ============================================================
   PAGE
============================================================ */

export default function GovernmentDevelopment() {
  return (
    <main className="gd-page">

      {/* ======================================================
          HERO
      ====================================================== */}

      <section className="gd-hero">

        <div className="gd-hero__grid">

          <div className="gd-hero__content">

            <div className="gd-eyebrow-row">

              <span className="gd-eyebrow">
                Government & Development Institutions
              </span>

              <span
                className="gd-eyebrow-line"
                aria-hidden="true"
              />

            </div>


            <h1>
              Public institutions.
              <br />
              <span>
                Real opportunity.
              </span>
            </h1>


            <p className="gd-hero__description">
              Partnering with governments and development institutions
              to turn policy, programs, market access, and institutional
              resources into inclusive economic and commercial opportunity.
            </p>


            <div className="gd-hero__actions">

              <Link
                to="/contact"
                className="gd-button gd-button--gold"
              >
                Explore Partnership

                <ArrowRight
                  size={17}
                  strokeWidth={1.6}
                  aria-hidden="true"
                />
              </Link>


              <button
                type="button"
                className="gd-video-button"
              >
                <span className="gd-video-button__icon">

                  <CirclePlay
                    size={21}
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />

                </span>

                <span>
                  <strong>
                    Watch Overview
                  </strong>

                  <small>
                    2 min
                  </small>
                </span>
              </button>

            </div>

          </div>


          <div className="gd-hero__visual">

            <img
              src="/assets/government/government-hero.webp"
              alt="Government and institutional partnership environment"
            />


            <div className="gd-hero__quote">

              <span className="gd-quote-mark">
                “
              </span>

              <p>
                When institutions and entrepreneurs move together,
                nations move forward.
              </p>

              <span
                className="gd-hero__quote-line"
                aria-hidden="true"
              />

            </div>


            <div className="gd-hero__vertical-copy">
              PEOPLE · IDEAS · PARTNERSHIPS · GLOBAL IMPACT
            </div>

          </div>

        </div>

      </section>


      {/* ======================================================
          WHY PARTNER WITH US
      ====================================================== */}

      <section className="gd-bridge">

        <div className="gd-container gd-bridge__grid">

          <div className="gd-bridge__visual">

            <div className="gd-bridge__main-image">

              <img
                src="/assets/government/institutional-meeting.webp"
                alt="Institutional leaders in discussion"
              />

            </div>


            <div className="gd-bridge__secondary-image">

              <img
                src="/assets/government/government-building.webp"
                alt="Government institution building"
              />

            </div>


            <div className="gd-bridge__gold-card">
              <span>
                Policy
              </span>

              <span>
                People
              </span>

              <span>
                Opportunity
              </span>
            </div>


            <div className="gd-bridge__pattern">
              <span />
              <span />
              <span />
              <span />
            </div>


            <p className="gd-bridge__caption">
              Stronger institutions.
              <br />
              Brighter entrepreneurs.
              <br />
              A more inclusive future.
            </p>

          </div>


          <div className="gd-bridge__content">

            <div className="gd-eyebrow-row">

              <span className="gd-eyebrow">
                Why Partner With Us
              </span>

              <span
                className="gd-eyebrow-line"
                aria-hidden="true"
              />

            </div>


            <h2>
              A bridge between
              <br />
              policy and possibility.
            </h2>


            <p className="gd-bridge__lead">
              Continental Founders helps government and development
              institutions connect their priorities with high-potential
              founders, businesses, universities, and strategic partners —
              turning institutional ambition into practical pathways
              for enterprise and opportunity.
            </p>


            <div className="gd-benefits">

              <article className="gd-benefit">

                <Users
                  size={30}
                  strokeWidth={1.4}
                  aria-hidden="true"
                />

                <h3>
                  Access
                  <br />
                  Entrepreneurial Talent
                </h3>

              </article>


              <article className="gd-benefit">

                <TrendingUp
                  size={30}
                  strokeWidth={1.4}
                  aria-hidden="true"
                />

                <h3>
                  Support
                  <br />
                  Enterprise Development
                </h3>

              </article>


              <article className="gd-benefit">

                <Globe2
                  size={30}
                  strokeWidth={1.4}
                  aria-hidden="true"
                />

                <h3>
                  Unlock Regional
                  <br />
                  and Global Partnerships
                </h3>

              </article>

            </div>

          </div>

        </div>

      </section>


      {/* ======================================================
          ENGAGEMENT PATHWAYS
      ====================================================== */}

      <section className="gd-pathways">

        <div className="gd-container">

          <div className="gd-pathways__header">

            <div>

              <div className="gd-eyebrow-row">

                <span className="gd-eyebrow">
                  How Institutions Can Engage
                </span>

                <span
                  className="gd-eyebrow-line"
                  aria-hidden="true"
                />

              </div>


              <h2>
                Multiple pathways
                <br />
                for greater impact.
              </h2>

            </div>


            <p>
              We work with governments and development institutions
              across several key areas, with partnership models
              designed around institutional priorities and goals.
            </p>

          </div>


          <div className="gd-pathways__grid">

            {engagementAreas.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.number}
                  className="gd-pathway-card"
                >

                  <span className="gd-pathway-card__number">
                    {item.number}
                  </span>


                  <div className="gd-pathway-card__marker">
                    <span />
                  </div>


                  <Icon
                    size={30}
                    strokeWidth={1.35}
                    aria-hidden="true"
                  />


                  <h3>
                    {item.title}
                  </h3>


                  <p>
                    {item.text}
                  </p>

                </article>
              );
            })}

          </div>


          <div className="gd-pathways__action">

            <Link
              to="/strategic-partners"
              className="gd-button gd-button--gold"
            >
              See Our Partner Plan

              <ArrowRight
                size={17}
                strokeWidth={1.6}
                aria-hidden="true"
              />
            </Link>

          </div>

        </div>

      </section>

{/* ======================================================
          CASE STUDY
      ====================================================== */}

      <section className="gd-case-study">

        <div className="gd-container gd-case-study__grid">

          <div className="gd-case-study__image">

            <img
              src="/assets/government/government-case-study.webp"
              alt="Urban commercial district representing national entrepreneurship development"
            />

          </div>


          <div className="gd-case-study__content">

            <span className="gd-eyebrow">
              In Focus
            </span>


            <h2>
              Partnering for National
              Entrepreneurship Strategies
            </h2>


            <p>
              Explore how institutional partners can align economic
              development priorities with founder support,
              enterprise growth, and stronger entrepreneurial ecosystems.
            </p>


            <Link
              to="/insights"
              className="gd-inline-link"
            >
              Read the Case Study

              <ArrowRight
                size={16}
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </Link>

          </div>


          <blockquote className="gd-case-study__quote">

            <span>
              “
            </span>

            <p>
              Development is not just about aid.
              It’s about opportunity.
            </p>

            <cite>
              Continental Founders
            </cite>

          </blockquote>

        </div>

      </section>

{/* ======================================================
          FINAL CTA
      ====================================================== */}

      <section className="gd-final-cta">

        <img
          src="/assets/government/government-cta.webp"
          alt=""
          aria-hidden="true"
          className="gd-final-cta__background"
        />


        <div className="gd-final-cta__overlay" />


        <div className="gd-container gd-final-cta__inner">

          <div className="gd-final-cta__content">

            <div className="gd-eyebrow-row gd-eyebrow-row--light">

              <span className="gd-eyebrow">
                Let's Build Together
              </span>

              <span
                className="gd-eyebrow-line"
                aria-hidden="true"
              />

            </div>


            <h2>
              From institutional priorities
              <br />
              to real-world impact.
            </h2>


            <p>
              Connect with our team to explore partnership opportunities
              across policy, enterprise development, markets, and
              institutional collaboration.
            </p>


            <div className="gd-final-cta__actions">

              <Link
                to="/contact"
                className="gd-button gd-button--gold"
              >
                Start a Conversation

                <ArrowRight
                  size={17}
                  strokeWidth={1.6}
                  aria-hidden="true"
                />
              </Link>


              <button
                type="button"
                className="gd-button gd-button--outline-light"
              >
                <Download
                  size={17}
                  strokeWidth={1.6}
                  aria-hidden="true"
                />

                Download Partner Overview
              </button>

            </div>

          </div>


          <div className="gd-final-cta__side">

            <p>
              PEOPLE.
              <br />
              IDEAS.
              <br />
              PARTNERSHIPS.
              <br />
              GLOBAL IMPACT.
            </p>

          </div>

        </div>

      </section>

    </main>
  );
}