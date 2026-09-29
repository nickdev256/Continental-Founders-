const express = require("express");
const multer = require("multer");

const {
  getPublishedGallery,
  getAdminGallery,
  getGalleryItem,
  createGalleryItem,
  updateGalleryItem,
  updateGalleryStatus,
  deleteGalleryItem,
  registerGalleryView,
  registerGalleryDownload,
} = require("../controllers/galleryController");

const {
  requireAdmin,
} = require("../middleware/auth");


const router = express.Router();


/* ============================================================
   MULTER CONFIGURATION

   Images stay in memory temporarily and are then uploaded
   by galleryController.js to Supabase Storage.
============================================================ */

const storage =
  multer.memoryStorage();


const allowedMimeTypes =
  new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
  ]);


const fileFilter = (
  req,
  file,
  callback
) => {
  if (
    !allowedMimeTypes.has(
      file.mimetype
    )
  ) {
    const error =
      new Error(
        "Only JPG, PNG and WebP images are supported."
      );

    error.statusCode = 400;

    return callback(
      error,
      false
    );
  }

  return callback(
    null,
    true
  );
};


const upload =
  multer({
    storage,

    fileFilter,

    limits: {
      files: 1,

      fileSize:
        10 *
        1024 *
        1024,
    },
  });


/* ============================================================
   MULTER ERROR HANDLER
============================================================ */

function uploadSingleImage(
  req,
  res,
  next
) {
  upload.single("image")(
    req,
    res,
    (error) => {
      if (!error) {
        return next();
      }


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
                "The image is too large. Maximum size is 10 MB.",
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
                "Only one image can be uploaded at a time.",
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
                'The image field must be named "image".',
            });
        }


        return res
          .status(400)
          .json({
            success: false,

            message:
              error.message ||
              "Unable to process the uploaded image.",
          });
      }


      return res
        .status(
          error?.statusCode ||
          400
        )
        .json({
          success: false,

          message:
            error?.message ||
            "Unable to process the uploaded image.",
        });
    }
  );
}


/* ============================================================
   PUBLIC ROUTES
============================================================ */

/*
 * Public Gallery
 *
 * GET /api/gallery/published
 *
 * Returns only published gallery items.
 */

router.get(
  "/published",
  getPublishedGallery
);


/*
 * Register photo view
 *
 * POST /api/gallery/:id/view
 */

router.post(
  "/:id/view",
  registerGalleryView
);


/*
 * Register photo download
 *
 * POST /api/gallery/:id/download
 */

router.post(
  "/:id/download",
  registerGalleryDownload
);


/* ============================================================
   ADMIN ROUTES
============================================================ */

/*
 * Get all gallery items.
 *
 * GET /api/gallery/admin
 */

router.get(
  "/admin",
  requireAdmin,
  getAdminGallery
);


/*
 * Get one gallery item.
 *
 * GET /api/gallery/admin/:id
 */

router.get(
  "/admin/:id",
  requireAdmin,
  getGalleryItem
);


/*
 * Upload/create a gallery item.
 *
 * POST /api/gallery/admin
 *
 * multipart/form-data
 *
 * image      -> required
 * title      -> required
 * category   -> required
 * caption    -> optional
 * altText    -> optional
 * eventDate  -> optional
 * status     -> draft | published
 */

router.post(
  "/admin",
  requireAdmin,
  uploadSingleImage,
  createGalleryItem
);


/*
 * Update gallery metadata.
 *
 * PATCH /api/gallery/admin/:id
 *
 * This endpoint updates metadata only.
 */

router.patch(
  "/admin/:id",
  requireAdmin,
  updateGalleryItem
);


/*
 * Publish / unpublish.
 *
 * PATCH /api/gallery/admin/:id/status
 *
 * JSON:
 * {
 *   "status": "published"
 * }
 *
 * or:
 *
 * {
 *   "status": "draft"
 * }
 */

router.patch(
  "/admin/:id/status",
  requireAdmin,
  updateGalleryStatus
);


/*
 * Delete gallery item and its Supabase image.
 *
 * DELETE /api/gallery/admin/:id
 */

router.delete(
  "/admin/:id",
  requireAdmin,
  deleteGalleryItem
);


/* ============================================================
   ROUTER
============================================================ */

module.exports =
  router;