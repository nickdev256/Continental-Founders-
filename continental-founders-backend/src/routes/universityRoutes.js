const express =
  require("express");

const {
  supabaseAdmin,
} =
  require("../config/supabase");

const {
  requireAdmin,
} =
  require("../middleware/auth");


const router =
  express.Router();


/* ============================================================
   HELPERS
============================================================ */

function normalizeUniversity(
  university
) {

  if (!university) {
    return null;
  }


  return {

    id:
      university.id,

    name:
      university.name,

    short_name:
      university.short_name,

    shortName:
      university.short_name,

    city:
      university.city,

    country:
      university.country,

    type:
      university.type,

    website:
      university.website,

    logo_url:
      university.logo_url,

    logoUrl:
      university.logo_url,

    description:
      university.description,

    status:
      university.status,

    participation_areas:
      university.participation_areas ||
      [],

    participationAreas:
      university.participation_areas ||
      [],

    created_at:
      university.created_at,

    createdAt:
      university.created_at,

    updated_at:
      university.updated_at,

    updatedAt:
      university.updated_at,

  };

}


/* ============================================================
   PUBLIC UNIVERSITIES

   GET /api/universities

   Only active universities are returned publicly.
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
              ascending:
                true,
            }
          );


      if (
        error
      ) {

        throw error;

      }


      return res
        .status(200)
        .json({

          success:
            true,

          count:
            Array.isArray(
              data
            )
              ? data.length
              : 0,

          universities:
            Array.isArray(
              data
            )
              ? data.map(
                  normalizeUniversity
                )
              : [],

        });

    } catch (
      error
    ) {

      console.error(
        "Get public universities error:",
        error
      );


      return res
        .status(500)
        .json({

          success:
            false,

          message:
            error?.message ||
            "Unable to load universities.",

        });

    }

  }
);


/* ============================================================
   GET UNIVERSITY DIRECTORY
   ADMIN CMS

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
              ascending:
                false,
            }
          );


      if (
        error
      ) {

        throw error;

      }


      return res
        .status(200)
        .json({

          success:
            true,

          count:
            Array.isArray(
              data
            )
              ? data.length
              : 0,

          universities:
            Array.isArray(
              data
            )
              ? data.map(
                  normalizeUniversity
                )
              : [],

        });

    } catch (
      error
    ) {

      console.error(
        "Get universities directory error:",
        error
      );


      return res
        .status(500)
        .json({

          success:
            false,

          message:
            error?.message ||
            "Unable to load universities.",

        });

    }

  }
);


/* ============================================================
   CREATE UNIVERSITY
   ADMIN CMS

   POST /api/universities/directory
============================================================ */

router.post(
  "/directory",
  requireAdmin,
  async (
    req,
    res
  ) => {

    try {

      const {
        name,
        shortName,
        city,
        country,
        type,
        website,
        logoUrl,
        description,
        status,
        participationAreas,
      } =
        req.body;


      if (
        !name ||
        !String(
          name
        ).trim()
      ) {

        return res
          .status(400)
          .json({

            success:
              false,

            message:
              "University name is required.",

          });

      }


      if (
        !country ||
        !String(
          country
        ).trim()
      ) {

        return res
          .status(400)
          .json({

            success:
              false,

            message:
              "Country is required.",

          });

      }


      const normalizedName =
        String(
          name
        ).trim();


      const {
        data:
          existingUniversity,

        error:
          existingError,
      } =
        await supabaseAdmin
          .from(
            "universities"
          )
          .select(
            "id"
          )
          .ilike(
            "name",
            normalizedName
          )
          .maybeSingle();


      if (
        existingError
      ) {

        throw existingError;

      }


      if (
        existingUniversity
      ) {

        return res
          .status(409)
          .json({

            success:
              false,

            message:
              "This university already exists.",

          });

      }


      const now =
        new Date()
          .toISOString();


      const {
        data,
        error,
      } =
        await supabaseAdmin
          .from(
            "universities"
          )
          .insert({

            name:
              normalizedName,

            short_name:
              shortName
                ? String(
                    shortName
                  ).trim()
                : null,

            city:
              city
                ? String(
                    city
                  ).trim()
                : null,

            country:
              String(
                country
              ).trim(),

            type:
              type
                ? String(
                    type
                  ).trim()
                : "University",

            website:
              website
                ? String(
                    website
                  ).trim()
                : null,

            logo_url:
              logoUrl
                ? String(
                    logoUrl
                  ).trim()
                : null,

            description:
              description
                ? String(
                    description
                  ).trim()
                : null,

            status:
              status ||
              "draft",

            participation_areas:
              Array.isArray(
                participationAreas
              )
                ? participationAreas
                : [],

            created_at:
              now,

            updated_at:
              now,

          })
          .select("*")
          .single();


      if (
        error
      ) {

        throw error;

      }


      return res
        .status(201)
        .json({

          success:
            true,

          university:
            normalizeUniversity(
              data
            ),

          message:
            "University added successfully.",

        });

    } catch (
      error
    ) {

      console.error(
        "Create university error:",
        error
      );


      return res
        .status(500)
        .json({

          success:
            false,

          message:
            error?.message ||
            "Unable to create university.",

        });

    }

  }
);


