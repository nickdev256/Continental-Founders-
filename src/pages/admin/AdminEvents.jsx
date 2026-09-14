import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  ChevronRight,
  Clock3,
  ImagePlus,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Upload,
  Users,
  X,
} from "lucide-react";

import "./AdminEvents.css";


/* ============================================================
   API
============================================================ */

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";


/* ============================================================
   SETTINGS
============================================================ */

const MAX_IMAGE_SIZE =
  5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const EVENTS_PER_PAGE = 6;


/* ============================================================
   FORM STEPS
============================================================ */

const FORM_STEPS = [
  {
    id: 1,
    label: "Basic Information",
  },
  {
    id: 2,
    label: "Event Image",
  },
  {
    id: 3,
    label: "Schedule & Location",
  },
  {
    id: 4,
    label: "Content & Publishing",
  },
];


/* ============================================================
   INITIAL FORM
============================================================ */

const initialForm = {
  title: "",
  description: "",
  location: "",
  type: "",
  status: "draft",
  eventDate: "",
  imageFile: null,
  existingImage: "",
};


/* ============================================================
   COMPONENT
============================================================ */

export default function AdminEvents() {

  /* ==========================================================
     STATE
  ========================================================== */

  const [
    searchQuery,
    setSearchQuery,
  ] =
    useState("");

  const [
    selectedEvent,
    setSelectedEvent,
  ] =
    useState(null);

  const [
    detailStep,
    setDetailStep,
  ] =
    useState(1);

  const [
    events,
    setEvents,
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
    currentPage,
    setCurrentPage,
  ] =
    useState(1);

  const [
    formOpen,
    setFormOpen,
  ] =
    useState(false);

  const [
    editingEvent,
    setEditingEvent,
  ] =
    useState(null);

  const [
    formStep,
    setFormStep,
  ] =
    useState(1);

  const [
    form,
    setForm,
  ] =
    useState(initialForm);

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

  const [
    imagePreview,
    setImagePreview,
  ] =
    useState("");


  /* ==========================================================
     REFS
  ========================================================== */

  const imageInputRef =
    useRef(null);

  const titleInputRef =
    useRef(null);


  /* ==========================================================
     LOAD EVENTS
  ========================================================== */

  const loadEvents =
    useCallback(
      async () => {

        try {

          setLoading(true);
          setError("");

          const response =
            await fetch(
              `${API_URL}/api/events`,
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

          let result = {};

          if (
            contentType.includes(
              "application/json"
            )
          ) {

            result =
              await response.json();

          } else {

            throw new Error(
              "The events service returned an unexpected response."
            );

          }

          if (
            !response.ok
          ) {

            throw new Error(
              result.message ||
              result.error ||
              "Unable to load events."
            );

          }

          const eventData =
            Array.isArray(
              result.events
            )
              ? result.events
              : Array.isArray(
                  result.data
                )
                ? result.data
                : Array.isArray(
                    result.data?.events
                  )
                  ? result.data.events
                  : [];

          setEvents(
            eventData
          );

        } catch (
          requestError
        ) {

          console.error(
            "Admin events loading error:",
            requestError
          );

          setEvents([]);

          setError(
            requestError.message ||
            "Unable to load events."
          );

        } finally {

          setLoading(false);

        }

      },
      []
    );


  /* ==========================================================
     INITIAL LOAD ONLY
  ========================================================== */

  useEffect(
    () => {

      loadEvents();

    },
    [
      loadEvents,
    ]
  );


  /* ==========================================================
     SEARCH RESET PAGE
  ========================================================== */

  useEffect(
    () => {

      setCurrentPage(1);

    },
    [
      searchQuery,
    ]
  );


  /* ==========================================================
     KEEP PAGE VALID
  ========================================================== */

  useEffect(
    () => {

      const pageCount =
        Math.max(
          1,
          Math.ceil(
            events.length /
            EVENTS_PER_PAGE
          )
        );

      if (
        currentPage >
        pageCount
      ) {

        setCurrentPage(
          pageCount
        );

      }

    },
    [
      events,
      currentPage,
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
     CLEAN PREVIEW
  ========================================================== */

  useEffect(
    () => {

      return () => {

        if (
          imagePreview &&
          imagePreview.startsWith(
            "blob:"
          )
        ) {

          URL.revokeObjectURL(
            imagePreview
          );

        }

      };

    },
    [
      imagePreview,
    ]
  );


  /* ==========================================================
     FILTER EVENTS
  ========================================================== */

  const filteredEvents =
    useMemo(
      () => {

        const query =
          searchQuery
            .trim()
            .toLowerCase();

        if (
          !query
        ) {

          return events;

        }

        return events.filter(
          (
            event
          ) => {

            const searchableText = [
              event.title,
              event.description,
              event.location,
              event.city,
              event.venue,
              event.type,
              event.category,
              event.status,
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();

            return searchableText.includes(
              query
            );

          }
        );

      },
      [
        events,
        searchQuery,
      ]
    );


  /* ==========================================================
     PAGINATION
  ========================================================== */

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredEvents.length /
        EVENTS_PER_PAGE
      )
    );

  const safeCurrentPage =
    Math.min(
      currentPage,
      totalPages
    );

  const paginatedEvents =
    useMemo(
      () => {

        const start =
          (
            safeCurrentPage - 1
          ) *
          EVENTS_PER_PAGE;

        return filteredEvents.slice(
          start,
          start +
          EVENTS_PER_PAGE
        );

      },
      [
        filteredEvents,
        safeCurrentPage,
      ]
    );


  /* ==========================================================
     COUNTS
  ========================================================== */

  const publishedCount =
    useMemo(
      () =>
        events.filter(
          (
            event
          ) =>
            String(
              event.status || ""
            )
              .toLowerCase() ===
            "published"
        ).length,
      [
        events,
      ]
    );

  const draftCount =
    useMemo(
      () =>
        events.filter(
          (
            event
          ) =>
            String(
              event.status || ""
            )
              .toLowerCase() ===
            "draft"
        ).length,
      [
        events,
      ]
    );


  /* ==========================================================
     HELPERS
  ========================================================== */

  function createSlug(
    value
  ) {

    return String(
      value || ""
    )
      .toLowerCase()
      .trim()
      .replace(
        /['’"]/g,
        ""
      )
      .replace(
        /[^a-z0-9]+/g,
        "-"
      )
      .replace(
        /^-+|-+$/g,
        ""
      );

  }


  function toDateTimeInput(
    value
  ) {

    if (
      !value
    ) {

      return "";

    }

    const date =
      new Date(
        value
      );

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
        offset *
        60 *
        1000
      );

    return localDate
      .toISOString()
      .slice(
        0,
        16
      );

  }


  function getEventDate(
    event
  ) {

    return (
      event?.eventDate ||
      event?.event_date ||
      event?.startDate ||
      event?.start_date ||
      event?.date ||
      null
    );

  }


  function getEventImage(
    event
  ) {

    return (
      event?.imageUrl ||
      event?.image_url ||
      event?.image ||
      ""
    );

  }


  function formatDate(
    value
  ) {

    if (
      !value
    ) {

      return "Not scheduled";

    }

    const date =
      new Date(
        value
      );

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

      return value;

    }

    return date.toLocaleDateString(
      undefined,
      {
        year:
          "numeric",

        month:
          "short",

        day:
          "numeric",
      }
    );

  }


  function formatTime(
    value
  ) {

    if (
      !value
    ) {

      return "Time not set";

    }

    const date =
      new Date(
        value
      );

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

      return "Time not set";

    }

    return date.toLocaleTimeString(
      undefined,
      {
        hour:
          "2-digit",

        minute:
          "2-digit",
      }
    );

  }


  function getLocation(
    event
  ) {

    return (
      event?.location ||
      event?.venue ||
      event?.city ||
      "Location not set"
    );

  }


  function getEventType(
    event
  ) {

    return (
      event?.type ||
      event?.category ||
      "Continental Founders Event"
    );

  }


  function getStatusClass(
    status
  ) {

    const normalized =
      String(
        status || ""
      )
        .trim()
        .toLowerCase();

    if (
      normalized ===
      "published"
    ) {

      return "admin-events__status admin-events__status--published";

    }

    if (
      normalized ===
      "draft"
    ) {

      return "admin-events__status admin-events__status--draft";

    }

    if (
      normalized ===
      "cancelled"
    ) {

      return "admin-events__status admin-events__status--cancelled";

    }

    return "admin-events__status";

  }


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

    setFormError("");

  }


  /* ==========================================================
     IMAGE
  ========================================================== */

  function handleImageChange(
    event
  ) {

    const file =
      event
        .target
        .files?.[0];

    if (
      !file
    ) {

      return;

    }

    if (
      !ALLOWED_IMAGE_TYPES.includes(
        file.type
      )
    ) {

      setFormError(
        "Please choose a JPG, PNG, or WebP image."
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
        "The event image must be 5 MB or smaller."
      );

      event.target.value =
        "";

      return;

    }

    if (
      imagePreview &&
      imagePreview.startsWith(
        "blob:"
      )
    ) {

      URL.revokeObjectURL(
        imagePreview
      );

    }

    const previewUrl =
      URL.createObjectURL(
        file
      );

    setForm(
      (
        current
      ) => ({
        ...current,

        imageFile:
          file,
      })
    );

    setImagePreview(
      previewUrl
    );

    setFormError("");

  }


  function handleRemoveImage() {

    if (
      imagePreview &&
      imagePreview.startsWith(
        "blob:"
      )
    ) {

      URL.revokeObjectURL(
        imagePreview
      );

    }

    setImagePreview("");

    setForm(
      (
        current
      ) => ({
        ...current,

        imageFile:
          null,

        existingImage:
          "",
      })
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

  function handleCreateEvent() {

    setSelectedEvent(
      null
    );

    setEditingEvent(
      null
    );

    setForm({
      ...initialForm,
    });

    setImagePreview("");

    setFormError("");

    setFormStep(1);

    setFormOpen(true);

  }


  /* ==========================================================
     OPEN EDIT
  ========================================================== */

  function handleEditEvent(
    event
  ) {

    const existingImage =
      getEventImage(
        event
      );

    setSelectedEvent(
      null
    );

    setEditingEvent(
      event
    );

    setForm({

      title:
        event.title ||
        "",

      description:
        event.description ||
        "",

      location:
        getLocation(
          event
        ) ===
        "Location not set"
          ? ""
          : getLocation(
              event
            ),

      type:
        event.type ||
        event.category ||
        "",

      status:
        event.status ||
        "draft",

      eventDate:
        toDateTimeInput(
          getEventDate(
            event
          )
        ),

      imageFile:
        null,

      existingImage:
        existingImage,

    });

    setImagePreview(
      existingImage
    );

    setFormError("");

    setFormStep(1);

    setFormOpen(true);

  }


  /* ==========================================================
     CLOSE FORM
  ========================================================== */

  function resetAndCloseForm() {

    if (
      imagePreview &&
      imagePreview.startsWith(
        "blob:"
      )
    ) {

      URL.revokeObjectURL(
        imagePreview
      );

    }

    setFormOpen(false);

    setEditingEvent(null);

    setForm({
      ...initialForm,
    });

    setFormStep(1);

    setImagePreview("");

    setFormError("");

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

  function getStepError(
    step
  ) {

    if (
      step === 1
    ) {

      const cleanTitle =
        form.title.trim();

      if (
        !cleanTitle
      ) {

        return "Event title is required.";

      }

      if (
        cleanTitle.length <
        3
      ) {

        return "Event title must be at least 3 characters.";

      }

    }


    if (
      step === 2
    ) {

      if (
        !editingEvent &&
        !form.imageFile
      ) {

        return "Please choose an event cover image.";

      }

    }


    if (
      step === 3
    ) {

      if (
        !form.eventDate
      ) {

        return "Event date and time are required.";

      }

    }


    return "";

  }


  function validateStep(
    step
  ) {

    const message =
      getStepError(
        step
      );

    if (
      message
    ) {

      setFormError(
        message
      );

      if (
        step === 1 &&
        formStep === 1
      ) {

        titleInputRef
          .current
          ?.focus();

      }

      return false;

    }


    setFormError("");

    return true;

  }


  function handleNextFormStep() {

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


  function handlePreviousFormStep() {

    setFormError("");

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
     SAVE
  ========================================================== */

  async function handleSaveEvent() {

    if (
      formStep !== 4
    ) {

      handleNextFormStep();

      return;

    }


    const stepOneError =
      getStepError(1);

    const stepTwoError =
      getStepError(2);

    const stepThreeError =
      getStepError(3);


    if (
      stepOneError
    ) {

      setFormError(
        stepOneError
      );

      setFormStep(1);

      return;

    }


    if (
      stepTwoError
    ) {

      setFormError(
        stepTwoError
      );

      setFormStep(2);

      return;

    }


    if (
      stepThreeError
    ) {

      setFormError(
        stepThreeError
      );

      setFormStep(3);

      return;

    }


    try {

      setSaving(true);

      setFormError("");


      const cleanTitle =
        form.title.trim();


      const eventDate =
        new Date(
          form.eventDate
        );


      if (
        Number.isNaN(
          eventDate.getTime()
        )
      ) {

        throw new Error(
          "Please enter a valid event date and time."
        );

      }


      const slug =
        createSlug(
          cleanTitle
        );


      const formData =
        new FormData();


      formData.append(
        "title",
        cleanTitle
      );

      formData.append(
        "slug",
        slug
      );

      formData.append(
        "description",
        form.description.trim()
      );

      formData.append(
        "location",
        form.location.trim()
      );

      formData.append(
        "type",
        form.type.trim()
      );

      formData.append(
        "status",
        form.status
      );

      formData.append(
        "eventDate",
        eventDate.toISOString()
      );


      if (
        form.imageFile
      ) {

        formData.append(
          "image",
          form.imageFile,
          form.imageFile.name
        );

      }


      const editing =
        Boolean(
          editingEvent?.id
        );


      const editingId =
        editingEvent?.id;


      const endpoint =
        editing
          ? `${API_URL}/api/events/${editingId}`
          : `${API_URL}/api/events`;


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
          result.message ||
          result.error ||
          (
            editing
              ? "Unable to update event."
              : "Unable to create event."
          )
        );

      }


      const savedEvent =
        result.event ||
        result.data?.event ||
        result.data ||
        null;


      /* ========================================================
         UPDATE LOCAL STATE
      ======================================================== */

      if (
        savedEvent
      ) {

        if (
          editing
        ) {

          setEvents(
            (
              currentEvents
            ) =>
              currentEvents.map(
                (
                  currentEvent
                ) =>
                  currentEvent.id ===
                  editingId
                    ? {
                        ...currentEvent,
                        ...savedEvent,
                      }
                    : currentEvent
              )
          );

        } else {

          setEvents(
            (
              currentEvents
            ) => [
              ...currentEvents,
              savedEvent,
            ]
          );

        }

      }


      resetAndCloseForm();


    } catch (
      saveError
    ) {

      console.error(
        "Save event error:",
        saveError
      );

      setFormError(
        saveError.message ||
        "Unable to save event."
      );

    } finally {

      setSaving(false);

    }

  }


  /* ==========================================================
     DELETE
  ========================================================== */

  async function handleDeleteEvent() {

    if (
      !editingEvent?.id
    ) {

      return;

    }


    const deletedId =
      editingEvent.id;


    const confirmed =
      window.confirm(
        `Delete "${editingEvent.title}"? This action cannot be undone.`
      );


    if (
      !confirmed
    ) {

      return;

    }


    try {

      setDeleting(true);

      setFormError("");


      const response =
        await fetch(
          `${API_URL}/api/events/${deletedId}`,
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


      let result = {};


      const contentType =
        response.headers.get(
          "content-type"
        ) || "";


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
          result.message ||
          "Unable to delete event."
        );

      }


      /* ========================================================
         REMOVE LOCALLY
      ======================================================== */

      setEvents(
        (
          currentEvents
        ) =>
          currentEvents.filter(
            (
              currentEvent
            ) =>
              currentEvent.id !==
              deletedId
          )
      );


      setSelectedEvent(
        null
      );


      resetAndCloseForm();


    } catch (
      deleteError
    ) {

      console.error(
        "Delete event error:",
        deleteError
      );

      setFormError(
        deleteError.message ||
        "Unable to delete event."
      );

    } finally {

      setDeleting(false);

    }

  }


  /* ==========================================================
     OPEN DETAILS
  ========================================================== */

  function handleOpenDetails(
    event
  ) {

    setSelectedEvent(
      event
    );

    setDetailStep(1);

  }


  /* ==========================================================
     PAGE
  ========================================================== */

  return (

    <div className="admin-events admin-page">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="admin-events__header">

        <div>

          <span className="admin-events__eyebrow">
            WEBSITE CONTENT
          </span>

          <h1>
            Events
          </h1>

          <p>
            Manage Continental Founders conferences,
            workshops, gatherings and ecosystem activities.
          </p>

        </div>


        <button
          type="button"
          className="admin-events__create"
          onClick={
            handleCreateEvent
          }
        >

          <Plus
            size={17}
          />

          Create Event

        </button>

      </div>


      {/* ======================================================
          SUMMARY
      ====================================================== */}

      <div className="admin-events__summary-grid">

        <div className="admin-events__summary-card">

          <CalendarDays
            size={20}
          />

          <div>

            <strong>
              {events.length}
            </strong>

            <span>
              Total Events
            </span>

          </div>

        </div>


        <div className="admin-events__summary-card">

          <Clock3
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


        <div className="admin-events__summary-card">

          <Users
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
          PANEL
      ====================================================== */}

      <section className="admin-events__panel admin-page__body">

        <div className="admin-events__toolbar">

          <div className="admin-events__search">

            <Search
              size={17}
            />

            <input
              type="search"
              placeholder="Search events..."
              value={
                searchQuery
              }
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


          <span className="admin-events__count">

            {filteredEvents.length}
            {" "}
            {filteredEvents.length === 1
              ? "event"
              : "events"}

          </span>

        </div>


        <div className="admin-events__table-header">

          <span>
            Event
          </span>

          <span>
            Date
          </span>

          <span>
            Location
          </span>

          <span>
            Status
          </span>

          <span />

        </div>


        <div className="admin-events__panel-body">

          {loading && (

            <div className="admin-events__empty">

              <RefreshCw
                size={28}
              />

              <h3>
                Loading events
              </h3>

              <p>
                Retrieving Continental Founders events.
              </p>

            </div>

          )}


          {!loading &&
            error && (

              <div className="admin-events__empty">

                <CalendarDays
                  size={28}
                />

                <h3>
                  Events could not be loaded
                </h3>

                <p>
                  {error}
                </p>

                <button
                  type="button"
                  onClick={
                    loadEvents
                  }
                >
                  Try again
                </button>

              </div>

            )}


          {!loading &&
            !error &&
            paginatedEvents.length === 0 && (

              <div className="admin-events__empty">

                <CalendarDays
                  size={28}
                />

                <h3>
                  {searchQuery
                    ? "No matching events"
                    : "No events yet"}
                </h3>

                <p>
                  {searchQuery
                    ? "Try another search."
                    : "Create your first Continental Founders event."}
                </p>

              </div>

            )}


          {!loading &&
            !error &&
            paginatedEvents.map(
              (
                event,
                index
              ) => {

                const eventDate =
                  getEventDate(
                    event
                  );

                return (

                  <button
                    key={
                      event.id ||
                      event.slug ||
                      index
                    }
                    type="button"
                    className="admin-events__row"
                    onClick={() =>
                      handleOpenDetails(
                        event
                      )
                    }
                  >

                    <div className="admin-events__event">

                      <div className="admin-events__event-icon">

                        <CalendarDays
                          size={17}
                        />

                      </div>

                      <div>

                        <strong>
                          {event.title ||
                            "Untitled Event"}
                        </strong>

                        <span>
                          {getEventType(
                            event
                          )}
                        </span>

                      </div>

                    </div>


                    <div className="admin-events__date">

                      <strong>
                        {formatDate(
                          eventDate
                        )}
                      </strong>

                      <span>
                        {formatTime(
                          eventDate
                        )}
                      </span>

                    </div>


                    <div className="admin-events__location">

                      <MapPin
                        size={14}
                      />

                      <span>
                        {getLocation(
                          event
                        )}
                      </span>

                    </div>


                    <div>

                      <span
                        className={
                          getStatusClass(
                            event.status
                          )
                        }
                      >

                        {event.status ||
                          "Draft"}

                      </span>

                    </div>


                    <div className="admin-events__arrow">

                      <ChevronRight
                        size={17}
                      />

                    </div>

                  </button>

                );

              }
            )}

        </div>


        {/* ====================================================
            PAGINATION
        ==================================================== */}

        {!loading &&
          !error &&
          filteredEvents.length > 0 && (

            <div className="admin-events__pagination">

              <span>

                Showing{" "}

                {(
                  safeCurrentPage - 1
                ) *
                  EVENTS_PER_PAGE +
                  1}

                {" – "}

                {Math.min(
                  safeCurrentPage *
                    EVENTS_PER_PAGE,
                  filteredEvents.length
                )}

                {" of "}

                {filteredEvents.length}

              </span>


              <div>

                <button
                  type="button"
                  disabled={
                    safeCurrentPage === 1
                  }
                  onClick={() =>
                    setCurrentPage(
                      (
                        page
                      ) =>
                        Math.max(
                          1,
                          page - 1
                        )
                    )
                  }
                >

                  <ArrowLeft
                    size={15}
                  />

                  Previous

                </button>


                <strong>
                  Page {safeCurrentPage} of {totalPages}
                </strong>


                <button
                  type="button"
                  disabled={
                    safeCurrentPage ===
                    totalPages
                  }
                  onClick={() =>
                    setCurrentPage(
                      (
                        page
                      ) =>
                        Math.min(
                          totalPages,
                          page + 1
                        )
                    )
                  }
                >

                  Next

                  <ArrowRight
                    size={15}
                  />

                </button>

              </div>

            </div>

          )}

      </section>


      {/* ======================================================
          DETAILS DRAWER
      ====================================================== */}

      {selectedEvent && (

        <div
          className="admin-events__overlay"
          onClick={() =>
            setSelectedEvent(
              null
            )
          }
        >

          <aside
            className="admin-events__drawer admin-events__details-drawer"
            onClick={(
              event
            ) =>
              event.stopPropagation()
            }
          >

            <div className="admin-events__drawer-header">

              <div>

                <span className="admin-events__drawer-eyebrow">
                  EVENT DETAILS
                </span>

                <h2>
                  {selectedEvent.title}
                </h2>

              </div>


              <button
                type="button"
                className="admin-events__drawer-close"
                onClick={() =>
                  setSelectedEvent(
                    null
                  )
                }
              >

                <X
                  size={19}
                />

              </button>

            </div>


            <div className="admin-events__step-progress">

              <span>
                Step {detailStep} of 2
              </span>

              <div className="admin-events__progress-track">

                <span
                  style={{
                    width:
                      `${detailStep * 50}%`,
                  }}
                />

              </div>

            </div>


            <div className="admin-events__drawer-step">

              {detailStep === 1 && (

                <div className="admin-events__detail-grid">

                  <div className="admin-events__detail-card">

                    <CalendarDays
                      size={18}
                    />

                    <div>

                      <span>
                        Date
                      </span>

                      <strong>
                        {formatDate(
                          getEventDate(
                            selectedEvent
                          )
                        )}
                      </strong>

                    </div>

                  </div>


                  <div className="admin-events__detail-card">

                    <Clock3
                      size={18}
                    />

                    <div>

                      <span>
                        Time
                      </span>

                      <strong>
                        {formatTime(
                          getEventDate(
                            selectedEvent
                          )
                        )}
                      </strong>

                    </div>

                  </div>


                  <div className="admin-events__detail-card">

                    <MapPin
                      size={18}
                    />

                    <div>

                      <span>
                        Location
                      </span>

                      <strong>
                        {getLocation(
                          selectedEvent
                        )}
                      </strong>

                    </div>

                  </div>


                  <div className="admin-events__detail-card">

                    <Users
                      size={18}
                    />

                    <div>

                      <span>
                        Event Type
                      </span>

                      <strong>
                        {getEventType(
                          selectedEvent
                        )}
                      </strong>

                    </div>

                  </div>


                  <div className="admin-events__detail-card admin-events__detail-card--wide">

                    <span
                      className={
                        getStatusClass(
                          selectedEvent.status
                        )
                      }
                    >

                      {selectedEvent.status ||
                        "Draft"}

                    </span>

                  </div>

                </div>

              )}


              {detailStep === 2 && (

                <div className="admin-events__content-step">

                  {getEventImage(
                    selectedEvent
                  ) ? (

                    <div className="admin-events__detail-image">

                      <img
                        src={
                          getEventImage(
                            selectedEvent
                          )
                        }
                        alt={
                          selectedEvent.title
                        }
                      />

                    </div>

                  ) : (

                    <div className="admin-events__image-empty">

                      <ImagePlus
                        size={28}
                      />

                      <span>
                        No event image
                      </span>

                    </div>

                  )}


                  <div className="admin-events__description">

                    <span>
                      Event Description
                    </span>

                    <p>
                      {selectedEvent.description ||
                        "No description has been added for this event."}
                    </p>

                  </div>

                </div>

              )}

            </div>


            <div className="admin-events__step-footer">

              <button
                type="button"
                className="admin-events__previous"
                disabled={
                  detailStep === 1
                }
                onClick={() =>
                  setDetailStep(
                    1
                  )
                }
              >

                <ArrowLeft
                  size={16}
                />

                Previous

              </button>


              {detailStep === 1 ? (

                <button
                  type="button"
                  className="admin-events__next"
                  onClick={() =>
                    setDetailStep(
                      2
                    )
                  }
                >

                  Next

                  <ArrowRight
                    size={16}
                  />

                </button>

              ) : (

                <button
                  type="button"
                  className="admin-events__next"
                  onClick={() =>
                    handleEditEvent(
                      selectedEvent
                    )
                  }
                >

                  Edit Event

                </button>

              )}

            </div>

          </aside>

        </div>

      )}


      {/* ======================================================
          CREATE / EDIT DRAWER
      ====================================================== */}

      {formOpen && (

        <div
          className="admin-events__overlay"
          onClick={
            closeForm
          }
        >

          <aside
            className="admin-events__drawer admin-events__form-drawer"
            onClick={(
              event
            ) =>
              event.stopPropagation()
            }
          >

            <div className="admin-events__drawer-header">

              <div>

                <span className="admin-events__drawer-eyebrow">

                  {editingEvent
                    ? "EDIT EVENT"
                    : "CREATE EVENT"}

                </span>

                <h2>

                  {editingEvent
                    ? "Update Event"
                    : "New Event"}

                </h2>

              </div>


              <button
                type="button"
                className="admin-events__drawer-close"
                onClick={
                  closeForm
                }
              >

                <X
                  size={19}
                />

              </button>

            </div>


            {/* =================================================
                NOT A NATIVE FORM

                This prevents browser form submission from
                resetting or refreshing the wizard on Step 4.
            ================================================= */}

            <div
              className="admin-events__event-form"
            >

              <div className="admin-events__step-progress">

                <span>
                  Step {formStep} of 4
                </span>

                <div className="admin-events__progress-track">

                  <span
                    style={{
                      width:
                        `${formStep * 25}%`,
                    }}
                  />

                </div>


                <div className="admin-events__step-labels">

                  {FORM_STEPS.map(
                    (
                      step
                    ) => (

                      <span
                        key={
                          step.id
                        }
                        className={
                          formStep ===
                          step.id
                            ? "active"
                            : ""
                        }
                      >

                        {step.label}

                      </span>

                    )
                  )}

                </div>

              </div>


              {formError && (

                <div className="admin-events__form-error">

                  {formError}

                </div>

              )}


              <div className="admin-events__form-step">

                {/* =============================================
                    STEP 1
                ============================================= */}

                {formStep === 1 && (

                  <div className="admin-events__step-content">

                    <div className="admin-events__step-heading">

                      <span>
                        BASIC INFORMATION
                      </span>

                      <h3>
                        Event identity
                      </h3>

                      <p>
                        Add the title and event category.
                      </p>

                    </div>


                    <div className="admin-events__field">

                      <label htmlFor="event-title">
                        Event Title *
                      </label>

                      <input
                        ref={
                          titleInputRef
                        }
                        id="event-title"
                        name="title"
                        type="text"
                        value={
                          form.title
                        }
                        onChange={
                          handleFormChange
                        }
                        placeholder="Enter event title"
                      />

                    </div>


                    <div className="admin-events__field">

                      <label htmlFor="event-type">
                        Event Type
                      </label>

                      <select
                        id="event-type"
                        name="type"
                        value={
                          form.type
                        }
                        onChange={
                          handleFormChange
                        }
                      >

                        <option value="">
                          Select event type
                        </option>

                        <option value="Conference">
                          Conference
                        </option>

                        <option value="Founder Forum">
                          Founder Forum
                        </option>

                        <option value="Roundtable">
                          Roundtable
                        </option>

                        <option value="Workshop">
                          Workshop
                        </option>

                        <option value="Networking">
                          Networking
                        </option>

                        <option value="University Engagement">
                          University Engagement
                        </option>

                        <option value="Investor Gathering">
                          Investor Gathering
                        </option>

                        <option value="Partner Event">
                          Partner Event
                        </option>

                        <option value="Other">
                          Other
                        </option>

                      </select>

                    </div>

                  </div>

                )}


                {/* =============================================
                    STEP 2
                ============================================= */}

                {formStep === 2 && (

                  <div className="admin-events__step-content">

                    <div className="admin-events__step-heading">

                      <span>
                        EVENT IMAGE
                      </span>

                      <h3>
                        Cover image
                      </h3>

                      <p>
                        Add the visual shown on the public event page.
                      </p>

                    </div>


                    <div className="admin-events__field">

                      <input
                        ref={
                          imageInputRef
                        }
                        id="event-image"
                        className="admin-events__image-input"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={
                          handleImageChange
                        }
                      />


                      {!imagePreview ? (

                        <button
                          type="button"
                          className="admin-events__image-picker"
                          onClick={() =>
                            imageInputRef
                              .current
                              ?.click()
                          }
                        >

                          <ImagePlus
                            size={31}
                          />

                          <strong>
                            Choose Event Image
                          </strong>

                          <span>
                            JPG, PNG or WebP • Maximum 5 MB
                          </span>

                        </button>

                      ) : (

                        <div className="admin-events__image-preview">

                          <img
                            src={
                              imagePreview
                            }
                            alt="Event preview"
                          />

                          <div className="admin-events__image-preview-actions">

                            <button
                              type="button"
                              onClick={() =>
                                imageInputRef
                                  .current
                                  ?.click()
                              }
                            >

                              <Upload
                                size={16}
                              />

                              Change

                            </button>


                            <button
                              type="button"
                              onClick={
                                handleRemoveImage
                              }
                            >

                              <Trash2
                                size={16}
                              />

                              Remove

                            </button>

                          </div>

                        </div>

                      )}

                    </div>

                  </div>

                )}


                {/* =============================================
                    STEP 3
                ============================================= */}

                {formStep === 3 && (

                  <div className="admin-events__step-content">

                    <div className="admin-events__step-heading">

                      <span>
                        SCHEDULE & LOCATION
                      </span>

                      <h3>
                        When and where
                      </h3>

                      <p>
                        Set the event schedule and venue.
                      </p>

                    </div>


                    <div className="admin-events__field">

                      <label htmlFor="event-date">
                        Date & Time *
                      </label>

                      <input
                        id="event-date"
                        name="eventDate"
                        type="datetime-local"
                        value={
                          form.eventDate
                        }
                        onChange={
                          handleFormChange
                        }
                      />

                    </div>


                    <div className="admin-events__field">

                      <label htmlFor="event-location">
                        Location
                      </label>

                      <input
                        id="event-location"
                        name="location"
                        type="text"
                        value={
                          form.location
                        }
                        onChange={
                          handleFormChange
                        }
                        placeholder="e.g. Kampala, Uganda"
                      />

                    </div>

                  </div>

                )}


                {/* =============================================
                    STEP 4
                ============================================= */}

                {formStep === 4 && (

                  <div className="admin-events__step-content">

                    <div className="admin-events__step-heading">

                      <span>
                        CONTENT & PUBLISHING
                      </span>

                      <h3>
                        Final event details
                      </h3>

                      <p>
                        Add the description and publishing status.
                      </p>

                    </div>


                    <div className="admin-events__field">

                      <label htmlFor="event-description">
                        Event Description
                      </label>

                      <textarea
                        id="event-description"
                        name="description"
                        value={
                          form.description
                        }
                        onChange={
                          handleFormChange
                        }
                        placeholder="Describe the event, purpose, audience and expected outcomes..."
                        rows={5}
                      />

                    </div>


                    <div className="admin-events__field">

                      <label htmlFor="event-status">
                        Publishing Status
                      </label>

                      <select
                        id="event-status"
                        name="status"
                        value={
                          form.status
                        }
                        onChange={
                          handleFormChange
                        }
                      >

                        <option value="draft">
                          Save as Draft
                        </option>

                        <option value="published">
                          Publish
                        </option>

                        <option value="cancelled">
                          Cancelled
                        </option>

                      </select>

                    </div>

                  </div>

                )}

              </div>


              {/* =================================================
                  FOOTER
              ================================================= */}

              <div className="admin-events__step-footer">

                <div>

                  {/* DELETE ONLY ON STEP 4 */}

                  {editingEvent &&
                    formStep === 4 && (

                      <button
                        type="button"
                        className="admin-events__delete"
                        onClick={
                          handleDeleteEvent
                        }
                        disabled={
                          deleting ||
                          saving
                        }
                      >

                        <Trash2
                          size={16}
                        />

                        {deleting
                          ? "Deleting..."
                          : "Delete Event"}

                      </button>

                    )}

                </div>


                <div className="admin-events__step-footer-right">

                  <button
                    type="button"
                    className="admin-events__previous"
                    disabled={
                      formStep === 1
                    }
                    onClick={
                      handlePreviousFormStep
                    }
                  >

                    <ArrowLeft
                      size={16}
                    />

                    Previous

                  </button>


                  {formStep < 4 ? (

                    <button
                      type="button"
                      className="admin-events__next"
                      onClick={
                        handleNextFormStep
                      }
                    >

                      Next

                      <ArrowRight
                        size={16}
                      />

                    </button>

                  ) : (

                    <button
                      type="button"
                      className="admin-events__next"
                      onClick={
                        handleSaveEvent
                      }
                      disabled={
                        saving ||
                        deleting
                      }
                    >

                      {saving
                        ? "Saving..."
                        : editingEvent
                          ? "Save Changes"
                          : form.status ===
                            "published"
                            ? "Publish Event"
                            : "Save Event"}

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