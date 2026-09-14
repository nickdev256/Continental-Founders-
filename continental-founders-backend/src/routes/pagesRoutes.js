const express =
  require("express");


const {
  getPublishedPage,
  getAdminPage,
  updatePage,
} =
  require(
    "../controllers/pagesController"
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
   PUBLIC PAGE
============================================================ */

router.get(
  "/published/:slug",
  getPublishedPage
);


/* ============================================================
   ADMIN CMS PAGE
============================================================ */

router.get(
  "/admin/:slug",
  requireAdmin,
  getAdminPage
);


router.patch(
  "/admin/:slug",
  requireAdmin,
  updatePage
);


module.exports =
  router;