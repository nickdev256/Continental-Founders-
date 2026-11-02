import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CalendarDays,
  Clock3,
  ExternalLink,
  MapPin,
  Quote,
  TrendingUp,
  Users,
} from "lucide-react";

import "./EventDetails.css";


/* ============================================================
   API
============================================================ */

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";


/* ============================================================
   CONTENT
============================================================ */

const keywords = ["People", "Ideas", "Capital", "Impact"];

const purposes = [
  {
    icon: Users,
    title: "Connect",
    text: "Bring founders, institutions, professionals and partners into the same conversation.",
    tone: "gold",
  },
  {
    icon: BookOpen,
    title: "Exchange",
    text: "Create room for useful knowledge, experience and practical insight to move across networks.",
    tone: "navy",
  },
  {
    icon: TrendingUp,
    title: "Act",
    text: "Move promising conversations toward relationships, collaboration and opportunity.",
    tone: "blue",
  },
];


/* ============================================================
   HELPERS
============================================================ */

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


function getEventEndDate(event) {
  return event?.endDate || event?.end_date || null;
}


function getEventImage(event) {
  return (
    event?.imageUrl ||
    event?.image_url ||
    event?.image ||
    event?.coverImage ||
    event?.cover_image ||
    "/assets/images/events/event-1.webp"
  );
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
  return (
    event?.type ||
    event?.category ||
    "Continental Founders Convening"
  );
}


function getEventDescription(event) {
  return event?.description || event?.summary || "";
}


function getEventContent(event) {
  return (
    event?.content ||
    event?.longDescription ||
    event?.long_description ||
    event?.details ||
    event?.description ||
    event?.summary ||
    ""
  );
}


// A separate time field wins; otherwise use the time saved with the
// date (the admin form stores both together), unless it is midnight.
function getEventTime(event) {
  const explicit = event?.time || event?.eventTime || event?.event_time;

  if (explicit) return explicit;

  const value = getEventDate(event);

  if (typeof value !== "string" || !value.includes("T")) return "";

  const date = new Date(value);

  if (
    Number.isNaN(date.getTime()) ||
    (date.getHours() === 0 && date.getMinutes() === 0)
  ) {
    return "";
  }

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}


function getRegistrationUrl(event) {
  return (
    event?.registrationUrl ||
    event?.registration_url ||
    event?.registerUrl ||
    event?.register_url ||
    ""
  );
}


function formatFullDate(value) {
  if (!value) {
    return "Date to be announced";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date to be announced";
  }

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}


function formatDateBlock(value) {
  const empty = { day: "--", month: "---", year: "" };

  if (!value) return empty;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return empty;

  return {
    day: date.toLocaleDateString("en-US", { day: "2-digit" }),
    month: date.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
    year: String(date.getFullYear()),
  };
}


/* ============================================================
   EVENT DETAILS
============================================================ */

