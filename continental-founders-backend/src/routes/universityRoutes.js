const express = require("express");
const { z } = require("zod");

const { supabaseAdmin } = require("../config/supabase");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();


/* ============================================================
   VALIDATION
============================================================ */

const universitySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2)
    .max(220),

  shortName: z
    .string()
    .trim()
    .max(80)
    .optional()
    .default(""),

  city: z
    .string()
    .trim()
    .max(120)
    .optional()
    .default(""),

  country: z
    .string()
    .trim()
    .min(2)
    .max(120),

  type: z
    .string()
    .trim()
    .max(120)
    .optional()
    .default("University"),

  website: z
    .string()
    .trim()
    .max(500)
    .optional()
    .default(""),

  logoUrl: z
    .string()
    .trim()
    .max(1000)
    .optional()
    .default(""),

  description: z
    .string()
    .trim()
    .max(3000)
    .optional()
    .default(""),

  status: z
    .enum([
      "draft",
      "pending",
      "active",
      "inactive",
      "archived",
    ])
    .default("draft"),

  participationAreas: z
    .array(
      z
        .string()
        .trim()
        .min(1)
        .max(150)
    )
    .max(20)
    .optional()
    .default([]),
});


const updateUniversitySchema =
  universitySchema.partial();


/* ============================================================
   HELPERS
============================================================ */

function normalizeUniversity(row) {
  if (!row) {
    return null;
  }

  return {
    ...row,

    shortName:
      row.short_name || "",

    logoUrl:
      row.logo_url || "",

    participationAreas:
      Array.isArray(
        row.participation_areas
      )
        ? row.participation_areas
        : [],
  };
}


function cleanParticipationAreas(
  items = []
) {
  return [
    ...new Set(
      items
        .map((item) =>
          String(item).trim()
        )
        .filter(Boolean)
    ),
  ];
}


/* ============================================================
   PUBLIC
   GET /api/universities
============================================================ */

router.get(
  "/",
  async (
    req,
    res
  ) => {
    try {
      const {
        data,
        error,
      } =
        await supabaseAdmin
          .from(
            "universities"
          )
          .select("*")
          .eq(
            "status",
            "active"
          )
          .order(
            "name",
            {
              ascending: true,
            }
          );

      if (error) {
        console.error(
          "Load public universities error:",
          error
        );

        return res
          .status(500)
          .json({
            success: false,
            message:
              "Unable to load universities.",
          });
      }

      return res.json({
        success: true,

        count:
          data?.length || 0,

        universities:
          (data || []).map(
            normalizeUniversity
          ),
      });
    } catch (
      error
    ) {
      console.error(
        "Public universities route error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Unable to load universities.",
        });
    }
  }
);


/* ============================================================
   ADMIN DIRECTORY
   GET /api/universities/directory
============================================================ */

router.get(
  "/directory",
  requireAdmin,
  async (
    req,
    res
  ) => {
    try {
      const {
        data,
        error,
      } =
        await supabaseAdmin
          .from(
            "universities"
          )
          .select("*")
          .order(
            "created_at",
            {
              ascending: false,
            }
          );

      if (error) {
        console.error(
          "Admin universities load error:",
          error
        );

        return res
          .status(500)
          .json({
            success: false,
            message:
              "Unable to load university directory.",
          });
      }

      return res.json({
        success: true,

        count:
          data?.length || 0,

        universities:
          (data || []).map(
            normalizeUniversity
          ),
      });
    } catch (
      error
    ) {
      console.error(
        "Admin universities route error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Unable to load university directory.",
        });
    }
  }
);


/* ============================================================
   CREATE
   POST /api/universities
============================================================ */

router.post(
  "/",
  requireAdmin,
  async (
    req,
    res
  ) => {
    try {
      const parsed =
        universitySchema.safeParse(
          req.body
        );

      if (
        !parsed.success
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Invalid university data.",
            errors:
              parsed.error.flatten(),
          });
      }

      const input =
        parsed.data;

      const {
        data:
          existing,
      } =
        await supabaseAdmin
          .from(
            "universities"
          )
          .select("id")
          .ilike(
            "name",
            input.name
          )
          .maybeSingle();

      if (
        existing
      ) {
        return res
          .status(409)
          .json({
            success: false,
            message:
              "A university with this name already exists.",
          });
      }

      const payload = {
        name:
          input.name,

        short_name:
          input.shortName ||
          null,

        city:
          input.city ||
          null,

        country:
          input.country,

        type:
          input.type ||
          "University",

        website:
          input.website ||
          null,

        logo_url:
          input.logoUrl ||
          null,

        description:
          input.description ||
          null,

        status:
          input.status,

        participation_areas:
          cleanParticipationAreas(
            input.participationAreas
          ),

        updated_at:
          new Date().toISOString(),
      };

      const {
        data,
        error,
      } =
        await supabaseAdmin
          .from(
            "universities"
          )
          .insert(
            payload
          )
          .select("*")
          .single();

      if (error) {
        console.error(
          "Create university error:",
          error
        );

        return res
          .status(500)
          .json({
            success: false,
            message:
              "Unable to create university.",
          });
      }

      return res
        .status(201)
        .json({
          success: true,
          university:
            normalizeUniversity(
              data
            ),
          message:
            "University created successfully.",
        });
    } catch (
      error
    ) {
      console.error(
        "Create university route error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Unable to create university.",
        });
    }
  }
);


