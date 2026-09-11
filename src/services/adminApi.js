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

  const response =
    await fetch(
      `${API_URL}${endpoint}`,
      {
        ...options,

        headers: {
          "Content-Type":
            "application/json",

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


  if (!response.ok) {

    throw new Error(
      data.message ||
      "Something went wrong."
    );

  }


  return data;
}


/* ============================================================
   NEWSLETTER
============================================================ */

export async function getNewsletterSubscribers() {

  return request(
    "/api/newsletter/subscribers"
  );

}