const express = require("express");
const multer = require("multer");

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


const router = express.Router();


/* ============================================================
   FILE UPLOAD CONFIGURATION
============================================================ */

const MAX_IMAGE_SIZE =
  8 * 1024 * 1024;

const MAX_IMAGE_FILES =
  32;


const ALLOWED_IMAGE_TYPES =
  new Set([
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ]);


/* ============================================================
   ALLOWED VENTURE IMAGE FIELDS

   Frontend sends:

   logo
   heroImage
   founderImage_0
   founderImage_1
   founderImage_2
   ...
============================================================ */

function isAllowedVentureImageField(
  fieldName
) {
  if (
    fieldName === "logo" ||
    fieldName === "heroImage"
  ) {
    return true;
  }

  return /^founderImage_\d+$/.test(
    String(fieldName || "")
  );
}


/* ============================================================
   MULTER
============================================================ */

const upload =
  multer({
    storage:
      multer.memoryStorage(),

    limits: {
      fileSize:
        MAX_IMAGE_SIZE,

      files:
        MAX_IMAGE_FILES,
    },

    fileFilter:
      (
        req,
        file,
        callback
      ) => {
        if (
          !isAllowedVentureImageField(
            file.fieldname
          )
        ) {
          const error =
            new multer.MulterError(
              "LIMIT_UNEXPECTED_FILE",
              file.fieldname
            );

          return callback(error);
        }


        if (
          !ALLOWED_IMAGE_TYPES.has(
            file.mimetype
          )
        ) {
          return callback(
            new Error(
              "Only JPG, PNG and WebP images are allowed."
            )
          );
        }


        return callback(
          null,
          true
        );
      },
  });


/* ============================================================
   DYNAMIC IMAGE UPLOAD

   upload.any() is needed because founder fields are dynamic:
   founderImage_0, founderImage_1, ...
============================================================ */

const ventureImageUpload =
  upload.any();


/* ============================================================
   UPLOAD ERROR HANDLER
============================================================ */

function handleVentureUpload(
  req,
  res,
  next
) {
  ventureImageUpload(
    req,
    res,
    (error) => {
      if (!error) {
        const files =
          Array.isArray(req.files)
            ? req.files
            : [];


        for (
          const file of files
        ) {
          if (
            !isAllowedVentureImageField(
              file.fieldname
            )
          ) {
            return res
              .status(400)
              .json({
                success: false,

                message:
                  `Unexpected venture image field: ${file.fieldname}`,
              });
          }
        }


        return next();
      }


      console.error(
        "Venture upload error:",
        {
          message:
            error.message,

          code:
            error.code,

          field:
            error.field,
        }
      );


      if (
        error instanceof
        multer.MulterError
      ) {
        if (
          error.code ===
          "LIMIT_FILE_SIZE"
        ) {
          return res
            .status(400)
            .json({
              success: false,

              message:
                "Each image must be 8 MB or smaller.",
            });
        }


        if (
          error.code ===
          "LIMIT_FILE_COUNT"
        ) {
          return res
            .status(400)
            .json({
              success: false,

              message:
                "Too many venture images were uploaded.",
            });
        }


        if (
          error.code ===
          "LIMIT_UNEXPECTED_FILE"
        ) {
          return res
            .status(400)
            .json({
              success: false,

              message:
                error.field
                  ? `Unexpected venture image field: ${error.field}`
                  : "An unexpected venture image field was uploaded.",
            });
        }


        return res
          .status(400)
          .json({
            success: false,

            message:
              error.message ||
              "Unable to process the venture images.",
          });
      }


      return res
        .status(400)
        .json({
          success: false,

          message:
            error.message ||
            "Unable to process the venture images.",
        });
    }
  );
}


/* ============================================================
   ADMIN DIRECTORY

   GET /api/ventures/directory

   Keep above /:slug
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
  handleVentureUpload,
  createVenture
);


/* ============================================================
   UPDATE VENTURE

   PATCH /api/ventures/:id
============================================================ */

router.patch(
  "/:id",
  requireAdmin,
  handleVentureUpload,
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

   Keep LAST
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