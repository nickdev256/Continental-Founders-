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
  Rocket,
  Save,
  Search,
  Sparkles,
  Trash2,
  UserRound,
  Users,
  X,
} from "lucide-react";

import "./AdminVentures.css";


/* ============================================================
   API
============================================================ */

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(/\/+$/, "");


/* ============================================================
   CONFIG
============================================================ */

const ITEMS_PER_PAGE = 6;

const MAX_IMAGE_SIZE =
  8 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];


const FORM_STEPS = [
  {
    number: 1,
    label: "CFCV",
  },
  {
    number: 2,
    label: "Venture",
  },
  {
    number: 3,
    label: "Business",
  },
  {
    number: 4,
    label: "Founders",
  },
  {
    number: 5,
    label: "Review",
  },
];


const CFCV_TRACKS = [
  {
    value: "genesis",
    name: "Genesis",
    action: "Build It",
    description:
      "Transform an opportunity into a validated venture.",
  },
  {
    value: "ascend",
    name: "Ascend",
    action: "Prove It",
    description:
      "Demonstrate that the venture can work commercially.",
  },
  {
    value: "horizon",
    name: "Horizon",
    action: "Scale It",
    description:
      "Prepare the venture for larger markets, partnerships, and capital opportunities.",
  },
];


const FELLOW_STATUSES = [
  {
    value: "current",
    label: "Current Fellow",
  },
  {
    value: "alumni",
    label: "Alumni",
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
  cfcvTrack: "genesis",
  fellowStatus: "current",
  cohort: "",
  cohortYear: "",
  catalyticSupport: false,
  displayOrder: 0,

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

  /*
   * Stored values returned from the backend.
   *
   * These may be storage paths or public URLs depending
   * on how the backend returns venture media.
   */
  logo: "",
  heroImage: "",

  /*
   * Newly selected local files.
   */
  logoFile: null,
  heroImageFile: null,

  /*
   * Browser preview values.
   */
  logoPreview: "",
  heroImagePreview: "",

  founders: [
    {
      name: "",
      role: "Founder",
      image: "",
      imageFile: null,
      imagePreview: "",
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


function normalizeTrack(value) {
  const track = String(
    value || ""
  )
    .trim()
    .toLowerCase();

  if (
    CFCV_TRACKS.some(
      (item) =>
        item.value === track
    )
  ) {
    return track;
  }

  return "genesis";
}


function normalizeFellowStatus(
  value
) {
  const status = String(
    value || ""
  )
    .trim()
    .toLowerCase();

  if (
    status === "alumni"
  ) {
    return "alumni";
  }

  return "current";
}


function getTrackValue(
  venture
) {
  return normalizeTrack(
    venture?.cfcvTrack ||
      venture?.cfcv_track ||
      venture?.track ||
      "genesis"
  );
}


function getTrack(
  venture
) {
  const value =
    getTrackValue(
      venture
    );

  return (
    CFCV_TRACKS.find(
      (item) =>
        item.value === value
    ) ||
    CFCV_TRACKS[0]
  );
}


function getFellowStatus(
  venture
) {
  return normalizeFellowStatus(
    venture?.fellowStatus ||
      venture?.fellow_status ||
      "current"
  );
}


function getCohort(
  venture
) {
  return (
    venture?.cohort ||
    venture?.cohortName ||
    venture?.cohort_name ||
    ""
  );
}


function getCohortYear(
  venture
) {
  return (
    venture?.cohortYear ||
    venture?.cohort_year ||
    ""
  );
}


function hasCatalyticSupport(
  venture
) {
  const value =
    venture?.catalyticSupport ??
    venture?.catalytic_support ??
    false;

  if (
    typeof value === "string"
  ) {
    return (
      value.toLowerCase() ===
      "true"
    );
  }

  return Boolean(value);
}


function getDisplayOrder(
  venture
) {
  const value =
    venture?.displayOrder ??
    venture?.display_order ??
    0;

  const parsed =
    Number(value);

  return Number.isFinite(
    parsed
  )
    ? parsed
    : 0;
}


function getVentureLogo(
  venture
) {
  return (
    venture?.logo ||
    venture?.logoUrl ||
    venture?.logo_url ||
    ""
  );
}


function getHeroImage(
  venture
) {
  return (
    venture?.heroImage ||
    venture?.heroImageUrl ||
    venture?.hero_image_url ||
    ""
  );
}


function getFounders(
  venture
) {
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
          venture.founder_image ||
          "",

        bio:
          venture.founderBio ||
          venture.founder_bio ||
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


function getTrackClass(
  track
) {
  const value =
    normalizeTrack(track);

  return `admin-ventures__track admin-ventures__track--${value}`;
}


function validateImageFile(
  file
) {
  if (!file) {
    return "";
  }

  if (
    !ALLOWED_IMAGE_TYPES.includes(
      file.type
    )
  ) {
    return "Please upload a JPG, PNG or WebP image.";
  }

  if (
    file.size >
    MAX_IMAGE_SIZE
  ) {
    return "Image must be smaller than 8 MB.";
  }

  return "";
}


function createImagePreview(
  file
) {
  if (!file) {
    return "";
  }

  return URL.createObjectURL(
    file
  );
}


function revokePreview(
  preview
) {
  if (
    preview &&
    preview.startsWith(
      "blob:"
    )
  ) {
    URL.revokeObjectURL(
      preview
    );
  }
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
    trackFilter,
    setTrackFilter,
  ] =
    useState("all");

  const [
    fellowFilter,
    setFellowFilter,
  ] =
    useState("all");

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
     CLEAN LOCAL PREVIEWS ON UNMOUNT
  ========================================================== */

  useEffect(() => {
    return () => {
      revokePreview(
        form.logoPreview
      );

      revokePreview(
        form.heroImagePreview
      );

      form.founders.forEach(
        (founder) => {
          revokePreview(
            founder.imagePreview
          );
        }
      );
    };
  }, []);


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
      formStep !== 2
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

      return ventures.filter(
        (venture) => {
          const track =
            getTrackValue(
              venture
            );

          const fellowStatus =
            getFellowStatus(
              venture
            );

          const matchesTrack =
            trackFilter ===
              "all" ||
            track ===
              trackFilter;

          const matchesFellow =
            fellowFilter ===
              "all" ||
            fellowStatus ===
              fellowFilter;

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
            getTrack(
              venture
            ).name,
            getTrack(
              venture
            ).action,
            fellowStatus,
            getCohort(
              venture
            ),
            getCohortYear(
              venture
            ),
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          const matchesSearch =
            !query ||
            searchable.includes(
              query
            );

          return (
            matchesTrack &&
            matchesFellow &&
            matchesSearch
          );
        }
      );
    }, [
      ventures,
      searchQuery,
      trackFilter,
      fellowFilter,
    ]);


  /* ==========================================================
     STATS
  ========================================================== */

  const genesisCount =
    useMemo(
      () =>
        ventures.filter(
          (venture) =>
            getTrackValue(
              venture
            ) ===
            "genesis"
        ).length,
      [ventures]
    );


  const ascendCount =
    useMemo(
      () =>
        ventures.filter(
          (venture) =>
            getTrackValue(
              venture
            ) ===
            "ascend"
        ).length,
      [ventures]
    );


  const horizonCount =
    useMemo(
      () =>
        ventures.filter(
          (venture) =>
            getTrackValue(
              venture
            ) ===
            "horizon"
        ).length,
      [ventures]
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
    trackFilter,
    fellowFilter,
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
      type,
      checked,
    } =
      event.target;

    setForm(
      (current) => ({
        ...current,

        [name]:
          type === "checkbox"
            ? checked
            : value,
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
     VENTURE LOGO UPLOAD
  ========================================================== */

  function handleLogoUpload(
    event
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const validationError =
      validateImageFile(
        file
      );

    if (validationError) {
      setFormError(
        validationError
      );

      event.target.value = "";

      return;
    }

    setForm(
      (current) => {
        revokePreview(
          current.logoPreview
        );

        return {
          ...current,

          logoFile:
            file,

          logoPreview:
            createImagePreview(
              file
            ),
        };
      }
    );

    setFormError("");
  }


  function removeLogoImage() {
    setForm(
      (current) => {
        revokePreview(
          current.logoPreview
        );

        return {
          ...current,

          logo:
            "",

          logoFile:
            null,

          logoPreview:
            "",
        };
      }
    );
  }


  /* ==========================================================
     HERO IMAGE UPLOAD
  ========================================================== */

  function handleHeroUpload(
    event
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const validationError =
      validateImageFile(
        file
      );

    if (validationError) {
      setFormError(
        validationError
      );

      event.target.value = "";

      return;
    }

    setForm(
      (current) => {
        revokePreview(
          current.heroImagePreview
        );

        return {
          ...current,

          heroImageFile:
            file,

          heroImagePreview:
            createImagePreview(
              file
            ),
        };
      }
    );

    setFormError("");
  }


  function removeHeroImage() {
    setForm(
      (current) => {
        revokePreview(
          current.heroImagePreview
        );

        return {
          ...current,

          heroImage:
            "",

          heroImageFile:
            null,

          heroImagePreview:
            "",
        };
      }
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
            imageFile: null,
            imagePreview: "",
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
      (current) => {
        if (
          current.founders.length <=
          1
        ) {
          return current;
        }

        const removed =
          current.founders[
            index
          ];

        revokePreview(
          removed?.imagePreview
        );

        return {
          ...current,

          founders:
            current.founders.filter(
              (
                _founder,
                founderIndex
              ) =>
                founderIndex !==
                index
            ),
        };
      }
    );
  }


  function handleFounderImageUpload(
    index,
    event
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const validationError =
      validateImageFile(
        file
      );

    if (validationError) {
      setFormError(
        validationError
      );

      event.target.value = "";

      return;
    }

    setForm(
      (current) => ({
        ...current,

        founders:
          current.founders.map(
            (
              founder,
              founderIndex
            ) => {
              if (
                founderIndex !==
                index
              ) {
                return founder;
              }

              revokePreview(
                founder.imagePreview
              );

              return {
                ...founder,

                imageFile:
                  file,

                imagePreview:
                  createImagePreview(
                    file
                  ),
              };
            }
          ),
      })
    );

    setFormError("");
  }


  function removeFounderImage(
    index
  ) {
    setForm(
      (current) => ({
        ...current,

        founders:
          current.founders.map(
            (
              founder,
              founderIndex
            ) => {
              if (
                founderIndex !==
                index
              ) {
                return founder;
              }

              revokePreview(
                founder.imagePreview
              );

              return {
                ...founder,

                image:
                  "",

                imageFile:
                  null,

                imagePreview:
                  "",
              };
            }
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

    const logo =
      getVentureLogo(
        venture
      );

    const heroImage =
      getHeroImage(
        venture
      );


    setForm({
      cfcvTrack:
        getTrackValue(
          venture
        ),

      fellowStatus:
        getFellowStatus(
          venture
        ),

      cohort:
        getCohort(
          venture
        ),

      cohortYear:
        getCohortYear(
          venture
        ),

      catalyticSupport:
        hasCatalyticSupport(
          venture
        ),

      displayOrder:
        getDisplayOrder(
          venture
        ),

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

      logo,

      heroImage,

      logoFile:
        null,

      heroImageFile:
        null,

      logoPreview:
        logo,

      heroImagePreview:
        heroImage,

      founders:
        founders.length
          ? founders.map(
              (founder) => {
                const image =
                  founder?.image ||
                  founder?.imageUrl ||
                  founder?.image_url ||
                  "";

                return {
                  name:
                    founder?.name ||
                    "",

                  role:
                    founder?.role ||
                    "Founder",

                  image,

                  imageFile:
                    null,

                  imagePreview:
                    image,

                  bio:
                    founder?.bio ||
                    "",
                };
              }
            )
          : [
              {
                name: "",
                role: "Founder",
                image: "",
                imageFile: null,
                imagePreview: "",
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
                  item?.description ||
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
     CLOSE FORM
  ========================================================== */

  function resetAndCloseForm() {
    revokePreview(
      form.logoPreview
    );

    revokePreview(
      form.heroImagePreview
    );

    form.founders.forEach(
      (founder) => {
        revokePreview(
          founder.imagePreview
        );
      }
    );

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
        !form.cfcvTrack
      ) {
        setFormError(
          "Select a CFCV track."
        );

        return false;
      }

      if (
        !form.fellowStatus
      ) {
        setFormError(
          "Select the fellow status."
        );

        return false;
      }

      if (
        form.cohortYear &&
        (
          Number(
            form.cohortYear
          ) < 2000 ||
          Number(
            form.cohortYear
          ) > 2100
        )
      ) {
        setFormError(
          "Enter a valid cohort year."
        );

        return false;
      }
    }


    if (
      step === 2
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
      step === 3
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
        form.email.trim() &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          form.email.trim()
        )
      ) {
        setFormError(
          "Enter a valid venture email address."
        );

        return false;
      }
    }


    if (
      step === 4
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
          5,
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
    for (
      let step = 1;
      step <= 4;
      step += 1
    ) {
      if (
        !validateStep(
          step
        )
      ) {
        setFormStep(step);
        return;
      }
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

              /*
               * Existing image remains here.
               * If a new file exists the backend
               * replaces this value after upload.
               */
              image:
                founder.image ||
                "",

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


      const venturePayload = {
        cfcvTrack:
          form.cfcvTrack,

        fellowStatus:
          form.fellowStatus,

        cohort:
          form.cohort.trim(),

        cohortYear:
          form.cohortYear
            ? Number(
                form.cohortYear
              )
            : null,

        catalyticSupport:
          Boolean(
            form.catalyticSupport
          ),

        displayOrder:
          Number(
            form.displayOrder
          ) || 0,

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

        logo:
          form.logo ||
          "",

        heroImage:
          form.heroImage ||
          "",

        founders,

        services,

        lookingFor,

        opportunityAreas,

        status:
          form.status,
      };


      /*
       * Multipart request.
       *
       * IMPORTANT:
       * Do not manually set Content-Type here.
       * The browser adds the multipart boundary.
       */
      const multipart =
        new FormData();


      multipart.append(
        "venture",
        JSON.stringify(
          venturePayload
        )
      );


      if (
        form.logoFile
      ) {
        multipart.append(
          "logo",
          form.logoFile
        );
      }


      if (
        form.heroImageFile
      ) {
        multipart.append(
          "heroImage",
          form.heroImageFile
        );
      }


      form.founders.forEach(
        (
          founder,
          index
        ) => {
          if (
            founder.imageFile
          ) {
            multipart.append(
              `founderImage_${index}`,
              founder.imageFile
            );
          }
        }
      );


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
            },

            credentials:
              "include",

            body:
              multipart,
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
            if (editing) {
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
            CFCV VENTURE MANAGEMENT
          </span>

          <h1>
            Fellows & Ventures
          </h1>

          <p>
            Manage CFCV ventures, track placement,
            cohorts, founders, venture information,
            catalytic support and publication status.
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
          SUMMARY
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
          <Sparkles
            size={20}
          />

          <div>
            <strong>
              {genesisCount}
            </strong>

            <span>
              Genesis
            </span>
          </div>
        </div>


        <div className="admin-ventures__summary-card">
          <ArrowUpRight
            size={20}
          />

          <div>
            <strong>
              {ascendCount}
            </strong>

            <span>
              Ascend
            </span>
          </div>
        </div>


        <div className="admin-ventures__summary-card">
          <Rocket
            size={20}
          />

          <div>
            <strong>
              {horizonCount}
            </strong>

            <span>
              Horizon
            </span>
          </div>
        </div>

      </div>


      {/* ======================================================
          FILTERS
      ====================================================== */}

      <div className="admin-ventures__toolbar">

        <div className="admin-ventures__search">

          <Search size={17} />

          <input
            type="search"
            value={
              searchQuery
            }
            placeholder="Search ventures, founders or cohorts..."
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


        <select
          value={
            trackFilter
          }
          onChange={(
            event
          ) =>
            setTrackFilter(
              event.target.value
            )
          }
          aria-label="Filter by CFCV track"
        >
          <option value="all">
            All Tracks
          </option>

          <option value="genesis">
            Genesis
          </option>

          <option value="ascend">
            Ascend
          </option>

          <option value="horizon">
            Horizon
          </option>
        </select>


        <select
          value={
            fellowFilter
          }
          onChange={(
            event
          ) =>
            setFellowFilter(
              event.target.value
            )
          }
          aria-label="Filter by fellow status"
        >
          <option value="all">
            All Fellows
          </option>

          <option value="current">
            Current Fellows
          </option>

          <option value="alumni">
            Alumni
          </option>
        </select>


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
          <span>Venture</span>
          <span>Track</span>
          <span>Country</span>
          <span>Stage</span>
          <span>Status</span>
          <span />
        </div>


        {loading && (
          <div className="admin-ventures__empty">

            <RefreshCw
              size={28}
            />

            <h3>
              Loading ventures
            </h3>

            <p>
              Retrieving CFCV venture profiles.
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
                <RefreshCw
                  size={16}
                />

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
                {searchQuery ||
                trackFilter !== "all" ||
                fellowFilter !== "all"
                  ? "No matching ventures"
                  : "No ventures yet"}
              </h3>

              <p>
                {searchQuery ||
                trackFilter !== "all" ||
                fellowFilter !== "all"
                  ? "Change the search or filters to find another venture."
                  : "Add the first venture to the CFCV ecosystem."}
              </p>


              {!searchQuery &&
                trackFilter ===
                  "all" &&
                fellowFilter ===
                  "all" && (
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
                ) => {
                  const track =
                    getTrack(
                      venture
                    );

                  return (
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


                      <div>
                        <span
                          className={
                            getTrackClass(
                              track.value
                            )
                          }
                        >
                          {track.name}
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
                  );
                }
              )}

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
                  CFCV VENTURE PROFILE
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
                  <span
                    className={
                      getTrackClass(
                        getTrackValue(
                          selectedVenture
                        )
                      )
                    }
                  >
                    {
                      getTrack(
                        selectedVenture
                      ).name
                    } — {
                      getTrack(
                        selectedVenture
                      ).action
                    }
                  </span>

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
                  <Sparkles
                    size={18}
                  />

                  <div>
                    <span>
                      CFCV Track
                    </span>

                    <strong>
                      {
                        getTrack(
                          selectedVenture
                        ).name
                      }
                    </strong>
                  </div>
                </div>


                <div className="admin-ventures__detail-card">
                  <Users
                    size={18}
                  />

                  <div>
                    <span>
                      Fellowship
                    </span>

                    <strong>
                      {getFellowStatus(
                        selectedVenture
                      ) ===
                      "alumni"
                        ? "Alumni"
                        : "Current Fellow"}
                    </strong>
                  </div>
                </div>


                <div className="admin-ventures__detail-card">
                  <Globe2
                    size={18}
                  />

                  <div>
                    <span>
                      Cohort
                    </span>

                    <strong>
                      {getCohort(
                        selectedVenture
                      ) ||
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


                <div className="admin-ventures__detail-card">
                  <Sparkles
                    size={18}
                  />

                  <div>
                    <span>
                      Catalytic Support
                    </span>

                    <strong>
                      {hasCatalyticSupport(
                        selectedVenture
                      )
                        ? "Selected"
                        : "Not selected"}
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
                    ? "EDIT CFCV VENTURE"
                    : "NEW CFCV VENTURE"}
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


            {/* STEPS */}

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
                )
              )}

            </div>


            <div className="admin-ventures__form">

              {formError && (
                <div className="admin-ventures__form-error">
                  {formError}
                </div>
              )}


              {/* =================================================
                  STEP 1 — CFCV
              ================================================= */}

              {formStep === 1 && (
                <>

                  <div className="admin-ventures__step-heading">
                    <h3>
                      CFCV Placement
                    </h3>

                    <p>
                      Place the venture in its CFCV
                      pathway, cohort and fellowship status.
                    </p>
                  </div>


                  <div className="admin-ventures__subsection">

                    <div className="admin-ventures__subsection-header">
                      <div>
                        <h4>
                          Venture Pathway
                        </h4>

                        <p>
                          Select the pathway that reflects
                          the venture&apos;s current development stage.
                        </p>
                      </div>
                    </div>


                    {CFCV_TRACKS.map(
                      (track) => (
                        <label
                          key={
                            track.value
                          }
                          className="admin-ventures__opportunity-editor"
                        >
                          <div>
                            <input
                              type="radio"
                              name="cfcvTrack"
                              value={
                                track.value
                              }
                              checked={
                                form.cfcvTrack ===
                                track.value
                              }
                              onChange={
                                handleFormChange
                              }
                            />

                            <strong>
                              {track.name} — {track.action}
                            </strong>
                          </div>

                          <p>
                            {track.description}
                          </p>
                        </label>
                      )
                    )}

                  </div>


                  <div className="admin-ventures__form-grid">

                    <div className="admin-ventures__field">
                      <label>
                        Fellow Status *
                      </label>

                      <select
                        name="fellowStatus"
                        value={
                          form.fellowStatus
                        }
                        onChange={
                          handleFormChange
                        }
                      >
                        {FELLOW_STATUSES.map(
                          (item) => (
                            <option
                              key={
                                item.value
                              }
                              value={
                                item.value
                              }
                            >
                              {item.label}
                            </option>
                          )
                        )}
                      </select>
                    </div>


                    <div className="admin-ventures__field">
                      <label>
                        Cohort Year
                      </label>

                      <input
                        name="cohortYear"
                        type="number"
                        min="2000"
                        max="2100"
                        value={
                          form.cohortYear
                        }
                        onChange={
                          handleFormChange
                        }
                        placeholder="2026"
                      />
                    </div>

                  </div>


                  <div className="admin-ventures__field">
                    <label>
                      Cohort Name
                    </label>

                    <input
                      name="cohort"
                      value={
                        form.cohort
                      }
                      onChange={
                        handleFormChange
                      }
                      placeholder="e.g. CFCV 2026 Cohort"
                    />
                  </div>


                  <div className="admin-ventures__field">
                    <label>
                      Display Order
                    </label>

                    <input
                      name="displayOrder"
                      type="number"
                      min="0"
                      value={
                        form.displayOrder
                      }
                      onChange={
                        handleFormChange
                      }
                      placeholder="0"
                    />

                    <small>
                      Lower numbers can be displayed first
                      in the public venture directory.
                    </small>
                  </div>


                  <div className="admin-ventures__publishing-note">

                    <label>
                      <input
                        type="checkbox"
                        name="catalyticSupport"
                        checked={
                          form.catalyticSupport
                        }
                        onChange={
                          handleFormChange
                        }
                      />

                      {" "}
                      Selected for Catalytic Support
                    </label>

                    <p>
                      Use this after the venture has been
                      formally selected for additional
                      catalytic support.
                    </p>

                  </div>

                </>
              )}


              {/* =================================================
                  STEP 2 — VENTURE
              ================================================= */}

              {formStep === 2 && (
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
                  STEP 3 — BUSINESS
              ================================================= */}

              {formStep === 3 && (
                <>

                  <div className="admin-ventures__step-heading">
                    <h3>
                      Business Profile
                    </h3>

                    <p>
                      Add venture content, contact information,
                      uploaded media, services and opportunity.
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


                  {/* VENTURE LOGO */}

                  <div className="admin-ventures__field">

                    <label>
                      Venture Logo
                    </label>

                    <label className="admin-ventures__upload">

                      <div className="admin-ventures__upload-icon">
                        <ImagePlus
                          size={22}
                        />
                      </div>


                      <div className="admin-ventures__upload-copy">

                        <strong>
                          Upload venture logo
                        </strong>

                        <span>
                          JPG, PNG or WebP · Maximum 8 MB
                        </span>

                      </div>


                      <span className="admin-ventures__upload-button">
                        Choose File
                      </span>


                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={
                          handleLogoUpload
                        }
                      />

                    </label>

                  </div>


                  {form.logoPreview && (
                    <div className="admin-ventures__uploaded-media">

                      <div className="admin-ventures__image-preview admin-ventures__image-preview--logo">

                        <img
                          src={
                            form.logoPreview
                          }
                          alt="Venture logo preview"
                        />

                      </div>


                      <div className="admin-ventures__uploaded-media-info">

                        <div>
                          <strong>
                            {form.logoFile?.name ||
                              "Current venture logo"}
                          </strong>

                          <span>
                            Venture logo
                          </span>
                        </div>


                        <button
                          type="button"
                          onClick={
                            removeLogoImage
                          }
                        >
                          <Trash2
                            size={15}
                          />

                          Remove
                        </button>

                      </div>

                    </div>
                  )}


                  {/* HERO IMAGE */}

                  <div className="admin-ventures__field">

                    <label>
                      Hero Image
                    </label>

                    <label className="admin-ventures__upload admin-ventures__upload--hero">

                      <div className="admin-ventures__upload-icon">
                        <ImagePlus
                          size={22}
                        />
                      </div>


                      <div className="admin-ventures__upload-copy">

                        <strong>
                          Upload hero image
                        </strong>

                        <span>
                          Landscape recommended · JPG, PNG or WebP
                        </span>

                      </div>


                      <span className="admin-ventures__upload-button">
                        Choose File
                      </span>


                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={
                          handleHeroUpload
                        }
                      />

                    </label>

                  </div>


                  {form.heroImagePreview && (
                    <div className="admin-ventures__uploaded-media">

                      <div className="admin-ventures__image-preview">

                        <img
                          src={
                            form.heroImagePreview
                          }
                          alt="Hero preview"
                        />

                      </div>


                      <div className="admin-ventures__uploaded-media-info">

                        <div>
                          <strong>
                            {form.heroImageFile?.name ||
                              "Current hero image"}
                          </strong>

                          <span>
                            Venture hero image
                          </span>
                        </div>


                        <button
                          type="button"
                          onClick={
                            removeHeroImage
                          }
                        >
                          <Trash2
                            size={15}
                          />

                          Remove
                        </button>

                      </div>

                    </div>
                  )}


                  {/* SERVICES */}

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
                      )
                    )}

                  </div>


                  {/* OPPORTUNITY */}

                  <div className="admin-ventures__subsection">

                    <div className="admin-ventures__subsection-header">

                      <div>
                        <h4>
                          Opportunity
                        </h4>

                        <p>
                          Explain the problem, solution,
                          market and current stage.
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
                      )
                    )}

                  </div>

                </>
              )}


              {/* =================================================
                  STEP 4 — FOUNDERS
              ================================================= */}

              {formStep === 4 && (
                <>

                  <div className="admin-ventures__step-heading">
                    <h3>
                      Founders & Opportunities
                    </h3>

                    <p>
                      Add founder profiles, upload founder photos
                      and define the relationships the venture is seeking.
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


                          {/* FOUNDER IMAGE UPLOAD */}

                          <div className="admin-ventures__field">

                            <label>
                              Founder Photo
                            </label>


                            <label className="admin-ventures__upload">

                              <div className="admin-ventures__upload-icon">
                                <UserRound
                                  size={21}
                                />
                              </div>


                              <div className="admin-ventures__upload-copy">

                                <strong>
                                  Upload founder photo
                                </strong>

                                <span>
                                  JPG, PNG or WebP · Maximum 8 MB
                                </span>

                              </div>


                              <span className="admin-ventures__upload-button">
                                Choose File
                              </span>


                              <input
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                onChange={(
                                  event
                                ) =>
                                  handleFounderImageUpload(
                                    index,
                                    event
                                  )
                                }
                              />

                            </label>

                          </div>


                          {founder.imagePreview && (
                            <div className="admin-ventures__founder-upload-preview">

                              <div className="admin-ventures__founder-image-preview">

                                <img
                                  src={
                                    founder.imagePreview
                                  }
                                  alt={
                                    founder.name
                                      ? `${founder.name} preview`
                                      : "Founder preview"
                                  }
                                />

                              </div>


                              <div>

                                <strong>
                                  {founder.imageFile?.name ||
                                    "Current founder photo"}
                                </strong>


                                <button
                                  type="button"
                                  onClick={() =>
                                    removeFounderImage(
                                      index
                                    )
                                  }
                                >
                                  <Trash2
                                    size={14}
                                  />

                                  Remove
                                </button>

                              </div>

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
                      )
                    )}

                  </div>


                  {/* LOOKING FOR */}

                  <div className="admin-ventures__subsection">

                    <div className="admin-ventures__subsection-header">

                      <div>
                        <h4>
                          Looking For
                        </h4>

                        <p>
                          What relationships or opportunities
                          does this venture need?
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
                      )
                    )}

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
                        This venture will appear in the public
                        CFCV venture directory after saving.
                      </p>
                    ) : form.status ===
                      "archived" ? (
                      <p>
                        This venture will be hidden
                        from the public website.
                      </p>
                    ) : (
                      <p>
                        This venture remains private
                        in the CMS until published.
                      </p>
                    )}

                  </div>

                </>
              )}


              {/* =================================================
                  STEP 5 — REVIEW
              ================================================= */}

              {formStep === 5 && (
                <>

                  <div className="admin-ventures__step-heading">

                    <h3>
                      Review Venture
                    </h3>

                    <p>
                      Confirm the CFCV placement, uploaded
                      media and venture information before saving.
                    </p>

                  </div>


                  {form.heroImagePreview && (
                    <div className="admin-ventures__review-hero">

                      <img
                        src={
                          form.heroImagePreview
                        }
                        alt=""
                      />

                    </div>
                  )}


                  <div className="admin-ventures__review-profile">

                    <div className="admin-ventures__review-logo">

                      {form.logoPreview ? (
                        <img
                          src={
                            form.logoPreview
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
                        {
                          CFCV_TRACKS.find(
                            (track) =>
                              track.value ===
                              form.cfcvTrack
                          )?.name
                        } — {
                          CFCV_TRACKS.find(
                            (track) =>
                              track.value ===
                              form.cfcvTrack
                          )?.action
                        }
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
                        CFCV Track
                      </span>

                      <strong>
                        {
                          CFCV_TRACKS.find(
                            (track) =>
                              track.value ===
                              form.cfcvTrack
                          )?.name
                        }
                      </strong>
                    </div>


                    <div>
                      <span>
                        Fellow Status
                      </span>

                      <strong>
                        {form.fellowStatus ===
                        "alumni"
                          ? "Alumni"
                          : "Current Fellow"}
                      </strong>
                    </div>


                    <div>
                      <span>
                        Cohort
                      </span>

                      <strong>
                        {form.cohort ||
                          "Not specified"}
                      </strong>
                    </div>


                    <div>
                      <span>
                        Cohort Year
                      </span>

                      <strong>
                        {form.cohortYear ||
                          "Not specified"}
                      </strong>
                    </div>


                    <div>
                      <span>
                        Catalytic Support
                      </span>

                      <strong>
                        {form.catalyticSupport
                          ? "Selected"
                          : "Not selected"}
                      </strong>
                    </div>


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
                        Venture Logo
                      </span>

                      <strong>
                        {form.logoFile
                          ? "New image selected"
                          : form.logo
                            ? "Current image retained"
                            : "No logo"}
                      </strong>
                    </div>


                    <div>
                      <span>
                        Hero Image
                      </span>

                      <strong>
                        {form.heroImageFile
                          ? "New image selected"
                          : form.heroImage
                            ? "Current image retained"
                            : "No hero image"}
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
                            (
                              item,
                              index
                            ) => (
                              <span
                                key={`${item}-${index}`}
                              >
                                {item}
                              </span>
                            )
                          )}

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
                  formStep === 5 && (
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


                  {formStep < 5 ? (
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
                        ? "Uploading & Saving..."
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