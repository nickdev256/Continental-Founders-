const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(/\/+$/, "");


/* ============================================================
   API REQUEST HELPER
============================================================ */

async function request(
  endpoint,
  options = {}
) {
  const hasBody =
    options.body !== undefined &&
    options.body !== null;

  const response = await fetch(
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

        ...options.headers,
      },
    }
  );

  let data = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.error ||
        "Something went wrong."
    );
  }

  return data;
}


/* ============================================================
   NEWSLETTER - GET SUBSCRIBERS
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
   NEWSLETTER - UPDATE SUBSCRIBER
============================================================ */

export async function updateNewsletterSubscriber(
  subscriberId,
  status
) {
  if (!subscriberId) {
    throw new Error(
      "Subscriber ID is required."
    );
  }

  return request(
    `/api/newsletter/subscribers/${subscriberId}`,
    {
      method: "PATCH",

      body: JSON.stringify({
        status,
      }),
    }
  );
}


/* ============================================================
   NEWSLETTER - DELETE SUBSCRIBER
============================================================ */

export async function deleteNewsletterSubscriber(
  subscriberId
) {
  if (!subscriberId) {
    throw new Error(
      "Subscriber ID is required."
    );
  }

  return request(
    `/api/newsletter/subscribers/${subscriberId}`,
    {
      method: "DELETE",
    }
  );
}


/* ============================================================
   NEWSLETTER - UPLOAD FEATURED IMAGE

   POST /api/newsletter/admin/upload-image

   This request deliberately does NOT use request()
   because FormData must not receive application/json.
============================================================ */

export async function uploadNewsletterImage(
  file
) {
  if (!file) {
    throw new Error(
      "Please choose an image."
    );
  }

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  const maxFileSize =
    5 * 1024 * 1024;


  /* ==========================================================
     VALIDATE IMAGE TYPE
  ========================================================== */

  if (
    !allowedTypes.includes(
      file.type
    )
  ) {
    throw new Error(
      "Please upload a JPG, PNG or WEBP image."
    );
  }


  /* ==========================================================
     VALIDATE IMAGE SIZE
  ========================================================== */

  if (
    file.size >
    maxFileSize
  ) {
    throw new Error(
      "The image is too large. Maximum size is 5 MB."
    );
  }


  /* ==========================================================
     CREATE FORM DATA

     The field name "image" must match Multer:
     upload.single("image")
  ========================================================== */

  const formData =
    new FormData();

  formData.append(
    "image",
    file
  );


  /* ==========================================================
     UPLOAD IMAGE

     IMPORTANT:
     Do not manually set Content-Type.

     The browser automatically generates:
     multipart/form-data; boundary=...
  ========================================================== */

  let response;

  try {
    response = await fetch(
      `${API_URL}/api/newsletter/admin/upload-image`,
      {
        method: "POST",

        credentials:
          "include",

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