export default function EventDetails() {
  const { slug } = useParams();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  /* ==========================================================
     LOAD EVENT
  ========================================================== */

  useEffect(() => {
    const controller = new AbortController();

    async function loadEvent() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/events/published/${encodeURIComponent(slug)}`,
          {
            method: "GET",
            headers: { Accept: "application/json" },
            signal: controller.signal,
          }
        );

        const contentType = response.headers.get("content-type") || "";

        if (!contentType.includes("application/json")) {
          const text = await response.text();

          console.error("Unexpected event details response:", text);

          throw new Error("The event service returned an unexpected response.");
        }

        const result = await response.json();

        if (response.status === 404) {
          setEvent(null);
          setError(result?.message || "Event not found.");
          return;
        }

        if (!response.ok) {
          throw new Error(
            result?.message ||
            result?.error ||
            "Unable to load this event."
          );
        }

        const loadedEvent = result?.event || result?.data || null;

        if (!loadedEvent) {
          throw new Error("Event information is unavailable.");
        }

        setEvent(loadedEvent);
      } catch (requestError) {
        if (requestError?.name === "AbortError") {
          return;
        }

        console.error("Event details error:", requestError);

        setEvent(null);

        // A network failure only says "Failed to fetch".
        setError(
          requestError instanceof TypeError
            ? "We could not load this event right now. Please try again shortly."
            : requestError?.message || "Unable to load this event."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    if (slug) {
      loadEvent();
    } else {
      setLoading(false);
      setError("Event not found.");
    }

    return () => {
      controller.abort();
    };
  }, [slug]);


  /* ==========================================================
     NORMALIZED EVENT DATA
  ========================================================== */

  const eventDate = useMemo(() => getEventDate(event), [event]);
  const dateBlock = useMemo(() => formatDateBlock(eventDate), [eventDate]);

  const eventImage = getEventImage(event);
  const location = getEventLocation(event);
  const eventType = getEventType(event);
  const description = getEventDescription(event);
  const content = getEventContent(event);
  const eventTime = getEventTime(event);
  const registrationUrl = getRegistrationUrl(event);
  const endDate = getEventEndDate(event);

  const paragraphs = content
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);


  /* ==========================================================
     LOADING
     A hero-shaped placeholder, so the page doesn't jump.
  ========================================================== */

  if (loading) {
    return (
      <main className="ed-page" aria-busy="true">
        <section className="ed-hero ed-hero--loading">
          <div className="ed-container ed-hero__inner">
            <div className="ed-hero__content">
              <span className="ed-visually-hidden">Loading event details</span>
              <span className="ed-skeleton ed-skeleton--line" />
              <span className="ed-skeleton ed-skeleton--title" />
              <span className="ed-skeleton ed-skeleton--title ed-skeleton--short" />
              <span className="ed-skeleton ed-skeleton--line ed-skeleton--wide" />
            </div>
          </div>
        </section>
      </main>
    );
  }


  /* ==========================================================
     ERROR / NOT FOUND
  ========================================================== */

  if (error || !event) {
    return (
      <main className="ed-page">
        <section className="ed-state">
          <div className="ed-container">
            <div className="ed-state__card">
              <span className="ed-state__icon">
                <CalendarDays size={30} aria-hidden="true" />
              </span>

              <span className="ed-eyebrow">Event Not Found</span>

              <h1>We couldn't find this event.</h1>

              <p>
                {error ||
                  "The event may have been removed, renamed, or unpublished."}
              </p>

              <Link to="/events" className="ed-button ed-button--gold">
                <ArrowLeft size={17} aria-hidden="true" />
                Back to events
              </Link>
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
    <main className="ed-page">

      {/* ======================================================
          HERO
      ====================================================== */}

      <section className="ed-hero">

        <div className="ed-hero__media" aria-hidden="true">
          <img src={eventImage} alt="" fetchPriority="high" />
        </div>

        <div className="ed-container ed-hero__inner">

          <div className="ed-hero__content">

            <Link to="/events" className="ed-back">
              <ArrowLeft size={16} aria-hidden="true" />
              All events
            </Link>

            <span className="ed-hero__type">{eventType}</span>

            <h1>{event.title || "Continental Founders Event"}</h1>

            {description && (
              <p className="ed-hero__description">{description}</p>
            )}

            <div className="ed-hero__actions">
              {registrationUrl && (
                <a
                  href={registrationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ed-button ed-button--gold"
                >
                  Register for event
                  <ArrowRight size={17} aria-hidden="true" />
                </a>
              )}

              <a
                href="#event-overview"
                className={`ed-button ${registrationUrl ? "ed-button--ghost" : "ed-button--gold"}`}
              >
                Explore event
                <ArrowRight size={17} aria-hidden="true" />
              </a>
            </div>

            <ul className="ed-hero__keywords" aria-label="What we bring together">
              {keywords.map((word) => (
                <li key={word}>{word}</li>
              ))}
            </ul>

          </div>

          <figure className="ed-hero__quote">
            <Quote size={26} aria-hidden="true" />
            <blockquote>“Conversations that create opportunity.”</blockquote>
            <figcaption>Continental Founders</figcaption>
          </figure>

        </div>

      </section>


      {/* ======================================================
          QUICK FACTS
      ====================================================== */}

      <section className="ed-facts" aria-label="Event summary">
        <div className="ed-container">
          <div className="ed-facts__card">

            <div className="ed-facts__date">
              <strong>{dateBlock.day}</strong>
              <span>{dateBlock.month}</span>
              <small>{dateBlock.year}</small>
            </div>

            <ul className="ed-facts__list">
              <li>
                <span className="ed-facts__icon">
                  <CalendarDays size={20} aria-hidden="true" />
                </span>
                <span>
                  <small>Date</small>
                  <strong>{formatFullDate(eventDate)}</strong>
                </span>
              </li>

              {eventTime && (
                <li>
                  <span className="ed-facts__icon">
                    <Clock3 size={20} aria-hidden="true" />
                  </span>
                  <span>
                    <small>Time</small>
                    <strong>{eventTime}</strong>
                  </span>
                </li>
              )}

              <li>
                <span className="ed-facts__icon">
                  <MapPin size={20} aria-hidden="true" />
                </span>
                <span>
                  <small>Location</small>
                  <strong>{location}</strong>
                </span>
              </li>

              <li>
                <span className="ed-facts__icon">
                  <Users size={20} aria-hidden="true" />
                </span>
                <span>
                  <small>Event Type</small>
                  <strong>{eventType}</strong>
                </span>
              </li>
            </ul>

          </div>
        </div>
      </section>


      {/* ======================================================
          OVERVIEW
      ====================================================== */}

      <section id="event-overview" className="ed-section ed-overview">
        <div className="ed-container ed-overview__grid">

          <article className="ed-overview__main">

            <span className="ed-eyebrow">Event Overview</span>

            <h2>A space for meaningful conversations and action.</h2>

            <div className="ed-prose">
              {paragraphs.length ? (
                paragraphs.map((paragraph, index) => (
                  <p key={`${index}-${paragraph.slice(0, 18)}`}>{paragraph}</p>
                ))
              ) : (
                <p>
                  More information about this event will be shared as
                  programming is confirmed.
                </p>
              )}
            </div>

            <a href="#why-we-convene" className="ed-text-link">
              Explore event details
              <ArrowRight size={18} aria-hidden="true" />
            </a>

          </article>

          <aside className="ed-info">

            <h3>Key Information</h3>

            <ul>
              <li>
                <span className="ed-info__icon">
                  <CalendarDays size={20} aria-hidden="true" />
                </span>
                <span>
                  <small>Date</small>
                  <strong>{formatFullDate(eventDate)}</strong>
                </span>
              </li>

              {endDate && (
                <li>
                  <span className="ed-info__icon">
                    <CalendarDays size={20} aria-hidden="true" />
                  </span>
                  <span>
                    <small>End Date</small>
                    <strong>{formatFullDate(endDate)}</strong>
                  </span>
                </li>
              )}

              {eventTime && (
                <li>
                  <span className="ed-info__icon">
                    <Clock3 size={20} aria-hidden="true" />
                  </span>
                  <span>
                    <small>Time</small>
                    <strong>{eventTime}</strong>
                  </span>
                </li>
              )}

              <li>
                <span className="ed-info__icon">
                  <MapPin size={20} aria-hidden="true" />
                </span>
                <span>
                  <small>Location</small>
                  <strong>{location}</strong>
                </span>
              </li>

              <li>
                <span className="ed-info__icon">
                  <Users size={20} aria-hidden="true" />
                </span>
                <span>
                  <small>Event Type</small>
                  <strong>{eventType}</strong>
                </span>
              </li>
            </ul>

            {registrationUrl && (
              <a
                href={registrationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ed-button ed-button--gold ed-info__register"
              >
                Register for event
                <ExternalLink size={16} aria-hidden="true" />
              </a>
            )}

          </aside>

        </div>
      </section>


      {/* ======================================================
          WHY WE CONVENE
      ====================================================== */}

      <section id="why-we-convene" className="ed-section ed-section--soft">
        <div className="ed-container">

          <header className="ed-heading">
            <div>
              <span className="ed-eyebrow">Why We Convene</span>
              <h2>Relationships create pathways to opportunity.</h2>
            </div>

            <p>
              Continental Founders convenings bring together diverse
              stakeholders to turn shared ambition into real progress
              for people, businesses and communities across Africa.
            </p>
          </header>

          <ol className="ed-purpose">
            {purposes.map(({ icon: Icon, title, text, tone }, index) => (
              <li key={title} className={`ed-tone--${tone}`}>
                <div className="ed-purpose__top">
                  <span className="ed-purpose__icon">
                    <Icon size={24} aria-hidden="true" />
                  </span>
                  <span className="ed-purpose__number">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ol>

        </div>
      </section>


      {/* ======================================================
          JOIN
      ====================================================== */}

      <section className="ed-join">
        <div className="ed-container">
          <div className="ed-join__card">

            <img src={eventImage} alt="" loading="lazy" />

            <div className="ed-join__content">
              <span className="ed-eyebrow ed-eyebrow--light">Join the Conversation</span>

              <h2>Be part of the room where connections begin.</h2>

              <p>
                Secure your place and join a community of founders,
                professionals, institutions and partners working toward
                practical connections, collaboration and opportunity.
              </p>

              <div className="ed-join__actions">
                {registrationUrl && (
                  <a
                    href={registrationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ed-button ed-button--gold"
                  >
                    Register for event
                    <ExternalLink size={16} aria-hidden="true" />
                  </a>
                )}

                <Link
                  to="/contact"
                  className={`ed-button ${registrationUrl ? "ed-button--ghost" : "ed-button--gold"}`}
                >
                  Contact us
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>

                <Link to="/events" className="ed-join__all">
                  View all events
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* ======================================================
          BRAND BAND
      ====================================================== */}

      <section className="ed-band">
        <div className="ed-container ed-band__inner">
          <span>Continental Founders</span>
          <strong>Talent is everywhere. Access is not.</strong>
          <Link to="/contact">
            Connect with us
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
      </section>

    </main>
  );
}
