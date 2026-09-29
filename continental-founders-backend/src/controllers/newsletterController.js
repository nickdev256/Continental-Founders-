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

   and also tolerates:
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

    ctaText:
      campaign.cta_text || "",

    ctaLink:
      campaign.cta_link || "",

    /*
     * We intentionally expose only
     * the single supported audience.
     */
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
     * Ignore any audience sent
     * by the browser.
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

   Supports:
   POST body:
     { email }
     { token }

   and public GET:
     ?email=
     ?token=
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


    /*
     * Do not reveal whether an
     * arbitrary email exists.
     */
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
}/* ============================================================
   UPLOAD NEWSLETTER IMAGE

   Uploads one image at a time to Supabase Storage.
   The frontend can call this endpoint repeatedly when the
   newsletter contains several images.

   Each upload returns a permanent public URL which can then
   be placed inside the campaign's `images` array.
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
      /*
       * The upload succeeded but we
       * cannot use it without a valid
       * public URL. Clean it up.
       */
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
}


/* ============================================================
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
            ascending:
              false,
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
      "Unable to load newsletters."
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
            "Newsletter ID is required.",
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
            "Newsletter not found.",
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
      "Unable to load newsletter."
    );
  }
}


/* ============================================================
   CREATE CAMPAIGN

   Audience is always "all".
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


    const errors =
      validateCampaign(
        input
      );


    if (
      errors.length > 0
    ) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            errors[0],

          errors,
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

          /*
           * New JSONB field.
           */
          images:
            input.images,

          content:
            input.content,

          cta_text:
            input.ctaText,

          cta_link:
            input.ctaLink ||
            null,

          /*
           * There is now only one
           * supported audience.
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
          "Newsletter created successfully.",

        campaign:
          normalizeCampaign(
            data
          ),
      });
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Unable to create newsletter."
    );
  }
}


/* ============================================================
   UPDATE CAMPAIGN

   Sent newsletters are historical records and should normally
   be duplicated rather than edited. Drafts, scheduled and
   failed newsletters may be edited.

   A sent newsletter CAN still be deleted through
   deleteCampaign().
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
            "Newsletter ID is required.",
        });
    }


    const {
      data: existing,
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


    if (!existing) {
      return res
        .status(404)
        .json({
          success: false,

          message:
            "Newsletter not found.",
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
            "This newsletter is currently being sent and cannot be edited.",
        });
    }


    if (
      existing.status ===
      CAMPAIGN_STATUS.SENT
    ) {
      return res
        .status(409)
        .json({
          success: false,

          message:
            "A sent newsletter cannot be edited. Duplicate it to create a new draft, or delete it if you no longer want it in the Newsletter Studio.",
        });
    }


    /*
     * Preserve existing values when a
     * field was not supplied.
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

      /*
       * Ignore audience from the
       * frontend completely.
       */
      audience:
        DEFAULT_AUDIENCE,
    };


    const input =
      normalizeCampaignInput(
        mergedInput
      );


    const errors =
      validateCampaign(
        input
      );


    if (
      errors.length > 0
    ) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            errors[0],

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
          "Newsletter updated successfully.",

        campaign:
          normalizeCampaign(
            data
          ),
      });
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Unable to update newsletter."
    );
  }
}


/* ============================================================
   DELETE CAMPAIGN

   IMPORTANT:
   Draft, scheduled, failed AND sent newsletters can be deleted.

   Only a newsletter actively being sent is protected.

   Deleting a sent newsletter removes the CMS/database record.
   It cannot recall emails that subscribers already received.
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
            "Newsletter ID is required.",
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
          "id,title,status"
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
            "Newsletter not found.",
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
            "This newsletter is currently being sent. Wait for sending to finish before deleting it.",
        });
    }


    /*
     * Remove delivery records first.
     *
     * This makes deletion work even when the database
     * foreign key does not use ON DELETE CASCADE.
     */
    const {
      error:
        deliveriesError,
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
      deliveriesError
    ) {
      throw deliveriesError;
    }


    const {
      error:
        deleteError,
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
      deleteError
    ) {
      throw deleteError;
    }


    return res
      .status(200)
      .json({
        success: true,

        message:
          campaign.status ===
          CAMPAIGN_STATUS.SENT
            ? "Published newsletter deleted from the Newsletter Studio. Emails already sent to subscribers are not affected."
            : "Newsletter deleted successfully.",

        deletedCampaign: {
          id:
            campaign.id,

          title:
            campaign.title,

          status:
            campaign.status,
        },
      });
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Unable to delete newsletter."
    );
  }
}


