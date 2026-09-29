const crypto = require("crypto");

const {
  supabaseAdmin,
} = require("../config/supabase");


/* ============================================================
   CONFIGURATION
============================================================ */

const GALLERY_TABLE =
  "gallery_items";

const GALLERY_BUCKET =
  process.env.GALLERY_IMAGES_BUCKET ||
  "gallery-images";

const MAX_IMAGE_SIZE =
  10 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES =
  new Map([
    [
      "image/jpeg",
      ".jpg",
    ],
    [
      "image/png",
      ".png",
    ],
    [
      "image/webp",
      ".webp",
    ],
  ]);


/* ============================================================
   BASIC HELPERS
============================================================ */

function cleanString(value) {
  if (
    value === undefined ||
    value === null
  ) {
    return "";
  }

  return String(value).trim();
}


function normalizeStatus(value) {
  const status =
    cleanString(value)
      .toLowerCase();

  if (
    status ===
    "published"
  ) {
    return "published";
  }

  return "draft";
}


function normalizeInteger(
  value,
  fallback = 0
) {
  const number =
    Number(value);

  if (
    !Number.isFinite(number)
  ) {
    return fallback;
  }

  return Math.trunc(number);
}


/* ============================================================
   DATE VALIDATION
============================================================ */

function normalizeDate(value) {
  const cleaned =
    cleanString(value);

  if (!cleaned) {
    return null;
  }

  const datePattern =
    /^\d{4}-\d{2}-\d{2}$/;

  if (
    !datePattern.test(
      cleaned
    )
  ) {
    return null;
  }

  const date =
    new Date(
      `${cleaned}T00:00:00Z`
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  return cleaned;
}


/* ============================================================
   ADMIN ID
============================================================ */

function getCurrentAdminId(req) {
  return (
    req?.admin?.id ||
    req?.user?.id ||
    null
  );
}


/* ============================================================
   NORMALIZE GALLERY ITEM
============================================================ */

function normalizeGalleryItem(
  item
) {
  if (!item) {
    return null;
  }

  return {
    id:
      item.id,

    title:
      item.title || "",

    caption:
      item.caption || "",

    category:
      item.category || "",

    imageUrl:
      item.image_url || "",

    image_url:
      item.image_url || "",

    imagePath:
      item.image_path || "",

    image_path:
      item.image_path || "",

    altText:
      item.alt_text || "",

    alt_text:
      item.alt_text || "",

    eventDate:
      item.event_date || null,

    event_date:
      item.event_date || null,

    status:
      item.status || "draft",

    sortOrder:
      normalizeInteger(
        item.sort_order
      ),

    sort_order:
      normalizeInteger(
        item.sort_order
      ),

    viewCount:
      normalizeInteger(
        item.view_count
      ),

    view_count:
      normalizeInteger(
        item.view_count
      ),

    downloadCount:
      normalizeInteger(
        item.download_count
      ),

    download_count:
      normalizeInteger(
        item.download_count
      ),

    createdBy:
      item.created_by || null,

    created_by:
      item.created_by || null,

    createdAt:
      item.created_at || null,

    created_at:
      item.created_at || null,

    updatedAt:
      item.updated_at || null,

    updated_at:
      item.updated_at || null,
  };
}


/* ============================================================
   SERVER ERROR
============================================================ */

function sendServerError(
  res,
  error,
  fallbackMessage =
    "Something went wrong."
) {
  console.error(
    "[GALLERY]",
    error
  );

  return res
    .status(500)
    .json({
      success: false,

      message:
        error?.message ||
        fallbackMessage,
    });
}


/* ============================================================
   IMAGE VALIDATION
============================================================ */

function validateGalleryImage(
  file
) {
  if (!file) {
    return {
      valid: false,

      message:
        "Please select an image.",
    };
  }


  if (
    !Buffer.isBuffer(
      file.buffer
    )
  ) {
    return {
      valid: false,

      message:
        "The uploaded image could not be read.",
    };
  }


  const mimeType =
    cleanString(
      file.mimetype
    ).toLowerCase();


  if (
    !ALLOWED_IMAGE_TYPES.has(
      mimeType
    )
  ) {
    return {
      valid: false,

      message:
        "Only JPG, PNG and WebP images are supported.",
    };
  }


  const fileSize =
    Number(
      file.size ||
      file.buffer.length
    );


  if (
    fileSize >
    MAX_IMAGE_SIZE
  ) {
    return {
      valid: false,

      message:
        "The image is too large. Maximum size is 10 MB.",
    };
  }


  return {
    valid: true,

    mimeType,

    extension:
      ALLOWED_IMAGE_TYPES.get(
        mimeType
      ),

    size:
      fileSize,
  };
}


/* ============================================================
   CREATE STORAGE PATH
============================================================ */

function createStoragePath(
  adminId,
  extension
) {
  const date =
    new Date()
      .toISOString()
      .slice(
        0,
        10
      );

  const random =
    crypto
      .randomBytes(12)
      .toString("hex");

  return [
    "gallery",
    String(
      adminId ||
      "admin"
    ),
    date,
    `${Date.now()}-${random}${extension}`,
  ].join("/");
}


/* ============================================================
   REMOVE STORAGE FILE
============================================================ */

async function removeStorageFile(
  storagePath
) {
  const path =
    cleanString(
      storagePath
    );

  if (!path) {
    return;
  }

  try {
    const {
      error,
    } =
      await supabaseAdmin
        .storage
        .from(
          GALLERY_BUCKET
        )
        .remove([
          path,
        ]);


    if (error) {
      console.error(
        "[GALLERY] Storage cleanup failed:",
        error
      );
    }
  } catch (error) {
    console.error(
      "[GALLERY] Storage cleanup failed:",
      error
    );
  }
}


/* ============================================================
   GET PUBLISHED GALLERY
   PUBLIC

   GET /api/gallery/published
============================================================ */

async function getPublishedGallery(
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
          GALLERY_TABLE
        )
        .select("*")
        .eq(
          "status",
          "published"
        )
        .order(
          "sort_order",
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
      throw error;
    }


    const gallery =
      (data || [])
        .map(
          normalizeGalleryItem
        )
        .filter(Boolean);


    return res
      .status(200)
      .json({
        success: true,

        gallery,

        items:
          gallery,

        count:
          gallery.length,
      });
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Unable to load the gallery."
    );
  }
}


