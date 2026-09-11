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


/* ============================================================
   IMAGE UPLOAD STORAGE

   Multer keeps the selected image in memory.
   eventsController then uploads it to Supabase Storage.
============================================================ */

const storage =
  multer.memoryStorage();


/* ============================================================
   IMAGE FILE FILTER
============================================================ */

function imageFileFilter(
  req,
  file,
  callback
) {

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];


  if (
    !allowedTypes.includes(
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


/* ============================================================
   MULTER CONFIGURATION
============================================================ */

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


/* ============================================================
   EVENT IMAGE UPLOAD MIDDLEWARE

   Expected frontend field:
   formData.append("image", file)
============================================================ */

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
    (
      error
    ) => {

      /* ======================================================
         SUCCESS
      ====================================================== */

      if (
        !error
      ) {

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


      /* ======================================================
         DEBUG
      ====================================================== */

      console.error(
        "Event image upload error:",
        error
      );


      /* ======================================================
         MULTER ERRORS
      ====================================================== */

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
                "The event image must be 5 MB or smaller.",

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
                "Only one event image can be uploaded.",

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
                "Invalid event image field.",

            });

        }


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


      /* ======================================================
         FILE TYPE / GENERAL UPLOAD ERRORS
      ====================================================== */

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


/* ============================================================
   PUBLIC EVENTS

   Only published events appear on the public website.
============================================================ */

router.get(
  "/published",
  getPublishedEvents
);


/* ============================================================
   CMS - GET ALL EVENTS
============================================================ */

router.get(
  "/",
  requireAdmin,
  getEvents
);


/* ============================================================
   CMS - CREATE EVENT

   ORDER MATTERS:

   1. Check admin authentication
   2. Parse multipart form/image
   3. Create event
============================================================ */

router.post(
  "/",
  requireAdmin,
  eventImageUpload,
  createEvent
);


/* ============================================================
   CMS - UPDATE EVENT

   Supports changing:
   - title
   - date
   - location
   - type
   - status
   - description
   - cover image
============================================================ */

router.patch(
  "/:id",
  requireAdmin,
  eventImageUpload,
  updateEvent
);


/* ============================================================
   CMS - DELETE EVENT
============================================================ */

router.delete(
  "/:id",
  requireAdmin,
  deleteEvent
);


/* ============================================================
   PUBLIC - SINGLE EVENT BY SLUG

   KEEP THIS ROUTE LAST.

   Otherwise "/published" could be mistaken for a slug.
============================================================ */

router.get(
  "/:slug",
  getEventBySlug
);


/* ============================================================
   EXPORT
============================================================ */

module.exports =
  router;