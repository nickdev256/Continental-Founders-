const crypto = require("crypto");
const path = require("path");

const {
  supabaseAdmin,
} = require("../config/supabase");

const sendEmail = require("../utils/sendEmail");


/* ============================================================
   NEWSLETTER CONFIGURATION
============================================================ */

const SUBSCRIBERS_TABLE =
  "newsletter_subscribers";

const CAMPAIGNS_TABLE =
  "newsletter_campaigns";

const DELIVERIES_TABLE =
  "newsletter_deliveries";


const NEWSLETTER_IMAGES_BUCKET =
  String(
    process.env.NEWSLETTER_IMAGES_BUCKET ||
      "newsletter-images"
  ).trim();


const MAX_NEWSLETTER_IMAGE_SIZE =
  5 * 1024 * 1024;


const ALLOWED_NEWSLETTER_IMAGE_TYPES =
  new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
  ]);


const ALLOWED_NEWSLETTER_IMAGE_EXTENSIONS =
  new Set([
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
  ]);


/* ============================================================
   NEWSLETTER STATUS
============================================================ */

const CAMPAIGN_STATUS = {
  DRAFT: "draft",
  SCHEDULED: "scheduled",
  SENDING: "sending",
  SENT: "sent",
  FAILED: "failed",
};


/* ============================================================
   FIXED AUDIENCE

   Continental Founders now uses one newsletter audience:
   all active subscribers.
============================================================ */

const DEFAULT_AUDIENCE =
  "all";


/* ============================================================
   DEFAULT CONTENT TYPE

   The existing newsletter_campaigns database table requires
   content_type to contain a non-null value.

   The current Newsletter Studio uses the standard format.
============================================================ */

const DEFAULT_CONTENT_TYPE =
  "standard";


/* ============================================================
   BASIC HELPERS
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
  const email =
    normalizeEmail(value);

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email
  );
}


function isValidUrl(
  value
) {
  const cleaned =
    cleanString(value);

  if (!cleaned) {
    return false;
  }

  try {
    const parsed =
      new URL(cleaned);

    return (
      parsed.protocol === "http:" ||
      parsed.protocol === "https:"
    );
  } catch {
    return false;
  }
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


function sleep(ms) {
  return new Promise(
    (resolve) =>
      setTimeout(resolve, ms)
  );
}


/* ============================================================
   HTML ESCAPING
============================================================ */

function escapeHtml(
  value
) {
  return String(
    value ?? ""
  )
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );
}


/* ============================================================
   ADMIN ID
============================================================ */

function getCurrentAdminId(
  req
) {
  return (
    req?.admin?.id ||
    req?.user?.id ||
    null
  );
}


/* ============================================================
   SERVER ERROR HELPER
============================================================ */

function sendServerError(
  res,
  error,
  fallbackMessage =
    "Something went wrong."
) {
  console.error(
    "[NEWSLETTER]",
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
   NORMALIZE IMAGE ARRAY

   Supports:
   [
     "https://...",
     "https://..."
   ]

   Also tolerates:
   [
     { url: "https://..." }
   ]
============================================================ */

function normalizeImages(
  value
) {
  let source = value;

  if (
    typeof source === "string"
  ) {
    try {
      source =
        JSON.parse(source);
    } catch {
      source = [];
    }
  }

  if (
    !Array.isArray(source)
  ) {
    return [];
  }

  const seen =
    new Set();

  const result = [];

  for (
    const item of source
  ) {
    let url = "";

    if (
      typeof item ===
      "string"
    ) {
      url =
        cleanString(item);
    } else if (
      item &&
      typeof item ===
        "object"
    ) {
      url =
        cleanString(
          item.url ||
            item.publicUrl ||
            item.imageUrl
        );
    }

    if (!url) {
      continue;
    }

    if (
      !isValidUrl(url)
    ) {
      continue;
    }

    if (
      seen.has(url)
    ) {
      continue;
    }

    seen.add(url);

    result.push(url);
  }

  return result;
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
      subscriber.email || "",

    name:
      subscriber.name || "",

    status:
      subscriber.status ||
      "subscribed",

    token:
      subscriber.token || "",

    source:
      subscriber.source || "",

    subscribedAt:
      subscriber.subscribed_at ||
      null,

    unsubscribedAt:
      subscriber.unsubscribed_at ||
      null,

    createdAt:
      subscriber.created_at ||
      null,

    updatedAt:
      subscriber.updated_at ||
      null,
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

  const images =
    normalizeImages(
      campaign.images
    );

  return {
    id:
      campaign.id,

    title:
      campaign.title || "",

    subject:
      campaign.subject || "",

    previewText:
      campaign.preview_text ||
      "",

    featuredImage:
      campaign.featured_image ||
      "",

    images,

    content:
      campaign.content || "",

    /*
     * IMPORTANT:
     * Existing database schema requires content_type.
     */
    contentType:
      campaign.content_type ||
      DEFAULT_CONTENT_TYPE,

    ctaText:
      campaign.cta_text || "",

    ctaLink:
      campaign.cta_link || "",

    audience:
      DEFAULT_AUDIENCE,

    status:
      campaign.status ||
      CAMPAIGN_STATUS.DRAFT,

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

    acceptedCount:
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
      campaign.created_at ||
      null,

    updatedAt:
      campaign.updated_at ||
      null,
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
      delivery.campaign_id ||
      null,

    subscriberId:
      delivery.subscriber_id ||
      null,

    email:
      delivery.email || "",

    status:
      delivery.status || "",

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
      delivery.created_at ||
      null,

    updatedAt:
      delivery.updated_at ||
      null,
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

    images:
      normalizeImages(
        body.images
      ),

    content:
      cleanString(
        body.content
      ),

    /*
     * This fixes the NOT NULL database error.
     */
    contentType:
      cleanString(
        body.contentType ??
          body.content_type,
        DEFAULT_CONTENT_TYPE
      ) ||
      DEFAULT_CONTENT_TYPE,

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

    /*
     * Audience sent by the browser is deliberately ignored.
     */
    audience:
      DEFAULT_AUDIENCE,

    scheduledAt:
      body.scheduledAt ??
      body.scheduled_at ??
      null,
  };
}


/* ============================================================
   VALIDATE CAMPAIGN
============================================================ */

function validateCampaign(
  campaign
) {
  const errors = [];

  if (
    !campaign.title
  ) {
    errors.push(
      "Newsletter title is required."
    );
  }

  if (
    !campaign.subject
  ) {
    errors.push(
      "Email subject is required."
    );
  }

  if (
    !campaign.content
  ) {
    errors.push(
      "Newsletter content is required."
    );
  }

  if (
    !campaign.contentType
  ) {
    errors.push(
      "Newsletter content type is required."
    );
  }

  if (
    campaign.featuredImage &&
    !isValidUrl(
      campaign.featuredImage
    )
  ) {
    errors.push(
      "Featured image must be a valid HTTP or HTTPS URL."
    );
  }

  if (
    !Array.isArray(
      campaign.images
    )
  ) {
    errors.push(
      "Newsletter images must be an array."
    );
  } else {
    for (
      const imageUrl of
      campaign.images
    ) {
      if (
        !isValidUrl(
          imageUrl
        )
      ) {
        errors.push(
          "Every newsletter image must be a valid HTTP or HTTPS URL."
        );

        break;
      }
    }
  }

  if (
    campaign.ctaLink &&
    !isValidUrl(
      campaign.ctaLink
    )
  ) {
    errors.push(
      "Call-to-action link must be a valid HTTP or HTTPS URL."
    );
  }

  return errors;
}


/* ============================================================
   ACTIVE SUBSCRIBER COUNT
============================================================ */

async function getRecipientCount() {
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
          count: "exact",
          head: true,
        }
      )
      .eq(
        "status",
        "subscribed"
      );

  if (error) {
    throw error;
  }

  return {
    count:
      Number(count || 0),

    supported:
      true,

    audience:
      DEFAULT_AUDIENCE,
  };
}