/* ============================================================
   GET ADMIN GALLERY
   PROTECTED

   GET /api/gallery/admin
============================================================ */

async function getAdminGallery(
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
          GALLERY_TABLE
        )
        .select("*")
        .order(
          "sort_order",
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
      throw error;
    }


    const gallery =
      (data || [])
        .map(
          normalizeGalleryItem
        )
        .filter(Boolean);


    return res
      .status(200)
      .json({
        success: true,

        gallery,

        items:
          gallery,

        count:
          gallery.length,
      });
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Unable to load the admin gallery."
    );
  }
}


/* ============================================================
   GET SINGLE GALLERY ITEM
============================================================ */

async function getGalleryItem(
  req,
  res
) {
  try {
    const id =
      cleanString(
        req.params?.id
      );


    if (!id) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "Gallery item ID is required.",
        });
    }


    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from(
          GALLERY_TABLE
        )
        .select("*")
        .eq(
          "id",
          id
        )
        .maybeSingle();


    if (error) {
      throw error;
    }


    if (!data) {
      return res
        .status(404)
        .json({
          success: false,

          message:
            "Gallery item not found.",
        });
    }


    return res
      .status(200)
      .json({
        success: true,

        item:
          normalizeGalleryItem(
            data
          ),
      });
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Unable to load the gallery item."
    );
  }
}


/* ============================================================
   CREATE GALLERY ITEM
   PROTECTED

   POST /api/gallery/admin

   multipart/form-data:
   image
   title
   caption
   category
   eventDate
   altText
   status
============================================================ */

