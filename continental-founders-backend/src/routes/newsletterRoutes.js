const express =
  require("express");

const {
  subscribe,
  getSubscribers,
  updateSubscriber,
  deleteSubscriber,
} =
  require(
    "../controllers/newsletterController"
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

   POST /api/newsletter/subscribe
============================================================ */

router.post(
  "/subscribe",
  subscribe
);


/* ============================================================
   ADMIN - GET SUBSCRIBERS

   GET /api/newsletter/subscribers
============================================================ */

router.get(
  "/subscribers",
  requireAdmin,
  getSubscribers
);


/* ============================================================
   ADMIN - UPDATE SUBSCRIBER

   PATCH /api/newsletter/subscribers/:id
============================================================ */

router.patch(
  "/subscribers/:id",
  requireAdmin,
  updateSubscriber
);


/* ============================================================
   ADMIN - DELETE SUBSCRIBER

   DELETE /api/newsletter/subscribers/:id
============================================================ */

router.delete(
  "/subscribers/:id",
  requireAdmin,
  deleteSubscriber
);


/* ============================================================
   EXPORT
============================================================ */

module.exports =
  router;