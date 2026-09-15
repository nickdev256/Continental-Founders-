import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ArrowUpRight,
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  Globe2,
  ImagePlus,
  Layers3,
  MapPin,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trash2,
  UserRound,
  Users,
  X,
} from "lucide-react";

import "./AdminVentures.css";


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
    label: "Venture",
  },
  {
    number: 2,
    label: "Business",
  },
  {
    number: 3,
    label: "Founders",
  },
  {
    number: 4,
    label: "Review",
  },
];


const DEFAULT_LOOKING_FOR = [
  "Strategic partnerships",
  "Mentorship",
  "Market access",
  "Investment pathways",
];


const DEFAULT_OPPORTUNITY_AREAS = [
  {
    title: "Problem",
    text: "",
  },
  {
    title: "Solution",
    text: "",
  },
  {
    title: "Market",
    text: "",
  },
  {
    title: "Current Stage",
    text: "",
  },
];


/* ============================================================
   INITIAL FORM
============================================================ */

const initialForm = {
  name: "",
  slug: "",
  sector: "",
  country: "",
  stage: "",

  tagline: "",
  description: "",
  longDescription: "",
  secondaryDescription: "",

  problem: "",
  solution: "",
  market: "",

  website: "",
  email: "",
  phone: "",
  secondaryPhone: "",

  logoUrl: "",
  heroImageUrl: "",

  founders: [
    {
      name: "",
      role: "Founder",
      image: "",
      bio: "",
    },
  ],

  services: [""],

  lookingFor: [
    ...DEFAULT_LOOKING_FOR,
  ],

  opportunityAreas:
    DEFAULT_OPPORTUNITY_AREAS.map(
      (item) => ({
        ...item,
      })
    ),

  status: "draft",
};


/* ============================================================
   HELPERS
============================================================ */

function slugify(value = "") {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}


function getVentureLogo(venture) {
  return (
    venture?.logo ||
    venture?.logoUrl ||
    venture?.logo_url ||
    ""
  );
}


function getHeroImage(venture) {
  return (
    venture?.heroImage ||
    venture?.heroImageUrl ||
    venture?.hero_image_url ||
    ""
  );
}


function getFounders(venture) {
  if (
    Array.isArray(
      venture?.founders
    )
  ) {
    return venture.founders;
  }

  if (venture?.founder) {
    return [
      {
        name:
          venture.founder,

        role:
          "Founder",

        image:
          venture.founderImage ||
          "",

        bio:
          venture.founderBio ||
          "",
      },
    ];
  }

  return [];
}


function getFounderNames(
  venture
) {
  const founders =
    getFounders(
      venture
    );

  if (!founders.length) {
    return "No founder added";
  }

  return founders
    .map(
      (founder) =>
        founder?.name
    )
    .filter(Boolean)
    .join(" & ");
}


function getServices(
  venture
) {
  return Array.isArray(
    venture?.services
  )
    ? venture.services
    : [];
}


function getLookingFor(
  venture
) {
  const items =
    venture?.lookingFor ||
    venture?.looking_for;

  return Array.isArray(
    items
  )
    ? items
    : [];
}


function getOpportunityAreas(
  venture
) {
  const items =
    venture?.opportunityAreas ||
    venture?.opportunity_areas;

  return Array.isArray(
    items
  )
    ? items
    : [];
}


function getStatusClass(
  status
) {
  const value =
    String(status || "")
      .trim()
      .toLowerCase();

  if (
    value === "published"
  ) {
    return "admin-ventures__status admin-ventures__status--published";
  }

  if (
    value === "archived"
  ) {
    return "admin-ventures__status admin-ventures__status--archived";
  }

  return "admin-ventures__status admin-ventures__status--draft";
}


function cloneInitialForm() {
  return {
    ...initialForm,

    founders:
      initialForm.founders.map(
        (founder) => ({
          ...founder,
        })
      ),

    services: [
      ...initialForm.services,
    ],

    lookingFor: [
      ...initialForm.lookingFor,
    ],

    opportunityAreas:
      initialForm.opportunityAreas.map(
        (item) => ({
          ...item,
        })
      ),
  };
}


/* ============================================================
   ADMIN VENTURES
============================================================ */

