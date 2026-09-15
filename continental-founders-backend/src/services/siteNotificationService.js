const {
  supabaseAdmin,
} = require("../config/supabase");

const {
  sendNewsletterCampaign,
} = require("./newsletterEmailService");


/* ============================================================
   BUILD PUBLIC URL
============================================================ */

function buildPublicUrl(
  path = ""
) {

  const clientUrl =
    (
      process.env.CLIENT_URL ||
      "http://localhost:5173"
    )
      .split(",")[0]
      .trim()
      .replace(/\/+$/, "");


  if (!path) {
    return clientUrl;
  }


  if (
    /^https?:\/\//i.test(
      path
    )
  ) {

    return path;

  }


  return `${clientUrl}/${String(
    path
  ).replace(/^\/+/, "")}`;

}


/* ============================================================
   FORMAT CONTENT TYPE
============================================================ */

function formatContentType(
  value
) {

  return String(
    value ||
    "Update"
  )
    .replace(
      /[_-]+/g,
      " "
    )
    .replace(
      /\b\w/g,
      (
        letter
      ) =>
        letter.toUpperCase()
    );

}


/* ============================================================
   CHECK IF CAMPAIGN WAS ALREADY SENT
============================================================ */

async function campaignAlreadySent({
  contentType,
  contentId,
  notificationType =
    "published",
}) {

  const {
    data,
    error,
  } =
    await supabaseAdmin
      .from(
        "newsletter_campaigns"
      )
      .select(
        "id, status"
      )
      .eq(
        "content_type",
        contentType
      )
      .eq(
        "content_id",
        String(
          contentId
        )
      )
      .eq(
        "notification_type",
        notificationType
      )
      .eq(
        "status",
        "sent"
      )
      .limit(1);


  if (
    error
  ) {

    throw error;

  }


  return (
    Array.isArray(
      data
    ) &&
    data.length >
      0
  );

}


/* ============================================================
   CREATE CAMPAIGN
============================================================ */

