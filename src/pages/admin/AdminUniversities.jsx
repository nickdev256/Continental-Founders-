import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Building2,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  Link2,
  MapPin,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";

import "./AdminUniversities.css";


/* ============================================================
   API
============================================================ */

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";


/* ============================================================
   CONFIG
============================================================ */

const ITEMS_PER_PAGE = 6;

const FORM_STEPS = [
  {
    number: 1,
    label: "Institution",
  },
  {
    number: 2,
    label: "Partnership",
  },
  {
    number: 3,
    label: "Publishing",
  },
  {
    number: 4,
    label: "Review",
  },
];


/* ============================================================
   INITIAL FORM
============================================================ */

const initialForm = {
  name: "",
  shortName: "",
  city: "",
  country: "",
  type: "University",
  website: "",
  logoUrl: "",
  description: "",
  status: "draft",

  participationAreas: [
    "Faculty Expertise",
    "Research Collaboration",
    "Student Engagement",
    "Institutional Partnerships",
  ],
};


/* ============================================================
   HELPERS
============================================================ */

function getUniversityName(
  university
) {
  return (
    university?.name ||
    university?.universityName ||
    university?.university_name ||
    "Unnamed University"
  );
}


function getUniversityLocation(
  university
) {
  const combined = [
    university?.city,
    university?.country,
  ]
    .filter(Boolean)
    .join(", ")
    .trim();

  return (
    university?.location ||
    combined ||
    "Location not provided"
  );
}


function getUniversityLogo(
  university
) {
  return (
    university?.logoUrl ||
    university?.logo_url ||
    university?.logo ||
    ""
  );
}


function getUniversityShortName(
  university
) {
  return (
    university?.shortName ||
    university?.short_name ||
    ""
  );
}


function getParticipationAreas(
  university
) {
  const areas =
    university?.participationAreas ||
    university?.participation_areas;

  if (
    Array.isArray(areas)
  ) {
    return areas;
  }

  if (
    typeof areas === "string"
  ) {
    try {
      const parsed =
        JSON.parse(areas);

      return Array.isArray(parsed)
        ? parsed
        : [];
    } catch {
      return areas
        .split(",")
        .map((item) =>
          item.trim()
        )
        .filter(Boolean);
    }
  }

  return [];
}


function getStatusClass(
  status
) {
  const normalized =
    String(status || "")
      .trim()
      .toLowerCase();

  if (
    normalized === "active"
  ) {
    return "admin-universities__status admin-universities__status--active";
  }

  if (
    normalized === "pending"
  ) {
    return "admin-universities__status admin-universities__status--pending";
  }

  if (
    normalized === "inactive" ||
    normalized === "archived"
  ) {
    return "admin-universities__status admin-universities__status--inactive";
  }

  return "admin-universities__status admin-universities__status--draft";
}


/* ============================================================
   ADMIN UNIVERSITIES
============================================================ */

