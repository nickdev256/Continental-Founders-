const express = require("express");
const multer = require("multer");
const path = require("node:path");

const {
  createApplication,
  getApplications,
  getApplicationById,
  getApplicationResume,
  updateApplication,
  deleteApplication,
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
  if (typeof handler !== "function") {
    throw new TypeError(
      "A CFCV controller export is missing. Install the complete updated cfcvController.js."
    );
  }

  return (req, res, next) => {
    return Promise.resolve()
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
// The controller validates file signatures before uploading
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

    const mimeType = String(
      file.mimetype || ""
    )
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
  resumeUpload.single("resume")(
    req,
    res,
    (error) => {
      if (!error) {
        return next();
      }

      if (
        error.code === "INVALID_RESUME_TYPE"
      ) {
        return uploadError(
          res,
          error.message,
          "resume"
        );
      }

      if (
        error instanceof multer.MulterError
      ) {
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
    }
  );
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

  if (
    !req.file ||
    !req.file.size
  ) {
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
  res.setHeader(
    "Cache-Control",
    "no-store, private"
  );

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
// Applies to every /admin endpoint below, including DELETE.
//
// Set no-store before authentication so authentication errors
// also receive the header.
// ============================================================

router.use(
  "/admin",
  noStore,
  requireAdmin
);

// ============================================================
// ADMIN: STATISTICS
//
// GET /api/cfcv/admin/stats
// ============================================================

router.get(
  "/admin/stats",
  asyncHandler(getApplicationStats)
);

// ============================================================
// ADMIN: APPLICATION LIST
//
// GET /api/cfcv/admin/applications
// ============================================================

router.get(
  "/admin/applications",
  asyncHandler(getApplications)
);

// ============================================================
// ADMIN: PRIVATE RÉSUMÉ LINKS
//
// View:
// GET /api/cfcv/admin/applications/:id/resume?mode=view
//
// Download:
// GET /api/cfcv/admin/applications/:id/resume?mode=download
//
// The updated controller returns:
// - url
// - signedUrl
// - viewUrl
// - downloadUrl
// - fileName
// - mimeType
// - previewSupported
// - expiresIn
//
// PDF files support browser preview.
// DOC and DOCX files can be downloaded.
//
// These links expire after 300 seconds.
// ============================================================

router.get(
  "/admin/applications/:id/resume",
  asyncHandler(getApplicationResume)
);

// ============================================================
// ADMIN: REVIEW HISTORY
//
// GET /api/cfcv/admin/applications/:id/history
// ============================================================

router.get(
  "/admin/applications/:id/history",
  asyncHandler(getApplicationHistory)
);

// ============================================================
// ADMIN: EMAIL QUEUE STATUS
//
// GET /api/cfcv/admin/applications/:id/emails
// ============================================================

router.get(
  "/admin/applications/:id/emails",
  asyncHandler(getApplicationEmails)
);

// ============================================================
// ADMIN: PREVIEW EMAIL
//
// POST /api/cfcv/admin/applications/:id/email-preview
//
// Does not save a review or send an email.
// ============================================================

router.post(
  "/admin/applications/:id/email-preview",
  asyncHandler(previewApplicationEmail)
);

// ============================================================
// ADMIN: APPLICATION DETAILS
//
// GET /api/cfcv/admin/applications/:id
// ============================================================

router.get(
  "/admin/applications/:id",
  asyncHandler(getApplicationById)
);

// ============================================================
// ADMIN: SAVE REVIEW
//
// PATCH /api/cfcv/admin/applications/:id
//
// The JSON body includes expectedVersion and review fields.
//
// The updated controller and SQL function queue applicant
// feedback whenever a review is saved.
//
// applicantMessage can contain custom feedback.
//
// Internal notes are not automatically included in feedback.
// ============================================================

router.patch(
  "/admin/applications/:id",
  asyncHandler(updateApplication)
);

// ============================================================
// ADMIN: DELETE APPLICATION
//
// DELETE /api/cfcv/admin/applications/:id
//
// Required JSON body:
//
// {
//   "expectedVersion": 1,
//   "confirmationReference": "THE-EXACT-APPLICATION-REFERENCE"
// }
//
// Use the selected application's current version and reference.
//
// The controller validates both values before deletion.
// ============================================================

router.delete(
  "/admin/applications/:id",
  asyncHandler(deleteApplication)
);

// ============================================================
// EXPORT
// ============================================================

module.exports = router;