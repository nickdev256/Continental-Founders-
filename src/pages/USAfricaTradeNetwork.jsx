import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Link } from "react-router-dom";

import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ChevronRight,
  Globe2,
  GraduationCap,
  Handshake,
  Landmark,
  Lightbulb,
  Network,
  Rocket,
  TrendingUp,
  Users,
} from "lucide-react";

import "./USAfricaTradeNetwork.css";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const PAGE_SLUG = "us-africa-trade-network";

/* ============================================================
   DEFAULT CONTENT
============================================================ */

const DEFAULT_CONTENT = {
  hero: {
    eyebrow: "U.S.–AFRICA STRATEGIC ECOSYSTEM",
    titleLine1: "Connecting founders",
    titleLine2: "to real markets.",
    titleHighlight: "Real opportunity.",
    description:
      "Continental Founders is proposing USAfrica as a Strategic Ecosystem & Market Access Partner — connecting CFCV fellows and alumni to markets, capital networks, corporate relationships, government stakeholders, and diaspora expertise.",
    image: "/assets/images/us-africa/business-week.webp",
    primaryButtonText: "Explore the partnership",
    primaryButtonLink: "/contact",
    secondaryButtonText: "See the opportunity",
  },

  highlights: [
    { title: "Market Access" },
    { title: "Capital Networks" },
    { title: "Strategic Relationships" },
  ],

  sideMessage: [
    "FOUNDERS",
    "MARKETS",
    "CAPITAL",
    "INSTITUTIONS",
    "OPPORTUNITY",
  ],

  intro: {
    eyebrow: "The Opportunity",
    title:
      "Founder development becomes founder success when it meets the real world.",
    paragraph1:
      "Continental Founders develops rising founders through a rigorous, evidence-based pipeline. But founder development only becomes founder success when ideas and ventures are tested against real markets, real capital, and real institutions.",
    paragraph2:
      "The proposed relationship with USAfrica is designed to close that gap by creating structured pathways from the CFCV founder-development environment into external commercial ecosystems.",
    image: "/assets/images/us-africa/business-handshake.webp",
    imageCaption:
      "From founder development to commercial opportunity",
    buttonText: "Explore our model",
    buttonLink: "/our-model",
  },

  features: {
    eyebrow: "The Proposed Role",
    title:
      "Turning founder knowledge into measurable commercial outcomes.",
    description:
      "The proposed partnership would connect CFCV fellows and alumni with the external relationships, institutions, and opportunities required to apply what they are building in real commercial environments.",

    items: [
      {
        title: "Real-World Application",
        description:
          "Give fellows access to investor meetings, corporate roundtables, procurement opportunities, and market-entry conversations across the CFCV pipeline — Genesis, Ascend, and Horizon.",
        image: "/assets/images/us-africa/market-access.webp",
      },
      {
        title: "Diaspora–Continental Bridge",
        description:
          "Create structured relationships between African and diaspora founders, professionals, experts, and institutions.",
        image: "/assets/images/us-africa/business-connections.webp",
      },
      {
        title: "Opportunity Pipeline",
        description:
          "Build a curated exchange of capital, market, procurement, partnership, government, and knowledge opportunities for fellows.",
        image: "/assets/images/us-africa/trade-readiness.webp",
      },
      {
        title: "Convening Platform",
        description:
          "Use USAFRICA Business Week and related convenings as applied-learning environments where fellows can pitch, negotiate, build relationships, and engage external stakeholders.",
        image: "/assets/images/us-africa/knowledge-exchange.webp",
      },
      {
        title: "Strategic Partnership Engine",
        description:
          "Source institutional relationships with universities, chambers of commerce, embassies, development finance institutions, corporations, and other ecosystem partners.",
        image: "/assets/m.webp",
      },
    ],
  },

  network: {
    eyebrow: "The External Ecosystem",
    titleLine1: "The right founders.",
    titleLine2: "The right relationships.",
    description:
      "The ecosystem would connect CFCV fellows and alumni with the institutions, professionals, markets, and networks capable of opening pathways to commercial opportunity.",

    items: [
      "Investors & Capital Networks",
      "Corporations & Industry Leaders",
      "Diaspora Professionals",
      "Universities & Researchers",
      "Embassies & Government Stakeholders",
      "Chambers & Development Institutions",
    ],
  },

  partnership: {
    eyebrow: "Why This Partnership",
    title:
      "A commercial proving ground for the Continental Founders model.",
    description:
      "The relationship is designed to create value for both institutions while preserving the independence and integrity of their respective roles.",
    cfTitle: "For Continental Founders",
    cfText:
      "USAfrica could provide the commercial proving ground that turns curriculum into outcomes. Fellows would gain structured exposure to real markets, investors, companies, institutions, and decision-makers while Continental Founders strengthens its evidence-based research model.",
    usaAfricaTitle: "For USAfrica",
    usaAfricaText:
      "The partnership could provide a pipeline of founders progressing through an evidence-based development model and give USAfrica a defined role within a growing cross-continental founder ecosystem.",
    governanceTitle: "Independent Standards. Shared Opportunity.",
    governanceText:
      "USAfrica would hold a significant role in external ecosystem engagement, while Continental Founders would retain independent control over academic standards, fellowship decisions, and research conclusions — preserving the integrity of both institutions.",
  },

  nextSteps: {
    eyebrow: "Next Steps",
    title: "Move from proposal to pilot.",
    description:
      "A focused pilot can provide both organizations with a practical way to test the partnership model, establish responsibilities, and measure early results.",

    items: [
      {
        number: "01",
        title: "Joint Discussion",
        text:
          "Hold a joint call to walk through the proposal and assess alignment with USAfrica's current platforms, priorities, and calendar.",
      },
      {
        number: "02",
        title: "Pilot Cohort",
        text:
          "Identify a pilot cohort for an initial engagement, potentially connected to USAFRICA Business Week or another suitable applied-learning platform.",
      },
      {
        number: "03",
        title: "Framework",
        text:
          "Agree on initial-year deliverables, responsibilities, target outcomes, and a lightweight reporting structure.",
      },
    ],
  },

  cta: {
    eyebrow: "Strategic Ecosystem Partnership",
    titleLine1: "From founder potential",
    titleLine2: "to commercial evidence.",
    description:
      "Continental Founders welcomes the opportunity to explore how USAfrica's ecosystem can connect CFCV fellows with markets, capital, institutions, diaspora expertise, and cross-continental opportunity.",
    buttonText: "Discuss the partnership",
    buttonLink: "/contact",
    image: "/assets/images/us-africa/final-cta.webp",
  },
};