async function createGalleryItem(
  req,
  res
) {
  let uploadedPath =
    null;

  try {
    const adminId =
      getCurrentAdminId(
        req
      );


    if (!adminId) {
      return res
        .status(401)
        .json({
          success: false,

          message:
            "Administrator authentication is required.",
        });
    }


    const file =
      req.file;


    const validation =
      validateGalleryImage(
        file
      );


    if (
      !validation.valid
    ) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            validation.message,
        });
    }


    const title =
      cleanString(
        req.body?.title
      );


    const caption =
      cleanString(
        req.body?.caption
      );


    const category =
      cleanString(
        req.body?.category
      );


    const altText =
      cleanString(
        req.body?.altText ||
        req.body?.alt_text
      );


    const status =
      normalizeStatus(
        req.body?.status
      );


    const eventDateRaw =
      cleanString(
        req.body?.eventDate ||
        req.body?.event_date
      );


    const eventDate =
      normalizeDate(
        eventDateRaw
      );


    if (!title) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "Photo title is required.",
        });
    }


    if (
      title.length >
      160
    ) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "Photo title must be 160 characters or fewer.",
        });
    }


    if (!category) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "Photo category is required.",
        });
    }


    if (
      caption.length >
      1000
    ) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "Caption must be 1000 characters or fewer.",
        });
    }


    if (
      altText.length >
      250
    ) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "Alternative text must be 250 characters or fewer.",
        });
    }


    if (
      eventDateRaw &&
      !eventDate
    ) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "Please provide a valid date.",
        });
    }


    /* ========================================================
       UPLOAD IMAGE
    ======================================================== */

    const storagePath =
      createStoragePath(
        adminId,
        validation.extension
      );


    uploadedPath =
      storagePath;


    const {
      data:
        uploadData,

      error:
        uploadError,
    } =
      await supabaseAdmin
        .storage
        .from(
          GALLERY_BUCKET
        )
        .upload(
          storagePath,
          file.buffer,
          {
            contentType:
              validation.mimeType,

            cacheControl:
              "31536000",

            upsert:
              false,
          }
        );


    if (uploadError) {
      throw uploadError;
    }


    uploadedPath =
      uploadData?.path ||
      storagePath;


    /* ========================================================
       GET PUBLIC URL
    ======================================================== */

    const {
      data:
        publicUrlData,
    } =
      supabaseAdmin
        .storage
        .from(
          GALLERY_BUCKET
        )
        .getPublicUrl(
          uploadedPath
        );


    const imageUrl =
      cleanString(
        publicUrlData?.publicUrl
      );


    if (!imageUrl) {
      await removeStorageFile(
        uploadedPath
      );

      uploadedPath =
        null;


      return res
        .status(500)
        .json({
          success: false,

          message:
            "The image uploaded, but its public URL could not be created.",
        });
    }


    /* ========================================================
       CREATE DATABASE RECORD
    ======================================================== */

    const insertData = {
      title,

      caption,

      category,

      image_url:
        imageUrl,

      image_path:
        uploadedPath,

      alt_text:
        altText,

      event_date:
        eventDate,

      status,

      sort_order:
        0,

      view_count:
        0,

      download_count:
        0,

      created_by:
        adminId,
    };


    const {
      data:
        created,

      error:
        insertError,
    } =
      await supabaseAdmin
        .from(
          GALLERY_TABLE
        )
        .insert(
          insertData
        )
        .select("*")
        .single();


    if (insertError) {
      await removeStorageFile(
        uploadedPath
      );

      uploadedPath =
        null;

      throw insertError;
    }


    uploadedPath =
      null;


    return res
      .status(201)
      .json({
        success: true,

        message:
          "Gallery photo uploaded successfully.",

        item:
          normalizeGalleryItem(
            created
          ),
      });
  } catch (error) {
    /*
     * If an unexpected database error
     * happened after Storage upload,
     * avoid leaving an orphaned image.
     */
    if (uploadedPath) {
      await removeStorageFile(
        uploadedPath
      );
    }


    return sendServerError(
      res,
      error,
      "Unable to upload the gallery photo."
    );
  }
}


/* ============================================================
   UPDATE GALLERY ITEM
   PROTECTED

   PATCH /api/gallery/admin/:id
============================================================ */