/* ============================================================
   DUPLICATE CAMPAIGN

   This is the recommended way to reuse a sent newsletter.

   Multiple images are preserved.
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
            "Newsletter ID is required.",
        });
    }


    const {
      data: existing,
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


    if (!existing) {
      return res
        .status(404)
        .json({
          success: false,

          message:
            "Newsletter not found.",
        });
    }


    const adminId =
      getCurrentAdminId(
        req
      );


    const timestamp =
      nowIso();


    const originalTitle =
      cleanString(
        existing.title,
        "Newsletter"
      );


    const duplicateTitle =
      `${originalTitle} — Copy`;


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
            duplicateTitle,

          subject:
            existing.subject ||
            "",

          preview_text:
            existing.preview_text ||
            "",

          featured_image:
            existing.featured_image ||
            null,

          /*
           * Preserve every additional
           * newsletter image.
           */
          images:
            normalizeImages(
              existing.images
            ),

          content:
            existing.content ||
            "",

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
      "Unable to duplicate newsletter."
    );
  }
}


/* ============================================================
   GET CAMPAIGN RECIPIENT COUNT

   There is only one audience:
   all active subscribers.
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
            "Newsletter ID is required.",
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
          "id,title,status"
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
            "Newsletter not found.",
        });
    }


    const recipientInfo =
      await getRecipientCount();


    return res
      .status(200)
      .json({
        success: true,

        campaignId:
          campaign.id,

        audience:
          DEFAULT_AUDIENCE,

        count:
          recipientInfo.count,

        recipientCount:
          recipientInfo.count,

        supported:
          true,

        label:
          "All Active Subscribers",
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
            "Newsletter ID is required.",
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
            "Please provide a valid delivery date and time.",
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
            "Scheduled delivery must be in the future.",
        });
    }


    const {
      data: existing,
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


    if (!existing) {
      return res
        .status(404)
        .json({
          success: false,

          message:
            "Newsletter not found.",
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
            "This newsletter is currently being sent.",
        });
    }


    if (
      existing.status ===
      CAMPAIGN_STATUS.SENT
    ) {
      return res
        .status(409)
        .json({
          success: false,

          message:
            "A sent newsletter cannot be scheduled again. Duplicate it to create a new newsletter.",
        });
    }


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

        ctaText:
          existing.cta_text,

        ctaLink:
          existing.cta_link,
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


    const recipientInfo =
      await getRecipientCount();


    if (
      recipientInfo.count <
      1
    ) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "There are no active subscribers to receive this newsletter.",
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
          audience:
            DEFAULT_AUDIENCE,

          status:
            CAMPAIGN_STATUS.SCHEDULED,

          scheduled_at:
            scheduledAt,

          recipient_count:
            recipientInfo.count,

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

        campaign:
          normalizeCampaign(
            data
          ),
      });
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Unable to schedule newsletter."
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
            "Newsletter ID is required.",
        });
    }


    const {
      data: existing,
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


    if (!existing) {
      return res
        .status(404)
        .json({
          success: false,

          message:
            "Newsletter not found.",
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
            "Newsletter ID is required.",
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
          "id,title,status"
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
            "Newsletter not found.",
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
            ascending:
              false,
          }
        );


    if (error) {
      throw error;
    }


    const deliveries =
      (data || []).map(
        normalizeDelivery
      );


    return res
      .status(200)
      .json({
        success: true,

        campaign: {
          id:
            campaign.id,

          title:
            campaign.title,

          status:
            campaign.status,
        },

        deliveries,

        count:
          deliveries.length,
      });
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Unable to load newsletter delivery records."
    );
  }
}/* ============================================================
   LOAD CAMPAIGN FOR DELIVERY
============================================================ */

