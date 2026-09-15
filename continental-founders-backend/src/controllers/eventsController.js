const crypto =
  require("crypto");

const {
  z,
} =
  require("zod");

const {
  supabaseAdmin,
} =
  require("../config/supabase");

const {
  notifySubscribers,
} =
  require("../services/siteNotificationService");


/* ============================================================
   STORAGE
============================================================ */

const EVENT_IMAGE_BUCKET =
  "event-images";


/* ============================================================
   VALIDATION
============================================================ */

const eventSchema =
  z.object({

    title:
      z
        .string({
          required_error:
            "Event title is required.",
        })
        .trim()
        .min(
          3,
          "Event title is required."
        )
        .max(
          180,
          "Event title is too long."
        ),

    slug:
      z
        .string({
          required_error:
            "Event slug is required.",
        })
        .trim()
        .min(
          3,
          "Event slug is required."
        )
        .max(
          200,
          "Event slug is too long."
        )
        .regex(
          /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
          "Invalid event slug."
        ),

    description:
      z
        .string()
        .trim()
        .optional()
        .nullable(),

    location:
      z
        .string()
        .trim()
        .optional()
        .nullable(),

    type:
      z
        .string()
        .trim()
        .optional()
        .nullable(),

    status:
      z
        .enum([
          "draft",
          "published",
          "cancelled",
        ])
        .default(
          "draft"
        ),

    eventDate:
      z
        .string({
          required_error:
            "Event date is required.",
        })
        .trim()
        .min(
          1,
          "Event date is required."
        ),

  });


const updateEventSchema =
  eventSchema.partial();


/* ============================================================
   NORMALIZE MULTIPART BODY
============================================================ */

function normalizeEventInput(
  body = {}
) {

  return {

    title:
      typeof body.title ===
      "string"
        ? body.title
        : "",

    slug:
      typeof body.slug ===
      "string"
        ? body.slug
        : "",

    description:
      typeof body.description ===
      "string"
        ? body.description
        : "",

    location:
      typeof body.location ===
      "string"
        ? body.location
        : "",

    type:
      typeof body.type ===
      "string"
        ? body.type
        : "",

    status:
      typeof body.status ===
        "string" &&
      body.status
        ? body.status
        : "draft",

    eventDate:
      typeof body.eventDate ===
      "string"
        ? body.eventDate
        : "",

  };

}


/* ============================================================
   NORMALIZE UPDATE BODY
============================================================ */

function normalizeUpdateInput(
  body = {}
) {

  const normalized = {};


  if (
    body.title !==
    undefined
  ) {

    normalized.title =
      body.title;

  }


  if (
    body.slug !==
    undefined
  ) {

    normalized.slug =
      body.slug;

  }


  if (
    body.description !==
    undefined
  ) {

    normalized.description =
      body.description;

  }


  if (
    body.location !==
    undefined
  ) {

    normalized.location =
      body.location;

  }


  if (
    body.type !==
    undefined
  ) {

    normalized.type =
      body.type;

  }


  if (
    body.status !==
    undefined
  ) {

    normalized.status =
      body.status;

  }


  if (
    body.eventDate !==
    undefined
  ) {

    normalized.eventDate =
      body.eventDate;

  }


  return normalized;

}


/* ============================================================
   NORMALIZE DATABASE EVENT
============================================================ */

function normalizeEvent(
  event
) {

  if (
    !event
  ) {

    return null;

  }


  return {

    id:
      event.id,

    title:
      event.title,

    slug:
      event.slug,

    description:
      event.description,

    location:
      event.location,

    type:
      event.type,

    status:
      event.status,

    event_date:
      event.event_date,

    eventDate:
      event.event_date,

    image_url:
      event.image_url,

    imageUrl:
      event.image_url,

    created_at:
      event.created_at,

    createdAt:
      event.created_at,

    updated_at:
      event.updated_at,

    updatedAt:
      event.updated_at,

  };

}


/* ============================================================
   IMAGE EXTENSION
============================================================ */

function getImageExtension(
  file
) {

  const mimeType =
    file?.mimetype ||
    "";


  if (
    mimeType ===
    "image/png"
  ) {

    return "png";

  }


  if (
    mimeType ===
    "image/webp"
  ) {

    return "webp";

  }


  return "jpg";

}


/* ============================================================
   IMAGE STORAGE PATH
============================================================ */

function createImagePath(
  file
) {

  const extension =
    getImageExtension(
      file
    );


  return [
    "events",
    `${Date.now()}-${crypto.randomUUID()}.${extension}`,
  ].join("/");

}


