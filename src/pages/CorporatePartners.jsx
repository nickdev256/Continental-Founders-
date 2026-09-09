import React from "react";

import {
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  Check,
  Globe2,
  Handshake,
  Lightbulb,
  Network,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

import { Link } from "react-router-dom";

import "./CorporatePartners.css";


/* ============================================================
   DATA
============================================================ */

const engagementAreas = [
  {
    number: "01",
    icon: Handshake,
    title: "Sponsorships",
    description:
      "Support founder development, fellowship programming, events, market initiatives, and ecosystem-building opportunities aligned with your organization.",
    tag: "Support",
  },
  {
    number: "02",
    icon: Users,
    title: "Expertise & Mentors",
    description:
      "Bring experienced executives, specialists, operators, and industry leaders into the ecosystem to help founders make stronger commercial decisions.",
    tag: "Expertise",
  },
  {
    number: "03",
    icon: BriefcaseBusiness,
    title: "Procurement Opportunities",
    description:
      "Create pathways for qualified founders and growing businesses to explore supplier, vendor, pilot, and commercial relationships.",
    tag: "Commerce",
  },
  {
    number: "04",
    icon: Lightbulb,
    title: "Innovation Challenges",
    description:
      "Engage founders around real industry challenges and explore new ideas, technologies, products, and solutions with commercial potential.",
    tag: "Innovation",
  },
];


const corporateBenefits = [
  {
    icon: Target,
    title: "Access Emerging Ventures",
    description:
      "Engage ambitious founders and businesses developing solutions across growing markets and industries.",
  },
  {
    icon: Globe2,
    title: "Expand Market Relationships",
    description:
      "Build meaningful relationships across Africa, the United States, the diaspora, universities, and wider commercial networks.",
  },
  {
    icon: Zap,
    title: "Engage Innovation",
    description:
      "Create opportunities for your teams to interact with founders, emerging technologies, new business models, and market ideas.",
  },
];


const collaborationSteps = [
  {
    number: "01",
    title: "Industry Expertise",
    description:
      "Companies contribute knowledge, experienced professionals, market insight, resources, and commercial perspective.",
  },
  {
    number: "02",
    title: "Founder Execution",
    description:
      "Founders apply that expertise while building, testing, refining, and strengthening their ventures.",
  },
  {
    number: "03",
    title: "Market Validation",
    description:
      "Ideas and ventures are challenged against customers, industry realities, markets, and commercial requirements.",
  },
  {
    number: "04",
    title: "Commercial Opportunity",
    description:
      "Strong ventures can move toward partnerships, procurement, pilots, investment pathways, and market relationships.",
  },
];


const outcomes = [
  {
    icon: TrendingUp,
    title: "Founder Readiness",
    description:
      "Stronger founders with greater commercial understanding and execution discipline.",
  },
  {
    icon: Handshake,
    title: "Commercial Relationships",
    description:
      "More opportunities for founders and businesses to build credible industry relationships.",
  },
  {
    icon: Globe2,
    title: "Market Access",
    description:
      "Stronger pathways into customers, networks, markets, and cross-border opportunities.",
  },
  {
    icon: Lightbulb,
    title: "Innovation Collaboration",
    description:
      "Structured opportunities for companies and founders to explore solutions together.",
  },
];


const ecosystemPartners = [
  {
    number: "01",
    title: "U.S.–Africa Trade & Business Network",
    description:
      "Trade, market access, investor connections, business networks, and diaspora engagement.",
    path: "/partners/us-africa-trade-network",
  },
  {
    number: "02",
    title: "Universities",
    description:
      "Faculty expertise, research relationships, student engagement, and institutional knowledge.",
    path: "/partners/universities",
  },
  {
    number: "03",
    title: "Government & Development Institutions",
    description:
      "Policy engagement, enterprise development, program support, and market-enabling relationships.",
    path: "/partners/government-development",
  },
];


/* ============================================================
   CORPORATE PARTNERS PAGE
============================================================ */

export default function CorporatePartners() {
  return (
    <main className="corporate-partners-page">

      {/* ======================================================
          HERO
      ====================================================== */}

      <section className="corporate-hero">

        <div className="corporate-hero__background">

          <img
            src="/assets/corporate/corporate-hero.jpg"
            alt="Business leaders collaborating in a modern commercial environment"
          />

          <div className="corporate-hero__overlay" />

        </div>


        <div className="corporate-container corporate-hero__inner">

          <div className="corporate-hero__content">

            <div className="corporate-eyebrow-row">

              <span className="corporate-eyebrow corporate-eyebrow--light">
                Corporate Partners
              </span>

              <span
                className="corporate-eyebrow-line"
                aria-hidden="true"
              />

            </div>


            <h1>
              Industry expertise.
              <br />

              <span>
                Founder ambition.
              </span>

              <br />

              Commercial opportunity.
            </h1>


            <p>
              Continental Founders brings companies, industry leaders,
              and ambitious founders together around expertise, markets,
              innovation, and opportunities that can move ventures forward.
            </p>


            <div className="corporate-hero__actions">

              <Link
                to="/contact"
                className="corporate-button corporate-button--gold"
              >
                Become a Corporate Partner

                <ArrowRight
                  size={17}
                  strokeWidth={1.6}
                  aria-hidden="true"
                />
              </Link>


              <a
                href="#corporate-engagement"
                className="corporate-button corporate-button--ghost"
              >
                Explore Opportunities

                <ArrowRight
                  size={17}
                  strokeWidth={1.6}
                  aria-hidden="true"
                />
              </a>

            </div>

          </div>


          <div className="corporate-hero__side">

            <span className="corporate-hero__side-label">
              Partnership in Action
            </span>


            <p>
              Expertise
              <span>→</span>
              Execution
              <span>→</span>
              Evidence
              <span>→</span>
              Opportunity
            </p>

          </div>

        </div>


        <div className="corporate-hero__bottom">

          <div className="corporate-container corporate-hero__bottom-inner">

            <span>
              Expertise
            </span>

            <span>
              Mentorship
            </span>

            <span>
              Procurement
            </span>

            <span>
              Innovation
            </span>

            <span>
              Markets
            </span>

          </div>

        </div>

      </section>


      {/* ======================================================
          INTRODUCTION
      ====================================================== */}

      <section className="corporate-intro">

        <div className="corporate-container corporate-intro__grid">

          <div className="corporate-intro__label">

            <span className="corporate-section-number">
              01
            </span>

            <span className="corporate-eyebrow">
              Why Corporate Partnership
            </span>

          </div>


          <div className="corporate-intro__content">

            <h2>
              The right company can contribute more than capital.
            </h2>


            <div className="corporate-intro__copy">

              <p className="corporate-intro__lead">
                Companies hold expertise, technology, markets,
                relationships, infrastructure, and commercial experience
                that can fundamentally change what is possible for a founder.
              </p>


              <p>
                Continental Founders creates structured ways for those
                capabilities to meet ambitious founders and ventures.
                The objective is not simply networking. It is meaningful
                participation that helps founders build stronger businesses
                while giving corporate partners new ways to engage talent,
                markets, innovation, and opportunity.
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* ======================================================
          CORPORATE BENEFITS
      ====================================================== */}

      <section className="corporate-benefits">

        <div className="corporate-container">

          <div className="corporate-benefits__header">

            <div>

              <div className="corporate-eyebrow-row">

                <span className="corporate-eyebrow">
                  Why Participate
                </span>

                <span
                  className="corporate-eyebrow-line"
                  aria-hidden="true"
                />

              </div>


              <h2>
                Strategic value on
                <br />
                both sides.
              </h2>

            </div>


            <p>
              Corporate partnership should create value for founders
              and for the organizations contributing to their growth.
            </p>

          </div>


          <div className="corporate-benefits__grid">

            {corporateBenefits.map((benefit) => {
              const Icon = benefit.icon;

              return (
                <article
                  className="corporate-benefit-card"
                  key={benefit.title}
                >

                  <div className="corporate-benefit-card__icon">

                    <Icon
                      size={30}
                      strokeWidth={1.4}
                      aria-hidden="true"
                    />

                  </div>


                  <h3>
                    {benefit.title}
                  </h3>


                  <p>
                    {benefit.description}
                  </p>

                </article>
              );
            })}

          </div>

        </div>

      </section>


      {/* ======================================================
          ENGAGEMENT AREAS
      ====================================================== */}

      <section
        className="corporate-engagement"
        id="corporate-engagement"
      >

        <div className="corporate-container">

          <div className="corporate-engagement__header">

            <div>

              <span className="corporate-section-number corporate-section-number--light">
                02
              </span>


              <div className="corporate-eyebrow-row">

                <span className="corporate-eyebrow corporate-eyebrow--light">
                  Ways to Engage
                </span>

                <span
                  className="corporate-eyebrow-line"
                  aria-hidden="true"
                />

              </div>


              <h2>
                Four ways companies
                <br />
                can participate.
              </h2>

            </div>


            <p>
              Partnership can be shaped around your company&apos;s
              capabilities, priorities, markets, people, and
              commercial interests.
            </p>

          </div>


          <div className="corporate-engagement__grid">

            {engagementAreas.map((area) => {
              const Icon = area.icon;

              return (
                <article
                  className="corporate-engagement-card"
                  key={area.number}
                >

                  <div className="corporate-engagement-card__top">

                    <span>
                      {area.number}
                    </span>


                    <span className="corporate-engagement-card__tag">
                      {area.tag}
                    </span>

                  </div>


                  <div className="corporate-engagement-card__icon">

                    <Icon
                      size={34}
                      strokeWidth={1.3}
                      aria-hidden="true"
                    />

                  </div>


                  <div className="corporate-engagement-card__content">

                    <h3>
                      {area.title}
                    </h3>


                    <p>
                      {area.description}
                    </p>

                  </div>

                </article>
              );
            })}

          </div>

        </div>

      </section>


      {/* ======================================================
          COMMERCIAL COLLABORATION
      ====================================================== */}

      <section className="corporate-collaboration">

        <div className="corporate-container corporate-collaboration__grid">

          <div className="corporate-collaboration__intro">

            <span className="corporate-section-number">
              03
            </span>


            <div className="corporate-eyebrow-row">

              <span className="corporate-eyebrow">
                From Partnership to Opportunity
              </span>

              <span
                className="corporate-eyebrow-line"
                aria-hidden="true"
              />

            </div>


            <h2>
              Commercial collaboration should move.
            </h2>


            <p>
              Continental Founders is designed to move corporate
              participation beyond introductions and into a process
              where expertise can contribute to execution, validation,
              and commercial opportunity.
            </p>


            <Link
              to="/our-model"
              className="corporate-text-link"
            >
              Explore Our Model

              <ArrowRight
                size={16}
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </Link>

          </div>


          <div className="corporate-collaboration__steps">

            {collaborationSteps.map((step) => (
              <article
                className="corporate-collaboration-step"
                key={step.number}
              >

                <div className="corporate-collaboration-step__number">
                  {step.number}
                </div>


                <div className="corporate-collaboration-step__content">

                  <h3>
                    {step.title}
                  </h3>


                  <p>
                    {step.description}
                  </p>

                </div>


                <ArrowRight
                  className="corporate-collaboration-step__arrow"
                  size={21}
                  strokeWidth={1.4}
                  aria-hidden="true"
                />

              </article>
            ))}

          </div>

        </div>

      </section>


      {/* ======================================================
          COMMERCIAL IMAGE BREAK
      ====================================================== */}

      <section className="corporate-image-break">

        <img
          src="/assets/corporate/corporate-collaboration.jpg"
          alt="Executives and founders collaborating around commercial strategy"
        />


        <div className="corporate-image-break__overlay" />


        <div className="corporate-container corporate-image-break__inner">

          <span className="corporate-eyebrow corporate-eyebrow--light">
            Commercial Collaboration
          </span>


          <blockquote>
            The strongest partnerships do more than open doors.
            They help founders become ready to walk through them.
          </blockquote>

        </div>

      </section>


      {/* ======================================================
          OUTCOMES
      ====================================================== */}

      <section className="corporate-outcomes">

        <div className="corporate-container">

          <div className="corporate-outcomes__header">

            <div>

              <span className="corporate-section-number">
                04
              </span>


              <span className="corporate-eyebrow">
                What Partnership Can Enable
              </span>

            </div>


            <h2>
              From corporate capability
              <br />
              to founder opportunity.
            </h2>

          </div>


          <div className="corporate-outcomes__grid">

            {outcomes.map((outcome, index) => {
              const Icon = outcome.icon;

              return (
                <article
                  className="corporate-outcome-card"
                  key={outcome.title}
                >

                  <div className="corporate-outcome-card__top">

                    <span>
                      0{index + 1}
                    </span>


                    <Icon
                      size={27}
                      strokeWidth={1.4}
                      aria-hidden="true"
                    />

                  </div>


                  <h3>
                    {outcome.title}
                  </h3>


                  <p>
                    {outcome.description}
                  </p>

                </article>
              );
            })}

          </div>


          <p className="corporate-outcomes__note">
            Outcomes depend on the nature of each partnership,
            participating ventures, markets, and opportunities.
          </p>

        </div>

      </section>


      {/* ======================================================
          PARTNER PROFILE / FUTURE CASE STUDY
      ====================================================== */}

      <section className="corporate-feature">

        <div className="corporate-container corporate-feature__grid">

          <div className="corporate-feature__visual">

            <img
              src="/assets/corporate/corporate-feature.jpg"
              alt="Corporate executives reviewing a business opportunity"
            />


            <div className="corporate-feature__visual-label">

              <span>
                Corporate Partnership
              </span>

              <strong>
                Expertise × Markets × Opportunity
              </strong>

            </div>

          </div>


          <div className="corporate-feature__content">

            <span className="corporate-eyebrow">
              Partnership in Practice
            </span>


            <h2>
              Built around real business priorities.
            </h2>


            <p>
              Every corporate partnership can be structured differently.
              Some organizations may contribute executive expertise.
              Others may support programming, open procurement pathways,
              provide technology, sponsor initiatives, or collaborate
              around specific industry challenges.
            </p>


            <ul>

              <li>
                <Check
                  size={17}
                  strokeWidth={1.7}
                  aria-hidden="true"
                />

                Executive and specialist engagement
              </li>

              <li>
                <Check
                  size={17}
                  strokeWidth={1.7}
                  aria-hidden="true"
                />

                Market and industry insight
              </li>

              <li>
                <Check
                  size={17}
                  strokeWidth={1.7}
                  aria-hidden="true"
                />

                Procurement and pilot pathways
              </li>

              <li>
                <Check
                  size={17}
                  strokeWidth={1.7}
                  aria-hidden="true"
                />

                Innovation and founder collaboration
              </li>

            </ul>


            <Link
              to="/contact"
              className="corporate-text-link"
            >
              Discuss a Partnership

              <ArrowRight
                size={16}
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </Link>

          </div>

        </div>

      </section>


      {/* ======================================================
          WIDER ECOSYSTEM
      ====================================================== */}

      <section className="corporate-ecosystem">

        <div className="corporate-container">

          <div className="corporate-ecosystem__header">

            <div>

              <div className="corporate-eyebrow-row">

                <span className="corporate-eyebrow">
                  The Wider Ecosystem
                </span>

                <span
                  className="corporate-eyebrow-line"
                  aria-hidden="true"
                />

              </div>


              <h2>
                Companies do not operate
                <br />
                in isolation.
              </h2>

            </div>


            <p>
              Corporate partners participate within a wider network
              of institutions, markets, expertise, and relationships
              surrounding founders.
            </p>

          </div>


          <div className="corporate-ecosystem__grid">

            {ecosystemPartners.map((partner) => (
              <Link
                to={partner.path}
                className="corporate-ecosystem-card"
                key={partner.number}
              >

                <div className="corporate-ecosystem-card__top">

                  <span>
                    {partner.number}
                  </span>


                  <ArrowUpRight
                    size={20}
                    strokeWidth={1.4}
                    aria-hidden="true"
                  />

                </div>


                <div>

                  <h3>
                    {partner.title}
                  </h3>


                  <p>
                    {partner.description}
                  </p>

                </div>

              </Link>
            ))}

          </div>


          <div className="corporate-ecosystem__footer">

            <Link
              to="/strategic-partners"
              className="corporate-text-link"
            >
              Explore All Partners

              <ArrowRight
                size={16}
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </Link>

          </div>

        </div>

      </section>


      {/* ======================================================
          FINAL CTA
      ====================================================== */}

      <section className="corporate-final-cta">

        <div className="corporate-final-cta__background">

          <img
            src="/assets/corporate/corporate-cta.jpg"
            alt=""
            aria-hidden="true"
          />

          <div className="corporate-final-cta__overlay" />

        </div>


        <div className="corporate-container corporate-final-cta__inner">

          <div className="corporate-final-cta__content">

            <div className="corporate-eyebrow-row">

              <span className="corporate-eyebrow corporate-eyebrow--light">
                Build With Continental Founders
              </span>

              <span
                className="corporate-eyebrow-line"
                aria-hidden="true"
              />

            </div>


            <h2>
              Put your expertise,
              markets, and resources
              behind ambitious ventures.
            </h2>


            <p>
              Explore how your organization can participate through
              expertise, mentorship, sponsorship, procurement,
              innovation, or broader commercial collaboration.
            </p>


            <Link
              to="/contact"
              className="corporate-button corporate-button--gold"
            >
              Start a Conversation

              <ArrowRight
                size={17}
                strokeWidth={1.6}
                aria-hidden="true"
              />
            </Link>

          </div>


          <div className="corporate-final-cta__side">

            <Building2
              size={31}
              strokeWidth={1.3}
              aria-hidden="true"
            />


            <p>
              INDUSTRY.
              <br />
              EXPERTISE.
              <br />
              MARKETS.
              <br />
              OPPORTUNITY.
            </p>

          </div>

        </div>

      </section>

    </main>
  );
}