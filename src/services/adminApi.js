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

        credentials: "include",

        headers: {
          Accept: "application/json",

          ...(hasBody
            ? {
                "Content-Type":
                  "application/json",
              }
            : {}),

          ...(options.headers || {}),
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


  /* ==========================================================
     READ RESPONSE
  ========================================================== */

  let data = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }


  /* ==========================================================
     HANDLE ERRORS
  ========================================================== */

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error(
        data?.message ||
          data?.error ||
          "Your session has expired. Please sign in again."
      );
    }

    if (response.status === 403) {
      throw new Error(
        data?.message ||
          data?.error ||
          "You do not have permission to perform this action."
      );
    }

    if (response.status === 404) {
      throw new Error(
        data?.message ||
          data?.error ||
          "The requested resource could not be found."
      );
    }

    if (response.status === 429) {
      throw new Error(
        data?.message ||
          data?.error ||
          "Too many requests. Please wait a moment and try again."
      );
    }

    if (response.status >= 500) {
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
   NEWSLETTER SUBSCRIBERS
============================================================ */


/* ============================================================
   GET NEWSLETTER SUBSCRIBERS
============================================================ */

export async function getNewsletterSubscribers() {
  return request(
    "/api/newsletter/subscribers",
    {
      method: "GET",
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
      method: "PATCH",

      body: JSON.stringify(
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
      method: "DELETE",
    }
  );
}


/* ============================================================
   NEWSLETTER IMAGE UPLOAD
============================================================ */

export async function uploadNewsletterImage(
  file
) {
  /* ==========================================================
     VALIDATE FILE
  ========================================================== */

  if (!file) {
    throw new Error(
      "Please choose an image to upload."
    );
  }


  const allowedTypes = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
  ]);


  if (!allowedTypes.has(file.type)) {
    throw new Error(
      "Please choose a JPG, PNG or WEBP image."
    );
  }


  const MAX_FILE_SIZE =
    5 * 1024 * 1024;


  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      "The image is too large. Maximum size is 5 MB."
    );
  }


  /* ==========================================================
     CREATE FORM DATA

     IMPORTANT:
     Do not manually set Content-Type here.
     The browser automatically creates the multipart boundary.
  ========================================================== */

  const formData =
    new FormData();

  formData.append(
    "image",
    file
  );


  /* ==========================================================
     UPLOAD IMAGE
  ========================================================== */

  let response;

  try {
    response = await fetch(
      `${API_URL}/api/newsletter/admin/upload-image`,
      {
        method: "POST",

        credentials: "include",

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


  /* ==========================================================
     READ SERVER RESPONSE
  ========================================================== */

  let data = {};

  try {
    data =
      await response.json();
  } catch {
    data = {};
  }


  /* ==========================================================
     HANDLE SERVER ERROR
  ========================================================== */

  if (!response.ok) {
    if (
      response.status === 401
    ) {
      throw new Error(
        data?.message ||
          "Your session has expired. Please sign in again."
      );
    }

    if (
      response.status === 403
    ) {
      throw new Error(
        data?.message ||
          "You do not have permission to upload newsletter images."
      );
    }

    if (
      response.status === 413
    ) {
      throw new Error(
        "The image is too large. Maximum size is 5 MB."
      );
    }

    if (
      response.status === 429
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


  /* ==========================================================
     GET PUBLIC SUPABASE URL
  ========================================================== */

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


  /* ==========================================================
     NORMALIZE RESPONSE

     AdminNewsletter.jsx can reliably use:

     result.url
     result.publicUrl
     result.image.url
  ========================================================== */

  return {
    ...data,

    url:
      publicUrl,

    publicUrl:
      publicUrl,

    image: {
      ...(data?.image || {}),

      url:
        publicUrl,

      publicUrl:
        publicUrl,
    },
  };
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
      method: "GET",
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
      method: "GET",
    }
  );
}


/* ============================================================
   CREATE CAMPAIGN
============================================================ */

export async function createNewsletterCampaign(
  payload
) {
  return request(
    "/api/newsletter/campaigns",
    {
      method: "POST",

      body:
        JSON.stringify(
          payload || {}
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

  return request(
    `/api/newsletter/campaigns/${encodeURIComponent(
      id
    )}`,
    {
      method: "PATCH",

      body:
        JSON.stringify(
          payload || {}
        ),
    }
  );
}


/* ============================================================
   DELETE CAMPAIGN
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
      method: "DELETE",
    }
  );
}


/* ============================================================
   DUPLICATE CAMPAIGN
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
      method: "POST",
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
      method: "GET",
    }
  );
}


/* ============================================================
   GET CAMPAIGN RECIPIENT COUNT
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
      method: "GET",
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
      method: "POST",

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
      method: "POST",
    }
  );
}


/* ============================================================
   SEND TEST NEWSLETTER

   This sends a campaign to one test email address.
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
    String(email || "")
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
      method: "POST",

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

   This is the real broadcast endpoint used by the
   "Send Newsletter" button in AdminNewsletter.jsx.
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
      method: "POST",
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
      method: "GET",
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
      method: "GET",
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
      method: "POST",
    }
  );
}


/* ============================================================
   EXPORT API URL

   Useful for debugging if another frontend service needs
   access to the configured backend URL.
============================================================ */

export {
  API_URL,
};