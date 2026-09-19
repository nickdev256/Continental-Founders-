const {
  supabaseAdmin,
} = require("../config/supabase");

const Partnership =
  require("../models/Partnership");

// ============================================================
// CONFIGURATION
// ============================================================

const RECENT_ACTIVITY_LIMIT = 8;

// ============================================================
// SUPABASE COUNT HELPER
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

// ============================================================
// OPTIONAL SUPABASE COUNT
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
// FETCH RECENT SUPABASE ROWS
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
// PARTNERSHIP COUNTS
// ============================================================

async function getPartnershipCounts() {
  try {
    const [
      total,
      newCount,
    ] = await Promise.all([
      Partnership.countDocuments(
        {}
      ),

      Partnership.countDocuments({
        status: "new",
      }),
    ]);

    return {
      total:
        Number(total) || 0,

      newCount:
        Number(newCount) || 0,
    };
  } catch (error) {
    console.warn(
      "[DASHBOARD] Partnership counts unavailable:",
      error?.message
    );

    return {
      total: 0,
      newCount: 0,
    };
  }
}

// ============================================================
// RECENT PARTNERSHIPS
// ============================================================

async function getRecentPartnerships(
  limit = 4
) {
  try {
    const partnerships =
      await Partnership
        .find({})
        .sort({
          createdAt: -1,
        })
        .limit(limit)
        .lean();

    return Array.isArray(
      partnerships
    )
      ? partnerships
      : [];
  } catch (error) {
    console.warn(
      "[DASHBOARD] Recent partnerships unavailable:",
      error?.message
    );

    return [];
  }
}

// ============================================================
// TIMESTAMP HELPER
// ============================================================

function getTimestamp(item) {
  const value =
    item?.created_at ||
    item?.createdAt ||
    item?.updated_at ||
    item?.updatedAt ||
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

// ============================================================
// DASHBOARD STATS
//
// GET /api/admin/dashboard/stats
// ============================================================

async function stats(
  req,
  res
) {
  try {
    const now =
      new Date()
        .toISOString();

    // ========================================================
    // CORE SUPABASE COUNTS
    // ========================================================

    const [
      totalContacts,
      newContacts,
      upcomingEvents,
      publishedInsights,
    ] = await Promise.all([
      // ------------------------------------------------------
      // TOTAL CONTACTS
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
    // NEWSLETTER COUNT
    // ========================================================

    const newsletterSubscribers =
      await optionalCount(
        "Newsletter subscriber count",
        "newsletter_subscribers",
        (query) =>
          query.eq(
            "active",
            true
          )
      );

    // ========================================================
    // PARTNERSHIP COUNTS
    // ========================================================

    const partnershipCounts =
      await getPartnershipCounts();

    // ========================================================
    // RECENT CONTENT
    // ========================================================

    const [
      recentContacts,
      recentEvents,
      recentInsights,
      recentPartnerships,
    ] = await Promise.all([
      fetchRecentRows({
        label:
          "Recent contacts",

        table:
          "contact_messages",

        columns:
          "id, name, organization, status, created_at",

        limit:
          4,
      }),

      fetchRecentRows({
        label:
          "Recent events",

        table:
          "events",

        columns:
          "id, title, status, event_date, created_at",

        limit:
          3,
      }),

      fetchRecentRows({
        label:
          "Recent insights",

        table:
          "insights",

        columns:
          "id, title, status, created_at",

        limit:
          3,
      }),

      getRecentPartnerships(
        4
      ),
    ]);

    // ========================================================
    // CONTACT ACTIVITY
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
    // EVENT ACTIVITY
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
    // INSIGHT ACTIVITY
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
    // PARTNERSHIP ACTIVITY
    // ========================================================

    const partnershipActivity =
      recentPartnerships.map(
        (partnership) => ({
          id:
            `partnership-${partnership._id}`,

          type:
            "partnership",

          title:
            partnership.organization
              ? `Partnership inquiry from ${partnership.organization}`
              : "New partnership inquiry",

          description:
            partnership.areaOfInterest ||
            partnership.organizationType ||
            partnership.contactName ||
            "Partnership inquiry",

          status:
            partnership.status,

          created_at:
            partnership.createdAt,
        })
      );

    // ========================================================
    // COMBINE ACTIVITY
    // ========================================================

    const recentActivity = [
      ...contactActivity,
      ...eventActivity,
      ...insightActivity,
      ...partnershipActivity,
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

          partnerships:
            partnershipCounts.total,

          newPartnerships:
            partnershipCounts.newCount,
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

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  stats,
};