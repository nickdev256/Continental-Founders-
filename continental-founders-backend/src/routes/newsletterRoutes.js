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
     CAMPAIGN ADMINISTRATION
  ========================================================== */

  getCampaigns,
  getCampaign,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  duplicateCampaign,

  /* ==========================================================
     AUDIENCE
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


const router = express.Router();


/* ============================================================
   NEWSLETTER IMAGE UPLOAD CONFIGURATION
============================================================ */

/*
  Images are temporarily kept in memory.

  The controller receives the uploaded image as:

  req.file.buffer

  and uploads the buffer directly to Supabase Storage.

  Nothing is permanently written to the Render/backend
  filesystem.
*/

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

      files:
        1,
    },

    fileFilter: (
      req,
      file,
      callback
    ) => {
      const mimeType =
        String(
          file?.mimetype || ""
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

   Converts Multer errors into clean JSON responses.
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
                "Please upload only one newsletter image at a time.",
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
        "Newsletter image upload middleware error:",
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
   GET  /api/newsletter/unsubscribe

   POST can receive:

   {
     "email": "subscriber@example.com"
   }

   OR:

   {
     "token": "unsubscribe-token"
   }

   GET is used by the unsubscribe link included in emails:

   /api/newsletter/unsubscribe?token=...
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
   ADMIN UTILITY ROUTES
============================================================ */


/* ============================================================
   NEWSLETTER SERVICE STATUS

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

        features: {
          subscribers:
            true,

          campaigns:
            true,

          scheduling:
            true,

          analytics:
            true,

          deliveryRecords:
            true,

          imageUpload:
            true,

          /*
            The newsletter controller is now connected
            to the existing Resend email utility.
          */

          emailDelivery:
            Boolean(process.env.RESEND_API_KEY && process.env.EMAIL_FROM),
        },

        message:
          "Newsletter API is available.",
      });
  }
);


/* ============================================================
   NEWSLETTER IMAGE UPLOAD

   POST /api/newsletter/admin/upload-image

   Authentication:
   Admin authentication is required.

   Content-Type:
   multipart/form-data

   Form field:
   image

   Supported formats:
   JPG / JPEG
   PNG
   WEBP

   Maximum file size:
   5 MB
============================================================ */

router.post(
  "/admin/upload-image",
  requireAdmin,
  handleNewsletterImageUpload,
  uploadNewsletterImage
);


/* ============================================================
   NEWSLETTER ANALYTICS

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
   GET ALL SUBSCRIBERS

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

   Example:

   {
     "status": "subscribed"
   }

   OR:

   {
     "status": "unsubscribed"
   }
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
   CAMPAIGN COLLECTION ROUTES
============================================================ */


/* ============================================================
   GET ALL CAMPAIGNS

   GET /api/newsletter/campaigns
============================================================ */

router.get(
  "/campaigns",
  requireAdmin,
  getCampaigns
);


/* ============================================================
   CREATE CAMPAIGN / SAVE DRAFT

   POST /api/newsletter/campaigns

   Example:

   {
     "title": "Continental Founders Update",
     "subject": "Latest from Continental Founders",
     "previewText": "Founder stories and opportunities.",
     "featuredImage": "https://public-image-url...",
     "content": "Newsletter content...",
     "ctaText": "Learn More",
     "ctaLink": "https://www.continentalfounders.org",
     "audience": "all"
   }

   featuredImage is normally populated automatically after
   uploading the selected image through:

   POST /api/newsletter/admin/upload-image
============================================================ */

router.post(
  "/campaigns",
  requireAdmin,
  createCampaign
);


/* ============================================================
   CAMPAIGN ACTION ROUTES

   These routes appear before /campaigns/:id for clear route
   organization.
============================================================ */


/* ============================================================
   DUPLICATE CAMPAIGN

   POST /api/newsletter/campaigns/:id/duplicate
============================================================ */

router.post(
  "/campaigns/:id/duplicate",
  requireAdmin,
  duplicateCampaign
);


/* ============================================================
   GET CAMPAIGN RECIPIENT COUNT

   GET /api/newsletter/campaigns/:id/recipients
============================================================ */

router.get(
  "/campaigns/:id/recipients",
  requireAdmin,
  getCampaignRecipientCount
);


/* ============================================================
   SCHEDULE CAMPAIGN

   POST /api/newsletter/campaigns/:id/schedule

   Example:

   {
     "scheduledAt": "2026-10-01T09:00:00+03:00"
   }
============================================================ */

router.post(
  "/campaigns/:id/schedule",
  requireAdmin,
  scheduleCampaign
);


/* ============================================================
   CANCEL SCHEDULED CAMPAIGN

   POST /api/newsletter/campaigns/:id/cancel-schedule
============================================================ */

router.post(
  "/campaigns/:id/cancel-schedule",
  requireAdmin,
  cancelScheduledCampaign
);


/* ============================================================
   SEND TEST NEWSLETTER

   POST /api/newsletter/campaigns/:id/test

   Example:

   {
     "email": "admin@example.com"
   }

   The controller sends the test newsletter through Resend.
============================================================ */

router.post(
  "/campaigns/:id/test",
  requireAdmin,
  sendTestCampaign
);


/* ============================================================
   SEND CAMPAIGN

   POST /api/newsletter/campaigns/:id/send

   The controller loads active subscribers, sends individual
   emails through Resend, records the attempts, and updates
   campaign statistics.
============================================================ */

router.post(
  "/campaigns/:id/send",
  requireAdmin,
  sendCampaign
);


/* ============================================================
   GET CAMPAIGN DELIVERIES

   GET /api/newsletter/campaigns/:id/deliveries
============================================================ */

router.get(
  "/campaigns/:id/deliveries",
  requireAdmin,
  getCampaignDeliveries
);


/* ============================================================
   INDIVIDUAL CAMPAIGN ROUTES
============================================================ */


/* ============================================================
   GET ONE CAMPAIGN

   GET /api/newsletter/campaigns/:id
============================================================ */

router.get(
  "/campaigns/:id",
  requireAdmin,
  getCampaign
);


/* ============================================================
   UPDATE CAMPAIGN

   PATCH /api/newsletter/campaigns/:id
============================================================ */

router.patch(
  "/campaigns/:id",
  requireAdmin,
  updateCampaign
);


/* ============================================================
   DELETE CAMPAIGN

   DELETE /api/newsletter/campaigns/:id
============================================================ */

router.delete(
  "/campaigns/:id",
  requireAdmin,
  deleteCampaign
);


/* ============================================================
   EXPORT ROUTER
============================================================ */

module.exports = router;