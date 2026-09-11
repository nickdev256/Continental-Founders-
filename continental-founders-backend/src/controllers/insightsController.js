const {
  z,
} = require("zod");

const {
  supabaseAdmin,
} = require("../config/supabase");


/* ============================================================
   VALIDATION
============================================================ */

const insightSchema =
  z.object({

    title:
      z
        .string()
        .trim()
        .min(
          3,
          "Insight title is required."
        )
        .max(
          220,
          "Insight title is too long."
        ),

    slug:
      z
        .string()
        .trim()
        .min(
          3,
          "Insight slug is required."
        )
        .max(
          240,
          "Insight slug is too long."
        )
        .regex(
          /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
          "Invalid insight slug."
        ),

    excerpt:
      z
        .string()
        .trim()
        .optional()
        .nullable(),

    content:
      z
        .string()
        .trim()
        .min(
          1,
          "Insight content is required."
        ),

    category:
      z
        .string()
        .trim()
        .optional()
        .nullable(),

    author:
      z
        .string()
        .trim()
        .optional()
        .nullable(),

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

    publishedAt:
      z
        .string()
        .optional()
        .nullable(),

  });


const updateInsightSchema =
  insightSchema.partial();


/* ============================================================
   NORMALIZE INSIGHT
============================================================ */

function normalizeInsight(
  insight
) {

  if (
    !insight
  ) {

    return null;

  }


  return {

    id:
      insight.id,

    title:
      insight.title,

    slug:
      insight.slug,

    excerpt:
      insight.excerpt,

    content:
      insight.content,

    category:
      insight.category,

    author:
      insight.author,

    status:
      insight.status,

    published_at:
      insight.published_at,

    publishedAt:
      insight.published_at,

    created_at:
      insight.created_at,

    createdAt:
      insight.created_at,

    updated_at:
      insight.updated_at,

    updatedAt:
      insight.updated_at,

  };

}


/* ============================================================
   GET ALL INSIGHTS
   ADMIN / CMS
============================================================ */

async function getInsights(
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
          "insights"
        )
        .select(
          "*"
        )
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

        insights:
          Array.isArray(
            data
          )
            ? data.map(
                normalizeInsight
              )
            : [],

      });

  } catch (
    error
  ) {

    console.error(
      "Get insights error:",
      error
    );


    return res
      .status(500)
      .json({

        success:
          false,

        message:
          "Failed to load insights.",

      });

  }

}


/* ============================================================
   GET PUBLISHED INSIGHTS
   PUBLIC WEBSITE
============================================================ */

async function getPublishedInsights(
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
          "insights"
        )
        .select(
          "*"
        )
        .eq(
          "status",
          "published"
        )
        .order(
          "published_at",
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

        insights:
          Array.isArray(
            data
          )
            ? data.map(
                normalizeInsight
              )
            : [],

      });

  } catch (
    error
  ) {

    console.error(
      "Get published insights error:",
      error
    );


    return res
      .status(500)
      .json({

        success:
          false,

        message:
          "Failed to load published insights.",

      });

  }

}


/* ============================================================
   GET SINGLE INSIGHT BY SLUG
   PUBLIC WEBSITE
============================================================ */

async function getInsightBySlug(
  req,
  res
) {

  try {

    const {
      slug,
    } =
      req.params;


    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from(
          "insights"
        )
        .select(
          "*"
        )
        .eq(
          "slug",
          slug
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
            "Insight not found.",

        });

    }


    return res
      .status(200)
      .json({

        success:
          true,

        insight:
          normalizeInsight(
            data
          ),

      });

  } catch (
    error
  ) {

    console.error(
      "Get insight error:",
      error
    );


    return res
      .status(500)
      .json({

        success:
          false,

        message:
          "Failed to load insight.",

      });

  }

}


/* ============================================================
   CREATE INSIGHT
============================================================ */

async function createInsight(
  req,
  res
) {

  try {

    const input =
      insightSchema.parse(
        req.body
      );


    /* ========================================================
       CHECK SLUG
    ======================================================== */

    const {
      data:
        existingInsight,

      error:
        slugError,
    } =
      await supabaseAdmin
        .from(
          "insights"
        )
        .select(
          "id"
        )
        .eq(
          "slug",
          input.slug
        )
        .maybeSingle();


    if (
      slugError
    ) {

      throw slugError;

    }


    if (
      existingInsight
    ) {

      return res
        .status(409)
        .json({

          success:
            false,

          message:
            "An insight with this title already exists.",

        });

    }


    const now =
      new Date()
        .toISOString();


    let publishedAt =
      null;


    if (
      input.status ===
      "published"
    ) {

      if (
        input.publishedAt
      ) {

        const date =
          new Date(
            input.publishedAt
          );


        if (
          Number.isNaN(
            date.getTime()
          )
        ) {

          return res
            .status(400)
            .json({

              success:
                false,

              message:
                "Invalid publication date.",

            });

        }


        publishedAt =
          date.toISOString();

      } else {

        publishedAt =
          now;

      }

    }


    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from(
          "insights"
        )
        .insert({

          title:
            input.title,

          slug:
            input.slug,

          excerpt:
            input.excerpt ||
            null,

          content:
            input.content,

          category:
            input.category ||
            null,

          author:
            input.author ||
            "Continental Founders",

          status:
            input.status,

          published_at:
            publishedAt,

          created_at:
            now,

          updated_at:
            now,

        })
        .select(
          "*"
        )
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

        insight:
          normalizeInsight(
            data
          ),

        message:
          "Insight created successfully.",

      });

  } catch (
    error
  ) {

    if (
      error?.name ===
      "ZodError"
    ) {

      return res
        .status(400)
        .json({

          success:
            false,

          message:
            error.issues?.[0]?.message ||
            "Invalid insight information.",

        });

    }


    console.error(
      "Create insight error:",
      error
    );


    return res
      .status(500)
      .json({

        success:
          false,

        message:
          error?.message ||
          "Failed to create insight.",

      });

  }

}


