const crypto = require("crypto");
const path = require("path");
const { z } = require("zod");

const {
  supabaseAdmin,
} = require("../config/supabase");


/* ============================================================
   CONSTANTS
============================================================ */

const VENTURES_TABLE = "ventures";
const VENTURE_IMAGES_BUCKET = "venture-images";


/* ============================================================
   VALIDATION
============================================================ */

const founderSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Founder name is required.")
    .max(180, "Founder name is too long."),

  role: z
    .string()
    .trim()
    .max(180)
    .default(""),

  image: z
    .string()
    .trim()
    .max(2000)
    .default(""),

  bio: z
    .string()
    .trim()
    .max(5000)
    .default(""),

  removeImage: z
    .boolean()
    .optional()
    .default(false),
});


const opportunityAreaSchema = z.union([
  z
    .string()
    .trim()
    .max(5000),

  z.object({
    title: z
      .string()
      .trim()
      .max(180)
      .default(""),

    text: z
      .string()
      .trim()
      .max(10000)
      .default(""),

    description: z
      .string()
      .trim()
      .max(10000)
      .optional(),

    label: z
      .string()
      .trim()
      .max(180)
      .optional(),

    value: z
      .string()
      .trim()
      .max(10000)
      .optional(),
  }),
]);


/* ============================================================
   CREATE SCHEMA
============================================================ */

const ventureCreateSchema = z.object({
  /* ----------------------------------------------------------
     CFCV
  ---------------------------------------------------------- */

  cfcvTrack: z
    .string()
    .trim()
    .max(180)
    .default(""),

  fellowStatus: z
    .string()
    .trim()
    .max(180)
    .default(""),

  cohort: z
    .string()
    .trim()
    .max(180)
    .default(""),

  cohortYear: z
    .union([
      z.number().int().min(2000).max(2100),
      z.null(),
    ])
    .optional()
    .default(null),

  catalyticSupport: z
    .boolean()
    .optional()
    .default(false),

  displayOrder: z
    .number()
    .int()
    .min(0)
    .optional()
    .default(0),


  /* ----------------------------------------------------------
     CORE VENTURE
  ---------------------------------------------------------- */

  name: z
    .string({
      required_error:
        "Venture name is required.",
    })
    .trim()
    .min(
      2,
      "Venture name is required."
    )
    .max(220),

  slug: z
    .string({
      required_error:
        "Venture slug is required.",
    })
    .trim()
    .min(
      2,
      "Venture slug is required."
    )
    .max(220)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must contain lowercase letters, numbers and hyphens only."
    ),

  sector: z
    .string({
      required_error:
        "Sector is required.",
    })
    .trim()
    .min(
      2,
      "Sector is required."
    )
    .max(180),

  country: z
    .string({
      required_error:
        "Country is required.",
    })
    .trim()
    .min(
      2,
      "Country is required."
    )
    .max(180),

  stage: z
    .string({
      required_error:
        "Venture stage is required.",
    })
    .trim()
    .min(
      2,
      "Venture stage is required."
    )
    .max(180),

  tagline: z
    .string()
    .trim()
    .max(500)
    .default(""),

  description: z
    .string()
    .trim()
    .max(5000)
    .default(""),

  longDescription: z
    .string()
    .trim()
    .max(15000)
    .default(""),

  secondaryDescription: z
    .string()
    .trim()
    .max(10000)
    .default(""),

  problem: z
    .string()
    .trim()
    .max(10000)
    .default(""),

  solution: z
    .string()
    .trim()
    .max(10000)
    .default(""),

  market: z
    .string()
    .trim()
    .max(10000)
    .default(""),

  website: z
    .union([
      z
        .string()
        .trim()
        .url(
          "Website must be a valid URL."
        ),

      z.literal(""),
    ])
    .default(""),

  email: z
    .union([
      z
        .string()
        .trim()
        .email(
          "Email address is invalid."
        ),

      z.literal(""),
    ])
    .default(""),

  phone: z
    .string()
    .trim()
    .max(80)
    .default(""),

  secondaryPhone: z
    .string()
    .trim()
    .max(80)
    .default(""),

  logoUrl: z
    .string()
    .trim()
    .max(2000)
    .default(""),

  heroImageUrl: z
    .string()
    .trim()
    .max(2000)
    .default(""),

  founders: z
    .array(founderSchema)
    .max(30)
    .default([]),

  services: z
    .array(
      z
        .string()
        .trim()
        .max(500)
    )
    .max(100)
    .default([]),

  lookingFor: z
    .array(
      z
        .string()
        .trim()
        .max(500)
    )
    .max(100)
    .default([]),

  opportunityAreas: z
    .array(opportunityAreaSchema)
    .max(100)
    .default([]),

  status: z
    .enum([
      "draft",
      "published",
      "archived",
    ])
    .default("draft"),

  removeLogo: z
    .boolean()
    .optional()
    .default(false),

  removeHeroImage: z
    .boolean()
    .optional()
    .default(false),

  founderImageIndexes: z
    .array(
      z.number().int().min(0)
    )
    .max(30)
    .optional()
    .default([]),
});


const ventureUpdateSchema =
  ventureCreateSchema.partial();


/* ============================================================
   NORMALIZE VENTURE FROM DATABASE
============================================================ */