/* ============================================================
   IMAGE FILE HELPERS
============================================================ */

function getNewsletterImageExtension(
  file
) {
  const originalName =
    cleanString(
      file?.originalname
    );

  let extension =
    path
      .extname(
        originalName
      )
      .toLowerCase();

  if (
    ALLOWED_NEWSLETTER_IMAGE_EXTENSIONS.has(
      extension
    )
  ) {
    return extension;
  }

  const mimeType =
    cleanString(
      file?.mimetype
    ).toLowerCase();

  if (
    mimeType ===
    "image/jpeg"
  ) {
    return ".jpg";
  }

  if (
    mimeType ===
    "image/png"
  ) {
    return ".png";
  }

  if (
    mimeType ===
    "image/webp"
  ) {
    return ".webp";
  }

  return "";
}


function validateNewsletterImageFile(
  file
) {
  if (!file) {
    return {
      valid: false,
      message:
        "Please choose an image to upload.",
    };
  }

  if (
    !Buffer.isBuffer(
      file.buffer
    ) ||
    file.buffer.length === 0
  ) {
    return {
      valid: false,
      message:
        "The uploaded image is empty.",
    };
  }

  const mimeType =
    cleanString(
      file.mimetype
    ).toLowerCase();

  if (
    !ALLOWED_NEWSLETTER_IMAGE_TYPES.has(
      mimeType
    )
  ) {
    return {
      valid: false,
      message:
        "Only JPG, PNG and WEBP images are allowed.",
    };
  }

  if (
    file.buffer.length >
    MAX_NEWSLETTER_IMAGE_SIZE
  ) {
    return {
      valid: false,
      message:
        "The image is too large. Maximum size is 5 MB.",
    };
  }

  const extension =
    getNewsletterImageExtension(
      file
    );

  if (!extension) {
    return {
      valid: false,
      message:
        "Unable to determine the image format.",
    };
  }

  return {
    valid: true,
    extension,
    mimeType,
  };
}


/* ============================================================
   PUBLIC API URL
============================================================ */

function getPublicApiUrl() {
  return String(
    process.env.PUBLIC_API_URL ||
      process.env.API_URL ||
      process.env.SERVER_URL ||
      "https://continental-founders-1.onrender.com"
  )
    .trim()
    .replace(
      /\/+$/,
      ""
    );
}


/* ============================================================
   UNSUBSCRIBE URL
============================================================ */

function buildUnsubscribeUrl(
  subscriber
) {
  const baseUrl =
    getPublicApiUrl();

  if (
    subscriber?.token
  ) {
    return (
      `${baseUrl}` +
      `/api/newsletter/unsubscribe?token=` +
      encodeURIComponent(
        subscriber.token
      )
    );
  }

  return (
    `${baseUrl}` +
    `/api/newsletter/unsubscribe?email=` +
    encodeURIComponent(
      subscriber?.email ||
        ""
    )
  );
}


/* ============================================================
   NEWSLETTER IMAGE HTML
============================================================ */

function buildNewsletterImagesHtml(
  campaign
) {
  const images = [];

  if (
    campaign.featured_image
  ) {
    images.push(
      campaign.featured_image
    );
  }

  for (
    const url of
    normalizeImages(
      campaign.images
    )
  ) {
    if (
      !images.includes(url)
    ) {
      images.push(url);
    }
  }

  if (
    images.length === 0
  ) {
    return "";
  }

  return images
    .map(
      (url) => `
        <tr>
          <td
            style="
              padding:0 32px 24px 32px;
            "
          >
            <img
              src="${escapeHtml(url)}"
              alt=""
              style="
                display:block;
                width:100%;
                max-width:636px;
                height:auto;
                border:0;
                border-radius:12px;
              "
            />
          </td>
        </tr>
      `
    )
    .join("");
}


/* ============================================================
   NEWSLETTER EMAIL HTML
============================================================ */

function buildNewsletterHtml(
  campaign,
  subscriber = null
) {
  const title =
    escapeHtml(
      campaign.title ||
        ""
    );

  const previewText =
    escapeHtml(
      campaign.preview_text ||
        ""
    );

  const content =
    escapeHtml(
      campaign.content ||
        ""
    ).replace(
      /\r?\n/g,
      "<br />"
    );

  const ctaText =
    escapeHtml(
      campaign.cta_text ||
        ""
    );

  const ctaLink =
    campaign.cta_link &&
    isValidUrl(
      campaign.cta_link
    )
      ? escapeHtml(
          campaign.cta_link
        )
      : "";

  const unsubscribeUrl =
    subscriber
      ? buildUnsubscribeUrl(
          subscriber
        )
      : "";

  const imageHtml =
    buildNewsletterImagesHtml(
      campaign
    );

  const ctaHtml =
    ctaText &&
    ctaLink
      ? `
        <tr>
          <td
            align="center"
            style="
              padding:8px 32px 32px 32px;
            "
          >
            <a
              href="${ctaLink}"
              style="
                display:inline-block;
                padding:14px 24px;
                border-radius:8px;
                background:#0d2238;
                color:#ffffff;
                font-family:Arial,sans-serif;
                font-size:15px;
                font-weight:700;
                text-decoration:none;
              "
            >
              ${ctaText}
            </a>
          </td>
        </tr>
      `
      : "";

  const unsubscribeHtml =
    unsubscribeUrl
      ? `
        <p
          style="
            margin:12px 0 0 0;
            font-size:12px;
            line-height:18px;
          "
        >
          <a
            href="${escapeHtml(
              unsubscribeUrl
            )}"
            style="
              color:#64748b;
              text-decoration:underline;
            "
          >
            Unsubscribe
          </a>
        </p>
      `
      : "";

  return `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />

    <meta
      name="viewport"
      content="width=device-width, initial-scale=1"
    />

    <title>${title}</title>
  </head>

  <body
    style="
      margin:0;
      padding:0;
      background:#f3f5f7;
    "
  >
    <div
      style="
        display:none;
        max-height:0;
        overflow:hidden;
        opacity:0;
      "
    >
      ${previewText}
    </div>

    <table
      role="presentation"
      width="100%"
      cellspacing="0"
      cellpadding="0"
      border="0"
      style="
        width:100%;
        background:#f3f5f7;
      "
    >
      <tr>
        <td
          align="center"
          style="
            padding:32px 16px;
          "
        >

          <table
            role="presentation"
            width="700"
            cellspacing="0"
            cellpadding="0"
            border="0"
            style="
              width:100%;
              max-width:700px;
              background:#ffffff;
              border-radius:16px;
              overflow:hidden;
              box-shadow:
                0 8px 28px
                rgba(15,23,42,.08);
            "
          >

            <tr>
              <td
                style="
                  padding:30px 32px 18px 32px;
                  font-family:Arial,sans-serif;
                "
              >
                <div
                  style="
                    color:#0d2238;
                    font-size:13px;
                    font-weight:700;
                    letter-spacing:1.4px;
                    text-transform:uppercase;
                  "
                >
                  Continental Founders
                </div>
              </td>
            </tr>

            ${imageHtml}

            <tr>
              <td
                style="
                  padding:8px 32px 18px 32px;
                  font-family:Arial,sans-serif;
                "
              >
                <h1
                  style="
                    margin:0;
                    color:#0f172a;
                    font-size:30px;
                    line-height:38px;
                    font-weight:700;
                  "
                >
                  ${title}
                </h1>
              </td>
            </tr>

            <tr>
              <td
                style="
                  padding:0 32px 28px 32px;
                  color:#334155;
                  font-family:Arial,sans-serif;
                  font-size:16px;
                  line-height:27px;
                "
              >
                ${content}
              </td>
            </tr>

            ${ctaHtml}

            <tr>
              <td
                style="
                  padding:24px 32px 30px 32px;
                  border-top:1px solid #e2e8f0;
                  color:#64748b;
                  font-family:Arial,sans-serif;
                  font-size:12px;
                  line-height:18px;
                "
              >
                Continental Founders<br />

                Building a global ecosystem
                for founders.

                ${unsubscribeHtml}
              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>
  </body>
</html>
  `.trim();
}