/* ============================================================
   UPDATE INSIGHT
============================================================ */

async function updateInsight(
  req,
  res
) {

  try {

    const {
      id,
    } =
      req.params;


    const input =
      updateInsightSchema.parse(
        req.body
      );


    if (
      Object.keys(
        input
      ).length === 0
    ) {

      return res
        .status(400)
        .json({

          success:
            false,

          message:
            "No insight changes were provided.",

        });

    }


    /* ========================================================
       FIND EXISTING
    ======================================================== */

    const {
      data:
        existingInsight,

      error:
        existingError,
    } =
      await supabaseAdmin
        .from(
          "insights"
        )
        .select(
          "*"
        )
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
      !existingInsight
    ) {

      return res
        .status(404)
        .json({

          success:
            false,

          message:
            "Insight not found.",

        });

    }


    /* ========================================================
       CHECK UPDATED SLUG
    ======================================================== */

    if (
      input.slug &&
      input.slug !==
        existingInsight.slug
    ) {

      const {
        data:
          conflictingInsight,

        error:
          conflictError,
      } =
        await supabaseAdmin
          .from(
            "insights"
          )
          .select(
            "id"
          )
          .eq(
            "slug",
            input.slug
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
        conflictingInsight
      ) {

        return res
          .status(409)
          .json({

            success:
              false,

            message:
              "Another insight already uses this title.",

          });

      }

    }


    const updates = {

      updated_at:
        new Date()
          .toISOString(),

    };


    if (
      input.title !==
      undefined
    ) {

      updates.title =
        input.title;

    }


    if (
      input.slug !==
      undefined
    ) {

      updates.slug =
        input.slug;

    }


    if (
      input.excerpt !==
      undefined
    ) {

      updates.excerpt =
        input.excerpt ||
        null;

    }


    if (
      input.content !==
      undefined
    ) {

      updates.content =
        input.content;

    }


    if (
      input.category !==
      undefined
    ) {

      updates.category =
        input.category ||
        null;

    }


    if (
      input.author !==
      undefined
    ) {

      updates.author =
        input.author ||
        "Continental Founders";

    }


    if (
      input.status !==
      undefined
    ) {

      updates.status =
        input.status;


      if (
        input.status ===
        "published"
      ) {

        if (
          input.publishedAt
        ) {

          const date =
            new Date(
              input.publishedAt
            );


          if (
            Number.isNaN(
              date.getTime()
            )
          ) {

            return res
              .status(400)
              .json({

                success:
                  false,

                message:
                  "Invalid publication date.",

              });

          }


          updates.published_at =
            date.toISOString();

        } else if (
          !existingInsight
            .published_at
        ) {

          updates.published_at =
            new Date()
              .toISOString();

        }

      } else {

        updates.published_at =
          null;

      }

    } else if (
      input.publishedAt !==
      undefined
    ) {

      if (
        input.publishedAt
      ) {

        const date =
          new Date(
            input.publishedAt
          );


        if (
          Number.isNaN(
            date.getTime()
          )
        ) {

          return res
            .status(400)
            .json({

              success:
                false,

              message:
                "Invalid publication date.",

            });

        }


        updates.published_at =
          date.toISOString();

      } else {

        updates.published_at =
          null;

      }

    }


    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from(
          "insights"
        )
        .update(
          updates
        )
        .eq(
          "id",
          id
        )
        .select(
          "*"
        )
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

        insight:
          normalizeInsight(
            data
          ),

        message:
          "Insight updated successfully.",

      });

  } catch (
    error
  ) {

    if (
      error?.name ===
      "ZodError"
    ) {

      return res
        .status(400)
        .json({

          success:
            false,

          message:
            error.issues?.[0]?.message ||
            "Invalid insight information.",

        });

    }


    console.error(
      "Update insight error:",
      error
    );


    return res
      .status(500)
      .json({

        success:
          false,

        message:
          error?.message ||
          "Failed to update insight.",

      });

  }

}


/* ============================================================
   DELETE INSIGHT
============================================================ */

async function deleteInsight(
  req,
  res
) {

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
          "insights"
        )
        .delete()
        .eq(
          "id",
          id
        )
        .select(
          "id"
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
            "Insight not found.",

        });

    }


    return res
      .status(200)
      .json({

        success:
          true,

        message:
          "Insight deleted successfully.",

      });

  } catch (
    error
  ) {

    console.error(
      "Delete insight error:",
      error
    );


    return res
      .status(500)
      .json({

        success:
          false,

        message:
          "Failed to delete insight.",

      });

  }

}


/* ============================================================
   EXPORTS
============================================================ */

module.exports = {
  getInsights,
  getPublishedInsights,
  getInsightBySlug,
  createInsight,
  updateInsight,
  deleteInsight,
};