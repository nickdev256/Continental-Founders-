const { z } = require("zod");

const {
  supabaseAdmin,
} = require("../config/supabase");


/* ============================================================
   CONSTANTS
============================================================ */

const VENTURES_TABLE =
  "ventures";


/* ============================================================
   VALIDATION
============================================================ */

const founderSchema =
  z.object({
    name:
      z
        .string()
        .trim()
        .min(
          1,
          "Founder name is required."
        )
        .max(
          180,
          "Founder name is too long."
        ),

    role:
      z
        .string()
        .trim()
        .max(180)
        .default(""),

    image:
      z
        .string()
        .trim()
        .max(2000)
        .default(""),

    bio:
      z
        .string()
        .trim()
        .max(5000)
        .default(""),
  });


/*
 * Opportunity areas are intentionally flexible.
 *
 * The CMS can currently send either:
 *
 * "Problem"
 *
 * or:
 *
 * {
 *   title: "Problem",
 *   description: "..."
 * }
 *
 * This gives us room to improve the CMS later without
 * breaking existing venture records.
 */

const opportunityAreaSchema =
  z.union([
    z
      .string()
      .trim()
      .max(500),

    z.object({
      title:
        z
          .string()
          .trim()
          .max(180)
          .default(""),

      description:
        z
          .string()
          .trim()
          .max(5000)
          .default(""),

      label:
        z
          .string()
          .trim()
          .max(180)
          .optional(),

      value:
        z
          .string()
          .trim()
          .max(5000)
          .optional(),
    }),
  ]);


const ventureCreateSchema =
  z.object({

    name:
      z
        .string()
        .trim()
        .min(
          2,
          "Venture name is required."
        )
        .max(220),

    slug:
      z
        .string()
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

    sector:
      z
        .string()
        .trim()
        .min(
          2,
          "Sector is required."
        )
        .max(180),

    country:
      z
        .string()
        .trim()
        .min(
          2,
          "Country is required."
        )
        .max(180),

    stage:
      z
        .string()
        .trim()
        .min(
          2,
          "Venture stage is required."
        )
        .max(180),

    tagline:
      z
        .string()
        .trim()
        .max(500)
        .default(""),

    description:
      z
        .string()
        .trim()
        .max(5000)
        .default(""),

    longDescription:
      z
        .string()
        .trim()
        .max(15000)
        .default(""),

    secondaryDescription:
      z
        .string()
        .trim()
        .max(10000)
        .default(""),

    problem:
      z
        .string()
        .trim()
        .max(10000)
        .default(""),

    solution:
      z
        .string()
        .trim()
        .max(10000)
        .default(""),

    market:
      z
        .string()
        .trim()
        .max(10000)
        .default(""),

    website:
      z
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

    email:
      z
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

    phone:
      z
        .string()
        .trim()
        .max(80)
        .default(""),

    secondaryPhone:
      z
        .string()
        .trim()
        .max(80)
        .default(""),

    logoUrl:
      z
        .union([
          z
            .string()
            .trim()
            .url(
              "Logo URL must be valid."
            ),

          z.literal(""),
        ])
        .default(""),

    heroImageUrl:
      z
        .union([
          z
            .string()
            .trim()
            .url(
              "Hero image URL must be valid."
            ),

          z.literal(""),
        ])
        .default(""),

    founders:
      z
        .array(
          founderSchema
        )
        .max(30)
        .default([]),

    services:
      z
        .array(
          z
            .string()
            .trim()
            .max(500)
        )
        .max(100)
        .default([]),

    lookingFor:
      z
        .array(
          z
            .string()
            .trim()
            .max(500)
        )
        .max(100)
        .default([]),

    opportunityAreas:
      z
        .array(
          opportunityAreaSchema
        )
        .max(100)
        .default([]),

    status:
      z
        .enum([
          "draft",
          "published",
          "archived",
        ])
        .default(
          "draft"
        ),
  });


const ventureUpdateSchema =
  ventureCreateSchema
    .partial();


/* ============================================================
   HELPERS
============================================================ */

function normalizeVenture(
  venture
) {

  if (!venture) {
    return null;
  }


  return {

    id:
      venture.id,

    name:
      venture.name ||
      "",

    slug:
      venture.slug ||
      "",

    sector:
      venture.sector ||
      "",

    country:
      venture.country ||
      "",

    stage:
      venture.stage ||
      "",

    tagline:
      venture.tagline ||
      "",

    description:
      venture.description ||
      "",

    longDescription:
      venture.long_description ||
      "",

    secondaryDescription:
      venture.secondary_description ||
      "",

    problem:
      venture.problem ||
      "",

    solution:
      venture.solution ||
      "",

    market:
      venture.market ||
      "",

    website:
      venture.website ||
      "",

    email:
      venture.email ||
      "",

    phone:
      venture.phone ||
      "",

    secondaryPhone:
      venture.secondary_phone ||
      "",

    logoUrl:
      venture.logo_url ||
      "",

    heroImageUrl:
      venture.hero_image_url ||
      "",

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
      venture.status ||
      "draft",

    publishedAt:
      venture.published_at ||
      null,

    createdAt:
      venture.created_at ||
      null,

    updatedAt:
      venture.updated_at ||
      null,
  };

}


