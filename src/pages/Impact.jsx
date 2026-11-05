import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Building2, BookOpen, Globe2, Sprout } from "lucide-react";
import { impactAreas } from "../data/impact";
import "./InfoPage.css";

// One icon per impact area, in the same order as data/impact.js
const AREA_ICONS = [Building2, BookOpen, Globe2, Sprout];

export default function Impact() {
  return (
    <main className="ip-page">
      <section className="ip-hero">
        <div className="ip-hero__media" aria-hidden="true">
          <img src="/assets/v.webp" alt="" fetchPriority="high" />
        </div>

        <div className="ip-container ip-hero__inner">
          <div>
            <span className="ip-eyebrow ip-eyebrow--light">Impact</span>
            <h1>
              Measure what partnership makes <em>possible.</em>
            </h1>
          </div>

          <p className="ip-hero__aside">
            Impact is more than a list of activities. It is the value created for
            institutions, people, knowledge, and communities over time.
          </p>
        </div>
      </section>

      <section className="ip-section ip-intro">
        <div className="ip-container ip-intro__grid">
          <span className="ip-eyebrow">Our impact lens</span>

          <div>
            <h2>We are building for relationships that become stronger with time.</h2>
            <p>
              As Continental Founders™ grows, we intend to report on meaningful outcomes
              rather than using inflated or unsupported claims. The measures below describe
              the areas we will use to understand progress.
            </p>
          </div>
        </div>
      </section>

      <section className="ip-section ip-section--soft">
        <div className="ip-container">
          <header className="ip-heading">
            <span className="ip-eyebrow">Impact areas</span>
            <h2>What we want our work to strengthen.</h2>
          </header>

          <ul className="ip-cards">
            {impactAreas.map((area, index) => {
              const Icon = AREA_ICONS[index % AREA_ICONS.length];

              return (
                <li className="ip-card" key={area.title}>
                  <div className="ip-card__top">
                    <span className="ip-card__icon">
                      <Icon size={22} aria-hidden="true" />
                    </span>
                    <span className="ip-card__label">{area.label}</span>
                  </div>

                  <h3>{area.title}</h3>
                  <p>{area.description}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="ip-section ip-band">
        <div className="ip-container">
          <div className="ip-band__inner">
            <span className="ip-eyebrow ip-eyebrow--light">Accountability</span>
            <h2>Credibility comes from being precise about what has happened.</h2>
            <p>
              We will distinguish between goals, activities, outputs, and verified outcomes.
              That discipline is essential for a nonprofit working with universities and
              strategic institutions.
            </p>
          </div>
        </div>
      </section>

      <section className="ip-section ip-cta">
        <div className="ip-container">
          <div className="ip-cta__card">
            <div>
              <span className="ip-eyebrow">Start a conversation</span>
              <h2>Build a partnership with purpose.</h2>
              <p>
                Tell us what you are trying to build, who you want to connect with, and
                where you see an opportunity for shared value.
              </p>
            </div>

            <Link className="ip-button ip-button--gold" to="/contact">
              Contact us
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