export default function AdminVentures() {

  /* ==========================================================
     STATE
  ========================================================== */

  const [
    ventures,
    setVentures,
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
    selectedVenture,
    setSelectedVenture,
  ] =
    useState(null);

  const [
    formOpen,
    setFormOpen,
  ] =
    useState(false);

  const [
    editingVenture,
    setEditingVenture,
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
    useState(
      cloneInitialForm()
    );

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
     REFS
  ========================================================== */

  const nameInputRef =
    useRef(null);


  /* ==========================================================
     LOAD VENTURES
  ========================================================== */

  const loadVentures =
    useCallback(
      async () => {
        try {
          setLoading(true);

          setError("");

          const response =
            await fetch(
              `${API_URL}/api/ventures/directory`,
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
              "Unexpected venture directory response:",
              text
            );

            throw new Error(
              "The venture service returned an unexpected response."
            );
          }

          const result =
            await response.json();

          if (!response.ok) {
            throw new Error(
              result?.message ||
              result?.error ||
              "Unable to load ventures."
            );
          }

          setVentures(
            Array.isArray(
              result?.ventures
            )
              ? result.ventures
              : []
          );
        } catch (
          requestError
        ) {
          console.error(
            "Admin ventures error:",
            requestError
          );

          setVentures([]);

          setError(
            requestError?.message ||
            "Unable to load ventures."
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
    loadVentures();
  }, [
    loadVentures,
  ]);


  /* ==========================================================
     AUTO FOCUS
  ========================================================== */

  useEffect(() => {
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
  }, [
    formOpen,
    formStep,
  ]);


  /* ==========================================================
     FILTER
  ========================================================== */

  const filteredVentures =
    useMemo(() => {
      const query =
        searchQuery
          .trim()
          .toLowerCase();

      if (!query) {
        return ventures;
      }

      return ventures.filter(
        (venture) => {
          const searchable = [
            venture.name,
            venture.slug,
            venture.sector,
            venture.country,
            venture.stage,
            venture.tagline,
            venture.description,
            getFounderNames(
              venture
            ),
            venture.status,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return searchable.includes(
            query
          );
        }
      );
    }, [
      ventures,
      searchQuery,
    ]);


  /* ==========================================================
     STATS
  ========================================================== */

  const publishedCount =
    useMemo(
      () =>
        ventures.filter(
          (venture) =>
            String(
              venture?.status ||
              ""
            )
              .toLowerCase()
              .trim() ===
            "published"
        ).length,
      [
        ventures,
      ]
    );


  const draftCount =
    useMemo(
      () =>
        ventures.filter(
          (venture) =>
            String(
              venture?.status ||
              ""
            )
              .toLowerCase()
              .trim() ===
            "draft"
        ).length,
      [
        ventures,
      ]
    );


  const archivedCount =
    useMemo(
      () =>
        ventures.filter(
          (venture) =>
            String(
              venture?.status ||
              ""
            )
              .toLowerCase()
              .trim() ===
            "archived"
        ).length,
      [
        ventures,
      ]
    );


  /* ==========================================================
     PAGINATION
  ========================================================== */

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredVentures.length /
        ITEMS_PER_PAGE
      )
    );


  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
  ]);


  useEffect(() => {
    if (
      currentPage >
      totalPages
    ) {
      setCurrentPage(
        totalPages
      );
    }
  }, [
    currentPage,
    totalPages,
  ]);


  const paginatedVentures =
    useMemo(() => {
      const start =
        (
          currentPage -
          1
        ) *
        ITEMS_PER_PAGE;

      return filteredVentures.slice(
        start,
        start +
        ITEMS_PER_PAGE
      );
    }, [
      filteredVentures,
      currentPage,
    ]);


  /* ==========================================================
     BASIC FORM CHANGE
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
        [name]: value,
      })
    );

    if (formError) {
      setFormError("");
    }
  }


  /* ==========================================================
     NAME + SLUG
  ========================================================== */

  function handleNameChange(
    event
  ) {
    const value =
      event.target.value;

    setForm(
      (current) => {
        const oldAutoSlug =
          slugify(
            current.name
          );

        const shouldUpdateSlug =
          !current.slug ||
          current.slug ===
            oldAutoSlug;

        return {
          ...current,

          name:
            value,

          slug:
            shouldUpdateSlug
              ? slugify(
                  value
                )
              : current.slug,
        };
      }
    );

    if (formError) {
      setFormError("");
    }
  }


  function handleSlugChange(
    event
  ) {
    setForm(
      (current) => ({
        ...current,

        slug:
          slugify(
            event.target.value
          ),
      })
    );
  }


  /* ==========================================================
     FOUNDERS
  ========================================================== */

  function updateFounder(
    index,
    field,
    value
  ) {
    setForm(
      (current) => ({
        ...current,

        founders:
          current.founders.map(
            (
              founder,
              founderIndex
            ) =>
              founderIndex ===
              index
                ? {
                    ...founder,
                    [field]:
                      value,
                  }
                : founder
          ),
      })
    );
  }


  function addFounder() {
    setForm(
      (current) => ({
        ...current,

        founders: [
          ...current.founders,

          {
            name: "",
            role: "Founder",
            image: "",
            bio: "",
          },
        ],
      })
    );
  }


  function removeFounder(
    index
  ) {
    setForm(
      (current) => ({
        ...current,

        founders:
          current.founders.length <=
          1
            ? current.founders
            : current.founders.filter(
                (
                  _founder,
                  founderIndex
                ) =>
                  founderIndex !==
                  index
              ),
      })
    );
  }


  /* ==========================================================
     SERVICES
  ========================================================== */

  function updateService(
    index,
    value
  ) {
    setForm(
      (current) => ({
        ...current,

        services:
          current.services.map(
            (
              service,
              serviceIndex
            ) =>
              serviceIndex ===
              index
                ? value
                : service
          ),
      })
    );
  }


  function addService() {
    setForm(
      (current) => ({
        ...current,

        services: [
          ...current.services,
          "",
        ],
      })
    );
  }


  function removeService(
    index
  ) {
    setForm(
      (current) => ({
        ...current,

        services:
          current.services.length <=
          1
            ? [""]
            : current.services.filter(
                (
                  _service,
                  serviceIndex
                ) =>
                  serviceIndex !==
                  index
              ),
      })
    );
  }


  /* ==========================================================
     LOOKING FOR
  ========================================================== */

  function updateLookingFor(
    index,
    value
  ) {
    setForm(
      (current) => ({
        ...current,

        lookingFor:
          current.lookingFor.map(
            (
              item,
              itemIndex
            ) =>
              itemIndex ===
              index
                ? value
                : item
          ),
      })
    );
  }


  function addLookingFor() {
    setForm(
      (current) => ({
        ...current,

        lookingFor: [
          ...current.lookingFor,
          "",
        ],
      })
    );
  }


  function removeLookingFor(
    index
  ) {
    setForm(
      (current) => ({
        ...current,

        lookingFor:
          current.lookingFor.length <=
          1
            ? [""]
            : current.lookingFor.filter(
                (
                  _item,
                  itemIndex
                ) =>
                  itemIndex !==
                  index
              ),
      })
    );
  }


  /* ==========================================================
     OPPORTUNITY AREAS
  ========================================================== */

  function updateOpportunityArea(
    index,
    field,
    value
  ) {
    setForm(
      (current) => ({
        ...current,

        opportunityAreas:
          current.opportunityAreas.map(
            (
              item,
              itemIndex
            ) =>
              itemIndex ===
              index
                ? {
                    ...item,
                    [field]:
                      value,
                  }
                : item
          ),
      })
    );
  }


  /* ==========================================================
     CREATE
  ========================================================== */

  function handleCreateVenture() {
    setSelectedVenture(
      null
    );

    setEditingVenture(
      null
    );

    setForm(
      cloneInitialForm()
    );

    setFormError("");

    setFormStep(1);

    setFormOpen(true);
  }


  /* ==========================================================
     EDIT
  ========================================================== */

  function handleEditVenture(
    venture
  ) {
    setSelectedVenture(
      null
    );

    setEditingVenture(
      venture
    );

    const founders =
      getFounders(
        venture
      );

    const services =
      getServices(
        venture
      );

    const lookingFor =
      getLookingFor(
        venture
      );

    const opportunityAreas =
      getOpportunityAreas(
        venture
      );


    setForm({
      name:
        venture?.name ||
        "",

      slug:
        venture?.slug ||
        "",

      sector:
        venture?.sector ||
        "",

      country:
        venture?.country ||
        "",

      stage:
        venture?.stage ||
        "",

      tagline:
        venture?.tagline ||
        "",

      description:
        venture?.description ||
        "",

      longDescription:
        venture?.longDescription ||
        venture?.long_description ||
        "",

      secondaryDescription:
        venture?.secondaryDescription ||
        venture?.secondary_description ||
        "",

      problem:
        venture?.problem ||
        "",

      solution:
        venture?.solution ||
        "",

      market:
        venture?.market ||
        "",

      website:
        venture?.website ||
        "",

      email:
        venture?.email ||
        "",

      phone:
        venture?.phone ||
        "",

      secondaryPhone:
        venture?.secondaryPhone ||
        venture?.secondary_phone ||
        "",

      logoUrl:
        getVentureLogo(
          venture
        ),

      heroImageUrl:
        getHeroImage(
          venture
        ),

      founders:
        founders.length
          ? founders.map(
              (founder) => ({
                name:
                  founder?.name ||
                  "",

                role:
                  founder?.role ||
                  "Founder",

                image:
                  founder?.image ||
                  "",

                bio:
                  founder?.bio ||
                  "",
              })
            )
          : [
              {
                name: "",
                role: "Founder",
                image: "",
                bio: "",
              },
            ],

      services:
        services.length
          ? [...services]
          : [""],

      lookingFor:
        lookingFor.length
          ? [...lookingFor]
          : [
              ...DEFAULT_LOOKING_FOR,
            ],

      opportunityAreas:
        opportunityAreas.length
          ? opportunityAreas.map(
              (item) => ({
                title:
                  item?.title ||
                  "",

                text:
                  item?.text ||
                  "",
              })
            )
          : DEFAULT_OPPORTUNITY_AREAS.map(
              (item) => ({
                ...item,
              })
            ),

      status:
        venture?.status ||
        "draft",
    });

    setFormError("");

    setFormStep(1);

    setFormOpen(true);
  }


  /* ==========================================================
     CLOSE
  ========================================================== */

  function resetAndCloseForm() {
    setFormOpen(false);

    setEditingVenture(
      null
    );

    setForm(
      cloneInitialForm()
    );

    setFormError("");

    setFormStep(1);
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
     VALIDATION
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
          "Venture name is required."
        );

        nameInputRef
          .current
          ?.focus();

        return false;
      }

      if (
        !form.slug.trim()
      ) {
        setFormError(
          "Venture slug is required."
        );

        return false;
      }

      if (
        !form.sector.trim()
      ) {
        setFormError(
          "Sector is required."
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

      if (
        !form.stage.trim()
      ) {
        setFormError(
          "Venture stage is required."
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
          "Website must begin with http:// or https://."
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

      if (
        form.heroImageUrl.trim() &&
        !/^https?:\/\//i.test(
          form.heroImageUrl.trim()
        )
      ) {
        setFormError(
          "Hero image URL must begin with http:// or https://."
        );

        return false;
      }
    }


    if (
      step === 3
    ) {
      const validFounders =
        form.founders.filter(
          (founder) =>
            founder.name.trim()
        );

      if (
        validFounders.length ===
        0
      ) {
        setFormError(
          "Add at least one founder."
        );

        return false;
      }
    }


    setFormError("");

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
    setFormError("");

    setFormStep(
      (current) =>
        Math.max(
          1,
          current - 1
        )
    );
  }


  /* ==========================================================
     SAVE
  ========================================================== */

  async function handleSaveVenture() {
    if (
      !validateStep(1)
    ) {
      setFormStep(1);
      return;
    }

    if (
      !validateStep(2)
    ) {
      setFormStep(2);
      return;
    }

    if (
      !validateStep(3)
    ) {
      setFormStep(3);
      return;
    }

    try {
      setSaving(true);

      setFormError("");

      const editing =
        Boolean(
          editingVenture?.id
        );


      const founders =
        form.founders
          .map(
            (founder) => ({
              name:
                founder.name.trim(),

              role:
                founder.role.trim() ||
                "Founder",

              image:
                founder.image.trim(),

              bio:
                founder.bio.trim(),
            })
          )
          .filter(
            (founder) =>
              founder.name
          );


      const services =
        form.services
          .map(
            (service) =>
              service.trim()
          )
          .filter(Boolean);


      const lookingFor =
        form.lookingFor
          .map(
            (item) =>
              item.trim()
          )
          .filter(Boolean);


      const opportunityAreas =
        form.opportunityAreas
          .map(
            (item) => ({
              title:
                item.title.trim(),

              text:
                item.text.trim(),
            })
          )
          .filter(
            (item) =>
              item.title &&
              item.text
          );


      const payload = {
        name:
          form.name.trim(),

        slug:
          slugify(
            form.slug
          ),

        sector:
          form.sector.trim(),

        country:
          form.country.trim(),

        stage:
          form.stage.trim(),

        tagline:
          form.tagline.trim(),

        description:
          form.description.trim(),

        longDescription:
          form.longDescription.trim(),

        secondaryDescription:
          form.secondaryDescription.trim(),

        problem:
          form.problem.trim(),

        solution:
          form.solution.trim(),

        market:
          form.market.trim(),

        website:
          form.website.trim(),

        email:
          form.email.trim(),

        phone:
          form.phone.trim(),

        secondaryPhone:
          form.secondaryPhone.trim(),

        logoUrl:
          form.logoUrl.trim(),

        heroImageUrl:
          form.heroImageUrl.trim(),

        founders,

        services,

        lookingFor,

        opportunityAreas,

        status:
          form.status,
      };


      const endpoint =
        editing
          ? `${API_URL}/api/ventures/${editingVenture.id}`
          : `${API_URL}/api/ventures`;


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
          "Unexpected venture save response:",
          text
        );

        throw new Error(
          "The venture service returned an unexpected response."
        );
      }


      const result =
        await response.json();


      if (!response.ok) {
        throw new Error(
          result?.message ||
          result?.error ||
          (
            editing
              ? "Unable to update venture."
              : "Unable to create venture."
          )
        );
      }


      const savedVenture =
        result?.venture ||
        null;


      if (
        savedVenture?.id
      ) {
        setVentures(
          (current) => {
            if (
              editing
            ) {
              return current.map(
                (venture) =>
                  venture.id ===
                  editingVenture.id
                    ? savedVenture
                    : venture
              );
            }

            return [
              savedVenture,
              ...current,
            ];
          }
        );
      } else {
        await loadVentures();
      }


      resetAndCloseForm();

      setCurrentPage(1);
    } catch (
      saveError
    ) {
      console.error(
        "Save venture error:",
        saveError
      );

      setFormError(
        saveError?.message ||
        "Unable to save venture."
      );
    } finally {
      setSaving(false);
    }
  }


  /* ==========================================================
     DELETE
  ========================================================== */

  async function handleDeleteVenture() {
    if (
      !editingVenture?.id
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        `Delete "${editingVenture.name}"? This action cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);

      setFormError("");

      const response =
        await fetch(
          `${API_URL}/api/ventures/${editingVenture.id}`,
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


      const result =
        contentType.includes(
          "application/json"
        )
          ? await response.json()
          : {};


      if (!response.ok) {
        throw new Error(
          result?.message ||
          result?.error ||
          "Unable to delete venture."
        );
      }


      setVentures(
        (current) =>
          current.filter(
            (venture) =>
              venture.id !==
              editingVenture.id
          )
      );


      resetAndCloseForm();
    } catch (
      deleteError
    ) {
      console.error(
        "Delete venture error:",
        deleteError
      );

      setFormError(
        deleteError?.message ||
        "Unable to delete venture."
      );
    } finally {
      setDeleting(false);
    }
  }


  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <div className="admin-ventures">


      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="admin-ventures__header">

        <div>

          <span className="admin-ventures__eyebrow">
            VENTURE MANAGEMENT
          </span>

          <h1>
            Ventures
          </h1>

          <p>
            Manage venture profiles, founders,
            business information, opportunities
            and publication status.
          </p>

        </div>


        <button
          type="button"
          className="admin-ventures__create"
          onClick={
            handleCreateVenture
          }
        >
          <Plus size={17} />

          Add Venture
        </button>

      </div>


      {/* ======================================================
          STATS
      ====================================================== */}

      <div className="admin-ventures__summary-grid">

        <div className="admin-ventures__summary-card">

          <BriefcaseBusiness
            size={20}
          />

          <div>
            <strong>
              {ventures.length}
            </strong>

            <span>
              Total Ventures
            </span>
          </div>

        </div>


        <div className="admin-ventures__summary-card">

          <Globe2
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


        <div className="admin-ventures__summary-card">

          <Layers3
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


        <div className="admin-ventures__summary-card">

          <Users
            size={20}
          />

          <div>
            <strong>
              {archivedCount}
            </strong>

            <span>
              Archived
            </span>
          </div>

        </div>

      </div>


      {/* ======================================================
          TOOLBAR
      ====================================================== */}

      <div className="admin-ventures__toolbar">

        <div className="admin-ventures__search">

          <Search size={17} />

          <input
            type="search"
            value={
              searchQuery
            }
            placeholder="Search ventures..."
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
              <X size={15} />
            </button>

          )}

        </div>


        <span className="admin-ventures__count">

          {!loading &&
            `${filteredVentures.length} ${
              filteredVentures.length ===
              1
                ? "venture"
                : "ventures"
            }`}

        </span>

      </div>


      {/* ======================================================
          LIST
      ====================================================== */}

      <section className="admin-ventures__panel">

        <div className="admin-ventures__table-header">

          <span>
            Venture
          </span>

          <span>
            Sector
          </span>

          <span>
            Country
          </span>

          <span>
            Stage
          </span>

          <span>
            Status
          </span>

          <span />

        </div>


        {loading && (

          <div className="admin-ventures__empty">

            <RefreshCw size={28} />

            <h3>
              Loading ventures
            </h3>

            <p>
              Retrieving venture profiles.
            </p>

          </div>

        )}


        {!loading &&
          error && (

          <div className="admin-ventures__empty">

            <BriefcaseBusiness
              size={28}
            />

            <h3>
              Ventures could not be loaded
            </h3>

            <p>
              {error}
            </p>

            <button
              type="button"
              onClick={
                loadVentures
              }
            >
              <RefreshCw size={16} />

              Try Again
            </button>

          </div>

        )}


        {!loading &&
          !error &&
          filteredVentures.length ===
            0 && (

          <div className="admin-ventures__empty">

            <BriefcaseBusiness
              size={30}
            />

            <h3>
              {searchQuery
                ? "No matching ventures"
                : "No ventures yet"}
            </h3>

            <p>
              {searchQuery
                ? "Try another search term."
                : "Add the first venture to the Continental Founders network."}
            </p>

            {!searchQuery && (

              <button
                type="button"
                onClick={
                  handleCreateVenture
                }
              >
                <Plus size={16} />

                Add first venture
              </button>

            )}

          </div>

        )}


        {!loading &&
          !error &&
          paginatedVentures.length >
            0 && (

          <div className="admin-ventures__list">

            {paginatedVentures.map(
              (
                venture,
                index
              ) => (

              <button
                key={
                  venture.id ||
                  `${venture.slug}-${index}`
                }
                type="button"
                className="admin-ventures__row"
                onClick={() =>
                  setSelectedVenture(
                    venture
                  )
                }
              >

                <div className="admin-ventures__venture">

                  <div className="admin-ventures__logo">

                    {getVentureLogo(
                      venture
                    ) ? (

                      <img
                        src={
                          getVentureLogo(
                            venture
                          )
                        }
                        alt=""
                      />

                    ) : (

                      <BriefcaseBusiness
                        size={19}
                      />

                    )}

                  </div>


                  <div>

                    <strong>
                      {venture.name}
                    </strong>

                    <span>
                      {getFounderNames(
                        venture
                      )}
                    </span>

                  </div>

                </div>


                <div className="admin-ventures__meta">

                  <BriefcaseBusiness
                    size={13}
                  />

                  <span>
                    {venture.sector ||
                    "Not specified"}
                  </span>

                </div>


                <div className="admin-ventures__meta">

                  <MapPin
                    size={13}
                  />

                  <span>
                    {venture.country ||
                    "Not specified"}
                  </span>

                </div>


                <div className="admin-ventures__meta">

                  <Layers3
                    size={13}
                  />

                  <span>
                    {venture.stage ||
                    "Not specified"}
                  </span>

                </div>


                <div>

                  <span
                    className={
                      getStatusClass(
                        venture.status
                      )
                    }
                  >
                    {venture.status ||
                    "draft"}
                  </span>

                </div>


                <ChevronRight
                  size={16}
                />

              </button>

            ))}

          </div>

        )}


        {!loading &&
          !error &&
          filteredVentures.length >
            ITEMS_PER_PAGE && (

          <div className="admin-ventures__pagination">

            <button
              type="button"
              disabled={
                currentPage === 1
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

      {selectedVenture && (

        <div
          className="admin-ventures__overlay"
          onClick={() =>
            setSelectedVenture(
              null
            )
          }
        >

          <aside
            className="admin-ventures__drawer"
            onClick={(
              event
            ) =>
              event.stopPropagation()
            }
          >

            <div className="admin-ventures__drawer-header">

              <div>

                <span className="admin-ventures__drawer-eyebrow">
                  VENTURE PROFILE
                </span>

                <h2>
                  {selectedVenture.name}
                </h2>

              </div>


              <button
                type="button"
                className="admin-ventures__drawer-close"
                onClick={() =>
                  setSelectedVenture(
                    null
                  )
                }
              >
                <X size={19} />
              </button>

            </div>


            <div className="admin-ventures__drawer-body">

              {getHeroImage(
                selectedVenture
              ) && (

                <div className="admin-ventures__hero-preview">

                  <img
                    src={
                      getHeroImage(
                        selectedVenture
                      )
                    }
                    alt=""
                  />

                </div>

              )}


              <div className="admin-ventures__profile">

                <div className="admin-ventures__profile-logo">

                  {getVentureLogo(
                    selectedVenture
                  ) ? (

                    <img
                      src={
                        getVentureLogo(
                          selectedVenture
                        )
                      }
                      alt=""
                    />

                  ) : (

                    <BriefcaseBusiness
                      size={34}
                    />

                  )}

                </div>


                <div>

                  <h3>
                    {selectedVenture.name}
                  </h3>

                  <p>
                    {selectedVenture.tagline ||
                    selectedVenture.description ||
                    "No tagline provided."}
                  </p>

                </div>

              </div>


              <div className="admin-ventures__detail-row">

                <span>
                  Publication Status
                </span>

                <span
                  className={
                    getStatusClass(
                      selectedVenture.status
                    )
                  }
                >
                  {selectedVenture.status ||
                  "draft"}
                </span>

              </div>


              <div className="admin-ventures__detail-grid">

                <div className="admin-ventures__detail-card">

                  <BriefcaseBusiness
                    size={18}
                  />

                  <div>
                    <span>
                      Sector
                    </span>

                    <strong>
                      {selectedVenture.sector ||
                      "Not provided"}
                    </strong>
                  </div>

                </div>


                <div className="admin-ventures__detail-card">

                  <MapPin
                    size={18}
                  />

                  <div>
                    <span>
                      Country
                    </span>

                    <strong>
                      {selectedVenture.country ||
                      "Not provided"}
                    </strong>
                  </div>

                </div>


                <div className="admin-ventures__detail-card">

                  <Layers3
                    size={18}
                  />

                  <div>
                    <span>
                      Stage
                    </span>

                    <strong>
                      {selectedVenture.stage ||
                      "Not provided"}
                    </strong>
                  </div>

                </div>


                <div className="admin-ventures__detail-card">

                  <UserRound
                    size={18}
                  />

                  <div>
                    <span>
                      Founder
                    </span>

                    <strong>
                      {getFounderNames(
                        selectedVenture
                      )}
                    </strong>
                  </div>

                </div>

              </div>


              {selectedVenture.website && (

                <a
                  href={
                    selectedVenture.website
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="admin-ventures__website"
                >
                  Visit venture website

                  <ArrowUpRight
                    size={16}
                  />
                </a>

              )}


              <div className="admin-ventures__drawer-actions">

                <button
                  type="button"
                  className="admin-ventures__edit"
                  onClick={() =>
                    handleEditVenture(
                      selectedVenture
                    )
                  }
                >
                  Edit Venture
                </button>

              </div>

            </div>

          </aside>

        </div>

      )}


      {/* ======================================================
          CREATE / EDIT DRAWER
      ====================================================== */}

      {formOpen && (

        <div
          className="admin-ventures__overlay"
          onClick={
            closeForm
          }
        >

          <aside
            className="admin-ventures__drawer admin-ventures__form-drawer"
            onClick={(
              event
            ) =>
              event.stopPropagation()
            }
          >

            <div className="admin-ventures__drawer-header">

              <div>

                <span className="admin-ventures__drawer-eyebrow">
                  {editingVenture
                    ? "EDIT VENTURE"
                    : "NEW VENTURE"}
                </span>

                <h2>
                  {editingVenture
                    ? "Update Venture"
                    : "Add Venture"}
                </h2>

              </div>


              <button
                type="button"
                className="admin-ventures__drawer-close"
                onClick={
                  closeForm
                }
                disabled={
                  saving ||
                  deleting
                }
              >
                <X size={19} />
              </button>

            </div>


            {/* ==================================================
                STEPS
            ================================================== */}

            <div className="admin-ventures__steps">

              {FORM_STEPS.map(
                (step) => (

                <div
                  key={
                    step.number
                  }
                  className={
                    formStep ===
                    step.number
                      ? "admin-ventures__step active"
                      : formStep >
                        step.number
                        ? "admin-ventures__step complete"
                        : "admin-ventures__step"
                  }
                >

                  <span>
                    {step.number}
                  </span>

                  <small>
                    {step.label}
                  </small>

                </div>

              ))}

            </div>


            <div className="admin-ventures__form">

              {formError && (

                <div className="admin-ventures__form-error">
                  {formError}
                </div>

              )}


              {/* =================================================
                  STEP 1 - VENTURE
              ================================================= */}

              {formStep === 1 && (
                <>

                  <div className="admin-ventures__step-heading">

                    <h3>
                      Venture Information
                    </h3>

                    <p>
                      Add the venture identity,
                      sector, location and stage.
                    </p>

                  </div>


                  <div className="admin-ventures__field">

                    <label>
                      Venture Name *
                    </label>

                    <input
                      ref={
                        nameInputRef
                      }
                      value={
                        form.name
                      }
                      onChange={
                        handleNameChange
                      }
                      placeholder="e.g. Eth Tech Solutions"
                    />

                  </div>


                  <div className="admin-ventures__field">

                    <label>
                      URL Slug *
                    </label>

                    <input
                      value={
                        form.slug
                      }
                      onChange={
                        handleSlugChange
                      }
                      placeholder="eth-tech-solutions"
                    />

                    <small>
                      Public URL: /ventures/{form.slug || "venture-name"}
                    </small>

                  </div>


                  <div className="admin-ventures__form-grid">

                    <div className="admin-ventures__field">

                      <label>
                        Sector *
                      </label>

                      <input
                        name="sector"
                        value={
                          form.sector
                        }
                        onChange={
                          handleFormChange
                        }
                        placeholder="Technology"
                      />

                    </div>


                    <div className="admin-ventures__field">

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
                        placeholder="Uganda"
                      />

                    </div>

                  </div>


                  <div className="admin-ventures__field">

                    <label>
                      Venture Stage *
                    </label>

                    <input
                      name="stage"
                      value={
                        form.stage
                      }
                      onChange={
                        handleFormChange
                      }
                      placeholder="e.g. Early Growth"
                    />

                  </div>


                  <div className="admin-ventures__field">

                    <label>
                      Tagline
                    </label>

                    <input
                      name="tagline"
                      value={
                        form.tagline
                      }
                      onChange={
                        handleFormChange
                      }
                      placeholder="A short venture statement"
                    />

                  </div>


                  <div className="admin-ventures__field">

                    <label>
                      Short Description
                    </label>

                    <textarea
                      name="description"
                      rows={4}
                      value={
                        form.description
                      }
                      onChange={
                        handleFormChange
                      }
                      placeholder="Summarize what the venture does..."
                    />

                  </div>

                </>
              )}


              {/* =================================================
                  STEP 2 - BUSINESS
              ================================================= */}

              {formStep === 2 && (
                <>

                  <div className="admin-ventures__step-heading">

                    <h3>
                      Business Profile
                    </h3>

                    <p>
                      Add venture content,
                      contact information,
                      services and opportunity.
                    </p>

                  </div>


                  <div className="admin-ventures__field">

                    <label>
                      Full Venture Description
                    </label>

                    <textarea
                      name="longDescription"
                      rows={6}
                      value={
                        form.longDescription
                      }
                      onChange={
                        handleFormChange
                      }
                      placeholder="Describe the venture in detail..."
                    />

                  </div>


                  <div className="admin-ventures__field">

                    <label>
                      Secondary Description
                    </label>

                    <textarea
                      name="secondaryDescription"
                      rows={5}
                      value={
                        form.secondaryDescription
                      }
                      onChange={
                        handleFormChange
                      }
                      placeholder="Additional venture context..."
                    />

                  </div>


                  <div className="admin-ventures__form-grid">

                    <div className="admin-ventures__field">

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
                        placeholder="https://..."
                      />

                    </div>


                    <div className="admin-ventures__field">

                      <label>
                        Email
                      </label>

                      <input
                        name="email"
                        type="email"
                        value={
                          form.email
                        }
                        onChange={
                          handleFormChange
                        }
                        placeholder="info@example.com"
                      />

                    </div>

                  </div>


                  <div className="admin-ventures__form-grid">

                    <div className="admin-ventures__field">

                      <label>
                        Phone
                      </label>

                      <input
                        name="phone"
                        value={
                          form.phone
                        }
                        onChange={
                          handleFormChange
                        }
                        placeholder="+256..."
                      />

                    </div>


                    <div className="admin-ventures__field">

                      <label>
                        Alternative Phone
                      </label>

                      <input
                        name="secondaryPhone"
                        value={
                          form.secondaryPhone
                        }
                        onChange={
                          handleFormChange
                        }
                        placeholder="+256..."
                      />

                    </div>

                  </div>


                  <div className="admin-ventures__field">

                    <label>
                      Venture Logo URL
                    </label>

                    <div className="admin-ventures__input-icon">

                      <ImagePlus
                        size={16}
                      />

                      <input
                        name="logoUrl"
                        value={
                          form.logoUrl
                        }
                        onChange={
                          handleFormChange
                        }
                        placeholder="https://..."
                      />

                    </div>

                  </div>


                  {form.logoUrl && (

                    <div className="admin-ventures__image-preview admin-ventures__image-preview--logo">

                      <img
                        src={
                          form.logoUrl
                        }
                        alt="Logo preview"
                      />

                    </div>

                  )}


                  <div className="admin-ventures__field">

                    <label>
                      Hero Image URL
                    </label>

                    <div className="admin-ventures__input-icon">

                      <ImagePlus
                        size={16}
                      />

                      <input
                        name="heroImageUrl"
                        value={
                          form.heroImageUrl
                        }
                        onChange={
                          handleFormChange
                        }
                        placeholder="https://..."
                      />

                    </div>

                  </div>


                  {form.heroImageUrl && (

                    <div className="admin-ventures__image-preview">

                      <img
                        src={
                          form.heroImageUrl
                        }
                        alt="Hero preview"
                      />

                    </div>

                  )}


                  <div className="admin-ventures__subsection">

                    <div className="admin-ventures__subsection-header">

                      <div>

                        <h4>
                          Services
                        </h4>

                        <p>
                          Add what the venture provides.
                        </p>

                      </div>

                      <button
                        type="button"
                        onClick={
                          addService
                        }
                      >
                        <Plus size={14} />

                        Add
                      </button>

                    </div>


                    {form.services.map(
                      (
                        service,
                        index
                      ) => (

                      <div
                        key={`service-${index}`}
                        className="admin-ventures__repeat-row"
                      >

                        <input
                          value={
                            service
                          }
                          onChange={(
                            event
                          ) =>
                            updateService(
                              index,
                              event.target.value
                            )
                          }
                          placeholder={`Service ${index + 1}`}
                        />

                        <button
                          type="button"
                          onClick={() =>
                            removeService(
                              index
                            )
                          }
                        >
                          <X size={15} />
                        </button>

                      </div>

                    ))}

                  </div>


                  <div className="admin-ventures__subsection">

                    <div className="admin-ventures__subsection-header">

                      <div>

                        <h4>
                          Opportunity
                        </h4>

                        <p>
                          Explain the problem,
                          solution, market and stage.
                        </p>

                      </div>

                    </div>


                    {form.opportunityAreas.map(
                      (
                        item,
                        index
                      ) => (

                      <div
                        key={`opportunity-${index}`}
                        className="admin-ventures__opportunity-editor"
                      >

                        <input
                          value={
                            item.title
                          }
                          onChange={(
                            event
                          ) =>
                            updateOpportunityArea(
                              index,
                              "title",
                              event.target.value
                            )
                          }
                          placeholder="Title"
                        />

                        <textarea
                          rows={4}
                          value={
                            item.text
                          }
                          onChange={(
                            event
                          ) =>
                            updateOpportunityArea(
                              index,
                              "text",
                              event.target.value
                            )
                          }
                          placeholder="Description..."
                        />

                      </div>

                    ))}

                  </div>

                </>
              )}


              {/* =================================================
                  STEP 3 - FOUNDERS
              ================================================= */}

              {formStep === 3 && (
                <>

                  <div className="admin-ventures__step-heading">

                    <h3>
                      Founders & Opportunities
                    </h3>

                    <p>
                      Add founder profiles and
                      what the venture is looking for.
                    </p>

                  </div>


                  <div className="admin-ventures__subsection">

                    <div className="admin-ventures__subsection-header">

                      <div>

                        <h4>
                          Founders
                        </h4>

                        <p>
                          Add one or more venture founders.
                        </p>

                      </div>

                      <button
                        type="button"
                        onClick={
                          addFounder
                        }
                      >
                        <Plus size={14} />

                        Add Founder
                      </button>

                    </div>


                    {form.founders.map(
                      (
                        founder,
                        index
                      ) => (

                      <div
                        key={`founder-${index}`}
                        className="admin-ventures__founder-editor"
                      >

                        <div className="admin-ventures__founder-editor-header">

                          <strong>
                            Founder {index + 1}
                          </strong>

                          {form.founders.length >
                            1 && (

                            <button
                              type="button"
                              onClick={() =>
                                removeFounder(
                                  index
                                )
                              }
                            >
                              <Trash2
                                size={14}
                              />
                            </button>

                          )}

                        </div>


                        <div className="admin-ventures__form-grid">

                          <div className="admin-ventures__field">

                            <label>
                              Name *
                            </label>

                            <input
                              value={
                                founder.name
                              }
                              onChange={(
                                event
                              ) =>
                                updateFounder(
                                  index,
                                  "name",
                                  event.target.value
                                )
                              }
                              placeholder="Founder name"
                            />

                          </div>


                          <div className="admin-ventures__field">

                            <label>
                              Role
                            </label>

                            <input
                              value={
                                founder.role
                              }
                              onChange={(
                                event
                              ) =>
                                updateFounder(
                                  index,
                                  "role",
                                  event.target.value
                                )
                              }
                              placeholder="Founder"
                            />

                          </div>

                        </div>


                        <div className="admin-ventures__field">

                          <label>
                            Founder Image URL
                          </label>

                          <input
                            value={
                              founder.image
                            }
                            onChange={(
                              event
                            ) =>
                              updateFounder(
                                index,
                                "image",
                                event.target.value
                              )
                            }
                            placeholder="https://..."
                          />

                        </div>


                        {founder.image && (

                          <div className="admin-ventures__founder-image-preview">

                            <img
                              src={
                                founder.image
                              }
                              alt=""
                            />

                          </div>

                        )}


                        <div className="admin-ventures__field">

                          <label>
                            Biography
                          </label>

                          <textarea
                            rows={4}
                            value={
                              founder.bio
                            }
                            onChange={(
                              event
                            ) =>
                              updateFounder(
                                index,
                                "bio",
                                event.target.value
                              )
                            }
                            placeholder="Short founder biography..."
                          />

                        </div>

                      </div>

                    ))}

                  </div>


                  <div className="admin-ventures__subsection">

                    <div className="admin-ventures__subsection-header">

                      <div>

                        <h4>
                          Looking For
                        </h4>

                        <p>
                          What relationships or
                          opportunities does this venture need?
                        </p>

                      </div>

                      <button
                        type="button"
                        onClick={
                          addLookingFor
                        }
                      >
                        <Plus size={14} />

                        Add
                      </button>

                    </div>


                    {form.lookingFor.map(
                      (
                        item,
                        index
                      ) => (

                      <div
                        key={`looking-${index}`}
                        className="admin-ventures__repeat-row"
                      >

                        <input
                          value={
                            item
                          }
                          onChange={(
                            event
                          ) =>
                            updateLookingFor(
                              index,
                              event.target.value
                            )
                          }
                          placeholder="e.g. Strategic partnerships"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            removeLookingFor(
                              index
                            )
                          }
                        >
                          <X size={15} />
                        </button>

                      </div>

                    ))}

                  </div>


                  <div className="admin-ventures__field">

                    <label>
                      Publication Status
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

                      <option value="published">
                        Published
                      </option>

                      <option value="archived">
                        Archived
                      </option>
                    </select>

                  </div>


                  <div className="admin-ventures__publishing-note">

                    {form.status ===
                    "published" ? (

                      <p>
                        This venture will appear
                        on the public Ventures page
                        after saving.
                      </p>

                    ) : form.status ===
                      "archived" ? (

                      <p>
                        This venture will be hidden
                        from the public website.
                      </p>

                    ) : (

                      <p>
                        This venture will remain
                        private in the CMS until
                        it is published.
                      </p>

                    )}

                  </div>

                </>
              )}


              {/* =================================================
                  STEP 4 - REVIEW
              ================================================= */}

              {formStep === 4 && (
                <>

                  <div className="admin-ventures__step-heading">

                    <h3>
                      Review Venture
                    </h3>

                    <p>
                      Confirm the venture information
                      before saving.
                    </p>

                  </div>


                  {form.heroImageUrl && (

                    <div className="admin-ventures__review-hero">

                      <img
                        src={
                          form.heroImageUrl
                        }
                        alt=""
                      />

                    </div>

                  )}


                  <div className="admin-ventures__review-profile">

                    <div className="admin-ventures__review-logo">

                      {form.logoUrl ? (

                        <img
                          src={
                            form.logoUrl
                          }
                          alt=""
                        />

                      ) : (

                        <BriefcaseBusiness
                          size={28}
                        />

                      )}

                    </div>


                    <div>

                      <span>
                        {form.sector ||
                        "Sector"}
                      </span>

                      <h3>
                        {form.name}
                      </h3>

                      <p>
                        {form.tagline ||
                        form.description ||
                        "No tagline provided."}
                      </p>

                    </div>

                  </div>


                  <div className="admin-ventures__review">

                    <div>
                      <span>
                        Slug
                      </span>

                      <strong>
                        {form.slug}
                      </strong>
                    </div>


                    <div>
                      <span>
                        Country
                      </span>

                      <strong>
                        {form.country}
                      </strong>
                    </div>


                    <div>
                      <span>
                        Stage
                      </span>

                      <strong>
                        {form.stage}
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
                        Founders
                      </span>

                      <strong>
                        {form.founders
                          .map(
                            (founder) =>
                              founder.name
                          )
                          .filter(Boolean)
                          .join(" & ") ||
                        "None"}
                      </strong>
                    </div>


                    <div>
                      <span>
                        Services
                      </span>

                      <strong>
                        {form.services
                          .filter(Boolean)
                          .length}
                      </strong>
                    </div>


                    <div className="admin-ventures__review-wide">

                      <span>
                        Description
                      </span>

                      <p>
                        {form.longDescription ||
                        form.description ||
                        "No description provided."}
                      </p>

                    </div>


                    <div className="admin-ventures__review-wide">

                      <span>
                        Looking For
                      </span>

                      <div className="admin-ventures__review-tags">

                        {form.lookingFor
                          .filter(Boolean)
                          .map(
                            (item) => (

                            <span
                              key={
                                item
                              }
                            >
                              {item}
                            </span>

                          ))}

                      </div>

                    </div>

                  </div>

                </>
              )}


              {/* =================================================
                  ACTIONS
              ================================================= */}

              <div className="admin-ventures__form-actions">

                {editingVenture &&
                  formStep === 4 && (

                  <button
                    type="button"
                    className="admin-ventures__delete"
                    onClick={
                      handleDeleteVenture
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
                      : "Delete Venture"}
                  </button>

                )}


                <div className="admin-ventures__form-actions-right">

                  {formStep > 1 && (

                    <button
                      type="button"
                      className="admin-ventures__cancel"
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
                      className="admin-ventures__save"
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
                      className="admin-ventures__save"
                      onClick={
                        handleSaveVenture
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
                        : editingVenture
                          ? "Save Changes"
                          : "Create Venture"}
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