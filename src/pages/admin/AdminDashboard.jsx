import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Activity,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  ExternalLink,
  GraduationCap,
  Handshake,
  Images,
  LayoutDashboard,
  Mail,
  MessageSquareText,
  Newspaper,
  RefreshCw,
  UserCheck,
  Users,
} from "lucide-react";

import { Link } from "react-router-dom";

import "./AdminDashboard.css";

/* ============================================================
   API CONFIGURATION
============================================================ */

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(/\/+$/, "");

/* ============================================================
   DEFAULT DATA
============================================================ */

const DEFAULT_DASHBOARD = {
  upcomingEvents: 0,
  publishedInsights: 0,
  newsletterSubscribers: 0,
  newContacts: 0,
  totalContacts: 0,
  partnerships: 0,
  newPartnerships: 0,
  totalGalleryPhotos: 0,
  publishedGalleryPhotos: 0,
  recentActivity: [],
};

const DEFAULT_CFCV_STATS = {
  totalApplications: 0,
  submitted: 0,
  underReview: 0,
  interviews: 0,
  matchingRequired: 0,
  admitted: 0,
  waitlisted: 0,
  genesis: 0,
  ascend: 0,
  horizon: 0,
  cohortCapacity: 30,
  remainingCapacity: 30,
};

/* ============================================================
   MANAGEMENT LINKS
============================================================ */

const quickAccess = [
  {
    title: "CFCV Admissions",
    description:
      "Review applications, interviews, matching, track placement and admissions decisions.",
    icon: ClipboardCheck,
    to: "/admin/cfcv",
  },
  {
    title: "Events",
    description:
      "Create, publish and manage Continental Founders events.",
    icon: CalendarDays,
    to: "/admin/events",
  },
  {
    title: "Insights",
    description:
      "Publish articles, research and founder insights.",
    icon: Newspaper,
    to: "/admin/insights",
  },
  {
    title: "Gallery",
    description:
      "Upload, publish and manage photos from events, programs and partnerships.",
    icon: Images,
    to: "/admin/gallery",
  },
  {
    title: "Newsletter",
    description:
      "Manage subscribers and newsletter outreach.",
    icon: Mail,
    to: "/admin/newsletter",
  },
  {
    title: "Contacts",
    description:
      "Review contact enquiries and website messages.",
    icon: MessageSquareText,
    to: "/admin/contacts",
  },
  {
    title: "Universities",
    description:
      "Manage university partners and institutions.",
    icon: GraduationCap,
    to: "/admin/universities",
  },
  {
    title: "Leadership",
    description:
      "Manage leadership and organizational profiles.",
    icon: Users,
    to: "/admin/leadership",
  },
];

/* ============================================================
   NUMBER HELPERS
============================================================ */

function getNumber(...values) {
  for (const value of values) {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      continue;
    }

    const parsed = Number(value);

    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return 0;
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(
    getNumber(value)
  );
}

/* ============================================================
   RESPONSE VALIDATION
============================================================ */

async function readJsonResponse(response, serviceName) {
  const contentType =
    response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    throw new Error(
      `${serviceName} returned an invalid response (${response.status}).`
    );
  }

  return response.json();
}

/* ============================================================
   NORMALIZE ORGANISATION DATA
============================================================ */

function normalizeDashboardData(payload) {
  const source =
    payload?.data ||
    payload?.dashboard ||
    payload ||
    {};

  const stats =
    source?.stats ||
    source?.statistics ||
    source?.counts ||
    {};

  let recentActivity = [];

  if (Array.isArray(source.recentActivity)) {
    recentActivity = source.recentActivity;
  } else if (Array.isArray(source.recent_activity)) {
    recentActivity = source.recent_activity;
  } else if (Array.isArray(source.activity)) {
    recentActivity = source.activity;
  }

  return {
    upcomingEvents: getNumber(
      stats.upcomingEvents,
      stats.upcoming_events,
      source.upcomingEvents,
      source.upcoming_events
    ),

    publishedInsights: getNumber(
      stats.publishedInsights,
      stats.published_insights,
      source.publishedInsights,
      source.published_insights
    ),

    newsletterSubscribers: getNumber(
      stats.newsletterSubscribers,
      stats.newsletter_subscribers,
      stats.activeSubscribers,
      stats.active_subscribers,
      source.newsletterSubscribers,
      source.newsletter_subscribers
    ),

    newContacts: getNumber(
      stats.newContacts,
      stats.new_contacts,
      source.newContacts,
      source.new_contacts
    ),

    totalContacts: getNumber(
      stats.totalContacts,
      stats.total_contacts,
      source.totalContacts,
      source.total_contacts
    ),

    partnerships: getNumber(
      stats.partnerships,
      stats.totalPartnerships,
      stats.total_partnerships,
      source.partnerships
    ),

    newPartnerships: getNumber(
      stats.newPartnerships,
      stats.new_partnerships,
      source.newPartnerships
    ),

    totalGalleryPhotos: getNumber(
      stats.totalGalleryPhotos,
      stats.total_gallery_photos,
      stats.galleryPhotos,
      stats.gallery_photos
    ),

    publishedGalleryPhotos: getNumber(
      stats.publishedGalleryPhotos,
      stats.published_gallery_photos
    ),

    recentActivity,
  };
}

