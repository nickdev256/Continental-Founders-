const express = require("express");

const {
  getEvents,
  getEventBySlug,
} = require("../controllers/eventsController");

const router = express.Router();

router.get("/", getEvents);
router.get("/:slug", getEventBySlug);

module.exports = router;