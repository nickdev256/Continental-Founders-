const crypto = require("crypto");

const {
  supabaseAdmin,
} = require("../config/supabase");


/* ============================================================
   TABLES
============================================================ */

const SUBSCRIBERS_TABLE =
  "newsletter_subscribers";

const CAMPAIGNS_TABLE =
  "newsletter_campaigns";

const DELIVERIES_TABLE =
  "newsletter_deliveries";


/* ============================================================
   NEWSLETTER IMAGE STORAGE
============================================================ */

const NEWSLETTER_IMAGES_BUCKET =
  process.env.NEWSLETTER_IMAGES_BUCKET ||
  "newsletter-images";

const MAX_NEWSLETTER_IMAGE_SIZE =
  5 * 1024 * 1024;

const NEWSLETTER_IMAGE_TYPES =
  new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
  ]);


/* ============================================================
   HELPERS
============================================================ */

function cleanString(
  value,
  fallback = ""
) {
  if (
    value === null ||
    value === undefined
  ) {
    return fallback;
  }

  return String(value)
    .trim();
}


function normalizeEmail(
  value
) {
  return cleanString(value)
    .toLowerCase();
}


function normalizeStatus(
  value,
  fallback = "subscribed"
) {
  const normalized =
    cleanString(
      value,
      fallback
    )
      .toLowerCase();

  const allowedStatuses =
    new Set([
      "subscribed",
      "unsubscribed",
    ]);

  return allowedStatuses.has(
    normalized
  )
    ? normalized
    : fallback;
}


function normalizeCampaignStatus(
  value,
  fallback = "draft"
) {
  const normalized =
    cleanString(
      value,
      fallback
    )
      .toLowerCase();

  const allowedStatuses =
    new Set([
      "draft",
      "scheduled",
      "sending",
      "sent",
      "cancelled",
      "failed",
    ]);

  return allowedStatuses.has(
    normalized
  )
    ? normalized
    : fallback;
}


function normalizeDeliveryMethod(
  value,
  fallback = "now"
) {
  const normalized =
    cleanString(
      value,
      fallback
    )
      .toLowerCase();

  const allowedMethods =
    new Set([
      "now",
      "schedule",
    ]);

  return allowedMethods.has(
    normalized
  )
    ? normalized
    : fallback;
}


function normalizeAudience(
  value,
  fallback = "all"
) {
  const normalized =
    cleanString(
      value,
      fallback
    )
      .toLowerCase();

  const allowedAudiences =
    new Set([
      "all",
      "active",
      "recent",
      "engaged",
    ]);

  return allowedAudiences.has(
    normalized
  )
    ? normalized
    : fallback;
}


function parseBoolean(
  value,
  fallback = false
) {
  if (
    value === true ||
    value === "true" ||
    value === 1 ||
    value === "1"
  ) {
    return true;
  }

  if (
    value === false ||
    value === "false" ||
    value === 0 ||
    value === "0"
  ) {
    return false;
  }

  return fallback;
}


function parsePositiveInteger(
  value,
  fallback = 0
) {
  const parsed =
    Number.parseInt(
      value,
      10
    );

  if (
    Number.isNaN(parsed) ||
    parsed < 0
  ) {
    return fallback;
  }

  return parsed;
}


function isValidEmail(
  email
) {
  const normalized =
    normalizeEmail(email);

  if (!normalized) {
    return false;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    normalized
  );
}


function isValidHttpUrl(
  value
) {
  const normalized =
    cleanString(value);

  if (!normalized) {
    return true;
  }

  try {
    const url =
      new URL(normalized);

    return (
      url.protocol === "http:" ||
      url.protocol === "https:"
    );
  } catch {
    return false;
  }
}


function createToken(
  bytes = 32
) {
  return crypto
    .randomBytes(bytes)
    .toString("hex");
}


function createUnsubscribeToken() {
  return createToken(32);
}


function createCampaignTrackingToken() {
  return createToken(24);
}


function safeDate(
  value
) {
  if (!value) {
    return null;
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  return date;
}


function toIsoDate(
  value
) {
  const date =
    safeDate(value);

  return date
    ? date.toISOString()
    : null;
}


function nowIso() {
  return new Date()
    .toISOString();
}


function createSlug(
  value
) {
  const normalized =
    cleanString(value)
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
        90
      );

  if (normalized) {
    return normalized;
  }

  return `newsletter-${Date.now()}`;
}


function buildCampaignSlug(
  title
) {
  const base =
    createSlug(title);

  const suffix =
    crypto
      .randomBytes(4)
      .toString("hex");

  return `${base}-${suffix}`;
}


function cleanNullableString(
  value
) {
  const normalized =
    cleanString(value);

  return normalized ||
    null;
}


function cleanLimitedString(
  value,
  maxLength,
  fallback = ""
) {
  const normalized =
    cleanString(
      value,
      fallback
    );

  return normalized.slice(
    0,
    maxLength
  );
}


/* ============================================================
   NEWSLETTER IMAGE HELPERS
============================================================ */

function getNewsletterImageExtension(
  file
) {
  const mimeType =
    cleanString(
      file?.mimetype
    )
      .toLowerCase();

  const extensionByMime = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };

  return (
    extensionByMime[
      mimeType
    ] ||
    null
  );
}


function safeNewsletterStorageName(
  value
) {
  const original =
    cleanString(
      value,
      "newsletter-image"
    );

  const withoutExtension =
    original.replace(
      /\.[^/.]+$/,
      ""
    );

  const cleaned =
    withoutExtension
      .toLowerCase()
      .replace(
        /[^a-z0-9_-]+/g,
        "-"
      )
      .replace(
        /-+/g,
        "-"
      )
      .replace(
        /^[-_]+|[-_]+$/g,
        ""
      )
      .slice(
        0,
        80
      );

  return (
    cleaned ||
    "newsletter-image"
  );
}