function normalizeVenture(venture) {
  if (!venture) {
    return null;
  }

  return {
    id:
      venture.id,

    /* CFCV */

    cfcvTrack:
      venture.cfcv_track || "",

    fellowStatus:
      venture.fellow_status || "",

    cohort:
      venture.cohort || "",

    cohortYear:
      venture.cohort_year ?? null,

    catalyticSupport:
      Boolean(
        venture.catalytic_support
      ),

    displayOrder:
      venture.display_order ?? 0,

    /* CORE */

    name:
      venture.name || "",

    slug:
      venture.slug || "",

    sector:
      venture.sector || "",

    country:
      venture.country || "",

    stage:
      venture.stage || "",

    tagline:
      venture.tagline || "",

    description:
      venture.description || "",

    longDescription:
      venture.long_description || "",

    secondaryDescription:
      venture.secondary_description ||
      "",

    problem:
      venture.problem || "",

    solution:
      venture.solution || "",

    market:
      venture.market || "",

    website:
      venture.website || "",

    email:
      venture.email || "",

    phone:
      venture.phone || "",

    secondaryPhone:
      venture.secondary_phone || "",

    logoUrl:
      venture.logo_url || "",

    heroImageUrl:
      venture.hero_image_url || "",

    founders:
      Array.isArray(
        venture.founders
      )
        ? venture.founders
        : [],

    services:
      Array.isArray(
        venture.services
      )
        ? venture.services
        : [],

    lookingFor:
      Array.isArray(
        venture.looking_for
      )
        ? venture.looking_for
        : [],

    opportunityAreas:
      Array.isArray(
        venture.opportunity_areas
      )
        ? venture.opportunity_areas
        : [],

    status:
      venture.status || "draft",

    publishedAt:
      venture.published_at || null,

    createdAt:
      venture.created_at || null,

    updatedAt:
      venture.updated_at || null,
  };
}


/* ============================================================
   BOOLEAN PARSER
============================================================ */

function parseBoolean(value) {
  if (
    typeof value === "boolean"
  ) {
    return value;
  }

  if (
    typeof value === "number"
  ) {
    return value === 1;
  }

  if (
    typeof value === "string"
  ) {
    const normalized =
      value
        .trim()
        .toLowerCase();

    return [
      "true",
      "1",
      "yes",
      "on",
    ].includes(normalized);
  }

  return false;
}


/* ============================================================
   JSON PARSER
============================================================ */

function parseJsonField(
  value,
  fallback
) {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return fallback;
  }

  if (
    typeof value !== "string"
  ) {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    console.error(
      "Unable to parse venture JSON field:",
      error
    );

    return fallback;
  }
}


/* ============================================================
   NUMBER PARSER
============================================================ */

function parseOptionalInteger(
  value
) {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  const number =
    Number(value);

  return Number.isInteger(number)
    ? number
    : value;
}


function parseInteger(
  value,
  fallback = 0
) {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return fallback;
  }

  const number =
    Number(value);

  return Number.isInteger(number)
    ? number
    : value;
}


/* ============================================================
   NORMALIZE REQUEST BODY
============================================================ */

function normalizeRequestBody(
  body = {}
) {
  const normalized = {
    ...body,
  };


  /* ----------------------------------------------------------
     JSON ARRAYS
  ---------------------------------------------------------- */

  if (
    Object.prototype.hasOwnProperty.call(
      body,
      "founders"
    )
  ) {
    normalized.founders =
      parseJsonField(
        body.founders,
        []
      );
  }


  if (
    Object.prototype.hasOwnProperty.call(
      body,
      "services"
    )
  ) {
    normalized.services =
      parseJsonField(
        body.services,
        []
      );
  }


  if (
    Object.prototype.hasOwnProperty.call(
      body,
      "lookingFor"
    )
  ) {
    normalized.lookingFor =
      parseJsonField(
        body.lookingFor,
        []
      );
  }


  if (
    Object.prototype.hasOwnProperty.call(
      body,
      "opportunityAreas"
    )
  ) {
    normalized.opportunityAreas =
      parseJsonField(
        body.opportunityAreas,
        []
      );
  }


  if (
    Object.prototype.hasOwnProperty.call(
      body,
      "founderImageIndexes"
    )
  ) {
    normalized.founderImageIndexes =
      parseJsonField(
        body.founderImageIndexes,
        []
      )
        .map(
          (value) =>
            Number(value)
        )
        .filter(
          (value) =>
            Number.isInteger(
              value
            ) &&
            value >= 0
        );
  }


  /* ----------------------------------------------------------
     BOOLEANS
  ---------------------------------------------------------- */

  if (
    Object.prototype.hasOwnProperty.call(
      body,
      "removeLogo"
    )
  ) {
    normalized.removeLogo =
      parseBoolean(
        body.removeLogo
      );
  }


  if (
    Object.prototype.hasOwnProperty.call(
      body,
      "removeHeroImage"
    )
  ) {
    normalized.removeHeroImage =
      parseBoolean(
        body.removeHeroImage
      );
  }


  if (
    Object.prototype.hasOwnProperty.call(
      body,
      "catalyticSupport"
    )
  ) {
    normalized.catalyticSupport =
      parseBoolean(
        body.catalyticSupport
      );
  }


  /* ----------------------------------------------------------
     NUMBERS
  ---------------------------------------------------------- */

  if (
    Object.prototype.hasOwnProperty.call(
      body,
      "cohortYear"
    )
  ) {
    normalized.cohortYear =
      parseOptionalInteger(
        body.cohortYear
      );
  }


  if (
    Object.prototype.hasOwnProperty.call(
      body,
      "displayOrder"
    )
  ) {
    normalized.displayOrder =
      parseInteger(
        body.displayOrder,
        0
      );
  }


  /* ----------------------------------------------------------
     FOUNDER REMOVE IMAGE
  ---------------------------------------------------------- */

  if (
    Array.isArray(
      normalized.founders
    )
  ) {
    normalized.founders =
      normalized.founders.map(
        (founder) => ({
          ...founder,

          removeImage:
            parseBoolean(
              founder?.removeImage
            ),
        })
      );
  }


  return normalized;
}


