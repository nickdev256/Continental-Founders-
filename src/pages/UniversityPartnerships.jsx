import React from "react";
import { ArrowUpRight } from "lucide-react";
import SectionHeading from "../components/ui/SectionHeading";
import PartnerTypeGrid from "../components/sections/PartnerTypeGrid";
import MediaSplit from "../components/sections/MediaSplit";
import CTASection from "../components/sections/CTASection";
import "./UniversityPartnerships.css";

const outcomes = [
  [
    "Research relationships",
    "Connect researchers and academic communities around areas of shared interest."
  ],
  [
    "Faculty engagement",
    "Create structured opportunities for faculty to share expertise and build relationships."
  ],
  [
    "Student opportunity",
    "Develop pathways for students to engage with peers, institutions, ideas, and professional networks."
  ],
  [
    "Institutional learning",
    "Enable universities to learn from one another and strengthen global engagement."
  ]
];

export default function UniversityPartnerships() {
  return (
    <>
      {/* HERO */}
      <section className="university-hero">
        <div className="university-hero__image" />

        <div className="university-hero__overlay" />

        <div className="container university-hero__inner">
          <div className="university-hero__content">
            <span className="eyebrow eyebrow--light">
              University partnerships
            </span>

            <h1>
              Connecting institutions around shared academic purpose.
            </h1>
          </div>

          <div className="university-hero__aside">
            <div className="university-hero__line" />

            <p>
              We help universities explore, shape, and activate relationships
              across Africa and the United States.
            </p>
          </div>
        </div>
      </section>

      {/* OPENING */}
      <section className="section university-opening">
        <div className="container university-opening__grid">
          <div className="university-opening__label">
            <span className="eyebrow">For universities</span>
            <span className="university-opening__number">01</span>
          </div>

          <div className="university-opening__content">
            <h2 className="display">
              Global engagement becomes stronger when relationships have a
              reason.
            </h2>

            <p>
              Continental Founders™ helps institutions identify where
              collaboration can be meaningful, who should be involved, and how
              an initial relationship can become a practical program of
              engagement.
            </p>
          </div>
        </div>
      </section>

      {/* MEDIA SECTION */}
      <MediaSplit
        eyebrow="What partnership can unlock"
        title="A broader academic network."
        text={[
          "University partnerships can create access to new research conversations, faculty expertise, student perspectives, professional networks, and institutional learning.",
          "The opportunity is to build relationships that are reciprocal rather than transactional—relationships where every participant can contribute and learn."
        ]}
        image="/assets/ll.png"
        imageAlt="Students walking across a university campus"
      />

      {/* OUTCOMES */}
      <section className="section section--light university-outcomes">
        <div className="container">
          <div className="university-section-intro">
            <SectionHeading
              eyebrow="Potential outcomes"
              title="Partnerships can begin in one area and grow into many."
            />

            <p className="university-section-intro__description">
              The strongest academic relationships create value across
              research, faculty engagement, student opportunity, and
              institutional learning.
            </p>
          </div>

          <div className="outcome-grid">
            {outcomes.map(([title, text], i) => (
              <article className="outcome-card" key={title}>
                <div className="outcome-card__top">
                  <span>0{i + 1}</span>

                  <ArrowUpRight size={20} strokeWidth={1.5} />
                </div>

                <div className="outcome-card__body">
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ECOSYSTEM */}
      <section className="section university-ecosystem">
        <div className="container">
          <SectionHeading
            eyebrow="Our wider ecosystem"
            title="Universities are part of a broader partnership network."
            text="Academic collaboration can become stronger when institutions are able to engage aligned research organizations, foundations, nonprofits, industry, and other strategic actors."
          />

          <div className="university-ecosystem__grid">
            <PartnerTypeGrid />
          </div>
        </div>
      </section>

      {/* CTA */}
      
    </>
  );
}