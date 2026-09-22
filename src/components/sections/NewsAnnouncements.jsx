import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowRight,
  CalendarDays,
  Newspaper,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import "./NewsAnnouncements.css";


/* ============================================================
   API
============================================================ */

const API_URL =
  (
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000"
  ).replace(/\/$/, "");


/* ============================================================
   HELPERS
============================================================ */

function getImage(item) {
  return (
    item?.imageUrl ||
    item?.image_url ||
    item?.image ||
    item?.coverImage ||
    item?.cover_image ||
    ""
  );
}


function getInsightDate(item) {
  return (
    item?.publishedAt ||
    item?.published_at ||
    item?.createdAt ||
    item?.created_at ||
    null
  );
}


function getEventDate(item) {
  return (
    item?.eventDate ||
    item?.event_date ||
    item?.startDate ||
    item?.start_date ||
    item?.date ||
    item?.publishedAt ||
    item?.published_at ||
    item?.createdAt ||
    item?.created_at ||
    null
  );
}


function formatDate(value) {
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
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );
}


function getTimestamp(value) {
  if (!value) {
    return 0;
  }

  const timestamp =
    new Date(value).getTime();

  return Number.isNaN(
    timestamp
  )
    ? 0
    : timestamp;
}


function getItems(result, key) {
  if (
    Array.isArray(result)
  ) {
    return result;
  }

  if (
    Array.isArray(
      result?.[key]
    )
  ) {
    return result[key];
  }

  if (
    Array.isArray(
      result?.data
    )
  ) {
    return result.data;
  }

  if (
    Array.isArray(
      result?.data?.[key]
    )
  ) {
    return result.data[key];
  }

  return [];
}


function isPublished(item) {
  return (
    String(
      item?.status ||
      "published"
    )
      .trim()
      .toLowerCase() ===
    "published"
  );
}


