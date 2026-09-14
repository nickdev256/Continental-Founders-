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
  ChevronLeft,
  ChevronRight,
  FileText,
  ImagePlus,
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
   CONFIG
============================================================ */

const ITEMS_PER_PAGE = 6;

const MAX_IMAGE_SIZE =
  5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const FORM_STEPS = [
  {
    number: 1,
    label: "Basics",
  },
  {
    number: 2,
    label: "Content",
  },
  {
    number: 3,
    label: "Publishing",
  },
  {
    number: 4,
    label: "Review",
  },
];


/* ============================================================
   INITIAL FORM
============================================================ */

const initialForm = {
  title: "",
  excerpt: "",
  content: "",
  category: "",
  author: "Continental Founders",
  status: "draft",
  publishedAt: "",
};


/* ============================================================
   HELPERS
============================================================ */

function createSlug(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/['’"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}


function toDateInput(value) {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  return date
    .toISOString()
    .slice(0, 10);
}


function formatDate(value) {
  if (!value) {
    return "Not available";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return String(value);
  }

  return date.toLocaleDateString(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  );
}


function getAuthor(insight) {
  return (
    insight?.author ||
    insight?.author_name ||
    "Continental Founders"
  );
}


function getPublishedDate(insight) {
  return (
    insight?.publishedAt ||
    insight?.published_at ||
    insight?.createdAt ||
    insight?.created_at ||
    null
  );
}


function getInsightImage(insight) {
  return (
    insight?.imageUrl ||
    insight?.image_url ||
    ""
  );
}


function getStatusClass(status) {
  const normalized =
    String(status || "")
      .trim()
      .toLowerCase();

  if (
    normalized === "published"
  ) {
    return "admin-insights__status admin-insights__status--published";
  }

  if (
    normalized === "archived"
  ) {
    return "admin-insights__status admin-insights__status--archived";
  }

  return "admin-insights__status admin-insights__status--draft";
}


/* ============================================================
   ADMIN INSIGHTS
============================================================ */

export default function AdminInsights() {

  /* ==========================================================
     STATE
  ========================================================== */

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
    searchQuery,
    setSearchQuery,
  ] =
    useState("");

  const [
    currentPage,
    setCurrentPage,
  ] =
    useState(1);

  const [
    selectedInsight,
    setSelectedInsight,
  ] =
    useState(null);

  const [
    detailStep,
    setDetailStep,
  ] =
    useState(1);

  const [
    formOpen,
    setFormOpen,
  ] =
    useState(false);

  const [
    formStep,
    setFormStep,
  ] =
    useState(1);

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
    imageFile,
    setImageFile,
  ] =
    useState(null);

  const [
    imagePreview,
    setImagePreview,
  ] =
    useState("");

  const [
    removeImage,
    setRemoveImage,
  ] =
    useState(false);

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

  const imageInputRef =
    useRef(null);


  /* ==========================================================
     PREVIEW CLEANUP
  ========================================================== */

  function revokeBlobPreview(
    preview
  ) {

    if (
      preview &&
      preview.startsWith(
        "blob:"
      )
    ) {

      URL.revokeObjectURL(
        preview
      );

    }

  }


  useEffect(
    () => {

      return () => {

        revokeBlobPreview(
          imagePreview
        );

      };

    },
    [
      imagePreview,
    ]
  );


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
                method:
                  "GET",

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


          if (
            !contentType.includes(
              "application/json"
            )
          ) {

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


          const result =
            await response.json();


          if (
            !response.ok
          ) {

            throw new Error(
              result?.message ||
              result?.error ||
              "Unable to load insights."
            );

          }


          const items =
            Array.isArray(
              result?.insights
            )
              ? result.insights
              : Array.isArray(
                  result?.items
                )
                ? result.items
                : Array.isArray(
                    result?.data
                  )
                  ? result.data
                  : Array.isArray(
                      result?.data?.insights
                    )
                    ? result.data.insights
                    : [];


          setInsights(
            items
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
            requestError?.message ||
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

      if (
        !formOpen ||
        formStep !== 1
      ) {
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
      formStep,
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

            const searchable = [
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


            return searchable.includes(
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
      () =>
        insights.filter(
          (
            insight
          ) =>
            String(
              insight.status || ""
            )
              .toLowerCase()
              .trim() ===
            "published"
        ).length,
      [
        insights,
      ]
    );


  const draftCount =
    useMemo(
      () =>
        insights.filter(
          (
            insight
          ) =>
            String(
              insight.status || ""
            )
              .toLowerCase()
              .trim() ===
            "draft"
        ).length,
      [
        insights,
      ]
    );


  /* ==========================================================
     PAGINATION
  ========================================================== */

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredInsights.length /
        ITEMS_PER_PAGE
      )
    );


  useEffect(
    () => {

      setCurrentPage(1);

    },
    [
      searchQuery,
    ]
  );


  useEffect(
    () => {

      if (
        currentPage >
        totalPages
      ) {

        setCurrentPage(
          totalPages
        );

      }

    },
    [
      currentPage,
      totalPages,
    ]
  );


  const paginatedInsights =
    useMemo(
      () => {

        const start =
          (
            currentPage -
            1
          ) *
          ITEMS_PER_PAGE;


        return filteredInsights.slice(
          start,
          start +
          ITEMS_PER_PAGE
        );

      },
      [
        filteredInsights,
        currentPage,
      ]
    );


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
     IMAGE CHANGE
  ========================================================== */

  function handleImageChange(
    event
  ) {

    const file =
      event.target.files?.[0];


    if (!file) {
      return;
    }


    if (
      !ALLOWED_IMAGE_TYPES.includes(
        file.type
      )
    ) {

      setFormError(
        "Please choose a JPG, PNG or WebP image."
      );


      event.target.value =
        "";


      return;

    }


    if (
      file.size >
      MAX_IMAGE_SIZE
    ) {

      setFormError(
        "Insight image must be 5MB or smaller."
      );


      event.target.value =
        "";


      return;

    }


    revokeBlobPreview(
      imagePreview
    );


    const preview =
      URL.createObjectURL(
        file
      );


    setImageFile(
      file
    );

    setImagePreview(
      preview
    );

    setRemoveImage(
      false
    );

    setFormError(
      ""
    );

  }


  /* ==========================================================
     REMOVE IMAGE
  ========================================================== */

  function handleRemoveImage() {

    revokeBlobPreview(
      imagePreview
    );


    setImageFile(
      null
    );

    setImagePreview(
      ""
    );

    setRemoveImage(
      true
    );


    if (
      imageInputRef.current
    ) {

      imageInputRef.current.value =
        "";

    }

  }


  /* ==========================================================
     OPEN CREATE
  ========================================================== */

  function handleCreateInsight() {

    revokeBlobPreview(
      imagePreview
    );


    setSelectedInsight(
      null
    );

    setEditingInsight(
      null
    );

    setForm({
      ...initialForm,
    });

    setImageFile(
      null
    );

    setImagePreview(
      ""
    );

    setRemoveImage(
      false
    );

    setFormStep(
      1
    );

    setFormError(
      ""
    );

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

    revokeBlobPreview(
      imagePreview
    );


    setSelectedInsight(
      null
    );

    setEditingInsight(
      insight
    );

    setForm({
      title:
        insight?.title ||
        "",

      excerpt:
        insight?.excerpt ||
        "",

      content:
        insight?.content ||
        "",

      category:
        insight?.category ||
        "",

      author:
        getAuthor(
          insight
        ),

      status:
        insight?.status ||
        "draft",

      publishedAt:
        toDateInput(
          getPublishedDate(
            insight
          )
        ),
    });


    setImageFile(
      null
    );

    setImagePreview(
      getInsightImage(
        insight
      )
    );

    setRemoveImage(
      false
    );

    setFormStep(
      1
    );

    setFormError(
      ""
    );

    setFormOpen(
      true
    );

  }


  /* ==========================================================
     CLOSE FORM
  ========================================================== */

  function resetAndCloseForm() {

    revokeBlobPreview(
      imagePreview
    );


    setFormOpen(
      false
    );

    setEditingInsight(
      null
    );

    setForm({
      ...initialForm,
    });

    setImageFile(
      null
    );

    setImagePreview(
      ""
    );

    setRemoveImage(
      false
    );

    setFormStep(
      1
    );

    setFormError(
      ""
    );


    if (
      imageInputRef.current
    ) {

      imageInputRef.current.value =
        "";

    }

  }


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
     STEP VALIDATION
  ========================================================== */

  function validateStep(
    step
  ) {

    if (
      step === 1
    ) {

      if (
        !form.title.trim()
      ) {

        setFormError(
          "Insight title is required."
        );


        titleInputRef
          .current
          ?.focus();


        return false;

      }


      if (
        form.title
          .trim()
          .length <
        3
      ) {

        setFormError(
          "Insight title must be at least 3 characters."
        );


        return false;

      }

    }


    if (
      step === 2 &&
      !form.content.trim()
    ) {

      setFormError(
        "Insight content is required."
      );


      return false;

    }


    setFormError(
      ""
    );


    return true;

  }


  /* ==========================================================
     NEXT STEP
  ========================================================== */

  function handleNextStep() {

    if (
      !validateStep(
        formStep
      )
    ) {
      return;
    }


    setFormStep(
      (
        current
      ) =>
        Math.min(
          4,
          current + 1
        )
    );

  }


  /* ==========================================================
     PREVIOUS STEP
  ========================================================== */

  function handlePreviousStep() {

    setFormError(
      ""
    );


    setFormStep(
      (
        current
      ) =>
        Math.max(
          1,
          current - 1
        )
    );

  }


  /* ==========================================================
     SAVE INSIGHT
  ========================================================== */

  async function handleSaveInsight() {

    if (
      !validateStep(
        1
      ) ||
      !validateStep(
        2
      )
    ) {
      return;
    }


    try {

      setSaving(
        true
      );

      setFormError(
        ""
      );


      const editing =
        Boolean(
          editingInsight?.id
        );


      const cleanTitle =
        form.title.trim();


      /* ======================================================
         MULTIPART FORM DATA
      ====================================================== */

      const formData =
        new FormData();


      formData.append(
        "title",
        cleanTitle
      );


      formData.append(
        "slug",
        createSlug(
          cleanTitle
        )
      );


      formData.append(
        "excerpt",
        form.excerpt.trim()
      );


      formData.append(
        "content",
        form.content.trim()
      );


      formData.append(
        "category",
        form.category.trim()
      );


      formData.append(
        "author",
        form.author.trim() ||
        "Continental Founders"
      );


      formData.append(
        "status",
        form.status
      );


      if (
        form.status ===
        "published"
      ) {

        const publishedAt =
          form.publishedAt
            ? new Date(
                `${form.publishedAt}T12:00:00`
              ).toISOString()
            : new Date()
              .toISOString();


        formData.append(
          "publishedAt",
          publishedAt
        );

      }


      if (
        imageFile
      ) {

        formData.append(
          "image",
          imageFile
        );

      }


      if (
        removeImage
      ) {

        formData.append(
          "removeImage",
          "true"
        );

      }


      /* ======================================================
         ENDPOINT
      ====================================================== */

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
            },

            credentials:
              "include",

            body:
              formData,
          }
        );


      const contentType =
        response.headers.get(
          "content-type"
        ) || "";


      if (
        !contentType.includes(
          "application/json"
        )
      ) {

        const responseText =
          await response.text();


        console.error(
          "Unexpected save insight response:",
          responseText
        );


        throw new Error(
          "The insights service returned an unexpected response."
        );

      }


      const result =
        await response.json();


      if (
        !response.ok
      ) {

        throw new Error(
          result?.message ||
          result?.error ||
          (
            editing
              ? "Unable to update insight."
              : "Unable to create insight."
          )
        );

      }


      const savedInsight =
        result?.insight ||
        result?.item ||
        result?.data?.insight ||
        result?.data ||
        null;


      if (
        savedInsight?.id
      ) {

        setInsights(
          (
            current
          ) => {

            if (
              editing
            ) {

              return current.map(
                (
                  item
                ) =>
                  item.id ===
                  editingInsight.id
                    ? savedInsight
                    : item
              );

            }


            return [
              savedInsight,
              ...current,
            ];

          }
        );

      } else {

        await loadInsights();

      }


      resetAndCloseForm();


      setCurrentPage(
        1
      );

    } catch (
      saveError
    ) {

      console.error(
        "Save insight error:",
        saveError
      );


      setFormError(
        saveError?.message ||
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

      setFormError(
        ""
      );


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
          result?.message ||
          result?.error ||
          "Unable to delete insight."
        );

      }


      setInsights(
        (
          current
        ) =>
          current.filter(
            (
              insight
            ) =>
              insight.id !==
              editingInsight.id
          )
      );


      resetAndCloseForm();

    } catch (
      deleteError
    ) {

      console.error(
        "Delete insight error:",
        deleteError
      );


      setFormError(
        deleteError?.message ||
        "Unable to delete insight."
      );

    } finally {

      setDeleting(
        false
      );

    }

  }


  /* ==========================================================
     OPEN DETAILS
  ========================================================== */

  function openDetails(
    insight
  ) {

    setDetailStep(
      1
    );

    setSelectedInsight(
      insight
    );

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
            Manage articles, research, perspectives,
            news and thought leadership published
            across Continental Founders.
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
            size={17}
          />

          New Insight
        </button>

      </div>


      {/* ======================================================
          SUMMARY
      ====================================================== */}

      <div className="admin-insights__summary-grid">

        <div className="admin-insights__summary-card">

          <BookOpen
            size={20}
          />

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

          <FileText
            size={20}
          />

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

          <FileText
            size={20}
          />

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
            size={17}
          />

          <input
            type="search"
            value={
              searchQuery
            }
            placeholder="Search insights..."
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
            >
              <X
                size={15}
              />
            </button>

          )}

        </div>


        <span className="admin-insights__count">
          {!loading &&
            `${filteredInsights.length} ${
              filteredInsights.length === 1
                ? "insight"
                : "insights"
            }`}
        </span>

      </div>


      {/* ======================================================
          TABLE
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


        {loading && (

          <div className="admin-insights__empty">

            <RefreshCw
              size={26}
            />

            <h3>
              Loading insights
            </h3>

            <p>
              Retrieving CMS content.
            </p>

          </div>

        )}


        {!loading &&
          error && (

            <div className="admin-insights__empty">

              <BookOpen
                size={27}
              />

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
                  size={16}
                />

                Try Again
              </button>

            </div>

          )}


        {!loading &&
          !error &&
          filteredInsights.length === 0 && (

            <div className="admin-insights__empty">

              <BookOpen
                size={27}
              />

              <h3>
                {searchQuery
                  ? "No matching insights"
                  : "No insights yet"}
              </h3>

              <p>
                {searchQuery
                  ? "Try another search."
                  : "Create your first Continental Founders insight."}
              </p>

            </div>

          )}


        {!loading &&
          !error &&
          paginatedInsights.length > 0 && (

            <div className="admin-insights__list">

              {paginatedInsights.map(
                (
                  insight,
                  index
                ) => (

                  <button
                    key={
                      insight.id ||
                      insight.slug ||
                      index
                    }
                    type="button"
                    className="admin-insights__row"
                    onClick={() =>
                      openDetails(
                        insight
                      )
                    }
                  >

                    <div className="admin-insights__article">

                      {getInsightImage(
                        insight
                      ) ? (

                        <img
                          className="admin-insights__row-image"
                          src={
                            getInsightImage(
                              insight
                            )
                          }
                          alt=""
                        />

                      ) : (

                        <div className="admin-insights__article-icon">
                          <BookOpen
                            size={17}
                          />
                        </div>

                      )}


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
                        size={13}
                      />

                      <span>
                        {insight.category ||
                          "General"}
                      </span>

                    </div>


                    <div className="admin-insights__author">

                      <UserRound
                        size={13}
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
                          "draft"}
                      </span>

                    </div>


                    <div className="admin-insights__date">

                      <CalendarDays
                        size={13}
                      />

                      {formatDate(
                        getPublishedDate(
                          insight
                        )
                      )}

                    </div>


                    <ChevronRight
                      size={16}
                    />

                  </button>

                )
              )}

            </div>

          )}


        {!loading &&
          !error &&
          filteredInsights.length >
          ITEMS_PER_PAGE && (

            <div className="admin-insights__pagination">

              <button
                type="button"
                disabled={
                  currentPage === 1
                }
                onClick={() =>
                  setCurrentPage(
                    (
                      current
                    ) =>
                      Math.max(
                        1,
                        current - 1
                      )
                  )
                }
              >
                <ChevronLeft
                  size={15}
                />

                Previous
              </button>


              <span>
                Page {currentPage} of {totalPages}
              </span>


              <button
                type="button"
                disabled={
                  currentPage ===
                  totalPages
                }
                onClick={() =>
                  setCurrentPage(
                    (
                      current
                    ) =>
                      Math.min(
                        totalPages,
                        current + 1
                      )
                  )
                }
              >
                Next

                <ChevronRight
                  size={15}
                />
              </button>

            </div>

          )}

      </section>


      {/* ======================================================
          DETAIL DRAWER
      ====================================================== */}

      {selectedInsight && (

        <div
          className="admin-insights__overlay"
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
                  {selectedInsight.title}
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
                  size={19}
                />
              </button>

            </div>


            <div className="admin-insights__detail-progress">

              <button
                type="button"
                className={
                  detailStep === 1
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setDetailStep(
                    1
                  )
                }
              >
                Overview
              </button>

              <button
                type="button"
                className={
                  detailStep === 2
                    ? "active"
                    : ""
                }
                onClick={() =>
                  setDetailStep(
                    2
                  )
                }
              >
                Content
              </button>

            </div>


            <div className="admin-insights__drawer-body">

              {detailStep === 1 && (
                <>

                  {getInsightImage(
                    selectedInsight
                  ) && (

                    <div className="admin-insights__featured-image">

                      <img
                        src={
                          getInsightImage(
                            selectedInsight
                          )
                        }
                        alt={
                          selectedInsight.title ||
                          "Insight"
                        }
                      />

                    </div>

                  )}


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
                        "draft"}
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
                        "No excerpt added."}
                    </p>

                  </div>

                </>
              )}


              {detailStep === 2 && (

                <div className="admin-insights__content-preview">

                  <span>
                    Article Content
                  </span>

                  <p>
                    {selectedInsight.content ||
                      "No content available."}
                  </p>

                </div>

              )}


              <div className="admin-insights__drawer-actions">

                {detailStep > 1 && (

                  <button
                    type="button"
                    className="admin-insights__cancel"
                    onClick={() =>
                      setDetailStep(
                        1
                      )
                    }
                  >
                    <ChevronLeft
                      size={15}
                    />

                    Previous
                  </button>

                )}


                {detailStep === 1 ? (

                  <button
                    type="button"
                    className="admin-insights__edit"
                    onClick={() =>
                      setDetailStep(
                        2
                      )
                    }
                  >
                    Next

                    <ChevronRight
                      size={15}
                    />
                  </button>

                ) : (

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

                )}

              </div>

            </div>

          </aside>

        </div>

      )}


      {/* ======================================================
          CREATE / EDIT WIZARD
      ====================================================== */}

      {formOpen && (

        <div
          className="admin-insights__overlay"
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
                  size={19}
                />
              </button>

            </div>


            {/* STEP INDICATOR */}

            <div className="admin-insights__steps">

              {FORM_STEPS.map(
                (
                  step
                ) => (

                  <div
                    key={
                      step.number
                    }
                    className={
                      formStep ===
                      step.number
                        ? "admin-insights__step active"
                        : formStep >
                          step.number
                          ? "admin-insights__step complete"
                          : "admin-insights__step"
                    }
                  >

                    <span>
                      {step.number}
                    </span>

                    <small>
                      {step.label}
                    </small>

                  </div>

                )
              )}

            </div>


            <div className="admin-insights__form">

              {formError && (

                <div className="admin-insights__form-error">
                  {formError}
                </div>

              )}


              {/* ==================================================
                  STEP 1
              ================================================== */}

              {formStep === 1 && (
                <>

                  <div className="admin-insights__step-heading">

                    <h3>
                      Insight Basics
                    </h3>

                    <p>
                      Add the main publishing information.
                    </p>

                  </div>


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
                      placeholder="Enter insight title"
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

                </>
              )}


              {/* ==================================================
                  STEP 2
              ================================================== */}

              {formStep === 2 && (
                <>

                  <div className="admin-insights__step-heading">

                    <h3>
                      Article Content
                    </h3>

                    <p>
                      Add the featured image, summary and full insight.
                    </p>

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
                      rows={4}
                      placeholder="Short summary for the public Insights page..."
                    />

                  </div>


                  {/* FEATURED IMAGE */}

                  <div className="admin-insights__field">

                    <label>
                      Featured Image
                    </label>


                    {imagePreview ? (

                      <div className="admin-insights__image-preview">

                        <img
                          src={
                            imagePreview
                          }
                          alt="Insight preview"
                        />


                        <div className="admin-insights__image-preview-actions">

                          <label className="admin-insights__image-change">

                            <ImagePlus
                              size={16}
                            />

                            Change Image

                            <input
                              ref={
                                imageInputRef
                              }
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              onChange={
                                handleImageChange
                              }
                              hidden
                            />

                          </label>


                          <button
                            type="button"
                            className="admin-insights__image-remove"
                            onClick={
                              handleRemoveImage
                            }
                          >
                            <Trash2
                              size={15}
                            />

                            Remove
                          </button>

                        </div>

                      </div>

                    ) : (

                      <label className="admin-insights__image-upload">

                        <ImagePlus
                          size={28}
                        />

                        <strong>
                          Upload Featured Image
                        </strong>

                        <span>
                          JPG, PNG or WebP · Maximum 5MB
                        </span>

                        <input
                          ref={
                            imageInputRef
                          }
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={
                            handleImageChange
                          }
                          hidden
                        />

                      </label>

                    )}

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
                      rows={12}
                      placeholder="Write the full article..."
                    />

                  </div>

                </>
              )}


              {/* ==================================================
                  STEP 3
              ================================================== */}

              {formStep === 3 && (
                <>

                  <div className="admin-insights__step-heading">

                    <h3>
                      Publishing
                    </h3>

                    <p>
                      Choose how this insight should appear.
                    </p>

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
                        Draft
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

                      <label htmlFor="insight-publishedAt">
                        Publication Date
                      </label>

                      <input
                        id="insight-publishedAt"
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

                </>
              )}


              {/* ==================================================
                  STEP 4
              ================================================== */}

              {formStep === 4 && (
                <>

                  <div className="admin-insights__step-heading">

                    <h3>
                      Review Insight
                    </h3>

                    <p>
                      Confirm the information before saving.
                    </p>

                  </div>


                  <div className="admin-insights__review">

                    <div>
                      <span>
                        Title
                      </span>

                      <strong>
                        {form.title ||
                          "Not provided"}
                      </strong>
                    </div>


                    <div>
                      <span>
                        Category
                      </span>

                      <strong>
                        {form.category ||
                          "General"}
                      </strong>
                    </div>


                    <div>
                      <span>
                        Author
                      </span>

                      <strong>
                        {form.author ||
                          "Continental Founders"}
                      </strong>
                    </div>


                    <div>
                      <span>
                        Status
                      </span>

                      <strong>
                        {form.status}
                      </strong>
                    </div>


                    <div>
                      <span>
                        Publication Date
                      </span>

                      <strong>
                        {form.status ===
                        "published"
                          ? form.publishedAt ||
                            "Publish immediately"
                          : "Not published"}
                      </strong>
                    </div>


                    <div className="admin-insights__review-wide">

                      <span>
                        Featured Image
                      </span>


                      {imagePreview ? (

                        <img
                          className="admin-insights__review-image"
                          src={
                            imagePreview
                          }
                          alt="Insight"
                        />

                      ) : (

                        <p>
                          No featured image selected.
                        </p>

                      )}

                    </div>


                    <div className="admin-insights__review-wide">

                      <span>
                        Excerpt
                      </span>

                      <p>
                        {form.excerpt ||
                          "No excerpt provided."}
                      </p>

                    </div>

                  </div>

                </>
              )}


              {/* ==================================================
                  FORM ACTIONS
              ================================================== */}

              <div className="admin-insights__form-actions">

                {editingInsight &&
                  formStep === 4 && (

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
                        size={16}
                      />

                      {deleting
                        ? "Deleting..."
                        : "Delete Insight"}
                    </button>

                  )}


                <div className="admin-insights__form-actions-right">

                  {formStep > 1 && (

                    <button
                      type="button"
                      className="admin-insights__cancel"
                      onClick={
                        handlePreviousStep
                      }
                      disabled={
                        saving ||
                        deleting
                      }
                    >
                      <ChevronLeft
                        size={15}
                      />

                      Previous
                    </button>

                  )}


                  {formStep < 4 ? (

                    <button
                      type="button"
                      className="admin-insights__save"
                      onClick={
                        handleNextStep
                      }
                      disabled={
                        saving ||
                        deleting
                      }
                    >
                      Next

                      <ChevronRight
                        size={15}
                      />
                    </button>

                  ) : (

                    <button
                      type="button"
                      className="admin-insights__save"
                      onClick={
                        handleSaveInsight
                      }
                      disabled={
                        saving ||
                        deleting
                      }
                    >
                      {saving ? (
                        <RefreshCw
                          size={16}
                        />
                      ) : (
                        <Save
                          size={16}
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

                  )}

                </div>

              </div>

            </div>

          </aside>

        </div>

      )}

    </div>
  );
}