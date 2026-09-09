const express = require("express");
const supabase = require("../config/supabase");

const router = express.Router();


/* ============================================================
   HELPER
   BUILD UNIVERSITY PAGE OBJECT
============================================================ */

function buildUniversityPage(rows = []) {
  return rows.reduce(
    (page, section) => {
      if (
        !section ||
        !section.section_key
      ) {
        return page;
      }

      page[section.section_key] =
        section.content || {};

      return page;
    },
    {}
  );
}


/* ============================================================
   GET UNIVERSITY PAGE CONTENT

   GET /api/universities
============================================================ */

router.get(
  "/",
  async (req, res, next) => {
    try {
      const {
        data,
        error,
      } = await supabase
        .from(
          "university_page_content"
        )
        .select(
          "section_key, content, updated_at"
        )
        .order(
          "created_at",
          {
            ascending: true,
          }
        );


      /* ======================================================
         SUPABASE ERROR
      ====================================================== */

      if (error) {
        console.error(
          "University page content error:",
          error
        );

        return res
          .status(500)
          .json({
            success: false,

            message:
              "Unable to load university page content.",
          });
      }


      /* ======================================================
         BUILD PAGE
      ====================================================== */

      const page =
        buildUniversityPage(
          data || []
        );


      /* ======================================================
         RESPONSE
      ====================================================== */

      return res
        .status(200)
        .json({
          success: true,

          count:
            data?.length || 0,

          page,
        });

    } catch (error) {
      console.error(
        "Get university page error:",
        error
      );

      next(error);
    }
  }
);


/* ============================================================
   EXPORT
============================================================ */

module.exports = router;