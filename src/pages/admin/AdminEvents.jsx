import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  CalendarDays,
  ChevronRight,
  Clock3,
  ImagePlus,
  MapPin,
  Plus,
  RefreshCw,
  Save,
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
   IMAGE SETTINGS
============================================================ */

const MAX_IMAGE_SIZE =
  5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
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
   CONTINENTAL FOUNDERS
   ADMIN EVENTS
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

            const text =
              await response.text();


            console.error(
              "Unexpected events response:",
              text
            );


            throw new Error(
              "The events service returned an unexpected response."
            );

          }


          if (!response.ok) {

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
     INITIAL LOAD
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
     FOCUS TITLE WHEN FORM OPENS
  ========================================================== */

  useEffect(
    () => {

      if (!formOpen) {
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
    ]
  );


  /* ==========================================================
     CLEAN IMAGE PREVIEW
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


        if (!query) {

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
     COUNTS
  ========================================================== */

  const publishedCount =
    useMemo(
      () => {

        return events.filter(
          (
            event
          ) =>
            String(
              event.status || ""
            )
              .trim()
              .toLowerCase() ===
            "published"
        ).length;

      },
      [
        events,
      ]
    );


  const draftCount =
    useMemo(
      () => {

        return events.filter(
          (
            event
          ) =>
            String(
              event.status || ""
            )
              .trim()
              .toLowerCase() ===
            "draft"
        ).length;

      },
      [
        events,
      ]
    );


  /* ==========================================================
     CREATE SLUG

     Generated automatically from whatever title the
     admin/editor chooses.
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


  /* ==========================================================
     DATE TO INPUT
  ========================================================== */

  function toDateTimeInput(
    value
  ) {

    if (!value) {

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
        offset * 60 * 1000
      );


    return localDate
      .toISOString()
      .slice(
        0,
        16
      );

  }


  /* ==========================================================
     EVENT DATE
  ========================================================== */

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


  /* ==========================================================
     EVENT IMAGE
  ========================================================== */

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


  /* ==========================================================
     FORMAT DATE
  ========================================================== */

  function formatDate(
    value
  ) {

    if (!value) {

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


  /* ==========================================================
     FORMAT TIME
  ========================================================== */

  function formatTime(
    value
  ) {

    if (!value) {

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


  /* ==========================================================
     LOCATION
  ========================================================== */

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


  /* ==========================================================
     EVENT TYPE
  ========================================================== */

  function getEventType(
    event
  ) {

    return (
      event?.type ||
      event?.category ||
      "Continental Founders Event"
    );

  }


  /* ==========================================================
     STATUS CLASS
  ========================================================== */

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


    if (
      formError
    ) {

      setFormError("");

    }

  }


  /* ==========================================================
     IMAGE CHANGE
  ========================================================== */

  function handleImageChange(
    event
  ) {

    const file =
      event
        .target
        .files?.[0];


    if (!file) {

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


  /* ==========================================================
     REMOVE IMAGE
  ========================================================== */

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


    setFormOpen(
      true
    );

  }


  /* ==========================================================
     OPEN EDIT

     Existing title is loaded, but the editor can replace
     it with any title they choose.
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


    setFormOpen(
      true
    );

  }


  /* ==========================================================
     RESET AND CLOSE
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


    setFormOpen(
      false
    );


    setEditingEvent(
      null
    );


    setForm({
      ...initialForm,
    });


    setImagePreview("");


    setFormError("");


    if (
      imageInputRef.current
    ) {

      imageInputRef.current.value =
        "";

    }

  }


  /* ==========================================================
     CLOSE FORM
  ========================================================== */

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
     FOCUS TITLE FIELD
  ========================================================== */

  function focusTitleField() {

    window.setTimeout(
      () => {

        titleInputRef
          .current
          ?.scrollIntoView({
            behavior:
              "smooth",

            block:
              "center",
          });


        titleInputRef
          .current
          ?.focus();

      },
      50
    );

  }


  /* ==========================================================
     SAVE EVENT

     IMPORTANT:
     The slug is recreated from the CURRENT title every time,
     including when editing an existing event.
  ========================================================== */

  async function handleSaveEvent(
    event
  ) {

    event.preventDefault();


    const cleanTitle =
      form.title.trim();


    if (
      !cleanTitle
    ) {

      setFormError(
        "Event title is required."
      );


      focusTitleField();


      return;

    }


    if (
      cleanTitle.length <
      3
    ) {

      setFormError(
        "Event title must be at least 3 characters."
      );


      focusTitleField();


      return;

    }


    if (
      !form.eventDate
    ) {

      setFormError(
        "Event date and time are required."
      );


      return;

    }


    if (
      !editingEvent &&
      !form.imageFile
    ) {

      setFormError(
        "Please choose an event image from your gallery."
      );


      return;

    }


    try {

      setSaving(
        true
      );


      setFormError("");


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


      /* ======================================================
         GENERATE SLUG FROM CURRENT TITLE

         If editor changes:
         Old title: Founders Forum
         New title: Africa Investment Summit

         New slug:
         africa-investment-summit
      ====================================================== */

      const slug =
        createSlug(
          cleanTitle
        );


      if (
        !slug
      ) {

        throw new Error(
          "Please enter a valid event title."
        );

      }


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


      const endpoint =
        editing
          ? `${API_URL}/api/events/${editingEvent.id}`
          : `${API_URL}/api/events`;


      if (
        import.meta.env.DEV
      ) {

        console.log(
          "Saving event:",
          {
            editing,

            title:
              cleanTitle,

            slug,

            description:
              form.description,

            location:
              form.location,

            type:
              form.type,

            status:
              form.status,

            eventDate:
              eventDate.toISOString(),

            image:
              form.imageFile
                ?.name ||
              form.existingImage ||
              null,
          }
        );

      }


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

      } else {

        const text =
          await response.text();


        console.error(
          "Unexpected save response:",
          text
        );


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
          (
            editing
              ? "Unable to update event."
              : "Unable to create event."
          )
        );

      }


      resetAndCloseForm();


      await loadEvents();

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

      setSaving(
        false
      );

    }

  }


  /* ==========================================================
     DELETE EVENT
  ========================================================== */

  async function handleDeleteEvent() {

    if (
      !editingEvent?.id
    ) {

      return;

    }


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

      setDeleting(
        true
      );


      setFormError("");


      const response =
        await fetch(
          `${API_URL}/api/events/${editingEvent.id}`,
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
          "Unable to delete event."
        );

      }


      resetAndCloseForm();


      await loadEvents();

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

      setDeleting(
        false
      );

    }

  }


  /* ==========================================================
     PAGE
  ========================================================== */

  return (

    <div className="admin-events">

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
            Manage Continental Founders events,
            conferences, gatherings, workshops,
            and ecosystem activities.
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
            size={18}
            strokeWidth={1.8}
          />

          <span>
            Create Event
          </span>

        </button>

      </div>


      {/* ======================================================
          SUMMARY
      ====================================================== */}

      <div className="admin-events__summary-grid">

        <div className="admin-events__summary-card">

          <div className="admin-events__summary-icon">

            <CalendarDays
              size={20}
              strokeWidth={1.6}
            />

          </div>

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

          <div className="admin-events__summary-icon">

            <Clock3
              size={20}
              strokeWidth={1.6}
            />

          </div>

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

          <div className="admin-events__summary-icon">

            <Users
              size={20}
              strokeWidth={1.6}
            />

          </div>

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
          TOOLBAR
      ====================================================== */}

      <div className="admin-events__toolbar">

        <div className="admin-events__search">

          <Search
            size={18}
            strokeWidth={1.6}
          />

          <input
            type="search"
            value={
              searchQuery
            }
            placeholder="Search events..."
            aria-label="Search events"
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
              aria-label="Clear search"
            >

              <X
                size={16}
                strokeWidth={1.7}
              />

            </button>

          )}

        </div>


        <div className="admin-events__count">

          {!loading && (
            <>
              {filteredEvents.length}
              {" "}
              {filteredEvents.length === 1
                ? "event"
                : "events"}
            </>
          )}

        </div>

      </div>


      {/* ======================================================
          EVENTS PANEL
      ====================================================== */}

      <section className="admin-events__panel">

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


        {loading && (

          <div className="admin-events__empty">

            <div className="admin-events__empty-icon">

              <RefreshCw
                size={27}
                strokeWidth={1.5}
              />

            </div>

            <h3>
              Loading events
            </h3>

            <p>
              Retrieving Continental Founders event content.
            </p>

          </div>

        )}


        {!loading &&
          error && (

            <div className="admin-events__empty">

              <div className="admin-events__empty-icon">

                <CalendarDays
                  size={28}
                  strokeWidth={1.5}
                />

              </div>

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

                <RefreshCw
                  size={17}
                  strokeWidth={1.8}
                />

                Try again

              </button>

            </div>

          )}


        {!loading &&
          !error &&
          filteredEvents.length === 0 && (

            <div className="admin-events__empty">

              <div className="admin-events__empty-icon">

                <CalendarDays
                  size={28}
                  strokeWidth={1.5}
                />

              </div>

              <h3>
                {searchQuery
                  ? "No matching events"
                  : "No events yet"}
              </h3>

              <p>
                {searchQuery
                  ? "Try another event name, location, type, or status."
                  : "Create your first Continental Founders event and it will appear here."}
              </p>

              {!searchQuery && (

                <button
                  type="button"
                  onClick={
                    handleCreateEvent
                  }
                >

                  <Plus
                    size={17}
                    strokeWidth={1.8}
                  />

                  Create your first event

                </button>

              )}

            </div>

          )}


        {!loading &&
          !error &&
          filteredEvents.length > 0 && (

            <div className="admin-events__list">

              {filteredEvents.map(
                (
                  event,
                  index
                ) => {

                  const eventId =
                    event.id ||
                    event.slug ||
                    `${event.title || "event"}-${index}`;


                  const eventDate =
                    getEventDate(
                      event
                    );


                  return (

                    <button
                      key={
                        eventId
                      }
                      type="button"
                      className="admin-events__row"
                      onClick={() =>
                        setSelectedEvent(
                          event
                        )
                      }
                    >

                      <div className="admin-events__event">

                        <div className="admin-events__event-icon">

                          <CalendarDays
                            size={18}
                            strokeWidth={1.6}
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
                          size={15}
                          strokeWidth={1.6}
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
                          strokeWidth={1.7}
                        />

                      </div>

                    </button>

                  );

                }
              )}

            </div>

          )}

      </section>


      {/* ======================================================
          EVENT DETAILS
      ====================================================== */}

      {selectedEvent && (

        <div
          className="admin-events__overlay"
          onClick={() =>
            setSelectedEvent(
              null
            )
          }
          role="presentation"
        >

          <aside
            className="admin-events__drawer"
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
                  {selectedEvent.title ||
                    "Untitled Event"}
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
                  size={20}
                />

              </button>

            </div>


            <div className="admin-events__drawer-body">

              {getEventImage(
                selectedEvent
              ) && (

                <div className="admin-events__detail-image">

                  <img
                    src={
                      getEventImage(
                        selectedEvent
                      )
                    }
                    alt={
                      selectedEvent.title ||
                      "Event"
                    }
                  />

                </div>

              )}


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


              <div className="admin-events__description">

                <span>
                  Description
                </span>

                <p>
                  {selectedEvent.description ||
                    "No description has been added for this event."}
                </p>

              </div>


              <div className="admin-events__drawer-actions">

                <button
                  type="button"
                  className="admin-events__edit"
                  onClick={() =>
                    handleEditEvent(
                      selectedEvent
                    )
                  }
                >

                  Edit Event

                </button>

              </div>

            </div>

          </aside>

        </div>

      )}


      {/* ======================================================
          CREATE / EDIT FORM
      ====================================================== */}

      {formOpen && (

        <div
          className="admin-events__overlay"
          role="presentation"
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
                disabled={
                  saving ||
                  deleting
                }
                aria-label="Close"
              >

                <X
                  size={20}
                />

              </button>

            </div>


            <form
              className="admin-events__event-form"
              onSubmit={
                handleSaveEvent
              }
              noValidate
            >

              {formError && (

                <div className="admin-events__form-error">
                  {formError}
                </div>

              )}


              {/* =================================================
                  EVENT TITLE
              ================================================= */}

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
                  placeholder="Enter the event title of your choice"
                  maxLength={180}
                  autoComplete="off"
                />

                <small>
                  You can enter or change the event title at any time.
                </small>

              </div>


              {/* =================================================
                  IMAGE
              ================================================= */}

              <div className="admin-events__field">

                <label htmlFor="event-image">
                  Event Cover Image *
                </label>


                <input
                  ref={
                    imageInputRef
                  }
                  id="event-image"
                  className="admin-events__image-input"
                  name="image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={
                    handleImageChange
                  }
                />


                {!imagePreview && (

                  <button
                    type="button"
                    className="admin-events__image-picker"
                    onClick={() =>
                      imageInputRef
                        .current
                        ?.click()
                    }
                  >

                    <div className="admin-events__image-picker-icon">

                      <ImagePlus
                        size={28}
                        strokeWidth={1.5}
                      />

                    </div>

                    <strong>
                      Choose Event Image
                    </strong>

                    <span>
                      Select from your computer or phone gallery
                    </span>

                    <small>
                      JPG, PNG or WebP • Maximum 5 MB
                    </small>

                  </button>

                )}


                {imagePreview && (

                  <div className="admin-events__image-preview">

                    <img
                      src={
                        imagePreview
                      }
                      alt="Event preview"
                    />


                    <div className="admin-events__image-preview-overlay">

                      <button
                        type="button"
                        onClick={() =>
                          imageInputRef
                            .current
                            ?.click()
                        }
                      >

                        <Upload
                          size={17}
                        />

                        Change Image

                      </button>


                      <button
                        type="button"
                        onClick={
                          handleRemoveImage
                        }
                      >

                        <Trash2
                          size={17}
                        />

                        Remove

                      </button>

                    </div>

                  </div>

                )}

              </div>


              {/* =================================================
                  DATE
              ================================================= */}

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


              {/* =================================================
                  LOCATION
              ================================================= */}

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


              {/* =================================================
                  TYPE
              ================================================= */}

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


              {/* =================================================
                  STATUS
              ================================================= */}

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


              {/* =================================================
                  DESCRIPTION
              ================================================= */}

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
                  placeholder="Describe the event, its purpose, audience and what participants can expect..."
                  rows={7}
                />

              </div>


              {/* =================================================
                  ACTIONS
              ================================================= */}

              <div className="admin-events__form-actions">

                {editingEvent && (

                  <button
                    type="button"
                    className="admin-events__delete"
                    onClick={
                      handleDeleteEvent
                    }
                    disabled={
                      saving ||
                      deleting
                    }
                  >

                    <Trash2
                      size={17}
                    />

                    {deleting
                      ? "Deleting..."
                      : "Delete"}

                  </button>

                )}


                <div className="admin-events__form-actions-right">

                  <button
                    type="button"
                    className="admin-events__cancel"
                    onClick={
                      closeForm
                    }
                    disabled={
                      saving ||
                      deleting
                    }
                  >

                    Cancel

                  </button>


                  <button
                    type="submit"
                    className="admin-events__save"
                    disabled={
                      saving ||
                      deleting
                    }
                  >

                    {saving
                      ? (
                        <RefreshCw
                          size={17}
                        />
                      )
                      : (
                        <Save
                          size={17}
                        />
                      )}


                    {saving
                      ? "Saving..."
                      : editingEvent
                        ? "Save Changes"
                        : form.status ===
                          "published"
                          ? "Publish Event"
                          : "Save Event"}

                  </button>

                </div>

              </div>

            </form>

          </aside>

        </div>

      )}

    </div>

  );

}