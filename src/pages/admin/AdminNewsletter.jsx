import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  BarChart3,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  Download,
  Eye,
  FileText,
  LayoutDashboard,
  Mail,
  MailCheck,
  Megaphone,
  MousePointerClick,
  Plus,
  RefreshCcw,
  Search,
  Send,
  Settings,
  Sparkles,
  Trash2,
  UserCheck,
  UserX,
  Users,
  X,
  XCircle,
} from "lucide-react";

import {
  deleteNewsletterSubscriber,
  getNewsletterSubscribers,
  updateNewsletterSubscriber,
} from "../../services/adminApi";

import "./AdminNewsletter.css";


/* ============================================================
   CONSTANTS
============================================================ */

const TABS = [
  {
    id: "overview",
    label: "Overview",
    icon: LayoutDashboard,
  },
  {
    id: "subscribers",
    label: "Subscribers",
    icon: Users,
  },
  {
    id: "campaigns",
    label: "Campaigns",
    icon: Megaphone,
  },
  {
    id: "create",
    label: "Create Newsletter",
    icon: Plus,
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart3,
  },
];


const EMPTY_CAMPAIGN = {
  title: "",
  subject: "",
  previewText: "",
  featuredImage: "",
  content: "",
  ctaText: "",
  ctaLink: "",
  audience: "all",
};


/* ============================================================
   DATE FORMATTER
============================================================ */

function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(date);
}


/* ============================================================
   SOURCE FORMATTER
============================================================ */

function formatSource(value) {
  if (!value) {
    return "Website";
  }

  return String(value)
    .replace(
      /_/g,
      " "
    )
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase()
    );
}


/* ============================================================
   ADMIN NEWSLETTER
============================================================ */

