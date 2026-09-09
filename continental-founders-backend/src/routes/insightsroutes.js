const express = require("express");

const supabase =
  require("../config/supabase");

const router =
  express.Router();


// ============================================================
// HELPER
// FORMAT INSIGHT FOR FRONTEND
// ============================================================

function formatInsight(item) {
  return {
    id:
      item.id,

    slug:
      item.slug,

    category:
      item.category,

    date:
      item.published_at
        ? new Date(
            item.published_at
          ).toLocaleDateString(
            "en-US",
            {
              year: "numeric",
              month: "long",
              day: "numeric",
            }
          )
        : "Content-ready",

    title:
      item.title,

    excerpt:
      item.excerpt,

    image:
      item.image,

    author:
      item.author ||
      "Continental Founders",

    status:
      item.status,

    body:
      Array.isArray(item.body)
        ? item.body
        : [],
  };
}


// ============================================================
// GET ALL PUBLISHED INSIGHTS
//
// GET /api/insights
// ============================================================

router.get(
  "/",

  async (req, res, next) => {

    try {

      const {
        data,
        error,
      } =
        await supabase
          .from("insights")
          .select("*")
          .eq(
            "status",
            "published"
          )
          .order(
            "published_at",
            {
              ascending: false,
              nullsFirst: false,
            }
          )
          .order(
            "created_at",
            {
              ascending: false,
            }
          );


      if (error) {

        console.error(
          "Supabase insights error:",
          error
        );

        return res
          .status(500)
          .json({
            success: false,

            message:
              "Unable to load insights.",
          });

      }


      const insights =
        (data || []).map(
          formatInsight
        );


      return res
        .status(200)
        .json({
          success: true,

          count:
            insights.length,

          insights,
        });

    } catch (error) {

      console.error(
        "Get insights error:",
        error
      );

      next(error);

    }

  }
);


// ============================================================
// GET SINGLE PUBLISHED INSIGHT
//
// GET /api/insights/:slug
// ============================================================

router.get(
  "/:slug",

  async (req, res, next) => {

    try {

      const slug =
        String(
          req.params.slug || ""
        ).trim();


      if (!slug) {

        return res
          .status(400)
          .json({
            success: false,

            message:
              "Insight slug is required.",
          });

      }


      const {
        data,
        error,
      } =
        await supabase
          .from("insights")
          .select("*")
          .eq(
            "slug",
            slug
          )
          .eq(
            "status",
            "published"
          )
          .maybeSingle();


      if (error) {

        console.error(
          "Supabase insight error:",
          error
        );

        return res
          .status(500)
          .json({
            success: false,

            message:
              "Unable to load this insight.",
          });

      }


      if (!data) {

        return res
          .status(404)
          .json({
            success: false,

            message:
              "Insight not found",
          });

      }


      return res
        .status(200)
        .json({
          success: true,

          insight:
            formatInsight(data),
        });

    } catch (error) {

      console.error(
        "Get insight error:",
        error
      );

      next(error);

    }

  }
);


// ============================================================
// EXPORT
// ============================================================

module.exports = router;