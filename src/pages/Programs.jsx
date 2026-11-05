import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, GraduationCap, Handshake, Lightbulb, MessagesSquare } from "lucide-react";
import { programs } from "../data/programs";
import "./InfoPage.css";

// One icon per program area, in the same order as data/programs.js
const PROGRAM_ICONS = [GraduationCap, Lightbulb, Handshake, MessagesSquare];

export default function Programs() {
  return (
    <main className="ip-page">
      <section className="ip-hero">
        <div className="ip-hero__media" aria-hidden="true">
          <img src="/assets/o.webp" alt="" fetchPriority="high" />
        </div>

        <div className="ip-container ip-hero__inner">
          <div>
            <span className="ip-eyebrow ip-eyebrow--light">Programs</span>
            <h1>
              Practical platforms for <em>collaboration.</em>
            </h1>
          </div>

          <p className="ip-hero__aside">
            Our programs are designed to give institutional relationships a practical
            place to meet, exchange, and create.
          </p>
        </div>
      </section>

      <section className="ip-section ip-intro">
        <div className="ip-container ip-intro__grid">
          <span className="ip-eyebrow">Program architecture</span>

          <div>
            <h2>Partnership becomes real when people have somewhere to collaborate.</h2>
            <p>
              Programs create the practical environments where relationships can produce
              knowledge, opportunity, dialogue, and shared work.
            </p>
          </div>
        </div>
      </section>

      <section className="ip-section ip-section--soft">
        <div className="ip-container">
          <header className="ip-heading">
            <span className="ip-eyebrow">Our program areas</span>
            <h2>Four ways we create space for meaningful engagement.</h2>
          </header>

          <ul className="ip-cards">
            {programs.map((program, index) => {
              const Icon = PROGRAM_ICONS[index % PROGRAM_ICONS.length];

              return (
                <li className="ip-card" key={program.number}>
                  <div className="ip-card__top">
                    <span className="ip-card__icon">
                      <Icon size={22} aria-hidden="true" />
                    </span>
                    <span className="ip-card__label" aria-hidden="true">
                      {program.number}
                    </span>
                  </div>

                  <h3>{program.title}</h3>
                  <p>{program.description}</p>

                  <ul className="ip-card__list">
                    {program.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="ip-section ip-band">
        <div className="ip-container">
          <div className="ip-band__inner">
            <span className="ip-eyebrow ip-eyebrow--light">Built with partners</span>
            <h2>
              Programs should respond to the opportunity—not force every partner into
              the same template.
            </h2>
            <p>
              Program details can be shaped around institutional context, geography, available
              resources, participants, and the outcomes partners want to pursue.
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
