import React from "react";
import SectionHeading from "../components/ui/SectionHeading";
import PartnerTypeGrid from "../components/sections/PartnerTypeGrid";
import MediaSplit from "../components/sections/MediaSplit";
import CTASection from "../components/sections/CTASection";
import "./StrategicPartners.css";

const contributions = [
  "Expertise and technical knowledge",
  "Research and innovation capacity",
  "Funding or resource support",
  "Technology and infrastructure",
  "Professional networks",
  "Mentorship and leadership",
  "Program implementation",
  "Community and sector access"
];

export default function StrategicPartners() {
  return (
    <>
      <section className="page-hero">
        <div className="container page-hero__inner">
          <div>
            <span className="eyebrow eyebrow--light">Strategic partners</span>
            <h1>Bring capability, networks, and purpose together.</h1>
          </div>
          <div className="page-hero__aside">
            <p>
              We connect institutions with organizations whose expertise, resources, and
              networks can strengthen shared priorities.
            </p>
          </div>
        </div>
      </section>

      <section className="section strategic-opening">
        <div className="container strategic-opening__grid">
          <span className="eyebrow">Beyond the university</span>
          <div>
            <h2 className="display">The right strategic partner can turn an idea into an ecosystem.</h2>
            <p>
              Strategic partnerships can bring together complementary capabilities. The
              opportunity is to connect those capabilities around a clear objective rather
              than creating relationships for their own sake.
            </p>
          </div>
        </div>
      </section>

      <MediaSplit
        reverse
        eyebrow="A broader network"
        title="Different institutions. Shared opportunity."
        text={[
          "Foundations, nonprofits, corporations, research institutions, professional networks, and other organizations can contribute resources or expertise that universities cannot create alone.",
          "We look for alignment between what a partner can contribute and what the wider collaboration is trying to accomplish."
        ]}
        image="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1500&q=85"
        imageAlt="Strategic partners collaborating around a table"
      />

      <section className="section section--light">
        <div className="container">
          <SectionHeading
            eyebrow="Who can contribute"
            title="Partnership takes many forms."
            text="A strategic partner does not need to look like a university. The key question is whether the relationship can create useful shared value."
          />
          <div className="contribution-grid">
            {contributions.map((item, i) => (
              <div key={item}><span>0{i + 1}</span><p>{item}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeading
            eyebrow="Partner ecosystem"
            title="A network designed around complementarity."
          />
          <PartnerTypeGrid />
        </div>
      </section>

      <CTASection
        eyebrow="For strategic organizations"
        title="Where could your capabilities create shared value?"
        text="Tell us about your organization, what you bring, and the type of institutional or programmatic opportunity you want to explore."
      />
    </>
  );
}