async function loadCampaignForDelivery(
  id
) {
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
   VALIDATE CAMPAIGN BEFORE DELIVERY
============================================================ */

function validateCampaignForDelivery(
  campaign
) {
  if (!campaign) {
    return [
      "Newsletter not found.",
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

      ctaText:
        campaign.cta_text,

      ctaLink:
        campaign.cta_link,
    });


  return validateCampaign(
    normalized
  );
}


/* ============================================================
   SEND TEST CAMPAIGN

   Sends the newsletter to ONE test email only.

   It does NOT:
   - mark the campaign as sent
   - create normal subscriber delivery statistics
   - affect recipient counts
============================================================ */

async function sendTestCampaign(
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
            "Newsletter ID is required.",
        });
    }


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
            "Please enter a valid test email address.",
        });
    }


    const campaign =
      await loadCampaignForDelivery(
        id
      );


    if (!campaign) {
      return res
        .status(404)
        .json({
          success: false,

          message:
            "Newsletter not found.",
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


    /*
     * Test emails intentionally do not
     * contain a real subscriber
     * unsubscribe token.
     */
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


    const subject =
      `[TEST] ${cleanString(
        campaign.subject
      )}`;


    const result =
      await sendEmail({
        to:
          email,

        subject,

        html,

        text,
      });


    return res
      .status(200)
      .json({
        success: true,

        message:
          `Test newsletter accepted for sending to ${email}.`,

        email,

        providerMessageId:
          result?.messageId ||
          null,

        campaign:
          normalizeCampaign(
            campaign
          ),
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
  subscriber,
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
      subscriber?.id ||
      null,

    email:
      normalizeEmail(
        subscriber?.email
      ),

    status,

    provider_message_id:
      providerMessageId,

    failure_reason:
      failureReason,

    sent_at:
      sentAt,

    delivered_at:
      null,

    opened_at:
      null,

    clicked_at:
      null,

    failed_at:
      failedAt,

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

   Email delivery should not be incorrectly reported as failed
   simply because analytics logging had a separate database
   problem.

   We therefore log delivery-record failures separately.
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
      {
        campaignId:
          payload?.campaignId ||
          null,

        email:
          payload?.subscriber?.email ||
          null,

        status:
          payload?.status ||
          null,

        message:
          error?.message ||
          "Unknown delivery-record error",
      }
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
    recipientCount,
    acceptedCount,
    failedCount,
  }
) {
  const {
    error,
  } =
    await supabaseAdmin
      .from(
        CAMPAIGNS_TABLE
      )
      .update({
        recipient_count:
          recipientCount,

        /*
         * Existing database field name is
         * delivered_count.
         *
         * Until provider webhooks are added,
         * this stores emails accepted by Resend,
         * not independently confirmed inbox
         * deliveries.
         */
        delivered_count:
          acceptedCount,

        failed_count:
          failedCount,

        updated_at:
          nowIso(),
      })
      .eq(
        "id",
        campaignId
      );


  if (error) {
    throw error;
  }
}


/* ============================================================
   SEND CAMPAIGN

   Broadcasts to ALL ACTIVE SUBSCRIBERS.

   There is no audience selector anymore.

   Important:
   `sendEmail()` success means Resend accepted the email.
   It does not yet mean the recipient's mail server confirmed
   final delivery.
============================================================ */

async function sendCampaign(
  req,
  res
) {
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
          "Newsletter ID is required.",
      });
  }


  let campaign = null;

  let campaignMarkedSending =
    false;


  try {
    campaign =
      await loadCampaignForDelivery(
        id
      );


    if (!campaign) {
      return res
        .status(404)
        .json({
          success: false,

          message:
            "Newsletter not found.",
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
            "There are no active subscribers to receive this newsletter.",
        });
    }


    /*
     * Mark the campaign as sending BEFORE
     * beginning the broadcast.
     *
     * This also prevents an administrator
     * deleting the campaign during delivery.
     */
    const {
      data:
        sendingCampaign,

      error:
        sendingError,
    } =
      await supabaseAdmin
        .from(
          CAMPAIGNS_TABLE
        )
        .update({
          audience:
            DEFAULT_AUDIENCE,

          status:
            CAMPAIGN_STATUS.SENDING,

          scheduled_at:
            null,

          recipient_count:
            recipientCount,

          delivered_count:
            0,

          failed_count:
            0,

          sent_at:
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


    if (sendingError) {
      throw sendingError;
    }


    campaign =
      sendingCampaign;


    campaignMarkedSending =
      true;


    let acceptedCount = 0;

    let failedCount = 0;


    const failures = [];


    /*
     * Sequential delivery is intentional.
     *
     * It keeps this implementation simple
     * and avoids launching every request at
     * exactly the same time.
     *
     * For a much larger subscriber list,
     * this should eventually move to a
     * queue/background worker or provider
     * broadcast feature.
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


        const sentAt =
          nowIso();


        acceptedCount += 1;


        await safelyCreateDeliveryRecord({
          campaignId:
            id,

          subscriber,

          status:
            "sent",

          providerMessageId:
            result?.messageId ||
            null,

          failureReason:
            null,

          sentAt,

          failedAt:
            null,
        });
      } catch (
        deliveryError
      ) {
        failedCount += 1;


        const failureReason =
          cleanString(
            deliveryError?.message,
            "Unable to send email."
          );


        failures.push({
          email,

          message:
            failureReason,
        });


        await safelyCreateDeliveryRecord({
          campaignId:
            id,

          subscriber,

          status:
            "failed",

          providerMessageId:
            null,

          failureReason,

          sentAt:
            null,

          failedAt:
            nowIso(),
        });
      }


      /*
       * Persist progress after every email.
       * If the request fails later, the CMS
       * still has useful counts.
       */
      await updateCampaignDeliveryProgress(
        id,
        {
          recipientCount,

          acceptedCount,

          failedCount,
        }
      );


      /*
       * Small spacing between provider calls.
       * Skip the delay after the final email.
       */
      if (
        index <
        subscribers.length - 1
      ) {
        await sleep(
          550
        );
      }
    }


    const finalStatus =
      acceptedCount > 0
        ? CAMPAIGN_STATUS.SENT
        : CAMPAIGN_STATUS.FAILED;


    const completedAt =
      nowIso();


    const {
      data:
        completedCampaign,

      error:
        completedError,
    } =
      await supabaseAdmin
        .from(
          CAMPAIGNS_TABLE
        )
        .update({
          audience:
            DEFAULT_AUDIENCE,

          status:
            finalStatus,

          scheduled_at:
            null,

          /*
           * Set sent_at only when at least
           * one message was accepted.
           */
          sent_at:
            acceptedCount > 0
              ? completedAt
              : null,

          recipient_count:
            recipientCount,

          delivered_count:
            acceptedCount,

          failed_count:
            failedCount,

          updated_at:
            completedAt,
        })
        .eq(
          "id",
          id
        )
        .select("*")
        .single();


    if (completedError) {
      throw completedError;
    }


    /*
     * If some recipients failed but others
     * were accepted, the overall campaign
     * remains "sent" while failed_count tells
     * the administrator what happened.
     */
    const message =
      acceptedCount ===
      recipientCount
        ? `Newsletter accepted for sending to all ${recipientCount} active subscribers.`
        : acceptedCount > 0
          ? `Newsletter sending completed. ${acceptedCount} message(s) were accepted and ${failedCount} failed.`
          : "The newsletter could not be sent to any active subscriber.";


    return res
      .status(
        acceptedCount > 0
          ? 200
          : 502
      )
      .json({
        success:
          acceptedCount > 0,

        message,

        audience:
          DEFAULT_AUDIENCE,

        recipientCount,

        /*
         * Use acceptedCount in the API so the
         * frontend can label this honestly.
         */
        acceptedCount,

        failedCount,

        failures,

        campaign:
          normalizeCampaign(
            completedCampaign
          ),
      });
  } catch (error) {
    console.error(
      "[NEWSLETTER] Campaign delivery failed:",
      error
    );


    /*
     * If the campaign had already entered
     * "sending", make sure it does not remain
     * permanently locked there after an
     * unexpected server failure.
     */
    if (
      campaignMarkedSending
    ) {
      try {
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
            id
          );
      } catch (
        statusError
      ) {
        console.error(
          "[NEWSLETTER] Unable to mark campaign as failed:",
          statusError
        );
      }
    }


    return res
      .status(500)
      .json({
        success: false,

        message:
          error?.message ||
          "Unable to send newsletter.",
      });
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
    const [
      subscribersResult,
      campaignsResult,
      deliveriesResult,
    ] =
      await Promise.all([
        supabaseAdmin
          .from(
            SUBSCRIBERS_TABLE
          )
          .select("*"),

        supabaseAdmin
          .from(
            CAMPAIGNS_TABLE
          )
          .select("*"),

        supabaseAdmin
          .from(
            DELIVERIES_TABLE
          )
          .select("*"),
      ]);


    if (
      subscribersResult.error
    ) {
      throw subscribersResult.error;
    }


    if (
      campaignsResult.error
    ) {
      throw campaignsResult.error;
    }


    if (
      deliveriesResult.error
    ) {
      throw deliveriesResult.error;
    }


    const subscribers =
      subscribersResult.data ||
      [];


    const campaigns =
      campaignsResult.data ||
      [];


    const deliveries =
      deliveriesResult.data ||
      [];


    const activeSubscribers =
      subscribers.filter(
        (subscriber) =>
          subscriber.status ===
          "subscribed"
      ).length;


    const unsubscribedSubscribers =
      subscribers.filter(
        (subscriber) =>
          subscriber.status ===
          "unsubscribed"
      ).length;


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


    const acceptedDeliveries =
      deliveries.filter(
        (delivery) =>
          delivery.status ===
          "sent" ||
          delivery.status ===
          "delivered"
      ).length;


    const failedDeliveries =
      deliveries.filter(
        (delivery) =>
          delivery.status ===
          "failed"
      ).length;


    /*
     * These become meaningful when provider
     * webhooks update the corresponding
     * delivery timestamps.
     */
    const confirmedDelivered =
      deliveries.filter(
        (delivery) =>
          Boolean(
            delivery.delivered_at
          )
      ).length;


    const openedDeliveries =
      deliveries.filter(
        (delivery) =>
          Boolean(
            delivery.opened_at
          )
      ).length;


    const clickedDeliveries =
      deliveries.filter(
        (delivery) =>
          Boolean(
            delivery.clicked_at
          )
      ).length;


    const totalRecipients =
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


    const totalAccepted =
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


    const totalFailed =
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


    const latestSentCampaign =
      campaigns
        .filter(
          (campaign) =>
            campaign.sent_at
        )
        .sort(
          (a, b) =>
            new Date(
              b.sent_at
            ).getTime() -
            new Date(
              a.sent_at
            ).getTime()
        )[0] ||
      null;


    return res
      .status(200)
      .json({
        success: true,

        analytics: {
          audience:
            DEFAULT_AUDIENCE,

          audienceLabel:
            "All Active Subscribers",

          subscribers: {
            total:
              subscribers.length,

            active:
              activeSubscribers,

            unsubscribed:
              unsubscribedSubscribers,
          },

          campaigns: {
            total:
              campaigns.length,

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
            /*
             * accepted = provider accepted
             * the message for sending.
             */
            recipients:
              totalRecipients,

            accepted:
              totalAccepted,

            failed:
              totalFailed,

            deliveryRecords:
              deliveries.length,

            acceptedRecords:
              acceptedDeliveries,

            failedRecords:
              failedDeliveries,

            confirmedDelivered,

            opened:
              openedDeliveries,

            clicked:
              clickedDeliveries,
          },

          latestNewsletter:
            latestSentCampaign
              ? normalizeCampaign(
                  latestSentCampaign
                )
              : null,
        },
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
   MODULE EXPORTS
============================================================ */

module.exports = {
  /* ----------------------------------------------------------
     PUBLIC SUBSCRIBER ACTIONS
  ---------------------------------------------------------- */

  subscribe,

  unsubscribe,


  /* ----------------------------------------------------------
     ADMIN SUBSCRIBER MANAGEMENT
  ---------------------------------------------------------- */

  getSubscribers,

  updateSubscriber,

  deleteSubscriber,


  /* ----------------------------------------------------------
     IMAGE UPLOAD
  ---------------------------------------------------------- */

  uploadNewsletterImage,


  /* ----------------------------------------------------------
     CAMPAIGN MANAGEMENT
  ---------------------------------------------------------- */

  getCampaigns,

  getCampaign,

  createCampaign,

  updateCampaign,

  deleteCampaign,

  duplicateCampaign,

  getCampaignRecipientCount,


  /* ----------------------------------------------------------
     SCHEDULING
  ---------------------------------------------------------- */

  scheduleCampaign,

  cancelScheduledCampaign,


  /* ----------------------------------------------------------
     DELIVERY
  ---------------------------------------------------------- */

  sendTestCampaign,

  sendCampaign,

  getCampaignDeliveries,


  /* ----------------------------------------------------------
     ANALYTICS
  ---------------------------------------------------------- */

  getNewsletterAnalytics,
};