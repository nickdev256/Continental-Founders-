import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  CalendarDays,
  Clock3,
  Globe2,
  Handshake,
  Layers3,
  MapPin,
  MessageSquare,
  Network,
  Scale,
  ShieldCheck,
  Target,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";

import "./CFCV.css";

// ============================================================
// IMAGE PATHS
// Missing images simply leave their navy or soft background.
// ============================================================

const IMAGE_ROOT = "/images/cfcv";

// ============================================================
// FELLOWSHIP FACTS
// ============================================================

const facts = [
  {
    value: "6 months",
    label: "INTENSIVE FELLOWSHIP",
    icon: CalendarDays,
  },
  {
    value: "Up to 30 ventures",
    label: "ACROSS THE COHORT",
    icon: BriefcaseBusiness,
  },
  {
    value: "3 development tracks",
    label: "GENESIS · ASCEND · HORIZON",
    icon: Layers3,
  },
  {
    value: "Africa + U.S. / Diaspora",
    label: "CROSS-CONTINENTAL COLLABORATION",
    icon: Globe2,
  },
];

// ============================================================
// ADMISSION PROCESS
// ============================================================

const stages = [
  {
    name: "Apply",
    description: "Submit your founder and venture application.",
  },
  {
    name: "Assess",
    description: "Complete the founder and venture assessment.",
  },
  {
    name: "Place",
    description: "Be placed in the right development track.",
  },
  {
    name: "Match",
    description:
      "Connect with potential collaborators across continents.",
  },
  {
    name: "Admit",
    description: "Receive your final decision and next steps.",
  },
];

// ============================================================
// DEVELOPMENT TRACKS
// ============================================================

const tracks = [
  {
    key: "genesis",
    name: "Genesis",
    title: "Build it.",
    bestFit: "For founders with an idea or early concept.",
    focus:
      "Customer discovery, validation, business model, co-founder relationship, MVP / prototype.",
    outcome:
      "A validated concept, cross-continental founding team, and MVP / proof of concept.",
    image: "/assets/kk.webp",
    imageAlt: "Founder starting a venture on a laptop",
    to: "/genesis",
  },
  {
    key: "ascend",
    name: "Ascend",
    title: "Prove it.",
    bestFit:
      "For founders with an MVP, prototype, pilot, or early traction.",
    focus:
      "Market testing, pilots, financial model, revenue strategy, legal / governance, investment readiness.",
    outcome:
      "Demonstrated traction and a clear investment pathway.",
    image: "/assets/x.webp",
    imageAlt: "Founders refining their business model in a workshop",
    to: "/ascend",
  },
  {
    key: "horizon",
    name: "Horizon",
    title: "Scale it.",
    bestFit:
      "For founders with an operating business, customers, revenue, contracts, or partnerships.",
    focus:
      "Expansion, capital strategy, strategic partnerships, governance, and scaling.",
    outcome:
      "A scale-ready venture positioned for market expansion and investment.",
    image: "/assets/venture.webp",
    imageAlt: "Founders planning growth in an office overlooking the city",
    to: "/horizon",
  },
];

// ============================================================
// FOUNDER ASSESSMENT
// ============================================================

const assessment = [
  "Commitment to building a serious venture",
  "Integrity and professionalism",
  "Entrepreneurial potential and resourcefulness",
  "Relevant skills and experience",
  "Willingness to collaborate and learn",
  "Cross-cultural readiness and adaptability",
  "Availability for the six-month fellowship",
];

// ============================================================
// INTERVIEW QUESTIONS
// ============================================================

const interviewQuestions = [
  "Why entrepreneurship, and why this problem?",
  "Why are you positioned to solve it?",
  "What experience and skills do you bring?",
  "What do you need in a cross-continental collaborator?",
  "How do you handle disagreement and decision-making?",
  "How do you work across cultures and geographies?",
  "How much time can you commit?",
  "What are your ownership and company expectations?",
  "What does success look like in six months?",
];

// ============================================================
// MATCHING CRITERIA
// ============================================================

