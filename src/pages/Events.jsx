import React from "react";
import SectionHeading from "../components/ui/SectionHeading";
import EventList from "../components/sections/EventList";
import CTASection from "../components/sections/CTASection";
import { events } from "../data/events";
import "./Events.css";

export default function Events() {
  return (
    <>
      <section className="page-hero">
        <div className="container page-hero__inner">
          <div>
            <span className="eyebrow eyebrow--light">Events & convenings</span>
            <h1>Where relationships find a room to grow.</h1>
          </div>
          <div className="page-hero__aside">
            <p>
              Curated conversations, roundtables, forums, and knowledge exchange designed
              around practical institutional questions.
            </p>
          </div>
        </div>
      </section>

      <section className="section events-intro">
        <div className="container events-intro__grid">
          <span className="eyebrow">Why convene</span>
          <div>
            <h2 className="display">The right conversation can be the beginning of a durable partnership.</h2>
            <p>
              Our convenings are designed to bring relevant people into focused conversations
              where opportunities can be identified, tested, and moved toward action.
            </p>
          </div>
        </div>
      </section>

      <section className="section section--light">
        <div className="container">
          <SectionHeading eyebrow="Calendar" title="Upcoming and planned programming." />
          <EventList events={events} />
        </div>
      </section>

      <CTASection
        eyebrow="Host or collaborate"
        title="Have a convening that should be in the room?"
        text="We welcome conversations with institutions and organizations interested in co-creating thoughtful forums and knowledge exchange opportunities."
      />
    </>
  );
}