function createNewsletterImagePath(
  file
) {
  const extension =
    getNewsletterImageExtension(
      file
    );

  if (!extension) {
    throw new Error(
      "Unsupported newsletter image type."
    );
  }

  const safeName =
    safeNewsletterStorageName(
      file?.originalname
    );

  const randomPart =
    crypto
      .randomBytes(10)
      .toString("hex");

  const timestamp =
    Date.now();

  const year =
    new Date()
      .getUTCFullYear();

  return [
    "campaigns",
    String(year),
    `${timestamp}-${safeName}-${randomPart}.${extension}`,
  ].join("/");
}


/* ============================================================
   UPLOAD NEWSLETTER FEATURED IMAGE
============================================================ */

async function uploadNewsletterImage(
  req,
  res
) {
  let uploadedStoragePath =
    null;

  try {
    const file =
      req.file;

    /*
     * Multer places the uploaded image
     * in req.file when using:
     *
     * upload.single("image")
     */

    if (
      !file ||
      !file.buffer
    ) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "Please choose an image to upload.",
        });
    }


    const mimeType =
      cleanString(
        file.mimetype
      )
        .toLowerCase();


    /*
     * Only formats suitable for the
     * newsletter featured image are
     * accepted.
     */

    if (
      !NEWSLETTER_IMAGE_TYPES.has(
        mimeType
      )
    ) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "Only JPG, PNG and WEBP images are allowed.",
        });
    }


    const fileSize =
      Number(
        file.size ||
        file.buffer.length ||
        0
      );


    if (
      !Number.isFinite(
        fileSize
      ) ||
      fileSize <= 0
    ) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "The selected image is empty or invalid.",
        });
    }


    if (
      fileSize >
      MAX_NEWSLETTER_IMAGE_SIZE
    ) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "The image is too large. Maximum size is 5 MB.",
        });
    }


    const storagePath =
      createNewsletterImagePath(
        file
      );

    uploadedStoragePath =
      storagePath;


    /*
     * Upload the image buffer into the
     * public Supabase Storage bucket.
     */

    const {
      error:
        uploadError,
    } =
      await supabaseAdmin
        .storage
        .from(
          NEWSLETTER_IMAGES_BUCKET
        )
        .upload(
          storagePath,
          file.buffer,
          {
            contentType:
              mimeType,

            cacheControl:
              "31536000",

            upsert:
              false,
          }
        );


    if (uploadError) {
      console.error(
        "Supabase newsletter image upload error:",
        uploadError
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            uploadError.message ||
            "Unable to upload the newsletter image.",
        });
    }


    /*
     * The newsletter-images bucket is
     * public, so obtain its public URL.
     */

    const {
      data:
        publicUrlData,
    } =
      supabaseAdmin
        .storage
        .from(
          NEWSLETTER_IMAGES_BUCKET
        )
        .getPublicUrl(
          storagePath
        );


    const publicUrl =
      cleanString(
        publicUrlData
          ?.publicUrl
      );


    /*
     * If Supabase uploaded the object
     * but no URL was returned, clean up
     * the object instead of leaving an
     * orphaned file in Storage.
     */

    if (!publicUrl) {
      try {
        await supabaseAdmin
          .storage
          .from(
            NEWSLETTER_IMAGES_BUCKET
          )
          .remove([
            storagePath,
          ]);
      } catch (
        cleanupError
      ) {
        console.error(
          "Newsletter image cleanup error:",
          cleanupError
        );
      }

      uploadedStoragePath =
        null;

      return res
        .status(500)
        .json({
          success: false,

          message:
            "The image was uploaded but its public URL could not be created.",
        });
    }


    /*
     * Upload completed successfully.
     *
     * Clear this so the catch block
     * doesn't remove the successful
     * upload.
     */

    uploadedStoragePath =
      null;


    return res
      .status(201)
      .json({
        success: true,

        message:
          "Newsletter image uploaded successfully.",

        /*
         * Keep both properties because
         * the frontend uploader accepts
         * either format.
         */

        url:
          publicUrl,

        publicUrl:
          publicUrl,

        path:
          storagePath,

        image: {
          url:
            publicUrl,

          publicUrl:
            publicUrl,

          path:
            storagePath,

          originalName:
            cleanString(
              file.originalname
            ),

          mimeType:
            mimeType,

          size:
            fileSize,
        },
      });
  } catch (
    error
  ) {
    /*
     * If an unexpected failure happens
     * after an object has been uploaded,
     * try to remove the object.
     */

    if (
      uploadedStoragePath
    ) {
      try {
        await supabaseAdmin
          .storage
          .from(
            NEWSLETTER_IMAGES_BUCKET
          )
          .remove([
            uploadedStoragePath,
          ]);
      } catch (
        cleanupError
      ) {
        console.error(
          "Newsletter image cleanup failed:",
          cleanupError
        );
      }
    }


    console.error(
      "Newsletter image upload failed:",
      error
    );


    return res
      .status(500)
      .json({
        success: false,

        message:
          error?.message ||
          "Unable to upload newsletter image.",
      });
  }
}


/* ============================================================
   NORMALIZE SUBSCRIBER
============================================================ */

function normalizeSubscriber(
  row
) {
  if (!row) {
    return null;
  }

  return {
    id:
      row.id,

    email:
      row.email,

    status:
      row.status,

    source:
      row.source ||
      "website",

    subscribedAt:
      row.subscribed_at ||
      row.created_at ||
      null,

    unsubscribedAt:
      row.unsubscribed_at ||
      null,

    createdAt:
      row.created_at ||
      null,

    updatedAt:
      row.updated_at ||
      null,
  };
}


/* ============================================================
   NORMALIZE CAMPAIGN
============================================================ */

