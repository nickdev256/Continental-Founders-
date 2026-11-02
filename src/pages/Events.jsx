import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ArrowRight,
  CalendarDays,
  Lightbulb,
  MapPin,
  RotateCw,
  Sprout,
  Users,
} from "lucide-react";

import { Link } from "react-router-dom";

import "./Events.css";


// ============================================================
// API
// ============================================================

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";


// ============================================================
// DATA
// Cards cycle through the site's gold, navy and blue accents.
// ============================================================

const FALLBACK_IMAGES = [
  "/assets/images/events/event-1.webp",
  "/assets/images/events/event-2.webp",
  "/assets/images/events/event-3.webp",
  "/assets/images/events/event-4.webp",
];

const TONES = ["gold", "navy", "blue"];

const pillars = [
  { icon: Users, title: "Meaningful Connections", color: "gold" },
  { icon: Lightbulb, title: "Practical Insights", color: "navy" },
  { icon: Sprout, title: "Real Opportunities", color: "blue" },
];


// ============================================================
// HELPERS
// ============================================================

function getEventDate(event) {
  return (
    event?.eventDate ||
    event?.event_date ||
    event?.startDate ||
    event?.start_date ||
    event?.date ||
    null
  );
}


function formatEventDate(value) {
  const empty = { day: "--", month: "---", year: "" };

  if (!value) return empty;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return empty;

  return {
    day: date.toLocaleDateString("en-US", { day: "2-digit" }),
    month: date
      .toLocaleDateString("en-US", { month: "short" })
      .toUpperCase(),
    year: String(date.getFullYear()),
  };
}


function getEventImage(event, index = 0) {
  const image =
    event?.imageUrl ||
    event?.image_url ||
    event?.image ||
    event?.coverImage ||
    event?.cover_image ||
    "";

  return image || FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
}


function getEventLocation(event) {
  return (
    event?.location ||
    event?.venue ||
    event?.city ||
    "Location to be announced"
  );
}


function getEventType(event) {
  return event?.type || event?.category || "Convening";
}


function getEventTitle(event) {
  return event?.title || "Continental Founders Event";
}


function getEventDescription(event) {
  return (
    event?.description ||
    event?.summary ||
    "A Continental Founders convening designed to connect people, ideas, and opportunities."
  );
}


function getEventSlug(event) {
  const slug = event?.slug;

  return typeof slug === "string" ? slug.trim() : "";
}


