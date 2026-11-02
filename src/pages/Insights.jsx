import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Clock,
  FlaskConical,
  GraduationCap,
  Landmark,
  Lightbulb,
  Mail,
  Newspaper,
  Rocket,
  RotateCw,
  Search,
  TrendingUp,
  UserRound,
  X,
} from "lucide-react";

import { Link } from "react-router-dom";

import "./Insights.css";


/* ============================================================
   CONTINENTAL FOUNDERS
   PUBLIC INSIGHTS PAGE
============================================================ */

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";

// Category tags cycle through the brand accents.
const TONES = ["gold", "navy", "blue"];

// Cards shown at first, and added by each "Load more".
const PAGE_SIZE = 9;

// The categories editors pick from in the admin (Admin > Insights),
// minus "Other". Keep these names in step with that list: a card
// filters the page by matching its title to an insight's category.
const topics = [
  {
    icon: Lightbulb,
    title: "Founder Perspectives",
    text: "Founders on building, scaling and leading across two continents.",
  },
  {
    icon: FlaskConical,
    title: "Research",
    text: "Evidence and analysis on entrepreneurship in Africa and the United States.",
  },
  {
    icon: TrendingUp,
    title: "Markets",
    text: "Trade, market access and the opportunities linking Africa and the U.S.",
  },
  {
    icon: GraduationCap,
    title: "University Partnerships",
    text: "How universities help grow founders, research and new ventures.",
  },
  {
    icon: Landmark,
    title: "Investment",
    text: "Capital, investors and what makes a venture ready for funding.",
  },
  {
    icon: Rocket,
    title: "Innovation",
    text: "New ideas, technologies and models shaping African enterprise.",
  },
  {
    icon: Newspaper,
    title: "Continental Founders News",
    text: "Announcements and updates from across the Continental Founders network.",
  },
];


/* ============================================================
   HELPERS
============================================================ */

function formatDate(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}


// About 200 words a minute; the content may be HTML from the editor.
function readingTime(content) {
  if (typeof content !== "string" || !content.trim()) return "";

  const words = content
    .replace(/<[^>]*>/g, " ")
    .trim()
    .split(/\s+/).length;

  return `${Math.max(1, Math.round(words / 200))} min read`;
}


function readInsight(insight) {
  return {
    author: insight?.author || insight?.author_name || "",
    minutes: readingTime(insight?.content),
    slug: insight?.slug || "",
    title: insight?.title || "Untitled Insight",
    excerpt:
      insight?.excerpt ||
      "Read the latest perspective from Continental Founders.",
    category: insight?.category || "Perspective",
    image:
      insight?.image ||
      insight?.imageUrl ||
      insight?.image_url ||
      null,
    date: formatDate(
      insight?.publishedAt ||
      insight?.published_at ||
      insight?.createdAt ||
      insight?.created_at
    ),
  };
}


/* ============================================================
   INSIGHT CARD
============================================================ */

function InsightCard({ insight, tone, featured = false }) {
  const { slug, title, excerpt, category, image, date, author, minutes } =
    readInsight(insight);

  const path = `/insights/${slug}`;

  return (
    <article
      className={`in-card in-tone--${tone}${featured ? " in-card--featured" : ""}`}
    >

      <Link
        to={path}
        className="in-card__media"
        aria-label={`Read ${title}`}
        tabIndex={-1}
      >
        {image ? (
          <img src={image} alt="" loading="lazy" />
        ) : (
          <div className="in-card__fallback">
            <BookOpen size={featured ? 44 : 34} strokeWidth={1.4} aria-hidden="true" />
            <span>Continental Founders</span>
          </div>
        )}
      </Link>

      <div className="in-card__body">

        <div className="in-card__meta">
          <span className="in-card__category">{category}</span>

          {date && (
            <span className="in-card__date">
              <CalendarDays size={14} aria-hidden="true" />
              {date}
            </span>
          )}
        </div>

        <h3>
          <Link to={path}>{title}</Link>
        </h3>

        <p>{excerpt}</p>

        {(author || minutes) && (
          <div className="in-card__byline">
            {author && (
              <span>
                <UserRound size={14} aria-hidden="true" />
                {author}
              </span>
            )}

            {minutes && (
              <span>
                <Clock size={14} aria-hidden="true" />
                {minutes}
              </span>
            )}
          </div>
        )}

        <Link className="in-card__link" to={path}>
          Read insight
          <ArrowRight size={16} aria-hidden="true" />
        </Link>

      </div>

    </article>
  );
}


