const {
  supabaseAdmin,
} =
  require(
    "../config/supabase"
  );

const {
  notifySubscribers,
} =
  require(
    "../services/siteNotificationService"
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
   GET PAGE SUMMARY

   site_pages keeps most CMS content inside the JSON content
   column, so this safely looks for common description fields.
============================================================ */

function getPageSummary(
  page
) {

  const content =
    page?.content &&
    typeof page.content ===
      "object" &&
    !Array.isArray(
      page.content
    )
      ? page.content
      : {};


  const candidates = [

    content.summary,

    content.excerpt,

    content.description,

    content.heroDescription,

    content.heroText,

    content.introduction,

    content.subtitle,

    content.subheading,

  ];


  const summary =
    candidates.find(
      (
        value
      ) =>
        typeof value ===
          "string" &&
        value.trim()
    );


  if (!summary) {
    return "";
  }


  return summary
    .trim()
    .slice(
      0,
      500
    );

}


/* ============================================================
   GET PAGE IMAGE

   Safely checks common image fields inside the content JSON.
============================================================ */

function getPageImage(
  page
) {

  const content =
    page?.content &&
    typeof page.content ===
      "object" &&
    !Array.isArray(
      page.content
    )
      ? page.content
      : {};


  const candidates = [

    content.imageUrl,

    content.image_url,

    content.heroImage,

    content.heroImageUrl,

    content.featuredImage,

    content.featuredImageUrl,

  ];


  const image =
    candidates.find(
      (
        value
      ) =>
        typeof value ===
          "string" &&
        value.trim()
    );


  return image
    ? image.trim()
    : null;

}


/* ============================================================
   GET PUBLIC PAGE PATH

   Converts CMS slugs to their real website URLs.
============================================================ */

function getPublicPagePath(
  slug
) {

  const pagePaths = {

    "us-africa-trade-network":
      "/partners/us-africa-trade-network",

    "corporate-partners":
      "/partners/corporate",

    "government-development":
      "/partners/government-development",

    "about":
      "/about",

    "our-model":
      "/our-model",

    "strategic-partners":
      "/strategic-partners",

    "events":
      "/events",

    "insights":
      "/insights",

    "contact":
      "/contact",

  };


  return (
    pagePaths[
      slug
    ] ||
    `/${slug}`
  );

}


/* ============================================================
   SEND PAGE PUBLICATION NOTIFICATION
============================================================ */

function sendPageNotification(
  page
) {

  if (
    !page ||
    page.status !==
      "published"
  ) {

    return;

  }


  notifySubscribers({

    contentType:
      "page",

    contentId:
      page.id,

    title:
      page.title,

    summary:
      getPageSummary(
        page
      ),

    path:
      getPublicPagePath(
        page.slug
      ),

    imageUrl:
      getPageImage(
        page
      ),

    notificationType:
      "published",

  })
    .then(
      (
        result
      ) => {

        if (
          result?.skipped
        ) {

          console.log(
            "Page newsletter notification skipped:",
            {
              page:
                page.slug,

              reason:
                result.reason,
            }
          );


          return;

        }


        console.log(
          "Page newsletter notification processed:",
          {

            page:
              page.slug,

            sentCount:
              result?.sentCount ||
              0,

            failedCount:
              result?.failedCount ||
              0,

          }
        );

      }
    )
    .catch(
      (
        error
      ) => {

        console.error(
          "Page newsletter notification error:",
          error
        );

      }
    );

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
      title,
      status,
      content,
    } =
      req.body;


    /* ========================================================
       VALIDATE STATUS
    ======================================================== */

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


    /* ========================================================
       FIND EXISTING PAGE

       We need the old status so we can detect:
       draft -> published
    ======================================================== */

    const {
      data:
        existingPage,

      error:
        existingError,
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


    if (
      existingError
    ) {

      console.error(
        "Find page before update error:",
        existingError
      );


      return res
        .status(500)
        .json({

          success:
            false,

          message:
            "Unable to load page before updating.",

        });

    }


    if (
      !existingPage
    ) {

      return res
        .status(404)
        .json({

          success:
            false,

          message:
            "Page not found.",

        });

    }


    /* ========================================================
       REMEMBER PREVIOUS STATUS
    ======================================================== */

    const wasPublished =
      existingPage.status ===
      "published";


    /* ========================================================
       BUILD UPDATE
    ======================================================== */

    const updates = {

      updated_at:
        new Date()
          .toISOString(),

    };


    if (
      typeof title ===
      "string"
    ) {

      const cleanTitle =
        title.trim();


      if (
        !cleanTitle
      ) {

        return res
          .status(400)
          .json({

            success:
              false,

            message:
              "Page title cannot be empty.",

          });

      }


      updates.title =
        cleanTitle;

    }


    if (
      status
    ) {

      updates.status =
        status;

    }


    if (
      content !==
      undefined
    ) {

      if (
        !content ||
        typeof content !==
          "object" ||
        Array.isArray(
          content
        )
      ) {

        return res
          .status(400)
          .json({

            success:
              false,

            message:
              "Page content must be a valid object.",

          });

      }


      updates.content =
        content;

    }


    /* ========================================================
       REQUIRE ACTUAL CHANGES
    ======================================================== */

    if (
      Object.keys(
        updates
      ).length ===
      1
    ) {

      return res
        .status(400)
        .json({

          success:
            false,

          message:
            "No page changes were provided.",

        });

    }


    /* ========================================================
       UPDATE DATABASE
    ======================================================== */

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
            error?.message ||
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


    /* ========================================================
       DETECT FIRST PUBLICATION

       Editing an already-published page will NOT send email.
    ======================================================== */

    const isNowPublished =
      data.status ===
      "published";


    if (
      !wasPublished &&
      isNowPublished
    ) {

      sendPageNotification(
        data
      );

    }


    /* ========================================================
       RESPONSE
    ======================================================== */

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
          error?.message ||
          "Unable to update page.",

      });

  }

}


/* ============================================================
   EXPORTS
============================================================ */

module.exports = {

  getPublishedPage,

  getAdminPage,

  updatePage,

};