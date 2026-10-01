import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  Download,
  FileText,
  Filter,
  Globe2,
  GraduationCap,
  Handshake,
  Loader2,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  UserRound,
  Users,
  X,
} from "lucide-react";

import "./AdminCFCV.css";


/* ============================================================
   API
============================================================ */

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(/\/+$/, "");


/* ============================================================
   ADMISSIONS CONFIGURATION
============================================================ */

const ADMISSIONS_STAGES = [
  {
    value: "applied",
    label: "Applied",
  },
  {
    value: "assessment",
    label: "Assessment",
  },
  {
    value: "interview",
    label: "Interview",
  },
  {
    value: "track_placement",
    label: "Track Placement",
  },
  {
    value: "matching",
    label: "Matching",
  },
  {
    value: "compatibility",
    label: "Compatibility",
  },
  {
    value: "final_decision",
    label: "Final Decision",
  },
  {
    value: "enrollment",
    label: "Enrollment",
  },
];


const TRACKS = [
  {
    value: "",
    label: "Not assigned",
  },
  {
    value: "Genesis",
    label: "Genesis — Build It",
  },
  {
    value: "Ascend",
    label: "Ascend — Prove It",
  },
  {
    value: "Horizon",
    label: "Horizon — Scale It",
  },
];


const MATCHING_STATUSES = [
  {
    value: "not_started",
    label: "Not Started",
  },
  {
    value: "required",
    label: "Required",
  },
  {
    value: "in_progress",
    label: "In Progress",
  },
  {
    value: "matched",
    label: "Matched",
  },
  {
    value: "compatibility_sprint",
    label: "Compatibility Sprint",
  },
  {
    value: "completed",
    label: "Completed",
  },
];


const FINAL_DECISIONS = [
  {
    value: "",
    label: "No decision yet",
  },
  {
    value: "ADMIT",
    label: "Admit",
  },
  {
    value: "ADMIT WITH TRACK PLACEMENT",
    label: "Admit With Track Placement",
  },
  {
    value: "MATCH REQUIRED",
    label: "Match Required",
  },
  {
    value: "WAITLIST",
    label: "Waitlist",
  },
  {
    value: "NOT SELECTED",
    label: "Not Selected",
  },
];


const APPLICATION_STATUSES = [
  {
    value: "submitted",
    label: "Submitted",
  },
  {
    value: "under_review",
    label: "Under Review",
  },
  {
    value: "in_progress",
    label: "In Progress",
  },
  {
    value: "admitted",
    label: "Admitted",
  },
  {
    value: "waitlisted",
    label: "Waitlisted",
  },
  {
    value: "not_selected",
    label: "Not Selected",
  },
  {
    value: "withdrawn",
    label: "Withdrawn",
  },
];


const INTERVIEW_STATUSES = [
  {
    value: "not_scheduled",
    label: "Not Scheduled",
  },
  {
    value: "scheduled",
    label: "Scheduled",
  },
  {
    value: "completed",
    label: "Completed",
  },
  {
    value: "cancelled",
    label: "Cancelled",
  },
];


const GEOGRAPHIES = [
  "Africa",
  "United States",
  "Diaspora",
];


/* ============================================================
   HELPERS
============================================================ */

function formatDate(
  value,
  fallback = "—"
) {
  if (!value) {
    return fallback;
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return fallback;
  }

  return new Intl.DateTimeFormat(
    undefined,
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  ).format(date);
}


function formatDateTime(
  value,
  fallback = "—"
) {
  if (!value) {
    return fallback;
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return fallback;
  }

  return new Intl.DateTimeFormat(
    undefined,
    {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }
  ).format(date);
}


function toDateTimeLocal(
  value
) {
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

  const offset =
    date.getTimezoneOffset();

  const localDate =
    new Date(
      date.getTime() -
        offset * 60 * 1000
    );

  return localDate
    .toISOString()
    .slice(0, 16);
}


function getFullName(
  application
) {
  return [
    application?.firstName,
    application?.lastName,
  ]
    .filter(Boolean)
    .join(" ")
    .trim() || "Unnamed applicant";
}


function getInitials(
  application
) {
  const first =
    String(
      application?.firstName || ""
    )
      .trim()
      .charAt(0);

  const last =
    String(
      application?.lastName || ""
    )
      .trim()
      .charAt(0);

  return (
    `${first}${last}`.toUpperCase() ||
    "CF"
  );
}


function getLabel(
  options,
  value
) {
  return (
    options.find(
      (option) =>
        option.value === value
    )?.label ||
    value ||
    "—"
  );
}


function stageClass(
  value
) {
  return String(
    value || "unknown"
  )
    .toLowerCase()
    .replace(
      /[^a-z0-9]+/g,
      "-"
    );
}


function normalizeStats(
  payload
) {
  const source =
    payload?.stats ||
    payload ||
    {};

  return {
    totalApplications:
      Number(
        source.totalApplications ||
          0
      ),

    submitted:
      Number(
        source.submitted ||
          0
      ),

    underReview:
      Number(
        source.underReview ||
          0
      ),

    interviews:
      Number(
        source.interviews ||
          0
      ),

    matchingRequired:
      Number(
        source.matchingRequired ||
          0
      ),

    admitted:
      Number(
        source.admitted ||
          0
      ),

    waitlisted:
      Number(
        source.waitlisted ||
          0
      ),

    genesis:
      Number(
        source.genesis ||
          0
      ),

    ascend:
      Number(
        source.ascend ||
          0
      ),

    horizon:
      Number(
        source.horizon ||
          0
      ),

    cohortCapacity:
      Number(
        source.cohortCapacity ||
          30
      ),

    remainingCapacity:
      Number(
        source.remainingCapacity ??
          30
      ),
  };
}


/* ============================================================
   REQUEST HELPER
============================================================ */

