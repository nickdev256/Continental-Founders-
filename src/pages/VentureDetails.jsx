import React from "react";
import { Link, useParams } from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  Globe2,
  MapPin,
  UserRound,
  TrendingUp,
  BriefcaseBusiness,
  GraduationCap,
  Users,
  Coins,
  ExternalLink,
  Mail,
  Phone,
  Layers3,
} from "lucide-react";

import ventures from "../data/ventures";

import "./VentureDetails.css";


/* ============================================================
   VENTURE DETAILS
============================================================ */

export default function VentureDetails() {
  const { slug } = useParams();


  /* ==========================================================
     FIND VENTURE
  ========================================================== */

  const venture = ventures.find(
    (item) => item.slug === slug
  );


  /* ==========================================================
     NOT FOUND
  ========================================================== */

  if (!venture) {
    return (
      <main className="venture-details-page">

        <section className="venture-details-not-found">

          <div className="venture-details-container">

            <span className="venture-details-eyebrow">
              Venture Not Found
            </span>

            <h1>
              We couldn't find this venture.
            </h1>

            <p>
              The venture may have been removed,
              renamed, or the link may be incorrect.
            </p>

            <Link
              to="/ventures"
              className="venture-details-button venture-details-button--gold"
            >
              <ArrowLeft
                size={17}
                aria-hidden="true"
              />

              Back to Ventures
            </Link>

          </div>

        </section>

      </main>
    );
  }


  /* ==========================================================
     DATA FALLBACKS
  ========================================================== */

  const founders =
    Array.isArray(venture.founders) &&
    venture.founders.length > 0
      ? venture.founders
      : venture.founder
      ? [
          {
            id: 1,
            name: venture.founder,
            image: venture.founderImage || "",
            role: "Founder",
            bio:
              venture.founderBio ||
              `${venture.founder} is building ${venture.name} with a focus on creating practical value and sustainable growth.`,
          },
        ]
      : [];


  const founderNames =
    founders.length > 0
      ? founders
          .map((founder) => founder.name)
          .join(" & ")
      : "Founder information unavailable";


  const founderLabel =
    founders.length > 1
      ? "Founders"
      : "Founder";


  const lookingFor =
    venture.lookingFor || [
      "Strategic partnerships",
      "Mentorship",
      "Market access",
      "Investment pathways",
    ];


  const opportunityAreas =
    venture.opportunityAreas || [
      {
        title: "Problem",
        text:
          venture.problem ||
          "The venture is addressing a meaningful market challenge.",
      },

      {
        title: "Solution",
        text:
          venture.solution ||
          venture.description,
      },

      {
        title: "Market",
        text:
          venture.market ||
          "Building toward a clear and scalable market opportunity.",
      },

      {
        title: "Current Stage",
        text:
          venture.stage ||
          "Early-stage venture development.",
      },
    ];


  const services =
    Array.isArray(venture.services)
      ? venture.services
      : [];


  return (
    <main className="venture-details-page">


      {/* ========================================================
          HERO
      ========================================================= */}

      <section className="venture-details-hero">

        {venture.heroImage && (

          <div
            className="venture-details-hero__background"
            style={{
              backgroundImage:
                `url("${venture.heroImage}")`,
            }}
            aria-hidden="true"
          />

        )}


        <div
          className="venture-details-hero__overlay"
          aria-hidden="true"
        />


        <div className="venture-details-container venture-details-hero__inner">

          <div className="venture-details-hero__content">

            <Link
              to="/ventures"
              className="venture-details-back-link"
            >
              <ArrowLeft
                size={16}
                aria-hidden="true"
              />

              All Ventures
            </Link>


            <div className="venture-details-hero__meta">

              <span>
                {venture.sector}
              </span>

              <span className="venture-details-meta-dot">
                •
              </span>

              <span>
                {venture.country}
              </span>

            </div>


            <h1>
              {venture.name}
            </h1>


            <p className="venture-details-hero__description">
              {venture.tagline ||
                venture.description}
            </p>


            <div className="venture-details-hero__actions">

              <a
                href="#venture-overview"
                className="venture-details-button venture-details-button--gold"
              >
                Explore Venture

                <ArrowRight
                  size={17}
                  aria-hidden="true"
                />
              </a>


              {venture.website && (

                <a
                  href={venture.website}
                  target="_blank"
                  rel="noreferrer"
                  className="venture-details-button venture-details-button--outline-light"
                >
                  Visit Website

                  <ExternalLink
                    size={16}
                    aria-hidden="true"
                  />
                </a>

              )}

            </div>

          </div>


          <div className="venture-details-hero__profile">

            {venture.logo ? (

              <div className="venture-details-logo">

                <img
                  src={venture.logo}
                  alt={`${venture.name} logo`}
                />

              </div>

            ) : (

              <div className="venture-details-logo-placeholder">

                {venture.name
                  .split(" ")
                  .map((word) =>
                    word.charAt(0)
                  )
                  .join("")
                  .slice(0, 2)}

              </div>

            )}


            <div className="venture-details-hero__profile-grid">

              <div>

                <span>
                  {founderLabel}
                </span>

                <strong>
                  {founderNames}
                </strong>

              </div>


              <div>

                <span>
                  Stage
                </span>

                <strong>
                  {venture.stage}
                </strong>

              </div>


              <div>

                <span>
                  Sector
                </span>

                <strong>
                  {venture.sector}
                </strong>

              </div>


              <div>

                <span>
                  Location
                </span>

                <strong>
                  {venture.country}
                </strong>

              </div>

            </div>

          </div>

        </div>

      </section>



      {/* ========================================================
          OVERVIEW
      ========================================================= */}

      <section
        id="venture-overview"
        className="venture-details-overview"
      >

        <div className="venture-details-container">

          <div className="venture-details-section-heading">

            <div>

              <span className="venture-details-section-number">
                01
              </span>

              <span className="venture-details-eyebrow">
                Venture Overview
              </span>

            </div>


            <h2>
              Building with purpose.
              <br />
              Moving toward opportunity.
            </h2>

          </div>


          <div className="venture-details-overview__grid">

            <div className="venture-details-overview__main">

              <h3>
                About {venture.name}
              </h3>

              <p>
                {venture.longDescription ||
                  venture.description}
              </p>


              {venture.secondaryDescription && (

                <p>
                  {venture.secondaryDescription}
                </p>

              )}

            </div>


            <aside className="venture-details-facts">

              <div className="venture-details-fact">

                <UserRound
                  size={18}
                  aria-hidden="true"
                />

                <div>

                  <span>
                    {founderLabel}
                  </span>

                  <strong>
                    {founderNames}
                  </strong>

                </div>

              </div>


              <div className="venture-details-fact">

                <Globe2
                  size={18}
                  aria-hidden="true"
                />

                <div>

                  <span>
                    Country
                  </span>

                  <strong>
                    {venture.country}
                  </strong>

                </div>

              </div>


              <div className="venture-details-fact">

                <BriefcaseBusiness
                  size={18}
                  aria-hidden="true"
                />

                <div>

                  <span>
                    Sector
                  </span>

                  <strong>
                    {venture.sector}
                  </strong>

                </div>

              </div>


              <div className="venture-details-fact">

                <TrendingUp
                  size={18}
                  aria-hidden="true"
                />

                <div>

                  <span>
                    Stage
                  </span>

                  <strong>
                    {venture.stage}
                  </strong>

                </div>

              </div>

            </aside>

          </div>

        </div>

      </section>



      {/* ========================================================
          SERVICES
      ========================================================= */}

      {services.length > 0 && (

        <section className="venture-details-services">

          <div className="venture-details-container">

            <div className="venture-details-section-heading">

              <div>

                <span className="venture-details-section-number">
                  02
                </span>

                <span className="venture-details-eyebrow">
                  What We Do
                </span>

              </div>


              <h2>
                Practical solutions
                built for real needs.
              </h2>

            </div>


            <div className="venture-details-services__grid">

              {services.map(
                (service, index) => (

                  <article
                    key={`${service}-${index}`}
                    className="venture-details-service-card"
                  >

                    <div className="venture-details-service-card__icon">

                      <Layers3
                        size={20}
                        aria-hidden="true"
                      />

                    </div>


                    <span className="venture-details-service-card__number">
                      {String(index + 1).padStart(
                        2,
                        "0"
                      )}
                    </span>


                    <h3>
                      {service}
                    </h3>

                  </article>

                )
              )}

            </div>

          </div>

        </section>

      )}



      {/* ========================================================
          OPPORTUNITY
      ========================================================= */}

      <section className="venture-details-opportunity">

        <div className="venture-details-container">

          <div className="venture-details-section-heading">

            <div>

              <span className="venture-details-section-number">
                {services.length > 0
                  ? "03"
                  : "02"}
              </span>

              <span className="venture-details-eyebrow">
                The Opportunity
              </span>

            </div>


            <h2>
              Understanding the venture
              beyond the idea.
            </h2>

          </div>


          <div className="venture-opportunity-grid">

            {opportunityAreas.map(
              (item, index) => (

                <article
                  key={`${item.title}-${index}`}
                  className="venture-opportunity-card"
                >

                  <span className="venture-opportunity-card__number">
                    {String(index + 1).padStart(
                      2,
                      "0"
                    )}
                  </span>

                  <h3>
                    {item.title}
                  </h3>

                  <p>
                    {item.text}
                  </p>

                </article>

              )
            )}

          </div>

        </div>

      </section>



      {/* ========================================================
          FOUNDERS
      ========================================================= */}

      {founders.length > 0 && (

        <section className="venture-details-founder">

          <div className="venture-details-container venture-details-founder__grid">

            <div>

              <span className="venture-details-section-number">
                {services.length > 0
                  ? "04"
                  : "03"}
              </span>

              <span className="venture-details-eyebrow">
                {founders.length > 1
                  ? "Founders"
                  : "Founder"}
              </span>

            </div>


            <div className="venture-details-founder__content">

              <h2>
                {founders.length > 1
                  ? "Meet the founders behind the venture."
                  : "Meet the founder behind the venture."}
              </h2>


              <div className="venture-details-founders__grid">

                {founders.map(
                  (founder, index) => {

                    const initials =
                      founder.name
                        ?.split(" ")
                        .map((name) =>
                          name.charAt(0)
                        )
                        .join("")
                        .slice(0, 2)
                        .toUpperCase() ||
                      "CF";


                    return (

                      <article
                        key={
                          founder.id ||
                          `${founder.name}-${index}`
                        }
                        className="venture-details-founder__card"
                      >

                        <div className="venture-details-founder__avatar">

                          {founder.image ? (

                            <img
                              src={founder.image}
                              alt={founder.name}
                            />

                          ) : (

                            <span>
                              {initials}
                            </span>

                          )}

                        </div>


                        <div className="venture-details-founder__info">

                          <h3>
                            {founder.name}
                          </h3>

                          <span className="venture-details-founder__role">
                            {founder.role ||
                              "Founder"}
                            , {venture.name}
                          </span>

                          <p>
                            {founder.bio ||
                              `${founder.name} is helping build ${venture.name} with a focus on creating practical value and sustainable growth.`}
                          </p>

                        </div>

                      </article>

                    );
                  }
                )}

              </div>

            </div>

          </div>

        </section>

      )}



      {/* ========================================================
          CONTACT INFORMATION
      ========================================================= */}

      {(venture.website ||
        venture.email ||
        venture.phone ||
        venture.secondaryPhone) && (

        <section className="venture-details-contact">

          <div className="venture-details-container">

            <div className="venture-details-section-heading">

              <div>

                <span className="venture-details-section-number">
                  {services.length > 0
                    ? "05"
                    : "04"}
                </span>

                <span className="venture-details-eyebrow">
                  Venture Contact
                </span>

              </div>


              <h2>
                Connect directly
                with {venture.name}.
              </h2>

            </div>


            <div className="venture-details-contact__grid">

              {venture.website && (

                <a
                  href={venture.website}
                  target="_blank"
                  rel="noreferrer"
                  className="venture-details-contact__card"
                >

                  <Globe2
                    size={20}
                    aria-hidden="true"
                  />

                  <div>

                    <span>
                      Website
                    </span>

                    <strong>
                      {venture.website
                        .replace(
                          "https://",
                          ""
                        )
                        .replace(
                          "http://",
                          ""
                        )}
                    </strong>

                  </div>

                  <ExternalLink
                    size={16}
                    aria-hidden="true"
                  />

                </a>

              )}


              {venture.email && (

                <a
                  href={`mailto:${venture.email}`}
                  className="venture-details-contact__card"
                >

                  <Mail
                    size={20}
                    aria-hidden="true"
                  />

                  <div>

                    <span>
                      Email
                    </span>

                    <strong>
                      {venture.email}
                    </strong>

                  </div>

                </a>

              )}


              {venture.phone && (

                <a
                  href={`tel:${venture.phone}`}
                  className="venture-details-contact__card"
                >

                  <Phone
                    size={20}
                    aria-hidden="true"
                  />

                  <div>

                    <span>
                      Phone
                    </span>

                    <strong>
                      {venture.phone}
                    </strong>

                  </div>

                </a>

              )}


              {venture.secondaryPhone && (

                <a
                  href={`tel:${venture.secondaryPhone}`}
                  className="venture-details-contact__card"
                >

                  <Phone
                    size={20}
                    aria-hidden="true"
                  />

                  <div>

                    <span>
                      Alternative Phone
                    </span>

                    <strong>
                      {venture.secondaryPhone}
                    </strong>

                  </div>

                </a>

              )}

            </div>

          </div>

        </section>

      )}



      {/* ========================================================
          CONTINENTAL FOUNDERS JOURNEY
      ========================================================= */}

      <section className="venture-details-journey">

        <div className="venture-details-container">

          <div className="venture-details-section-heading venture-details-section-heading--light">

            <div>

              <span className="venture-details-section-number">
                {services.length > 0
                  ? "06"
                  : "05"}
              </span>

              <span className="venture-details-eyebrow venture-details-eyebrow--light">
                Venture Journey
              </span>

            </div>


            <h2>
              Potential to
              global opportunity.
            </h2>

          </div>


          <div className="venture-details-journey__grid">

            {[
              "Potential",
              "Preparation",
              "Execution",
              "Evidence",
              "Opportunity",
            ].map(
              (step, index) => (

                <div
                  key={step}
                  className="venture-details-journey__step"
                >

                  <span>
                    {String(index + 1).padStart(
                      2,
                      "0"
                    )}
                  </span>

                  <strong>
                    {step}
                  </strong>

                </div>

              )
            )}

          </div>

        </div>

      </section>



      {/* ========================================================
          LOOKING FOR
      ========================================================= */}

      <section className="venture-details-looking">

        <div className="venture-details-container venture-details-looking__grid">

          <div className="venture-details-looking__content">

            <div>

              <span className="venture-details-section-number">
                {services.length > 0
                  ? "07"
                  : "06"}
              </span>

              <span className="venture-details-eyebrow">
                Looking For
              </span>

            </div>


            <h2>
              The right relationships
              can move a venture forward.
            </h2>


            <p>
              Continental Founders helps create pathways
              between ventures and people or institutions
              that can contribute meaningful expertise,
              relationships, markets, resources, and
              opportunity.
            </p>

          </div>


          <div className="venture-details-looking__list">

            {lookingFor.map(
              (item, index) => (

                <div
                  key={`${item}-${index}`}
                  className="venture-details-looking__item"
                >

                  <span>
                    {String(index + 1).padStart(
                      2,
                      "0"
                    )}
                  </span>

                  <strong>
                    {item}
                  </strong>

                </div>

              )
            )}

          </div>

        </div>

      </section>



      {/* ========================================================
          ECOSYSTEM CTA
      ========================================================= */}

      <section className="venture-details-ecosystem">

        <div className="venture-details-container venture-details-ecosystem__grid">

          <div>

            <span className="venture-details-eyebrow venture-details-eyebrow--light">
              Continental Founders Ecosystem
            </span>

            <h2>
              Great ventures are
              not built alone.
            </h2>

            <p>
              Continental Founders brings universities,
              professionals, mentors, investors, companies,
              and markets around ambitious founders.
            </p>

          </div>


          <div className="venture-details-ecosystem__items">

            <div>
              <GraduationCap size={22} />
              <span>Universities</span>
            </div>

            <div>
              <BriefcaseBusiness size={22} />
              <span>Industry</span>
            </div>

            <div>
              <Users size={22} />
              <span>Mentors</span>
            </div>

            <div>
              <Coins size={22} />
              <span>Investors</span>
            </div>

            <div>
              <Globe2 size={22} />
              <span>Markets</span>
            </div>

            <div>
              <MapPin size={22} />
              <span>Opportunity</span>
            </div>

          </div>

        </div>

      </section>



      {/* ========================================================
          FINAL CTA
      ========================================================= */}

      <section className="venture-details-final">

        <div className="venture-details-container venture-details-final__grid">

          <div>

            <span className="venture-details-eyebrow">
              Connect
            </span>

            <h2>
              Interested in
              {` ${venture.name}`}?
            </h2>

          </div>


          <div className="venture-details-final__content">

            <p>
              Connect with Continental Founders to learn
              more about this venture and explore
              opportunities for collaboration, mentorship,
              partnership, market access, or investment
              engagement.
            </p>


            <div className="venture-details-final__actions">

              <Link
                to="/contact"
                className="venture-details-button venture-details-button--gold"
              >
                Connect With Venture

                <ArrowRight
                  size={17}
                  aria-hidden="true"
                />
              </Link>


              {venture.website && (

                <a
                  href={venture.website}
                  target="_blank"
                  rel="noreferrer"
                  className="venture-details-button venture-details-button--outline"
                >
                  Visit Venture Website

                  <ExternalLink
                    size={16}
                    aria-hidden="true"
                  />
                </a>

              )}


              <Link
                to="/ventures"
                className="venture-details-button venture-details-button--outline"
              >
                View All Ventures
              </Link>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}