async function createCampaign({
  contentType,
  contentId,
  title,
  subject,
  summary,
  url,
  imageUrl,
  notificationType,
}) {

  const now =
    new Date()
      .toISOString();


  const {
    data,
    error,
  } =
    await supabaseAdmin
      .from(
        "newsletter_campaigns"
      )
      .insert({

        content_type:
          contentType,

        content_id:
          String(
            contentId
          ),

        notification_type:
          notificationType,

        title,

        subject,

        preview_text:
          summary ||
          null,

        url:
          url ||
          null,

        image_url:
          imageUrl ||
          null,

        status:
          "sending",

        recipient_count:
          0,

        sent_count:
          0,

        failed_count:
          0,

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


  return data;

}


/* ============================================================
   UPDATE CAMPAIGN
============================================================ */

async function updateCampaign(
  campaignId,
  updates
) {

  const {
    error,
  } =
    await supabaseAdmin
      .from(
        "newsletter_campaigns"
      )
      .update({

        ...updates,

        updated_at:
          new Date()
            .toISOString(),

      })
      .eq(
        "id",
        campaignId
      );


  if (
    error
  ) {

    throw error;

  }

}


/* ============================================================
   MARK CAMPAIGN AS FAILED
============================================================ */

async function markCampaignFailed(
  campaignId,
  errorMessage
) {

  if (
    !campaignId
  ) {

    return;

  }


  try {

    await updateCampaign(
      campaignId,
      {

        status:
          "failed",

        failed_count:
          0,

      }
    );


    console.error(
      "Newsletter campaign failed:",
      {
        campaignId,
        error:
          errorMessage,
      }
    );

  } catch (
    updateError
  ) {

    console.error(
      "Unable to mark newsletter campaign as failed:",
      updateError
    );

  }

}


/* ============================================================
   GET ACTIVE SUBSCRIBERS
============================================================ */

async function getActiveSubscribers() {

  const {
    data,
    error,
  } =
    await supabaseAdmin
      .from(
        "newsletter_subscribers"
      )
      .select(
        "id, email"
      )
      .eq(
        "status",
        "subscribed"
      );


  if (
    error
  ) {

    throw error;

  }


  if (
    !Array.isArray(
      data
    )
  ) {

    return [];

  }


  const emails =
    data
      .map(
        (
          subscriber
        ) =>
          String(
            subscriber.email ||
            ""
          )
            .trim()
            .toLowerCase()
      )
      .filter(
        Boolean
      );


  return [
    ...new Set(
      emails
    ),
  ];

}


/* ============================================================
   NOTIFY SUBSCRIBERS

   This is the ONE function used by the whole CMS.
============================================================ */

async function notifySubscribers({
  contentType,
  contentId,
  title,
  summary = "",
  path = "",
  imageUrl = null,
  notificationType =
    "published",
  subject = "",
  force = false,
}) {

  let campaign =
    null;


  try {

    /* ========================================================
       VALIDATION
    ======================================================== */

    if (
      !contentType
    ) {

      throw new Error(
        "contentType is required."
      );

    }


    if (
      !contentId
    ) {

      throw new Error(
        "contentId is required."
      );

    }


    if (
      !title
    ) {

      throw new Error(
        "title is required."
      );

    }


    /* ========================================================
       PREVENT DUPLICATE EMAILS
    ======================================================== */

    if (
      !force
    ) {

      const alreadySent =
        await campaignAlreadySent({

          contentType,

          contentId,

          notificationType,

        });


      if (
        alreadySent
      ) {

        console.log(
          `Newsletter already sent for ${contentType}:${contentId}`
        );


        return {

          success:
            true,

          skipped:
            true,

          reason:
            "already_sent",

        };

      }

    }


    /* ========================================================
       GET SUBSCRIBERS
    ======================================================== */

    const recipients =
      await getActiveSubscribers();


    if (
      recipients.length ===
      0
    ) {

      console.log(
        "Newsletter notification skipped because there are no active subscribers."
      );


      return {

        success:
          true,

        skipped:
          true,

        reason:
          "no_subscribers",

      };

    }


    /* ========================================================
       BUILD EMAIL DETAILS
    ======================================================== */

    const publicUrl =
      buildPublicUrl(
        path
      );


    const emailSubject =
      subject ||
      `New ${formatContentType(
        contentType
      )}: ${title}`;


    /* ========================================================
       CREATE CAMPAIGN LOG
    ======================================================== */

    campaign =
      await createCampaign({

        contentType,

        contentId,

        title,

        subject:
          emailSubject,

        summary,

        url:
          publicUrl,

        imageUrl,

        notificationType,

      });


    /* ========================================================
       SEND EMAILS
    ======================================================== */

    const result =
      await sendNewsletterCampaign({

        recipients,

        subject:
          emailSubject,

        title,

        summary,

        url:
          publicUrl,

        imageUrl,

        contentType,

      });


    const skippedCount =
      result
        ?.skippedCount ||
      0;


    const failedCount =
      (
        result
          ?.failedCount ||
        0
      ) +
      skippedCount;


    const sentCount =
      result
        ?.sentCount ||
      0;


    /* ========================================================
       CAMPAIGN STATUS
    ======================================================== */

    let campaignStatus =
      "failed";


    if (
      sentCount >
      0
    ) {

      campaignStatus =
        "sent";

    }


    /* ========================================================
       UPDATE CAMPAIGN LOG
    ======================================================== */

    await updateCampaign(
      campaign.id,
      {

        status:
          campaignStatus,

        recipient_count:
          recipients.length,

        sent_count:
          sentCount,

        failed_count:
          failedCount,

        sent_at:
          sentCount >
          0
            ? new Date()
                .toISOString()
            : null,

      }
    );


    return {

      success:
        sentCount >
        0,

      campaignId:
        campaign.id,

      recipientCount:
        recipients.length,

      sentCount,

      failedCount,

      skippedCount,

      status:
        campaignStatus,

    };

  } catch (
    error
  ) {

    console.error(
      "Site notification error:",
      error
    );


    if (
      campaign?.id
    ) {

      await markCampaignFailed(
        campaign.id,
        error?.message ||
        "Unknown notification error."
      );

    }


    return {

      success:
        false,

      message:
        error?.message ||
        "Unable to send site notification.",

    };

  }

}


/* ============================================================
   EXPORTS
============================================================ */

module.exports = {

  notifySubscribers,

};