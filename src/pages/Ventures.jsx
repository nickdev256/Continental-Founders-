import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  ArrowRight,
  Search,
  Globe2,
  GraduationCap,
  Users,
  BriefcaseBusiness,
  Coins,
} from "lucide-react";

import "./Ventures.css";


/* ============================================================
   API
============================================================ */

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";


/* ============================================================
   JOURNEY
============================================================ */

const journey = [
  {
    number: "01",
    title: "Potential",
    text: "Ideas and ambition.",
  },
  {
    number: "02",
    title: "Preparation",
    text: "Knowledge and strategy.",
  },
  {
    number: "03",
    title: "Execution",
    text: "Building and testing.",
  },
  {
    number: "04",
    title: "Evidence",
    text: "Validation and traction.",
  },
  {
    number: "05",
    title: "Opportunity",
    text: "Markets and growth.",
  },
];


/* ============================================================
   HELPERS
============================================================ */

function getLogo(venture) {
  return (
    venture?.logoUrl ||
    venture?.logo_url ||
    venture?.logo ||
    ""
  );
}


function getFounders(venture) {
  if (
    Array.isArray(
      venture?.founders
    )
  ) {
    return venture.founders;
  }

  return [];
}


function getFounderNames(venture) {
  const founders =
    getFounders(venture);

  if (
    founders.length > 0
  ) {
    return founders
      .map(
        (founder) =>
          founder?.name
      )
      .filter(Boolean)
      .join(", ");
  }

  return (
    venture?.founder ||
    ""
  );
}


function getDescription(venture) {
  return (
    venture?.description ||
    venture?.tagline ||
    ""
  );
}


function getSector(venture) {
  return (
    venture?.sector ||
    "Other"
  );
}


function getStatus(venture) {
  return String(
    venture?.status ||
    ""
  )
    .trim()
    .toLowerCase();
}


/* ============================================================
   VENTURES
============================================================ */