function normalizeCampaign(
  row
) {
  if (!row) {
    return null;
  }

  return {
    id:
      row.id,

    slug:
      row.slug ||
      "",

    title:
      row.title ||
      "",

    subject:
      row.subject ||
      "",

    previewText:
      row.preview_text ||
      "",

    featuredImage:
      row.featured_image ||
      "",

    content:
      row.content ||
      "",

    ctaText:
      row.cta_text ||
      "",

    ctaLink:
      row.cta_link ||
      "",

    audience:
      row.audience ||
      "all",

    deliveryMethod:
      row.delivery_method ||
      "now",

    status:
      row.status ||
      "draft",

    scheduledAt:
      row.scheduled_at ||
      null,

    sentAt:
      row.sent_at ||
      null,

    recipientCount:
      Number(
        row.recipient_count ||
        0
      ),

    deliveredCount:
      Number(
        row.delivered_count ||
        0
      ),

    failedCount:
      Number(
        row.failed_count ||
        0
      ),

    openedCount:
      Number(
        row.opened_count ||
        0
      ),

    clickedCount:
      Number(
        row.clicked_count ||
        0
      ),

    createdBy:
      row.created_by ||
      null,

    createdAt:
      row.created_at ||
      null,

    updatedAt:
      row.updated_at ||
      null,
  };
}


/* ============================================================
   NORMALIZE DELIVERY
============================================================ */

function normalizeDelivery(
  row
) {
  if (!row) {
    return null;
  }

  return {
    id:
      row.id,

    campaignId:
      row.campaign_id,

    subscriberId:
      row.subscriber_id ||
      null,

    email:
      row.email ||
      "",

    status:
      row.status ||
      "pending",

    providerMessageId:
      row.provider_message_id ||
      null,

    errorMessage:
      row.error_message ||
      null,

    sentAt:
      row.sent_at ||
      null,

    deliveredAt:
      row.delivered_at ||
      null,

    openedAt:
      row.opened_at ||
      null,

    clickedAt:
      row.clicked_at ||
      null,

    createdAt:
      row.created_at ||
      null,

    updatedAt:
      row.updated_at ||
      null,
  };
}/* ============================================================
   NORMALIZE CAMPAIGN INPUT
============================================================ */

function normalizeCampaignInput(
  body = {}
) {
  return {
    title:
      cleanString(
        body.title
      ),

    subject:
      cleanString(
        body.subject
      ),

    previewText:
      cleanString(
        body.previewText ??
        body.preview_text
      ),

    featuredImage:
      cleanString(
        body.featuredImage ??
        body.featured_image
      ),

    content:
      cleanString(
        body.content
      ),

    ctaText:
      cleanString(
        body.ctaText ??
        body.cta_text
      ),

    ctaLink:
      cleanString(
        body.ctaLink ??
        body.cta_link
      ),

    audience:
      cleanString(
        body.audience,
        "all"
      ).toLowerCase(),
  };
}


/* ============================================================
   VALIDATE CAMPAIGN
============================================================ */

function validateCampaign(
  input,
  {
    requireContent = false,
  } = {}
) {
  const errors = [];

  if (
    !input.title
  ) {
    errors.push({
      field: "title",

      message:
        "Newsletter title is required.",
    });
  }

  if (
    input.title.length >
    200
  ) {
    errors.push({
      field: "title",

      message:
        "Newsletter title is too long.",
    });
  }

  if (
    input.subject.length >
    250
  ) {
    errors.push({
      field: "subject",

      message:
        "Email subject is too long.",
    });
  }

  if (
    input.previewText.length >
    500
  ) {
    errors.push({
      field: "previewText",

      message:
        "Preview text is too long.",
    });
  }

  if (
    input.featuredImage &&
    !isValidUrl(
      input.featuredImage
    )
  ) {
    errors.push({
      field:
        "featuredImage",

      message:
        "Featured image must be a valid HTTP or HTTPS URL.",
    });
  }

  if (
    input.ctaLink &&
    !isValidUrl(
      input.ctaLink
    )
  ) {
    errors.push({
      field:
        "ctaLink",

      message:
        "CTA link must be a valid HTTP or HTTPS URL.",
    });
  }

  const allowedAudiences = [
    "all",
    "founders",
    "partners",
    "universities",
    "custom",
  ];

  if (
    !allowedAudiences.includes(
      input.audience
    )
  ) {
    errors.push({
      field:
        "audience",

      message:
        "Invalid newsletter audience.",
    });
  }

  if (
    requireContent &&
    !input.subject
  ) {
    errors.push({
      field:
        "subject",

      message:
        "Email subject is required before sending.",
    });
  }

  if (
    requireContent &&
    !input.content
  ) {
    errors.push({
      field:
        "content",

      message:
        "Newsletter content is required before sending.",
    });
  }

  return errors;
}


/* ============================================================
   SUBSCRIBE

   POST /api/newsletter/subscribe
============================================================ */

async function subscribe(
  req,
  res
) {
  try {
    let {
      email,
      source,
    } =
      req.body || {};

    if (!email) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "Email address is required.",
        });
    }

    email =
      normalizeEmail(
        email
      );

    if (
      !isValidEmail(
        email
      )
    ) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "Please enter a valid email address.",
        });
    }

    const safeSource =
      cleanString(
        source,
        "website_footer"
      )
        .toLowerCase()
        .replace(
          /[^a-z0-9_-]/g,
          "_"
        )
        .slice(
          0,
          100
        ) ||
      "website_footer";

    const {
      data:
        existingSubscriber,

      error:
        existingError,
    } =
      await supabaseAdmin
        .from(
          SUBSCRIBERS_TABLE
        )
        .select("*")
        .eq(
          "email",
          email
        )
        .maybeSingle();

    if (
      existingError
    ) {
      throw existingError;
    }

    if (
      existingSubscriber &&
      existingSubscriber.status ===
        "subscribed"
    ) {
      return res
        .status(200)
        .json({
          success: true,

          message:
            "You are already subscribed to Continental Founders updates.",

          subscriber:
            normalizeSubscriber(
              existingSubscriber
            ),
        });
    }

    const now =
      nowIso();

    if (
      existingSubscriber
    ) {
      const updates = {
        status:
          "subscribed",

        source:
          safeSource,

        subscribed_at:
          now,

        unsubscribed_at:
          null,

        updated_at:
          now,
      };

      if (
        !existingSubscriber
          .unsubscribe_token
      ) {
        updates.unsubscribe_token =
          createToken();
      }

      const {
        data,
        error,
      } =
        await supabaseAdmin
          .from(
            SUBSCRIBERS_TABLE
          )
          .update(
            updates
          )
          .eq(
            "id",
            existingSubscriber.id
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
          success: true,

          message:
            "Welcome back. Your subscription has been restored.",

          subscriber:
            normalizeSubscriber(
              data
            ),
        });
    }

    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from(
          SUBSCRIBERS_TABLE
        )
        .insert({
          email,

          status:
            "subscribed",

          source:
            safeSource,

          unsubscribe_token:
            createToken(),

          subscribed_at:
            now,

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
        success: true,

        message:
          "Thank you for subscribing to Continental Founders.",

        subscriber:
          normalizeSubscriber(
            data
          ),
      });
  } catch (
    error
  ) {
    return sendServerError(
      res,
      error,
      "We could not complete your subscription. Please try again."
    );
  }
}


