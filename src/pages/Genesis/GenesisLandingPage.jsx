import { useState } from "react";
import "./GenesisLandingPage.css";

export default function GenesisLandingPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;

    if (!form.reportValidity()) return;

    const formData = new FormData(form);

    const lines = [
      "CONTINENTAL FOUNDERS — GENESIS EXPRESSION OF INTEREST",
      "DRAFT ONLY — NOT SUBMITTED",
      "",
    ];

    for (const [key, value] of formData.entries()) {
      if (key === "ack") continue;

      lines.push(
        `${key.replaceAll("_", " ").toUpperCase()}: ${value}`
      );
    }

    const blob = new Blob([lines.join("\n")], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "CF_GENESIS_Interest_Draft.txt";

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.setTimeout(() => URL.revokeObjectURL(url), 1000);

    setSubmitted(true);
  }

  return (
    <div className="genesis-page">
      {/* Navigation */}
      <header>
        <div className="wrap nav">
          <a className="brand" href="#top">
            <img
              src="/assets/continental-founders-logo.webp"
              alt="Continental Founders logo"
            />

            <span>
              CONTINENTAL
              <br />
              FOUNDERS
            </span>
          </a>

          <nav className="links" aria-label="Pathways">
            <a className="active" href="/genesis">
              Genesis
            </a>

            <a href="/ascend">Ascend</a>

            <a href="/horizon">Horizon</a>

            <a href="#interest">Express Interest</a>
          </nav>
        </div>
      </header>

      <main id="top">
        {/* Hero */}
        <section className="hero">
          <div className="wrap hero-inner">
            <div>
              <div className="eyebrow">
                01 / YOUR IDEA HAS A FUTURE
              </div>

              <h1>
                Start with an idea.
                <br />
                <em>Build with a community.</em>
              </h1>

              <p>
                Have a business idea but aren't sure where to begin?
                Genesis helps you turn it into a practical concept while
                connecting with entrepreneurs across Africa and the
                U.S. African diaspora.
              </p>

              <div className="actions">
                <a className="btn" href="#interest">
                  Express My Interest →
                </a>

                <a className="btn secondary" href="#pathways">
                  Explore All Pathways
                </a>
              </div>
            </div>

            <aside className="hero-card">
              <span className="num">
                CONTINENTAL FOUNDERS / IDEA STAGE
              </span>

              <h2>
                GENESIS
                <br />
                BUILD IT
              </h2>

              <p>
                One Cohort. Two Continents. Three Pathways.
                One Shared Future.
              </p>

              <div className="pill">
                Africa + U.S. African diaspora
              </div>
            </aside>
          </div>
        </section>

        {/* Who Genesis is for */}
        <section className="section">
          <div className="wrap">
            <div className="kicker">Recognize yourself</div>

            <h2>Does this sound like you?</h2>

            <p className="lead">
              You don't have to decide your final Fellowship placement
              before expressing interest.
            </p>

            <ul className="check">
              <li>
                I have a business idea, but I don't know how to begin.
              </li>

              <li>
                I believe my idea could solve a problem, but I haven't
                tested it.
              </li>

              <li>
                I'm unsure who my customers are or whether they will pay.
              </li>

              <li>
                I need mentorship and a supportive entrepreneurial
                community.
              </li>

              <li>
                I want to build relationships across Africa and the
                United States.
              </li>

              <li>
                I want to turn my experience or passion into a business.
              </li>
            </ul>
          </div>
        </section>

        {/* Challenges */}
        <section className="section alt">
          <div className="wrap">
            <div className="kicker">Your challenges</div>

            <h2>What we help you work through</h2>

            <div className="comparison">
              <div className="problem">
                <strong>I don't know where to start</strong>
                <span>
                  Focus your idea into a clear business concept.
                </span>
              </div>

              <div className="problem">
                <strong>I don't know my customers</strong>
                <span>
                  Identify the people, needs, and problems to solve.
                </span>
              </div>

              <div className="problem">
                <strong>I'm afraid of costly mistakes</strong>
                <span>
                  Test assumptions before committing major resources.
                </span>
              </div>

              <div className="problem">
                <strong>I lack business experience</strong>
                <span>
                  Learn foundational entrepreneurial and
                  decision-making skills.
                </span>
              </div>

              <div className="problem">
                <strong>I don't have a network</strong>
                <span>
                  Connect with founders at different stages and
                  across continents.
                </span>
              </div>

              <div className="problem">
                <strong>I don't know my next step</strong>
                <span>
                  Create an actionable roadmap with milestones.
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="section">
          <div className="wrap">
            <div className="kicker">Your value</div>

            <h2>
              Build more than a business idea. Build your foundation
              and your network.
            </h2>

            <p className="lead">
              Receive stage-appropriate development while collaborating
              with founders at different stages across Africa and the
              U.S. African diaspora. The aim is stronger business
              capability and relationships that may grow into future
              partnerships and trade.
            </p>

            <div className="grid">
              <article className="card">
                <h3>Business clarity</h3>
                <p>Define your problem, solution, and purpose.</p>
              </article>

              <article className="card">
                <h3>Customer understanding</h3>
                <p>Identify and listen to potential customers.</p>
              </article>

              <article className="card">
                <h3>Idea validation</h3>
                <p>Test assumptions and gather feedback.</p>
              </article>

              <article className="card">
                <h3>Practical skills</h3>
                <p>Explore models, pricing, planning, and execution.</p>
              </article>

              <article className="card">
                <h3>Cross-continental connections</h3>
                <p>Build relationships across Africa and the U.S.</p>
              </article>

              <article className="card">
                <h3>Next-step roadmap</h3>
                <p>Set realistic validation or launch milestones.</p>
              </article>
            </div>
          </div>
        </section>

        {/* Fellowship pathways */}
        <section className="section alt" id="pathways">
          <div className="wrap">
            <div className="kicker">Our difference</div>

            <h2>Three pathways. One shared cohort.</h2>

            <p className="lead">
              Genesis, Ascend, and Horizon are not isolated programs.
              Founders learn together, exchange experience, and build
              lasting cross-continental professional relationships,
              with pathway-specific learning matched to their business
              needs.
            </p>

            <div className="pathways">
              <a className="path current" href="/genesis">
                <small>IDEA STAGE</small>
                <strong>GENESIS</strong>
                <br />
                BUILD IT
              </a>

              <a className="path" href="/ascend">
                <small>EARLY OPERATING</small>
                <strong>ASCEND</strong>
                <br />
                PROVE IT
              </a>

              <a className="path" href="/horizon">
                <small>GROWTH-READY</small>
                <strong>HORIZON</strong>
                <br />
                SCALE IT
              </a>
            </div>

            <div className="band">
              <h2>
                Connecting Talent. Building Across Continents.
              </h2>

              <p>
                Build the relationships today that may become tomorrow's
                collaborations, partnerships, and international trade
                opportunities.
              </p>
            </div>
          </div>
        </section>

        {/* Expression of interest form */}
        <section className="section" id="interest">
          <div className="wrap">
            <div className="kicker">Next step</div>

            <h2>Express your interest in Genesis</h2>

            <p className="lead">
              Tell us where you are today and what support would help.
              This is an expression-of-interest draft, not an application
              submission, admissions decision, or final pathway placement.
            </p>

            <div className="formbox">
              <form id="interest-form" onSubmit={handleSubmit}>
                <div className="formgrid">
                  <div className="field">
                    <label htmlFor="fullname">Full name *</label>
                    <input
                      autoComplete="name"
                      id="fullname"
                      name="fullname"
                      required
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="email">Email address *</label>
                    <input
                      autoComplete="email"
                      id="email"
                      name="email"
                      type="email"
                      required
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="community">
                      Founder community *
                    </label>

                    <select
                      id="community"
                      name="community"
                      required
                      defaultValue=""
                    >
                      <option value="" disabled>
                        Select one
                      </option>

                      <option value="Africa-based entrepreneur">
                        Africa-based entrepreneur
                      </option>

                      <option value="U.S.-based entrepreneur of African descent">
                        U.S.-based entrepreneur of African descent
                      </option>

                      <option value="Request eligibility guidance">
                        Request eligibility guidance
                      </option>
                    </select>
                  </div>

                  <div className="field">
                    <label htmlFor="location">
                      City and country *
                    </label>

                    <input
                      id="location"
                      name="location"
                      placeholder="e.g. Accra, Ghana or Atlanta, USA"
                      required
                    />
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="idea">
                    Tell us about your business idea.
                  </label>

                  <textarea
                    id="idea"
                    name="idea"
                    placeholder="What would you like to create, offer, or build?"
                  />
                </div>

                <div className="field">
                  <label htmlFor="problem">
                    What problem would your idea solve, and for whom?
                  </label>

                  <textarea
                    id="problem"
                    name="problem"
                    placeholder="Who might benefit from your solution?"
                  />
                </div>

                <div className="field">
                  <label htmlFor="challenge">
                    What is your biggest challenge?
                  </label>

                  <textarea
                    id="challenge"
                    name="challenge"
                    placeholder="Idea clarity, customers, validation, skills, network, or something else?"
                  />
                </div>

                <div className="field">
                  <label htmlFor="goal">
                    What would you like to accomplish in the next six months?
                  </label>

                  <textarea
                    id="goal"
                    name="goal"
                    placeholder="Describe the progress you hope to make."
                  />
                </div>

                <div className="field">
                  <label htmlFor="collaboration">
                    Why connect with founders across Africa and the
                    United States?
                  </label>

                  <textarea
                    id="collaboration"
                    name="collaboration"
                    placeholder="What would you like to learn or contribute?"
                  />
                </div>

                <div className="field">
                  <label className="consent">
                    <input
                      name="unsure"
                      type="checkbox"
                      value="yes"
                    />

                    <span>
                      I'm not sure this is my best pathway. Please help
                      me find my lane.
                    </span>
                  </label>
                </div>

                <div className="field">
                  <label className="consent">
                    <input
                      id="ack"
                      name="ack"
                      type="checkbox"
                      required
                    />

                    <span>
                      I understand this page prepares a local draft only.
                      No information is transmitted to Continental
                      Founders, and this is not an admission decision.
                    </span>
                  </label>
                </div>

                <button className="btn" type="submit">
                  Download My Interest Draft ↓
                </button>

                {submitted && (
                  <div className="toast" role="status">
                    Your draft has been downloaded as a text file.
                    It has not been submitted.
                  </div>
                )}

                <p className="note">
                  Prototype only. A public launch requires an approved
                  privacy notice, secure form endpoint, consent record,
                  accessible confirmation process, and human admissions
                  review.
                </p>
              </form>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="section alt">
          <div className="wrap">
            <div className="kicker">Good to know</div>

            <h2>Frequently asked questions</h2>

            <details>
              <summary>Do I need an existing business?</summary>
              <p>
                No. Genesis is designed for people at the idea stage,
                including those who have not launched.
              </p>
            </details>

            <details>
              <summary>Will I only learn with Genesis founders?</summary>
              <p>
                No. Genesis-specific development is complemented by
                shared learning with Ascend and Horizon.
              </p>
            </details>

            <details>
              <summary>Do I need international trade experience?</summary>
              <p>
                No. Business fundamentals and trusted relationships
                come first.
              </p>
            </details>

            <details>
              <summary>Does selecting Genesis guarantee admission?</summary>
              <p>
                No. Pathway interest is provisional and subject to review.
              </p>
            </details>

            <details>
              <summary>Is funding guaranteed?</summary>
              <p>
                No. Any catalytic grant availability and criteria must
                be confirmed separately.
              </p>
            </details>

            <details>
              <summary>What if this pathway isn't right for me?</summary>
              <p>
                Choose "I'm not sure" on the interest form. The Fellowship
                team can help assess the most suitable pathway; no final
                placement is made here.
              </p>
            </details>
          </div>
        </section>

        {/* Final CTA */}
        <section className="section">
          <div className="wrap">
            <div className="kicker">Your future network</div>

            <h2>
              Your business journey doesn't have to happen in isolation.
            </h2>

            <p className="lead">
              Join a community of entrepreneurs building businesses
              and meaningful relationships across two continents.
            </p>

            <a className="btn" href="#interest">
              Explore Genesis →
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer>
        <div className="wrap">
          <strong>CONTINENTAL FOUNDERS™</strong>

          <p>Connecting Talent. Building Across Continents.</p>

          <p>
            Website concept for review. Cohort dates, fees, delivery,
            admission criteria, and funding arrangements remain to
            be confirmed.
          </p>
        </div>
      </footer>
    </div>
  );
}