/* ============================================================
   NEWSLETTER PLAIN TEXT
============================================================ */

function buildNewsletterText(
  campaign,
  subscriber = null
) {
  const lines = [
    campaign.title || "",
    "",
    campaign.content || "",
  ];

  if (
    campaign.cta_text &&
    campaign.cta_link
  ) {
    lines.push(
      "",
      `${campaign.cta_text}: ${campaign.cta_link}`
    );
  }

  if (subscriber) {
    lines.push(
      "",
      `Unsubscribe: ${buildUnsubscribeUrl(
        subscriber
      )}`
    );
  }

  return lines
    .join("\n")
    .trim();
}


/* ============================================================
   SUBSCRIBE
============================================================ */

async function subscribe(
  req,
  res
) {
  try {
    const email =
      normalizeEmail(
        req.body?.email
      );

    const name =
      cleanString(
        req.body?.name
      );

    if (
      !isValidEmail(email)
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Please enter a valid email address.",
        });
    }

    const {
      data: existing,
      error: existingError,
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

    if (existingError) {
      throw existingError;
    }

    if (existing) {
      const {
        data,
        error,
      } =
        await supabaseAdmin
          .from(
            SUBSCRIBERS_TABLE
          )
          .update({
            name:
              name ||
              existing.name ||
              "",

            status:
              "subscribed",

            unsubscribed_at:
              null,

            subscribed_at:
              existing.subscribed_at ||
              nowIso(),

            token:
              existing.token ||
              createToken(),

            updated_at:
              nowIso(),
          })
          .eq(
            "id",
            existing.id
          )
          .select("*")
          .single();

      if (error) {
        throw error;
      }

      return res
        .status(200)
        .json({
          success: true,

          message:
            "You are subscribed to Continental Founders updates.",

          subscriber:
            normalizeSubscriber(
              data
            ),
        });
    }

    const timestamp =
      nowIso();

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

          name,

          status:
            "subscribed",

          token:
            createToken(),

          source:
            cleanString(
              req.body?.source,
              "website"
            ),

          subscribed_at:
            timestamp,

          unsubscribed_at:
            null,

          created_at:
            timestamp,

          updated_at:
            timestamp,
        })
        .select("*")
        .single();

    if (error) {
      throw error;
    }

    return res
      .status(201)
      .json({
        success: true,

        message:
          "You are subscribed to Continental Founders updates.",

        subscriber:
          normalizeSubscriber(
            data
          ),
      });
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Unable to subscribe right now."
    );
  }
}


/* ============================================================
   UNSUBSCRIBE
============================================================ */

async function unsubscribe(
  req,
  res
) {
  try {
    const email =
      normalizeEmail(
        req.body?.email ||
          req.query?.email
      );

    const token =
      cleanString(
        req.body?.token ||
          req.query?.token
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
            "An email address or unsubscribe token is required.",
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
          "token",
          token
        );
    } else {
      query =
        query.eq(
          "email",
          email
        );
    }

    const {
      data: subscriber,
      error,
    } =
      await query
        .maybeSingle();

    if (error) {
      throw error;
    }

    if (!subscriber) {
      return res
        .status(200)
        .json({
          success: true,

          message:
            "Your unsubscribe request has been processed.",
        });
    }

    const timestamp =
      nowIso();

    const {
      error:
        updateError,
    } =
      await supabaseAdmin
        .from(
          SUBSCRIBERS_TABLE
        )
        .update({
          status:
            "unsubscribed",

          unsubscribed_at:
            timestamp,

          updated_at:
            timestamp,
        })
        .eq(
          "id",
          subscriber.id
        );

    if (updateError) {
      throw updateError;
    }

    return res
      .status(200)
      .json({
        success: true,

        message:
          "You have been unsubscribed from Continental Founders updates.",
      });
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Unable to process the unsubscribe request."
    );
  }
}


/* ============================================================
   GET SUBSCRIBERS
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
          "created_at",
          {
            ascending:
              false,
          }
        );

    if (error) {
      throw error;
    }

    const subscribers =
      (data || []).map(
        normalizeSubscriber
      );

    const activeCount =
      subscribers.filter(
        (subscriber) =>
          subscriber.status ===
          "subscribed"
      ).length;

    return res
      .status(200)
      .json({
        success: true,

        subscribers,

        count:
          subscribers.length,

        activeCount,
      });
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Unable to load newsletter subscribers."
    );
  }
}


/* ============================================================
   UPDATE SUBSCRIBER
============================================================ */

async function updateSubscriber(
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
            "Subscriber ID is required.",
        });
    }

    const updates = {
      updated_at:
        nowIso(),
    };

    if (
      req.body?.name !==
      undefined
    ) {
      updates.name =
        cleanString(
          req.body.name
        );
    }

    if (
      req.body?.email !==
      undefined
    ) {
      const email =
        normalizeEmail(
          req.body.email
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

      updates.email =
        email;
    }

    if (
      req.body?.status !==
      undefined
    ) {
      const status =
        cleanString(
          req.body.status
        ).toLowerCase();

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
              "Subscriber status must be subscribed or unsubscribed.",
          });
      }

      updates.status =
        status;

      if (
        status ===
        "subscribed"
      ) {
        updates.unsubscribed_at =
          null;

        updates.subscribed_at =
          nowIso();
      } else {
        updates.unsubscribed_at =
          nowIso();
      }
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

    if (error) {
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
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Unable to update subscriber."
    );
  }
}


/* ============================================================
   DELETE SUBSCRIBER
============================================================ */

async function deleteSubscriber(
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
            "Subscriber ID is required.",
        });
    }

    const {
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
        );

    if (error) {
      throw error;
    }

    return res
      .status(200)
      .json({
        success: true,

        message:
          "Subscriber deleted successfully.",
      });
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Unable to delete subscriber."
    );
  }
}


/* ============================================================
   UPLOAD NEWSLETTER IMAGE

   One image is uploaded per request. The frontend can call this
   endpoint repeatedly and save the returned URLs in `images`.
============================================================ */

