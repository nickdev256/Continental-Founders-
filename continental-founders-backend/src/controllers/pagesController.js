const {
  supabaseAdmin,
} =
  require(
    "../config/supabase"
  );


/* ============================================================
   NORMALIZE PAGE
============================================================ */

function normalizePage(
  page
) {

  if (!page) {
    return null;
  }


  return {

    id:
      page.id,

    slug:
      page.slug,

    title:
      page.title,

    status:
      page.status,

    content:
      page.content || {},

    createdAt:
      page.created_at,

    updatedAt:
      page.updated_at,

  };

}


/* ============================================================
   PUBLIC PUBLISHED PAGE
============================================================ */

async function getPublishedPage(
  req,
  res
) {

  try {

    const {
      slug,
    } =
      req.params;


    if (!slug) {

      return res
        .status(400)
        .json({

          success:
            false,

          message:
            "Page slug is required.",

        });

    }


    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from(
          "site_pages"
        )
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
        "Get published page error:",
        error
      );


      return res
        .status(500)
        .json({

          success:
            false,

          message:
            "Unable to load page.",

        });

    }


    if (!data) {

      return res
        .status(404)
        .json({

          success:
            false,

          message:
            "Page not found.",

        });

    }


    return res.json({

      success:
        true,

      page:
        normalizePage(
          data
        ),

    });

  } catch (
    error
  ) {

    console.error(
      "Published page error:",
      error
    );


    return res
      .status(500)
      .json({

        success:
          false,

        message:
          "Unable to load page.",

      });

  }

}


/* ============================================================
   ADMIN PAGE
============================================================ */

async function getAdminPage(
  req,
  res
) {

  try {

    const {
      slug,
    } =
      req.params;


    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from(
          "site_pages"
        )
        .select("*")
        .eq(
          "slug",
          slug
        )
        .maybeSingle();


    if (error) {

      console.error(
        "Get admin page error:",
        error
      );


      return res
        .status(500)
        .json({

          success:
            false,

          message:
            "Unable to load CMS page.",

        });

    }


    if (!data) {

      return res
        .status(404)
        .json({

          success:
            false,

          message:
            "Page not found.",

        });

    }


    return res.json({

      success:
        true,

      page:
        normalizePage(
          data
        ),

    });

  } catch (
    error
  ) {

    console.error(
      "Admin page error:",
      error
    );


    return res
      .status(500)
      .json({

        success:
          false,

        message:
          "Unable to load CMS page.",

      });

  }

}


/* ============================================================
   UPDATE PAGE
============================================================ */

async function updatePage(
  req,
  res
) {

  try {

    const {
      slug,
    } =
      req.params;


    const {
      title,
      status,
      content,
    } =
      req.body;


    const allowedStatuses = [
      "draft",
      "published",
      "archived",
    ];


    if (
      status &&
      !allowedStatuses.includes(
        status
      )
    ) {

      return res
        .status(400)
        .json({

          success:
            false,

          message:
            "Invalid page status.",

        });

    }


    const updates = {

      updated_at:
        new Date()
          .toISOString(),

    };


    if (
      typeof title ===
      "string"
    ) {

      updates.title =
        title.trim();

    }


    if (status) {

      updates.status =
        status;

    }


    if (
      content &&
      typeof content ===
      "object" &&
      !Array.isArray(content)
    ) {

      updates.content =
        content;

    }


    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from(
          "site_pages"
        )
        .update(
          updates
        )
        .eq(
          "slug",
          slug
        )
        .select("*")
        .maybeSingle();


    if (error) {

      console.error(
        "Update page error:",
        error
      );


      return res
        .status(500)
        .json({

          success:
            false,

          message:
            "Unable to update page.",

        });

    }


    if (!data) {

      return res
        .status(404)
        .json({

          success:
            false,

          message:
            "Page not found.",

        });

    }


    return res.json({

      success:
        true,

      message:
        "Page updated successfully.",

      page:
        normalizePage(
          data
        ),

    });

  } catch (
    error
  ) {

    console.error(
      "Update page error:",
      error
    );


    return res
      .status(500)
      .json({

        success:
          false,

        message:
          "Unable to update page.",

      });

  }

}


module.exports = {

  getPublishedPage,

  getAdminPage,

  updatePage,

};