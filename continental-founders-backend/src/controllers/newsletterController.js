const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

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

const NEWSLETTER_IMAGES_BUCKET =
  process.env.NEWSLETTER_IMAGES_BUCKET ||
  "newsletter-images";

const NEWSLETTER_IMAGE_TYPES =
  new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
  ]);

const MAX_NEWSLETTER_IMAGE_SIZE =
  5 * 1024 * 1024;


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

  return date;
}


function getCurrentAdminId(
  req
) {
  return (
    req?.admin?.id ||
    req?.user?.id ||
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
        fallbackMessage,
    });
}


/* ============================================================
   NEWSLETTER IMAGE HELPERS
============================================================ */

function getNewsletterImageExtension(
  file
) {
  const extensions = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };

  return (
    extensions[
      file?.mimetype
    ] || ""
  );
}


function safeNewsletterStorageName(
  value
) {
  return (
    cleanString(
      value,
      "newsletter-image"
    )
      .toLowerCase()
      .replace(
        /\.[^/.]+$/,
        ""
      )
      .replace(
        /[^a-z0-9_-]+/g,
        "-"
      )
      .replace(
        /^-+|-+$/g,
        ""
      )
      .slice(
        0,
        70
      ) ||
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

  const safeName =
    safeNewsletterStorageName(
      file?.originalname
    );

  const random =
    crypto
      .randomBytes(10)
      .toString("hex");

  const year =
    new Date()
      .getUTCFullYear();

  return `campaigns/${year}/${Date.now()}-${safeName}-${random}.${extension}`;
}


/* ============================================================
   EMAIL / HTML HELPERS
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


function getPublicApiUrl() {
  const configured =
    cleanString(
      process.env.PUBLIC_API_URL ||
      process.env.API_URL ||
      ""
    ).replace(
      /\/+$/,
      ""
    );

  if (configured) {
    return configured;
  }

  return "https://continental-founders-1.onrender.com";
}


function buildUnsubscribeUrl(
  subscriber
) {
  const token =
    cleanString(
      subscriber?.unsubscribe_token
    );

  if (!token) {
    return "";
  }

  return (
    `${getPublicApiUrl()}` +
    `/api/newsletter/unsubscribe?token=` +
    encodeURIComponent(
      token
    )
  );
}


function textToHtml(
  value
) {
  const text =
    cleanString(value);

  if (!text) {
    return "";
  }

  return text
    .split(
      /\n\s*\n/
    )
    .map(
      (paragraph) =>
        `<p style="margin:0 0 18px;line-height:1.75;color:#334155;font-size:16px;">${escapeHtml(
          paragraph
        ).replace(
          /\n/g,
          "<br>"
        )}</p>`
    )
    .join("");
}


function buildNewsletterEmail({
  campaign,
  subscriber = null,
  isTest = false,
}) {
  const title =
    cleanString(
      campaign?.title,
      "Continental Founders"
    );

  const subject =
    cleanString(
      campaign?.subject,
      title
    );

  const previewText =
    cleanString(
      campaign?.preview_text
    );

  const content =
    cleanString(
      campaign?.content
    );

  const featuredImage =
    cleanString(
      campaign?.featured_image
    );

  const ctaText =
    cleanString(
      campaign?.cta_text
    );

  const ctaLink =
    cleanString(
      campaign?.cta_link
    );

  const unsubscribeUrl =
    subscriber
      ? buildUnsubscribeUrl(
          subscriber
        )
      : "";

  const testBanner =
    isTest
      ? `
        <div style="
          background:#fff7ed;
          color:#9a3412;
          padding:10px 16px;
          text-align:center;
          font-size:13px;
          font-weight:700;
          border-bottom:1px solid #fed7aa;
        ">
          TEST NEWSLETTER — NOT A LIVE BROADCAST
        </div>
      `
      : "";

  const imageHtml =
    featuredImage &&
    isValidUrl(
      featuredImage
    )
      ? `
        <div style="margin:0 0 28px;">
          <img
            src="${escapeHtml(
              featuredImage
            )}"
            alt="${escapeHtml(
              title
            )}"
            style="
              display:block;
              width:100%;
              max-width:680px;
              height:auto;
              border:0;
              border-radius:16px;
            "
          />
        </div>
      `
      : "";

  const ctaHtml =
    ctaText &&
    ctaLink &&
    isValidUrl(
      ctaLink
    )
      ? `
        <div style="
          margin:32px 0;
          text-align:center;
        ">
          <a
            href="${escapeHtml(
              ctaLink
            )}"
            style="
              display:inline-block;
              background:#0f766e;
              color:#ffffff;
              text-decoration:none;
              padding:14px 24px;
              border-radius:10px;
              font-size:15px;
              font-weight:700;
            "
          >
            ${escapeHtml(
              ctaText
            )}
          </a>
        </div>
      `
      : "";

  const unsubscribeHtml =
    unsubscribeUrl
      ? `
        <p style="
          margin:18px 0 0;
          font-size:12px;
          line-height:1.6;
          color:#94a3b8;
          text-align:center;
        ">
          You are receiving this email because you subscribed
          to Continental Founders updates.
          <br>
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

  const html = `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        >
        <title>
          ${escapeHtml(
            subject
          )}
        </title>
      </head>

      <body style="
        margin:0;
        padding:0;
        background:#f8fafc;
        font-family:Arial,Helvetica,sans-serif;
      ">
        <div style="
          display:none;
          max-height:0;
          overflow:hidden;
          opacity:0;
          color:transparent;
        ">
          ${escapeHtml(
            previewText
          )}
        </div>

        <table
          role="presentation"
          width="100%"
          cellspacing="0"
          cellpadding="0"
          border="0"
          style="
            width:100%;
            background:#f8fafc;
          "
        >
          <tr>
            <td
              align="center"
              style="padding:32px 14px;"
            >
              <table
                role="presentation"
                width="100%"
                cellspacing="0"
                cellpadding="0"
                border="0"
                style="
                  width:100%;
                  max-width:720px;
                  background:#ffffff;
                  border-radius:18px;
                  overflow:hidden;
                  box-shadow:0 10px 30px rgba(15,23,42,.08);
                "
              >
                <tr>
                  <td>
                    ${testBanner}
                  </td>
                </tr>

                <tr>
                  <td style="
                    padding:34px 34px 12px;
                    text-align:center;
                  ">
                    <div style="
                      font-size:13px;
                      font-weight:800;
                      letter-spacing:.12em;
                      text-transform:uppercase;
                      color:#0f766e;
                      margin-bottom:12px;
                    ">
                      Continental Founders
                    </div>

                    <h1 style="
                      margin:0;
                      color:#0f172a;
                      font-size:30px;
                      line-height:1.2;
                    ">
                      ${escapeHtml(
                        title
                      )}
                    </h1>

                    ${
                      previewText
                        ? `
                          <p style="
                            margin:14px auto 0;
                            max-width:580px;
                            color:#64748b;
                            font-size:15px;
                            line-height:1.65;
                          ">
                            ${escapeHtml(
                              previewText
                            )}
                          </p>
                        `
                        : ""
                    }
                  </td>
                </tr>

                <tr>
                  <td style="
                    padding:22px 34px 34px;
                  ">
                    ${imageHtml}

                    ${textToHtml(
                      content
                    )}

                    ${ctaHtml}
                  </td>
                </tr>

                <tr>
                  <td style="
                    padding:24px 34px 30px;
                    border-top:1px solid #e2e8f0;
                    background:#f8fafc;
                  ">
                    <p style="
                      margin:0;
                      text-align:center;
                      color:#64748b;
                      font-size:12px;
                      line-height:1.7;
                    ">
                      Continental Founders
                      <br>
                      Building a more connected global founder ecosystem.
                    </p>

                    ${unsubscribeHtml}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  const textParts = [
    title,
    "",
    previewText,
    "",
    content,
  ];

  if (
    ctaText &&
    ctaLink
  ) {
    textParts.push(
      "",
      `${ctaText}: ${ctaLink}`
    );
  }

  if (unsubscribeUrl) {
    textParts.push(
      "",
      `Unsubscribe: ${unsubscribeUrl}`
    );
  }

  return {
    subject:
      isTest
        ? `[TEST] ${subject}`
        : subject,

    html,

    text:
      textParts
        .filter(
          (item) =>
            item !== null &&
            item !== undefined
        )
        .join("\n")
        .trim(),
  };
}


/* ============================================================
   CAMPAIGN NORMALIZATION
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
      campaign.title || "",

    subject:
      campaign.subject || "",

    previewText:
      campaign.preview_text || "",

    featuredImage:
      campaign.featured_image || "",

    content:
      campaign.content || "",

    ctaText:
      campaign.cta_text || "",

    ctaLink:
      campaign.cta_link || "",

    audience:
      campaign.audience || "all",

    status:
      campaign.status || "draft",

    scheduledAt:
      campaign.scheduled_at || null,

    sentAt:
      campaign.sent_at || null,

    createdAt:
      campaign.created_at || null,

    updatedAt:
      campaign.updated_at || null,

    createdBy:
      campaign.created_by || null,

    recipientCount:
      campaign.recipient_count || 0,

    deliveredCount:
      campaign.delivered_count || 0,

    failedCount:
      campaign.failed_count || 0,
  };
}


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


function validateCampaign(
  input,
  {
    requireContent = false,
  } = {}
) {
  const errors = [];

  if (!input.title) {
    errors.push({
      field: "title",
      message:
        "Newsletter title is required.",
    });
  }

  if (!input.subject) {
    errors.push({
      field: "subject",
      message:
        "Email subject is required.",
    });
  }

  if (
    requireContent &&
    !input.content
  ) {
    errors.push({
      field: "content",
      message:
        "Newsletter content is required.",
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
      field: "ctaLink",
      message:
        "CTA link must be a valid HTTP or HTTPS URL.",
    });
  }

  const allowedAudiences =
    new Set([
      "all",
      "founders",
      "partners",
      "universities",
      "custom",
    ]);

  if (
    !allowedAudiences.has(
      input.audience
    )
  ) {
    errors.push({
      field: "audience",
      message:
        "The selected newsletter audience is invalid.",
    });
  }

  return errors;
}/* ============================================================
   NEWSLETTER IMAGE HELPERS
============================================================ */

function getNewsletterImageExtension(file) {
  return ({
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  })[file?.mimetype] || "";
}


function safeNewsletterStorageName(value) {
  return (
    cleanString(
      value,
      "newsletter-image"
    )
      .toLowerCase()
      .replace(
        /\.[^/.]+$/,
        ""
      )
      .replace(
        /[^a-z0-9_-]+/g,
        "-"
      )
      .replace(
        /^-+|-+$/g,
        ""
      )
      .slice(
        0,
        70
      ) ||
    "newsletter-image"
  );
}


function createNewsletterImagePath(file) {
  const extension =
    getNewsletterImageExtension(
      file
    );

  const safeName =
    safeNewsletterStorageName(
      file?.originalname
    );

  return (
    `campaigns/` +
    `${new Date().getUTCFullYear()}/` +
    `${Date.now()}-` +
    `${safeName}-` +
    `${crypto.randomBytes(10).toString("hex")}.` +
    `${extension}`
  );
}


/* ============================================================
   UPLOAD NEWSLETTER IMAGE

   POST /api/newsletter/admin/upload-image
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

    if (!file?.buffer) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "Please choose an image to upload.",
        });
    }


    if (
      !NEWSLETTER_IMAGE_TYPES.has(
        file.mimetype
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


    if (
      file.size >
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
              file.mimetype,

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
      publicUrlData
        ?.publicUrl ||
      "";


    if (!publicUrl) {
      throw new Error(
        "The image uploaded, but its public URL could not be created."
      );
    }


    uploadedStoragePath =
      null;


    return res
      .status(201)
      .json({
        success: true,

        message:
          "Newsletter image uploaded successfully.",

        url:
          publicUrl,

        publicUrl,

        path:
          storagePath,

        image: {
          url:
            publicUrl,

          publicUrl,

          path:
            storagePath,

          originalName:
            file.originalname,

          mimeType:
            file.mimetype,

          size:
            file.size,
        },
      });

  } catch (error) {
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
          "Unable to clean up failed newsletter image upload:",
          cleanupError
        );
      }
    }


    return sendServerError(
      res,
      error,
      "Unable to upload newsletter image."
    );
  }
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
   SUBSCRIBE

   POST /api/newsletter/subscribe
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


    if (
      !email ||
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


    const source =
      cleanString(
        req.body?.source,
        "website"
      );


    const {
      data:
        existingSubscriber,

      error:
        lookupError,
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


    if (lookupError) {
      throw lookupError;
    }


    if (
      existingSubscriber
    ) {
      if (
        existingSubscriber
          .status ===
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


      const {
        data:
          restoredSubscriber,

        error:
          restoreError,
      } =
        await supabaseAdmin
          .from(
            SUBSCRIBERS_TABLE
          )
          .update({
            status:
              "subscribed",

            source:
              source ||
              existingSubscriber
                .source ||
              "website",

            subscribed_at:
              nowIso(),

            unsubscribed_at:
              null,

            unsubscribe_token:
              createToken(),

            updated_at:
              nowIso(),
          })
          .eq(
            "id",
            existingSubscriber.id
          )
          .select("*")
          .single();


      if (restoreError) {
        throw restoreError;
      }


      return res
        .status(200)
        .json({
          success: true,

          message:
            "Welcome back. Your newsletter subscription is active again.",

          subscriber:
            normalizeSubscriber(
              restoredSubscriber
            ),
        });
    }


    const {
      data:
        subscriber,

      error:
        insertError,
    } =
      await supabaseAdmin
        .from(
          SUBSCRIBERS_TABLE
        )
        .insert({
          email,

          status:
            "subscribed",

          source,

          unsubscribe_token:
            createToken(),

          subscribed_at:
            nowIso(),

          unsubscribed_at:
            null,

          created_at:
            nowIso(),

          updated_at:
            nowIso(),
        })
        .select("*")
        .single();


    if (insertError) {
      throw insertError;
    }


    return res
      .status(201)
      .json({
        success: true,

        message:
          "Thank you for subscribing to Continental Founders updates.",

        subscriber:
          normalizeSubscriber(
            subscriber
          ),
      });

  } catch (error) {
    return sendServerError(
      res,
      error,
      "Unable to subscribe to the newsletter."
    );
  }
}


/* ============================================================
   UNSUBSCRIBE

   POST /api/newsletter/unsubscribe
   GET  /api/newsletter/unsubscribe
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
          "unsubscribe_token",
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
      data:
        subscriber,

      error:
        lookupError,
    } =
      await query
        .maybeSingle();


    if (lookupError) {
      throw lookupError;
    }


    if (!subscriber) {
      return res
        .status(404)
        .json({
          success: false,

          message:
            "Newsletter subscription not found.",
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
            "This email address is already unsubscribed.",
        });
    }


    const {
      data:
        updatedSubscriber,

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
            nowIso(),

          updated_at:
            nowIso(),
        })
        .eq(
          "id",
          subscriber.id
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
          "You have been unsubscribed from Continental Founders updates.",

        subscriber:
          normalizeSubscriber(
            updatedSubscriber
          ),
      });

  } catch (error) {
    return sendServerError(
      res,
      error,
      "Unable to unsubscribe from the newsletter."
    );
  }
}/* ============================================================
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


    if (error) {
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

  } catch (error) {
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


    if (existingError) {
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


    if (error) {
      throw error;
    }


    if (!data) {
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

  } catch (error) {
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


    if (error) {
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

  } catch (error) {
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
}/* ============================================================
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


    if (lookupError) {
      throw lookupError;
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
      existingCampaign.status ===
      "sent"
    ) {
      return res
        .status(409)
        .json({
          success: false,

          message:
            "A sent newsletter cannot be edited.",
        });
    }


    if (
      existingCampaign.status ===
      "sending"
    ) {
      return res
        .status(409)
        .json({
          success: false,

          message:
            "This newsletter is currently being sent and cannot be edited.",
        });
    }


    const input =
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


    const updates = {
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

      updated_at:
        nowIso(),
    };


    /*
      If a scheduled campaign is edited,
      keep its schedule unless the frontend
      explicitly cancels the schedule through
      the cancel-schedule endpoint.
    */


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


    if (lookupError) {
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
      "sending"
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
      Remove delivery records first.

      This avoids foreign-key problems in databases
      where newsletter_deliveries references the
      campaign without ON DELETE CASCADE.
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
          "Newsletter campaign deleted successfully.",

        deletedCampaign: {
          id:
            campaign.id,

          title:
            campaign.title,
        },
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
        sourceCampaign,

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


    if (lookupError) {
      throw lookupError;
    }


    if (
      !sourceCampaign
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


    const duplicatedTitle =
      `${cleanString(
        sourceCampaign.title,
        "Newsletter"
      )} Copy`;


    const {
      data:
        duplicatedCampaign,

      error:
        insertError,
    } =
      await supabaseAdmin
        .from(
          CAMPAIGNS_TABLE
        )
        .insert({
          title:
            duplicatedTitle,

          subject:
            sourceCampaign.subject,

          preview_text:
            sourceCampaign.preview_text,

          featured_image:
            sourceCampaign.featured_image,

          content:
            sourceCampaign.content,

          cta_text:
            sourceCampaign.cta_text,

          cta_link:
            sourceCampaign.cta_link,

          audience:
            sourceCampaign.audience ||
            "all",

          status:
            "draft",

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


    if (insertError) {
      throw insertError;
    }


    return res
      .status(201)
      .json({
        success: true,

        message:
          "Newsletter campaign duplicated successfully.",

        campaign:
          normalizeCampaign(
            duplicatedCampaign
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
   AUDIENCE HELPERS
============================================================ */

async function getRecipientCount(
  audience = "all"
) {
  const normalizedAudience =
    cleanString(
      audience,
      "all"
    ).toLowerCase();


  /*
    The current newsletter_subscribers table
    supports the general active subscriber audience.

    Segmented audiences can be enabled when the
    subscriber table contains the corresponding
    founder / partner / university classifications.
  */

  if (
    normalizedAudience !==
    "all"
  ) {
    return {
      supported:
        false,

      count:
        0,

      audience:
        normalizedAudience,
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


  if (error) {
    throw error;
  }


  return {
    supported:
      true,

    count:
      Number(
        count || 0
      ),

    audience:
      normalizedAudience,
  };
}


/* ============================================================
   LOAD CAMPAIGN RECIPIENTS
============================================================ */

async function getCampaignRecipients(
  audience = "all"
) {
  const normalizedAudience =
    cleanString(
      audience,
      "all"
    ).toLowerCase();


  if (
    normalizedAudience !==
    "all"
  ) {
    return {
      supported:
        false,

      recipients:
        [],

      audience:
        normalizedAudience,
    };
  }


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
        "subscribed_at",
        {
          ascending:
            true,
        }
      );


  if (error) {
    throw error;
  }


  const recipients =
    Array.isArray(
      data
    )
      ? data.filter(
          (
            subscriber
          ) =>
            subscriber?.email &&
            isValidEmail(
              normalizeEmail(
                subscriber.email
              )
            )
        )
      : [];


  return {
    supported:
      true,

    recipients,

    audience:
      normalizedAudience,
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

      error:
        lookupError,
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


    if (lookupError) {
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
            "This audience cannot be counted until subscriber segmentation is configured.",

          audience:
            recipients.audience,

          recipientCount:
            0,
        });
    }


    return res
      .status(200)
      .json({
        success: true,

        audience:
          recipients.audience,

        recipientCount:
          recipients.count,
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


    if (!scheduledAt) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "Please provide a valid newsletter schedule date and time.",
        });
    }


    if (
      scheduledAt.getTime() <=
      Date.now()
    ) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "The newsletter schedule must be in the future.",
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


    if (lookupError) {
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
            "A sent newsletter cannot be scheduled again.",
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
            "This newsletter is currently being sent.",
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
      data:
        updatedCampaign,

      error:
        updateError,
    } =
      await supabaseAdmin
        .from(
          CAMPAIGNS_TABLE
        )
        .update({
          status:
            "scheduled",

          scheduled_at:
            scheduledAt
              .toISOString(),

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


    if (updateError) {
      throw updateError;
    }


    return res
      .status(200)
      .json({
        success: true,

        message:
          "Newsletter scheduled successfully.",

        recipientCount:
          recipients.count,

        campaign:
          normalizeCampaign(
            updatedCampaign
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
        .select("*")
        .eq(
          "id",
          id
        )
        .maybeSingle();


    if (lookupError) {
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
            "This newsletter is not currently scheduled.",
        });
    }


    const {
      data:
        updatedCampaign,

      error:
        updateError,
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


    if (updateError) {
      throw updateError;
    }


    return res
      .status(200)
      .json({
        success: true,

        message:
          "Newsletter schedule cancelled.",

        campaign:
          normalizeCampaign(
            updatedCampaign
          ),
      });

  } catch (error) {
    return sendServerError(
      res,
      error,
      "Unable to cancel newsletter schedule."
    );
  }
}module.exports = {
  subscribe,
  unsubscribe,
  getSubscribers,
  updateSubscriber,
  deleteSubscriber,
  uploadNewsletterImage,
  getCampaigns,
  getCampaign,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  duplicateCampaign,
  getCampaignRecipientCount,
  scheduleCampaign,
  cancelScheduledCampaign,
  sendTestCampaign,
  sendCampaign,
  getCampaignDeliveries,
  getNewsletterAnalytics,
};