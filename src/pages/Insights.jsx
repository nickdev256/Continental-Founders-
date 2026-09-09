import React, { useEffect, useMemo, useState } from "react";

import SectionHeading from "../components/ui/SectionHeading";
import InsightCard from "../components/sections/InsightCard";

import "./Insights.css";

export default function Insights() {
  const [insights, setInsights] = useState([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ============================================================
     BACKEND URL
  ============================================================ */

  const API_BASE_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000";

  /* ============================================================
     LOAD INSIGHTS FROM BACKEND
  ============================================================ */

  useEffect(() => {
    let active = true;

    async function loadInsights() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_BASE_URL}/api/insights`,
          {
            method: "GET",
            headers: {
              Accept: "application/json",
            },
          }
        );

        const contentType =
          response.headers.get("content-type") || "";

        if (!response.ok) {
          throw new Error(
            `Unable to load insights. Status: ${response.status}`
          );
        }

        if (
          !contentType.includes("application/json")
        ) {
          const responseText =
            await response.text();

          console.error(
            "Expected JSON but received:",
            responseText.slice(0, 200)
          );

          throw new Error(
            "The server returned an invalid response."
          );
        }

        const data =
          await response.json();

        if (!active) return;

        /*
          Supports:

          [
            {...},
            {...}
          ]

          OR

          {
            success: true,
            insights: [...]
          }
        */

        const items =
          Array.isArray(data)
            ? data
            : Array.isArray(data.insights)
            ? data.insights
            : [];

        setInsights(items);

      } catch (err) {
        if (!active) return;

        console.error(
          "Insights loading error:",
          err
        );

        setError(
          "We could not load insights at the moment. Please try again shortly."
        );

      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadInsights();

    return () => {
      active = false;
    };
  }, [API_BASE_URL]);

  /* ============================================================
     CATEGORIES
  ============================================================ */

  const categories =
    useMemo(() => {
      const uniqueCategories =
        insights
          .map(
            (item) =>
              item.category
          )
          .filter(Boolean);

      return [
        "All",
        ...new Set(
          uniqueCategories
        ),
      ];
    }, [insights]);

  /* ============================================================
     SEARCH + FILTER
  ============================================================ */

  const filtered =
    useMemo(() => {
      const q =
        query
          .trim()
          .toLowerCase();

      return insights.filter(
        (item) => {

          const categoryMatch =
            category === "All" ||
            item.category === category;

          const searchableText = `
            ${item.title || ""}
            ${item.excerpt || ""}
            ${item.category || ""}
            ${item.author || ""}
          `.toLowerCase();

          const queryMatch =
            !q ||
            searchableText.includes(q);

          return (
            categoryMatch &&
            queryMatch
          );
        }
      );

    }, [
      insights,
      query,
      category,
    ]);

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <>
      {/* ========================================================
          HERO
      ======================================================== */}

      <section className="page-hero">

        <div className="container page-hero__inner">

          <div>

            <span className="eyebrow eyebrow--light">
              Insights
            </span>

            <h1>
              Ideas for a more connected world.
            </h1>

          </div>


          <div className="page-hero__aside">

            <p>
              Perspectives on partnership,
              higher education, research,
              knowledge exchange,
              entrepreneurship, and
              cross-continental collaboration.
            </p>

          </div>

        </div>

      </section>


      {/* ========================================================
          INSIGHTS
      ======================================================== */}

      <section className="section insights-page">

        <div className="container">

          {/* ====================================================
              SEARCH + FILTERS
          ==================================================== */}

          <div className="insights-controls">

            <label>

              <span className="sr-only">
                Search insights
              </span>

              <input
                type="search"
                value={query}
                onChange={
                  (e) =>
                    setQuery(
                      e.target.value
                    )
                }
                placeholder="Search insights"
                aria-label="Search insights"
              />

            </label>


            <div className="insights-filters">

              {categories.map(
                (item) => (

                  <button
                    key={item}
                    type="button"
                    className={
                      category === item
                        ? "is-active"
                        : ""
                    }
                    onClick={() =>
                      setCategory(item)
                    }
                  >
                    {item}
                  </button>

                )
              )}

            </div>

          </div>


          {/* ====================================================
              LOADING
          ==================================================== */}

          {loading && (

            <div className="insights-status">
              Loading insights...
            </div>

          )}


          {/* ====================================================
              ERROR
          ==================================================== */}

          {!loading && error && (

            <div
              className="insights-error"
              role="alert"
            >
              {error}
            </div>

          )}


          {/* ====================================================
              CONTENT
          ==================================================== */}

          {!loading &&
            !error && (
              <>

                <SectionHeading
                  eyebrow="Perspective"
                  title={`${filtered.length} ${
                    filtered.length === 1
                      ? "insight"
                      : "insights"
                  } available`}
                  text="Explore organizational stories, research perspectives, partnership lessons, founder experiences, and field notes from the Continental Founders network."
                />


                <div className="insights-grid">

                  {filtered.map(
                    (insight) => (

                      <InsightCard
                        key={
                          insight.id ||
                          insight.slug
                        }
                        insight={
                          insight
                        }
                      />

                    )
                  )}

                </div>


                {!filtered.length && (

                  <div className="insights-empty">
                    No insights match your search.
                    Try another keyword or category.
                  </div>

                )}

              </>
            )}

        </div>

      </section>
    </>
  );
}