/* ============================================================
   NORMALIZE ADMISSIONS DATA
============================================================ */

function normalizeCfcvStats(payload) {
  const source = payload?.data || payload || {};

  const stats =
    source?.stats ||
    source?.statistics ||
    source ||
    {};

  const cohortCapacity = getNumber(
    stats.cohortCapacity,
    stats.cohort_capacity,
    30
  );

  const admitted = getNumber(stats.admitted);

  return {
    totalApplications: getNumber(
      stats.totalApplications,
      stats.total_applications
    ),

    submitted: getNumber(stats.submitted),

    underReview: getNumber(
      stats.underReview,
      stats.under_review
    ),

    interviews: getNumber(stats.interviews),

    matchingRequired: getNumber(
      stats.matchingRequired,
      stats.matching_required
    ),

    admitted,

    waitlisted: getNumber(stats.waitlisted),

    genesis: getNumber(stats.genesis),

    ascend: getNumber(stats.ascend),

    horizon: getNumber(stats.horizon),

    cohortCapacity,

    remainingCapacity: getNumber(
      stats.remainingCapacity,
      stats.remaining_capacity,
      Math.max(0, cohortCapacity - admitted)
    ),
  };
}

/* ============================================================
   ACTIVITY HELPERS
============================================================ */

function getActivityIcon(item) {
  const type = String(
    item?.type ||
      item?.category ||
      item?.entity ||
      ""
  )
    .trim()
    .toLowerCase();

  if (
    type.includes("cfcv") ||
    type.includes("application")
  ) {
    return ClipboardCheck;
  }

  if (type.includes("event")) {
    return CalendarDays;
  }

  if (
    type.includes("insight") ||
    type.includes("article") ||
    type.includes("news")
  ) {
    return Newspaper;
  }

  if (
    type.includes("gallery") ||
    type.includes("photo") ||
    type.includes("image")
  ) {
    return Images;
  }

  if (
    type.includes("newsletter") ||
    type.includes("subscriber")
  ) {
    return Mail;
  }

  if (
    type.includes("contact") ||
    type.includes("message") ||
    type.includes("inquiry")
  ) {
    return MessageSquareText;
  }

  if (
    type.includes("partner") ||
    type.includes("partnership")
  ) {
    return Handshake;
  }

  if (type.includes("university")) {
    return GraduationCap;
  }

  return Activity;
}

function getActivityTitle(item) {
  return (
    item?.title ||
    item?.name ||
    item?.action ||
    item?.message ||
    "Dashboard activity"
  );
}

function getActivityDescription(item) {
  return (
    item?.description ||
    item?.details ||
    item?.subtitle ||
    ""
  );
}

function getActivityTime(item) {
  const value =
    item?.time ||
    item?.relativeTime ||
    item?.relative_time ||
    item?.createdAt ||
    item?.created_at ||
    "";

  if (!value) {
    return "";
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsedDate);
}

/* ============================================================
   STATISTIC CARD
============================================================ */

function StatCard({
  icon: Icon,
  label,
  value,
  helper,
  unavailable = false,
  loading = false,
}) {
  return (
    <article className="admin-dashboard__stat-card">
      <div className="admin-dashboard__stat-icon">
        <Icon size={18} strokeWidth={1.8} />
      </div>

      <div className="admin-dashboard__stat-content">
        <span className="admin-dashboard__stat-label">
          {label}
        </span>

        <strong className="admin-dashboard__stat-value">
          {loading
            ? "…"
            : unavailable
              ? "—"
              : formatNumber(value)}
        </strong>

        {helper && (
          <span className="admin-dashboard__stat-helper">
            {helper}
          </span>
        )}
      </div>
    </article>
  );
}