/* ============================================================
   PUBLIC UNSUBSCRIBE

   POST /api/newsletter/unsubscribe
============================================================ */

async function unsubscribe(
  req,
  res
) {
  try {
    const email =
      normalizeEmail(
        req.body?.email
      );

    const token =
      cleanString(
        req.body?.token
      );

    if (
      !email &&
      !token
    ) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "Email address or unsubscribe token is required.",
        });
    }

    let query =
      supabaseAdmin
        .from(
          SUBSCRIBERS_TABLE
        )
        .select("*");

    if (token) {
      query =
        query.eq(
          "unsubscribe_token",
          token
        );
    } else {
      if (
        !isValidEmail(
          email
        )
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "Please enter a valid email address.",
          });
      }

      query =
        query.eq(
          "email",
          email
        );
    }

    const {
      data:
        subscriber,

      error:
        lookupError,
    } =
      await query
        .maybeSingle();

    if (
      lookupError
    ) {
      throw lookupError;
    }

    /*
      Avoid exposing whether an arbitrary email
      exists in the subscriber database.
    */

    if (
      !subscriber
    ) {
      return res
        .status(200)
        .json({
          success: true,

          message:
            "Your unsubscribe request has been processed.",
        });
    }

    if (
      subscriber.status ===
      "unsubscribed"
    ) {
      return res
        .status(200)
        .json({
          success: true,

          message:
            "You are already unsubscribed.",
        });
    }

    const now =
      nowIso();

    const {
      error,
    } =
      await supabaseAdmin
        .from(
          SUBSCRIBERS_TABLE
        )
        .update({
          status:
            "unsubscribed",

          unsubscribed_at:
            now,

          updated_at:
            now,
        })
        .eq(
          "id",
          subscriber.id
        );

    if (
      error
    ) {
      throw error;
    }

    return res
      .status(200)
      .json({
        success: true,

        message:
          "You have been unsubscribed from Continental Founders updates.",
      });
  } catch (
    error
  ) {
    return sendServerError(
      res,
      error,
      "Unable to process your unsubscribe request."
    );
  }
}


/* ============================================================
   GET SUBSCRIBERS

   GET /api/newsletter/subscribers
============================================================ */

async function getSubscribers(
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
          SUBSCRIBERS_TABLE
        )
        .select("*")
        .order(
          "subscribed_at",
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

    const subscribers =
      Array.isArray(
        data
      )
        ? data.map(
            normalizeSubscriber
          )
        : [];

    return res
      .status(200)
      .json({
        success: true,

        count:
          subscribers.length,

        subscribers,
      });
  } catch (
    error
  ) {
    return sendServerError(
      res,
      error,
      "Failed to load newsletter subscribers."
    );
  }
}


/* ============================================================
   UPDATE SUBSCRIBER

   PATCH /api/newsletter/subscribers/:id
============================================================ */

async function updateSubscriber(
  req,
  res
) {
  try {
    const {
      id,
    } =
      req.params;

    const status =
      normalizeStatus(
        req.body?.status
      );

    if (
      ![
        "subscribed",
        "unsubscribed",
      ].includes(
        status
      )
    ) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "Status must be subscribed or unsubscribed.",
        });
    }

    const {
      data:
        existingSubscriber,

      error:
        existingError,
    } =
      await supabaseAdmin
        .from(
          SUBSCRIBERS_TABLE
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
      !existingSubscriber
    ) {
      return res
        .status(404)
        .json({
          success: false,

          message:
            "Subscriber not found.",
        });
    }

    const now =
      nowIso();

    const updates = {
      status,

      updated_at:
        now,
    };

    if (
      status ===
      "subscribed"
    ) {
      updates.subscribed_at =
        now;

      updates.unsubscribed_at =
        null;

      if (
        !existingSubscriber
          .unsubscribe_token
      ) {
        updates.unsubscribe_token =
          createToken();
      }
    }

    if (
      status ===
      "unsubscribed"
    ) {
      updates.unsubscribed_at =
        now;
    }

    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from(
          SUBSCRIBERS_TABLE
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
        success: true,

        message:
          "Subscriber updated successfully.",

        subscriber:
          normalizeSubscriber(
            data
          ),
      });
  } catch (
    error
  ) {
    return sendServerError(
      res,
      error,
      "Failed to update newsletter subscriber."
    );
  }
}/* ============================================================
   DELETE SUBSCRIBER

   DELETE /api/newsletter/subscribers/:id
============================================================ */

