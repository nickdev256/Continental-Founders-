import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  ArrowRight,
  CalendarDays,
  Lightbulb,
  MapPin,
  Sprout,
  Users,
} from "lucide-react";

import { Link } from "react-router-dom";

import SectionHeading from "../components/ui/SectionHeading";

import "./Events.css";


/* ============================================================
   API
============================================================ */

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";


/* ============================================================
   EVENTS PAGE
============================================================ */

export default function Events() {

  /* ==========================================================
     STATE
  ========================================================== */

  const [
    events,
    setEvents,
  ] =
    useState([]);


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
     LOAD PUBLISHED EVENTS
  ========================================================== */

  const loadEvents =
    useCallback(
      async () => {

        try {

          setLoading(true);
          setError("");


          const response =
            await fetch(
              `${API_URL}/api/events/published`,
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


          let result = {};


          if (
            contentType.includes(
              "application/json"
            )
          ) {

            result =
              await response.json();

          } else {

            const text =
              await response.text();


            console.error(
              "Unexpected events response:",
              text
            );


            throw new Error(
              "The events service returned an unexpected response."
            );

          }


          if (
            !response.ok
          ) {

            throw new Error(
              result.message ||
              result.error ||
              "Unable to load events."
            );

          }


          const eventData =
            Array.isArray(
              result.events
            )
              ? result.events
              : Array.isArray(
                  result.data
                )
                ? result.data
                : Array.isArray(
                    result.data?.events
                  )
                  ? result.data.events
                  : [];


          setEvents(
            eventData
          );

        } catch (
          requestError
        ) {

          console.error(
            "Events loading error:",
            requestError
          );


          setEvents([]);


          setError(
            requestError.message ||
            "We could not load the events calendar at the moment."
          );

        } finally {

          setLoading(false);

        }

      },
      []
    );


  /* ==========================================================
     INITIAL LOAD
  ========================================================== */

  useEffect(
    () => {

      loadEvents();

    },
    [
      loadEvents,
    ]
  );


  /* ==========================================================
     GET EVENT DATE
  ========================================================== */

  function getEventDate(
    event
  ) {

    return (
      event?.eventDate ||
      event?.event_date ||
      event?.startDate ||
      event?.start_date ||
      event?.date ||
      null
    );

  }


  /* ==========================================================
     FORMAT EVENT DATE
  ========================================================== */

  function formatEventDate(
    value
  ) {

    if (
      !value
    ) {

      return {
        day: "--",
        month: "---",
        year: "",
      };

    }


    const date =
      new Date(
        value
      );


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
            day:
              "2-digit",
          }
        ),

      month:
        date
          .toLocaleDateString(
            "en-US",
            {
              month:
                "short",
            }
          )
          .toUpperCase(),

      year:
        date
          .getFullYear()
          .toString(),

    };

  }


  /* ==========================================================
     EVENT IMAGE
  ========================================================== */

  function getEventImage(
    event,
    index
  ) {

    const image =
      event?.imageUrl ||
      event?.image_url ||
      event?.image ||
      event?.coverImage ||
      event?.cover_image ||
      "";


    if (
      image
    ) {

      return image;

    }


    const fallbackImages = [
      "/assets/images/events/event-1.jpg",
      "/assets/images/events/event-2.jpg",
      "/assets/images/events/event-3.jpg",
      "/assets/images/events/event-4.jpg",
    ];


    return fallbackImages[
      index %
      fallbackImages.length
    ];

  }


  /* ==========================================================
     EVENT LOCATION
  ========================================================== */

  function getEventLocation(
    event
  ) {

    return (
      event?.location ||
      event?.city ||
      event?.venue ||
      "Location to be announced"
    );

  }


  /* ==========================================================
     EVENT TYPE
  ========================================================== */

  function getEventType(
    event
  ) {

    return (
      event?.type ||
      event?.category ||
      "Convening"
    );

  }


  /* ==========================================================
     EVENT TITLE
  ========================================================== */

  function getEventTitle(
    event
  ) {

    return (
      event?.title ||
      "Continental Founders Event"
    );

  }


  /* ==========================================================
     EVENT DESCRIPTION
  ========================================================== */

  function getEventDescription(
    event
  ) {

    return (
      event?.description ||
      event?.summary ||
      "A Continental Founders convening designed to connect people, ideas, and opportunities."
    );

  }


  /* ==========================================================
     SCROLL TO EVENTS
  ========================================================== */

  function scrollToEvents() {

    const section =
      document.getElementById(
        "events-calendar"
      );


    if (
      section
    ) {

      section.scrollIntoView({
        behavior:
          "smooth",

        block:
          "start",
      });

    }

  }


  /* ==========================================================
     PAGE
  ========================================================== */

  return (

    <main className="events-page">

      {/* ======================================================
          HERO
      ====================================================== */}

      <section className="events-hero">

        <div className="events-hero__media" />

        <div className="events-hero__overlay" />


        <div className="container events-hero__inner">

          <div className="events-hero__content">

            <span className="eyebrow eyebrow--light">
              Events & Convenings
            </span>


            <h1>
              Where relationships
              <br />

              find a{" "}

              <em>
                room to grow.
              </em>
            </h1>


            <p>
              Curated conversations, roundtables,
              forums, and knowledge exchange designed
              around practical institutional questions.
            </p>


            <button
              type="button"
              className="events-hero__cta"
              onClick={
                scrollToEvents
              }
            >

              <span>
                Explore Our Events
              </span>

              <ArrowRight
                size={18}
                strokeWidth={1.8}
              />

            </button>

          </div>


          <div className="events-hero__aside">

            <span>
              PEOPLE
            </span>

            <span>
              IDEAS
            </span>

            <span>
              OPPORTUNITIES
            </span>

            <strong>
              A STRONGER AFRICA
            </strong>

          </div>

        </div>

      </section>


      {/* ======================================================
          WHY CONVENE
      ====================================================== */}

      <section className="section events-intro">

        <div className="container">

          <div className="events-intro__grid">

            <div className="events-intro__heading">

              <span className="eyebrow">
                Why Convene
              </span>


              <h2>
                The right conversation can be the beginning
                of a durable partnership.
              </h2>

            </div>


            <div className="events-intro__content">

              <p>
                Our convenings are designed to bring relevant
                people into focused conversations where
                opportunities can be identified, tested,
                and moved toward action.
              </p>


              <div className="events-intro__pillars">

                <div className="events-intro__pillar">

                  <Users
                    size={23}
                    strokeWidth={1.6}
                  />

                  <span>
                    Meaningful Connections
                  </span>

                </div>


                <div className="events-intro__pillar">

                  <Lightbulb
                    size={23}
                    strokeWidth={1.6}
                  />

                  <span>
                    Practical Insights
                  </span>

                </div>


                <div className="events-intro__pillar">

                  <Sprout
                    size={23}
                    strokeWidth={1.6}
                  />

                  <span>
                    Real Opportunities
                  </span>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ======================================================
          EVENTS CALENDAR
      ====================================================== */}

      <section
        className="section events-calendar"
        id="events-calendar"
      >

        <div className="container">

          <div className="events-calendar__header">

            <SectionHeading
              eyebrow="Calendar"
              title="Upcoming and planned programming."
            />


            {events.length > 0 && (

              <button
                type="button"
                className="events-calendar__view-all"
                onClick={
                  scrollToEvents
                }
              >

                <span>
                  View All Events
                </span>

                <ArrowRight
                  size={16}
                  strokeWidth={1.7}
                />

              </button>

            )}

          </div>


          {/* ==================================================
              LOADING
          ================================================== */}

          {loading && (

            <div
              className="events-status"
              aria-live="polite"
            >

              <div className="events-status__loader" />

              <p>
                Loading upcoming events...
              </p>

            </div>

          )}


          {/* ==================================================
              ERROR
          ================================================== */}

          {!loading &&
            error && (

              <div
                className="events-status events-status--error"
                role="alert"
              >

                <CalendarDays
                  size={30}
                  strokeWidth={1.5}
                />


                <span className="eyebrow">
                  Calendar Unavailable
                </span>


                <h3>
                  We could not load the event calendar.
                </h3>


                <p>
                  {error}
                </p>


                <button
                  type="button"
                  onClick={
                    loadEvents
                  }
                >
                  Try Again
                </button>

              </div>

            )}


          {/* ==================================================
              EMPTY
          ================================================== */}

          {!loading &&
            !error &&
            events.length === 0 && (

              <div className="events-status">

                <CalendarDays
                  size={30}
                  strokeWidth={1.5}
                />


                <span className="eyebrow">
                  Coming Soon
                </span>


                <h3>
                  New convenings are being prepared.
                </h3>


                <p>
                  Upcoming Continental Founders events
                  and programming will appear here as
                  they are published.
                </p>

              </div>

            )}


          {/* ==================================================
              EVENT CARDS
          ================================================== */}

          {!loading &&
            !error &&
            events.length > 0 && (

              <div className="events-grid">

                {events.map(
                  (
                    event,
                    index
                  ) => {

                    const rawDate =
                      getEventDate(
                        event
                      );


                    const date =
                      formatEventDate(
                        rawDate
                      );


                    const location =
                      getEventLocation(
                        event
                      );


                    const eventType =
                      getEventType(
                        event
                      );


                    const title =
                      getEventTitle(
                        event
                      );


                    const description =
                      getEventDescription(
                        event
                      );


                    return (

                      <article
                        className="event-card"
                        key={
                          event.id ||
                          event.slug ||
                          `${title}-${index}`
                        }
                      >

                        <div className="event-card__media">

                          <img
                            src={
                              getEventImage(
                                event,
                                index
                              )
                            }
                            alt={title}
                            loading="lazy"
                          />


                          <div className="event-card__date">

                            <strong>
                              {date.day}
                            </strong>

                            <span>
                              {date.month}
                            </span>

                            <small>
                              {date.year}
                            </small>

                          </div>

                        </div>


                        <div className="event-card__body">

                          <span className="event-card__type">
                            {eventType}
                          </span>


                          <h3>
                            {title}
                          </h3>


                          <div className="event-card__location">

                            <MapPin
                              size={15}
                              strokeWidth={1.8}
                            />

                            <span>
                              {location}
                            </span>

                          </div>


                          <p>
                            {description}
                          </p>


                          {event.slug ? (

                            <Link
                              to={`/events/${event.slug}`}
                              className="event-card__link"
                            >

                              <span>
                                Learn More
                              </span>

                              <ArrowRight
                                size={15}
                                strokeWidth={1.8}
                              />

                            </Link>

                          ) : (

                            <button
                              type="button"
                              className="event-card__link"
                              disabled
                            >

                              <span>
                                Learn More
                              </span>

                              <ArrowRight
                                size={15}
                                strokeWidth={1.8}
                              />

                            </button>

                          )}

                        </div>

                      </article>

                    );

                  }
                )}

              </div>

            )}

        </div>

      </section>


      {/* ======================================================
          CTA
      ====================================================== */}

      <section className="events-cta">

        <div className="events-cta__background" />

        <div className="events-cta__overlay" />


        <div className="container events-cta__inner">

          <div className="events-cta__heading">

            <span className="events-cta__eyebrow">
              HOST OR COLLABORATE
            </span>


            <h2>
              Have a convening that
              <br />
              should be in the room?
            </h2>

          </div>


          <div className="events-cta__content">

            <p>
              We welcome conversations with institutions
              and organizations interested in co-creating
              thoughtful forums and knowledge exchange
              opportunities.
            </p>


            <Link
              to="/contact"
              className="events-cta__button"
            >

              <span>
                Start a Conversation
              </span>

              <ArrowRight
                size={17}
                strokeWidth={1.8}
              />

            </Link>

          </div>


          <div className="events-cta__mark">

            <strong>
              A STRONGER
              <br />
              AFRICA
              <br />
              TOGETHER
            </strong>

          </div>

        </div>

      </section>

    </main>

  );

}