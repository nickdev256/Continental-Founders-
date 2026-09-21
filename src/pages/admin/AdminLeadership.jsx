import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Mail,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UserRound,
  Users,
  X,
} from "lucide-react";

import "./AdminLeadership.css";


// ============================================================
// API
// ============================================================

const API_URL =
  (
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000"
  ).replace(/\/+$/, "");


// ============================================================
// EMPTY FORM
// ============================================================

const EMPTY_FORM = {
  name: "",
  position: "",
  email: "",
  image: "",
  bio: "",
  status: "active",
  display_order: 0,
};


// ============================================================
// HELPERS
// ============================================================

function getLeaderName(leader) {
  return (
    leader?.name ||
    leader?.fullName ||
    leader?.full_name ||
    "Unnamed Leader"
  );
}


function getLeaderRole(leader) {
  return (
    leader?.position ||
    leader?.title ||
    leader?.role ||
    "Leadership Team"
  );
}


function getStatusClass(status) {
  const value =
    String(
      status || ""
    ).toLowerCase();

  if (
    value === "active" ||
    value === "published"
  ) {
    return "active";
  }

  if (value === "draft") {
    return "draft";
  }

  if (
    value === "inactive" ||
    value === "archived"
  ) {
    return "inactive";
  }

  return "draft";
}


function normalizeLeader(leader) {
  return {
    id:
      leader?.id || "",

    name:
      getLeaderName(
        leader
      ),

    position:
      getLeaderRole(
        leader
      ),

    email:
      leader?.email || "",

    image:
      leader?.image || "",

    bio:
      leader?.bio || "",

    status:
      leader?.status ||
      "active",

    display_order:
      Number(
        leader?.display_order ??
          0
      ),

    created_at:
      leader?.created_at ||
      null,

    updated_at:
      leader?.updated_at ||
      null,
  };
}


// ============================================================
// COMPONENT
// ============================================================

