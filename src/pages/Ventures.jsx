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
  BriefcaseBusiness,
  Coins,
  Globe2,
  GraduationCap,
  RefreshCw,
  Rocket,
  Search,
  Users,
} from "lucide-react";

import "./Ventures.css";

/* ============================================================
   API
============================================================ */

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

/* ============================================================
   CONTENT
============================================================ */

const journey = [
  { title: "Potential", text: "Ideas and ambition." },
  { title: "Preparation", text: "Knowledge and strategy." },
  { title: "Execution", text: "Building and testing." },
  { title: "Evidence", text: "Validation and traction." },
  { title: "Opportunity", text: "Markets and growth." },
];

const ecosystem = [
  { label: "Universities", icon: GraduationCap },
  { label: "Industry", icon: BriefcaseBusiness },
  { label: "Mentors", icon: Users },
  { label: "Investors", icon: Coins },
  { label: "Markets", icon: Globe2 },
];

/* ============================================================
   HELPERS
   The API has used both camelCase and snake_case fields.
============================================================ */

function getLogo(venture) {
  return (
    venture?.logoUrl ||
    venture?.logo_url ||
    venture?.logo ||
    ""
  );
}

function getFounderNames(venture) {
  const founders = Array.isArray(venture?.founders)
    ? venture.founders
    : [];

  if (founders.length > 0) {
    return founders
      .map((founder) => founder?.name)
      .filter(Boolean)
      .join(", ");
  }

  return venture?.founder || "";
}

function getDescription(venture) {
  return venture?.description || venture?.tagline || "";
}

function getSector(venture) {
  return venture?.sector || "Other";
}

function getStatus(venture) {
  return String(venture?.status || "").trim().toLowerCase();
}