/* ============================================================
   GET STORAGE PATH FROM PUBLIC URL
============================================================ */

function getStoragePathFromUrl(
  imageUrl
) {

  if (
    !imageUrl
  ) {

    return null;

  }


  const marker =
    `/storage/v1/object/public/${EVENT_IMAGE_BUCKET}/`;


  const markerIndex =
    imageUrl.indexOf(
      marker
    );


  if (
    markerIndex === -1
  ) {

    return null;

  }


  try {

    return decodeURIComponent(
      imageUrl.slice(
        markerIndex +
        marker.length
      )
    );

  } catch (
    error
  ) {

    console.error(
      "Unable to decode event image storage path:",
      error
    );


    return null;

  }

}


/* ============================================================
   UPLOAD EVENT IMAGE
============================================================ */

async function uploadEventImage(
  file
) {

  if (
    !file
  ) {

    return null;

  }


  const imagePath =
    createImagePath(
      file
    );


  const {
    error:
      uploadError,
  } =
    await supabaseAdmin
      .storage
      .from(
        EVENT_IMAGE_BUCKET
      )
      .upload(
        imagePath,
        file.buffer,
        {

          contentType:
            file.mimetype,

          cacheControl:
            "3600",

          upsert:
            false,

        }
      );


  if (
    uploadError
  ) {

    throw uploadError;

  }


  const {
    data:
      publicUrlData,
  } =
    supabaseAdmin
      .storage
      .from(
        EVENT_IMAGE_BUCKET
      )
      .getPublicUrl(
        imagePath
      );


  const publicUrl =
    publicUrlData
      ?.publicUrl;


  if (
    !publicUrl
  ) {

    await supabaseAdmin
      .storage
      .from(
        EVENT_IMAGE_BUCKET
      )
      .remove([
        imagePath,
      ]);


    throw new Error(
      "Unable to generate event image URL."
    );

  }


  return {

    imagePath,

    publicUrl,

  };

}


/* ============================================================
   DELETE EVENT IMAGE
============================================================ */

async function deleteEventImage(
  imageUrl
) {

  try {

    const imagePath =
      getStoragePathFromUrl(
        imageUrl
      );


    if (
      !imagePath
    ) {

      return {

        success:
          true,

        skipped:
          true,

      };

    }


    const {
      data,
      error,
    } =
      await supabaseAdmin
        .storage
        .from(
          EVENT_IMAGE_BUCKET
        )
        .remove([
          imagePath,
        ]);


    if (
      error
    ) {

      console.error(
        "Delete event image error:",
        {
          message:
            error.message,

          statusCode:
            error.statusCode,

          error:
            error.error,

          imagePath,
        }
      );


      return {

        success:
          false,

        error,

      };

    }


    return {

      success:
        true,

      data,

    };

  } catch (
    error
  ) {

    console.error(
      "Delete event image exception:",
      {
        message:
          error?.message,

        name:
          error?.name,
      }
    );


    return {

      success:
        false,

      error,

    };

  }

}


/* ============================================================
   EVENT NOTIFICATION
============================================================ */

function sendEventNotification(
  event
) {

  if (
    !event ||
    event.status !==
      "published"
  ) {

    return;

  }


  let summary =
    event.description ||
    "";


  if (
    event.location
  ) {

    summary =
      summary
        ? `${summary}\n\nLocation: ${event.location}`
        : `Location: ${event.location}`;

  }


  notifySubscribers({

    contentType:
      "event",

    contentId:
      event.id,

    title:
      event.title,

    summary,

    path:
      `/events/${event.slug}`,

    imageUrl:
      event.image_url ||
      null,

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
            "Event newsletter notification skipped:",
            result.reason
          );

          return;

        }


        if (
          result?.success
        ) {

          console.log(
            "Event newsletter notification processed:",
            {

              eventId:
                event.id,

              sentCount:
                result.sentCount,

              failedCount:
                result.failedCount,

            }
          );

        }

      }
    )
    .catch(
      (
        error
      ) => {

        console.error(
          "Event newsletter notification error:",
          error
        );

      }
    );

}


/* ============================================================
   GET ALL EVENTS
============================================================ */

async function getEvents(
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
          "events"
        )
        .select("*")
        .order(
          "event_date",
          {
            ascending:
              true,
          }
        );


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

        events:
          Array.isArray(
            data
          )
            ? data.map(
                normalizeEvent
              )
            : [],

      });

  } catch (
    error
  ) {

    console.error(
      "Get events error:",
      error
    );


    return res
      .status(500)
      .json({

        success:
          false,

        message:
          error?.message ||
          "Failed to load events.",

      });

  }

}


