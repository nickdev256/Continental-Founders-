import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, Mail } from "lucide-react";
import "./SimplePage.css";

// Where most visitors were probably trying to go
const popular = [
  {
    title: "About us",
    text: "Who we are and why we build across continents.",
    to: "/about",
  },
  {
    title: "Fellowship",
    text: "The six-month CFCV fellowship for founders.",
    to: "/cfcv",
  },
  {
    title: "Events",
    text: "Upcoming convenings and past gatherings.",
    to: "/events",
  },
  {
    title: "Insights",
    text: "News, research and founder perspectives.",
    to: "/insights",
  },
];

export default function NotFound() {
  return (
    <main className="spg-page">
      <section className="spg-hero">
        <div className="spg-container">
          <span className="spg-eyebrow">Page not found</span>

          <h1>
            This page is not part of <em>the map.</em>
          </h1>

          <p className="spg-hero__lead">
            The page you requested could not be found. It may have moved,
            or the link may be mistyped.
          </p>

          <div className="spg-actions">
            <Link className="spg-button spg-button--gold" to="/">
              <ArrowLeft size={18} aria-hidden="true" />
              Return home
            </Link>

            <Link className="spg-button spg-button--ghost" to="/contact">
              <Mail size={18} aria-hidden="true" />
              Contact us
            </Link>
          </div>
        </div>
      </section>

      <section className="spg-body" aria-labelledby="spg-popular-title">
        <div className="spg-container">
          <h2 id="spg-popular-title">Popular pages</h2>

          <ul className="spg-links">
            {popular.map((page) => (
              <li key={page.to}>
                <Link to={page.to}>
                  <strong>
                    {page.title}
                    <ArrowRight size={17} aria-hidden="true" />
                  </strong>
                  <span>{page.text}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
