const express =
  require("express");

const {
  getInsights,
  getPublishedInsights,
  getInsightBySlug,
  createInsight,
  updateInsight,
  deleteInsight,
} =
  require(
    "../controllers/insightsController"
  );

const {
  requireAdmin,
} =
  require(
    "../middleware/auth"
  );


const router =
  express.Router();


/* ============================================================
   PUBLIC
   GET /api/insights/published
============================================================ */

router.get(
  "/published",
  getPublishedInsights
);


/* ============================================================
   ADMIN CMS
   GET /api/insights
============================================================ */

router.get(
  "/",
  requireAdmin,
  getInsights
);


/* ============================================================
   ADMIN CMS
   POST /api/insights
============================================================ */

router.post(
  "/",
  requireAdmin,
  createInsight
);


/* ============================================================
   ADMIN CMS
   PATCH /api/insights/:id
============================================================ */

router.patch(
  "/:id",
  requireAdmin,
  updateInsight
);


/* ============================================================
   ADMIN CMS
   DELETE /api/insights/:id
============================================================ */

router.delete(
  "/:id",
  requireAdmin,
  deleteInsight
);


/* ============================================================
   PUBLIC
   GET /api/insights/:slug

   KEEP THIS LAST
============================================================ */

router.get(
  "/:slug",
  getInsightBySlug
);


module.exports =
  router;