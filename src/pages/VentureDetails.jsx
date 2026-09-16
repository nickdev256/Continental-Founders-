import React, { useCallback, useEffect, useMemo, useState } from "react";
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
  RefreshCw,
} from "lucide-react";

import "./VentureDetails.css";

/* ============================================================
   API
============================================================ */

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

/* ============================================================
   HELPERS
============================================================ */

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function getFounderList(venture) {
  const founders = safeArray(venture?.founders);

  if (founders.length > 0) {
    return founders;
  }

  if (venture?.founder) {
    return [
      {
        id: "legacy-founder",
        name: venture.founder,
        image:
          venture.founderImage ||
          venture.founder_image ||
          "",
        role: "Founder",
        bio:
          venture.founderBio ||
          venture.founder_bio ||
          "",
      },
    ];
  }

  return [];
}

function getFounderImage(founder) {
  return (
    founder?.image ||
    founder?.imageUrl ||
    founder?.image_url ||
    founder?.photo ||
    founder?.photoUrl ||
    founder?.photo_url ||
    ""
  );
}

function getVentureLogo(venture) {
  return (
    venture?.logoUrl ||
    venture?.logo_url ||
    venture?.logo ||
    ""
  );
}

function getHeroImage(venture) {
  return (
    venture?.heroImageUrl ||
    venture?.hero_image_url ||
    venture?.heroImage ||
    ""
  );
}

function getLookingFor(venture) {
  const lookingFor =
    safeArray(venture?.lookingFor).length > 0
      ? safeArray(venture?.lookingFor)
      : safeArray(venture?.looking_for);

  return lookingFor
    .map((item) => {
      if (typeof item === "string") {
        return item;
      }

      return item?.title || item?.name || item?.text || "";
    })
    .filter(Boolean);
}

function getServices(venture) {
  return safeArray(venture?.services)
    .map((service) => {
      if (typeof service === "string") {
        return service;
      }

      return service?.title || service?.name || service?.text || "";
    })
    .filter(Boolean);
}

function getOpportunityAreas(venture) {
  const storedAreas =
    safeArray(venture?.opportunityAreas).length > 0
      ? safeArray(venture?.opportunityAreas)
      : safeArray(venture?.opportunity_areas);

  const normalizedStoredAreas = storedAreas
    .map((item) => {
      if (typeof item === "string") {
        return {
          title: "Opportunity",
          text: item,
        };
      }

      return {
        title: item?.title || item?.name || "Opportunity",
        text:
          item?.text ||
          item?.description ||
          item?.content ||
          "",
      };
    })
    .filter((item) => item.text);

  if (normalizedStoredAreas.length > 0) {
    return normalizedStoredAreas;
  }

  return [
    {
      title: "Problem",
      text:
        venture?.problem ||
        "The venture is addressing a meaningful market challenge.",
    },
    {
      title: "Solution",
      text:
        venture?.solution ||
        venture?.description ||
        "The venture is developing a practical solution.",
    },
    {
      title: "Market",
      text:
        venture?.market ||
        "The venture is building toward a clear market opportunity.",
    },
    {
      title: "Current Stage",
      text:
        venture?.stage ||
        "The venture is progressing through its current stage of development.",
    },
  ];
}

function getLongDescription(venture) {
  return (
    venture?.longDescription ||
    venture?.long_description ||
    venture?.description ||
    venture?.tagline ||
    ""
  );
}

function getSecondaryDescription(venture) {
  return (
    venture?.secondaryDescription ||
    venture?.secondary_description ||
    ""
  );
}

function getSecondaryPhone(venture) {
  return (
    venture?.secondaryPhone ||
    venture?.secondary_phone ||
    ""
  );
}

