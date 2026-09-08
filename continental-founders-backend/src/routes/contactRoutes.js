const express = require("express");

const asyncHandler = require("../utils/asyncHandler");

const { requireAdmin } = require("../middleware/auth");

const {
  createContact,
  listContacts,
  updateContactStatus,
} = require("../controllers/contactController");

const router = express.Router();


// Public — website contact form
router.post(
  "/",
  asyncHandler(createContact)
);


// Admin — view submitted inquiries
router.get(
  "/",
  requireAdmin,
  asyncHandler(listContacts)
);


// Admin — change inquiry status
router.patch(
  "/:id/status",
  requireAdmin,
  asyncHandler(updateContactStatus)
);


module.exports = router;