/* ============================================================
   CLEAN STRING ARRAY
============================================================ */

function cleanStringArray(values) {
  if (!Array.isArray(values)) {
    return [];
  }

  const cleaned =
    values
      .map(
        (value) =>
          String(
            value || ""
          ).trim()
      )
      .filter(Boolean);

  return Array.from(
    new Set(cleaned)
  );
}


/* ============================================================
   CLEAN FOUNDERS
============================================================ */

function cleanFounders(founders) {
  if (!Array.isArray(founders)) {
    return [];
  }

  return founders
    .map(
      (founder) => ({
        name:
          String(
            founder?.name || ""
          ).trim(),

        role:
          String(
            founder?.role || ""
          ).trim(),

        image:
          String(
            founder?.image || ""
          ).trim(),

        bio:
          String(
            founder?.bio || ""
          ).trim(),
      })
    )
    .filter(
      (founder) =>
        founder.name
    );
}


/* ============================================================
   CLEAN OPPORTUNITY AREAS
============================================================ */

function cleanOpportunityAreas(
  areas
) {
  if (!Array.isArray(areas)) {
    return [];
  }

  return areas
    .map((area) => {
      if (
        typeof area === "string"
      ) {
        const value =
          area.trim();

        if (!value) {
          return null;
        }

        return {
          title: value,
          text: "",
        };
      }

      if (
        area &&
        typeof area === "object"
      ) {
        return {
          title:
            String(
              area.title ||
              area.label ||
              ""
            ).trim(),

          text:
            String(
              area.text ||
              area.description ||
              area.value ||
              ""
            ).trim(),
        };
      }

      return null;
    })
    .filter(
      (area) =>
        area &&
        (
          area.title ||
          area.text
        )
    );
}


/* ============================================================
   FILE EXTENSION
============================================================ */

function getFileExtension(file) {
  const mimeExtensions = {
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
  };

  if (
    mimeExtensions[
      file?.mimetype
    ]
  ) {
    return mimeExtensions[
      file.mimetype
    ];
  }

  const originalExtension =
    path
      .extname(
        file?.originalname ||
        ""
      )
      .toLowerCase();

  if (
    [
      ".jpg",
      ".jpeg",
      ".png",
      ".webp",
    ].includes(
      originalExtension
    )
  ) {
    return originalExtension ===
      ".jpeg"
      ? ".jpg"
      : originalExtension;
  }

  return ".jpg";
}


/* ============================================================
   SAFE STORAGE NAME
============================================================ */

function safeStorageName(value) {
  return String(
    value || "venture"
  )
    .trim()
    .toLowerCase()
    .replace(
      /[^a-z0-9]+/g,
      "-"
    )
    .replace(
      /^-+|-+$/g,
      ""
    )
    .slice(
      0,
      120
    ) ||
    "venture";
}


/* ============================================================
   CREATE STORAGE PATH
============================================================ */

function createStoragePath(
  folder,
  ventureSlug,
  file
) {
  const extension =
    getFileExtension(file);

  const uniqueId =
    crypto
      .randomBytes(12)
      .toString("hex");

  return [
    "ventures",
    folder,
    safeStorageName(
      ventureSlug
    ),
    `${Date.now()}-${uniqueId}${extension}`,
  ].join("/");
}


/* ============================================================
   UPLOAD IMAGE
============================================================ */

async function uploadVentureImage(
  file,
  folder,
  ventureSlug
) {
  if (!file?.buffer) {
    throw new Error(
      "The uploaded image is invalid."
    );
  }

  const storagePath =
    createStoragePath(
      folder,
      ventureSlug,
      file
    );

  const {
    error: uploadError,
  } =
    await supabaseAdmin
      .storage
      .from(
        VENTURE_IMAGES_BUCKET
      )
      .upload(
        storagePath,
        file.buffer,
        {
          contentType:
            file.mimetype,

          cacheControl:
            "3600",

          upsert:
            false,
        }
      );

  if (uploadError) {
    console.error(
      "Venture image upload error:",
      uploadError
    );

    throw new Error(
      "Unable to upload the venture image."
    );
  }

  const {
    data: publicUrlData,
  } =
    supabaseAdmin
      .storage
      .from(
        VENTURE_IMAGES_BUCKET
      )
      .getPublicUrl(
        storagePath
      );

  const publicUrl =
    publicUrlData?.publicUrl ||
    "";

  if (!publicUrl) {
    await supabaseAdmin
      .storage
      .from(
        VENTURE_IMAGES_BUCKET
      )
      .remove([
        storagePath,
      ]);

    throw new Error(
      "Unable to generate the venture image URL."
    );
  }

  return {
    path:
      storagePath,

    publicUrl,
  };
}


/* ============================================================
   STORAGE PATH FROM PUBLIC URL
============================================================ */

function getStoragePathFromUrl(
  publicUrl
) {
  if (
    !publicUrl ||
    typeof publicUrl !==
      "string"
  ) {
    return "";
  }

  try {
    const url =
      new URL(publicUrl);

    const pathname =
      decodeURIComponent(
        url.pathname
      );

    const markers = [
      `/storage/v1/object/public/${VENTURE_IMAGES_BUCKET}/`,
      `/storage/v1/object/sign/${VENTURE_IMAGES_BUCKET}/`,
      `/storage/v1/object/${VENTURE_IMAGES_BUCKET}/`,
    ];

    for (
      const marker of markers
    ) {
      const index =
        pathname.indexOf(
          marker
        );

      if (index !== -1) {
        return pathname
          .slice(
            index +
            marker.length
          )
          .replace(
            /^\/+/,
            ""
          );
      }
    }

    return "";
  } catch (error) {
    return "";
  }
}


