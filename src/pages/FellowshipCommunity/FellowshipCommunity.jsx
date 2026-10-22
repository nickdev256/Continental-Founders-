
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Globe2,
  Users,
  Lightbulb,
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
import { useState } from "react";
import "./FellowshipCommunity.css";

const initialInterestForm = {
  region: "",
  stage: "",
  challenge: "",
  goal: "",
  pathway: "Not sure",
};

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
    outcomes: [
      "Clarify your idea",
      "Test your assumptions",
      "Build your foundation",
    ],
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
    outcomes: [
      "Validate demand",
      "Refine your model",
      "Build traction",
    ],
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
    outcomes: [
      "Strengthen systems",
      "Build partnerships",
      "Explore new markets",
    ],
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
  // EXPRESS YOUR INTEREST FORM STATE
  const [interestForm, setInterestForm] = useState(initialInterestForm);

  const handleInterestChange = (event) => {
    const { name, value } = event.target;

    setInterestForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleInterestReset = () => {
    setInterestForm({ ...initialInterestForm });
  };

  const handleInterestSubmit = (event) => {
    event.preventDefault();

    const labels = {
      region: "Community",
      stage: "Business stage",
      challenge: "Biggest challenge",
      goal: "Cross-continental goals",
      pathway: "Pathway of interest",
    };

    const content =
      "CONTINENTAL FOUNDERS — PERSONAL INTEREST NOTES\n\n" +
      Object.entries(interestForm)
        .map(
          ([key, value]) =>
            `${labels[key]}: ${value || "Not provided"}`
        )
        .join("\n\n") +
      "\n\nThis is not an application submission.";

    const blob = new Blob([content], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "Continental_Founders_Interest_Notes.txt";
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 1000);
  };

  return (
    <main className="fc-page">
      {/* HERO */}
      <section className="fc-hero">
        <div className="fc-hero-pattern" aria-hidden="true">
          <Globe2 size={280} strokeWidth={0.45} />
        </div>

        <div className="fc-container fc-hero-content">
          <span className="fc-eyebrow">
            A TRANSATLANTIC FOUNDER FELLOWSHIP
          </span>

          <h1>
            Build Your Business.
            <br />
            Connect Continents.
          </h1>

          <p className="fc-hero-description">
            For entrepreneurs across Africa and U.S.-based entrepreneurs
            of African descent. Different stages. One shared cohort.
            Professional relationships that can open doors to future
            international trade.
          </p>

          <div className="fc-hero-actions">
            <Link
              to="/find-your-lane"
              className="fc-btn fc-btn-gold"
            >
              Find Your Lane <ArrowRight size={18} />
            </Link>

            <a
              href="#fc-experience"
              className="fc-btn fc-btn-outline"
            >
              Explore Our Community
            </a>
          </div>

          <div className="fc-hero-highlights">
            <div className="fc-highlight">
              <h3>ONE COHORT</h3>
              <p>Learn and collaborate together</p>
            </div>

            <div className="fc-highlight">
              <h3>TWO CONTINENTS</h3>
              <p>Africa and the United States</p>
            </div>

            <div className="fc-highlight">
              <h3>THREE PATHWAYS</h3>
              <p>Genesis · Ascend · Horizon</p>
            </div>
          </div>
        </div>
      </section>

      {/* WHO BELONGS HERE */}
      <section className="fc-belongs">
        <div className="fc-container">
          <span className="fc-belongs-eyebrow">
            WHO BELONGS HERE
          </span>

          <h2 className="fc-belongs-title">
            Built for a connected African entrepreneurial future.
          </h2>

          <p className="fc-belongs-intro">
            Our intended Fellowship community brings together
            entrepreneurs based in African countries and U.S.-based
            founders of African descent—including African Americans,
            Afro-Caribbeans, African immigrants, and others of African
            ancestry.
          </p>

          <p className="fc-belongs-description">
            Whether you have an idea, are building traction, or are ready
            to expand, you can contribute to a cohort where founders
            share perspectives, exchange market knowledge, and build
            lasting professional relationships.
          </p>
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
              Every founder starts somewhere. Some are turning an idea
              into their first venture. Others are proving their
              business model or preparing to enter new markets.
            </p>

            <p>
              The Continental Founders Fellowship brings founders at
              these different stages into one cohort, with pathways
              designed around their needs and a shared experience built
              around learning, collaboration, and cross-continental
              relationships.
            </p>
          </div>
        </div>
      </section>

      {/* THREE PATHWAYS */}
      <section
        className="fc-section fc-pathways"
        id="fc-pathways"
      >
        <div className="fc-container">
          <div className="fc-section-heading">
            <span className="fc-section-label">
              YOUR ENTREPRENEURIAL JOURNEY
            </span>

            <h2>Three Pathways. One Cohort.</h2>

            <p>
              Find the pathway that reflects where you are and where
              you want to go. Each pathway offers a different focus
              within the shared fellowship experience.
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

                    <span className="fc-pathway-stage">
                      {pathway.stage}
                    </span>
                  </div>

                  <h3>{pathway.name}</h3>
                  <h4>{pathway.subtitle}</h4>

                  <p className="fc-pathway-description">
                    {pathway.description}
                  </p>

                  <div className="fc-pathway-outcomes">
                    {pathway.outcomes.map((outcome) => (
                      <div className="fc-outcome" key={outcome}>
                        <CheckCircle2 size={16} />
                        <span>{outcome}</span>
                      </div>
                    ))}
                  </div>

                  <Link
                    to={pathway.link}
                    className="fc-pathway-link"
                  >
                    Explore {pathway.name} <ArrowRight size={17} />
                  </Link>
                </article>
              );
            })}
          </div>

          <div className="fc-pathway-bottom">
            <Compass size={23} />

            <p>
              Not sure where you fit? Start with a few guided questions
              to explore which pathway may align with your current stage
              and goals.
            </p>

            <Link
              to="/find-your-lane"
              className="fc-text-link"
            >
              Find Your Lane <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* SHARED EXPERIENCE */}
      <section
        className="fc-section fc-experience"
        id="fc-experience"
      >
        <div className="fc-container">
          <div className="fc-section-heading fc-heading-light">
            <span className="fc-section-label">
              BEYOND THE PATHWAY
            </span>

            <h2>One Fellowship. A Shared Experience.</h2>

            <p>
              Your pathway provides a focus. The fellowship creates
              space to learn, connect, challenge assumptions, and build
              alongside other founders.
            </p>
          </div>

          <div className="fc-experience-grid">
            {experiences.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  className="fc-experience-card"
                  key={item.title}
                >
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
                fellowship as one cohort, with pathway-specific focus
                and opportunities to learn from one another.
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
              The fellowship is designed to help you examine your
              assumptions, strengthen your leadership, make more
              informed decisions, and approach your venture with
              greater clarity.
            </p>

            <p>
              Your journey will depend on your starting point, the work
              you undertake, and the goals you pursue.
            </p>

            <Link
              to="/find-your-lane"
              className="fc-btn fc-btn-navy"
            >
              Start Your Journey <ArrowRight size={18} />
            </Link>
          </div>

          <div className="fc-transformation-list">
            <div className="fc-transformation-item">
              <span>01</span>
              <div>
                <h3>Clarity</h3>
                <p>
                  Understand your priorities and the next steps for
                  your venture.
                </p>
              </div>
            </div>

            <div className="fc-transformation-item">
              <span>02</span>
              <div>
                <h3>Capability</h3>
                <p>
                  Develop your thinking, leadership, and approach to
                  building.
                </p>
              </div>
            </div>

            <div className="fc-transformation-item">
              <span>03</span>
              <div>
                <h3>Connection</h3>
                <p>
                  Build relationships with peers and people across
                  markets.
                </p>
              </div>
            </div>

            <div className="fc-transformation-item">
              <span>04</span>
              <div>
                <h3>Opportunity</h3>
                <p>
                  Identify possibilities for collaboration and future
                  growth.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THE JOURNEY */}
      <section
        className="fc-section fc-journey"
        id="fc-journey"
      >
        <div className="fc-container">
          <div className="fc-section-heading">
            <span className="fc-section-label">
              FROM INTEREST TO BEYOND
            </span>

            <h2>Your Fellowship Journey</h2>

            <p>
              Explore the steps from discovering your pathway to
              continuing your connections as a member of the alumni
              network.
            </p>
          </div>

          <div className="fc-journey-grid">
            {journey.map((step, index) => {
              const Icon = step.icon;

              return (
                <article
                  className="fc-journey-step"
                  key={step.number}
                >
                  <div className="fc-journey-number">
                    {step.number}
                  </div>

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
            Application, review, selection, and final pathway placement
            are subject to the fellowship's process and confirmation.
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
            <span className="fc-section-label">
              THE JOURNEY CONTINUES
            </span>

            <h2>Graduation is a milestone, not the end.</h2>

            <p>
              The fellowship journey extends beyond the six-month
              experience. Through the Continental Founders alumni
              network, fellows can continue building relationships,
              exploring collaborations, and engaging with opportunities
              across continents.
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
          <span className="fc-section-label">
            YOUR NEXT CHAPTER STARTS HERE
          </span>

          <h2>Your vision has a future.</h2>

          <p>
            Discover your starting point and explore the pathway that
            may fit your entrepreneurial journey.
          </p>

          <div className="fc-final-actions">
            <Link
              to="/find-your-lane"
              className="fc-btn fc-btn-gold"
            >
              Find Your Lane <ArrowRight size={18} />
            </Link>

            <Link
              to="/pathways"
              className="fc-btn fc-btn-outline"
            >
              View All Pathways
            </Link>
          </div>

          <small>
            Exploring a pathway is not an offer of admission. Final
            placement depends on the fellowship's review process,
            readiness, goals, and needs.
          </small>
        </div>
      </section>

      {/* EXPRESS YOUR INTEREST */}
      <section
        className="fc-section fc-interest"
        id="interest"
      >
        <div className="fc-container">
          <span className="fc-eyebrow">Your next step</span>

          <h2>Express Your Interest</h2>

          <p className="fc-interest-intro">
            Share a little about yourself. This form lets you prepare
            your answers without submitting personal data to a server.
          </p>

          <div className="fc-interest-formwrap">
            <form
              onSubmit={handleInterestSubmit}
              onReset={handleInterestReset}
            >
              <label htmlFor="interest-region">
                Which community best describes you?
              </label>

              <select
                id="interest-region"
                name="region"
                value={interestForm.region}
                onChange={handleInterestChange}
                required
              >
                <option value="">Select one</option>
                <option value="Entrepreneur based in Africa">
                  Entrepreneur based in Africa
                </option>
                <option value="U.S.-based entrepreneur of African descent">
                  U.S.-based entrepreneur of African descent
                </option>
                <option value="Not sure / want to ask about eligibility">
                  Not sure / want to ask about eligibility
                </option>
              </select>

              <label htmlFor="interest-stage">
                Your current business stage
              </label>

              <select
                id="interest-stage"
                name="stage"
                value={interestForm.stage}
                onChange={handleInterestChange}
                required
              >
                <option value="">Select one</option>
                <option value="Idea stage">Idea stage</option>
                <option value="Early operating business">
                  Early operating business
                </option>
                <option value="Growth-stage business">
                  Growth-stage business
                </option>
                <option value="Not sure">Not sure</option>
              </select>

              <label htmlFor="interest-challenge">
                Your biggest current challenge
              </label>

              <select
                id="interest-challenge"
                name="challenge"
                value={interestForm.challenge}
                onChange={handleInterestChange}
                required
              >
                <option value="">Select one</option>
                <option value="Validating my idea">
                  Validating my idea
                </option>
                <option value="Finding customers and revenue">
                  Finding customers and revenue
                </option>
                <option value="Strengthening operations">
                  Strengthening operations
                </option>
                <option value="Building partnerships or entering new markets">
                  Building partnerships or entering new markets
                </option>
                <option value="Identifying my next step">
                  Identifying my next step
                </option>
              </select>

              <label htmlFor="interest-goal">
                What do you hope to gain from a cross-continental cohort?
              </label>

              <textarea
                id="interest-goal"
                name="goal"
                value={interestForm.goal}
                onChange={handleInterestChange}
                maxLength={1200}
                placeholder="Describe your goals and the relationships you hope to build."
              />

              <label htmlFor="interest-pathway">
                Pathway of interest
              </label>

              <select
                id="interest-pathway"
                name="pathway"
                value={interestForm.pathway}
                onChange={handleInterestChange}
              >
                <option value="Not sure">Not sure</option>
                <option value="Genesis">Genesis</option>
                <option value="Ascend">Ascend</option>
                <option value="Horizon">Horizon</option>
              </select>

              <div className="fc-interest-actions">
                <button
                  className="fc-btn fc-btn-gold"
                  type="submit"
                >
                  Save My Answers
                </button>

                <button
                  className="fc-btn fc-btn-outline"
                  type="reset"
                >
                  Clear Form
                </button>
              </div>

              <p className="fc-interest-note">
                Your answers stay in this form unless you save them as
                a local text file. This prototype does not submit
                applications or store data on a server.
              </p>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
