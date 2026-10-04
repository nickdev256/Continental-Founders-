import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Globe2,
  Handshake,
  Lightbulb,
  Rocket,
  Scale,
  Target,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";

import "./CFCV.css";

/* ============================================================
   CONTINENTAL FOUNDERS CATALYTIC VENTURES
   CFCV FELLOWSHIP

   Content on this page is based on the
   CFCV Fellowship Admissions Framework.
============================================================ */


/* ============================================================
   PROGRAM TRACKS
============================================================ */

const tracks = [
  {
    number: "01",
    name: "GENESIS",
    tagline: "BUILD IT",
    icon: Lightbulb,

    bestFit:
      "Idea, problem, or early concept", 

    focus: [
      "Customer discovery",
      "Validation",
      "Business model",
      "Co-founder relationship",
      "MVP / prototype",
    ],

    outcome:
      "Validated concept, cross-continental founding team, and MVP / proof of concept",
  },

  {
    number: "02",
    name: "ASCEND",
    tagline: "PROVE IT",
    icon: TrendingUp,

    bestFit:
      "MVP, prototype, pilot, or early traction",

    focus: [
      "Market testing",
      "Pilots",
      "Financial model",
      "Revenue strategy",
      "Legal / governance",
      "Investment readiness",
    ],

    outcome:
      "Stronger venture with demonstrated traction and investment pathway",
  },

  {
    number: "03",
    name: "HORIZON",
    tagline: "SCALE IT",
    icon: Rocket,

    bestFit:
      "Operating business with customers, revenue, contracts, pilots, or partnerships",

    focus: [
      "Expansion",
      "Capital strategy",
      "Strategic partnerships",
      "Governance",
      "Scaling",
    ],

    outcome:
      "Scale-ready venture positioned for market expansion and investment",
  },
];


/* ============================================================
   ADMISSIONS WORKFLOW
============================================================ */

const workflow = [
  {
    number: "01",
    name: "APPLY",
    description:
      "Founder submits an application describing their background, venture or idea, current stage, target market, team, and goals.",
  },

  {
    number: "02",
    name: "ASSESS",
    description:
      "CFCV evaluates founder readiness, venture potential, commitment, integrity, relevant skills, collaboration, cross-cultural readiness, and ability to complete the six-month program.",
  },

  {
    number: "03",
    name: "PLACE",
    description:
      "CFCV determines whether the venture is best suited for Genesis, Ascend, or Horizon based on business readiness.",
  },

  {
    number: "04",
    name: "MATCH",
    description:
      "If needed, CFCV identifies a compatible collaborator from the other geography and conducts a founder compatibility process.",
  },

  {
    number: "05",
    name: "ADMIT",
    description:
      "CFCV makes final admissions decisions and selects up to 30 ventures across the three tracks.",
  },
];


/* ============================================================
   FOUNDER ASSESSMENT
============================================================ */

const founderAssessment = [
  "Commitment to becoming or continuing as a serious founder",
  "Integrity and professionalism",
  "Entrepreneurial potential and problem-solving ability",
  "Relevant skills and experience",
  "Willingness and ability to collaborate",
  "Ability to work effectively across cultures and geographies",
  "Ability to complete the six-month program",
];


/* ============================================================
   MATCHING CRITERIA
============================================================ */

const matchingCriteria = [
  "Skills and complementary capabilities",
  "Sector and business interests",
  "Entrepreneurial and professional experience",
  "Market knowledge",
  "Geographic connections",
  "Personality and working style",
  "Time commitment",
  "Leadership strengths",
  "Long-term objectives",
];


/* ============================================================
   COMPATIBILITY SPRINT
============================================================ */

const compatibilityQuestions = [
  "Who is responsible for what?",
  "How will decisions be made?",
  "How much time can each founder commit?",
  "What does each founder contribute?",
  "How will disagreements be handled?",
  "What are expectations regarding ownership?",
  "What is the shared long-term vision?",
];


/* ============================================================
   ADMISSION DECISIONS
============================================================ */

const decisions = [
  {
    name: "ADMIT",
    description:
      "Applicant meets requirements and is ready for the fellowship.",
  },

  {
    name: "ADMIT WITH TRACK PLACEMENT",
    description:
      "Applicant is accepted and assigned to Genesis, Ascend, or Horizon.",
  },

  {
    name: "MATCH REQUIRED",
    description:
      "Applicant is promising but needs a cross-continental collaborator before final admission.",
  },

  {
    name: "WAITLIST",
    description:
      "Strong applicant, but cohort capacity is limited.",
  },

  {
    name: "NOT SELECTED",
    description:
      "Applicant does not currently meet fellowship requirements.",
  },
];


