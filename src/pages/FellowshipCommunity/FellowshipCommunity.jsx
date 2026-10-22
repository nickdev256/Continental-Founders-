
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Globe2,
  Users,
  Lightbulb,
  Target,
  Rocket,
  ClipboardCheck,
  Search,
  GraduationCap,
  Network,
  Handshake,
  Presentation,
  Compass,
  CheckCircle2,
  HeartHandshake,
  BookOpen,
  TrendingUp,
} from "lucide-react";
import "./FellowshipCommunity.css"; 

const pathways = [
  {
    name: "GENESIS",
    subtitle: "Build It",
    description:
      "Turn your idea into an opportunity. Develop the foundations, skills, and confidence to begin building your venture.",
    icon: Lightbulb,
    color: "genesis",
    link: "/genesis",
    stage: "Idea-stage founders",
    outcomes: ["Clarify your idea", "Test your assumptions", "Build your foundation"],
  },
  {
    name: "ASCEND",
    subtitle: "Prove It",
    description:
      "Strengthen your business, validate demand, refine your model, and build the momentum to move forward.",
    icon: TrendingUp,
    color: "ascend",
    link: "/ascend",
    stage: "Early-stage founders",
    outcomes: ["Validate demand", "Refine your model", "Build traction"],
  },
  {
    name: "HORIZON",
    subtitle: "Scale It",
    description:
      "Expand your reach through stronger systems, strategic partnerships, and opportunities across markets.",
    icon: Rocket,
    color: "horizon",
    link: "/horizon",
    stage: "Growth-stage founders",
    outcomes: ["Strengthen systems", "Build partnerships", "Explore new markets"],
  },
];

const journey = [
  {
    number: "01",
    title: "Find Your Lane",
    description:
      "Explore your current stage, entrepreneurial goals, and the support you need.",
    icon: Compass,
  },
  {
    number: "02",
    title: "Express Your Interest",
    description:
      "Share your venture, aspirations, challenges, and interest in joining the fellowship.",
    icon: ClipboardCheck,
  },
  {
    number: "03",
    title: "Review & Selection",
    description:
      "Applications are reviewed, and selected founders receive further communication about placement.",
    icon: Search,
  },
  {
    number: "04",
    title: "Six-Month Fellowship",
    description:
      "Learn, collaborate, strengthen your venture, and build relationships with founders across continents.",
    icon: Users,
  },
  {
    number: "05",
    title: "Graduation & Showcase",
    description:
      "Share your progress, communicate your venture's development, and connect with potential partners.",
    icon: Presentation,
  },
  {
    number: "06",
    title: "Alumni Network",
    description:
      "Continue building relationships and exploring opportunities beyond the fellowship experience.",
    icon: Network,
  },
];

const experiences = [
  {
    icon: BookOpen,
    title: "Learn with Purpose",
    description:
      "Engage with practical ideas and experiences that help you think critically about your venture.",
  },
  {
    icon: Users,
    title: "Build Together",
    description:
      "Connect with founders at different stages and learn from their experiences and perspectives.",
  },
  {
    icon: Globe2,
    title: "Think Across Continents",
    description:
      "Explore how relationships across Africa and the United States can open new ways of thinking and collaborating.",
  },
  {
    icon: Handshake,
    title: "Create Meaningful Connections",
    description:
      "Develop relationships that can support collaboration, partnerships, and future opportunities.",
  },
];

