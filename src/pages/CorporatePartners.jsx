import React, {
  useEffect,
  useRef,
} from "react";

import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  Check,
  Globe2,
  GraduationCap,
  Handshake,
  Landmark,
  Lightbulb,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

import { Link } from "react-router-dom";

import "./CorporatePartners.css";


/* ============================================================
   DATA
   Cards cycle through the site's gold, navy and blue accents.
============================================================ */

const engagementAreas = [
  {
    icon: Handshake,
    title: "Sponsorships",
    description:
      "Support founder development, fellowship programming, events, market initiatives, and ecosystem-building opportunities aligned with your organization.",
    tag: "Support",
    color: "gold",
  },
  {
    icon: Users,
    title: "Expertise & Mentors",
    description:
      "Bring experienced executives, specialists, operators, and industry leaders into the ecosystem to help founders make stronger commercial decisions.",
    tag: "Expertise",
    color: "navy",
  },
  {
    icon: BriefcaseBusiness,
    title: "Procurement Opportunities",
    description:
      "Create pathways for qualified founders and growing businesses to explore supplier, vendor, pilot, and commercial relationships.",
    tag: "Commerce",
    color: "blue",
  },
  {
    icon: Lightbulb,
    title: "Innovation Challenges",
    description:
      "Engage founders around real industry challenges and explore new ideas, technologies, products, and solutions with commercial potential.",
    tag: "Innovation",
    color: "gold",
  },
];


const corporateBenefits = [
  {
    icon: Target,
    title: "Access Emerging Ventures",
    description:
      "Engage ambitious founders and businesses developing solutions across growing markets and industries.",
    color: "gold",
  },
  {
    icon: Globe2,
    title: "Expand Market Relationships",
    description:
      "Build meaningful relationships across Africa, the United States, the diaspora, universities, and wider commercial networks.",
    color: "navy",
  },
  {
    icon: Zap,
    title: "Engage Innovation",
    description:
      "Create opportunities for your teams to interact with founders, emerging technologies, new business models, and market ideas.",
    color: "blue",
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
    color: "gold",
  },
  {
    icon: Handshake,
    title: "Commercial Relationships",
    description:
      "More opportunities for founders and businesses to build credible industry relationships.",
    color: "navy",
  },
  {
    icon: Globe2,
    title: "Market Access",
    description:
      "Stronger pathways into customers, networks, markets, and cross-border opportunities.",
    color: "blue",
  },
  {
    icon: Lightbulb,
    title: "Innovation Collaboration",
    description:
      "Structured opportunities for companies and founders to explore solutions together.",
    color: "gold",
  },
];


const practiceItems = [
  "Executive and specialist engagement",
  "Market and industry insight",
  "Procurement and pilot pathways",
  "Innovation and founder collaboration",
];


/* Photos, icons and colours match the Partners page and menu */
const ecosystemPartners = [
  {
    title: "U.S.–Africa Trade & Business Network",
    description:
      "Trade, market access, investor connections, business networks, and diaspora engagement.",
    path: "/partners/us-africa-trade-network",
    image: "/assets/images/us-africa/market-access.webp",
    icon: Globe2,
    color: "gold",
  },
  {
    title: "Universities",
    description:
      "Faculty expertise, research relationships, student engagement, and institutional knowledge.",
    path: "/universities",
    image: "/assets/images/universities/university-partnership.webp",
    icon: GraduationCap,
    color: "blue",
  },
  {
    title: "Government & Development Institutions",
    description:
      "Policy engagement, enterprise development, program support, and market-enabling relationships.",
    path: "/partners/government-development",
    image: "/assets/images/us-africa/final-cta.webp",
    icon: Landmark,
    color: "navy",
  },
];


const heroFlow = [
  "Expertise",
  "Execution",
  "Evidence",
  "Opportunity",
];


const heroStrip = [
  "Expertise",
  "Mentorship",
  "Procurement",
  "Innovation",
  "Markets",
];


/* ============================================================
   CORPORATE PARTNERS PAGE
============================================================ */

