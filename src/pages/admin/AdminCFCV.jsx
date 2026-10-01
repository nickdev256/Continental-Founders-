import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  Building2,
  ChartNoAxesColumnIncreasing,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  Download,
  FileText,
  Filter,
  Hourglass,
  Loader2,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Mountain,
  Network,
  RefreshCw,
  Search,
  Sprout,
  Users,
  X,
} from "lucide-react";

import "./AdminCFCV.css";

/* API */

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(/\/+$/, "");

/* Configuration */

const ADMISSIONS_STAGES = [
  { value: "applied", label: "Applied" },
  { value: "assessment", label: "Assessment" },
  { value: "interview", label: "Interview" },
  { value: "track_placement", label: "Track Placement" },
  { value: "matching", label: "Matching" },
  { value: "compatibility", label: "Compatibility" },
  { value: "final_decision", label: "Final Decision" },
  { value: "enrollment", label: "Enrollment" },
];

const TRACKS = [
  { value: "", label: "Not assigned" },
  { value: "Genesis", label: "Genesis — Build It" },
  { value: "Ascend", label: "Ascend — Prove It" },
  { value: "Horizon", label: "Horizon — Scale It" },
];

const MATCHING_STATUSES = [
  { value: "not_started", label: "Not Started" },
  { value: "required", label: "Required" },
  { value: "in_progress", label: "In Progress" },
  { value: "matched", label: "Matched" },
  {
    value: "compatibility_sprint",
    label: "Compatibility Sprint",
  },
  { value: "completed", label: "Completed" },
];

const FINAL_DECISIONS = [
  { value: "", label: "No decision yet" },
  { value: "ADMIT", label: "Admit" },
  {
    value: "ADMIT WITH TRACK PLACEMENT",
    label: "Admit With Track Placement",
  },
  {
    value: "MATCH REQUIRED",
    label: "Match Required",
  },
  { value: "WAITLIST", label: "Waitlist" },
  { value: "NOT SELECTED", label: "Not Selected" },
];

const APPLICATION_STATUSES = [
  { value: "submitted", label: "Submitted" },
  { value: "under_review", label: "Under Review" },
  { value: "in_progress", label: "In Progress" },
  { value: "admitted", label: "Admitted" },
  { value: "waitlisted", label: "Waitlisted" },
  { value: "not_selected", label: "Not Selected" },
  { value: "withdrawn", label: "Withdrawn" },
];

