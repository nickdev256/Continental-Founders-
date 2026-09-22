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
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Check,
  Clock3,
  Copy,
  Linkedin,
  UserRound,
} from "lucide-react";

import "./InsightDetails.css";


/* ============================================================
   API
============================================================ */

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(/\/+$/, "");


/* ============================================================
   HELPERS
============================================================ */

function getImage(insight) {
  return (
    insight?.imageUrl ||
    insight?.image_url ||
    insight?.image ||
    ""
  );
}


function getAuthor(insight) {
  return (
    insight?.author ||
    insight?.author_name ||
    "Continental Founders"
  );
}


function getPublishedDate(
  insight
) {
  return (
    insight?.publishedAt ||
    insight?.published_at ||
    insight?.createdAt ||
    insight?.created_at ||
    ""
  );
}


function formatDate(value) {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return String(value);
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  ).format(date);
}


/*
 * Your CMS currently stores the complete article
 * inside the "content" field.
 *
 * This function preserves paragraphs while making
 * the article easier to read.
 */
function getParagraphs(content) {
  if (!content) {
    return [];
  }

  return String(content)
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n/)
    .map((paragraph) =>
      paragraph.trim()
    )
    .filter(Boolean);
}


function calculateReadingTime(
  content
) {
  if (!content) {
    return 1;
  }

  const words =
    String(content)
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .length;

  return Math.max(
    1,
    Math.ceil(
      words / 220
    )
  );
}


/* ============================================================
   INSIGHT DETAILS
============================================================ */