/* ============================================================
   GET PUBLISHED EVENTS
============================================================ */

async function getPublishedEvents(
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
          "events"
        )
        .select("*")
        .eq(
          "status",
          "published"
        )
        .order(
          "event_date",
          {
            ascending:
              true,
          }
        );


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

        events:
          Array.isArray(
            data
          )
            ? data.map(
                normalizeEvent
              )
            : [],

      });

  } catch (
    error
  ) {

    console.error(
      "Get published events error:",
      error
    );


    return res
      .status(500)
      .json({

        success:
          false,

        message:
          error?.message ||
          "Failed to load published events.",

      });

  }

}


/* ============================================================
   GET PUBLISHED EVENT BY SLUG
============================================================ */

async function getEventBySlug(
  req,
  res
) {

  try {

    const {
      slug,
    } =
      req.params;


    if (
      !slug
    ) {

      return res
        .status(400)
        .json({

          success:
            false,

          message:
            "Event slug is required.",

        });

    }


    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from(
          "events"
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
            "Event not found.",

        });

    }


    return res
      .status(200)
      .json({

        success:
          true,

        event:
          normalizeEvent(
            data
          ),

      });

  } catch (
    error
  ) {

    console.error(
      "Get event error:",
      error
    );


    return res
      .status(500)
      .json({

        success:
          false,

        message:
          error?.message ||
          "Failed to load event.",

      });

  }

}


/* ============================================================
   CREATE EVENT
============================================================ */

