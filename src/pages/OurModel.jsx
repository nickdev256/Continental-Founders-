import React from "react";
import SectionHeading from "../components/ui/SectionHeading";
import ProcessGrid from "../components/sections/ProcessGrid";
import MediaSplit from "../components/sections/MediaSplit";
import CTASection from "../components/sections/CTASection";
import "./OurModel.css";

const lenses = [
  ["Institutional fit", "We consider whether the relationship aligns with real priorities, capabilities, and institutional interests."],
  ["People & trust", "The quality of the people involved shapes whether a partnership can survive beyond the first meeting."],
  ["Practical pathways", "A strong partnership has a next step: a program, conversation, research connection, exchange, or shared initiative."],
  ["Sustainability", "We encourage relationships that can mature through stewardship, learning, and realistic resourcing."]
];

export default function OurModel() {
  return (
    <>
      <section className="page-hero">
        <div className="container page-hero__inner">
          <div>
            <span className="eyebrow eyebrow--light">Our model</span>
            <h1>From introduction to institutional collaboration.</h1>
          </div>
          <div className="page-hero__aside">
            <p>
              A partnership is not a single event. It is a process of discovery, alignment,
              design, activation, and learning.
            </p>
          </div>
        </div>
      </section>

      <section className="section model-intro">
        <div className="container model-intro__grid">
          <span className="eyebrow">How we think</span>
          <div>
            <h2 className="display">We focus on the architecture behind meaningful relationships.</h2>
            <p>
              Our model gives partners a common language for moving from an initial point of
              connection to practical collaboration. It is structured enough to create clarity,
              while flexible enough to respect the context of each institution.
            </p>
          </div>
        </div>
      </section>

      <section className="section section--dark">
        <div className="container">
          <SectionHeading
            eyebrow="The pathway"
            title="Five stages. One shared objective: useful collaboration."
            text="Each engagement can move at a different pace. The sequence gives partners a way to understand what needs to happen next."
          />
          <ProcessGrid />
        </div>
      </section>

      <MediaSplit
        reverse
        eyebrow="Partnership design"
        title="The right relationship starts with the right questions."
        text={[
          "What does each institution want to achieve? What strengths can each bring? Who needs to be involved? What can be done now, and what needs more groundwork?",
          "These questions help turn broad interest into a partnership that has a credible reason to exist and a practical path forward."
        ]}
        image="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1500&q=85"
        imageAlt="Professionals in an institutional strategy meeting"
      />

      <section className="section section--light">
        <div className="container">
          <SectionHeading
            eyebrow="Four lenses"
            title="What we look for before a partnership moves forward."
          />
          <div className="model-lenses">
            {lenses.map(([title, text], i) => (
              <article key={title}>
                <span>0{i + 1}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}