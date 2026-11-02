import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  FlaskConical,
  Globe2,
  GraduationCap,
  Landmark,
  Link2,
  MapPin,
  Presentation,
  Users,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import "./Universities.css";


/* ============================================================
   API
============================================================ */

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";


/* ============================================================
   PARTICIPATION AREAS
============================================================ */

const participationAreas = [
  {
    title: "Faculty Expertise",
    text:
      "Professors and specialists can contribute knowledge, mentorship, research insight, and practical guidance to founders working through real venture challenges.",
    icon: Presentation,
    color: "gold",
  },

  {
    title: "Research Collaboration",
    text:
      "Connect relevant research, academic resources, and institutional knowledge with founders, industries, markets, and emerging commercial opportunities.",
    icon: FlaskConical,
    color: "navy",
  },

  {
    title: "Student Engagement",
    text:
      "Create opportunities for students to gain exposure to entrepreneurship, international collaboration, research, and real-world venture development.",
    icon: Users,
    color: "blue",
  },

  {
    title: "Institutional Partnerships",
    text:
      "Build relationships between universities and aligned institutions across Africa, the United States, and the wider global ecosystem.",
    icon: Landmark,
    color: "gold",
  },
];


/* ============================================================
   FOUNDER JOURNEY
============================================================ */

const founderJourney = [
  "Potential",
  "Preparation",
  "Execution",
  "Evidence",
  "Opportunity",
];


/* ============================================================
   PARTNER ECOSYSTEM
   Photos, icons and colours match the Partners page and menu.
============================================================ */

const partnerEcosystem = [
  {
    title: "U.S.–Africa Trade & Business Network",
    text:
      "Connect academic expertise with broader trade, market, business, and commercial networks.",
    path: "/partners/us-africa-trade-network",
    image: "/assets/images/us-africa/market-access.webp",
    icon: Globe2,
    color: "blue",
  },

  {
    title: "Corporate Partners",
    text:
      "Engage companies and industry leaders who can contribute expertise, mentorship, market insight, and commercial opportunity.",
    path: "/partners/corporate",
    image: "/assets/images/us-africa/business-connections.webp",
    icon: Building2,
    color: "gold",
  },

  {
    title: "Government & Development Institutions",
    text:
      "Connect institutional knowledge with organizations supporting economic development, entrepreneurship, and market access.",
    path: "/partners/government-development",
    image: "/assets/images/us-africa/final-cta.webp",
    icon: Landmark,
    color: "navy",
  },
];


/* ============================================================
   HELPERS
============================================================ */

function getUniversityName(
  university
) {
  return (
    university?.name ||
    "University"
  );
}


function getUniversityShortName(
  university
) {
  return (
    university?.shortName ||
    university?.short_name ||
    ""
  );
}


function getUniversityLogo(
  university
) {
  return (
    university?.logoUrl ||
    university?.logo_url ||
    ""
  );
}


function getUniversityWebsite(
  university
) {
  return (
    university?.website ||
    ""
  );
}


function getUniversityLocation(
  university
) {
  const location = [
    university?.city,
    university?.country,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    location ||
    "Location not provided"
  );
}


function getParticipationAreas(
  university
) {
  const areas =
    university?.participationAreas ||
    university?.participation_areas;

  if (
    Array.isArray(areas)
  ) {
    return areas;
  }

  if (
    typeof areas === "string"
  ) {
    try {
      const parsed =
        JSON.parse(areas);

      if (
        Array.isArray(parsed)
      ) {
        return parsed;
      }
    } catch {
      return areas
        .split(",")
        .map((item) =>
          item.trim()
        )
        .filter(Boolean);
    }
  }

  return [];
}


/* ============================================================
   UNIVERSITIES PAGE
============================================================ */