/* ============================================================
   MERGE CMS CONTENT WITH DEFAULT CONTENT
============================================================ */

function mergeContent(content = {}) {
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
      items: Array.isArray(content.features?.items)
        ? content.features.items
        : DEFAULT_CONTENT.features.items,
    },

    network: {
      ...DEFAULT_CONTENT.network,
      ...(content.network || {}),
      items: Array.isArray(content.network?.items)
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
      items: Array.isArray(content.nextSteps?.items)
        ? content.nextSteps.items
        : DEFAULT_CONTENT.nextSteps.items,
    },

    cta: {
      ...DEFAULT_CONTENT.cta,
      ...(content.cta || {}),
    },

    highlights: Array.isArray(content.highlights)
      ? content.highlights
      : DEFAULT_CONTENT.highlights,

    sideMessage: Array.isArray(content.sideMessage)
      ? content.sideMessage
      : DEFAULT_CONTENT.sideMessage,
  };
}

/* ============================================================
   ICON HELPERS
   Cards cycle through the site's gold, navy and blue accents.
============================================================ */

const TONES = ["gold", "navy", "blue"];

function getHighlightIcon(index) {
  const icons = [Handshake, TrendingUp, Network];
  return icons[index] || Handshake;
}

function getFeatureIcon(index) {
  const icons = [
    Lightbulb,
    Globe2,
    TrendingUp,
    Users,
    Handshake,
  ];

  return icons[index % icons.length] || Lightbulb;
}

function getNetworkIcon(index) {
  const icons = [
    TrendingUp,
    Building2,
    Globe2,
    GraduationCap,
    Landmark,
    Network,
  ];

  return icons[index % icons.length] || Users;
}

function getNextStepIcon(index) {
  const icons = [Handshake, Rocket, CheckCircle2];
  return icons[index % icons.length] || CheckCircle2;
}

/* ============================================================
   IMAGE ERROR HANDLER
============================================================ */

function handleImageError(event) {
  const image = event.currentTarget;

  if (image.dataset.fallbackApplied === "true") {
    return;
  }

  image.dataset.fallbackApplied = "true";
  image.style.visibility = "hidden";
}

/* ============================================================
   PAGE COMPONENT
============================================================ */

