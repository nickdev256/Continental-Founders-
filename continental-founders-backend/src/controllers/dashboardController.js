const supabase =
  require("../config/supabase");


/* ============================================================
   HELPER: SAFE COUNT QUERY
============================================================ */

async function countRows(
  table,
  configureQuery = null
) {
  let query =
    supabase
      .from(table)
      .select(
        "*",
        {
          count: "exact",
          head: true,
        }
      );

  if (
    typeof configureQuery ===
    "function"
  ) {
    query =
      configureQuery(
        query
      );
  }

  const {
    count,
    error,
  } =
    await query;

  if (error) {
    throw error;
  }

  return count || 0;
}


/* ============================================================
   DASHBOARD STATS

   GET /api/admin/dashboard/stats
============================================================ */

async function stats(
  req,
  res
) {
  try {

    const now =
      new Date()
        .toISOString();


    /* ========================================================
       COUNTS
    ======================================================== */

    const [
      totalContacts,
      newContacts,
      upcomingEvents,
      publishedInsights,
    ] =
      await Promise.all([

        /* ----------------------------------------------------
           ALL CONTACTS
        ---------------------------------------------------- */

        countRows(
          "contact_messages"
        ),


        /* ----------------------------------------------------
           NEW CONTACTS
        ---------------------------------------------------- */

        countRows(
          "contact_messages",
          (query) =>
            query.eq(
              "status",
              "new"
            )
        ),


        /* ----------------------------------------------------
           UPCOMING PUBLISHED EVENTS
        ---------------------------------------------------- */

        countRows(
          "events",
          (query) =>
            query
              .eq(
                "status",
                "published"
              )
              .gte(
                "event_date",
                now
              )
        ),


        /* ----------------------------------------------------
           PUBLISHED INSIGHTS
        ---------------------------------------------------- */

        countRows(
          "insights",
          (query) =>
            query.eq(
              "status",
              "published"
            )
        ),

      ]);


    /* ========================================================
       NEWSLETTER SUBSCRIBERS

       We keep this separate so the dashboard still loads
       even if your newsletter table uses a different name.
    ======================================================== */

    let newsletterSubscribers =
      0;


    try {

      newsletterSubscribers =
        await countRows(
          "newsletter_subscribers",
          (query) =>
            query.eq(
              "active",
              true
            )
        );

    } catch (newsletterError) {

      console.warn(
        "Newsletter subscriber count unavailable:",
        newsletterError.message
      );

    }


    /* ========================================================
       RECENT CONTACT ACTIVITY
    ======================================================== */

    const {
      data:
        recentContacts,

      error:
        recentContactsError,
    } =
      await supabase
        .from(
          "contact_messages"
        )
        .select(
          "id, name, organization, status, created_at"
        )
        .order(
          "created_at",
          {
            ascending:
              false,
          }
        )
        .limit(
          4
        );


    if (
      recentContactsError
    ) {
      console.warn(
        "Recent contacts unavailable:",
        recentContactsError.message
      );
    }


    const recentActivity =
      (
        recentContacts ||
        []
      ).map(
        (
          contact
        ) => ({
          id:
            contact.id,

          type:
            "contact",

          title:
            contact.name
              ? `New contact from ${contact.name}`
              : "New contact inquiry",

          description:
            contact.organization ||
            "Website contact inquiry",

          status:
            contact.status,

          created_at:
            contact.created_at,
        })
      );


    /* ========================================================
       RESPONSE
    ======================================================== */

    return res
      .status(200)
      .json({
        success:
          true,

        stats: {

          upcomingEvents,

          publishedInsights,

          newsletterSubscribers,

          newContacts,

          totalContacts,

        },

        recentActivity,
      });


  } catch (error) {

    console.error(
      "Dashboard stats error:",
      error
    );


    return res
      .status(500)
      .json({
        success:
          false,

        message:
          "Unable to load dashboard statistics.",

        error:
          process.env.NODE_ENV ===
          "development"
            ? error.message
            : undefined,
      });

  }
}


/* ============================================================
   EXPORTS
============================================================ */

module.exports = {
  stats,
};