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
  ChevronLeft,
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


const WIZARD_STEPS = [
  {
    id: 1,
    label: "Details",
    shortLabel: "Details",
    description: "Newsletter and inbox details",
    icon: FileText,
  },
  {
    id: 2,
    label: "Content",
    shortLabel: "Content",
    description: "Message, image and call to action",
    icon: Mail,
  },
  {
    id: 3,
    label: "Audience",
    shortLabel: "Audience",
    description: "Choose who receives the campaign",
    icon: Users,
  },
  {
    id: 4,
    label: "Delivery",
    shortLabel: "Delivery",
    description: "Test, send now or schedule",
    icon: CalendarClock,
  },
  {
    id: 5,
    label: "Review",
    shortLabel: "Review",
    description: "Review everything before delivery",
    icon: CheckCircle2,
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
  deliveryMethod: "now",
  scheduledAt: "",
  testEmail: "",
};


/* ============================================================
   DATE FORMATTER
============================================================ */

function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}


function formatDateTime(value) {
  if (!value) {
    return "Not scheduled";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not scheduled";
  }

  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}


/* ============================================================
   SOURCE FORMATTER
============================================================ */

function formatSource(value) {
  if (!value) {
    return "Website";
  }

  return String(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}


/* ============================================================
   AUDIENCE FORMATTER
============================================================ */

function formatAudience(value) {
  const labels = {
    all: "All Active Subscribers",
    founders: "Founders",
    partners: "Partners",
    universities: "Universities",
    custom: "Custom Segment",
  };

  return labels[value] || "All Active Subscribers";
}


/* ============================================================
   ADMIN NEWSLETTER
============================================================ */

export default function AdminNewsletter() {
  /* ==========================================================
     NAVIGATION
  ========================================================== */

  const [activeTab, setActiveTab] =
    useState("overview");


  /* ==========================================================
     SUBSCRIBERS
  ========================================================== */

  const [subscribers, setSubscribers] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [updatingId, setUpdatingId] =
    useState(null);

  const [deletingId, setDeletingId] =
    useState(null);

  const [actionMessage, setActionMessage] =
    useState("");

  const [actionError, setActionError] =
    useState("");


  /* ==========================================================
     CREATE NEWSLETTER
  ========================================================== */

  const [campaignForm, setCampaignForm] =
    useState(EMPTY_CAMPAIGN);

  const [wizardStep, setWizardStep] =
    useState(1);

  const [wizardError, setWizardError] =
    useState("");

  const [previewOpen, setPreviewOpen] =
    useState(false);

  const [draftMessage, setDraftMessage] =
    useState("");


  /* ==========================================================
     LOAD SUBSCRIBERS
  ========================================================== */

  const loadSubscribers = useCallback(
    async () => {
      try {
        setLoading(true);
        setError("");
        setActionError("");

        const result =
          await getNewsletterSubscribers();

        setSubscribers(
          Array.isArray(result?.subscribers)
            ? result.subscribers
            : []
        );
      } catch (requestError) {
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


  useEffect(() => {
    loadSubscribers();
  }, [loadSubscribers]);


  /* ==========================================================
     STATISTICS
  ========================================================== */

  const statistics = useMemo(() => {
    const subscribed =
      subscribers.filter(
        (subscriber) =>
          subscriber.status === "subscribed"
      ).length;

    const unsubscribed =
      subscribers.filter(
        (subscriber) =>
          subscriber.status === "unsubscribed"
      ).length;

    const websiteSubscribers =
      subscribers.filter((subscriber) => {
        const source = String(
          subscriber?.source || ""
        ).toLowerCase();

        return (
          !source ||
          source === "website" ||
          source === "website_footer"
        );
      }).length;

    return {
      total: subscribers.length,
      subscribed,
      unsubscribed,
      websiteSubscribers,
    };
  }, [subscribers]);


  /* ==========================================================
     RECENT SUBSCRIBERS
  ========================================================== */

  const recentSubscribers =
    useMemo(() => {
      return [...subscribers]
        .sort((a, b) => {
          const aDate = new Date(
            a.subscribed_at ||
              a.subscribedAt ||
              0
          ).getTime();

          const bDate = new Date(
            b.subscribed_at ||
              b.subscribedAt ||
              0
          ).getTime();

          return bDate - aDate;
        })
        .slice(0, 5);
    }, [subscribers]);


  /* ==========================================================
     FILTER SUBSCRIBERS
  ========================================================== */

  const filteredSubscribers =
    useMemo(() => {
      const term =
        search.trim().toLowerCase();

      return subscribers.filter(
        (subscriber) => {
          const email = String(
            subscriber?.email || ""
          ).toLowerCase();

          const source = String(
            subscriber?.source || ""
          ).toLowerCase();

          const matchesSearch =
            !term ||
            email.includes(term) ||
            source.includes(term);

          const matchesStatus =
            statusFilter === "all" ||
            subscriber.status ===
              statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      subscribers,
      search,
      statusFilter,
    ]);


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
      setUpdatingId(subscriber.id);
      setActionMessage("");
      setActionError("");

      const result =
        await updateNewsletterSubscriber(
          subscriber.id,
          nextStatus
        );

      const updatedSubscriber =
        result?.subscriber;

      if (!updatedSubscriber) {
        throw new Error(
          "The server did not return the updated subscriber."
        );
      }

      setSubscribers((current) =>
        current.map((item) =>
          item.id === subscriber.id
            ? updatedSubscriber
            : item
        )
      );

      setActionMessage(
        nextStatus === "subscribed"
          ? `${subscriber.email} has been subscribed.`
          : `${subscriber.email} has been unsubscribed.`
      );
    } catch (requestError) {
      console.error(
        "Newsletter subscriber update error:",
        requestError
      );

      setActionError(
        requestError?.message ||
          "Unable to update subscriber."
      );
    } finally {
      setUpdatingId(null);
    }
  }


  /* ==========================================================
     DELETE SUBSCRIBER
  ========================================================== */

  async function handleDeleteSubscriber(
    subscriber
  ) {
    if (!subscriber?.id) {
      return;
    }

    const confirmed =
      window.confirm(
        `Delete ${subscriber.email} from the newsletter subscriber list?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(subscriber.id);
      setActionMessage("");
      setActionError("");

      await deleteNewsletterSubscriber(
        subscriber.id
      );

      setSubscribers((current) =>
        current.filter(
          (item) =>
            item.id !== subscriber.id
        )
      );

      setActionMessage(
        `${subscriber.email} has been deleted.`
      );
    } catch (requestError) {
      console.error(
        "Delete newsletter subscriber error:",
        requestError
      );

      setActionError(
        requestError?.message ||
          "Unable to delete subscriber."
      );
    } finally {
      setDeletingId(null);
    }
  }


  /* ==========================================================
     EXPORT CSV
  ========================================================== */

  function exportSubscribers() {
    if (
      filteredSubscribers.length === 0
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
          subscriber.email || "",
          subscriber.status || "",
          subscriber.source || "",
          subscriber.subscribed_at ||
            subscriber.subscribedAt ||
            "",
          subscriber.unsubscribed_at ||
            subscriber.unsubscribedAt ||
            "",
        ]
      );

    const csv = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map(
            (value) =>
              `"${String(value).replace(
                /"/g,
                '""'
              )}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob(
      [csv],
      {
        type:
          "text/csv;charset=utf-8;",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download =
      `continental-founders-newsletter-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
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
        [field]: value,
      })
    );

    setWizardError("");
    setDraftMessage("");
  }


  function resetCampaign() {
    setCampaignForm({
      ...EMPTY_CAMPAIGN,
    });

    setWizardStep(1);
    setWizardError("");
    setDraftMessage("");
  }


  /* ==========================================================
     WIZARD VALIDATION
  ========================================================== */

  function validateWizardStep(step) {
    setWizardError("");

    if (step === 1) {
      if (!campaignForm.title.trim()) {
        setWizardError(
          "Enter a newsletter title before continuing."
        );

        return false;
      }

      if (!campaignForm.subject.trim()) {
        setWizardError(
          "Enter an email subject before continuing."
        );

        return false;
      }

      return true;
    }

    if (step === 2) {
      if (!campaignForm.content.trim()) {
        setWizardError(
          "Add the newsletter message before continuing."
        );

        return false;
      }

      if (
        campaignForm.ctaText.trim() &&
        !campaignForm.ctaLink.trim()
      ) {
        setWizardError(
          "Add a link for the call-to-action button or remove the button text."
        );

        return false;
      }

      if (
        campaignForm.ctaLink.trim() &&
        !campaignForm.ctaText.trim()
      ) {
        setWizardError(
          "Add button text for the call-to-action link."
        );

        return false;
      }

      return true;
    }

    if (step === 3) {
      if (!campaignForm.audience) {
        setWizardError(
          "Choose an audience before continuing."
        );

        return false;
      }

      if (
        campaignForm.audience !== "all"
      ) {
        setWizardError(
          "This audience segment is not active yet. Choose All Active Subscribers until subscriber segmentation is connected."
        );

        return false;
      }

      if (
        statistics.subscribed === 0
      ) {
        setWizardError(
          "There are currently no active subscribers available for this campaign."
        );

        return false;
      }

      return true;
    }

    if (step === 4) {
      if (
        campaignForm.deliveryMethod ===
          "schedule" &&
        !campaignForm.scheduledAt
      ) {
        setWizardError(
          "Choose a date and time for the scheduled newsletter."
        );

        return false;
      }

      if (
        campaignForm.deliveryMethod ===
          "schedule" &&
        campaignForm.scheduledAt
      ) {
        const scheduled =
          new Date(
            campaignForm.scheduledAt
          ).getTime();

        if (
          Number.isNaN(scheduled) ||
          scheduled <= Date.now()
        ) {
          setWizardError(
            "The scheduled date and time must be in the future."
          );

          return false;
        }
      }

      return true;
    }

    return true;
  }


  function handleNextStep() {
    if (
      !validateWizardStep(
        wizardStep
      )
    ) {
      return;
    }

    setWizardStep((current) =>
      Math.min(
        current + 1,
        WIZARD_STEPS.length
      )
    );

    setWizardError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }


  function handlePreviousStep() {
    setWizardStep((current) =>
      Math.max(
        current - 1,
        1
      )
    );

    setWizardError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }


  function goToWizardStep(step) {
    if (
      step < 1 ||
      step > WIZARD_STEPS.length
    ) {
      return;
    }

    if (step > wizardStep) {
      for (
        let currentStep =
          wizardStep;
        currentStep < step;
        currentStep += 1
      ) {
        if (
          !validateWizardStep(
            currentStep
          )
        ) {
          return;
        }
      }
    }

    setWizardStep(step);
    setWizardError("");
  }


  /* ==========================================================
     DRAFT / DELIVERY
  ========================================================== */

  function handleSaveDraft() {
    if (
      !campaignForm.title.trim()
    ) {
      setWizardStep(1);

      setWizardError(
        "Add a newsletter title before saving the draft."
      );

      return;
    }

    setDraftMessage(
      "The newsletter is ready to be saved. Campaign persistence will be connected to the campaign API in the next integration step."
    );
  }


  function handleSendTest() {
    if (
      !campaignForm.testEmail.trim()
    ) {
      setWizardError(
        "Enter the email address that should receive the test newsletter."
      );

      return;
    }

    setWizardError("");

    setDraftMessage(
      "Test delivery is ready in the interface. The secure email delivery endpoint still needs to be connected before a real test email is sent."
    );
  }


  function handleSchedule() {
    if (
      !validateWizardStep(4)
    ) {
      setWizardStep(4);
      return;
    }

    setDraftMessage(
      "The campaign is ready to be scheduled. The backend scheduler still needs to be connected before the schedule becomes active."
    );
  }


  function handleSendCampaign() {
    for (
      let step = 1;
      step <= 4;
      step += 1
    ) {
      if (
        !validateWizardStep(step)
      ) {
        setWizardStep(step);
        return;
      }
    }

    setDraftMessage(
      "The campaign has passed the editor checks. Sending remains disabled until the secure newsletter delivery service is connected."
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
            Manage subscribers, prepare
            campaigns, and coordinate
            Continental Founders
            communications from one place.
          </p>
        </div>

        <div className="admin-newsletter__header-actions">
          <button
            type="button"
            className="admin-newsletter__button admin-newsletter__button--secondary"
            onClick={loadSubscribers}
            disabled={loading}
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
            onClick={() => {
              setActiveTab("create");
              setWizardStep(1);
            }}
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
        {TABS.map((tab) => {
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              type="button"
              className={`admin-newsletter__tab ${
                activeTab === tab.id
                  ? "admin-newsletter__tab--active"
                  : ""
              }`}
              onClick={() => {
                setActiveTab(tab.id);

                if (
                  tab.id === "create"
                ) {
                  setWizardError("");
                }
              }}
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
        })}
      </div>
    );
  }


  /* ==========================================================
     GLOBAL MESSAGES
  ========================================================== */

  function renderMessages() {
    if (
      !actionMessage &&
      !actionError
    ) {
      return null;
    }

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
  }  /* ==========================================================
     OVERVIEW
  ========================================================== */

  function renderOverview() {
    return (
      <div className="admin-newsletter__panel">
        <div className="admin-newsletter__section-heading">
          <div>
            <span className="admin-newsletter__section-label">
              OVERVIEW
            </span>

            <h3>
              Communications Overview
            </h3>

            <p>
              A quick view of your newsletter
              audience and recent subscriber
              activity.
            </p>
          </div>
        </div>

        <div className="admin-newsletter__stats">
          <div className="admin-newsletter__stat">
            <div className="admin-newsletter__stat-icon">
              <Users size={20} />
            </div>

            <div>
              <span>
                Total Subscribers
              </span>

              <strong>
                {statistics.total}
              </strong>
            </div>
          </div>

          <div className="admin-newsletter__stat">
            <div className="admin-newsletter__stat-icon">
              <UserCheck size={20} />
            </div>

            <div>
              <span>
                Active Subscribers
              </span>

              <strong>
                {statistics.subscribed}
              </strong>
            </div>
          </div>

          <div className="admin-newsletter__stat">
            <div className="admin-newsletter__stat-icon">
              <UserX size={20} />
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

          <div className="admin-newsletter__stat">
            <div className="admin-newsletter__stat-icon">
              <Mail size={20} />
            </div>

            <div>
              <span>
                Website Signups
              </span>

              <strong>
                {statistics.websiteSubscribers}
              </strong>
            </div>
          </div>
        </div>

        <div className="admin-newsletter__overview-grid">
          <section className="admin-newsletter__card">
            <div className="admin-newsletter__card-header">
              <div>
                <span className="admin-newsletter__section-label">
                  AUDIENCE
                </span>

                <h3>
                  Subscriber Health
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
                View Subscribers

                <ChevronRight
                  size={15}
                />
              </button>
            </div>

            <div className="admin-newsletter__audience-summary">
              <div>
                <strong>
                  {statistics.total}
                </strong>

                <span>
                  Total audience
                </span>
              </div>

              <div>
                <strong>
                  {statistics.subscribed}
                </strong>

                <span>
                  Receiving updates
                </span>
              </div>

              <div>
                <strong>
                  {statistics.unsubscribed}
                </strong>

                <span>
                  Opted out
                </span>
              </div>
            </div>
          </section>

          <section className="admin-newsletter__card admin-newsletter__quick-card">
            <div className="admin-newsletter__quick-icon">
              <Sparkles size={20} />
            </div>

            <span className="admin-newsletter__section-label">
              QUICK ACTION
            </span>

            <h3>
              Create a new newsletter
            </h3>

            <p>
              Use the guided five-step
              newsletter editor to prepare,
              review and deliver your next
              Continental Founders update.
            </p>

            <button
              type="button"
              className="admin-newsletter__button admin-newsletter__button--primary"
              onClick={() => {
                setActiveTab(
                  "create"
                );

                setWizardStep(1);
                setWizardError("");
              }}
            >
              <Plus size={16} />

              Create Newsletter
            </button>
          </section>
        </div>

        <section className="admin-newsletter__card">
          <div className="admin-newsletter__card-header">
            <div>
              <span className="admin-newsletter__section-label">
                RECENT ACTIVITY
              </span>

              <h3>
                Recent Subscribers
              </h3>
            </div>

            {recentSubscribers.length >
              0 && (
              <button
                type="button"
                className="admin-newsletter__text-button"
                onClick={() =>
                  setActiveTab(
                    "subscribers"
                  )
                }
              >
                View All

                <ChevronRight
                  size={15}
                />
              </button>
            )}
          </div>

          {loading ? (
            <div className="admin-newsletter__state admin-newsletter__state--compact">
              <RefreshCcw
                size={24}
                className="admin-newsletter__loading-icon"
              />

              <p>
                Loading subscriber
                activity...
              </p>
            </div>
          ) : error ? (
            <div className="admin-newsletter__state admin-newsletter__state--compact">
              <XCircle size={24} />

              <p>
                {error}
              </p>
            </div>
          ) : recentSubscribers.length ===
            0 ? (
            <div className="admin-newsletter__state admin-newsletter__state--compact">
              <Mail size={24} />

              <p>
                No newsletter subscribers
                have joined yet.
              </p>
            </div>
          ) : (
            <div className="admin-newsletter__recent-list">
              {recentSubscribers.map(
                (subscriber) => (
                  <div
                    key={subscriber.id}
                    className="admin-newsletter__recent-item"
                  >
                    <div className="admin-newsletter__subscriber">
                      <div className="admin-newsletter__subscriber-icon">
                        <Mail
                          size={16}
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
                        className={`admin-newsletter__status ${
                          subscriber.status ===
                          "subscribed"
                            ? "admin-newsletter__status--subscribed"
                            : "admin-newsletter__status--unsubscribed"
                        }`}
                      >
                        {subscriber.status ||
                          "subscribed"}
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
              AUDIENCE
            </span>

            <h3>
              Newsletter Subscribers
            </h3>

            <p>
              Search, filter and manage
              everyone subscribed to
              Continental Founders
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
              size={16}
            />

            Export CSV
          </button>
        </div>

        <div className="admin-newsletter__stats">
          <div className="admin-newsletter__stat">
            <div className="admin-newsletter__stat-icon">
              <Users size={20} />
            </div>

            <div>
              <span>
                Total Subscribers
              </span>

              <strong>
                {statistics.total}
              </strong>
            </div>
          </div>

          <div className="admin-newsletter__stat">
            <div className="admin-newsletter__stat-icon">
              <UserCheck size={20} />
            </div>

            <div>
              <span>
                Active
              </span>

              <strong>
                {statistics.subscribed}
              </strong>
            </div>
          </div>

          <div className="admin-newsletter__stat">
            <div className="admin-newsletter__stat-icon">
              <UserX size={20} />
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

          <div className="admin-newsletter__stat">
            <div className="admin-newsletter__stat-icon">
              <Mail size={20} />
            </div>

            <div>
              <span>
                Website Signups
              </span>

              <strong>
                {statistics.websiteSubscribers}
              </strong>
            </div>
          </div>
        </div>

        <div className="admin-newsletter__toolbar">
          <label className="admin-newsletter__search">
            <Search
              size={16}
              aria-hidden="true"
            />

            <input
              type="search"
              value={search}
              placeholder="Search email or source..."
              aria-label="Search subscribers"
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />
          </label>

          <select
            value={statusFilter}
            aria-label="Filter subscribers by status"
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
          >
            <option value="all">
              All Statuses
            </option>

            <option value="subscribed">
              Active Subscribers
            </option>

            <option value="unsubscribed">
              Unsubscribed
            </option>
          </select>
        </div>

        <div className="admin-newsletter__table-card">
          {loading ? (
            <div className="admin-newsletter__state">
              <RefreshCcw
                size={30}
                className="admin-newsletter__loading-icon"
              />

              <h3>
                Loading subscribers
              </h3>

              <p>
                Fetching the latest
                newsletter audience.
              </p>
            </div>
          ) : error ? (
            <div className="admin-newsletter__state">
              <XCircle
                size={30}
              />

              <h3>
                Unable to load
                subscribers
              </h3>

              <p>
                {error}
              </p>

              <button
                type="button"
                className="admin-newsletter__button admin-newsletter__button--secondary"
                onClick={
                  loadSubscribers
                }
              >
                <RefreshCcw
                  size={16}
                />

                Try Again
              </button>
            </div>
          ) : filteredSubscribers.length ===
            0 ? (
            <div className="admin-newsletter__state">
              <Mail
                size={30}
              />

              <h3>
                No subscribers found
              </h3>

              <p>
                {search ||
                statusFilter !==
                  "all"
                  ? "No subscribers match the current search or filter."
                  : "Newsletter subscribers will appear here when people join the mailing list."}
              </p>
            </div>
          ) : (
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
                    (subscriber) => {
                      const isUpdating =
                        updatingId ===
                        subscriber.id;

                      const isDeleting =
                        deletingId ===
                        subscriber.id;

                      const isBusy =
                        isUpdating ||
                        isDeleting;

                      const isSubscribed =
                        subscriber.status ===
                        "subscribed";

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
                                  size={16}
                                />
                              </div>

                              <span
                                title={
                                  subscriber.email
                                }
                              >
                                {subscriber.email}
                              </span>
                            </div>
                          </td>

                          <td>
                            <span
                              className={`admin-newsletter__status ${
                                isSubscribed
                                  ? "admin-newsletter__status--subscribed"
                                  : "admin-newsletter__status--unsubscribed"
                              }`}
                            >
                              {subscriber.status ||
                                "subscribed"}
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
                              {isSubscribed ? (
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
                                    size={15}
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
                                    size={15}
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
                                  size={15}
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
            onClick={() => {
              setActiveTab(
                "create"
              );

              setWizardStep(1);
              setWizardError("");
            }}
          >
            <Plus
              size={16}
            />

            New Campaign
          </button>
        </div>

        <div className="admin-newsletter__coming-soon">
          <div className="admin-newsletter__coming-icon">
            <Megaphone
              size={30}
            />
          </div>

          <span className="admin-newsletter__section-label">
            CAMPAIGN MANAGER
          </span>

          <h3>
            Campaign management is
            being connected to the
            newsletter backend
          </h3>

          <p>
            The database structure supports
            campaign drafts, scheduled
            campaigns and delivery records.
            Once the frontend campaign API
            integration is connected, those
            campaigns will be managed here.
          </p>

          <button
            type="button"
            className="admin-newsletter__button admin-newsletter__button--primary"
            onClick={() => {
              setActiveTab(
                "create"
              );

              setWizardStep(1);
              setWizardError("");
            }}
          >
            <FileText
              size={16}
            />

            Open Newsletter Editor
          </button>
        </div>
      </div>
    );
  }


  /* ==========================================================
     CREATE NEWSLETTER — WIZARD HEADER
  ========================================================== */

  function renderWizardProgress() {
    return (
      <div className="admin-newsletter__wizard">
        <div className="admin-newsletter__wizard-mobile-head">
          <div>
            <span>
              Step {wizardStep} of{" "}
              {WIZARD_STEPS.length}
            </span>

            <strong>
              {
                WIZARD_STEPS[
                  wizardStep - 1
                ].label
              }
            </strong>
          </div>

          <span>
            {Math.round(
              (wizardStep /
                WIZARD_STEPS.length) *
                100
            )}
            %
          </span>
        </div>

        <div className="admin-newsletter__wizard-mobile-progress">
          <span
            style={{
              width: `${
                (wizardStep /
                  WIZARD_STEPS.length) *
                100
              }%`,
            }}
          />
        </div>

        <div className="admin-newsletter__wizard-steps">
          {WIZARD_STEPS.map(
            (step, index) => {
              const Icon =
                step.icon;

              const isActive =
                wizardStep ===
                step.id;

              const isComplete =
                wizardStep >
                step.id;

              const isAccessible =
                step.id <=
                wizardStep;

              return (
                <React.Fragment
                  key={step.id}
                >
                  <button
                    type="button"
                    className={`admin-newsletter__wizard-step ${
                      isActive
                        ? "admin-newsletter__wizard-step--active"
                        : ""
                    } ${
                      isComplete
                        ? "admin-newsletter__wizard-step--complete"
                        : ""
                    }`}
                    disabled={
                      !isAccessible
                    }
                    onClick={() =>
                      goToWizardStep(
                        step.id
                      )
                    }
                  >
                    <span className="admin-newsletter__wizard-step-icon">
                      {isComplete ? (
                        <CheckCircle2
                          size={17}
                        />
                      ) : (
                        <Icon
                          size={17}
                        />
                      )}
                    </span>

                    <span className="admin-newsletter__wizard-step-copy">
                      <strong>
                        {step.label}
                      </strong>

                      <small>
                        {step.description}
                      </small>
                    </span>
                  </button>

                  {index <
                    WIZARD_STEPS.length -
                      1 && (
                    <span
                      className={`admin-newsletter__wizard-connector ${
                        isComplete
                          ? "admin-newsletter__wizard-connector--complete"
                          : ""
                      }`}
                      aria-hidden="true"
                    />
                  )}
                </React.Fragment>
              );
            }
          )}
        </div>
      </div>
    );
  }


  /* ==========================================================
     STEP 1 — DETAILS
  ========================================================== */

  function renderDetailsStep() {
    return (
      <section className="admin-newsletter__card admin-newsletter__wizard-card">
        <div className="admin-newsletter__form-heading">
          <span>
            01
          </span>

          <div>
            <h3>
              Newsletter Details
            </h3>

            <p>
              Give the campaign an internal
              title and define what subscribers
              will see in their inbox.
            </p>
          </div>
        </div>

        <div className="admin-newsletter__form-grid">
          <label className="admin-newsletter__field admin-newsletter__field--full">
            <span>
              Newsletter Title *
            </span>

            <input
              type="text"
              value={
                campaignForm.title
              }
              placeholder="e.g. September Founder Update"
              autoComplete="off"
              onChange={(event) =>
                updateCampaignField(
                  "title",
                  event.target.value
                )
              }
            />

            <small className="admin-newsletter__field-help">
              This title helps identify the
              campaign inside the CMS.
            </small>
          </label>

          <label className="admin-newsletter__field admin-newsletter__field--full">
            <span>
              Email Subject *
            </span>

            <input
              type="text"
              value={
                campaignForm.subject
              }
              placeholder="The latest from Continental Founders"
              onChange={(event) =>
                updateCampaignField(
                  "subject",
                  event.target.value
                )
              }
            />

            <small className="admin-newsletter__field-help">
              Keep the subject clear and
              relevant to the update.
            </small>
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
              onChange={(event) =>
                updateCampaignField(
                  "previewText",
                  event.target.value
                )
              }
            />

            <small className="admin-newsletter__field-help">
              Some email applications show this
              text next to or below the subject.
            </small>
          </label>
        </div>
      </section>
    );
  }


  /* ==========================================================
     STEP 2 — CONTENT
  ========================================================== */

  function renderContentStep() {
    return (
      <div className="admin-newsletter__wizard-content-stack">
        <section className="admin-newsletter__card admin-newsletter__wizard-card">
          <div className="admin-newsletter__form-heading">
            <span>
              02
            </span>

            <div>
              <h3>
                Content & Design
              </h3>

              <p>
                Write the main newsletter
                message and optionally include a
                featured image.
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
                inputMode="url"
                value={
                  campaignForm.featuredImage
                }
                placeholder="https://..."
                onChange={(event) =>
                  updateCampaignField(
                    "featuredImage",
                    event.target.value
                  )
                }
              />

              <small className="admin-newsletter__field-help">
                Optional. Use a secure HTTPS
                image URL that can be accessed
                publicly.
              </small>
            </label>

            {campaignForm.featuredImage && (
              <div className="admin-newsletter__featured-preview">
                <img
                  src={
                    campaignForm.featuredImage
                  }
                  alt="Newsletter featured preview"
                  onError={(event) => {
                    event.currentTarget.style.display =
                      "none";
                  }}
                />
              </div>
            )}

            <label className="admin-newsletter__field admin-newsletter__field--full">
              <span>
                Newsletter Message *
              </span>

              <textarea
                rows={15}
                value={
                  campaignForm.content
                }
                placeholder="Write your newsletter content here..."
                onChange={(event) =>
                  updateCampaignField(
                    "content",
                    event.target.value
                  )
                }
              />

              <small className="admin-newsletter__field-help">
                Separate paragraphs with a
                blank line for clearer email
                formatting.
              </small>
            </label>
          </div>
        </section>

        <section className="admin-newsletter__card admin-newsletter__wizard-card">
          <div className="admin-newsletter__form-heading">
            <span>
              CTA
            </span>

            <div>
              <h3>
                Call to Action
              </h3>

              <p>
                Optionally direct readers to an
                event, opportunity, article or
                another Continental Founders
                page.
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
                onChange={(event) =>
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
                inputMode="url"
                value={
                  campaignForm.ctaLink
                }
                placeholder="https://..."
                onChange={(event) =>
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
    );
  }


  /* ==========================================================
     STEP 3 — AUDIENCE
  ========================================================== */

  function renderAudienceStep() {
    const audiences = [
      {
        id: "all",
        title:
          "All Active Subscribers",
        description:
          "Send this newsletter to everyone who is currently subscribed.",
        count:
          statistics.subscribed,
        available: true,
      },
      {
        id: "founders",
        title: "Founders",
        description:
          "Target subscribers identified as founders.",
        count: null,
        available: false,
      },
      {
        id: "partners",
        title: "Partners",
        description:
          "Target partners and ecosystem collaborators.",
        count: null,
        available: false,
      },
      {
        id: "universities",
        title: "Universities",
        description:
          "Target university and academic subscribers.",
        count: null,
        available: false,
      },
      {
        id: "custom",
        title: "Custom Segment",
        description:
          "Create a targeted audience from subscriber tags.",
        count: null,
        available: false,
      },
    ];

    return (
      <section className="admin-newsletter__card admin-newsletter__wizard-card">
        <div className="admin-newsletter__form-heading">
          <span>
            03
          </span>

          <div>
            <h3>
              Choose Your Audience
            </h3>

            <p>
              Select who should receive this
              newsletter. Only active
              subscribers are eligible for
              delivery.
            </p>
          </div>
        </div>

        <div className="admin-newsletter__audience-options">
          {audiences.map(
            (audience) => {
              const selected =
                campaignForm.audience ===
                audience.id;

              return (
                <button
                  key={
                    audience.id
                  }
                  type="button"
                  className={`admin-newsletter__audience-option ${
                    selected
                      ? "admin-newsletter__audience-option--selected"
                      : ""
                  } ${
                    !audience.available
                      ? "admin-newsletter__audience-option--disabled"
                      : ""
                  }`}
                  onClick={() =>
                    updateCampaignField(
                      "audience",
                      audience.id
                    )
                  }
                >
                  <span className="admin-newsletter__audience-radio">
                    {selected && (
                      <span />
                    )}
                  </span>

                  <span className="admin-newsletter__audience-option-copy">
                    <strong>
                      {audience.title}
                    </strong>

                    <small>
                      {
                        audience.description
                      }
                    </small>
                  </span>

                  <span className="admin-newsletter__audience-option-count">
                    {audience.count !==
                    null
                      ? audience.count
                      : "Soon"}
                  </span>
                </button>
              );
            }
          )}
        </div>

        <div className="admin-newsletter__recipient-summary">
          <div className="admin-newsletter__recipient-summary-icon">
            <Users size={20} />
          </div>

          <div>
            <span>
              Estimated Recipients
            </span>

            <strong>
              {campaignForm.audience ===
              "all"
                ? statistics.subscribed
                : "—"}
            </strong>

            <small>
              {campaignForm.audience ===
              "all"
                ? "Active subscribers currently eligible for this newsletter."
                : "Segment counts will become available after subscriber segmentation is connected."}
            </small>
          </div>
        </div>
      </section>
    );
  }  /* ==========================================================
     STEP 4 — DELIVERY
  ========================================================== */

  function renderDeliveryStep() {
    return (
      <div className="admin-newsletter__wizard-content-stack">
        <section className="admin-newsletter__card admin-newsletter__wizard-card">
          <div className="admin-newsletter__form-heading">
            <span>
              04
            </span>

            <div>
              <h3>
                Delivery
              </h3>

              <p>
                Choose whether this newsletter
                should be sent immediately or
                scheduled for a future date and
                time.
              </p>
            </div>
          </div>

          <div className="admin-newsletter__delivery-options">
            <button
              type="button"
              className={`admin-newsletter__delivery-option ${
                campaignForm.deliveryMethod ===
                "now"
                  ? "admin-newsletter__delivery-option--selected"
                  : ""
              }`}
              onClick={() => {
                updateCampaignField(
                  "deliveryMethod",
                  "now"
                );

                updateCampaignField(
                  "scheduledAt",
                  ""
                );
              }}
            >
              <span className="admin-newsletter__delivery-option-icon">
                <Send size={21} />
              </span>

              <span className="admin-newsletter__delivery-option-copy">
                <strong>
                  Send Immediately
                </strong>

                <small>
                  Deliver the newsletter to the
                  selected audience as soon as
                  sending is confirmed.
                </small>
              </span>

              <span className="admin-newsletter__selection-indicator">
                {campaignForm.deliveryMethod ===
                  "now" && (
                  <CheckCircle2
                    size={19}
                  />
                )}
              </span>
            </button>

            <button
              type="button"
              className={`admin-newsletter__delivery-option ${
                campaignForm.deliveryMethod ===
                "schedule"
                  ? "admin-newsletter__delivery-option--selected"
                  : ""
              }`}
              onClick={() =>
                updateCampaignField(
                  "deliveryMethod",
                  "schedule"
                )
              }
            >
              <span className="admin-newsletter__delivery-option-icon">
                <CalendarClock
                  size={21}
                />
              </span>

              <span className="admin-newsletter__delivery-option-copy">
                <strong>
                  Schedule Newsletter
                </strong>

                <small>
                  Choose a future date and time
                  for the campaign to be
                  delivered.
                </small>
              </span>

              <span className="admin-newsletter__selection-indicator">
                {campaignForm.deliveryMethod ===
                  "schedule" && (
                  <CheckCircle2
                    size={19}
                  />
                )}
              </span>
            </button>
          </div>

          {campaignForm.deliveryMethod ===
            "schedule" && (
            <div className="admin-newsletter__schedule-box">
              <div className="admin-newsletter__schedule-box-icon">
                <CalendarClock
                  size={20}
                />
              </div>

              <label className="admin-newsletter__field">
                <span>
                  Delivery Date & Time *
                </span>

                <input
                  type="datetime-local"
                  value={
                    campaignForm.scheduledAt
                  }
                  onChange={(event) =>
                    updateCampaignField(
                      "scheduledAt",
                      event.target.value
                    )
                  }
                />

                <small className="admin-newsletter__field-help">
                  Choose a future date and time
                  for delivery.
                </small>
              </label>
            </div>
          )}
        </section>

        <section className="admin-newsletter__card admin-newsletter__wizard-card">
          <div className="admin-newsletter__form-heading">
            <span>
              TEST
            </span>

            <div>
              <h3>
                Send a Test Email
              </h3>

              <p>
                Preview the campaign in a real
                inbox before delivering it to
                subscribers.
              </p>
            </div>
          </div>

          <div className="admin-newsletter__test-delivery">
            <label className="admin-newsletter__field">
              <span>
                Test Email Address
              </span>

              <input
                type="email"
                inputMode="email"
                autoComplete="email"
                value={
                  campaignForm.testEmail
                }
                placeholder="name@example.com"
                onChange={(event) =>
                  updateCampaignField(
                    "testEmail",
                    event.target.value
                  )
                }
              />
            </label>

            <button
              type="button"
              className="admin-newsletter__button admin-newsletter__button--secondary"
              onClick={
                handleSendTest
              }
            >
              <MailCheck
                size={16}
              />

              Send Test
            </button>
          </div>

          <div className="admin-newsletter__editor-notice">
            Test delivery will become active
            when the secure newsletter email
            delivery service is connected to
            the campaign API.
          </div>
        </section>
      </div>
    );
  }


  /* ==========================================================
     STEP 5 — REVIEW
  ========================================================== */

  function renderReviewStep() {
    const recipientCount =
      campaignForm.audience === "all"
        ? statistics.subscribed
        : "—";

    return (
      <div className="admin-newsletter__review-layout">
        <div className="admin-newsletter__review-main">
          <section className="admin-newsletter__card admin-newsletter__wizard-card">
            <div className="admin-newsletter__form-heading">
              <span>
                05
              </span>

              <div>
                <h3>
                  Review Newsletter
                </h3>

                <p>
                  Check the campaign details,
                  audience and delivery settings
                  before completing the
                  newsletter workflow.
                </p>
              </div>
            </div>

            <div className="admin-newsletter__review-sections">
              <div className="admin-newsletter__review-section">
                <div className="admin-newsletter__review-section-head">
                  <div>
                    <FileText
                      size={18}
                    />

                    <strong>
                      Newsletter Details
                    </strong>
                  </div>

                  <button
                    type="button"
                    className="admin-newsletter__text-button"
                    onClick={() =>
                      goToWizardStep(1)
                    }
                  >
                    Edit
                  </button>
                </div>

                <div className="admin-newsletter__review-grid">
                  <div>
                    <span>
                      Campaign Title
                    </span>

                    <strong>
                      {campaignForm.title ||
                        "—"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Email Subject
                    </span>

                    <strong>
                      {campaignForm.subject ||
                        "—"}
                    </strong>
                  </div>

                  <div className="admin-newsletter__review-grid-full">
                    <span>
                      Preview Text
                    </span>

                    <strong>
                      {campaignForm.previewText ||
                        "Not provided"}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="admin-newsletter__review-section">
                <div className="admin-newsletter__review-section-head">
                  <div>
                    <Mail
                      size={18}
                    />

                    <strong>
                      Content
                    </strong>
                  </div>

                  <button
                    type="button"
                    className="admin-newsletter__text-button"
                    onClick={() =>
                      goToWizardStep(2)
                    }
                  >
                    Edit
                  </button>
                </div>

                <div className="admin-newsletter__review-content-preview">
                  {campaignForm.featuredImage && (
                    <img
                      src={
                        campaignForm.featuredImage
                      }
                      alt=""
                    />
                  )}

                  <div>
                    <span>
                      Newsletter Message
                    </span>

                    <p>
                      {campaignForm.content ||
                        "No content added."}
                    </p>
                  </div>
                </div>

                {(campaignForm.ctaText ||
                  campaignForm.ctaLink) && (
                  <div className="admin-newsletter__review-cta">
                    <span>
                      Call to Action
                    </span>

                    <strong>
                      {campaignForm.ctaText ||
                        "—"}
                    </strong>

                    <small>
                      {campaignForm.ctaLink ||
                        "No link"}
                    </small>
                  </div>
                )}
              </div>

              <div className="admin-newsletter__review-section">
                <div className="admin-newsletter__review-section-head">
                  <div>
                    <Users
                      size={18}
                    />

                    <strong>
                      Audience
                    </strong>
                  </div>

                  <button
                    type="button"
                    className="admin-newsletter__text-button"
                    onClick={() =>
                      goToWizardStep(3)
                    }
                  >
                    Edit
                  </button>
                </div>

                <div className="admin-newsletter__review-grid">
                  <div>
                    <span>
                      Audience
                    </span>

                    <strong>
                      {formatAudience(
                        campaignForm.audience
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Estimated Recipients
                    </span>

                    <strong>
                      {recipientCount}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="admin-newsletter__review-section">
                <div className="admin-newsletter__review-section-head">
                  <div>
                    <CalendarClock
                      size={18}
                    />

                    <strong>
                      Delivery
                    </strong>
                  </div>

                  <button
                    type="button"
                    className="admin-newsletter__text-button"
                    onClick={() =>
                      goToWizardStep(4)
                    }
                  >
                    Edit
                  </button>
                </div>

                <div className="admin-newsletter__review-grid">
                  <div>
                    <span>
                      Delivery Method
                    </span>

                    <strong>
                      {campaignForm.deliveryMethod ===
                      "schedule"
                        ? "Scheduled"
                        : "Send Immediately"}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Date & Time
                    </span>

                    <strong>
                      {campaignForm.deliveryMethod ===
                      "schedule"
                        ? formatDateTime(
                            campaignForm.scheduledAt
                          )
                        : "Immediately after confirmation"}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>

        <aside className="admin-newsletter__review-sidebar">
          <section className="admin-newsletter__card admin-newsletter__review-summary">
            <span className="admin-newsletter__section-label">
              READY TO DELIVER
            </span>

            <h3>
              Campaign Summary
            </h3>

            <div className="admin-newsletter__review-summary-list">
              <div>
                <span>
                  Subject
                </span>

                <strong>
                  {campaignForm.subject ||
                    "—"}
                </strong>
              </div>

              <div>
                <span>
                  Audience
                </span>

                <strong>
                  {formatAudience(
                    campaignForm.audience
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Recipients
                </span>

                <strong>
                  {recipientCount}
                </strong>
              </div>

              <div>
                <span>
                  Delivery
                </span>

                <strong>
                  {campaignForm.deliveryMethod ===
                  "schedule"
                    ? "Scheduled"
                    : "Immediately"}
                </strong>
              </div>
            </div>

            <button
              type="button"
              className="admin-newsletter__button admin-newsletter__button--secondary admin-newsletter__button--wide"
              onClick={() =>
                setPreviewOpen(true)
              }
            >
              <Eye
                size={16}
              />

              Preview Email
            </button>

            {campaignForm.deliveryMethod ===
            "schedule" ? (
              <button
                type="button"
                className="admin-newsletter__button admin-newsletter__button--primary admin-newsletter__button--wide"
                onClick={
                  handleSchedule
                }
              >
                <CalendarClock
                  size={16}
                />

                Schedule Newsletter
              </button>
            ) : (
              <button
                type="button"
                className="admin-newsletter__button admin-newsletter__button--primary admin-newsletter__button--wide"
                onClick={
                  handleSendCampaign
                }
              >
                <Send
                  size={16}
                />

                Send Newsletter
              </button>
            )}

            <div className="admin-newsletter__review-warning">
              <MailCheck
                size={16}
              />

              <p>
                Real email delivery remains
                disabled until the newsletter
                delivery provider is connected.
              </p>
            </div>
          </section>
        </aside>
      </div>
    );
  }


  /* ==========================================================
     WIZARD CURRENT STEP
  ========================================================== */

  function renderWizardStep() {
    switch (wizardStep) {
      case 1:
        return renderDetailsStep();

      case 2:
        return renderContentStep();

      case 3:
        return renderAudienceStep();

      case 4:
        return renderDeliveryStep();

      case 5:
        return renderReviewStep();

      default:
        return renderDetailsStep();
    }
  }


  /* ==========================================================
     WIZARD ERROR
  ========================================================== */

  function renderWizardError() {
    if (!wizardError) {
      return null;
    }

    return (
      <div
        className="admin-newsletter__wizard-error"
        role="alert"
      >
        <XCircle
          size={18}
        />

        <span>
          {wizardError}
        </span>

        <button
          type="button"
          aria-label="Dismiss error"
          onClick={() =>
            setWizardError("")
          }
        >
          <X size={15} />
        </button>
      </div>
    );
  }


  /* ==========================================================
     WIZARD SUCCESS / INFO
  ========================================================== */

  function renderDraftMessage() {
    if (!draftMessage) {
      return null;
    }

    return (
      <div
        className="admin-newsletter__wizard-info"
        role="status"
      >
        <CheckCircle2
          size={18}
        />

        <span>
          {draftMessage}
        </span>

        <button
          type="button"
          aria-label="Dismiss message"
          onClick={() =>
            setDraftMessage("")
          }
        >
          <X size={15} />
        </button>
      </div>
    );
  }


  /* ==========================================================
     WIZARD NAVIGATION
  ========================================================== */

  function renderWizardNavigation() {
    const isFirst =
      wizardStep === 1;

    const isLast =
      wizardStep ===
      WIZARD_STEPS.length;

    return (
      <div className="admin-newsletter__wizard-navigation">
        <div className="admin-newsletter__wizard-navigation-left">
          {!isFirst && (
            <button
              type="button"
              className="admin-newsletter__button admin-newsletter__button--secondary admin-newsletter__wizard-nav-button"
              onClick={
                handlePreviousStep
              }
            >
              <ChevronLeft
                size={17}
              />

              Previous
            </button>
          )}
        </div>

        <div className="admin-newsletter__wizard-navigation-center">
          <span>
            Step {wizardStep} of{" "}
            {WIZARD_STEPS.length}
          </span>
        </div>

        <div className="admin-newsletter__wizard-navigation-right">
          <button
            type="button"
            className="admin-newsletter__button admin-newsletter__button--secondary admin-newsletter__wizard-nav-button"
            onClick={
              handleSaveDraft
            }
          >
            <FileText
              size={16}
            />

            Save Draft
          </button>

          {!isLast && (
            <button
              type="button"
              className="admin-newsletter__button admin-newsletter__button--primary admin-newsletter__wizard-nav-button"
              onClick={
                handleNextStep
              }
            >
              Next

              <ChevronRight
                size={17}
              />
            </button>
          )}

          {isLast &&
            campaignForm.deliveryMethod ===
              "now" && (
              <button
                type="button"
                className="admin-newsletter__button admin-newsletter__button--primary admin-newsletter__wizard-nav-button"
                onClick={
                  handleSendCampaign
                }
              >
                <Send
                  size={16}
                />

                Send Newsletter
              </button>
            )}

          {isLast &&
            campaignForm.deliveryMethod ===
              "schedule" && (
              <button
                type="button"
                className="admin-newsletter__button admin-newsletter__button--primary admin-newsletter__wizard-nav-button"
                onClick={
                  handleSchedule
                }
              >
                <CalendarClock
                  size={16}
                />

                Schedule
              </button>
            )}
        </div>
      </div>
    );
  }


  /* ==========================================================
     CREATE NEWSLETTER
  ========================================================== */

  function renderCreateNewsletter() {
    const currentStep =
      WIZARD_STEPS.find(
        (step) =>
          step.id === wizardStep
      ) || WIZARD_STEPS[0];

    return (
      <div className="admin-newsletter__panel admin-newsletter__create-panel">
        <div className="admin-newsletter__section-heading admin-newsletter__create-heading">
          <div>
            <span className="admin-newsletter__section-label">
              CREATE CAMPAIGN
            </span>

            <h3>
              Create Newsletter
            </h3>

            <p>
              Build your newsletter using the
              guided workflow, then review the
              complete campaign before
              delivery.
            </p>
          </div>

          <div className="admin-newsletter__create-heading-actions">
            <button
              type="button"
              className="admin-newsletter__button admin-newsletter__button--secondary"
              onClick={() =>
                setPreviewOpen(true)
              }
            >
              <Eye
                size={16}
              />

              Preview
            </button>

            <button
              type="button"
              className="admin-newsletter__button admin-newsletter__button--secondary"
              onClick={
                resetCampaign
              }
            >
              <RefreshCcw
                size={16}
              />

              Reset
            </button>
          </div>
        </div>

        {renderWizardProgress()}

        <div className="admin-newsletter__current-step">
          <div className="admin-newsletter__current-step-copy">
            <span>
              STEP {wizardStep}
            </span>

            <strong>
              {currentStep.label}
            </strong>

            <small>
              {currentStep.description}
            </small>
          </div>
        </div>

        {renderWizardError()}

        {renderDraftMessage()}

        <div className="admin-newsletter__wizard-body">
          {renderWizardStep()}
        </div>

        {renderWizardNavigation()}
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
              Review audience growth and,
              after delivery tracking is
              connected, campaign engagement.
            </p>
          </div>
        </div>

        <div className="admin-newsletter__stats">
          <div className="admin-newsletter__stat">
            <div className="admin-newsletter__stat-icon">
              <Users
                size={20}
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
                size={20}
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
                size={20}
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
                size={20}
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

              <div>
                <span>
                  Website signups
                </span>

                <strong>
                  {
                    statistics.websiteSubscribers
                  }
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
                statistics will appear here
                once campaign sending and
                provider event tracking are
                connected.
              </p>
            </div>
          </section>
        </div>
      </div>
    );
  }


  /* ==========================================================
     EMAIL PREVIEW
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
          setPreviewOpen(false)
        }
      >
        <div
          className="admin-newsletter__preview-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Newsletter preview"
          onMouseDown={(event) =>
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
                setPreviewOpen(false)
              }
              aria-label="Close preview"
            >
              <X
                size={19}
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
                  {
                    campaignForm.previewText
                  }
                </p>
              )}

              <div className="admin-newsletter__email-content">
                {campaignForm.content ? (
                  campaignForm.content
                    .split(/\n{2,}/)
                    .map(
                      (
                        paragraph,
                        index
                      ) => (
                        <p
                          key={`${index}-${paragraph.slice(
                            0,
                            20
                          )}`}
                        >
                          {
                            paragraph
                          }
                        </p>
                      )
                    )
                ) : (
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
                    {
                      campaignForm.ctaText
                    }
                  </a>
                )}
            </div>

            <footer className="admin-newsletter__email-footer">
              <strong>
                Continental Founders
              </strong>

              <p>
                You are receiving this
                message because you
                subscribed to Continental
                Founders updates.
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
     ACTIVE TAB
  ========================================================== */

  function renderActiveTab() {
    switch (activeTab) {
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