export default function AdminLeadership() {

  // ==========================================================
  // DATA STATE
  // ==========================================================

  const [
    leaders,
    setLeaders,
  ] =
    useState([]);


  const [
    loading,
    setLoading,
  ] =
    useState(true);


  const [
    refreshing,
    setRefreshing,
  ] =
    useState(false);


  const [
    error,
    setError,
  ] =
    useState("");


  const [
    success,
    setSuccess,
  ] =
    useState("");


  // ==========================================================
  // SEARCH / SELECTION
  // ==========================================================

  const [
    searchQuery,
    setSearchQuery,
  ] =
    useState("");


  const [
    selectedLeader,
    setSelectedLeader,
  ] =
    useState(null);


  // ==========================================================
  // FORM STATE
  // ==========================================================

  const [
    formOpen,
    setFormOpen,
  ] =
    useState(false);


  const [
    editingLeader,
    setEditingLeader,
  ] =
    useState(null);


  const [
    form,
    setForm,
  ] =
    useState(
      EMPTY_FORM
    );


  const [
    saving,
    setSaving,
  ] =
    useState(false);


  const [
    deletingId,
    setDeletingId,
  ] =
    useState(null);


  // ==========================================================
  // CLEAR MESSAGES
  // ==========================================================

  function clearMessages() {
    setError("");
    setSuccess("");
  }


  // ==========================================================
  // READ RESPONSE
  // ==========================================================

  async function readResponse(
    response
  ) {
    const contentType =
      response.headers.get(
        "content-type"
      ) || "";


    if (
      contentType.includes(
        "application/json"
      )
    ) {
      return response.json();
    }


    const text =
      await response.text();


    return {
      success:
        response.ok,

      message:
        text ||
        "Unexpected server response.",
    };
  }


  // ==========================================================
  // LOAD LEADERSHIP
  // ==========================================================

  const loadLeadership =
    useCallback(
      async (
        showRefreshState =
          false
      ) => {

        if (
          showRefreshState
        ) {
          setRefreshing(
            true
          );
        } else {
          setLoading(
            true
          );
        }


        setError("");


        try {

          const response =
            await fetch(
              `${API_URL}/api/leadership/admin`,
              {
                method:
                  "GET",

                credentials:
                  "include",

                headers: {
                  Accept:
                    "application/json",
                },
              }
            );


          const data =
            await readResponse(
              response
            );


          if (
            response.status ===
              401 ||
            response.status ===
              403
          ) {
            throw new Error(
              "Your admin session has expired. Please sign in again."
            );
          }


          if (
            !response.ok
          ) {
            throw new Error(
              data?.message ||
              "Unable to load leadership profiles."
            );
          }


          const records =
            Array.isArray(
              data?.leaders
            )
              ? data.leaders
              : Array.isArray(
                    data
                  )
                ? data
                : [];


          setLeaders(
            records.map(
              normalizeLeader
            )
          );

        } catch (
          requestError
        ) {

          console.error(
            "Leadership loading error:",
            requestError
          );


          setError(
            requestError
              ?.message ||
              "Unable to load leadership profiles."
          );

        } finally {

          setLoading(
            false
          );

          setRefreshing(
            false
          );

        }

      },
      []
    );


  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(
    () => {

      loadLeadership();

    },
    [
      loadLeadership,
    ]
  );


  // ==========================================================
  // FILTER
  // ==========================================================

  const filteredLeaders =
    useMemo(
      () => {

        const query =
          searchQuery
            .trim()
            .toLowerCase();


        if (!query) {
          return leaders;
        }


        return leaders.filter(
          (
            leader
          ) => {

            const searchable =
              [
                getLeaderName(
                  leader
                ),

                getLeaderRole(
                  leader
                ),

                leader.email,

                leader.bio,

                leader.status,
              ]
                .filter(
                  Boolean
                )
                .join(" ")
                .toLowerCase();


            return searchable.includes(
              query
            );

          }
        );

      },
      [
        leaders,
        searchQuery,
      ]
    );


  // ==========================================================
  // SUMMARY COUNTS
  // ==========================================================

  const activeCount =
    useMemo(
      () =>
        leaders.filter(
          (leader) =>
            String(
              leader.status
            ).toLowerCase() ===
            "active"
        ).length,
      [
        leaders,
      ]
    );


  const draftCount =
    useMemo(
      () =>
        leaders.filter(
          (leader) =>
            String(
              leader.status
            ).toLowerCase() ===
            "draft"
        ).length,
      [
        leaders,
      ]
    );


  // ==========================================================
  // FORM UPDATE
  // ==========================================================

  function updateForm(
    event
  ) {

    const {
      name,
      value,
    } =
      event.target;


    clearMessages();


    setForm(
      (
        current
      ) => ({
        ...current,

        [name]:
          name ===
          "display_order"
            ? value
            : value,
      })
    );

  }


  // ==========================================================
  // OPEN CREATE
  // ==========================================================

  function openCreate() {

    clearMessages();

    setSelectedLeader(
      null
    );

    setEditingLeader(
      null
    );

    setForm({
      ...EMPTY_FORM,

      display_order:
        leaders.length,
    });

    setFormOpen(
      true
    );

  }


  // ==========================================================
  // OPEN EDIT
  // ==========================================================

  function openEdit(
    leader
  ) {

    clearMessages();


    const normalized =
      normalizeLeader(
        leader
      );


    setSelectedLeader(
      null
    );


    setEditingLeader(
      normalized
    );


    setForm({
      name:
        normalized.name,

      position:
        normalized.position,

      email:
        normalized.email,

      image:
        normalized.image,

      bio:
        normalized.bio,

      status:
        normalized.status,

      display_order:
        normalized.display_order,
    });


    setFormOpen(
      true
    );

  }


  // ==========================================================
  // CLOSE FORM
  // ==========================================================

  function closeForm() {

    if (saving) {
      return;
    }


    setFormOpen(
      false
    );

    setEditingLeader(
      null
    );

    setForm(
      EMPTY_FORM
    );

  }


  // ==========================================================
  // SAVE LEADER
  // ==========================================================

  async function saveLeader(
    event
  ) {

    event.preventDefault();


    if (saving) {
      return;
    }


    clearMessages();


    const name =
      form.name.trim();


    const position =
      form.position.trim();


    if (!name) {

      setError(
        "Leader name is required."
      );

      return;

    }


    if (!position) {

      setError(
        "Leadership position is required."
      );

      return;

    }


    const payload = {

      name,

      position,

      email:
        form.email.trim(),

      image:
        form.image.trim(),

      bio:
        form.bio.trim(),

      status:
        form.status,

      display_order:
        Number(
          form.display_order ||
          0
        ),

    };


    const isEditing =
      Boolean(
        editingLeader?.id
      );


    const endpoint =
      isEditing
        ? `${API_URL}/api/leadership/${editingLeader.id}`
        : `${API_URL}/api/leadership`;


    const method =
      isEditing
        ? "PATCH"
        : "POST";


    setSaving(
      true
    );


    try {

      const response =
        await fetch(
          endpoint,
          {
            method,

            credentials:
              "include",

            headers: {
              "Content-Type":
                "application/json",

              Accept:
                "application/json",
            },

            body:
              JSON.stringify(
                payload
              ),
          }
        );


      const data =
        await readResponse(
          response
        );


      if (
        response.status ===
          401 ||
        response.status ===
          403
      ) {
        throw new Error(
          "Your admin session has expired. Please sign in again."
        );
      }


      if (!response.ok) {
        throw new Error(
          data?.message ||
          (
            isEditing
              ? "Unable to update leadership profile."
              : "Unable to create leadership profile."
          )
        );
      }


      setFormOpen(
        false
      );

      setEditingLeader(
        null
      );

      setForm(
        EMPTY_FORM
      );


      setSuccess(
        data?.message ||
        (
          isEditing
            ? "Leadership profile updated successfully."
            : "Leadership profile created successfully."
        )
      );


      await loadLeadership(
        true
      );

    } catch (
      requestError
    ) {

      console.error(
        "Leadership save error:",
        requestError
      );


      setError(
        requestError
          ?.message ||
          "Unable to save leadership profile."
      );

    } finally {

      setSaving(
        false
      );

    }

  }


  // ==========================================================
  // DELETE LEADER
  // ==========================================================

  async function deleteLeader(
    leader
  ) {

    if (
      !leader?.id ||
      deletingId
    ) {
      return;
    }


    const confirmed =
      window.confirm(
        `Delete ${getLeaderName(
          leader
        )}? This action cannot be undone.`
      );


    if (!confirmed) {
      return;
    }


    clearMessages();


    setDeletingId(
      leader.id
    );


    try {

      const response =
        await fetch(
          `${API_URL}/api/leadership/${leader.id}`,
          {
            method:
              "DELETE",

            credentials:
              "include",

            headers: {
              Accept:
                "application/json",
            },
          }
        );


      const data =
        await readResponse(
          response
        );


      if (
        response.status ===
          401 ||
        response.status ===
          403
      ) {
        throw new Error(
          "Your admin session has expired. Please sign in again."
        );
      }


      if (!response.ok) {
        throw new Error(
          data?.message ||
          "Unable to delete leadership profile."
        );
      }


      setLeaders(
        (
          current
        ) =>
          current.filter(
            (
              item
            ) =>
              item.id !==
              leader.id
          )
      );


      if (
        selectedLeader?.id ===
        leader.id
      ) {
        setSelectedLeader(
          null
        );
      }


      setSuccess(
        data?.message ||
        "Leadership profile deleted successfully."
      );

    } catch (
      requestError
    ) {

      console.error(
        "Leadership delete error:",
        requestError
      );


      setError(
        requestError
          ?.message ||
          "Unable to delete leadership profile."
      );

    } finally {

      setDeletingId(
        null
      );

    }

  }


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <main className="admin-leadership">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <section className="leadership-header">

        <div>

          <p className="leadership-eyebrow">
            Continental Founders CMS
          </p>

          <h1>
            Leadership
          </h1>

          <p className="leadership-header-copy">
            Manage the leadership profiles displayed across
            the Continental Founders platform.
          </p>

        </div>


        <div className="leadership-header-actions">

          <button
            type="button"
            className="leadership-secondary-button"
            onClick={() =>
              loadLeadership(
                true
              )
            }
            disabled={
              refreshing
            }
          >

            <RefreshCw
              size={17}
              className={
                refreshing
                  ? "spin"
                  : ""
              }
            />

            {refreshing
              ? "Refreshing..."
              : "Refresh"}

          </button>


          <button
            type="button"
            className="leadership-primary-button"
            onClick={
              openCreate
            }
          >

            <Plus
              size={18}
            />

            Add Leader

          </button>

        </div>

      </section>


      {/* ======================================================
          MESSAGES
      ====================================================== */}

      {error && (
        <div className="leadership-alert leadership-alert-error">

          <AlertCircle
            size={19}
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
              size={17}
            />
          </button>

        </div>
      )}


      {success && (
        <div className="leadership-alert leadership-alert-success">

          <CheckCircle2
            size={19}
          />

          <span>
            {success}
          </span>

          <button
            type="button"
            onClick={() =>
              setSuccess("")
            }
            aria-label="Dismiss message"
          >
            <X
              size={17}
            />
          </button>

        </div>
      )}


      {/* ======================================================
          SUMMARY
      ====================================================== */}

      <section className="leadership-summary">

        <article className="leadership-summary-card">

          <div className="leadership-summary-icon">
            <Users
              size={22}
            />
          </div>

          <div>
            <span>
              Total Leaders
            </span>

            <strong>
              {leaders.length}
            </strong>
          </div>

        </article>


        <article className="leadership-summary-card">

          <div className="leadership-summary-icon">
            <UserRound
              size={22}
            />
          </div>

          <div>
            <span>
              Active
            </span>

            <strong>
              {activeCount}
            </strong>
          </div>

        </article>


        <article className="leadership-summary-card">

          <div className="leadership-summary-icon">
            <BriefcaseBusiness
              size={22}
            />
          </div>

          <div>
            <span>
              Draft
            </span>

            <strong>
              {draftCount}
            </strong>
          </div>

        </article>

      </section>


      {/* ======================================================
          TOOLBAR
      ====================================================== */}

      <section className="leadership-toolbar">

        <div className="leadership-search">

          <Search
            size={18}
          />

          <input
            type="search"
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
            placeholder="Search leadership..."
            aria-label="Search leadership"
          />

          {searchQuery && (
            <button
              type="button"
              onClick={() =>
                setSearchQuery(
                  ""
                )
              }
              aria-label="Clear search"
            >
              <X
                size={16}
              />
            </button>
          )}

        </div>


        <div className="leadership-result-count">

          {filteredLeaders.length}

          {" "}

          {filteredLeaders.length ===
          1
            ? "profile"
            : "profiles"}

        </div>

      </section>


      {/* ======================================================
          CONTENT
      ====================================================== */}

      <section className="leadership-content">

        {loading ? (

          <div className="leadership-loading">

            <Loader2
              size={30}
              className="spin"
            />

            <h3>
              Loading leadership
            </h3>

            <p>
              Retrieving profiles from the CMS.
            </p>

          </div>

        ) : filteredLeaders.length ===
          0 ? (

          <div className="leadership-empty">

            <div className="leadership-empty-icon">
              <Users
                size={30}
              />
            </div>


            <h3>
              {searchQuery
                ? "No matching leaders"
                : "No leadership profiles yet"}
            </h3>


            <p>
              {searchQuery
                ? "Try another name, role, email or status."
                : "Create the first leadership profile for Continental Founders."}
            </p>


            {!searchQuery && (
              <button
                type="button"
                className="leadership-primary-button"
                onClick={
                  openCreate
                }
              >

                <Plus
                  size={18}
                />

                Add First Leader

              </button>
            )}

          </div>

        ) : (

          <div className="leadership-table-wrap">

            <table className="leadership-table">

              <thead>
                <tr>

                  <th>
                    Leader
                  </th>

                  <th>
                    Position
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Order
                  </th>

                  <th>
                    Actions
                  </th>

                </tr>
              </thead>


              <tbody>

                {filteredLeaders.map(
                  (
                    leader
                  ) => (

                    <tr
                      key={
                        leader.id
                      }
                    >

                      <td>

                        <button
                          type="button"
                          className="leadership-person"
                          onClick={() =>
                            setSelectedLeader(
                              leader
                            )
                          }
                        >

                          <div className="leadership-avatar">

                            {leader.image ? (

                              <img
                                src={
                                  leader.image
                                }
                                alt=""
                              />

                            ) : (

                              <UserRound
                                size={21}
                              />

                            )}

                          </div>


                          <div>

                            <strong>
                              {getLeaderName(
                                leader
                              )}
                            </strong>

                            {leader.email && (
                              <span>
                                {
                                  leader.email
                                }
                              </span>
                            )}

                          </div>

                        </button>

                      </td>


                      <td>

                        <span className="leadership-position">
                          {getLeaderRole(
                            leader
                          )}
                        </span>

                      </td>


                      <td>

                        <span
                          className={`leadership-status leadership-status-${getStatusClass(
                            leader.status
                          )}`}
                        >

                          {leader.status ||
                            "draft"}

                        </span>

                      </td>


                      <td>

                        <span className="leadership-order">
                          {leader.display_order}
                        </span>

                      </td>


                      <td>

                        <div className="leadership-row-actions">

                          <button
                            type="button"
                            className="leadership-icon-button"
                            onClick={() =>
                              openEdit(
                                leader
                              )
                            }
                            aria-label={`Edit ${getLeaderName(
                              leader
                            )}`}
                            title="Edit"
                          >

                            <Pencil
                              size={17}
                            />

                          </button>


                          <button
                            type="button"
                            className="leadership-icon-button leadership-delete-button"
                            onClick={() =>
                              deleteLeader(
                                leader
                              )
                            }
                            disabled={
                              deletingId ===
                              leader.id
                            }
                            aria-label={`Delete ${getLeaderName(
                              leader
                            )}`}
                            title="Delete"
                          >

                            {deletingId ===
                            leader.id ? (

                              <Loader2
                                size={17}
                                className="spin"
                              />

                            ) : (

                              <Trash2
                                size={17}
                              />

                            )}

                          </button>


                          <button
                            type="button"
                            className="leadership-icon-button"
                            onClick={() =>
                              setSelectedLeader(
                                leader
                              )
                            }
                            aria-label={`View ${getLeaderName(
                              leader
                            )}`}
                            title="View"
                          >

                            <ChevronRight
                              size={19}
                            />

                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </section>


      {/* ======================================================
          PROFILE DRAWER
      ====================================================== */}

      {selectedLeader && (

        <div
          className="leadership-overlay"
          onMouseDown={(
            event
          ) => {

            if (
              event.target ===
              event.currentTarget
            ) {
              setSelectedLeader(
                null
              );
            }

          }}
        >

          <aside className="leadership-drawer">

            <div className="leadership-drawer-header">

              <div>
                <span>
                  Leadership Profile
                </span>

                <h2>
                  {getLeaderName(
                    selectedLeader
                  )}
                </h2>
              </div>


              <button
                type="button"
                className="leadership-close-button"
                onClick={() =>
                  setSelectedLeader(
                    null
                  )
                }
                aria-label="Close profile"
              >
                <X
                  size={20}
                />
              </button>

            </div>


            <div className="leadership-drawer-body">

              <div className="leadership-profile-image">

                {selectedLeader.image ? (

                  <img
                    src={
                      selectedLeader.image
                    }
                    alt={
                      getLeaderName(
                        selectedLeader
                      )
                    }
                  />

                ) : (

                  <UserRound
                    size={46}
                  />

                )}

              </div>


              <div className="leadership-profile-heading">

                <h3>
                  {getLeaderName(
                    selectedLeader
                  )}
                </h3>

                <p>
                  {getLeaderRole(
                    selectedLeader
                  )}
                </p>

                <span
                  className={`leadership-status leadership-status-${getStatusClass(
                    selectedLeader.status
                  )}`}
                >
                  {selectedLeader.status}
                </span>

              </div>


              {selectedLeader.email && (

                <div className="leadership-detail">

                  <span>
                    Email
                  </span>

                  <a
                    href={`mailto:${selectedLeader.email}`}
                  >
                    <Mail
                      size={17}
                    />

                    {
                      selectedLeader.email
                    }
                  </a>

                </div>

              )}


              <div className="leadership-detail">

                <span>
                  Display Order
                </span>

                <p>
                  {
                    selectedLeader.display_order
                  }
                </p>

              </div>


              <div className="leadership-detail">

                <span>
                  Biography
                </span>

                <p>
                  {selectedLeader.bio ||
                    "No biography has been added yet."}
                </p>

              </div>

            </div>


            <div className="leadership-drawer-footer">

              <button
                type="button"
                className="leadership-secondary-button leadership-danger-button"
                onClick={() =>
                  deleteLeader(
                    selectedLeader
                  )
                }
                disabled={
                  deletingId ===
                  selectedLeader.id
                }
              >

                {deletingId ===
                selectedLeader.id ? (

                  <Loader2
                    size={17}
                    className="spin"
                  />

                ) : (

                  <Trash2
                    size={17}
                  />

                )}

                Delete

              </button>


              <button
                type="button"
                className="leadership-primary-button"
                onClick={() =>
                  openEdit(
                    selectedLeader
                  )
                }
              >

                <Pencil
                  size={17}
                />

                Edit Profile

              </button>

            </div>

          </aside>

        </div>

      )}


      {/* ======================================================
          CREATE / EDIT MODAL
      ====================================================== */}

      {formOpen && (

        <div
          className="leadership-overlay"
          onMouseDown={(
            event
          ) => {

            if (
              event.target ===
                event.currentTarget &&
              !saving
            ) {
              closeForm();
            }

          }}
        >

          <section className="leadership-modal">

            <div className="leadership-modal-header">

              <div>

                <span>
                  {editingLeader
                    ? "Update Profile"
                    : "New Profile"}
                </span>

                <h2>
                  {editingLeader
                    ? "Edit Leader"
                    : "Add Leader"}
                </h2>

              </div>


              <button
                type="button"
                className="leadership-close-button"
                onClick={
                  closeForm
                }
                disabled={
                  saving
                }
                aria-label="Close form"
              >
                <X
                  size={20}
                />
              </button>

            </div>


            <form
              className="leadership-form"
              onSubmit={
                saveLeader
              }
            >

              <div className="leadership-form-grid">

                <label className="leadership-field">

                  <span>
                    Full Name *
                  </span>

                  <input
                    type="text"
                    name="name"
                    value={
                      form.name
                    }
                    onChange={
                      updateForm
                    }
                    placeholder="e.g. Dr. Jane Doe"
                    maxLength={
                      180
                    }
                    required
                  />

                </label>


                <label className="leadership-field">

                  <span>
                    Position *
                  </span>

                  <input
                    type="text"
                    name="position"
                    value={
                      form.position
                    }
                    onChange={
                      updateForm
                    }
                    placeholder="e.g. Chair"
                    maxLength={
                      180
                    }
                    required
                  />

                </label>


                <label className="leadership-field">

                  <span>
                    Email
                  </span>

                  <input
                    type="email"
                    name="email"
                    value={
                      form.email
                    }
                    onChange={
                      updateForm
                    }
                    placeholder="name@example.com"
                  />

                </label>


                <label className="leadership-field">

                  <span>
                    Status
                  </span>

                  <select
                    name="status"
                    value={
                      form.status
                    }
                    onChange={
                      updateForm
                    }
                  >

                    <option value="active">
                      Active
                    </option>

                    <option value="draft">
                      Draft
                    </option>

                    <option value="inactive">
                      Inactive
                    </option>

                  </select>

                </label>


                <label className="leadership-field leadership-field-full">

                  <span>
                    Image URL
                  </span>

                  <input
                    type="text"
                    name="image"
                    value={
                      form.image
                    }
                    onChange={
                      updateForm
                    }
                    placeholder="/assets/team/leader.webp or https://..."
                    maxLength={
                      1000
                    }
                  />

                </label>


                {form.image && (

                  <div className="leadership-image-preview leadership-field-full">

                    <span>
                      Image Preview
                    </span>

                    <div>

                      <img
                        src={
                          form.image
                        }
                        alt="Leadership preview"
                        onError={(
                          event
                        ) => {
                          event.currentTarget.style.display =
                            "none";
                        }}
                      />

                    </div>

                  </div>

                )}


                <label className="leadership-field">

                  <span>
                    Display Order
                  </span>

                  <input
                    type="number"
                    name="display_order"
                    min="0"
                    max="10000"
                    step="1"
                    value={
                      form.display_order
                    }
                    onChange={
                      updateForm
                    }
                  />

                </label>


                <div className="leadership-field leadership-order-help">

                  <span>
                    Ordering
                  </span>

                  <p>
                    Lower numbers appear before higher
                    numbers on the website.
                  </p>

                </div>


                <label className="leadership-field leadership-field-full">

                  <span>
                    Biography
                  </span>

                  <textarea
                    name="bio"
                    value={
                      form.bio
                    }
                    onChange={
                      updateForm
                    }
                    rows="7"
                    maxLength={
                      10000
                    }
                    placeholder="Write the leader's professional biography..."
                  />

                  <small>
                    {form.bio.length.toLocaleString()}
                    {" / "}
                    10,000
                  </small>

                </label>

              </div>


              <div className="leadership-form-actions">

                <button
                  type="button"
                  className="leadership-secondary-button"
                  onClick={
                    closeForm
                  }
                  disabled={
                    saving
                  }
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="leadership-primary-button"
                  disabled={
                    saving
                  }
                >

                  {saving ? (
                    <>
                      <Loader2
                        size={17}
                        className="spin"
                      />

                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2
                        size={17}
                      />

                      {editingLeader
                        ? "Save Changes"
                        : "Create Leader"}
                    </>
                  )}

                </button>

              </div>

            </form>

          </section>

        </div>

      )}

    </main>
  );
}