import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  CalendarDays,
  BookOpen,
} from "lucide-react";

import "./InsightCard.css";


export default function InsightCard({
  insight,
}) {

  /* ==========================================================
     SAFE VALUES
  ========================================================== */

  const slug =
    insight?.slug ||
    "";


  const title =
    insight?.title ||
    "Untitled Insight";


  const excerpt =
    insight?.excerpt ||
    "Read the latest perspective from Continental Founders.";


  const category =
    insight?.category ||
    "Perspective";


  const image =
    insight?.image ||
    insight?.imageUrl ||
    insight?.image_url ||
    null;


  const publishedDate =
    insight?.publishedAt ||
    insight?.published_at ||
    insight?.createdAt ||
    insight?.created_at ||
    null;


  /* ==========================================================
     FORMAT DATE
  ========================================================== */

  function formatDate(
    value
  ) {

    if (!value) {

      return "";

    }


    const date =
      new Date(
        value
      );


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

      return "";

    }


    return date.toLocaleDateString(
      undefined,
      {
        year:
          "numeric",

        month:
          "short",

        day:
          "numeric",
      }
    );

  }


  const displayDate =
    formatDate(
      publishedDate
    );


  /* ==========================================================
     RENDER
  ========================================================== */

  return (

    <article className="insight-card">

      {/* ======================================================
          IMAGE / FALLBACK
      ====================================================== */}

      <Link
        to={`/insights/${slug}`}
        className="insight-card__image"
        aria-label={`Read ${title}`}
      >

        {image ? (

          <img
            src={image}
            alt=""
            loading="lazy"
          />

        ) : (

          <div className="insight-card__image-fallback">

            <BookOpen
              size={34}
              strokeWidth={1.4}
            />

            <span>
              Continental Founders
            </span>

          </div>

        )}

      </Link>


      {/* ======================================================
          BODY
      ====================================================== */}

      <div className="insight-card__body">

        <div className="insight-card__meta">

          <span>
            {category}
          </span>


          {displayDate && (

            <span className="insight-card__date">

              <CalendarDays
                size={13}
                strokeWidth={1.6}
              />

              {displayDate}

            </span>

          )}

        </div>


        <h3>

          <Link
            to={`/insights/${slug}`}
          >

            {title}

          </Link>

        </h3>


        <p>
          {excerpt}
        </p>


        <Link
          className="text-link"
          to={`/insights/${slug}`}
        >

          Read insight

          <ArrowUpRight
            size={15}
          />

        </Link>

      </div>

    </article>

  );

}