async function deleteSubscriber(
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
          SUBSCRIBERS_TABLE
        )
        .delete()
        .eq(
          "id",
          id
        )
        .select(
          "id, email"
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
          success: false,

          message:
            "Subscriber not found.",
        });
    }

    return res
      .status(200)
      .json({
        success: true,

        message:
          "Subscriber deleted successfully.",

        deletedSubscriber: {
          id:
            data.id,

          email:
            data.email,
        },
      });
  } catch (
    error
  ) {
    return sendServerError(
      res,
      error,
      "Unable to delete subscriber."
    );
  }
}


/* ============================================================
   GET CAMPAIGNS

   GET /api/newsletter/campaigns
============================================================ */

async function getCampaigns(
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
          CAMPAIGNS_TABLE
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

    const campaigns =
      Array.isArray(
        data
      )
        ? data.map(
            normalizeCampaign
          )
        : [];

    return res
      .status(200)
      .json({
        success: true,

        count:
          campaigns.length,

        campaigns,
      });
  } catch (
    error
  ) {
    return sendServerError(
      res,
      error,
      "Failed to load newsletter campaigns."
    );
  }
}


/* ============================================================
   GET CAMPAIGN

   GET /api/newsletter/campaigns/:id
============================================================ */

async function getCampaign(
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
          CAMPAIGNS_TABLE
        )
        .select("*")
        .eq(
          "id",
          id
        )
        .maybeSingle();

    if (
      error
    ) {
      throw error;
    }

    if (!data) {
      return res
        .status(404)
        .json({
          success: false,

          message:
            "Newsletter campaign not found.",
        });
    }

    return res
      .status(200)
      .json({
        success: true,

        campaign:
          normalizeCampaign(
            data
          ),
      });
  } catch (
    error
  ) {
    return sendServerError(
      res,
      error,
      "Unable to load newsletter campaign."
    );
  }
}


/* ============================================================
   CREATE CAMPAIGN / SAVE DRAFT

   POST /api/newsletter/campaigns
============================================================ */

async function createCampaign(
  req,
  res
) {
  try {
    const input =
      normalizeCampaignInput(
        req.body
      );

    const errors =
      validateCampaign(
        input
      );

    if (
      errors.length >
      0
    ) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            errors[0].message,

          errors,
        });
    }

    const now =
      nowIso();

    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from(
          CAMPAIGNS_TABLE
        )
        .insert({
          title:
            input.title,

          subject:
            input.subject,

          preview_text:
            input.previewText,

          featured_image:
            cleanNullableString(
              input.featuredImage
            ),

          content:
            input.content,

          cta_text:
            input.ctaText,

          cta_link:
            cleanNullableString(
              input.ctaLink
            ),

          audience:
            input.audience,

          status:
            "draft",

          recipient_count:
            0,

          delivered_count:
            0,

          failed_count:
            0,

          opened_count:
            0,

          clicked_count:
            0,

          created_by:
            getCurrentAdminId(
              req
            ),

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
        success: true,

        message:
          "Newsletter draft created successfully.",

        campaign:
          normalizeCampaign(
            data
          ),
      });
  } catch (
    error
  ) {
    return sendServerError(
      res,
      error,
      "Unable to create newsletter campaign."
    );
  }
}


/* ============================================================
   UPDATE CAMPAIGN

   PATCH /api/newsletter/campaigns/:id
============================================================ */

async function updateCampaign(
  req,
  res
) {
  try {
    const {
      id,
    } =
      req.params;

    const {
      data:
        existingCampaign,

      error:
        existingError,
    } =
      await supabaseAdmin
        .from(
          CAMPAIGNS_TABLE
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
      !existingCampaign
    ) {
      return res
        .status(404)
        .json({
          success: false,

          message:
            "Newsletter campaign not found.",
        });
    }

    if (
      [
        "sending",
        "sent",
      ].includes(
        existingCampaign.status
      )
    ) {
      return res
        .status(409)
        .json({
          success: false,

          message:
            "A sending or sent newsletter cannot be edited.",
        });
    }

    const mergedInput =
      normalizeCampaignInput({
        title:
          req.body?.title ??
          existingCampaign.title,

        subject:
          req.body?.subject ??
          existingCampaign.subject,

        previewText:
          req.body?.previewText ??
          req.body?.preview_text ??
          existingCampaign.preview_text,

        featuredImage:
          req.body?.featuredImage ??
          req.body?.featured_image ??
          existingCampaign.featured_image,

        content:
          req.body?.content ??
          existingCampaign.content,

        ctaText:
          req.body?.ctaText ??
          req.body?.cta_text ??
          existingCampaign.cta_text,

        ctaLink:
          req.body?.ctaLink ??
          req.body?.cta_link ??
          existingCampaign.cta_link,

        audience:
          req.body?.audience ??
          existingCampaign.audience,
      });

    const errors =
      validateCampaign(
        mergedInput
      );

    if (
      errors.length >
      0
    ) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            errors[0].message,

          errors,
        });
    }

    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from(
          CAMPAIGNS_TABLE
        )
        .update({
          title:
            mergedInput.title,

          subject:
            mergedInput.subject,

          preview_text:
            mergedInput.previewText,

          featured_image:
            cleanNullableString(
              mergedInput.featuredImage
            ),

          content:
            mergedInput.content,

          cta_text:
            mergedInput.ctaText,

          cta_link:
            cleanNullableString(
              mergedInput.ctaLink
            ),

          audience:
            mergedInput.audience,

          updated_at:
            nowIso(),
        })
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
        success: true,

        message:
          "Newsletter campaign updated successfully.",

        campaign:
          normalizeCampaign(
            data
          ),
      });
  } catch (
    error
  ) {
    return sendServerError(
      res,
      error,
      "Unable to update newsletter campaign."
    );
  }
}


/* ============================================================
   DELETE CAMPAIGN

   DELETE /api/newsletter/campaigns/:id
============================================================ */

