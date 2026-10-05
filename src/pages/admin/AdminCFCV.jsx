import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  getCfcvStats,
  getCfcvApplications,
  getCfcvApplication,
  getCfcvResume,
  getCfcvHistory,
  getCfcvEmails,
  previewCfcvEmail,
  saveCfcvReview,
} from "../../services/cfcvApi";

import "./AdminCFCV.css";

// ============================================================
// OPTIONS
// ============================================================

const STAGES = [
  "applied",
  "assessment",
  "interview",
  "track_placement",
  "matching",
  "compatibility",
  "final_decision",
  "enrollment",
];

const STATUSES = [
  "submitted",
  "under_review",
  "in_progress",
  "admitted",
  "waitlisted",
  "not_selected",
  "withdrawn",
];

const TRACKS = [
  "Genesis",
  "Ascend",
  "Horizon",
];

const DECISIONS = [
  "ADMIT",
  "ADMIT WITH TRACK PLACEMENT",
  "MATCH REQUIRED",
  "WAITLIST",
  "NOT SELECTED",
];

const REVIEW_KEYS = [
  "admissionsStage",
  "status",
  "assignedTrack",
  "matchingRequired",
  "matchingStatus",
  "matchedApplicationId",
  "finalDecision",
  "reviewerNotes",
  "interviewNotes",
  "matchingNotes",
  "decisionNotes",
  "interviewRequired",
  "interviewStatus",
  "interviewDate",
  "interviewLink",
  "interviewTimezone",
  "enrollmentConfirmed",
];

const GROUPS = [
  [
    "Applicant",
    [
      "fullName",
      "email",
      "phone",
      "country",
      "city",
      "geography",
    ],
  ],
  [
    "Experience",
    [
      "professionalBackground",
      "relevantSkills",
      "entrepreneurshipReason",
    ],
  ],
  [
    "Venture",
    [
      "ventureName",
      "sector",
      "ventureDescription",
      "problem",
      "solution",
      "ventureStage",
      "currentProgress",
      "targetMarket",
      "customerDescription",
    ],
  ],
  [
    "Team and collaboration",
    [
      "teamStatus",
      "teamDescription",
      "existingCrossContinentalTeam",
      "collaboratorNeeds",
      "marketKnowledge",
      "geographicConnections",
    ],
  ],
  [
    "Working together",
    [
      "workingStyle",
      "leadershipStrengths",
      "longTermObjectives",
      "timeCommitment",
      "decisionMaking",
      "ownershipExpectations",
      "sixMonthGoals",
    ],
  ],
];

const LABELS = {
  fullName: "Name",

  existingCrossContinentalTeam:
    "Existing cross-continental team",

  sixMonthGoals:
    "Six-month goals",
};

const EMAIL_LABELS = {
  pending: "Queued",
  sending: "Sending",

  accepted:
    "Accepted by email provider",

  needs_review:
    "Needs administrator review",
};

const browserTimezone =
  Intl.DateTimeFormat()
    .resolvedOptions()
    .timeZone || "UTC";

// ============================================================
// HELPERS
// ============================================================

function human(value = "") {
  return String(value)
    .replace(/_/g, " ")
    .replace(
      /([a-z])([A-Z])/g,
      "$1 $2"
    )
    .replace(
      /^./,
      (letter) => letter.toUpperCase()
    );
}

function display(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return "Not provided";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  return String(value);
}

function formatDate(value) {
  const date = new Date(value);

  return value &&
    Number.isFinite(date.getTime())
    ? date.toLocaleString()
    : "Not set";
}

function localDateInput(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (
    !Number.isFinite(date.getTime())
  ) {
    return "";
  }

  return new Date(
    date.getTime() -
      date.getTimezoneOffset() * 60000
  )
    .toISOString()
    .slice(0, 16);
}

function reviewDraft(application) {
  return Object.fromEntries(
    REVIEW_KEYS.map((key) => {
      let value;

      if (key === "interviewDate") {
        value = localDateInput(
          application[key]
        );
      } else if (
        [
          "matchingRequired",
          "interviewRequired",
          "enrollmentConfirmed",
        ].includes(key)
      ) {
        value = Boolean(
          application[key]
        );
      } else {
        value =
          application[key] ?? "";
      }

      return [key, value];
    })
  );
}

function serializeReview(draft) {
  const result = {
    ...draft,
  };

  if (
    Object.hasOwn(
      result,
      "interviewDate"
    ) &&
    result.interviewDate
  ) {
    const date = new Date(
      result.interviewDate
    );

    if (
      !Number.isFinite(
        date.getTime()
      )
    ) {
      throw new Error(
        "Enter a valid interview date."
      );
    }

    result.interviewDate =
      date.toISOString();
  }

  return result;
}

function changedReview(
  application,
  draft
) {
  const original =
    reviewDraft(application);

  const changed = Object.fromEntries(
    Object.entries(draft).filter(
      ([key, value]) =>
        value !== original[key]
    )
  );

  // Notification-only saves still need a valid review update.
  return serializeReview(
    Object.keys(changed).length
      ? changed
      : {
          admissionsStage:
            draft.admissionsStage,
        }
  );
}

