import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  UserRound,
  Share2,
} from "lucide-react";

import "./InsightDetails.css";

export default function InsightDetails() {
  const { slug } = useParams();

  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_BASE_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000";

  useEffect(() => {
    let active = true;

    async function loadInsight() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_BASE_URL}/api/insights/${encodeURIComponent(slug)}`,
          {
            headers: {
              Accept: "application/json",
            },
          }
        );

        const contentType =
          response.headers.get("content-type") || "";

        if (!response.ok) {
          throw new Error(
            `Unable to load insight. Status ${response.status}`
          );
        }

        if (!contentType.includes("application/json")) {
          throw new Error(
            "The server returned an invalid response."
          );
        }

        const data = await response.json();

        if (!active) return;

        setInsight(
          data?.insight || data
        );
      } catch (err) {
        if (!active) return;

        console.error(
          "Insight loading error:",
          err
        );

        setError(
          "We could not load this insight at the moment."
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    if (slug) {
      loadInsight();
    }

    return () => {
      active = false;
    };
  }, [slug, API_BASE_URL]);

  const body = useMemo(() => {
    if (!insight) return [];

    if (Array.isArray(insight.body)) {
      return insight.body;
    }

    if (typeof insight.body === "string") {
      return insight.body
        .split("\n")
        .map((paragraph) => paragraph.trim())
        .filter(Boolean);
    }

    return [];
  }, [insight]);

  if (loading) {
    return (
      <main className="insight-detail">
        <div className="container">
          <div className="insight-state">
            Loading insight...
          </div>
        </div>
      </main>
    );
  }

  if (error || !insight) {
    return (
      <main className="insight-detail">
        <div className="container">
          <div className="insight-state insight-state--error">
            <span>Insight unavailable</span>

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
              <ArrowLeft size={17} />
              Return to insights
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="insight-detail">

      {/* ======================================================
          HERO
      ====================================================== */}

      <section className="insight-hero">

        <div className="insight-hero__glow" />

        <div className="container insight-hero__container">

          <Link
            to="/insights"
            className="insight-back"
          >
            <ArrowLeft size={17} />
            Insights
          </Link>

          <div className="insight-hero__grid">

            <div className="insight-hero__content">

              <span className="insight-kicker">
                {insight.category || "Perspective"}
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

                {insight.author && (
                  <span>
                    <UserRound size={16} />
                    {insight.author}
                  </span>
                )}

                {insight.date && (
                  <span>
                    <CalendarDays size={16} />
                    {insight.date}
                  </span>
                )}

              </div>

            </div>


            <aside className="insight-hero__aside">

              <span className="insight-hero__aside-label">
                Continental Founders
              </span>

              <p>
                Ideas, lessons and perspectives
                shaping meaningful partnerships
                across institutions, sectors and
                continents.
              </p>

              <div className="insight-hero__line" />

              <span className="insight-hero__edition">
                Research • Partnership • Opportunity
              </span>

            </aside>

          </div>

        </div>

      </section>


      {/* ======================================================
          FEATURE IMAGE
      ====================================================== */}

      {insight.image && (
        <section className="insight-feature">

          <div className="container">

            <div className="insight-feature__frame">

              <img
                src={insight.image}
                alt={insight.title}
              />

              <div className="insight-feature__caption">
                Continental Founders™ Insights
              </div>

            </div>

          </div>

        </section>
      )}


      {/* ======================================================
          ARTICLE
      ====================================================== */}

      <section className="insight-content">

        <div className="container insight-content__layout">

          {/* ARTICLE */}

          <article className="insight-article">

            <div className="insight-article__label">
              Perspective
            </div>

            {body.map((paragraph, index) => (
              <p
                key={index}
                className={
                  index === 0
                    ? "insight-article__lead"
                    : ""
                }
              >
                {paragraph}
              </p>
            ))}

          </article>


          {/* SIDE PANEL */}

          <aside className="insight-sidebar">

            <div className="insight-sidebar__card">

              <span className="insight-sidebar__eyebrow">
                Published by
              </span>

              <h3>
                Continental Founders™
              </h3>

              <p>
                Connecting institutions,
                talent, knowledge and
                opportunity across continents.
              </p>

            </div>


            <div className="insight-sidebar__share">

              <span>
                Share this perspective
              </span>

              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
                  window.location.href
                )}`}
                target="_blank"
                rel="noreferrer"
              >
                <Share2 size={16} />
                LinkedIn
                <ArrowUpRight size={16} />
              </a>

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
              Continue exploring
            </span>

            <h2>
              More ideas for a more connected world.
            </h2>

          </div>

          <Link
            to="/insights"
            className="insight-button insight-button--light"
          >
            Explore all insights
            <ArrowUpRight size={18} />
          </Link>

        </div>

      </section>

    </main>
  );
}