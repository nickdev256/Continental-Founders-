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

import {
  Link,
} from "react-router-dom";

import "./AdminDashboard.css";


/* ============================================================
   API CONFIGURATION
============================================================ */

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(/\/+$/, "");


/* ============================================================
   DEFAULT GENERAL DASHBOARD
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


/* ============================================================
   DEFAULT CFCV STATS
============================================================ */

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
   QUICK ACCESS
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

function getNumber(
  ...values
) {
  for (
    const value of values
  ) {
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
      Number.isFinite(
        parsed
      )
    ) {
      return parsed;
    }
  }

  return 0;
}


function formatNumber(
  value
) {
  return new Intl.NumberFormat(
    "en-US"
  ).format(
    getNumber(value)
  );
}


/* ============================================================
   SAFE JSON RESPONSE
============================================================ */

async function readJsonResponse(
  response,
  serviceName
) {
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
      `${serviceName} returned an invalid response (${response.status}).`
    );
  }

  return response.json();
}


/* ============================================================
   NORMALIZE GENERAL DASHBOARD
============================================================ */

function normalizeDashboardData(
  payload
) {
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

  if (
    Array.isArray(
      source.recentActivity
    )
  ) {
    recentActivity =
      source.recentActivity;
  } else if (
    Array.isArray(
      source.recent_activity
    )
  ) {
    recentActivity =
      source.recent_activity;
  } else if (
    Array.isArray(
      source.activity
    )
  ) {
    recentActivity =
      source.activity;
  }

  return {
    upcomingEvents:
      getNumber(
        stats.upcomingEvents,
        stats.upcoming_events,
        source.upcomingEvents,
        source.upcoming_events
      ),

    publishedInsights:
      getNumber(
        stats.publishedInsights,
        stats.published_insights,
        source.publishedInsights,
        source.published_insights
      ),

    newsletterSubscribers:
      getNumber(
        stats.newsletterSubscribers,
        stats.newsletter_subscribers,
        stats.activeSubscribers,
        stats.active_subscribers,
        source.newsletterSubscribers,
        source.newsletter_subscribers
      ),

    newContacts:
      getNumber(
        stats.newContacts,
        stats.new_contacts,
        source.newContacts,
        source.new_contacts
      ),

    totalContacts:
      getNumber(
        stats.totalContacts,
        stats.total_contacts,
        source.totalContacts,
        source.total_contacts
      ),

    partnerships:
      getNumber(
        stats.partnerships,
        stats.totalPartnerships,
        stats.total_partnerships,
        source.partnerships
      ),

    newPartnerships:
      getNumber(
        stats.newPartnerships,
        stats.new_partnerships,
        source.newPartnerships
      ),

    totalGalleryPhotos:
      getNumber(
        stats.totalGalleryPhotos,
        stats.total_gallery_photos,
        stats.galleryPhotos,
        stats.gallery_photos
      ),

    publishedGalleryPhotos:
      getNumber(
        stats.publishedGalleryPhotos,
        stats.published_gallery_photos
      ),

    recentActivity,
  };
}


/* ============================================================
   NORMALIZE CFCV STATS
============================================================ */

function normalizeCfcvStats(
  payload
) {
  const source =
    payload?.data ||
    payload ||
    {};

  const stats =
    source?.stats ||
    source?.statistics ||
    {};

  return {
    totalApplications:
      getNumber(
        stats.totalApplications,
        stats.total_applications
      ),

    submitted:
      getNumber(
        stats.submitted
      ),

    underReview:
      getNumber(
        stats.underReview,
        stats.under_review
      ),

    interviews:
      getNumber(
        stats.interviews
      ),

    matchingRequired:
      getNumber(
        stats.matchingRequired,
        stats.matching_required
      ),

    admitted:
      getNumber(
        stats.admitted
      ),

    waitlisted:
      getNumber(
        stats.waitlisted
      ),

    genesis:
      getNumber(
        stats.genesis
      ),

    ascend:
      getNumber(
        stats.ascend
      ),

    horizon:
      getNumber(
        stats.horizon
      ),

    cohortCapacity:
      getNumber(
        stats.cohortCapacity,
        stats.cohort_capacity,
        30
      ),

    remainingCapacity:
      getNumber(
        stats.remainingCapacity,
        stats.remaining_capacity
      ),
  };
}


/* ============================================================
   ACTIVITY HELPERS
============================================================ */

function getActivityIcon(
  item
) {
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
    type.includes("cfcv") ||
    type.includes(
      "application"
    )
  ) {
    return ClipboardCheck;
  }

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
    type.includes("gallery") ||
    type.includes("photo") ||
    type.includes("image")
  ) {
    return Images;
  }

  if (
    type.includes(
      "newsletter"
    ) ||
    type.includes(
      "subscriber"
    )
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
    type.includes(
      "partnership"
    )
  ) {
    return Handshake;
  }

  if (
    type.includes(
      "university"
    )
  ) {
    return GraduationCap;
  }

  return Activity;
}