export default function InsightDetails() {
  const { slug } =
    useParams();

  const [
    insight,
    setInsight,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    copied,
    setCopied,
  ] = useState(false);


  /* ==========================================================
     LOAD EXACT CMS RECORD
  ========================================================== */

  useEffect(() => {
    const controller =
      new AbortController();

    async function loadInsight() {
      try {
        setLoading(true);
        setError("");

        const response =
          await fetch(
            `${API_URL}/api/insights/${encodeURIComponent(
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
          throw new Error(
            "The server returned an unexpected response."
          );
        }

        const result =
          await response.json();

        if (!response.ok) {
          throw new Error(
            result?.message ||
              result?.error ||
              "Unable to load this insight."
          );
        }

        /*
         * Supports the common response structures
         * your backend may return.
         */
        const record =
          result?.insight ||
          result?.data?.insight ||
          result?.data ||
          result;

        if (
          !record ||
          typeof record !==
            "object"
        ) {
          throw new Error(
            "This insight could not be found."
          );
        }

        setInsight(record);
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
          "Insight loading error:",
          requestError
        );

        setError(
          requestError?.message ||
            "We could not load this insight."
        );
      } finally {
        if (
          !controller.signal
            .aborted
        ) {
          setLoading(false);
        }
      }
    }

    if (slug) {
      loadInsight();
    } else {
      setLoading(false);

      setError(
        "No insight was selected."
      );
    }

    return () => {
      controller.abort();
    };
  }, [slug]);


  /* ==========================================================
     CMS DATA
  ========================================================== */

  const articleContent =
    insight?.content || "";

  const paragraphs =
    useMemo(
      () =>
        getParagraphs(
          articleContent
        ),
      [articleContent]
    );

  const readingTime =
    useMemo(
      () =>
        calculateReadingTime(
          articleContent
        ),
      [articleContent]
    );

  const image =
    getImage(insight);

  const author =
    getAuthor(insight);

  const publishedDate =
    formatDate(
      getPublishedDate(
        insight
      )
    );


  /* ==========================================================
     SHARE
  ========================================================== */

  function shareLinkedIn() {
    if (
      typeof window ===
      "undefined"
    ) {
      return;
    }

    const shareUrl =
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
        window.location.href
      )}`;

    window.open(
      shareUrl,
      "_blank",
      "noopener,noreferrer"
    );
  }


  async function copyLink() {
    if (
      typeof window ===
      "undefined"
    ) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        window.location.href
      );

      setCopied(true);

      window.setTimeout(
        () => {
          setCopied(false);
        },
        2000
      );
    } catch (
      copyError
    ) {
      console.error(
        "Copy link error:",
        copyError
      );
    }
  }


  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {
    return (
      <main className="insight-detail">

        <section className="insight-loading">

          <div className="container">

            <div className="insight-loading__content">

              <BookOpen
                size={30}
              />

              <span>
                Loading insight...
              </span>

            </div>

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
    !insight
  ) {
    return (
      <main className="insight-detail">

        <section className="insight-error">

          <div className="container">

            <div className="insight-state insight-state--error">

              <BookOpen
                size={34}
              />

              <span>
                Insight unavailable
              </span>

              <h1>
                We could not find this publication.
              </h1>

              <p>
                {error ||
                  "The requested insight may have been removed."}
              </p>

              <Link
                to="/insights"
                className="insight-button"
              >
                <ArrowLeft
                  size={17}
                />

                Return to Insights
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
    <main className="insight-detail">

      {/* ======================================================
          HERO
      ====================================================== */}

      <section className="insight-hero">

        <div className="insight-hero__background" />

        <div className="insight-hero__glow" />


        <div className="container insight-hero__container">

          <Link
            to="/insights"
            className="insight-back"
          >
            <ArrowLeft
              size={17}
            />

            Back to Insights
          </Link>


          <div className="insight-hero__grid">

            {/* CMS ARTICLE INFORMATION */}

            <div className="insight-hero__content">

              <span className="insight-kicker">
                {insight.category ||
                  "Insight"}
              </span>


              <h1>
                {insight.title}
              </h1>


              {insight.excerpt && (
                <p className="insight-hero__excerpt">
                  {insight.excerpt}
                </p>
              )}


              <div className="insight-hero__meta">

                <span>
                  <UserRound
                    size={16}
                  />

                  {author}
                </span>


                {publishedDate && (
                  <span>
                    <CalendarDays
                      size={16}
                    />

                    {publishedDate}
                  </span>
                )}


                <span>
                  <Clock3
                    size={16}
                  />

                  {readingTime} min read
                </span>

              </div>

            </div>


            {/* ORGANISATION BRANDING */}

            <aside className="insight-hero__aside">

              <span className="insight-hero__aside-label">
                Continental Founders
              </span>

              <p>
                Ideas, lessons and
                perspectives shaping
                meaningful partnerships
                across institutions,
                sectors and continents.
              </p>

              <div className="insight-hero__line" />

              <span className="insight-hero__edition">
                Research
                <i>•</i>
                Partnership
                <i>•</i>
                Opportunity
              </span>

            </aside>

          </div>

        </div>

      </section>


      {/* ======================================================
          ARTICLE AREA
      ====================================================== */}

      <section className="insight-content">

        <div className="container insight-content__layout">

          {/* ==================================================
              ARTICLE COLUMN
          ================================================== */}

          <div className="insight-content__main">

            {/* CMS FEATURED IMAGE */}

            {image && (
              <figure className="insight-feature">

                <div className="insight-feature__frame">

                  <img
                    src={image}
                    alt={
                      insight.title ||
                      "Continental Founders Insight"
                    }
                  />

                </div>

              </figure>
            )}


            {/* CMS ARTICLE */}

            <article className="insight-article">

              <div className="insight-article__top">

                <span className="insight-article__label">
                  {insight.category ||
                    "Insight"}
                </span>


                <span className="insight-article__read">
                  <Clock3
                    size={14}
                  />

                  {readingTime} minute
                  {readingTime === 1
                    ? ""
                    : "s"}{" "}
                  read
                </span>

              </div>


              {paragraphs.length >
              0 ? (
                <div className="insight-article__body">

                  {paragraphs.map(
                    (
                      paragraph,
                      index
                    ) => (
                      <p
                        key={
                          index
                        }
                        className={
                          index ===
                          0
                            ? "insight-article__paragraph insight-article__lead"
                            : "insight-article__paragraph"
                        }
                      >
                        {
                          paragraph
                        }
                      </p>
                    )
                  )}

                </div>
              ) : (
                <div className="insight-article__empty">

                  <BookOpen
                    size={28}
                  />

                  <h3>
                    Article content unavailable
                  </h3>

                  <p>
                    No article content
                    has been added to
                    this insight.
                  </p>

                </div>
              )}


              <footer className="insight-article__footer">

                <div>
                  <span>
                    Written by
                  </span>

                  <strong>
                    {author}
                  </strong>
                </div>


                {publishedDate && (
                  <div>
                    <span>
                      Published
                    </span>

                    <strong>
                      {publishedDate}
                    </strong>
                  </div>
                )}

              </footer>

            </article>

          </div>


          {/* ==================================================
              SIDEBAR
          ================================================== */}

          <aside className="insight-sidebar">

            {/* AUTHOR FROM CMS */}

            <div className="insight-sidebar__card">

              <span className="insight-sidebar__eyebrow">
                Published By
              </span>


              <div className="insight-sidebar__author-profile">

                <div className="insight-sidebar__author-avatar">
                  <UserRound
                    size={23}
                  />
                </div>


                <div>
                  <strong>
                    {author}
                  </strong>

                  <span>
                    {insight.category ||
                      "Continental Founders Insight"}
                  </span>
                </div>

              </div>


              {insight.excerpt && (
                <p>
                  {insight.excerpt}
                </p>
              )}

            </div>


            {/* SHARE */}

            <div className="insight-sidebar__card">

              <span className="insight-sidebar__eyebrow">
                Share this Insight
              </span>


              <h3 className="insight-sidebar__share-title">
                Share this publication
                with your network.
              </h3>


              <button
                type="button"
                className="insight-share-button insight-share-button--linkedin"
                onClick={
                  shareLinkedIn
                }
              >
                <Linkedin
                  size={17}
                />

                Share on LinkedIn

                <ArrowUpRight
                  size={15}
                />
              </button>


              <button
                type="button"
                className="insight-share-button"
                onClick={
                  copyLink
                }
              >
                {copied ? (
                  <Check
                    size={17}
                  />
                ) : (
                  <Copy
                    size={17}
                  />
                )}

                {copied
                  ? "Link copied"
                  : "Copy link"}
              </button>

            </div>


            {/* PUBLICATION DETAILS */}

            <div className="insight-sidebar__card insight-sidebar__details">

              <span className="insight-sidebar__eyebrow">
                Publication Details
              </span>


              <div>
                <BookOpen
                  size={16}
                />

                <span>
                  <small>
                    Category
                  </small>

                  <strong>
                    {insight.category ||
                      "General"}
                  </strong>
                </span>
              </div>


              <div>
                <UserRound
                  size={16}
                />

                <span>
                  <small>
                    Author
                  </small>

                  <strong>
                    {author}
                  </strong>
                </span>
              </div>


              {publishedDate && (
                <div>
                  <CalendarDays
                    size={16}
                  />

                  <span>
                    <small>
                      Published
                    </small>

                    <strong>
                      {publishedDate}
                    </strong>
                  </span>
                </div>
              )}


              <div>
                <Clock3
                  size={16}
                />

                <span>
                  <small>
                    Reading time
                  </small>

                  <strong>
                    {readingTime} minute
                    {readingTime ===
                    1
                      ? ""
                      : "s"}
                  </strong>
                </span>
              </div>

            </div>

          </aside>

        </div>

      </section>


      {/* ======================================================
          BOTTOM CTA
      ====================================================== */}

      <section className="insight-next">

        <div className="container insight-next__inner">

          <div>

            <span>
              Continue Exploring
            </span>

            <h2>
              More ideas for a more
              connected world.
            </h2>

            <p>
              Discover more research,
              perspectives and stories
              from Continental Founders.
            </p>

          </div>


          <Link
            to="/insights"
            className="insight-button insight-button--light"
          >
            Explore All Insights

            <ArrowUpRight
              size={18}
            />
          </Link>

        </div>

      </section>

    </main>
  );
}