/* ============================================================
   DELETE STORAGE FILE
============================================================ */

async function deleteStorageFileByUrl(
  publicUrl
) {
  const storagePath =
    getStoragePathFromUrl(
      publicUrl
    );

  if (!storagePath) {
    return false;
  }

  const {
    error,
  } =
    await supabaseAdmin
      .storage
      .from(
        VENTURE_IMAGES_BUCKET
      )
      .remove([
        storagePath,
      ]);

  if (error) {
    console.error(
      "Delete venture storage file error:",
      error
    );

    return false;
  }

  return true;
}


/* ============================================================
   DELETE MULTIPLE STORAGE URLS
============================================================ */

async function deleteStorageUrls(
  urls
) {
  const uniqueUrls =
    Array.from(
      new Set(
        (urls || [])
          .filter(Boolean)
      )
    );

  for (
    const url of uniqueUrls
  ) {
    try {
      await deleteStorageFileByUrl(
        url
      );
    } catch (error) {
      console.error(
        "Venture storage cleanup error:",
        error
      );
    }
  }
}


/* ============================================================
   FILE HELPERS
   Supports multer upload.any()
============================================================ */

function getRequestFiles(req) {
  if (
    Array.isArray(
      req.files
    )
  ) {
    return req.files;
  }

  if (
    req.files &&
    typeof req.files ===
      "object"
  ) {
    return Object
      .values(
        req.files
      )
      .flat()
      .filter(Boolean);
  }

  return [];
}


function getSingleFile(
  req,
  fieldName
) {
  const files =
    getRequestFiles(req);

  return (
    files.find(
      (file) =>
        file?.fieldname ===
        fieldName
    ) ||
    null
  );
}


/* ============================================================
   DYNAMIC FOUNDER IMAGE FILES
============================================================ */

function getFounderImageFiles(req) {
  const files =
    getRequestFiles(req);

  return files
    .map((file) => {
      const match =
        String(
          file?.fieldname ||
          ""
        ).match(
          /^founderImage_(\d+)$/
        );

      if (!match) {
        return null;
      }

      const founderIndex =
        Number(
          match[1]
        );

      if (
        !Number.isInteger(
          founderIndex
        ) ||
        founderIndex < 0
      ) {
        return null;
      }

      return {
        file,
        founderIndex,
      };
    })
    .filter(Boolean)
    .sort(
      (a, b) =>
        a.founderIndex -
        b.founderIndex
    );
}


/* ============================================================
   APPLY FOUNDER IMAGES
============================================================ */

async function applyFounderImages({
  founders,
  founderUploads,
  ventureSlug,
}) {
  const updatedFounders =
    Array.isArray(founders)
      ? founders.map(
          (founder) => ({
            ...founder,
          })
        )
      : [];

  const uploadedUrls = [];

  for (
    const uploadItem of
    founderUploads
  ) {
    const {
      file,
      founderIndex,
    } =
      uploadItem;

    if (
      !Number.isInteger(
        founderIndex
      ) ||
      founderIndex < 0 ||
      founderIndex >=
        updatedFounders.length
    ) {
      throw new Error(
        `Founder image ${founderIndex} could not be matched to a founder.`
      );
    }

    const uploaded =
      await uploadVentureImage(
        file,
        "founders",
        ventureSlug
      );

    uploadedUrls.push(
      uploaded.publicUrl
    );

    updatedFounders[
      founderIndex
    ].image =
      uploaded.publicUrl;
  }

  return {
    founders:
      updatedFounders,

    uploadedUrls,
  };
}


/* ============================================================
   VALIDATION ERROR
============================================================ */

function sendValidationError(
  res,
  parsed
) {
  const issues =
    parsed.error?.issues ||
    [];

  console.error(
    "VENTURE VALIDATION FAILED:",
    JSON.stringify(
      issues,
      null,
      2
    )
  );

  return res
    .status(400)
    .json({
      success:
        false,

      message:
        issues.length
          ? issues
              .map((issue) => {
                const field =
                  issue.path?.length
                    ? issue.path.join(
                        "."
                      )
                    : "venture";

                return `${field}: ${issue.message}`;
              })
              .join(" | ")
          : "Please check the venture information.",

      errors:
        issues.map(
          (issue) => ({
            field:
              issue.path?.length
                ? issue.path.join(
                    "."
                  )
                : "venture",

            message:
              issue.message,

            code:
              issue.code,
          })
        ),
    });
}


/* ============================================================
   CREATE DATABASE PAYLOAD
============================================================ */

function buildCreatePayload(input) {
  const now =
    new Date()
      .toISOString();

  return {
    /* CFCV */

    cfcv_track:
      input.cfcvTrack || "",

    fellow_status:
      input.fellowStatus || "",

    cohort:
      input.cohort || "",

    cohort_year:
      input.cohortYear ?? null,

    catalytic_support:
      input.catalyticSupport ===
      true,

    display_order:
      input.displayOrder ?? 0,

    /* CORE */

    name:
      input.name,

    slug:
      input.slug,

    sector:
      input.sector,

    country:
      input.country,

    stage:
      input.stage,

    tagline:
      input.tagline || "",

    description:
      input.description || "",

    long_description:
      input.longDescription ||
      "",

    secondary_description:
      input.secondaryDescription ||
      "",

    problem:
      input.problem || "",

    solution:
      input.solution || "",

    market:
      input.market || "",

    website:
      input.website || "",

    email:
      input.email || "",

    phone:
      input.phone || "",

    secondary_phone:
      input.secondaryPhone || "",

    logo_url:
      input.logoUrl || "",

    hero_image_url:
      input.heroImageUrl || "",

    founders:
      cleanFounders(
        input.founders
      ),

    services:
      cleanStringArray(
        input.services
      ),

    looking_for:
      cleanStringArray(
        input.lookingFor
      ),

    opportunity_areas:
      cleanOpportunityAreas(
        input.opportunityAreas
      ),

    status:
      input.status || "draft",

    published_at:
      input.status ===
      "published"
        ? now
        : null,

    created_at:
      now,

    updated_at:
      now,
  };
}