const matchingCriteria = [
  {
    title: "Complementary skills",
    description: "Diverse and complementary capabilities",
    icon: Network,
  },
  {
    title: "Sector interests",
    description: "Shared or adjacent business interests",
    icon: Users,
  },
  {
    title: "Relevant experience",
    description: "Entrepreneurial and professional experience",
    icon: BriefcaseBusiness,
  },
  {
    title: "Market knowledge",
    description: "Local and global market insight",
    icon: Globe2,
  },
  {
    title: "Geographic connections",
    description: "Networks and connections across markets",
    icon: MapPin,
  },
  {
    title: "Working style",
    description: "Compatible personalities and ways of working",
    icon: Handshake,
  },
  {
    title: "Time commitment",
    description: "Aligned availability and commitment",
    icon: Clock3,
  },
  {
    title: "Leadership",
    description: "Complementary leadership strengths",
    icon: ShieldCheck,
  },
  {
    title: "Long-term goals",
    description: "A shared vision for the venture",
    icon: TrendingUp,
  },
];

// ============================================================
// COMPATIBILITY SPRINT
// ============================================================

const compatibility = [
  {
    title: "Roles",
    icon: Users,
    detail: "Who is responsible for what?",
  },
  {
    title: "Decisions",
    icon: Scale,
    detail: "How will decisions be made?",
  },
  {
    title: "Time",
    icon: Clock3,
    detail: "How much time can each founder commit?",
  },
  {
    title: "Contributions",
    icon: BriefcaseBusiness,
    detail: "What does each founder contribute?",
  },
  {
    title: "Conflict",
    icon: MessageSquare,
    detail: "How will disagreements be handled?",
  },
  {
    title: "Ownership",
    icon: Layers3,
    detail: "What are the ownership expectations?",
  },
  {
    title: "Shared vision",
    icon: Target,
    detail: "What is the shared long-term vision?",
  },
];

// ============================================================
// ADMISSION OUTCOMES
// ============================================================

const outcomes = [
  {
    title: "Admit",
    tone: "gold",
    description:
      "You meet the requirements and are ready for the fellowship.",
    icon: CheckCircle2,
  },
  {
    title: "Admit with track placement",
    tone: "blue",
    description:
      "You are accepted and assigned to Genesis, Ascend, or Horizon.",
    icon: TrendingUp,
  },
  {
    title: "Match required",
    tone: "navy",
    description:
      "Your application is promising, but a cross-continental collaborator is needed before final admission.",
    icon: Users,
  },
  {
    title: "Waitlist",
    tone: "muted",
    description:
      "You are a strong applicant, but cohort capacity is limited.",
    icon: Clock3,
  },
  {
    title: "Not selected",
    tone: "muted",
    description:
      "You do not currently meet the fellowship requirements.",
    icon: XCircle,
  },
];

// ============================================================
// PROPOSED ADMISSIONS TIMELINE
// ============================================================

const timeline = [
  {
    timing: "Week 1",
    title: "Launch",
    description: "Fellowship announced",
  },
  {
    timing: "Weeks 1–5",
    title: "Applications open",
    description: "Applications accepted",
  },
  {
    timing: "Weeks 3–6",
    title: "Initial screening",
    description: "Eligibility and application review",
  },
  {
    timing: "Weeks 5–7",
    title: "Founder assessment",
    description: "Founder and venture evaluation",
  },
  {
    timing: "Weeks 7–9",
    title: "Interviews",
    description: "Selected applicants interviewed",
  },
  {
    timing: "Weeks 8–10",
    title: "Track placement",
    description: "Development track assigned",
  },
  {
    timing: "Weeks 9–11",
    title: "Matching",
    description: "Cross-continental collaborator matching",
  },
  {
    timing: "Weeks 10–12",
    title: "Compatibility sprint",
    description: "Potential teams work together",
  },
  {
    timing: "Week 12",
    title: "Final selection",
    description: "Admissions Committee decision",
  },
  {
    timing: "Week 13",
    title: "Offers released",
    description: "Acceptance letters issued",
  },
  {
    timing: "Week 14",
    title: "Enrollment / orientation",
    description: "Fellow onboarding",
  },
  {
    timing: "Week 15",
    title: "Program begins",
    description: "Six-month fellowship begins",
  },
];

