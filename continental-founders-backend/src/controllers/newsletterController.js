const {
  supabaseAdmin,
} =
  require("../config/supabase");


/* ============================================================
   NORMALIZE SUBSCRIBER
============================================================ */

function normalizeSubscriber(
  subscriber
) {

  if (!subscriber) {
    return null;
  }


  return {

    id:
      subscriber.id,

    email:
      subscriber.email,

    status:
      subscriber.status,

    source:
      subscriber.source,

    subscribed_at:
      subscriber.subscribed_at,

    subscribedAt:
      subscriber.subscribed_at,

    unsubscribed_at:
      subscriber.unsubscribed_at,

    unsubscribedAt:
      subscriber.unsubscribed_at,

    created_at:
      subscriber.created_at,

    createdAt:
      subscriber.created_at,

    updated_at:
      subscriber.updated_at,

    updatedAt:
      subscriber.updated_at,

  };

}


/* ============================================================
   SUBSCRIBE

   POST /api/newsletter/subscribe
============================================================ */

async function subscribe(
  req,
  res
) {

  try {

    let {
      email,
    } =
      req.body || {};


    /* ========================================================
       VALIDATE EMAIL
    ======================================================== */

    if (!email) {

      return res
        .status(400)
        .json({

          success:
            false,

          message:
            "Email address is required.",

        });

    }


    email =
      String(email)
        .trim()
        .toLowerCase();


    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (
      !emailPattern.test(
        email
      )
    ) {

      return res
        .status(400)
        .json({

          success:
            false,

          message:
            "Please enter a valid email address.",

        });

    }


    /* ========================================================
       CHECK EXISTING SUBSCRIBER
    ======================================================== */

    const {
      data:
        existingSubscriber,

      error:
        existingError,
    } =
      await supabaseAdmin
        .from(
          "newsletter_subscribers"
        )
        .select("*")
        .eq(
          "email",
          email
        )
        .maybeSingle();


    if (
      existingError
    ) {

      throw existingError;

    }


    /* ========================================================
       ALREADY SUBSCRIBED
    ======================================================== */

    if (
      existingSubscriber &&
      existingSubscriber.status ===
        "subscribed"
    ) {

      return res
        .status(200)
        .json({

          success:
            true,

          message:
            "You are already subscribed to Continental Founders updates.",

          subscriber:
            normalizeSubscriber(
              existingSubscriber
            ),

        });

    }


    const now =
      new Date()
        .toISOString();


    /* ========================================================
       RE-SUBSCRIBE
    ======================================================== */

    if (
      existingSubscriber
    ) {

      const {
        data,
        error,
      } =
        await supabaseAdmin
          .from(
            "newsletter_subscribers"
          )
          .update({

            status:
              "subscribed",

            subscribed_at:
              now,

            unsubscribed_at:
              null,

            updated_at:
              now,

          })
          .eq(
            "id",
            existingSubscriber.id
          )
          .select("*")
          .single();


      if (
        error
      ) {

        throw error;

      }


      return res
        .status(200)
        .json({

          success:
            true,

          message:
            "Welcome back. Your subscription has been restored.",

          subscriber:
            normalizeSubscriber(
              data
            ),

        });

    }


    /* ========================================================
       CREATE SUBSCRIBER
    ======================================================== */

    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from(
          "newsletter_subscribers"
        )
        .insert({

          email,

          status:
            "subscribed",

          source:
            "website_footer",

          subscribed_at:
            now,

          created_at:
            now,

          updated_at:
            now,

        })
        .select("*")
        .single();


    if (
      error
    ) {

      throw error;

    }


    return res
      .status(201)
      .json({

        success:
          true,

        message:
          "Thank you for subscribing to Continental Founders.",

        subscriber:
          normalizeSubscriber(
            data
          ),

      });

  } catch (
    error
  ) {

    console.error(
      "Newsletter subscribe error:",
      error
    );


    return res
      .status(500)
      .json({

        success:
          false,

        message:
          error?.message ||
          "We could not complete your subscription. Please try again.",

      });

  }

}


/* ============================================================
   GET SUBSCRIBERS

   GET /api/newsletter/subscribers
============================================================ */

