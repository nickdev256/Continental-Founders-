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


const router =
  express.Router();


/* ============================================================
   FILE UPLOAD CONFIGURATION
============================================================ */

const ALLOWED_IMAGE_TYPES =
  new Set([
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ]);


const upload =
  multer({
    storage:
      multer.memoryStorage(),

    limits: {
      fileSize:
        5 * 1024 * 1024,

      files:
        32,
    },

    fileFilter:
      (
        req,
        file,
        callback
      ) => {

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
   VENTURE IMAGE FIELDS

   logo
   heroImage
   founderImages
============================================================ */

const ventureImageUpload =
  upload.fields([
    {
      name:
        "logo",

      maxCount:
        1,
    },

    {
      name:
        "heroImage",

      maxCount:
        1,
    },

    {
      name:
        "founderImages",

      maxCount:
        30,
    },
  ]);


/* ============================================================
   MULTER ERROR HANDLER
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

        return next();

      }


      console.error(
        "Venture upload error:",
        error
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
              success:
                false,

              message:
                "Each image must be 5 MB or smaller.",
            });

        }


        if (
          error.code ===
          "LIMIT_FILE_COUNT"
        ) {

          return res
            .status(400)
            .json({
              success:
                false,

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
              success:
                false,

              message:
                "An unexpected venture image field was uploaded.",
            });

        }

      }


      return res
        .status(400)
        .json({
          success:
            false,

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

   IMPORTANT:
   Keep this LAST.
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