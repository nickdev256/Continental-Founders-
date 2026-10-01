const {
  supabaseAdmin,
} = require("../config/supabase");


/* ============================================================
   CONFIGURATION
============================================================ */

const RECENT_ACTIVITY_LIMIT = 8;

const CFCV_COHORT_CAPACITY = 30;


/* ============================================================
   HELPER: SAFE COUNT QUERY
============================================================ */

async function countRows(
  table,
  configureQuery = null
) {
  let query =
    supabaseAdmin
      .from(table)
      .select("*", {
        count: "exact",
        head: true,
      });

  if (
    typeof configureQuery ===
    "function"
  ) {
    query =
      configureQuery(query);
  }

  const {
    count,
    error,
  } = await query;

  if (error) {
    throw error;
  }

  return count || 0;
}


/* ============================================================
   OPTIONAL COUNT

   Used for dashboard modules that should not cause the entire
   dashboard to fail if a table/schema is temporarily unavailable.
============================================================ */

async function optionalCount(
  label,
  table,
  configureQuery = null
) {
  try {
    return await countRows(
      table,
      configureQuery
    );
  } catch (error) {
    console.warn(
      `[DASHBOARD] ${label} unavailable:`,
      error?.message
    );

    return 0;
  }
}


/* ============================================================
   HELPER: FETCH RECENT ROWS SAFELY
============================================================ */

async function fetchRecentRows({
  label,
  table,
  columns,
  limit = 4,
}) {
  try {
    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from(table)
        .select(columns)
        .order(
          "created_at",
          {
            ascending: false,
          }
        )
        .limit(limit);

    if (error) {
      throw error;
    }

    return Array.isArray(data)
      ? data
      : [];
  } catch (error) {
    console.warn(
      `[DASHBOARD] ${label} unavailable:`,
      error?.message
    );

    return [];
  }
}


/* ============================================================
   HELPER: DATE VALUE
============================================================ */