/* ============================================================
   ADMISSIONS TIMELINE
============================================================ */

const timeline = [
  {
    timing: "Week 1",
    phase: "Launch",
    activity: "Fellowship announced",
  },

  {
    timing: "Weeks 1–5",
    phase: "Applications Open",
    activity: "Applications accepted",
  },

  {
    timing: "Weeks 3–6",
    phase: "Initial Screening",
    activity: "Eligibility and application review",
  },

  {
    timing: "Weeks 5–7",
    phase: "Founder Assessment",
    activity: "Founder and venture evaluation",
  },

  {
    timing: "Weeks 7–9",
    phase: "Interviews",
    activity: "Selected applicants interviewed",
  },

  {
    timing: "Weeks 8–10",
    phase: "Track Placement",
    activity: "Genesis, Ascend, or Horizon placement",
  },

  {
    timing: "Weeks 9–11",
    phase: "Matching",
    activity: "Cross-continental collaborator matching",
  },

  {
    timing: "Weeks 10–12",
    phase: "Compatibility Sprint",
    activity: "Potential teams work together",
  },

  {
    timing: "Week 12",
    phase: "Final Selection",
    activity: "Admissions Committee decision",
  },

  {
    timing: "Week 13",
    phase: "Offers Released",
    activity: "Acceptance letters issued",
  },

  {
    timing: "Week 14",
    phase: "Enrollment / Orientation",
    activity: "Fellow onboarding",
  },

  {
    timing: "Week 15",
    phase: "Program Begins",
    activity: "Six-month fellowship begins",
  },
];


/* ============================================================
   SMALL REUSABLE COMPONENTS
============================================================ */

function SectionLabel({ children, light = false }) {
  return (
    <div
      className={`cfcv-section-label ${
        light ? "cfcv-section-label--light" : ""
      }`}
    >
      <span aria-hidden="true" />

      <strong>{children}</strong>
    </div>
  );
}


function Checklist({ items }) {
  return (
    <div className="cfcv-checklist">
      {items.map((item) => (
        <div
          className="cfcv-checklist__item"
          key={item}
        >
          <span className="cfcv-checklist__icon">
            <CheckCircle2 size={17} />
          </span>

          <p>{item}</p>
        </div>
      ))}
    </div>
  );
}


/* ============================================================
   PAGE
============================================================ */

