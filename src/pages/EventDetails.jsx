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
  RefreshCw,
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
  return (
    event?.endDate ||
    event?.end_date ||
    null
  );
}


function getEventImage(event) {
  return (
    event?.imageUrl ||
    event?.image_url ||
    event?.image ||
    event?.coverImage ||
    event?.cover_image ||
    "/assets/images/events/event-1.jpg"
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
  return (
    event?.description ||
    event?.summary ||
    ""
  );
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


function getEventTime(event) {
  return (
    event?.time ||
    event?.eventTime ||
    event?.event_time ||
    ""
  );
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

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Date to be announced";
  }

  return date.toLocaleDateString(
    "en-US",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );
}


function formatDateBlock(value) {
  if (!value) {
    return {
      day: "--",
      month: "---",
      year: "",
    };
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return {
      day: "--",
      month: "---",
      year: "",
    };
  }

  return {
    day:
      date.toLocaleDateString(
        "en-US",
        {
          day: "2-digit",
        }
      ),

    month:
      date
        .toLocaleDateString(
          "en-US",
          {
            month: "short",
          }
        )
        .toUpperCase(),

    year:
      String(
        date.getFullYear()
      ),
  };
}


/* ============================================================
   EVENT DETAILS
============================================================ */

export default function EventDetails() {
  const {
    slug,
  } =
    useParams();


  const [
    event,
    setEvent,
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
     LOAD EVENT
  ========================================================== */

  useEffect(() => {
    const controller =
      new AbortController();


    async function loadEvent() {
      try {
        setLoading(true);
        setError("");


        const response =
          await fetch(
            `${API_URL}/api/events/published/${encodeURIComponent(
              slug
            )}`,
            {
              method: "GET",

              headers: {
                Accept:
                  "application/json",
              },

              signal:
                controller.signal,
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
            "Unexpected event details response:",
            text
          );


          throw new Error(
            "The event service returned an unexpected response."
          );
        }


        const result =
          await response.json();


        if (
          response.status ===
          404
        ) {
          setEvent(null);

          setError(
            result?.message ||
            "Event not found."
          );

          return;
        }


        if (
          !response.ok
        ) {
          throw new Error(
            result?.message ||
            result?.error ||
            "Unable to load this event."
          );
        }


        const loadedEvent =
          result?.event ||
          result?.data ||
          null;


        if (
          !loadedEvent
        ) {
          throw new Error(
            "Event information is unavailable."
          );
        }


        setEvent(
          loadedEvent
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
          "Event details error:",
          requestError
        );


        setEvent(null);

        setError(
          requestError?.message ||
          "Unable to load this event."
        );
      } finally {
        if (
          !controller.signal.aborted
        ) {
          setLoading(false);
        }
      }
    }


    if (
      slug
    ) {
      loadEvent();
    } else {
      setLoading(false);

      setError(
        "Event not found."
      );
    }


    return () => {
      controller.abort();
    };
  }, [
    slug,
  ]);


  /* ==========================================================
     NORMALIZED EVENT DATA
  ========================================================== */

  const eventDate =
    useMemo(
      () =>
        getEventDate(
          event
        ),
      [
        event,
      ]
    );


  const dateBlock =
    useMemo(
      () =>
        formatDateBlock(
          eventDate
        ),
      [
        eventDate,
      ]
    );


  const eventImage =
    getEventImage(
      event
    );


  const location =
    getEventLocation(
      event
    );


  const eventType =
    getEventType(
      event
    );


  const description =
    getEventDescription(
      event
    );


  const content =
    getEventContent(
      event
    );


  const eventTime =
    getEventTime(
      event
    );


  const registrationUrl =
    getRegistrationUrl(
      event
    );


  const endDate =
    getEventEndDate(
      event
    );


  /* ==========================================================
     LOADING
  ========================================================== */

  if (
    loading
  ) {
    return (
      <main className="event-details-page">

        <section className="event-details-state">

          <div className="event-details-state__inner">

            <div className="event-details-state__icon">
              <RefreshCw
                size={28}
                className="event-details-spinner"
                aria-hidden="true"
              />
            </div>

            <span className="event-details-eyebrow">
              Continental Founders
            </span>

            <h1>
              Loading event details
            </h1>

            <p>
              Retrieving the latest event information.
            </p>

          </div>

        </section>

      </main>
    );
  }


  /* ==========================================================
     ERROR
  ========================================================== */

  if (
    error ||
    !event
  ) {
    return (
      <main className="event-details-page">

        <section className="event-details-state">

          <div className="event-details-state__inner">

            <div className="event-details-state__icon">
              <CalendarDays
                size={30}
                aria-hidden="true"
              />
            </div>

            <span className="event-details-eyebrow">
              Event Not Found
            </span>

            <h1>
              We couldn't find this event.
            </h1>

            <p>
              {error ||
                "The event may have been removed, renamed, or unpublished."}
            </p>

            <Link
              to="/events"
              className="event-details-button event-details-button--gold"
            >
              <ArrowLeft
                size={17}
                aria-hidden="true"
              />

              Back to Events
            </Link>

          </div>

        </section>

      </main>
    );
  }


  /* ==========================================================
     PAGE
  ========================================================== */

  return (
    <main className="event-details-page">


      {/* ======================================================
          HERO
      ====================================================== */}

      <section className="event-details-hero">

        {/* ONLY EVENT PHOTO ON THIS PAGE */}

        <div
          className="event-details-hero__photo"
          style={{
            backgroundImage:
              `url("${eventImage}")`,
          }}
          aria-hidden="true"
        />


        <div
          className="event-details-hero__shade"
          aria-hidden="true"
        />


        <div
          className="event-details-hero__texture"
          aria-hidden="true"
        />


        <div className="event-details-container event-details-hero__inner">


          {/* LEFT CONTENT */}

          <div className="event-details-hero__content">

            <Link
              to="/events"
              className="event-details-back"
            >
              <ArrowLeft
                size={16}
                aria-hidden="true"
              />

              All Events
            </Link>


            <div className="event-details-hero__type">

              <span
                aria-hidden="true"
              />

              {eventType}

            </div>


            <h1>
              {event.title ||
                "Continental Founders Event"}
            </h1>


            {description && (
              <p className="event-details-hero__description">
                {description}
              </p>
            )}


            <div className="event-details-hero__actions">

              {registrationUrl && (
                <a
                  href={registrationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="event-details-button event-details-button--gold"
                >
                  Register for Event

                  <ArrowRight
                    size={17}
                    aria-hidden="true"
                  />
                </a>
              )}


              <a
                href="#event-overview"
                className="event-details-button event-details-button--outline-light"
              >
                Explore Event

                <ArrowRight
                  size={17}
                  aria-hidden="true"
                />
              </a>

            </div>

          </div>


          {/* RIGHT QUOTE */}

          <div className="event-details-hero__quote">

            <span
              className="event-details-hero__quote-line"
              aria-hidden="true"
            />

            <blockquote>
              “Conversations that create opportunity.”
            </blockquote>

            <small>
              Continental Founders
            </small>

          </div>

        </div>


        {/* SIDE WORDS */}

        <div
          className="event-details-hero__keywords"
          aria-hidden="true"
        >
          <span>People</span>
          <span>Ideas</span>
          <span>Capital</span>
          <span>Impact</span>

          <i />
        </div>

      </section>


      {/* ======================================================
          HERO INFORMATION BAR
      ====================================================== */}

      <section className="event-details-quick-info">

        <div className="event-details-container event-details-quick-info__inner">


          <div className="event-details-quick-info__date">

            <strong>
              {dateBlock.day}
            </strong>

            <span>
              {dateBlock.month}
            </span>

            <small>
              {dateBlock.year}
            </small>

          </div>


          <div className="event-details-quick-info__item">

            <CalendarDays
              size={22}
              aria-hidden="true"
            />

            <div>
              <span>
                Date
              </span>

              <strong>
                {formatFullDate(
                  eventDate
                )}
              </strong>
            </div>

          </div>


          {eventTime && (
            <div className="event-details-quick-info__item">

              <Clock3
                size={22}
                aria-hidden="true"
              />

              <div>
                <span>
                  Time
                </span>

                <strong>
                  {eventTime}
                </strong>
              </div>

            </div>
          )}


          <div className="event-details-quick-info__item">

            <MapPin
              size={22}
              aria-hidden="true"
            />

            <div>
              <span>
                Location
              </span>

              <strong>
                {location}
              </strong>
            </div>

          </div>


          <div className="event-details-quick-info__item">

            <Users
              size={22}
              aria-hidden="true"
            />

            <div>
              <span>
                Event Type
              </span>

              <strong>
                {eventType}
              </strong>
            </div>

          </div>

        </div>

      </section>


      {/* ======================================================
          OVERVIEW
      ====================================================== */}

      <section
        id="event-overview"
        className="event-details-overview"
      >

        <div className="event-details-container">


          <div className="event-details-overview__grid">


            {/* MAIN CONTENT */}

            <article className="event-details-overview__main">

              <div className="event-details-section-label">

                <span className="event-details-section-number">
                  01
                </span>

                <span className="event-details-eyebrow">
                  Event Overview
                </span>

                <i
                  aria-hidden="true"
                />

              </div>


              <h2>
                A space for meaningful
                conversations and action.
              </h2>


              <div className="event-details-prose">

                {content ? (
                  content
                    .split(
                      /\n{2,}/
                    )
                    .map(
                      (
                        paragraph
                      ) =>
                        paragraph.trim()
                    )
                    .filter(
                      Boolean
                    )
                    .map(
                      (
                        paragraph,
                        index
                      ) => (
                        <p
                          key={`${index}-${paragraph.slice(
                            0,
                            18
                          )}`}
                        >
                          {paragraph}
                        </p>
                      )
                    )
                ) : (
                  <p>
                    More information about this event will be
                    shared as programming is confirmed.
                  </p>
                )}

              </div>


              <a
                href="#why-we-convene"
                className="event-details-text-link"
              >
                Explore Event Details

                <ArrowRight
                  size={18}
                  aria-hidden="true"
                />
              </a>

            </article>


            {/* KEY INFORMATION */}

            <aside className="event-details-information">

              <span className="event-details-information__heading">
                Key Information
              </span>


              <div className="event-details-information__item">

                <div className="event-details-information__icon">
                  <CalendarDays
                    size={23}
                    aria-hidden="true"
                  />
                </div>

                <div>
                  <span>
                    Date
                  </span>

                  <strong>
                    {formatFullDate(
                      eventDate
                    )}
                  </strong>
                </div>

              </div>


              {endDate && (
                <div className="event-details-information__item">

                  <div className="event-details-information__icon">
                    <CalendarDays
                      size={23}
                      aria-hidden="true"
                    />
                  </div>

                  <div>
                    <span>
                      End Date
                    </span>

                    <strong>
                      {formatFullDate(
                        endDate
                      )}
                    </strong>
                  </div>

                </div>
              )}


              {eventTime && (
                <div className="event-details-information__item">

                  <div className="event-details-information__icon">
                    <Clock3
                      size={23}
                      aria-hidden="true"
                    />
                  </div>

                  <div>
                    <span>
                      Time
                    </span>

                    <strong>
                      {eventTime}
                    </strong>
                  </div>

                </div>
              )}


              <div className="event-details-information__item">

                <div className="event-details-information__icon">
                  <MapPin
                    size={23}
                    aria-hidden="true"
                  />
                </div>

                <div>
                  <span>
                    Location
                  </span>

                  <strong>
                    {location}
                  </strong>
                </div>

              </div>


              <div className="event-details-information__item">

                <div className="event-details-information__icon">
                  <Users
                    size={23}
                    aria-hidden="true"
                  />
                </div>

                <div>
                  <span>
                    Event Type
                  </span>

                  <strong>
                    {eventType}
                  </strong>
                </div>

              </div>

            </aside>

          </div>

        </div>

      </section>


      {/* ======================================================
          WHY WE CONVENE
      ====================================================== */}

      <section
        id="why-we-convene"
        className="event-details-purpose"
      >

        <div className="event-details-container">


          <div className="event-details-purpose__top">

            <div>

              <div className="event-details-section-label">

                <span className="event-details-section-number">
                  02
                </span>

                <span className="event-details-eyebrow">
                  Why We Convene
                </span>

                <i
                  aria-hidden="true"
                />

              </div>


              <h2>
                Relationships create
                pathways to opportunity.
              </h2>

            </div>


            <p>
              Continental Founders convenings bring together
              diverse stakeholders to turn shared ambition
              into real progress for people, businesses and
              communities across Africa.
            </p>

          </div>


          <div className="event-details-purpose__grid">


            <article className="event-details-purpose-card">

              <div className="event-details-purpose-card__icon">
                <Users
                  size={34}
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
              </div>


              <div>

                <div className="event-details-purpose-card__heading">

                  <span>
                    01.
                  </span>

                  <h3>
                    Connect
                  </h3>

                </div>

                <p>
                  Bring founders, institutions,
                  professionals and partners into
                  the same conversation.
                </p>

              </div>

            </article>


            <article className="event-details-purpose-card">

              <div className="event-details-purpose-card__icon">
                <BookOpen
                  size={34}
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
              </div>


              <div>

                <div className="event-details-purpose-card__heading">

                  <span>
                    02.
                  </span>

                  <h3>
                    Exchange
                  </h3>

                </div>

                <p>
                  Create room for useful knowledge,
                  experience and practical insight
                  to move across networks.
                </p>

              </div>

            </article>


            <article className="event-details-purpose-card">

              <div className="event-details-purpose-card__icon">
                <TrendingUp
                  size={34}
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
              </div>


              <div>

                <div className="event-details-purpose-card__heading">

                  <span>
                    03.
                  </span>

                  <h3>
                    Act
                  </h3>

                </div>

                <p>
                  Move promising conversations toward
                  relationships, collaboration and
                  opportunity.
                </p>

              </div>

            </article>

          </div>

        </div>

      </section>


      {/* ======================================================
          JOIN
      ====================================================== */}

      <section className="event-details-connect">

        <div
          className="event-details-connect__pattern"
          aria-hidden="true"
        />


        <div className="event-details-container event-details-connect__grid">


          <div>

            <div className="event-details-connect__label">

              <i
                aria-hidden="true"
              />

              <span>
                Join the Conversation
              </span>

            </div>


            <h2>
              Be part of the room
              where connections begin.
            </h2>

          </div>


          <div className="event-details-connect__content">

            <p>
              Secure your place and join a community of
              founders, professionals, institutions and
              partners working toward practical connections,
              collaboration and opportunity.
            </p>


            <div className="event-details-connect__actions">

              {registrationUrl && (
                <a
                  href={registrationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="event-details-button event-details-button--gold"
                >
                  Register for Event

                  <ExternalLink
                    size={16}
                    aria-hidden="true"
                  />
                </a>
              )}


              <Link
                to="/contact"
                className="event-details-button event-details-button--outline-light"
              >
                Contact Us

                <ArrowRight
                  size={16}
                  aria-hidden="true"
                />
              </Link>


              <Link
                to="/events"
                className="event-details-connect__all-events"
              >
                View All Events
              </Link>

            </div>

          </div>

        </div>

      </section>


      {/* ======================================================
          BRAND BAND
      ====================================================== */}

      <section className="event-details-brand-band">

        <div className="event-details-container event-details-brand-band__inner">

          <span>
            Continental Founders
          </span>

          <i
            aria-hidden="true"
          />

          <strong>
            Talent is everywhere. Access is not.
          </strong>

          <i
            aria-hidden="true"
          />

          <Link
            to="/contact"
          >
            Connect With Us

            <ArrowRight
              size={15}
              aria-hidden="true"
            />
          </Link>

        </div>

      </section>

    </main>
  );
}