/* ============================================================
   CLEAN STRING ARRAY
============================================================ */

function cleanStringArray(
  values
) {

  if (
    !Array.isArray(
      values
    )
  ) {

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
    new Set(
      cleaned
    )
  );

}


/* ============================================================
   CLEAN FOUNDERS
============================================================ */

function cleanFounders(
  founders
) {

  if (
    !Array.isArray(
      founders
    )
  ) {

    return [];

  }


  return founders
    .map(
      (founder) => ({
        name:
          String(
            founder?.name ||
            ""
          ).trim(),

        role:
          String(
            founder?.role ||
            ""
          ).trim(),

        image:
          String(
            founder?.image ||
            ""
          ).trim(),

        bio:
          String(
            founder?.bio ||
            ""
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

  if (
    !Array.isArray(
      areas
    )
  ) {

    return [];

  }


  return areas
    .map(
      (area) => {

        if (
          typeof area ===
          "string"
        ) {

          return area.trim();

        }


        if (
          area &&
          typeof area ===
          "object"
        ) {

          return {

            title:
              String(
                area.title ||
                area.label ||
                ""
              ).trim(),

            description:
              String(
                area.description ||
                area.value ||
                ""
              ).trim(),
          };

        }


        return null;

      }
    )
    .filter(
      (area) => {

        if (!area) {
          return false;
        }


        if (
          typeof area ===
          "string"
        ) {

          return Boolean(
            area
          );

        }


        return Boolean(
          area.title ||
          area.description
        );

      }
    );

}


/* ============================================================
   CREATE DATABASE PAYLOAD
============================================================ */

function buildCreatePayload(
  input
) {

  const now =
    new Date()
      .toISOString();


  return {

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
      input.tagline ||
      "",

    description:
      input.description ||
      "",

    long_description:
      input.longDescription ||
      "",

    secondary_description:
      input.secondaryDescription ||
      "",

    problem:
      input.problem ||
      "",

    solution:
      input.solution ||
      "",

    market:
      input.market ||
      "",

    website:
      input.website ||
      "",

    email:
      input.email ||
      "",

    phone:
      input.phone ||
      "",

    secondary_phone:
      input.secondaryPhone ||
      "",

    logo_url:
      input.logoUrl ||
      "",

    hero_image_url:
      input.heroImageUrl ||
      "",

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
      input.status ||
      "draft",

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
   CREATE UPDATE PAYLOAD
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


  if (
    input.name !==
    undefined
  ) {

    payload.name =
      input.name;

  }


  if (
    input.slug !==
    undefined
  ) {

    payload.slug =
      input.slug;

  }


  if (
    input.sector !==
    undefined
  ) {

    payload.sector =
      input.sector;

  }


  if (
    input.country !==
    undefined
  ) {

    payload.country =
      input.country;

  }


  if (
    input.stage !==
    undefined
  ) {

    payload.stage =
      input.stage;

  }


  if (
    input.tagline !==
    undefined
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
    input.problem !==
    undefined
  ) {

    payload.problem =
      input.problem;

  }


  if (
    input.solution !==
    undefined
  ) {

    payload.solution =
      input.solution;

  }


  if (
    input.market !==
    undefined
  ) {

    payload.market =
      input.market;

  }


  if (
    input.website !==
    undefined
  ) {

    payload.website =
      input.website;

  }


  if (
    input.email !==
    undefined
  ) {

    payload.email =
      input.email;

  }


  if (
    input.phone !==
    undefined
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
    input.logoUrl !==
    undefined
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
    input.founders !==
    undefined
  ) {

    payload.founders =
      cleanFounders(
        input.founders
      );

  }


  if (
    input.services !==
    undefined
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


  if (
    input.status !==
    undefined
  ) {

    payload.status =
      input.status;


    /*
     * Set the publication timestamp only
     * when a venture becomes published.
     */

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


    /*
     * A draft/archived venture should
     * no longer have an active
     * publication timestamp.
     */

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
   VALIDATION ERROR
============================================================ */

function sendValidationError(
  res,
  parsed
) {

  const issues =
    parsed.error?.issues ||
    [];


  return res
    .status(400)
    .json({

      success:
        false,

      message:
        issues[0]?.message ||
        "Please check the venture information.",

      errors:
        issues.map(
          (issue) => ({
            field:
              issue.path.join(
                "."
              ),

            message:
              issue.message,
          })
        ),
    });

}


/* ============================================================
   GET PUBLISHED VENTURES
   PUBLIC
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
          "published_at",
          {
            ascending:
              false,

            nullsFirst:
              false,
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

          success:
            false,

          message:
            "Unable to load ventures.",
        });

    }


    return res
      .status(200)
      .json({

        success:
          true,

        ventures:
          (
            data ||
            []
          ).map(
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

        success:
          false,

        message:
          "Unable to load ventures.",
      });

  }

}


/* ============================================================
   GET PUBLISHED VENTURE BY SLUG
   PUBLIC
============================================================ */

async function getPublishedVentureBySlug(
  req,
  res
) {

  try {

    const slug =
      String(
        req.params.slug ||
        ""
      )
        .trim()
        .toLowerCase();


    if (!slug) {

      return res
        .status(400)
        .json({

          success:
            false,

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

          success:
            false,

          message:
            "Unable to load this venture.",
        });

    }


    if (!data) {

      return res
        .status(404)
        .json({

          success:
            false,

          message:
            "Venture not found.",
        });

    }


    return res
      .status(200)
      .json({

        success:
          true,

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

        success:
          false,

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
          "created_at",
          {
            ascending:
              false,
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

          success:
            false,

          message:
            "Unable to load the venture directory.",
        });

    }


    return res
      .status(200)
      .json({

        success:
          true,

        ventures:
          (
            data ||
            []
          ).map(
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

        success:
          false,

        message:
          "Unable to load the venture directory.",
      });

  }

}


/* ============================================================
   CREATE VENTURE
============================================================ */

async function createVenture(
  req,
  res
) {

  try {

    const parsed =
      ventureCreateSchema
        .safeParse(
          req.body
        );


    if (
      !parsed.success
    ) {

      return sendValidationError(
        res,
        parsed
      );

    }


    const input =
      parsed.data;


    /* ----------------------------------------------------------
       CHECK DUPLICATE SLUG
    ---------------------------------------------------------- */

    const {
      data:
        existingSlug,

      error:
        duplicateError,
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

          success:
            false,

          message:
            "Unable to validate the venture slug.",
        });

    }


    if (
      existingSlug
    ) {

      return res
        .status(409)
        .json({

          success:
            false,

          message:
            "A venture with this slug already exists.",
        });

    }


    const payload =
      buildCreatePayload(
        input
      );


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


      return res
        .status(500)
        .json({

          success:
            false,

          message:
            "Unable to create the venture.",
        });

    }


    return res
      .status(201)
      .json({

        success:
          true,

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


    return res
      .status(500)
      .json({

        success:
          false,

        message:
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

  try {

    const id =
      String(
        req.params.id ||
        ""
      ).trim();


    if (!id) {

      return res
        .status(400)
        .json({

          success:
            false,

          message:
            "Venture ID is required.",
        });

    }


    const parsed =
      ventureUpdateSchema
        .safeParse(
          req.body
        );


    if (
      !parsed.success
    ) {

      return sendValidationError(
        res,
        parsed
      );

    }


    const input =
      parsed.data;


    /* ----------------------------------------------------------
       LOAD CURRENT RECORD
    ---------------------------------------------------------- */

    const {
      data:
        existing,

      error:
        existingError,
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

          success:
            false,

          message:
            "Unable to load the venture.",
        });

    }


    if (!existing) {

      return res
        .status(404)
        .json({

          success:
            false,

          message:
            "Venture not found.",
        });

    }


    /* ----------------------------------------------------------
       CHECK SLUG IF IT CHANGED
    ---------------------------------------------------------- */

    if (
      input.slug &&
      input.slug.toLowerCase() !==
        String(
          existing.slug ||
          ""
        ).toLowerCase()
    ) {

      const {
        data:
          duplicateSlug,

        error:
          duplicateError,
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


      if (
        duplicateError
      ) {

        console.error(
          "Check updated venture slug error:",
          duplicateError
        );


        return res
          .status(500)
          .json({

            success:
              false,

            message:
              "Unable to validate the venture slug.",
          });

      }


      if (
        duplicateSlug
      ) {

        return res
          .status(409)
          .json({

            success:
              false,

            message:
              "Another venture already uses this slug.",
          });

      }

    }


    const payload =
      buildUpdatePayload(
        input,
        existing
      );


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


      return res
        .status(500)
        .json({

          success:
            false,

          message:
            "Unable to update the venture.",
        });

    }


    return res
      .status(200)
      .json({

        success:
          true,

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


    return res
      .status(500)
      .json({

        success:
          false,

        message:
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
        req.params.id ||
        ""
      ).trim();


    if (!id) {

      return res
        .status(400)
        .json({

          success:
            false,

          message:
            "Venture ID is required.",
        });

    }


    const {
      data:
        existing,

      error:
        existingError,
    } =
      await supabaseAdmin
        .from(
          VENTURES_TABLE
        )
        .select(
          "id, name, slug"
        )
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

          success:
            false,

          message:
            "Unable to load the venture.",
        });

    }


    if (!existing) {

      return res
        .status(404)
        .json({

          success:
            false,

          message:
            "Venture not found.",
        });

    }


    const {
      data:
        deletedVenture,

      error:
        deleteError,
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

          success:
            false,

          message:
            "Unable to delete the venture.",
        });

    }


    if (
      !deletedVenture
    ) {

      return res
        .status(500)
        .json({

          success:
            false,

          message:
            "The venture could not be confirmed as deleted.",
        });

    }


    return res
      .status(200)
      .json({

        success:
          true,

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

        success:
          false,

        message:
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