/* ============================================================
   CONTINENTAL FOUNDERS
   ADMIN API SERVICE

   File:
   src/services/adminApi.js
============================================================ */


/* ============================================================
   API CONFIGURATION
============================================================ */

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(/\/+$/, "");


/* ============================================================
   GENERIC API REQUEST HELPER
============================================================ */

async function request(
  endpoint,
  options = {}
) {
  const hasBody =
    options.body !== undefined &&
    options.body !== null;

  let response;

  try {
    response = await fetch(
      `${API_URL}${endpoint}`,
      {
        ...options,

        credentials:
          "include",

        headers: {
          Accept:
            "application/json",

          ...(hasBody
            ? {
                "Content-Type":
                  "application/json",
              }
            : {}),

          ...(options.headers ||
            {}),
        },
      }
    );
  } catch (networkError) {
    console.error(
      `API network error for ${endpoint}:`,
      networkError
    );

    throw new Error(
      "Unable to connect to the server. Please check your connection and try again."
    );
  }


  let data = {};

  try {
    data =
      await response.json();
  } catch {
    data = {};
  }


  if (!response.ok) {
    if (
      response.status ===
      400
    ) {
      throw new Error(
        data?.message ||
          data?.error ||
          "Please check the information you entered."
      );
    }


    if (
      response.status ===
      401
    ) {
      throw new Error(
        data?.message ||
          data?.error ||
          "Your session has expired. Please sign in again."
      );
    }


    if (
      response.status ===
      403
    ) {
      throw new Error(
        data?.message ||
          data?.error ||
          "You do not have permission to perform this action."
      );
    }


    if (
      response.status ===
      404
    ) {
      throw new Error(
        data?.message ||
          data?.error ||
          "The requested resource could not be found."
      );
    }


    if (
      response.status ===
      409
    ) {
      throw new Error(
        data?.message ||
          data?.error ||
          "This action conflicts with the current newsletter status."
      );
    }


    if (
      response.status ===
      429
    ) {
      throw new Error(
        data?.message ||
          data?.error ||
          "Too many requests. Please wait a moment and try again."
      );
    }


    if (
      response.status >=
      500
    ) {
      throw new Error(
        data?.message ||
          data?.error ||
          "The server could not complete the request. Please try again."
      );
    }


    throw new Error(
      data?.message ||
        data?.error ||
        "Something went wrong."
    );
  }


  return data;
}


/* ============================================================
   STRING HELPERS
============================================================ */

function cleanString(
  value
) {
  return String(
    value ?? ""
  ).trim();
}


/* ============================================================
   IMAGE ARRAY NORMALIZATION

   The backend stores newsletter additional images as:

   images: [
     "https://...",
     "https://..."
   ]

   This helper also tolerates frontend image objects such as:

   {
     url: "https://..."
   }
============================================================ */

function normalizeNewsletterImages(
  images
) {
  if (
    !Array.isArray(images)
  ) {
    return [];
  }


  const urls = [];

  const seen =
    new Set();


  for (
    const image of images
  ) {
    const url =
      typeof image ===
      "string"
        ? cleanString(
            image
          )
        : cleanString(
            image?.url ||
              image?.publicUrl ||
              image?.imageUrl
          );


    if (!url) {
      continue;
    }


    if (
      seen.has(url)
    ) {
      continue;
    }


    seen.add(url);

    urls.push(url);
  }


  return urls;
}


/* ============================================================
   NORMALIZE NEWSLETTER CAMPAIGN PAYLOAD

   Audience is deliberately NOT taken from the UI.

   The backend now has one audience only:
   all active subscribers.
============================================================ */

function normalizeNewsletterCampaignPayload(
  payload = {}
) {
  return {
    title:
      cleanString(
        payload.title
      ),

    subject:
      cleanString(
        payload.subject
      ),

    previewText:
      cleanString(
        payload.previewText ??
          payload.preview_text
      ),

    featuredImage:
      cleanString(
        payload.featuredImage ??
          payload.featured_image
      ),

    images:
      normalizeNewsletterImages(
        payload.images
      ),

    content:
      cleanString(
        payload.content
      ),

    ctaText:
      cleanString(
        payload.ctaText ??
          payload.cta_text
      ),

    ctaLink:
      cleanString(
        payload.ctaLink ??
          payload.cta_link
      ),
  };
}


