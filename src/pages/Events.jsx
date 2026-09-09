import React, {
  useEffect,
  useState,
} from "react";

import SectionHeading from "../components/ui/SectionHeading";
import EventList from "../components/sections/EventList";
import CTASection from "../components/sections/CTASection";

import "./Events.css";


export default function Events() {

  // ============================================================
  // STATE
  // ============================================================

  const [events, setEvents] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  // ============================================================
  // API URL
  // ============================================================

  const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000";


  // ============================================================
  // LOAD EVENTS
  // ============================================================

  useEffect(() => {

    let mounted = true;


    async function loadEvents() {

      try {

        setLoading(true);
        setError("");


        const response =
          await fetch(
            `${API_URL}/api/events`
          );


        const result =
          await response.json();


        if (!response.ok) {

          throw new Error(
            result.message ||
            "Unable to load events."
          );

        }


        if (mounted) {

          setEvents(
            Array.isArray(result.events)
              ? result.events
              : []
          );

        }

      } catch (error) {

        console.error(
          "Events loading error:",
          error
        );


        if (mounted) {

          setError(
            "We could not load the events calendar at the moment."
          );

        }

      } finally {

        if (mounted) {

          setLoading(false);

        }

      }

    }


    loadEvents();


    return () => {

      mounted = false;

    };

  }, [API_URL]);


  // ============================================================
  // PAGE
  // ============================================================

  return (
    <main className="events-page">

      {/* ======================================================
          HERO
      ====================================================== */}

      <section className="page-hero">

        <div className="container page-hero__inner">

          <div>

            <span className="eyebrow eyebrow--light">
              Events & Convenings
            </span>

            <h1>
              Where relationships find a room to grow.
            </h1>

          </div>


          <div className="page-hero__aside">

            <p>
              Curated conversations, roundtables, forums,
              and knowledge exchange designed around
              practical institutional questions.
            </p>

          </div>

        </div>

      </section>


      {/* ======================================================
          INTRODUCTION
      ====================================================== */}

      <section className="section events-intro">

        <div className="container events-intro__grid">

          <span className="eyebrow">
            Why Convene
          </span>


          <div>

            <h2 className="display">
              The right conversation can be the beginning
              of a durable partnership.
            </h2>

            <p>
              Our convenings are designed to bring relevant
              people into focused conversations where
              opportunities can be identified, tested,
              and moved toward action.
            </p>

          </div>

        </div>

      </section>


      {/* ======================================================
          EVENTS CALENDAR
      ====================================================== */}

      <section className="section section--light">

        <div className="container">

          <SectionHeading
            eyebrow="Calendar"
            title="Upcoming and planned programming."
          />


          {/* LOADING */}

          {loading && (

            <div className="events-status">

              <p>
                Loading upcoming events...
              </p>

            </div>

          )}


          {/* ERROR */}

          {!loading && error && (

            <div
              className="
                events-status
                events-status--error
              "
            >

              <p>
                {error}
              </p>


              <button
                type="button"
                onClick={() =>
                  window.location.reload()
                }
              >
                Try Again
              </button>

            </div>

          )}


          {/* EMPTY */}

          {!loading &&
            !error &&
            events.length === 0 && (

              <div className="events-status">

                <h3>
                  New convenings are being prepared.
                </h3>

                <p>
                  Upcoming Continental Founders events
                  and programming will appear here.
                </p>

              </div>

            )}


          {/* EVENTS */}

          {!loading &&
            !error &&
            events.length > 0 && (

              <EventList
                events={events}
              />

            )}

        </div>

      </section>


      {/* ======================================================
          CTA
      ====================================================== */}

      <CTASection
        eyebrow="Host or Collaborate"
        title="Have a convening that should be in the room?"
        text="We welcome conversations with institutions and organizations interested in co-creating thoughtful forums and knowledge exchange opportunities."
      />

    </main>
  );
}