/* ============================================================
   UPDATE
   PATCH /api/universities/:id
============================================================ */

router.patch(
  "/:id",
  requireAdmin,
  async (
    req,
    res
  ) => {
    try {
      const {
        id,
      } =
        req.params;

      const parsed =
        updateUniversitySchema.safeParse(
          req.body
        );

      if (
        !parsed.success
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Invalid university data.",
            errors:
              parsed.error.flatten(),
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
            "universities"
          )
          .select("*")
          .eq(
            "id",
            id
          )
          .maybeSingle();

      if (
        existingError
      ) {
        console.error(
          "Find university error:",
          existingError
        );

        return res
          .status(500)
          .json({
            success: false,
            message:
              "Unable to verify university.",
          });
      }

      if (
        !existing
      ) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "University not found.",
          });
      }

      const input =
        parsed.data;

      if (
        input.name
      ) {
        const {
          data:
            duplicate,
        } =
          await supabaseAdmin
            .from(
              "universities"
            )
            .select("id")
            .ilike(
              "name",
              input.name
            )
            .neq(
              "id",
              id
            )
            .maybeSingle();

        if (
          duplicate
        ) {
          return res
            .status(409)
            .json({
              success: false,
              message:
                "Another university already uses this name.",
            });
        }
      }

      const updates = {
        updated_at:
          new Date().toISOString(),
      };

      if (
        input.name !==
        undefined
      ) {
        updates.name =
          input.name;
      }

      if (
        input.shortName !==
        undefined
      ) {
        updates.short_name =
          input.shortName ||
          null;
      }

      if (
        input.city !==
        undefined
      ) {
        updates.city =
          input.city ||
          null;
      }

      if (
        input.country !==
        undefined
      ) {
        updates.country =
          input.country;
      }

      if (
        input.type !==
        undefined
      ) {
        updates.type =
          input.type ||
          "University";
      }

      if (
        input.website !==
        undefined
      ) {
        updates.website =
          input.website ||
          null;
      }

      if (
        input.logoUrl !==
        undefined
      ) {
        updates.logo_url =
          input.logoUrl ||
          null;
      }

      if (
        input.description !==
        undefined
      ) {
        updates.description =
          input.description ||
          null;
      }

      if (
        input.status !==
        undefined
      ) {
        updates.status =
          input.status;
      }

      if (
        input.participationAreas !==
        undefined
      ) {
        updates.participation_areas =
          cleanParticipationAreas(
            input.participationAreas
          );
      }

      const {
        data,
        error,
      } =
        await supabaseAdmin
          .from(
            "universities"
          )
          .update(
            updates
          )
          .eq(
            "id",
            id
          )
          .select("*")
          .single();

      if (error) {
        console.error(
          "Update university error:",
          error
        );

        return res
          .status(500)
          .json({
            success: false,
            message:
              "Unable to update university.",
          });
      }

      return res.json({
        success: true,

        university:
          normalizeUniversity(
            data
          ),

        message:
          "University updated successfully.",
      });
    } catch (
      error
    ) {
      console.error(
        "Update university route error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Unable to update university.",
        });
    }
  }
);


/* ============================================================
   DELETE
   DELETE /api/universities/:id
============================================================ */

router.delete(
  "/:id",
  requireAdmin,
  async (
    req,
    res
  ) => {
    try {
      const {
        id,
      } =
        req.params;

      const {
        data:
          existing,
        error:
          existingError,
      } =
        await supabaseAdmin
          .from(
            "universities"
          )
          .select(
            "id, name"
          )
          .eq(
            "id",
            id
          )
          .maybeSingle();

      if (
        existingError
      ) {
        console.error(
          "Find university delete error:",
          existingError
        );

        return res
          .status(500)
          .json({
            success: false,
            message:
              "Unable to verify university.",
          });
      }

      if (
        !existing
      ) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "University not found.",
          });
      }

      const {
        error,
      } =
        await supabaseAdmin
          .from(
            "universities"
          )
          .delete()
          .eq(
            "id",
            id
          );

      if (error) {
        console.error(
          "Delete university error:",
          error
        );

        return res
          .status(500)
          .json({
            success: false,
            message:
              "Unable to delete university.",
          });
      }

      return res.json({
        success: true,

        deletedUniversity: {
          id:
            existing.id,

          name:
            existing.name,
        },

        message:
          "University deleted successfully.",
      });
    } catch (
      error
    ) {
      console.error(
        "Delete university route error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Unable to delete university.",
        });
    }
  }
);


module.exports =
  router;