function getInitials(name) {
  return String(name || "Venture")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function VentureLogo({ venture }) {
  const logo = getLogo(venture);
  const [failed, setFailed] = useState(false);

  if (logo && !failed) {
    return (
      <img
        src={logo}
        alt={venture?.name ? `${venture.name} logo` : "Venture logo"}
        loading="lazy"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <span className="vn-card__initials" aria-hidden="true">
      {getInitials(venture?.name)}
    </span>
  );
}

/* ============================================================
   SCROLL REVEAL
   Content stays visible if scripts fail or motion is reduced.
============================================================ */

function useReveal(ref, deps) {
  useEffect(() => {
    const root = ref.current;

    if (
      !root ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return undefined;
    }

    root.classList.add("vn-page--reveal");

    let pending = [...root.querySelectorAll("[data-reveal]:not(.is-visible)")];
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/* ============================================================
   VENTURES
============================================================ */

export default function Ventures() {
  const [ventures, setVentures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const pageRef = useRef(null);

  const loadVentures = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/ventures`, {
        method: "GET",
        headers: { Accept: "application/json" },
      });

      const contentType = response.headers.get("content-type") || "";

      if (!contentType.includes("application/json")) {
        throw new Error(
          "The ventures service returned an unexpected response."
        );
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message || result?.error || "Unable to load ventures."
        );
      }

      const records = Array.isArray(result?.ventures)
        ? result.ventures
        : Array.isArray(result?.data)
          ? result.data
          : Array.isArray(result?.data?.ventures)
            ? result.data.ventures
            : [];

      setVentures(records);
    } catch (loadError) {
      console.error("Public ventures error:", loadError);
      setVentures([]);
      setError(loadError?.message || "Unable to load ventures.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVentures();
  }, [loadVentures]);

  // The public API should only return published records;
  // this stays as a safety check.
  const publishedVentures = useMemo(
    () =>
      ventures.filter((venture) => {
        const status = getStatus(venture);
        return !status || status === "published";
      }),
    [ventures]
  );

  const categories = useMemo(() => {
    const sectors = Array.from(
      new Set(publishedVentures.map(getSector).filter(Boolean))
    ).sort((first, second) => first.localeCompare(second));

    return ["All", ...sectors];
  }, [publishedVentures]);

  useEffect(() => {
    if (!categories.includes(activeCategory)) {
      setActiveCategory("All");
    }
  }, [categories, activeCategory]);

  const filteredVentures = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return publishedVentures.filter((venture) => {
      const sector = getSector(venture);

      const matchesCategory =
        activeCategory === "All" || sector === activeCategory;

      const searchableText = [
        venture?.name,
        venture?.country,
        sector,
        getFounderNames(venture),
        venture?.stage,
        venture?.tagline,
        getDescription(venture),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesCategory && (!query || searchableText.includes(query));
    });
  }, [publishedVentures, activeCategory, searchTerm]);

  function clearFilters() {
    setActiveCategory("All");
    setSearchTerm("");
  }

  useReveal(pageRef, [loading]);

  const hasVentures = publishedVentures.length > 0;

  return (
    <main className="vn-page" ref={pageRef}>
      {/* ======================================================
          HERO
      ====================================================== */}

      <section className="vn-hero">
        <div className="vn-hero__media" aria-hidden="true">
          <img src="/assets/venture.webp" alt="" fetchPriority="high" />
        </div>

        <div className="vn-container vn-hero__inner">
          <div className="vn-hero__content">
            <span className="vn-eyebrow vn-eyebrow--light">
              Continental Fellows
            </span>

            <h1>
              Meet the Founders building <em>what comes next.</em>
            </h1>

            <p>
              A growing community of founders building ambitious
              companies across Africa and the global diaspora.
            </p>

            <a href="#ventures" className="vn-button vn-button--gold">
              Explore Founders
              <ArrowRight size={18} aria-hidden="true" />
            </a>
          </div>

          <aside className="vn-hero__belief">
            <span className="vn-eyebrow vn-eyebrow--light">Our belief</span>

            <strong>
              Talent is everywhere.
              <span> Access is not.</span>
            </strong>

            <p>
              Connecting promising founders with knowledge,
              relationships, markets, and opportunity.
            </p>
          </aside>
        </div>
      </section>

      {/* ======================================================
          DIRECTORY
      ====================================================== */}

      <section id="ventures" className="vn-section vn-directory">
        <div className="vn-container">
          <header className="vn-heading">
            <span className="vn-eyebrow">Our Founders</span>

            <h2>Ambitious companies. Founders moving forward.</h2>
          </header>

          {loading && (
            <div className="vn-state" aria-live="polite">
              <span className="vn-loader" aria-hidden="true" />
              <h3>Loading ventures…</h3>
              <p>Please wait while we load the founders directory.</p>
            </div>
          )}

          {!loading && error && (
            <div className="vn-state" role="alert">
              <span className="vn-state__icon">
                <Building2 size={28} aria-hidden="true" />
              </span>
              <h3>Ventures are temporarily unavailable.</h3>
              <p>Please check your connection and try again.</p>
              <button
                type="button"
                className="vn-button vn-button--navy"
                onClick={loadVentures}
              >
                <RefreshCw size={16} aria-hidden="true" />
                Try again
              </button>
            </div>
          )}

          {!loading && !error && !hasVentures && (
            <div className="vn-state vn-state--soon">
              <span className="vn-state__icon">
                <Rocket size={28} aria-hidden="true" />
              </span>
              <h3>Our first ventures will be featured here soon.</h3>
              <p>
                Ventures from the Continental Founders Fellowship will
                appear here as they join. Founders can apply to the next
                cohort today.
              </p>
              <div className="vn-state__actions">
                <Link to="/cfcv" className="vn-button vn-button--gold">
                  Explore the fellowship
                  <ArrowRight size={17} aria-hidden="true" />
                </Link>
                <Link to="/find-your-lane" className="vn-button vn-button--outline">
                  Find your lane
                </Link>
              </div>
            </div>
          )}

          {!loading && !error && hasVentures && (
            <>
              <div className="vn-toolbar">
                <div
                  className="vn-filters"
                  role="group"
                  aria-label="Filter ventures by sector"
                >
                  {categories.map((category) => (
                    <button
                      key={category}
                      type="button"
                      className={`vn-filter${
                        activeCategory === category ? " is-active" : ""
                      }`}
                      aria-pressed={activeCategory === category}
                      onClick={() => setActiveCategory(category)}
                    >
                      {category}
                    </button>
                  ))}
                </div>

                <label className="vn-search">
                  <Search size={18} aria-hidden="true" />
                  <input
                    type="search"
                    value={searchTerm}
                    placeholder="Search ventures"
                    aria-label="Search ventures"
                    onChange={(event) => setSearchTerm(event.target.value)}
                  />
                </label>
              </div>

              {filteredVentures.length > 0 ? (
                <ul className="vn-grid">
                  {filteredVentures.map((venture, index) => {
                    const founderNames = getFounderNames(venture);

                    return (
                      <li
                        key={venture.id || venture.slug || `${venture.name}-${index}`}
                        className="vn-card"
                      >
                        <div className="vn-card__top">
                          <span className="vn-card__logo">
                            <VentureLogo venture={venture} />
                          </span>

                          <span className="vn-card__sector">
                            {getSector(venture)}
                          </span>
                        </div>

                        <h3>{venture?.name || "Venture"}</h3>

                        {venture?.country && (
                          <p className="vn-card__location">
                            <Globe2 size={14} aria-hidden="true" />
                            {venture.country}
                          </p>
                        )}

                        <p className="vn-card__description">
                          {getDescription(venture) ||
                            "Venture profile coming soon."}
                        </p>

                        <dl className="vn-card__meta">
                          <div>
                            <dt>Founder</dt>
                            <dd>{founderNames || "Founder profile"}</dd>
                          </div>

                          <div>
                            <dt>Stage</dt>
                            <dd>{venture?.stage || "Not specified"}</dd>
                          </div>
                        </dl>

                        {venture?.slug && (
                          <Link
                            to={`/ventures/${venture.slug}`}
                            className="vn-card__link"
                          >
                            View founders
                            <ArrowRight size={16} aria-hidden="true" />
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="vn-state">
                  <span className="vn-state__icon">
                    <Search size={26} aria-hidden="true" />
                  </span>
                  <h3>No founders found.</h3>
                  <p>No founders match the selected sector or search.</p>
                  <button
                    type="button"
                    className="vn-button vn-button--navy"
                    onClick={clearFilters}
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ======================================================
          JOURNEY
      ====================================================== */}

      <section className="vn-section vn-journey">
        <div className="vn-container">
          <header className="vn-heading" data-reveal>
            <span className="vn-eyebrow">The journey</span>
            <h2>From potential to opportunity.</h2>
          </header>

          <ol className="vn-steps" data-reveal>
            {journey.map((step, index) => (
              <li key={step.title}>
                <span className="vn-steps__number" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ======================================================
          ECOSYSTEM
      ====================================================== */}

      <section className="vn-section vn-ecosystem">
        <div className="vn-container vn-ecosystem__grid">
          <div className="vn-ecosystem__content" data-reveal>
            <span className="vn-eyebrow">The ecosystem</span>

            <h2>Great founders are not built alone.</h2>

            <p>
              Continental Founders brings together the people and
              institutions that can help founders move forward.
            </p>

            <Link to="/our-model" className="vn-text-link">
              Explore our model
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>

          <div className="vn-network" data-reveal>
            <span className="vn-network__center">Founders</span>

            <ul>
              {ecosystem.map(({ label, icon: Icon }) => (
                <li key={label}>
                  <Icon size={20} aria-hidden="true" />
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ======================================================
          FINAL CTA
      ====================================================== */}

      <section className="vn-section vn-final">
        <div className="vn-container">
          <div className="vn-final__card" data-reveal>
            <div>
              <span className="vn-eyebrow vn-eyebrow--light">Build with us</span>
              <h2>Be part of what comes next.</h2>
            </div>

            <div className="vn-final__content">
              <p>
                Whether you are a founder, university, investor, business,
                sponsor, or strategic partner, there is a place for you in
                the Continental Founders ecosystem.
              </p>

              <div className="vn-final__actions">
                <Link to="/contact" className="vn-button vn-button--gold">
                  Start a conversation
                  <ArrowRight size={17} aria-hidden="true" />
                </Link>

                <Link to="/our-model" className="vn-button vn-button--ghost">
                  Our model
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
