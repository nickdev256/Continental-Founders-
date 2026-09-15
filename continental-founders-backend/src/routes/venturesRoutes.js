const express = require("express");

const {
  getPublishedVentures,
  getPublishedVentureBySlug,
  getVenturesDirectory,
  createVenture,
  updateVenture,
  deleteVenture,
} = require("../controllers/venturesController");

const {
  requireAdmin,
} = require("../middleware/auth");


const router =
  express.Router();


/* ============================================================
   ADMIN DIRECTORY

   GET /api/ventures/directory

   IMPORTANT:
   Keep this above /:slug.
============================================================ */

router.get(
  "/directory",
  requireAdmin,
  getVenturesDirectory
);


/* ============================================================
   PUBLIC VENTURES

   GET /api/ventures
============================================================ */

router.get(
  "/",
  getPublishedVentures
);


/* ============================================================
   CREATE VENTURE

   POST /api/ventures
============================================================ */

router.post(
  "/",
  requireAdmin,
  createVenture
);


/* ============================================================
   UPDATE VENTURE

   PATCH /api/ventures/:id
============================================================ */

router.patch(
  "/:id",
  requireAdmin,
  updateVenture
);


/* ============================================================
   DELETE VENTURE

   DELETE /api/ventures/:id
============================================================ */

router.delete(
  "/:id",
  requireAdmin,
  deleteVenture
);


/* ============================================================
   PUBLIC VENTURE DETAILS

   GET /api/ventures/:slug

   IMPORTANT:
   Keep this route LAST so that /directory is never interpreted
   as a venture slug.
============================================================ */

router.get(
  "/:slug",
  getPublishedVentureBySlug
);


/* ============================================================
   EXPORT
============================================================ */

module.exports =
  router;