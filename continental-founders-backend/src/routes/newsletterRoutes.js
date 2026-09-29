const express = require("express");
const multer = require("multer");

const {
  /* ==========================================================
     PUBLIC SUBSCRIBER ACTIONS
  ========================================================== */

  subscribe,
  unsubscribe,

  /* ==========================================================
     SUBSCRIBER ADMINISTRATION
  ========================================================== */

  getSubscribers,
  updateSubscriber,
  deleteSubscriber,

  /* ==========================================================
     NEWSLETTER MEDIA
  ========================================================== */

  uploadNewsletterImage,

  /* ==========================================================
     NEWSLETTER ADMINISTRATION
  ========================================================== */

  getCampaigns,
  getCampaign,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  duplicateCampaign,

  /* ==========================================================
     RECIPIENTS
  ========================================================== */

  getCampaignRecipientCount,

  /* ==========================================================
     SCHEDULING
  ========================================================== */

  scheduleCampaign,
  cancelScheduledCampaign,

  /* ==========================================================
     DELIVERY
  ========================================================== */

  sendTestCampaign,
  sendCampaign,
  getCampaignDeliveries,

  /* ==========================================================
     ANALYTICS
  ========================================================== */

  getNewsletterAnalytics,
} = require("../controllers/newsletterController");


const {
  requireAdmin,
} = require("../middleware/auth");


const router =
  express.Router();


/* ============================================================
   NEWSLETTER IMAGE UPLOAD CONFIGURATION

   A newsletter may contain MULTIPLE images.

   Each image is uploaded individually through:

   POST /api/newsletter/admin/upload-image

   The controller returns a permanent public URL.

   The frontend then stores all returned URLs inside:

   images: [
     "https://...",
     "https://...",
     "https://..."
   ]

   This means Multer should continue accepting ONE image per
   request. We do not need upload.array() here.
============================================================ */

const newsletterImageStorage =
  multer.memoryStorage();


const ALLOWED_NEWSLETTER_IMAGE_TYPES =
  new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
  ]);


const MAX_NEWSLETTER_IMAGE_SIZE =
  5 * 1024 * 1024;


const newsletterImageUpload =
  multer({
    storage:
      newsletterImageStorage,

    limits: {
      fileSize:
        MAX_NEWSLETTER_IMAGE_SIZE,

      files: 1,
    },

    fileFilter: (
      req,
      file,
      callback
    ) => {
      const mimeType =
        String(
          file?.mimetype ||
            ""
        )
          .trim()
          .toLowerCase();


      if (
        !ALLOWED_NEWSLETTER_IMAGE_TYPES.has(
          mimeType
        )
      ) {
        const error =
          new Error(
            "Only JPG, PNG and WEBP images are allowed."
          );


        error.code =
          "INVALID_NEWSLETTER_IMAGE_TYPE";


        return callback(
          error
        );
      }


      return callback(
        null,
        true
      );
    },
  });


/* ============================================================
   NEWSLETTER IMAGE UPLOAD MIDDLEWARE

   Converts Multer errors into clean JSON API responses.
============================================================ */

function handleNewsletterImageUpload(
  req,
  res,
  next
) {
  newsletterImageUpload.single(
    "image"
  )(
    req,
    res,
    (error) => {
      if (!error) {
        return next();
      }


      if (
        error instanceof
        multer.MulterError
      ) {
        if (
          error.code ===
          "LIMIT_FILE_SIZE"
        ) {
          return res
            .status(400)
            .json({
              success: false,

              message:
                "The image is too large. Maximum size is 5 MB.",
            });
        }


        if (
          error.code ===
          "LIMIT_FILE_COUNT"
        ) {
          return res
            .status(400)
            .json({
              success: false,

              message:
                "Please upload one newsletter image at a time.",
            });
        }


        if (
          error.code ===
          "LIMIT_UNEXPECTED_FILE"
        ) {
          return res
            .status(400)
            .json({
              success: false,

              message:
                'The image field must be named "image".',
            });
        }


        return res
          .status(400)
          .json({
            success: false,

            message:
              error.message ||
              "Unable to process the uploaded image.",
          });
      }


      if (
        error?.code ===
        "INVALID_NEWSLETTER_IMAGE_TYPE"
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Only JPG, PNG and WEBP images are allowed.",
          });
      }


      console.error(
        "[NEWSLETTER] Image upload middleware error:",
        error
      );


      return res
        .status(500)
        .json({
          success: false,

          message:
            "Unable to process the newsletter image.",
        });
    }
  );
}