async function uploadNewsletterImage(
  req,
  res
) {
  try {
    const file =
      req.file;

    const validation =
      validateNewsletterImageFile(
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

    const extension =
      validation.extension;

    const storagePath =
      [
        "newsletters",
        String(adminId),
        new Date()
          .toISOString()
          .slice(
            0,
            10
          ),
        `${Date.now()}-${crypto
          .randomBytes(10)
          .toString("hex")}${extension}`,
      ].join("/");

    const {
      data: uploadData,
      error: uploadError,
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
              validation.mimeType,

            cacheControl:
              "3600",

            upsert:
              false,
          }
        );

    if (uploadError) {
      throw uploadError;
    }

    const {
      data: publicUrlData,
    } =
      supabaseAdmin
        .storage
        .from(
          NEWSLETTER_IMAGES_BUCKET
        )
        .getPublicUrl(
          uploadData?.path ||
            storagePath
        );

    const publicUrl =
      cleanString(
        publicUrlData?.publicUrl
      );

    if (
      !publicUrl ||
      !isValidUrl(
        publicUrl
      )
    ) {
      try {
        await supabaseAdmin
          .storage
          .from(
            NEWSLETTER_IMAGES_BUCKET
          )
          .remove([
            uploadData?.path ||
              storagePath,
          ]);
      } catch (
        cleanupError
      ) {
        console.error(
          "[NEWSLETTER] Unable to clean up image after public URL failure:",
          cleanupError
        );
      }

      return res
        .status(500)
        .json({
          success: false,

          message:
            "The image uploaded, but its public URL could not be created.",
        });
    }

    return res
      .status(201)
      .json({
        success: true,

        message:
          "Newsletter image uploaded successfully.",

        url:
          publicUrl,

        publicUrl:
          publicUrl,

        imageUrl:
          publicUrl,

        image: {
          url:
            publicUrl,

          publicUrl:
            publicUrl,

          path:
            uploadData?.path ||
            storagePath,

          bucket:
            NEWSLETTER_IMAGES_BUCKET,

          mimeType:
            validation.mimeType,

          size:
            file.buffer.length,

          originalName:
            cleanString(
              file.originalname
            ),
        },
      });
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Unable to upload newsletter image."
    );
  }
}/* ============================================================
   GET CAMPAIGNS
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
            ascending: false,
          }
        );

    if (error) {
      throw error;
    }

    const campaigns =
      (data || []).map(
        normalizeCampaign
      );

    return res
      .status(200)
      .json({
        success: true,

        campaigns,

        count:
          campaigns.length,
      });
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Unable to load newsletter campaigns."
    );
  }
}


/* ============================================================
   GET SINGLE CAMPAIGN
============================================================ */

async function getCampaign(
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
            "Campaign ID is required.",
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
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Unable to load newsletter campaign."
    );
  }
}


/* ============================================================
   CREATE CAMPAIGN

   Drafts can be created before the newsletter is complete.

   IMPORTANT:
   content_type is explicitly written because the existing
   newsletter_campaigns table requires a non-null value.
============================================================ */

async function createCampaign(
  req,
  res
) {
  try {
    const input =
      normalizeCampaignInput(
        req.body || {}
      );

    if (!input.title) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "Newsletter title is required.",
        });
    }

    if (!input.subject) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "Email subject is required.",
        });
    }

    const adminId =
      getCurrentAdminId(
        req
      );

    const timestamp =
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
            input.featuredImage ||
            null,

          images:
            input.images,

          content:
            input.content,

          /*
           * Required database field.
           */
          content_type:
            input.contentType ||
            DEFAULT_CONTENT_TYPE,

          cta_text:
            input.ctaText,

          cta_link:
            input.ctaLink ||
            null,

          /*
           * Audience is fixed by the server.
           */
          audience:
            DEFAULT_AUDIENCE,

          status:
            CAMPAIGN_STATUS.DRAFT,

          scheduled_at:
            null,

          sent_at:
            null,

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
            adminId,

          created_at:
            timestamp,

          updated_at:
            timestamp,
        })
        .select("*")
        .single();

    if (error) {
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
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Unable to create newsletter campaign."
    );
  }
}


/* ============================================================
   UPDATE CAMPAIGN
============================================================ */

async function updateCampaign(
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
            "Campaign ID is required.",
        });
    }

    const {
      data: existing,
      error: existingError,
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

    if (existingError) {
      throw existingError;
    }

    if (!existing) {
      return res
        .status(404)
        .json({
          success: false,

          message:
            "Newsletter campaign not found.",
        });
    }

    /*
     * A campaign currently being delivered must not be edited.
     */
    if (
      existing.status ===
      CAMPAIGN_STATUS.SENDING
    ) {
      return res
        .status(409)
        .json({
          success: false,

          message:
            "This newsletter is currently being sent and cannot be edited.",
        });
    }

    /*
     * Historical sent newsletters should remain unchanged.
     * Duplicate them if they need to be reused.
     */
    if (
      existing.status ===
      CAMPAIGN_STATUS.SENT
    ) {
      return res
        .status(409)
        .json({
          success: false,

          message:
            "A sent newsletter cannot be edited. Duplicate it to create a new draft.",
        });
    }

    /*
     * Merge the existing campaign with only the fields supplied
     * by the frontend.
     */
    const mergedInput = {
      title:
        req.body?.title !==
        undefined
          ? req.body.title
          : existing.title,

      subject:
        req.body?.subject !==
        undefined
          ? req.body.subject
          : existing.subject,

      previewText:
        req.body?.previewText !==
          undefined ||
        req.body?.preview_text !==
          undefined
          ? (
              req.body
                ?.previewText ??
              req.body
                ?.preview_text
            )
          : existing.preview_text,

      featuredImage:
        req.body?.featuredImage !==
          undefined ||
        req.body?.featured_image !==
          undefined
          ? (
              req.body
                ?.featuredImage ??
              req.body
                ?.featured_image
            )
          : existing.featured_image,

      images:
        req.body?.images !==
        undefined
          ? req.body.images
          : existing.images,

      content:
        req.body?.content !==
        undefined
          ? req.body.content
          : existing.content,

      /*
       * Preserve existing content type unless explicitly changed.
       */
      contentType:
        req.body?.contentType !==
          undefined ||
        req.body?.content_type !==
          undefined
          ? (
              req.body
                ?.contentType ??
              req.body
                ?.content_type
            )
          : (
              existing.content_type ||
              DEFAULT_CONTENT_TYPE
            ),

      ctaText:
        req.body?.ctaText !==
          undefined ||
        req.body?.cta_text !==
          undefined
          ? (
              req.body
                ?.ctaText ??
              req.body
                ?.cta_text
            )
          : existing.cta_text,

      ctaLink:
        req.body?.ctaLink !==
          undefined ||
        req.body?.cta_link !==
          undefined
          ? (
              req.body
                ?.ctaLink ??
              req.body
                ?.cta_link
            )
          : existing.cta_link,

      audience:
        DEFAULT_AUDIENCE,
    };

    const input =
      normalizeCampaignInput(
        mergedInput
      );

    if (!input.title) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "Newsletter title is required.",
        });
    }

    if (!input.subject) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "Email subject is required.",
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
            input.title,

          subject:
            input.subject,

          preview_text:
            input.previewText,

          featured_image:
            input.featuredImage ||
            null,

          images:
            input.images,

          content:
            input.content,

          /*
           * Required database field.
           */
          content_type:
            input.contentType ||
            DEFAULT_CONTENT_TYPE,

          cta_text:
            input.ctaText,

          cta_link:
            input.ctaLink ||
            null,

          audience:
            DEFAULT_AUDIENCE,

          updated_at:
            nowIso(),
        })
        .eq(
          "id",
          id
        )
        .select("*")
        .single();

    if (error) {
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
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Unable to update newsletter campaign."
    );
  }
}