function getTimestamp(item) {
  const value =
    item?.created_at ||
    item?.updated_at ||
    item?.event_date ||
    null;

  if (!value) {
    return 0;
  }

  const timestamp =
    new Date(value)
      .getTime();

  return Number.isFinite(
    timestamp
  )
    ? timestamp
    : 0;
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
       CORE COUNTS
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
       OPTIONAL CMS COUNTS
    ======================================================== */

    const [
      newsletterSubscribers,
      partnerships,
      newPartnerships,
      totalGalleryPhotos,
      publishedGalleryPhotos,
    ] =
      await Promise.all([

        /* ----------------------------------------------------
           ACTIVE NEWSLETTER SUBSCRIBERS
        ---------------------------------------------------- */

        optionalCount(
          "Newsletter subscriber count",
          "newsletter_subscribers",
          (query) =>
            query.eq(
              "active",
              true
            )
        ),


        /* ----------------------------------------------------
           TOTAL PARTNERSHIPS
        ---------------------------------------------------- */

        optionalCount(
          "Partnership count",
          "partnerships"
        ),


        /* ----------------------------------------------------
           NEW PARTNERSHIPS
        ---------------------------------------------------- */

        optionalCount(
          "New partnership count",
          "partnerships",
          (query) =>
            query.eq(
              "status",
              "new"
            )
        ),


        /* ----------------------------------------------------
           TOTAL GALLERY PHOTOS
        ---------------------------------------------------- */

        optionalCount(
          "Gallery photo count",
          "gallery_items"
        ),


        /* ----------------------------------------------------
           PUBLISHED GALLERY PHOTOS
        ---------------------------------------------------- */

        optionalCount(
          "Published gallery photo count",
          "gallery_items",
          (query) =>
            query.eq(
              "status",
              "published"
            )
        ),
      ]);


    /* ========================================================
       CFCV ADMISSIONS COUNTS

       These are optional so the main CMS dashboard remains
       available if the CFCV table is temporarily unavailable.
    ======================================================== */

    const [
      cfcvApplications,
      cfcvSubmitted,
      cfcvUnderReview,
      cfcvInterviews,
      cfcvMatchRequired,
      cfcvAdmitted,
      cfcvWaitlisted,
      cfcvGenesis,
      cfcvAscend,
      cfcvHorizon,
    ] =
      await Promise.all([

        /* ----------------------------------------------------
           TOTAL APPLICATIONS
        ---------------------------------------------------- */

        optionalCount(
          "CFCV application count",
          "cfcv_applications"
        ),


        /* ----------------------------------------------------
           SUBMITTED
        ---------------------------------------------------- */

        optionalCount(
          "CFCV submitted applications",
          "cfcv_applications",
          (query) =>
            query.eq(
              "status",
              "submitted"
            )
        ),


        /* ----------------------------------------------------
           UNDER REVIEW
        ---------------------------------------------------- */

        optionalCount(
          "CFCV applications under review",
          "cfcv_applications",
          (query) =>
            query.eq(
              "status",
              "under_review"
            )
        ),


        /* ----------------------------------------------------
           INTERVIEWS

           Uses the admissions workflow stage rather than
           guessing from applicant information.
        ---------------------------------------------------- */

        optionalCount(
          "CFCV interview applications",
          "cfcv_applications",
          (query) =>
            query.eq(
              "stage",
              "interview"
            )
        ),


        /* ----------------------------------------------------
           MATCH REQUIRED
        ---------------------------------------------------- */

        optionalCount(
          "CFCV matching required",
          "cfcv_applications",
          (query) =>
            query.eq(
              "matching_status",
              "required"
            )
        ),


        /* ----------------------------------------------------
           ADMITTED
        ---------------------------------------------------- */

        optionalCount(
          "CFCV admitted applications",
          "cfcv_applications",
          (query) =>
            query.eq(
              "final_decision",
              "admit"
            )
        ),


        /* ----------------------------------------------------
           WAITLIST
        ---------------------------------------------------- */

        optionalCount(
          "CFCV waitlisted applications",
          "cfcv_applications",
          (query) =>
            query.eq(
              "final_decision",
              "waitlist"
            )
        ),


        /* ----------------------------------------------------
           GENESIS TRACK
        ---------------------------------------------------- */

        optionalCount(
          "CFCV Genesis track",
          "cfcv_applications",
          (query) =>
            query.eq(
              "track",
              "Genesis"
            )
        ),


        /* ----------------------------------------------------
           ASCEND TRACK
        ---------------------------------------------------- */

        optionalCount(
          "CFCV Ascend track",
          "cfcv_applications",
          (query) =>
            query.eq(
              "track",
              "Ascend"
            )
        ),


        /* ----------------------------------------------------
           HORIZON TRACK
        ---------------------------------------------------- */

        optionalCount(
          "CFCV Horizon track",
          "cfcv_applications",
          (query) =>
            query.eq(
              "track",
              "Horizon"
            )
        ),
      ]);


    /* ========================================================
       CFCV CAPACITY
    ======================================================== */

    const cfcvRemainingCapacity =
      Math.max(
        CFCV_COHORT_CAPACITY -
          cfcvAdmitted,
        0
      );


    /* ========================================================
       RECENT CONTACTS
    ======================================================== */

    const recentContacts =
      await fetchRecentRows({
        label:
          "Recent contacts",

        table:
          "contact_messages",

        columns:
          "id, name, organization, status, created_at",

        limit: 4,
      });


    /* ========================================================
       RECENT EVENTS
    ======================================================== */

    const recentEvents =
      await fetchRecentRows({
        label:
          "Recent events",

        table:
          "events",

        columns:
          "id, title, status, event_date, created_at",

        limit: 3,
      });


    /* ========================================================
       RECENT INSIGHTS
    ======================================================== */

    const recentInsights =
      await fetchRecentRows({
        label:
          "Recent insights",

        table:
          "insights",

        columns:
          "id, title, status, created_at",

        limit: 3,
      });


    /* ========================================================
       RECENT GALLERY PHOTOS
    ======================================================== */

    const recentGallery =
      await fetchRecentRows({
        label:
          "Recent gallery photos",

        table:
          "gallery_items",

        columns:
          "id, title, category, status, image_url, created_at",

        limit: 4,
      });


    /* ========================================================
       RECENT CFCV APPLICATIONS
    ======================================================== */

    const recentCfcvApplications =
      await fetchRecentRows({
        label:
          "Recent CFCV applications",

        table:
          "cfcv_applications",

        columns:
          "id, application_reference, founder_name, venture_name, status, stage, final_decision, created_at",

        limit: 4,
      });


    /* ========================================================
       NORMALIZE CONTACT ACTIVITY
    ======================================================== */

    const contactActivity =
      recentContacts.map(
        (contact) => ({
          id:
            `contact-${contact.id}`,

          type:
            "contact",

          title:
            contact.name
              ? `Contact from ${contact.name}`
              : "Website contact inquiry",

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
       NORMALIZE EVENT ACTIVITY
    ======================================================== */

    const eventActivity =
      recentEvents.map(
        (event) => ({
          id:
            `event-${event.id}`,

          type:
            "event",

          title:
            event.title ||
            "Event updated",

          description:
            event.status
              ? `Event status: ${event.status}`
              : "Continental Founders event",

          status:
            event.status,

          event_date:
            event.event_date,

          created_at:
            event.created_at,
        })
      );


    /* ========================================================
       NORMALIZE INSIGHT ACTIVITY
    ======================================================== */

    const insightActivity =
      recentInsights.map(
        (insight) => ({
          id:
            `insight-${insight.id}`,

          type:
            "insight",

          title:
            insight.title ||
            "Insight updated",

          description:
            insight.status
              ? `Insight status: ${insight.status}`
              : "Continental Founders insight",

          status:
            insight.status,

          created_at:
            insight.created_at,
        })
      );


    /* ========================================================
       NORMALIZE GALLERY ACTIVITY
    ======================================================== */

    const galleryActivity =
      recentGallery.map(
        (galleryItem) => ({
          id:
            `gallery-${galleryItem.id}`,

          type:
            "gallery",

          title:
            galleryItem.title ||
            "Gallery photo",

          description:
            galleryItem.category
              ? `${galleryItem.category} • ${galleryItem.status || "draft"}`
              : galleryItem.status
                ? `Gallery status: ${galleryItem.status}`
                : "Continental Founders gallery",

          status:
            galleryItem.status,

          image_url:
            galleryItem.image_url,

          created_at:
            galleryItem.created_at,
        })
      );


    /* ========================================================
       NORMALIZE CFCV ACTIVITY
    ======================================================== */

    const cfcvActivity =
      recentCfcvApplications.map(
        (application) => {
          const displayName =
            application.venture_name ||
            application.founder_name ||
            application.application_reference ||
            "CFCV application";

          let description =
            "CFCV fellowship application";

          if (
            application.final_decision
          ) {
            description =
              `Decision: ${application.final_decision}`;
          } else if (
            application.stage
          ) {
            description =
              `Admissions stage: ${application.stage}`;
          } else if (
            application.status
          ) {
            description =
              `Application status: ${application.status}`;
          }

          return {
            id:
              `cfcv-${application.id}`,

            type:
              "cfcv_application",

            title:
              displayName,

            description,

            status:
              application.status,

            created_at:
              application.created_at,
          };
        }
      );


    /* ========================================================
       COMBINE RECENT ACTIVITY
    ======================================================== */

    const recentActivity = [
      ...cfcvActivity,
      ...contactActivity,
      ...eventActivity,
      ...insightActivity,
      ...galleryActivity,
    ]
      .sort(
        (a, b) =>
          getTimestamp(b) -
          getTimestamp(a)
      )
      .slice(
        0,
        RECENT_ACTIVITY_LIMIT
      );


    /* ========================================================
       RESPONSE
    ======================================================== */

    return res
      .status(200)
      .json({
        success: true,

        stats: {
          /* CMS */

          upcomingEvents,

          publishedInsights,

          newsletterSubscribers,

          newContacts,

          totalContacts,

          partnerships,

          newPartnerships,

          totalGalleryPhotos,

          publishedGalleryPhotos,


          /* CFCV */

          cfcvApplications,

          cfcvSubmitted,

          cfcvUnderReview,

          cfcvInterviews,

          cfcvMatchRequired,

          cfcvAdmitted,

          cfcvWaitlisted,

          cfcvGenesis,

          cfcvAscend,

          cfcvHorizon,

          cfcvCohortCapacity:
            CFCV_COHORT_CAPACITY,

          cfcvRemainingCapacity,
        },

        recentActivity,

        meta: {
          generatedAt:
            new Date()
              .toISOString(),
        },
      });
  } catch (error) {
    console.error(
      "[DASHBOARD] Stats error:",
      error
    );

    return res
      .status(500)
      .json({
        success: false,

        message:
          "Unable to load dashboard statistics.",

        error:
          process.env.NODE_ENV ===
          "development"
            ? error?.message
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