/* ============================================================
   NEWSLETTER SERVICE STATUS
============================================================ */

export async function getNewsletterStatus() {
  return request(
    "/api/newsletter/status",
    {
      method:
        "GET",
    }
  );
}


/* ============================================================
   NEWSLETTER SUBSCRIBERS
============================================================ */


/* ============================================================
   GET NEWSLETTER SUBSCRIBERS
============================================================ */

export async function getNewsletterSubscribers() {
  return request(
    "/api/newsletter/subscribers",
    {
      method:
        "GET",
    }
  );
}


/* ============================================================
   UPDATE NEWSLETTER SUBSCRIBER
============================================================ */

export async function updateNewsletterSubscriber(
  id,
  payload
) {
  if (!id) {
    throw new Error(
      "Subscriber ID is required."
    );
  }


  return request(
    `/api/newsletter/subscribers/${encodeURIComponent(
      id
    )}`,
    {
      method:
        "PATCH",

      body:
        JSON.stringify(
          payload || {}
        ),
    }
  );
}


/* ============================================================
   DELETE NEWSLETTER SUBSCRIBER
============================================================ */

export async function deleteNewsletterSubscriber(
  id
) {
  if (!id) {
    throw new Error(
      "Subscriber ID is required."
    );
  }


  return request(
    `/api/newsletter/subscribers/${encodeURIComponent(
      id
    )}`,
    {
      method:
        "DELETE",
    }
  );
}


/* ============================================================
   NEWSLETTER IMAGE UPLOAD

   IMPORTANT:

   A newsletter can contain multiple images, but the backend
   accepts ONE image per upload request.

   AdminNewsletter.jsx can therefore call:

   uploadNewsletterImages(files)

   which uploads the selected files one at a time and returns
   an array of public URLs.
============================================================ */

export async function uploadNewsletterImage(
  file
) {
  if (!file) {
    throw new Error(
      "Please choose an image to upload."
    );
  }


  const allowedTypes =
    new Set([
      "image/jpeg",
      "image/png",
      "image/webp",
    ]);


  if (
    !allowedTypes.has(
      file.type
    )
  ) {
    throw new Error(
      "Please choose a JPG, PNG or WEBP image."
    );
  }


  const MAX_FILE_SIZE =
    5 * 1024 * 1024;


  if (
    file.size >
    MAX_FILE_SIZE
  ) {
    throw new Error(
      "The image is too large. Maximum size is 5 MB."
    );
  }


  const formData =
    new FormData();


  formData.append(
    "image",
    file
  );


  let response;


  try {
    response =
      await fetch(
        `${API_URL}/api/newsletter/admin/upload-image`,
        {
          method:
            "POST",

          credentials:
            "include",

          /*
           * Do NOT manually set
           * Content-Type.
           *
           * The browser must create
           * the multipart boundary.
           */
          headers: {
            Accept:
              "application/json",
          },

          body:
            formData,
        }
      );
  } catch (networkError) {
    console.error(
      "Newsletter image upload network error:",
      networkError
    );


    throw new Error(
      "Unable to connect to the server. Please check your connection and try again."
    );
  }


  let data = {};


  try {
    data =
      await response.json();
  } catch {
    data = {};
  }


  if (!response.ok) {
    if (
      response.status ===
      401
    ) {
      throw new Error(
        data?.message ||
          "Your session has expired. Please sign in again."
      );
    }


    if (
      response.status ===
      403
    ) {
      throw new Error(
        data?.message ||
          "You do not have permission to upload newsletter images."
      );
    }


    if (
      response.status ===
      413
    ) {
      throw new Error(
        "The image is too large. Maximum size is 5 MB."
      );
    }


    if (
      response.status ===
      429
    ) {
      throw new Error(
        data?.message ||
          "Too many upload requests. Please wait and try again."
      );
    }


    throw new Error(
      data?.message ||
        data?.error ||
        "Unable to upload newsletter image."
    );
  }


  const publicUrl =
    data?.url ||
    data?.publicUrl ||
    data?.imageUrl ||
    data?.image?.url ||
    data?.image?.publicUrl ||
    "";


  if (!publicUrl) {
    console.error(
      "Newsletter upload response did not contain a URL:",
      data
    );


    throw new Error(
      "The image uploaded, but the server did not return its public URL."
    );
  }


  return {
    ...data,

    url:
      publicUrl,

    publicUrl:
      publicUrl,

    image: {
      ...(data?.image ||
        {}),

      url:
        publicUrl,

      publicUrl:
        publicUrl,
    },
  };
}


