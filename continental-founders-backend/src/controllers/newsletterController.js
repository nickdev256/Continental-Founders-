const supabase = require("../config/supabase");


/* ============================================================
   SUBSCRIBE
============================================================ */

async function subscribe(req, res) {
  try {
    let {
      email,
    } = req.body;


    /* --------------------------------------------------------
       VALIDATE EMAIL
    -------------------------------------------------------- */

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email address is required.",
      });
    }


    email =
      String(email)
        .trim()
        .toLowerCase();


    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (!emailPattern.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }


    /* --------------------------------------------------------
       CHECK EXISTING SUBSCRIBER
    -------------------------------------------------------- */

    const {
      data: existingSubscriber,
      error: existingError,
    } =
      await supabase
        .from("newsletter_subscribers")
        .select(
          "id, email, status"
        )
        .eq("email", email)
        .maybeSingle();


    if (existingError) {
      throw existingError;
    }


    /* --------------------------------------------------------
       ALREADY SUBSCRIBED
    -------------------------------------------------------- */

    if (
      existingSubscriber &&
      existingSubscriber.status ===
        "subscribed"
    ) {
      return res.status(200).json({
        success: true,
        message:
          "You are already subscribed to Continental Founders updates.",
      });
    }


    /* --------------------------------------------------------
       RE-SUBSCRIBE
    -------------------------------------------------------- */

    if (
      existingSubscriber &&
      existingSubscriber.status ===
        "unsubscribed"
    ) {
      const {
        data,
        error,
      } =
        await supabase
          .from(
            "newsletter_subscribers"
          )
          .update({
            status: "subscribed",
            subscribed_at:
              new Date().toISOString(),
            updated_at:
              new Date().toISOString(),
          })
          .eq(
            "id",
            existingSubscriber.id
          )
          .select()
          .single();


      if (error) {
        throw error;
      }


      return res.status(200).json({
        success: true,
        message:
          "Welcome back. Your subscription has been restored.",
        subscriber: data,
      });
    }


    /* --------------------------------------------------------
       CREATE SUBSCRIBER
    -------------------------------------------------------- */

    const {
      data,
      error,
    } =
      await supabase
        .from(
          "newsletter_subscribers"
        )
        .insert([
          {
            email,
            status: "subscribed",
            source:
              "website_footer",
          },
        ])
        .select()
        .single();


    if (error) {
      throw error;
    }


    return res.status(201).json({
      success: true,
      message:
        "Thank you for subscribing to Continental Founders.",
      subscriber: data,
    });

  } catch (error) {
    console.error(
      "Newsletter subscribe error:",
      error
    );


    return res.status(500).json({
      success: false,
      message:
        "We could not complete your subscription. Please try again.",
    });
  }
}


/* ============================================================
   GET SUBSCRIBERS
   ADMIN USE LATER
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
      await supabase
        .from(
          "newsletter_subscribers"
        )
        .select("*")
        .order(
          "subscribed_at",
          {
            ascending: false,
          }
        );


    if (error) {
      throw error;
    }


    return res.status(200).json({
      success: true,
      subscribers: data || [],
    });

  } catch (error) {
    console.error(
      "Get newsletter subscribers error:",
      error
    );


    return res.status(500).json({
      success: false,
      message:
        "Failed to load newsletter subscribers.",
    });
  }
}


/* ============================================================
   EXPORT
============================================================ */

module.exports = {
  subscribe,
  getSubscribers,
};