async function deleteCampaign(
  req,
  res
) {
  try {
    const {
      id,
    } =
      req.params;

    const {
      data:
        campaign,

      error:
        lookupError,
    } =
      await supabaseAdmin
        .from(
          CAMPAIGNS_TABLE
        )
        .select(
          "id, title, status"
        )
        .eq(
          "id",
          id
        )
        .maybeSingle();

    if (
      lookupError
    ) {
      throw lookupError;
    }

    if (!campaign) {
      return res
        .status(404)
        .json({
          success: false,

          message:
            "Newsletter campaign not found.",
        });
    }

    if (
      [
        "sending",
        "sent",
      ].includes(
        campaign.status
      )
    ) {
      return res
        .status(409)
        .json({
          success: false,

          message:
            "Sending or sent campaigns cannot be deleted.",
        });
    }

    const {
      error,
    } =
      await supabaseAdmin
        .from(
          CAMPAIGNS_TABLE
        )
        .delete()
        .eq(
          "id",
          id
        );

    if (
      error
    ) {
      throw error;
    }

    return res
      .status(200)
      .json({
        success: true,

        message:
          "Newsletter campaign deleted successfully.",

        deletedCampaign: {
          id:
            campaign.id,

          title:
            campaign.title,
        },
      });
  } catch (
    error
  ) {
    return sendServerError(
      res,
      error,
      "Unable to delete newsletter campaign."
    );
  }
}


/* ============================================================
   DUPLICATE CAMPAIGN

   POST /api/newsletter/campaigns/:id/duplicate
============================================================ */

async function duplicateCampaign(
  req,
  res
) {
  try {
    const {
      id,
    } =
      req.params;

    const {
      data:
        existingCampaign,

      error:
        existingError,
    } =
      await supabaseAdmin
        .from(
          CAMPAIGNS_TABLE
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
      !existingCampaign
    ) {
      return res
        .status(404)
        .json({
          success: false,

          message:
            "Newsletter campaign not found.",
        });
    }

    const now =
      nowIso();

    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from(
          CAMPAIGNS_TABLE
        )
        .insert({
          title:
            `${existingCampaign.title} (Copy)`,

          subject:
            existingCampaign.subject ||
            "",

          preview_text:
            existingCampaign.preview_text ||
            "",

          /*
           * Keep the same public featured-image
           * URL when duplicating the campaign.
           */
          featured_image:
            existingCampaign.featured_image ||
            null,

          content:
            existingCampaign.content ||
            "",

          cta_text:
            existingCampaign.cta_text ||
            "",

          cta_link:
            existingCampaign.cta_link ||
            null,

          audience:
            existingCampaign.audience ||
            "all",

          status:
            "draft",

          recipient_count:
            0,

          delivered_count:
            0,

          failed_count:
            0,

          opened_count:
            0,

          clicked_count:
            0,

          scheduled_at:
            null,

          sent_at:
            null,

          created_by:
            getCurrentAdminId(
              req
            ),

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
        success: true,

        message:
          "Newsletter campaign duplicated successfully.",

        campaign:
          normalizeCampaign(
            data
          ),
      });
  } catch (
    error
  ) {
    return sendServerError(
      res,
      error,
      "Unable to duplicate newsletter campaign."
    );
  }
}/* ============================================================
   GET CAMPAIGN RECIPIENT COUNT

   GET /api/newsletter/campaigns/:id/recipients
============================================================ */

async function getCampaignRecipientCount(
  req,
  res
) {
  try {
    const {
      id,
    } =
      req.params;

    const {
      data:
        campaign,

      error,
    } =
      await supabaseAdmin
        .from(
          CAMPAIGNS_TABLE
        )
        .select(
          "id, audience"
        )
        .eq(
          "id",
          id
        )
        .maybeSingle();

    if (
      error
    ) {
      throw error;
    }

    if (!campaign) {
      return res
        .status(404)
        .json({
          success: false,

          message:
            "Newsletter campaign not found.",
        });
    }

    const result =
      await getRecipientCount(
        campaign.audience ||
        "all"
      );

    return res
      .status(200)
      .json({
        success: true,

        audience:
          campaign.audience,

        recipientCount:
          result.count,

        supported:
          result.supported,

        message:
          result.supported
            ? "Recipient count loaded successfully."
            : "This audience requires subscriber segmentation before recipients can be resolved.",
      });
  } catch (
    error
  ) {
    return sendServerError(
      res,
      error,
      "Unable to calculate newsletter recipients."
    );
  }
}


/* ============================================================
   SCHEDULE CAMPAIGN

   POST /api/newsletter/campaigns/:id/schedule
============================================================ */

async function scheduleCampaign(
  req,
  res
) {
  try {
    const {
      id,
    } =
      req.params;

    const scheduledAt =
      parseDateOrNull(
        req.body?.scheduledAt ??
        req.body?.scheduled_at
      );

    if (
      !scheduledAt
    ) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "A valid schedule date and time is required.",
        });
    }

    if (
      new Date(
        scheduledAt
      ).getTime() <=
      Date.now()
    ) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "The newsletter must be scheduled for a future date and time.",
        });
    }

    const {
      data:
        campaign,

      error:
        lookupError,
    } =
      await supabaseAdmin
        .from(
          CAMPAIGNS_TABLE
        )
        .select("*")
        .eq(
          "id",
          id
        )
        .maybeSingle();

    if (
      lookupError
    ) {
      throw lookupError;
    }

    if (!campaign) {
      return res
        .status(404)
        .json({
          success: false,

          message:
            "Newsletter campaign not found.",
        });
    }

    if (
      [
        "sending",
        "sent",
      ].includes(
        campaign.status
      )
    ) {
      return res
        .status(409)
        .json({
          success: false,

          message:
            "This newsletter can no longer be scheduled.",
        });
    }

    const input =
      normalizeCampaignInput({
        title:
          campaign.title,

        subject:
          campaign.subject,

        previewText:
          campaign.preview_text,

        featuredImage:
          campaign.featured_image,

        content:
          campaign.content,

        ctaText:
          campaign.cta_text,

        ctaLink:
          campaign.cta_link,

        audience:
          campaign.audience,
      });

    const validationErrors =
      validateCampaign(
        input,
        {
          requireContent:
            true,
        }
      );

    if (
      validationErrors.length >
      0
    ) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            validationErrors[0]
              .message,

          errors:
            validationErrors,
        });
    }

    const recipients =
      await getRecipientCount(
        campaign.audience ||
        "all"
      );

    if (
      !recipients.supported
    ) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "This audience cannot be scheduled until subscriber segmentation is configured.",
        });
    }

    if (
      recipients.count ===
      0
    ) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "There are no active subscribers available for this campaign.",
        });
    }

    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from(
          CAMPAIGNS_TABLE
        )
        .update({
          status:
            "scheduled",

          scheduled_at:
            scheduledAt,

          recipient_count:
            recipients.count,

          updated_at:
            nowIso(),
        })
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
        success: true,

        message:
          "Newsletter scheduled successfully.",

        campaign:
          normalizeCampaign(
            data
          ),
      });
  } catch (
    error
  ) {
    return sendServerError(
      res,
      error,
      "Unable to schedule newsletter campaign."
    );
  }
}