export default function AdminNewsletter() {
  /* ==========================================================
     NAVIGATION
  ========================================================== */

  const [
    activeTab,
    setActiveTab,
  ] =
    useState("overview");


  /* ==========================================================
     SUBSCRIBERS
  ========================================================== */

  const [
    subscribers,
    setSubscribers,
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
    search,
    setSearch,
  ] =
    useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState("all");

  const [
    updatingId,
    setUpdatingId,
  ] =
    useState(null);

  const [
    deletingId,
    setDeletingId,
  ] =
    useState(null);

  const [
    actionMessage,
    setActionMessage,
  ] =
    useState("");

  const [
    actionError,
    setActionError,
  ] =
    useState("");


  /* ==========================================================
     CREATE NEWSLETTER
  ========================================================== */

  const [
    campaignForm,
    setCampaignForm,
  ] =
    useState(
      EMPTY_CAMPAIGN
    );

  const [
    previewOpen,
    setPreviewOpen,
  ] =
    useState(false);

  const [
    draftMessage,
    setDraftMessage,
  ] =
    useState("");


  /* ==========================================================
     LOAD SUBSCRIBERS
  ========================================================== */

  const loadSubscribers =
    useCallback(
      async () => {
        try {
          setLoading(true);

          setError("");

          setActionError("");

          const result =
            await getNewsletterSubscribers();

          setSubscribers(
            Array.isArray(
              result?.subscribers
            )
              ? result.subscribers
              : []
          );
        } catch (
          requestError
        ) {
          console.error(
            "Newsletter subscribers error:",
            requestError
          );

          setError(
            requestError?.message ||
              "Failed to load newsletter subscribers."
          );
        } finally {
          setLoading(false);
        }
      },
      []
    );


  useEffect(
    () => {
      loadSubscribers();
    },
    [
      loadSubscribers,
    ]
  );


  /* ==========================================================
     STATISTICS
  ========================================================== */

  const statistics =
    useMemo(
      () => {
        const subscribed =
          subscribers.filter(
            (subscriber) =>
              subscriber.status ===
              "subscribed"
          ).length;

        const unsubscribed =
          subscribers.filter(
            (subscriber) =>
              subscriber.status ===
              "unsubscribed"
          ).length;

        const websiteSubscribers =
          subscribers.filter(
            (subscriber) =>
              !subscriber.source ||
              subscriber.source ===
                "website"
          ).length;

        return {
          total:
            subscribers.length,

          subscribed,

          unsubscribed,

          websiteSubscribers,
        };
      },
      [
        subscribers,
      ]
    );


  /* ==========================================================
     RECENT SUBSCRIBERS
  ========================================================== */

  const recentSubscribers =
    useMemo(
      () => {
        return [
          ...subscribers,
        ]
          .sort(
            (a, b) => {
              const aDate =
                new Date(
                  a.subscribed_at ||
                    a.subscribedAt ||
                    0
                ).getTime();

              const bDate =
                new Date(
                  b.subscribed_at ||
                    b.subscribedAt ||
                    0
                ).getTime();

              return (
                bDate -
                aDate
              );
            }
          )
          .slice(
            0,
            5
          );
      },
      [
        subscribers,
      ]
    );


  /* ==========================================================
     FILTER SUBSCRIBERS
  ========================================================== */

  const filteredSubscribers =
    useMemo(
      () => {
        const term =
          search
            .trim()
            .toLowerCase();

        return subscribers.filter(
          (subscriber) => {
            const email =
              String(
                subscriber?.email ||
                  ""
              ).toLowerCase();

            const source =
              String(
                subscriber?.source ||
                  ""
              ).toLowerCase();

            const matchesSearch =
              !term ||
              email.includes(
                term
              ) ||
              source.includes(
                term
              );

            const matchesStatus =
              statusFilter ===
                "all" ||
              subscriber.status ===
                statusFilter;

            return (
              matchesSearch &&
              matchesStatus
            );
          }
        );
      },
      [
        subscribers,
        search,
        statusFilter,
      ]
    );


  /* ==========================================================
     CHANGE SUBSCRIBER STATUS
  ========================================================== */

  async function handleStatusChange(
    subscriber,
    nextStatus
  ) {
    if (
      !subscriber?.id ||
      !nextStatus
    ) {
      return;
    }

    if (
      subscriber.status ===
      nextStatus
    ) {
      return;
    }

    try {
      setUpdatingId(
        subscriber.id
      );

      setActionMessage("");

      setActionError("");

      const result =
        await updateNewsletterSubscriber(
          subscriber.id,
          nextStatus
        );

      const updatedSubscriber =
        result?.subscriber;

      if (
        !updatedSubscriber
      ) {
        throw new Error(
          "The server did not return the updated subscriber."
        );
      }

      setSubscribers(
        (current) =>
          current.map(
            (item) =>
              item.id ===
              subscriber.id
                ? updatedSubscriber
                : item
          )
      );

      setActionMessage(
        nextStatus ===
          "subscribed"
          ? `${subscriber.email} has been subscribed.`
          : `${subscriber.email} has been unsubscribed.`
      );
    } catch (
      requestError
    ) {
      console.error(
        "Newsletter subscriber update error:",
        requestError
      );

      setActionError(
        requestError?.message ||
          "Unable to update subscriber."
      );
    } finally {
      setUpdatingId(
        null
      );
    }
  }


  /* ==========================================================
     DELETE SUBSCRIBER
  ========================================================== */

  async function handleDeleteSubscriber(
    subscriber
  ) {
    if (
      !subscriber?.id
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        `Delete ${subscriber.email} from the newsletter subscriber list?`
      );

    if (
      !confirmed
    ) {
      return;
    }

    try {
      setDeletingId(
        subscriber.id
      );

      setActionMessage("");

      setActionError("");

      await deleteNewsletterSubscriber(
        subscriber.id
      );

      setSubscribers(
        (current) =>
          current.filter(
            (item) =>
              item.id !==
              subscriber.id
          )
      );

      setActionMessage(
        `${subscriber.email} has been deleted.`
      );
    } catch (
      requestError
    ) {
      console.error(
        "Delete newsletter subscriber error:",
        requestError
      );

      setActionError(
        requestError?.message ||
          "Unable to delete subscriber."
      );
    } finally {
      setDeletingId(
        null
      );
    }
  }


  /* ==========================================================
     EXPORT CSV
  ========================================================== */

  function exportSubscribers() {
    if (
      filteredSubscribers.length ===
      0
    ) {
      return;
    }

    const headers = [
      "Email",
      "Status",
      "Source",
      "Subscribed At",
      "Unsubscribed At",
    ];

    const rows =
      filteredSubscribers.map(
        (subscriber) => [
          subscriber.email ||
            "",

          subscriber.status ||
            "",

          subscriber.source ||
            "",

          subscriber.subscribed_at ||
            subscriber.subscribedAt ||
            "",

          subscriber.unsubscribed_at ||
            subscriber.unsubscribedAt ||
            "",
        ]
      );

    const csv =
      [
        headers,
        ...rows,
      ]
        .map(
          (row) =>
            row
              .map(
                (value) =>
                  `"${String(
                    value
                  ).replace(
                    /"/g,
                    '""'
                  )}"`
              )
              .join(",")
        )
        .join("\n");

    const blob =
      new Blob(
        [
          csv,
        ],
        {
          type:
            "text/csv;charset=utf-8;",
        }
      );

    const url =
      URL.createObjectURL(
        blob
      );

    const link =
      document.createElement(
        "a"
      );

    link.href =
      url;

    link.download =
      `continental-founders-newsletter-${new Date()
        .toISOString()
        .slice(
          0,
          10
        )}.csv`;

    document.body.appendChild(
      link
    );

    link.click();

    link.remove();

    URL.revokeObjectURL(
      url
    );
  }


  /* ==========================================================
     CAMPAIGN FORM
  ========================================================== */

  function updateCampaignField(
    field,
    value
  ) {
    setCampaignForm(
      (current) => ({
        ...current,
        [field]:
          value,
      })
    );

    setDraftMessage("");
  }


  function handleSaveDraft() {
    if (
      !campaignForm.title.trim()
    ) {
      setDraftMessage(
        "Add a newsletter title before saving the draft."
      );

      return;
    }

    /*
      Campaign persistence will be connected to the backend
      after the campaign API is added.
    */

    setDraftMessage(
      "The newsletter editor is ready. Campaign database saving will be connected in the next backend upgrade."
    );
  }


  function handleSendTest() {
    setDraftMessage(
      "Test sending will be enabled when the campaign email API is connected."
    );
  }


  function handleSchedule() {
    setDraftMessage(
      "Scheduling will be enabled when campaign storage and the email delivery service are connected."
    );
  }


  function handleSendCampaign() {
    setDraftMessage(
      "Campaign sending is currently disabled until the secure backend delivery endpoint is connected."
    );
  }


  /* ==========================================================
     PAGE HEADER
  ========================================================== */

  function renderHeader() {
    return (
      <header className="admin-newsletter__header">
        <div>
          <span className="admin-newsletter__eyebrow">
            COMMUNICATIONS
          </span>

          <h2>
            Newsletter & Communications
          </h2>

          <p>
            Manage subscribers, prepare campaigns,
            and coordinate Continental Founders
            communications from one place.
          </p>
        </div>

        <div className="admin-newsletter__header-actions">
          <button
            type="button"
            className="admin-newsletter__button admin-newsletter__button--secondary"
            onClick={
              loadSubscribers
            }
            disabled={
              loading
            }
          >
            <RefreshCcw
              size={17}
              strokeWidth={1.8}
            />

            <span>
              {loading
                ? "Refreshing..."
                : "Refresh"}
            </span>
          </button>

          <button
            type="button"
            className="admin-newsletter__button admin-newsletter__button--primary"
            onClick={() =>
              setActiveTab(
                "create"
              )
            }
          >
            <Plus
              size={17}
              strokeWidth={1.8}
            />

            <span>
              Create Newsletter
            </span>
          </button>
        </div>
      </header>
    );
  }


  /* ==========================================================
     TAB NAVIGATION
  ========================================================== */

  function renderTabs() {
    return (
      <div className="admin-newsletter__tabs">
        {TABS.map(
          (tab) => {
            const Icon =
              tab.icon;

            return (
              <button
                key={
                  tab.id
                }
                type="button"
                className={`admin-newsletter__tab ${
                  activeTab ===
                  tab.id
                    ? "admin-newsletter__tab--active"
                    : ""
                }`}
                onClick={() =>
                  setActiveTab(
                    tab.id
                  )
                }
              >
                <Icon
                  size={17}
                  strokeWidth={1.8}
                />

                <span>
                  {tab.label}
                </span>
              </button>
            );
          }
        )}
      </div>
    );
  }


  /* ==========================================================
     MESSAGES
  ========================================================== */

  function renderMessages() {
    return (
      <>
        {actionMessage && (
          <div className="admin-newsletter__message admin-newsletter__message--success">
            <CheckCircle2
              size={17}
            />

            <span>
              {actionMessage}
            </span>
          </div>
        )}

        {actionError && (
          <div className="admin-newsletter__message admin-newsletter__message--error">
            <XCircle
              size={17}
            />

            <span>
              {actionError}
            </span>
          </div>
        )}
      </>
    );
  }


  /* ==========================================================
     STAT CARDS
  ========================================================== */

  function renderStats() {
    const cards = [
      {
        label:
          "Total Subscribers",

        value:
          statistics.total,

        icon:
          Users,
      },
      {
        label:
          "Active Subscribers",

        value:
          statistics.subscribed,

        icon:
          UserCheck,
      },
      {
        label:
          "Unsubscribed",

        value:
          statistics.unsubscribed,

        icon:
          UserX,
      },
      {
        label:
          "Campaigns Sent",

        value:
          "—",

        icon:
          Send,
      },
    ];

    return (
      <div className="admin-newsletter__stats">
        {cards.map(
          (card) => {
            const Icon =
              card.icon;

            return (
              <div
                key={
                  card.label
                }
                className="admin-newsletter__stat"
              >
                <div className="admin-newsletter__stat-icon">
                  <Icon
                    size={22}
                    strokeWidth={1.7}
                  />
                </div>

                <div>
                  <span>
                    {card.label}
                  </span>

                  <strong>
                    {card.value}
                  </strong>
                </div>
              </div>
            );
          }
        )}
      </div>
    );
  }


  /* ==========================================================
     OVERVIEW
  ========================================================== */

  function renderOverview() {
    return (
      <div className="admin-newsletter__panel">
        {renderStats()}

        <div className="admin-newsletter__overview-grid">
          <section className="admin-newsletter__card">
            <div className="admin-newsletter__card-header">
              <div>
                <span className="admin-newsletter__section-label">
                  AUDIENCE
                </span>

                <h3>
                  Subscriber Overview
                </h3>
              </div>

              <button
                type="button"
                className="admin-newsletter__text-button"
                onClick={() =>
                  setActiveTab(
                    "subscribers"
                  )
                }
              >
                View all

                <ChevronRight
                  size={16}
                />
              </button>
            </div>

            <div className="admin-newsletter__audience-summary">
              <div>
                <strong>
                  {statistics.subscribed}
                </strong>

                <span>
                  people can currently
                  receive newsletters
                </span>
              </div>

              <div>
                <strong>
                  {statistics.unsubscribed}
                </strong>

                <span>
                  people have opted out
                </span>
              </div>

              <div>
                <strong>
                  {statistics.websiteSubscribers}
                </strong>

                <span>
                  subscribers came through
                  the website
                </span>
              </div>
            </div>
          </section>

          <section className="admin-newsletter__card admin-newsletter__quick-card">
            <span className="admin-newsletter__section-label">
              QUICK ACTION
            </span>

            <div className="admin-newsletter__quick-icon">
              <Sparkles
                size={25}
              />
            </div>

            <h3>
              Create your next update
            </h3>

            <p>
              Prepare founder stories, CFCV
              announcements, events, insights,
              opportunities, and organizational
              updates.
            </p>

            <button
              type="button"
              className="admin-newsletter__button admin-newsletter__button--primary"
              onClick={() =>
                setActiveTab(
                  "create"
                )
              }
            >
              <Plus
                size={17}
              />

              Create Newsletter
            </button>
          </section>
        </div>

        <section className="admin-newsletter__card">
          <div className="admin-newsletter__card-header">
            <div>
              <span className="admin-newsletter__section-label">
                RECENT
              </span>

              <h3>
                Recent Subscribers
              </h3>
            </div>
          </div>

          {loading ? (
            <div className="admin-newsletter__state admin-newsletter__state--compact">
              <RefreshCcw
                className="admin-newsletter__loading-icon"
                size={24}
              />

              <p>
                Loading subscribers...
              </p>
            </div>
          ) : recentSubscribers.length ===
            0 ? (
            <div className="admin-newsletter__state admin-newsletter__state--compact">
              <Mail
                size={26}
              />

              <p>
                No subscribers yet.
              </p>
            </div>
          ) : (
            <div className="admin-newsletter__recent-list">
              {recentSubscribers.map(
                (
                  subscriber
                ) => (
                  <div
                    key={
                      subscriber.id
                    }
                    className="admin-newsletter__recent-item"
                  >
                    <div className="admin-newsletter__subscriber">
                      <div className="admin-newsletter__subscriber-icon">
                        <Mail
                          size={17}
                        />
                      </div>

                      <div>
                        <strong>
                          {subscriber.email}
                        </strong>

                        <span>
                          {formatSource(
                            subscriber.source
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="admin-newsletter__recent-meta">
                      <span
                        className={`admin-newsletter__status admin-newsletter__status--${subscriber.status}`}
                      >
                        {subscriber.status ===
                        "subscribed"
                          ? "Subscribed"
                          : "Unsubscribed"}
                      </span>

                      <small>
                        {formatDate(
                          subscriber.subscribed_at ||
                            subscriber.subscribedAt
                        )}
                      </small>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </section>
      </div>
    );
  }


  /* ==========================================================
     SUBSCRIBERS
  ========================================================== */

  function renderSubscribers() {
    return (
      <div className="admin-newsletter__panel">
        <div className="admin-newsletter__section-heading">
          <div>
            <span className="admin-newsletter__section-label">
              AUDIENCE MANAGEMENT
            </span>

            <h3>
              Newsletter Subscribers
            </h3>

            <p>
              Search, filter and manage people
              subscribed to Continental Founders
              communications.
            </p>
          </div>

          <button
            type="button"
            className="admin-newsletter__button admin-newsletter__button--secondary"
            onClick={
              exportSubscribers
            }
            disabled={
              filteredSubscribers.length ===
              0
            }
          >
            <Download
              size={17}
            />

            Export CSV
          </button>
        </div>

        <div className="admin-newsletter__toolbar">
          <div className="admin-newsletter__search">
            <Search
              size={18}
              strokeWidth={1.7}
            />

            <input
              type="search"
              value={
                search
              }
              placeholder="Search email or source..."
              aria-label="Search subscribers"
              onChange={(
                event
              ) =>
                setSearch(
                  event.target.value
                )
              }
            />
          </div>

          <select
            value={
              statusFilter
            }
            onChange={(
              event
            ) =>
              setStatusFilter(
                event.target.value
              )
            }
            aria-label="Filter subscribers by status"
          >
            <option value="all">
              All Subscribers
            </option>

            <option value="subscribed">
              Subscribed
            </option>

            <option value="unsubscribed">
              Unsubscribed
            </option>
          </select>
        </div>

        <div className="admin-newsletter__table-card">
          {loading && (
            <div className="admin-newsletter__state">
              <RefreshCcw
                className="admin-newsletter__loading-icon"
                size={28}
              />

              <h3>
                Loading subscribers
              </h3>

              <p>
                Retrieving newsletter subscribers
                from the database.
              </p>
            </div>
          )}

          {!loading &&
            error && (
              <div className="admin-newsletter__state">
                <Mail
                  size={30}
                />

                <h3>
                  Unable to load subscribers
                </h3>

                <p>
                  {error}
                </p>

                <button
                  type="button"
                  onClick={
                    loadSubscribers
                  }
                  className="admin-newsletter__button admin-newsletter__button--primary"
                >
                  Try Again
                </button>
              </div>
            )}

          {!loading &&
            !error &&
            filteredSubscribers.length ===
              0 && (
              <div className="admin-newsletter__state">
                <Mail
                  size={30}
                />

                <h3>
                  No subscribers found
                </h3>

                <p>
                  Newsletter subscribers will
                  appear here after people
                  subscribe through the website.
                </p>
              </div>
            )}

          {!loading &&
            !error &&
            filteredSubscribers.length >
              0 && (
              <div className="admin-newsletter__table-wrap">
                <table className="admin-newsletter__table">
                  <thead>
                    <tr>
                      <th>
                        Subscriber
                      </th>

                      <th>
                        Status
                      </th>

                      <th>
                        Source
                      </th>

                      <th>
                        Date Subscribed
                      </th>

                      <th>
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredSubscribers.map(
                      (
                        subscriber
                      ) => {
                        const isUpdating =
                          updatingId ===
                          subscriber.id;

                        const isDeleting =
                          deletingId ===
                          subscriber.id;

                        const isBusy =
                          isUpdating ||
                          isDeleting;

                        return (
                          <tr
                            key={
                              subscriber.id
                            }
                          >
                            <td>
                              <div className="admin-newsletter__subscriber">
                                <div className="admin-newsletter__subscriber-icon">
                                  <Mail
                                    size={17}
                                    strokeWidth={1.7}
                                  />
                                </div>

                                <span>
                                  {subscriber.email}
                                </span>
                              </div>
                            </td>

                            <td>
                              <span
                                className={`admin-newsletter__status admin-newsletter__status--${subscriber.status}`}
                              >
                                {subscriber.status ===
                                "subscribed"
                                  ? "Subscribed"
                                  : "Unsubscribed"}
                              </span>
                            </td>

                            <td>
                              {formatSource(
                                subscriber.source
                              )}
                            </td>

                            <td>
                              {formatDate(
                                subscriber.subscribed_at ||
                                  subscriber.subscribedAt
                              )}
                            </td>

                            <td>
                              <div className="admin-newsletter__row-actions">
                                {subscriber.status ===
                                "subscribed" ? (
                                  <button
                                    type="button"
                                    className="admin-newsletter__row-action"
                                    title="Unsubscribe"
                                    disabled={
                                      isBusy
                                    }
                                    onClick={() =>
                                      handleStatusChange(
                                        subscriber,
                                        "unsubscribed"
                                      )
                                    }
                                  >
                                    <UserX
                                      size={16}
                                    />

                                    <span>
                                      {isUpdating
                                        ? "Updating..."
                                        : "Unsubscribe"}
                                    </span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    className="admin-newsletter__row-action admin-newsletter__row-action--activate"
                                    title="Subscribe"
                                    disabled={
                                      isBusy
                                    }
                                    onClick={() =>
                                      handleStatusChange(
                                        subscriber,
                                        "subscribed"
                                      )
                                    }
                                  >
                                    <UserCheck
                                      size={16}
                                    />

                                    <span>
                                      {isUpdating
                                        ? "Updating..."
                                        : "Subscribe"}
                                    </span>
                                  </button>
                                )}

                                <button
                                  type="button"
                                  className="admin-newsletter__row-action admin-newsletter__row-action--delete"
                                  title="Delete subscriber"
                                  disabled={
                                    isBusy
                                  }
                                  onClick={() =>
                                    handleDeleteSubscriber(
                                      subscriber
                                    )
                                  }
                                >
                                  <Trash2
                                    size={16}
                                  />

                                  <span>
                                    {isDeleting
                                      ? "Deleting..."
                                      : "Delete"}
                                  </span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>
            )}
        </div>
      </div>
    );
  }


  /* ==========================================================
     CAMPAIGNS
  ========================================================== */

  function renderCampaigns() {
    return (
      <div className="admin-newsletter__panel">
        <div className="admin-newsletter__section-heading">
          <div>
            <span className="admin-newsletter__section-label">
              CAMPAIGNS
            </span>

            <h3>
              Newsletter Campaigns
            </h3>

            <p>
              Draft, schedule and manage
              Continental Founders newsletter
              campaigns.
            </p>
          </div>

          <button
            type="button"
            className="admin-newsletter__button admin-newsletter__button--primary"
            onClick={() =>
              setActiveTab(
                "create"
              )
            }
          >
            <Plus
              size={17}
            />

            New Campaign
          </button>
        </div>

        <div className="admin-newsletter__coming-soon">
          <div className="admin-newsletter__coming-icon">
            <Megaphone
              size={32}
            />
          </div>

          <span className="admin-newsletter__section-label">
            CAMPAIGN MANAGER
          </span>

          <h3>
            Campaign storage is ready for the
            next backend upgrade
          </h3>

          <p>
            The subscriber system is currently
            connected to your API. Campaign
            history, drafts, scheduled sends and
            delivery records will appear here
            after the campaign endpoints and
            database tables are added.
          </p>

          <button
            type="button"
            className="admin-newsletter__button admin-newsletter__button--primary"
            onClick={() =>
              setActiveTab(
                "create"
              )
            }
          >
            <FileText
              size={17}
            />

            Open Newsletter Editor
          </button>
        </div>
      </div>
    );
  }


  /* ==========================================================
     CREATE NEWSLETTER
  ========================================================== */

  function renderCreateNewsletter() {
    return (
      <div className="admin-newsletter__panel">
        <div className="admin-newsletter__section-heading">
          <div>
            <span className="admin-newsletter__section-label">
              NEWSLETTER EDITOR
            </span>

            <h3>
              Create Newsletter
            </h3>

            <p>
              Prepare a professional update for
              the Continental Founders audience.
            </p>
          </div>

          <button
            type="button"
            className="admin-newsletter__button admin-newsletter__button--secondary"
            onClick={() =>
              setPreviewOpen(
                true
              )
            }
          >
            <Eye
              size={17}
            />

            Preview
          </button>
        </div>

        <div className="admin-newsletter__editor-layout">
          <div className="admin-newsletter__editor-main">
            <section className="admin-newsletter__card">
              <div className="admin-newsletter__form-heading">
                <span>
                  01
                </span>

                <div>
                  <h3>
                    Campaign Details
                  </h3>

                  <p>
                    Give the newsletter an
                    internal title and define how
                    it appears in the inbox.
                  </p>
                </div>
              </div>

              <div className="admin-newsletter__form-grid">
                <label className="admin-newsletter__field admin-newsletter__field--full">
                  <span>
                    Newsletter Title
                  </span>

                  <input
                    type="text"
                    value={
                      campaignForm.title
                    }
                    placeholder="e.g. September Founder Update"
                    onChange={(
                      event
                    ) =>
                      updateCampaignField(
                        "title",
                        event.target.value
                      )
                    }
                  />
                </label>

                <label className="admin-newsletter__field admin-newsletter__field--full">
                  <span>
                    Email Subject
                  </span>

                  <input
                    type="text"
                    value={
                      campaignForm.subject
                    }
                    placeholder="The latest from Continental Founders"
                    onChange={(
                      event
                    ) =>
                      updateCampaignField(
                        "subject",
                        event.target.value
                      )
                    }
                  />
                </label>

                <label className="admin-newsletter__field admin-newsletter__field--full">
                  <span>
                    Preview Text
                  </span>

                  <input
                    type="text"
                    value={
                      campaignForm.previewText
                    }
                    placeholder="A short introduction shown beside the subject line"
                    onChange={(
                      event
                    ) =>
                      updateCampaignField(
                        "previewText",
                        event.target.value
                      )
                    }
                  />
                </label>
              </div>
            </section>

            <section className="admin-newsletter__card">
              <div className="admin-newsletter__form-heading">
                <span>
                  02
                </span>

                <div>
                  <h3>
                    Newsletter Content
                  </h3>

                  <p>
                    Add the main message and
                    optional featured image.
                  </p>
                </div>
              </div>

              <div className="admin-newsletter__form-grid">
                <label className="admin-newsletter__field admin-newsletter__field--full">
                  <span>
                    Featured Image URL
                  </span>

                  <input
                    type="url"
                    value={
                      campaignForm.featuredImage
                    }
                    placeholder="https://..."
                    onChange={(
                      event
                    ) =>
                      updateCampaignField(
                        "featuredImage",
                        event.target.value
                      )
                    }
                  />
                </label>

                <label className="admin-newsletter__field admin-newsletter__field--full">
                  <span>
                    Message
                  </span>

                  <textarea
                    rows={14}
                    value={
                      campaignForm.content
                    }
                    placeholder="Write your newsletter content here..."
                    onChange={(
                      event
                    ) =>
                      updateCampaignField(
                        "content",
                        event.target.value
                      )
                    }
                  />
                </label>
              </div>
            </section>

            <section className="admin-newsletter__card">
              <div className="admin-newsletter__form-heading">
                <span>
                  03
                </span>

                <div>
                  <h3>
                    Call to Action
                  </h3>

                  <p>
                    Optionally direct readers to
                    a page, opportunity, event or
                    story.
                  </p>
                </div>
              </div>

              <div className="admin-newsletter__form-grid admin-newsletter__form-grid--two">
                <label className="admin-newsletter__field">
                  <span>
                    Button Text
                  </span>

                  <input
                    type="text"
                    value={
                      campaignForm.ctaText
                    }
                    placeholder="Learn More"
                    onChange={(
                      event
                    ) =>
                      updateCampaignField(
                        "ctaText",
                        event.target.value
                      )
                    }
                  />
                </label>

                <label className="admin-newsletter__field">
                  <span>
                    Button Link
                  </span>

                  <input
                    type="url"
                    value={
                      campaignForm.ctaLink
                    }
                    placeholder="https://..."
                    onChange={(
                      event
                    ) =>
                      updateCampaignField(
                        "ctaLink",
                        event.target.value
                      )
                    }
                  />
                </label>
              </div>
            </section>
          </div>

          <aside className="admin-newsletter__editor-sidebar">
            <section className="admin-newsletter__card">
              <span className="admin-newsletter__section-label">
                AUDIENCE
              </span>

              <h3>
                Who should receive this?
              </h3>

              <label className="admin-newsletter__field">
                <span>
                  Audience
                </span>

                <select
                  value={
                    campaignForm.audience
                  }
                  onChange={(
                    event
                  ) =>
                    updateCampaignField(
                      "audience",
                      event.target.value
                    )
                  }
                >
                  <option value="all">
                    All Active Subscribers
                  </option>

                  <option value="founders">
                    Founders
                  </option>

                  <option value="partners">
                    Partners
                  </option>

                  <option value="universities">
                    Universities
                  </option>

                  <option value="custom">
                    Custom Segment
                  </option>
                </select>
              </label>

              <div className="admin-newsletter__recipient-count">
                <Users
                  size={20}
                />

                <div>
                  <strong>
                    {campaignForm.audience ===
                    "all"
                      ? statistics.subscribed
                      : "—"}
                  </strong>

                  <span>
                    estimated recipients
                  </span>
                </div>
              </div>

              {campaignForm.audience !==
                "all" && (
                <p className="admin-newsletter__helper">
                  Audience segmentation will
                  become active when subscriber
                  tags and segments are added to
                  the backend.
                </p>
              )}
            </section>

            <section className="admin-newsletter__card">
              <span className="admin-newsletter__section-label">
                DELIVERY
              </span>

              <h3>
                Campaign Actions
              </h3>

              <div className="admin-newsletter__delivery-actions">
                <button
                  type="button"
                  className="admin-newsletter__button admin-newsletter__button--secondary admin-newsletter__button--wide"
                  onClick={
                    handleSaveDraft
                  }
                >
                  <FileText
                    size={17}
                  />

                  Save Draft
                </button>

                <button
                  type="button"
                  className="admin-newsletter__button admin-newsletter__button--secondary admin-newsletter__button--wide"
                  onClick={
                    handleSendTest
                  }
                >
                  <MailCheck
                    size={17}
                  />

                  Send Test
                </button>

                <button
                  type="button"
                  className="admin-newsletter__button admin-newsletter__button--secondary admin-newsletter__button--wide"
                  onClick={
                    handleSchedule
                  }
                >
                  <CalendarClock
                    size={17}
                  />

                  Schedule
                </button>

                <button
                  type="button"
                  className="admin-newsletter__button admin-newsletter__button--primary admin-newsletter__button--wide"
                  onClick={
                    handleSendCampaign
                  }
                >
                  <Send
                    size={17}
                  />

                  Send Newsletter
                </button>
              </div>

              {draftMessage && (
                <div className="admin-newsletter__editor-notice">
                  {draftMessage}
                </div>
              )}
            </section>
          </aside>
        </div>
      </div>
    );
  }


  /* ==========================================================
     ANALYTICS
  ========================================================== */

  function renderAnalytics() {
    return (
      <div className="admin-newsletter__panel">
        <div className="admin-newsletter__section-heading">
          <div>
            <span className="admin-newsletter__section-label">
              PERFORMANCE
            </span>

            <h3>
              Newsletter Analytics
            </h3>

            <p>
              Review audience growth and, after
              delivery tracking is connected,
              campaign engagement.
            </p>
          </div>
        </div>

        <div className="admin-newsletter__stats">
          <div className="admin-newsletter__stat">
            <div className="admin-newsletter__stat-icon">
              <Users
                size={22}
              />
            </div>

            <div>
              <span>
                Active Audience
              </span>

              <strong>
                {statistics.subscribed}
              </strong>
            </div>
          </div>

          <div className="admin-newsletter__stat">
            <div className="admin-newsletter__stat-icon">
              <MailCheck
                size={22}
              />
            </div>

            <div>
              <span>
                Delivered
              </span>

              <strong>
                —
              </strong>
            </div>
          </div>

          <div className="admin-newsletter__stat">
            <div className="admin-newsletter__stat-icon">
              <Eye
                size={22}
              />
            </div>

            <div>
              <span>
                Opens
              </span>

              <strong>
                —
              </strong>
            </div>
          </div>

          <div className="admin-newsletter__stat">
            <div className="admin-newsletter__stat-icon">
              <MousePointerClick
                size={22}
              />
            </div>

            <div>
              <span>
                Clicks
              </span>

              <strong>
                —
              </strong>
            </div>
          </div>
        </div>

        <div className="admin-newsletter__analytics-grid">
          <section className="admin-newsletter__card">
            <span className="admin-newsletter__section-label">
              AUDIENCE HEALTH
            </span>

            <h3>
              Subscriber Status
            </h3>

            <div className="admin-newsletter__analytics-list">
              <div>
                <span>
                  Total subscribers
                </span>

                <strong>
                  {statistics.total}
                </strong>
              </div>

              <div>
                <span>
                  Active
                </span>

                <strong>
                  {statistics.subscribed}
                </strong>
              </div>

              <div>
                <span>
                  Unsubscribed
                </span>

                <strong>
                  {statistics.unsubscribed}
                </strong>
              </div>
            </div>
          </section>

          <section className="admin-newsletter__card">
            <span className="admin-newsletter__section-label">
              CAMPAIGN TRACKING
            </span>

            <h3>
              Delivery Analytics
            </h3>

            <div className="admin-newsletter__empty-analytics">
              <BarChart3
                size={34}
              />

              <p>
                Delivery, open and click
                statistics will appear here once
                campaign sending and provider
                event tracking are connected.
              </p>
            </div>
          </section>
        </div>
      </div>
    );
  }


  /* ==========================================================
     PREVIEW
  ========================================================== */

  function renderPreview() {
    if (!previewOpen) {
      return null;
    }

    return (
      <div
        className="admin-newsletter__preview-overlay"
        role="presentation"
        onMouseDown={() =>
          setPreviewOpen(
            false
          )
        }
      >
        <div
          className="admin-newsletter__preview-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Newsletter preview"
          onMouseDown={(
            event
          ) =>
            event.stopPropagation()
          }
        >
          <div className="admin-newsletter__preview-header">
            <div>
              <span className="admin-newsletter__section-label">
                EMAIL PREVIEW
              </span>

              <h3>
                {campaignForm.subject ||
                  "Untitled Newsletter"}
              </h3>
            </div>

            <button
              type="button"
              className="admin-newsletter__icon-button"
              onClick={() =>
                setPreviewOpen(
                  false
                )
              }
              aria-label="Close preview"
            >
              <X
                size={20}
              />
            </button>
          </div>

          <div className="admin-newsletter__email-preview">
            <div className="admin-newsletter__email-brand">
              <strong>
                CONTINENTAL FOUNDERS
              </strong>

              <span>
                Empowering Global Founders
              </span>
            </div>

            {campaignForm.featuredImage && (
              <img
                src={
                  campaignForm.featuredImage
                }
                alt=""
                className="admin-newsletter__email-image"
              />
            )}

            <div className="admin-newsletter__email-body">
              <span className="admin-newsletter__email-kicker">
                CONTINENTAL FOUNDERS
              </span>

              <h1>
                {campaignForm.title ||
                  "Newsletter Title"}
              </h1>

              {campaignForm.previewText && (
                <p className="admin-newsletter__email-preview-text">
                  {campaignForm.previewText}
                </p>
              )}

              <div className="admin-newsletter__email-content">
                {campaignForm.content
                  ? campaignForm.content
                      .split(
                        /\n{2,}/
                      )
                      .map(
                        (
                          paragraph,
                          index
                        ) => (
                          <p
                            key={
                              `${paragraph}-${index}`
                            }
                          >
                            {paragraph}
                          </p>
                        )
                      )
                  : (
                    <p>
                      Your newsletter message
                      will appear here.
                    </p>
                  )}
              </div>

              {campaignForm.ctaText &&
                campaignForm.ctaLink && (
                  <a
                    href={
                      campaignForm.ctaLink
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="admin-newsletter__email-cta"
                  >
                    {campaignForm.ctaText}
                  </a>
                )}
            </div>

            <footer className="admin-newsletter__email-footer">
              <strong>
                Continental Founders
              </strong>

              <p>
                You are receiving this message
                because you subscribed to
                Continental Founders updates.
              </p>

              <span>
                Unsubscribe
              </span>
            </footer>
          </div>
        </div>
      </div>
    );
  }


  /* ==========================================================
     RENDER ACTIVE TAB
  ========================================================== */

  function renderActiveTab() {
    switch (
      activeTab
    ) {
      case "subscribers":
        return renderSubscribers();

      case "campaigns":
        return renderCampaigns();

      case "create":
        return renderCreateNewsletter();

      case "analytics":
        return renderAnalytics();

      case "overview":
      default:
        return renderOverview();
    }
  }


  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <section className="admin-newsletter">
      {renderHeader()}

      {renderTabs()}

      {renderMessages()}

      {renderActiveTab()}

      {renderPreview()}
    </section>
  );
}