/* ============================================================
   DELETE CAMPAIGN

   Sent campaigns may be removed from the CMS.

   Deleting a sent campaign DOES NOT recall emails that have
   already reached recipients.
============================================================ */

async function deleteCampaign(
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
            "Campaign ID is required.",
        });
    }

    const {
      data: existing,
      error: existingError,
    } =
      await supabaseAdmin
        .from(
          CAMPAIGNS_TABLE
        )
        .select(
          "id,title,status"
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
            "Newsletter campaign not found.",
        });
    }

    if (
      existing.status ===
      CAMPAIGN_STATUS.SENDING
    ) {
      return res
        .status(409)
        .json({
          success: false,

          message:
            "A newsletter that is currently being sent cannot be deleted.",
        });
    }

    /*
     * Remove delivery records first.
     */
    const {
      error:
        deliveryDeleteError,
    } =
      await supabaseAdmin
        .from(
          DELIVERIES_TABLE
        )
        .delete()
        .eq(
          "campaign_id",
          id
        );

    if (
      deliveryDeleteError
    ) {
      throw deliveryDeleteError;
    }

    const {
      error:
        campaignDeleteError,
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
      campaignDeleteError
    ) {
      throw campaignDeleteError;
    }

    return res
      .status(200)
      .json({
        success: true,

        message:
          existing.status ===
          CAMPAIGN_STATUS.SENT
            ? "Sent newsletter record deleted successfully. Emails already sent to subscribers are unaffected."
            : "Newsletter campaign deleted successfully.",
      });
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Unable to delete newsletter campaign."
    );
  }
}


/* ============================================================
   DUPLICATE CAMPAIGN
============================================================ */

async function duplicateCampaign(
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
            "Campaign ID is required.",
        });
    }

    const {
      data: existing,
      error: existingError,
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

    if (existingError) {
      throw existingError;
    }

    if (!existing) {
      return res
        .status(404)
        .json({
          success: false,

          message:
            "Newsletter campaign not found.",
        });
    }

    const timestamp =
      nowIso();

    const adminId =
      getCurrentAdminId(
        req
      );

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
            `${cleanString(
              existing.title,
              "Newsletter"
            )} Copy`,

          subject:
            existing.subject ||
            "",

          preview_text:
            existing.preview_text ||
            "",

          featured_image:
            existing.featured_image ||
            null,

          images:
            normalizeImages(
              existing.images
            ),

          content:
            existing.content ||
            "",

          /*
           * Preserve the required content type.
           */
          content_type:
            existing.content_type ||
            DEFAULT_CONTENT_TYPE,

          cta_text:
            existing.cta_text ||
            "",

          cta_link:
            existing.cta_link ||
            null,

          audience:
            DEFAULT_AUDIENCE,

          status:
            CAMPAIGN_STATUS.DRAFT,

          scheduled_at:
            null,

          sent_at:
            null,

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
            adminId,

          created_at:
            timestamp,

          updated_at:
            timestamp,
        })
        .select("*")
        .single();

    if (error) {
      throw error;
    }

    return res
      .status(201)
      .json({
        success: true,

        message:
          "Newsletter duplicated successfully.",

        campaign:
          normalizeCampaign(
            data
          ),
      });
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Unable to duplicate newsletter campaign."
    );
  }
}


/* ============================================================
   GET CAMPAIGN RECIPIENT COUNT
============================================================ */

async function getCampaignRecipientCount(
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
            "Campaign ID is required.",
        });
    }

    const {
      data: campaign,
      error:
        campaignError,
    } =
      await supabaseAdmin
        .from(
          CAMPAIGNS_TABLE
        )
        .select(
          "id,status"
        )
        .eq(
          "id",
          id
        )
        .maybeSingle();

    if (
      campaignError
    ) {
      throw campaignError;
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
      await getRecipientCount();

    return res
      .status(200)
      .json({
        success: true,

        campaignId:
          id,

        audience:
          DEFAULT_AUDIENCE,

        audienceLabel:
          "All Active Subscribers",

        recipientCount:
          result.count,

        count:
          result.count,

        supported:
          true,
      });
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Unable to calculate newsletter recipients."
    );
  }
}


/* ============================================================
   SCHEDULE CAMPAIGN
============================================================ */

async function scheduleCampaign(
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
            "Campaign ID is required.",
        });
    }

    const scheduledAt =
      parseDateOrNull(
        req.body
          ?.scheduledAt ??
          req.body
            ?.scheduled_at
      );

    if (!scheduledAt) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "Please provide a valid schedule date and time.",
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
            "The scheduled send time must be in the future.",
        });
    }

    const {
      data: existing,
      error: existingError,
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

    if (existingError) {
      throw existingError;
    }

    if (!existing) {
      return res
        .status(404)
        .json({
          success: false,

          message:
            "Newsletter campaign not found.",
        });
    }

    if (
      existing.status ===
        CAMPAIGN_STATUS.SENDING ||
      existing.status ===
        CAMPAIGN_STATUS.SENT
    ) {
      return res
        .status(409)
        .json({
          success: false,

          message:
            existing.status ===
            CAMPAIGN_STATUS.SENT
              ? "A sent newsletter cannot be scheduled again. Duplicate it first."
              : "This newsletter is currently being sent.",
        });
    }

    /*
     * Normalize the complete existing record before validation.
     */
    const normalized =
      normalizeCampaignInput({
        title:
          existing.title,

        subject:
          existing.subject,

        previewText:
          existing.preview_text,

        featuredImage:
          existing.featured_image,

        images:
          existing.images,

        content:
          existing.content,

        contentType:
          existing.content_type ||
          DEFAULT_CONTENT_TYPE,

        ctaText:
          existing.cta_text,

        ctaLink:
          existing.cta_link,

        audience:
          DEFAULT_AUDIENCE,

        scheduledAt,
      });

    const validationErrors =
      validateCampaign(
        normalized
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
            validationErrors[0],

          errors:
            validationErrors,
        });
    }

    const {
      count:
        recipientCount,
    } =
      await getRecipientCount();

    if (
      recipientCount <= 0
    ) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "There are no active newsletter subscribers to receive this campaign.",
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
            CAMPAIGN_STATUS.SCHEDULED,

          audience:
            DEFAULT_AUDIENCE,

          /*
           * Ensure legacy rows also receive the required value.
           */
          content_type:
            existing.content_type ||
            DEFAULT_CONTENT_TYPE,

          scheduled_at:
            scheduledAt,

          recipient_count:
            recipientCount,

          updated_at:
            nowIso(),
        })
        .eq(
          "id",
          id
        )
        .select("*")
        .single();

    if (error) {
      throw error;
    }

    return res
      .status(200)
      .json({
        success: true,

        message:
          "Newsletter scheduled successfully.",

        recipientCount,

        audience:
          DEFAULT_AUDIENCE,

        campaign:
          normalizeCampaign(
            data
          ),
      });
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Unable to schedule newsletter campaign."
    );
  }
}


/* ============================================================
   CANCEL SCHEDULED CAMPAIGN
============================================================ */

async function cancelScheduledCampaign(
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
            "Campaign ID is required.",
        });
    }

    const {
      data: existing,
      error: existingError,
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

    if (existingError) {
      throw existingError;
    }

    if (!existing) {
      return res
        .status(404)
        .json({
          success: false,

          message:
            "Newsletter campaign not found.",
        });
    }

    if (
      existing.status !==
      CAMPAIGN_STATUS.SCHEDULED
    ) {
      return res
        .status(409)
        .json({
          success: false,

          message:
            "Only a scheduled newsletter can have its schedule cancelled.",
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
            CAMPAIGN_STATUS.DRAFT,

          scheduled_at:
            null,

          recipient_count:
            0,

          updated_at:
            nowIso(),
        })
        .eq(
          "id",
          id
        )
        .select("*")
        .single();

    if (error) {
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
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Unable to cancel newsletter schedule."
    );
  }
}


