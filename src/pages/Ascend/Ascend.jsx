import { useState } from "react";
import "./Ascend.css";

export default function Ascend() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;

    if (!form.reportValidity()) return;

    const formData = new FormData(form);
    const lines = [
      "CONTINENTAL FOUNDERS — ASCEND EXPRESSION OF INTEREST",
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
    link.download = "CF_ASCEND_Interest_Draft.txt";

    document.body.appendChild(link);
    link.click();
    link.remove();

    window.setTimeout(() => URL.revokeObjectURL(url), 1000);

    setSubmitted(true);
  }

  return (
    <div className="ascend-page">
      <header className="as-header">
        <div className="as-wrap as-nav">
          <a className="as-brand" href="#top">
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

          <nav className="as-links" aria-label="Fellowship pathways">
            <a href="/genesis">Genesis</a>
            <a className="active" href="/ascend">Ascend</a>
            <a href="/horizon">Horizon</a>
            <a href="#interest">Express Interest</a>
          </nav>
        </div>
      </header>

      <main id="top">
        <section className="as-hero">
          <div className="as-wrap as-hero-inner">
            <div>
              <div className="as-eyebrow">
                02 / TURN ACTIVITY INTO TRACTION
              </div>

              <h1>
                You started something.
                <br />
                <em>Now build what works.</em>
              </h1>

              <p>
                You've launched a product, service, or enterprise.
                Ascend helps you strengthen customer demand, sharpen
                decisions, and build a foundation for sustainable growth
                alongside founders across two continents.
              </p>

              <div className="as-actions">
                <a className="as-btn" href="#interest">
                  Express My Interest →
                </a>

                <a className="as-btn secondary" href="#pathways">
                  Explore All Pathways
                </a>
              </div>
            </div>

            <aside className="as-hero-card">
              <span className="as-num">
                CONTINENTAL FOUNDERS / EARLY OPERATING
              </span>

              <h2>
                ASCEND
                <br />
                PROVE IT
              </h2>

              <p>
                One Cohort. Two Continents. Three Pathways.
                One Shared Future.
              </p>

              <div className="as-pill">
                Africa + U.S. African diaspora
              </div>
            </aside>
          </div>
        </section>

        <section className="as-section">
          <div className="as-wrap">
            <div className="as-kicker">Recognize yourself</div>

            <h2>Does this sound like you?</h2>

            <p className="as-lead">
              You don't have to decide your final Fellowship placement
              before expressing interest.
            </p>

            <ul className="as-check">
              <li>
                I have started a business, but customer demand is
                inconsistent.
              </li>
              <li>
                I need to understand what customers value and will pay for.
              </li>
              <li>
                I'm working hard but need stronger systems and clearer
                priorities.
              </li>
              <li>
                I want to improve pricing, sales, and business decisions.
              </li>
              <li>
                I want trusted professional relationships across Africa
                and the U.S.
              </li>
              <li>I'm ready to test what works before expanding.</li>
            </ul>
          </div>
        </section>

        <section className="as-section as-alt">
          <div className="as-wrap">
            <div className="as-kicker">Your challenges</div>

            <h2>What we help you work through</h2>

            <div className="as-comparison">
              <div className="as-problem">
                <strong>Inconsistent sales</strong>
                <span>
                  Understand customers and test repeatable sales approaches.
                </span>
              </div>

              <div className="as-problem">
                <strong>Unclear business model</strong>
                <span>
                  Examine pricing, costs, revenue, and delivery assumptions.
                </span>
              </div>

              <div className="as-problem">
                <strong>Too many priorities</strong>
                <span>
                  Set focused milestones and improve decision-making.
                </span>
              </div>

              <div className="as-problem">
                <strong>Weak operating systems</strong>
                <span>
                  Strengthen essential workflows and business discipline.
                </span>
              </div>

              <div className="as-problem">
                <strong>Limited professional network</strong>
                <span>
                  Collaborate with African and U.S. diaspora peers.
                </span>
              </div>

              <div className="as-problem">
                <strong>Uncertain growth readiness</strong>
                <span>
                  Build evidence of traction before scaling.
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className="as-section">
          <div className="as-wrap">
            <div className="as-kicker">Your value</div>

            <h2>
              Develop your business. Expand your network. Build future
              opportunities.
            </h2>

            <p className="as-lead">
              Receive stage-appropriate development while collaborating
              with founders at different stages across Africa and the
              U.S. African diaspora. The aim is stronger business
              capability and relationships that may grow into future
              partnerships and trade.
            </p>

            <div className="as-grid">
              <article className="as-card">
                <h3>Customer traction</h3>
                <p>Understand target customers and repeat demand.</p>
              </article>

              <article className="as-card">
                <h3>Business model discipline</h3>
                <p>Evaluate pricing, costs, revenue, and value delivery.</p>
              </article>

              <article className="as-card">
                <h3>Operational strength</h3>
                <p>Improve workflows, planning, and accountability.</p>
              </article>

              <article className="as-card">
                <h3>Evidence-based decisions</h3>
                <p>Use customer feedback and business metrics.</p>
              </article>

              <article className="as-card">
                <h3>Cross-continental network</h3>
                <p>Develop reciprocal relationships across continents.</p>
              </article>

              <article className="as-card">
                <h3>Growth roadmap</h3>
                <p>Define milestones for a more resilient business.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="as-section as-alt" id="pathways">
          <div className="as-wrap">
            <div className="as-kicker">Our difference</div>

            <h2>Three pathways. One shared cohort.</h2>

            <p className="as-lead">
              Genesis, Ascend, and Horizon are not isolated programs.
              Founders learn together, exchange experience, and build
              lasting cross-continental professional relationships, with
              pathway-specific learning matched to their business needs.
            </p>

            <div className="as-pathways">
              <a className="as-path" href="/genesis">
                <small>IDEA STAGE</small>
                <strong>GENESIS</strong>
                <br />
                BUILD IT
              </a>

              <a className="as-path current" href="/ascend">
                <small>EARLY OPERATING</small>
                <strong>ASCEND</strong>
                <br />
                PROVE IT
              </a>

              <a className="as-path" href="/horizon">
                <small>GROWTH-READY</small>
                <strong>HORIZON</strong>
                <br />
                SCALE IT
              </a>
            </div>

            <div className="as-band">
              <h2>Connecting Talent. Building Across Continents.</h2>
              <p>
                Build the relationships today that may become tomorrow's
                collaborations, partnerships, and international trade
                opportunities.
              </p>
            </div>
          </div>
        </section>

        <section className="as-section" id="interest">
          <div className="as-wrap">
            <div className="as-kicker">Next step</div>

            <h2>Express your interest in Ascend</h2>

            <p className="as-lead">
              Tell us where you are today and what support would help.
              This is an expression-of-interest draft, not an application
              submission, admissions decision, or final pathway placement.
            </p>

            <div className="as-formbox">
              <form onSubmit={handleSubmit}>
                <div className="as-formgrid">
                  <div className="as-field">
                    <label htmlFor="as-fullname">Full name *</label>
                    <input
                      autoComplete="name"
                      id="as-fullname"
                      name="fullname"
                      required
                    />
                  </div>

                  <div className="as-field">
                    <label htmlFor="as-email">Email address *</label>
                    <input
                      autoComplete="email"
                      id="as-email"
                      name="email"
                      type="email"
                      required
                    />
                  </div>

                  <div className="as-field">
                    <label htmlFor="as-community">
                      Founder community *
                    </label>

                    <select
                      id="as-community"
                      name="community"
                      defaultValue=""
                      required
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

                  <div className="as-field">
                    <label htmlFor="as-location">City and country *</label>
                    <input
                      id="as-location"
                      name="location"
                      placeholder="e.g. Accra, Ghana or Atlanta, USA"
                      required
                    />
                  </div>
                </div>

                <div className="as-field">
                  <label htmlFor="as-business">
                    Describe your current business.
                  </label>
                  <textarea
                    id="as-business"
                    name="business"
                    placeholder="What do you offer, and how long have you been operating?"
                  />
                </div>

                <div className="as-field">
                  <label htmlFor="as-customers">Who are your customers?</label>
                  <textarea
                    id="as-customers"
                    name="customers"
                    placeholder="Describe your customers and current sales activity."
                  />
                </div>

                <div className="as-field">
                  <label htmlFor="as-challenge">
                    What is your biggest operating challenge?
                  </label>
                  <textarea
                    id="as-challenge"
                    name="challenge"
                    placeholder="Customers, sales, pricing, systems, cash flow, positioning?"
                  />
                </div>

                <div className="as-field">
                  <label htmlFor="as-goal">
                    What progress would you like in six months?
                  </label>
                  <textarea
                    id="as-goal"
                    name="goal"
                    placeholder="Describe measurable outcomes you would value."
                  />
                </div>

                <div className="as-field">
                  <label htmlFor="as-collaboration">
                    Why does transatlantic collaboration interest you?
                  </label>
                  <textarea
                    id="as-collaboration"
                    name="collaboration"
                    placeholder="What could you learn from or contribute to others?"
                  />
                </div>

                <div className="as-field">
                  <label className="as-consent" htmlFor="as-unsure">
                    <input
                      id="as-unsure"
                      name="unsure"
                      type="checkbox"
                      value="yes"
                    />
                    <span>
                      I'm not sure this is my best pathway. Please help me
                      find my lane.
                    </span>
                  </label>
                </div>

                <div className="as-field">
                  <label className="as-consent" htmlFor="as-ack">
                    <input id="as-ack" name="ack" type="checkbox" required />
                    <span>
                      I understand this page prepares a local draft only.
                      No information is transmitted to Continental Founders,
                      and this is not an admission decision.
                    </span>
                  </label>
                </div>

                <button className="as-btn" type="submit">
                  Download My Interest Draft ↓
                </button>

                {submitted && (
                  <div className="as-toast" role="status">
                    Your draft has been downloaded as a text file. It has
                    not been submitted.
                  </div>
                )}

                <p className="as-note">
                  Prototype only. A public launch requires an approved
                  privacy notice, secure form endpoint, consent record,
                  accessible confirmation process, and human admissions
                  review.
                </p>
              </form>
            </div>
          </div>
        </section>

        <section className="as-section as-alt">
          <div className="as-wrap">
            <div className="as-kicker">Good to know</div>

            <h2>Frequently asked questions</h2>

            <details>
              <summary>Do I need a registered company?</summary>
              <p>
                Ascend is designed for founders operating or testing a
                venture. Final documentation requirements must be confirmed.
              </p>
            </details>

            <details>
              <summary>Do I need consistent revenue?</summary>
              <p>
                No fixed revenue threshold is proposed. You should be able
                to describe activity or early traction.
              </p>
            </details>

            <details>
              <summary>Will I only learn with Ascend founders?</summary>
              <p>
                No. Ascend-specific development is complemented by shared
                activities with Genesis and Horizon.
              </p>
            </details>

            <details>
              <summary>Does Ascend guarantee customers or funding?</summary>
              <p>No. Commercial outcomes and grants are not guaranteed.</p>
            </details>

            <details>
              <summary>What if I'm ready to scale?</summary>
              <p>The team can assess whether Horizon is a better fit.</p>
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

        <section className="as-section">
          <div className="as-wrap">
            <div className="as-kicker">Your future network</div>

            <h2>
              Your business journey doesn't have to happen in isolation.
            </h2>

            <p className="as-lead">
              Join a community of entrepreneurs building businesses and
              meaningful relationships across two continents.
            </p>

            <a className="as-btn" href="#interest">
              Explore Ascend →
            </a>
          </div>
        </section>
      </main>

      <footer className="as-footer">
        <div className="as-wrap">
          <strong>CONTINENTAL FOUNDERS™</strong>
          <p>Connecting Talent. Building Across Continents.</p>
          <p>
            Website concept for review. Cohort dates, fees, delivery,
            admission criteria, and funding arrangements remain to be
            confirmed.
          </p>
        </div>
      </footer>
    </div>
  );
}