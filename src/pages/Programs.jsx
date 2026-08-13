import React from "react";
import { ArrowUpRight } from "lucide-react";
import { programs } from "../data/programs";
import SectionHeading from "../components/ui/SectionHeading";
import CTASection from "../components/sections/CTASection";
import "./Programs.css";

export default function Programs() {
  return (
    <>
      <section className="page-hero">
        <div className="container page-hero__inner">
          <div>
            <span className="eyebrow eyebrow--light">Programs</span>
            <h1>Practical platforms for collaboration.</h1>
          </div>
          <div className="page-hero__aside">
            <p>
              Our programs are designed to give institutional relationships a practical
              place to meet, exchange, and create.
            </p>
          </div>
        </div>
      </section>

      <section className="section programs-intro">
        <div className="container programs-intro__grid">
          <span className="eyebrow">Program architecture</span>
          <div>
            <h2 className="display">Partnership becomes real when people have somewhere to collaborate.</h2>
            <p>
              Programs create the practical environments where relationships can produce
              knowledge, opportunity, dialogue, and shared work.
            </p>
          </div>
        </div>
      </section>

      <section className="section section--light">
        <div className="container">
          <SectionHeading
            eyebrow="Our program areas"
            title="Four ways we create space for meaningful engagement."
          />
          <div className="program-grid">
            {programs.map((program) => (
              <article className="program-card" key={program.number}>
                <div className="program-card__top">
                  <span>{program.number}</span>
                  <ArrowUpRight size={19} />
                </div>
                <h3>{program.title}</h3>
                <p>{program.description}</p>
                <ul>
                  {program.items.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section programs-note">
        <div className="container programs-note__grid">
          <span className="eyebrow eyebrow--light">Built with partners</span>
          <div>
            <h2 className="display">Programs should respond to the opportunity—not force every partner into the same template.</h2>
            <p>
              Program details can be shaped around institutional context, geography, available
              resources, participants, and the outcomes partners want to pursue.
            </p>
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}