// ============================================================
// EVENTS PAGE
// ============================================================

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // ==========================================================
  // LOAD PUBLISHED EVENTS
  // ==========================================================

  const loadEvents = useCallback(async (signal) => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API_URL}/api/events/published`,
        {
          method: "GET",
          headers: { Accept: "application/json" },
          signal,
        }
      );

      const contentType = response.headers.get("content-type") || "";

      let result = {};

      if (contentType.includes("application/json")) {
        result = await response.json();
      } else {
        const text = await response.text();

        console.error("Unexpected events response:", text);

        throw new Error(
          "The events service returned an unexpected response."
        );
      }

      if (!response.ok) {
        throw new Error(
          result?.message ||
          result?.error ||
          "Unable to load events."
        );
      }

      const eventData = Array.isArray(result?.events)
        ? result.events
        : Array.isArray(result?.data)
          ? result.data
          : Array.isArray(result?.data?.events)
            ? result.data.events
            : [];

      setEvents(eventData);
    } catch (requestError) {
      if (requestError?.name === "AbortError") return;

      console.error("Events loading error:", requestError);

      setEvents([]);

      // A network failure only says "Failed to fetch"; show
      // visitors a plain sentence instead.
      setError(
        requestError instanceof TypeError || !requestError?.message
          ? "We could not load the events calendar at the moment. Please try again shortly."
          : requestError.message
      );
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);


  useEffect(() => {
    const controller = new AbortController();

    loadEvents(controller.signal);

    return () => controller.abort();
  }, [loadEvents]);


  // Reveal sections as they scroll into view. Anything already
  // above the fold (or skipped by a fast jump) is shown at once.
  const pageRef = useRef(null);

  useEffect(() => {
    const root = pageRef.current;

    if (
      !root ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return undefined;
    }

    root.classList.add("ev-page--reveal");

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


  function handleRetry() {
    loadEvents();
  }


  function scrollToEvents() {
    document
      .getElementById("events-calendar")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }


  // Swap a broken event photo for one of ours, once.
  function handleImageError(event, index) {
    const image = event.currentTarget;

    if (image.dataset.fallbackApplied === "true") return;

    image.dataset.fallbackApplied = "true";
    image.src = FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
  }


  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <main className="ev-page" ref={pageRef}>

      {/* ======================================================
          HERO
      ====================================================== */}

      <section className="ev-hero">

        <div className="ev-hero__media" aria-hidden="true">
          <img
            src="/assets/images/events/events-hero.webp"
            alt=""
            fetchPriority="high"
          />
        </div>

        <div className="ev-container">

          <div className="ev-hero__content">

            <span className="ev-eyebrow ev-eyebrow--light">
              Events & Convenings
            </span>

            <h1>
              <span>Where relationships</span>{" "}
              <span>
                find a <em>room to grow.</em>
              </span>
            </h1>

            <p>
              Curated conversations, roundtables,
              forums, and knowledge exchange designed
              around practical institutional questions.
            </p>

            <button
              type="button"
              className="ev-button ev-button--gold"
              onClick={scrollToEvents}
            >
              Explore our events
              <ArrowRight size={18} aria-hidden="true" />
            </button>

          </div>

        </div>

      </section>


      {/* ======================================================
          WHY CONVENE
      ====================================================== */}

      <section className="ev-section ev-intro">

        <div className="ev-container ev-intro__grid">

          <div className="ev-intro__heading" data-reveal>
            <span className="ev-eyebrow">Why Convene</span>

            <h2>
              The right conversation can be the beginning
              of a durable partnership.
            </h2>
          </div>

          <div className="ev-intro__content" data-reveal>
            <p>
              Our convenings are designed to bring relevant
              people into focused conversations where
              opportunities can be identified, tested,
              and moved toward action.
            </p>

            <ul className="ev-pillars">
              {pillars.map(({ icon: Icon, title, color }) => (
                <li
                  key={title}
                  className={`ev-pillar ev-tone--${color}`}
                >
                  <span className="ev-icon">
                    <Icon size={22} aria-hidden="true" />
                  </span>

                  <h3>{title}</h3>
                </li>
              ))}
            </ul>
          </div>

        </div>

      </section>


      {/* ======================================================
          EVENTS CALENDAR
      ====================================================== */}

      <section
        className="ev-section ev-section--soft ev-calendar"
        id="events-calendar"
      >

        <div className="ev-container ev-calendar__grid">

          <div className="ev-calendar__main">

            <header className="ev-calendar__header" data-reveal>
              <div>
                <span className="ev-eyebrow">Calendar</span>
                <h2>Upcoming and planned programming.</h2>
              </div>

              {events.length > 0 && (
                <button
                  type="button"
                  className="ev-button ev-button--outline"
                  onClick={scrollToEvents}
                >
                  View all events
                  <ArrowRight size={16} aria-hidden="true" />
                </button>
              )}
            </header>


            {/* Loading: placeholder cards in the shape of real ones */}

            {loading && (
              <div
                className="ev-grid"
                aria-live="polite"
                aria-busy="true"
              >
                <span className="ev-visually-hidden">
                  Loading upcoming events...
                </span>

                {[0, 1].map((item) => (
                  <div
                    key={item}
                    className="ev-card ev-card--skeleton"
                    aria-hidden="true"
                  >
                    <div className="ev-card__media" />

                    <div className="ev-card__body">
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
              <div
                className="ev-status ev-status--error"
                role="alert"
              >
                <span className="ev-status__icon">
                  <CalendarDays size={28} aria-hidden="true" />
                </span>

                <span className="ev-eyebrow">
                  Calendar Unavailable
                </span>

                <h3>We could not load the event calendar.</h3>

                <p>{error}</p>

                <button
                  type="button"
                  className="ev-button ev-button--navy"
                  onClick={handleRetry}
                >
                  <RotateCw size={16} aria-hidden="true" />
                  Try again
                </button>
              </div>
            )}


            {/* Empty */}

            {!loading && !error && events.length === 0 && (
              <div className="ev-status">
                <span className="ev-status__icon">
                  <CalendarDays size={28} aria-hidden="true" />
                </span>

                <span className="ev-eyebrow">Coming Soon</span>

                <h3>New convenings are being prepared.</h3>

                <p>
                  Upcoming Continental Founders events
                  and programming will appear here as
                  they are published.
                </p>
              </div>
            )}


            {/* Event cards */}

            {!loading && !error && events.length > 0 && (
              <div className="ev-grid">
                {events.map((event, index) => {
                  const rawDate = getEventDate(event);
                  const date = formatEventDate(rawDate);
                  const title = getEventTitle(event);
                  const slug = getEventSlug(event);
                  const image = getEventImage(event, index);

                  const eventPath = slug
                    ? `/events/${encodeURIComponent(slug)}`
                    : "";

                  return (
                    <article
                      key={event?.id || slug || `${title}-${index}`}
                      className={`ev-card ev-tone--${TONES[index % TONES.length]}`}
                    >

                      <div className="ev-card__media">
                        {/* Blurred copy fills the frame so posters
                            and flyers are never cropped */}
                        <img
                          className="ev-card__backdrop"
                          src={image}
                          alt=""
                          aria-hidden="true"
                          loading="lazy"
                          decoding="async"
                          onError={(imageEvent) =>
                            handleImageError(imageEvent, index)
                          }
                        />

                        <img
                          className="ev-card__image"
                          src={image}
                          alt={title}
                          loading="lazy"
                          decoding="async"
                          onError={(imageEvent) =>
                            handleImageError(imageEvent, index)
                          }
                        />

                        <div
                          className="ev-card__date"
                          aria-label={
                            rawDate
                              ? `Event date: ${date.day} ${date.month} ${date.year}`
                              : "Event date to be announced"
                          }
                        >
                          <strong>{date.day}</strong>
                          <span>{date.month}</span>
                          <small>{date.year}</small>
                        </div>
                      </div>

                      <div className="ev-card__body">
                        <span className="ev-card__type">
                          {getEventType(event)}
                        </span>

                        <h3>{title}</h3>

                        <p className="ev-card__location">
                          <MapPin size={16} aria-hidden="true" />
                          <span>{getEventLocation(event)}</span>
                        </p>

                        <p className="ev-card__text">
                          {getEventDescription(event)}
                        </p>

                        {eventPath && (
                          <Link
                            to={eventPath}
                            className="ev-card__link"
                            aria-label={`Learn more about ${title}`}
                          >
                            Learn more
                            <ArrowRight size={16} aria-hidden="true" />
                          </Link>
                        )}
                      </div>

                    </article>
                  );
                })}
              </div>
            )}

          </div>


          <figure className="ev-calendar__photo" data-reveal>
            <img
              src="/assets/z.webp"
              alt="Continental Founders convening"
              loading="lazy"
              decoding="async"
            />
          </figure>

        </div>

      </section>


      {/* ======================================================
          CTA
      ====================================================== */}

      <section className="ev-cta">

        <div className="ev-container">

          <div className="ev-cta__card" data-reveal>

            <img
              src="/assets/images/events/events-cta.webp"
              alt=""
              loading="lazy"
            />

            <div className="ev-cta__content">
              <span className="ev-eyebrow ev-eyebrow--light">
                Host or Collaborate
              </span>

              <h2>
                Have a convening that should be in the room?
              </h2>

              <p>
                We welcome conversations with institutions
                and organizations interested in co-creating
                thoughtful forums and knowledge exchange
                opportunities.
              </p>

              <Link
                to="/contact"
                className="ev-button ev-button--gold"
              >
                Start a conversation
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </div>

            <p className="ev-cta__mark">
              <span>A stronger</span>
              <span>Africa</span>
              <span>together</span>
            </p>

          </div>

        </div>

      </section>

    </main>
  );
}