async function request(
  endpoint,
  options = {}
) {
  const hasBody =
    options.body !== undefined &&
    options.body !== null;

  const response =
    await fetch(
      `${API_URL}${endpoint}`,
      {
        ...options,

        credentials:
          "include",

        headers: {
          Accept:
            "application/json",

          ...(hasBody
            ? {
                "Content-Type":
                  "application/json",
              }
            : {}),

          ...options.headers,
        },
      }
    );


  let data = {};

  try {
    data =
      await response.json();
  } catch {
    data = {};
  }


  if (!response.ok) {
    throw new Error(
      data?.message ||
      data?.error ||
      "Something went wrong."
    );
  }


  return data;
}


/* ============================================================
   DETAIL ROW
============================================================ */

function DetailRow({
  label,
  children,
}) {
  return (
    <div className="cfcv-detail-row">
      <dt>
        {label}
      </dt>

      <dd>
        {children || "—"}
      </dd>
    </div>
  );
}


/* ============================================================
   TEXT SECTION
============================================================ */

function TextSection({
  title,
  children,
}) {
  return (
    <section className="cfcv-detail-section">
      <h3>
        {title}
      </h3>

      <div className="cfcv-detail-copy">
        {children || "—"}
      </div>
    </section>
  );
}


/* ============================================================
   ADMIN CFCV
============================================================ */