/* ============================================================
   PUBLIC ROUTES
============================================================ */


/* ============================================================
   SUBSCRIBE

   POST /api/newsletter/subscribe
============================================================ */

router.post(
  "/subscribe",
  subscribe
);


/* ============================================================
   UNSUBSCRIBE

   POST /api/newsletter/unsubscribe

   Supports:
   {
     "email": "subscriber@example.com"
   }

   OR:
   {
     "token": "unsubscribe-token"
   }


   GET /api/newsletter/unsubscribe?token=...

   GET is used by the unsubscribe link inside sent emails.
============================================================ */

router.post(
  "/unsubscribe",
  unsubscribe
);


router.get(
  "/unsubscribe",
  unsubscribe
);


/* ============================================================
   ADMIN SERVICE STATUS

   GET /api/newsletter/status
============================================================ */

router.get(
  "/status",
  requireAdmin,
  (req, res) => {
    return res
      .status(200)
      .json({
        success: true,

        service:
          "newsletter",

        audience: {
          type:
            "all",

          label:
            "All Active Subscribers",

          selectable:
            false,
        },

        features: {
          subscribers:
            true,

          newsletters:
            true,

          multipleImages:
            true,

          imageUpload:
            true,

          drafts:
            true,

          duplication:
            true,

          scheduling:
            true,

          testEmail:
            true,

          emailDelivery:
            Boolean(
              process.env
                .RESEND_API_KEY &&
                process.env
                  .EMAIL_FROM
            ),

          deliveryRecords:
            true,

          analytics:
            true,

          deletePublished:
            true,
        },

        imageUpload: {
          field:
            "image",

          maxSizeMb:
            5,

          acceptedTypes: [
            "image/jpeg",
            "image/png",
            "image/webp",
          ],

          uploadMode:
            "one-at-a-time",

          multipleImagesPerNewsletter:
            true,
        },

        message:
          "Newsletter API is available.",
      });
  }
);


/* ============================================================
   IMAGE UPLOAD

   POST /api/newsletter/admin/upload-image

   Authentication:
   Admin required.

   Content-Type:
   multipart/form-data

   Form field:
   image

   Supported:
   JPG / JPEG
   PNG
   WEBP

   Maximum:
   5 MB per image

   IMPORTANT:
   A newsletter can contain multiple images, but each image is
   uploaded separately. The frontend collects the returned URLs
   and sends them in the campaign's `images` array.
============================================================ */

router.post(
  "/admin/upload-image",
  requireAdmin,
  handleNewsletterImageUpload,
  uploadNewsletterImage
);


/* ============================================================
   ANALYTICS

   GET /api/newsletter/analytics
============================================================ */

router.get(
  "/analytics",
  requireAdmin,
  getNewsletterAnalytics
);


/* ============================================================
   SUBSCRIBER ADMINISTRATION
============================================================ */


/* ============================================================
   GET SUBSCRIBERS

   GET /api/newsletter/subscribers
============================================================ */

router.get(
  "/subscribers",
  requireAdmin,
  getSubscribers
);


/* ============================================================
   UPDATE SUBSCRIBER

   PATCH /api/newsletter/subscribers/:id
============================================================ */

router.patch(
  "/subscribers/:id",
  requireAdmin,
  updateSubscriber
);


/* ============================================================
   DELETE SUBSCRIBER

   DELETE /api/newsletter/subscribers/:id
============================================================ */

router.delete(
  "/subscribers/:id",
  requireAdmin,
  deleteSubscriber
);


/* ============================================================
   NEWSLETTER COLLECTION
============================================================ */


/* ============================================================
   GET NEWSLETTERS

   GET /api/newsletter/campaigns
============================================================ */

router.get(
  "/campaigns",
  requireAdmin,
  getCampaigns
);