function useDebounced(
  value,
  delay = 350
) {
  const [
    debounced,
    setDebounced,
  ] = useState(value);

  useEffect(() => {
    const timer = setTimeout(
      () => setDebounced(value),
      delay
    );

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debounced;
}

// ============================================================
// REUSABLE FORM COMPONENTS
// ============================================================

function SelectField({
  label,
  value,
  options,
  onChange,
  emptyLabel,
}) {
  return (
    <label className="cfcv-admin-field">
      <span>{label}</span>

      <select
        value={value ?? ""}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
      >
        {emptyLabel && (
          <option value="">
            {emptyLabel}
          </option>
        )}

        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {human(option)}
          </option>
        ))}
      </select>
    </label>
  );
}

function NoteField({
  label,
  value,
  onChange,
}) {
  return (
    <label className="cfcv-admin-field">
      <span>{label}</span>

      <textarea
        rows={4}
        maxLength={10000}
        value={value || ""}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
      />
    </label>
  );
}

function CheckField({
  label,
  value,
  onChange,
}) {
  return (
    <label className="cfcv-admin-check">
      <input
        type="checkbox"
        checked={Boolean(value)}
        onChange={(event) =>
          onChange(
            event.target.checked
          )
        }
      />

      <span>{label}</span>
    </label>
  );
}

// ============================================================
// PAGE
// ============================================================

