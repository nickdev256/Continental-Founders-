const express = require("express");
const multer = require("multer");

const {
  getInsights,
  getPublishedInsights,
  getInsightBySlug,
  createInsight,
  updateInsight,
  deleteInsight,
} = require("../controllers/insightsController");

const {
  requireAdmin,
} = require("../middleware/auth");


const router = express.Router();


/* ============================================================
   INSIGHT IMAGE UPLOAD
============================================================ */

const upload = multer({

  storage:
    multer.memoryStorage(),

  limits: {
    fileSize:
      5 * 1024 * 1024,
  },

  fileFilter: (
    req,
    file,
    callback
  ) => {

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
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
        )
      );

    }


    callback(
      null,
      true
    );

  },

});


/* ============================================================
   MULTER MIDDLEWARE
============================================================ */

function insightImageUpload(
  req,
  res,
  next
) {

  upload.single(
    "image"
  )(
    req,
    res,
    (
      error
    ) => {

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
                "Insight image must be 5MB or smaller.",
            });

        }


        return res
          .status(400)
          .json({
            success: false,
            message:
              "Unable to process the insight image.",
          });

      }


      return res
        .status(400)
        .json({
          success: false,
          message:
            error?.message ||
            "Unable to upload insight image.",
        });

    }
  );

}


/* ============================================================
   PUBLIC
   GET /api/insights/published
============================================================ */

router.get(
  "/published",
  getPublishedInsights
);


/* ============================================================
   ADMIN
   GET /api/insights
============================================================ */

router.get(
  "/",
  requireAdmin,
  getInsights
);


/* ============================================================
   ADMIN
   POST /api/insights

   Accepts:
   multipart/form-data

   image field:
   "image"
============================================================ */

router.post(
  "/",
  requireAdmin,
  insightImageUpload,
  createInsight
);


/* ============================================================
   ADMIN
   PATCH /api/insights/:id

   Supports replacing/removing image
============================================================ */

router.patch(
  "/:id",
  requireAdmin,
  insightImageUpload,
  updateInsight
);


/* ============================================================
   ADMIN
   DELETE /api/insights/:id
============================================================ */

router.delete(
  "/:id",
  requireAdmin,
  deleteInsight
);


/* ============================================================
   PUBLIC
   GET /api/insights/:slug

   IMPORTANT:
   KEEP THIS ROUTE LAST
============================================================ */

router.get(
  "/:slug",
  getInsightBySlug
);


module.exports = router;