async function updateGalleryItem(
  req,
  res
) {
  try {
    const id =
      cleanString(
        req.params?.id
      );


    if (!id) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "Gallery item ID is required.",
        });
    }


    /* ========================================================
       CHECK EXISTING
    ======================================================== */

    const {
      data:
        existing,

      error:
        existingError,
    } =
      await supabaseAdmin
        .from(
          GALLERY_TABLE
        )
        .select("*")
        .eq(
          "id",
          id
        )
        .maybeSingle();


    if (existingError) {
      throw existingError;
    }


    if (!existing) {
      return res
        .status(404)
        .json({
          success: false,

          message:
            "Gallery item not found.",
        });
    }


    /* ========================================================
       NORMALIZE INPUT
    ======================================================== */

    const title =
      req.body?.title !==
      undefined
        ? cleanString(
            req.body.title
          )
        : existing.title;


    const caption =
      req.body?.caption !==
      undefined
        ? cleanString(
            req.body.caption
          )
        : existing.caption;


    const category =
      req.body?.category !==
      undefined
        ? cleanString(
            req.body.category
          )
        : existing.category;


    const altText =
      req.body?.altText !==
        undefined ||
      req.body?.alt_text !==
        undefined
        ? cleanString(
            req.body?.altText ??
            req.body?.alt_text
          )
        : existing.alt_text;


    const status =
      req.body?.status !==
      undefined
        ? normalizeStatus(
            req.body.status
          )
        : existing.status;


    const eventDateProvided =
      req.body?.eventDate !==
        undefined ||
      req.body?.event_date !==
        undefined;


    const rawEventDate =
      eventDateProvided
        ? cleanString(
            req.body?.eventDate ??
            req.body?.event_date
          )
        : "";


    const eventDate =
      eventDateProvided
        ? rawEventDate
          ? normalizeDate(
              rawEventDate
            )
          : null
        : existing.event_date;


    const sortOrder =
      req.body?.sortOrder !==
        undefined ||
      req.body?.sort_order !==
        undefined
        ? normalizeInteger(
            req.body?.sortOrder ??
            req.body?.sort_order,
            existing.sort_order
          )
        : existing.sort_order;


    /* ========================================================
       VALIDATION
    ======================================================== */

    if (!title) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "Photo title is required.",
        });
    }


    if (
      title.length >
      160
    ) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "Photo title must be 160 characters or fewer.",
        });
    }


    if (!category) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "Photo category is required.",
        });
    }


    if (
      caption &&
      caption.length >
      1000
    ) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "Caption must be 1000 characters or fewer.",
        });
    }


    if (
      altText &&
      altText.length >
      250
    ) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "Alternative text must be 250 characters or fewer.",
        });
    }


    if (
      eventDateProvided &&
      rawEventDate &&
      !eventDate
    ) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "Please provide a valid date.",
        });
    }


    /* ========================================================
       UPDATE
    ======================================================== */

    const updateData = {
      title,

      caption,

      category,

      alt_text:
        altText,

      event_date:
        eventDate,

      status,

      sort_order:
        sortOrder,

      updated_at:
        new Date()
          .toISOString(),
    };


    const {
      data:
        updated,

      error:
        updateError,
    } =
      await supabaseAdmin
        .from(
          GALLERY_TABLE
        )
        .update(
          updateData
        )
        .eq(
          "id",
          id
        )
        .select("*")
        .single();


    if (updateError) {
      throw updateError;
    }


    return res
      .status(200)
      .json({
        success: true,

        message:
          "Gallery photo updated successfully.",

        item:
          normalizeGalleryItem(
            updated
          ),
      });
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Unable to update the gallery photo."
    );
  }
}


/* ============================================================
   CHANGE STATUS
   PROTECTED

   PATCH /api/gallery/admin/:id/status
============================================================ */

async function updateGalleryStatus(
  req,
  res
) {
  try {
    const id =
      cleanString(
        req.params?.id
      );


    const requestedStatus =
      cleanString(
        req.body?.status
      ).toLowerCase();


    if (!id) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "Gallery item ID is required.",
        });
    }


    if (
      ![
        "draft",
        "published",
      ].includes(
        requestedStatus
      )
    ) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "Status must be draft or published.",
        });
    }


    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from(
          GALLERY_TABLE
        )
        .update({
          status:
            requestedStatus,

          updated_at:
            new Date()
              .toISOString(),
        })
        .eq(
          "id",
          id
        )
        .select("*")
        .maybeSingle();


    if (error) {
      throw error;
    }


    if (!data) {
      return res
        .status(404)
        .json({
          success: false,

          message:
            "Gallery item not found.",
        });
    }


    return res
      .status(200)
      .json({
        success: true,

        message:
          requestedStatus ===
          "published"
            ? "Gallery photo published."
            : "Gallery photo unpublished.",

        item:
          normalizeGalleryItem(
            data
          ),
      });
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Unable to change the gallery status."
    );
  }
}


/* ============================================================
   DELETE GALLERY ITEM
   PROTECTED

   DELETE /api/gallery/admin/:id
============================================================ */

