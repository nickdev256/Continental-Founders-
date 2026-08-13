import React from "react";
import { impactAreas } from "../data/impact";
import SectionHeading from "../components/ui/SectionHeading";
import Stat from "../components/ui/Stat";
import CTASection from "../components/sections/CTASection";
import "./Impact.css";

export default function Impact() {
  return (
    <>
      <section className="page-hero">
        <div className="container page-hero__inner">
          <div>
            <span className="eyebrow eyebrow--light">Impact</span>
            <h1>Measure what partnership makes possible.</h1>
          </div>
          <div className="page-hero__aside">
            <p>
              Impact is more than a list of activities. It is the value created for
              institutions, people, knowledge, and communities over time.
            </p>
          </div>
        </div>
      </section>

      <section className="section impact-opening">
        <div className="container impact-opening__grid">
          <span className="eyebrow">Our impact lens</span>
          <div>
            <h2 className="display">We are building for relationships that become stronger with time.</h2>
            <p>
              As Continental Founders™ grows, we intend to report on meaningful outcomes
              rather than using inflated or unsupported claims. The measures below describe
              the areas we will use to understand progress.
            </p>
          </div>
        </div>
      </section>

      <section className="section section--light">
        <div className="container">
          <SectionHeading eyebrow="Impact areas" title="What we want our work to strengthen." />
          <div className="impact-grid">
            {impactAreas.map((area) => (
              <article key={area.title}>
                <span>{area.label}</span>
                <h3>{area.title}</h3>
                <p>{area.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section impact-measures">
        <div className="container">
          <SectionHeading
            eyebrow="Measurement framework"
            title="A content-ready impact dashboard."
            text="Replace these placeholders with verified organizational figures as partnerships, programs, and activities are established."
          />
          <div className="impact-stats">
            <Stat value="—" label="Institutional partnerships" note="Verified figure to be published" />
            <Stat value="—" label="Cross-continental initiatives" note="Verified figure to be published" />
            <Stat value="—" label="Participants engaged" note="Verified figure to be published" />
            <Stat value="—" label="Knowledge exchange activities" note="Verified figure to be published" />
          </div>
        </div>
      </section>

      <section className="section impact-principles">
        <div className="container">
          <div className="impact-principles__inner">
            <span className="eyebrow eyebrow--light">Accountability</span>
            <h2 className="display">Credibility comes from being precise about what has happened.</h2>
            <p>
              We will distinguish between goals, activities, outputs, and verified outcomes.
              That discipline is essential for a nonprofit working with universities and
              strategic institutions.
            </p>
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}