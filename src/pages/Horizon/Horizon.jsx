
import { useState } from "react";
import "./Horizon.css";

export default function Horizon() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    const lines = [
      "CONTINENTAL FOUNDERS — HORIZON EXPRESSION OF INTEREST",
      "DRAFT ONLY — NOT SUBMITTED",
      "",
    ];

    for (const [key, value] of data.entries()) {
      if (key === "ack") continue;
      lines.push(
        key.replaceAll("_", " ").toUpperCase() + ": " + value
      );
    }

    const blob = new Blob([lines.join("\n")], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "CF_HORIZON_Interest_Draft.txt";
    link.click();

    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setSubmitted(true);
  }

  return (
    <div className="horizon-page">
      <header className="horizon-header">
        <div className="wrap nav">
          <nav aria-label="Pathways" className="links">
            <a href="/genesis">Genesis</a>
            <a href="/ascend">Ascend</a>
            <a className="active" href="/horizon">
              Horizon
            </a>
            <a className="nav-cta" href="#interest">
              Express Interest <span aria-hidden="true">→</span>
            </a>
          </nav>
        </div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="wrap hero-inner">
            <div>
              <div className="eyebrow">
                03 / THINK BEYOND BORDERS
              </div>

              <h1>
                Your business has momentum.
                <br />
                <em>Expand your possibilities.</em>
              </h1>

              <p>
                Horizon helps operating founders assess growth
                readiness, strengthen strategy, and build credible
                cross-continental relationships for future market
                access, partnerships, and international trade.
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
                CONTINENTAL FOUNDERS / GROWTH-READY
              </span>

              <h2>
                HORIZON
                <br />
                SCALE IT
              </h2>

              <p>
                One Cohort. Two Continents. Three Pathways. One
                Shared Future.
              </p>

              <div className="pill">
                Africa + U.S. African diaspora
              </div>
            </aside>
          </div>
        </section>

        <section className="section">
          <div className="wrap">
            <div className="kicker">Recognize yourself</div>
            <h2>Does this sound like you?</h2>

            <p className="lead">
              You don't have to decide your final Fellowship
              placement before expressing interest.
            </p>

            <ul className="check">
              <li>
                My business has established products or services
                and operating experience.
              </li>
              <li>
                I want to enter new markets but need a realistic
                strategy.
              </li>
              <li>
                I need stronger systems and leadership capacity
                for expansion.
              </li>
              <li>
                I want to understand procurement, partnerships,
                and trade readiness.
              </li>
              <li>
                I need credible relationships across Africa and
                the U.S. diaspora.
              </li>
              <li>
                I want to evaluate growth opportunities before
                committing resources.
              </li>
            </ul>
          </div>
        </section>

        <section className="section alt">
          <div className="wrap">
            <div className="kicker">Your challenges</div>
            <h2>What we help you work through</h2>

            <div className="comparison">
              <div className="problem">
                <strong>Unclear expansion strategy</strong>
                <span>
                  Prioritize markets, customers, and feasible
                  routes to growth.
                </span>
              </div>

              <div className="problem">
                <strong>Limited market access</strong>
                <span>
                  Map potential channels, buyers, and partnership
                  pathways.
                </span>
              </div>

              <div className="problem">
                <strong>Operational constraints</strong>
                <span>
                  Assess systems, teams, and delivery readiness.
                </span>
              </div>

              <div className="problem">
                <strong>Partnership uncertainty</strong>
                <span>
                  Define criteria for credible, mutually
                  beneficial partners.
                </span>
              </div>

              <div className="problem">
                <strong>Capital readiness gaps</strong>
                <span>
                  Identify financial information and readiness
                  improvements.
                </span>
              </div>

              <div className="problem">
                <strong>Cross-border complexity</strong>
                <span>
                  Explore compliance, logistics, and
                  trade-readiness questions.
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="wrap">
            <div className="kicker">Your value</div>

            <h2>
              Develop your business. Expand your network. Build
              future opportunities.
            </h2>

            <p className="lead">
              Receive stage-appropriate development while
              collaborating with founders at different stages
              across Africa and the U.S. African diaspora. The aim
              is stronger business capability and relationships
              that may grow into future partnerships and trade.
            </p>

            <div className="grid">
              <article className="card">
                <h3>Growth strategy</h3>
                <p>Prioritize commercially realistic opportunities.</p>
              </article>

              <article className="card">
                <h3>Market readiness</h3>
                <p>Evaluate customer demand and entry requirements.</p>
              </article>

              <article className="card">
                <h3>Partnership preparation</h3>
                <p>Define partner criteria and collaboration models.</p>
              </article>

              <article className="card">
                <h3>Operational capacity</h3>
                <p>Assess systems, talent, delivery, and governance.</p>
              </article>

              <article className="card">
                <h3>Trade awareness</h3>
                <p>
                  Identify cross-border logistics and compliance
                  questions.
                </p>
              </article>

              <article className="card">
                <h3>Trusted networks</h3>
                <p>
                  Build long-term relationships across Africa and
                  the U.S.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="section alt" id="pathways">
          <div className="wrap">
            <div className="kicker">Our difference</div>
            <h2>Three pathways. One shared cohort.</h2>

            <p className="lead">
              Genesis, Ascend, and Horizon are not isolated
              programs. Founders learn together, exchange
              experience, and build lasting cross-continental
              professional relationships, with pathway-specific
              learning matched to their business needs.
            </p>

            <div className="pathways">
              <a className="path" href="/genesis">
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

              <a className="path current" href="/horizon">
                <small>GROWTH-READY</small>
                <strong>HORIZON</strong>
                <br />
                SCALE IT
              </a>
            </div>

            <div className="band">
              <h2>Connecting Talent. Building Across Continents.</h2>
              <p>
                Build the relationships today that may become
                tomorrow's collaborations, partnerships, and
                international trade opportunities.
              </p>
            </div>
          </div>
        </section>

        <section className="section" id="interest">
          <div className="wrap">
            <div className="kicker">Next step</div>
            <h2>Express your interest in Horizon</h2>

            <p className="lead">
              Tell us where you are today and what support would
              help. This is an expression-of-interest draft, not
              an application submission, admissions decision, or
              final pathway placement.
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
                      required
                      type="email"
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
                    >
                      <option value="">Select one</option>
                      <option>Africa-based entrepreneur</option>
                      <option>
                        U.S.-based entrepreneur of African descent
                      </option>
                      <option>Request eligibility guidance</option>
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
                  <label htmlFor="business">
                    Describe your business and its current scale.
                  </label>
                  <textarea
                    id="business"
                    name="business"
                    placeholder="Products, operating history, customers, and markets."
                  />
                </div>

                <div className="field">
                  <label htmlFor="opportunity">
                    What growth opportunity are you considering?
                  </label>
                  <textarea
                    id="opportunity"
                    name="opportunity"
                    placeholder="New geography, procurement, partnership, export, or offering?"
                  />
                </div>

                <div className="field">
                  <label htmlFor="barrier">
                    What is your largest expansion barrier?
                  </label>
                  <textarea
                    id="barrier"
                    name="barrier"
                    placeholder="Market intelligence, operations, finance, partners, regulation?"
                  />
                </div>

                <div className="field">
                  <label htmlFor="goal">
                    What would successful progress look like in six months?
                  </label>
                  <textarea
                    id="goal"
                    name="goal"
                    placeholder="Describe realistic readiness or relationship milestones."
                  />
                </div>

                <div className="field">
                  <label htmlFor="contribution">
                    What can you contribute to a mixed-stage cohort?
                  </label>
                  <textarea
                    id="contribution"
                    name="contribution"
                    placeholder="Your expertise, perspective, and collaborative interests."
                  />
                </div>

                <div className="field">
                  <label className="consent">
                    <input name="unsure" type="checkbox" value="yes" />
                    I'm not sure this is my best pathway. Please
                    help me find my lane.
                  </label>
                </div>

                <div className="field">
                  <label className="consent">
                    <input id="ack" required type="checkbox" />
                    I understand this page prepares a local draft
                    only. No information is transmitted to
                    Continental Founders, and this is not an
                    admission decision.
                  </label>
                </div>

                <button className="btn" type="submit">
                  Download My Interest Draft ↓
                </button>

                <div
                  className={`toast ${
                    submitted ? "toast-visible" : ""
                  }`}
                  id="toast"
                  role="status"
                >
                  Your draft has been downloaded as a text file.
                  It has not been submitted.
                </div>

                <p className="note">
                  Prototype only. A public launch requires an
                  approved privacy notice, secure form endpoint,
                  consent record, accessible confirmation process,
                  and human admissions review.
                </p>
              </form>
            </div>
          </div>
        </section>

        <section className="section alt">
          <div className="wrap">
            <div className="kicker">Good to know</div>
            <h2>Frequently asked questions</h2>

            <details>
              <summary>Do I need to be exporting already?</summary>
              <p>
                No. Horizon supports growth-ready founders
                exploring future cross-border opportunities.
              </p>
            </details>

            <details>
              <summary>
                Is Horizon an investor or trade broker?
              </summary>
              <p>
                No. It is a founder development and
                relationship-building pathway; deals are not
                guaranteed.
              </p>
            </details>

            <details>
              <summary>
                Will I interact with early-stage founders?
              </summary>
              <p>
                Yes. Shared cohort exchange is central to the
                Fellowship.
              </p>
            </details>

            <details>
              <summary>Is there a minimum revenue threshold?</summary>
              <p>
                No threshold is specified in the concept.
                Growth-readiness criteria require formal approval.
              </p>
            </details>

            <details>
              <summary>
                Are introductions and grants guaranteed?
              </summary>
              <p>
                No. They depend on program arrangements,
                eligibility, and partner participation.
              </p>
            </details>

            <details>
              <summary>
                What if this pathway isn't right for me?
              </summary>
              <p>
                Choose “I'm not sure” on the interest form. The
                Fellowship team can help assess the most suitable
                pathway; no final placement is made here.
              </p>
            </details>
          </div>
        </section>

        <section className="section">
          <div className="wrap">
            <div className="kicker">Your future network</div>
            <h2>
              Your business journey doesn't have to happen in
              isolation.
            </h2>

            <p className="lead">
              Join a community of entrepreneurs building
              businesses and meaningful relationships across two
              continents.
            </p>

            <a className="btn" href="#interest">
              Explore Horizon →
            </a>
          </div>
        </section>
      </main>

      <footer>
        <div className="wrap">
          <strong>CONTINENTAL FOUNDERS™</strong>
          <p>Connecting Talent. Building Across Continents.</p>
          <p>
            Website concept for review. Cohort dates, fees,
            delivery, admission criteria, and funding arrangements
            remain to be confirmed.
          </p>
        </div>
      </footer>
    </div>
  );
}
