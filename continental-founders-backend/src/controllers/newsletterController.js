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
   HELPERS
============================================================ */

function nowIso() {
  return new Date().toISOString();
}


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

  return String(value).trim();
}


function cleanNullableString(
  value
) {
  const cleaned =
    cleanString(value);

  return cleaned || null;
}


function normalizeEmail(
  value
) {
  return cleanString(value)
    .toLowerCase();
}


function isValidEmail(
  value
) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    value
  );
}


function isValidUrl(
  value
) {
  if (!value) {
    return true;
  }

  try {
    const url =
      new URL(value);

    return [
      "http:",
      "https:",
    ].includes(
      url.protocol
    );
  } catch {
    return false;
  }
}


function normalizeStatus(
  value
) {
  return cleanString(value)
    .toLowerCase();
}


function createToken() {
  return crypto
    .randomBytes(32)
    .toString("hex");
}


function parseDateOrNull(
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

  return date.toISOString();
}


function getCurrentAdminId(
  req
) {
  return (
    req.user?.id ||
    req.admin?.id ||
    req.user?.userId ||
    null
  );
}


function sendServerError(
  res,
  error,
  fallbackMessage
) {
  console.error(
    fallbackMessage,
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
   NORMALIZE SUBSCRIBER
============================================================ */

function normalizeSubscriber(
  subscriber
) {
  if (!subscriber) {
    return null;
  }

  return {
    id:
      subscriber.id,

    email:
      subscriber.email,

    status:
      subscriber.status,

    source:
      subscriber.source,

    unsubscribeToken:
      subscriber.unsubscribe_token ||
      null,

    subscribed_at:
      subscriber.subscribed_at,

    subscribedAt:
      subscriber.subscribed_at,

    unsubscribed_at:
      subscriber.unsubscribed_at,

    unsubscribedAt:
      subscriber.unsubscribed_at,

    created_at:
      subscriber.created_at,

    createdAt:
      subscriber.created_at,

    updated_at:
      subscriber.updated_at,

    updatedAt:
      subscriber.updated_at,
  };
}


/* ============================================================
   NORMALIZE CAMPAIGN
============================================================ */

function normalizeCampaign(
  campaign
) {
  if (!campaign) {
    return null;
  }

  return {
    id:
      campaign.id,

    title:
      campaign.title ||
      "",

    subject:
      campaign.subject ||
      "",

    previewText:
      campaign.preview_text ||
      "",

    featuredImage:
      campaign.featured_image ||
      "",

    content:
      campaign.content ||
      "",

    ctaText:
      campaign.cta_text ||
      "",

    ctaLink:
      campaign.cta_link ||
      "",

    audience:
      campaign.audience ||
      "all",

    status:
      campaign.status ||
      "draft",

    scheduledAt:
      campaign.scheduled_at ||
      null,

    sentAt:
      campaign.sent_at ||
      null,

    recipientCount:
      Number(
        campaign.recipient_count ||
        0
      ),

    deliveredCount:
      Number(
        campaign.delivered_count ||
        0
      ),

    failedCount:
      Number(
        campaign.failed_count ||
        0
      ),

    openedCount:
      Number(
        campaign.opened_count ||
        0
      ),

    clickedCount:
      Number(
        campaign.clicked_count ||
        0
      ),

    createdBy:
      campaign.created_by ||
      null,

    createdAt:
      campaign.created_at,

    updatedAt:
      campaign.updated_at,

    scheduled_at:
      campaign.scheduled_at ||
      null,

    sent_at:
      campaign.sent_at ||
      null,

    recipient_count:
      Number(
        campaign.recipient_count ||
        0
      ),

    delivered_count:
      Number(
        campaign.delivered_count ||
        0
      ),

    failed_count:
      Number(
        campaign.failed_count ||
        0
      ),

    opened_count:
      Number(
        campaign.opened_count ||
        0
      ),

    clicked_count:
      Number(
        campaign.clicked_count ||
        0
      ),

    created_at:
      campaign.created_at,

    updated_at:
      campaign.updated_at,
  };
}


/* ============================================================
   NORMALIZE DELIVERY
============================================================ */

function normalizeDelivery(
  delivery
) {
  if (!delivery) {
    return null;
  }

  return {
    id:
      delivery.id,

    campaignId:
      delivery.campaign_id,

    subscriberId:
      delivery.subscriber_id,

    email:
      delivery.email,

    status:
      delivery.status,

    providerMessageId:
      delivery.provider_message_id ||
      null,

    sentAt:
      delivery.sent_at ||
      null,

    deliveredAt:
      delivery.delivered_at ||
      null,

    openedAt:
      delivery.opened_at ||
      null,

    clickedAt:
      delivery.clicked_at ||
      null,

    failedAt:
      delivery.failed_at ||
      null,

    failureReason:
      delivery.failure_reason ||
      null,

    createdAt:
      delivery.created_at,

    updatedAt:
      delivery.updated_at,
  };
}


/* ============================================================
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
      "Unable to update subscriber."
    );
  }
}


/* ============================================================
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
}


/* ============================================================
   COUNT CAMPAIGN RECIPIENTS
============================================================ */

async function getRecipientCount(
  audience
) {
  /*
    Subscriber segmentation has not yet been added
    to the subscriber table.

    Until tags/segments exist, only the "all" audience
    can be resolved safely.
  */

  if (
    audience !==
    "all"
  ) {
    return {
      count: 0,

      supported:
        false,
    };
  }

  const {
    count,
    error,
  } =
    await supabaseAdmin
      .from(
        SUBSCRIBERS_TABLE
      )
      .select(
        "id",
        {
          count:
            "exact",

          head:
            true,
        }
      )
      .eq(
        "status",
        "subscribed"
      );

  if (
    error
  ) {
    throw error;
  }

  return {
    count:
      count || 0,

    supported:
      true,
  };
}


/* ============================================================
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
}


/* ============================================================
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