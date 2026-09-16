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
  Globe2,
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


function formatShortDate(value) {
  if (!value) {
    return "TBA";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "TBA";
  }

  return date.toLocaleDateString(
    "en-US",
    {
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
   EVENT DETAILS PAGE
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
              method:
                "GET",

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
     LOADING STATE
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
     ERROR / NOT FOUND
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
                "The event may have been removed, renamed or unpublished."}
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

        <div
          className="event-details-hero__background"
          style={{
            backgroundImage:
              `url("${eventImage}")`,
          }}
          aria-hidden="true"
        />

        <div
          className="event-details-hero__overlay"
          aria-hidden="true"
        />

        <div
          className="event-details-hero__accent"
          aria-hidden="true"
        />

        <div className="event-details-container event-details-hero__inner">


          {/* HERO CONTENT */}

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


            <div className="event-details-hero__label">
              <span />

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

              <a
                href="#event-overview"
                className="event-details-button event-details-button--gold"
              >
                Explore Event

                <ArrowRight
                  size={17}
                  aria-hidden="true"
                />
              </a>


              {registrationUrl && (
                <a
                  href={registrationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="event-details-button event-details-button--outline-light"
                >
                  Register

                  <ExternalLink
                    size={16}
                    aria-hidden="true"
                  />
                </a>
              )}

            </div>

          </div>


          {/* HERO INFORMATION CARD */}

          <aside className="event-details-hero__card">

            <div className="event-details-date-block">

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


            <div className="event-details-hero__facts">

              <div className="event-details-hero__fact">

                <CalendarDays
                  size={18}
                  aria-hidden="true"
                />

                <span>
                  <small>
                    Date
                  </small>

                  <strong>
                    {formatFullDate(
                      eventDate
                    )}
                  </strong>
                </span>

              </div>


              {eventTime && (
                <div className="event-details-hero__fact">

                  <Clock3
                    size={18}
                    aria-hidden="true"
                  />

                  <span>
                    <small>
                      Time
                    </small>

                    <strong>
                      {eventTime}
                    </strong>
                  </span>

                </div>
              )}


              <div className="event-details-hero__fact">

                <MapPin
                  size={18}
                  aria-hidden="true"
                />

                <span>
                  <small>
                    Location
                  </small>

                  <strong>
                    {location}
                  </strong>
                </span>

              </div>


              <div className="event-details-hero__fact">

                <Users
                  size={18}
                  aria-hidden="true"
                />

                <span>
                  <small>
                    Event Type
                  </small>

                  <strong>
                    {eventType}
                  </strong>
                </span>

              </div>

            </div>

          </aside>

        </div>

      </section>


      {/* ======================================================
          EVENT OVERVIEW
      ====================================================== */}

      <section
        id="event-overview"
        className="event-details-overview"
      >

        <div className="event-details-container">


          <div className="event-details-section-heading">

            <div className="event-details-section-heading__label">

              <span className="event-details-number">
                01
              </span>

              <span className="event-details-eyebrow">
                Event Overview
              </span>

            </div>


            <h2>
              A space for meaningful
              conversations and action.
            </h2>

          </div>


          <div className="event-details-overview__grid">


            {/* ABOUT */}

            <article className="event-details-overview__content">

              <h3>
                About the Event
              </h3>


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
                            20
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

            </article>


            {/* EVENT INFORMATION */}

            <aside className="event-details-information">

              <h3>
                Event Information
              </h3>


              <div className="event-details-information__item">

                <span className="event-details-information__icon">
                  <CalendarDays
                    size={19}
                    aria-hidden="true"
                  />
                </span>

                <div>
                  <span>
                    Start Date
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

                  <span className="event-details-information__icon">
                    <CalendarDays
                      size={19}
                      aria-hidden="true"
                    />
                  </span>

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

                  <span className="event-details-information__icon">
                    <Clock3
                      size={19}
                      aria-hidden="true"
                    />
                  </span>

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

                <span className="event-details-information__icon">
                  <MapPin
                    size={19}
                    aria-hidden="true"
                  />
                </span>

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

                <span className="event-details-information__icon">
                  <Users
                    size={19}
                    aria-hidden="true"
                  />
                </span>

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

      <section className="event-details-purpose">

        <div
          className="event-details-purpose__glow"
          aria-hidden="true"
        />

        <div className="event-details-container">


          <div className="event-details-purpose__intro">

            <div>

              <div className="event-details-section-heading__label">

                <span className="event-details-number">
                  02
                </span>

                <span className="event-details-eyebrow event-details-eyebrow--gold">
                  Why We Convene
                </span>

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
                  size={27}
                  aria-hidden="true"
                />
              </div>

              <div>

                <div className="event-details-purpose-card__title">

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
                  size={27}
                  aria-hidden="true"
                />
              </div>

              <div>

                <div className="event-details-purpose-card__title">

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
                  size={27}
                  aria-hidden="true"
                />
              </div>

              <div>

                <div className="event-details-purpose-card__title">

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
          FEATURE IMAGE
      ====================================================== */}

      <section className="event-details-feature">

        <div className="event-details-feature__grid">

          <div className="event-details-feature__image">

            <img
              src={eventImage}
              alt={
                event.title ||
                "Continental Founders event"
              }
              loading="lazy"
              decoding="async"
            />

          </div>


          <div className="event-details-feature__statement">

            <span
              className="event-details-feature__line"
              aria-hidden="true"
            />

            <p>
              African founders.
              <br />

              Global conversations.
              <br />

              Real impact.
            </p>

          </div>

        </div>

      </section>


      {/* ======================================================
          JOIN THE CONVERSATION
      ====================================================== */}

      <section className="event-details-connect">

        <div className="event-details-container event-details-connect__grid">


          <div className="event-details-connect__heading">

            <span className="event-details-eyebrow">
              Join the Conversation
            </span>

            <h2>
              Be part of the room
              where connections begin.
            </h2>

          </div>


          <div className="event-details-connect__content">

            <p>
              Continental Founders convenings bring together
              founders, universities, professionals,
              institutions, partners and opportunity
              networks around practical conversations.
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
                className="event-details-button event-details-button--outline"
              >
                Contact Us

                <ArrowRight
                  size={16}
                  aria-hidden="true"
                />
              </Link>


              <Link
                to="/events"
                className="event-details-button event-details-button--outline"
              >
                View All Events
              </Link>

            </div>

          </div>

        </div>

      </section>


      {/* ======================================================
          FINAL BRAND BAND
      ====================================================== */}

      <section
        className="event-details-final"
        style={{
          "--event-final-image":
            `url("${eventImage}")`,
        }}
      >

        <div
          className="event-details-final__background"
          aria-hidden="true"
        />

        <div
          className="event-details-final__overlay"
          aria-hidden="true"
        />


        <div className="event-details-container event-details-final__inner">

          <Globe2
            size={30}
            aria-hidden="true"
          />

          <span>
            Continental Founders
          </span>

          <strong>
            Talent is everywhere. Access is not.
          </strong>

          <i
            aria-hidden="true"
          />

        </div>

      </section>


      {/* ======================================================
          SMALL EVENT META BAND
      ====================================================== */}

      <div className="event-details-meta-band">

        <div className="event-details-container event-details-meta-band__inner">

          <span>
            {eventType}
          </span>

          <span>
            {formatShortDate(
              eventDate
            )}
          </span>

          <span>
            {location}
          </span>

        </div>

      </div>

    </main>
  );
}