export default function CorporatePartners() {
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

    root.classList.add("corporate-page--reveal");

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
    <main className="corporate-partners-page" ref={pageRef}>

      {/* ======================================================
          HERO
      ====================================================== */}

      <section className="corporate-hero">

        <div className="corporate-hero__media" aria-hidden="true">
          <img
            src="/assets/images/hero-partnership.webp"
            alt=""
            fetchPriority="high"
          />
        </div>

        <div className="corporate-container corporate-hero__inner">

          <div className="corporate-hero__content">

            <span className="corporate-eyebrow corporate-eyebrow--light">
              Corporate Partners
            </span>

            <h1>
              <span>Industry expertise.</span>{" "}
              <em>Founder ambition.</em>{" "}
              <span>Commercial opportunity.</span>
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
                Become a corporate partner
                <ArrowRight size={18} aria-hidden="true" />
              </Link>

              <a
                href="#corporate-engagement"
                className="corporate-button corporate-button--ghost"
              >
                Explore opportunities
              </a>
            </div>

          </div>

          <div className="corporate-hero__flow">
            <span className="corporate-hero__flow-label">
              Partnership in Action
            </span>

            <ol>
              {heroFlow.map((step, index) => (
                <li key={step}>
                  <span>{index + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

        </div>

      </section>


      {/* Capability strip */}

      <div className="corporate-strip" aria-hidden="true">
        <div className="corporate-container corporate-strip__inner">
          {heroStrip.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </div>


      {/* ======================================================
          INTRODUCTION
      ====================================================== */}

      <section className="corporate-section corporate-intro">

        <div className="corporate-container corporate-intro__grid" data-reveal>

          <span className="corporate-eyebrow">
            Why Corporate Partnership
          </span>

          <div className="corporate-intro__content">

            <h2>
              The right company can contribute more than capital.
            </h2>

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

      </section>


      {/* ======================================================
          CORPORATE BENEFITS
      ====================================================== */}

      <section className="corporate-section corporate-section--soft corporate-benefits">

        <div className="corporate-container">

          <header className="corporate-heading corporate-heading--split" data-reveal>
            <div>
              <span className="corporate-eyebrow">Why Participate</span>
              <h2>Strategic value on both sides.</h2>
            </div>

            <p>
              Corporate partnership should create value for founders
              and for the organizations contributing to their growth.
            </p>
          </header>

          <div className="corporate-benefits__grid" data-reveal>
            {corporateBenefits.map(({ icon: Icon, title, description, color }) => (
              <article
                className={`corporate-benefit corporate-tone--${color}`}
                key={title}
              >
                <span className="corporate-icon">
                  <Icon size={24} aria-hidden="true" />
                </span>

                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>

        </div>

      </section>


      {/* ======================================================
          ENGAGEMENT AREAS
      ====================================================== */}

      <section
        className="corporate-section corporate-engagement"
        id="corporate-engagement"
      >

        <div className="corporate-container">

          <header className="corporate-heading corporate-heading--split" data-reveal>
            <div>
              <span className="corporate-eyebrow corporate-eyebrow--light">
                Ways to Engage
              </span>
              <h2>Four ways companies can participate.</h2>
            </div>

            <p>
              Partnership can be shaped around your company&apos;s
              capabilities, priorities, markets, people, and
              commercial interests.
            </p>
          </header>

          <div className="corporate-engagement__grid" data-reveal>
            {engagementAreas.map(({ icon: Icon, title, description, tag, color }, index) => (
              <article
                className={`corporate-engage corporate-tone--${color}`}
                key={title}
              >
                <div className="corporate-engage__top">
                  <span className="corporate-engage__icon">
                    <Icon size={24} aria-hidden="true" />
                  </span>

                  <span className="corporate-engage__tag">{tag}</span>
                </div>

                <span className="corporate-engage__number">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>

        </div>

      </section>


      {/* ======================================================
          COMMERCIAL COLLABORATION
      ====================================================== */}

      <section className="corporate-section corporate-collaboration">

        <div className="corporate-container corporate-collaboration__grid">

          <div className="corporate-collaboration__intro" data-reveal>

            <span className="corporate-eyebrow">
              From Partnership to Opportunity
            </span>

            <h2>Commercial collaboration should move.</h2>

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
              Explore our model
              <ArrowRight size={16} aria-hidden="true" />
            </Link>

          </div>

          <ol className="corporate-steps" data-reveal>
            {collaborationSteps.map((step) => (
              <li className="corporate-step" key={step.number}>
                <span className="corporate-step__number">
                  {step.number}
                </span>

                <div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </li>
            ))}
          </ol>

        </div>

      </section>


      {/* ======================================================
          COMMERCIAL IMAGE BREAK
      ====================================================== */}

      <section className="corporate-quote">

        <div className="corporate-container">

          <figure className="corporate-quote__card" data-reveal>

            <img
              src="/assets/n.webp"
              alt="Executives and founders collaborating around commercial strategy"
              loading="lazy"
            />

            <div className="corporate-quote__content">
              <span className="corporate-eyebrow corporate-eyebrow--light">
                Commercial Collaboration
              </span>

              <blockquote>
                The strongest partnerships do more than open doors.
                They help founders become ready to walk through them.
              </blockquote>
            </div>

          </figure>

        </div>

      </section>


      {/* ======================================================
          OUTCOMES
      ====================================================== */}

      <section className="corporate-section corporate-outcomes">

        <div className="corporate-container">

          <header className="corporate-heading" data-reveal>
            <span className="corporate-eyebrow">What Partnership Can Enable</span>
            <h2>From corporate capability to founder opportunity.</h2>
          </header>

          <div className="corporate-outcomes__grid" data-reveal>
            {outcomes.map(({ icon: Icon, title, description, color }) => (
              <article
                className={`corporate-outcome corporate-tone--${color}`}
                key={title}
              >
                <span className="corporate-icon">
                  <Icon size={22} aria-hidden="true" />
                </span>

                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>

          <p className="corporate-outcomes__note">
            Outcomes depend on the nature of each partnership,
            participating ventures, markets, and opportunities.
          </p>

        </div>

      </section>


      {/* ======================================================
          PARTNERSHIP IN PRACTICE
      ====================================================== */}

      <section className="corporate-section corporate-section--soft corporate-practice">

        <div className="corporate-container corporate-practice__grid">

          <figure className="corporate-practice__media" data-reveal>

            <img
              src="/assets/images/innovation-entrepreneurship.webp"
              alt="Corporate executives reviewing a business opportunity"
              loading="lazy"
            />

            <figcaption>
              <span>Corporate Partnership</span>
              <strong>Expertise × Markets × Opportunity</strong>
            </figcaption>

          </figure>

          <div className="corporate-practice__content" data-reveal>

            <span className="corporate-eyebrow">
              Partnership in Practice
            </span>

            <h2>Built around real business priorities.</h2>

            <p>
              Every corporate partnership can be structured differently.
              Some organizations may contribute executive expertise.
              Others may support programming, open procurement pathways,
              provide technology, sponsor initiatives, or collaborate
              around specific industry challenges.
            </p>

            <ul>
              {practiceItems.map((item) => (
                <li key={item}>
                  <span>
                    <Check size={15} aria-hidden="true" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <Link
              to="/contact"
              className="corporate-button corporate-button--navy"
            >
              Discuss a partnership
              <ArrowRight size={18} aria-hidden="true" />
            </Link>

          </div>

        </div>

      </section>


      {/* ======================================================
          WIDER ECOSYSTEM
      ====================================================== */}

      <section className="corporate-section corporate-ecosystem">

        <div className="corporate-container">

          <header className="corporate-heading corporate-heading--split" data-reveal>
            <div>
              <span className="corporate-eyebrow">The Wider Ecosystem</span>
              <h2>Companies do not operate in isolation.</h2>
            </div>

            <div>
              <p>
                Corporate partners participate within a wider network
                of institutions, markets, expertise, and relationships
                surrounding founders.
              </p>

              <Link
                to="/strategic-partners"
                className="corporate-text-link"
              >
                Explore all partners
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </header>

          <div className="corporate-ecosystem__grid" data-reveal>
            {ecosystemPartners.map(
              ({ title, description, path, image, icon: Icon, color }) => (
                <Link
                  to={path}
                  className={`corporate-partner corporate-tone--${color}`}
                  key={path}
                >
                  <div className="corporate-partner__media">
                    <img src={image} alt="" loading="lazy" />

                    <span className="corporate-partner__icon">
                      <Icon size={20} aria-hidden="true" />
                    </span>
                  </div>

                  <div className="corporate-partner__body">
                    <h3>{title}</h3>
                    <p>{description}</p>

                    <span className="corporate-partner__link">
                      Learn more
                      <ArrowRight size={16} aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              )
            )}
          </div>

        </div>

      </section>


      {/* ======================================================
          FINAL CTA
      ====================================================== */}

      <section className="corporate-cta">

        <div className="corporate-container">

          <div className="corporate-cta__card" data-reveal>

            <img
              src="/assets/images/leadership_collaboration_full_HD.webp"
              alt=""
              loading="lazy"
            />

            <div className="corporate-cta__content">

              <span className="corporate-eyebrow corporate-eyebrow--light">
                Build With Continental Founders
              </span>

              <h2>
                Put your expertise, markets, and resources behind
                ambitious ventures.
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
                Start a conversation
                <ArrowRight size={18} aria-hidden="true" />
              </Link>

            </div>

            <div className="corporate-cta__side" aria-hidden="true">
              <Building2 size={28} />
              <p>
                Industry.
                <br />
                Expertise.
                <br />
                Markets.
                <br />
                Opportunity.
              </p>
            </div>

          </div>

        </div>

      </section>

    </main>
  );
}