const INTERVIEW_STATUSES = [
  { value: "not_scheduled", label: "Not Scheduled" },
  { value: "scheduled", label: "Scheduled" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const GEOGRAPHIES = [
  "Africa",
  "United States",
  "Diaspora",
];

/* Helpers */

function formatDateTime(value, fallback = "—") {
  if (!value) return fallback;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function toDateTimeLocal(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const localDate = new Date(
    date.getTime() -
      date.getTimezoneOffset() * 60 * 1000
  );

  return localDate.toISOString().slice(0, 16);
}

function getFullName(application) {
  return (
    [
      application?.firstName,
      application?.lastName,
    ]
      .filter(Boolean)
      .join(" ")
      .trim() || "Unnamed applicant"
  );
}

function getInitials(application) {
  const first = String(
    application?.firstName || ""
  )
    .trim()
    .charAt(0);

  const last = String(
    application?.lastName || ""
  )
    .trim()
    .charAt(0);

  return `${first}${last}`.toUpperCase() || "CF";
}

function getLabel(options, value) {
  return (
    options.find(
      (option) => option.value === value
    )?.label ||
    value ||
    "—"
  );
}

function stageClass(value) {
  return String(value || "unknown")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");
}

function normalizeStats(payload) {
  const source = payload?.stats || payload || {};

  return {
    totalApplications: Number(
      source.totalApplications || 0
    ),
    submitted: Number(source.submitted || 0),
    underReview: Number(source.underReview || 0),
    interviews: Number(source.interviews || 0),
    matchingRequired: Number(
      source.matchingRequired || 0
    ),
    admitted: Number(source.admitted || 0),
    waitlisted: Number(source.waitlisted || 0),
    genesis: Number(source.genesis || 0),
    ascend: Number(source.ascend || 0),
    horizon: Number(source.horizon || 0),
    cohortCapacity: Number(
      source.cohortCapacity || 30
    ),
    remainingCapacity: Number(
      source.remainingCapacity ?? 30
    ),
  };
}

async function request(endpoint, options = {}) {
  const hasBody =
    options.body !== undefined &&
    options.body !== null;

  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,
      credentials: "include",
      headers: {
        Accept: "application/json",
        ...(hasBody
          ? { "Content-Type": "application/json" }
          : {}),
        ...options.headers,
      },
    }
  );

  let data = {};

  try {
    data = await response.json();
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

function DetailRow({ label, children }) {
  return (
    <div className="cfcv-detail-row">
      <dt>{label}</dt>
      <dd>{children || "—"}</dd>
    </div>
  );
}

function TextSection({ title, children }) {
  return (
    <section className="cfcv-detail-section">
      <h3>{title}</h3>
      <div className="cfcv-detail-copy">
        {children || "—"}
      </div>
    </section>
  );
}

/* Page */

export default function AdminCFCV() {
  const [applications, setApplications] =
    useState([]);

  const [stats, setStats] = useState(
    normalizeStats({})
  );

  const [selectedId, setSelectedId] =
    useState(null);

  const [
    selectedApplication,
    setSelectedApplication,
  ] = useState(null);

  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] =
    useState(false);

  const [saving, setSaving] = useState(false);
  const [resumeLoading, setResumeLoading] =
    useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("");

  const [stageFilter, setStageFilter] =
    useState("");

  const [trackFilter, setTrackFilter] =
    useState("");

  const [geographyFilter, setGeographyFilter] =
    useState("");

  const [
    mobileFiltersOpen,
    setMobileFiltersOpen,
  ] = useState(false);

  const [detailTab, setDetailTab] =
    useState("Founder");

  const [mobileTab, setMobileTab] =
    useState("Details");

  const [mobileListOpen, setMobileListOpen] =
    useState(false);

  const [editData, setEditData] = useState({
    admissionsStage: "applied",
    assignedTrack: "",
    matchingRequired: false,
    matchingStatus: "not_started",
    finalDecision: "",
    status: "submitted",
    interviewRequired: false,
    interviewStatus: "not_scheduled",
    interviewDate: "",
    reviewerNotes: "",
    interviewNotes: "",
    matchingNotes: "",
    decisionNotes: "",
  });

  const queryString = useMemo(() => {
    const params = new URLSearchParams();

    if (statusFilter) {
      params.set("status", statusFilter);
    }

    if (stageFilter) {
      params.set("admissionsStage", stageFilter);
    }

    if (trackFilter) {
      params.set("track", trackFilter);
    }

    if (geographyFilter) {
      params.set("geography", geographyFilter);
    }

    if (search.trim()) {
      params.set("search", search.trim());
    }

    const query = params.toString();

    return query ? `?${query}` : "";
  }, [
    statusFilter,
    stageFilter,
    trackFilter,
    geographyFilter,
    search,
  ]);

  const loadStats = useCallback(async () => {
    const data = await request(
      "/api/cfcv/admin/stats"
    );

    setStats(normalizeStats(data));
  }, []);

  const loadApplications = useCallback(
    async ({ showLoader = true } = {}) => {
      if (showLoader) {
        setLoading(true);
      }

      setError("");

      try {
        const data = await request(
          `/api/cfcv/admin/applications${queryString}`
        );

        const rows = Array.isArray(
          data?.applications
        )
          ? data.applications
          : [];

        setApplications(rows);

        setSelectedId((current) => {
          if (
            current &&
            rows.some(
              (item) => item.id === current
            )
          ) {
            return current;
          }

          return rows[0]?.id || null;
        });
      } catch (requestError) {
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
    [queryString]
  );

  useEffect(() => {
    const timer = window.setTimeout(
      () => {
        loadApplications();
      },
      search.trim() ? 350 : 0
    );

    return () => window.clearTimeout(timer);
  }, [loadApplications, search]);

  useEffect(() => {
    loadStats().catch((statsError) => {
      console.error(
        "[CFCV ADMIN] Unable to load stats:",
        statsError
      );
    });
  }, [loadStats]);

  const loadApplication = useCallback(
    async (id, { showLoader = true } = {}) => {
      if (!id) {
        setSelectedApplication(null);
        return;
      }

      if (showLoader) {
        setDetailLoading(true);
      }

      try {
        const data = await request(
          `/api/cfcv/admin/applications/${id}`
        );

        const application =
          data?.application || null;

        setSelectedApplication(application);

        if (application) {
          setEditData({
            admissionsStage:
              application.admissionsStage ||
              "applied",

            assignedTrack:
              application.assignedTrack || "",

            matchingRequired: Boolean(
              application.matchingRequired
            ),

            matchingStatus:
              application.matchingStatus ||
              "not_started",

            finalDecision:
              application.finalDecision || "",

            status:
              application.status || "submitted",

            interviewRequired: Boolean(
              application.interviewRequired
            ),

            interviewStatus:
              application.interviewStatus ||
              "not_scheduled",

            interviewDate: toDateTimeLocal(
              application.interviewDate
            ),

            reviewerNotes:
              application.reviewerNotes || "",

            interviewNotes:
              application.interviewNotes || "",

            matchingNotes:
              application.matchingNotes || "",

            decisionNotes:
              application.decisionNotes || "",
          });
        }
      } catch (requestError) {
        setError(
          requestError.message ||
            "Unable to load the application."
        );

        setSelectedApplication(null);
      } finally {
        if (showLoader) {
          setDetailLoading(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    if (!selectedId) {
      setSelectedApplication(null);
      return;
    }

    loadApplication(selectedId);
  }, [selectedId, loadApplication]);

  function handleEditChange(event) {
    const { name, value, type, checked } =
      event.target;

    setEditData((current) => ({
      ...current,
      [name]:
        type === "checkbox" ? checked : value,
    }));
  }

  async function handleSave() {
    if (!selectedApplication?.id) {
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
          editData.assignedTrack || null,

        matchingRequired:
          editData.matchingRequired,

        matchingStatus:
          editData.matchingStatus,

        finalDecision:
          editData.finalDecision || null,

        status: editData.status,

        interviewRequired:
          editData.interviewRequired,

        interviewStatus:
          editData.interviewStatus,

        interviewDate: editData.interviewDate
          ? new Date(
              editData.interviewDate
            ).toISOString()
          : null,

        reviewerNotes: editData.reviewerNotes,
        interviewNotes: editData.interviewNotes,
        matchingNotes: editData.matchingNotes,
        decisionNotes: editData.decisionNotes,
      };

      const data = await request(
        `/api/cfcv/admin/applications/${selectedApplication.id}`,
        {
          method: "PATCH",
          body: JSON.stringify(payload),
        }
      );

      if (data?.application) {
        setSelectedApplication(data.application);
      }

      setSuccess(
        "Application updated successfully."
      );

      await Promise.all([
        loadApplications({ showLoader: false }),
        loadStats(),
      ]);

      await loadApplication(
        selectedApplication.id,
        { showLoader: false }
      );
    } catch (saveError) {
      setError(
        saveError.message ||
          "Unable to update the application."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleResume() {
    if (!selectedApplication?.id) {
      return;
    }

    setResumeLoading(true);
    setError("");

    try {
      const data = await request(
        `/api/cfcv/admin/applications/${selectedApplication.id}/resume`
      );

      const signedUrl =
        data?.signedUrl || data?.url;

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
    } catch (resumeError) {
      setError(
        resumeError.message ||
          "Unable to open the applicant résumé."
      );
    } finally {
      setResumeLoading(false);
    }
  }

  async function handleRefresh() {
    setError("");
    setSuccess("");

    try {
      await Promise.all([
        loadApplications(),
        loadStats(),
      ]);

      if (selectedId) {
        await loadApplication(selectedId, {
          showLoader: false,
        });
      }
    } catch (refreshError) {
      setError(
        refreshError.message ||
          "Unable to refresh CFCV admissions."
      );
    }
  }

  function clearFilters() {
    setSearch("");
    setStatusFilter("");
    setStageFilter("");
    setTrackFilter("");
    setGeographyFilter("");
  }

  const hasFilters = Boolean(
    search ||
      statusFilter ||
      stageFilter ||
      trackFilter ||
      geographyFilter
  );

  const applicant = selectedApplication;

  const statusText = (application) =>
    getLabel(
      APPLICATION_STATUSES,
      application.status
    );

  const workflow = [
    {
      label: "Applied",
      stages: ["applied"],
    },
    {
      label: "Assessment",
      stages: ["assessment", "track_placement"],
    },
    {
      label: "Interview",
      stages: ["interview"],
    },
    {
      label: "Matching",
      stages: ["matching", "compatibility"],
    },
    {
      label: "Decision",
      stages: ["final_decision", "enrollment"],
    },
  ];

  const activeStep = Math.max(
    0,
    workflow.findIndex((step) =>
      step.stages.includes(
        applicant?.admissionsStage
      )
    )
  );

  const statCards = [
    [
      Users,
      stats.totalApplications,
      "Total applications",
      "gold",
    ],
    [
      FileText,
      stats.underReview,
      "Under review",
      "gold",
    ],
    [
      MessageCircle,
      stats.interviews,
      "Interviews",
      "blue",
    ],
    [
      Network,
      stats.matchingRequired,
      "Matching",
      "gold",
    ],
    [
      CheckCircle2,
      stats.admitted,
      "Admitted",
      "green",
    ],
    [
      Hourglass,
      stats.waitlisted,
      "Waitlisted",
      "gold",
    ],
  ];

  const trackCards = [
    [Sprout, "Genesis", stats.genesis],
    [
      ChartNoAxesColumnIncreasing,
      "Ascend",
      stats.ascend,
    ],
    [Mountain, "Horizon", stats.horizon],
  ];

  const selectField = (
    label,
    name,
    options
  ) => (
    <label
      className="cfcv-form-row"
      key={name}
    >
      <span>{label}</span>

      <select
        name={name}
        value={editData[name]}
        onChange={handleEditChange}
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );

  const notesField = (label, name) => (
    <label className="cfcv-notes" key={name}>
      <span>{label}</span>

      <textarea
        name={name}
        value={editData[name]}
        onChange={handleEditChange}
        rows={5}
      />
    </label>
  );

  const saveButton = (
    <button
      type="button"
      className="cfcv-save"
      disabled={
        saving ||
        detailLoading ||
        !applicant
      }
      onClick={handleSave}
    >
      {saving && (
        <Loader2
          size={16}
          className="is-spinning"
        />
      )}

      {saving ? "Saving…" : "Save changes"}
    </button>
  );

  const summaryRows = (rows) => (
    <div className="cfcv-summary-rows">
      {rows.map(([Icon, value], index) => (
        <span key={index}>
          <Icon size={15} />
          {value || "—"}
        </span>
      ))}
    </div>
  );

  const detailSection = (
    title,
    children
  ) => (
    <section className="cfcv-info">
      <h3>{title}</h3>
      {children}
    </section>
  );

  const textSections = (rows) =>
    rows.map(([title, value]) =>
      value ? (
        <TextSection key={title} title={title}>
          {value}
        </TextSection>
      ) : null
    );

  return (
    <main
      className={`admin-cfcv mobile-tab-${mobileTab.toLowerCase()}`}
    >
      {/* Mobile header */}

      <header className="cfcv-mobile-header">
        <button
          type="button"
          aria-label="Show application list"
          aria-expanded={mobileListOpen}
          onClick={() =>
            setMobileListOpen(
              (current) => !current
            )
          }
        >
          <Menu size={24} />
        </button>

        <strong>CFCV Admissions</strong>

        <button
          type="button"
          aria-label="Refresh admissions"
          disabled={loading}
          onClick={handleRefresh}
        >
          <RefreshCw
            size={22}
            className={
              loading ? "is-spinning" : ""
            }
          />
        </button>
      </header>

      {/* Desktop header */}

      <header className="cfcv-header">
        <div>
          <h1>Fellowship Admissions</h1>
          <p>
            Review founders. Build the next cohort.
          </p>
        </div>

        <button
          type="button"
          className="cfcv-refresh"
          onClick={handleRefresh}
          disabled={loading}
        >
          <RefreshCw
            size={16}
            className={
              loading ? "is-spinning" : ""
            }
          />
          Refresh
        </button>
      </header>

      {/* Notifications */}

      {error && (
        <div
          className="cfcv-alert error"
          role="alert"
        >
          <AlertCircle size={18} />
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
            aria-label="Dismiss error"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {success && (
        <div
          className="cfcv-alert success"
          role="status"
        >
          <CheckCircle2 size={18} />
          <span>{success}</span>

          <button
            type="button"
            onClick={() => setSuccess("")}
            aria-label="Dismiss message"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Statistics */}

      <section
        className="cfcv-stats"
        aria-label="Admissions statistics"
      >
        {statCards.map(
          ([Icon, value, label, color]) => (
            <article
              className={`cfcv-stat ${color}`}
              key={label}
            >
              <Icon size={28} />

              <div>
                <strong>{value}</strong>
                <span>{label}</span>
              </div>
            </article>
          )
        )}
      </section>

      {/* Cohort capacity */}

      <section
        className="cfcv-capacity"
        aria-label="Cohort capacity"
      >
        <div>
          <h3>Cohort capacity</h3>

          <p>
            <strong>
              {stats.admitted} of{" "}
              {stats.cohortCapacity}
            </strong>{" "}
            places filled
          </p>
        </div>

        <div
          className="cfcv-capacity-bar"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={stats.cohortCapacity}
          aria-valuenow={stats.admitted}
        >
          <span
            style={{
              width: `${Math.min(
                100,
                stats.cohortCapacity
                  ? (stats.admitted /
                      stats.cohortCapacity) *
                      100
                  : 0
              )}%`,
            }}
          />
        </div>

        <div className="cfcv-tracks">
          {trackCards.map(
            ([Icon, label, count]) => (
              <div key={label}>
                <Icon size={29} />

                <span>
                  <strong>{label}</strong>
                  <b>{count} assigned</b>
                </span>
              </div>
            )
          )}
        </div>
      </section>

      {/* Search and filters */}

      <section className="cfcv-toolbar">
        <label className="cfcv-search">
          <Search size={18} />

          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search applicants by name, venture or location…"
            aria-label="Search applicants"
          />
        </label>

        <button
          type="button"
          className="cfcv-filter-toggle"
          onClick={() =>
            setMobileFiltersOpen(
              (current) => !current
            )
          }
          aria-expanded={mobileFiltersOpen}
        >
          <Filter size={16} />
          Filters
        </button>

        <div
          className={`cfcv-filters ${
            mobileFiltersOpen ? "is-open" : ""
          }`}
        >
          <select
            value={stageFilter}
            onChange={(event) =>
              setStageFilter(event.target.value)
            }
            aria-label="Filter stages"
          >
            <option value="">All stages</option>

            {ADMISSIONS_STAGES.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={trackFilter}
            onChange={(event) =>
              setTrackFilter(event.target.value)
            }
            aria-label="Filter tracks"
          >
            <option value="">All tracks</option>

            {TRACKS.filter(
              (option) => option.value
            ).map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.value}
              </option>
            ))}
          </select>

          <select
            value={geographyFilter}
            onChange={(event) =>
              setGeographyFilter(
                event.target.value
              )
            }
            aria-label="Filter geographies"
          >
            <option value="">
              All geographies
            </option>

            {GEOGRAPHIES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>

          {hasFilters && (
            <button
              type="button"
              className="cfcv-clear"
              onClick={clearFilters}
            >
              Clear
            </button>
          )}
        </div>
      </section>

      {/* Workspace */}

      <section className="cfcv-workspace">
        {/* Application list */}

        <aside
          className={`cfcv-list ${
            mobileListOpen ? "is-open" : ""
          }`}
        >
          <header>
            <h2>Applications</h2>
            <span>
              {applications.length} applicants
            </span>
          </header>

          <div className="cfcv-list-scroll">
            {loading ? (
              <div className="cfcv-state">
                <Loader2 className="is-spinning" />
                <p>Loading applications…</p>
              </div>
            ) : !applications.length ? (
              <div className="cfcv-state">
                <FileText />
                <p>
                  No applications match these
                  filters.
                </p>
              </div>
            ) : (
              applications.map((application) => (
                <button
                  type="button"
                  key={application.id}
                  className={`cfcv-app ${
                    selectedId === application.id
                      ? "is-selected"
                      : ""
                  }`}
                  onClick={() => {
                    setSelectedId(application.id);
                    setMobileListOpen(false);
                    setMobileTab("Details");
                    setDetailTab("Founder");
                  }}
                  aria-pressed={
                    selectedId === application.id
                  }
                >
                  <span className="cfcv-avatar">
                    {getInitials(application)}
                  </span>

                  <span className="cfcv-app-identity">
                    <strong>
                      {getFullName(application)}
                    </strong>

                    <small>
                      {application.country ||
                        application.geography ||
                        "—"}{" "}
                      ·{" "}
                      {application.ventureName ||
                        "Unnamed venture"}
                    </small>
                  </span>

                  <span className="cfcv-app-tags">
                    <span
                      className={`cfcv-badge status-${stageClass(
                        application.status
                      )}`}
                    >
                      {statusText(application)}
                    </span>

                    <small>
                      {application.assignedTrack ||
                        "Unassigned"}
                    </small>
                  </span>
                </button>
              ))
            )}
          </div>
        </aside>

        {/* Mobile applicant card */}

        <div className="cfcv-selected-mobile">
          {applicant && (
            <>
              <span className="cfcv-avatar">
                {getInitials(applicant)}
              </span>

              <div>
                <strong>
                  {getFullName(applicant)}
                </strong>

                <span>{applicant.ventureName}</span>

                <small>
                  {applicant.applicationReference}
                </small>
              </div>

              <button
                type="button"
                aria-label="Choose another applicant"
                onClick={() =>
                  setMobileListOpen(
                    (current) => !current
                  )
                }
              >
                <ChevronRight size={20} />
              </button>

              <div className="cfcv-mobile-badges">
                <span
                  className={`cfcv-badge status-${stageClass(
                    applicant.status
                  )}`}
                >
                  {statusText(applicant)}
                </span>

                <span className="cfcv-badge track">
                  {applicant.assignedTrack ||
                    "Unassigned"}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Mobile navigation */}

        <nav
          className="cfcv-mobile-tabs"
          aria-label="Application view"
        >
          {["Details", "Review"].map((tab) => (
            <button
              type="button"
              key={tab}
              aria-pressed={mobileTab === tab}
              onClick={() => setMobileTab(tab)}
            >
              {tab}
            </button>
          ))}
        </nav>

        {/* Application details */}

        <section className="cfcv-detail">
          {detailLoading ? (
            <div className="cfcv-state">
              <Loader2 className="is-spinning" />
              <p>Loading application…</p>
            </div>
          ) : !applicant ? (
            <div className="cfcv-state">
              <ClipboardCheck size={36} />

              <p>
                {selectedId
                  ? "Application unavailable"
                  : "Select an application to review"}
              </p>
            </div>
          ) : (
            <>
              <header className="cfcv-identity">
                <span className="cfcv-avatar large">
                  {getInitials(applicant)}
                </span>

                <div>
                  <h2>
                    {getFullName(applicant)}
                  </h2>

                  <p>
                    {applicant.ventureName ||
                      "Fellowship applicant"}
                  </p>

                  <small>
                    {
                      applicant.applicationReference
                    }
                  </small>
                </div>

                {applicant.hasResume && (
                  <button
                    type="button"
                    className="cfcv-resume"
                    onClick={handleResume}
                    disabled={resumeLoading}
                  >
                    <FileText size={17} />

                    {resumeLoading
                      ? "Opening…"
                      : "View résumé"}
                  </button>
                )}
              </header>

              <div
                className="cfcv-workflow"
                aria-label="Application progress"
              >
                {workflow.map((step, index) => (
                  <div
                    key={step.label}
                    className={`${
                      index < activeStep
                        ? "complete"
                        : ""
                    } ${
                      index === activeStep
                        ? "active"
                        : ""
                    }`}
                  >
                    <span>
                      {index < activeStep && (
                        <Check size={13} />
                      )}
                    </span>

                    <small>{step.label}</small>
                  </div>
                ))}
              </div>

              <nav
                className="cfcv-detail-tabs"
                aria-label="Applicant details"
              >
                {[
                  "Founder",
                  "Venture",
                  "Documents",
                ].map((tab) => (
                  <button
                    type="button"
                    key={tab}
                    aria-pressed={
                      detailTab === tab
                    }
                    onClick={() =>
                      setDetailTab(tab)
                    }
                  >
                    {tab}
                  </button>
                ))}
              </nav>

              <div className="cfcv-detail-scroll">
                {detailTab === "Founder" && (
                  <>
                    {detailSection(
                      "Founder profile",
                      summaryRows([
                        [
                          MapPin,
                          [
                            applicant.country,
                            applicant.city,
                          ]
                            .filter(Boolean)
                            .join(", "),
                        ],
                        [Mail, applicant.email],
                        [Sprout, applicant.sector],
                      ])
                    )}

                    {detailSection(
                      "Venture",
                      summaryRows([
                        [
                          Building2,
                          applicant.ventureName,
                        ],
                        [
                          FileText,
                          applicant.ventureDescription,
                        ],
                        [
                          ChartNoAxesColumnIncreasing,
                          applicant.ventureStage,
                        ],
                      ])
                    )}

                    {textSections([
                      [
                        "Application motivation",
                        applicant.entrepreneurshipReason,
                      ],
                      [
                        "Professional background",
                        applicant.professionalBackground,
                      ],
                      [
                        "Relevant skills & experience",
                        applicant.relevantSkills,
                      ],
                      [
                        "Long-term objectives",
                        applicant.longTermObjectives,
                      ],
                      [
                        "Six-month goals",
                        applicant.sixMonthGoals,
                      ],
                    ])}

                    {detailSection(
                      "Contact & commitment",
                      <dl>
                        <DetailRow label="Phone">
                          {applicant.phone}
                        </DetailRow>

                        <DetailRow label="Geography">
                          {applicant.geography}
                        </DetailRow>

                        <DetailRow label="Submitted">
                          {formatDateTime(
                            applicant.submittedAt
                          )}
                        </DetailRow>

                        <DetailRow label="Time commitment">
                          {applicant.timeCommitment}
                        </DetailRow>

                        <DetailRow label="Decision making">
                          {applicant.decisionMaking}
                        </DetailRow>

                        <DetailRow label="Ownership expectations">
                          {
                            applicant.ownershipExpectations
                          }
                        </DetailRow>
                      </dl>
                    )}
                  </>
                )}

                {detailTab === "Venture" && (
                  <>
                    {detailSection(
                      "Venture",
                      <dl>
                        {[
                          [
                            "Name",
                            applicant.ventureName,
                          ],
                          [
                            "Sector",
                            applicant.sector,
                          ],
                          [
                            "Stage",
                            applicant.ventureStage,
                          ],
                          [
                            "Team",
                            applicant.teamStatus,
                          ],
                          [
                            "Target market",
                            applicant.targetMarket,
                          ],
                          [
                            "Customer",
                            applicant.customerDescription,
                          ],
                          [
                            "Team description",
                            applicant.teamDescription,
                          ],
                        ].map(([label, value]) => (
                          <DetailRow
                            key={label}
                            label={label}
                          >
                            {value}
                          </DetailRow>
                        ))}
                      </dl>
                    )}

                    {textSections([
                      [
                        "Venture description",
                        applicant.ventureDescription,
                      ],
                      ["Problem", applicant.problem],
                      ["Solution", applicant.solution],
                      [
                        "Current progress",
                        applicant.currentProgress,
                      ],
                    ])}

                    {detailSection(
                      "Cross-continental collaboration",
                      <dl>
                        {[
                          [
                            "Existing team",
                            applicant.existingCrossContinentalTeam,
                          ],
                          [
                            "Collaborator needs",
                            applicant.collaboratorNeeds,
                          ],
                          [
                            "Market knowledge",
                            applicant.marketKnowledge,
                          ],
                          [
                            "Geographic connections",
                            applicant.geographicConnections,
                          ],
                          [
                            "Working style",
                            applicant.workingStyle,
                          ],
                          [
                            "Leadership strengths",
                            applicant.leadershipStrengths,
                          ],
                        ].map(([label, value]) => (
                          <DetailRow
                            key={label}
                            label={label}
                          >
                            {value}
                          </DetailRow>
                        ))}
                      </dl>
                    )}
                  </>
                )}

                {detailTab === "Documents" &&
                  detailSection(
                    "Résumé / CV",
                    applicant.hasResume ? (
                      <button
                        type="button"
                        className="cfcv-resume"
                        onClick={handleResume}
                        disabled={resumeLoading}
                      >
                        <Download size={16} />

                        {applicant.resumeFileName ||
                          "Open résumé"}
                      </button>
                    ) : (
                      <p>No résumé attached.</p>
                    )
                  )}
              </div>
            </>
          )}
        </section>

        {/* Admissions review */}

        <aside className="cfcv-review">
          <div className="cfcv-review-scroll">
            <h2>Admissions review</h2>

            <fieldset
              disabled={
                !applicant ||
                detailLoading ||
                saving
              }
            >
              {selectField(
                "Stage",
                "admissionsStage",
                ADMISSIONS_STAGES
              )}

              {selectField(
                "Status",
                "status",
                APPLICATION_STATUSES
              )}

              {selectField(
                "Track",
                "assignedTrack",
                TRACKS
              )}

              <div className="cfcv-accordions">
                <details>
                  <summary>
                    <MessageCircle size={17} />
                    Interview
                    <ChevronDown size={15} />
                  </summary>

                  <div>
                    <label className="cfcv-check">
                      <input
                        type="checkbox"
                        name="interviewRequired"
                        checked={
                          editData.interviewRequired
                        }
                        onChange={handleEditChange}
                      />
                      Interview required
                    </label>

                    {selectField(
                      "Status",
                      "interviewStatus",
                      INTERVIEW_STATUSES
                    )}

                    <label className="cfcv-notes">
                      <span>Date & time</span>

                      <input
                        type="datetime-local"
                        name="interviewDate"
                        value={
                          editData.interviewDate
                        }
                        onChange={handleEditChange}
                      />
                    </label>

                    {notesField(
                      "Interview notes",
                      "interviewNotes"
                    )}
                  </div>
                </details>

                <details>
                  <summary>
                    <Users size={17} />
                    Matching
                    <ChevronDown size={15} />
                  </summary>

                  <div>
                    <label className="cfcv-check">
                      <input
                        type="checkbox"
                        name="matchingRequired"
                        checked={
                          editData.matchingRequired
                        }
                        onChange={handleEditChange}
                      />
                      Matching required
                    </label>

                    {selectField(
                      "Status",
                      "matchingStatus",
                      MATCHING_STATUSES
                    )}

                    {notesField(
                      "Matching notes",
                      "matchingNotes"
                    )}
                  </div>
                </details>

                <details>
                  <summary>
                    <FileText size={17} />
                    Final decision
                    <ChevronDown size={15} />
                  </summary>

                  <div>
                    {selectField(
                      "Decision",
                      "finalDecision",
                      FINAL_DECISIONS
                    )}

                    {notesField(
                      "Decision notes",
                      "decisionNotes"
                    )}
                  </div>
                </details>
              </div>

              {notesField(
                "Reviewer notes",
                "reviewerNotes"
              )}
            </fieldset>

            {applicant?.updatedAt && (
              <p className="cfcv-updated">
                Last updated{" "}
                {formatDateTime(
                  applicant.updatedAt
                )}
              </p>
            )}
          </div>

          <footer>{saveButton}</footer>
        </aside>
      </section>

      {/* Mobile save button */}

      <footer className="cfcv-mobile-save">
        {saveButton}
      </footer>
    </main>
  );
}