/* ============================================================
   GET CAMPAIGN DELIVERIES
============================================================ */

async function getCampaignDeliveries(
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
            "Campaign ID is required.",
        });
    }

    const {
      data: campaign,
      error:
        campaignError,
    } =
      await supabaseAdmin
        .from(
          CAMPAIGNS_TABLE
        )
        .select(
          "id,title,subject,status"
        )
        .eq(
          "id",
          id
        )
        .maybeSingle();

    if (
      campaignError
    ) {
      throw campaignError;
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
            ascending: false,
          }
        );

    if (error) {
      throw error;
    }

    const deliveries =
      (data || []).map(
        normalizeDelivery
      );

    const acceptedCount =
      deliveries.filter(
        (delivery) =>
          [
            "sent",
            "accepted",
            "delivered",
          ].includes(
            cleanString(
              delivery.status
            ).toLowerCase()
          )
      ).length;

    const failedCount =
      deliveries.filter(
        (delivery) =>
          cleanString(
            delivery.status
          ).toLowerCase() ===
          "failed"
      ).length;

    return res
      .status(200)
      .json({
        success: true,

        campaign: {
          id:
            campaign.id,

          title:
            campaign.title ||
            "",

          subject:
            campaign.subject ||
            "",

          status:
            campaign.status ||
            CAMPAIGN_STATUS.DRAFT,
        },

        deliveries,

        count:
          deliveries.length,

        acceptedCount,

        failedCount,
      });
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Unable to load newsletter deliveries."
    );
  }
}/* ============================================================
   LOAD CAMPAIGN FOR DELIVERY
============================================================ */

async function loadCampaignForDelivery(
  campaignId
) {
  const id =
    cleanString(
      campaignId
    );

  if (!id) {
    return null;
  }

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

  if (error) {
    throw error;
  }

  return data || null;
}


/* ============================================================
   VALIDATE CAMPAIGN FOR DELIVERY
============================================================ */

function validateCampaignForDelivery(
  campaign
) {
  if (!campaign) {
    return [
      "Newsletter campaign not found.",
    ];
  }

  const normalized =
    normalizeCampaignInput({
      title:
        campaign.title,

      subject:
        campaign.subject,

      previewText:
        campaign.preview_text,

      featuredImage:
        campaign.featured_image,

      images:
        campaign.images,

      content:
        campaign.content,

      /*
       * Required by the current database schema.
       */
      contentType:
        campaign.content_type ||
        DEFAULT_CONTENT_TYPE,

      ctaText:
        campaign.cta_text,

      ctaLink:
        campaign.cta_link,

      audience:
        DEFAULT_AUDIENCE,
    });

  return validateCampaign(
    normalized
  );
}


/* ============================================================
   SEND TEST CAMPAIGN

   Sends the newsletter to one email address only.

   It does NOT:
   - mark the campaign as sent
   - change recipient counts
   - send to subscribers
============================================================ */

async function sendTestCampaign(
  req,
  res
) {
  try {
    const campaignId =
      cleanString(
        req.params?.id
      );

    if (!campaignId) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "Campaign ID is required.",
        });
    }

    /*
     * Support both email and testEmail from the frontend.
     */
    const email =
      normalizeEmail(
        req.body?.email ||
          req.body?.testEmail
      );

    if (
      !isValidEmail(email)
    ) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "Please provide a valid test email address.",
        });
    }

    const campaign =
      await loadCampaignForDelivery(
        campaignId
      );

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
      CAMPAIGN_STATUS.SENDING
    ) {
      return res
        .status(409)
        .json({
          success: false,

          message:
            "This newsletter is currently being sent.",
        });
    }

    const validationErrors =
      validateCampaignForDelivery(
        campaign
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
            validationErrors[0],

          errors:
            validationErrors,
        });
    }

    const html =
      buildNewsletterHtml(
        campaign,
        null
      );

    const text =
      buildNewsletterText(
        campaign,
        null
      );

    const result =
      await sendEmail({
        to:
          email,

        subject:
          campaign.subject,

        html,

        text,
      });

    /*
     * Support sendEmail utilities that explicitly return
     * { success: false } instead of throwing.
     */
    if (
      result &&
      result.success === false
    ) {
      return res
        .status(502)
        .json({
          success: false,

          message:
            result.message ||
            result.error ||
            "The email provider did not accept the test email.",
        });
    }

    const providerMessageId =
      result?.messageId ||
      result?.id ||
      result?.data?.id ||
      null;

    return res
      .status(200)
      .json({
        success: true,

        message:
          `Test newsletter sent to ${email}.`,

        email,

        providerMessageId,
      });
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Unable to send the test newsletter."
    );
  }
}


/* ============================================================
   GET ACTIVE SUBSCRIBERS FOR DELIVERY

   Fixed audience:
   ALL ACTIVE SUBSCRIBERS
============================================================ */

async function getActiveSubscribersForDelivery() {
  const {
    data,
    error,
  } =
    await supabaseAdmin
      .from(
        SUBSCRIBERS_TABLE
      )
      .select("*")
      .eq(
        "status",
        "subscribed"
      )
      .order(
        "created_at",
        {
          ascending: true,
        }
      );

  if (error) {
    throw error;
  }

  return (
    data || []
  ).filter(
    (subscriber) =>
      isValidEmail(
        subscriber.email
      )
  );
}


/* ============================================================
   CREATE DELIVERY RECORD
============================================================ */

async function createDeliveryRecord({
  campaignId,
  subscriberId,
  email,
  status,
  providerMessageId = null,
  failureReason = null,
  sentAt = null,
  failedAt = null,
}) {
  const timestamp =
    nowIso();

  const payload = {
    campaign_id:
      campaignId,

    subscriber_id:
      subscriberId ||
      null,

    email:
      normalizeEmail(
        email
      ),

    status,

    provider_message_id:
      providerMessageId ||
      null,

    failure_reason:
      failureReason ||
      null,

    sent_at:
      sentAt ||
      null,

    /*
     * Provider acceptance is not the same as confirmed delivery.
     * Leave delivered_at empty until webhook support is added.
     */
    delivered_at:
      null,

    opened_at:
      null,

    clicked_at:
      null,

    failed_at:
      failedAt ||
      null,

    created_at:
      timestamp,

    updated_at:
      timestamp,
  };

  const {
    data,
    error,
  } =
    await supabaseAdmin
      .from(
        DELIVERIES_TABLE
      )
      .insert(
        payload
      )
      .select("*")
      .single();

  if (error) {
    throw error;
  }

  return data;
}


/* ============================================================
   SAFE DELIVERY RECORD

   A tracking-row failure should be logged separately from the
   provider send result.
============================================================ */

async function safelyCreateDeliveryRecord(
  payload
) {
  try {
    return await createDeliveryRecord(
      payload
    );
  } catch (error) {
    console.error(
      "[NEWSLETTER] Unable to create delivery record:",
      error
    );

    return null;
  }
}


/* ============================================================
   UPDATE CAMPAIGN DELIVERY PROGRESS
============================================================ */

