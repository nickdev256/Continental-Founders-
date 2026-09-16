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
  CalendarDays,
  Clock3,
  ExternalLink,
  Globe2,
  MapPin,
  RefreshCw,
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
  const { slug } =
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
    let cancelled =
      false;

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
          if (!cancelled) {
            setEvent(null);

            setError(
              result?.message ||
              "Event not found."
            );
          }

          return;
        }

        if (!response.ok) {
          throw new Error(
            result?.message ||
            result?.error ||
            "Unable to load this event."
          );
        }

        if (!cancelled) {
          setEvent(
            result?.event ||
            result?.data ||
            null
          );
        }
      } catch (requestError) {
        console.error(
          "Event details error:",
          requestError
        );

        if (!cancelled) {
          setEvent(null);

          setError(
            requestError?.message ||
            "Unable to load this event."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (slug) {
      loadEvent();
    } else {
      setLoading(false);

      setError(
        "Event not found."
      );
    }

    return () => {
      cancelled =
        true;
    };
  }, [slug]);


  /* ==========================================================
     NORMALIZED DATA
  ========================================================== */

  const eventDate =
    useMemo(
      () =>
        getEventDate(
          event
        ),
      [event]
    );

  const dateBlock =
    useMemo(
      () =>
        formatDateBlock(
          eventDate
        ),
      [eventDate]
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

  if (loading) {
    return (
      <main className="event-details-page">
        <section className="event-details-state">
          <div className="event-details-container event-details-state__inner">
            <RefreshCw
              size={30}
              className="event-details-spinner"
              aria-hidden="true"
            />

            <span className="event-details-eyebrow">
              Loading Event
            </span>

            <h1>
              Loading event details...
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
     NOT FOUND
  ========================================================== */

  if (
    error ||
    !event
  ) {
    return (
      <main className="event-details-page">
        <section className="event-details-state">
          <div className="event-details-container event-details-state__inner">
            <CalendarDays
              size={34}
              aria-hidden="true"
            />

            <span className="event-details-eyebrow">
              Event Not Found
            </span>

            <h1>
              We couldn't find this event.
            </h1>

            <p>
              {error ||
                "The event may have been removed, renamed, unpublished, or the link may be incorrect."}
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

        <div className="event-details-container event-details-hero__inner">

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

            <span className="event-details-hero__type">
              {eventType}
            </span>

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

              <div>
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
                <div>
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

              <div>
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

            </div>

          </aside>

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

          <div className="event-details-heading">

            <div>
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

            <article className="event-details-overview__content">

              <h3>
                About the Event
              </h3>

              {content ? (
                content
                  .split(/\n{2,}/)
                  .filter(Boolean)
                  .map(
                    (
                      paragraph,
                      index
                    ) => (
                      <p
                        key={index}
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

            </article>


            <aside className="event-details-information">

              <h3>
                Event Information
              </h3>

              <div className="event-details-information__item">
                <CalendarDays
                  size={19}
                  aria-hidden="true"
                />

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
                  <CalendarDays
                    size={19}
                    aria-hidden="true"
                  />

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
                  <Clock3
                    size={19}
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


              <div className="event-details-information__item">
                <MapPin
                  size={19}
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


              <div className="event-details-information__item">
                <Users
                  size={19}
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

            </aside>

          </div>

        </div>
      </section>


      {/* ======================================================
          WHY IT MATTERS
      ====================================================== */}

      <section className="event-details-purpose">

        <div className="event-details-container">

          <div className="event-details-heading event-details-heading--light">

            <div>
              <span className="event-details-number">
                02
              </span>

              <span className="event-details-eyebrow event-details-eyebrow--light">
                Why We Convene
              </span>
            </div>

            <h2>
              Relationships create
              pathways to opportunity.
            </h2>

          </div>


          <div className="event-details-purpose__grid">

            <article>
              <span>
                01
              </span>

              <h3>
                Connect
              </h3>

              <p>
                Bring founders, institutions, professionals,
                and partners into the same conversation.
              </p>
            </article>


            <article>
              <span>
                02
              </span>

              <h3>
                Exchange
              </h3>

              <p>
                Create room for useful knowledge, experience,
                and practical insight to move across networks.
              </p>
            </article>


            <article>
              <span>
                03
              </span>

              <h3>
                Act
              </h3>

              <p>
                Move promising conversations toward
                relationships, collaboration, and opportunity.
              </p>
            </article>

          </div>

        </div>

      </section>


      {/* ======================================================
          EVENT IMAGE
      ====================================================== */}

      <section className="event-details-feature">

        <div className="event-details-container">

          <div className="event-details-feature__image">
            <img
              src={eventImage}
              alt={
                event.title ||
                "Continental Founders event"
              }
            />
          </div>

        </div>

      </section>


      {/* ======================================================
          REGISTRATION / CONNECTION
      ====================================================== */}

      <section className="event-details-connect">

        <div className="event-details-container event-details-connect__grid">

          <div>
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
              institutions, partners, and opportunity networks
              around practical conversations.
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
                Contact Continental Founders

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
          FINAL BAND
      ====================================================== */}

      <section className="event-details-final">

        <div className="event-details-container event-details-final__inner">

          <Globe2
            size={28}
            aria-hidden="true"
          />

          <span>
            Continental Founders
          </span>

          <strong>
            Talent is everywhere.
            Access is not.
          </strong>

        </div>

      </section>

    </main>
  );
}