/* ============================================================
   UPDATE UNIVERSITY
   ADMIN CMS

   PATCH /api/universities/directory/:id
============================================================ */

router.patch(
  "/directory/:id",
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
        name,
        shortName,
        city,
        country,
        type,
        website,
        logoUrl,
        description,
        status,
        participationAreas,
      } =
        req.body;


      const {
        data:
          existingUniversity,

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

        throw existingError;

      }


      if (
        !existingUniversity
      ) {

        return res
          .status(404)
          .json({

            success:
              false,

            message:
              "University not found.",

          });

      }


      if (
        name !==
        undefined
      ) {

        const normalizedName =
          String(
            name
          ).trim();


        if (
          !normalizedName
        ) {

          return res
            .status(400)
            .json({

              success:
                false,

              message:
                "University name is required.",

            });

        }


        if (
          normalizedName !==
          existingUniversity.name
        ) {

          const {
            data:
              conflictingUniversity,

            error:
              conflictError,
          } =
            await supabaseAdmin
              .from(
                "universities"
              )
              .select(
                "id"
              )
              .ilike(
                "name",
                normalizedName
              )
              .neq(
                "id",
                id
              )
              .maybeSingle();


          if (
            conflictError
          ) {

            throw conflictError;

          }


          if (
            conflictingUniversity
          ) {

            return res
              .status(409)
              .json({

                success:
                  false,

                message:
                  "Another university already uses this name.",

              });

          }

        }

      }


      if (
        country !==
        undefined &&
        !String(
          country
        ).trim()
      ) {

        return res
          .status(400)
          .json({

            success:
              false,

            message:
              "Country is required.",

          });

      }


      const updates = {

        updated_at:
          new Date()
            .toISOString(),

      };


      if (
        name !==
        undefined
      ) {

        updates.name =
          String(
            name
          ).trim();

      }


      if (
        shortName !==
        undefined
      ) {

        updates.short_name =
          shortName
            ? String(
                shortName
              ).trim()
            : null;

      }


      if (
        city !==
        undefined
      ) {

        updates.city =
          city
            ? String(
                city
              ).trim()
            : null;

      }


      if (
        country !==
        undefined
      ) {

        updates.country =
          String(
            country
          ).trim();

      }


      if (
        type !==
        undefined
      ) {

        updates.type =
          type
            ? String(
                type
              ).trim()
            : "University";

      }


      if (
        website !==
        undefined
      ) {

        updates.website =
          website
            ? String(
                website
              ).trim()
            : null;

      }


      if (
        logoUrl !==
        undefined
      ) {

        updates.logo_url =
          logoUrl
            ? String(
                logoUrl
              ).trim()
            : null;

      }


      if (
        description !==
        undefined
      ) {

        updates.description =
          description
            ? String(
                description
              ).trim()
            : null;

      }


      if (
        status !==
        undefined
      ) {

        updates.status =
          status;

      }


      if (
        participationAreas !==
        undefined
      ) {

        updates.participation_areas =
          Array.isArray(
            participationAreas
          )
            ? participationAreas
            : [];

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


      if (
        error
      ) {

        throw error;

      }


      return res
        .status(200)
        .json({

          success:
            true,

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
        "Update university error:",
        error
      );


      return res
        .status(500)
        .json({

          success:
            false,

          message:
            error?.message ||
            "Unable to update university.",

        });

    }

  }
);


/* ============================================================
   DELETE UNIVERSITY
   ADMIN CMS

   DELETE /api/universities/directory/:id
============================================================ */

router.delete(
  "/directory/:id",
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
        data,
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
          )
          .select(
            "id, name"
          )
          .maybeSingle();


      if (
        error
      ) {

        throw error;

      }


      if (
        !data
      ) {

        return res
          .status(404)
          .json({

            success:
              false,

            message:
              "University not found.",

          });

      }


      return res
        .status(200)
        .json({

          success:
            true,

          deletedUniversity: {

            id:
              data.id,

            name:
              data.name,

          },

          message:
            "University deleted successfully.",

        });

    } catch (
      error
    ) {

      console.error(
        "Delete university error:",
        error
      );


      return res
        .status(500)
        .json({

          success:
            false,

          message:
            error?.message ||
            "Unable to delete university.",

        });

    }

  }
);


/* ============================================================
   EXPORT
============================================================ */

module.exports =
  router;