export default function FellowshipCommunity() {
  return (
    <main className="fc-page">
      {/* HERO */}
      <section className="fc-hero">
<div className="fc-container fc-hero-content">
          <span className="fc-eyebrow">
            CONTINENTAL FOUNDERS FELLOWSHIP
          </span>

          <h1>
            One Cohort.
            <br />
            <span>Two Continents.</span>
            <br />
            One Shared Future.
          </h1>

          <p className="fc-hero-description">
            A six-month founder-development experience bringing entrepreneurs
            together to strengthen their leadership, advance their ventures,
            and build relationships across continents.
          </p>

          <div className="fc-hero-actions">
            <Link to="/find-your-lane" className="fc-btn fc-btn-gold">
              Find Your Lane <ArrowRight size={18} />
            </Link>

            <a href="#fc-experience" className="fc-btn fc-btn-outline">
              Explore the Experience
            </a>
          </div>

          <div className="fc-hero-note">
            <Globe2 size={18} />
            <span>
              Connecting talent. Building across continents.
            </span>
          </div>
        </div>
      </section>

      {/* INTRODUCTION */}
      <section className="fc-section fc-intro">
        <div className="fc-container fc-intro-grid">
          <div className="fc-intro-heading">
            <span className="fc-section-label">THE FELLOWSHIP</span>
            <h2>
              Different journeys.
              <br />
              <span>A shared future.</span>
            </h2>
          </div>

          <div className="fc-intro-copy">
            <p>
              Every founder starts somewhere. Some are turning an idea into
              their first venture. Others are proving their business model or
              preparing to enter new markets.
            </p>
            <p>
              The Continental Founders Fellowship brings founders at these
              different stages into one cohort, with pathways designed around
              their needs and a shared experience built around learning,
              collaboration, and cross-continental relationships.
            </p>
          </div>
        </div>
      </section>

      {/* THREE PATHWAYS */}
      <section className="fc-section fc-pathways" id="fc-pathways">
        <div className="fc-container">
          <div className="fc-section-heading">
            <span className="fc-section-label">YOUR ENTREPRENEURIAL JOURNEY</span>
            <h2>Three Pathways. One Cohort.</h2>
            <p>
              Find the pathway that reflects where you are and where you want
              to go. Each pathway offers a different focus within the shared
              fellowship experience.
            </p>
          </div>

          <div className="fc-pathway-grid">
            {pathways.map((pathway) => {
              const Icon = pathway.icon;

              return (
                <article
                  className={`fc-pathway-card fc-${pathway.color}`}
                  key={pathway.name}
                >
                  <div className="fc-pathway-top">
                    <span className="fc-pathway-icon">
                      <Icon size={31} strokeWidth={1.8} />
                    </span>
                    <span className="fc-pathway-stage">{pathway.stage}</span>
                  </div>

                  <h3>{pathway.name}</h3>
                  <h4>{pathway.subtitle}</h4>
                  <p className="fc-pathway-description">
                    {pathway.description}
                  </p>

                  <div className="fc-pathway-outcomes">
                    {pathway.outcomes.map((outcome) => (
                      <div key={outcome} className="fc-outcome">
                        <CheckCircle2 size={16} />
                        <span>{outcome}</span>
                      </div>
                    ))}
                  </div>

                  <Link to={pathway.link} className="fc-pathway-link">
                    Explore {pathway.name} <ArrowRight size={17} />
                  </Link>
                </article>
              );
            })}
          </div>

          <div className="fc-pathway-bottom">
            <Compass size={23} />
            <p>
              Not sure where you fit? Start with a few guided questions to
              explore which pathway may align with your current stage and goals.
            </p>
            <Link to="/find-your-lane" className="fc-text-link">
              Find Your Lane <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* SHARED EXPERIENCE */}
      <section className="fc-section fc-experience" id="fc-experience">
        <div className="fc-container">
          <div className="fc-section-heading fc-heading-light">
            <span className="fc-section-label">BEYOND THE PATHWAY</span>
            <h2>One Fellowship. A Shared Experience.</h2>
            <p>
              Your pathway provides a focus. The fellowship creates space to
              learn, connect, challenge assumptions, and build alongside other
              founders.
            </p>
          </div>

          <div className="fc-experience-grid">
            {experiences.map((item) => {
              const Icon = item.icon;

              return (
                <article className="fc-experience-card" key={item.title}>
                  <div className="fc-experience-icon">
                    <Icon size={25} />
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </article>
              );
            })}
          </div>

          <div className="fc-shared-banner">
            <div className="fc-shared-symbol">
              <HeartHandshake size={34} />
            </div>
            <div>
              <h3>Different stages. Shared learning.</h3>
              <p>
                Genesis, Ascend, and Horizon founders move through the
                fellowship as one cohort, with pathway-specific focus and
                opportunities to learn from one another.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOUNDER TRANSFORMATION */}
      <section className="fc-section fc-transformation">
        <div className="fc-container fc-transformation-grid">
          <div className="fc-transformation-copy">
            <span className="fc-section-label">YOUR DEVELOPMENT</span>
            <h2>
              Build beyond
              <br />
              where you are.
            </h2>
            <p>
              The fellowship is designed to help you examine your assumptions,
              strengthen your leadership, make more informed decisions, and
              approach your venture with greater clarity.
            </p>
            <p>
              Your journey will depend on your starting point, the work you
              undertake, and the goals you pursue.
            </p>
            <Link to="/find-your-lane" className="fc-btn fc-btn-navy">
              Start Your Journey <ArrowRight size={18} />
            </Link>
          </div>

          <div className="fc-transformation-list">
            <div className="fc-transformation-item">
              <span>01</span>
              <div>
                <h3>Clarity</h3>
                <p>Understand your priorities and the next steps for your venture.</p>
              </div>
            </div>

            <div className="fc-transformation-item">
              <span>02</span>
              <div>
                <h3>Capability</h3>
                <p>Develop your thinking, leadership, and approach to building.</p>
              </div>
            </div>

            <div className="fc-transformation-item">
              <span>03</span>
              <div>
                <h3>Connection</h3>
                <p>Build relationships with peers and people across markets.</p>
              </div>
            </div>

            <div className="fc-transformation-item">
              <span>04</span>
              <div>
                <h3>Opportunity</h3>
                <p>Identify possibilities for collaboration and future growth.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THE JOURNEY */}
      <section className="fc-section fc-journey" id="fc-journey">
        <div className="fc-container">
          <div className="fc-section-heading">
            <span className="fc-section-label">FROM INTEREST TO BEYOND</span>
            <h2>Your Fellowship Journey</h2>
            <p>
              Explore the steps from discovering your pathway to continuing
              your connections as a member of the alumni network.
            </p>
          </div>

          <div className="fc-journey-grid">
            {journey.map((step, index) => {
              const Icon = step.icon;

              return (
                <article className="fc-journey-step" key={step.number}>
                  <div className="fc-journey-number">{step.number}</div>
                  <div className="fc-journey-icon">
                    <Icon size={25} />
                  </div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>

                  {index < journey.length - 1 && (
                    <ArrowRight
                      className="fc-journey-arrow"
                      size={20}
                      aria-hidden="true"
                    />
                  )}
                </article>
              );
            })}
          </div>

          <p className="fc-journey-note">
            Application, review, selection, and final pathway placement are
            subject to the fellowship's process and confirmation.
          </p>
        </div>
      </section>

      {/* GRADUATION AND ALUMNI */}
      <section className="fc-section fc-alumni">
        <div className="fc-container fc-alumni-grid">
          <div className="fc-alumni-icon">
            <GraduationCap size={44} />
          </div>

          <div className="fc-alumni-copy">
            <span className="fc-section-label">THE JOURNEY CONTINUES</span>
            <h2>Graduation is a milestone, not the end.</h2>
            <p>
              The fellowship journey extends beyond the six-month experience.
              Through the Continental Founders alumni network, fellows can
              continue building relationships, exploring collaborations, and
              engaging with opportunities across continents.
            </p>
          </div>

          <div className="fc-alumni-points">
            <div>
              <CheckCircle2 size={18} />
              <span>Celebrate progress and learning</span>
            </div>
            <div>
              <CheckCircle2 size={18} />
              <span>Showcase your venture's development</span>
            </div>
            <div>
              <CheckCircle2 size={18} />
              <span>Stay connected with fellow founders</span>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="fc-section fc-final-cta">
        <div className="fc-container fc-final-cta-inner">
          <span className="fc-section-label">YOUR NEXT CHAPTER STARTS HERE</span>
          <h2>Your vision has a future.</h2>
          <p>
            Discover your starting point and explore the pathway that may fit
            your entrepreneurial journey.
          </p>

          <div className="fc-final-actions">
            <Link to="/find-your-lane" className="fc-btn fc-btn-gold">
              Find Your Lane <ArrowRight size={18} />
            </Link>
            <Link to="/pathways" className="fc-btn fc-btn-outline">
              View All Pathways
            </Link>
          </div>

          <small>
            Exploring a pathway is not an offer of admission. Final placement
            depends on the fellowship's review process, readiness, goals, and
            needs.
          </small>
        </div>
      </section>
    </main>
  );
}
