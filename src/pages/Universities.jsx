import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  GraduationCap, 
  Lightbulb,
  Link2,
  MapPin,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import SectionHeading from "../components/ui/SectionHeading";
import MediaSplit from "../components/sections/MediaSplit";
import CTASection from "../components/sections/CTASection";

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
    number: "01",
    title: "Faculty Expertise",
    text:
      "Professors and specialists can contribute knowledge, mentorship, research insight, and practical guidance to founders working through real venture challenges.",
  },

  {
    number: "02",
    title: "Research Collaboration",
    text:
      "Connect relevant research, academic resources, and institutional knowledge with founders, industries, markets, and emerging commercial opportunities.",
  },

  {
    number: "03",
    title: "Student Engagement",
    text:
      "Create opportunities for students to gain exposure to entrepreneurship, international collaboration, research, and real-world venture development.",
  },

  {
    number: "04",
    title: "Institutional Partnerships",
    text:
      "Build relationships between universities and aligned institutions across Africa, the United States, and the wider global ecosystem.",
  },
];


/* ============================================================
   PARTNER ECOSYSTEM
============================================================ */

const partnerEcosystem = [
  {
    number: "01",
    title: "U.S.–Africa Trade & Business Network",
    text:
      "Connect academic expertise with broader trade, market, business, and commercial networks.",
    path: "/partners/us-africa-trade-network",
  },

  {
    number: "02",
    title: "Corporate Partners",
    text:
      "Engage companies and industry leaders who can contribute expertise, mentorship, market insight, and commercial opportunity.",
    path: "/partners/corporate",
  },

  {
    number: "03",
    title: "Government & Development Institutions",
    text:
      "Connect institutional knowledge with organizations supporting economic development, entrepreneurship, and market access.",
    path: "/partners/government-development",
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
     RENDER
  ========================================================== */

  return (
    <>

      {/* ======================================================
          HERO
      ====================================================== */}

      <section className="page-hero universities-hero">

        <div className="container page-hero__inner">

          <div className="universities-hero__content">

            <span className="eyebrow eyebrow--light">
              Universities
            </span>

            <h1>
              Connecting academic expertise with founders,
              markets, and opportunity.
            </h1>

          </div>


          <div className="page-hero__aside">

            <p>
              Continental Founders brings universities into a
              wider ecosystem where faculty expertise, research,
              students, founders, industry, and institutions can
              contribute to meaningful commercial collaboration.
            </p>

            <Link
              to="/contact"
              className="universities-hero__link"
            >
              Explore Partnership

              <ArrowUpRight
                size={17}
                aria-hidden="true"
              />
            </Link>

          </div>

        </div>

      </section>


      {/* ======================================================
          INTRODUCTION
      ====================================================== */}

      <section className="section university-opening">

        <div className="container university-opening__grid">

          <div className="university-opening__label">

            <span className="eyebrow">
              For Universities
            </span>

          </div>


          <div className="university-opening__content">

            <h2 className="display">
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

      <MediaSplit
        eyebrow="What Partnership Can Unlock"
        title="A broader academic and commercial network."
        text={[
          "University partnerships can create access to research, faculty expertise, student perspectives, professional networks, emerging ventures, industries, and new markets.",

          "Continental Founders is focused on reciprocal relationships where universities contribute knowledge while gaining meaningful opportunities for learning, research, engagement, and global collaboration.",
        ]}
        image="/assets/images/universities/university-partnership.jpg"
        imageAlt="University students and academic communities collaborating on a university campus"
      />


      {/* ======================================================
          UNIVERSITY DIRECTORY
      ====================================================== */}

      <section className="section universities-partners">

        <div className="container">

          <SectionHeading
            eyebrow="University Network"
            title="Institutions connected to the Continental Founders ecosystem."
            text="Explore universities participating across research, faculty engagement, student opportunity, entrepreneurship, and institutional collaboration."
          />


          {loading && (

            <div
              className="universities-partners__status"
              role="status"
            >
              Loading universities...
            </div>

          )}


          {!loading &&
            error && (

              <div className="universities-partners__empty">

                <GraduationCap
                  size={30}
                  strokeWidth={1.4}
                  aria-hidden="true"
                />

                <h3>
                  University network unavailable.
                </h3>

                <p>
                  We could not load the university directory at
                  this time. Please try again later.
                </p>

              </div>

            )}


          {!loading &&
            !error &&
            activeUniversities.length === 0 && (

              <div className="universities-partners__empty">

                <GraduationCap
                  size={30}
                  strokeWidth={1.4}
                  aria-hidden="true"
                />

                <h3>
                  University partnerships are being developed.
                </h3>

                <p>
                  Institutions participating in the Continental
                  Founders ecosystem will appear here as
                  partnerships are confirmed.
                </p>

              </div>

            )}


          {!loading &&
            !error &&
            activeUniversities.length > 0 && (

              <div className="universities-partners__grid">

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
                        className="universities-partner-card"
                      >

                        <div className="universities-partner-card__top">

                          <div className="universities-partner-card__logo">

                            {logo ? (

                              <img
                                src={logo}
                                alt={`${universityName} logo`}
                                loading="lazy"
                              />

                            ) : (

                              <GraduationCap
                                size={27}
                                strokeWidth={1.4}
                                aria-hidden="true"
                              />

                            )}

                          </div>


                          <div className="universities-partner-card__identity">

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


                        <div className="universities-partner-card__meta">

                          <div>

                            <MapPin
                              size={15}
                              strokeWidth={1.5}
                              aria-hidden="true"
                            />

                            <span>
                              {getUniversityLocation(
                                university
                              )}
                            </span>

                          </div>


                          <div>

                            <Building2
                              size={15}
                              strokeWidth={1.5}
                              aria-hidden="true"
                            />

                            <span>
                              {university.type ||
                              "University"}
                            </span>

                          </div>

                        </div>


                        {university.description && (

                          <p className="universities-partner-card__description">
                            {university.description}
                          </p>

                        )}


                        {participation.length > 0 && (

                          <div className="universities-partner-card__areas">

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

                                  <span
                                    key={`${area}-${index}`}
                                  >
                                    {area}
                                  </span>

                                )
                              )}

                          </div>

                        )}


                        {website && (

                          <a
                            href={website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="universities-partner-card__website"
                          >

                            <Link2
                              size={15}
                              aria-hidden="true"
                            />

                            Visit Institution

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

      <section className="section section--light universities-participation">

        <div className="container">

          <SectionHeading
            eyebrow="Ways To Participate"
            title="Universities can contribute far beyond traditional academic partnership."
            text="Continental Founders creates multiple points of engagement so institutions can participate where their expertise and priorities are most relevant."
          />


          <div className="universities-participation__grid">

            {participationAreas.map(
              (item) => (

                <article
                  key={
                    item.title
                  }
                  className="universities-participation__item"
                >

                  <span className="universities-participation__number">
                    {item.number}
                  </span>


                  <div className="universities-participation__content">

                    <h3>
                      {item.title}
                    </h3>

                    <p>
                      {item.text}
                    </p>

                  </div>

                </article>

              )
            )}

          </div>

        </div>

      </section>


      {/* ======================================================
          FOUNDER ENGAGEMENT
      ====================================================== */}

      <section className="universities-fellowship">

        <div className="container universities-fellowship__grid">

          <div className="universities-fellowship__label">

            <span className="eyebrow eyebrow--light">
              Founder Engagement
            </span>


            <div className="universities-fellowship__icon">

              <Lightbulb
                size={34}
                strokeWidth={1.3}
                aria-hidden="true"
              />

            </div>

          </div>


          <div className="universities-fellowship__content">

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


            <div className="universities-fellowship__journey">

              <span>
                Potential
              </span>

              <ArrowRight
                size={15}
                aria-hidden="true"
              />

              <span>
                Preparation
              </span>

              <ArrowRight
                size={15}
                aria-hidden="true"
              />

              <span>
                Execution
              </span>

              <ArrowRight
                size={15}
                aria-hidden="true"
              />

              <span>
                Evidence
              </span>

              <ArrowRight
                size={15}
                aria-hidden="true"
              />

              <span>
                Opportunity
              </span>

            </div>


            <Link
              to="/our-model"
              className="universities-text-link"
            >
              Explore Our Model

              <ArrowUpRight
                size={17}
                aria-hidden="true"
              />
            </Link>

          </div>

        </div>

      </section>


      {/* ======================================================
          WIDER PARTNERSHIP ECOSYSTEM
      ====================================================== */}

      <section className="section universities-ecosystem">

        <div className="container">

          <SectionHeading
            eyebrow="The Wider Ecosystem"
            title="Universities are one part of a connected partnership network."
            text="Continental Founders brings academic institutions together with trade networks, corporations, government, and development institutions around founders and commercial opportunity."
          />


          <div className="universities-ecosystem__grid">

            {partnerEcosystem.map(
              (partner) => (

                <Link
                  key={
                    partner.path
                  }
                  to={
                    partner.path
                  }
                  className="universities-ecosystem__card"
                >

                  <span className="universities-ecosystem__number">
                    {partner.number}
                  </span>

                  <h3>
                    {partner.title}
                  </h3>

                  <p>
                    {partner.text}
                  </p>


                  <div className="universities-ecosystem__link">

                    <span>
                      Explore Partnership
                    </span>

                    <ArrowUpRight
                      size={17}
                      strokeWidth={1.6}
                      aria-hidden="true"
                    />

                  </div>

                </Link>

              )
            )}

          </div>


          <div className="universities-ecosystem__all">

            <Link
              to="/strategic-partners"
              className="universities-text-link"
            >
              View All Partners

              <ArrowUpRight
                size={17}
                aria-hidden="true"
              />
            </Link>

          </div>

        </div>

      </section>


      {/* ======================================================
          FINAL CTA
      ====================================================== */}

      <CTASection
        eyebrow="For University Leaders"
        title="Explore what your institution could contribute."
        text="Share your institution, priority areas, expertise, geography, and the type of collaboration you are exploring. Continental Founders can help identify where your institution fits within the wider ecosystem."
      />

    </>
  );
}