export default function Universities() {
  const [
    universities,
    setUniversities,
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


  /* ==========================================================
     LOAD UNIVERSITIES
  ========================================================== */

  useEffect(() => {
    let cancelled = false;

    async function loadUniversities() {
      try {
        setLoading(true);
        setError("");

        const response =
          await fetch(
            `${API_URL}/api/universities`,
            {
              method: "GET",

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

        if (
          !contentType.includes(
            "application/json"
          )
        ) {
          const text =
            await response.text();

          console.error(
            "Unexpected universities response:",
            text
          );

          throw new Error(
            "The Universities API returned an unexpected response."
          );
        }

        const result =
          await response.json();

        if (
          !response.ok
        ) {
          throw new Error(
            result?.message ||
            result?.error ||
            "Unable to load universities."
          );
        }

        const items =
          Array.isArray(
            result?.universities
          )
            ? result.universities
            : [];

        if (
          !cancelled
        ) {
          setUniversities(
            items
          );
        }
      } catch (
        requestError
      ) {
        console.error(
          "Universities API error:",
          requestError
        );

        if (
          !cancelled
        ) {
          setUniversities(
            []
          );

          setError(
            requestError?.message ||
            "Unable to load universities."
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

    loadUniversities();

    return () => {
      cancelled = true;
    };
  }, []);


  /* ==========================================================
     ACTIVE UNIVERSITIES

     The backend already returns only active universities.
     This filter is retained as an extra public-side safeguard.
  ========================================================== */

  const activeUniversities =
    useMemo(() => {
      return universities.filter(
        (university) => {
          const status =
            String(
              university?.status ||
              ""
            )
              .trim()
              .toLowerCase();

          return (
            !status ||
            status === "active"
          );
        }
      );
    }, [
      universities,
    ]);


  /* ==========================================================
     SCROLL REVEAL
     Anything already above the fold (or skipped by a fast
     jump) is shown at once.
  ========================================================== */

  const pageRef = useRef(null);

  useEffect(() => {
    const root = pageRef.current;

    if (
      !root ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return undefined;
    }

    root.classList.add("uni-page--reveal");

    let pending = [...root.querySelectorAll("[data-reveal]")];
    let frame = 0;

    const reveal = () => {
      frame = 0;
      const limit = window.innerHeight * 0.92;

      pending = pending.filter((element) => {
        if (element.getBoundingClientRect().top < limit) {
          element.classList.add("is-visible");
          return false;
        }

        return true;
      });

      if (!pending.length) {
        window.removeEventListener("scroll", schedule);
        window.removeEventListener("resize", schedule);
      }
    };

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(reveal);
    };

    reveal();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);


  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <main className="uni-page" ref={pageRef}>

      {/* ======================================================
          HERO
      ====================================================== */}

      <section className="uni-hero">

        <div className="uni-hero__media" aria-hidden="true">
          <img
            src="/assets/images/universities/university-partnership.webp"
            alt=""
            fetchPriority="high"
          />
        </div>

        <div className="uni-container uni-hero__inner">

          <span className="uni-eyebrow uni-eyebrow--light">
            Universities
          </span>

          <h1>
            Connecting academic expertise with founders,
            markets, and <em>opportunity.</em>
          </h1>

          <p>
            Continental Founders brings universities into a
            wider ecosystem where faculty expertise, research,
            students, founders, industry, and institutions can
            contribute to meaningful commercial collaboration.
          </p>

          <div className="uni-hero__actions">
            <Link
              to="/contact"
              className="uni-button uni-button--gold"
            >
              Explore partnership
              <ArrowRight size={18} aria-hidden="true" />
            </Link>

            <a
              href="#uni-participate"
              className="uni-button uni-button--ghost"
            >
              Ways to participate
            </a>
          </div>

        </div>

      </section>


      {/* ======================================================
          INTRODUCTION
      ====================================================== */}

      <section className="uni-section uni-opening">

        <div className="uni-container uni-opening__grid" data-reveal>

          <span className="uni-eyebrow">
            For Universities
          </span>

          <div className="uni-opening__content">

            <h2>
              Academic knowledge becomes more powerful when it
              moves beyond the institution.
            </h2>

            <p>
              Universities hold extraordinary concentrations of
              knowledge, research, expertise, students, and
              professional networks. Continental Founders creates
              pathways for those resources to engage with founders
              and ventures working on real opportunities.
            </p>

            <p>
              The objective is not simply to create another
              institutional relationship. It is to identify where
              academic capability can contribute meaningful value,
              where universities can learn from emerging markets
              and entrepreneurs, and where collaboration can grow
              into lasting institutional engagement.
            </p>

          </div>

        </div>

      </section>


      {/* ======================================================
          PARTNERSHIP VALUE
      ====================================================== */}

      <section className="uni-section uni-value">

        <div className="uni-container uni-value__grid">

          <figure className="uni-value__media" data-reveal>
            <img
              src="/assets/ff.webp"
              alt="An international student arriving on a university campus lined with national flags"
              loading="lazy"
            />
          </figure>

          <div className="uni-value__content" data-reveal>

            <span className="uni-eyebrow">
              What Partnership Can Unlock
            </span>

            <h2>
              A broader academic and commercial network.
            </h2>

            <p>
              University partnerships can create access to research,
              faculty expertise, student perspectives, professional
              networks, emerging ventures, industries, and new
              markets.
            </p>

            <p>
              Continental Founders is focused on reciprocal
              relationships where universities contribute knowledge
              while gaining meaningful opportunities for learning,
              research, engagement, and global collaboration.
            </p>

          </div>

        </div>

      </section>


      {/* ======================================================
          UNIVERSITY DIRECTORY
      ====================================================== */}

      <section className="uni-section uni-section--soft uni-directory">

        <div className="uni-container">

          <header className="uni-heading" data-reveal>
            <span className="uni-eyebrow">University Network</span>

            <h2>
              Institutions connected to the Continental Founders
              ecosystem.
            </h2>

            <p>
              Explore universities participating across research,
              faculty engagement, student opportunity,
              entrepreneurship, and institutional collaboration.
            </p>
          </header>


          {loading && (

            <div
              className="uni-directory__grid"
              role="status"
              aria-label="Loading universities"
            >
              {[0, 1, 2].map((item) => (
                <div
                  key={item}
                  className="uni-card uni-card--skeleton"
                  aria-hidden="true"
                >
                  <span />
                  <span />
                  <span />
                </div>
              ))}
            </div>

          )}


          {!loading &&
            error && (

              <div className="uni-directory__empty">

                <span className="uni-directory__empty-icon">
                  <GraduationCap
                    size={28}
                    aria-hidden="true"
                  />
                </span>

                <div>
                  <h3>
                    University network unavailable.
                  </h3>

                  <p>
                    We could not load the university directory at
                    this time. Please try again later.
                  </p>
                </div>

              </div>

            )}


          {!loading &&
            !error &&
            activeUniversities.length === 0 && (

              <div className="uni-directory__empty">

                <span className="uni-directory__empty-icon">
                  <GraduationCap
                    size={28}
                    aria-hidden="true"
                  />
                </span>

                <div>
                  <h3>
                    University partnerships are being developed.
                  </h3>

                  <p>
                    Institutions participating in the Continental
                    Founders ecosystem will appear here as
                    partnerships are confirmed.
                  </p>
                </div>

              </div>

            )}


          {!loading &&
            !error &&
            activeUniversities.length > 0 && (

              <div className="uni-directory__grid">

                {activeUniversities.map(
                  (university) => {

                    const universityName =
                      getUniversityName(
                        university
                      );

                    const shortName =
                      getUniversityShortName(
                        university
                      );

                    const logo =
                      getUniversityLogo(
                        university
                      );

                    const website =
                      getUniversityWebsite(
                        university
                      );

                    const participation =
                      getParticipationAreas(
                        university
                      );

                    return (

                      <article
                        key={
                          university.id ||
                          universityName
                        }
                        className="uni-card"
                      >

                        <div className="uni-card__top">

                          <div className="uni-card__logo">

                            {logo ? (

                              <img
                                src={logo}
                                alt={`${universityName} logo`}
                                loading="lazy"
                              />

                            ) : (

                              <GraduationCap
                                size={26}
                                aria-hidden="true"
                              />

                            )}

                          </div>


                          <div className="uni-card__identity">

                            {shortName && (

                              <span>
                                {shortName}
                              </span>

                            )}

                            <h3>
                              {universityName}
                            </h3>

                          </div>

                        </div>


                        <ul className="uni-card__meta">

                          <li>
                            <MapPin
                              size={15}
                              aria-hidden="true"
                            />

                            <span>
                              {getUniversityLocation(
                                university
                              )}
                            </span>
                          </li>

                          <li>
                            <Building2
                              size={15}
                              aria-hidden="true"
                            />

                            <span>
                              {university.type ||
                              "University"}
                            </span>
                          </li>

                        </ul>


                        {university.description && (

                          <p className="uni-card__description">
                            {university.description}
                          </p>

                        )}


                        {participation.length > 0 && (

                          <ul className="uni-card__areas">

                            {participation
                              .slice(
                                0,
                                4
                              )
                              .map(
                                (
                                  area,
                                  index
                                ) => (

                                  <li
                                    key={`${area}-${index}`}
                                  >
                                    {area}
                                  </li>

                                )
                              )}

                          </ul>

                        )}


                        {website && (

                          <a
                            href={website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="uni-card__website"
                          >

                            <Link2
                              size={15}
                              aria-hidden="true"
                            />

                            Visit institution

                            <ArrowUpRight
                              size={15}
                              aria-hidden="true"
                            />

                          </a>

                        )}

                      </article>

                    );
                  }
                )}

              </div>

            )}

        </div>

      </section>


      {/* ======================================================
          WAYS TO PARTICIPATE
      ====================================================== */}

      <section
        className="uni-section uni-participate"
        id="uni-participate"
      >

        <div className="uni-container">

          <header className="uni-heading" data-reveal>
            <span className="uni-eyebrow">Ways To Participate</span>

            <h2>
              Universities can contribute far beyond traditional
              academic partnership.
            </h2>

            <p>
              Continental Founders creates multiple points of
              engagement so institutions can participate where
              their expertise and priorities are most relevant.
            </p>
          </header>


          <ul className="uni-participate__grid" data-reveal>

            {participationAreas.map(
              ({ title, text, icon: Icon, color }, index) => (

                <li
                  key={title}
                  className={`uni-area uni-tone--${color}`}
                >

                  <div className="uni-area__top">
                    <span className="uni-area__icon">
                      <Icon size={22} aria-hidden="true" />
                    </span>

                    <span className="uni-area__number">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>

                  <h3>
                    {title}
                  </h3>

                  <p>
                    {text}
                  </p>

                </li>

              )
            )}

          </ul>

        </div>

      </section>


      {/* ======================================================
          FOUNDER ENGAGEMENT
      ====================================================== */}

      <section className="uni-engage">

        <div className="uni-container">

          <div className="uni-engage__card" data-reveal>

            <div className="uni-engage__content">

              <span className="uni-eyebrow uni-eyebrow--light">
                Founder Engagement
              </span>

              <h2>
                Put academic expertise behind founders who are
                actively building.
              </h2>

              <p>
                Through the Continental Founders ecosystem,
                universities can engage founders as they develop,
                validate, execute, and strengthen their ventures.
                Faculty expertise and research can become part of a
                practical process focused on solving real problems
                and creating commercial evidence.
              </p>

              <Link
                to="/our-model"
                className="uni-button uni-button--ghost"
              >
                Explore our model
                <ArrowRight size={18} aria-hidden="true" />
              </Link>

            </div>


            <ol className="uni-engage__journey">

              {founderJourney.map((step, index) => (
                <li key={step}>
                  <span>{index + 1}</span>
                  {step}
                </li>
              ))}

            </ol>

          </div>

        </div>

      </section>


      {/* ======================================================
          WIDER PARTNERSHIP ECOSYSTEM
      ====================================================== */}

      <section className="uni-section uni-ecosystem">

        <div className="uni-container">

          <header className="uni-heading uni-heading--split" data-reveal>
            <div>
              <span className="uni-eyebrow">The Wider Ecosystem</span>

              <h2>
                Universities are one part of a connected partnership
                network.
              </h2>
            </div>

            <div>
              <p>
                Continental Founders brings academic institutions
                together with trade networks, corporations,
                government, and development institutions around
                founders and commercial opportunity.
              </p>

              <Link
                to="/strategic-partners"
                className="uni-text-link"
              >
                View all partners
                <ArrowUpRight size={17} aria-hidden="true" />
              </Link>
            </div>
          </header>


          <div className="uni-ecosystem__grid" data-reveal>

            {partnerEcosystem.map(
              ({ title, text, path, image, icon: Icon, color }) => (

                <Link
                  key={path}
                  to={path}
                  className={`uni-partner uni-tone--${color}`}
                >

                  <div className="uni-partner__media">
                    <img src={image} alt="" loading="lazy" />

                    <span className="uni-partner__icon">
                      <Icon size={20} aria-hidden="true" />
                    </span>
                  </div>

                  <div className="uni-partner__body">
                    <h3>
                      {title}
                    </h3>

                    <p>
                      {text}
                    </p>

                    <span className="uni-partner__link">
                      Explore partnership
                      <ArrowRight size={16} aria-hidden="true" />
                    </span>
                  </div>

                </Link>

              )
            )}

          </div>

        </div>

      </section>


      {/* ======================================================
          FINAL CTA
      ====================================================== */}

      <section className="uni-cta">

        <div className="uni-container">

          <div className="uni-cta__card" data-reveal>

            <div>
              <span className="uni-eyebrow uni-eyebrow--light">
                For University Leaders
              </span>

              <h2>
                Explore what your institution could contribute.
              </h2>

              <p>
                Share your institution, priority areas, expertise,
                geography, and the type of collaboration you are
                exploring. Continental Founders can help identify
                where your institution fits within the wider
                ecosystem.
              </p>
            </div>

            <Link
              to="/contact"
              className="uni-button uni-button--gold"
            >
              Start a conversation
              <ArrowRight size={18} aria-hidden="true" />
            </Link>

          </div>

        </div>

      </section>

    </main>
  );
}
