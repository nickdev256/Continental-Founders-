import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Link } from "react-router-dom";

import {
  ArrowRight,
  Building2,
  ChartNoAxesCombined,
  CheckCircle2,
  Globe2,
  GraduationCap,
  Handshake,
  Landmark,
  Lightbulb,
  Network,
  RefreshCw,
  Rocket,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";

import "./USAfricaTradeNetwork.css";


/* ============================================================
   API
============================================================ */

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

const PAGE_SLUG =
  "us-africa-trade-network";


/* ============================================================
   DEFAULT / FALLBACK CONTENT

   CMS content overrides this content whenever available.

   IMPORTANT:
   The partnership language remains "proposed" until the
   relationship has been formally confirmed.

   Year One figures are proposed targets, not historical impact.
============================================================ */

const DEFAULT_CONTENT = {

  /* ==========================================================
     HERO
  ========================================================== */

  hero: {
    eyebrow:
      "U.S.–AFRICA STRATEGIC ECOSYSTEM",

    titleLine1:
      "Connecting founders",

    titleLine2:
      "to real markets.",

    titleHighlight:
      "Real opportunity.",

    description:
      "Continental Founders is proposing USAfrica as a Strategic Ecosystem & Market Access Partner — connecting CFCV fellows and alumni to markets, capital networks, corporate relationships, government stakeholders, and diaspora expertise.",

    image:
      "/assets/images/us-africa/hero.webp",

    primaryButtonText:
      "Explore the Partnership",

    primaryButtonLink:
      "/contact",

    secondaryButtonText:
      "See the Opportunity",
  },


  /* ==========================================================
     HERO HIGHLIGHTS
  ========================================================== */

  highlights: [
    {
      title:
        "Market Access",
    },
    {
      title:
        "Capital Networks",
    },
    {
      title:
        "Strategic Relationships",
    },
  ],


  /* ==========================================================
     HERO SIDE MESSAGE
  ========================================================== */

  sideMessage: [
    "FOUNDERS",
    "MARKETS",
    "CAPITAL",
    "INSTITUTIONS",
    "OPPORTUNITY",
  ],


  /* ==========================================================
     OPPORTUNITY
  ========================================================== */

  intro: {
    eyebrow:
      "The Opportunity",

    title:
      "Founder development becomes founder success when it meets the real world.",

    paragraph1:
      "Continental Founders develops rising founders through a rigorous, evidence-based pipeline. But founder development only becomes founder success when ideas and ventures are tested against real markets, real capital, and real institutions.",

    paragraph2:
      "The proposed relationship with USAfrica is designed to close that gap by creating structured pathways from the CFCV founder-development environment into external commercial ecosystems.",

    image:
      "/assets/images/us-africa/business-handshake.webp",

    imageCaption:
      "From founder development to commercial opportunity",

    buttonText:
      "Explore Our Model",

    buttonLink:
      "/our-model",
  },


  /* ==========================================================
     PROPOSED YEAR ONE TARGETS

     These are targets from the proposal.
     They must never be represented as completed impact.
  ========================================================== */

  statsLabel:
    "Proposed Year One Targets",

  statsTitle:
    "What Year One could look like.",

  statsDescription:
    "The following figures represent proposed first-year targets for the partnership and provide a framework for measuring external engagement and commercial opportunity.",

  stats: [
    {
      value:
        "50+",

      label:
        "Curated founder–market introductions",
    },

    {
      value:
        "25+",

      label:
        "Investor interactions",
    },

    {
      value:
        "20+",

      label:
        "Corporate partners engaged",
    },

    {
      value:
        "10+",

      label:
        "Embassy / government engagements",
    },

    {
      value:
        "100+",

      label:
        "Qualified diaspora experts",
    },

    {
      value:
        "2–4",

      label:
        "Major applied-learning events",
    },
  ],


  /* ==========================================================
     PROPOSED ROLE
  ========================================================== */

  features: {
    eyebrow:
      "The Proposed Role",

    title:
      "Turning founder knowledge into measurable commercial outcomes.",

    description:
      "The proposed partnership would connect CFCV fellows and alumni with the external relationships, institutions, and opportunities required to apply what they are building in real commercial environments.",

    items: [
      {
        title:
          "Real-World Application",

        description:
          "Give fellows access to investor meetings, corporate roundtables, procurement opportunities, and market-entry conversations across the CFCV pipeline — Genesis, Ascend, and Horizon.",

        image:
          "/assets/images/us-africa/market-access.webp",
      },

      {
        title:
          "Diaspora–Continental Bridge",

        description:
          "Create structured relationships between African and diaspora founders, professionals, experts, and institutions.",

        image:
          "/assets/images/us-africa/business-connections.webp",
      },

      {
        title:
          "Opportunity Pipeline",

        description:
          "Build a curated exchange of capital, market, procurement, partnership, government, and knowledge opportunities for fellows.",

        image:
          "/assets/images/us-africa/trade-readiness.webp",
      },

      {
        title:
          "Convening Platform",

        description:
          "Use USAFRICA Business Week and related convenings as applied-learning environments where fellows can pitch, negotiate, build relationships, and engage external stakeholders.",

        image:
          "/assets/images/us-africa/knowledge-exchange.webp",
      },

      {
        title:
          "Strategic Partnership Engine",

        description:
          "Source institutional relationships with universities, chambers of commerce, embassies, development finance institutions, corporations, and other ecosystem partners.",

        image:
          "/assets/images/us-africa/strategic-partnerships.webp",
      },
    ],
  },


  /* ==========================================================
     EXTERNAL ECOSYSTEM
  ========================================================== */

  network: {
    eyebrow:
      "The External Ecosystem",

    titleLine1:
      "The right founders.",

    titleLine2:
      "The right relationships.",

    description:
      "The proposed ecosystem would connect CFCV fellows and alumni with the institutions, professionals, markets, and networks capable of opening pathways to commercial opportunity.",

    items: [
      "Investors & Capital Networks",
      "Corporations & Industry Leaders",
      "Diaspora Professionals",
      "Universities & Researchers",
      "Embassies & Government Stakeholders",
      "Chambers & Development Institutions",
    ],
  },


  /* ==========================================================
     WHY THE PARTNERSHIP
  ========================================================== */

  partnership: {
    eyebrow:
      "Why This Partnership",

    title:
      "A commercial proving ground for the Continental Founders model.",

    description:
      "The proposed relationship is designed to create value for both institutions while preserving the independence and integrity of their respective roles.",

    cfTitle:
      "For Continental Founders",

    cfText:
      "USAfrica could provide the commercial proving ground that turns curriculum into outcomes. Fellows would gain structured exposure to real markets, investors, companies, institutions, and decision-makers while Continental Founders strengthens its evidence-based research model.",

    usaAfricaTitle:
      "For USAfrica",

    usaAfricaText:
      "The partnership could provide a pipeline of founders progressing through an evidence-based development model and give USAfrica a defined role within a growing cross-continental founder ecosystem.",

    governanceTitle:
      "Independent Standards. Shared Opportunity.",

    governanceText:
      "USAfrica would hold a significant role in external ecosystem engagement, while Continental Founders would retain independent control over academic standards, fellowship decisions, and research conclusions — preserving the integrity of both institutions.",
  },


  /* ==========================================================
     NEXT STEPS
  ========================================================== */

  nextSteps: {
    eyebrow:
      "Proposed Next Steps",

    title:
      "Move from proposal to pilot.",

    description:
      "A focused pilot can provide both organizations with a practical way to test the partnership model, establish responsibilities, and measure early results.",

    items: [
      {
        number:
          "01",

        title:
          "Joint Discussion",

        text:
          "Hold a joint call to walk through the proposal and assess alignment with USAfrica's current platforms, priorities, and calendar.",
      },

      {
        number:
          "02",

        title:
          "Pilot Cohort",

        text:
          "Identify a pilot cohort for an initial engagement, potentially connected to USAFRICA Business Week or another suitable applied-learning platform.",
      },

      {
        number:
          "03",

        title:
          "Year-One Framework",

        text:
          "Agree on initial-year deliverables, responsibilities, target outcomes, and a lightweight reporting structure.",
      },
    ],
  },


  /* ==========================================================
     CTA
  ========================================================== */

  cta: {
    eyebrow:
      "Strategic Ecosystem Partnership",

    titleLine1:
      "From founder potential",

    titleLine2:
      "to commercial evidence.",

    description:
      "Continental Founders welcomes the opportunity to explore how USAfrica's ecosystem can connect CFCV fellows with markets, capital, institutions, diaspora expertise, and cross-continental opportunity.",

    buttonText:
      "Discuss the Partnership",

    buttonLink:
      "/contact",

    image:
      "/assets/images/us-africa/final-cta.webp",
  },
};


/* ============================================================
   CONTENT MERGING
============================================================ */

function mergeContent(
  content = {}
) {
  return {
    ...DEFAULT_CONTENT,
    ...content,


    hero: {
      ...DEFAULT_CONTENT.hero,
      ...(content.hero || {}),
    },


    intro: {
      ...DEFAULT_CONTENT.intro,
      ...(content.intro || {}),
    },


    features: {
      ...DEFAULT_CONTENT.features,
      ...(content.features || {}),

      items:
        Array.isArray(
          content.features?.items
        )
          ? content.features.items
          : DEFAULT_CONTENT.features.items,
    },


    network: {
      ...DEFAULT_CONTENT.network,
      ...(content.network || {}),

      items:
        Array.isArray(
          content.network?.items
        )
          ? content.network.items
          : DEFAULT_CONTENT.network.items,
    },


    partnership: {
      ...DEFAULT_CONTENT.partnership,
      ...(content.partnership || {}),
    },


    nextSteps: {
      ...DEFAULT_CONTENT.nextSteps,
      ...(content.nextSteps || {}),

      items:
        Array.isArray(
          content.nextSteps?.items
        )
          ? content.nextSteps.items
          : DEFAULT_CONTENT.nextSteps.items,
    },


    cta: {
      ...DEFAULT_CONTENT.cta,
      ...(content.cta || {}),
    },


    highlights:
      Array.isArray(
        content.highlights
      )
        ? content.highlights
        : DEFAULT_CONTENT.highlights,


    sideMessage:
      Array.isArray(
        content.sideMessage
      )
        ? content.sideMessage
        : DEFAULT_CONTENT.sideMessage,


    /*
     * Proposed targets may come from CMS.
     *
     * We intentionally filter empty entries.
     */
    stats:
      Array.isArray(
        content.stats
      )
        ? content.stats.filter(
            (stat) =>
              stat &&
              (
                stat.value ||
                stat.label
              )
          )
        : DEFAULT_CONTENT.stats,
  };
}


/* ============================================================
   ICON HELPERS
============================================================ */

function getHighlightIcon(
  index
) {
  const icons = [
    Handshake,
    TrendingUp,
    Network,
  ];

  return (
    icons[index] ||
    Handshake
  );
}


function getStatIcon(
  index
) {
  const icons = [
    Globe2,
    TrendingUp,
    Building2,
    Landmark,
    Users,
    ChartNoAxesCombined,
  ];

  return (
    icons[
      index %
      icons.length
    ] ||
    Target
  );
}


function getFeatureIcon(
  index
) {
  const icons = [
    Target,
    Globe2,
    TrendingUp,
    Users,
    Handshake,
  ];

  return (
    icons[
      index %
      icons.length
    ] ||
    Lightbulb
  );
}


function getNetworkIcon(
  index
) {
  const icons = [
    TrendingUp,
    Building2,
    Globe2,
    GraduationCap,
    Landmark,
    Network,
  ];

  return (
    icons[
      index %
      icons.length
    ] ||
    Users
  );
}


function getNextStepIcon(
  index
) {
  const icons = [
    Handshake,
    Rocket,
    ChartNoAxesCombined,
  ];

  return (
    icons[
      index %
      icons.length
    ] ||
    CheckCircle2
  );
}


/* ============================================================
   IMAGE ERROR HANDLER
============================================================ */

function handleImageError(
  event
) {
  const image =
    event.currentTarget;

  if (
    image.dataset.fallbackApplied ===
    "true"
  ) {
    return;
  }

  image.dataset.fallbackApplied =
    "true";

  image.style.visibility =
    "hidden";
}


/* ============================================================
   PAGE
============================================================ */

export default function USAfricaTradeNetwork() {

  /* ==========================================================
     STATE
  ========================================================== */

  const [
    page,
    setPage,
  ] =
    useState(null);


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
     LOAD CMS PAGE
  ========================================================== */

  const loadPage =
    useCallback(
      async (
        signal
      ) => {
        try {

          setLoading(true);
          setError("");


          const response =
            await fetch(
              `${API_URL}/api/pages/published/${PAGE_SLUG}`,
              {
                method:
                  "GET",

                headers: {
                  Accept:
                    "application/json",
                },

                signal,
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
              "Unexpected page response:",
              text
            );


            throw new Error(
              "The page service returned an unexpected response."
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
              `Unable to load page. Status: ${response.status}`
            );

          }


          setPage(
            result?.page ||
            result?.data ||
            null
          );

        } catch (
          requestError
        ) {

          if (
            requestError?.name ===
            "AbortError"
          ) {
            return;
          }


          console.error(
            "U.S.–Africa page loading error:",
            requestError
          );


          setError(
            requestError?.message ||
            "Unable to load the latest page content."
          );

        } finally {

          if (
            !signal?.aborted
          ) {
            setLoading(false);
          }

        }
      },
      []
    );


  /* ==========================================================
     INITIAL LOAD
  ========================================================== */

  useEffect(
    () => {

      const controller =
        new AbortController();


      loadPage(
        controller.signal
      );


      return () => {
        controller.abort();
      };

    },
    [
      loadPage,
    ]
  );


  /* ==========================================================
     MERGED CMS CONTENT
  ========================================================== */

  const content =
    useMemo(
      () =>
        mergeContent(
          page?.content ||
          {}
        ),
      [
        page,
      ]
    );


  const {
    hero,
    intro,
    stats,
    features,
    network,
    partnership,
    nextSteps,
    cta,
  } =
    content;


  const hasStats =
    Array.isArray(
      stats
    ) &&
    stats.length > 0;


  /* ==========================================================
     PAGE
  ========================================================== */

  return (
    <main className="us-africa-page">


      {/* ======================================================
          CMS STATUS
      ====================================================== */}

      {loading && (
        <div
          className="trade-cms-status"
          role="status"
          aria-live="polite"
        >

          <RefreshCw
            size={15}
            aria-hidden="true"
          />

          Loading latest content...

        </div>
      )}


      {error &&
        import.meta.env.DEV && (
          <div
            className="
              trade-cms-status
              trade-cms-status--error
            "
            role="status"
          >

            CMS connection: {error}

          </div>
        )}


      {/* ======================================================
          HERO
      ====================================================== */}

      <section className="trade-hero">

        <div className="trade-hero__media">

          <img
            src={
              hero.image
            }
            alt=""
            fetchPriority="high"
            decoding="async"
            onError={
              handleImageError
            }
          />


          <div
            className="trade-hero__overlay"
            aria-hidden="true"
          />


          <div
            className="trade-hero__glow"
            aria-hidden="true"
          />

        </div>


        <div className="container trade-hero__inner">

          <div className="trade-hero__content">

            <span className="trade-eyebrow trade-eyebrow--gold">
              {hero.eyebrow}
            </span>


            <h1>

              {hero.titleLine1}

              <br />

              {hero.titleLine2}

              <br />

              <span>
                {hero.titleHighlight}
              </span>

            </h1>


            <p>
              {hero.description}
            </p>


            <div className="trade-hero__actions">

              <Link
                to={
                  hero.primaryButtonLink ||
                  "/contact"
                }
                className="trade-button trade-button--gold"
              >

                {hero.primaryButtonText}

                <ArrowRight
                  size={18}
                  aria-hidden="true"
                />

              </Link>


              <a
                href="#network-opportunity"
                className="trade-button trade-button--outline"
              >

                {hero.secondaryButtonText}

              </a>

            </div>


            <div className="trade-hero__highlights">

              {content.highlights.map(
                (
                  item,
                  index
                ) => {

                  const Icon =
                    getHighlightIcon(
                      index
                    );


                  return (
                    <div
                      key={
                        `${item.title}-${index}`
                      }
                    >

                      <Icon
                        size={23}
                        aria-hidden="true"
                      />

                      <span>
                        {item.title}
                      </span>

                    </div>
                  );
                }
              )}

            </div>

          </div>


          <div
            className="trade-hero__side-message"
            aria-hidden="true"
          >

            {content.sideMessage.map(
              (
                item,
                index
              ) => (
                <span
                  key={
                    `${item}-${index}`
                  }
                >
                  {item}
                </span>
              )
            )}

          </div>

        </div>

      </section>


      {/* ======================================================
          OPPORTUNITY
      ====================================================== */}

      <section
        className="trade-opportunity trade-opportunity--without-stats"
        id="network-opportunity"
      >

        <div className="trade-opportunity__image">

          <img
            src={
              intro.image
            }
            alt=""
            loading="lazy"
            decoding="async"
            onError={
              handleImageError
            }
          />


          <div
            className="trade-opportunity__image-shade"
            aria-hidden="true"
          />


          <div className="trade-opportunity__image-caption">
            {intro.imageCaption}
          </div>

        </div>


        <div className="trade-opportunity__content">

          <span className="trade-eyebrow">
            {intro.eyebrow}
          </span>


          <h2>
            {intro.title}
          </h2>


          <p>
            {intro.paragraph1}
          </p>


          <p>
            {intro.paragraph2}
          </p>


          <Link
            to={
              intro.buttonLink ||
              "/our-model"
            }
            className="trade-button trade-button--soft"
          >

            {intro.buttonText}

            <ArrowRight
              size={17}
              aria-hidden="true"
            />

          </Link>

        </div>

      </section>


      {/* ======================================================
          PROPOSED YEAR ONE TARGETS
      ====================================================== */}

      {hasStats && (
        <section className="trade-targets">

          <div className="container">

            <div className="trade-targets__heading">

              <span className="trade-eyebrow">
                {content.statsLabel}
              </span>


              <h2>
                {content.statsTitle}
              </h2>


              <p>
                {content.statsDescription}
              </p>

            </div>


            <div className="trade-targets__grid">

              {stats.map(
                (
                  stat,
                  index
                ) => {

                  const Icon =
                    getStatIcon(
                      index
                    );


                  return (
                    <article
                      className="trade-target-card"
                      key={
                        `${
                          stat.label ||
                          "target"
                        }-${index}`
                      }
                    >

                      <div className="trade-target-card__top">

                        <Icon
                          size={24}
                          aria-hidden="true"
                        />

                        <span>
                          Proposed
                        </span>

                      </div>


                      <strong>
                        {stat.value}
                      </strong>


                      <p>
                        {stat.label}
                      </p>

                    </article>
                  );
                }
              )}

            </div>

          </div>

        </section>
      )}


      {/* ======================================================
          PROPOSED ROLE
      ====================================================== */}

      <section className="trade-enables">

        <div className="container">

          <div className="trade-enables__top">

            <div>

              <span className="trade-eyebrow trade-eyebrow--gold">
                {features.eyebrow}
              </span>


              <h2>
                {features.title}
              </h2>

            </div>


            <p>
              {features.description}
            </p>

          </div>


          <div className="trade-enables__grid">

            {features.items.map(
              (
                item,
                index
              ) => {

                const Icon =
                  getFeatureIcon(
                    index
                  );


                const fallbackImage =
                  DEFAULT_CONTENT
                    .features
                    .items[
                      index
                    ]
                    ?.image;


                return (
                  <article
                    className="trade-enable-card"
                    key={
                      `${item.title}-${index}`
                    }
                  >

                    <div className="trade-enable-card__image">

                      <img
                        src={
                          item.image ||
                          fallbackImage
                        }
                        alt=""
                        loading="lazy"
                        decoding="async"
                        onError={
                          handleImageError
                        }
                      />

                    </div>


                    <div className="trade-enable-card__icon">

                      <Icon
                        size={22}
                        aria-hidden="true"
                      />

                    </div>


                    <div className="trade-enable-card__body">

                      <h3>
                        {item.title}
                      </h3>

                      <p>
                        {item.description}
                      </p>

                    </div>

                  </article>
                );
              }
            )}

          </div>

        </div>

      </section>


      {/* ======================================================
          EXTERNAL ECOSYSTEM
      ====================================================== */}

      <section className="trade-network">

        <div className="container">

          <div className="trade-network__intro">

            <span className="trade-eyebrow">
              {network.eyebrow}
            </span>


            <h2>

              {network.titleLine1}

              <br />

              {network.titleLine2}

            </h2>


            <p>
              {network.description}
            </p>

          </div>


          <div className="trade-network__grid">

            {network.items.map(
              (
                item,
                index
              ) => {

                const Icon =
                  getNetworkIcon(
                    index
                  );


                return (
                  <div
                    className="trade-network__item"
                    key={
                      `${item}-${index}`
                    }
                  >

                    <Icon
                      size={28}
                      aria-hidden="true"
                    />

                    <span>
                      {item}
                    </span>

                  </div>
                );
              }
            )}

          </div>

        </div>

      </section>


      {/* ======================================================
          WHY THIS PARTNERSHIP
      ====================================================== */}

      <section className="trade-partnership">

        <div className="container">

          <div className="trade-partnership__header">

            <span className="trade-eyebrow">
              {partnership.eyebrow}
            </span>


            <h2>
              {partnership.title}
            </h2>


            <p>
              {partnership.description}
            </p>

          </div>


          <div className="trade-partnership__grid">

            <article className="trade-partnership-card">

              <div className="trade-partnership-card__icon">

                <Lightbulb
                  size={27}
                  aria-hidden="true"
                />

              </div>


              <span className="trade-partnership-card__label">
                Continental Founders
              </span>


              <h3>
                {partnership.cfTitle}
              </h3>


              <p>
                {partnership.cfText}
              </p>

            </article>


            <article className="trade-partnership-card">

              <div className="trade-partnership-card__icon">

                <Globe2
                  size={27}
                  aria-hidden="true"
                />

              </div>


              <span className="trade-partnership-card__label">
                USAfrica
              </span>


              <h3>
                {partnership.usaAfricaTitle}
              </h3>


              <p>
                {partnership.usaAfricaText}
              </p>

            </article>

          </div>


          {/* ==================================================
              GOVERNANCE
          ================================================== */}

          <div className="trade-governance">

            <div className="trade-governance__icon">

              <Landmark
                size={28}
                aria-hidden="true"
              />

            </div>


            <div>

              <span>
                Partnership Governance
              </span>


              <h3>
                {partnership.governanceTitle}
              </h3>


              <p>
                {partnership.governanceText}
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* ======================================================
          PROPOSED NEXT STEPS
      ====================================================== */}

      <section className="trade-next-steps">

        <div className="container">

          <div className="trade-next-steps__header">

            <span className="trade-eyebrow trade-eyebrow--gold">
              {nextSteps.eyebrow}
            </span>


            <h2>
              {nextSteps.title}
            </h2>


            <p>
              {nextSteps.description}
            </p>

          </div>


          <div className="trade-next-steps__grid">

            {nextSteps.items.map(
              (
                item,
                index
              ) => {

                const Icon =
                  getNextStepIcon(
                    index
                  );


                return (
                  <article
                    className="trade-next-step"
                    key={
                      `${item.number}-${item.title}`
                    }
                  >

                    <div className="trade-next-step__top">

                      <span>
                        {item.number}
                      </span>


                      <Icon
                        size={25}
                        aria-hidden="true"
                      />

                    </div>


                    <h3>
                      {item.title}
                    </h3>


                    <p>
                      {item.text}
                    </p>

                  </article>
                );
              }
            )}

          </div>

        </div>

      </section>


      {/* ======================================================
          FINAL CTA
      ====================================================== */}

      <section className="trade-final-cta">

        <div className="trade-final-cta__image">

          <img
            src={
              cta.image
            }
            alt=""
            loading="lazy"
            decoding="async"
            onError={
              handleImageError
            }
          />


          <div
            aria-hidden="true"
          />

        </div>


        <div className="container trade-final-cta__inner">

          <div>

            <span className="trade-eyebrow trade-eyebrow--gold">
              {cta.eyebrow}
            </span>


            <h2>

              {cta.titleLine1}

              <br />

              {cta.titleLine2}

            </h2>

          </div>


          <p>
            {cta.description}
          </p>


          <Link
            to={
              cta.buttonLink ||
              "/contact"
            }
            className="trade-button trade-button--gold"
          >

            {cta.buttonText}

            <ArrowRight
              size={18}
              aria-hidden="true"
            />

          </Link>

        </div>

      </section>

    </main>
  );
}