/* ============================================================
   UPDATE DATABASE PAYLOAD
============================================================ */

function buildUpdatePayload(
  input,
  existing
) {
  const payload = {
    updated_at:
      new Date()
        .toISOString(),
  };


  /* ----------------------------------------------------------
     CFCV
  ---------------------------------------------------------- */

  if (
    input.cfcvTrack !==
    undefined
  ) {
    payload.cfcv_track =
      input.cfcvTrack;
  }

  if (
    input.fellowStatus !==
    undefined
  ) {
    payload.fellow_status =
      input.fellowStatus;
  }

  if (
    input.cohort !==
    undefined
  ) {
    payload.cohort =
      input.cohort;
  }

  if (
    input.cohortYear !==
    undefined
  ) {
    payload.cohort_year =
      input.cohortYear;
  }

  if (
    input.catalyticSupport !==
    undefined
  ) {
    payload.catalytic_support =
      input.catalyticSupport ===
      true;
  }

  if (
    input.displayOrder !==
    undefined
  ) {
    payload.display_order =
      input.displayOrder;
  }


  /* ----------------------------------------------------------
     CORE
  ---------------------------------------------------------- */

  if (
    input.name !== undefined
  ) {
    payload.name =
      input.name;
  }

  if (
    input.slug !== undefined
  ) {
    payload.slug =
      input.slug;
  }

  if (
    input.sector !== undefined
  ) {
    payload.sector =
      input.sector;
  }

  if (
    input.country !== undefined
  ) {
    payload.country =
      input.country;
  }

  if (
    input.stage !== undefined
  ) {
    payload.stage =
      input.stage;
  }

  if (
    input.tagline !== undefined
  ) {
    payload.tagline =
      input.tagline;
  }

  if (
    input.description !==
    undefined
  ) {
    payload.description =
      input.description;
  }

  if (
    input.longDescription !==
    undefined
  ) {
    payload.long_description =
      input.longDescription;
  }

  if (
    input.secondaryDescription !==
    undefined
  ) {
    payload.secondary_description =
      input.secondaryDescription;
  }

  if (
    input.problem !== undefined
  ) {
    payload.problem =
      input.problem;
  }

  if (
    input.solution !== undefined
  ) {
    payload.solution =
      input.solution;
  }

  if (
    input.market !== undefined
  ) {
    payload.market =
      input.market;
  }

  if (
    input.website !== undefined
  ) {
    payload.website =
      input.website;
  }

  if (
    input.email !== undefined
  ) {
    payload.email =
      input.email;
  }

  if (
    input.phone !== undefined
  ) {
    payload.phone =
      input.phone;
  }

  if (
    input.secondaryPhone !==
    undefined
  ) {
    payload.secondary_phone =
      input.secondaryPhone;
  }

  if (
    input.logoUrl !== undefined
  ) {
    payload.logo_url =
      input.logoUrl;
  }

  if (
    input.heroImageUrl !==
    undefined
  ) {
    payload.hero_image_url =
      input.heroImageUrl;
  }

  if (
    input.founders !== undefined
  ) {
    payload.founders =
      cleanFounders(
        input.founders
      );
  }

  if (
    input.services !== undefined
  ) {
    payload.services =
      cleanStringArray(
        input.services
      );
  }

  if (
    input.lookingFor !==
    undefined
  ) {
    payload.looking_for =
      cleanStringArray(
        input.lookingFor
      );
  }

  if (
    input.opportunityAreas !==
    undefined
  ) {
    payload.opportunity_areas =
      cleanOpportunityAreas(
        input.opportunityAreas
      );
  }


  /* ----------------------------------------------------------
     PUBLICATION STATUS
  ---------------------------------------------------------- */

  if (
    input.status !== undefined
  ) {
    payload.status =
      input.status;

    if (
      input.status ===
        "published" &&
      existing.status !==
        "published"
    ) {
      payload.published_at =
        new Date()
          .toISOString();
    }

    if (
      input.status !==
      "published"
    ) {
      payload.published_at =
        null;
    }
  }

  return payload;
}


/* ============================================================
   GET PUBLISHED VENTURES
============================================================ */

async function getPublishedVentures(
  req,
  res
) {
  try {
    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from(
          VENTURES_TABLE
        )
        .select("*")
        .eq(
          "status",
          "published"
        )
        .order(
          "display_order",
          {
            ascending: true,
          }
        )
        .order(
          "published_at",
          {
            ascending: false,
            nullsFirst: false,
          }
        );

    if (error) {
      console.error(
        "Get published ventures error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Unable to load ventures.",
        });
    }

    return res
      .status(200)
      .json({
        success: true,

        ventures:
          (data || []).map(
            normalizeVenture
          ),
      });
  } catch (error) {
    console.error(
      "Get published ventures exception:",
      error
    );

    return res
      .status(500)
      .json({
        success: false,
        message:
          "Unable to load ventures.",
      });
  }
}


