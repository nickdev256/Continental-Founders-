import React from "react";
import { ArrowUpRight } from "lucide-react";
import SectionHeading from "../components/ui/SectionHeading";
import MediaSplit from "../components/sections/MediaSplit";
import CTASection from "../components/sections/CTASection";
import "./About.css";

export default function About() {
  return (
    <>
      <section className="page-hero">
        <div className="container page-hero__inner">
          <div>
            <span className="eyebrow eyebrow--light">About Continental Founders™</span>
            <h1>Purposeful partnership across Africa and America.</h1>
          </div>
          <div className="page-hero__aside">
            <p>
              Continental Founders™ is a nonprofit building strategic relationships between
              universities and institutions across the United States and Africa.
            </p>
          </div>
        </div>
      </section>

      <section className="section about-statement">
        <div className="container about-statement__grid">
          <span className="eyebrow">Our purpose</span>
          <div>
            <h2 className="display">We create the conditions for institutions to do more together.</h2>
            <p>
              Continental Founders™ is designed around a simple belief: international
              partnership is most valuable when it is intentional, reciprocal, and connected
              to real institutional priorities.
            </p>
          </div>
        </div>
      </section>

      <MediaSplit
        eyebrow="The opportunity"
        title="A relationship can become an ecosystem."
        text={[
          "Africa and the United States contain extraordinary universities, researchers, entrepreneurs, institutions, and communities. Yet the right people and organizations do not always have a clear pathway to one another.",
          "Our role is to help create that pathway—through partnership development, strategic introductions, knowledge exchange, convenings, and programs designed around shared goals."
        ]}
        image="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1500&q=85"
        imageAlt="University campus architecture"
      />

      <section className="section section--light">
        <div className="container">
          <SectionHeading
            eyebrow="Our principles"
            title="The standards we bring to partnership."
            text="The way a partnership is built matters as much as the outcome it seeks."
          />
          <div className="about-principles">
            {[
              ["Reciprocity", "Partnership should create meaningful value for all institutions and communities involved."],
              ["Intentionality", "We focus on clear purpose, relevant stakeholders, and practical pathways to action."],
              ["Stewardship", "Trust is built through responsible communication, thoughtful coordination, and follow-through."],
              ["Learning", "Strong relationships evolve. We make room for reflection, adaptation, and continuous improvement."]
            ].map(([title, text], index) => (
              <article key={title}>
                <span>0{index + 1}</span>
                <h3>{title}</h3>
                <p>{text}</p>
                <ArrowUpRight size={18} />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section about-vision">
        <div className="container about-vision__grid">
          <span className="eyebrow eyebrow--light">Vision</span>
          <div>
            <h2 className="display">A world where geography does not limit meaningful institutional collaboration.</h2>
            <p>
              Our long-term ambition is to contribute to a stronger network of institutions
              capable of sharing knowledge, creating opportunity, and building durable
              relationships across continents.
            </p>
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}