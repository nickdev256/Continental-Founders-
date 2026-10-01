const express = require("express");
const multer = require("multer");

const {
  createApplication,
  getApplications,
  getApplicationById,
  getApplicationResume,
  updateApplication,
  getApplicationStats,
} = require("../controllers/cfcvController");

const {
  requireAdmin,
} = require("../middleware/auth");


const router = express.Router();


/* ============================================================
   CFCV RESUME UPLOAD CONFIGURATION

   Files are kept in memory temporarily.

   The controller uploads the file buffer directly to the
   PRIVATE Supabase Storage bucket: cfcv-resumes
============================================================ */

const MAX_RESUME_SIZE =
  5 * 1024 * 1024;


const ALLOWED_RESUME_TYPES =
  new Set([
    "application/pdf",

    "application/msword",

    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ]);


const resumeStorage =
  multer.memoryStorage();


const resumeUpload =
  multer({
    storage:
      resumeStorage,

    limits: {
      fileSize:
        MAX_RESUME_SIZE,

      files:
        1,

      fields:
        20,

      parts:
        25,
    },

    fileFilter: (
      req,
      file,
      callback
    ) => {
      const mimeType =
        String(
          file?.mimetype || ""
        )
          .trim()
          .toLowerCase();


      if (
        !ALLOWED_RESUME_TYPES.has(
          mimeType
        )
      ) {
        const error =
          new Error(
            "Only PDF, DOC and DOCX résumé files are allowed."
          );

        error.code =
          "INVALID_RESUME_TYPE";

        return callback(
          error
        );
      }


      return callback(
        null,
        true
      );
    },
  });


/* ============================================================
   RESUME UPLOAD MIDDLEWARE

   The frontend sends:

   application = JSON string
   resume      = applicant résumé/CV file

   This wrapper converts Multer errors into clean JSON responses
   instead of sending an HTML Express error page.
============================================================ */

function handleResumeUpload(
  req,
  res,
  next
) {
  resumeUpload.single(
    "resume"
  )(
    req,
    res,
    (error) => {
      if (!error) {
        return next();
      }


      console.error(
        "[CFCV] Resume upload middleware error:",
        error
      );


      /* ------------------------------------------------------
         FILE TOO LARGE
      ------------------------------------------------------- */

      if (
        error instanceof
          multer.MulterError &&
        error.code ===
          "LIMIT_FILE_SIZE"
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "Your résumé or CV must not exceed 5 MB.",
          });
      }


      /* ------------------------------------------------------
         TOO MANY FILES
      ------------------------------------------------------- */

      if (
        error instanceof
          multer.MulterError &&
        (
          error.code ===
            "LIMIT_FILE_COUNT" ||
          error.code ===
            "LIMIT_UNEXPECTED_FILE"
        )
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "Please upload only one résumé or CV.",
          });
      }


      /* ------------------------------------------------------
         TOO MANY FORM FIELDS / PARTS
      ------------------------------------------------------- */

      if (
        error instanceof
          multer.MulterError &&
        (
          error.code ===
            "LIMIT_FIELD_COUNT" ||
          error.code ===
            "LIMIT_PART_COUNT"
        )
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "The application contains too many form fields.",
          });
      }


      /* ------------------------------------------------------
         INVALID FILE TYPE
      ------------------------------------------------------- */

      if (
        error.code ===
        "INVALID_RESUME_TYPE"
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              error.message,
          });
      }


      /* ------------------------------------------------------
         UNKNOWN UPLOAD ERROR
      ------------------------------------------------------- */

      return res
        .status(400)
        .json({
          success:
            false,

          message:
            error.message ||
            "Unable to process the résumé or CV upload.",
        });
    }
  );
}


/* ============================================================
   CFCV ROUTES

   PUBLIC

   POST
   /api/cfcv/applications


   ADMIN

   GET
   /api/cfcv/admin/stats

   GET
   /api/cfcv/admin/applications

   GET
   /api/cfcv/admin/applications/:id

   GET
   /api/cfcv/admin/applications/:id/resume

   PATCH
   /api/cfcv/admin/applications/:id
============================================================ */


/* ============================================================
   PUBLIC
   SUBMIT CFCV APPLICATION

   multipart/form-data

   Fields:

   application
   JSON string containing the application form

   resume
   PDF / DOC / DOCX file
============================================================ */

router.post(
  "/applications",

  handleResumeUpload,

  createApplication
);


/* ============================================================
   ADMIN AUTHENTICATION

   Everything below /admin requires an authenticated
   Continental Founders CMS administrator.
============================================================ */

router.use(
  "/admin",

  requireAdmin
);


/* ============================================================
   ADMIN
   APPLICATION STATISTICS

   Keep this route before dynamic application ID routes.
============================================================ */

router.get(
  "/admin/stats",

  getApplicationStats
);


/* ============================================================
   ADMIN
   GET ALL APPLICATIONS

   Supported examples:

   ?status=submitted

   ?status=under_review

   ?admissionsStage=interview

   ?track=Genesis

   ?track=Ascend

   ?track=Horizon

   ?geography=Africa

   ?geography=United%20States

   ?geography=Diaspora

   ?search=John
============================================================ */

router.get(
  "/admin/applications",

  getApplications
);


/* ============================================================
   ADMIN
   SECURELY ACCESS APPLICANT RESUME

   IMPORTANT:

   The résumé bucket remains PRIVATE.

   This route asks the controller to generate a temporary
   signed Supabase Storage URL.

   Example:

   GET
   /api/cfcv/admin/applications/<application-id>/resume
============================================================ */

router.get(
  "/admin/applications/:id/resume",

  getApplicationResume
);


/* ============================================================
   ADMIN
   GET ONE APPLICATION
============================================================ */

router.get(
  "/admin/applications/:id",

  getApplicationById
);


/* ============================================================
   ADMIN
   UPDATE APPLICATION

   Used for:

   - admissions stage
   - founder assessment workflow
   - interview information
   - Genesis / Ascend / Horizon placement
   - cross-continental matching
   - compatibility workflow
   - final admissions decision
   - internal reviewer notes
============================================================ */

router.patch(
  "/admin/applications/:id",

  updateApplication
);


/* ============================================================
   EXPORT
============================================================ */

module.exports = router;