/* ============================================================
   UPLOAD MULTIPLE NEWSLETTER IMAGES

   This is a frontend convenience helper.

   It still respects the backend's one-file-per-request design.
============================================================ */

export async function uploadNewsletterImages(
  files
) {
  const selectedFiles =
    Array.from(
      files || []
    );


  if (
    selectedFiles.length ===
    0
  ) {
    return [];
  }


  const uploadedImages =
    [];


  for (
    const file of
    selectedFiles
  ) {
    const result =
      await uploadNewsletterImage(
        file
      );


    const url =
      result?.url ||
      result?.publicUrl ||
      result?.image?.url ||
      "";


    if (!url) {
      throw new Error(
        `The image "${file.name}" uploaded without a public URL.`
      );
    }


    uploadedImages.push({
      url,

      publicUrl:
        url,

      name:
        file.name,

      type:
        file.type,

      size:
        file.size,

      path:
        result?.image?.path ||
        "",
    });
  }


  return uploadedImages;
}


/* ============================================================
   NEWSLETTER CAMPAIGNS
============================================================ */


/* ============================================================
   GET CAMPAIGNS
============================================================ */

export async function getNewsletterCampaigns() {
  return request(
    "/api/newsletter/campaigns",
    {
      method:
        "GET",
    }
  );
}


/* ============================================================
   GET NEWSLETTER ANALYTICS
============================================================ */

export async function getNewsletterAnalytics() {
  return request(
    "/api/newsletter/analytics",
    {
      method:
        "GET",
    }
  );
}


/* ============================================================
   CREATE CAMPAIGN

   `audience` is intentionally not sent.

   `images` is always normalized into an array of public URLs.
============================================================ */

export async function createNewsletterCampaign(
  payload
) {
  const normalizedPayload =
    normalizeNewsletterCampaignPayload(
      payload
    );


  return request(
    "/api/newsletter/campaigns",
    {
      method:
        "POST",

      body:
        JSON.stringify(
          normalizedPayload
        ),
    }
  );
}


/* ============================================================
   UPDATE CAMPAIGN
============================================================ */

export async function updateNewsletterCampaign(
  id,
  payload
) {
  if (!id) {
    throw new Error(
      "Campaign ID is required."
    );
  }


  const normalizedPayload =
    normalizeNewsletterCampaignPayload(
      payload
    );


  return request(
    `/api/newsletter/campaigns/${encodeURIComponent(
      id
    )}`,
    {
      method:
        "PATCH",

      body:
        JSON.stringify(
          normalizedPayload
        ),
    }
  );
}


/* ============================================================
   DELETE CAMPAIGN

   This works for:
   - draft
   - scheduled
   - failed
   - sent/published

   The backend protects campaigns currently being sent.
============================================================ */

export async function deleteNewsletterCampaign(
  id
) {
  if (!id) {
    throw new Error(
      "Campaign ID is required."
    );
  }


  return request(
    `/api/newsletter/campaigns/${encodeURIComponent(
      id
    )}`,
    {
      method:
        "DELETE",
    }
  );
}


/* ============================================================
   DUPLICATE CAMPAIGN

   Recommended for reusing a published newsletter.
============================================================ */

export async function duplicateNewsletterCampaign(
  id
) {
  if (!id) {
    throw new Error(
      "Campaign ID is required."
    );
  }


  return request(
    `/api/newsletter/campaigns/${encodeURIComponent(
      id
    )}/duplicate`,
    {
      method:
        "POST",
    }
  );
}


/* ============================================================
   GET CAMPAIGN
============================================================ */