async function updateCampaignDeliveryProgress(
  campaignId,
  {
    status,
    recipientCount,
    acceptedCount,
    failedCount,
    sentAt,
  }
) {
  const updates = {
    audience:
      DEFAULT_AUDIENCE,

    content_type:
      DEFAULT_CONTENT_TYPE,

    recipient_count:
      Number(
        recipientCount ||
          0
      ),

    /*
     * Existing schema uses delivered_count.
     *
     * Until provider webhooks are implemented, this field is
     * being used as the provider-accepted count for backwards
     * compatibility with the existing database.
     */
    delivered_count:
      Number(
        acceptedCount ||
          0
      ),

    failed_count:
      Number(
        failedCount ||
          0
      ),

    updated_at:
      nowIso(),
  };

  if (status) {
    updates.status =
      status;
  }

  if (
    sentAt !==
    undefined
  ) {
    updates.sent_at =
      sentAt;
  }

  const {
    data,
    error,
  } =
    await supabaseAdmin
      .from(
        CAMPAIGNS_TABLE
      )
      .update(
        updates
      )
      .eq(
        "id",
        campaignId
      )
      .select("*")
      .single();

  if (error) {
    throw error;
  }

  return data;
}


/* ============================================================
   SEND CAMPAIGN TO ALL ACTIVE SUBSCRIBERS
============================================================ */

async function sendCampaign(
  req,
  res
) {
  let campaignId = "";

  try {
    campaignId =
      cleanString(
        req.params?.id
      );

    if (!campaignId) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "Campaign ID is required.",
        });
    }

    const campaign =
      await loadCampaignForDelivery(
        campaignId
      );

    if (!campaign) {
      return res
        .status(404)
        .json({
          success: false,

          message:
            "Newsletter campaign not found.",
        });
    }

    /*
     * Prevent duplicate sends.
     */
    if (
      campaign.status ===
      CAMPAIGN_STATUS.SENT
    ) {
      return res
        .status(409)
        .json({
          success: false,

          message:
            "This newsletter has already been sent. Duplicate it if you want to send it again.",
        });
    }

    if (
      campaign.status ===
      CAMPAIGN_STATUS.SENDING
    ) {
      return res
        .status(409)
        .json({
          success: false,

          message:
            "This newsletter is already being sent.",
        });
    }

    const validationErrors =
      validateCampaignForDelivery(
        campaign
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
            validationErrors[0],

          errors:
            validationErrors,
        });
    }

    const subscribers =
      await getActiveSubscribersForDelivery();

    const recipientCount =
      subscribers.length;

    if (
      recipientCount === 0
    ) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "There are no active newsletter subscribers to receive this campaign.",
        });
    }

    /*
     * Mark the campaign as sending before processing recipients.
     */
    await updateCampaignDeliveryProgress(
      campaignId,
      {
        status:
          CAMPAIGN_STATUS.SENDING,

        recipientCount,

        acceptedCount:
          0,

        failedCount:
          0,

        sentAt:
          null,
      }
    );

    let acceptedCount = 0;
    let failedCount = 0;

    const results = [];

    /*
     * Send sequentially.
     *
     * This is intentionally conservative for the current small
     * mailing list and helps avoid provider rate-limit bursts.
     */
    for (
      let index = 0;
      index <
      subscribers.length;
      index += 1
    ) {
      const subscriber =
        subscribers[index];

      const email =
        normalizeEmail(
          subscriber.email
        );

      try {
        const html =
          buildNewsletterHtml(
            campaign,
            subscriber
          );

        const text =
          buildNewsletterText(
            campaign,
            subscriber
          );

        const result =
          await sendEmail({
            to:
              email,

            subject:
              campaign.subject,

            html,

            text,
          });

        if (
          result &&
          result.success === false
        ) {
          throw new Error(
            result.message ||
              result.error ||
              "The email provider rejected the message."
          );
        }

        const providerMessageId =
          result?.messageId ||
          result?.id ||
          result?.data?.id ||
          null;

        acceptedCount += 1;

        const sentAt =
          nowIso();

        await safelyCreateDeliveryRecord({
          campaignId,

          subscriberId:
            subscriber.id,

          email,

          /*
           * "sent" means the provider accepted our send request.
           * It does not prove inbox delivery.
           */
          status:
            "sent",

          providerMessageId,

          sentAt,

          failedAt:
            null,

          failureReason:
            null,
        });

        results.push({
          subscriberId:
            subscriber.id,

          email,

          status:
            "sent",

          providerMessageId,
        });
      } catch (
        recipientError
      ) {
        failedCount += 1;

        const failureReason =
          cleanString(
            recipientError?.message,
            "Unable to send newsletter."
          );

        await safelyCreateDeliveryRecord({
          campaignId,

          subscriberId:
            subscriber.id,

          email,

          status:
            "failed",

          providerMessageId:
            null,

          sentAt:
            null,

          failedAt:
            nowIso(),

          failureReason,
        });

        results.push({
          subscriberId:
            subscriber.id,

          email,

          status:
            "failed",

          error:
            failureReason,
        });

        console.error(
          `[NEWSLETTER] Failed to send campaign ${campaignId} to ${email}:`,
          recipientError
        );
      }

      /*
       * Update progress after each recipient.
       */
      try {
        await updateCampaignDeliveryProgress(
          campaignId,
          {
            status:
              CAMPAIGN_STATUS.SENDING,

            recipientCount,

            acceptedCount,

            failedCount,

            sentAt:
              null,
          }
        );
      } catch (
        progressError
      ) {
        console.error(
          "[NEWSLETTER] Unable to update campaign send progress:",
          progressError
        );
      }

      /*
       * Avoid unnecessary delay after the final recipient.
       */
      if (
        index <
        subscribers.length -
          1
      ) {
        await sleep(550);
      }
    }

    /*
     * If at least one email was accepted by the provider,
     * consider the campaign send operation completed.
     *
     * If every send failed, mark the campaign failed.
     */
    const finalStatus =
      acceptedCount > 0
        ? CAMPAIGN_STATUS.SENT
        : CAMPAIGN_STATUS.FAILED;

    const sentAt =
      acceptedCount > 0
        ? nowIso()
        : null;

    const finalCampaign =
      await updateCampaignDeliveryProgress(
        campaignId,
        {
          status:
            finalStatus,

          recipientCount,

          acceptedCount,

          failedCount,

          sentAt,
        }
      );

    return res
      .status(200)
      .json({
        success:
          acceptedCount > 0,

        message:
          acceptedCount > 0
            ? failedCount > 0
              ? `Newsletter send completed. ${acceptedCount} accepted and ${failedCount} failed.`
              : `Newsletter accepted for all ${acceptedCount} active subscribers.`
            : "The newsletter could not be sent to any active subscriber.",

        audience:
          DEFAULT_AUDIENCE,

        audienceLabel:
          "All Active Subscribers",

        recipientCount,

        acceptedCount,

        failedCount,

        campaign:
          normalizeCampaign(
            finalCampaign
          ),

        results,
      });
  } catch (error) {
    /*
     * If the operation crashes after the campaign has been
     * identified, make a best effort to mark it failed.
     */
    if (campaignId) {
      try {
        const current =
          await loadCampaignForDelivery(
            campaignId
          );

        if (
          current &&
          current.status ===
            CAMPAIGN_STATUS.SENDING
        ) {
          await supabaseAdmin
            .from(
              CAMPAIGNS_TABLE
            )
            .update({
              status:
                CAMPAIGN_STATUS.FAILED,

              updated_at:
                nowIso(),
            })
            .eq(
              "id",
              campaignId
            );
        }
      } catch (
        recoveryError
      ) {
        console.error(
          "[NEWSLETTER] Unable to recover failed campaign state:",
          recoveryError
        );
      }
    }

    return sendServerError(
      res,
      error,
      "Unable to send newsletter campaign."
    );
  }
}