export default function AdminUniversities() {

  /* ==========================================================
     STATE
  ========================================================== */

  const [
    universities,
    setUniversities,
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
    searchQuery,
    setSearchQuery,
  ] =
    useState("");

  const [
    currentPage,
    setCurrentPage,
  ] =
    useState(1);

  const [
    selectedUniversity,
    setSelectedUniversity,
  ] =
    useState(null);

  const [
    formOpen,
    setFormOpen,
  ] =
    useState(false);

  const [
    formStep,
    setFormStep,
  ] =
    useState(1);

  const [
    editingUniversity,
    setEditingUniversity,
  ] =
    useState(null);

  const [
    form,
    setForm,
  ] =
    useState({
      ...initialForm,

      participationAreas: [
        ...initialForm.participationAreas,
      ],
    });

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


  /* ==========================================================
     REF
  ========================================================== */

  const nameInputRef =
    useRef(null);


  /* ==========================================================
     LOAD UNIVERSITIES
  ========================================================== */

  const loadUniversities =
    useCallback(
      async () => {
        try {
          setLoading(true);

          setError("");

          const response =
            await fetch(
              `${API_URL}/api/universities/directory`,
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
            const text =
              await response.text();

            console.error(
              "Unexpected universities response:",
              text
            );

            throw new Error(
              "The universities service returned an unexpected response."
            );
          }

          const result =
            await response.json();

          if (
            !response.ok
          ) {
            throw new Error(
              result?.message ||
              result?.error ||
              "Unable to load universities."
            );
          }

          const items =
            Array.isArray(
              result?.universities
            )
              ? result.universities
              : Array.isArray(
                  result?.data
                )
                ? result.data
                : Array.isArray(
                    result?.data?.universities
                  )
                  ? result.data.universities
                  : [];

          setUniversities(
            items
          );
        } catch (
          requestError
        ) {
          console.error(
            "Admin universities loading error:",
            requestError
          );

          setUniversities(
            []
          );

          setError(
            requestError?.message ||
            "Unable to load universities."
          );
        } finally {
          setLoading(
            false
          );
        }
      },
      []
    );


  /* ==========================================================
     INITIAL LOAD
  ========================================================== */

  useEffect(
    () => {
      loadUniversities();
    },
    [
      loadUniversities,
    ]
  );


  /* ==========================================================
     FOCUS NAME
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
            nameInputRef
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
     FILTER
  ========================================================== */

  const filteredUniversities =
    useMemo(
      () => {
        const query =
          searchQuery
            .trim()
            .toLowerCase();

        if (
          !query
        ) {
          return universities;
        }

        return universities.filter(
          (university) => {
            const searchable = [
              getUniversityName(
                university
              ),

              getUniversityShortName(
                university
              ),

              university.city,
              university.country,
              university.location,
              university.type,
              university.status,
              university.description,
              university.website,
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();

            return searchable.includes(
              query
            );
          }
        );
      },
      [
        universities,
        searchQuery,
      ]
    );


  /* ==========================================================
     COUNTS
  ========================================================== */

  const activeCount =
    useMemo(
      () =>
        universities.filter(
          (university) =>
            String(
              university.status ||
              ""
            )
              .trim()
              .toLowerCase() ===
            "active"
        ).length,
      [
        universities,
      ]
    );


  const pendingCount =
    useMemo(
      () =>
        universities.filter(
          (university) =>
            String(
              university.status ||
              ""
            )
              .trim()
              .toLowerCase() ===
            "pending"
        ).length,
      [
        universities,
      ]
    );


  /* ==========================================================
     PAGINATION
  ========================================================== */

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredUniversities.length /
        ITEMS_PER_PAGE
      )
    );


  useEffect(
    () => {
      setCurrentPage(
        1
      );
    },
    [
      searchQuery,
    ]
  );


  useEffect(
    () => {
      if (
        currentPage >
        totalPages
      ) {
        setCurrentPage(
          totalPages
        );
      }
    },
    [
      currentPage,
      totalPages,
    ]
  );


  const paginatedUniversities =
    useMemo(
      () => {
        const start =
          (
            currentPage -
            1
          ) *
          ITEMS_PER_PAGE;

        return filteredUniversities.slice(
          start,
          start +
          ITEMS_PER_PAGE
        );
      },
      [
        filteredUniversities,
        currentPage,
      ]
    );


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
      (current) => ({
        ...current,

        [name]:
          value,
      })
    );

    if (
      formError
    ) {
      setFormError(
        ""
      );
    }
  }


  /* ==========================================================
     PARTICIPATION TOGGLE
  ========================================================== */

  function toggleParticipationArea(
    area
  ) {
    setForm(
      (current) => {
        const exists =
          current
            .participationAreas
            .includes(
              area
            );

        return {
          ...current,

          participationAreas:
            exists
              ? current
                .participationAreas
                .filter(
                  (item) =>
                    item !==
                    area
                )
              : [
                  ...current.participationAreas,
                  area,
                ],
        };
      }
    );

    if (
      formError
    ) {
      setFormError(
        ""
      );
    }
  }


  /* ==========================================================
     CREATE
  ========================================================== */

  function handleCreateUniversity() {
    setSelectedUniversity(
      null
    );

    setEditingUniversity(
      null
    );

    setForm({
      ...initialForm,

      participationAreas: [
        ...initialForm
          .participationAreas,
      ],
    });

    setFormError(
      ""
    );

    setFormStep(
      1
    );

    setFormOpen(
      true
    );
  }


  /* ==========================================================
     EDIT
  ========================================================== */

  function handleEditUniversity(
    university
  ) {
    setSelectedUniversity(
      null
    );

    setEditingUniversity(
      university
    );

    const participationAreas =
      getParticipationAreas(
        university
      );

    setForm({
      name:
        getUniversityName(
          university
        ) ===
        "Unnamed University"
          ? ""
          : getUniversityName(
              university
            ),

      shortName:
        getUniversityShortName(
          university
        ),

      city:
        university?.city ||
        "",

      country:
        university?.country ||
        "",

      type:
        university?.type ||
        "University",

      website:
        university?.website ||
        "",

      logoUrl:
        getUniversityLogo(
          university
        ),

      description:
        university?.description ||
        university?.overview ||
        "",

      status:
        university?.status ||
        "draft",

      participationAreas:
        participationAreas.length
          ? participationAreas
          : [
              ...initialForm
                .participationAreas,
            ],
    });

    setFormError(
      ""
    );

    setFormStep(
      1
    );

    setFormOpen(
      true
    );
  }


  /* ==========================================================
     CLOSE FORM
  ========================================================== */

  function resetAndCloseForm() {
    setFormOpen(
      false
    );

    setEditingUniversity(
      null
    );

    setForm({
      ...initialForm,

      participationAreas: [
        ...initialForm
          .participationAreas,
      ],
    });

    setFormError(
      ""
    );

    setFormStep(
      1
    );
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
     VALIDATE
  ========================================================== */

  function validateStep(
    step
  ) {
    if (
      step === 1
    ) {
      if (
        !form.name.trim()
      ) {
        setFormError(
          "University name is required."
        );

        nameInputRef
          .current
          ?.focus();

        return false;
      }

      if (
        form.name
          .trim()
          .length <
        2
      ) {
        setFormError(
          "University name is too short."
        );

        return false;
      }

      if (
        !form.country.trim()
      ) {
        setFormError(
          "Country is required."
        );

        return false;
      }
    }

    if (
      step === 2
    ) {
      if (
        form.website.trim() &&
        !/^https?:\/\//i.test(
          form.website.trim()
        )
      ) {
        setFormError(
          "University website must begin with http:// or https://."
        );

        return false;
      }

      if (
        form.logoUrl.trim() &&
        !/^https?:\/\//i.test(
          form.logoUrl.trim()
        )
      ) {
        setFormError(
          "Logo URL must begin with http:// or https://."
        );

        return false;
      }
    }

    setFormError(
      ""
    );

    return true;
  }


  /* ==========================================================
     NEXT / PREVIOUS
  ========================================================== */

  function handleNextStep() {
    if (
      !validateStep(
        formStep
      )
    ) {
      return;
    }

    setFormStep(
      (current) =>
        Math.min(
          4,
          current + 1
        )
    );
  }


  function handlePreviousStep() {
    setFormError(
      ""
    );

    setFormStep(
      (current) =>
        Math.max(
          1,
          current - 1
        )
    );
  }


  /* ==========================================================
     SAVE UNIVERSITY
  ========================================================== */

  async function handleSaveUniversity() {
    if (
      !validateStep(
        1
      )
    ) {
      setFormStep(
        1
      );

      return;
    }

    if (
      !validateStep(
        2
      )
    ) {
      setFormStep(
        2
      );

      return;
    }

    try {
      setSaving(
        true
      );

      setFormError(
        ""
      );

      const editing =
        Boolean(
          editingUniversity?.id
        );

      const payload = {
        name:
          form.name.trim(),

        shortName:
          form.shortName.trim(),

        city:
          form.city.trim(),

        country:
          form.country.trim(),

        type:
          form.type.trim() ||
          "University",

        website:
          form.website.trim(),

        logoUrl:
          form.logoUrl.trim(),

        description:
          form.description.trim(),

        status:
          form.status,

        participationAreas:
          form.participationAreas,
      };


      /*
       * GET admin directory:
       * /api/universities/directory
       *
       * CREATE:
       * /api/universities
       *
       * UPDATE:
       * /api/universities/:id
       */

      const endpoint =
        editing
          ? `${API_URL}/api/universities/${editingUniversity.id}`
          : `${API_URL}/api/universities`;


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

              "Content-Type":
                "application/json",
            },

            credentials:
              "include",

            body:
              JSON.stringify(
                payload
              ),
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
        const text =
          await response.text();

        console.error(
          "Unexpected university save response:",
          text
        );

        throw new Error(
          "The universities service returned an unexpected response."
        );
      }


      const result =
        await response.json();


      if (
        !response.ok
      ) {
        throw new Error(
          result?.message ||
          result?.error ||
          (
            editing
              ? "Unable to update university."
              : "Unable to create university."
          )
        );
      }


      const savedUniversity =
        result?.university ||
        result?.data?.university ||
        result?.data ||
        null;


      if (
        savedUniversity?.id
      ) {
        setUniversities(
          (current) => {
            if (
              editing
            ) {
              return current.map(
                (university) =>
                  university.id ===
                  editingUniversity.id
                    ? savedUniversity
                    : university
              );
            }

            return [
              savedUniversity,
              ...current,
            ];
          }
        );
      } else {
        await loadUniversities();
      }


      resetAndCloseForm();

      setCurrentPage(
        1
      );
    } catch (
      saveError
    ) {
      console.error(
        "Save university error:",
        saveError
      );

      setFormError(
        saveError?.message ||
        "Unable to save university."
      );
    } finally {
      setSaving(
        false
      );
    }
  }


  /* ==========================================================
     DELETE UNIVERSITY
  ========================================================== */

  async function handleDeleteUniversity() {
    if (
      !editingUniversity?.id
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        `Delete "${getUniversityName(
          editingUniversity
        )}"? This action cannot be undone.`
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

      setFormError(
        ""
      );


      /*
       * DELETE:
       * /api/universities/:id
       */

      const response =
        await fetch(
          `${API_URL}/api/universities/${editingUniversity.id}`,
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
          result?.message ||
          result?.error ||
          "Unable to delete university."
        );
      }


      setUniversities(
        (current) =>
          current.filter(
            (university) =>
              university.id !==
              editingUniversity.id
          )
      );


      resetAndCloseForm();
    } catch (
      deleteError
    ) {
      console.error(
        "Delete university error:",
        deleteError
      );

      setFormError(
        deleteError?.message ||
        "Unable to delete university."
      );
    } finally {
      setDeleting(
        false
      );
    }
  }


  /* ==========================================================
     RENDER
  ========================================================== */

  return (

    <div className="admin-universities">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="admin-universities__header">

        <div>

          <span className="admin-universities__eyebrow">
            PARTNER ECOSYSTEM
          </span>

          <h1>
            Universities
          </h1>

          <p>
            Manage university partnerships,
            academic institutions, research relationships,
            faculty engagement and institutional collaboration.
          </p>

        </div>


        <button
          type="button"
          className="admin-universities__create"
          onClick={
            handleCreateUniversity
          }
        >

          <Plus
            size={17}
          />

          Add University

        </button>

      </div>


      {/* ======================================================
          SUMMARY
      ====================================================== */}

      <div className="admin-universities__summary-grid">

        <div className="admin-universities__summary-card">

          <GraduationCap
            size={20}
          />

          <div>

            <strong>
              {universities.length}
            </strong>

            <span>
              Total Universities
            </span>

          </div>

        </div>


        <div className="admin-universities__summary-card">

          <Building2
            size={20}
          />

          <div>

            <strong>
              {activeCount}
            </strong>

            <span>
              Active Partners
            </span>

          </div>

        </div>


        <div className="admin-universities__summary-card">

          <Users
            size={20}
          />

          <div>

            <strong>
              {pendingCount}
            </strong>

            <span>
              Pending
            </span>

          </div>

        </div>

      </div>


      {/* ======================================================
          TOOLBAR
      ====================================================== */}

      <div className="admin-universities__toolbar">

        <div className="admin-universities__search">

          <Search
            size={17}
          />

          <input
            type="search"
            value={
              searchQuery
            }
            placeholder="Search universities..."
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
                setSearchQuery(
                  ""
                )
              }
            >

              <X
                size={15}
              />

            </button>

          )}

        </div>


        <span className="admin-universities__count">

          {!loading &&
            `${filteredUniversities.length} ${
              filteredUniversities.length === 1
                ? "university"
                : "universities"
            }`}

        </span>

      </div>


      {/* ======================================================
          PANEL
      ====================================================== */}

      <section className="admin-universities__panel">

        <div className="admin-universities__table-header">

          <span>
            University
          </span>

          <span>
            Location
          </span>

          <span>
            Type
          </span>

          <span>
            Status
          </span>

          <span />

        </div>


        {loading && (

          <div className="admin-universities__empty">

            <RefreshCw
              size={27}
            />

            <h3>
              Loading universities
            </h3>

            <p>
              Retrieving partner institutions.
            </p>

          </div>

        )}


        {!loading &&
          error && (

            <div className="admin-universities__empty">

              <GraduationCap
                size={29}
              />

              <h3>
                Universities could not be loaded
              </h3>

              <p>
                {error}
              </p>


              <button
                type="button"
                onClick={
                  loadUniversities
                }
              >

                <RefreshCw
                  size={16}
                />

                Try Again

              </button>

            </div>

          )}


        {!loading &&
          !error &&
          filteredUniversities.length ===
            0 && (

            <div className="admin-universities__empty">

              <GraduationCap
                size={30}
              />


              <h3>

                {searchQuery
                  ? "No matching universities"
                  : "No universities yet"}

              </h3>


              <p>

                {searchQuery
                  ? "Try another university name, location, type or status."
                  : "Add the first university partnership to the Continental Founders network."}

              </p>


              {!searchQuery && (

                <button
                  type="button"
                  onClick={
                    handleCreateUniversity
                  }
                >

                  <Plus
                    size={16}
                  />

                  Add first university

                </button>

              )}

            </div>

          )}


        {!loading &&
          !error &&
          paginatedUniversities.length >
            0 && (

            <div className="admin-universities__list">

              {paginatedUniversities.map(
                (
                  university,
                  index
                ) => (

                  <button
                    key={
                      university.id ||
                      `${getUniversityName(
                        university
                      )}-${index}`
                    }
                    type="button"
                    className="admin-universities__row"
                    onClick={() =>
                      setSelectedUniversity(
                        university
                      )
                    }
                  >

                    <div className="admin-universities__university">

                      <div className="admin-universities__logo">

                        {getUniversityLogo(
                          university
                        ) ? (

                          <img
                            src={
                              getUniversityLogo(
                                university
                              )
                            }
                            alt=""
                          />

                        ) : (

                          <GraduationCap
                            size={19}
                          />

                        )}

                      </div>


                      <div>

                        <strong>
                          {getUniversityName(
                            university
                          )}
                        </strong>

                        <span>

                          {getUniversityShortName(
                            university
                          ) ||
                          "University Partner"}

                        </span>

                      </div>

                    </div>


                    <div className="admin-universities__location">

                      <MapPin
                        size={13}
                      />

                      <span>
                        {getUniversityLocation(
                          university
                        )}
                      </span>

                    </div>


                    <div className="admin-universities__type">

                      <Building2
                        size={13}
                      />

                      <span>
                        {university.type ||
                        "University"}
                      </span>

                    </div>


                    <div>

                      <span
                        className={
                          getStatusClass(
                            university.status
                          )
                        }
                      >

                        {university.status ||
                        "draft"}

                      </span>

                    </div>


                    <ChevronRight
                      size={16}
                    />

                  </button>

                )
              )}

            </div>

          )}


        {!loading &&
          !error &&
          filteredUniversities.length >
            ITEMS_PER_PAGE && (

            <div className="admin-universities__pagination">

              <button
                type="button"
                disabled={
                  currentPage ===
                  1
                }
                onClick={() =>
                  setCurrentPage(
                    (current) =>
                      Math.max(
                        1,
                        current - 1
                      )
                  )
                }
              >

                <ChevronLeft
                  size={15}
                />

                Previous

              </button>


              <span>
                Page {currentPage} of {totalPages}
              </span>


              <button
                type="button"
                disabled={
                  currentPage ===
                  totalPages
                }
                onClick={() =>
                  setCurrentPage(
                    (current) =>
                      Math.min(
                        totalPages,
                        current + 1
                      )
                  )
                }
              >

                Next

                <ChevronRight
                  size={15}
                />

              </button>

            </div>

          )}

      </section>


      {/* ======================================================
          DETAILS DRAWER
      ====================================================== */}

      {selectedUniversity && (

        <div
          className="admin-universities__overlay"
          onClick={() =>
            setSelectedUniversity(
              null
            )
          }
        >

          <aside
            className="admin-universities__drawer"
            onClick={(
              event
            ) =>
              event.stopPropagation()
            }
          >

            <div className="admin-universities__drawer-header">

              <div>

                <span className="admin-universities__drawer-eyebrow">
                  UNIVERSITY PARTNER
                </span>

                <h2>
                  {getUniversityName(
                    selectedUniversity
                  )}
                </h2>

              </div>


              <button
                type="button"
                className="admin-universities__drawer-close"
                onClick={() =>
                  setSelectedUniversity(
                    null
                  )
                }
              >

                <X
                  size={19}
                />

              </button>

            </div>


            <div className="admin-universities__drawer-body">

              <div className="admin-universities__profile">

                <div className="admin-universities__profile-logo">

                  {getUniversityLogo(
                    selectedUniversity
                  ) ? (

                    <img
                      src={
                        getUniversityLogo(
                          selectedUniversity
                        )
                      }
                      alt=""
                    />

                  ) : (

                    <GraduationCap
                      size={38}
                    />

                  )}

                </div>


                <div>

                  <h3>
                    {getUniversityName(
                      selectedUniversity
                    )}
                  </h3>

                  <p>
                    {getUniversityLocation(
                      selectedUniversity
                    )}
                  </p>

                </div>

              </div>


              <div className="admin-universities__detail-row">

                <span>
                  Partnership Status
                </span>

                <span
                  className={
                    getStatusClass(
                      selectedUniversity.status
                    )
                  }
                >
                  {selectedUniversity.status ||
                  "draft"}
                </span>

              </div>


              <div className="admin-universities__detail-card">

                <MapPin
                  size={18}
                />

                <div>

                  <span>
                    Location
                  </span>

                  <strong>
                    {getUniversityLocation(
                      selectedUniversity
                    )}
                  </strong>

                </div>

              </div>


              <div className="admin-universities__detail-card">

                <Building2
                  size={18}
                />

                <div>

                  <span>
                    Institution Type
                  </span>

                  <strong>
                    {selectedUniversity.type ||
                    "University"}
                  </strong>

                </div>

              </div>


              <div className="admin-universities__detail-card">

                <Link2
                  size={18}
                />

                <div>

                  <span>
                    Website
                  </span>


                  {selectedUniversity.website ? (

                    <a
                      href={
                        selectedUniversity.website
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {selectedUniversity.website}
                    </a>

                  ) : (

                    <strong>
                      Not provided
                    </strong>

                  )}

                </div>

              </div>


              <div className="admin-universities__description">

                <span>
                  Partnership Overview
                </span>

                <p>
                  {selectedUniversity.description ||
                  selectedUniversity.overview ||
                  "No partnership description has been added."}
                </p>

              </div>


              <div className="admin-universities__participation">

                <span>
                  Participation Areas
                </span>


                <div className="admin-universities__participation-list">

                  {getParticipationAreas(
                    selectedUniversity
                  ).length >
                    0 ? (

                    getParticipationAreas(
                      selectedUniversity
                    ).map(
                      (
                        area,
                        index
                      ) => (

                        <div
                          key={`${area}-${index}`}
                          className="admin-universities__participation-item"
                        >
                          {area}
                        </div>

                      )
                    )

                  ) : (

                    <div className="admin-universities__participation-empty">
                      No participation areas added.
                    </div>

                  )}

                </div>

              </div>


              <div className="admin-universities__drawer-actions">

                <button
                  type="button"
                  className="admin-universities__edit"
                  onClick={() =>
                    handleEditUniversity(
                      selectedUniversity
                    )
                  }
                >
                  Edit University
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
          className="admin-universities__overlay"
          onClick={
            closeForm
          }
        >

          <aside
            className="admin-universities__drawer admin-universities__form-drawer"
            onClick={(
              event
            ) =>
              event.stopPropagation()
            }
          >

            <div className="admin-universities__drawer-header">

              <div>

                <span className="admin-universities__drawer-eyebrow">

                  {editingUniversity
                    ? "EDIT UNIVERSITY"
                    : "NEW UNIVERSITY"}

                </span>


                <h2>

                  {editingUniversity
                    ? "Update University"
                    : "Add University"}

                </h2>

              </div>


              <button
                type="button"
                className="admin-universities__drawer-close"
                onClick={
                  closeForm
                }
                disabled={
                  saving ||
                  deleting
                }
              >

                <X
                  size={19}
                />

              </button>

            </div>


            <div className="admin-universities__steps">

              {FORM_STEPS.map(
                (step) => (

                  <div
                    key={
                      step.number
                    }
                    className={
                      formStep ===
                      step.number
                        ? "admin-universities__step active"
                        : formStep >
                          step.number
                          ? "admin-universities__step complete"
                          : "admin-universities__step"
                    }
                  >

                    <span>
                      {step.number}
                    </span>

                    <small>
                      {step.label}
                    </small>

                  </div>

                )
              )}

            </div>


            <div className="admin-universities__form">

              {formError && (

                <div className="admin-universities__form-error">
                  {formError}
                </div>

              )}


              {/* STEP 1 */}

              {formStep === 1 && (
                <>

                  <div className="admin-universities__step-heading">

                    <h3>
                      Institution Details
                    </h3>

                    <p>
                      Add the university identity and location.
                    </p>

                  </div>


                  <div className="admin-universities__field">

                    <label>
                      University Name *
                    </label>

                    <input
                      ref={
                        nameInputRef
                      }
                      name="name"
                      value={
                        form.name
                      }
                      onChange={
                        handleFormChange
                      }
                      placeholder="e.g. Uganda Christian University"
                    />

                  </div>


                  <div className="admin-universities__field">

                    <label>
                      Short Name
                    </label>

                    <input
                      name="shortName"
                      value={
                        form.shortName
                      }
                      onChange={
                        handleFormChange
                      }
                      placeholder="e.g. UCU"
                    />

                  </div>


                  <div className="admin-universities__form-grid">

                    <div className="admin-universities__field">

                      <label>
                        City
                      </label>

                      <input
                        name="city"
                        value={
                          form.city
                        }
                        onChange={
                          handleFormChange
                        }
                        placeholder="City"
                      />

                    </div>


                    <div className="admin-universities__field">

                      <label>
                        Country *
                      </label>

                      <input
                        name="country"
                        value={
                          form.country
                        }
                        onChange={
                          handleFormChange
                        }
                        placeholder="Country"
                      />

                    </div>

                  </div>


                  <div className="admin-universities__field">

                    <label>
                      Institution Type
                    </label>

                    <select
                      name="type"
                      value={
                        form.type
                      }
                      onChange={
                        handleFormChange
                      }
                    >

                      <option value="University">
                        University
                      </option>

                      <option value="Research University">
                        Research University
                      </option>

                      <option value="Public University">
                        Public University
                      </option>

                      <option value="Private University">
                        Private University
                      </option>

                      <option value="College">
                        College
                      </option>

                      <option value="Research Institution">
                        Research Institution
                      </option>

                    </select>

                  </div>

                </>
              )}


              {/* STEP 2 */}

              {formStep === 2 && (
                <>

                  <div className="admin-universities__step-heading">

                    <h3>
                      Partnership Information
                    </h3>

                    <p>
                      Add website, branding and collaboration details.
                    </p>

                  </div>


                  <div className="admin-universities__field">

                    <label>
                      Website
                    </label>

                    <input
                      name="website"
                      type="url"
                      value={
                        form.website
                      }
                      onChange={
                        handleFormChange
                      }
                      placeholder="https://university.edu"
                    />

                  </div>


                  <div className="admin-universities__field">

                    <label>
                      Logo URL
                    </label>

                    <input
                      name="logoUrl"
                      type="url"
                      value={
                        form.logoUrl
                      }
                      onChange={
                        handleFormChange
                      }
                      placeholder="https://..."
                    />

                  </div>


                  {form.logoUrl && (

                    <div className="admin-universities__logo-preview">

                      <img
                        src={
                          form.logoUrl
                        }
                        alt="University logo preview"
                      />

                    </div>

                  )}


                  <div className="admin-universities__field">

                    <label>
                      Partnership Overview
                    </label>

                    <textarea
                      name="description"
                      value={
                        form.description
                      }
                      onChange={
                        handleFormChange
                      }
                      rows={6}
                      placeholder="Describe the relationship and collaboration..."
                    />

                  </div>


                  <div className="admin-universities__field">

                    <label>
                      Participation Areas
                    </label>


                    <div className="admin-universities__checkbox-grid">

                      {[
                        "Faculty Expertise",
                        "Research Collaboration",
                        "Student Engagement",
                        "Institutional Partnerships",
                      ].map(
                        (area) => (

                          <label
                            key={
                              area
                            }
                            className="admin-universities__checkbox"
                          >

                            <input
                              type="checkbox"
                              checked={
                                form
                                  .participationAreas
                                  .includes(
                                    area
                                  )
                              }
                              onChange={() =>
                                toggleParticipationArea(
                                  area
                                )
                              }
                            />

                            <span>
                              {area}
                            </span>

                          </label>

                        )
                      )}

                    </div>

                  </div>

                </>
              )}


              {/* STEP 3 */}

              {formStep === 3 && (
                <>

                  <div className="admin-universities__step-heading">

                    <h3>
                      Partnership Status
                    </h3>

                    <p>
                      Control whether the university appears publicly.
                    </p>

                  </div>


                  <div className="admin-universities__field">

                    <label>
                      Status
                    </label>

                    <select
                      name="status"
                      value={
                        form.status
                      }
                      onChange={
                        handleFormChange
                      }
                    >

                      <option value="draft">
                        Draft
                      </option>

                      <option value="pending">
                        Pending
                      </option>

                      <option value="active">
                        Active Partner
                      </option>

                      <option value="inactive">
                        Inactive
                      </option>

                      <option value="archived">
                        Archived
                      </option>

                    </select>

                  </div>


                  <div className="admin-universities__publishing-note">

                    {form.status ===
                    "active" ? (
                      <p>
                        This university will appear on the public Universities page after saving.
                      </p>
                    ) : (
                      <p>
                        This university will remain hidden from the public Universities page.
                      </p>
                    )}

                  </div>

                </>
              )}


              {/* STEP 4 */}

              {formStep === 4 && (
                <>

                  <div className="admin-universities__step-heading">

                    <h3>
                      Review University
                    </h3>

                    <p>
                      Confirm the information before saving.
                    </p>

                  </div>


                  <div className="admin-universities__review">

                    <div>

                      <span>
                        University
                      </span>

                      <strong>
                        {form.name}
                      </strong>

                    </div>


                    <div>

                      <span>
                        Short Name
                      </span>

                      <strong>
                        {form.shortName ||
                        "Not provided"}
                      </strong>

                    </div>


                    <div>

                      <span>
                        Location
                      </span>

                      <strong>

                        {[
                          form.city,
                          form.country,
                        ]
                          .filter(Boolean)
                          .join(", ") ||
                        "Not provided"}

                      </strong>

                    </div>


                    <div>

                      <span>
                        Type
                      </span>

                      <strong>
                        {form.type}
                      </strong>

                    </div>


                    <div>

                      <span>
                        Status
                      </span>

                      <strong>
                        {form.status}
                      </strong>

                    </div>


                    <div>

                      <span>
                        Website
                      </span>

                      <strong>
                        {form.website ||
                        "Not provided"}
                      </strong>

                    </div>


                    <div className="admin-universities__review-wide">

                      <span>
                        Partnership Overview
                      </span>

                      <p>
                        {form.description ||
                        "No overview provided."}
                      </p>

                    </div>


                    <div className="admin-universities__review-wide">

                      <span>
                        Participation Areas
                      </span>


                      <div className="admin-universities__review-tags">

                        {form
                          .participationAreas
                          .length ? (

                          form
                            .participationAreas
                            .map(
                              (area) => (

                                <span
                                  key={
                                    area
                                  }
                                >
                                  {area}
                                </span>

                              )
                            )

                        ) : (

                          <p>
                            None selected.
                          </p>

                        )}

                      </div>

                    </div>

                  </div>

                </>
              )}


              {/* =================================================
                  ACTIONS
              ================================================= */}

              <div className="admin-universities__form-actions">

                {editingUniversity &&
                  formStep === 4 && (

                    <button
                      type="button"
                      className="admin-universities__delete"
                      onClick={
                        handleDeleteUniversity
                      }
                      disabled={
                        saving ||
                        deleting
                      }
                    >

                      <Trash2
                        size={16}
                      />

                      {deleting
                        ? "Deleting..."
                        : "Delete University"}

                    </button>

                  )}


                <div className="admin-universities__form-actions-right">

                  {formStep > 1 && (

                    <button
                      type="button"
                      className="admin-universities__cancel"
                      onClick={
                        handlePreviousStep
                      }
                      disabled={
                        saving ||
                        deleting
                      }
                    >

                      <ChevronLeft
                        size={15}
                      />

                      Previous

                    </button>

                  )}


                  {formStep < 4 ? (

                    <button
                      type="button"
                      className="admin-universities__save"
                      onClick={
                        handleNextStep
                      }
                      disabled={
                        saving ||
                        deleting
                      }
                    >

                      Next

                      <ChevronRight
                        size={15}
                      />

                    </button>

                  ) : (

                    <button
                      type="button"
                      className="admin-universities__save"
                      onClick={
                        handleSaveUniversity
                      }
                      disabled={
                        saving ||
                        deleting
                      }
                    >

                      {saving ? (

                        <RefreshCw
                          size={16}
                        />

                      ) : (

                        <Save
                          size={16}
                        />

                      )}


                      {saving
                        ? "Saving..."
                        : editingUniversity
                          ? "Save Changes"
                          : "Add University"}

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