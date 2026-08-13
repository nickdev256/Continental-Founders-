import React from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { insights } from "../data/insights";
import "./InsightDetails.css";

export default function InsightDetails() {
  const { slug } = useParams();
  const insight = insights.find((item) => item.slug === slug);

  if (!insight) {
    return (
      <section className="section">
        <div className="container">
          <span className="eyebrow">Insight not found</span>
          <h1 className="display insight-not-found">We couldn't find that article.</h1>
          <Link className="text-link" to="/insights"><ArrowLeft size={15} /> Back to insights</Link>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="article-hero">
        <div className="container">
          <Link className="article-back" to="/insights"><ArrowLeft size={15} /> All insights</Link>
          <div className="article-meta">
            <span>{insight.category}</span>
            <span>{insight.date}</span>
          </div>
          <h1 className="display">{insight.title}</h1>
          <p>{insight.excerpt}</p>
        </div>
      </section>

      <article className="article">
        <div className="container">
          <figure className="article-image">
            <img src={insight.image} alt="" />
          </figure>
          <div className="article-layout">
            <div className="article-share">
              <span>Share</span>
              <a href="#" aria-label="Share on LinkedIn"><ArrowUpRight size={15} /></a>
            </div>
            <div className="prose">
              {insight.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              <h2>What this means in practice</h2>
              <p>
                Partnership work benefits from clarity. Institutions can begin by identifying
                the question they are trying to solve, the people who need to be in the room,
                and the smallest credible next step.
              </p>
              <p>
                That approach creates room for trust to develop while keeping the work connected
                to real institutional priorities.
              </p>
            </div>
          </div>
        </div>
      </article>
    </>
  );
}