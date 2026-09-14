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
  ExternalLink,
  GraduationCap,
  LayoutDashboard,
  Mail,
  MessageSquareText,
  Newspaper,
  RefreshCw,
  Users,
} from "lucide-react";

import { Link } from "react-router-dom";

import "./AdminDashboard.css";


/* ============================================================
   API CONFIGURATION
============================================================ */

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";


/* ============================================================
   QUICK ACCESS
============================================================ */

const quickAccess = [
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
   NUMBER HELPER
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

    const parsed =
      Number(value);

    if (
      Number.isFinite(parsed)
    ) {
      return parsed;
    }
  }

  return 0;
}


/* ============================================================
   NUMBER FORMATTER
============================================================ */

function formatNumber(value) {
  return new Intl.NumberFormat(
    "en-US"
  ).format(
    getNumber(value)
  );
}


/* ============================================================
   NORMALIZE BACKEND RESPONSE
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

  return {
    upcomingEvents:
      getNumber(
        stats.upcomingEvents,
        stats.upcoming_events,
        stats.upcomingEventCount,
        stats.upcoming_event_count
      ),

    publishedInsights:
      getNumber(
        stats.publishedInsights,
        stats.published_insights,
        stats.publishedInsightCount,
        stats.published_insight_count
      ),

    newsletterSubscribers:
      getNumber(
        stats.newsletterSubscribers,
        stats.newsletter_subscribers,
        stats.activeSubscribers,
        stats.active_subscribers,
        stats.subscribers,
        stats.totalSubscribers
      ),

    newContacts:
      getNumber(
        stats.newContacts,
        stats.new_contacts
      ),

    totalContacts:
      getNumber(
        stats.contacts,
        stats.totalContacts,
        stats.total_contacts
      ),

    partnerships:
      getNumber(
        stats.partnerships,
        stats.totalPartnerships,
        stats.total_partnerships
      ),

    newPartnerships:
      getNumber(
        stats.newPartnerships,
        stats.new_partnerships
      ),

    recentActivity:
      Array.isArray(
        source.recentActivity
      )
        ? source.recentActivity
        : Array.isArray(
            source.recent_activity
          )
        ? source.recent_activity
        : Array.isArray(
            source.activity
          )
        ? source.activity
        : [],
  };
}


/* ============================================================
   ACTIVITY HELPERS
============================================================ */