export default function Ventures() {

  const [
    ventures,
    setVentures,
  ] =
    useState([]);


  const [
    loading,
    setLoading,
  ] =
    useState(true);


  const [
    error,
    setError,
  ] =
    useState("");


  const [
    activeCategory,
    setActiveCategory,
  ] =
    useState("All");


  const [
    searchTerm,
    setSearchTerm,
  ] =
    useState("");


  /* ==========================================================
     LOAD VENTURES
  ========================================================== */

  useEffect(
    () => {

      let cancelled =
        false;


      async function loadVentures() {

        setLoading(true);
        setError("");


        try {

          const response =
            await fetch(
              `${API_URL}/api/ventures`,
              {
                method:
                  "GET",

                headers: {
                  Accept:
                    "application/json",
                },
              }
            );


          const contentType =
            response.headers.get(
              "content-type"
            ) || "";


          let result =
            null;


          if (
            contentType.includes(
              "application/json"
            )
          ) {

            result =
              await response.json();

          } else {

            const body =
              await response.text();


            console.error(
              "Unexpected ventures response:",
              body
            );


            throw new Error(
              "The ventures service returned an unexpected response."
            );

          }


          if (
            !response.ok
          ) {

            throw new Error(
              result?.message ||
              "Unable to load ventures."
            );

          }


          const records =
            Array.isArray(
              result?.ventures
            )
              ? result.ventures
              : [];


          if (
            !cancelled
          ) {

            setVentures(
              records
            );

          }

        } catch (loadError) {

          console.error(
            "Public ventures error:",
            loadError
          );


          if (
            !cancelled
          ) {

            setError(
              loadError?.message ||
              "Unable to load ventures."
            );

            setVentures(
              []
            );

          }

        } finally {

          if (
            !cancelled
          ) {

            setLoading(
              false
            );

          }

        }

      }


      loadVentures();


      return () => {

        cancelled =
          true;

      };

    },
    []
  );


  /* ==========================================================
     PUBLISHED VENTURES
  ========================================================== */

  const publishedVentures =
    useMemo(
      () => {

        return ventures.filter(
          (venture) => {

            const status =
              getStatus(
                venture
              );


            /*
             * Backend should already return
             * published ventures only.
             *
             * This safeguard prevents draft
             * or archived content being shown
             * if the API changes later.
             */

            return (
              !status ||
              status ===
                "published"
            );

          }
        );

      },
      [
        ventures,
      ]
    );


  /* ==========================================================
     DYNAMIC CATEGORIES
  ========================================================== */

  const categories =
    useMemo(
      () => {

        const sectors =
          publishedVentures
            .map(
              (venture) =>
                getSector(
                  venture
                )
            )
            .filter(Boolean);


        const uniqueSectors =
          Array.from(
            new Set(
              sectors
            )
          )
            .sort(
              (
                first,
                second
              ) =>
                first.localeCompare(
                  second
                )
            );


        return [
          "All",
          ...uniqueSectors,
        ];

      },
      [
        publishedVentures,
      ]
    );


  /* ==========================================================
     KEEP CATEGORY VALID
  ========================================================== */

  useEffect(
    () => {

      if (
        !categories.includes(
          activeCategory
        )
      ) {

        setActiveCategory(
          "All"
        );

      }

    },
    [
      categories,
      activeCategory,
    ]
  );


  /* ==========================================================
     FILTER VENTURES
  ========================================================== */

  const filteredVentures =
    useMemo(
      () => {

        const query =
          searchTerm
            .trim()
            .toLowerCase();


        return publishedVentures.filter(
          (venture) => {

            const sector =
              getSector(
                venture
              );


            const matchesCategory =
              activeCategory ===
                "All" ||
              sector ===
                activeCategory;


            const searchableText =
              [
                venture?.name,
                venture?.country,
                sector,
                getFounderNames(
                  venture
                ),
                venture?.stage,
                venture?.tagline,
                getDescription(
                  venture
                ),
              ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();


            const matchesSearch =
              !query ||
              searchableText.includes(
                query
              );


            return (
              matchesCategory &&
              matchesSearch
            );

          }
        );

      },
      [
        publishedVentures,
        activeCategory,
        searchTerm,
      ]
    );


  return (

    <main className="ventures-page">

      {/* ========================================================
          HERO
      ========================================================= */}

      <section className="ventures-hero">

        <div
          className="ventures-hero__background"
          aria-hidden="true"
        />

        <div
          className="ventures-hero__overlay"
          aria-hidden="true"
        />

        <div className="ventures-container ventures-hero__inner">

          <div className="ventures-hero__content">

            <span className="ventures-eyebrow ventures-eyebrow--light">
              Continental Founders Ventures
            </span>

            <h1>
              Meet the ventures
              <br />
              building what comes next.
            </h1>

            <p>
              A growing community of founders building ambitious
              companies across Africa and the global diaspora.
            </p>

            <a
              href="#ventures"
              className="ventures-button ventures-button--gold"
            >
              Explore Ventures

              <ArrowRight
                size={17}
                aria-hidden="true"
              />
            </a>

          </div>


          <div className="ventures-hero__belief">

            <span>
              Our Belief
            </span>

            <strong>
              Talent is everywhere.
              <br />
              Access is not.
            </strong>

            <p>
              Connecting promising founders with knowledge,
              relationships, markets, and opportunity.
            </p>

          </div>

        </div>

      </section>


      {/* ========================================================
          VENTURE DIRECTORY
      ========================================================= */}

      <section
        id="ventures"
        className="ventures-directory"
      >

        <div className="ventures-container">

          <div className="ventures-section-header">

            <div>

              <span className="ventures-section-number">
                01
              </span>

              <span className="ventures-eyebrow">
                Our Ventures
              </span>

            </div>


            <h2>
              Ambitious companies.
              <br />
              Founders moving forward.
            </h2>

          </div>


          {/* ====================================================
              LOADING
          ===================================================== */}

          {loading && (

            <div className="ventures-empty">

              <h3>
                Loading ventures...
              </h3>

              <p>
                Please wait while we load the venture directory.
              </p>

            </div>

          )}


          {/* ====================================================
              ERROR
          ===================================================== */}

          {!loading &&
            error && (

            <div className="ventures-empty">

              <h3>
                Ventures are temporarily unavailable.
              </h3>

              <p>
                {error}
              </p>

            </div>

          )}


          {/* ====================================================
              DIRECTORY
          ===================================================== */}

          {!loading &&
            !error && (

            <>

              {/* ==================================================
                  FILTER BAR
              ================================================== */}

              <div className="ventures-toolbar">

                <div className="ventures-categories">

                  {categories.map(
                    (category) => (

                      <button
                        key={category}
                        type="button"
                        className={
                          activeCategory ===
                          category
                            ? "venture-filter active"
                            : "venture-filter"
                        }
                        onClick={() =>
                          setActiveCategory(
                            category
                          )
                        }
                      >
                        {category}
                      </button>

                    )
                  )}

                </div>


                <label className="ventures-search">

                  <Search
                    size={17}
                    aria-hidden="true"
                  />

                  <input
                    type="search"
                    value={searchTerm}
                    placeholder="Search ventures"
                    aria-label="Search ventures"
                    onChange={(
                      event
                    ) =>
                      setSearchTerm(
                        event.target.value
                      )
                    }
                  />

                </label>

              </div>


              {/* ==================================================
                  VENTURE GRID
              ================================================== */}

              {filteredVentures.length > 0 ? (

                <div className="ventures-grid">

                  {filteredVentures.map(
                    (
                      venture,
                      index
                    ) => {

                      const logo =
                        getLogo(
                          venture
                        );


                      const founderNames =
                        getFounderNames(
                          venture
                        );


                      return (

                        <article
                          key={
                            venture.id ||
                            venture.slug
                          }
                          className="venture-card"
                        >

                          <div className="venture-card__top">

                            <span className="venture-card__number">
                              {String(
                                index + 1
                              ).padStart(
                                2,
                                "0"
                              )}
                            </span>

                            <span className="venture-card__sector">
                              {getSector(
                                venture
                              )}
                            </span>

                          </div>


                          <div className="venture-card__logo">

                            {logo ? (

                              <img
                                src={logo}
                                alt={`${venture.name} logo`}
                              />

                            ) : (

                              <div className="venture-card__logo-placeholder">

                                {String(
                                  venture?.name ||
                                  "Venture"
                                )
                                  .split(
                                    /\s+/
                                  )
                                  .filter(
                                    Boolean
                                  )
                                  .map(
                                    (
                                      word
                                    ) =>
                                      word.charAt(
                                        0
                                      )
                                  )
                                  .join("")
                                  .slice(
                                    0,
                                    2
                                  )
                                  .toUpperCase()}

                              </div>

                            )}

                          </div>


                          <h3>
                            {venture.name}
                          </h3>


                          {venture.country && (

                            <div className="venture-card__location">

                              <Globe2
                                size={14}
                                aria-hidden="true"
                              />

                              <span>
                                {venture.country}
                              </span>

                            </div>

                          )}


                          <p className="venture-card__description">
                            {getDescription(
                              venture
                            ) ||
                              "Venture profile coming soon."}
                          </p>


                          <div className="venture-card__footer">

                            <div>

                              <span>
                                Founder
                              </span>

                              <strong>
                                {founderNames ||
                                  "Founder profile"}
                              </strong>

                            </div>


                            <div>

                              <span>
                                Stage
                              </span>

                              <strong>
                                {venture.stage ||
                                  "Not specified"}
                              </strong>

                            </div>

                          </div>


                          <Link
                            to={`/ventures/${venture.slug}`}
                            className="venture-card__link"
                          >
                            View Venture

                            <ArrowRight
                              size={16}
                              aria-hidden="true"
                            />
                          </Link>

                        </article>

                      );

                    }
                  )}

                </div>

              ) : (

                <div className="ventures-empty">

                  <h3>
                    No ventures found.
                  </h3>

                  <p>
                    {publishedVentures.length === 0
                      ? "There are currently no ventures available."
                      : "Try another search or category."}
                  </p>

                </div>

              )}

            </>

          )}

        </div>

      </section>


      {/* ========================================================
          JOURNEY
      ========================================================= */}

      <section className="ventures-journey">

        <div className="ventures-container">

          <div className="ventures-journey__heading">

            <div>

              <span className="ventures-section-number">
                02
              </span>

              <span className="ventures-eyebrow">
                The Journey
              </span>

            </div>


            <h2>
              From potential
              <br />
              to opportunity.
            </h2>

          </div>


          <div className="venture-journey-grid">

            {journey.map(
              (
                step,
                index
              ) => (

                <article
                  key={step.number}
                  className="venture-journey-step"
                >

                  <div className="venture-journey-step__number">
                    {step.number}
                  </div>

                  <h3>
                    {step.title}
                  </h3>

                  <p>
                    {step.text}
                  </p>

                  {index <
                    journey.length -
                      1 && (

                    <ArrowRight
                      className="venture-journey-step__arrow"
                      size={18}
                      aria-hidden="true"
                    />

                  )}

                </article>

              )
            )}

          </div>

        </div>

      </section>


      {/* ========================================================
          ECOSYSTEM
      ========================================================= */}

      <section className="ventures-ecosystem">

        <div className="ventures-container ventures-ecosystem__grid">

          <div className="ventures-ecosystem__content">

            <div>

              <span className="ventures-section-number">
                03
              </span>

              <span className="ventures-eyebrow">
                The Ecosystem
              </span>

            </div>


            <h2>
              Great ventures are
              <br />
              not built alone.
            </h2>


            <p>
              Continental Founders brings together the people
              and institutions that can help founders move forward.
            </p>


            <Link
              to="/our-model"
              className="ventures-text-link"
            >
              Explore Our Model

              <ArrowRight
                size={17}
                aria-hidden="true"
              />
            </Link>

          </div>


          <div className="ventures-ecosystem__network">

            <div className="ecosystem-network__center">
              Venture
            </div>


            <div className="ecosystem-network__item">

              <GraduationCap
                size={22}
                aria-hidden="true"
              />

              <span>
                Universities
              </span>

            </div>


            <div className="ecosystem-network__item">

              <BriefcaseBusiness
                size={22}
                aria-hidden="true"
              />

              <span>
                Industry
              </span>

            </div>


            <div className="ecosystem-network__item">

              <Users
                size={22}
                aria-hidden="true"
              />

              <span>
                Mentors
              </span>

            </div>


            <div className="ecosystem-network__item">

              <Coins
                size={22}
                aria-hidden="true"
              />

              <span>
                Investors
              </span>

            </div>


            <div className="ecosystem-network__item">

              <Globe2
                size={22}
                aria-hidden="true"
              />

              <span>
                Markets
              </span>

            </div>

          </div>

        </div>

      </section>


      {/* ========================================================
          FINAL CTA
      ========================================================= */}

      <section className="ventures-final">

        <div className="ventures-container ventures-final__grid">

          <div>

            <span className="ventures-eyebrow">
              Build With Us
            </span>

            <h2>
              Be part of what
              <br />
              comes next.
            </h2>

          </div>


          <div className="ventures-final__content">

            <p>
              Whether you are a founder, university, investor,
              business, sponsor, or strategic partner, there is
              a place for you in the Continental Founders ecosystem.
            </p>


            <div className="ventures-final__actions">

              <Link
                to="/contact"
                className="ventures-button ventures-button--gold"
              >
                Start a Conversation

                <ArrowRight
                  size={17}
                  aria-hidden="true"
                />
              </Link>


              <Link
                to="/our-model"
                className="ventures-button ventures-button--outline"
              >
                Our Model

                <ArrowRight
                  size={17}
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