export default function AdminCFCV() {
  const [
    applications,
    setApplications,
  ] = useState([]);

  const [
    stats,
    setStats,
  ] = useState(
    normalizeStats({})
  );

  const [
    selectedId,
    setSelectedId,
  ] = useState(null);

  const [
    selectedApplication,
    setSelectedApplication,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    detailLoading,
    setDetailLoading,
  ] = useState(false);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    resumeLoading,
    setResumeLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("");

  const [
    stageFilter,
    setStageFilter,
  ] = useState("");

  const [
    trackFilter,
    setTrackFilter,
  ] = useState("");

  const [
    geographyFilter,
    setGeographyFilter,
  ] = useState("");

  const [
    mobileFiltersOpen,
    setMobileFiltersOpen,
  ] = useState(false);

  const [
    editData,
    setEditData,
  ] = useState({
    admissionsStage:
      "applied",

    assignedTrack:
      "",

    matchingRequired:
      false,

    matchingStatus:
      "not_started",

    finalDecision:
      "",

    status:
      "submitted",

    interviewRequired:
      false,

    interviewStatus:
      "not_scheduled",

    interviewDate:
      "",

    reviewerNotes:
      "",

    interviewNotes:
      "",

    matchingNotes:
      "",

    decisionNotes:
      "",
  });


  /* ==========================================================
     BUILD QUERY
  ========================================================== */

  const queryString =
    useMemo(
      () => {
        const params =
          new URLSearchParams();

        if (
          statusFilter
        ) {
          params.set(
            "status",
            statusFilter
          );
        }

        if (
          stageFilter
        ) {
          params.set(
            "admissionsStage",
            stageFilter
          );
        }

        if (
          trackFilter
        ) {
          params.set(
            "track",
            trackFilter
          );
        }

        if (
          geographyFilter
        ) {
          params.set(
            "geography",
            geographyFilter
          );
        }

        if (
          search.trim()
        ) {
          params.set(
            "search",
            search.trim()
          );
        }

        const query =
          params.toString();

        return query
          ? `?${query}`
          : "";
      },
      [
        statusFilter,
        stageFilter,
        trackFilter,
        geographyFilter,
        search,
      ]
    );


  /* ==========================================================
     LOAD STATS
  ========================================================== */

  const loadStats =
    useCallback(
      async () => {
        const data =
          await request(
            "/api/cfcv/admin/stats"
          );

        setStats(
          normalizeStats(
            data
          )
        );
      },
      []
    );


  /* ==========================================================
     LOAD APPLICATIONS
  ========================================================== */

  const loadApplications =
    useCallback(
      async ({
        showLoader = true,
      } = {}) => {
        if (showLoader) {
          setLoading(true);
        }

        setError("");

        try {
          const data =
            await request(
              `/api/cfcv/admin/applications${queryString}`
            );

          const rows =
            Array.isArray(
              data?.applications
            )
              ? data.applications
              : [];

          setApplications(
            rows
          );

          setSelectedId(
            (current) => {
              if (
                current &&
                rows.some(
                  (item) =>
                    item.id ===
                    current
                )
              ) {
                return current;
              }

              return (
                rows[0]?.id ||
                null
              );
            }
          );
        } catch (
          requestError
        ) {
          setError(
            requestError.message ||
              "Unable to load CFCV applications."
          );

          setApplications([]);
          setSelectedId(null);
        } finally {
          if (showLoader) {
            setLoading(false);
          }
        }
      },
      [
        queryString,
      ]
    );


  /* ==========================================================
     LOAD INITIAL / FILTERED DATA
  ========================================================== */

  useEffect(
    () => {
      const timer =
        window.setTimeout(
          () => {
            loadApplications();
          },
          search.trim()
            ? 350
            : 0
        );

      return () =>
        window.clearTimeout(
          timer
        );
    },
    [
      loadApplications,
      search,
    ]
  );


  useEffect(
    () => {
      loadStats().catch(
        (statsError) => {
          console.error(
            "[CFCV ADMIN] Unable to load stats:",
            statsError
          );
        }
      );
    },
    [
      loadStats,
    ]
  );


  /* ==========================================================
     LOAD SELECTED APPLICATION
  ========================================================== */

  const loadApplication =
    useCallback(
      async (
        id,
        {
          showLoader = true,
        } = {}
      ) => {
        if (!id) {
          setSelectedApplication(
            null
          );

          return;
        }

        if (showLoader) {
          setDetailLoading(
            true
          );
        }

        try {
          const data =
            await request(
              `/api/cfcv/admin/applications/${id}`
            );

          const application =
            data?.application ||
            null;

          setSelectedApplication(
            application
          );

          if (application) {
            setEditData({
              admissionsStage:
                application.admissionsStage ||
                "applied",

              assignedTrack:
                application.assignedTrack ||
                "",

              matchingRequired:
                Boolean(
                  application.matchingRequired
                ),

              matchingStatus:
                application.matchingStatus ||
                "not_started",

              finalDecision:
                application.finalDecision ||
                "",

              status:
                application.status ||
                "submitted",

              interviewRequired:
                Boolean(
                  application.interviewRequired
                ),

              interviewStatus:
                application.interviewStatus ||
                "not_scheduled",

              interviewDate:
                toDateTimeLocal(
                  application.interviewDate
                ),

              reviewerNotes:
                application.reviewerNotes ||
                "",

              interviewNotes:
                application.interviewNotes ||
                "",

              matchingNotes:
                application.matchingNotes ||
                "",

              decisionNotes:
                application.decisionNotes ||
                "",
            });
          }
        } catch (
          requestError
        ) {
          setError(
            requestError.message ||
              "Unable to load the application."
          );

          setSelectedApplication(
            null
          );
        } finally {
          if (showLoader) {
            setDetailLoading(
              false
            );
          }
        }
      },
      []
    );


  useEffect(
    () => {
      if (!selectedId) {
        setSelectedApplication(
          null
        );

        return;
      }

      loadApplication(
        selectedId
      );
    },
    [
      selectedId,
      loadApplication,
    ]
  );


  /* ==========================================================
     EDIT HANDLER
  ========================================================== */

  function handleEditChange(
    event
  ) {
    const {
      name,
      value,
      type,
      checked,
    } =
      event.target;

    setEditData(
      (current) => ({
        ...current,

        [name]:
          type ===
          "checkbox"
            ? checked
            : value,
      })
    );
  }


  /* ==========================================================
     SAVE APPLICATION
  ========================================================== */

  async function handleSave() {
    if (
      !selectedApplication?.id
    ) {
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        admissionsStage:
          editData.admissionsStage,

        assignedTrack:
          editData.assignedTrack ||
          null,

        matchingRequired:
          editData.matchingRequired,

        matchingStatus:
          editData.matchingStatus,

        finalDecision:
          editData.finalDecision ||
          null,

        status:
          editData.status,

        interviewRequired:
          editData.interviewRequired,

        interviewStatus:
          editData.interviewStatus,

        interviewDate:
          editData.interviewDate
            ? new Date(
                editData.interviewDate
              ).toISOString()
            : null,

        reviewerNotes:
          editData.reviewerNotes,

        interviewNotes:
          editData.interviewNotes,

        matchingNotes:
          editData.matchingNotes,

        decisionNotes:
          editData.decisionNotes,
      };


      const data =
        await request(
          `/api/cfcv/admin/applications/${selectedApplication.id}`,
          {
            method:
              "PATCH",

            body:
              JSON.stringify(
                payload
              ),
          }
        );


      if (
        data?.application
      ) {
        setSelectedApplication(
          data.application
        );
      }


      setSuccess(
        "Application updated successfully."
      );


      await Promise.all([
        loadApplications({
          showLoader:
            false,
        }),

        loadStats(),
      ]);


      await loadApplication(
        selectedApplication.id,
        {
          showLoader:
            false,
        }
      );
    } catch (
      saveError
    ) {
      setError(
        saveError.message ||
          "Unable to update the application."
      );
    } finally {
      setSaving(false);
    }
  }


  /* ==========================================================
     DOWNLOAD / OPEN RESUME
  ========================================================== */

  async function handleResume() {
    if (
      !selectedApplication?.id
    ) {
      return;
    }

    setResumeLoading(
      true
    );

    setError("");

    try {
      const data =
        await request(
          `/api/cfcv/admin/applications/${selectedApplication.id}/resume`
        );

      const signedUrl =
        data?.signedUrl ||
        data?.url;

      if (!signedUrl) {
        throw new Error(
          "The résumé download link could not be created."
        );
      }


      window.open(
        signedUrl,
        "_blank",
        "noopener,noreferrer"
      );
    } catch (
      resumeError
    ) {
      setError(
        resumeError.message ||
          "Unable to open the applicant résumé."
      );
    } finally {
      setResumeLoading(
        false
      );
    }
  }


  /* ==========================================================
     REFRESH
  ========================================================== */

  async function handleRefresh() {
    setError("");
    setSuccess("");

    try {
      await Promise.all([
        loadApplications(),
        loadStats(),
      ]);

      if (selectedId) {
        await loadApplication(
          selectedId,
          {
            showLoader:
              false,
          }
        );
      }
    } catch (
      refreshError
    ) {
      setError(
        refreshError.message ||
          "Unable to refresh CFCV admissions."
      );
    }
  }


  /* ==========================================================
     CLEAR FILTERS
  ========================================================== */

  function clearFilters() {
    setSearch("");
    setStatusFilter("");
    setStageFilter("");
    setTrackFilter("");
    setGeographyFilter("");
  }


  const hasFilters =
    Boolean(
      search ||
      statusFilter ||
      stageFilter ||
      trackFilter ||
      geographyFilter
    );


  /* ==========================================================
     STAT CARDS
  ========================================================== */

  const statCards = [
    {
      label:
        "Applications",
      value:
        stats.totalApplications,
      icon:
        FileText,
    },
    {
      label:
        "Under Review",
      value:
        stats.underReview,
      icon:
        ClipboardCheck,
    },
    {
      label:
        "Interviews",
      value:
        stats.interviews,
      icon:
        CalendarDays,
    },
    {
      label:
        "Match Required",
      value:
        stats.matchingRequired,
      icon:
        Handshake,
    },
    {
      label:
        "Admitted",
      value:
        stats.admitted,
      icon:
        CheckCircle2,
    },
    {
      label:
        "Remaining Capacity",
      value:
        stats.remainingCapacity,
      icon:
        Users,
    },
  ];


  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <main className="admin-cfcv">
      {/* ======================================================
          HEADER
      ======================================================= */}

      <header className="admin-cfcv__header">
        <div className="admin-cfcv__header-copy">
          <div className="admin-cfcv__eyebrow">
            <ShieldCheck
              size={16}
              aria-hidden="true"
            />

            CFCV Admissions
          </div>

          <h1>
            Fellowship Admissions
          </h1>

          <p>
            Review applicants,
            manage assessments,
            interviews, track
            placement, cross-continental
            matching and final
            admissions decisions.
          </p>
        </div>

        <button
          type="button"
          className="admin-cfcv__refresh"
          onClick={
            handleRefresh
          }
          disabled={
            loading
          }
        >
          <RefreshCw
            size={17}
            className={
              loading
                ? "is-spinning"
                : ""
            }
          />

          Refresh
        </button>
      </header>


      {/* ======================================================
          ALERTS
      ======================================================= */}

      {error && (
        <div
          className="admin-cfcv-alert admin-cfcv-alert--error"
          role="alert"
        >
          <AlertCircle
            size={19}
          />

          <span>
            {error}
          </span>

          <button
            type="button"
            onClick={() =>
              setError("")
            }
            aria-label="Dismiss error"
          >
            <X
              size={17}
            />
          </button>
        </div>
      )}


      {success && (
        <div
          className="admin-cfcv-alert admin-cfcv-alert--success"
          role="status"
        >
          <CheckCircle2
            size={19}
          />

          <span>
            {success}
          </span>

          <button
            type="button"
            onClick={() =>
              setSuccess("")
            }
            aria-label="Dismiss message"
          >
            <X
              size={17}
            />
          </button>
        </div>
      )}


      {/* ======================================================
          STATISTICS
      ======================================================= */}

      <section
        className="admin-cfcv-stats"
        aria-label="CFCV admissions statistics"
      >
        {statCards.map(
          (card) => {
            const Icon =
              card.icon;

            return (
              <article
                key={
                  card.label
                }
                className="admin-cfcv-stat"
              >
                <div className="admin-cfcv-stat__icon">
                  <Icon
                    size={21}
                    aria-hidden="true"
                  />
                </div>

                <div>
                  <strong>
                    {card.value}
                  </strong>

                  <span>
                    {card.label}
                  </span>
                </div>
              </article>
            );
          }
        )}
      </section>


      {/* ======================================================
          COHORT TRACK SUMMARY
      ======================================================= */}

      <section className="admin-cfcv-cohort">
        <div className="admin-cfcv-cohort__heading">
          <div>
            <span>
              Current Cohort
            </span>

            <strong>
              {
                stats.admitted
              }
              {" / "}
              {
                stats.cohortCapacity
              }
              {" "}
              ventures admitted
            </strong>
          </div>

          <span className="admin-cfcv-cohort__remaining">
            {
              stats.remainingCapacity
            }
            {" "}
            places remaining
          </span>
        </div>

        <div className="admin-cfcv-cohort__bar">
          <span
            style={{
              width:
                `${
                  Math.min(
                    100,
                    stats.cohortCapacity >
                      0
                      ? (
                          stats.admitted /
                          stats.cohortCapacity
                        ) *
                          100
                      : 0
                  )
                }%`,
            }}
          />
        </div>

        <div className="admin-cfcv-track-summary">
          <span>
            Genesis{" "}
            <strong>
              {
                stats.genesis
              }
            </strong>
          </span>

          <span>
            Ascend{" "}
            <strong>
              {
                stats.ascend
              }
            </strong>
          </span>

          <span>
            Horizon{" "}
            <strong>
              {
                stats.horizon
              }
            </strong>
          </span>
        </div>
      </section>


      {/* ======================================================
          TOOLBAR
      ======================================================= */}

      <section className="admin-cfcv-toolbar">
        <div className="admin-cfcv-search">
          <Search
            size={18}
            aria-hidden="true"
          />

          <input
            type="search"
            value={
              search
            }
            onChange={(
              event
            ) =>
              setSearch(
                event.target
                  .value
              )
            }
            placeholder="Search applicant, email, venture or reference..."
            aria-label="Search CFCV applications"
          />

          {search && (
            <button
              type="button"
              onClick={() =>
                setSearch("")
              }
              aria-label="Clear search"
            >
              <X
                size={17}
              />
            </button>
          )}
        </div>

        <button
          type="button"
          className="admin-cfcv-filter-toggle"
          onClick={() =>
            setMobileFiltersOpen(
              (current) =>
                !current
            )
          }
        >
          <Filter
            size={17}
          />

          Filters
        </button>

        <div
          className={
            `admin-cfcv-filters ${
              mobileFiltersOpen
                ? "is-open"
                : ""
            }`
          }
        >
          <select
            value={
              statusFilter
            }
            onChange={(
              event
            ) =>
              setStatusFilter(
                event.target
                  .value
              )
            }
            aria-label="Filter by application status"
          >
            <option value="">
              All Statuses
            </option>

            {APPLICATION_STATUSES.map(
              (option) => (
                <option
                  key={
                    option.value
                  }
                  value={
                    option.value
                  }
                >
                  {
                    option.label
                  }
                </option>
              )
            )}
          </select>

          <select
            value={
              stageFilter
            }
            onChange={(
              event
            ) =>
              setStageFilter(
                event.target
                  .value
              )
            }
            aria-label="Filter by admissions stage"
          >
            <option value="">
              All Stages
            </option>

            {ADMISSIONS_STAGES.map(
              (option) => (
                <option
                  key={
                    option.value
                  }
                  value={
                    option.value
                  }
                >
                  {
                    option.label
                  }
                </option>
              )
            )}
          </select>

          <select
            value={
              trackFilter
            }
            onChange={(
              event
            ) =>
              setTrackFilter(
                event.target
                  .value
              )
            }
            aria-label="Filter by track"
          >
            <option value="">
              All Tracks
            </option>

            {TRACKS.filter(
              (option) =>
                option.value
            ).map(
              (option) => (
                <option
                  key={
                    option.value
                  }
                  value={
                    option.value
                  }
                >
                  {
                    option.label
                  }
                </option>
              )
            )}
          </select>

          <select
            value={
              geographyFilter
            }
            onChange={(
              event
            ) =>
              setGeographyFilter(
                event.target
                  .value
              )
            }
            aria-label="Filter by geography"
          >
            <option value="">
              All Geographies
            </option>

            {GEOGRAPHIES.map(
              (value) => (
                <option
                  key={
                    value
                  }
                  value={
                    value
                  }
                >
                  {value}
                </option>
              )
            )}
          </select>

          {hasFilters && (
            <button
              type="button"
              className="admin-cfcv-clear"
              onClick={
                clearFilters
              }
            >
              <X
                size={15}
              />

              Clear
            </button>
          )}
        </div>
      </section>


      {/* ======================================================
          MAIN WORKSPACE
      ======================================================= */}

      <section className="admin-cfcv-workspace">
        {/* ====================================================
            APPLICATION LIST
        ===================================================== */}

        <aside className="admin-cfcv-list">
          <div className="admin-cfcv-list__header">
            <div>
              <h2>
                Applications
              </h2>

              <span>
                {
                  applications.length
                }
                {" "}
                result
                {
                  applications.length ===
                  1
                    ? ""
                    : "s"
                }
              </span>
            </div>
          </div>


          {loading ? (
            <div className="admin-cfcv-state">
              <Loader2
                size={26}
                className="is-spinning"
              />

              <p>
                Loading
                applications...
              </p>
            </div>
          ) : applications.length ===
            0 ? (
            <div className="admin-cfcv-state">
              <FileText
                size={30}
              />

              <h3>
                No applications
              </h3>

              <p>
                No CFCV
                applications match
                the current filters.
              </p>

              {hasFilters && (
                <button
                  type="button"
                  onClick={
                    clearFilters
                  }
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <div className="admin-cfcv-list__items">
              {applications.map(
                (
                  application
                ) => (
                  <button
                    type="button"
                    key={
                      application.id
                    }
                    className={
                      `admin-cfcv-application-card ${
                        selectedId ===
                        application.id
                          ? "is-selected"
                          : ""
                      }`
                    }
                    onClick={() =>
                      setSelectedId(
                        application.id
                      )
                    }
                  >
                    <div className="admin-cfcv-application-card__top">
                      <div className="admin-cfcv-avatar">
                        {
                          getInitials(
                            application
                          )
                        }
                      </div>

                      <div className="admin-cfcv-application-card__identity">
                        <strong>
                          {
                            getFullName(
                              application
                            )
                          }
                        </strong>

                        <span>
                          {
                            application.applicationReference ||
                            "No reference"
                          }
                        </span>
                      </div>

                      <ChevronRight
                        size={18}
                        className="admin-cfcv-application-card__arrow"
                      />
                    </div>

                    <div className="admin-cfcv-application-card__venture">
                      <BriefcaseBusiness
                        size={15}
                      />

                      <span>
                        {
                          application.ventureName ||
                          "Unnamed venture"
                        }
                      </span>
                    </div>

                    <div className="admin-cfcv-application-card__meta">
                      <span>
                        <Globe2
                          size={14}
                        />

                        {
                          application.geography ||
                          "—"
                        }
                      </span>

                      <span>
                        <Clock3
                          size={14}
                        />

                        {
                          formatDate(
                            application.submittedAt
                          )
                        }
                      </span>
                    </div>

                    <div className="admin-cfcv-application-card__badges">
                      <span
                        className={
                          `cfcv-badge cfcv-badge--${stageClass(
                            application.admissionsStage
                          )}`
                        }
                      >
                        {
                          getLabel(
                            ADMISSIONS_STAGES,
                            application.admissionsStage
                          )
                        }
                      </span>

                      {application.assignedTrack && (
                        <span className="cfcv-badge cfcv-badge--track">
                          {
                            application.assignedTrack
                          }
                        </span>
                      )}
                    </div>
                  </button>
                )
              )}
            </div>
          )}
        </aside>


        {/* ====================================================
            DETAIL
        ===================================================== */}

        <section className="admin-cfcv-detail">
          {!selectedId ? (
            <div className="admin-cfcv-detail-empty">
              <ClipboardCheck
                size={42}
              />

              <h2>
                Select an
                application
              </h2>

              <p>
                Choose an applicant
                from the list to
                review their CFCV
                application.
              </p>
            </div>
          ) : detailLoading ? (
            <div className="admin-cfcv-detail-empty">
              <Loader2
                size={32}
                className="is-spinning"
              />

              <p>
                Loading application...
              </p>
            </div>
          ) : selectedApplication ? (
            <>
              {/* ==============================================
                  APPLICANT HEADER
              =============================================== */}

              <div className="admin-cfcv-detail__hero">
                <div className="admin-cfcv-detail__identity">
                  <div className="admin-cfcv-avatar admin-cfcv-avatar--large">
                    {
                      getInitials(
                        selectedApplication
                      )
                    }
                  </div>

                  <div>
                    <span className="admin-cfcv-detail__reference">
                      {
                        selectedApplication.applicationReference
                      }
                    </span>

                    <h2>
                      {
                        getFullName(
                          selectedApplication
                        )
                      }
                    </h2>

                    <p>
                      {
                        selectedApplication.ventureName ||
                        "CFCV Fellowship Applicant"
                      }
                    </p>
                  </div>
                </div>

                <div className="admin-cfcv-detail__hero-actions">
                  {selectedApplication.hasResume && (
                    <button
                      type="button"
                      className="admin-cfcv-resume-button"
                      onClick={
                        handleResume
                      }
                      disabled={
                        resumeLoading
                      }
                    >
                      {resumeLoading ? (
                        <Loader2
                          size={17}
                          className="is-spinning"
                        />
                      ) : (
                        <Download
                          size={17}
                        />
                      )}

                      View Résumé
                    </button>
                  )}

                  <span
                    className={
                      `cfcv-badge cfcv-badge--${stageClass(
                        selectedApplication.admissionsStage
                      )}`
                    }
                  >
                    {
                      getLabel(
                        ADMISSIONS_STAGES,
                        selectedApplication.admissionsStage
                      )
                    }
                  </span>
                </div>
              </div>


              {/* ==============================================
                  WORKFLOW
              =============================================== */}

              <div className="admin-cfcv-workflow">
                {ADMISSIONS_STAGES.map(
                  (
                    stage,
                    index
                  ) => {
                    const currentIndex =
                      ADMISSIONS_STAGES.findIndex(
                        (
                          item
                        ) =>
                          item.value ===
                          selectedApplication.admissionsStage
                      );

                    const completed =
                      index <
                      currentIndex;

                    const active =
                      index ===
                      currentIndex;

                    return (
                      <div
                        key={
                          stage.value
                        }
                        className={
                          `admin-cfcv-workflow__step ${
                            completed
                              ? "is-complete"
                              : ""
                          } ${
                            active
                              ? "is-active"
                              : ""
                          }`
                        }
                      >
                        <span>
                          {completed ? (
                            <Check
                              size={14}
                            />
                          ) : (
                            index +
                            1
                          )}
                        </span>

                        <small>
                          {
                            stage.label
                          }
                        </small>
                      </div>
                    );
                  }
                )}
              </div>


              {/* ==============================================
                  APPLICATION INFORMATION
              =============================================== */}

              <div className="admin-cfcv-detail-grid">
                <div className="admin-cfcv-detail-main">
                  {/* ==========================================
                      FOUNDER
                  =========================================== */}

                  <section className="cfcv-detail-section">
                    <div className="cfcv-detail-section__heading">
                      <UserRound
                        size={19}
                      />

                      <h3>
                        Founder Information
                      </h3>
                    </div>

                    <dl className="cfcv-detail-list">
                      <DetailRow label="Name">
                        {
                          getFullName(
                            selectedApplication
                          )
                        }
                      </DetailRow>

                      <DetailRow label="Email">
                        <a
                          href={`mailto:${selectedApplication.email}`}
                        >
                          <Mail
                            size={14}
                          />

                          {
                            selectedApplication.email
                          }
                        </a>
                      </DetailRow>

                      <DetailRow label="Phone">
                        {
                          selectedApplication.phone ? (
                            <a
                              href={`tel:${selectedApplication.phone}`}
                            >
                              <Phone
                                size={14}
                              />

                              {
                                selectedApplication.phone
                              }
                            </a>
                          ) : (
                            "—"
                          )
                        }
                      </DetailRow>

                      <DetailRow label="Location">
                        <span className="cfcv-inline-icon">
                          <MapPin
                            size={14}
                          />

                          {
                            [
                              selectedApplication.city,
                              selectedApplication.country,
                            ]
                              .filter(
                                Boolean
                              )
                              .join(
                                ", "
                              ) ||
                            "—"
                          }
                        </span>
                      </DetailRow>

                      <DetailRow label="Geography">
                        {
                          selectedApplication.geography
                        }
                      </DetailRow>

                      <DetailRow label="Submitted">
                        {
                          formatDateTime(
                            selectedApplication.submittedAt
                          )
                        }
                      </DetailRow>

                      <DetailRow label="Résumé / CV">
                        {
                          selectedApplication.hasResume ? (
                            <button
                              type="button"
                              className="cfcv-inline-download"
                              onClick={
                                handleResume
                              }
                              disabled={
                                resumeLoading
                              }
                            >
                              <FileText
                                size={15}
                              />

                              {
                                selectedApplication.resumeFileName ||
                                "Open résumé"
                              }
                            </button>
                          ) : (
                            "No résumé attached"
                          )
                        }
                      </DetailRow>
                    </dl>
                  </section>


                  <TextSection title="Professional Background">
                    {
                      selectedApplication.professionalBackground
                    }
                  </TextSection>

                  <TextSection title="Relevant Skills & Experience">
                    {
                      selectedApplication.relevantSkills
                    }
                  </TextSection>

                  {selectedApplication.entrepreneurshipReason && (
                    <TextSection title="Why Entrepreneurship">
                      {
                        selectedApplication.entrepreneurshipReason
                      }
                    </TextSection>
                  )}


                  {/* ==========================================
                      VENTURE
                  =========================================== */}

                  <section className="cfcv-detail-section">
                    <div className="cfcv-detail-section__heading">
                      <BriefcaseBusiness
                        size={19}
                      />

                      <h3>
                        Venture
                      </h3>
                    </div>

                    <dl className="cfcv-detail-list">
                      <DetailRow label="Venture Name">
                        {
                          selectedApplication.ventureName ||
                          "—"
                        }
                      </DetailRow>

                      <DetailRow label="Sector">
                        {
                          selectedApplication.sector ||
                          "—"
                        }
                      </DetailRow>

                      <DetailRow label="Current Stage">
                        {
                          selectedApplication.ventureStage
                        }
                      </DetailRow>

                      <DetailRow label="Team">
                        {
                          selectedApplication.teamStatus
                        }
                      </DetailRow>
                    </dl>
                  </section>


                  <TextSection title="Venture Description">
                    {
                      selectedApplication.ventureDescription
                    }
                  </TextSection>

                  <TextSection title="Problem">
                    {
                      selectedApplication.problem
                    }
                  </TextSection>

                  <TextSection title="Solution">
                    {
                      selectedApplication.solution
                    }
                  </TextSection>

                  <TextSection title="Current Progress">
                    {
                      selectedApplication.currentProgress
                    }
                  </TextSection>


                  {/* ==========================================
                      MARKET & TEAM
                  =========================================== */}

                  <section className="cfcv-detail-section">
                    <div className="cfcv-detail-section__heading">
                      <Target
                        size={19}
                      />

                      <h3>
                        Market & Team
                      </h3>
                    </div>

                    <dl className="cfcv-detail-list">
                      <DetailRow label="Target Market">
                        {
                          selectedApplication.targetMarket
                        }
                      </DetailRow>

                      <DetailRow label="Customer">
                        {
                          selectedApplication.customerDescription ||
                          "—"
                        }
                      </DetailRow>

                      <DetailRow label="Team Status">
                        {
                          selectedApplication.teamStatus
                        }
                      </DetailRow>

                      <DetailRow label="Team Description">
                        {
                          selectedApplication.teamDescription ||
                          "—"
                        }
                      </DetailRow>
                    </dl>
                  </section>


                  {/* ==========================================
                      CROSS-CONTINENTAL COLLABORATION
                  =========================================== */}

                  <section className="cfcv-detail-section">
                    <div className="cfcv-detail-section__heading">
                      <Handshake
                        size={19}
                      />

                      <h3>
                        Cross-Continental Collaboration
                      </h3>
                    </div>

                    <dl className="cfcv-detail-list">
                      <DetailRow label="Existing Cross-Continental Team">
                        {
                          selectedApplication.existingCrossContinentalTeam
                        }
                      </DetailRow>

                      <DetailRow label="Collaborator Needs">
                        {
                          selectedApplication.collaboratorNeeds ||
                          "—"
                        }
                      </DetailRow>

                      <DetailRow label="Market Knowledge">
                        {
                          selectedApplication.marketKnowledge ||
                          "—"
                        }
                      </DetailRow>

                      <DetailRow label="Geographic Connections">
                        {
                          selectedApplication.geographicConnections ||
                          "—"
                        }
                      </DetailRow>

                      <DetailRow label="Working Style">
                        {
                          selectedApplication.workingStyle
                        }
                      </DetailRow>

                      <DetailRow label="Leadership Strengths">
                        {
                          selectedApplication.leadershipStrengths ||
                          "—"
                        }
                      </DetailRow>
                    </dl>
                  </section>


                  <TextSection title="Long-Term Objectives">
                    {
                      selectedApplication.longTermObjectives
                    }
                  </TextSection>


                  {/* ==========================================
                      COMMITMENT
                  =========================================== */}

                  <section className="cfcv-detail-section">
                    <div className="cfcv-detail-section__heading">
                      <Sparkles
                        size={19}
                      />

                      <h3>
                        Commitment & Goals
                      </h3>
                    </div>

                    <dl className="cfcv-detail-list">
                      <DetailRow label="Time Commitment">
                        {
                          selectedApplication.timeCommitment
                        }
                      </DetailRow>

                      <DetailRow label="Decision Making">
                        {
                          selectedApplication.decisionMaking
                        }
                      </DetailRow>

                      <DetailRow label="Ownership Expectations">
                        {
                          selectedApplication.ownershipExpectations ||
                          "—"
                        }
                      </DetailRow>
                    </dl>
                  </section>


                  <TextSection title="Six-Month Goals">
                    {
                      selectedApplication.sixMonthGoals
                    }
                  </TextSection>
                </div>


                {/* ============================================
                    ADMISSIONS CONTROL PANEL
                ============================================= */}

                <aside className="admin-cfcv-review-panel">
                  <div className="admin-cfcv-review-panel__heading">
                    <GraduationCap
                      size={20}
                    />

                    <div>
                      <h3>
                        Admissions Review
                      </h3>

                      <p>
                        Internal CMS controls
                      </p>
                    </div>
                  </div>


                  <div className="admin-cfcv-review-field">
                    <label htmlFor="cfcv-admissions-stage">
                      Admissions Stage
                    </label>

                    <select
                      id="cfcv-admissions-stage"
                      name="admissionsStage"
                      value={
                        editData.admissionsStage
                      }
                      onChange={
                        handleEditChange
                      }
                    >
                      {ADMISSIONS_STAGES.map(
                        (
                          option
                        ) => (
                          <option
                            key={
                              option.value
                            }
                            value={
                              option.value
                            }
                          >
                            {
                              option.label
                            }
                          </option>
                        )
                      )}
                    </select>
                  </div>


                  <div className="admin-cfcv-review-field">
                    <label htmlFor="cfcv-application-status">
                      Application Status
                    </label>

                    <select
                      id="cfcv-application-status"
                      name="status"
                      value={
                        editData.status
                      }
                      onChange={
                        handleEditChange
                      }
                    >
                      {APPLICATION_STATUSES.map(
                        (
                          option
                        ) => (
                          <option
                            key={
                              option.value
                            }
                            value={
                              option.value
                            }
                          >
                            {
                              option.label
                            }
                          </option>
                        )
                      )}
                    </select>
                  </div>


                  <div className="admin-cfcv-review-field">
                    <label htmlFor="cfcv-track">
                      Track Placement
                    </label>

                    <select
                      id="cfcv-track"
                      name="assignedTrack"
                      value={
                        editData.assignedTrack
                      }
                      onChange={
                        handleEditChange
                      }
                    >
                      {TRACKS.map(
                        (
                          option
                        ) => (
                          <option
                            key={
                              option.value ||
                              "none"
                            }
                            value={
                              option.value
                            }
                          >
                            {
                              option.label
                            }
                          </option>
                        )
                      )}
                    </select>
                  </div>


                  {/* ==========================================
                      INTERVIEW
                  =========================================== */}

                  <div className="admin-cfcv-review-divider">
                    Founder Interview
                  </div>


                  <label className="admin-cfcv-check">
                    <input
                      type="checkbox"
                      name="interviewRequired"
                      checked={
                        editData.interviewRequired
                      }
                      onChange={
                        handleEditChange
                      }
                    />

                    <span>
                      Interview required
                    </span>
                  </label>


                  <div className="admin-cfcv-review-field">
                    <label htmlFor="cfcv-interview-status">
                      Interview Status
                    </label>

                    <select
                      id="cfcv-interview-status"
                      name="interviewStatus"
                      value={
                        editData.interviewStatus
                      }
                      onChange={
                        handleEditChange
                      }
                    >
                      {INTERVIEW_STATUSES.map(
                        (
                          option
                        ) => (
                          <option
                            key={
                              option.value
                            }
                            value={
                              option.value
                            }
                          >
                            {
                              option.label
                            }
                          </option>
                        )
                      )}
                    </select>
                  </div>


                  <div className="admin-cfcv-review-field">
                    <label htmlFor="cfcv-interview-date">
                      Interview Date
                    </label>

                    <input
                      id="cfcv-interview-date"
                      type="datetime-local"
                      name="interviewDate"
                      value={
                        editData.interviewDate
                      }
                      onChange={
                        handleEditChange
                      }
                    />
                  </div>


                  <div className="admin-cfcv-review-field">
                    <label htmlFor="cfcv-interview-notes">
                      Interview Notes
                    </label>

                    <textarea
                      id="cfcv-interview-notes"
                      name="interviewNotes"
                      rows={4}
                      value={
                        editData.interviewNotes
                      }
                      onChange={
                        handleEditChange
                      }
                      placeholder="Internal interview notes..."
                    />
                  </div>


                  {/* ==========================================
                      MATCHING
                  =========================================== */}

                  <div className="admin-cfcv-review-divider">
                    Cross-Continental Matching
                  </div>


                  <label className="admin-cfcv-check">
                    <input
                      type="checkbox"
                      name="matchingRequired"
                      checked={
                        editData.matchingRequired
                      }
                      onChange={
                        handleEditChange
                      }
                    />

                    <span>
                      Matching required
                    </span>
                  </label>


                  <div className="admin-cfcv-review-field">
                    <label htmlFor="cfcv-matching-status">
                      Matching Status
                    </label>

                    <select
                      id="cfcv-matching-status"
                      name="matchingStatus"
                      value={
                        editData.matchingStatus
                      }
                      onChange={
                        handleEditChange
                      }
                    >
                      {MATCHING_STATUSES.map(
                        (
                          option
                        ) => (
                          <option
                            key={
                              option.value
                            }
                            value={
                              option.value
                            }
                          >
                            {
                              option.label
                            }
                          </option>
                        )
                      )}
                    </select>
                  </div>


                  <div className="admin-cfcv-review-field">
                    <label htmlFor="cfcv-matching-notes">
                      Matching Notes
                    </label>

                    <textarea
                      id="cfcv-matching-notes"
                      name="matchingNotes"
                      rows={4}
                      value={
                        editData.matchingNotes
                      }
                      onChange={
                        handleEditChange
                      }
                      placeholder="Compatibility, collaborator and matching notes..."
                    />
                  </div>


                  {/* ==========================================
                      FINAL DECISION
                  =========================================== */}

                  <div className="admin-cfcv-review-divider">
                    Final Selection
                  </div>


                  <div className="admin-cfcv-review-field">
                    <label htmlFor="cfcv-final-decision">
                      Final Decision
                    </label>

                    <select
                      id="cfcv-final-decision"
                      name="finalDecision"
                      value={
                        editData.finalDecision
                      }
                      onChange={
                        handleEditChange
                      }
                    >
                      {FINAL_DECISIONS.map(
                        (
                          option
                        ) => (
                          <option
                            key={
                              option.value ||
                              "none"
                            }
                            value={
                              option.value
                            }
                          >
                            {
                              option.label
                            }
                          </option>
                        )
                      )}
                    </select>
                  </div>


                  <div className="admin-cfcv-review-field">
                    <label htmlFor="cfcv-reviewer-notes">
                      Reviewer Notes
                    </label>

                    <textarea
                      id="cfcv-reviewer-notes"
                      name="reviewerNotes"
                      rows={4}
                      value={
                        editData.reviewerNotes
                      }
                      onChange={
                        handleEditChange
                      }
                      placeholder="Founder assessment and reviewer notes..."
                    />
                  </div>


                  <div className="admin-cfcv-review-field">
                    <label htmlFor="cfcv-decision-notes">
                      Decision Notes
                    </label>

                    <textarea
                      id="cfcv-decision-notes"
                      name="decisionNotes"
                      rows={4}
                      value={
                        editData.decisionNotes
                      }
                      onChange={
                        handleEditChange
                      }
                      placeholder="Internal final decision notes..."
                    />
                  </div>


                  <button
                    type="button"
                    className="admin-cfcv-save"
                    onClick={
                      handleSave
                    }
                    disabled={
                      saving
                    }
                  >
                    {saving ? (
                      <>
                        <Loader2
                          size={18}
                          className="is-spinning"
                        />

                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle2
                          size={18}
                        />

                        Save Review
                      </>
                    )}
                  </button>
                </aside>
              </div>
            </>
          ) : (
            <div className="admin-cfcv-detail-empty">
              <AlertCircle
                size={38}
              />

              <h2>
                Application
                unavailable
              </h2>

              <p>
                This application
                could not be loaded.
              </p>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}