function getInitials(name) {
  return String(name || "CF")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function normalizeWebsite(url) {
  const value = String(url || "").trim();

  if (!value) {
    return "";
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return `https://${value}`;
}

function displayWebsite(url) {
  return String(url || "")
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/$/, "");
}

function normalizePhoneLink(phone) {
  return String(phone || "")
    .trim()
    .replace(/[^\d+]/g, "");
}

function getSectionNumber(index) {
  return String(index).padStart(2, "0");
}

/* ============================================================
   IMAGE WITH FALLBACK
============================================================ */

function VentureImage({
  src,
  alt,
  className,
  fallback,
}) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [src]);

  if (!src || failed) {
    return fallback || null;
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

/* ============================================================
   VENTURE DETAILS
============================================================ */

export default function VentureDetails() {
  const { slug } = useParams();

  const [venture, setVenture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ==========================================================
     LOAD VENTURE
  ========================================================== */

  const loadVenture = useCallback(
    async (signal) => {
      if (!slug) {
        setVenture(null);
        setError("Venture not found.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `${API_URL}/api/ventures/${encodeURIComponent(slug)}`,
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

        let result = null;

        if (contentType.includes("application/json")) {
          result = await response.json();
        } else {
          const body = await response.text();

          console.error(
            "Unexpected venture response:",
            body
          );

          throw new Error(
            "The venture service returned an unexpected response."
          );
        }

        if (response.status === 404) {
          setVenture(null);
          setError(
            result?.message ||
              "This venture could not be found."
          );
          return;
        }

        if (!response.ok) {
          throw new Error(
            result?.message ||
              result?.error ||
              "Unable to load venture."
          );
        }

        const record =
          result?.venture ||
          result?.data?.venture ||
          result?.data ||
          null;

        if (!record) {
          throw new Error(
            "The venture profile is unavailable."
          );
        }

        setVenture(record);
      } catch (requestError) {
        if (requestError?.name === "AbortError") {
          return;
        }

        console.error(
          "Venture details error:",
          requestError
        );

        setVenture(null);
        setError(
          requestError?.message ||
            "Unable to load venture."
        );
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [slug]
  );

  useEffect(() => {
    const controller = new AbortController();

    loadVenture(controller.signal);

    return () => {
      controller.abort();
    };
  }, [loadVenture]);

  /* ==========================================================
     NORMALIZED DATA
  ========================================================== */

  const founders = useMemo(
    () => getFounderList(venture),
    [venture]
  );

  const services = useMemo(
    () => getServices(venture),
    [venture]
  );

  const opportunityAreas = useMemo(
    () => getOpportunityAreas(venture),
    [venture]
  );

  const lookingFor = useMemo(
    () => getLookingFor(venture),
    [venture]
  );

  const founderNames = founders
    .map((founder) => founder?.name)
    .filter(Boolean)
    .join(" & ");

  const founderLabel =
    founders.length === 1
      ? "Founder"
      : "Founders";

  const ventureLogo =
    getVentureLogo(venture);

  const heroImage =
    getHeroImage(venture);

  const longDescription =
    getLongDescription(venture);

  const secondaryDescription =
    getSecondaryDescription(venture);

  const secondaryPhone =
    getSecondaryPhone(venture);

  const websiteUrl =
    normalizeWebsite(venture?.website);

  /* ==========================================================
     DYNAMIC SECTION NUMBERS
  ========================================================== */

  let sectionCounter = 1;

  const overviewNumber =
    getSectionNumber(sectionCounter++);

  const servicesNumber =
    services.length > 0
      ? getSectionNumber(sectionCounter++)
      : null;

  const opportunityNumber =
    getSectionNumber(sectionCounter++);

  const foundersNumber =
    founders.length > 0
      ? getSectionNumber(sectionCounter++)
      : null;

  const hasContact =
    Boolean(
      venture?.website ||
        venture?.email ||
        venture?.phone ||
        secondaryPhone
    );

  const contactNumber =
    hasContact
      ? getSectionNumber(sectionCounter++)
      : null;

  const journeyNumber =
    getSectionNumber(sectionCounter++);

  const lookingNumber =
    getSectionNumber(sectionCounter++);

  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {
    return (
      <main className="venture-details-page">
        <section className="venture-details-state">
          <div className="venture-details-container venture-details-state__inner">
            <div className="venture-details-spinner">
              <RefreshCw
                size={25}
                aria-hidden="true"
              />
            </div>

            <span className="venture-details-eyebrow">
              Loading Venture
            </span>

            <h1>
              Loading venture details...
            </h1>

            <p>
              Retrieving the latest venture information.
            </p>
          </div>
        </section>
      </main>
    );
  }

  /* ==========================================================
     NOT FOUND / ERROR
  ========================================================== */

  if (error || !venture) {
    return (
      <main className="venture-details-page">
        <section className="venture-details-state">
          <div className="venture-details-container venture-details-state__inner">
            <span className="venture-details-eyebrow">
              Venture Not Found
            </span>

            <h1>
              We couldn't find this venture.
            </h1>

            <p>
              {error ||
                "The venture may have been removed, renamed, unpublished, or the link may be incorrect."}
            </p>

            <div className="venture-details-state__actions">
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

              <button
                type="button"
                className="venture-details-button venture-details-button--outline"
                onClick={() => {
                  const controller =
                    new AbortController();

                  loadVenture(
                    controller.signal
                  );
                }}
              >
                <RefreshCw
                  size={16}
                  aria-hidden="true"
                />

                Try Again
              </button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  /* ==========================================================
     PAGE
  ========================================================== */

  return (
    <main className="venture-details-page">
      {/* ======================================================
          HERO
      ====================================================== */}

      <section
        className={`venture-details-hero ${
          heroImage
            ? "venture-details-hero--image"
            : "venture-details-hero--plain"
        }`}
      >
        {heroImage && (
          <div
            className="venture-details-hero__background"
            style={{
              backgroundImage: `url("${heroImage}")`,
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
                {venture.sector || "Venture"}
              </span>

              {venture.country && (
                <>
                  <span
                    className="venture-details-meta-dot"
                    aria-hidden="true"
                  >
                    •
                  </span>

                  <span>
                    {venture.country}
                  </span>
                </>
              )}
            </div>

            <h1>{venture.name}</h1>

            {(venture.tagline ||
              venture.description) && (
              <p className="venture-details-hero__description">
                {venture.tagline ||
                  venture.description}
              </p>
            )}

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

              {websiteUrl && (
                <a
                  href={websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
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

          <aside className="venture-details-hero__profile">
            <div className="venture-details-hero__logo-wrap">
              <VentureImage
                src={ventureLogo}
                alt={`${venture.name} logo`}
                className="venture-details-logo__image"
                fallback={
                  <div className="venture-details-logo-placeholder">
                    {getInitials(
                      venture.name
                    )}
                  </div>
                }
              />
            </div>

            <div className="venture-details-hero__profile-grid">
              <div>
                <span>
                  {founderLabel}
                </span>

                <strong>
                  {founderNames ||
                    "Not specified"}
                </strong>
              </div>

              <div>
                <span>Stage</span>

                <strong>
                  {venture.stage ||
                    "Not specified"}
                </strong>
              </div>

              <div>
                <span>Sector</span>

                <strong>
                  {venture.sector ||
                    "Not specified"}
                </strong>
              </div>

              <div>
                <span>Location</span>

                <strong>
                  {venture.country ||
                    "Not specified"}
                </strong>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* ======================================================
          OVERVIEW
      ====================================================== */}

      <section
        id="venture-overview"
        className="venture-details-overview"
      >
        <div className="venture-details-container">
          <div className="venture-details-section-heading">
            <div className="venture-details-section-heading__label">
              <span className="venture-details-section-number">
                {overviewNumber}
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

              {longDescription ? (
                <p>{longDescription}</p>
              ) : (
                <p>
                  More information about this venture will be available soon.
                </p>
              )}

              {secondaryDescription && (
                <p>
                  {secondaryDescription}
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
                    {founderNames ||
                      "Not specified"}
                  </strong>
                </div>
              </div>

              <div className="venture-details-fact">
                <Globe2
                  size={18}
                  aria-hidden="true"
                />

                <div>
                  <span>Country</span>

                  <strong>
                    {venture.country ||
                      "Not specified"}
                  </strong>
                </div>
              </div>

              <div className="venture-details-fact">
                <BriefcaseBusiness
                  size={18}
                  aria-hidden="true"
                />

                <div>
                  <span>Sector</span>

                  <strong>
                    {venture.sector ||
                      "Not specified"}
                  </strong>
                </div>
              </div>

              <div className="venture-details-fact">
                <TrendingUp
                  size={18}
                  aria-hidden="true"
                />

                <div>
                  <span>Stage</span>

                  <strong>
                    {venture.stage ||
                      "Not specified"}
                  </strong>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* ======================================================
          SERVICES
      ====================================================== */}

      {services.length > 0 && (
        <section className="venture-details-services">
          <div className="venture-details-container">
            <div className="venture-details-section-heading">
              <div className="venture-details-section-heading__label">
                <span className="venture-details-section-number">
                  {servicesNumber}
                </span>

                <span className="venture-details-eyebrow">
                  What We Do
                </span>
              </div>

              <h2>
                Practical solutions
                <br />
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
                    <div className="venture-details-service-card__top">
                      <div className="venture-details-service-card__icon">
                        <Layers3
                          size={20}
                          aria-hidden="true"
                        />
                      </div>

                      <span className="venture-details-service-card__number">
                        {String(
                          index + 1
                        ).padStart(
                          2,
                          "0"
                        )}
                      </span>
                    </div>

                    <h3>{service}</h3>
                  </article>
                )
              )}
            </div>
          </div>
        </section>
      )}

      {/* ======================================================
          OPPORTUNITY
      ====================================================== */}

      <section className="venture-details-opportunity">
        <div className="venture-details-container">
          <div className="venture-details-section-heading">
            <div className="venture-details-section-heading__label">
              <span className="venture-details-section-number">
                {opportunityNumber}
              </span>

              <span className="venture-details-eyebrow">
                The Opportunity
              </span>
            </div>

            <h2>
              Understanding the venture
              <br />
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
                    {String(
                      index + 1
                    ).padStart(
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

      {/* ======================================================
          FOUNDERS
      ====================================================== */}

      {founders.length > 0 && (
        <section className="venture-details-founder">
          <div className="venture-details-container venture-details-founder__grid">
            <div className="venture-details-founder__label">
              <span className="venture-details-section-number">
                {foundersNumber}
              </span>

              <span className="venture-details-eyebrow">
                {founderLabel}
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
                    const founderName =
                      founder?.name ||
                      "Founder";

                    const founderImage =
                      getFounderImage(
                        founder
                      );

                    return (
                      <article
                        key={
                          founder?.id ||
                          `${founderName}-${index}`
                        }
                        className="venture-details-founder__card"
                      >
                        <div className="venture-details-founder__avatar">
                          <VentureImage
                            src={
                              founderImage
                            }
                            alt={
                              founderName
                            }
                            fallback={
                              <span>
                                {getInitials(
                                  founderName
                                )}
                              </span>
                            }
                          />
                        </div>

                        <div className="venture-details-founder__info">
                          <h3>
                            {founderName}
                          </h3>

                          <span className="venture-details-founder__role">
                            {founder?.role ||
                              "Founder"}
                            {venture.name
                              ? `, ${venture.name}`
                              : ""}
                          </span>

                          {founder?.bio && (
                            <p>
                              {
                                founder.bio
                              }
                            </p>
                          )}
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

      {/* ======================================================
          CONTACT
      ====================================================== */}

      {hasContact && (
        <section className="venture-details-contact">
          <div className="venture-details-container">
            <div className="venture-details-section-heading">
              <div className="venture-details-section-heading__label">
                <span className="venture-details-section-number">
                  {contactNumber}
                </span>

                <span className="venture-details-eyebrow">
                  Venture Contact
                </span>
              </div>

              <h2>
                Connect directly
                <br />
                with {venture.name}.
              </h2>
            </div>

            <div className="venture-details-contact__grid">
              {websiteUrl && (
                <a
                  href={websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
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
                      {displayWebsite(
                        venture.website
                      )}
                    </strong>
                  </div>

                  <ExternalLink
                    className="venture-details-contact__external"
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
                    <span>Email</span>

                    <strong>
                      {venture.email}
                    </strong>
                  </div>
                </a>
              )}

              {venture.phone && (
                <a
                  href={`tel:${normalizePhoneLink(
                    venture.phone
                  )}`}
                  className="venture-details-contact__card"
                >
                  <Phone
                    size={20}
                    aria-hidden="true"
                  />

                  <div>
                    <span>Phone</span>

                    <strong>
                      {venture.phone}
                    </strong>
                  </div>
                </a>
              )}

              {secondaryPhone && (
                <a
                  href={`tel:${normalizePhoneLink(
                    secondaryPhone
                  )}`}
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
                      {secondaryPhone}
                    </strong>
                  </div>
                </a>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ======================================================
          JOURNEY
      ====================================================== */}

      <section className="venture-details-journey">
        <div className="venture-details-container">
          <div className="venture-details-section-heading venture-details-section-heading--light">
            <div className="venture-details-section-heading__label">
              <span className="venture-details-section-number">
                {journeyNumber}
              </span>

              <span className="venture-details-eyebrow venture-details-eyebrow--light">
                Venture Journey
              </span>
            </div>

            <h2>
              Potential to
              <br />
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
                    {String(
                      index + 1
                    ).padStart(
                      2,
                      "0"
                    )}
                  </span>

                  <strong>
                    {step}
                  </strong>

                  {index < 4 && (
                    <ArrowRight
                      size={17}
                      className="venture-details-journey__arrow"
                      aria-hidden="true"
                    />
                  )}
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* ======================================================
          LOOKING FOR
      ====================================================== */}

      <section className="venture-details-looking">
        <div className="venture-details-container venture-details-looking__grid">
          <div className="venture-details-looking__content">
            <div className="venture-details-looking__label">
              <span className="venture-details-section-number">
                {lookingNumber}
              </span>

              <span className="venture-details-eyebrow">
                Looking For
              </span>
            </div>

            <h2>
              The right relationships
              <br />
              can move a venture forward.
            </h2>

            <p>
              Continental Founders helps create pathways between ventures
              and people or institutions that can contribute meaningful
              expertise, relationships, markets, resources, and opportunity.
            </p>
          </div>

          <div className="venture-details-looking__list">
            {lookingFor.length > 0 ? (
              lookingFor.map(
                (item, index) => (
                  <div
                    key={`${item}-${index}`}
                    className="venture-details-looking__item"
                  >
                    <span>
                      {String(
                        index + 1
                      ).padStart(
                        2,
                        "0"
                      )}
                    </span>

                    <strong>
                      {item}
                    </strong>
                  </div>
                )
              )
            ) : (
              <div className="venture-details-looking__empty">
                Partnership and opportunity priorities will be added as the venture progresses.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ======================================================
          ECOSYSTEM
      ====================================================== */}

      <section className="venture-details-ecosystem">
        <div className="venture-details-container venture-details-ecosystem__grid">
          <div className="venture-details-ecosystem__content">
            <span className="venture-details-eyebrow venture-details-eyebrow--light">
              Continental Founders Ecosystem
            </span>

            <h2>
              Great ventures are
              <br />
              not built alone.
            </h2>

            <p>
              Continental Founders brings universities, professionals,
              mentors, investors, companies, and markets around ambitious
              founders.
            </p>
          </div>

          <div className="venture-details-ecosystem__items">
            <div>
              <GraduationCap
                size={22}
                aria-hidden="true"
              />
              <span>
                Universities
              </span>
            </div>

            <div>
              <BriefcaseBusiness
                size={22}
                aria-hidden="true"
              />
              <span>
                Industry
              </span>
            </div>

            <div>
              <Users
                size={22}
                aria-hidden="true"
              />
              <span>
                Mentors
              </span>
            </div>

            <div>
              <Coins
                size={22}
                aria-hidden="true"
              />
              <span>
                Investors
              </span>
            </div>

            <div>
              <Globe2
                size={22}
                aria-hidden="true"
              />
              <span>
                Markets
              </span>
            </div>

            <div>
              <MapPin
                size={22}
                aria-hidden="true"
              />
              <span>
                Opportunity
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          FINAL CTA
      ====================================================== */}

      <section className="venture-details-final">
        <div className="venture-details-container venture-details-final__grid">
          <div>
            <span className="venture-details-eyebrow">
              Connect
            </span>

            <h2>
              Interested in
              <br />
              {venture.name}?
            </h2>
          </div>

          <div className="venture-details-final__content">
            <p>
              Connect with Continental Founders to learn more about this
              venture and explore opportunities for collaboration,
              mentorship, partnership, market access, or investment
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

              {websiteUrl && (
                <a
                  href={websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
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