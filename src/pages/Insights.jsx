import React, { useMemo, useState } from "react";
import SectionHeading from "../components/ui/SectionHeading";
import InsightCard from "../components/sections/InsightCard";
import { insights } from "../data/insights";
import "./Insights.css";

export default function Insights() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const categories = ["All", ...new Set(insights.map((item) => item.category))];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return insights.filter((item) => {
      const categoryMatch = category === "All" || item.category === category;
      const queryMatch = !q || `${item.title} ${item.excerpt}`.toLowerCase().includes(q);
      return categoryMatch && queryMatch;
    });
  }, [query, category]);

  return (
    <>
      <section className="page-hero">
        <div className="container page-hero__inner">
          <div>
            <span className="eyebrow eyebrow--light">Insights</span>
            <h1>Ideas for a more connected world.</h1>
          </div>
          <div className="page-hero__aside">
            <p>
              Perspectives on partnership, higher education, research, knowledge exchange,
              and cross-continental collaboration.
            </p>
          </div>
        </div>
      </section>

      <section className="section insights-page">
        <div className="container">
          <div className="insights-controls">
            <label>
              <span className="sr-only">Search insights</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search insights"
              />
            </label>
            <div className="insights-filters">
              {categories.map((item) => (
                <button
                  key={item}
                  className={category === item ? "is-active" : ""}
                  onClick={() => setCategory(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <SectionHeading
            eyebrow="Perspective"
            title={`${filtered.length} ${filtered.length === 1 ? "insight" : "insights"} available`}
            text="This editorial space is ready for verified organizational stories, research perspectives, partnership lessons, and field notes."
          />

          <div className="insights-grid">
            {filtered.map((insight) => <InsightCard key={insight.slug} insight={insight} />)}
          </div>

          {!filtered.length && (
            <div className="insights-empty">
              No insights match your search. Try another keyword or category.
            </div>
          )}
        </div>
      </section>
    </>
  );
}