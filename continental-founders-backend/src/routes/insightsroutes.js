const express = require("express");

const {
  getInsights,
  getPublishedInsights,
  getInsightBySlug,
  createInsight,
  updateInsight,
  deleteInsight,
} = require("../controllers/insightsController");

const {
  requireAdmin,
} = require("../middleware/auth");


const router = express.Router();


// ============================================================
// PUBLIC - PUBLISHED INSIGHTS
// GET /api/insights/published
// ============================================================

router.get(
  "/published",
  getPublishedInsights
);


// ============================================================
// ADMIN - ALL INSIGHTS
// GET /api/insights
// ============================================================

router.get(
  "/",
  requireAdmin,
  getInsights
);


// ============================================================
// ADMIN - CREATE INSIGHT
// POST /api/insights
// ============================================================

router.post(
  "/",
  requireAdmin,
  createInsight
);


// ============================================================
// ADMIN - UPDATE INSIGHT
// PATCH /api/insights/:id
// ============================================================

router.patch(
  "/:id",
  requireAdmin,
  updateInsight
);


// ============================================================
// ADMIN - DELETE INSIGHT
// DELETE /api/insights/:id
// ============================================================

router.delete(
  "/:id",
  requireAdmin,
  deleteInsight
);


// ============================================================
// PUBLIC - SINGLE PUBLISHED INSIGHT
// GET /api/insights/:slug
//
// IMPORTANT:
// KEEP THIS ROUTE LAST.
// ============================================================

router.get(
  "/:slug",
  getInsightBySlug
);


module.exports = router;