function getActivityTitle(
  item
) {
  return (
    item?.title ||
    item?.name ||
    item?.action ||
    item?.message ||
    "Dashboard activity"
  );
}


function getActivityDescription(
  item
) {
  return (
    item?.description ||
    item?.details ||
    item?.subtitle ||
    ""
  );
}


function getActivityTime(
  item
) {
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

  const parsedDate =
    new Date(value);

  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {
    return String(value);
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  ).format(parsedDate);
}


/* ============================================================
   STAT CARD
============================================================ */

function StatCard({
  icon: Icon,
  label,
  value,
  helper,
  unavailable = false,
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
          {unavailable
            ? "—"
            : formatNumber(
                value
              )}
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
   QUICK ACCESS CARD
============================================================ */

function QuickAccessCard({
  item,
}) {
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
  ] = useState(
    DEFAULT_DASHBOARD
  );

  const [
    cfcvStats,
    setCfcvStats,
  ] = useState(
    DEFAULT_CFCV_STATS
  );

  const [
    cfcvAvailable,
    setCfcvAvailable,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    cfcvError,
    setCfcvError,
  ] = useState("");

  const [
    lastUpdated,
    setLastUpdated,
  ] = useState(null);


  /* ==========================================================
     LOAD DASHBOARD
  ========================================================== */

  const loadDashboard =
    useCallback(
      async ({
        silent = false,
      } = {}) => {
        try {
          if (silent) {
            setRefreshing(true);
          } else {
            setLoading(true);
          }

          setError("");
          setCfcvError("");

          const [
            dashboardResult,
            cfcvResult,
          ] =
            await Promise.allSettled([
              fetch(
                `${API_URL}/api/admin/dashboard/stats`,
                {
                  method: "GET",

                  headers: {
                    Accept:
                      "application/json",
                  },

                  credentials:
                    "include",

                  cache:
                    "no-store",
                }
              ),

              fetch(
                `${API_URL}/api/cfcv/admin/stats`,
                {
                  method: "GET",

                  headers: {
                    Accept:
                      "application/json",
                  },

                  credentials:
                    "include",

                  cache:
                    "no-store",
                }
              ),
            ]);


          /* ================================================
             GENERAL DASHBOARD RESPONSE
          ================================================ */

          if (
            dashboardResult.status !==
            "fulfilled"
          ) {
            throw new Error(
              "Unable to connect to the dashboard service."
            );
          }

          const dashboardResponse =
            dashboardResult.value;

          const dashboardData =
            await readJsonResponse(
              dashboardResponse,
              "Dashboard service"
            );

          if (
            dashboardResponse.status ===
            401
          ) {
            throw new Error(
              "Your CMS session is not authenticated. Please sign in again."
            );
          }

          if (
            dashboardResponse.status ===
            403
          ) {
            throw new Error(
              dashboardData?.message ||
              "Your account does not have permission to access the dashboard."
            );
          }

          if (
            !dashboardResponse.ok
          ) {
            throw new Error(
              dashboardData?.message ||
              dashboardData?.error ||
              `Unable to load dashboard (${dashboardResponse.status}).`
            );
          }

          setDashboard(
            normalizeDashboardData(
              dashboardData
            )
          );


          /* ================================================
             CFCV RESPONSE

             CFCV failure must not take down the rest of CMS.
          ================================================ */

          if (
            cfcvResult.status ===
            "fulfilled"
          ) {
            const cfcvResponse =
              cfcvResult.value;

            try {
              const cfcvData =
                await readJsonResponse(
                  cfcvResponse,
                  "CFCV admissions service"
                );

              if (
                cfcvResponse.ok
              ) {
                setCfcvStats(
                  normalizeCfcvStats(
                    cfcvData
                  )
                );

                setCfcvAvailable(
                  true
                );

                setCfcvError("");
              } else {
                setCfcvAvailable(
                  false
                );

                setCfcvError(
                  cfcvData?.message ||
                  "CFCV admissions statistics are temporarily unavailable."
                );
              }
            } catch (
              cfcvRequestError
            ) {
              console.warn(
                "CFCV dashboard loading error:",
                cfcvRequestError
              );

              setCfcvAvailable(
                false
              );

              setCfcvError(
                cfcvRequestError
                  ?.message ||
                "CFCV admissions statistics are temporarily unavailable."
              );
            }
          } else {
            console.warn(
              "CFCV dashboard request failed:",
              cfcvResult.reason
            );

            setCfcvAvailable(
              false
            );

            setCfcvError(
              "CFCV admissions statistics are temporarily unavailable."
            );
          }


          setLastUpdated(
            new Date()
          );
        } catch (
          requestError
        ) {
          console.error(
            "Dashboard loading error:",
            requestError
          );

          setError(
            requestError
              ?.message ||
            "Unable to load dashboard information."
          );
        } finally {
          setLoading(false);

          setRefreshing(false);
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
     MAIN CMS STATS
  ========================================================== */

  const stats =
    useMemo(
      () => [
        {
          label:
            "CFCV Applications",

          value:
            cfcvStats
              .totalApplications,

          icon:
            ClipboardCheck,

          helper:
            cfcvAvailable
              ? `${formatNumber(
                  cfcvStats.submitted
                )} submitted`
              : "CFCV unavailable",

          unavailable:
            !cfcvAvailable,
        },

        {
          label:
            "CFCV Admitted",

          value:
            cfcvStats.admitted,

          icon:
            UserCheck,

          helper:
            cfcvAvailable
              ? `${formatNumber(
                  cfcvStats.remainingCapacity
                )} cohort spaces remaining`
              : "CFCV unavailable",

          unavailable:
            !cfcvAvailable,
        },

        {
          label:
            "Upcoming Events",

          value:
            dashboard
              .upcomingEvents,

          icon:
            CalendarDays,

          helper:
            "Scheduled events",
        },

        {
          label:
            "Published Insights",

          value:
            dashboard
              .publishedInsights,

          icon:
            Newspaper,

          helper:
            "Live publications",
        },

        {
          label:
            "Gallery Photos",

          value:
            dashboard
              .publishedGalleryPhotos,

          icon:
            Images,

          helper:
            `${formatNumber(
              dashboard
                .totalGalleryPhotos
            )} total photos`,
        },

        {
          label:
            "Newsletter Subscribers",

          value:
            dashboard
              .newsletterSubscribers,

          icon:
            Mail,

          helper:
            "Active audience",
        },

        {
          label:
            "New Contacts",

          value:
            dashboard.newContacts,

          icon:
            MessageSquareText,

          helper:
            `${formatNumber(
              dashboard.totalContacts
            )} total enquiries`,
        },

        {
          label:
            "Partnerships",

          value:
            dashboard.partnerships,

          icon:
            Handshake,

          helper:
            `${formatNumber(
              dashboard
                .newPartnerships
            )} new`,
        },
      ],
      [
        cfcvStats,
        cfcvAvailable,
        dashboard,
      ]
    );


  /* ==========================================================
     CFCV ADMISSIONS CARDS
  ========================================================== */

  const cfcvCards =
    useMemo(
      () => [
        {
          label:
            "Submitted",

          value:
            cfcvStats.submitted,

          icon:
            ClipboardCheck,
        },

        {
          label:
            "Under Review",

          value:
            cfcvStats.underReview,

          icon:
            Activity,
        },

        {
          label:
            "Interviews",

          value:
            cfcvStats.interviews,

          icon:
            Users,
        },

        {
          label:
            "Match Required",

          value:
            cfcvStats
              .matchingRequired,

          icon:
            Handshake,
        },

        {
          label:
            "Admitted",

          value:
            cfcvStats.admitted,

          icon:
            UserCheck,
        },

        {
          label:
            "Waitlisted",

          value:
            cfcvStats.waitlisted,

          icon:
            ClipboardCheck,
        },
      ],
      [cfcvStats]
    );


  /* ==========================================================
     RECENT ACTIVITY
  ========================================================== */

  const recentActivity =
    useMemo(() => {
      if (
        !Array.isArray(
          dashboard
            .recentActivity
        )
      ) {
        return [];
      }

      return dashboard
        .recentActivity
        .slice(0, 8);
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
            Continental Founders
            Administration
          </span>

          <h1>
            Welcome to Continental
            Founders CMS
          </h1>

          <p>
            Manage CFCV admissions,
            institutional content,
            events, insights, gallery,
            partnerships, subscribers
            and your digital presence
            from one workspace.
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

          <button
            type="button"
            className="admin-dashboard__refresh-button"
            onClick={() =>
              loadDashboard({
                silent: true,
              })
            }
            disabled={
              loading ||
              refreshing
            }
          >
            <RefreshCw
              size={14}
              className={
                refreshing
                  ? "admin-dashboard__refresh-icon admin-dashboard__refresh-icon--active"
                  : "admin-dashboard__refresh-icon"
              }
            />

            <span>
              {refreshing
                ? "Refreshing..."
                : "Refresh data"}
            </span>
          </button>
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
          GENERAL ERROR
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
            onClick={() =>
              loadDashboard()
            }
            disabled={loading}
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
          MAIN STATS
      ====================================================== */}

      <section
        className="admin-dashboard__stats"
        aria-label="Dashboard statistics"
      >
        {stats.map(
          (stat) => (
            <StatCard
              key={
                stat.label
              }
              icon={
                stat.icon
              }
              label={
                stat.label
              }
              value={
                stat.value
              }
              helper={
                stat.helper
              }
              unavailable={
                stat.unavailable
              }
            />
          )
        )}
      </section>


      {/* ======================================================
          CFCV ADMISSIONS
      ====================================================== */}

      <section className="admin-dashboard__block">
        <header className="admin-dashboard__block-header">
          <div>
            <span className="admin-dashboard__section-eyebrow">
              Fellowship Admissions
            </span>

            <h2>
              CFCV Admissions
            </h2>
          </div>

          <Link
            to="/admin/cfcv"
            className="admin-dashboard__block-helper"
          >
            Open CFCV Admissions
          </Link>
        </header>


        {cfcvError && (
          <div
            className="admin-dashboard__error"
            role="status"
          >
            <div>
              <strong>
                CFCV statistics unavailable
              </strong>

              <span>
                {cfcvError}
              </span>
            </div>
          </div>
        )}


        <div
          className="admin-dashboard__stats"
          aria-label="CFCV admissions statistics"
        >
          {cfcvCards.map(
            (stat) => (
              <StatCard
                key={
                  stat.label
                }
                icon={
                  stat.icon
                }
                label={
                  stat.label
                }
                value={
                  stat.value
                }
                helper={
                  cfcvAvailable
                    ? "CFCV admissions"
                    : "Unavailable"
                }
                unavailable={
                  !cfcvAvailable
                }
              />
            )
          )}
        </div>


        <div className="admin-dashboard__capacity">
          <div>
            <span>
              Cohort capacity
            </span>

            <strong>
              {cfcvAvailable
                ? `${formatNumber(
                    cfcvStats.admitted
                  )} / ${formatNumber(
                    cfcvStats
                      .cohortCapacity
                  )}`
                : "Unavailable"}
            </strong>
          </div>

          {cfcvAvailable && (
            <p>
              {formatNumber(
                cfcvStats
                  .remainingCapacity
              )}{" "}
              {cfcvStats
                .remainingCapacity ===
              1
                ? "space"
                : "spaces"}{" "}
              remaining
            </p>
          )}
        </div>
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
            Open frequently used
            CMS sections
          </span>
        </header>


        <div className="admin-dashboard__quick-grid">
          {quickAccess.map(
            (item) => (
              <QuickAccessCard
                key={
                  item.title
                }
                item={
                  item
                }
              />
            )
          )}
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
                Loading dashboard
                activity...
              </span>
            </div>
          ) : recentActivity.length >
            0 ? (
            <div className="admin-dashboard__activity-list">
              {recentActivity.map(
                (
                  item,
                  index
                ) => {
                  const Icon =
                    getActivityIcon(
                      item
                    );

                  const title =
                    getActivityTitle(
                      item
                    );

                  const description =
                    getActivityDescription(
                      item
                    );

                  const time =
                    getActivityTime(
                      item
                    );

                  return (
                    <div
                      key={
                        item?.id ||
                        item?._id ||
                        `${title}-${index}`
                      }
                      className="admin-dashboard__activity-item"
                    >
                      <div className="admin-dashboard__activity-icon">
                        <Icon
                          size={13}
                          strokeWidth={
                            1.8
                          }
                        />
                      </div>

                      <div className="admin-dashboard__activity-copy">
                        <strong>
                          {title}
                        </strong>

                        {description && (
                          <span>
                            {
                              description
                            }
                          </span>
                        )}
                      </div>

                      {time && (
                        <time>
                          {time}
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
                No recent CMS
                activity has been
                recorded yet.
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
                  ? "The CMS could not load dashboard data from the backend."
                  : cfcvAvailable
                    ? "The CMS and CFCV admissions services are connected."
                    : "The CMS is connected. CFCV admissions statistics are currently unavailable."}
              </p>

              {!error &&
                lastUpdated && (
                  <small>
                    Last updated{" "}
                    {lastUpdated.toLocaleTimeString(
                      [],
                      {
                        hour:
                          "2-digit",

                        minute:
                          "2-digit",
                      }
                    )}
                  </small>
                )}
            </div>
          </div>


          <div className="admin-dashboard__system-links">
            <Link
              to="/cfcv"
              className="admin-dashboard__system-link"
            >
              <span>
                View CFCV
              </span>

              <ExternalLink
                size={12}
              />
            </Link>

            <Link
              to="/gallery"
              className="admin-dashboard__system-link"
            >
              <span>
                View Public Gallery
              </span>

              <ExternalLink
                size={12}
              />
            </Link>

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