// ============================================================
// COMPLETE FELLOWSHIP PATH
// ============================================================

const pathway = [
  {
    title: "Recruit",
    description: "Learn about the fellowship.",
  },
  {
    title: "Apply",
    description: "Submit your application.",
  },
  {
    title: "Assess",
    description: "Founder and venture review.",
  },
  {
    title: "Interview",
    description: "Join a founder conversation.",
  },
  {
    title: "Place",
    description: "Enter the appropriate track.",
  },
  {
    title: "Match",
    description: "Connect across continents.",
  },
  {
    title: "Compatibility",
    description: "Work together before commitment.",
  },
  {
    title: "Admit",
    description: "Receive your admissions decision.",
  },
  {
    title: "Orient",
    description: "Complete fellowship onboarding.",
  },
  {
    title: "Begin",
    description: "Start the six-month fellowship.",
  },
];

// ============================================================
// REUSABLE COMPONENTS
// ============================================================

function OptionalImage({
  src,
  className = "",
  alt = "",
  ...props
}) {
  const [failedSource, setFailedSource] = useState(null);

  if (failedSource === src) {
    return null;
  }

  return (
    <img
      {...props}
      src={src}
      alt={alt}
      className={className}
      onError={() => setFailedSource(src)}
    />
  );
}

function SectionLabel({
  children,
  light = false,
}) {
  return (
    <span
      className={`cfcv-label${
        light ? " cfcv-label--light" : ""
      }`}
    >
      {children}
    </span>
  );
}

function ApplyButton({
  tone = "gold",
  children = "Start your application",
}) {
  return (
    <Link
      to="/cfcv/apply"
      className={`cfcv-button cfcv-button--${tone}`}
    >
      {children}

      <ArrowUpRight
        size={18}
        aria-hidden="true"
      />
    </Link>
  );
}

// ============================================================
// SCROLL REVEAL
// Content stays visible if scripts fail or motion is reduced.
// ============================================================