export default function AdminCFCV() {
  const [stats, setStats] =
    useState(null);

  const [
    statsError,
    setStatsError,
  ] = useState("");

  const [
    filters,
    setFilters,
  ] = useState({
    search: "",
    status: "",
    admissionsStage: "",
    track: "",
    geography: "",
    page: 1,
  });

  const search = useDebounced(
    filters.search
  );

  const [
    applications,
    setApplications,
  ] = useState([]);

  const [
    pagination,
    setPagination,
  ] = useState({
    total: 0,
    totalPages: 0,
  });

  const [
    listLoading,
    setListLoading,
  ] = useState(true);

  const [
    listError,
    setListError,
  ] = useState("");

  const [
    refresh,
    setRefresh,
  ] = useState(0);

  const [
    selectedId,
    setSelectedId,
  ] = useState("");

  const selectedIdRef =
    useRef("");

  selectedIdRef.current =
    selectedId;

  const [
    application,
    setApplication,
  ] = useState(null);

  const [
    draft,
    setDraft,
  ] = useState(null);

  const [
    detailLoading,
    setDetailLoading,
  ] = useState(false);

  const [
    detailError,
    setDetailError,
  ] = useState("");

  const [
    detailRefresh,
    setDetailRefresh,
  ] = useState(0);

  const [tab, setTab] =
    useState("application");

  const [
    history,
    setHistory,
  ] = useState([]);

  const [
    emails,
    setEmails,
  ] = useState([]);

  const [
    historyError,
    setHistoryError,
  ] = useState("");

  const [
    emailError,
    setEmailError,
  ] = useState("");

  const [
    activityRefresh,
    setActivityRefresh,
  ] = useState(0);

  const [
    resumeUrl,
    setResumeUrl,
  ] = useState("");

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    preview,
    setPreview,
  ] = useState(null);

  const [busy, setBusy] =
    useState("");

  const actionLock =
    useRef(false);

  const [
    notice,
    setNotice,
  ] = useState("");

  const [
    actionError,
    setActionError,
  ] = useState("");

  const [
    needsReload,
    setNeedsReload,
  ] = useState(false);

  const [
    candidateSearch,
    setCandidateSearch,
  ] = useState("");

  const candidateQuery =
    useDebounced(candidateSearch);

  const [
    candidates,
    setCandidates,
  ] = useState([]);

  const [
    candidateError,
    setCandidateError,
  ] = useState("");

  const [
    candidatesLoading,
    setCandidatesLoading,
  ] = useState(false);

  const dirty = useMemo(
    () =>
      Boolean(
        application &&
          draft &&
          JSON.stringify(draft) !==
            JSON.stringify(
              reviewDraft(application)
            )
      ),
    [application, draft]
  );

  const hasUnsavedWork =
    dirty ||
    Boolean(message.trim());

  const matchingActive = Boolean(
    draft &&
      (
        draft.matchingRequired ||
        [
          "matching",
          "compatibility",
        ].includes(
          draft.admissionsStage
        )
      )
  );

  // ==========================================================
  // STATISTICS
  // ==========================================================

  useEffect(() => {
    const controller =
      new AbortController();

    let active = true;

    setStatsError("");

    getCfcvStats({
      signal: controller.signal,
    })
      .then((data) => {
        if (active) {
          setStats(data.stats);
        }
      })
      .catch((error) => {
        if (
          active &&
          error.code !== "ABORTED"
        ) {
          setStatsError(
            error.message
          );
        }
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [refresh]);

  // ==========================================================
  // APPLICATION LIST
  // ==========================================================

  useEffect(() => {
    const controller =
      new AbortController();

    let active = true;

    setListLoading(true);
    setListError("");

    getCfcvApplications(
      {
        ...filters,
        search,
        pageSize: 25,
      },
      {
        signal:
          controller.signal,
      }
    )
      .then((data) => {
        if (active) {
          setApplications(
            data.applications
          );

          setPagination(
            data.pagination
          );
        }
      })
      .catch((error) => {
        if (
          active &&
          error.code !== "ABORTED"
        ) {
          setListError(
            error.message
          );
        }
      })
      .finally(() => {
        if (active) {
          setListLoading(false);
        }
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [
    search,
    filters.status,
    filters.admissionsStage,
    filters.track,
    filters.geography,
    filters.page,
    refresh,
  ]);

  // ==========================================================
  // SELECTED APPLICATION
  // ==========================================================

  useEffect(() => {
    if (!selectedId) {
      return;
    }

    const controller =
      new AbortController();

    let active = true;

    setDetailLoading(true);
    setDetailError("");

    setApplication(null);
    setDraft(null);

    setMessage("");
    setPreview(null);
    setResumeUrl("");

    setNotice("");
    setActionError("");
    setNeedsReload(false);

    getCfcvApplication(
      selectedId,
      {
        signal:
          controller.signal,
      }
    )
      .then((data) => {
        if (active) {
          setApplication(
            data.application
          );

          setDraft(
            reviewDraft(
              data.application
            )
          );
        }
      })
      .catch((error) => {
        if (
          active &&
          error.code !== "ABORTED"
        ) {
          setDetailError(
            error.message
          );
        }
      })
      .finally(() => {
        if (active) {
          setDetailLoading(false);
        }
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [
    selectedId,
    detailRefresh,
  ]);

  // ==========================================================
  // REVIEW HISTORY AND EMAILS
  // ==========================================================

  useEffect(() => {
    if (!selectedId) {
      return;
    }

    const controller =
      new AbortController();

    let active = true;

    setHistory([]);
    setEmails([]);

    setHistoryError("");
    setEmailError("");

    getCfcvHistory(
      selectedId,
      {
        signal:
          controller.signal,
      }
    )
      .then((data) => {
        if (active) {
          setHistory(
            data.history
          );
        }
      })
      .catch((error) => {
        if (
          active &&
          error.code !== "ABORTED"
        ) {
          setHistoryError(
            error.message
          );
        }
      });

    getCfcvEmails(
      selectedId,
      {
        signal:
          controller.signal,
      }
    )
      .then((data) => {
        if (active) {
          setEmails(
            data.emails
          );
        }
      })
      .catch((error) => {
        if (
          active &&
          error.code !== "ABORTED"
        ) {
          setEmailError(
            error.message
          );
        }
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [
    selectedId,
    activityRefresh,
    detailRefresh,
  ]);

  // ==========================================================
  // EMAIL STATUS POLLING
  // ==========================================================

  useEffect(() => {
    if (
      !selectedId ||
      tab !== "emails"
    ) {
      return;
    }

    const controller =
      new AbortController();

    let active = true;
    let fetching = false;

    const timer = setInterval(
      async () => {
        if (
          document.hidden ||
          fetching
        ) {
          return;
        }

        fetching = true;

        try {
          const data =
            await getCfcvEmails(
              selectedId,
              {
                signal:
                  controller.signal,
              }
            );

          if (active) {
            setEmails(
              data.emails
            );

            setEmailError("");
          }
        } catch (error) {
          if (
            active &&
            error.code !== "ABORTED"
          ) {
            setEmailError(
              error.message
            );
          }
        } finally {
          fetching = false;
        }
      },
      15000
    );

    return () => {
      active = false;

      clearInterval(timer);

      controller.abort();
    };
  }, [selectedId, tab]);

  // ==========================================================
  // WARN BEFORE CLOSING WITH UNSAVED WORK
  // ==========================================================

  useEffect(() => {
    if (!hasUnsavedWork) {
      return;
    }

    const handler = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener(
      "beforeunload",
      handler
    );

    return () => {
      window.removeEventListener(
        "beforeunload",
        handler
      );
    };
  }, [hasUnsavedWork]);

  // ==========================================================
  // MATCHING CANDIDATE SEARCH
  // ==========================================================

  useEffect(() => {
    setCandidates([]);
    setCandidateError("");

    if (
      !selectedId ||
      !matchingActive
    ) {
      setCandidatesLoading(false);
      return;
    }

    const controller =
      new AbortController();

    let active = true;

    setCandidatesLoading(true);

    getCfcvApplications(
      {
        search:
          candidateQuery,

        pageSize: 20,
      },
      {
        signal:
          controller.signal,
      }
    )
      .then((data) => {
        if (active) {
          setCandidates(
            data.applications.filter(
              (item) =>
                item.id !== selectedId &&
                item.status !== "withdrawn"
            )
          );
        }
      })
      .catch((error) => {
        if (
          active &&
          error.code !== "ABORTED"
        ) {
          setCandidateError(
            error.message
          );
        }
      })
      .finally(() => {
        if (active) {
          setCandidatesLoading(false);
        }
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [
    selectedId,
    matchingActive,
    candidateQuery,
  ]);

  // ==========================================================
  // USER ACTIONS
  // ==========================================================

  function changeFilter(
    key,
    value
  ) {
    setFilters((current) => ({
      ...current,
      [key]: value,
      page: 1,
    }));
  }

  function selectApplication(id) {
    if (
      actionLock.current ||
      id === selectedId
    ) {
      return;
    }

    if (
      hasUnsavedWork &&
      !window.confirm(
        "Discard your unsaved review and email draft?"
      )
    ) {
      return;
    }

    setTab("application");

    setCandidateSearch("");

    setSelectedId(id);
  }

  function updateField(
    key,
    value
  ) {
    setDraft((current) => ({
      ...current,
      [key]: value,
    }));

    // A preview must be regenerated after review changes.
    setPreview(null);

    setNotice("");
    setActionError("");
  }

  function reloadApplication() {
    if (actionLock.current) {
      return;
    }

    if (
      hasUnsavedWork &&
      !window.confirm(
        "Reload this application and discard your unsaved review and email draft?"
      )
    ) {
      return;
    }

    setDetailRefresh(
      (value) => value + 1
    );
  }

  async function runAction(
    name,
    operation
  ) {
    if (actionLock.current) {
      return;
    }

    actionLock.current = true;

    setBusy(name);
    setActionError("");
    setNotice("");

    const id = selectedId;

    try {
      await operation(id);
    } catch (error) {
      if (
        selectedIdRef.current === id
      ) {
        setActionError(
          error.message
        );

        if (
          name === "save" &&
          [
            "CONFLICT",
            "TIMEOUT",
            "NETWORK_ERROR",
            "INVALID_RESPONSE",
          ].includes(error.code)
        ) {
          setNeedsReload(true);
        }
      }
    } finally {
      actionLock.current = false;
      setBusy("");
    }
  }

  function prepareResume() {
    void runAction(
      "resume",
      async (id) => {
        const data =
          await getCfcvResume(id);

        if (
          selectedIdRef.current === id
        ) {
          setResumeUrl(
            data.signedUrl ||
              data.url
          );
        }
      }
    );
  }

  function prepareEmail(
    generate = false
  ) {
    void runAction(
      "preview",
      async (id) => {
        const data =
          await previewCfcvEmail(
            id,
            {
              ...serializeReview(
                draft
              ),

              applicantMessage:
                generate
                  ? ""
                  : message,
            }
          );

        if (
          selectedIdRef.current === id
        ) {
          setMessage(
            data.applicantMessage
          );

          setPreview(
            generate
              ? null
              : data
          );
        }
      }
    );
  }

  function saveReview(
    notifyApplicant
  ) {
    if (
      needsReload ||
      (
        notifyApplicant &&
        !preview
      )
    ) {
      return;
    }

    void runAction(
      "save",
      async (id) => {
        const data =
          await saveCfcvReview(
            id,
            {
              ...changedReview(
                application,
                draft
              ),

              expectedVersion:
                application.version,

              notifyApplicant,

              applicantMessage:
                notifyApplicant
                  ? message
                  : "",
            }
          );

        if (
          selectedIdRef.current !== id
        ) {
          return;
        }

        setApplication(
          data.application
        );

        setDraft(
          reviewDraft(
            data.application
          )
        );

        setPreview(null);

        if (notifyApplicant) {
          setMessage("");
        }

        setNotice(
          data.message
        );

        setNeedsReload(false);

        setRefresh(
          (value) => value + 1
        );

        setActivityRefresh(
          (value) => value + 1
        );
      }
    );
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <main className="cfcv-admin-page">
      <header className="cfcv-admin-header">
        <div>
          <span className="cfcv-admin-eyebrow">
            CONTINENTAL FOUNDERS
          </span>

          <h1>CFCV Admissions</h1>

          <p>
            Review applications, manage fellowship
            placement, and keep applicants informed.
          </p>
        </div>

        <button
          type="button"
          className="cfcv-admin-button"
          disabled={Boolean(busy)}
          onClick={() =>
            setRefresh(
              (value) => value + 1
            )
          }
        >
          Refresh overview
        </button>
      </header>

      {statsError && (
        <p
          className="cfcv-admin-alert"
          role="alert"
        >
          Statistics: {statsError}
        </p>
      )}

      <section
        className="cfcv-admin-stats"
        aria-label="Admissions statistics"
      >
        {[
          [
            "Applications",
            "totalApplications",
          ],
          [
            "Under review",
            "underReview",
          ],
          [
            "Admitted",
            "admitted",
          ],
          [
            "Enrolled",
            "enrolled",
          ],
          [
            "Available places",
            "remainingCapacity",
          ],
        ].map(([label, key]) => (
          <div
            className="cfcv-admin-stat"
            key={key}
          >
            <span>{label}</span>

            <strong>
              {stats?.[key] ?? "—"}
            </strong>
          </div>
        ))}
      </section>

      <section
        className="cfcv-admin-filters"
        aria-label="Filter applications"
      >
        <label className="cfcv-admin-field">
          <span>
            Search applicants
          </span>

          <input
            type="search"
            maxLength={120}
            placeholder="Name, email or reference"
            value={filters.search}
            onChange={(event) =>
              changeFilter(
                "search",
                event.target.value
              )
            }
          />
        </label>

        <SelectField
          label="Status"
          value={filters.status}
          options={STATUSES}
          emptyLabel="All statuses"
          onChange={(value) =>
            changeFilter(
              "status",
              value
            )
          }
        />

        <SelectField
          label="Admissions stage"
          value={filters.admissionsStage}
          options={STAGES}
          emptyLabel="All stages"
          onChange={(value) =>
            changeFilter(
              "admissionsStage",
              value
            )
          }
        />

        <SelectField
          label="Track"
          value={filters.track}
          options={TRACKS}
          emptyLabel="All tracks"
          onChange={(value) =>
            changeFilter(
              "track",
              value
            )
          }
        />

        <SelectField
          label="Geography"
          value={filters.geography}
          options={[
            "Africa",
            "United States",
            "Diaspora",
          ]}
          emptyLabel="All regions"
          onChange={(value) =>
            changeFilter(
              "geography",
              value
            )
          }
        />
      </section>

      <div className="cfcv-admin-workspace">
        {/* APPLICATION LIST */}

        <section
          className="cfcv-admin-list"
          aria-label="Applications"
          aria-busy={listLoading}
        >
          <div className="cfcv-admin-section-heading">
            <h2>Applications</h2>

            <span>
              {listLoading
                ? "Loading…"
                : `${pagination.total} results`}
            </span>
          </div>

          {listError && (
            <p
              className="cfcv-admin-alert"
              role="alert"
            >
              {listError}
            </p>
          )}

          {!listLoading &&
            !listError &&
            applications.length === 0 && (
              <p className="cfcv-admin-empty">
                No applications match these filters.
              </p>
            )}

          <div className="cfcv-admin-applicants">
            {applications.map((item) => (
              <button
                type="button"
                key={item.id}
                className={
                  "cfcv-admin-applicant " +
                  (
                    selectedId === item.id
                      ? "is-selected"
                      : ""
                  )
                }
                aria-pressed={
                  selectedId === item.id
                }
                disabled={Boolean(busy)}
                onClick={() =>
                  selectApplication(
                    item.id
                  )
                }
              >
                <strong>
                  {item.fullName}
                </strong>

                <span>
                  {item.applicationReference}
                </span>

                <span>
                  {item.country}
                  {" · "}
                  {item.assignedTrack ||
                    "Track pending"}
                </span>

                <div className="cfcv-admin-badges">
                  <span className="cfcv-admin-badge">
                    {human(
                      item.admissionsStage
                    )}
                  </span>

                  <span className="cfcv-admin-badge">
                    {human(
                      item.status
                    )}
                  </span>
                </div>
              </button>
            ))}
          </div>

          <nav
            className="cfcv-admin-pagination"
            aria-label="Application pages"
          >
            <button
              type="button"
              disabled={
                listLoading ||
                filters.page <= 1
              }
              onClick={() =>
                setFilters(
                  (current) => ({
                    ...current,

                    page:
                      current.page - 1,
                  })
                )
              }
            >
              Previous
            </button>

            <span>
              Page {filters.page} of{" "}
              {Math.max(
                1,
                pagination.totalPages
              )}
            </span>

            <button
              type="button"
              disabled={
                listLoading ||
                filters.page >=
                  pagination.totalPages
              }
              onClick={() =>
                setFilters(
                  (current) => ({
                    ...current,

                    page:
                      current.page + 1,
                  })
                )
              }
            >
              Next
            </button>
          </nav>
        </section>

        {/* SELECTED APPLICATION */}

        <section
          className="cfcv-admin-detail"
          aria-label="Selected application"
          aria-busy={detailLoading}
        >
          {!selectedId && (
            <div className="cfcv-admin-empty">
              <h2>
                Select an application
              </h2>

              <p>
                Choose an applicant to view their
                information and manage their
                admissions review.
              </p>
            </div>
          )}

          {detailLoading && (
            <p
              className="cfcv-admin-empty"
              role="status"
            >
              Loading application…
            </p>
          )}

          {detailError && (
            <div
              className="cfcv-admin-alert"
              role="alert"
            >
              <p>{detailError}</p>

              <button
                type="button"
                onClick={
                  reloadApplication
                }
              >
                Try again
              </button>
            </div>
          )}

          {application && draft && (
            <>
              <header className="cfcv-admin-detail-header">
                <div>
                  <h2>
                    {application.fullName}
                  </h2>

                  <p>
                    {application.applicationReference}
                    {" · "}
                    Submitted{" "}
                    {formatDate(
                      application.submittedAt
                    )}
                  </p>
                </div>

                <button
                  type="button"
                  className="cfcv-admin-button"
                  disabled={Boolean(busy)}
                  onClick={
                    reloadApplication
                  }
                >
                  Reload application
                </button>
              </header>

              <nav
                className="cfcv-admin-tabs"
                aria-label="Application sections"
              >
                {[
                  "application",
                  "review",
                  "history",
                  "emails",
                ].map((name) => (
                  <button
                    type="button"
                    key={name}
                    className={
                      tab === name
                        ? "is-active"
                        : ""
                    }
                    aria-current={
                      tab === name
                        ? "page"
                        : undefined
                    }
                    onClick={() =>
                      setTab(name)
                    }
                  >
                    {human(name)}
                  </button>
                ))}
              </nav>

              {notice && (
                <p
                  className="cfcv-admin-notice"
                  role="status"
                >
                  {notice}
                </p>
              )}

              {actionError && (
                <p
                  className="cfcv-admin-alert"
                  role="alert"
                >
                  {actionError}
                </p>
              )}

              {needsReload && (
                <p className="cfcv-admin-alert">
                  Reload the application to check the
                  saved result before making another
                  save. Your draft remains visible
                  until you reload.
                </p>
              )}

              {/* APPLICATION INFORMATION */}

              {tab === "application" && (
                <div className="cfcv-admin-content">
                  <div className="cfcv-admin-resume">
                    <strong>
                      Résumé / CV
                    </strong>

                    <span>
                      {application.resumeFileName ||
                        "No file uploaded"}
                    </span>

                    {application.resumeAvailable && (
                      <button
                        type="button"
                        className="cfcv-admin-button"
                        disabled={Boolean(busy)}
                        onClick={
                          prepareResume
                        }
                      >
                        {busy === "resume"
                          ? "Preparing…"
                          : "Prepare download"}
                      </button>
                    )}

                    {resumeUrl && (
                      <a
                        className="cfcv-admin-button"
                        href={resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Download résumé
                      </a>
                    )}

                    {resumeUrl && (
                      <small>
                        The download link expires after
                        five minutes. Prepare another
                        link if needed.
                      </small>
                    )}
                  </div>

                  {GROUPS.map(
                    ([title, keys]) => (
                      <section
                        className="cfcv-admin-card"
                        key={title}
                      >
                        <h3>{title}</h3>

                        <dl className="cfcv-admin-read-grid">
                          {keys.map((key) => (
                            <div key={key}>
                              <dt>
                                {LABELS[key] ||
                                  human(key)}
                              </dt>

                              <dd>
                                {display(
                                  application[key]
                                )}
                              </dd>
                            </div>
                          ))}
                        </dl>
                      </section>
                    )
                  )}
                </div>
              )}

              {/* REVIEW */}

              {tab === "review" && (
                <div className="cfcv-admin-content">
                  <p className="cfcv-admin-muted">
                    Review version{" "}
                    {application.version}.
                    Internal notes stay within the
                    admin system.
                  </p>

                  <fieldset
                    className="cfcv-admin-review-fields"
                    disabled={
                      Boolean(busy) ||
                      needsReload
                    }
                  >
                    <legend className="cfcv-admin-sr-only">
                      Admissions review
                    </legend>

                    <ol className="cfcv-admin-stages">
                      {STAGES.map(
                        (stage, index) => (
                          <li key={stage}>
                            <button
                              type="button"
                              aria-pressed={
                                draft.admissionsStage ===
                                stage
                              }
                              className={
                                draft.admissionsStage ===
                                stage
                                  ? "is-active"
                                  : ""
                              }
                              onClick={() =>
                                updateField(
                                  "admissionsStage",
                                  stage
                                )
                              }
                            >
                              <span>
                                {index + 1}
                              </span>

                              {human(stage)}
                            </button>
                          </li>
                        )
                      )}
                    </ol>

                    <section className="cfcv-admin-card">
                      <h3>
                        Current review
                      </h3>

                      <div className="cfcv-admin-form-grid">
                        <SelectField
                          label="Admissions stage"
                          value={
                            draft.admissionsStage
                          }
                          options={STAGES}
                          onChange={(value) =>
                            updateField(
                              "admissionsStage",
                              value
                            )
                          }
                        />

                        <SelectField
                          label="Application status"
                          value={
                            draft.status
                          }
                          options={STATUSES}
                          onChange={(value) =>
                            updateField(
                              "status",
                              value
                            )
                          }
                        />

                        <SelectField
                          label="Fellowship track"
                          value={
                            draft.assignedTrack
                          }
                          options={TRACKS}
                          emptyLabel="Not assigned"
                          onChange={(value) =>
                            updateField(
                              "assignedTrack",
                              value
                            )
                          }
                        />
                      </div>

                      <NoteField
                        label="Internal assessment notes"
                        value={
                          draft.reviewerNotes
                        }
                        onChange={(value) =>
                          updateField(
                            "reviewerNotes",
                            value
                          )
                        }
                      />
                    </section>

                    {/* INTERVIEW */}

                    <details
                      className="cfcv-admin-card"
                      open={
                        draft.admissionsStage ===
                        "interview"
                      }
                    >
                      <summary>
                        Interview
                      </summary>

                      <CheckField
                        label="Interview required"
                        value={
                          draft.interviewRequired
                        }
                        onChange={(value) =>
                          updateField(
                            "interviewRequired",
                            value
                          )
                        }
                      />

                      <div className="cfcv-admin-form-grid">
                        <SelectField
                          label="Interview status"
                          value={
                            draft.interviewStatus
                          }
                          options={[
                            "not_scheduled",
                            "scheduled",
                            "completed",
                            "cancelled",
                          ]}
                          onChange={(value) =>
                            updateField(
                              "interviewStatus",
                              value
                            )
                          }
                        />

                        <label className="cfcv-admin-field">
                          <span>
                            Interview date — your local
                            time ({browserTimezone})
                          </span>

                          <input
                            type="datetime-local"
                            value={
                              draft.interviewDate
                            }
                            onChange={(event) =>
                              updateField(
                                "interviewDate",
                                event.target.value
                              )
                            }
                          />
                        </label>

                        <label className="cfcv-admin-field">
                          <span>
                            Timezone shown in applicant
                            email
                          </span>

                          <input
                            list="cfcv-timezones"
                            maxLength={120}
                            value={
                              draft.interviewTimezone
                            }
                            onChange={(event) =>
                              updateField(
                                "interviewTimezone",
                                event.target.value
                              )
                            }
                          />

                          <datalist id="cfcv-timezones">
                            {[
                              "UTC",
                              "Africa/Kampala",
                              "Africa/Nairobi",
                              "America/New_York",
                              "America/Chicago",
                              "America/Los_Angeles",
                              "Europe/London",
                            ].map((zone) => (
                              <option
                                key={zone}
                                value={zone}
                              />
                            ))}
                          </datalist>
                        </label>

                        <label className="cfcv-admin-field">
                          <span>
                            Interview meeting link
                          </span>

                          <input
                            type="url"
                            maxLength={2000}
                            placeholder="https://…"
                            value={
                              draft.interviewLink
                            }
                            onChange={(event) =>
                              updateField(
                                "interviewLink",
                                event.target.value
                              )
                            }
                          />
                        </label>
                      </div>

                      <NoteField
                        label="Internal interview notes"
                        value={
                          draft.interviewNotes
                        }
                        onChange={(value) =>
                          updateField(
                            "interviewNotes",
                            value
                          )
                        }
                      />
                    </details>

                    {/* MATCHING AND COMPATIBILITY */}

                    <details
                      className="cfcv-admin-card"
                      open={
                        [
                          "matching",
                          "compatibility",
                        ].includes(
                          draft.admissionsStage
                        )
                      }
                    >
                      <summary>
                        Founder matching and
                        compatibility
                      </summary>

                      <CheckField
                        label="Founder matching required"
                        value={
                          draft.matchingRequired
                        }
                        onChange={(value) =>
                          updateField(
                            "matchingRequired",
                            value
                          )
                        }
                      />

                      <SelectField
                        label="Matching status"
                        value={
                          draft.matchingStatus
                        }
                        options={[
                          "not_started",
                          "required",
                          "in_progress",
                          "matched",
                          "compatibility_sprint",
                          "completed",
                        ]}
                        onChange={(value) =>
                          updateField(
                            "matchingStatus",
                            value
                          )
                        }
                      />

                      {matchingActive && (
                        <>
                          <label className="cfcv-admin-field">
                            <span>
                              Find an applicant to link
                            </span>

                            <input
                              type="search"
                              maxLength={120}
                              placeholder="Search name, email or reference"
                              value={
                                candidateSearch
                              }
                              onChange={(event) =>
                                setCandidateSearch(
                                  event.target.value
                                )
                              }
                            />
                          </label>

                          {candidateError && (
                            <p
                              className="cfcv-admin-alert"
                              role="alert"
                            >
                              {candidateError}
                            </p>
                          )}

                          <label className="cfcv-admin-field">
                            <span>
                              Linked founder application
                              {candidatesLoading
                                ? " — loading…"
                                : ""}
                            </span>

                            <select
                              value={
                                draft.matchedApplicationId
                              }
                              onChange={(event) =>
                                updateField(
                                  "matchedApplicationId",
                                  event.target.value
                                )
                              }
                            >
                              <option value="">
                                No linked applicant
                              </option>

                              {draft.matchedApplicationId &&
                                !candidates.some(
                                  (item) =>
                                    item.id ===
                                    draft.matchedApplicationId
                                ) && (
                                  <option
                                    value={
                                      draft.matchedApplicationId
                                    }
                                  >
                                    Current link:{" "}
                                    {draft.matchedApplicationId}
                                  </option>
                                )}

                              {candidates.map(
                                (item) => (
                                  <option
                                    key={item.id}
                                    value={item.id}
                                  >
                                    {item.fullName}
                                    {" · "}
                                    {item.geography}
                                    {" · "}
                                    {item.applicationReference}
                                  </option>
                                )
                              )}
                            </select>
                          </label>

                          <p className="cfcv-admin-muted">
                            Shows up to 20 search
                            results. This link records
                            the match on this
                            application; it does not
                            automatically update or
                            email the other applicant.
                          </p>
                        </>
                      )}

                      <NoteField
                        label="Internal matching and compatibility notes"
                        value={
                          draft.matchingNotes
                        }
                        onChange={(value) =>
                          updateField(
                            "matchingNotes",
                            value
                          )
                        }
                      />
                    </details>

                    {/* DECISION AND ENROLLMENT */}

                    <details
                      className="cfcv-admin-card"
                      open={
                        [
                          "final_decision",
                          "enrollment",
                        ].includes(
                          draft.admissionsStage
                        )
                      }
                    >
                      <summary>
                        Final decision and enrollment
                      </summary>

                      <SelectField
                        label="Final admissions decision"
                        value={
                          draft.finalDecision
                        }
                        options={DECISIONS}
                        emptyLabel="Decision pending"
                        onChange={(value) =>
                          updateField(
                            "finalDecision",
                            value
                          )
                        }
                      />

                      <CheckField
                        label="Enrollment confirmed"
                        value={
                          draft.enrollmentConfirmed
                        }
                        onChange={(value) =>
                          updateField(
                            "enrollmentConfirmed",
                            value
                          )
                        }
                      />

                      <p className="cfcv-admin-muted">
                        Admission requires any
                        required interview and
                        matching process to be
                        completed. Enrollment
                        confirmation also requires
                        an assigned track.
                      </p>

                      <NoteField
                        label="Internal decision notes"
                        value={
                          draft.decisionNotes
                        }
                        onChange={(value) =>
                          updateField(
                            "decisionNotes",
                            value
                          )
                        }
                      />
                    </details>

                    {/* APPLICANT EMAIL */}

                    <section className="cfcv-admin-card">
                      <h3>
                        Applicant email
                      </h3>

                      <p className="cfcv-admin-muted">
                        Recipient:{" "}
                        {application.email}.
                        Review the message before
                        choosing Save &amp; notify.
                      </p>

                      <button
                        type="button"
                        className="cfcv-admin-button"
                        onClick={() =>
                          prepareEmail(true)
                        }
                      >
                        Generate message for this stage
                      </button>

                      <NoteField
                        label="Message the applicant will receive"
                        value={message}
                        onChange={(value) => {
                          setMessage(value);
                          setPreview(null);
                        }}
                      />

                      <button
                        type="button"
                        className="cfcv-admin-button"
                        disabled={
                          !message.trim()
                        }
                        onClick={() =>
                          prepareEmail(false)
                        }
                      >
                        Preview email
                      </button>

                      {preview && (
                        <div className="cfcv-admin-email-preview">
                          <strong>
                            {preview.subject}
                          </strong>

                          <p>
                            To:{" "}
                            {preview.recipient}
                          </p>

                          <pre>
                            {preview.text}
                          </pre>
                        </div>
                      )}
                    </section>
                  </fieldset>

                  <div className="cfcv-admin-savebar">
                    <span>
                      {busy
                        ? "Working…"
                        : dirty
                          ? "Unsaved review changes"
                          : "Review is saved"}
                    </span>

                    <button
                      type="button"
                      className="cfcv-admin-button"
                      disabled={
                        Boolean(busy) ||
                        needsReload ||
                        !dirty
                      }
                      onClick={() =>
                        saveReview(false)
                      }
                    >
                      Save review
                    </button>

                    <button
                      type="button"
                      className="cfcv-admin-button cfcv-admin-button--primary"
                      disabled={
                        Boolean(busy) ||
                        needsReload ||
                        !preview ||
                        !message.trim()
                      }
                      onClick={() =>
                        saveReview(true)
                      }
                    >
                      Save &amp; notify
                    </button>
                  </div>
                </div>
              )}

              {/* REVIEW HISTORY */}

              {tab === "history" && (
                <div className="cfcv-admin-content">
                  <div className="cfcv-admin-section-heading">
                    <h3>
                      Recent review history
                    </h3>

                    <button
                      type="button"
                      onClick={() =>
                        setActivityRefresh(
                          (value) => value + 1
                        )
                      }
                    >
                      Refresh
                    </button>
                  </div>

                  {historyError && (
                    <p
                      className="cfcv-admin-alert"
                      role="alert"
                    >
                      {historyError}
                    </p>
                  )}

                  {!historyError &&
                    history.length === 0 && (
                      <p className="cfcv-admin-empty">
                        No review history recorded yet.
                      </p>
                    )}

                  {history.map((entry) => (
                    <details
                      className="cfcv-admin-card"
                      key={entry.id}
                    >
                      <summary>
                        Version{" "}
                        {entry.application_version}
                        {" · "}
                        {formatDate(
                          entry.created_at
                        )}
                      </summary>

                      <p className="cfcv-admin-muted">
                        Reviewer ID:{" "}
                        {entry.actor_id ||
                          "Not recorded"}
                      </p>

                      <dl className="cfcv-admin-read-grid">
                        {Object.entries(
                          entry.new_state || {}
                        )
                          .filter(
                            ([key, value]) =>
                              JSON.stringify(value) !==
                              JSON.stringify(
                                entry.previous_state?.[key]
                              )
                          )
                          .map(([key, value]) => (
                            <div key={key}>
                              <dt>
                                {human(key)}
                              </dt>

                              <dd>
                                <span className="cfcv-admin-muted">
                                  Before:{" "}
                                  {display(
                                    entry.previous_state?.[key]
                                  )}
                                </span>

                                <br />

                                After:{" "}
                                {display(value)}
                              </dd>
                            </div>
                          ))}
                      </dl>
                    </details>
                  ))}
                </div>
              )}

              {/* EMAIL STATUS */}

              {tab === "emails" && (
                <div className="cfcv-admin-content">
                  <div className="cfcv-admin-section-heading">
                    <h3>
                      Recent applicant emails
                    </h3>

                    <button
                      type="button"
                      onClick={() =>
                        setActivityRefresh(
                          (value) => value + 1
                        )
                      }
                    >
                      Refresh
                    </button>
                  </div>

                  <p className="cfcv-admin-muted">
                    Updates every 15 seconds while
                    this section is visible.
                    Provider acceptance does not
                    confirm inbox delivery.
                  </p>

                  {emailError && (
                    <p
                      className="cfcv-admin-alert"
                      role="alert"
                    >
                      {emailError}
                    </p>
                  )}

                  {!emailError &&
                    emails.length === 0 && (
                      <p className="cfcv-admin-empty">
                        No emails recorded for this
                        application.
                      </p>
                    )}

                  {emails.map((email) => (
                    <details
                      className="cfcv-admin-card"
                      key={email.id}
                    >
                      <summary>
                        {email.subject}
                      </summary>

                      <span
                        className={
                          "cfcv-admin-badge " +
                          `cfcv-admin-badge--${email.status}`
                        }
                      >
                        {EMAIL_LABELS[
                          email.status
                        ] ||
                          human(
                            email.status
                          )}
                      </span>

                      <p>
                        To: {email.recipient}
                      </p>

                      <p>
                        Created:{" "}
                        {formatDate(
                          email.created_at
                        )}
                        {" · "}
                        Attempts:{" "}
                        {email.attempts}
                      </p>

                      {email.accepted_at && (
                        <p>
                          Accepted:{" "}
                          {formatDate(
                            email.accepted_at
                          )}
                        </p>
                      )}

                      {email.status === "pending" && (
                        <p>
                          Next attempt:{" "}
                          {formatDate(
                            email.next_attempt_at
                          )}
                        </p>
                      )}

                      {email.last_error && (
                        <p className="cfcv-admin-alert">
                          {email.last_error}
                        </p>
                      )}

                      {email.status === "needs_review" && (
                        <p>
                          Check the Resend logs and the
                          job’s provider message ID
                          before deciding whether
                          another email is needed.
                        </p>
                      )}

                      {email.provider_message_id && (
                        <p>
                          Provider message ID:{" "}
                          {email.provider_message_id}
                        </p>
                      )}

                      <pre className="cfcv-admin-email-body">
                        {email.body_text}
                      </pre>
                    </details>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}