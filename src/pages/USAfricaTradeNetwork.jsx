import React from "react";
import "./USAfricaTradeNetwork.css";

export default function USAfricaTradeNetwork() {
  return (
    <main className="us-africa-page">

      {/* =====================================================
          HERO
      ====================================================== */}
      <section className="page-hero">
        <div className="container page-hero__inner">
          <div className="page-hero__content">
            <span className="eyebrow eyebrow--light">
              U.S.–Africa Trade & Business Network
            </span>

            <h1>
              Building commercial relationships across markets.
            </h1>
          </div>

          <div className="page-hero__aside">
            <p>
              Continental Founders connects entrepreneurs, companies,
              institutions, and business leaders across the United States
              and Africa to strengthen commercial relationships, expand
              market access, and create pathways to opportunity.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          INTRODUCTION
      ====================================================== */}
      <section className="trade-intro">
        <div className="container trade-intro__grid">
          <div>
            <span className="eyebrow">Cross-Border Opportunity</span>

            <h2>
              Connecting ambitious founders with markets,
              relationships, and commercial opportunity.
            </h2>
          </div>

          <div className="trade-intro__copy">
            <p>
              The U.S.–Africa Trade & Business Network creates a bridge
              between entrepreneurial ecosystems, business communities,
              and institutions across both markets.
            </p>

            <p>
              Through trusted relationships and strategic partnerships,
              we help founders move beyond introductions toward meaningful
              commercial engagement, market knowledge, and long-term
              business relationships.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
          WHAT THE NETWORK ENABLES
      ====================================================== */}
      <section className="trade-opportunities">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">What the Network Enables</span>

            <h2>
              Turning international connections into practical opportunity.
            </h2>
          </div>

          <div className="trade-opportunities__grid">

            <article className="trade-card">
              <span className="trade-card__number">01</span>
              <h3>Market Access</h3>
              <p>
                Helping founders understand new markets, identify
                opportunities, and build relationships that support
                commercial expansion.
              </p>
            </article>

            <article className="trade-card">
              <span className="trade-card__number">02</span>
              <h3>Business Connections</h3>
              <p>
                Creating meaningful connections between founders,
                companies, industry leaders, buyers, suppliers, and
                strategic partners.
              </p>
            </article>

            <article className="trade-card">
              <span className="trade-card__number">03</span>
              <h3>Trade & Investment Readiness</h3>
              <p>
                Preparing founders to engage professionally with
                international partners, commercial opportunities,
                and investment networks.
              </p>
            </article>

            <article className="trade-card">
              <span className="trade-card__number">04</span>
              <h3>Knowledge Exchange</h3>
              <p>
                Connecting entrepreneurs with market intelligence,
                industry expertise, business practices, and insights
                from both U.S. and African ecosystems.
              </p>
            </article>

          </div>
        </div>
      </section>

      {/* =====================================================
          NETWORK MODEL
      ====================================================== */}
      <section className="network-model">
        <div className="container network-model__grid">

          <div className="network-model__content">
            <span className="eyebrow eyebrow--light">
              Our Approach
            </span>

            <h2>
              More than networking.
              <br />
              We build pathways.
            </h2>

            <p>
              Continental Founders focuses on relationships that can
              produce measurable outcomes — from introductions and
              knowledge exchange to partnerships, customers, market
              entry, and long-term commercial collaboration.
            </p>
          </div>

          <div className="network-model__steps">

            <div className="network-step">
              <span>01</span>
              <div>
                <h3>Connect</h3>
                <p>Bring the right people and institutions together.</p>
              </div>
            </div>

            <div className="network-step">
              <span>02</span>
              <div>
                <h3>Prepare</h3>
                <p>Strengthen readiness for cross-border engagement.</p>
              </div>
            </div>

            <div className="network-step">
              <span>03</span>
              <div>
                <h3>Engage</h3>
                <p>Facilitate meaningful commercial conversations.</p>
              </div>
            </div>

            <div className="network-step">
              <span>04</span>
              <div>
                <h3>Grow</h3>
                <p>Turn relationships into sustainable opportunity.</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =====================================================
          WHO WE WORK WITH
      ====================================================== */}
      <section className="network-partners">
        <div className="container">
          <div className="section-heading section-heading--center">
            <span className="eyebrow">Who We Work With</span>

            <h2>
              A network built around the people who make
              cross-border business possible.
            </h2>
          </div>

          <div className="network-partners__grid">
            <div>Entrepreneurs & Founders</div>
            <div>Companies & Industry Leaders</div>
            <div>Trade Organizations</div>
            <div>Business Associations</div>
            <div>Universities & Institutions</div>
            <div>Economic Development Partners</div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CTA
      ====================================================== */}
      <section className="trade-cta">
        <div className="container trade-cta__inner">

          <div>
            <span className="eyebrow eyebrow--light">
              Build With Us
            </span>

            <h2>
              Interested in strengthening U.S.–Africa
              business connections?
            </h2>

            <p>
              Join Continental Founders in building relationships
              that connect entrepreneurial talent with markets,
              expertise, and commercial opportunity.
            </p>
          </div>

          <a href="/contact" className="trade-cta__button">
            Explore Partnership
            <span aria-hidden="true">→</span>
          </a>

        </div>
      </section>

    </main>
  );
}