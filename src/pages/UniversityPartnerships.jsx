import React from "react";
import { ArrowUpRight } from "lucide-react";
import SectionHeading from "../components/ui/SectionHeading";
import PartnerTypeGrid from "../components/sections/PartnerTypeGrid";
import MediaSplit from "../components/sections/MediaSplit";
import CTASection from "../components/sections/CTASection";
import "./UniversityPartnerships.css";

const outcomes = [
  ["Research relationships", "Connect researchers and academic communities around areas of shared interest."],
  ["Faculty engagement", "Create structured opportunities for faculty to share expertise and build relationships."],
  ["Student opportunity", "Develop pathways for students to engage with peers, institutions, ideas, and professional networks."],
  ["Institutional learning", "Enable universities to learn from one another and strengthen global engagement."]
];

export default function UniversityPartnerships() {
  return (
    <>
      <section className="page-hero">
        <div className="container page-hero__inner">
          <div>
            <span className="eyebrow eyebrow--light">University partnerships</span>
            <h1>Connecting institutions around shared academic purpose.</h1>
          </div>
          <div className="page-hero__aside">
            <p>
              We help universities explore, shape, and activate relationships across Africa
              and the United States.
            </p>
          </div>
        </div>
      </section>

      <section className="section university-opening">
        <div className="container university-opening__grid">
          <span className="eyebrow">For universities</span>
          <div>
            <h2 className="display">Global engagement becomes stronger when relationships have a reason.</h2>
            <p>
              Continental Founders™ helps institutions identify where collaboration can be
              meaningful, who should be involved, and how an initial relationship can become
              a practical program of engagement.
            </p>
          </div>
        </div>
      </section>

      <MediaSplit
        eyebrow="What partnership can unlock"
        title="A broader academic network."
        text={[
          "University partnerships can create access to new research conversations, faculty expertise, student perspectives, professional networks, and institutional learning.",
          "The opportunity is to build relationships that are reciprocal rather than transactional—relationships where every participant can contribute and learn."
        ]}
        image="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1500&q=85"
        imageAlt="Students walking across a university campus"
      />

      <section className="section section--light">
        <div className="container">
          <SectionHeading
            eyebrow="Potential outcomes"
            title="Partnerships can begin in one area and grow into many."
          />
          <div className="outcome-grid">
            {outcomes.map(([title, text], i) => (
              <article key={title}>
                <span>0{i + 1}</span>
                <h3>{title}</h3>
                <p>{text}</p>
                <ArrowUpRight size={18} />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="Our wider ecosystem"
            title="Universities are part of a broader partnership network."
            text="Academic collaboration can become stronger when institutions are able to engage aligned research organizations, foundations, nonprofits, industry, and other strategic actors."
          />
          <PartnerTypeGrid />
        </div>
      </section>

      <CTASection
        eyebrow="For university leaders"
        title="Have a partnership opportunity in mind?"
        text="Share the institution, priority area, geography, and type of collaboration you are exploring. We will use that context to understand the opportunity."
      />
    </>
  );
}