const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";


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


  const response =
    await fetch(
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

          ...options.headers,
        },
      }
    );


  let data = {};


  try {

    data =
      await response.json();

  } catch {

    data = {};

  }


  if (
    !response.ok
  ) {

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
      method:
        "GET",
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

  return request(
    `/api/newsletter/subscribers/${subscriberId}`,
    {
      method:
        "PATCH",

      body:
        JSON.stringify({
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

  return request(
    `/api/newsletter/subscribers/${subscriberId}`,
    {
      method:
        "DELETE",
    }
  );

}