async function deleteGalleryItem(
  req,
  res
) {
  try {
    const id =
      cleanString(
        req.params?.id
      );


    if (!id) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "Gallery item ID is required.",
        });
    }


    /* ========================================================
       GET RECORD FIRST
    ======================================================== */

    const {
      data:
        existing,

      error:
        existingError,
    } =
      await supabaseAdmin
        .from(
          GALLERY_TABLE
        )
        .select(
          "id, image_path"
        )
        .eq(
          "id",
          id
        )
        .maybeSingle();


    if (existingError) {
      throw existingError;
    }


    if (!existing) {
      return res
        .status(404)
        .json({
          success: false,

          message:
            "Gallery item not found.",
        });
    }


    /* ========================================================
       DELETE DATABASE RECORD
    ======================================================== */

    const {
      error:
        deleteError,
    } =
      await supabaseAdmin
        .from(
          GALLERY_TABLE
        )
        .delete()
        .eq(
          "id",
          id
        );


    if (deleteError) {
      throw deleteError;
    }


    /*
     * Database deletion succeeded.
     * Now remove the actual image.
     */
    if (
      existing.image_path
    ) {
      await removeStorageFile(
        existing.image_path
      );
    }


    return res
      .status(200)
      .json({
        success: true,

        message:
          "Gallery photo deleted successfully.",
      });
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Unable to delete the gallery photo."
    );
  }
}


/* ============================================================
   REGISTER VIEW

   POST /api/gallery/:id/view

   This is public.
============================================================ */

async function registerGalleryView(
  req,
  res
) {
  try {
    const id =
      cleanString(
        req.params?.id
      );


    if (!id) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "Gallery item ID is required.",
        });
    }


    /*
     * Read the current value first.
     *
     * For a modest public gallery this
     * is sufficient. If traffic becomes
     * very large, move this increment
     * into a PostgreSQL RPC for atomic
     * increments.
     */

    const {
      data:
        existing,

      error:
        existingError,
    } =
      await supabaseAdmin
        .from(
          GALLERY_TABLE
        )
        .select(
          "id, status, view_count"
        )
        .eq(
          "id",
          id
        )
        .eq(
          "status",
          "published"
        )
        .maybeSingle();


    if (existingError) {
      throw existingError;
    }


    if (!existing) {
      return res
        .status(404)
        .json({
          success: false,

          message:
            "Gallery photo not found.",
        });
    }


    const newCount =
      normalizeInteger(
        existing.view_count
      ) + 1;


    const {
      error:
        updateError,
    } =
      await supabaseAdmin
        .from(
          GALLERY_TABLE
        )
        .update({
          view_count:
            newCount,
        })
        .eq(
          "id",
          id
        );


    if (updateError) {
      throw updateError;
    }


    return res
      .status(200)
      .json({
        success: true,

        viewCount:
          newCount,

        view_count:
          newCount,
      });
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Unable to register the gallery view."
    );
  }
}


/* ============================================================
   REGISTER DOWNLOAD

   POST /api/gallery/:id/download

   Public.
   Returns the image URL after recording the download.
============================================================ */

async function registerGalleryDownload(
  req,
  res
) {
  try {
    const id =
      cleanString(
        req.params?.id
      );


    if (!id) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "Gallery item ID is required.",
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
          GALLERY_TABLE
        )
        .select(
          "id, status, image_url, download_count"
        )
        .eq(
          "id",
          id
        )
        .eq(
          "status",
          "published"
        )
        .maybeSingle();


    if (existingError) {
      throw existingError;
    }


    if (!existing) {
      return res
        .status(404)
        .json({
          success: false,

          message:
            "Gallery photo not found.",
        });
    }


    const newCount =
      normalizeInteger(
        existing.download_count
      ) + 1;


    const {
      error:
        updateError,
    } =
      await supabaseAdmin
        .from(
          GALLERY_TABLE
        )
        .update({
          download_count:
            newCount,
        })
        .eq(
          "id",
          id
        );


    if (updateError) {
      throw updateError;
    }


    return res
      .status(200)
      .json({
        success: true,

        imageUrl:
          existing.image_url,

        image_url:
          existing.image_url,

        downloadUrl:
          existing.image_url,

        downloadCount:
          newCount,

        download_count:
          newCount,
      });
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Unable to register the gallery download."
    );
  }
}


/* ============================================================
   EXPORTS
============================================================ */

module.exports = {
  getPublishedGallery,

  getAdminGallery,

  getGalleryItem,

  createGalleryItem,

  updateGalleryItem,

  updateGalleryStatus,

  deleteGalleryItem,

  registerGalleryView,

  registerGalleryDownload,
};