async function getSubscribers(
  req,
  res
) {

  try {

    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from(
          "newsletter_subscribers"
        )
        .select("*")
        .order(
          "subscribed_at",
          {
            ascending:
              false,
          }
        );


    if (
      error
    ) {

      throw error;

    }


    const subscribers =
      Array.isArray(
        data
      )
        ? data.map(
            normalizeSubscriber
          )
        : [];


    return res
      .status(200)
      .json({

        success:
          true,

        count:
          subscribers.length,

        subscribers,

      });

  } catch (
    error
  ) {

    console.error(
      "Get newsletter subscribers error:",
      error
    );


    return res
      .status(500)
      .json({

        success:
          false,

        message:
          error?.message ||
          "Failed to load newsletter subscribers.",

      });

  }

}


/* ============================================================
   UPDATE SUBSCRIBER

   PATCH /api/newsletter/subscribers/:id
============================================================ */

async function updateSubscriber(
  req,
  res
) {

  try {

    const {
      id,
    } =
      req.params;


    const status =
      String(
        req.body?.status ||
        ""
      )
        .trim()
        .toLowerCase();


    if (
      ![
        "subscribed",
        "unsubscribed",
      ].includes(
        status
      )
    ) {

      return res
        .status(400)
        .json({

          success:
            false,

          message:
            "Status must be subscribed or unsubscribed.",

        });

    }


    const {
      data:
        existingSubscriber,

      error:
        existingError,
    } =
      await supabaseAdmin
        .from(
          "newsletter_subscribers"
        )
        .select("*")
        .eq(
          "id",
          id
        )
        .maybeSingle();


    if (
      existingError
    ) {

      throw existingError;

    }


    if (
      !existingSubscriber
    ) {

      return res
        .status(404)
        .json({

          success:
            false,

          message:
            "Subscriber not found.",

        });

    }


    const now =
      new Date()
        .toISOString();


    const updates = {

      status,

      updated_at:
        now,

    };


    if (
      status ===
      "subscribed"
    ) {

      updates.subscribed_at =
        now;

      updates.unsubscribed_at =
        null;

    }


    if (
      status ===
      "unsubscribed"
    ) {

      updates.unsubscribed_at =
        now;

    }


    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from(
          "newsletter_subscribers"
        )
        .update(
          updates
        )
        .eq(
          "id",
          id
        )
        .select("*")
        .single();


    if (
      error
    ) {

      throw error;

    }


    return res
      .status(200)
      .json({

        success:
          true,

        message:
          "Subscriber updated successfully.",

        subscriber:
          normalizeSubscriber(
            data
          ),

      });

  } catch (
    error
  ) {

    console.error(
      "Update newsletter subscriber error:",
      error
    );


    return res
      .status(500)
      .json({

        success:
          false,

        message:
          error?.message ||
          "Unable to update subscriber.",

      });

  }

}


/* ============================================================
   DELETE SUBSCRIBER

   DELETE /api/newsletter/subscribers/:id
============================================================ */

async function deleteSubscriber(
  req,
  res
) {

  try {

    const {
      id,
    } =
      req.params;


    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from(
          "newsletter_subscribers"
        )
        .delete()
        .eq(
          "id",
          id
        )
        .select(
          "id, email"
        )
        .maybeSingle();


    if (
      error
    ) {

      throw error;

    }


    if (
      !data
    ) {

      return res
        .status(404)
        .json({

          success:
            false,

          message:
            "Subscriber not found.",

        });

    }


    return res
      .status(200)
      .json({

        success:
          true,

        message:
          "Subscriber deleted successfully.",

        deletedSubscriber: {

          id:
            data.id,

          email:
            data.email,

        },

      });

  } catch (
    error
  ) {

    console.error(
      "Delete newsletter subscriber error:",
      error
    );


    return res
      .status(500)
      .json({

        success:
          false,

        message:
          error?.message ||
          "Unable to delete subscriber.",

      });

  }

}


/* ============================================================
   EXPORTS
============================================================ */

module.exports = {

  subscribe,

  getSubscribers,

  updateSubscriber,

  deleteSubscriber,

};