export default function Insights() {

  /* ==========================================================
     STATE
  ========================================================== */

  const [insights, setInsights] = useState([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Bumped by "Try again" to run the request once more.
  const [attempt, setAttempt] = useState(0);

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const [email, setEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeMessage, setSubscribeMessage] = useState("");
  const [subscribeError, setSubscribeError] = useState("");


  /* ==========================================================
     LOAD PUBLISHED INSIGHTS
  ========================================================== */

  useEffect(() => {
    let active = true;

    async function loadInsights() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_BASE_URL}/api/insights/published`,
          {
            method: "GET",
            headers: { Accept: "application/json" },
          }
        );

        const contentType =
          response.headers.get("content-type") || "";

        if (!response.ok) {
          throw new Error(
            `Unable to load insights. Status: ${response.status}`
          );
        }

        if (!contentType.includes("application/json")) {
          const responseText = await response.text();

          console.error(
            "Expected JSON but received:",
            responseText.slice(0, 200)
          );

          throw new Error("The server returned an invalid response.");
        }

        const data = await response.json();

        if (!active) return;

        const items = Array.isArray(data)
          ? data
          : Array.isArray(data.insights)
            ? data.insights
            : [];

        // Extra protection: the public page shows published content only.
        const publishedItems = items.filter(
          (item) =>
            String(item.status || "published")
              .trim()
              .toLowerCase() === "published"
        );

        setInsights(publishedItems);
      } catch (err) {
        if (!active) return;

        console.error("Insights loading error:", err);

        setError(
          "We could not load insights at the moment. Please try again shortly."
        );
      } finally {
        if (active) setLoading(false);
      }
    }

    loadInsights();

    return () => {
      active = false;
    };
  }, [attempt]);


  /* ==========================================================
     CATEGORIES
  ========================================================== */

  const categories = useMemo(() => {
    const uniqueCategories = insights
      .map((item) => item.category)
      .filter(Boolean);

    return ["All", ...new Set(uniqueCategories)];
  }, [insights]);


  /* ==========================================================
     SEARCH + FILTER
  ========================================================== */

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return insights.filter((item) => {
      const categoryMatch =
        category === "All" || item.category === category;

      const searchableText = [
        item.title,
        item.excerpt,
        item.category,
        item.author,
        item.author_name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return categoryMatch && (!q || searchableText.includes(q));
    });
  }, [insights, query, category]);


  // The newest insight leads the page when nothing is filtered.
  const isFiltering = query.trim() !== "" || category !== "All";
  const featured = !isFiltering && filtered.length > 2 ? filtered[0] : null;
  const listItems = featured ? filtered.slice(1) : filtered;
  const gridItems = listItems.slice(0, visibleCount);
  const remaining = listItems.length - gridItems.length;

  // A new search or category starts again from the first page.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [query, category]);

  // Each category keeps the same colour wherever it appears.
  const toneFor = (item) => {
    const index = categories.indexOf(item?.category);
    return TONES[(index > 0 ? index - 1 : 0) % TONES.length];
  };

  // Never show a bare "0 insights available".
  let headingText = "Latest insights";

  if (!loading && !error) {
    if (insights.length === 0) {
      headingText = "New insights are on the way.";
    } else if (filtered.length === 0) {
      headingText = "No matching insights.";
    } else {
      headingText = `${filtered.length} ${filtered.length === 1 ? "insight" : "insights"} available`;
    }
  }

  function clearFilters() {
    setQuery("");
    setCategory("All");
  }


  // A topic card filters the list once the backend has insights
  // in that category.
  const topicCounts = useMemo(() => {
    const counts = {};

    insights.forEach((item) => {
      const name = String(item.category || "").trim().toLowerCase();
      counts[name] = (counts[name] || 0) + 1;
    });

    return counts;
  }, [insights]);

  function categoryForTopic(title) {
    return categories.find(
      (item) =>
        item !== "All" &&
        String(item).trim().toLowerCase() === title.toLowerCase()
    );
  }

  function showTopic(match) {
    setQuery("");
    setCategory(match);

    document
      .getElementById("insights-list")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }


  /* ==========================================================
     NEWSLETTER
     Same endpoint and messages as the footer signup.
  ========================================================== */

  async function handleSubscribe(event) {
    event.preventDefault();

    const cleanEmail = email.trim().toLowerCase();

    setSubscribeMessage("");

    if (!cleanEmail) {
      setSubscribeError("Please enter your email address.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setSubscribeError("Please enter a valid email address.");
      return;
    }

    try {
      setSubscribing(true);
      setSubscribeError("");

      const response = await fetch(
        `${API_BASE_URL}/api/newsletter/subscribe`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: cleanEmail }),
        }
      );

      let result = {};

      try {
        result = await response.json();
      } catch {
        result = {};
      }

      if (!response.ok) {
        throw new Error(
          result?.message ||
          "We could not complete your subscription."
        );
      }

      setSubscribeMessage(
        result?.message ||
        "Thank you for subscribing to Continental Founders."
      );
      setEmail("");
    } catch (subscribeFailure) {
      console.error("Newsletter subscription error:", subscribeFailure);

      setSubscribeError(
        subscribeFailure instanceof TypeError
          ? "We could not connect to the subscription service. Please try again shortly."
          : subscribeFailure?.message ||
            "We could not complete your subscription. Please try again."
      );
    } finally {
      setSubscribing(false);
    }
  }


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

    root.classList.add("in-page--reveal");

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
    <main className="in-page" ref={pageRef}>

      {/* ======================================================
          HERO
      ====================================================== */}

      <section className="in-hero">

        <div className="in-hero__media" aria-hidden="true">
          <img src="/assets/kk.webp" alt="" fetchPriority="high" />
        </div>

        <div className="in-container in-hero__inner">

          <div className="in-hero__content">
            <span className="in-eyebrow in-eyebrow--light">
              Insights
            </span>

            <h1>
              Ideas for a more <em>connected world.</em>
            </h1>
          </div>

          <p className="in-hero__aside">
            Perspectives on partnership,
            higher education, research,
            knowledge exchange,
            entrepreneurship, and
            cross-continental collaboration.
          </p>

        </div>

      </section>


      {/* ======================================================
          INSIGHTS
      ====================================================== */}

      <section className="in-section" id="insights-list">

        <div className="in-container">

          <header className="in-heading" data-reveal>
            <div>
              <span className="in-eyebrow">Perspective</span>

              <h2>{headingText}</h2>
            </div>

            <p>
              Explore organizational stories, research perspectives,
              partnership lessons, founder experiences, and field notes
              from the Continental Founders network.
            </p>
          </header>


          {/* Search + filters */}

          {insights.length > 0 && (
          <div className="in-controls">

            <label className="in-search">
              <span className="in-visually-hidden">Search insights</span>

              <Search size={18} aria-hidden="true" />

              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search insights"
                aria-label="Search insights"
              />
            </label>

            {categories.length > 1 && (
              <div
                className="in-filters"
                role="group"
                aria-label="Filter by category"
              >
                {categories.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={category === item ? "is-active" : ""}
                    aria-pressed={category === item}
                    onClick={() => setCategory(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}

          </div>
          )}


          {/* Loading: placeholder cards in the shape of real ones */}

          {loading && (
            <div className="in-grid" aria-live="polite" aria-busy="true">
              <span className="in-visually-hidden">Loading insights...</span>

              {[0, 1, 2].map((item) => (
                <div
                  key={item}
                  className="in-card in-card--skeleton"
                  aria-hidden="true"
                >
                  <div className="in-card__media" />

                  <div className="in-card__body">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              ))}
            </div>
          )}


          {/* Error */}

          {!loading && error && (
            <div className="in-status in-status--error" role="alert">
              <span className="in-status__icon">
                <BookOpen size={28} aria-hidden="true" />
              </span>

              <p>{error}</p>

              <button
                type="button"
                className="in-button"
                onClick={() => setAttempt((count) => count + 1)}
              >
                <RotateCw size={16} aria-hidden="true" />
                Try again
              </button>
            </div>
          )}


          {/* Content */}

          {!loading && !error && (
            filtered.length > 0 ? (
              <>
                {featured && (
                  <InsightCard
                    insight={featured}
                    tone={toneFor(featured)}
                    featured
                  />
                )}

                {gridItems.length > 0 && (
                  <div className="in-grid">
                    {gridItems.map((insight) => (
                      <InsightCard
                        key={insight.id || insight.slug}
                        insight={insight}
                        tone={toneFor(insight)}
                      />
                    ))}
                  </div>
                )}

                {remaining > 0 && (
                  <div className="in-more">
                    <button
                      type="button"
                      className="in-button in-button--outline"
                      onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                    >
                      Load more insights
                      <span className="in-more__count">{remaining}</span>
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="in-status">
                <span className="in-status__icon">
                  <BookOpen size={28} aria-hidden="true" />
                </span>

                <p>
                  {insights.length === 0
                    ? "No published insights are available yet."
                    : "No insights match your search. Try another keyword or category."}
                </p>

                {insights.length > 0 && (
                  <button
                    type="button"
                    className="in-button"
                    onClick={clearFilters}
                  >
                    <X size={16} aria-hidden="true" />
                    Clear search
                  </button>
                )}
              </div>
            )
          )}

        </div>

      </section>


      {/* ======================================================
          TOPICS
      ====================================================== */}

      <section className="in-section in-section--white in-topics">

        <div className="in-container">

          <header className="in-heading" data-reveal>
            <div>
              <span className="in-eyebrow">What We Write About</span>
              <h2>Explore by topic.</h2>
            </div>

            <p>
              Every insight comes back to how people, institutions and
              markets work together across Africa and the United States.
            </p>
          </header>

          <ul className="in-topics__grid" data-reveal>
            {topics.map(({ icon: Icon, title, text }, index) => {
              const match = categoryForTopic(title);
              const count = topicCounts[title.toLowerCase()] || 0;
              const tone = TONES[index % TONES.length];

              const inner = (
                <>
                  <span className="in-topic__icon">
                    <Icon size={22} aria-hidden="true" />
                  </span>

                  <span className="in-topic__text">
                    <strong>{title}</strong>
                    <span>{text}</span>

                    {!loading && !error && (
                      <small className={match ? "" : "is-soon"}>
                        {match
                          ? `${count} ${count === 1 ? "insight" : "insights"}`
                          : "Coming soon"}
                      </small>
                    )}
                  </span>

                  {match && (
                    <ArrowRight
                      className="in-topic__arrow"
                      size={18}
                      aria-hidden="true"
                    />
                  )}
                </>
              );

              return (
                <li key={title} className={`in-tone--${tone}`}>
                  {match ? (
                    <button
                      type="button"
                      className="in-topic"
                      onClick={() => showTopic(match)}
                      aria-label={`Show ${title} insights`}
                    >
                      {inner}
                    </button>
                  ) : (
                    <div className="in-topic">{inner}</div>
                  )}
                </li>
              );
            })}
          </ul>

        </div>

      </section>


      {/* ======================================================
          SUBSCRIBE
      ====================================================== */}

      <section className="in-subscribe">

        <div className="in-container">

          <div className="in-subscribe__card" data-reveal>

            <div className="in-subscribe__content">
              <span className="in-eyebrow in-eyebrow--light">
                Stay Informed
              </span>

              <h2>Get new insights in your inbox.</h2>

              <p>
                Be the first to read new perspectives, research and field
                notes from the Continental Founders network.
              </p>
            </div>

            <form
              className="in-subscribe__form"
              onSubmit={handleSubscribe}
              noValidate
            >
              <label className="in-subscribe__field">
                <span className="in-visually-hidden">Email address</span>

                <Mail size={18} aria-hidden="true" />

                <input
                  type="email"
                  name="insightsEmail"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setSubscribeError("");
                  }}
                  placeholder="Your email address"
                  autoComplete="email"
                  aria-invalid={Boolean(subscribeError)}
                  aria-describedby={
                    subscribeError
                      ? "insights-subscribe-error"
                      : subscribeMessage
                        ? "insights-subscribe-success"
                        : undefined
                  }
                />
              </label>

              <button
                type="submit"
                className="in-button in-button--gold"
                disabled={subscribing}
              >
                {subscribing ? "Subscribing..." : "Subscribe"}
                {!subscribing && <ArrowRight size={18} aria-hidden="true" />}
              </button>

              {subscribeMessage && (
                <p
                  id="insights-subscribe-success"
                  className="in-subscribe__note"
                  role="status"
                >
                  {subscribeMessage}
                </p>
              )}

              {subscribeError && (
                <p
                  id="insights-subscribe-error"
                  className="in-subscribe__note in-subscribe__note--error"
                  role="alert"
                >
                  {subscribeError}
                </p>
              )}
            </form>

          </div>

        </div>

      </section>

    </main>
  );
}