/* ============================================================
   GET PUBLISHED VENTURE BY SLUG
============================================================ */

async function getPublishedVentureBySlug(
  req,
  res
) {
  try {
    const slug =
      String(
        req.params.slug || ""
      )
        .trim()
        .toLowerCase();

    if (!slug) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Venture slug is required.",
        });
    }

    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from(
          VENTURES_TABLE
        )
        .select("*")
        .eq(
          "slug",
          slug
        )
        .eq(
          "status",
          "published"
        )
        .maybeSingle();

    if (error) {
      console.error(
        "Get venture by slug error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Unable to load this venture.",
        });
    }

    if (!data) {
      return res
        .status(404)
        .json({
          success: false,
          message:
            "Venture not found.",
        });
    }

    return res
      .status(200)
      .json({
        success: true,

        venture:
          normalizeVenture(
            data
          ),
      });
  } catch (error) {
    console.error(
      "Get venture by slug exception:",
      error
    );

    return res
      .status(500)
      .json({
        success: false,
        message:
          "Unable to load this venture.",
      });
  }
}


/* ============================================================
   GET ADMIN VENTURE DIRECTORY
============================================================ */

async function getVenturesDirectory(
  req,
  res
) {
  try {
    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from(
          VENTURES_TABLE
        )
        .select("*")
        .order(
          "display_order",
          {
            ascending: true,
          }
        )
        .order(
          "created_at",
          {
            ascending: false,
          }
        );

    if (error) {
      console.error(
        "Get venture directory error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Unable to load the venture directory.",
        });
    }

    return res
      .status(200)
      .json({
        success: true,

        ventures:
          (data || []).map(
            normalizeVenture
          ),
      });
  } catch (error) {
    console.error(
      "Get venture directory exception:",
      error
    );

    return res
      .status(500)
      .json({
        success: false,
        message:
          "Unable to load the venture directory.",
      });
  }
}


/* ============================================================
   EXTRACT MULTIPART VENTURE
============================================================ */

function extractVentureBody(req) {
  let requestBody =
    req.body || {};

  if (
    Object.prototype
      .hasOwnProperty
      .call(
        requestBody,
        "venture"
      )
  ) {
    const parsedVenture =
      parseJsonField(
        requestBody.venture,
        null
      );

    if (
      !parsedVenture ||
      typeof parsedVenture !==
        "object" ||
      Array.isArray(
        parsedVenture
      )
    ) {
      return {
        success: false,
        body: null,
      };
    }

    requestBody = {
      ...requestBody,
      ...parsedVenture,
    };

    delete requestBody.venture;
  }

  return {
    success: true,
    body:
      normalizeRequestBody(
        requestBody
      ),
  };
}


/* ============================================================
   CREATE VENTURE
============================================================ */

async function createVenture(
  req,
  res
) {
  const uploadedUrls = [];

  try {
    /* ----------------------------------------------------------
       READ MULTIPART VENTURE
    ---------------------------------------------------------- */

    const extracted =
      extractVentureBody(req);

    if (!extracted.success) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "The venture information is invalid.",
        });
    }

    const parsed =
      ventureCreateSchema
        .safeParse(
          extracted.body
        );

    if (!parsed.success) {
      return sendValidationError(
        res,
        parsed
      );
    }

    const input = {
      ...parsed.data,
    };


    /* ----------------------------------------------------------
       CHECK DUPLICATE SLUG
    ---------------------------------------------------------- */

    const {
      data: existingSlug,
      error: duplicateError,
    } =
      await supabaseAdmin
        .from(
          VENTURES_TABLE
        )
        .select(
          "id, slug"
        )
        .ilike(
          "slug",
          input.slug
        )
        .maybeSingle();

    if (duplicateError) {
      console.error(
        "Check venture slug error:",
        duplicateError
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Unable to validate the venture slug.",
        });
    }

    if (existingSlug) {
      return res
        .status(409)
        .json({
          success: false,
          message:
            "A venture with this slug already exists.",
        });
    }


    /* ----------------------------------------------------------
       LOGO
    ---------------------------------------------------------- */

    const logoFile =
      getSingleFile(
        req,
        "logo"
      );

    if (logoFile) {
      const uploaded =
        await uploadVentureImage(
          logoFile,
          "logos",
          input.slug
        );

      input.logoUrl =
        uploaded.publicUrl;

      uploadedUrls.push(
        uploaded.publicUrl
      );
    }


    /* ----------------------------------------------------------
       HERO IMAGE
    ---------------------------------------------------------- */

    const heroFile =
      getSingleFile(
        req,
        "heroImage"
      );

    if (heroFile) {
      const uploaded =
        await uploadVentureImage(
          heroFile,
          "heroes",
          input.slug
        );

      input.heroImageUrl =
        uploaded.publicUrl;

      uploadedUrls.push(
        uploaded.publicUrl
      );
    }


    /* ----------------------------------------------------------
       FOUNDER IMAGES
    ---------------------------------------------------------- */

    const founderUploads =
      getFounderImageFiles(req);

    if (
      founderUploads.length > 0
    ) {
      const founderResult =
        await applyFounderImages({
          founders:
            input.founders,

          founderUploads,

          ventureSlug:
            input.slug,
        });

      input.founders =
        founderResult.founders;

      uploadedUrls.push(
        ...founderResult
          .uploadedUrls
      );
    }


    /* ----------------------------------------------------------
       CREATE DATABASE PAYLOAD
    ---------------------------------------------------------- */

    const payload =
      buildCreatePayload(
        input
      );


    /* ----------------------------------------------------------
       INSERT
    ---------------------------------------------------------- */

    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from(
          VENTURES_TABLE
        )
        .insert(
          payload
        )
        .select("*")
        .single();

    if (error) {
      console.error(
        "Create venture error:",
        error
      );

      await deleteStorageUrls(
        uploadedUrls
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            "Unable to create the venture.",

          error:
            process.env.NODE_ENV ===
            "development"
              ? error.message
              : undefined,
        });
    }

    return res
      .status(201)
      .json({
        success: true,

        message:
          "Venture created successfully.",

        venture:
          normalizeVenture(
            data
          ),
      });
  } catch (error) {
    console.error(
      "Create venture exception:",
      error
    );

    await deleteStorageUrls(
      uploadedUrls
    );

    return res
      .status(500)
      .json({
        success: false,

        message:
          error?.message ||
          "Unable to create the venture.",
      });
  }
}


