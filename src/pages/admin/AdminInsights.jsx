import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  BookOpen,
  CalendarDays,
  ChevronRight,
  FileText,
  Plus,
  RefreshCw,
  Save,
  Search,
  Tag,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

import "./AdminInsights.css";


/* ============================================================
   API
============================================================ */

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";


/* ============================================================
   INITIAL FORM
============================================================ */

const initialForm = {
  title: "",
  excerpt: "",
  content: "",
  category: "",
  author: "",
  status: "draft",
  publishedAt: "",
};


/* ============================================================
   ADMIN INSIGHTS
============================================================ */

export default function AdminInsights() {

  /* ==========================================================
     STATE
  ========================================================== */

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


  const [
    insights,
    setInsights,
  ] =
    useState([]);


  const [
    loading,
    setLoading,
  ] =
    useState(true);


  const [
    error,
    setError,
  ] =
    useState("");


  const [
    formOpen,
    setFormOpen,
  ] =
    useState(false);


  const [
    editingInsight,
    setEditingInsight,
  ] =
    useState(null);


  const [
    form,
    setForm,
  ] =
    useState(initialForm);


  const [
    formError,
    setFormError,
  ] =
    useState("");


  const [
    saving,
    setSaving,
  ] =
    useState(false);


  const [
    deleting,
    setDeleting,
  ] =
    useState(false);


  /* ==========================================================
     REFS
  ========================================================== */

  const titleInputRef =
    useRef(null);


  /* ==========================================================
     LOAD INSIGHTS
  ========================================================== */

  const loadInsights =
    useCallback(
      async () => {

        try {

          setLoading(true);
          setError("");


          const response =
            await fetch(
              `${API_URL}/api/insights`,
              {
                method: "GET",

                headers: {
                  Accept:
                    "application/json",
                },

                credentials:
                  "include",
              }
            );


          const contentType =
            response.headers.get(
              "content-type"
            ) || "";


          let result = {};


          if (
            contentType.includes(
              "application/json"
            )
          ) {

            result =
              await response.json();

          } else {

            const text =
              await response.text();


            console.error(
              "Unexpected insights response:",
              text
            );


            throw new Error(
              "The insights service returned an unexpected response."
            );

          }


          if (!response.ok) {

            throw new Error(
              result.message ||
              result.error ||
              "Unable to load insights."
            );

          }


          const insightData =
            Array.isArray(
              result.insights
            )
              ? result.insights
              : Array.isArray(
                  result.data
                )
                ? result.data
                : Array.isArray(
                    result.data?.insights
                  )
                  ? result.data.insights
                  : [];


          setInsights(
            insightData
          );

        } catch (
          requestError
        ) {

          console.error(
            "Admin insights loading error:",
            requestError
          );


          setInsights([]);


          setError(
            requestError.message ||
            "Unable to load insights."
          );

        } finally {

          setLoading(false);

        }

      },
      []
    );


  /* ==========================================================
     INITIAL LOAD
  ========================================================== */

  useEffect(
    () => {

      loadInsights();

    },
    [
      loadInsights,
    ]
  );


  /* ==========================================================
     FOCUS TITLE
  ========================================================== */

  useEffect(
    () => {

      if (!formOpen) {

        return undefined;

      }


      const timer =
        window.setTimeout(
          () => {

            titleInputRef
              .current
              ?.focus();

          },
          120
        );


      return () => {

        window.clearTimeout(
          timer
        );

      };

    },
    [
      formOpen,
    ]
  );


  /* ==========================================================
     FILTER
  ========================================================== */

  const filteredInsights =
    useMemo(
      () => {

        const query =
          searchQuery
            .trim()
            .toLowerCase();


        if (!query) {

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
              insight.author_name,
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


  /* ==========================================================
     COUNTS
  ========================================================== */

  const publishedCount =
    useMemo(
      () => {

        return insights.filter(
          (
            insight
          ) =>
            String(
              insight.status || ""
            )
              .trim()
              .toLowerCase() ===
            "published"
        ).length;

      },
      [
        insights,
      ]
    );


  const draftCount =
    useMemo(
      () => {

        return insights.filter(
          (
            insight
          ) =>
            String(
              insight.status || ""
            )
              .trim()
              .toLowerCase() ===
            "draft"
        ).length;

      },
      [
        insights,
      ]
    );


  /* ==========================================================
     CREATE SLUG
  ========================================================== */

  function createSlug(
    value
  ) {

    return String(
      value || ""
    )
      .toLowerCase()
      .trim()
      .replace(
        /['’"]/g,
        ""
      )
      .replace(
        /[^a-z0-9]+/g,
        "-"
      )
      .replace(
        /^-+|-+$/g,
        ""
      );

  }


  /* ==========================================================
     DATE TO INPUT
  ========================================================== */

  function toDateInput(
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


    return date
      .toISOString()
      .slice(
        0,
        10
      );

  }


  /* ==========================================================
     FORMAT DATE
  ========================================================== */

  function formatDate(
    value
  ) {

    if (!value) {

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


  /* ==========================================================
     GET AUTHOR
  ========================================================== */

  function getAuthor(
    insight
  ) {

    return (
      insight?.author ||
      insight?.author_name ||
      "Continental Founders"
    );

  }


  /* ==========================================================
     GET PUBLISHED DATE
  ========================================================== */

  function getPublishedDate(
    insight
  ) {

    return (
      insight?.publishedAt ||
      insight?.published_at ||
      insight?.createdAt ||
      insight?.created_at ||
      null
    );

  }


  /* ==========================================================
     STATUS CLASS
  ========================================================== */

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


  /* ==========================================================
     FORM CHANGE
  ========================================================== */

  function handleFormChange(
    event
  ) {

    const {
      name,
      value,
    } =
      event.target;


    setForm(
      (
        current
      ) => ({
        ...current,

        [name]:
          value,
      })
    );


    if (
      formError
    ) {

      setFormError("");

    }

  }


  /* ==========================================================
     OPEN CREATE
  ========================================================== */

  function handleCreateInsight() {

    setSelectedInsight(
      null
    );


    setEditingInsight(
      null
    );


    setForm({
      ...initialForm,

      author:
        "Continental Founders",
    });


    setFormError("");


    setFormOpen(
      true
    );

  }


  /* ==========================================================
     OPEN EDIT
  ========================================================== */

  function handleEditInsight(
    insight
  ) {

    setSelectedInsight(
      null
    );


    setEditingInsight(
      insight
    );


    setForm({

      title:
        insight.title ||
        "",

      excerpt:
        insight.excerpt ||
        "",

      content:
        insight.content ||
        "",

      category:
        insight.category ||
        "",

      author:
        getAuthor(
          insight
        ),

      status:
        insight.status ||
        "draft",

      publishedAt:
        toDateInput(
          getPublishedDate(
            insight
          )
        ),

    });


    setFormError("");


    setFormOpen(
      true
    );

  }


  /* ==========================================================
     RESET FORM
  ========================================================== */

  function resetAndCloseForm() {

    setFormOpen(
      false
    );


    setEditingInsight(
      null
    );


    setForm({
      ...initialForm,
    });


    setFormError("");

  }


  /* ==========================================================
     CLOSE FORM
  ========================================================== */

  function closeForm() {

    if (
      saving ||
      deleting
    ) {

      return;

    }


    resetAndCloseForm();

  }


  /* ==========================================================
     FOCUS TITLE
  ========================================================== */

  function focusTitle() {

    window.setTimeout(
      () => {

        titleInputRef
          .current
          ?.scrollIntoView({
            behavior:
              "smooth",

            block:
              "center",
          });


        titleInputRef
          .current
          ?.focus();

      },
      50
    );

  }


  /* ==========================================================
     SAVE INSIGHT
  ========================================================== */

  async function handleSaveInsight(
    event
  ) {

    event.preventDefault();


    const cleanTitle =
      form.title.trim();


    if (
      !cleanTitle
    ) {

      setFormError(
        "Insight title is required."
      );


      focusTitle();


      return;

    }


    if (
      cleanTitle.length <
      3
    ) {

      setFormError(
        "Insight title must be at least 3 characters."
      );


      focusTitle();


      return;

    }


    if (
      !form.content.trim()
    ) {

      setFormError(
        "Insight content is required."
      );


      return;

    }


    try {

      setSaving(
        true
      );


      setFormError("");


      const editing =
        Boolean(
          editingInsight?.id
        );


      const slug =
        createSlug(
          cleanTitle
        );


      const payload = {

        title:
          cleanTitle,

        slug,

        excerpt:
          form.excerpt.trim() ||
          null,

        content:
          form.content.trim(),

        category:
          form.category.trim() ||
          null,

        author:
          form.author.trim() ||
          "Continental Founders",

        status:
          form.status,

        publishedAt:
          form.status ===
          "published"
            ? (
                form.publishedAt
                  ? new Date(
                      `${form.publishedAt}T12:00:00`
                    ).toISOString()
                  : new Date()
                    .toISOString()
              )
            : null,

      };


      const endpoint =
        editing
          ? `${API_URL}/api/insights/${editingInsight.id}`
          : `${API_URL}/api/insights`;


      const response =
        await fetch(
          endpoint,
          {
            method:
              editing
                ? "PATCH"
                : "POST",

            headers: {
              Accept:
                "application/json",

              "Content-Type":
                "application/json",
            },

            credentials:
              "include",

            body:
              JSON.stringify(
                payload
              ),
          }
        );


      const contentType =
        response.headers.get(
          "content-type"
        ) || "";


      let result = {};


      if (
        contentType.includes(
          "application/json"
        )
      ) {

        result =
          await response.json();

      } else {

        const text =
          await response.text();


        console.error(
          "Unexpected insight save response:",
          text
        );


        throw new Error(
          "The insights service returned an unexpected response."
        );

      }


      if (
        !response.ok
      ) {

        throw new Error(
          result.message ||
          result.error ||
          (
            editing
              ? "Unable to update insight."
              : "Unable to create insight."
          )
        );

      }


      resetAndCloseForm();


      await loadInsights();

    } catch (
      saveError
    ) {

      console.error(
        "Save insight error:",
        saveError
      );


      setFormError(
        saveError.message ||
        "Unable to save insight."
      );

    } finally {

      setSaving(
        false
      );

    }

  }


  /* ==========================================================
     DELETE
  ========================================================== */

  async function handleDeleteInsight() {

    if (
      !editingInsight?.id
    ) {

      return;

    }


    const confirmed =
      window.confirm(
        `Delete "${editingInsight.title}"? This action cannot be undone.`
      );


    if (
      !confirmed
    ) {

      return;

    }


    try {

      setDeleting(
        true
      );


      setFormError("");


      const response =
        await fetch(
          `${API_URL}/api/insights/${editingInsight.id}`,
          {
            method:
              "DELETE",

            headers: {
              Accept:
                "application/json",
            },

            credentials:
              "include",
          }
        );


      const contentType =
        response.headers.get(
          "content-type"
        ) || "";


      let result = {};


      if (
        contentType.includes(
          "application/json"
        )
      ) {

        result =
          await response.json();

      }


      if (
        !response.ok
      ) {

        throw new Error(
          result.message ||
          "Unable to delete insight."
        );

      }


      resetAndCloseForm();


      await loadInsights();

    } catch (
      deleteError
    ) {

      console.error(
        "Delete insight error:",
        deleteError
      );


      setFormError(
        deleteError.message ||
        "Unable to delete insight."
      );

    } finally {

      setDeleting(
        false
      );

    }

  }


  /* ==========================================================
     RENDER
  ========================================================== */

  return (

    <div className="admin-insights">

      {/* ======================================================
          HEADER
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
          onClick={
            handleCreateInsight
          }
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

          {!loading && (
            <>
              {filteredInsights.length}
              {" "}
              {filteredInsights.length === 1
                ? "insight"
                : "insights"}
            </>
          )}

        </div>

      </div>


      {/* ======================================================
          PANEL
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


        {/* ====================================================
            LOADING
        ==================================================== */}

        {loading && (

          <div className="admin-insights__empty">

            <div className="admin-insights__empty-icon">

              <RefreshCw
                size={28}
                strokeWidth={1.5}
              />

            </div>


            <h3>
              Loading insights
            </h3>


            <p>
              Retrieving Continental Founders content.
            </p>

          </div>

        )}


        {/* ====================================================
            ERROR
        ==================================================== */}

        {!loading &&
          error && (

            <div className="admin-insights__empty">

              <div className="admin-insights__empty-icon">

                <BookOpen
                  size={28}
                  strokeWidth={1.5}
                />

              </div>


              <h3>
                Insights could not be loaded
              </h3>


              <p>
                {error}
              </p>


              <button
                type="button"
                onClick={
                  loadInsights
                }
              >

                <RefreshCw
                  size={17}
                />

                Try Again

              </button>

            </div>

          )}


        {/* ====================================================
            EMPTY
        ==================================================== */}

        {!loading &&
          !error &&
          filteredInsights.length === 0 && (

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
                  : "Create your first Continental Founders insight."}

              </p>


              {!searchQuery && (

                <button
                  type="button"
                  onClick={
                    handleCreateInsight
                  }
                >

                  <Plus
                    size={17}
                  />

                  Create your first insight

                </button>

              )}

            </div>

          )}


        {/* ====================================================
            INSIGHTS
        ==================================================== */}

        {!loading &&
          !error &&
          filteredInsights.length > 0 && (

            <div className="admin-insights__list">

              {filteredInsights.map(
                (
                  insight,
                  index
                ) => {

                  const insightId =
                    insight.id ||
                    insight.slug ||
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
                        />

                        <span>
                          {insight.category ||
                            "General"}
                        </span>

                      </div>


                      <div className="admin-insights__author">

                        <UserRound
                          size={14}
                        />

                        <span>
                          {getAuthor(
                            insight
                          )}
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
                        />

                        <span>
                          {formatDate(
                            getPublishedDate(
                              insight
                            )
                          )}
                        </span>

                      </div>


                      <div className="admin-insights__arrow">

                        <ChevronRight
                          size={17}
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
          DETAIL DRAWER
      ====================================================== */}

      {selectedInsight && (

        <div
          className="admin-insights__overlay"
          role="presentation"
          onClick={() =>
            setSelectedInsight(
              null
            )
          }
        >

          <aside
            className="admin-insights__drawer"
            onClick={(
              event
            ) =>
              event.stopPropagation()
            }
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
              >

                <X
                  size={20}
                />

              </button>

            </div>


            <div className="admin-insights__drawer-body">

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


              <div className="admin-insights__detail-card">

                <Tag
                  size={18}
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


              <div className="admin-insights__detail-card">

                <UserRound
                  size={18}
                />

                <div>

                  <span>
                    Author
                  </span>

                  <strong>
                    {getAuthor(
                      selectedInsight
                    )}
                  </strong>

                </div>

              </div>


              <div className="admin-insights__detail-card">

                <CalendarDays
                  size={18}
                />

                <div>

                  <span>
                    Publication Date
                  </span>

                  <strong>
                    {formatDate(
                      getPublishedDate(
                        selectedInsight
                      )
                    )}
                  </strong>

                </div>

              </div>


              <div className="admin-insights__excerpt">

                <span>
                  Excerpt
                </span>

                <p>
                  {selectedInsight.excerpt ||
                    "No excerpt has been added."}
                </p>

              </div>


              <div className="admin-insights__content-preview">

                <span>
                  Content
                </span>

                <p>
                  {selectedInsight.content ||
                    "No article content has been added yet."}
                </p>

              </div>


              <div className="admin-insights__drawer-actions">

                <button
                  type="button"
                  className="admin-insights__edit"
                  onClick={() =>
                    handleEditInsight(
                      selectedInsight
                    )
                  }
                >

                  Edit Insight

                </button>

              </div>

            </div>

          </aside>

        </div>

      )}


      {/* ======================================================
          CREATE / EDIT FORM
      ====================================================== */}

      {formOpen && (

        <div
          className="admin-insights__overlay"
          role="presentation"
          onClick={
            closeForm
          }
        >

          <aside
            className="admin-insights__drawer admin-insights__form-drawer"
            onClick={(
              event
            ) =>
              event.stopPropagation()
            }
          >

            <div className="admin-insights__drawer-header">

              <div>

                <span className="admin-insights__drawer-eyebrow">

                  {editingInsight
                    ? "EDIT INSIGHT"
                    : "NEW INSIGHT"}

                </span>


                <h2>

                  {editingInsight
                    ? "Update Insight"
                    : "Create Insight"}

                </h2>

              </div>


              <button
                type="button"
                className="admin-insights__drawer-close"
                onClick={
                  closeForm
                }
                disabled={
                  saving ||
                  deleting
                }
              >

                <X
                  size={20}
                />

              </button>

            </div>


            <form
              className="admin-insights__form"
              onSubmit={
                handleSaveInsight
              }
              noValidate
            >

              {formError && (

                <div className="admin-insights__form-error">
                  {formError}
                </div>

              )}


              <div className="admin-insights__field">

                <label htmlFor="insight-title">
                  Insight Title *
                </label>

                <input
                  ref={
                    titleInputRef
                  }
                  id="insight-title"
                  name="title"
                  type="text"
                  value={
                    form.title
                  }
                  onChange={
                    handleFormChange
                  }
                  placeholder="Enter the article title"
                  maxLength={200}
                />

              </div>


              <div className="admin-insights__field">

                <label htmlFor="insight-category">
                  Category
                </label>

                <select
                  id="insight-category"
                  name="category"
                  value={
                    form.category
                  }
                  onChange={
                    handleFormChange
                  }
                >

                  <option value="">
                    Select category
                  </option>

                  <option value="Founder Perspectives">
                    Founder Perspectives
                  </option>

                  <option value="Research">
                    Research
                  </option>

                  <option value="Markets">
                    Markets
                  </option>

                  <option value="University Partnerships">
                    University Partnerships
                  </option>

                  <option value="Investment">
                    Investment
                  </option>

                  <option value="Innovation">
                    Innovation
                  </option>

                  <option value="Continental Founders News">
                    Continental Founders News
                  </option>

                  <option value="Other">
                    Other
                  </option>

                </select>

              </div>


              <div className="admin-insights__field">

                <label htmlFor="insight-author">
                  Author
                </label>

                <input
                  id="insight-author"
                  name="author"
                  type="text"
                  value={
                    form.author
                  }
                  onChange={
                    handleFormChange
                  }
                  placeholder="Continental Founders"
                />

              </div>


              <div className="admin-insights__field">

                <label htmlFor="insight-excerpt">
                  Excerpt
                </label>

                <textarea
                  id="insight-excerpt"
                  name="excerpt"
                  value={
                    form.excerpt
                  }
                  onChange={
                    handleFormChange
                  }
                  placeholder="A short summary that will appear on the Insights page..."
                  rows={4}
                />

              </div>


              <div className="admin-insights__field">

                <label htmlFor="insight-content">
                  Article Content *
                </label>

                <textarea
                  id="insight-content"
                  name="content"
                  value={
                    form.content
                  }
                  onChange={
                    handleFormChange
                  }
                  placeholder="Write the full insight, article, research update, or perspective..."
                  rows={14}
                />

              </div>


              <div className="admin-insights__field">

                <label htmlFor="insight-status">
                  Publishing Status
                </label>

                <select
                  id="insight-status"
                  name="status"
                  value={
                    form.status
                  }
                  onChange={
                    handleFormChange
                  }
                >

                  <option value="draft">
                    Save as Draft
                  </option>

                  <option value="published">
                    Published
                  </option>

                  <option value="archived">
                    Archived
                  </option>

                </select>

              </div>


              {form.status ===
                "published" && (

                <div className="admin-insights__field">

                  <label htmlFor="insight-published-date">
                    Publication Date
                  </label>

                  <input
                    id="insight-published-date"
                    name="publishedAt"
                    type="date"
                    value={
                      form.publishedAt
                    }
                    onChange={
                      handleFormChange
                    }
                  />

                </div>

              )}


              <div className="admin-insights__form-actions">

                {editingInsight && (

                  <button
                    type="button"
                    className="admin-insights__delete"
                    onClick={
                      handleDeleteInsight
                    }
                    disabled={
                      saving ||
                      deleting
                    }
                  >

                    <Trash2
                      size={17}
                    />

                    {deleting
                      ? "Deleting..."
                      : "Delete"}

                  </button>

                )}


                <div className="admin-insights__form-actions-right">

                  <button
                    type="button"
                    className="admin-insights__cancel"
                    onClick={
                      closeForm
                    }
                    disabled={
                      saving ||
                      deleting
                    }
                  >

                    Cancel

                  </button>


                  <button
                    type="submit"
                    className="admin-insights__save"
                    disabled={
                      saving ||
                      deleting
                    }
                  >

                    {saving
                      ? (
                        <RefreshCw
                          size={17}
                        />
                      )
                      : (
                        <Save
                          size={17}
                        />
                      )}


                    {saving
                      ? "Saving..."
                      : editingInsight
                        ? "Save Changes"
                        : form.status ===
                          "published"
                          ? "Publish Insight"
                          : "Save Insight"}

                  </button>

                </div>

              </div>

            </form>

          </aside>

        </div>

      )}

    </div>

  );

}