/* ============================================================
   NEWSLETTER ANALYTICS
============================================================ */

async function getNewsletterAnalytics(
  req,
  res
) {
  try {
    /*
     * Load subscriber totals.
     */
    const {
      data:
        subscriberRows,
      error:
        subscriberError,
    } =
      await supabaseAdmin
        .from(
          SUBSCRIBERS_TABLE
        )
        .select(
          "id,status,created_at"
        );

    if (
      subscriberError
    ) {
      throw subscriberError;
    }

    /*
     * Load campaign totals.
     */
    const {
      data:
        campaignRows,
      error:
        campaignError,
    } =
      await supabaseAdmin
        .from(
          CAMPAIGNS_TABLE
        )
        .select(
          "id,status,recipient_count,delivered_count,failed_count,opened_count,clicked_count,created_at,sent_at"
        );

    if (
      campaignError
    ) {
      throw campaignError;
    }

    /*
     * Load delivery totals.
     */
    const {
      data:
        deliveryRows,
      error:
        deliveryError,
    } =
      await supabaseAdmin
        .from(
          DELIVERIES_TABLE
        )
        .select(
          "id,status,sent_at,delivered_at,opened_at,clicked_at,failed_at"
        );

    if (
      deliveryError
    ) {
      throw deliveryError;
    }

    const subscribers =
      subscriberRows || [];

    const campaigns =
      campaignRows || [];

    const deliveries =
      deliveryRows || [];


    /* --------------------------------------------------------
       SUBSCRIBERS
    --------------------------------------------------------- */

    const totalSubscribers =
      subscribers.length;

    const activeSubscribers =
      subscribers.filter(
        (subscriber) =>
          cleanString(
            subscriber.status
          ).toLowerCase() ===
          "subscribed"
      ).length;

    const unsubscribedSubscribers =
      subscribers.filter(
        (subscriber) =>
          cleanString(
            subscriber.status
          ).toLowerCase() ===
          "unsubscribed"
      ).length;


    /* --------------------------------------------------------
       CAMPAIGNS
    --------------------------------------------------------- */

    const totalCampaigns =
      campaigns.length;

    const draftCampaigns =
      campaigns.filter(
        (campaign) =>
          campaign.status ===
          CAMPAIGN_STATUS.DRAFT
      ).length;

    const scheduledCampaigns =
      campaigns.filter(
        (campaign) =>
          campaign.status ===
          CAMPAIGN_STATUS.SCHEDULED
      ).length;

    const sendingCampaigns =
      campaigns.filter(
        (campaign) =>
          campaign.status ===
          CAMPAIGN_STATUS.SENDING
      ).length;

    const sentCampaigns =
      campaigns.filter(
        (campaign) =>
          campaign.status ===
          CAMPAIGN_STATUS.SENT
      ).length;

    const failedCampaigns =
      campaigns.filter(
        (campaign) =>
          campaign.status ===
          CAMPAIGN_STATUS.FAILED
      ).length;


    /* --------------------------------------------------------
       DELIVERY

       "sent" currently means provider accepted the send request.
       Confirmed delivered/opened/clicked data requires webhooks.
    --------------------------------------------------------- */

    const recipients =
      campaigns.reduce(
        (
          total,
          campaign
        ) =>
          total +
          Number(
            campaign.recipient_count ||
              0
          ),
        0
      );

    const acceptedFromCampaigns =
      campaigns.reduce(
        (
          total,
          campaign
        ) =>
          total +
          Number(
            campaign.delivered_count ||
              0
          ),
        0
      );

    const failedFromCampaigns =
      campaigns.reduce(
        (
          total,
          campaign
        ) =>
          total +
          Number(
            campaign.failed_count ||
              0
          ),
        0
      );

    const acceptedDeliveryRows =
      deliveries.filter(
        (delivery) =>
          [
            "sent",
            "accepted",
            "delivered",
          ].includes(
            cleanString(
              delivery.status
            ).toLowerCase()
          )
      ).length;

    const failedDeliveryRows =
      deliveries.filter(
        (delivery) =>
          cleanString(
            delivery.status
          ).toLowerCase() ===
          "failed"
      ).length;

    const confirmedDelivered =
      deliveries.filter(
        (delivery) =>
          Boolean(
            delivery.delivered_at
          )
      ).length;

    const opened =
      deliveries.filter(
        (delivery) =>
          Boolean(
            delivery.opened_at
          )
      ).length;

    const clicked =
      deliveries.filter(
        (delivery) =>
          Boolean(
            delivery.clicked_at
          )
      ).length;

    /*
     * Prefer actual delivery rows when available.
     * Otherwise use campaign aggregate fields.
     */
    const accepted =
      deliveries.length > 0
        ? acceptedDeliveryRows
        : acceptedFromCampaigns;

    const failed =
      deliveries.length > 0
        ? failedDeliveryRows
        : failedFromCampaigns;

    const acceptanceRate =
      recipients > 0
        ? Number(
            (
              (
                accepted /
                recipients
              ) *
              100
            ).toFixed(2)
          )
        : 0;

    const failureRate =
      recipients > 0
        ? Number(
            (
              (
                failed /
                recipients
              ) *
              100
            ).toFixed(2)
          )
        : 0;


    /* --------------------------------------------------------
       RESPONSE
    --------------------------------------------------------- */

    return res
      .status(200)
      .json({
        success: true,

        subscribers: {
          total:
            totalSubscribers,

          active:
            activeSubscribers,

          unsubscribed:
            unsubscribedSubscribers,
        },

        campaigns: {
          total:
            totalCampaigns,

          draft:
            draftCampaigns,

          scheduled:
            scheduledCampaigns,

          sending:
            sendingCampaigns,

          sent:
            sentCampaigns,

          failed:
            failedCampaigns,
        },

        delivery: {
          recipients,

          /*
           * Provider accepted.
           */
          accepted,

          failed,

          /*
           * These remain zero unless delivery/webhook events
           * populate the relevant timestamps.
           */
          confirmedDelivered,

          opened,

          clicked,

          acceptanceRate,

          failureRate,
        },

        /*
         * Compatibility values for older admin UI code.
         */
        totalSubscribers,

        activeSubscribers,

        totalCampaigns,

        draftCampaigns,

        scheduledCampaigns,

        sentCampaigns,

        failedCampaigns,

        totalRecipients:
          recipients,

        totalAccepted:
          accepted,

        totalDelivered:
          accepted,

        totalFailed:
          failed,

        totalOpened:
          opened,

        totalClicked:
          clicked,
      });
  } catch (error) {
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
  /*
   * Public subscriber endpoints
   */
  subscribe,
  unsubscribe,

  /*
   * Admin subscriber management
   */
  getSubscribers,
  updateSubscriber,
  deleteSubscriber,

  /*
   * Newsletter images
   */
  uploadNewsletterImage,

  /*
   * Campaign management
   */
  getCampaigns,
  getCampaign,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  duplicateCampaign,

  /*
   * Audience / recipients
   */
  getCampaignRecipientCount,

  /*
   * Scheduling
   */
  scheduleCampaign,
  cancelScheduledCampaign,

  /*
   * Sending
   */
  sendTestCampaign,
  sendCampaign,

  /*
   * Delivery records
   */
  getCampaignDeliveries,

  /*
   * Analytics
   */
  getNewsletterAnalytics,
};