function getActivityIcon(item) {
  const type =
    String(
      item?.type ||
      item?.category ||
      item?.entity ||
      ""
    )
      .trim()
      .toLowerCase();

  if (
    type.includes("event")
  ) {
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
    type.includes("university")
  ) {
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
  return (
    item?.time ||
    item?.relativeTime ||
    item?.relative_time ||
    item?.createdAt ||
    item?.created_at ||
    ""
  );
}


/* ============================================================
   STAT CARD
============================================================ */

function StatCard({
  icon: Icon,
  label,
  value,
}) {
  return (
    <article className="admin-dashboard__stat-card">
      <div className="admin-dashboard__stat-icon">
        <Icon
          size={18}
          strokeWidth={1.8}
        />
      </div>

      <div className="admin-dashboard__stat-content">
        <span className="admin-dashboard__stat-label">
          {label}
        </span>

        <strong className="admin-dashboard__stat-value">
          {formatNumber(value)}
        </strong>
      </div>
    </article>
  );
}


/* ============================================================
   QUICK ACCESS CARD
============================================================ */

function QuickAccessCard({ item }) {
  const Icon =
    item.icon;

  return (
    <Link
      to={item.to}
      className="admin-dashboard__quick-card"
    >
      <div className="admin-dashboard__quick-icon">
        <Icon
          size={16}
          strokeWidth={1.8}
        />
      </div>

      <div className="admin-dashboard__quick-copy">
        <h3>
          {item.title}
        </h3>

        <p>
          {item.description}
        </p>
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
   ADMIN DASHBOARD
============================================================ */

function AdminDashboard() {
  const [
    dashboard,
    setDashboard,
  ] = useState({
    upcomingEvents: 0,
    publishedInsights: 0,
    newsletterSubscribers: 0,
    newContacts: 0,
    totalContacts: 0,
    partnerships: 0,
    newPartnerships: 0,
    recentActivity: [],
  });

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");


  /* ==========================================================
     LOAD DASHBOARD
  ========================================================== */

  const loadDashboard =
    useCallback(
      async () => {
        try {
          setLoading(true);
          setError("");

          const response =
            await fetch(
              `${API_URL}/api/admin/dashboard/stats`,
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

          if (
            !contentType.includes(
              "application/json"
            )
          ) {
            throw new Error(
              `Dashboard service returned an invalid response (${response.status}).`
            );
          }

          const result =
            await response.json();

          if (!response.ok) {
            throw new Error(
              result?.message ||
              result?.error ||
              `Unable to load dashboard (${response.status}).`
            );
          }

          setDashboard(
            normalizeDashboardData(
              result
            )
          );
        } catch (requestError) {
          console.error(
            "Dashboard loading error:",
            requestError
          );

          setError(
            requestError?.message ||
            "Unable to load dashboard information."
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

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);


  /* ==========================================================
     DASHBOARD STATS
  ========================================================== */

  const stats =
    useMemo(
      () => [
        {
          label:
            "Upcoming Events",
          value:
            dashboard.upcomingEvents,
          icon:
            CalendarDays,
        },

        {
          label:
            "Published Insights",
          value:
            dashboard.publishedInsights,
          icon:
            Newspaper,
        },

        {
          label:
            "Newsletter Subscribers",
          value:
            dashboard.newsletterSubscribers,
          icon:
            Mail,
        },

        {
          label:
            "New Contacts",
          value:
            dashboard.newContacts,
          icon:
            MessageSquareText,
        },
      ],
      [
        dashboard.upcomingEvents,
        dashboard.publishedInsights,
        dashboard.newsletterSubscribers,
        dashboard.newContacts,
      ]
    );


  /* ==========================================================
     RECENT ACTIVITY
  ========================================================== */

  const recentActivity =
    useMemo(() => {
      if (
        !Array.isArray(
          dashboard.recentActivity
        )
      ) {
        return [];
      }

      return dashboard
        .recentActivity
        .slice(0, 4);
    }, [
      dashboard.recentActivity,
    ]);


  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <main className="admin-dashboard">

      {/* ======================================================
          HERO
      ====================================================== */}

      <section className="admin-dashboard__hero">
        <div className="admin-dashboard__hero-copy">
          <span className="admin-dashboard__hero-eyebrow">
            Continental Founders Administration
          </span>

          <h1>
            Welcome to Continental Founders CMS
          </h1>

          <p>
            Manage institutional content,
            events, insights, partnerships,
            subscribers and your digital
            presence from one workspace.
          </p>
        </div>

        <div className="admin-dashboard__hero-actions">
          <div className="admin-dashboard__workspace-badge">
            <LayoutDashboard
              size={15}
              strokeWidth={1.8}
            />

            <span>
              CMS Workspace
            </span>
          </div>
        </div>

        <div
          className="admin-dashboard__hero-decoration"
          aria-hidden="true"
        >
          <span className="admin-dashboard__hero-circle admin-dashboard__hero-circle--one" />

          <span className="admin-dashboard__hero-circle admin-dashboard__hero-circle--two" />

          <span className="admin-dashboard__hero-line admin-dashboard__hero-line--one" />

          <span className="admin-dashboard__hero-line admin-dashboard__hero-line--two" />
        </div>
      </section>


      {/* ======================================================
          ERROR MESSAGE
      ====================================================== */}

      {error && (
        <section
          className="admin-dashboard__error"
          role="alert"
        >
          <div>
            <strong>
              Dashboard unavailable
            </strong>

            <span>
              {error}
            </span>
          </div>

          <button
            type="button"
            onClick={
              loadDashboard
            }
            disabled={
              loading
            }
          >
            <RefreshCw
              size={13}
            />

            {loading
              ? "Retrying..."
              : "Retry"}
          </button>
        </section>
      )}


      {/* ======================================================
          STAT CARDS
      ====================================================== */}

      <section
        className="admin-dashboard__stats"
        aria-label="Dashboard statistics"
      >
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
          />
        ))}
      </section>


      {/* ======================================================
          QUICK ACCESS
      ====================================================== */}

      <section className="admin-dashboard__block">
        <header className="admin-dashboard__block-header">
          <div>
            <span className="admin-dashboard__section-eyebrow">
              Management
            </span>

            <h2>
              Quick Access
            </h2>
          </div>

          <span className="admin-dashboard__block-helper">
            Open frequently used CMS sections
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


      {/* ======================================================
          LOWER DASHBOARD
      ====================================================== */}

      <section className="admin-dashboard__lower-grid">

        {/* ====================================================
            RECENT ACTIVITY
        ==================================================== */}

        <article className="admin-dashboard__panel">
          <header className="admin-dashboard__panel-header">
            <div>
              <span className="admin-dashboard__section-eyebrow">
                Updates
              </span>

              <h2>
                Recent Activity
              </h2>
            </div>

            <Activity
              size={16}
              strokeWidth={1.8}
            />
          </header>

          {loading ? (
            <div className="admin-dashboard__activity-empty">
              <RefreshCw
                size={15}
              />

              <span>
                Loading dashboard activity...
              </span>
            </div>
          ) : recentActivity.length > 0 ? (
            <div className="admin-dashboard__activity-list">
              {recentActivity.map(
                (item, index) => {
                  const Icon =
                    getActivityIcon(
                      item
                    );

                  return (
                    <div
                      key={
                        item?.id ||
                        item?._id ||
                        `${getActivityTitle(
                          item
                        )}-${index}`
                      }
                      className="admin-dashboard__activity-item"
                    >
                      <div className="admin-dashboard__activity-icon">
                        <Icon
                          size={13}
                          strokeWidth={1.8}
                        />
                      </div>

                      <div className="admin-dashboard__activity-copy">
                        <strong>
                          {getActivityTitle(
                            item
                          )}
                        </strong>

                        {getActivityDescription(
                          item
                        ) && (
                          <span>
                            {getActivityDescription(
                              item
                            )}
                          </span>
                        )}
                      </div>

                      {getActivityTime(
                        item
                      ) && (
                        <time>
                          {getActivityTime(
                            item
                          )}
                        </time>
                      )}
                    </div>
                  );
                }
              )}
            </div>
          ) : (
            <div className="admin-dashboard__activity-empty">
              <Activity
                size={15}
              />

              <span>
                No recent CMS activity
                has been recorded yet.
              </span>
            </div>
          )}
        </article>


        {/* ====================================================
            SYSTEM STATUS
        ==================================================== */}

        <article className="admin-dashboard__panel">
          <header className="admin-dashboard__panel-header">
            <div>
              <span className="admin-dashboard__section-eyebrow">
                Workspace
              </span>

              <h2>
                System Status
              </h2>
            </div>

            <CheckCircle2
              size={16}
              strokeWidth={1.8}
            />
          </header>

          <div
            className={
              error
                ? "admin-dashboard__system-status admin-dashboard__system-status--warning"
                : "admin-dashboard__system-status"
            }
          >
            <div className="admin-dashboard__system-status-icon">
              {error ? (
                <Activity
                  size={14}
                  strokeWidth={2}
                />
              ) : (
                <CheckCircle2
                  size={14}
                  strokeWidth={2}
                />
              )}
            </div>

            <div>
              <strong>
                {error
                  ? "Dashboard Connection Issue"
                  : "Dashboard Connected"}
              </strong>

              <p>
                {error
                  ? "The CMS could not load the dashboard statistics."
                  : "The dashboard statistics endpoint responded successfully."}
              </p>
            </div>
          </div>

          <div className="admin-dashboard__system-links">
            <Link
              to="/strategic-partners"
              className="admin-dashboard__system-link"
            >
              <span>
                View Partners Page
              </span>

              <ExternalLink
                size={12}
              />
            </Link>

            <Link
              to="/"
              className="admin-dashboard__system-link"
            >
              <span>
                View Public Website
              </span>

              <ExternalLink
                size={12}
              />
            </Link>
          </div>
        </article>

      </section>

    </main>
  );
}


export default AdminDashboard;