import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import SectionHeading from "../components/ui/SectionHeading";
import ProcessGrid from "../components/sections/ProcessGrid";
import MediaSplit from "../components/sections/MediaSplit";

import "./OurModel.css";


/* ============================================================
   FOUR LENSES DATA
============================================================ */

const lenses = [ 
  [
    "Institutional fit",
    "We consider whether the relationship aligns with real priorities, capabilities, and institutional interests.",
  ],
  [
    "People & trust",
    "The quality of the people involved shapes whether a partnership can survive beyond the first meeting.",
  ],
  [
    "Practical pathways",
    "A strong partnership has a next step: a program, conversation, research connection, exchange, or shared initiative.",
  ],
  [
    "Sustainability",
    "We encourage relationships that can mature through stewardship, learning, and realistic resourcing.",
  ],
];


const heroThemes = [
  "People",
  "Partnerships",
  "Opportunity",
  "Impact",
];


/* ============================================================
   OUR MODEL
============================================================ */

export default function OurModel() {
  return (
    <main className="our-model-page">

      {/* ========================================================
          HERO
      ========================================================= */}

     <section className="model-hero">

  <div className="model-hero__background" aria-hidden="true">
    <img
      // src="/assets/hero.png"
      alt=""
    />
  </div>
        <div
          className="model-hero__overlay"
          aria-hidden="true"
        />

        <div className="container model-hero__inner">

          <div className="model-hero__content">

            <div className="model-hero__eyebrow-row">

              <span className="model-hero__eyebrow">
                Our Model
              </span>

              <span
                className="model-hero__eyebrow-line"
                aria-hidden="true"
              />

            </div>


            <h1>
              From introduction
              <br />
              to institutional
              <br />
              collaboration.
            </h1>


            <p className="model-hero__description">
              A partnership is not a single event. It is a process
              of discovery, alignment, design, activation, and
              learning.
            </p>


            <div className="model-hero__themes">

              {heroThemes.map((theme) => (

                <div
                  key={theme}
                  className="model-hero__theme"
                >
                  <span>
                    {theme}
                  </span>

                  <div
                    className="model-hero__theme-line"
                    aria-hidden="true"
                  />
                </div>

              ))}

            </div>


            <p className="model-hero__statement">
              A stronger Africa. A more connected world.
            </p>

          </div>

        </div>

      </section>



      {/* ========================================================
    HOW WE THINK
======================================================== */}

<section className="section model-intro">

  <div className="container model-intro__grid">

    {/* LEFT COLUMN */}
    <div className="model-intro__visual">

      <div className="model-intro__label">
        <span className="eyebrow">
          How we think
        </span>
      </div>
      

      <div className="model-intro__image">

        <img
          src="/assets/n.png"
          alt="Students and university leaders building meaningful relationships"
        />

        <div className="model-intro__image-overlay" />

       

      </div>

    </div>


    {/* RIGHT COLUMN */}
    <div className="model-intro__content">

      <span className="model-intro__number">
        
      </span>

      <h2 className="display">
        We focus on the architecture behind meaningful
        relationships.
      </h2>

      <p>
        Our model gives partners a common language for moving
        from an initial point of connection to practical
        collaboration. It is structured enough to create clarity,
        while flexible enough to respect the context of each
        institution.
      </p>

      <div className="model-intro__rule" />

      <span className="model-intro__statement">
        Building relationships that create lasting opportunity.
      </span>

    </div>

  </div>

</section>



      {/* ========================================================
          PARTNERSHIP PATHWAY
      ========================================================= */}

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



      {/* ========================================================
          PARTNERSHIP DESIGN
      ========================================================= */}

      <MediaSplit
        reverse
        eyebrow="Partnership design"
        title="The right relationship starts with the right questions."
        text={[
          "What does each institution want to achieve? What strengths can each bring? Who needs to be involved? What can be done now, and what needs more groundwork?",
          "These questions help turn broad interest into a partnership that has a credible reason to exist and a practical path forward.",
        ]}
        image="/assets/partnership-design.png"
        imageAlt="African founders and professionals collaborating on research, innovation, and partnership strategy"
      />



      {/* ========================================================
          FOUR LENSES
      ========================================================= */}

      <section className="section section--light">

        <div className="container">

          <SectionHeading
            eyebrow="Four lenses"
            title="What we look for before a partnership moves forward."
            text="Strong relationships require more than shared interest. We consider alignment, trust, practical opportunity, and the potential for long-term value."
          />


          <div className="model-lenses">

            {lenses.map(([title, text], index) => (

              <article key={title}>

                <span>
                  {String(index + 1).padStart(2, "0")}
                </span>

                <h3>
                  {title}
                </h3>

                <p>
                  {text}
                </p>

              </article>

            ))}

          </div>

        </div>

      </section>



      {/* ========================================================
          VENTURES CTA
      ========================================================= */}

      <section className="model-companies-cta">

        <div className="container">

          <div className="model-companies-cta__inner">

            <div className="model-companies-cta__content">

              <span className="model-companies-cta__eyebrow">
                From Potential to Global Opportunity
              </span>


              <h2>
                Meet the Ventures
                <br />
                Building What Comes Next
              </h2>


              <p>
                Continental Founders supports ambitious founders and
                emerging ventures by connecting them to knowledge,
                mentorship, university expertise, strategic
                relationships, markets, and pathways to opportunity.
              </p>


              <p>
                Our goal is to help promising ventures strengthen their
                foundations, validate their ideas, expand their networks,
                access new markets, and position themselves for
                sustainable commercial growth.
              </p>


              <Link
                to="/ventures"
                className="model-companies-cta__button"
              >
                <span>
                  Explore Our Ventures
                </span>

                <ArrowRight
                  size={18}
                  aria-hidden="true"
                />
              </Link>

            </div>


            <div className="model-companies-cta__statement">

              <span>
                Our Purpose
              </span>


              <strong>
                Talent is everywhere.
                <br />
                Access is not.
              </strong>


              <div
                className="model-companies-cta__line"
                aria-hidden="true"
              />


              <p>
                Continental Founders is building an ecosystem around
                founders and their ventures — connecting talent with
                the people, institutions, markets, knowledge, and
                opportunities needed to grow.
              </p>

            </div>

          </div>

        </div>

      </section>



      {/* ========================================================
    FINAL CTA
======================================================== */}

<section className="model-final-cta">

  <div className="container">

    <div className="model-final-cta__inner">

      {/* LEFT COLUMN */}
      <div className="model-final-cta__visual">

        <span className="eyebrow">
          Build with us
        </span>

        <div className="model-final-cta__image">

          <img
            src="/assets/c.png"
            alt="Building meaningful collaboration across communities"
          />

          <div className="model-final-cta__image-overlay" />

         

        </div>

      </div>


      {/* RIGHT COLUMN */}
      <div className="model-final-cta__content">

        <span className="model-final-cta__number">
          
        </span>

        <h2>
          Strong ecosystems are built through
          meaningful collaboration.
        </h2>

        <p>
          Whether you represent a university, investor, company,
          institution, sponsor, or strategic organization,
          Continental Founders creates pathways to work together
          around founders, innovation, and shared opportunity.
        </p>

        <Link
          to="/contact"
          className="model-final-cta__button"
        >
          Start a Conversation

          <ArrowRight
            size={18}
            aria-hidden="true"
          />
        </Link>

      </div>

    </div>

  </div>

</section>
    </main>
  );
}