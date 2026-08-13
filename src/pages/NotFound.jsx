import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import "./NotFound.css";

export default function NotFound() {
  return (
    <section className="not-found section">
      <div className="container">
        <span className="eyebrow">404</span>
        <h1 className="display">This page is not part of the map.</h1>
        <p>The page you requested could not be found.</p>
        <Link className="text-link" to="/"><ArrowLeft size={15} /> Return home</Link>
      </div>
    </section>
  );
}