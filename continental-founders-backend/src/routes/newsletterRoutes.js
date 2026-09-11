const express =
  require("express");

const {
  subscribe,
  getSubscribers,
} =
  require(
    "../controllers/newsletterController"
  );


const router =
  express.Router();


/* ============================================================
   PUBLIC
============================================================ */

router.post(
  "/subscribe",
  subscribe
);


/* ============================================================
   ADMIN
   Protect this later with your existing auth middleware
============================================================ */

router.get(
  "/subscribers",
  getSubscribers
);


module.exports =
  router;