function CFCV() {
  return (
    <main className="cfcv-page">

      {/* ======================================================
          HERO
      ====================================================== */}

      <section className="cfcv-hero">

        <div
          className="cfcv-hero__pattern"
          aria-hidden="true"
        />

        <div className="cfcv-container cfcv-hero__inner">

          <div className="cfcv-hero__content">

            <SectionLabel light>
              CONTINENTAL FOUNDERS
            </SectionLabel>

            <p className="cfcv-hero__kicker">
              CATALYTIC VENTURES
            </p>

            <h1>
              CFCV Fellowship
              <br />
              <em>Admissions.</em>
            </h1>

            <p className="cfcv-hero__lead">
              Continental Founders Catalytic Ventures
              (CFCV) is a six-month venture-development
              program that brings together founders in the
              United States/diaspora and Africa to build
              commercially viable businesses together.
            </p>

            <div className="cfcv-hero__actions">

              <Link
                to="/cfcv/apply"
                className="cfcv-button cfcv-button--gold"
              >
                Apply to CFCV

                <ArrowRight size={18} />
              </Link>

              <a
                href="#admissions"
                className="cfcv-button cfcv-button--outline"
              >
                Explore Admissions

                <ChevronRight size={18} />
              </a>

            </div>

          </div>


          <div className="cfcv-hero__summary">

            <div className="cfcv-summary-card">

              <span className="cfcv-summary-card__label">
                PROGRAM
              </span>

              <strong>
                Six-Month
              </strong>

              <p>
                Venture-development program
              </p>

            </div>


            <div className="cfcv-summary-card">

              <span className="cfcv-summary-card__label">
                COHORT
              </span>

              <strong>
                Up to 30
              </strong>

              <p>
                Ventures across three tracks
              </p>

            </div>


            <div className="cfcv-summary-card">

              <span className="cfcv-summary-card__label">
                CONNECTION
              </span>

              <strong>
                Africa ↔ U.S./Diaspora
              </strong>

              <p>
                Cross-continental participation
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* ======================================================
          PROGRAM OVERVIEW
      ====================================================== */}

      <section className="cfcv-section cfcv-section--white">

        <div className="cfcv-container cfcv-overview">

          <div>

            <SectionLabel>
              PROGRAM OVERVIEW
            </SectionLabel>

            <h2 className="cfcv-heading">
              A cross-continental
              <br />
              <em>venture-development program.</em>
            </h2>

          </div>


          <div className="cfcv-overview__copy">

            <p>
              Continental Founders Catalytic Ventures
              (CFCV) is a six-month venture-development
              program that brings together founders in
              the United States/diaspora and Africa to
              build commercially viable businesses
              together.
            </p>

            <p>
              The admissions framework is designed to
              identify promising founders, evaluate the
              founder and venture, place each venture in
              the appropriate development track, create
              meaningful cross-continental
              collaborations, and admit a strong cohort
              of up to 30 ventures.
            </p>

          </div>

        </div>

      </section>


      {/* ======================================================
          ADMISSIONS WORKFLOW
      ====================================================== */}

      <section
        className="cfcv-section cfcv-section--soft"
        id="admissions"
      >

        <div className="cfcv-container">

          <div className="cfcv-section-heading">

            <SectionLabel>
              ADMISSIONS WORKFLOW
            </SectionLabel>

            <h2 className="cfcv-heading">
              Apply. Assess. Place.
              <br />
              <em>Match. Admit.</em>
            </h2>

            <p>
              The admissions process moves applicants
              from initial submission through founder
              and venture assessment, track placement,
              cross-continental matching, compatibility
              review, and final cohort admission.
            </p>

          </div>


          <div className="cfcv-workflow">

            {workflow.map((stage) => (

              <article
                className="cfcv-workflow__item"
                key={stage.name}
              >

                <div className="cfcv-workflow__number">
                  {stage.number}
                </div>

                <div className="cfcv-workflow__body">

                  <h3>
                    {stage.name}
                  </h3>

                  <p>
                    {stage.description}
                  </p>

                </div>

              </article>

            ))}

          </div>

        </div>

      </section>


      {/* ======================================================
          THREE TRACKS
      ====================================================== */}

      <section className="cfcv-section cfcv-section--white">

        <div className="cfcv-container">

          <div className="cfcv-section-heading">

            <SectionLabel>
              TRACK PLACEMENT
            </SectionLabel>

            <h2 className="cfcv-heading">
              Three tracks based on
              <br />
              <em>venture readiness.</em>
            </h2>

            <p>
              Placement is based on the development
              stage of the venture—not simply the
              founder&apos;s academic level.
            </p>

          </div>


          <div className="cfcv-tracks">

            {tracks.map((track) => {

              const Icon = track.icon;

              return (

                <article
                  className="cfcv-track-card"
                  key={track.name}
                >

                  <div className="cfcv-track-card__header">

                    <span className="cfcv-track-card__number">
                      {track.number}
                    </span>

                    <span className="cfcv-track-card__icon">
                      <Icon size={25} />
                    </span>

                  </div>


                  <div className="cfcv-track-card__title">

                    <span>
                      {track.name}
                    </span>

                    <h3>
                      {track.tagline}
                    </h3>

                  </div>


                  <div className="cfcv-track-card__section">

                    <small>
                      BEST FIT
                    </small>

                    <p>
                      {track.bestFit}
                    </p>

                  </div>


                  <div className="cfcv-track-card__section">

                    <small>
                      PRIMARY FOCUS
                    </small>

                    <ul>

                      {track.focus.map((focus) => (

                        <li key={focus}>
                          {focus}
                        </li>

                      ))}

                    </ul>

                  </div>


                  <div className="cfcv-track-card__outcome">

                    <small>
                      EXPECTED OUTCOME
                    </small>

                    <p>
                      {track.outcome}
                    </p>

                  </div>

                </article>

              );

            })}

          </div>

        </div>

      </section>


      {/* ======================================================
          FOUNDER ASSESSMENT
      ====================================================== */}

      <section className="cfcv-section cfcv-assessment">

        <div className="cfcv-container cfcv-two-column">

          <div className="cfcv-two-column__content">

            <SectionLabel light>
              FOUNDER ASSESSMENT
            </SectionLabel>

            <h2>
              What CFCV
              <br />
              <em>evaluates.</em>
            </h2>

            <p>
              The admissions process evaluates both
              the founder and the venture.
            </p>

          </div>


          <div className="cfcv-two-column__panel">

            <Checklist
              items={founderAssessment}
            />

          </div>

        </div>

      </section>


      {/* ======================================================
          FOUNDER INTERVIEW
      ====================================================== */}

      <section className="cfcv-section cfcv-section--white">

        <div className="cfcv-container cfcv-interview">

          <div className="cfcv-interview__intro">

            <SectionLabel>
              FOUNDER INTERVIEW
            </SectionLabel>

            <h2 className="cfcv-heading">
              Founder
              <br />
              <em>conversation.</em>
            </h2>

            <div className="cfcv-interview__duration">

              <Clock3 size={21} />

              <span>
                Recommended format:
                <strong> 30–45 minutes</strong>
              </span>

            </div>

          </div>


          <div className="cfcv-interview__questions">

            <div>
              <span>01</span>
              <p>
                Why entrepreneurship and why this problem?
              </p>
            </div>

            <div>
              <span>02</span>
              <p>
                What makes you uniquely positioned to
                address the opportunity?
              </p>
            </div>

            <div>
              <span>03</span>
              <p>
                What experience and skills do you bring?
              </p>
            </div>

            <div>
              <span>04</span>
              <p>
                What would you need from a
                cross-continental collaborator?
              </p>
            </div>

            <div>
              <span>05</span>
              <p>
                How do you approach disagreement and
                decision-making?
              </p>
            </div>

            <div>
              <span>06</span>
              <p>
                How do you work across cultures and
                geographies?
              </p>
            </div>

            <div>
              <span>07</span>
              <p>
                How much time can you commit?
              </p>
            </div>

            <div>
              <span>08</span>
              <p>
                What are your expectations regarding
                ownership and the future of the company?
              </p>
            </div>

            <div>
              <span>09</span>
              <p>
                What does success look like six months
                from now?
              </p>
            </div>

          </div>

        </div>

      </section>


      {/* ======================================================
          CROSS-CONTINENTAL MATCHING
      ====================================================== */}

      <section className="cfcv-section cfcv-section--soft">

        <div className="cfcv-container cfcv-matching">

          <div className="cfcv-matching__intro">

            <SectionLabel>
              CROSS-CONTINENTAL MATCHING
            </SectionLabel>

            <h2 className="cfcv-heading">
              Africa
              <span className="cfcv-heading__connector">
                ↔
              </span>
              U.S. / Diaspora
            </h2>

            <p>
              Every CFCV venture must ultimately have
              meaningful participation connecting
              Africa and the U.S./diaspora.
            </p>

            <p>
              Applicants may apply with an existing
              team or as an individual founder.
            </p>

          </div>


          <div className="cfcv-matching__criteria">

            <h3>
              Matching Criteria
            </h3>

            <Checklist
              items={matchingCriteria}
            />

          </div>

        </div>

      </section>


      {/* ======================================================
          COMPATIBILITY SPRINT
      ====================================================== */}

      <section className="cfcv-section cfcv-compatibility">

        <div className="cfcv-container">

          <div className="cfcv-compatibility__header">

            <SectionLabel light>
              FOUNDER COMPATIBILITY SPRINT
            </SectionLabel>

            <h2>
              A match does not automatically become a
              <br />
              <em>co-founder relationship.</em>
            </h2>

            <p>
              New pairs should complete a short working
              period before being formally accepted as
              a founding team.
            </p>

          </div>


          <div className="cfcv-compatibility__grid">

            {compatibilityQuestions.map(
              (question, index) => (

                <article
                  key={question}
                  className="cfcv-compatibility__item"
                >

                  <span>
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <p>
                    {question}
                  </p>

                </article>

              )
            )}

          </div>

        </div>

      </section>


      {/* ======================================================
          FINAL ADMISSION DECISIONS
      ====================================================== */}

      <section className="cfcv-section cfcv-section--white">

        <div className="cfcv-container">

          <div className="cfcv-section-heading">

            <SectionLabel>
              FINAL ADMISSION DECISION
            </SectionLabel>

            <h2 className="cfcv-heading">
              Admissions
              <br />
              <em>outcomes.</em>
            </h2>

          </div>


          <div className="cfcv-decisions">

            {decisions.map((decision) => (

              <article
                key={decision.name}
                className="cfcv-decision"
              >

                <div className="cfcv-decision__icon">
                  <UserCheck size={22} />
                </div>

                <div>

                  <h3>
                    {decision.name}
                  </h3>

                  <p>
                    {decision.description}
                  </p>

                </div>

              </article>

            ))}

          </div>


          <div className="cfcv-cohort-note">

            <Users size={25} />

            <p>
              CFCV admits up to
              <strong> 30 ventures </strong>
              across Genesis, Ascend, and Horizon.
            </p>

          </div>

        </div>

      </section>


      {/* ======================================================
          ADMISSIONS TIMELINE
      ====================================================== */}

      <section className="cfcv-section cfcv-section--soft">

        <div className="cfcv-container">

          <div className="cfcv-section-heading">

            <SectionLabel>
              PROPOSED ADMISSIONS TIMELINE
            </SectionLabel>

            <h2 className="cfcv-heading">
              From launch to
              <br />
              <em>fellowship.</em>
            </h2>

          </div>


          <div className="cfcv-timeline">

            {timeline.map((item, index) => (

              <article
                className="cfcv-timeline__item"
                key={`${item.phase}-${item.timing}`}
              >

                <div className="cfcv-timeline__marker">

                  <span>
                    {String(index + 1).padStart(2, "0")}
                  </span>

                </div>


                <div className="cfcv-timeline__content">

                  <small>
                    {item.timing}
                  </small>

                  <h3>
                    {item.phase}
                  </h3>

                  <p>
                    {item.activity}
                  </p>

                </div>

              </article>

            ))}

          </div>

        </div>

      </section>


      {/* ======================================================
          ADMISSIONS FUNNEL
      ====================================================== */}

      <section className="cfcv-section cfcv-funnel">

        <div className="cfcv-container">

          <div className="cfcv-funnel__header">

            <SectionLabel light>
              CFCV ADMISSIONS FUNNEL
            </SectionLabel>

            <h2>
              The path to
              <br />
              <em>admission.</em>
            </h2>

          </div>


          <div className="cfcv-funnel__flow">

            <span>
              RECRUIT
            </span>

            <i>↓</i>

            <span>
              APPLY
            </span>

            <i>↓</i>

            <span>
              ASSESS
              <small>
                Founder + Venture
              </small>
            </span>

            <i>↓</i>

            <span>
              INTERVIEW
            </span>

            <i>↓</i>

            <span>
              PLACE
              <small>
                Genesis | Ascend | Horizon
              </small>
            </span>

            <i>↓</i>

            <span>
              MATCH
              <small>
                Africa ↔ U.S./Diaspora
              </small>
            </span>

            <i>↓</i>

            <span>
              COMPATIBILITY CHECK
            </span>

            <i>↓</i>

            <span>
              ADMIT
              <small>
                Up to 30 Ventures
              </small>
            </span>

            <i>↓</i>

            <span>
              ORIENT
            </span>

            <i>↓</i>

            <span>
              BEGIN SIX-MONTH FELLOWSHIP
            </span>

          </div>

        </div>

      </section>


      {/* ======================================================
          POSITIONING
      ====================================================== */}

      <section className="cfcv-section cfcv-positioning">

        <div className="cfcv-container cfcv-positioning__inner">

          <div className="cfcv-positioning__icon">
            <Globe2 size={34} />
          </div>


          <div>

            <SectionLabel>
              POSITIONING
            </SectionLabel>

            <h2 className="cfcv-heading">
              A selective, cross-continental
              <br />
              <em>venture fellowship.</em>
            </h2>

            <p>
              CFCV should be positioned as a selective,
              cross-continental venture fellowship
              rather than simply an entrepreneurship
              training program.
            </p>

            <p>
              Its purpose is to bring African and
              U.S./diaspora founders together, help them
              build real businesses, provide catalytic
              capital to the strongest opportunities,
              and create a pathway from early idea to
              investment readiness and global growth.
            </p>

          </div>

        </div>

      </section>


      {/* ======================================================
          FINAL CTA
      ====================================================== */}

      <section className="cfcv-final">

        <div
          className="cfcv-final__pattern"
          aria-hidden="true"
        />

        <div className="cfcv-container cfcv-final__inner">

          <SectionLabel light>
            CONTINENTAL FOUNDERS CATALYTIC VENTURES
          </SectionLabel>

          <h2>
            Apply to the
            <br />
            <em>CFCV Fellowship.</em>
          </h2>

          <p>
            Begin the CFCV admissions process by
            submitting your founder and venture
            application.
          </p>


          <div className="cfcv-final__actions">

            <Link
              to="/cfcv/apply"
              className="cfcv-button cfcv-button--gold"
            >
              Start Application

              <ArrowRight size={19} />
            </Link>

          </div>

        </div>

      </section>

    </main>
  );
}

export default CFCV;