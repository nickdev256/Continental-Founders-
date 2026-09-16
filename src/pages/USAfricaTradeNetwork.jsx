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
  Globe2,
  GraduationCap,
  Handshake,
  Landmark,
  Lightbulb,
  Network,
  RefreshCw,
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
   FALLBACK CONTENT

   IMPORTANT:
   Stats are intentionally NOT hard-coded here.
   Statistics must come from the CMS/backend/database.
============================================================ */

const DEFAULT_CONTENT = {
  hero: {
    eyebrow:
      "U.S.–AFRICA TRADE & BUSINESS NETWORK",

    titleLine1:
      "Bridging markets.",

    titleLine2:
      "Building opportunity.",

    titleHighlight:
      "Together.",

    description:
      "Connecting entrepreneurs, companies, and institutions across the United States and Africa to create real business opportunities, expand markets, and build lasting commercial relationships.",

    image:
      "/assets/images/us-africa/hero.webp",

    primaryButtonText:
      "Explore Partnership",

    primaryButtonLink:
      "/contact",

    secondaryButtonText:
      "Learn More",
  },


  highlights: [
    {
      title:
        "Stronger Businesses",
    },
    {
      title:
        "Expanded Markets",
    },
    {
      title:
        "Lasting Impact",
    },
  ],


  sideMessage: [
    "PEOPLE",
    "MARKETS",
    "INVESTMENT",
    "OPPORTUNITY",
    "IMPACT",
  ],


  trust: {
    label:
      "Trusted by forward-thinking organizations",

    organizations: [
      "U.S. Chamber of Commerce",
      "AfCFTA",
      "World Bank Group",
      "African Union",
      "UNDP",
      "DFC",
    ],
  },


  intro: {
    eyebrow:
      "Cross-Border Opportunity",

    title:
      "Connecting ambitious founders with global markets.",

    paragraph1:
      "The U.S.–Africa Trade & Business Network creates a bridge between entrepreneurial ecosystems, business communities, and institutions across both markets.",

    paragraph2:
      "Through trusted relationships and strategic partnerships, we help founders move from introductions to commercial opportunities, partnerships, market entry, and long-term growth.",

    image:
      "/assets/images/us-africa/business-handshake.webp",

    imageCaption:
      "Opportunity knows no borders",

    buttonText:
      "Our Approach",

    buttonLink:
      "/our-model",
  },


  /*
   * NO HARDCODED STATS.
   *
   * This remains empty unless the CMS/backend/database
   * sends content.stats.
   */
  stats: [],


  features: {
    eyebrow:
      "What the Network Enables",

    title:
      "From connections to real-world impact.",

    description:
      "We help founders, companies, and institutions unlock practical opportunities through trusted relationships, market knowledge, and strategic collaboration.",

    items: [
      {
        title:
          "Market Access",

        description:
          "Understand new markets, identify opportunities, and expand globally.",

        image:
          "/assets/images/us-africa/market-access.webp",
      },
      {
        title:
          "Business Connections",

        description:
          "Build meaningful relationships with industry leaders, buyers, suppliers, and strategic partners.",

        image:
          "/assets/images/us-africa/business-connections.webp",
      },
      {
        title:
          "Trade & Investment Readiness",

        description:
          "Prepare for cross-border engagement and investment opportunities.",

        image:
          "/assets/images/us-africa/trade-readiness.webp",
      },
      {
        title:
          "Knowledge Exchange",

        description:
          "Access market intelligence, industry expertise, and proven business practices.",

        image:
          "/assets/images/us-africa/knowledge-exchange.webp",
      },
    ],
  },


  network: {
    eyebrow:
      "Who We Work With",

    titleLine1:
      "A diverse network.",

    titleLine2:
      "A shared vision.",

    description:
      "We collaborate with the people and institutions that make cross-border business possible.",

    items: [
      "Entrepreneurs & Founders",
      "Companies & Industry Leaders",
      "Trade Organizations",
      "Business Associations",
      "Universities & Institutions",
      "Economic Development Partners",
    ],
  },


  cta: {
    eyebrow:
      "Build With Us",

    titleLine1:
      "Let’s turn opportunity",

    titleLine2:
      "into lasting impact.",

    description:
      "Join Continental Founders in strengthening U.S.–Africa business connections and building a more prosperous future through markets, expertise, and commercial opportunity.",

    buttonText:
      "Explore Partnership",

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


    trust: {
      ...DEFAULT_CONTENT.trust,
      ...(content.trust || {}),

      organizations:
        Array.isArray(
          content.trust?.organizations
        )
          ? content.trust.organizations
          : DEFAULT_CONTENT.trust.organizations,
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


    cta: {
      ...DEFAULT_CONTENT.cta,
      ...(content.cta || {}),
    },


    /*
     * CMS / DATABASE ONLY
     *
     * There is intentionally no fallback to
     * DEFAULT_CONTENT.stats.
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
        : [],


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
    Users,
    Landmark,
    ChartNoAxesCombined,
  ];

  return (
    icons[
      index %
      icons.length
    ] ||
    Globe2
  );
}


function getFeatureIcon(
  index
) {
  const icons = [
    TrendingUp,
    Users,
    Building2,
    Lightbulb,
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
    Users,
    ChartNoAxesCombined,
    Globe2,
    Network,
    GraduationCap,
    Landmark,
  ];

  return (
    icons[
      index %
      icons.length
    ] ||
    Users
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
     MERGED CONTENT
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
    trust,
    stats,
    features,
    network,
    cta,
  } =
    content;


  const hasStats =
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
            className="trade-cms-status trade-cms-status--error"
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
          TRUST
      ====================================================== */}

      <section className="trade-trust">

        <div className="container">

          <div className="trade-trust__label">
            {trust.label}
          </div>


          <div className="trade-trust__logos">

            {(
              trust.organizations ||
              []
            ).map(
              (
                organization,
                index
              ) => (
                <div
                  key={
                    `${organization}-${index}`
                  }
                >
                  {organization}
                </div>
              )
            )}

          </div>

        </div>

      </section>


      {/* ======================================================
          CROSS-BORDER OPPORTUNITY
      ====================================================== */}

      <section
        className={
          `trade-opportunity ${
            hasStats
              ? "trade-opportunity--with-stats"
              : "trade-opportunity--without-stats"
          }`
        }
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


        {/* ====================================================
            CMS / DATABASE STATISTICS

            These statistics are rendered ONLY when
            content.stats exists in the CMS response.
        ==================================================== */}

        {hasStats && (
          <div className="trade-opportunity__stats">

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
                  <div
                    className="trade-stat"
                    key={
                      `${
                        stat.label ||
                        "stat"
                      }-${index}`
                    }
                  >
                    <Icon
                      size={25}
                      aria-hidden="true"
                    />


                    <div>

                      <strong>
                        {stat.value}
                      </strong>

                      <span>
                        {stat.label}
                      </span>

                    </div>

                  </div>
                );
              }
            )}

          </div>
        )}

      </section>


      {/* ======================================================
          NETWORK ENABLES
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
          WHO WE WORK WITH
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