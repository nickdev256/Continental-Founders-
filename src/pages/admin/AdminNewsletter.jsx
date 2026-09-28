import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
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
  FileImage,
  FileText,
  ImagePlus,
  LayoutDashboard,
  Loader2,
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
  Upload,
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
  uploadNewsletterImage,
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
    description: "Campaign information",
  },
  {
    id: 2,
    label: "Content",
    description: "Message and design",
  },
  {
    id: 3,
    label: "Audience",
    description: "Choose recipients",
  },
  {
    id: 4,
    label: "Delivery",
    description: "Send or schedule",
  },
  {
    id: 5,
    label: "Review",
    description: "Final confirmation",
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


const MAX_FEATURED_IMAGE_SIZE = 5 * 1024 * 1024;

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];


/* ============================================================
   HELPERS
============================================================ */

function safeNumber(value) {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
}


function formatNumber(value) {
  return safeNumber(value).toLocaleString();
}


function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
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


function formatDateTime(value) {
  if (!value) {
    return "Not scheduled";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not scheduled";
  }

  return new Intl.DateTimeFormat(
    "en",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(date);
}


function formatAudience(value) {
  switch (value) {
    case "founders":
      return "Founders";

    case "partners":
      return "Partners";

    case "universities":
      return "Universities";

    case "all":
    default:
      return "All Active Subscribers";
  }
}


function normalizeSubscribersResponse(
  response
) {
  if (Array.isArray(response)) {
    return response;
  }

  if (
    Array.isArray(
      response?.subscribers
    )
  ) {
    return response.subscribers;
  }

  if (
    Array.isArray(
      response?.data
    )
  ) {
    return response.data;
  }

  if (
    Array.isArray(
      response?.data?.subscribers
    )
  ) {
    return response.data.subscribers;
  }

  return [];
}


function getSubscriberStatus(
  subscriber
) {
  if (
    subscriber?.status
  ) {
    return String(
      subscriber.status
    ).toLowerCase();
  }

  if (
    subscriber?.is_active === false
  ) {
    return "unsubscribed";
  }

  if (
    subscriber?.subscribed === false
  ) {
    return "unsubscribed";
  }

  return "subscribed";
}


function isActiveSubscriber(
  subscriber
) {
  return (
    getSubscriberStatus(
      subscriber
    ) === "subscribed"
  );
}


function getSubscriberName(
  subscriber
) {
  return (
    subscriber?.name ||
    subscriber?.full_name ||
    subscriber?.fullName ||
    ""
  );
}


function getSubscriberEmail(
  subscriber
) {
  return (
    subscriber?.email ||
    ""
  );
}


function getSubscriberCreatedAt(
  subscriber
) {
  return (
    subscriber?.created_at ||
    subscriber?.createdAt ||
    subscriber?.subscribed_at ||
    subscriber?.subscribedAt ||
    null
  );
}


function getSubscriberId(
  subscriber
) {
  return (
    subscriber?.id ||
    subscriber?._id ||
    subscriber?.subscriber_id ||
    subscriber?.email
  );
}


function validateEmail(
  value
) {
  if (!value) {
    return false;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    String(value).trim()
  );
}


/* ============================================================
   COMPONENT
============================================================ */

export default function AdminNewsletter() {
  /* ==========================================================
     GENERAL STATE
  ========================================================== */

  const [
    activeTab,
    setActiveTab,
  ] = useState("overview");


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
    successMessage,
    setSuccessMessage,
  ] = useState("");


  /* ==========================================================
     SUBSCRIBERS STATE
  ========================================================== */

  const [
    subscribers,
    setSubscribers,
  ] = useState([]);


  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");


  const [
    statusFilter,
    setStatusFilter,
  ] = useState("all");


  const [
    subscriberActionId,
    setSubscriberActionId,
  ] = useState(null);


  /* ==========================================================
     CAMPAIGN STATE
  ========================================================== */

  const [
    campaigns,
    setCampaigns,
  ] = useState([]);


  const [
    campaignForm,
    setCampaignForm,
  ] = useState(
    EMPTY_CAMPAIGN
  );


  const [
    wizardStep,
    setWizardStep,
  ] = useState(1);


  const [
    wizardError,
    setWizardError,
  ] = useState("");


  const [
    previewOpen,
    setPreviewOpen,
  ] = useState(false);


  const [
    savingDraft,
    setSavingDraft,
  ] = useState(false);


  const [
    sendingTest,
    setSendingTest,
  ] = useState(false);


  const [
    scheduling,
    setScheduling,
  ] = useState(false);


  const [
    sendingCampaign,
    setSendingCampaign,
  ] = useState(false);


  /* ==========================================================
     FEATURED IMAGE STATE
  ========================================================== */

  const imageInputRef =
    useRef(null);


  const [
    featuredImageFile,
    setFeaturedImageFile,
  ] = useState(null);


  const [
    featuredImagePreview,
    setFeaturedImagePreview,
  ] = useState("");


  const [
    imageUploadError,
    setImageUploadError,
  ] = useState("");


  const [
    imageDragActive,
    setImageDragActive,
  ] = useState(false);


  const [
    processingImage,
    setProcessingImage,
  ] = useState(false);


  /* ==========================================================
     LOAD SUBSCRIBERS
  ========================================================== */

  const loadSubscribers =
    useCallback(
      async (
        showRefreshState = false
      ) => {
        try {
          if (
            showRefreshState
          ) {
            setRefreshing(true);
          } else {
            setLoading(true);
          }

          setError("");

          const response =
            await getNewsletterSubscribers();

          const list =
            normalizeSubscribersResponse(
              response
            );

          setSubscribers(
            list
          );
        } catch (requestError) {
          console.error(
            "Failed to load newsletter subscribers:",
            requestError
          );

          setError(
            requestError?.message ||
              "Unable to load newsletter subscribers."
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      []
    );


  useEffect(() => {
    loadSubscribers();
  }, [loadSubscribers]);


  /* ==========================================================
     CLEAN UP LOCAL IMAGE PREVIEW
  ========================================================== */

  useEffect(() => {
    return () => {
      if (
        featuredImagePreview &&
        featuredImagePreview.startsWith(
          "blob:"
        )
      ) {
        URL.revokeObjectURL(
          featuredImagePreview
        );
      }
    };
  }, [featuredImagePreview]);


  /* ==========================================================
     STATISTICS
  ========================================================== */

  const statistics =
    useMemo(() => {
      const total =
        subscribers.length;

      const subscribed =
        subscribers.filter(
          (subscriber) =>
            isActiveSubscriber(
              subscriber
            )
        ).length;

      const unsubscribed =
        total - subscribed;

      const activeRate =
        total > 0
          ? Math.round(
              (subscribed /
                total) *
                100
            )
          : 0;

      return {
        total,
        subscribed,
        unsubscribed,
        activeRate,
      };
    }, [subscribers]);


  /* ==========================================================
     RECENT SUBSCRIBERS
  ========================================================== */

  const recentSubscribers =
    useMemo(() => {
      return [
        ...subscribers,
      ]
        .sort(
          (
            first,
            second
          ) => {
            const firstDate =
              new Date(
                getSubscriberCreatedAt(
                  first
                ) || 0
              ).getTime();

            const secondDate =
              new Date(
                getSubscriberCreatedAt(
                  second
                ) || 0
              ).getTime();

            return (
              secondDate -
              firstDate
            );
          }
        )
        .slice(0, 5);
    }, [subscribers]);


  /* ==========================================================
     FILTERED SUBSCRIBERS
  ========================================================== */

  const filteredSubscribers =
    useMemo(() => {
      const query =
        searchTerm
          .trim()
          .toLowerCase();

      return subscribers.filter(
        (subscriber) => {
          const status =
            getSubscriberStatus(
              subscriber
            );

          const matchesStatus =
            statusFilter ===
              "all" ||
            status ===
              statusFilter;

          if (
            !matchesStatus
          ) {
            return false;
          }

          if (!query) {
            return true;
          }

          const name =
            getSubscriberName(
              subscriber
            ).toLowerCase();

          const email =
            getSubscriberEmail(
              subscriber
            ).toLowerCase();

          return (
            name.includes(
              query
            ) ||
            email.includes(
              query
            )
          );
        }
      );
    }, [
      subscribers,
      searchTerm,
      statusFilter,
    ]);


  /* ==========================================================
     CAMPAIGN FIELD UPDATE
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

    if (wizardError) {
      setWizardError("");
    }

    if (successMessage) {
      setSuccessMessage("");
    }
  }


  /* ==========================================================
     RESET FEATURED IMAGE
  ========================================================== */

  function clearFeaturedImage() {
    if (
      featuredImagePreview &&
      featuredImagePreview.startsWith(
        "blob:"
      )
    ) {
      URL.revokeObjectURL(
        featuredImagePreview
      );
    }

    setFeaturedImageFile(
      null
    );

    setFeaturedImagePreview(
      ""
    );

    setImageUploadError(
      ""
    );

    updateCampaignField(
      "featuredImage",
      ""
    );

    if (
      imageInputRef.current
    ) {
      imageInputRef.current.value =
        "";
    }
  }


  /* ==========================================================
     PROCESS FEATURED IMAGE
  ========================================================== */

  async function processFeaturedImage(
    file
  ) {
    if (!file) {
      return;
    }

    setImageUploadError(
      ""
    );

    setWizardError(
      ""
    );

    if (
      !ACCEPTED_IMAGE_TYPES.includes(
        file.type
      )
    ) {
      setImageUploadError(
        "Please choose a JPG, PNG or WEBP image."
      );

      return;
    }

    if (
      file.size >
      MAX_FEATURED_IMAGE_SIZE
    ) {
      setImageUploadError(
        "The featured image must be 5 MB or smaller."
      );

      return;
    }

    setProcessingImage(
      true
    );

    try {
      const response =
        await uploadNewsletterImage(
          file
        );

      const imageUrl =
        response?.url ||
        response?.publicUrl ||
        response?.imageUrl ||
        response?.image?.url ||
        response?.image?.publicUrl ||
        "";

      if (!imageUrl) {
        throw new Error(
          "The image was uploaded but the server did not return its URL."
        );
      }

      if (
        featuredImagePreview &&
        featuredImagePreview.startsWith(
          "blob:"
        )
      ) {
        URL.revokeObjectURL(
          featuredImagePreview
        );
      }

      setFeaturedImageFile(
        file
      );

      setFeaturedImagePreview(
        imageUrl
      );

      setCampaignForm(
        (current) => ({
          ...current,
          featuredImage:
            imageUrl,
        })
      );

      setSuccessMessage(
        "Featured image uploaded successfully."
      );
    } catch (imageError) {
      console.error(
        "Failed to upload featured image:",
        imageError
      );

      setImageUploadError(
        imageError?.message ||
          "Unable to upload the image. Please try again."
      );

      if (
        imageInputRef.current
      ) {
        imageInputRef.current.value =
          "";
      }
    } finally {
      setProcessingImage(
        false
      );
    }
  }


  /* ==========================================================
     IMAGE INPUT CHANGE
  ========================================================== */

  async function handleImageInputChange(
    event
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    await processFeaturedImage(
      file
    );
  }


  /* ==========================================================
     IMAGE DROP
  ========================================================== */

  function handleImageDragOver(
    event
  ) {
    event.preventDefault();
    event.stopPropagation();

    setImageDragActive(
      true
    );
  }


  function handleImageDragLeave(
    event
  ) {
    event.preventDefault();
    event.stopPropagation();

    setImageDragActive(
      false
    );
  }


  async function handleImageDrop(
    event
  ) {
    event.preventDefault();
    event.stopPropagation();

    setImageDragActive(
      false
    );

    const file =
      event.dataTransfer
        ?.files?.[0];

    if (!file) {
      return;
    }

    await processFeaturedImage(
      file
    );
  }


  /* ==========================================================
     OPEN IMAGE PICKER
  ========================================================== */

  function openImagePicker() {
    imageInputRef.current?.click();
  }


  /* ==========================================================
     RESET CAMPAIGN
  ========================================================== */

  function resetCampaign() {
    if (
      featuredImagePreview &&
      featuredImagePreview.startsWith(
        "blob:"
      )
    ) {
      URL.revokeObjectURL(
        featuredImagePreview
      );
    }

    setCampaignForm({
      ...EMPTY_CAMPAIGN,
    });

    setWizardStep(1);

    setWizardError("");

    setPreviewOpen(false);

    setFeaturedImageFile(
      null
    );

    setFeaturedImagePreview(
      ""
    );

    setImageUploadError(
      ""
    );

    setImageDragActive(
      false
    );

    if (
      imageInputRef.current
    ) {
      imageInputRef.current.value =
        "";
    }
  }


  /* ==========================================================
     VALIDATE WIZARD STEP
  ========================================================== */

  function validateWizardStep(
    step = wizardStep
  ) {
    if (step === 1) {
      if (
        !campaignForm.title.trim()
      ) {
        return "Enter a newsletter title before continuing.";
      }

      if (
        !campaignForm.subject.trim()
      ) {
        return "Enter an email subject before continuing.";
      }
    }


    if (step === 2) {
      if (
        !campaignForm.content.trim()
      ) {
        return "Write the newsletter message before continuing.";
      }

      if (
        campaignForm.ctaText.trim() &&
        !campaignForm.ctaLink.trim()
      ) {
        return "Add the link for your call-to-action button.";
      }

      if (
        campaignForm.ctaLink.trim() &&
        !campaignForm.ctaText.trim()
      ) {
        return "Add button text for your call-to-action link.";
      }

      if (
        campaignForm.ctaLink.trim()
      ) {
        try {
          const url =
            new URL(
              campaignForm.ctaLink.trim()
            );

          if (
            url.protocol !==
              "https:" &&
            url.protocol !==
              "http:"
          ) {
            return "Enter a valid website link for the call-to-action.";
          }
        } catch {
          return "Enter a valid website link for the call-to-action.";
        }
      }
    }


    if (step === 3) {
      if (
        !campaignForm.audience
      ) {
        return "Choose the audience for this newsletter.";
      }
    }


    if (step === 4) {
      if (
        campaignForm.deliveryMethod ===
          "schedule" &&
        !campaignForm.scheduledAt
      ) {
        return "Choose a date and time for the scheduled newsletter.";
      }
    }


    return "";
  }


  /* ==========================================================
     GO TO WIZARD STEP
  ========================================================== */

  function goToWizardStep(
    step
  ) {
    const nextStep =
      Math.min(
        Math.max(
          Number(step) || 1,
          1
        ),
        WIZARD_STEPS.length
      );

    if (
      nextStep >
      wizardStep
    ) {
      for (
        let stepNumber = 1;
        stepNumber <
        nextStep;
        stepNumber += 1
      ) {
        const validationMessage =
          validateWizardStep(
            stepNumber
          );

        if (
          validationMessage
        ) {
          setWizardStep(
            stepNumber
          );

          setWizardError(
            validationMessage
          );

          return;
        }
      }
    }

    setWizardError("");

    setWizardStep(
      nextStep
    );
  }


  /* ==========================================================
     PREVIOUS STEP
  ========================================================== */

  function handlePreviousStep() {
    setWizardError("");

    setWizardStep(
      (current) =>
        Math.max(
          1,
          current - 1
        )
    );
  }


  /* ==========================================================
     NEXT STEP
  ========================================================== */

  function handleNextStep() {
    const validationMessage =
      validateWizardStep();

    if (
      validationMessage
    ) {
      setWizardError(
        validationMessage
      );

      return;
    }

    setWizardError("");

    setWizardStep(
      (current) =>
        Math.min(
          WIZARD_STEPS.length,
          current + 1
        )
    );
  }


  /* ==========================================================
     UPDATE SUBSCRIBER STATUS
  ========================================================== */

  async function handleSubscriberStatus(
    subscriber,
    nextStatus
  ) {
    const subscriberId =
      getSubscriberId(
        subscriber
      );

    if (!subscriberId) {
      setError(
        "This subscriber does not have a valid ID."
      );

      return;
    }

    try {
      setSubscriberActionId(
        subscriberId
      );

      setError("");
      setSuccessMessage("");

      const payload = {
        status:
          nextStatus,
      };

      await updateNewsletterSubscriber(
        subscriberId,
        payload
      );

      setSubscribers(
        (current) =>
          current.map(
            (item) => {
              if (
                getSubscriberId(
                  item
                ) !==
                subscriberId
              ) {
                return item;
              }

              return {
                ...item,
                status:
                  nextStatus,
                is_active:
                  nextStatus ===
                  "subscribed",
                subscribed:
                  nextStatus ===
                  "subscribed",
              };
            }
          )
      );

      setSuccessMessage(
        nextStatus ===
          "subscribed"
          ? "Subscriber activated successfully."
          : "Subscriber unsubscribed successfully."
      );
    } catch (requestError) {
      console.error(
        "Failed to update subscriber:",
        requestError
      );

      setError(
        requestError?.message ||
          "Unable to update the subscriber."
      );
    } finally {
      setSubscriberActionId(
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
    const subscriberId =
      getSubscriberId(
        subscriber
      );

    if (!subscriberId) {
      setError(
        "This subscriber does not have a valid ID."
      );

      return;
    }

    const email =
      getSubscriberEmail(
        subscriber
      );

    const confirmed =
      window.confirm(
        `Delete ${
          email ||
          "this subscriber"
        } permanently?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setSubscriberActionId(
        subscriberId
      );

      setError("");
      setSuccessMessage("");

      await deleteNewsletterSubscriber(
        subscriberId
      );

      setSubscribers(
        (current) =>
          current.filter(
            (item) =>
              getSubscriberId(
                item
              ) !==
              subscriberId
          )
      );

      setSuccessMessage(
        "Subscriber deleted successfully."
      );
    } catch (requestError) {
      console.error(
        "Failed to delete subscriber:",
        requestError
      );

      setError(
        requestError?.message ||
          "Unable to delete the subscriber."
      );
    } finally {
      setSubscriberActionId(
        null
      );
    }
  }


  /* ==========================================================
     EXPORT SUBSCRIBERS
  ========================================================== */

  function handleExportSubscribers() {
    if (
      subscribers.length === 0
    ) {
      setError(
        "There are no subscribers to export."
      );

      return;
    }

    const rows = [
      [
        "Name",
        "Email",
        "Status",
        "Subscribed Date",
      ],
      ...subscribers.map(
        (subscriber) => [
          getSubscriberName(
            subscriber
          ),
          getSubscriberEmail(
            subscriber
          ),
          getSubscriberStatus(
            subscriber
          ),
          formatDate(
            getSubscriberCreatedAt(
              subscriber
            )
          ),
        ]
      ),
    ];


    const csv = rows
      .map((row) =>
        row
          .map((value) => {
            const escaped =
              String(
                value ?? ""
              ).replace(
                /"/g,
                '""'
              );

            return `"${escaped}"`;
          })
          .join(",")
      )
      .join("\n");


    const blob =
      new Blob(
        [csv],
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

    link.href = url;

    link.download =
      `continental-founders-newsletter-subscribers-${new Date()
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

    setSuccessMessage(
      "Subscriber list exported successfully."
    );
  }


  /* ==========================================================
     SAVE DRAFT
  ========================================================== */

  async function handleSaveDraft() {
    setSavingDraft(true);

    setWizardError("");

    try {
      /*
       * Campaign persistence will be connected
       * to the newsletter campaign API.
       *
       * We deliberately do not pretend that the
       * campaign has been stored remotely yet.
       */

      await Promise.resolve();

      setSuccessMessage(
        "The newsletter is ready to be connected to campaign draft storage."
      );
    } catch (requestError) {
      console.error(
        "Failed to save newsletter draft:",
        requestError
      );

      setWizardError(
        requestError?.message ||
          "Unable to save this newsletter draft."
      );
    } finally {
      setSavingDraft(false);
    }
  }


  /* ==========================================================
     SEND TEST
  ========================================================== */

  async function handleSendTest() {
    const email =
      campaignForm.testEmail.trim();

    if (
      !validateEmail(
        email
      )
    ) {
      setWizardError(
        "Enter a valid test email address."
      );

      return;
    }

    setSendingTest(true);

    setWizardError("");

    try {
      /*
       * Real email delivery is intentionally
       * not simulated here.
       *
       * This action should call the backend
       * test-delivery endpoint once the email
       * provider is configured.
       */

      await Promise.resolve();

      setSuccessMessage(
        `Test delivery is ready to be connected for ${email}.`
      );
    } catch (requestError) {
      console.error(
        "Failed to send test newsletter:",
        requestError
      );

      setWizardError(
        requestError?.message ||
          "Unable to send the test newsletter."
      );
    } finally {
      setSendingTest(false);
    }
  }


  /* ==========================================================
     SCHEDULE NEWSLETTER
  ========================================================== */

  async function handleSchedule() {
    const validationMessage =
      validateWizardStep(4);

    if (
      validationMessage
    ) {
      setWizardError(
        validationMessage
      );

      setWizardStep(4);

      return;
    }

    setScheduling(true);

    setWizardError("");

    try {
      await Promise.resolve();

      setSuccessMessage(
        "Newsletter scheduling is ready to be connected to the campaign API."
      );
    } catch (requestError) {
      console.error(
        "Failed to schedule newsletter:",
        requestError
      );

      setWizardError(
        requestError?.message ||
          "Unable to schedule this newsletter."
      );
    } finally {
      setScheduling(false);
    }
  }


  /* ==========================================================
     SEND CAMPAIGN
  ========================================================== */

  async function handleSendCampaign() {
    for (
      let step = 1;
      step <= 4;
      step += 1
    ) {
      const validationMessage =
        validateWizardStep(
          step
        );

      if (
        validationMessage
      ) {
        setWizardStep(
          step
        );

        setWizardError(
          validationMessage
        );

        return;
      }
    }


    setSendingCampaign(
      true
    );

    setWizardError("");

    try {
      /*
       * The backend currently needs a configured
       * newsletter delivery provider before a
       * real campaign can be broadcast.
       *
       * Do not mark subscribers as emailed until
       * the backend confirms delivery.
       */

      await Promise.resolve();

      setSuccessMessage(
        "The newsletter is complete. Connect the campaign delivery endpoint before broadcasting it to subscribers."
      );
    } catch (requestError) {
      console.error(
        "Failed to send newsletter:",
        requestError
      );

      setWizardError(
        requestError?.message ||
          "Unable to send this newsletter."
      );
    } finally {
      setSendingCampaign(
        false
      );
    }
  }


  /* ==========================================================
     HEADER
  ========================================================== */

  function renderHeader() {
    return (
      <header className="admin-newsletter__header">
        <div>
          <span className="admin-newsletter__eyebrow">
            CONTINENTAL FOUNDERS
          </span>

          <h1>
            Newsletter & Communications
          </h1>

          <p>
            Manage subscribers, prepare
            newsletters and monitor
            communication activity across
            the Continental Founders
            ecosystem.
          </p>
        </div>

        <div className="admin-newsletter__header-actions">
          <button
            type="button"
            className="admin-newsletter__button admin-newsletter__button--secondary"
            onClick={() =>
              loadSubscribers(
                true
              )
            }
            disabled={
              refreshing
            }
          >
            <RefreshCcw
              size={16}
              className={
                refreshing
                  ? "admin-newsletter__spin"
                  : ""
              }
            />

            <span>
              {refreshing
                ? "Refreshing..."
                : "Refresh"}
            </span>
          </button>

          <button
            type="button"
            className="admin-newsletter__button admin-newsletter__button--primary"
            onClick={() => {
              setActiveTab(
                "create"
              );

              setWizardStep(
                1
              );

              setWizardError(
                ""
              );
            }}
          >
            <Plus
              size={16}
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
     TABS
  ========================================================== */

  function renderTabs() {
    return (
      <nav
        className="admin-newsletter__tabs"
        aria-label="Newsletter management"
      >
        {TABS.map(
          (tab) => {
            const Icon =
              tab.icon;

            const active =
              activeTab ===
              tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                className={`admin-newsletter__tab ${
                  active
                    ? "admin-newsletter__tab--active"
                    : ""
                }`}
                onClick={() => {
                  setActiveTab(
                    tab.id
                  );

                  setError(
                    ""
                  );

                  setSuccessMessage(
                    ""
                  );
                }}
              >
                <Icon
                  size={16}
                />

                <span>
                  {tab.label}
                </span>
              </button>
            );
          }
        )}
      </nav>
    );
  }


  /* ==========================================================
     MESSAGES
  ========================================================== */

  function renderMessages() {
    return (
      <>
        {error && (
          <div
            className="admin-newsletter__message admin-newsletter__message--error"
            role="alert"
          >
            <XCircle
              size={18}
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
                size={16}
              />
            </button>
          </div>
        )}

        {successMessage && (
          <div
            className="admin-newsletter__message admin-newsletter__message--success"
            role="status"
          >
            <CheckCircle2
              size={18}
            />

            <span>
              {successMessage}
            </span>

            <button
              type="button"
              onClick={() =>
                setSuccessMessage(
                  ""
                )
              }
              aria-label="Dismiss message"
            >
              <X
                size={16}
              />
            </button>
          </div>
        )}
      </>
    );
  }  /* ==========================================================
     OVERVIEW
  ========================================================== */

  function renderOverview() {
    const overviewCards = [
      {
        label:
          "Total Subscribers",
        value:
          statistics.total,
        helper:
          "All newsletter contacts",
        icon: Users,
      },
      {
        label:
          "Active Subscribers",
        value:
          statistics.subscribed,
        helper:
          `${statistics.activeRate}% of total contacts`,
        icon: UserCheck,
      },
      {
        label:
          "Unsubscribed",
        value:
          statistics.unsubscribed,
        helper:
          "Inactive newsletter contacts",
        icon: UserX,
      },
      {
        label:
          "Campaigns",
        value:
          campaigns.length,
        helper:
          "Newsletter campaigns",
        icon: Megaphone,
      },
    ];

    return (
      <div className="admin-newsletter__overview">
        <section className="admin-newsletter__stats-grid">
          {overviewCards.map(
            (card) => {
              const Icon =
                card.icon;

              return (
                <article
                  key={
                    card.label
                  }
                  className="admin-newsletter__stat-card"
                >
                  <div className="admin-newsletter__stat-icon">
                    <Icon
                      size={19}
                    />
                  </div>

                  <div className="admin-newsletter__stat-copy">
                    <span>
                      {card.label}
                    </span>

                    <strong>
                      {formatNumber(
                        card.value
                      )}
                    </strong>

                    <small>
                      {card.helper}
                    </small>
                  </div>
                </article>
              );
            }
          )}
        </section>


        <div className="admin-newsletter__overview-grid">
          <section className="admin-newsletter__panel">
            <div className="admin-newsletter__section-head">
              <div>
                <span className="admin-newsletter__section-label">
                  SUBSCRIBERS
                </span>

                <h2>
                  Recent Subscribers
                </h2>

                <p>
                  The latest contacts
                  joining Continental
                  Founders communications.
                </p>
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
              </button>
            </div>


            {loading ? (
              <div className="admin-newsletter__state">
                <Loader2
                  size={22}
                  className="admin-newsletter__spin"
                />

                <strong>
                  Loading subscribers...
                </strong>
              </div>
            ) : recentSubscribers.length ===
              0 ? (
              <div className="admin-newsletter__state">
                <Users
                  size={24}
                />

                <strong>
                  No subscribers yet
                </strong>

                <p>
                  New subscribers will
                  appear here when people
                  join your newsletter.
                </p>
              </div>
            ) : (
              <div className="admin-newsletter__recent-list">
                {recentSubscribers.map(
                  (
                    subscriber
                  ) => {
                    const status =
                      getSubscriberStatus(
                        subscriber
                      );

                    return (
                      <div
                        key={
                          getSubscriberId(
                            subscriber
                          )
                        }
                        className="admin-newsletter__recent-item"
                      >
                        <div className="admin-newsletter__subscriber-avatar">
                          {(
                            getSubscriberName(
                              subscriber
                            ) ||
                            getSubscriberEmail(
                              subscriber
                            ) ||
                            "S"
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className="admin-newsletter__recent-copy">
                          <strong>
                            {getSubscriberName(
                              subscriber
                            ) ||
                              "Subscriber"}
                          </strong>

                          <span>
                            {getSubscriberEmail(
                              subscriber
                            )}
                          </span>
                        </div>

                        <div className="admin-newsletter__recent-meta">
                          <span
                            className={`admin-newsletter__status admin-newsletter__status--${status}`}
                          >
                            {status ===
                            "subscribed"
                              ? "Subscribed"
                              : "Unsubscribed"}
                          </span>

                          <small>
                            {formatDate(
                              getSubscriberCreatedAt(
                                subscriber
                              )
                            )}
                          </small>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            )}
          </section>


          <section className="admin-newsletter__panel admin-newsletter__quick-panel">
            <div className="admin-newsletter__section-head">
              <div>
                <span className="admin-newsletter__section-label">
                  COMMUNICATIONS
                </span>

                <h2>
                  Quick Actions
                </h2>

                <p>
                  Prepare and manage
                  newsletter communication.
                </p>
              </div>
            </div>


            <div className="admin-newsletter__quick-actions">
              <button
                type="button"
                className="admin-newsletter__quick-action"
                onClick={() => {
                  resetCampaign();

                  setActiveTab(
                    "create"
                  );
                }}
              >
                <span className="admin-newsletter__quick-action-icon">
                  <Plus
                    size={20}
                  />
                </span>

                <span>
                  <strong>
                    Create Newsletter
                  </strong>

                  <small>
                    Start a new
                    communication
                  </small>
                </span>

                <ChevronRight
                  size={17}
                />
              </button>


              <button
                type="button"
                className="admin-newsletter__quick-action"
                onClick={() =>
                  setActiveTab(
                    "subscribers"
                  )
                }
              >
                <span className="admin-newsletter__quick-action-icon">
                  <Users
                    size={20}
                  />
                </span>

                <span>
                  <strong>
                    Manage Subscribers
                  </strong>

                  <small>
                    Review active and
                    inactive contacts
                  </small>
                </span>

                <ChevronRight
                  size={17}
                />
              </button>


              <button
                type="button"
                className="admin-newsletter__quick-action"
                onClick={
                  handleExportSubscribers
                }
              >
                <span className="admin-newsletter__quick-action-icon">
                  <Download
                    size={20}
                  />
                </span>

                <span>
                  <strong>
                    Export Subscribers
                  </strong>

                  <small>
                    Download the contact
                    list as CSV
                  </small>
                </span>

                <ChevronRight
                  size={17}
                />
              </button>
            </div>
          </section>
        </div>
      </div>
    );
  }


  /* ==========================================================
     SUBSCRIBERS
  ========================================================== */

  function renderSubscribers() {
    return (
      <section className="admin-newsletter__panel">
        <div className="admin-newsletter__section-head">
          <div>
            <span className="admin-newsletter__section-label">
              AUDIENCE
            </span>

            <h2>
              Newsletter Subscribers
            </h2>

            <p>
              Review, search and manage
              contacts receiving Continental
              Founders communications.
            </p>
          </div>

          <button
            type="button"
            className="admin-newsletter__button admin-newsletter__button--secondary"
            onClick={
              handleExportSubscribers
            }
          >
            <Download
              size={16}
            />

            Export CSV
          </button>
        </div>


        <div className="admin-newsletter__toolbar">
          <label className="admin-newsletter__search">
            <Search
              size={16}
            />

            <input
              type="search"
              value={
                searchTerm
              }
              placeholder="Search name or email..."
              onChange={(event) =>
                setSearchTerm(
                  event.target.value
                )
              }
            />
          </label>


          <label className="admin-newsletter__filter">
            <span>
              Status
            </span>

            <select
              value={
                statusFilter
              }
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
            >
              <option value="all">
                All subscribers
              </option>

              <option value="subscribed">
                Subscribed
              </option>

              <option value="unsubscribed">
                Unsubscribed
              </option>
            </select>
          </label>
        </div>


        {loading ? (
          <div className="admin-newsletter__state admin-newsletter__state--large">
            <Loader2
              size={26}
              className="admin-newsletter__spin"
            />

            <strong>
              Loading subscribers...
            </strong>
          </div>
        ) : filteredSubscribers.length ===
          0 ? (
          <div className="admin-newsletter__state admin-newsletter__state--large">
            <Users
              size={28}
            />

            <strong>
              No subscribers found
            </strong>

            <p>
              Try another search or
              subscriber status.
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
                    Joined
                  </th>

                  <th className="admin-newsletter__table-actions-heading">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredSubscribers.map(
                  (
                    subscriber
                  ) => {
                    const subscriberId =
                      getSubscriberId(
                        subscriber
                      );

                    const status =
                      getSubscriberStatus(
                        subscriber
                      );

                    const actionLoading =
                      subscriberActionId ===
                      subscriberId;

                    return (
                      <tr
                        key={
                          subscriberId
                        }
                      >
                        <td>
                          <div className="admin-newsletter__subscriber">
                            <div className="admin-newsletter__subscriber-avatar">
                              {(
                                getSubscriberName(
                                  subscriber
                                ) ||
                                getSubscriberEmail(
                                  subscriber
                                ) ||
                                "S"
                              )
                                .charAt(
                                  0
                                )
                                .toUpperCase()}
                            </div>

                            <div>
                              <strong>
                                {getSubscriberName(
                                  subscriber
                                ) ||
                                  "Subscriber"}
                              </strong>

                              <span>
                                {getSubscriberEmail(
                                  subscriber
                                )}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span
                            className={`admin-newsletter__status admin-newsletter__status--${status}`}
                          >
                            {status ===
                            "subscribed"
                              ? "Subscribed"
                              : "Unsubscribed"}
                          </span>
                        </td>

                        <td>
                          {formatDate(
                            getSubscriberCreatedAt(
                              subscriber
                            )
                          )}
                        </td>

                        <td>
                          <div className="admin-newsletter__row-actions">
                            {status ===
                            "subscribed" ? (
                              <button
                                type="button"
                                className="admin-newsletter__icon-button"
                                title="Unsubscribe"
                                aria-label="Unsubscribe subscriber"
                                disabled={
                                  actionLoading
                                }
                                onClick={() =>
                                  handleSubscriberStatus(
                                    subscriber,
                                    "unsubscribed"
                                  )
                                }
                              >
                                {actionLoading ? (
                                  <Loader2
                                    size={16}
                                    className="admin-newsletter__spin"
                                  />
                                ) : (
                                  <UserX
                                    size={16}
                                  />
                                )}
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="admin-newsletter__icon-button"
                                title="Activate subscriber"
                                aria-label="Activate subscriber"
                                disabled={
                                  actionLoading
                                }
                                onClick={() =>
                                  handleSubscriberStatus(
                                    subscriber,
                                    "subscribed"
                                  )
                                }
                              >
                                {actionLoading ? (
                                  <Loader2
                                    size={16}
                                    className="admin-newsletter__spin"
                                  />
                                ) : (
                                  <UserCheck
                                    size={16}
                                  />
                                )}
                              </button>
                            )}


                            <button
                              type="button"
                              className="admin-newsletter__icon-button admin-newsletter__icon-button--danger"
                              title="Delete subscriber"
                              aria-label="Delete subscriber"
                              disabled={
                                actionLoading
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
      </section>
    );
  }


  /* ==========================================================
     CAMPAIGNS
  ========================================================== */

  function renderCampaigns() {
    return (
      <section className="admin-newsletter__panel">
        <div className="admin-newsletter__section-head">
          <div>
            <span className="admin-newsletter__section-label">
              CAMPAIGNS
            </span>

            <h2>
              Newsletter Campaigns
            </h2>

            <p>
              Create, review and manage
              Continental Founders
              newsletters.
            </p>
          </div>

          <button
            type="button"
            className="admin-newsletter__button admin-newsletter__button--primary"
            onClick={() => {
              resetCampaign();

              setActiveTab(
                "create"
              );
            }}
          >
            <Plus
              size={16}
            />

            New Newsletter
          </button>
        </div>


        {campaigns.length ===
        0 ? (
          <div className="admin-newsletter__campaign-empty">
            <div className="admin-newsletter__campaign-empty-icon">
              <Megaphone
                size={30}
              />
            </div>

            <span className="admin-newsletter__section-label">
              NEWSLETTER CAMPAIGNS
            </span>

            <h3>
              No campaigns yet
            </h3>

            <p>
              Your newsletter campaigns
              will appear here after campaign
              storage is connected and the
              first newsletter is saved.
            </p>

            <button
              type="button"
              className="admin-newsletter__button admin-newsletter__button--primary"
              onClick={() => {
                resetCampaign();

                setActiveTab(
                  "create"
                );
              }}
            >
              <Plus
                size={16}
              />

              Create First Newsletter
            </button>
          </div>
        ) : (
          <div className="admin-newsletter__campaign-list">
            {campaigns.map(
              (campaign) => (
                <article
                  key={
                    campaign.id
                  }
                  className="admin-newsletter__campaign-card"
                >
                  <div className="admin-newsletter__campaign-card-icon">
                    <Mail
                      size={19}
                    />
                  </div>

                  <div className="admin-newsletter__campaign-card-copy">
                    <span>
                      {campaign.status ||
                        "Draft"}
                    </span>

                    <h3>
                      {campaign.title ||
                        "Untitled Newsletter"}
                    </h3>

                    <p>
                      {campaign.subject ||
                        "No email subject"}
                    </p>
                  </div>

                  <div className="admin-newsletter__campaign-card-meta">
                    <strong>
                      {formatNumber(
                        campaign.recipientCount ||
                          campaign.recipients ||
                          0
                      )}
                    </strong>

                    <span>
                      recipients
                    </span>
                  </div>
                </article>
              )
            )}
          </div>
        )}
      </section>
    );
  }


  /* ==========================================================
     WIZARD PROGRESS
  ========================================================== */

  function renderWizardProgress() {
    const currentStep =
      WIZARD_STEPS.find(
        (step) =>
          step.id ===
          wizardStep
      ) ||
      WIZARD_STEPS[0];

    const progress =
      ((wizardStep - 1) /
        (WIZARD_STEPS.length -
          1)) *
      100;

    return (
      <>
        <div className="admin-newsletter__wizard-mobile-head">
          <div>
            <span>
              Step {wizardStep} of{" "}
              {
                WIZARD_STEPS.length
              }
            </span>

            <strong>
              {currentStep.label}
            </strong>
          </div>

          <span>
            {Math.round(
              progress
            )}
            %
          </span>
        </div>


        <div className="admin-newsletter__wizard-mobile-progress">
          <span
            style={{
              width: `${progress}%`,
            }}
          />
        </div>


        <div className="admin-newsletter__wizard-steps">
          {WIZARD_STEPS.map(
            (
              step,
              index
            ) => {
              const Icon =
                step.id <
                wizardStep
                  ? CheckCircle2
                  : null;

              const active =
                step.id ===
                wizardStep;

              const complete =
                step.id <
                wizardStep;

              return (
                <React.Fragment
                  key={
                    step.id
                  }
                >
                  <button
                    type="button"
                    className={`admin-newsletter__wizard-step ${
                      active
                        ? "admin-newsletter__wizard-step--active"
                        : ""
                    } ${
                      complete
                        ? "admin-newsletter__wizard-step--complete"
                        : ""
                    }`}
                    onClick={() =>
                      goToWizardStep(
                        step.id
                      )
                    }
                  >
                    <span className="admin-newsletter__wizard-step-number">
                      {Icon ? (
                        <Icon
                          size={16}
                        />
                      ) : (
                        step.id
                      )}
                    </span>

                    <span className="admin-newsletter__wizard-step-copy">
                      <strong>
                        {step.label}
                      </strong>

                      <small>
                        {
                          step.description
                        }
                      </small>
                    </span>
                  </button>

                  {index <
                    WIZARD_STEPS.length -
                      1 && (
                    <span
                      className={`admin-newsletter__wizard-connector ${
                        complete
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
      </>
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
              title and define what
              subscribers will see in their
              inbox.
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
              Some email applications show
              this text next to or below the
              subject.
            </small>
          </label>
        </div>
      </section>
    );
  }


  /* ==========================================================
     STEP 2 — CONTENT & IMAGE UPLOAD
  ========================================================== */

  function renderContentStep() {
    const displayImage =
      featuredImagePreview ||
      campaignForm.featuredImage;

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
                message and upload an
                optional featured image
                directly from your device.
              </p>
            </div>
          </div>


          <div className="admin-newsletter__form-grid">
            <div className="admin-newsletter__field admin-newsletter__field--full">
              <span>
                Featured Image
              </span>


              <input
                ref={
                  imageInputRef
                }
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="admin-newsletter__image-file-input"
                onChange={
                  handleImageInputChange
                }
              />


              {!displayImage ? (
                <div
                  className={`admin-newsletter__image-upload ${
                    imageDragActive
                      ? "admin-newsletter__image-upload--active"
                      : ""
                  } ${
                    processingImage
                      ? "admin-newsletter__image-upload--processing"
                      : ""
                  }`}
                  onDragEnter={
                    handleImageDragOver
                  }
                  onDragOver={
                    handleImageDragOver
                  }
                  onDragLeave={
                    handleImageDragLeave
                  }
                  onDrop={
                    handleImageDrop
                  }
                >
                  <div className="admin-newsletter__image-upload-icon">
                    {processingImage ? (
                      <Loader2
                        size={30}
                        className="admin-newsletter__spin"
                      />
                    ) : (
                      <Upload
                        size={30}
                      />
                    )}
                  </div>


                  <div className="admin-newsletter__image-upload-copy">
                    <strong>
                      {processingImage
                        ? "Uploading image..."
                        : "Upload a featured image"}
                    </strong>

                    <p>
                      Drag and drop an image
                      here, or choose one
                      directly from your
                      computer or phone.
                    </p>

                    <small>
                      JPG, PNG or WEBP •
                      Maximum 5 MB
                    </small>
                  </div>


                  <button
                    type="button"
                    className="admin-newsletter__button admin-newsletter__button--secondary"
                    onClick={
                      openImagePicker
                    }
                    disabled={
                      processingImage
                    }
                  >
                    <ImagePlus
                      size={16}
                    />

                    Choose Image
                  </button>
                </div>
              ) : (
                <div className="admin-newsletter__uploaded-image">
                  <div className="admin-newsletter__uploaded-image-preview">
                    <img
                      src={
                        displayImage
                      }
                      alt="Newsletter featured preview"
                    />

                    <span className="admin-newsletter__uploaded-image-badge">
                      <CheckCircle2
                        size={14}
                      />

                      Image selected
                    </span>
                  </div>


                  <div className="admin-newsletter__uploaded-image-info">
                    <div className="admin-newsletter__uploaded-image-details">
                      <span className="admin-newsletter__uploaded-image-icon">
                        <FileImage
                          size={19}
                        />
                      </span>

                      <div>
                        <strong>
                          {featuredImageFile
                            ?.name ||
                            "Featured image"}
                        </strong>

                        <span>
                          {featuredImageFile
                            ? `${(
                                featuredImageFile.size /
                                1024 /
                                1024
                              ).toFixed(
                                2
                              )} MB`
                            : "Saved newsletter image"}
                        </span>
                      </div>
                    </div>


                    <div className="admin-newsletter__uploaded-image-actions">
                      <button
                        type="button"
                        className="admin-newsletter__button admin-newsletter__button--secondary"
                        onClick={
                          openImagePicker
                        }
                        disabled={
                          processingImage
                        }
                      >
                        <ImagePlus
                          size={15}
                        />

                        Replace
                      </button>

                      <button
                        type="button"
                        className="admin-newsletter__button admin-newsletter__button--danger"
                        onClick={
                          clearFeaturedImage
                        }
                      >
                        <Trash2
                          size={15}
                        />

                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              )}


              {imageUploadError && (
                <div
                  className="admin-newsletter__image-error"
                  role="alert"
                >
                  <XCircle
                    size={16}
                  />

                  <span>
                    {
                      imageUploadError
                    }
                  </span>
                </div>
              )}


              <small className="admin-newsletter__field-help">
                Upload a JPG, PNG or WEBP image
                directly from your device. The
                image is securely uploaded to
                permanent storage and its public
                URL is saved with the newsletter.
              </small>
            </div>


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
                Optionally direct readers
                to an event, opportunity,
                article or another
                Continental Founders page.
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
  }  /* ==========================================================
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
        title:
          "Founders",
        description:
          "Target subscribers identified as founders.",
        count: null,
        available: false,
      },
      {
        id: "partners",
        title:
          "Partners",
        description:
          "Send specifically to ecosystem and institutional partners.",
        count: null,
        available: false,
      },
      {
        id: "universities",
        title:
          "Universities",
        description:
          "Target university and academic subscribers.",
        count: null,
        available: false,
      },
    ];


    return (
      <div className="admin-newsletter__wizard-content-stack">
        <section className="admin-newsletter__card admin-newsletter__wizard-card">
          <div className="admin-newsletter__form-heading">
            <span>
              03
            </span>

            <div>
              <h3>
                Choose Audience
              </h3>

              <p>
                Select the group that should
                receive this newsletter.
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
                    onClick={() => {
                      if (
                        !audience.available
                      ) {
                        return;
                      }

                      updateCampaignField(
                        "audience",
                        audience.id
                      );
                    }}
                    disabled={
                      !audience.available
                    }
                  >
                    <span className="admin-newsletter__audience-radio">
                      {selected && (
                        <span />
                      )}
                    </span>


                    <span className="admin-newsletter__audience-option-copy">
                      <strong>
                        {
                          audience.title
                        }
                      </strong>

                      <small>
                        {
                          audience.description
                        }
                      </small>

                      {!audience.available && (
                        <small>
                          Segmentation will
                          become available
                          when subscriber
                          categories are
                          connected.
                        </small>
                      )}
                    </span>


                    <span className="admin-newsletter__audience-option-count">
                      {audience.count !==
                      null
                        ? formatNumber(
                            audience.count
                          )
                        : "—"}
                    </span>
                  </button>
                );
              }
            )}
          </div>
        </section>


        <section className="admin-newsletter__recipient-summary">
          <div className="admin-newsletter__recipient-summary-icon">
            <Users
              size={22}
            />
          </div>

          <div>
            <span>
              Estimated Recipients
            </span>

            <strong>
              {campaignForm.audience ===
              "all"
                ? formatNumber(
                    statistics.subscribed
                  )
                : "—"}
            </strong>

            <small>
              {formatAudience(
                campaignForm.audience
              )}
            </small>
          </div>
        </section>
      </div>
    );
  }


  /* ==========================================================
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
                Choose when this newsletter
                should be delivered to the
                selected audience.
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
              onClick={() =>
                updateCampaignField(
                  "deliveryMethod",
                  "now"
                )
              }
            >
              <span className="admin-newsletter__delivery-option-icon">
                <Send
                  size={21}
                />
              </span>

              <span className="admin-newsletter__delivery-option-copy">
                <strong>
                  Send Now
                </strong>

                <small>
                  Prepare this newsletter
                  for immediate delivery.
                </small>
              </span>

              <span className="admin-newsletter__delivery-selection">
                {campaignForm.deliveryMethod ===
                  "now" && (
                  <CheckCircle2
                    size={18}
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
                  Schedule
                </strong>

                <small>
                  Choose a future date and
                  time for delivery.
                </small>
              </span>

              <span className="admin-newsletter__delivery-selection">
                {campaignForm.deliveryMethod ===
                  "schedule" && (
                  <CheckCircle2
                    size={18}
                  />
                )}
              </span>
            </button>
          </div>


          {campaignForm.deliveryMethod ===
            "schedule" && (
            <div className="admin-newsletter__schedule-box">
              <div>
                <CalendarClock
                  size={19}
                />

                <div>
                  <strong>
                    Schedule Newsletter
                  </strong>

                  <span>
                    Select the date and
                    local time when this
                    newsletter should be
                    sent.
                  </span>
                </div>
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
                Test Delivery
              </h3>

              <p>
                Enter an email address to
                test the newsletter before
                broadcasting it.
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
              disabled={
                sendingTest
              }
            >
              {sendingTest ? (
                <Loader2
                  size={16}
                  className="admin-newsletter__spin"
                />
              ) : (
                <MailCheck
                  size={16}
                />
              )}

              {sendingTest
                ? "Preparing..."
                : "Send Test"}
            </button>
          </div>


          <div className="admin-newsletter__delivery-notice">
            <Mail
              size={17}
            />

            <p>
              Real newsletter delivery is
              not enabled until the backend
              email provider is connected.
              The CMS will not falsely mark
              a newsletter as delivered.
            </p>
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
      campaignForm.audience ===
      "all"
        ? statistics.subscribed
        : "—";


    const reviewImage =
      featuredImagePreview ||
      campaignForm.featuredImage;


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
                  Check the campaign
                  details, content,
                  audience and delivery
                  settings before
                  completing the
                  newsletter workflow.
                </p>
              </div>
            </div>


            <div className="admin-newsletter__review-sections">

              {/* =============================================
                  DETAILS
              ============================================== */}

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
                      goToWizardStep(
                        1
                      )
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


              {/* =============================================
                  CONTENT
              ============================================== */}

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
                      goToWizardStep(
                        2
                      )
                    }
                  >
                    Edit
                  </button>
                </div>


                <div className="admin-newsletter__review-content-preview">
                  {reviewImage && (
                    <img
                      src={
                        reviewImage
                      }
                      alt="Newsletter featured"
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


              {/* =============================================
                  AUDIENCE
              ============================================== */}

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
                      goToWizardStep(
                        3
                      )
                    }
                  >
                    Edit
                  </button>
                </div>


                <div className="admin-newsletter__review-grid">
                  <div>
                    <span>
                      Selected Audience
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
                      {typeof recipientCount ===
                      "number"
                        ? formatNumber(
                            recipientCount
                          )
                        : recipientCount}
                    </strong>
                  </div>
                </div>
              </div>


              {/* =============================================
                  DELIVERY
              ============================================== */}

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
                      goToWizardStep(
                        4
                      )
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
                        : "Send Now"}
                    </strong>
                  </div>


                  <div>
                    <span>
                      Delivery Time
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


        {/* ====================================================
            REVIEW SUMMARY
        ===================================================== */}

        <aside className="admin-newsletter__review-summary">
          <div className="admin-newsletter__review-summary-head">
            <span className="admin-newsletter__section-label">
              SUMMARY
            </span>

            <h3>
              Campaign Overview
            </h3>
          </div>


          <div className="admin-newsletter__review-summary-list">
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
                {typeof recipientCount ===
                "number"
                  ? formatNumber(
                      recipientCount
                    )
                  : recipientCount}
              </strong>
            </div>


            <div>
              <span>
                Featured Image
              </span>

              <strong>
                {reviewImage
                  ? "Included"
                  : "Not included"}
              </strong>
            </div>


            <div>
              <span>
                Call to Action
              </span>

              <strong>
                {campaignForm.ctaText
                  ? "Included"
                  : "Not included"}
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
                  : "Send Now"}
              </strong>
            </div>
          </div>


          <button
            type="button"
            className="admin-newsletter__button admin-newsletter__button--secondary admin-newsletter__review-preview-button"
            onClick={() =>
              setPreviewOpen(
                true
              )
            }
          >
            <Eye
              size={16}
            />

            Preview Email
          </button>


          <div className="admin-newsletter__review-note">
            <Sparkles
              size={17}
            />

            <p>
              Review the newsletter
              carefully before scheduling
              or sending it.
            </p>
          </div>
        </aside>
      </div>
    );
  }


  /* ==========================================================
     RENDER CURRENT WIZARD STEP
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
          size={17}
        />

        <span>
          {wizardError}
        </span>

        <button
          type="button"
          onClick={() =>
            setWizardError(
              ""
            )
          }
          aria-label="Dismiss error"
        >
          <X
            size={15}
          />
        </button>
      </div>
    );
  }


  /* ==========================================================
     WIZARD NAVIGATION
  ========================================================== */

  function renderWizardNavigation() {
    const finalStep =
      wizardStep ===
      WIZARD_STEPS.length;

    return (
      <div className="admin-newsletter__wizard-navigation">
        <div className="admin-newsletter__wizard-navigation-left">
          {wizardStep >
            1 && (
            <button
              type="button"
              className="admin-newsletter__button admin-newsletter__button--secondary"
              onClick={
                handlePreviousStep
              }
            >
              <ChevronLeft
                size={16}
              />

              Previous
            </button>
          )}
        </div>


        <div className="admin-newsletter__wizard-navigation-center">
          <span>
            Step {wizardStep} of{" "}
            {
              WIZARD_STEPS.length
            }
          </span>
        </div>


        <div className="admin-newsletter__wizard-navigation-right">
          <button
            type="button"
            className="admin-newsletter__button admin-newsletter__button--ghost"
            onClick={
              handleSaveDraft
            }
            disabled={
              savingDraft
            }
          >
            {savingDraft ? (
              <Loader2
                size={16}
                className="admin-newsletter__spin"
              />
            ) : (
              <FileText
                size={16}
              />
            )}

            {savingDraft
              ? "Saving..."
              : "Save Draft"}
          </button>


          {!finalStep ? (
            <button
              type="button"
              className="admin-newsletter__button admin-newsletter__button--primary"
              onClick={
                handleNextStep
              }
            >
              Next

              <ChevronRight
                size={16}
              />
            </button>
          ) : campaignForm.deliveryMethod ===
            "schedule" ? (
            <button
              type="button"
              className="admin-newsletter__button admin-newsletter__button--primary"
              onClick={
                handleSchedule
              }
              disabled={
                scheduling
              }
            >
              {scheduling ? (
                <Loader2
                  size={16}
                  className="admin-newsletter__spin"
                />
              ) : (
                <CalendarClock
                  size={16}
                />
              )}

              {scheduling
                ? "Scheduling..."
                : "Schedule Newsletter"}
            </button>
          ) : (
            <button
              type="button"
              className="admin-newsletter__button admin-newsletter__button--primary"
              onClick={
                handleSendCampaign
              }
              disabled={
                sendingCampaign
              }
            >
              {sendingCampaign ? (
                <Loader2
                  size={16}
                  className="admin-newsletter__spin"
                />
              ) : (
                <Send
                  size={16}
                />
              )}

              {sendingCampaign
                ? "Preparing..."
                : "Send Newsletter"}
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
    return (
      <section className="admin-newsletter__panel admin-newsletter__create-panel">
        <div className="admin-newsletter__section-head">
          <div>
            <span className="admin-newsletter__section-label">
              NEWSLETTER BUILDER
            </span>

            <h2>
              Create Newsletter
            </h2>

            <p>
              Build your newsletter step
              by step, review it and
              prepare it for delivery.
            </p>
          </div>


          <div className="admin-newsletter__section-actions">
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
                size={16}
              />

              Preview
            </button>


            <button
              type="button"
              className="admin-newsletter__button admin-newsletter__button--ghost"
              onClick={() => {
                const confirmed =
                  window.confirm(
                    "Clear this newsletter and start again?"
                  );

                if (
                  confirmed
                ) {
                  resetCampaign();
                }
              }}
            >
              <RefreshCcw
                size={16}
              />

              Reset
            </button>
          </div>
        </div>


        {renderWizardProgress()}

        {renderWizardError()}


        <div className="admin-newsletter__wizard-body">
          <div className="admin-newsletter__wizard-current-step">
            <span>
              Step {wizardStep}
            </span>

            <strong>
              {
                WIZARD_STEPS[
                  wizardStep - 1
                ]?.label
              }
            </strong>
          </div>

          {renderWizardStep()}
        </div>


        {renderWizardNavigation()}
      </section>
    );
  }  /* ==========================================================
     ANALYTICS
  ========================================================== */

  function renderAnalytics() {
    const analyticsCards = [
      {
        label:
          "Campaigns Sent",
        value: 0,
        helper:
          "No completed campaigns yet",
        icon: Send,
      },
      {
        label:
          "Emails Delivered",
        value: 0,
        helper:
          "Delivery tracking not connected",
        icon: MailCheck,
      },
      {
        label:
          "Email Opens",
        value: 0,
        helper:
          "Open tracking not connected",
        icon: Eye,
      },
      {
        label:
          "Link Clicks",
        value: 0,
        helper:
          "Click tracking not connected",
        icon:
          MousePointerClick,
      },
    ];


    return (
      <div className="admin-newsletter__analytics">
        <section className="admin-newsletter__stats-grid">
          {analyticsCards.map(
            (card) => {
              const Icon =
                card.icon;

              return (
                <article
                  key={
                    card.label
                  }
                  className="admin-newsletter__stat-card"
                >
                  <div className="admin-newsletter__stat-icon">
                    <Icon
                      size={19}
                    />
                  </div>

                  <div className="admin-newsletter__stat-copy">
                    <span>
                      {card.label}
                    </span>

                    <strong>
                      {formatNumber(
                        card.value
                      )}
                    </strong>

                    <small>
                      {card.helper}
                    </small>
                  </div>
                </article>
              );
            }
          )}
        </section>


        <section className="admin-newsletter__panel">
          <div className="admin-newsletter__section-head">
            <div>
              <span className="admin-newsletter__section-label">
                PERFORMANCE
              </span>

              <h2>
                Newsletter Analytics
              </h2>

              <p>
                Campaign delivery,
                engagement and subscriber
                activity will appear here
                after newsletter delivery
                tracking is connected.
              </p>
            </div>
          </div>


          <div className="admin-newsletter__analytics-empty">
            <div className="admin-newsletter__analytics-empty-icon">
              <BarChart3
                size={30}
              />
            </div>

            <h3>
              Analytics will appear here
            </h3>

            <p>
              Delivery, open and click
              statistics will become
              available once real campaign
              sending and provider event
              tracking are connected.
            </p>
          </div>
        </section>
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


    /*
     * Use the locally selected image first.
     *
     * Once the image has been permanently
     * uploaded, campaignForm.featuredImage
     * becomes the fallback.
     */
    const previewImage =
      featuredImagePreview ||
      campaignForm.featuredImage;


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
          onMouseDown={(event) =>
            event.stopPropagation()
          }
        >
          {/* ===============================================
              PREVIEW HEADER
          ================================================ */}

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
                size={19}
              />
            </button>
          </div>


          {/* ===============================================
              EMAIL
          ================================================ */}

          <div className="admin-newsletter__email-preview">

            {/* =============================================
                EMAIL BRAND
            ============================================== */}

            <div className="admin-newsletter__email-brand">
              <strong>
                CONTINENTAL FOUNDERS
              </strong>

              <span>
                Empowering Global
                Founders
              </span>
            </div>


            {/* =============================================
                FEATURED IMAGE
            ============================================== */}

            {previewImage && (
              <div className="admin-newsletter__email-image-wrap">
                <img
                  src={
                    previewImage
                  }
                  alt={
                    campaignForm.title
                      ? `${campaignForm.title} featured`
                      : "Newsletter featured"
                  }
                  className="admin-newsletter__email-image"
                />
              </div>
            )}


            {/* =============================================
                EMAIL BODY
            ============================================== */}

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
                    .split(
                      /\n{2,}/
                    )
                    .filter(
                      (
                        paragraph
                      ) =>
                        paragraph.trim()
                    )
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
                    Your newsletter
                    message will appear
                    here.
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


            {/* =============================================
                EMAIL FOOTER
            ============================================== */}

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
     COMPONENT
  ========================================================== */

  return (
    <div className="admin-newsletter">

      {/* ====================================================
          PAGE HEADER
      ===================================================== */}

      {renderHeader()}


      {/* ====================================================
          NAVIGATION
      ===================================================== */}

      {renderTabs()}


      {/* ====================================================
          GLOBAL MESSAGES
      ===================================================== */}

      {renderMessages()}


      {/* ====================================================
          PAGE CONTENT
      ===================================================== */}

      <main className="admin-newsletter__content">
        {renderActiveTab()}
      </main>


      {/* ====================================================
          EMAIL PREVIEW MODAL
      ===================================================== */}

      {renderPreview()}
    </div>
  );
}