/* ============================================================
   CREATE NEWSLETTER

   POST /api/newsletter/campaigns

   Example:

   {
     "title": "September Founder Update",

     "subject":
       "Building opportunities across our founder network",

     "previewText":
       "Founder stories, partnerships and opportunities.",

     "featuredImage":
       "https://.../cover-image.jpg",

     "images": [
       "https://.../founder-story.jpg",
       "https://.../event.jpg",
       "https://.../partnership.jpg"
     ],

     "content":
       "Newsletter content...",

     "ctaText":
       "Explore Our Ecosystem",

     "ctaLink":
       "https://www.continentalfounders.org"
   }


   Audience is NOT selected by the administrator.

   The controller automatically stores:

   audience: "all"
============================================================ */

router.post(
  "/campaigns",
  requireAdmin,
  createCampaign
);


/* ============================================================
   NEWSLETTER ACTIONS

   Keep these action routes before /campaigns/:id.
============================================================ */


/* ============================================================
   DUPLICATE NEWSLETTER

   POST /api/newsletter/campaigns/:id/duplicate

   Works for drafts and published newsletters.

   The duplicate becomes a new draft and retains:
   - cover image
   - additional images
   - content
   - CTA
============================================================ */

router.post(
  "/campaigns/:id/duplicate",
  requireAdmin,
  duplicateCampaign
);


/* ============================================================
   GET RECIPIENT COUNT

   GET /api/newsletter/campaigns/:id/recipients

   Always returns the current number of active subscribers.
============================================================ */

router.get(
  "/campaigns/:id/recipients",
  requireAdmin,
  getCampaignRecipientCount
);


/* ============================================================
   SCHEDULE NEWSLETTER

   POST /api/newsletter/campaigns/:id/schedule

   Example:

   {
     "scheduledAt":
       "2026-10-01T09:00:00+03:00"
   }
============================================================ */

router.post(
  "/campaigns/:id/schedule",
  requireAdmin,
  scheduleCampaign
);


/* ============================================================
   CANCEL SCHEDULE

   POST /api/newsletter/campaigns/:id/cancel-schedule
============================================================ */

router.post(
  "/campaigns/:id/cancel-schedule",
  requireAdmin,
  cancelScheduledCampaign
);


/* ============================================================
   SEND TEST EMAIL

   POST /api/newsletter/campaigns/:id/test

   Example:

   {
     "email": "admin@example.com"
   }

   This does not broadcast to subscribers and does not mark
   the newsletter as published.
============================================================ */

router.post(
  "/campaigns/:id/test",
  requireAdmin,
  sendTestCampaign
);


/* ============================================================
   SEND NEWSLETTER

   POST /api/newsletter/campaigns/:id/send

   No audience is supplied.

   The controller automatically sends to ALL ACTIVE
   SUBSCRIBERS.
============================================================ */

router.post(
  "/campaigns/:id/send",
  requireAdmin,
  sendCampaign
);


/* ============================================================
   GET NEWSLETTER DELIVERY RECORDS

   GET /api/newsletter/campaigns/:id/deliveries
============================================================ */

router.get(
  "/campaigns/:id/deliveries",
  requireAdmin,
  getCampaignDeliveries
);


/* ============================================================
   INDIVIDUAL NEWSLETTER
============================================================ */


/* ============================================================
   GET NEWSLETTER

   GET /api/newsletter/campaigns/:id
============================================================ */

router.get(
  "/campaigns/:id",
  requireAdmin,
  getCampaign
);


/* ============================================================
   UPDATE NEWSLETTER

   PATCH /api/newsletter/campaigns/:id

   Draft/scheduled/failed newsletters may be edited.

   Published newsletters should be duplicated instead of
   changing the historical copy.
============================================================ */

router.patch(
  "/campaigns/:id",
  requireAdmin,
  updateCampaign
);


/* ============================================================
   DELETE NEWSLETTER

   DELETE /api/newsletter/campaigns/:id

   Supported for:
   - draft
   - scheduled
   - failed
   - sent / published

   A newsletter currently being sent is temporarily protected.

   Deleting a published newsletter removes its CMS/database
   record. It cannot recall emails already received by
   subscribers.
============================================================ */

router.delete(
  "/campaigns/:id",
  requireAdmin,
  deleteCampaign
);


/* ============================================================
   EXPORT ROUTER
============================================================ */

module.exports =
  router;