function useReveal(ref) {
  useEffect(() => {
    const root = ref.current;

    if (
      !root ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return undefined;
    }

    root.classList.add("cfcv-page--reveal");

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

// ============================================================
// PAGE
// ============================================================

export default function CFCV() {
  const pageRef = useRef(null);

  useReveal(pageRef);

  return (
    <div className="cfcv-page" ref={pageRef}>
      <a
        className="cfcv-skip-link"
        href="#cfcv-main"
      >
        Skip to content
      </a>

      <main id="cfcv-main">
        {/* ==================================================
            HERO
        ================================================== */}

        <section
          className="cfcv-hero"
          aria-labelledby="cfcv-title"
        >
          <div className="cfcv-container cfcv-hero__inner">
            <div className="cfcv-hero__copy">
              <SectionLabel light>
                CFCV FELLOWSHIP
              </SectionLabel>

              <h1 id="cfcv-title">
                Great ventures start with{" "}
                <em>meaningful connections.</em>
              </h1>

              <p className="cfcv-hero__description">
                A six-month fellowship bringing founders
                in Africa and the United States / diaspora
                together to build commercially viable
                businesses.
              </p>

              <div className="cfcv-hero__actions">
                <ApplyButton />

                <a
                  className="cfcv-button cfcv-button--ghost"
                  href="#cfcv-overview"
                >
                  Explore the fellowship

                  <ArrowDown
                    size={18}
                    aria-hidden="true"
                  />
                </a>
              </div>
            </div>

            <div className="cfcv-hero__visual">
              <OptionalImage
                src={`${IMAGE_ROOT}/hero-map.jpg`}
                className="cfcv-hero__map"
                fetchPriority="high"
                decoding="async"
              />

              <div className="cfcv-hero__visual-copy">
                <p className="cfcv-hero__connection">
                  Africa <span aria-hidden="true">↔</span>
                  <span className="cfcv-visually-hidden">and the</span>{" "}
                  U.S.
                </p>

                <p>Built across borders.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================
            FELLOWSHIP FACTS
        ================================================== */}

        <section
          className="cfcv-facts"
          aria-label="Fellowship at a glance"
        >
          <div className="cfcv-container">
            <ul className="cfcv-facts__grid">
              {facts.map(({ value, label, icon: Icon }) => (
                <li
                  className="cfcv-fact"
                  key={value}
                >
                  <span className="cfcv-fact__icon">
                    <Icon size={22} aria-hidden="true" />
                  </span>

                  <span className="cfcv-fact__text">
                    <strong>{value}</strong>
                    <span>{label}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ==================================================
            OVERVIEW
        ================================================== */}

        <section
          id="cfcv-overview"
          className="cfcv-section cfcv-overview"
          aria-labelledby="cfcv-overview-title"
        >
          <div className="cfcv-container cfcv-split">
            <div className="cfcv-split__content" data-reveal>
              <SectionLabel>
                OVERVIEW
              </SectionLabel>

              <h2 id="cfcv-overview-title">
                More than a program.
                A platform for building.
              </h2>

              <p className="cfcv-lead">
                Continental Founders Fellowship
                identifies promising founders, evaluates
                their ventures, places them in the right
                development track, and facilitates
                cross-continental collaborations to build
                commercially viable businesses.
              </p>
            </div>

            <figure
              className="cfcv-photo"
              aria-hidden="true"
              data-reveal
            >
              <OptionalImage
                src={`${IMAGE_ROOT}/overview-landscape.jpg`}
                loading="lazy"
                decoding="async"
              />
            </figure>
          </div>
        </section>

        {/* ==================================================
            ADMISSION PROCESS
        ================================================== */}

        <section
          id="cfcv-admissions"
          className="cfcv-section cfcv-section--soft"
          aria-labelledby="cfcv-process-title"
        >
          <div className="cfcv-container">
            <header className="cfcv-heading" data-reveal>
              <SectionLabel>
                ADMISSION PROCESS
              </SectionLabel>

              <h2 id="cfcv-process-title">
                A clear path into the fellowship.
              </h2>
            </header>

            <ol className="cfcv-stages" data-reveal>
              {stages.map((stage, index) => (
                <li
                  className="cfcv-stage"
                  key={stage.name}
                >
                  <span
                    className="cfcv-number"
                    aria-hidden="true"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <h3>{stage.name}</h3>
                  <p>{stage.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ==================================================
            DEVELOPMENT TRACKS
        ================================================== */}

        <section
          id="cfcv-tracks"
          className="cfcv-section"
          aria-labelledby="cfcv-tracks-title"
        >
          <div className="cfcv-container">
            <header className="cfcv-heading" data-reveal>
              <SectionLabel>
                DEVELOPMENT TRACKS
              </SectionLabel>

              <h2 id="cfcv-tracks-title">
                Start where you are.
                Build what comes next.
              </h2>
            </header>

            <div className="cfcv-tracks" data-reveal>
              {tracks.map((track) => (
                <article
                  className={`cfcv-track cfcv-track--${track.key}`}
                  key={track.key}
                >
                  <div className="cfcv-track__media">
                    <OptionalImage
                      src={track.image}
                      alt={track.imageAlt}
                      className="cfcv-track__image"
                      loading="lazy"
                      decoding="async"
                    />

                    <span className="cfcv-track__name">
                      {track.name}
                    </span>
                  </div>

                  <div className="cfcv-track__content">
                    <h3>{track.title}</h3>

                    <p className="cfcv-track__fit">
                      {track.bestFit}
                    </p>

                    <dl className="cfcv-track__details">
                      <div>
                        <dt>Focus</dt>
                        <dd>{track.focus}</dd>
                      </div>

                      <div>
                        <dt>Outcome</dt>
                        <dd>{track.outcome}</dd>
                      </div>
                    </dl>

                    <Link
                      to={track.to}
                      className="cfcv-track__link"
                    >
                      Explore {track.name}
                      <ArrowRight size={17} aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            <p className="cfcv-section-note">
              Placement reflects venture readiness,
              rather than academic level.
            </p>
          </div>
        </section>

        {/* ==================================================
            ASSESSMENT AND INTERVIEW
        ================================================== */}

        <section
          className="cfcv-section cfcv-section--soft"
          aria-label="Founder assessment and interview"
        >
          <div className="cfcv-container cfcv-founder-grid">
            <article className="cfcv-card cfcv-assessment" data-reveal>
              <SectionLabel>
                THE FOUNDER BEHIND THE VENTURE
              </SectionLabel>

              <h2 className="cfcv-small-heading">
                We look for founders who are committed,
                principled and collaborative.
              </h2>

              <ul className="cfcv-checklist">
                {assessment.map((item) => (
                  <li key={item}>
                    <span
                      className="cfcv-check"
                      aria-hidden="true"
                    >
                      <Check size={14} strokeWidth={3} />
                    </span>

                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="cfcv-card cfcv-interview" data-reveal>
              <div className="cfcv-interview__heading">
                <div>
                  <SectionLabel light>
                    FOUNDER INTERVIEW
                  </SectionLabel>

                  <h2 className="cfcv-small-heading">
                    A 30–45 minute conversation.
                  </h2>
                </div>

                <span className="cfcv-time-badge">
                  <Clock3
                    size={16}
                    aria-hidden="true"
                  />

                  30–45 minutes
                </span>
              </div>

              <p className="cfcv-interview__intro">
                A recommended conversation to understand
                you, your venture, and your readiness
                for a successful collaboration.
              </p>

              <ol className="cfcv-questions">
                {interviewQuestions.map((question, index) => (
                  <li key={question}>
                    <span
                      className="cfcv-questions__number"
                      aria-hidden="true"
                    >
                      {index + 1}
                    </span>

                    <span>{question}</span>
                  </li>
                ))}
              </ol>
            </article>
          </div>
        </section>

        {/* ==================================================
            CROSS-CONTINENTAL MATCHING
        ================================================== */}

        <section
          id="cfcv-matching"
          className="cfcv-section"
          aria-labelledby="cfcv-matching-title"
        >
          <div className="cfcv-container">
            <header className="cfcv-heading cfcv-heading--split" data-reveal>
              <div>
                <SectionLabel>
                  CROSS-CONTINENTAL MATCHING
                </SectionLabel>

                <h2 id="cfcv-matching-title">
                  Different perspectives.
                  Shared ambition.
                </h2>
              </div>

              <p>
                Existing teams and individual founders
                may apply. Every venture must ultimately
                have meaningful participation connecting
                Africa and the United States / diaspora.
              </p>
            </header>

            <ul className="cfcv-criteria" data-reveal>
              {matchingCriteria.map(
                ({ title, description, icon: Icon }, index) => (
                  <li
                    className={`cfcv-criterion cfcv-criterion--${
                      ["gold", "blue", "navy"][index % 3]
                    }`}
                    key={title}
                  >
                    <span className="cfcv-criterion__icon">
                      <Icon
                        size={22}
                        aria-hidden="true"
                      />
                    </span>

                    <div>
                      <h3>{title}</h3>
                      <p>{description}</p>
                    </div>
                  </li>
                )
              )}
            </ul>
          </div>
        </section>

        {/* ==================================================
            COMPATIBILITY SPRINT
        ================================================== */}

        <section
          className="cfcv-section cfcv-compatibility"
          aria-labelledby="cfcv-compatibility-title"
        >
          <div className="cfcv-container cfcv-compatibility__inner">
            <div className="cfcv-compatibility__copy" data-reveal>
              <SectionLabel light>
                COMPATIBILITY SPRINT
              </SectionLabel>

              <h2 id="cfcv-compatibility-title">
                Build trust before you build together.
              </h2>

              <p>
                Potential founding pairs complete a short
                working period before formal acceptance
                as a team, helping establish alignment,
                trust, and shared commitment.
              </p>
            </div>

            <ul className="cfcv-compatibility__items" data-reveal>
              {compatibility.map(
                ({ title, icon: Icon, detail }) => (
                  <li key={title}>
                    <Icon
                      size={22}
                      aria-hidden="true"
                    />

                    <h3>{title}</h3>
                    <p>{detail}</p>
                  </li>
                )
              )}
            </ul>
          </div>
        </section>

        {/* ==================================================
            OUTCOMES AND TIMELINE
        ================================================== */}

        <section
          className="cfcv-section"
          aria-label="Admission outcomes and proposed timeline"
        >
          <div className="cfcv-container cfcv-results-grid">
            <article className="cfcv-outcomes" data-reveal>
              <SectionLabel>
                ADMISSIONS OUTCOMES
              </SectionLabel>

              <h2 className="cfcv-small-heading">
                Clear outcomes for every applicant.
              </h2>

              <ul className="cfcv-outcomes__list">
                {outcomes.map(
                  ({ title, description, icon: Icon, tone }) => (
                    <li
                      className={`cfcv-outcome cfcv-outcome--${tone}`}
                      key={title}
                    >
                      <span className="cfcv-outcome__icon">
                        <Icon
                          size={20}
                          aria-hidden="true"
                        />
                      </span>

                      <div>
                        <h3>{title}</h3>
                        <p>{description}</p>
                      </div>
                    </li>
                  )
                )}
              </ul>

              <p className="cfcv-section-note">
                Each cohort admits up to 30 ventures
                across all three tracks.
              </p>
            </article>

            <article className="cfcv-card cfcv-timeline" data-reveal>
              <SectionLabel>
                PROPOSED ADMISSIONS TIMELINE
              </SectionLabel>

              <h2 className="cfcv-small-heading">
                A transparent and structured process.
              </h2>

              <ol className="cfcv-timeline__list">
                {timeline.map((item) => (
                  <li key={item.title}>
                    <span className="cfcv-timeline__timing">
                      {item.timing}
                    </span>

                    <div>
                      <h3>{item.title}</h3>

                      <p>{item.description}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </article>
          </div>
        </section>

        {/* ==================================================
            COMPLETE PATH
        ================================================== */}

        <section
          className="cfcv-section cfcv-section--soft"
          aria-labelledby="cfcv-path-title"
        >
          <div className="cfcv-container">
            <header className="cfcv-heading" data-reveal>
              <SectionLabel>
                THE COMPLETE PATH
              </SectionLabel>

              <h2 id="cfcv-path-title">
                From application to impact.
              </h2>
            </header>

            <ol className="cfcv-path" data-reveal>
              {pathway.map((item, index) => (
                <li key={item.title}>
                  <span
                    className="cfcv-path__number"
                    aria-hidden="true"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ==================================================
            MISSION
        ================================================== */}

        <section
          className="cfcv-mission"
          aria-labelledby="cfcv-mission-title"
        >
          <OptionalImage
            src={`${IMAGE_ROOT}/ascend.jpg`}
            className="cfcv-mission__image"
            loading="lazy"
            decoding="async"
          />

          <div className="cfcv-container cfcv-mission__content" data-reveal>
            <SectionLabel light>
              OUR MISSION
            </SectionLabel>

            <h2 id="cfcv-mission-title">
              Real businesses.
              Cross-continental opportunity.
            </h2>

            <p>
              We bring African and U.S. / diaspora founders
              together to build real businesses, provide
              fellowship funding to the strongest opportunities,
              and create a pathway to investment readiness
              and global growth.
            </p>
          </div>
        </section>

        {/* ==================================================
            FINAL APPLICATION CTA
        ================================================== */}

        <section
          className="cfcv-section cfcv-final"
          aria-labelledby="cfcv-final-title"
        >
          <div className="cfcv-container">
            <div className="cfcv-final__card" data-reveal>
              <h2 id="cfcv-final-title">
                Build your next chapter.
              </h2>

              <div className="cfcv-final__action">
                <p>
                  Begin the CFCV admissions process.
                  Submit your founder and venture application.
                </p>

                <ApplyButton tone="navy" />
              </div>
            </div>
          </div>
        </section>
      </main>

    </div>
  );
}