/* ============================================================
   MANAGEMENT CARD
============================================================ */

function QuickAccessCard({ item }) {
  const Icon = item.icon;

  return (
    <Link
      to={item.to}
      className="admin-dashboard__quick-card"
    >
      <div className="admin-dashboard__quick-icon">
        <Icon size={16} strokeWidth={1.8} />
      </div>

      <div className="admin-dashboard__quick-copy">
        <h3>{item.title}</h3>
        <p>{item.description}</p>
      </div>

      <ArrowUpRight
        className="admin-dashboard__quick-arrow"
        size={14}
        strokeWidth={1.7}
      />
    </Link>
  );
}

/* ============================================================
   DASHBOARD
============================================================ */

function AdminDashboard() {
  const [dashboard, setDashboard] = useState(
    DEFAULT_DASHBOARD
  );

  const [cfcvStats, setCfcvStats] = useState(
    DEFAULT_CFCV_STATS
  );

  const [
    dashboardAvailable,
    setDashboardAvailable,
  ] = useState(false);

  const [cfcvAvailable, setCfcvAvailable] =
    useState(false);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");
  const [cfcvError, setCfcvError] = useState("");

  const [lastUpdated, setLastUpdated] =
    useState(null);

  /* ----------------------------------------------------------
     LOAD BOTH SERVICES INDEPENDENTLY
  ---------------------------------------------------------- */

  const loadDashboard = useCallback(
    async ({ silent = false } = {}) => {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const readService = async (endpoint, name) => {
        const response = await fetch(
          `${API_URL}${endpoint}`,
          {
            credentials: "include",
            cache: "no-store",

            headers: {
              Accept: "application/json",
            },
          }
        );

        const data = await readJsonResponse(
          response,
          name
        );

        if (!response.ok) {
          throw new Error(
            response.status === 401
              ? "Your session has expired. Please sign in again."
              : data?.message ||
                  data?.error ||
                  `${name} is unavailable (${response.status}).`
          );
        }

        return data;
      };

      try {
        const [general, admissions] =
          await Promise.allSettled([
            readService(
              "/api/admin/dashboard/stats",
              "Dashboard"
            ),

            readService(
              "/api/cfcv/admin/stats",
              "CFCV admissions"
            ),
          ]);

        if (general.status === "fulfilled") {
          setDashboard(
            normalizeDashboardData(general.value)
          );

          setDashboardAvailable(true);
          setError("");
        } else {
          setDashboardAvailable(false);

          setError(
            general.reason?.message ||
              "Unable to load organisational data."
          );
        }

        if (admissions.status === "fulfilled") {
          setCfcvStats(
            normalizeCfcvStats(admissions.value)
          );

          setCfcvAvailable(true);
          setCfcvError("");
        } else {
          setCfcvAvailable(false);

          setCfcvError(
            admissions.reason?.message ||
              "Unable to load admissions data."
          );
        }

        if (
          general.status === "fulfilled" ||
          admissions.status === "fulfilled"
        ) {
          setLastUpdated(new Date());
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  /* ----------------------------------------------------------
     OVERVIEW METRICS
  ---------------------------------------------------------- */

  const stats = [
    {
      label: "Applications",
      value: cfcvStats.totalApplications,
      icon: ClipboardCheck,
      helper: "CFCV fellowship",
      unavailable: !cfcvAvailable,
    },
    {
      label: "Admitted founders",
      value: cfcvStats.admitted,
      icon: UserCheck,
      helper: "Current cohort",
      unavailable: !cfcvAvailable,
    },
    {
      label: "Upcoming events",
      value: dashboard.upcomingEvents,
      icon: CalendarDays,
      helper: "Scheduled programmes",
      unavailable: !dashboardAvailable,
    },
    {
      label: "Published insights",
      value: dashboard.publishedInsights,
      icon: Newspaper,
      helper: "Research & publications",
      unavailable: !dashboardAvailable,
    },
    {
      label: "Published photos",
      value: dashboard.publishedGalleryPhotos,
      icon: Images,

      helper: dashboardAvailable
        ? `${formatNumber(
            dashboard.totalGalleryPhotos
          )} in the library`
        : "Gallery library",

      unavailable: !dashboardAvailable,
    },
    {
      label: "Subscribers",
      value: dashboard.newsletterSubscribers,
      icon: Mail,
      helper: "Newsletter audience",
      unavailable: !dashboardAvailable,
    },
    {
      label: "New enquiries",
      value: dashboard.newContacts,
      icon: MessageSquareText,

      helper: dashboardAvailable
        ? `${formatNumber(
            dashboard.totalContacts
          )} total contacts`
        : "Contact enquiries",

      unavailable: !dashboardAvailable,
    },
    {
      label: "Partnerships",
      value: dashboard.partnerships,
      icon: Handshake,

      helper: dashboardAvailable
        ? `${formatNumber(
            dashboard.newPartnerships
          )} new requests`
        : "Partnership network",

      unavailable: !dashboardAvailable,
    },
  ];

  /* ----------------------------------------------------------
     ADMISSIONS STAGES
  ---------------------------------------------------------- */

  const stages = [
    {
      label: "Submitted",
      value: cfcvStats.submitted,
    },
    {
      label: "Under review",
      value: cfcvStats.underReview,
    },
    {
      label: "Interviews",
      value: cfcvStats.interviews,
    },
    {
      label: "Matching required",
      value: cfcvStats.matchingRequired,
    },
    {
      label: "Admitted",
      value: cfcvStats.admitted,
    },
    {
      label: "Waitlisted",
      value: cfcvStats.waitlisted,
    },
  ];

  /* ----------------------------------------------------------
     FOLLOW-UP ITEMS
  ---------------------------------------------------------- */

  const priorities = [
    {
      title: "Application review",
      description: "Open the admissions workspace",
      value: cfcvStats.submitted,
      available: cfcvAvailable,
      icon: ClipboardCheck,
      to: "/admin/cfcv",
    },
    {
      title: "Founder matching",
      description: "Review matching requirements",
      value: cfcvStats.matchingRequired,
      available: cfcvAvailable,
      icon: Users,
      to: "/admin/cfcv",
    },
    {
      title: "Contact enquiries",
      description: "Review new website messages",
      value: dashboard.newContacts,
      available: dashboardAvailable,
      icon: MessageSquareText,
      to: "/admin/contacts",
    },
  ];

  const recentActivity = useMemo(
    () => dashboard.recentActivity.slice(0, 8),
    [dashboard.recentActivity]
  );

  const capacity = Math.max(
    0,
    cfcvStats.cohortCapacity
  );

  const occupied = Math.max(
    0,
    cfcvStats.admitted
  );

  const capacityPercent =
    capacity > 0
      ? Math.min(100, (occupied / capacity) * 100)
      : 0;

  const displayValue = (value, available) =>
    loading
      ? "…"
      : available
        ? formatNumber(value)
        : "—";

  const dateLabel = new Intl.DateTimeFormat(
    "en-GB",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  ).format(new Date());

  /* ----------------------------------------------------------
     RENDER
  ---------------------------------------------------------- */

  return (
    <main
      className="admin-dashboard"
      aria-busy={loading || refreshing}
    >
      {/* HEADER */}

      <header className="admin-dashboard__hero">
        <div className="admin-dashboard__hero-copy">
          <span className="admin-dashboard__hero-eyebrow">
            <LayoutDashboard size={14} />

            Continental Founders · Administration
          </span>

          <h1>Organisation overview</h1>

          <p>
            Your programmes, people, and institutional
            activity in one view.
          </p>
        </div>

        <div className="admin-dashboard__hero-actions">
          <span className="admin-dashboard__date">
            {dateLabel}
          </span>

          <div className="admin-dashboard__header-buttons">
            <Link
              to="/"
              className="admin-dashboard__website-button"
            >
              View website
              <ExternalLink size={14} />
            </Link>

            <button
              type="button"
              className="admin-dashboard__refresh-button"
              onClick={() =>
                loadDashboard({ silent: true })
              }
              disabled={loading || refreshing}
            >
              <RefreshCw
                size={15}
                className={
                  loading || refreshing
                    ? "admin-dashboard__refresh-icon--active"
                    : ""
                }
              />

              {refreshing
                ? "Refreshing…"
                : "Refresh data"}
            </button>
          </div>
        </div>
      </header>

      {/* OVERVIEW HEADING */}

      <div className="admin-dashboard__overview-label">
        <h2>At a glance</h2>

        <span role="status">
          {loading
            ? "Loading current data…"
            : refreshing
              ? "Updating data…"
              : error || cfcvError
                ? "Some data is unavailable"
                : lastUpdated
                  ? `Updated ${lastUpdated.toLocaleTimeString(
                      [],
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}`
                  : "Awaiting data"}
        </span>
      </div>

      {/* SERVICE ERRORS */}

      {(error || cfcvError) && (
        <section
          className="admin-dashboard__error"
          role="alert"
        >
          <div>
            <strong>
              Some services could not be refreshed
            </strong>

            {error && <span>{error}</span>}

            {cfcvError && <span>{cfcvError}</span>}
          </div>

          <button
            type="button"
            disabled={loading || refreshing}
            onClick={() =>
              loadDashboard({ silent: true })
            }
          >
            Retry
            <RefreshCw size={14} />
          </button>
        </section>
      )}

      {/* MAIN METRICS */}

      <section
        className="admin-dashboard__stats"
        aria-label="Organisation statistics"
      >
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            {...stat}
            loading={loading}
          />
        ))}
      </section>

      {/* OPERATIONAL OVERVIEW */}

      <section
        className="admin-dashboard__operations-grid"
        aria-label="Operational overview"
      >
        {/* ADMISSIONS */}

        <article className="admin-dashboard__panel admin-dashboard__admissions">
          <header className="admin-dashboard__panel-header">
            <div>
              <span className="admin-dashboard__section-eyebrow">
                Fellowship programme
              </span>

              <h2>CFCV admissions</h2>
            </div>

            <Link
              to="/admin/cfcv"
              className="admin-dashboard__text-link"
            >
              Manage admissions
              <ArrowUpRight size={15} />
            </Link>
          </header>

          <div className="admin-dashboard__stage-grid">
            {stages.map((stage) => (
              <div
                className="admin-dashboard__stage"
                key={stage.label}
              >
                <strong>
                  {displayValue(
                    stage.value,
                    cfcvAvailable
                  )}
                </strong>

                <span>{stage.label}</span>
              </div>
            ))}
          </div>

          <div className="admin-dashboard__cohort">
            <div className="admin-dashboard__cohort-heading">
              <div>
                <span>Cohort capacity</span>

                <strong>
                  {loading
                    ? "Loading…"
                    : cfcvAvailable
                      ? `${formatNumber(
                          occupied
                        )} of ${formatNumber(
                          capacity
                        )} places filled`
                      : "Unavailable"}
                </strong>
              </div>

              <span className="admin-dashboard__capacity-badge">
                {displayValue(
                  cfcvStats.remainingCapacity,
                  cfcvAvailable
                )}{" "}
                places remaining
              </span>
            </div>

            {cfcvAvailable && !loading && (
              <div
                className="admin-dashboard__capacity-track"
                role="progressbar"
                aria-label="Cohort places filled"
                aria-valuemin={0}
                aria-valuemax={capacity || 1}
                aria-valuenow={Math.min(
                  occupied,
                  capacity || 1
                )}
                aria-valuetext={`${formatNumber(
                  occupied
                )} of ${formatNumber(
                  capacity
                )} places filled`}
              >
                <span
                  style={{
                    width: `${capacityPercent}%`,
                  }}
                />
              </div>
            )}

            <div className="admin-dashboard__tracks">
              {["Genesis", "Ascend", "Horizon"].map(
                (track) => (
                  <span key={track}>
                    <i aria-hidden="true" />

                    {track}

                    <strong>
                      {displayValue(
                        cfcvStats[
                          track.toLowerCase()
                        ],
                        cfcvAvailable
                      )}
                    </strong>
                  </span>
                )
              )}
            </div>
          </div>
        </article>

        {/* ATTENTION LIST */}

        <article className="admin-dashboard__panel admin-dashboard__priorities">
          <header className="admin-dashboard__panel-header">
            <div>
              <span className="admin-dashboard__section-eyebrow">
                Follow-up
              </span>

              <h2>Needs attention</h2>
            </div>

            <Activity size={18} />
          </header>

          <div className="admin-dashboard__priority-list">
            {priorities.map(
              ({ icon: Icon, ...item }) => (
                <Link
                  className="admin-dashboard__priority"
                  to={item.to}
                  key={item.title}
                >
                  <span className="admin-dashboard__priority-icon">
                    <Icon size={18} />
                  </span>

                  <div>
                    <strong>{item.title}</strong>

                    <span>
                      {item.description}
                    </span>
                  </div>

                  <b>
                    {displayValue(
                      item.value,
                      item.available
                    )}
                  </b>

                  <ArrowUpRight size={14} />
                </Link>
              )
            )}
          </div>

          <p className="admin-dashboard__priority-note">
            Counts reflect the latest available
            service data.
          </p>
        </article>
      </section>

      {/* MANAGEMENT LINKS */}

      <section
        className="admin-dashboard__block"
        aria-label="Management sections"
      >
        <header className="admin-dashboard__block-header">
          <div>
            <span className="admin-dashboard__section-eyebrow">
              Workspace
            </span>

            <h2>Manage your organisation</h2>
          </div>

          <span className="admin-dashboard__block-helper">
            Content, programmes & relationships
          </span>
        </header>

        <div className="admin-dashboard__quick-grid">
          {quickAccess.map((item) => (
            <QuickAccessCard
              key={item.title}
              item={item}
            />
          ))}
        </div>
      </section>

      {/* ACTIVITY AND STATUS */}

      <section className="admin-dashboard__lower-grid">
        {/* RECENT ACTIVITY */}

        <article className="admin-dashboard__panel">
          <header className="admin-dashboard__panel-header">
            <div>
              <span className="admin-dashboard__section-eyebrow">
                Activity log
              </span>

              <h2>Recent updates</h2>
            </div>

            <Activity size={18} />
          </header>

          {loading ||
          !dashboardAvailable ||
          !recentActivity.length ? (
            <div className="admin-dashboard__activity-empty">
              <Activity size={22} />

              <strong>
                {loading
                  ? "Loading activity…"
                  : !dashboardAvailable
                    ? "Activity unavailable"
                    : "No recent activity"}
              </strong>

              <span>
                {!loading && dashboardAvailable
                  ? "Updates will appear here as your team works in the CMS."
                  : "Activity will appear when dashboard data is available."}
              </span>
            </div>
          ) : (
            <div className="admin-dashboard__activity-list">
              {recentActivity.map((item, index) => {
                const Icon = getActivityIcon(item);

                const description =
                  getActivityDescription(item);

                const time = getActivityTime(item);

                return (
                  <div
                    className="admin-dashboard__activity-item"
                    key={
                      item?.id ||
                      item?._id ||
                      index
                    }
                  >
                    <div className="admin-dashboard__activity-icon">
                      <Icon size={16} />
                    </div>

                    <div className="admin-dashboard__activity-copy">
                      <strong>
                        {getActivityTitle(item)}
                      </strong>

                      {description && (
                        <span>{description}</span>
                      )}
                    </div>

                    {time && <time>{time}</time>}
                  </div>
                );
              })}
            </div>
          )}
        </article>

        {/* SERVICE STATUS */}

        <article className="admin-dashboard__panel">
          <header className="admin-dashboard__panel-header">
            <div>
              <span className="admin-dashboard__section-eyebrow">
                Service connections
              </span>

              <h2>Workspace status</h2>
            </div>

            <CheckCircle2 size={18} />
          </header>

          <div className="admin-dashboard__service-list">
            {[
              {
                label: "Organisation data",
                available: dashboardAvailable,
              },
              {
                label: "CFCV admissions",
                available: cfcvAvailable,
              },
            ].map((service) => (
              <div
                className="admin-dashboard__service"
                key={service.label}
              >
                <span>{service.label}</span>

                <b
                  className={
                    loading
                      ? "is-pending"
                      : service.available
                        ? "is-connected"
                        : "is-unavailable"
                  }
                >
                  <i aria-hidden="true" />

                  {loading
                    ? "Checking"
                    : service.available
                      ? "Connected"
                      : "Unavailable"}
                </b>
              </div>
            ))}
          </div>

          <p className="admin-dashboard__status-note">
            Status reflects the latest dashboard
            requests.
          </p>

          <div className="admin-dashboard__system-links">
            {[
              {
                to: "/cfcv",
                label: "Public fellowship page",
              },
              {
                to: "/gallery",
                label: "Public gallery",
              },
              {
                to: "/",
                label:
                  "Continental Founders website",
              },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="admin-dashboard__system-link"
              >
                {item.label}

                <ExternalLink size={14} />
              </Link>
            ))}
          </div>
        </article>
      </section>

      {/* FOOTER */}

      <footer className="admin-dashboard__footer">
        <span>Continental Founders</span>
        <span>Administration workspace</span>
      </footer>
    </main>
  );
}

export default AdminDashboard;