/* ============================================================
   UPDATE VENTURE
============================================================ */

async function updateVenture(
  req,
  res
) {
  const newlyUploadedUrls = [];

  try {
    const id =
      String(
        req.params.id || ""
      ).trim();

    if (!id) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Venture ID is required.",
        });
    }


    /* ----------------------------------------------------------
       PARSE REQUEST
    ---------------------------------------------------------- */

    const extracted =
      extractVentureBody(req);

    if (!extracted.success) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "The venture information is invalid.",
        });
    }

    const parsed =
      ventureUpdateSchema
        .safeParse(
          extracted.body
        );

    if (!parsed.success) {
      return sendValidationError(
        res,
        parsed
      );
    }

    const input = {
      ...parsed.data,
    };


    /* ----------------------------------------------------------
       LOAD EXISTING VENTURE
    ---------------------------------------------------------- */

    const {
      data: existing,
      error: existingError,
    } =
      await supabaseAdmin
        .from(
          VENTURES_TABLE
        )
        .select("*")
        .eq(
          "id",
          id
        )
        .maybeSingle();

    if (existingError) {
      console.error(
        "Load venture before update error:",
        existingError
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Unable to load the venture.",
        });
    }

    if (!existing) {
      return res
        .status(404)
        .json({
          success: false,
          message:
            "Venture not found.",
        });
    }


    /* ----------------------------------------------------------
       CHECK UPDATED SLUG
    ---------------------------------------------------------- */

    if (
      input.slug &&
      input.slug.toLowerCase() !==
        String(
          existing.slug || ""
        ).toLowerCase()
    ) {
      const {
        data: duplicateSlug,
        error: duplicateError,
      } =
        await supabaseAdmin
          .from(
            VENTURES_TABLE
          )
          .select(
            "id, slug"
          )
          .ilike(
            "slug",
            input.slug
          )
          .neq(
            "id",
            id
          )
          .maybeSingle();

      if (duplicateError) {
        console.error(
          "Check updated venture slug error:",
          duplicateError
        );

        return res
          .status(500)
          .json({
            success: false,
            message:
              "Unable to validate the venture slug.",
          });
      }

      if (duplicateSlug) {
        return res
          .status(409)
          .json({
            success: false,
            message:
              "Another venture already uses this slug.",
          });
      }
    }


    const ventureSlug =
      input.slug ||
      existing.slug ||
      "venture";

    const oldUrlsToDelete = [];


    /* ----------------------------------------------------------
       LOGO
    ---------------------------------------------------------- */

    const logoFile =
      getSingleFile(
        req,
        "logo"
      );

    if (logoFile) {
      const uploaded =
        await uploadVentureImage(
          logoFile,
          "logos",
          ventureSlug
        );

      input.logoUrl =
        uploaded.publicUrl;

      newlyUploadedUrls.push(
        uploaded.publicUrl
      );

      if (
        existing.logo_url
      ) {
        oldUrlsToDelete.push(
          existing.logo_url
        );
      }
    } else if (
      input.removeLogo === true
    ) {
      input.logoUrl = "";

      if (
        existing.logo_url
      ) {
        oldUrlsToDelete.push(
          existing.logo_url
        );
      }
    } else {
      delete input.logoUrl;
    }


    /* ----------------------------------------------------------
       HERO IMAGE
    ---------------------------------------------------------- */

    const heroFile =
      getSingleFile(
        req,
        "heroImage"
      );

    if (heroFile) {
      const uploaded =
        await uploadVentureImage(
          heroFile,
          "heroes",
          ventureSlug
        );

      input.heroImageUrl =
        uploaded.publicUrl;

      newlyUploadedUrls.push(
        uploaded.publicUrl
      );

      if (
        existing.hero_image_url
      ) {
        oldUrlsToDelete.push(
          existing.hero_image_url
        );
      }
    } else if (
      input.removeHeroImage ===
      true
    ) {
      input.heroImageUrl = "";

      if (
        existing.hero_image_url
      ) {
        oldUrlsToDelete.push(
          existing.hero_image_url
        );
      }
    } else {
      delete input.heroImageUrl;
    }


    /* ----------------------------------------------------------
       FOUNDERS
    ---------------------------------------------------------- */

    if (
      input.founders !==
      undefined
    ) {
      const existingFounders =
        Array.isArray(
          existing.founders
        )
          ? existing.founders
          : [];

      input.founders =
        input.founders.map(
          (
            founder,
            index
          ) => {
            const oldFounder =
              existingFounders[
                index
              ] || {};

            const updatedFounder = {
              ...founder,
            };

            if (
              updatedFounder
                .removeImage
            ) {
              if (
                oldFounder.image
              ) {
                oldUrlsToDelete.push(
                  oldFounder.image
                );
              }

              updatedFounder.image =
                "";
            } else if (
              !updatedFounder.image &&
              oldFounder.image
            ) {
              updatedFounder.image =
                oldFounder.image;
            }

            return updatedFounder;
          }
        );


      /* --------------------------------------------------------
         REMOVED FOUNDERS
      -------------------------------------------------------- */

      if (
        existingFounders.length >
        input.founders.length
      ) {
        existingFounders
          .slice(
            input.founders.length
          )
          .forEach(
            (founder) => {
              if (
                founder?.image
              ) {
                oldUrlsToDelete.push(
                  founder.image
                );
              }
            }
          );
      }


      /* --------------------------------------------------------
         NEW FOUNDER PHOTOS
      -------------------------------------------------------- */

      const founderUploads =
        getFounderImageFiles(req);

      if (
        founderUploads.length > 0
      ) {
        founderUploads.forEach(
          ({
            founderIndex,
          }) => {
            const oldImage =
              input.founders[
                founderIndex
              ]?.image;

            if (oldImage) {
              oldUrlsToDelete.push(
                oldImage
              );
            }
          }
        );

        const founderResult =
          await applyFounderImages({
            founders:
              input.founders,

            founderUploads,

            ventureSlug,
          });

        input.founders =
          founderResult.founders;

        newlyUploadedUrls.push(
          ...founderResult
            .uploadedUrls
        );
      }
    }


    /* ----------------------------------------------------------
       BUILD UPDATE
    ---------------------------------------------------------- */

    const payload =
      buildUpdatePayload(
        input,
        existing
      );


    /* ----------------------------------------------------------
       UPDATE DATABASE
    ---------------------------------------------------------- */

    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from(
          VENTURES_TABLE
        )
        .update(
          payload
        )
        .eq(
          "id",
          id
        )
        .select("*")
        .single();

    if (error) {
      console.error(
        "Update venture error:",
        error
      );

      await deleteStorageUrls(
        newlyUploadedUrls
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Unable to update the venture.",
        });
    }


    /* ----------------------------------------------------------
       CLEAN OLD STORAGE
    ---------------------------------------------------------- */

    await deleteStorageUrls(
      oldUrlsToDelete
    );


    return res
      .status(200)
      .json({
        success: true,

        message:
          "Venture updated successfully.",

        venture:
          normalizeVenture(
            data
          ),
      });
  } catch (error) {
    console.error(
      "Update venture exception:",
      error
    );

    await deleteStorageUrls(
      newlyUploadedUrls
    );

    return res
      .status(500)
      .json({
        success: false,

        message:
          error?.message ||
          "Unable to update the venture.",
      });
  }
}


