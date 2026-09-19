import React from "react";

import SectionHeading from "../components/ui/SectionHeading";
import PartnerTypeGrid from "../components/sections/PartnerTypeGrid";
import MediaSplit from "../components/sections/MediaSplit";

import "./StrategicPartners.css";


/* ============================================================
   CONTRIBUTIONS
============================================================ */

const contributions = [
  "Expertise and technical knowledge",
  "Research and innovation capacity",
  "Funding or resource support",
  "Technology and infrastructure",
  "Professional networks",
  "Mentorship and leadership",
  "Program implementation",
  "Community and sector access",
];


/* ============================================================
   STRATEGIC PARTNERS
============================================================ */

export default function StrategicPartners() {
  return (
    <main className="strategic-partners-page">


      {/* ======================================================
          HERO
      ====================================================== */}

      <section className="strategic-partners-hero">

        <div
          className="strategic-partners-hero__background"
          aria-hidden="true"
        />

        <div
          className="strategic-partners-hero__overlay"
          aria-hidden="true"
        />

        <div className="container strategic-partners-hero__inner">

          <div className="strategic-partners-hero__content">

            <span className="strategic-partners-eyebrow strategic-partners-eyebrow--light">
              Strategic Partners
            </span>

            <h1>
              Bring capability,
              networks, and purpose
              together.
            </h1>

          </div>


          <div className="strategic-partners-hero__aside">

            <span
              className="strategic-partners-hero__aside-line"
              aria-hidden="true"
            />

            <p>
              We connect institutions with organizations 
              whose expertise, resources, and networks can
              strengthen shared priorities.
            </p>

          </div>

        </div>


        <div
          className="strategic-partners-hero__bottom-line"
          aria-hidden="true"
        />

      </section>


      {/* ======================================================
          OPENING
      ====================================================== */}

      <section className="section strategic-opening">

        <div className="container strategic-opening__grid">

          <div className="strategic-opening__label">

            <span className="strategic-partners-eyebrow">
              Beyond the University
            </span>

            <span
              className="strategic-opening__line"
              aria-hidden="true"
            />

          </div>


          <div className="strategic-opening__content">

            <h2 className="display">
              The right strategic partner can turn an idea
              into an ecosystem.
            </h2>

            <p>
              Strategic partnerships can bring together
              complementary capabilities. The opportunity
              is to connect those capabilities around a
              clear objective rather than creating
              relationships for their own sake.
            </p>

          </div>

        </div>

      </section>


      {/* ======================================================
          BROADER NETWORK
      ====================================================== */}

      <div className="strategic-partners-media">

        <MediaSplit
          reverse
          eyebrow="A broader network"
          title="Different institutions. Shared opportunity."
          text={[
            "Foundations, nonprofits, corporations, research institutions, professional networks, and other organizations can contribute resources or expertise that universities cannot create alone.",
            "We look for alignment between what a partner can contribute and what the wider collaboration is trying to accomplish.",
          ]}
          image="/assets/x.webp"
          imageAlt="Strategic partners collaborating around a table"
        />

      </div>


      {/* ======================================================
          CONTRIBUTIONS
      ====================================================== */}

      <section className="section section--light strategic-contributions">

        <div className="container">

          <SectionHeading
            eyebrow="Who can contribute"
            title="Partnership takes many forms."
            text="A strategic partner does not need to look like a university. The key question is whether the relationship can create useful shared value."
          />


          <div className="contribution-grid">

            {contributions.map(
              (
                item,
                index
              ) => (
                <article
                  className="contribution-card"
                  key={item}
                >

                  <span className="contribution-card__number">
                    {String(
                      index + 1
                    ).padStart(
                      2,
                      "0"
                    )}
                  </span>

                  <p>
                    {item}
                  </p>

                  <span
                    className="contribution-card__accent"
                    aria-hidden="true"
                  />

                </article>
              )
            )}

          </div>

        </div>

      </section>


      {/* ======================================================
          PARTNER ECOSYSTEM
      ====================================================== */}

      <section className="section strategic-ecosystem">

        <div className="container">

          <SectionHeading
            eyebrow="Partner ecosystem"
            title="A network designed around complementarity."
          />

          <div className="strategic-ecosystem__grid">
            <PartnerTypeGrid />
          </div>

        </div>

      </section>

    </main>
  );
}