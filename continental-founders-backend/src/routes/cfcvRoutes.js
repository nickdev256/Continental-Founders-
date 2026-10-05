const express = require("express");
const multer = require("multer");
const path = require("node:path");

const {
  createApplication,
  getApplications,
  getApplicationById,
  getApplicationResume,
  updateApplication,
  getApplicationStats,
  getApplicationHistory,
  getApplicationEmails,
  previewApplicationEmail,
} = require("../controllers/cfcvController");

const {
  requireAdmin,
} = require("../middleware/auth");

const router = express.Router();

// ============================================================
// RÉSUMÉ CONFIGURATION
// ============================================================

const MAX_RESUME_SIZE = 5 * 1024 * 1024;

const RESUME_TYPES = {
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx":
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

// ============================================================
// ASYNC CONTROLLER ERROR HANDLING
// ============================================================

function asyncHandler(handler) {
  return (req, res, next) => {
    Promise.resolve()
      .then(() => handler(req, res, next))
      .catch(next);
  };
}

// ============================================================
// CONSISTENT UPLOAD ERRORS
// ============================================================

function uploadError(res, message, field = "") {
  return res.status(400).json({
    success: false,
    message,

    ...(field
      ? {
          field,
          fields: [field],
        }
      : {}),
  });
}

// ============================================================
// MEMORY UPLOAD
//
// Controller must validate file signatures before uploading
// to the private résumé bucket.
// ============================================================

const resumeUpload = multer({
  storage: multer.memoryStorage(),

  limits: {
    fileSize: MAX_RESUME_SIZE,
    files: 1,
    fields: 2,
    parts: 3,
    fieldSize: 256 * 1024,
    fieldNameSize: 100,
  },

  fileFilter(req, file, callback) {
    const extension = path
      .extname(file.originalname || "")
      .toLowerCase();

    const mimeType = String(file.mimetype || "")
      .trim()
      .toLowerCase();

    if (
      !RESUME_TYPES[extension] ||
      mimeType !== RESUME_TYPES[extension]
    ) {
      const error = new Error(
        "Only PDF, DOC and DOCX résumé files are allowed."
      );

      error.code = "INVALID_RESUME_TYPE";

      return callback(error);
    }

    return callback(null, true);
  },
});

// ============================================================
// REQUIRE MULTIPART FORM DATA
//
// application   JSON string
// submissionKey UUID string
// resume        PDF, DOC or DOCX file
// ============================================================

function requireMultipart(req, res, next) {
  if (!req.is("multipart/form-data")) {
    return res.status(415).json({
      success: false,
      message:
        "Submit the application using multipart/form-data.",
    });
  }

  return next();
}

// ============================================================
// HANDLE UPLOAD ERRORS
// ============================================================

function handleResumeUpload(req, res, next) {
  resumeUpload.single("resume")(req, res, (error) => {
    if (!error) {
      return next();
    }

    if (error.code === "INVALID_RESUME_TYPE") {
      return uploadError(res, error.message, "resume");
    }

    if (error instanceof multer.MulterError) {
      switch (error.code) {
        case "LIMIT_FILE_SIZE":
          return uploadError(
            res,
            "Your résumé or CV must not exceed 5 MB.",
            "resume"
          );

        case "LIMIT_FILE_COUNT":
        case "LIMIT_UNEXPECTED_FILE":
          return uploadError(
            res,
            "Upload one résumé using the resume field.",
            "resume"
          );

        case "LIMIT_FIELD_COUNT":
        case "LIMIT_PART_COUNT":
          return uploadError(
            res,
            "Submit only application, submissionKey and one résumé."
          );

        case "LIMIT_FIELD_VALUE":
          return uploadError(
            res,
            "The application form data is too large.",
            error.field
          );

        case "LIMIT_FIELD_KEY":
          return uploadError(
            res,
            "The application contains an invalid field name."
          );

        default:
          return uploadError(
            res,
            "Unable to process the application upload."
          );
      }
    }

    return uploadError(
      res,
      "Unable to process the application upload. Check your file and try again."
    );
  });
}

// ============================================================
// VALIDATE MULTIPART FIELDS
// ============================================================

function validateSubmissionParts(req, res, next) {
  const body = req.body || {};

  const allowedFields = new Set([
    "application",
    "submissionKey",
  ]);

  if (
    Object.keys(body).some(
      (key) => !allowedFields.has(key)
    )
  ) {
    return uploadError(
      res,
      "Only application and submissionKey text fields are allowed."
    );
  }

  for (const field of allowedFields) {
    if (
      typeof body[field] !== "string" ||
      !body[field].trim()
    ) {
      return uploadError(
        res,
        `Provide one non-empty ${field} field.`,
        field
      );
    }
  }

  if (!req.file || !req.file.size) {
    return uploadError(
      res,
      "Choose a non-empty résumé file.",
      "resume"
    );
  }

  // createApplication remains responsible for:
  // - JSON parsing and application schema validation
  // - submissionKey UUID validation
  // - résumé signature validation
  // - same-key retry handling and payload conflicts

  return next();
}

// ============================================================
// PREVENT CACHING
// ============================================================

function noStore(req, res, next) {
  res.setHeader("Cache-Control", "no-store");

  return next();
}

// ============================================================
// PUBLIC: SUBMIT APPLICATION
//
// POST /api/cfcv/applications
//
// Public submission rate limiting remains in app.js.
// ============================================================

router.post(
  "/applications",
  noStore,
  requireMultipart,
  handleResumeUpload,
  validateSubmissionParts,
  asyncHandler(createApplication)
);

// ============================================================
// ADMIN AUTHENTICATION
//
// Set no-store before authentication so authentication
// errors also receive the header.
// ============================================================

router.use(
  "/admin",
  noStore,
  requireAdmin
);

// ============================================================
// ADMIN: STATISTICS
// ============================================================

router.get(
  "/admin/stats",
  asyncHandler(getApplicationStats)
);

// ============================================================
// ADMIN: APPLICATION LIST
// ============================================================

router.get(
  "/admin/applications",
  asyncHandler(getApplications)
);

// ============================================================
// ADMIN: PRIVATE RÉSUMÉ LINK
// ============================================================

router.get(
  "/admin/applications/:id/resume",
  asyncHandler(getApplicationResume)
);

// ============================================================
// ADMIN: REVIEW HISTORY
// ============================================================

router.get(
  "/admin/applications/:id/history",
  asyncHandler(getApplicationHistory)
);

// ============================================================
// ADMIN: EMAIL QUEUE STATUS
// ============================================================

router.get(
  "/admin/applications/:id/emails",
  asyncHandler(getApplicationEmails)
);

// ============================================================
// ADMIN: PREVIEW EMAIL
//
// Does not save a review or send an email.
// ============================================================

router.post(
  "/admin/applications/:id/email-preview",
  asyncHandler(previewApplicationEmail)
);

// ============================================================
// ADMIN: APPLICATION DETAILS
// ============================================================

router.get(
  "/admin/applications/:id",
  asyncHandler(getApplicationById)
);

// ============================================================
// ADMIN: SAVE REVIEW
//
// Controller enforces expectedVersion and handles
// notifyApplicant and applicantMessage.
// ============================================================

router.patch(
  "/admin/applications/:id",
  asyncHandler(updateApplication)
);

// ============================================================
// EXPORT
// ============================================================

module.exports = router;