export default function USAfricaTradeNetwork() {
  const [page, setPage] = useState(null);
  const [error, setError] = useState("");

  /* ==========================================================
     LOAD CMS PAGE
     The default content renders at once; CMS content replaces
     it when it arrives, so visitors never see a loading bar.
  ========================================================== */

  const loadPage = useCallback(async (signal) => {
    try {
      setError("");

      const response = await fetch(
        `${API_URL}/api/pages/published/${PAGE_SLUG}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
          signal,
        }
      );

      const contentType =
        response.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        const responseText = await response.text();

        console.error(
          "Unexpected page response:",
          responseText
        );

        throw new Error(
          "The page service returned an unexpected response."
        );
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
            result?.error ||
            `Unable to load page. Status: ${response.status}`
        );
      }

      setPage(result?.page || result?.data || null);
    } catch (requestError) {
      if (requestError?.name === "AbortError") {
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
    }
  }, []);

  /* ==========================================================
     INITIAL LOAD
  ========================================================== */

  useEffect(() => {
    const controller = new AbortController();

    loadPage(controller.signal);

    return () => {
      controller.abort();
    };
  }, [loadPage]);

  /* ==========================================================
     MERGED CONTENT
  ========================================================== */

  const content = useMemo(
    () => mergeContent(page?.content || {}),
    [page]
  );

  const {
    hero,
    intro,
    features,
    network,
    partnership,
    nextSteps,
    cta,
  } = content;

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

    root.classList.add("trade-page--reveal");

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
     PAGE LAYOUT
  ========================================================== */

  return (
    <main className="us-africa-page" ref={pageRef}>
      {error && import.meta.env.DEV && (
        <div
          className="trade-cms-status trade-cms-status--error"
          role="status"
        >
          CMS connection: {error}
        </div>
      )}

      {/* HERO */}

      <section className="trade-hero">
        <div className="trade-hero__media" aria-hidden="true">
          <img
            src={hero.image}
            alt=""
            fetchPriority="high"
            decoding="async"
            onError={handleImageError}
          />
        </div>

        <div className="trade-container trade-hero__inner">
          <div className="trade-hero__content">
            <span className="trade-eyebrow trade-eyebrow--light">
              {hero.eyebrow}
            </span>

            <h1>
              <span>{hero.titleLine1}</span>{" "}
              <span>{hero.titleLine2}</span>{" "}
              <em>{hero.titleHighlight}</em>
            </h1>

            <p>{hero.description}</p>

            <div className="trade-hero__actions">
              <Link
                to={hero.primaryButtonLink || "/contact"}
                className="trade-button trade-button--gold"
              >
                {hero.primaryButtonText}
                <ArrowRight size={18} aria-hidden="true" />
              </Link>

              <a
                href="#network-opportunity"
                className="trade-button trade-button--ghost"
              >
                {hero.secondaryButtonText}
              </a>
            </div>
          </div>

          <ul className="trade-hero__highlights">
            {content.highlights.map((item, index) => {
              const Icon = getHighlightIcon(index);

              return (
                <li
                  key={`${item.title}-${index}`}
                  className={`trade-tone--${TONES[index % TONES.length]}`}
                >
                  <span className="trade-hero__highlight-icon">
                    <Icon size={18} aria-hidden="true" />
                  </span>
                  {item.title}
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* VALUE CHAIN */}

      <div className="trade-chain" aria-hidden="true">
        <div className="trade-container trade-chain__inner">
          {content.sideMessage.map((item, index) => (
            <React.Fragment key={`${item}-${index}`}>
              {index > 0 && <ChevronRight size={16} />}
              <span>{item}</span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* OPPORTUNITY */}

      <section
        className="trade-section trade-opportunity"
        id="network-opportunity"
      >
        <div className="trade-container trade-opportunity__grid">
          <figure className="trade-opportunity__media" data-reveal>
            <img
              src={intro.image}
              alt=""
              loading="lazy"
              decoding="async"
              onError={handleImageError}
            />

            <figcaption>{intro.imageCaption}</figcaption>
          </figure>

          <div className="trade-opportunity__content" data-reveal>
            <span className="trade-eyebrow">{intro.eyebrow}</span>

            <h2>{intro.title}</h2>

            <p>{intro.paragraph1}</p>

            <p>{intro.paragraph2}</p>

            <Link
              to={intro.buttonLink || "/our-model"}
              className="trade-button trade-button--navy"
            >
              {intro.buttonText}
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* PROPOSED ROLE */}

      <section className="trade-section trade-section--soft trade-roles">
        <div className="trade-container">
          <header className="trade-heading trade-heading--split" data-reveal>
            <div>
              <span className="trade-eyebrow">{features.eyebrow}</span>
              <h2>{features.title}</h2>
            </div>

            <p>{features.description}</p>
          </header>

          <div className="trade-roles__grid" data-reveal>
            {features.items.map((item, index) => {
              const Icon = getFeatureIcon(index);

              const fallbackImage =
                DEFAULT_CONTENT.features.items[index]?.image;

              return (
                <article
                  className={`trade-role trade-tone--${TONES[index % TONES.length]}`}
                  key={`${item.title}-${index}`}
                >
                  <div className="trade-role__media">
                    <img
                      src={item.image || fallbackImage}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      onError={handleImageError}
                    />

                    <span className="trade-role__icon">
                      <Icon size={20} aria-hidden="true" />
                    </span>
                  </div>

                  <div className="trade-role__body">
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* EXTERNAL ECOSYSTEM */}

      <section className="trade-section trade-network">
        <div className="trade-container trade-network__grid">
          <header className="trade-network__intro" data-reveal>
            <span className="trade-eyebrow">{network.eyebrow}</span>

            <h2>
              <span>{network.titleLine1}</span>{" "}
              <em>{network.titleLine2}</em>
            </h2>

            <p>{network.description}</p>
          </header>

          <ul className="trade-network__list" data-reveal>
            {network.items.map((item, index) => {
              const Icon = getNetworkIcon(index);

              return (
                <li
                  className={`trade-network__item trade-tone--${TONES[index % TONES.length]}`}
                  key={`${item}-${index}`}
                >
                  <span className="trade-network__icon">
                    <Icon size={22} aria-hidden="true" />
                  </span>
                  <span>{item}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* WHY THIS PARTNERSHIP */}

      <section className="trade-section trade-section--soft trade-partnership">
        <div className="trade-container">
          <header className="trade-heading" data-reveal>
            <span className="trade-eyebrow">{partnership.eyebrow}</span>
            <h2>{partnership.title}</h2>
            <p>{partnership.description}</p>
          </header>

          <div className="trade-partnership__grid" data-reveal>
            <article className="trade-partner-card trade-tone--gold">
              <span className="trade-partner-card__icon">
                <Lightbulb size={24} aria-hidden="true" />
              </span>

              <span className="trade-partner-card__label">
                Continental Founders
              </span>

              <h3>{partnership.cfTitle}</h3>

              <p>{partnership.cfText}</p>
            </article>

            <article className="trade-partner-card trade-tone--navy">
              <span className="trade-partner-card__icon">
                <Globe2 size={24} aria-hidden="true" />
              </span>

              <span className="trade-partner-card__label">
                USAfrica
              </span>

              <h3>{partnership.usaAfricaTitle}</h3>

              <p>{partnership.usaAfricaText}</p>
            </article>
          </div>

          {/* GOVERNANCE */}

          <div className="trade-governance" data-reveal>
            <span className="trade-governance__icon">
              <Landmark size={26} aria-hidden="true" />
            </span>

            <div>
              <span className="trade-eyebrow trade-eyebrow--light">
                Partnership Governance
              </span>

              <h3>{partnership.governanceTitle}</h3>

              <p>{partnership.governanceText}</p>
            </div>
          </div>
        </div>
      </section>

      {/* NEXT STEPS */}

      <section className="trade-section trade-steps">
        <div className="trade-container">
          <header className="trade-heading" data-reveal>
            <span className="trade-eyebrow">{nextSteps.eyebrow}</span>
            <h2>{nextSteps.title}</h2>
            <p>{nextSteps.description}</p>
          </header>

          <ol className="trade-steps__list" data-reveal>
            {nextSteps.items.map((item, index) => {
              const Icon = getNextStepIcon(index);

              return (
                <li
                  className={`trade-step trade-tone--${TONES[index % TONES.length]}`}
                  key={`${item.number}-${item.title}`}
                >
                  <div className="trade-step__marker">
                    <span>{item.number}</span>
                  </div>

                  <div className="trade-step__body">
                    <Icon size={22} aria-hidden="true" />
                    <h3>{item.title}</h3>
                    <p>{item.text}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* FINAL CTA */}

      <section className="trade-cta">
        <div className="trade-container">
          <div className="trade-cta__card" data-reveal>
            <img
              src={cta.image}
              alt=""
              loading="lazy"
              decoding="async"
              onError={handleImageError}
            />

            <div className="trade-cta__content">
              <span className="trade-eyebrow trade-eyebrow--light">
                {cta.eyebrow}
              </span>

              <h2>
                <span>{cta.titleLine1}</span>{" "}
                <em>{cta.titleLine2}</em>
              </h2>

              <p>{cta.description}</p>

              <Link
                to={cta.buttonLink || "/contact"}
                className="trade-button trade-button--gold"
              >
                {cta.buttonText}
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
