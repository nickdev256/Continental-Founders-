const express =
  require("express");

const multer =
  require("multer");


const {
  getEvents,
  getPublishedEvents,
  getEventBySlug,
  createEvent,
  updateEvent,
  deleteEvent,
} =
  require(
    "../controllers/eventsController"
  );


const {
  requireAdmin,
} =
  require(
    "../middleware/auth"
  );


const router =
  express.Router();


// ============================================================
// IMAGE UPLOAD STORAGE
//
// Multer keeps the selected image in memory.
// eventsController uploads the image to Supabase Storage.
// ============================================================

const storage =
  multer.memoryStorage();


// ============================================================
// ALLOWED IMAGE TYPES
// ============================================================

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];


// ============================================================
// IMAGE FILE FILTER
// ============================================================

function imageFileFilter(
  req,
  file,
  callback
) {
  if (
    !ALLOWED_IMAGE_TYPES.includes(
      file.mimetype
    )
  ) {
    return callback(
      new Error(
        "Only JPG, PNG and WebP images are allowed."
      ),
      false
    );
  }

  return callback(
    null,
    true
  );
}


// ============================================================
// MULTER CONFIGURATION
// ============================================================

const upload =
  multer({
    storage,

    fileFilter:
      imageFileFilter,

    limits: {
      fileSize:
        5 *
        1024 *
        1024,

      files:
        1,
    },
  });


// ============================================================
// EVENT IMAGE UPLOAD MIDDLEWARE
//
// Expected frontend field:
//
// formData.append("image", file)
// ============================================================

function eventImageUpload(
  req,
  res,
  next
) {
  const uploadSingleImage =
    upload.single(
      "image"
    );

  uploadSingleImage(
    req,
    res,
    (error) => {

      // ======================================================
      // SUCCESS
      // ======================================================

      if (!error) {
        console.log(
          "EVENT MULTIPART BODY:",
          req.body
        );

        console.log(
          "EVENT MULTIPART IMAGE:",
          req.file
            ? {
                fieldname:
                  req.file.fieldname,

                originalname:
                  req.file.originalname,

                mimetype:
                  req.file.mimetype,

                size:
                  req.file.size,
              }
            : null
        );

        return next();
      }


      // ======================================================
      // DEBUG
      // ======================================================

      console.error(
        "Event image upload error:",
        error
      );


      // ======================================================
      // MULTER ERRORS
      // ======================================================

      if (
        error instanceof
        multer.MulterError
      ) {

        // ------------------------------------------------------
        // FILE TOO LARGE
        // ------------------------------------------------------

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
                "The event image must be 5 MB or smaller.",
            });
        }


        // ------------------------------------------------------
        // TOO MANY FILES
        // ------------------------------------------------------

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
                "Only one event image can be uploaded.",
            });
        }


        // ------------------------------------------------------
        // WRONG FIELD NAME
        // ------------------------------------------------------

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
                'Invalid event image field. Use the field name "image".',
            });
        }


        // ------------------------------------------------------
        // OTHER MULTER ERROR
        // ------------------------------------------------------

        return res
          .status(400)
          .json({
            success:
              false,

            message:
              error.message ||
              "Unable to upload event image.",
          });
      }


      // ======================================================
      // FILE TYPE / GENERAL UPLOAD ERROR
      // ======================================================

      return res
        .status(400)
        .json({
          success:
            false,

          message:
            error?.message ||
            "Invalid event image.",
        });
    }
  );
}


// ============================================================
// PUBLIC ROUTES
// ============================================================


// ============================================================
// GET PUBLISHED EVENTS
//
// GET /api/events/published
//
// Used by:
// src/pages/Events.jsx
// ============================================================

router.get(
  "/published",
  getPublishedEvents
);


// ============================================================
// GET SINGLE PUBLISHED EVENT
//
// GET /api/events/published/:slug
//
// Used by:
// src/pages/EventDetails.jsx
//
// IMPORTANT:
// This must be declared before parameterized CMS routes.
// ============================================================

router.get(
  "/published/:slug",
  getEventBySlug
);


// ============================================================
// ADMIN / CMS ROUTES
// ============================================================


// ============================================================
// GET ALL EVENTS
//
// GET /api/events
//
// Includes draft, published and other CMS-visible events.
// ============================================================

router.get(
  "/",
  requireAdmin,
  getEvents
);


// ============================================================
// CREATE EVENT
//
// POST /api/events
//
// Middleware order:
//
// 1. Verify admin
// 2. Parse multipart form + image
// 3. Controller creates event
// ============================================================

router.post(
  "/",
  requireAdmin,
  eventImageUpload,
  createEvent
);


// ============================================================
// UPDATE EVENT
//
// PATCH /api/events/:id
//
// Supports:
//
// - title
// - slug
// - date
// - location
// - type/category
// - description
// - content
// - status
// - image
// - other controller-supported fields
// ============================================================

router.patch(
  "/:id",
  requireAdmin,
  eventImageUpload,
  updateEvent
);


// ============================================================
// DELETE EVENT
//
// DELETE /api/events/:id
// ============================================================

router.delete(
  "/:id",
  requireAdmin,
  deleteEvent
);


// ============================================================
// EXPORT
// ============================================================

module.exports =
  router;