/* ============================================================
   CANCEL SCHEDULE

   POST /api/newsletter/campaigns/:id/cancel-schedule
============================================================ */

async function cancelScheduledCampaign(
  req,
  res
) {
  try {
    const {
      id,
    } =
      req.params;

    const {
      data:
        campaign,

      error:
        lookupError,
    } =
      await supabaseAdmin
        .from(
          CAMPAIGNS_TABLE
        )
        .select(
          "id, status"
        )
        .eq(
          "id",
          id
        )
        .maybeSingle();

    if (
      lookupError
    ) {
      throw lookupError;
    }

    if (!campaign) {
      return res
        .status(404)
        .json({
          success: false,

          message:
            "Newsletter campaign not found.",
        });
    }

    if (
      campaign.status !==
      "scheduled"
    ) {
      return res
        .status(409)
        .json({
          success: false,

          message:
            "Only scheduled campaigns can have their schedule cancelled.",
        });
    }

    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from(
          CAMPAIGNS_TABLE
        )
        .update({
          status:
            "draft",

          scheduled_at:
            null,

          updated_at:
            nowIso(),
        })
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
        success: true,

        message:
          "Newsletter schedule cancelled.",

        campaign:
          normalizeCampaign(
            data
          ),
      });
  } catch (
    error
  ) {
    return sendServerError(
      res,
      error,
      "Unable to cancel newsletter schedule."
    );
  }
}/* ============================================================
   SEND TEST

   POST /api/newsletter/campaigns/:id/test
============================================================ */

async function sendTestCampaign(
  req,
  res
) {
  try {
    const {
      id,
    } =
      req.params;

    const email =
      normalizeEmail(
        req.body?.email
      );

    if (
      !isValidEmail(
        email
      )
    ) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "A valid test email address is required.",
        });
    }

    const {
      data:
        campaign,

      error,
    } =
      await supabaseAdmin
        .from(
          CAMPAIGNS_TABLE
        )
        .select("*")
        .eq(
          "id",
          id
        )
        .maybeSingle();

    if (
      error
    ) {
      throw error;
    }

    if (!campaign) {
      return res
        .status(404)
        .json({
          success: false,

          message:
            "Newsletter campaign not found.",
        });
    }

    const input =
      normalizeCampaignInput({
        title:
          campaign.title,

        subject:
          campaign.subject,

        previewText:
          campaign.preview_text,

        featuredImage:
          campaign.featured_image,

        content:
          campaign.content,

        ctaText:
          campaign.cta_text,

        ctaLink:
          campaign.cta_link,

        audience:
          campaign.audience,
      });

    const validationErrors =
      validateCampaign(
        input,
        {
          requireContent:
            true,
        }
      );

    if (
      validationErrors.length >
      0
    ) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            validationErrors[0]
              .message,

          errors:
            validationErrors,
        });
    }

    /*
      Email provider integration intentionally belongs
      in the existing sendEmail utility/service.

      Do not report a successful send until the provider
      has actually accepted the message.
    */

    return res
      .status(501)
      .json({
        success: false,

        code:
          "NEWSLETTER_DELIVERY_NOT_CONFIGURED",

        message:
          "The newsletter campaign is valid, but test email delivery has not been connected to the email service yet.",

        testRecipient:
          email,

        campaign:
          normalizeCampaign(
            campaign
          ),
      });
  } catch (
    error
  ) {
    return sendServerError(
      res,
      error,
      "Unable to prepare newsletter test email."
    );
  }
}


/* ============================================================
   SEND CAMPAIGN

   POST /api/newsletter/campaigns/:id/send
============================================================ */