async function fetchJson(
  path,
  signal
) {
  const response =
    await fetch(
      `${API_URL}${path}`,
      {
        method: "GET",

        headers: {
          Accept:
            "application/json",
        },

        signal,
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
    throw new Error(
      "The server returned an invalid response."
    );
  }

  const result =
    await response.json();

  if (!response.ok) {
    throw new Error(
      result?.message ||
      result?.error ||
      `Request failed with status ${response.status}.`
    );
  }

  return result;
}


/* ============================================================
   NEWS AND ANNOUNCEMENTS
============================================================ */

export default function NewsAnnouncements() {
  const [
    insights,
    setInsights,
  ] = useState([]);

  const [
    events,
    setEvents,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");


  /* ==========================================================
     LOAD CMS DATA
  ========================================================== */

  useEffect(() => {
    const controller =
      new AbortController();

    async function loadContent() {
      try {
        setLoading(true);
        setError("");

        const results =
          await Promise.allSettled([
            fetchJson(
              "/api/insights/published",
              controller.signal
            ),

            fetchJson(
              "/api/events/published",
              controller.signal
            ),
          ]);

        if (
          controller.signal.aborted
        ) {
          return;
        }

        const insightsResult =
          results[0];

        const eventsResult =
          results[1];

        const insightItems =
          insightsResult.status ===
          "fulfilled"
            ? getItems(
                insightsResult.value,
                "insights"
              ).filter(
                isPublished
              )
            : [];

        const eventItems =
          eventsResult.status ===
          "fulfilled"
            ? getItems(
                eventsResult.value,
                "events"
              ).filter(
                isPublished
              )
            : [];

        setInsights(
          insightItems
        );

        setEvents(
          eventItems
        );

        if (
          insightsResult.status ===
            "rejected" &&
          eventsResult.status ===
            "rejected"
        ) {
          throw new Error(
            "News and announcements are temporarily unavailable."
          );
        }
      } catch (requestError) {
        if (
          requestError?.name ===
          "AbortError"
        ) {
          return;
        }

        console.error(
          "News and announcements loading error:",
          requestError
        );

        setError(
          requestError?.message ||
          "We could not load news and announcements."
        );
      } finally {
        if (
          !controller.signal.aborted
        ) {
          setLoading(false);
        }
      }
    }

    loadContent();

    return () => {
      controller.abort();
    };
  }, []);


  /* ==========================================================
     COMBINE AND SORT CONTENT
  ========================================================== */

  const newsItems =
    useMemo(() => {
      const normalizedInsights =
        insights.map(
          (
            insight,
            index
          ) => {
            const date =
              getInsightDate(
                insight
              );

            return {
              id:
                insight?.id ||
                insight?.slug ||
                `insight-${index}`,

              contentType:
                "insight",

              label:
                insight?.category ||
                "Insight",

              title:
                insight?.title ||
                "Continental Founders Insight",

              description:
                insight?.excerpt ||
                insight?.summary ||
                "Explore the latest ideas and perspectives from Continental Founders.",

              image:
                getImage(
                  insight
                ),

              date,

              formattedDate:
                formatDate(
                  date
                ),

              path:
                insight?.slug
                  ? `/insights/${encodeURIComponent(
                      insight.slug
                    )}`
                  : "/insights",
            };
          }
        );

      const normalizedEvents =
        events.map(
          (
            event,
            index
          ) => {
            const date =
              getEventDate(
                event
              );

            return {
              id:
                event?.id ||
                event?.slug ||
                `event-${index}`,

              contentType:
                "event",

              label:
                event?.type ||
                event?.category ||
                "Event",

              title:
                event?.title ||
                "Continental Founders Event",

              description:
                event?.description ||
                event?.summary ||
                "Discover upcoming Continental Founders programming and convenings.",

              image:
                getImage(
                  event
                ),

              date,

              formattedDate:
                formatDate(
                  date
                ),

              path:
                event?.slug
                  ? `/events/${encodeURIComponent(
                      event.slug
                    )}`
                  : "/events",
            };
          }
        );

      return [
        ...normalizedInsights,
        ...normalizedEvents,
      ]
        .sort(
          (
            first,
            second
          ) =>
            getTimestamp(
              second.date
            ) -
            getTimestamp(
              first.date
            )
        )
        .slice(
          0,
          3
        );
    }, [
      insights,
      events,
    ]);


  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <section
      className="cf-news-section"
      aria-labelledby="news-announcements-heading"
    >
      <div className="container">

        <div className="cf-news-section__header">

          <div>

            <span className="eyebrow">
              Latest Updates
            </span>

            <h2 id="news-announcements-heading">
              News &amp; Announcements
            </h2>

            <p>
              Explore the latest Continental Founders
              insights, announcements, events and
              institutional updates.
            </p>

          </div>


          <div className="cf-news-section__actions">

            <Link
              to="/insights"
              className="cf-news-section__all-link"
            >
              View Insights

              <ArrowRight
                size={17}
                aria-hidden="true"
              />
            </Link>

            <Link
              to="/events"
              className="cf-news-section__all-link"
            >
              View Events

              <ArrowRight
                size={17}
                aria-hidden="true"
              />
            </Link>

          </div>

        </div>


        {loading && (
          <div
            className="cf-news-status"
            aria-live="polite"
          >
            Loading news and announcements...
          </div>
        )}


        {!loading &&
          error &&
          newsItems.length === 0 && (
            <div
              className="cf-news-status cf-news-status--error"
              role="alert"
            >
              <Newspaper
                size={28}
                aria-hidden="true"
              />

              <p>
                {error}
              </p>
            </div>
          )}


        {!loading &&
          newsItems.length > 0 && (
            <div className="cf-news-grid">

              {newsItems.map(
                (
                  item
                ) => (
                  <article
                    className="cf-news-card"
                    key={`${item.contentType}-${item.id}`}
                  >

                    {item.image && (
                      <Link
                        to={item.path}
                        className="cf-news-card__media"
                        aria-label={`Open ${item.title}`}
                      >
                        <img
                          src={item.image}
                          alt={item.title}
                          loading="lazy"
                          decoding="async"
                        />

                        <span
                          className={`cf-news-card__source cf-news-card__source--${item.contentType}`}
                        >
                          {item.contentType ===
                          "event"
                            ? "Event"
                            : "Insight"}
                        </span>
                      </Link>
                    )}


                    <div className="cf-news-card__body">

                      <div className="cf-news-card__meta">

                        <span>
                          {item.label}
                        </span>

                        <span>
                          <CalendarDays
                            size={14}
                            aria-hidden="true"
                          />

                          {item.formattedDate}
                        </span>

                      </div>


                      <h3>
                        <Link
                          to={item.path}
                        >
                          {item.title}
                        </Link>
                      </h3>


                      <p>
                        {item.description}
                      </p>


                      <Link
                        to={item.path}
                        className="cf-news-card__link"
                        aria-label={`Read more about ${item.title}`}
                      >
                        {item.contentType ===
                        "event"
                          ? "View Event"
                          : "Read Insight"}

                        <ArrowRight
                          size={16}
                          aria-hidden="true"
                        />
                      </Link>

                    </div>

                  </article>
                )
              )}

            </div>
          )}


        {!loading &&
          !error &&
          newsItems.length === 0 && (
            <div className="cf-news-status">

              <Newspaper
                size={28}
                aria-hidden="true"
              />

              <p>
                No published news or announcements are available yet.
              </p>

            </div>
          )}

      </div>
    </section>
  );
}