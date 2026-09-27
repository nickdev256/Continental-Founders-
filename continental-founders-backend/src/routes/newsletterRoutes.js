const express = require("express");

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
     "featuredImage": "",
     "content": "Newsletter content...",
     "ctaText": "Learn More",
     "ctaLink": "https://www.continentalfounders.org",
     "audience": "all"
   }
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