async function sendCampaign(
  req,
  res
) {
  try {
    const {
      id,
    } =
      req.params;

    const {
      data:
        campaign,

      error:
        lookupError,
    } =
      await supabaseAdmin
        .from(
          CAMPAIGNS_TABLE
        )
        .select("*")
        .eq(
          "id",
          id
        )
        .maybeSingle();

    if (
      lookupError
    ) {
      throw lookupError;
    }

    if (!campaign) {
      return res
        .status(404)
        .json({
          success: false,

          message:
            "Newsletter campaign not found.",
        });
    }

    if (
      campaign.status ===
      "sent"
    ) {
      return res
        .status(409)
        .json({
          success: false,

          message:
            "This newsletter has already been sent.",
        });
    }

    if (
      campaign.status ===
      "sending"
    ) {
      return res
        .status(409)
        .json({
          success: false,

          message:
            "This newsletter is already being sent.",
        });
    }

    const input =
      normalizeCampaignInput({
        title:
          campaign.title,

        subject:
          campaign.subject,

        previewText:
          campaign.preview_text,

        featuredImage:
          campaign.featured_image,

        content:
          campaign.content,

        ctaText:
          campaign.cta_text,

        ctaLink:
          campaign.cta_link,

        audience:
          campaign.audience,
      });

    const validationErrors =
      validateCampaign(
        input,
        {
          requireContent:
            true,
        }
      );

    if (
      validationErrors.length >
      0
    ) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            validationErrors[0]
              .message,

          errors:
            validationErrors,
        });
    }

    const recipients =
      await getRecipientCount(
        campaign.audience ||
        "all"
      );

    if (
      !recipients.supported
    ) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "This audience cannot be sent until subscriber segmentation is configured.",
        });
    }

    if (
      recipients.count ===
      0
    ) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "There are no active subscribers available for this campaign.",
        });
    }

    /*
      IMPORTANT:

      Do not mark the campaign as sent here until
      actual email delivery has been connected.

      Once the existing sendEmail utility/provider is
      integrated, this handler should:

      1. mark campaign as "sending"
      2. load active subscribers
      3. send messages in controlled batches
      4. create newsletter_deliveries records
      5. count successes/failures
      6. mark campaign "sent"
    */

    return res
      .status(501)
      .json({
        success: false,

        code:
          "NEWSLETTER_DELIVERY_NOT_CONFIGURED",

        message:
          "The newsletter is ready to send, but campaign email delivery has not been connected to the email service yet.",

        recipientCount:
          recipients.count,

        campaign:
          normalizeCampaign(
            campaign
          ),
      });
  } catch (
    error
  ) {
    return sendServerError(
      res,
      error,
      "Unable to prepare newsletter campaign for sending."
    );
  }
}


/* ============================================================
   GET CAMPAIGN DELIVERIES

   GET /api/newsletter/campaigns/:id/deliveries
============================================================ */

async function getCampaignDeliveries(
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
          DELIVERIES_TABLE
        )
        .select("*")
        .eq(
          "campaign_id",
          id
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

    const deliveries =
      Array.isArray(
        data
      )
        ? data.map(
            normalizeDelivery
          )
        : [];

    return res
      .status(200)
      .json({
        success: true,

        count:
          deliveries.length,

        deliveries,
      });
  } catch (
    error
  ) {
    return sendServerError(
      res,
      error,
      "Unable to load newsletter deliveries."
    );
  }
}


/* ============================================================
   NEWSLETTER ANALYTICS

   GET /api/newsletter/analytics
============================================================ */

async function getNewsletterAnalytics(
  req,
  res
) {
  try {
    const [
      subscriberResult,
      campaignResult,
    ] =
      await Promise.all([
        supabaseAdmin
          .from(
            SUBSCRIBERS_TABLE
          )
          .select(
            "id, status"
          ),

        supabaseAdmin
          .from(
            CAMPAIGNS_TABLE
          )
          .select(
            `
              id,
              status,
              recipient_count,
              delivered_count,
              failed_count,
              opened_count,
              clicked_count
            `
          ),
      ]);

    if (
      subscriberResult.error
    ) {
      throw subscriberResult.error;
    }

    if (
      campaignResult.error
    ) {
      throw campaignResult.error;
    }

    const subscribers =
      Array.isArray(
        subscriberResult.data
      )
        ? subscriberResult.data
        : [];

    const campaigns =
      Array.isArray(
        campaignResult.data
      )
        ? campaignResult.data
        : [];

    const totalSubscribers =
      subscribers.length;

    const activeSubscribers =
      subscribers.filter(
        (subscriber) =>
          subscriber.status ===
          "subscribed"
      ).length;

    const unsubscribed =
      subscribers.filter(
        (subscriber) =>
          subscriber.status ===
          "unsubscribed"
      ).length;

    const sentCampaigns =
      campaigns.filter(
        (campaign) =>
          campaign.status ===
          "sent"
      ).length;

    const scheduledCampaigns =
      campaigns.filter(
        (campaign) =>
          campaign.status ===
          "scheduled"
      ).length;

    const draftCampaigns =
      campaigns.filter(
        (campaign) =>
          campaign.status ===
          "draft"
      ).length;

    const totals =
      campaigns.reduce(
        (
          result,
          campaign
        ) => {
          result.recipients +=
            Number(
              campaign.recipient_count ||
              0
            );

          result.delivered +=
            Number(
              campaign.delivered_count ||
              0
            );

          result.failed +=
            Number(
              campaign.failed_count ||
              0
            );

          result.opened +=
            Number(
              campaign.opened_count ||
              0
            );

          result.clicked +=
            Number(
              campaign.clicked_count ||
              0
            );

          return result;
        },
        {
          recipients: 0,
          delivered: 0,
          failed: 0,
          opened: 0,
          clicked: 0,
        }
      );

    return res
      .status(200)
      .json({
        success: true,

        analytics: {
          totalSubscribers,

          activeSubscribers,

          unsubscribed,

          totalCampaigns:
            campaigns.length,

          sentCampaigns,

          scheduledCampaigns,

          draftCampaigns,

          recipientCount:
            totals.recipients,

          deliveredCount:
            totals.delivered,

          failedCount:
            totals.failed,

          openedCount:
            totals.opened,

          clickedCount:
            totals.clicked,
        },
      });
  } catch (
    error
  ) {
    return sendServerError(
      res,
      error,
      "Unable to load newsletter analytics."
    );
  }
}


/* ============================================================
   EXPORTS
============================================================ */

module.exports = {
  /* Subscriber */
  subscribe,
  unsubscribe,
  getSubscribers,
  updateSubscriber,
  deleteSubscriber,

  /* Newsletter Image Upload */
  uploadNewsletterImage,

  /* Campaign */
  getCampaigns,
  getCampaign,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  duplicateCampaign,

  /* Audience */
  getCampaignRecipientCount,

  /* Scheduling */
  scheduleCampaign,
  cancelScheduledCampaign,

  /* Delivery */
  sendTestCampaign,
  sendCampaign,
  getCampaignDeliveries,

  /* Analytics */
  getNewsletterAnalytics,
};