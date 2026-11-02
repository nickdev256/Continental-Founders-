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
  CalendarPlus,
  Check,
  Clock3,
  ExternalLink,
  MapPin,
  Navigation,
  Quote,
  Share2,
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


// "Upcoming · 23 days to go", "Happening today" or "Past event".
function getEventStatus(value, endValue) {
  const start = value ? new Date(value) : null;

  if (!start || Number.isNaN(start.getTime())) return null;

  const end = endValue ? new Date(endValue) : start;
  const today = new Date();
  const dayStart = (date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

  const days = Math.round((dayStart(start) - dayStart(today)) / 86400000);
  const ended = dayStart(Number.isNaN(end.getTime()) ? start : end) < dayStart(today);

  if (ended) return { tone: "past", label: "Past event" };
  if (days <= 0) return { tone: "live", label: "Happening today" };
  if (days === 1) return { tone: "soon", label: "Upcoming · Tomorrow" };
  if (days <= 60) return { tone: "soon", label: `Upcoming · ${days} days to go` };

  return { tone: "soon", label: "Upcoming" };
}


// A location that is a real place (not a placeholder) can open in Maps.
function getDirectionsUrl(location) {
  if (!location || /to be announced|online|virtual/i.test(location)) return "";

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
}


// Calendar file (.ics) that Apple, Google and Outlook calendars open.
// Midnight dates become all-day events; timed events last two hours
// unless an end date is given.
function buildCalendarFile({ title, start, end, location, details, url }) {
  const date = new Date(start);

  if (Number.isNaN(date.getTime())) return null;

  const pad = (n) => String(n).padStart(2, "0");
  const allDay = date.getHours() === 0 && date.getMinutes() === 0;
  const dayStamp = (d) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
  const utcStamp = (d) =>
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
  const escape = (text) =>
    String(text || "").replace(/\\/g, "\\\\").replace(/([,;])/g, "\\$1").replace(/\n/g, "\\n");

  let endDate = end ? new Date(end) : null;

  if (!endDate || Number.isNaN(endDate.getTime())) {
    endDate = allDay
      ? new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
      : new Date(date.getTime() + 2 * 3600000);
  } else if (allDay) {
    // All-day end dates are exclusive in calendar files.
    endDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() + 1);
  }

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Continental Founders//Events//EN",
    "BEGIN:VEVENT",
    `UID:${dayStamp(date)}-${encodeURIComponent(title).slice(0, 40)}@continentalfounders`,
    `DTSTAMP:${utcStamp(new Date())}`,
    allDay ? `DTSTART;VALUE=DATE:${dayStamp(date)}` : `DTSTART:${utcStamp(date)}`,
    allDay ? `DTEND;VALUE=DATE:${dayStamp(endDate)}` : `DTEND:${utcStamp(endDate)}`,
    `SUMMARY:${escape(title)}`,
    location ? `LOCATION:${escape(location)}` : "",
    details ? `DESCRIPTION:${escape(details)}` : "",
    url ? `URL:${url}` : "",
    "END:VEVENT",
    "END:VCALENDAR",
  ].filter(Boolean);

  return new Blob([lines.join("\r\n")], { type: "text/calendar;charset=utf-8" });
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

  const title = event?.title || "Continental Founders Event";
  const status = getEventStatus(eventDate, endDate);
  const directionsUrl = getDirectionsUrl(event ? location : "");
  const canAddToCalendar = Boolean(
    eventDate && !Number.isNaN(new Date(eventDate).getTime()) && status?.tone !== "past"
  );

  const [shareNote, setShareNote] = useState("");

  function addToCalendar() {
    const file = buildCalendarFile({
      title,
      start: eventDate,
      end: endDate,
      location: directionsUrl ? location : "",
      details: description,
      url: window.location.href,
    });

    if (!file) return;

    const url = URL.createObjectURL(file);
    const link = document.createElement("a");

    link.href = url;
    link.download = `${(slug || "event").replace(/[^a-z0-9-]+/gi, "-")}.ics`;
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  // Phones get the system share sheet; elsewhere the link is copied.
  async function shareEvent() {
    const shareData = { title, text: description || title, url: window.location.href };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }

      await navigator.clipboard.writeText(window.location.href);
      setShareNote("Link copied");
    } catch (shareError) {
      if (shareError?.name === "AbortError") return;
      setShareNote("Copy the link from your address bar");
    }

    window.setTimeout(() => setShareNote(""), 2500);
  }

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

        {/* Soft blurred copy behind everything, for colour only */}
        <div className="ed-hero__media" aria-hidden="true">
          <img src={eventImage} alt="" />
        </div>

        <div className="ed-container ed-hero__inner">

          <div className="ed-hero__content">

            <Link to="/events" className="ed-back">
              <ArrowLeft size={16} aria-hidden="true" />
              All events
            </Link>

            <div className="ed-hero__tags">
              <span className="ed-hero__type">{eventType}</span>

              {status && (
                <span className={`ed-hero__status ed-hero__status--${status.tone}`}>
                  {status.label}
                </span>
              )}
            </div>

            <h1>{title}</h1>

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

              {canAddToCalendar && (
                <button
                  type="button"
                  onClick={addToCalendar}
                  className={`ed-button ${registrationUrl ? "ed-button--ghost" : "ed-button--gold"}`}
                >
                  <CalendarPlus size={17} aria-hidden="true" />
                  Add to calendar
                </button>
              )}

              <a
                href="#event-overview"
                className={`ed-button ${
                  registrationUrl || canAddToCalendar ? "ed-button--ghost" : "ed-button--gold"
                }`}
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

          {/* The event image is shown whole: event photos are often
              banners or logos (like US AFRICA) that must stay readable. */}
          <div className="ed-hero__visual">
            <div className="ed-hero__frame">
              <img className="ed-hero__frame-fill" src={eventImage} alt="" aria-hidden="true" />
              <img
                className="ed-hero__frame-image"
                src={eventImage}
                alt={event.title ? `${event.title} event image` : "Event image"}
                fetchPriority="high"
              />
            </div>

            <figure className="ed-hero__quote">
              <Quote size={22} aria-hidden="true" />
              <blockquote>“Conversations that create opportunity.”</blockquote>
              <figcaption>Continental Founders</figcaption>
            </figure>
          </div>

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

            {/* Things a visitor can do next */}
            <div className="ed-info__actions">
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

              {canAddToCalendar && (
                <button type="button" className="ed-info__action" onClick={addToCalendar}>
                  <CalendarPlus size={18} aria-hidden="true" />
                  Add to calendar
                </button>
              )}

              {directionsUrl && (
                <a
                  className="ed-info__action"
                  href={directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Navigation size={18} aria-hidden="true" />
                  Get directions
                  <ExternalLink size={14} aria-hidden="true" className="ed-info__external" />
                </a>
              )}

              <button type="button" className="ed-info__action" onClick={shareEvent}>
                {shareNote ? (
                  <Check size={18} aria-hidden="true" />
                ) : (
                  <Share2 size={18} aria-hidden="true" />
                )}
                <span aria-live="polite">{shareNote || "Share this event"}</span>
              </button>
            </div>

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
