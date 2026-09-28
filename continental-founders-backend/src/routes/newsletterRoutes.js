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
  Images are kept in memory temporarily.

  The controller receives the image as:

  req.file.buffer

  and uploads that buffer directly to Supabase Storage.

  Nothing is permanently written to the backend filesystem.
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

   Converts Multer errors into clean JSON responses instead of
   allowing upload errors to become generic Express errors.
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

   Body can contain:

   {
     "email": "subscriber@example.com"
   }

   OR:

   {
     "token": "unsubscribe-token"
   }
============================================================ */

router.post(
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

          /*
            Featured images can now be uploaded
            through the protected backend route.
          */
          imageUpload:
            true,

          /*
            Change this to true only after
            actual campaign email delivery
            has been connected.
          */
          emailDelivery:
            false,
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

   Example successful response:

   {
     "success": true,
     "message": "Newsletter image uploaded successfully.",
     "url": "https://...",
     "publicUrl": "https://...",
     "path": "campaigns/2026/..."
   }
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

   Example body:

   {
     "title": "Continental Founders Update",
     "subject": "Latest from Continental Founders",
     "previewText": "Founder stories, opportunities and updates.",
     "featuredImage": "https://public-image-url...",
     "content": "Newsletter content...",
     "ctaText": "Learn More",
     "ctaLink": "https://www.continentalfounders.org",
     "audience": "all"
   }

   NOTE:

   featuredImage is no longer expected to be entered manually
   by the administrator.

   The frontend first uploads the selected image to:

   POST /api/newsletter/admin/upload-image

   The returned public URL is then stored in featuredImage.
============================================================ */

router.post(
  "/campaigns",
  requireAdmin,
  createCampaign
);


/* ============================================================
   CAMPAIGN ACTION ROUTES

   These routes intentionally appear before the general
   /campaigns/:id handlers for clear route organization.
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

   Example body:

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

   Example body:

   {
     "email": "admin@example.com"
   }

   IMPORTANT:

   The current controller validates the campaign but does not
   claim a successful send until the email provider is connected.
============================================================ */

router.post(
  "/campaigns/:id/test",
  requireAdmin,
  sendTestCampaign
);


/* ============================================================
   SEND CAMPAIGN

   POST /api/newsletter/campaigns/:id/send

   IMPORTANT:

   The current controller does not mark the campaign as sent
   until actual email delivery is implemented.
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