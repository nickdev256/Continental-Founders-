import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import "./InsightCard.css";

export default function InsightCard({ insight }) {
  return (
    <article className="insight-card">
      <Link to={`/insights/${insight.slug}`} className="insight-card__image">
        <img src={insight.image} alt="" loading="lazy" />
      </Link>
      <div className="insight-card__body">
        <div className="insight-card__meta">
          <span>{insight.category}</span>
          <span>{insight.date}</span>
        </div>
        <h3><Link to={`/insights/${insight.slug}`}>{insight.title}</Link></h3>
        <p>{insight.excerpt}</p>
        <Link className="text-link" to={`/insights/${insight.slug}`}>Read insight <ArrowUpRight size={15} /></Link>
      </div>
    </article>
  );
}