async function createEvent(
  req,
  res
) {

  let uploadedImage =
    null;


  try {

    const rawInput =
      normalizeEventInput(
        req.body
      );


    const input =
      eventSchema.parse(
        rawInput
      );


    /* ========================================================
       IMAGE REQUIRED
    ======================================================== */

    if (
      !req.file
    ) {

      return res
        .status(400)
        .json({

          success:
            false,

          message:
            "Please choose an event image.",

        });

    }


    /* ========================================================
       VALIDATE DATE
    ======================================================== */

    const eventDate =
      new Date(
        input.eventDate
      );


    if (
      Number.isNaN(
        eventDate.getTime()
      )
    ) {

      return res
        .status(400)
        .json({

          success:
            false,

          message:
            "Please provide a valid event date.",

        });

    }


    /* ========================================================
       CHECK SLUG
    ======================================================== */

    const {
      data:
        existingEvent,

      error:
        slugError,
    } =
      await supabaseAdmin
        .from(
          "events"
        )
        .select(
          "id"
        )
        .eq(
          "slug",
          input.slug
        )
        .maybeSingle();


    if (
      slugError
    ) {

      throw slugError;

    }


    if (
      existingEvent
    ) {

      return res
        .status(409)
        .json({

          success:
            false,

          message:
            "An event with this title already exists.",

        });

    }


    /* ========================================================
       UPLOAD IMAGE
    ======================================================== */

    uploadedImage =
      await uploadEventImage(
        req.file
      );


    /* ========================================================
       CREATE DATABASE EVENT
    ======================================================== */

    const now =
      new Date()
        .toISOString();


    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from(
          "events"
        )
        .insert({

          title:
            input.title,

          slug:
            input.slug,

          description:
            input.description ||
            null,

          location:
            input.location ||
            null,

          type:
            input.type ||
            null,

          status:
            input.status,

          event_date:
            eventDate
              .toISOString(),

          image_url:
            uploadedImage
              .publicUrl,

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

      if (
        uploadedImage
          ?.imagePath
      ) {

        await supabaseAdmin
          .storage
          .from(
            EVENT_IMAGE_BUCKET
          )
          .remove([
            uploadedImage
              .imagePath,
          ]);


        uploadedImage =
          null;

      }


      throw error;

    }


    /* ========================================================
       NOTIFY IF CREATED AS PUBLISHED
    ======================================================== */

    if (
      data.status ===
      "published"
    ) {

      sendEventNotification(
        data
      );

    }


    return res
      .status(201)
      .json({

        success:
          true,

        event:
          normalizeEvent(
            data
          ),

        message:
          "Event created successfully.",

      });

  } catch (
    error
  ) {

    /* Cleanup only when the DB record was not successfully saved */

    if (
      uploadedImage
        ?.imagePath
    ) {

      try {

        await supabaseAdmin
          .storage
          .from(
            EVENT_IMAGE_BUCKET
          )
          .remove([
            uploadedImage
              .imagePath,
          ]);

      } catch (
        cleanupError
      ) {

        console.warn(
          "Unable to clean up uploaded event image:",
          cleanupError
        );

      }

    }


    if (
      error?.name ===
      "ZodError"
    ) {

      console.error(
        "Create event validation error:",
        error.issues
      );


      return res
        .status(400)
        .json({

          success:
            false,

          message:
            error.issues
              ?.[0]
              ?.message ||
            "Invalid event information.",

        });

    }


    console.error(
      "Create event error:",
      error
    );


    return res
      .status(500)
      .json({

        success:
          false,

        message:
          error?.message ||
          "Failed to create event.",

      });

  }

}


/* ============================================================
   UPDATE EVENT
============================================================ */

async function updateEvent(
  req,
  res
) {

  let newUploadedImage =
    null;


  try {

    const {
      id,
    } =
      req.params;


    if (
      !id
    ) {

      return res
        .status(400)
        .json({

          success:
            false,

          message:
            "Event ID is required.",

        });

    }


    const rawInput =
      normalizeUpdateInput(
        req.body
      );


    const input =
      updateEventSchema.parse(
        rawInput
      );


    /* ========================================================
       CHECK EXISTING EVENT
    ======================================================== */

    const {
      data:
        existingEvent,

      error:
        existingError,
    } =
      await supabaseAdmin
        .from(
          "events"
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
      !existingEvent
    ) {

      return res
        .status(404)
        .json({

          success:
            false,

          message:
            "Event not found.",

        });

    }


    if (
      Object.keys(
        input
      ).length === 0 &&
      !req.file
    ) {

      return res
        .status(400)
        .json({

          success:
            false,

          message:
            "No event changes were provided.",

        });

    }


    /* ========================================================
       DETECT PREVIOUS PUBLICATION STATE
    ======================================================== */

    const wasPublished =
      existingEvent.status ===
      "published";


    /* ========================================================
       CHECK SLUG
    ======================================================== */

    if (
      input.slug &&
      input.slug !==
        existingEvent.slug
    ) {

      const {
        data:
          conflictingEvent,

        error:
          conflictError,
      } =
        await supabaseAdmin
          .from(
            "events"
          )
          .select(
            "id"
          )
          .eq(
            "slug",
            input.slug
          )
          .neq(
            "id",
            id
          )
          .maybeSingle();


      if (
        conflictError
      ) {

        throw conflictError;

      }


      if (
        conflictingEvent
      ) {

        return res
          .status(409)
          .json({

            success:
              false,

            message:
              "Another event already uses this title.",

          });

      }

    }


    /* ========================================================
       PREPARE UPDATE
    ======================================================== */

    const updates = {

      updated_at:
        new Date()
          .toISOString(),

    };


    if (
      input.title !==
      undefined
    ) {

      updates.title =
        input.title;

    }


    if (
      input.slug !==
      undefined
    ) {

      updates.slug =
        input.slug;

    }


    if (
      input.description !==
      undefined
    ) {

      updates.description =
        input.description ||
        null;

    }


    if (
      input.location !==
      undefined
    ) {

      updates.location =
        input.location ||
        null;

    }


    if (
      input.type !==
      undefined
    ) {

      updates.type =
        input.type ||
        null;

    }


    if (
      input.status !==
      undefined
    ) {

      updates.status =
        input.status;

    }


    if (
      input.eventDate !==
      undefined
    ) {

      const eventDate =
        new Date(
          input.eventDate
        );


      if (
        Number.isNaN(
          eventDate.getTime()
        )
      ) {

        return res
          .status(400)
          .json({

            success:
              false,

            message:
              "Please provide a valid event date.",

          });

      }


      updates.event_date =
        eventDate
          .toISOString();

    }


    /* ========================================================
       NEW IMAGE
    ======================================================== */

    if (
      req.file
    ) {

      newUploadedImage =
        await uploadEventImage(
          req.file
        );


      updates.image_url =
        newUploadedImage
          .publicUrl;

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
          "events"
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

      if (
        newUploadedImage
          ?.imagePath
      ) {

        await supabaseAdmin
          .storage
          .from(
            EVENT_IMAGE_BUCKET
          )
          .remove([
            newUploadedImage
              .imagePath,
          ]);


        newUploadedImage =
          null;

      }


      throw error;

    }


    /* ========================================================
       DELETE OLD IMAGE AFTER DATABASE SUCCESS
    ======================================================== */

    if (
      req.file &&
      existingEvent
        .image_url &&
      existingEvent
        .image_url !==
        data.image_url
    ) {

      await deleteEventImage(
        existingEvent
          .image_url
      );

    }


    /* ========================================================
       NOTIFY ONLY ON FIRST MOVE INTO PUBLISHED
    ======================================================== */

    const isNowPublished =
      data.status ===
      "published";


    if (
      !wasPublished &&
      isNowPublished
    ) {

      sendEventNotification(
        data
      );

    }


    return res
      .status(200)
      .json({

        success:
          true,

        event:
          normalizeEvent(
            data
          ),

        message:
          "Event updated successfully.",

      });

  } catch (
    error
  ) {

    if (
      newUploadedImage
        ?.imagePath
    ) {

      try {

        await supabaseAdmin
          .storage
          .from(
            EVENT_IMAGE_BUCKET
          )
          .remove([
            newUploadedImage
              .imagePath,
          ]);

      } catch (
        cleanupError
      ) {

        console.warn(
          "Unable to clean up new event image:",
          cleanupError
        );

      }

    }


    if (
      error?.name ===
      "ZodError"
    ) {

      console.error(
        "Update event validation error:",
        error.issues
      );


      return res
        .status(400)
        .json({

          success:
            false,

          message:
            error.issues
              ?.[0]
              ?.message ||
            "Invalid event information.",

        });

    }


    console.error(
      "Update event error:",
      error
    );


    return res
      .status(500)
      .json({

        success:
          false,

        message:
          error?.message ||
          "Failed to update event.",

      });

  }

}


/* ============================================================
   DELETE EVENT
============================================================ */

async function deleteEvent(
  req,
  res
) {

  try {

    const {
      id,
    } =
      req.params;


    if (
      !id ||
      !String(
        id
      ).trim()
    ) {

      return res
        .status(400)
        .json({

          success:
            false,

          message:
            "Event ID is required.",

        });

    }


    /* ========================================================
       FIND EVENT
    ======================================================== */

    const {
      data:
        existingEvent,

      error:
        existingError,
    } =
      await supabaseAdmin
        .from(
          "events"
        )
        .select(
          "id, title, image_url"
        )
        .eq(
          "id",
          id
        )
        .maybeSingle();


    if (
      existingError
    ) {

      console.error(
        "Delete event lookup error:",
        existingError
      );


      return res
        .status(500)
        .json({

          success:
            false,

          message:
            existingError.message ||
            "Unable to find the event before deletion.",

        });

    }


    if (
      !existingEvent
    ) {

      return res
        .status(404)
        .json({

          success:
            false,

          message:
            "Event not found.",

        });

    }


    /* ========================================================
       DELETE DATABASE ROW
    ======================================================== */

    const {
      data:
        deletedEvent,

      error:
        deleteError,
    } =
      await supabaseAdmin
        .from(
          "events"
        )
        .delete()
        .eq(
          "id",
          id
        )
        .select(
          "id, title, image_url"
        )
        .maybeSingle();


    if (
      deleteError
    ) {

      console.error(
        "Supabase event delete error:",
        deleteError
      );


      return res
        .status(500)
        .json({

          success:
            false,

          message:
            deleteError.message ||
            "Failed to delete event from the database.",

        });

    }


    if (
      !deletedEvent
    ) {

      return res
        .status(500)
        .json({

          success:
            false,

          message:
            "The event could not be confirmed as deleted.",

        });

    }


    /* ========================================================
       DELETE IMAGE
    ======================================================== */

    const imageUrl =
      deletedEvent.image_url ||
      existingEvent.image_url;


    let imageDeleted =
      true;


    if (
      imageUrl
    ) {

      const imageResult =
        await deleteEventImage(
          imageUrl
        );


      imageDeleted =
        imageResult.success;

    }


    return res
      .status(200)
      .json({

        success:
          true,

        deletedEvent: {

          id:
            deletedEvent.id,

          title:
            deletedEvent.title,

        },

        imageDeleted,

        message:
          "Event deleted successfully.",

      });

  } catch (
    error
  ) {

    console.error(
      "Delete event exception:",
      error
    );


    return res
      .status(500)
      .json({

        success:
          false,

        message:
          error?.message ||
          "Failed to delete event.",

      });

  }

}


/* ============================================================
   EXPORTS
============================================================ */

module.exports = {

  getEvents,

  getPublishedEvents,

  getEventBySlug,

  createEvent,

  updateEvent,

  deleteEvent,

};