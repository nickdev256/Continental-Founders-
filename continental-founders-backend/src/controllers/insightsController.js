const crypto = require("crypto");

const {
  z,
} = require("zod");

const {
  supabaseAdmin,
} = require("../config/supabase");

const {
  notifySubscribers,
} = require("../services/siteNotificationService");


/* ============================================================
   CONFIG
============================================================ */

const INSIGHT_IMAGE_BUCKET =
  "insight-images";


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

    removeImage:
      z
        .string()
        .optional()
        .nullable(),

  });


const updateInsightSchema =
  insightSchema.partial();


/* ============================================================
   IMAGE HELPERS
============================================================ */

function getImageExtension(
  file
) {

  const extensions = {

    "image/jpeg":
      "jpg",

    "image/jpg":
      "jpg",

    "image/png":
      "png",

    "image/webp":
      "webp",

  };


  return (
    extensions[
      file?.mimetype
    ] ||
    "jpg"
  );

}


/* ============================================================
   UPLOAD INSIGHT IMAGE
============================================================ */

async function uploadInsightImage(
  file
) {

  if (
    !file
  ) {
    return null;
  }


  const extension =
    getImageExtension(
      file
    );


  const filePath =
    `insights/${Date.now()}-${crypto.randomUUID()}.${extension}`;


  const {
    error:
      uploadError,
  } =
    await supabaseAdmin
      .storage
      .from(
        INSIGHT_IMAGE_BUCKET
      )
      .upload(
        filePath,
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


  if (
    uploadError
  ) {

    throw uploadError;

  }


  const {
    data:
      publicUrlData,
  } =
    supabaseAdmin
      .storage
      .from(
        INSIGHT_IMAGE_BUCKET
      )
      .getPublicUrl(
        filePath
      );


  return {

    path:
      filePath,

    url:
      publicUrlData
        ?.publicUrl ||
      null,

  };

}


/* ============================================================
   GET STORAGE PATH FROM PUBLIC URL
============================================================ */

function getStoragePathFromUrl(
  imageUrl
) {

  if (
    !imageUrl
  ) {
    return null;
  }


  try {

    const marker =
      `/storage/v1/object/public/${INSIGHT_IMAGE_BUCKET}/`;


    const markerIndex =
      imageUrl.indexOf(
        marker
      );


    if (
      markerIndex === -1
    ) {

      return null;

    }


    const encodedPath =
      imageUrl.substring(
        markerIndex +
        marker.length
      );


    return decodeURIComponent(
      encodedPath
    );

  } catch (
    error
  ) {

    console.warn(
      "Could not parse insight image URL:",
      error?.message ||
      error
    );


    return null;

  }

}


/* ============================================================
   DELETE IMAGE FROM STORAGE
============================================================ */

async function deleteInsightImage(
  imageUrl
) {

  const path =
    getStoragePathFromUrl(
      imageUrl
    );


  if (
    !path
  ) {

    return {

      success:
        false,

      skipped:
        true,

    };

  }


  const {
    error,
  } =
    await supabaseAdmin
      .storage
      .from(
        INSIGHT_IMAGE_BUCKET
      )
      .remove([
        path,
      ]);


  if (
    error
  ) {

    console.warn(
      "Insight image deletion failed:",
      error
    );


    return {

      success:
        false,

      skipped:
        false,

      error,

    };

  }


  return {

    success:
      true,

    skipped:
      false,

  };

}


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


    image_url:
      insight.image_url,

    imageUrl:
      insight.image_url,


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
   SEND INSIGHT PUBLICATION NOTIFICATION
============================================================ */

function sendInsightNotification(
  insight
) {

  if (
    !insight ||
    insight.status !==
      "published"
  ) {

    return;

  }


  notifySubscribers({

    contentType:
      "insight",

    contentId:
      insight.id,

    title:
      insight.title,

    summary:
      insight.excerpt ||
      "",

    path:
      `/insights/${insight.slug}`,

    imageUrl:
      insight.image_url ||
      null,

    notificationType:
      "published",

  })
    .then(
      (
        result
      ) => {

        if (
          result?.skipped
        ) {

          console.log(
            "Insight newsletter notification skipped:",
            result.reason
          );

          return;

        }


        if (
          result?.success
        ) {

          console.log(
            "Insight newsletter notification processed:",
            {
              insightId:
                insight.id,

              sentCount:
                result.sentCount,

              failedCount:
                result.failedCount,
            }
          );

        }

      }
    )
    .catch(
      (
        error
      ) => {

        console.error(
          "Insight newsletter notification error:",
          error
        );

      }
    );

}


/* ============================================================
   GET ALL INSIGHTS
   ADMIN CMS
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
          error?.message ||
          "Failed to load insights.",

      });

  }

}


/* ============================================================
   GET PUBLISHED INSIGHTS
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
          error?.message ||
          "Failed to load published insights.",

      });

  }

}


/* ============================================================
   GET SINGLE PUBLISHED INSIGHT
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
          error?.message ||
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

  let uploadedImage =
    null;


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


    /* ========================================================
       PUBLICATION DATE
    ======================================================== */

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


    /* ========================================================
       UPLOAD FEATURED IMAGE
    ======================================================== */

    if (
      req.file
    ) {

      uploadedImage =
        await uploadInsightImage(
          req.file
        );

    }


    /* ========================================================
       INSERT DATABASE ROW
    ======================================================== */

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

          image_url:
            uploadedImage
              ?.url ||
            null,

          published_at:
            publishedAt,

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

      if (
        uploadedImage
          ?.url
      ) {

        await deleteInsightImage(
          uploadedImage.url
        );

        uploadedImage =
          null;

      }


      throw error;

    }


    /* ========================================================
       SEND EMAIL IF CREATED AS PUBLISHED
    ======================================================== */

    if (
      data.status ===
      "published"
    ) {

      sendInsightNotification(
        data
      );

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
      uploadedImage
        ?.url
    ) {

      await deleteInsightImage(
        uploadedImage.url
      );

    }


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

  let uploadedImage =
    null;


  try {

    const {
      id,
    } =
      req.params;


    const input =
      updateInsightSchema.parse(
        req.body
      );


    const wantsImageRemoval =
      input.removeImage ===
      "true";


    if (
      Object.keys(
        input
      ).length === 0 &&
      !req.file &&
      !wantsImageRemoval
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


    /* ========================================================
       DETECT FIRST-TIME PUBLICATION
    ======================================================== */

    const wasPublished =
      existingInsight.status ===
      "published";


    /* ========================================================
       BUILD UPDATE
    ======================================================== */

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


    /* ========================================================
       STATUS AND PUBLISH DATE
    ======================================================== */

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


    /* ========================================================
       NEW IMAGE
    ======================================================== */

    if (
      req.file
    ) {

      uploadedImage =
        await uploadInsightImage(
          req.file
        );


      updates.image_url =
        uploadedImage.url;

    }


    /* ========================================================
       REMOVE EXISTING IMAGE
    ======================================================== */

    if (
      wantsImageRemoval &&
      !req.file
    ) {

      updates.image_url =
        null;

    }


    /* ========================================================
       UPDATE DATABASE
    ======================================================== */

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
        .select("*")
        .single();


    if (
      error
    ) {

      if (
        uploadedImage
          ?.url
      ) {

        await deleteInsightImage(
          uploadedImage.url
        );

        uploadedImage =
          null;

      }


      throw error;

    }


    /* ========================================================
       DELETE OLD IMAGE AFTER DATABASE SUCCESS
    ======================================================== */

    if (
      existingInsight
        .image_url &&
      (
        req.file ||
        wantsImageRemoval
      )
    ) {

      await deleteInsightImage(
        existingInsight
          .image_url
      );

    }


    /* ========================================================
       SEND EMAIL ONLY WHEN MOVING INTO PUBLISHED
    ======================================================== */

    const isNowPublished =
      data.status ===
      "published";


    if (
      !wasPublished &&
      isNowPublished
    ) {

      sendInsightNotification(
        data
      );

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
      uploadedImage
        ?.url
    ) {

      await deleteInsightImage(
        uploadedImage.url
      );

    }


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


    /* ========================================================
       FIND INSIGHT
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
          "id, title, image_url"
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
       DELETE DATABASE ROW
    ======================================================== */

    const {
      data:
        deletedInsight,

      error:
        deleteError,
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
          "id, title"
        )
        .maybeSingle();


    if (
      deleteError
    ) {

      throw deleteError;

    }


    if (
      !deletedInsight
    ) {

      return res
        .status(500)
        .json({

          success:
            false,

          message:
            "Unable to confirm insight deletion.",

        });

    }


    /* ========================================================
       DELETE IMAGE
    ======================================================== */

    let imageDeleted =
      false;


    if (
      existingInsight
        .image_url
    ) {

      const result =
        await deleteInsightImage(
          existingInsight
            .image_url
        );


      imageDeleted =
        result.success;

    }


    return res
      .status(200)
      .json({

        success:
          true,

        deletedInsight: {

          id:
            deletedInsight.id,

          title:
            deletedInsight.title,

        },

        imageDeleted,

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
          error?.message ||
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