export async function getNewsletterCampaign(
  id
) {
  if (!id) {
    throw new Error(
      "Campaign ID is required."
    );
  }


  return request(
    `/api/newsletter/campaigns/${encodeURIComponent(
      id
    )}`,
    {
      method:
        "GET",
    }
  );
}


/* ============================================================
   GET CAMPAIGN RECIPIENT COUNT

   This is always the current number of active subscribers.
============================================================ */

export async function getNewsletterCampaignRecipientCount(
  id
) {
  if (!id) {
    throw new Error(
      "Campaign ID is required."
    );
  }


  return request(
    `/api/newsletter/campaigns/${encodeURIComponent(
      id
    )}/recipients`,
    {
      method:
        "GET",
    }
  );
}


/* ============================================================
   SCHEDULE CAMPAIGN
============================================================ */

export async function scheduleNewsletterCampaign(
  id,
  scheduledAt
) {
  if (!id) {
    throw new Error(
      "Campaign ID is required."
    );
  }


  if (!scheduledAt) {
    throw new Error(
      "Please choose a delivery date and time."
    );
  }


  return request(
    `/api/newsletter/campaigns/${encodeURIComponent(
      id
    )}/schedule`,
    {
      method:
        "POST",

      body:
        JSON.stringify({
          scheduledAt,
        }),
    }
  );
}


/* ============================================================
   CANCEL CAMPAIGN SCHEDULE
============================================================ */

export async function cancelNewsletterSchedule(
  id
) {
  if (!id) {
    throw new Error(
      "Campaign ID is required."
    );
  }


  return request(
    `/api/newsletter/campaigns/${encodeURIComponent(
      id
    )}/cancel-schedule`,
    {
      method:
        "POST",
    }
  );
}


/* ============================================================
   SEND TEST NEWSLETTER

   Sends one test copy.

   It does not publish the newsletter and does not broadcast
   to subscribers.
============================================================ */

export async function sendNewsletterTest(
  id,
  email
) {
  if (!id) {
    throw new Error(
      "Campaign ID is required."
    );
  }


  const cleanEmail =
    String(
      email || ""
    )
      .trim()
      .toLowerCase();


  if (!cleanEmail) {
    throw new Error(
      "Please enter a test email address."
    );
  }


  return request(
    `/api/newsletter/campaigns/${encodeURIComponent(
      id
    )}/test`,
    {
      method:
        "POST",

      body:
        JSON.stringify({
          email:
            cleanEmail,
        }),
    }
  );
}


/* ============================================================
   SEND NEWSLETTER CAMPAIGN

   No audience argument is accepted.

   The backend automatically broadcasts to ALL ACTIVE
   SUBSCRIBERS.
============================================================ */

export async function sendNewsletterCampaign(
  id
) {
  if (!id) {
    throw new Error(
      "Campaign ID is required."
    );
  }


  return request(
    `/api/newsletter/campaigns/${encodeURIComponent(
      id
    )}/send`,
    {
      method:
        "POST",
    }
  );
}


/* ============================================================
   GET CAMPAIGN DELIVERIES
============================================================ */

export async function getNewsletterCampaignDeliveries(
  id
) {
  if (!id) {
    throw new Error(
      "Campaign ID is required."
    );
  }


  return request(
    `/api/newsletter/campaigns/${encodeURIComponent(
      id
    )}/deliveries`,
    {
      method:
        "GET",
    }
  );
}


/* ============================================================
   OPTIONAL AUTH / ADMIN HELPERS
============================================================ */


/* ============================================================
   GET CURRENT ADMIN
============================================================ */

export async function getCurrentAdmin() {
  return request(
    "/api/auth/me",
    {
      method:
        "GET",
    }
  );
}


/* ============================================================
   LOGOUT ADMIN
============================================================ */

export async function logoutAdmin() {
  return request(
    "/api/auth/logout",
    {
      method:
        "POST",
    }
  );
}


/* ============================================================
   EXPORT HELPERS

   Useful for debugging/testing and the Newsletter Studio.
============================================================ */

export {
  API_URL,
  normalizeNewsletterImages,
  normalizeNewsletterCampaignPayload,
};