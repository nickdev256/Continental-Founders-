import React, {
  useMemo,
  useState,
} from "react";

import {
  BookOpen,
  CalendarDays,
  ChevronRight,
  FileText,
  Plus,
  Search,
  Tag,
  UserRound,
  X,
} from "lucide-react";

import "./AdminInsights.css";


// ============================================================
// CONTINENTAL FOUNDERS
// ADMIN INSIGHTS
// ============================================================

export default function AdminInsights() {

  // ==========================================================
  // STATE
  // ==========================================================

  const [
    searchQuery,
    setSearchQuery,
  ] =
    useState("");


  const [
    selectedInsight,
    setSelectedInsight,
  ] =
    useState(null);


  // ==========================================================
  // INSIGHTS DATA
  //
  // Leave empty until connected to backend API.
  // ==========================================================

  const [
    insights,
  ] =
    useState([]);


  // ==========================================================
  // FILTER INSIGHTS
  // ==========================================================

  const filteredInsights =
    useMemo(
      () => {

        const query =
          searchQuery
            .trim()
            .toLowerCase();


        if (
          !query
        ) {

          return insights;

        }


        return insights.filter(
          (
            insight
          ) => {

            const searchableText = [
              insight.title,
              insight.excerpt,
              insight.content,
              insight.category,
              insight.author,
              insight.status,
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();


            return searchableText.includes(
              query
            );

          }
        );

      },
      [
        insights,
        searchQuery,
      ]
    );


  // ==========================================================
  // FORMAT DATE
  // ==========================================================

  function formatDate(
    value
  ) {

    if (
      !value
    ) {

      return "Not available";

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

      return value;

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


  // ==========================================================
  // STATUS CLASS
  // ==========================================================

  function getStatusClass(
    status
  ) {

    const normalized =
      String(
        status || ""
      )
        .trim()
        .toLowerCase();


    if (
      normalized ===
      "published"
    ) {

      return "admin-insights__status admin-insights__status--published";

    }


    if (
      normalized ===
      "draft"
    ) {

      return "admin-insights__status admin-insights__status--draft";

    }


    if (
      normalized ===
      "archived"
    ) {

      return "admin-insights__status admin-insights__status--archived";

    }


    return "admin-insights__status";

  }


  // ==========================================================
  // PUBLISHED COUNT
  // ==========================================================

  const publishedCount =
    insights.filter(
      (
        insight
      ) =>
        String(
          insight.status ||
          ""
        ).toLowerCase() ===
        "published"
    ).length;


  // ==========================================================
  // DRAFT COUNT
  // ==========================================================

  const draftCount =
    insights.filter(
      (
        insight
      ) =>
        String(
          insight.status ||
          ""
        ).toLowerCase() ===
        "draft"
    ).length;


  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <div className="admin-insights">

      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <div className="admin-insights__header">

        <div>

          <span className="admin-insights__eyebrow">
            WEBSITE CONTENT
          </span>


          <h1>
            Insights
          </h1>


          <p>
            Manage Continental Founders articles,
            perspectives, research, updates,
            and thought leadership.
          </p>

        </div>


        <button
          type="button"
          className="admin-insights__create"
          onClick={() => {

            console.log(
              "Create insight"
            );

          }}
        >

          <Plus
            size={18}
            strokeWidth={1.8}
          />


          <span>
            New Insight
          </span>

        </button>

      </div>


      {/* ======================================================
          SUMMARY
      ====================================================== */}

      <div className="admin-insights__summary-grid">

        <div className="admin-insights__summary-card">

          <div className="admin-insights__summary-icon">

            <BookOpen
              size={20}
              strokeWidth={1.6}
            />

          </div>


          <div>

            <strong>
              {insights.length}
            </strong>

            <span>
              Total Insights
            </span>

          </div>

        </div>


        <div className="admin-insights__summary-card">

          <div className="admin-insights__summary-icon">

            <FileText
              size={20}
              strokeWidth={1.6}
            />

          </div>


          <div>

            <strong>
              {publishedCount}
            </strong>

            <span>
              Published
            </span>

          </div>

        </div>


        <div className="admin-insights__summary-card">

          <div className="admin-insights__summary-icon">

            <FileText
              size={20}
              strokeWidth={1.6}
            />

          </div>


          <div>

            <strong>
              {draftCount}
            </strong>

            <span>
              Drafts
            </span>

          </div>

        </div>

      </div>


      {/* ======================================================
          TOOLBAR
      ====================================================== */}

      <div className="admin-insights__toolbar">

        <div className="admin-insights__search">

          <Search
            size={18}
            strokeWidth={1.6}
            aria-hidden="true"
          />


          <input
            type="search"
            value={
              searchQuery
            }
            placeholder="Search insights..."
            aria-label="Search insights"
            onChange={(
              event
            ) =>
              setSearchQuery(
                event.target.value
              )
            }
          />


          {searchQuery && (

            <button
              type="button"
              onClick={() =>
                setSearchQuery("")
              }
              aria-label="Clear search"
            >

              <X
                size={16}
                strokeWidth={1.7}
              />

            </button>

          )}

        </div>


        <div className="admin-insights__count">

          {filteredInsights.length}

          {" "}

          {filteredInsights.length === 1
            ? "insight"
            : "insights"}

        </div>

      </div>


      {/* ======================================================
          INSIGHTS PANEL
      ====================================================== */}

      <section className="admin-insights__panel">

        <div className="admin-insights__table-header">

          <span>
            Insight
          </span>

          <span>
            Category
          </span>

          <span>
            Author
          </span>

          <span>
            Status
          </span>

          <span>
            Date
          </span>

          <span />

        </div>


        {filteredInsights.length === 0 ? (

          <div className="admin-insights__empty">

            <div className="admin-insights__empty-icon">

              <BookOpen
                size={28}
                strokeWidth={1.5}
              />

            </div>


            <h3>

              {searchQuery
                ? "No matching insights"
                : "No insights yet"}

            </h3>


            <p>

              {searchQuery
                ? "Try another title, category, author, or keyword."
                : "Insights created through the Continental Founders CMS will appear here."}

            </p>


            {!searchQuery && (

              <button
                type="button"
                onClick={() => {

                  console.log(
                    "Create first insight"
                  );

                }}
              >

                <Plus
                  size={17}
                  strokeWidth={1.8}
                />

                Create your first insight

              </button>

            )}

          </div>

        ) : (

          <div className="admin-insights__list">

            {filteredInsights.map(
              (
                insight,
                index
              ) => {

                const insightId =
                  insight.id ||
                  `${insight.title || "insight"}-${index}`;


                return (

                  <button
                    key={
                      insightId
                    }
                    type="button"
                    className="admin-insights__row"
                    onClick={() =>
                      setSelectedInsight(
                        insight
                      )
                    }
                  >

                    <div className="admin-insights__article">

                      <div className="admin-insights__article-icon">

                        <BookOpen
                          size={18}
                          strokeWidth={1.6}
                        />

                      </div>


                      <div>

                        <strong>
                          {insight.title ||
                            "Untitled Insight"}
                        </strong>


                        <span>
                          {insight.excerpt ||
                            "No excerpt available"}
                        </span>

                      </div>

                    </div>


                    <div className="admin-insights__category">

                      <Tag
                        size={14}
                        strokeWidth={1.6}
                      />


                      <span>
                        {insight.category ||
                          "General"}
                      </span>

                    </div>


                    <div className="admin-insights__author">

                      <UserRound
                        size={14}
                        strokeWidth={1.6}
                      />


                      <span>
                        {insight.author ||
                          insight.author_name ||
                          "Continental Founders"}
                      </span>

                    </div>


                    <div>

                      <span
                        className={
                          getStatusClass(
                            insight.status
                          )
                        }
                      >

                        {insight.status ||
                          "Draft"}

                      </span>

                    </div>


                    <div className="admin-insights__date">

                      <CalendarDays
                        size={14}
                        strokeWidth={1.6}
                      />


                      <span>

                        {formatDate(
                          insight.publishedAt ||
                          insight.published_at ||
                          insight.createdAt ||
                          insight.created_at
                        )}

                      </span>

                    </div>


                    <div className="admin-insights__arrow">

                      <ChevronRight
                        size={17}
                        strokeWidth={1.7}
                      />

                    </div>

                  </button>

                );

              }
            )}

          </div>

        )}

      </section>


      {/* ======================================================
          INSIGHT DETAIL DRAWER
      ====================================================== */}

      {selectedInsight && (

        <div
          className="admin-insights__overlay"
          onClick={() =>
            setSelectedInsight(
              null
            )
          }
          role="presentation"
        >

          <aside
            className="admin-insights__drawer"
            onClick={(
              event
            ) =>
              event.stopPropagation()
            }
            aria-label="Insight details"
          >

            <div className="admin-insights__drawer-header">

              <div>

                <span className="admin-insights__drawer-eyebrow">
                  INSIGHT DETAILS
                </span>


                <h2>
                  {selectedInsight.title ||
                    "Untitled Insight"}
                </h2>

              </div>


              <button
                type="button"
                className="admin-insights__drawer-close"
                onClick={() =>
                  setSelectedInsight(
                    null
                  )
                }
                aria-label="Close insight"
              >

                <X
                  size={20}
                  strokeWidth={1.7}
                />

              </button>

            </div>


            <div className="admin-insights__drawer-body">

              {/* ===============================================
                  STATUS
              =============================================== */}

              <div className="admin-insights__detail-row">

                <span>
                  Status
                </span>


                <span
                  className={
                    getStatusClass(
                      selectedInsight.status
                    )
                  }
                >

                  {selectedInsight.status ||
                    "Draft"}

                </span>

              </div>


              {/* ===============================================
                  CATEGORY
              =============================================== */}

              <div className="admin-insights__detail-card">

                <Tag
                  size={18}
                  strokeWidth={1.6}
                />


                <div>

                  <span>
                    Category
                  </span>

                  <strong>
                    {selectedInsight.category ||
                      "General"}
                  </strong>

                </div>

              </div>


              {/* ===============================================
                  AUTHOR
              =============================================== */}

              <div className="admin-insights__detail-card">

                <UserRound
                  size={18}
                  strokeWidth={1.6}
                />


                <div>

                  <span>
                    Author
                  </span>

                  <strong>

                    {selectedInsight.author ||
                      selectedInsight.author_name ||
                      "Continental Founders"}

                  </strong>

                </div>

              </div>


              {/* ===============================================
                  DATE
              =============================================== */}

              <div className="admin-insights__detail-card">

                <CalendarDays
                  size={18}
                  strokeWidth={1.6}
                />


                <div>

                  <span>
                    Publication Date
                  </span>

                  <strong>

                    {formatDate(
                      selectedInsight.publishedAt ||
                      selectedInsight.published_at ||
                      selectedInsight.createdAt ||
                      selectedInsight.created_at
                    )}

                  </strong>

                </div>

              </div>


              {/* ===============================================
                  EXCERPT
              =============================================== */}

              <div className="admin-insights__excerpt">

                <span>
                  Excerpt
                </span>


                <p>

                  {selectedInsight.excerpt ||
                    "No excerpt has been added."}

                </p>

              </div>


              {/* ===============================================
                  CONTENT
              =============================================== */}

              <div className="admin-insights__content-preview">

                <span>
                  Content
                </span>


                <p>

                  {selectedInsight.content ||
                    "No article content has been added yet."}

                </p>

              </div>


              {/* ===============================================
                  ACTIONS
              =============================================== */}

              <div className="admin-insights__drawer-actions">

                <button
                  type="button"
                  className="admin-insights__edit"
                  onClick={() => {

                    console.log(
                      "Edit insight:",
                      selectedInsight
                    );

                  }}
                >

                  Edit Insight

                </button>

              </div>

            </div>

          </aside>

        </div>

      )}

    </div>

  );

}