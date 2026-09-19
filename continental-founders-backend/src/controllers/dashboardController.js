const {
  supabaseAdmin,
} = require("../config/supabase");

// ============================================================
// CONFIGURATION
// ============================================================

const RECENT_ACTIVITY_LIMIT = 8;

// ============================================================
// HELPER: SAFE COUNT QUERY
// ============================================================

async function countRows(
  table,
  configureQuery = null
) {
  let query = supabaseAdmin
    .from(table)
    .select("*", {
      count: "exact",
      head: true,
    });

  if (
    typeof configureQuery ===
    "function"
  ) {
    query = configureQuery(query);
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

// ============================================================
// OPTIONAL COUNT
//
// Used for dashboard modules that should not cause the whole
// dashboard to fail if the table/schema is unavailable.
// ============================================================

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

// ============================================================
// HELPER: FETCH RECENT ROWS SAFELY
// ============================================================

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
    } = await supabaseAdmin
      .from(table)
      .select(columns)
      .order("created_at", {
        ascending: false,
      })
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

// ============================================================
// HELPER: DATE VALUE
// ============================================================

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
    new Date(value).getTime();

  return Number.isFinite(timestamp)
    ? timestamp
    : 0;
}

// ============================================================
// DASHBOARD STATS
//
// GET /api/admin/dashboard/stats
// ============================================================

async function stats(req, res) {
  try {
    const now =
      new Date().toISOString();

    // ========================================================
    // CORE COUNTS
    //
    // These tables are already part of the CMS and should
    // exist. If one fails, return a server error rather than
    // silently presenting incorrect core statistics.
    // ========================================================

    const [
      totalContacts,
      newContacts,
      upcomingEvents,
      publishedInsights,
    ] = await Promise.all([
      // ------------------------------------------------------
      // ALL CONTACTS
      // ------------------------------------------------------

      countRows(
        "contact_messages"
      ),

      // ------------------------------------------------------
      // NEW CONTACTS
      // ------------------------------------------------------

      countRows(
        "contact_messages",
        (query) =>
          query.eq(
            "status",
            "new"
          )
      ),

      // ------------------------------------------------------
      // UPCOMING PUBLISHED EVENTS
      // ------------------------------------------------------

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

      // ------------------------------------------------------
      // PUBLISHED INSIGHTS
      // ------------------------------------------------------

      countRows(
        "insights",
        (query) =>
          query.eq(
            "status",
            "published"
          )
      ),
    ]);

    // ========================================================
    // OPTIONAL COUNTS
    // ========================================================

    const [
      newsletterSubscribers,
      partnerships,
      newPartnerships,
    ] = await Promise.all([
      // ------------------------------------------------------
      // ACTIVE NEWSLETTER SUBSCRIBERS
      // ------------------------------------------------------

      optionalCount(
        "Newsletter subscriber count",
        "newsletter_subscribers",
        (query) =>
          query.eq(
            "active",
            true
          )
      ),

      // ------------------------------------------------------
      // TOTAL PARTNERSHIPS
      // ------------------------------------------------------

      optionalCount(
        "Partnership count",
        "partnerships"
      ),

      // ------------------------------------------------------
      // NEW PARTNERSHIPS
      //
      // This assumes partnership records use status = "new".
      // If your partnership table uses another status value,
      // we can adjust this after checking the schema.
      // ------------------------------------------------------

      optionalCount(
        "New partnership count",
        "partnerships",
        (query) =>
          query.eq(
            "status",
            "new"
          )
      ),
    ]);

    // ========================================================
    // RECENT CONTACTS
    // ========================================================

    const recentContacts =
      await fetchRecentRows({
        label:
          "Recent contacts",

        table:
          "contact_messages",

        columns:
          "id, name, organization, status, created_at",

        limit:
          4,
      });

    // ========================================================
    // RECENT EVENTS
    // ========================================================

    const recentEvents =
      await fetchRecentRows({
        label:
          "Recent events",

        table:
          "events",

        columns:
          "id, title, status, event_date, created_at",

        limit:
          3,
      });

    // ========================================================
    // RECENT INSIGHTS
    // ========================================================

    const recentInsights =
      await fetchRecentRows({
        label:
          "Recent insights",

        table:
          "insights",

        columns:
          "id, title, status, created_at",

        limit:
          3,
      });

    // ========================================================
    // NORMALIZE CONTACT ACTIVITY
    // ========================================================

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

    // ========================================================
    // NORMALIZE EVENT ACTIVITY
    // ========================================================

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

    // ========================================================
    // NORMALIZE INSIGHT ACTIVITY
    // ========================================================

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

    // ========================================================
    // COMBINE RECENT ACTIVITY
    // ========================================================

    const recentActivity = [
      ...contactActivity,
      ...eventActivity,
      ...insightActivity,
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

    // ========================================================
    // RESPONSE
    // ========================================================

    return res
      .status(200)
      .json({
        success: true,

        stats: {
          upcomingEvents,

          publishedInsights,

          newsletterSubscribers,

          newContacts,

          totalContacts,

          partnerships,

          newPartnerships,
        },

        recentActivity,

        meta: {
          generatedAt:
            new Date().toISOString(),
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

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  stats,
};