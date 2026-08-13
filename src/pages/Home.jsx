import React from "react";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import SectionHeading from "../components/ui/SectionHeading";
import MediaSplit from "../components/sections/MediaSplit";
import PartnerTypeGrid from "../components/sections/PartnerTypeGrid";
import ProcessGrid from "../components/sections/ProcessGrid";
import InsightCard from "../components/sections/InsightCard";
import CTASection from "../components/sections/CTASection";
import { insights } from "../data/insights";
import "./Home.css";

export default function Home() {
  return (
    <>
      <section className="home-hero">
        <div className="home-hero__media" />
        <div className="container home-hero__inner">
          <div className="home-hero__copy">
            <span className="eyebrow eyebrow--light">Africa × United States</span>
            <h1 className="display">Building strategic bridges across continents.</h1>
            <p>
              Continental Founders™ develops purposeful partnerships connecting universities,
              institutions, researchers, and organizations across Africa and the United States.
            </p>
            <div className="home-hero__actions">
              <Button to="/our-model" variant="light">Explore Our Model</Button>
              <Button to="/contact" variant="gold" icon="up">Partner With Us</Button>
            </div>
          </div>
          <div className="home-hero__foot">
            <span>Institutional partnership</span>
            <span>Knowledge exchange</span>
            <span>Long-term impact</span>
          </div>
        </div>
        <a className="home-hero__scroll" href="#introduction" aria-label="Scroll to introduction">
          <ArrowDown size={17} />
        </a>
      </section>

      <section id="introduction" className="home-intro section">
        <div className="container home-intro__grid">
          <span className="eyebrow">Why Continental Founders™</span>
          <div>
            <h2 className="display">Partnership should create more than a handshake.</h2>
            <p>
              We believe the strongest Africa–America relationships are built around shared
              purpose, institutional alignment, practical action, and a commitment to learning.
            </p>
            <Link className="text-link" to="/about">About Continental Founders <ArrowUpRight size={16} /></Link>
          </div>
        </div>
      </section>

      <MediaSplit
        eyebrow="A connected ecosystem"
        title="Where institutions meet opportunity."
        text={[
          "Continental Founders™ exists to make cross-continental collaboration more intentional and more useful.",
          "We work across the space between universities, research communities, strategic organizations, and the people responsible for turning relationships into action."
        ]}
        image="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1500&q=85"
        imageAlt="University students collaborating around a table"
        buttonText="Our approach"
        buttonTo="/our-model"
      />

      <section className="section section--dark home-model">
        <div className="container">
          <SectionHeading
            eyebrow="Our model"
            title="A deliberate pathway from connection to collaboration."
            text="We help partners move through the work in a structured way—without losing the human relationships that make partnerships meaningful."
          />
          <ProcessGrid />
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="Who we work with"
            title="A network built around shared value."
            text="Our partnership ecosystem is designed for institutions and organizations that want to create meaningful, long-term outcomes."
          />
          <PartnerTypeGrid />
        </div>
      </section>

      <section className="home-quote">
        <div className="container">
          <blockquote className="display">
            “The future of meaningful institutional partnership is not about proximity. It is about purpose.”
          </blockquote>
          <span>Continental Founders™</span>
        </div>
      </section>

      <section className="section section--light">
        <div className="container">
          <SectionHeading
            eyebrow="From the field"
            title="Ideas for a more connected world."
            text="Perspectives on institutional partnership, higher education, research, knowledge exchange, and cross-continental collaboration."
          />
          <div className="home-insights">
            {insights.map((insight) => <InsightCard key={insight.slug} insight={insight} />)}
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}