/* ============================================================
   DELETE VENTURE
============================================================ */

async function deleteVenture(
  req,
  res
) {
  try {
    const id =
      String(
        req.params.id || ""
      ).trim();

    if (!id) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Venture ID is required.",
        });
    }


    /* ----------------------------------------------------------
       LOAD VENTURE
    ---------------------------------------------------------- */

    const {
      data: existing,
      error: existingError,
    } =
      await supabaseAdmin
        .from(
          VENTURES_TABLE
        )
        .select("*")
        .eq(
          "id",
          id
        )
        .maybeSingle();

    if (existingError) {
      console.error(
        "Load venture before delete error:",
        existingError
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Unable to load the venture.",
        });
    }

    if (!existing) {
      return res
        .status(404)
        .json({
          success: false,
          message:
            "Venture not found.",
        });
    }


    /* ----------------------------------------------------------
       COLLECT STORAGE FILES
    ---------------------------------------------------------- */

    const storageUrls = [];

    if (
      existing.logo_url
    ) {
      storageUrls.push(
        existing.logo_url
      );
    }

    if (
      existing.hero_image_url
    ) {
      storageUrls.push(
        existing.hero_image_url
      );
    }

    if (
      Array.isArray(
        existing.founders
      )
    ) {
      existing.founders
        .forEach(
          (founder) => {
            if (
              founder?.image
            ) {
              storageUrls.push(
                founder.image
              );
            }
          }
        );
    }


    /* ----------------------------------------------------------
       DELETE DATABASE RECORD
    ---------------------------------------------------------- */

    const {
      data: deletedVenture,
      error: deleteError,
    } =
      await supabaseAdmin
        .from(
          VENTURES_TABLE
        )
        .delete()
        .eq(
          "id",
          id
        )
        .select(
          "id, name, slug"
        )
        .maybeSingle();

    if (deleteError) {
      console.error(
        "Delete venture error:",
        deleteError
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Unable to delete the venture.",
        });
    }

    if (!deletedVenture) {
      return res
        .status(500)
        .json({
          success: false,
          message:
            "The venture could not be confirmed as deleted.",
        });
    }


    /* ----------------------------------------------------------
       CLEAN STORAGE
    ---------------------------------------------------------- */

    await deleteStorageUrls(
      storageUrls
    );


    return res
      .status(200)
      .json({
        success: true,

        message:
          "Venture deleted successfully.",

        deletedVenture: {
          id:
            deletedVenture.id,

          name:
            deletedVenture.name,

          slug:
            deletedVenture.slug,
        },
      });
  } catch (error) {
    console.error(
      "Delete venture exception:",
      error
    );

    return res
      .status(500)
      .json({
        success: false,

        message:
          error?.message ||
          "Unable to delete the venture.",
      });
  }
}


/* ============================================================
   EXPORTS
============================================================ */

module.exports = {
  getPublishedVentures,
  getPublishedVentureBySlug,
  getVenturesDirectory,
  createVenture,
  updateVenture,
  deleteVenture,
};