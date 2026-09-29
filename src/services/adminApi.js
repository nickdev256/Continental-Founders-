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
/* Newsletter campaign administration. All requests use the admin cookie. */
export const getNewsletterCampaigns = () => request("/api/newsletter/campaigns", { method: "GET" });
export const getNewsletterAnalytics = () => request("/api/newsletter/analytics", { method: "GET" });
export const createNewsletterCampaign = (payload) => request("/api/newsletter/campaigns", { method: "POST", body: JSON.stringify(payload) });
export const updateNewsletterCampaign = (id, payload) => request(`/api/newsletter/campaigns/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(payload) });
export const deleteNewsletterCampaign = (id) => request(`/api/newsletter/campaigns/${encodeURIComponent(id)}`, { method: "DELETE" });
export const duplicateNewsletterCampaign = (id) => request(`/api/newsletter/campaigns/${encodeURIComponent(id)}/duplicate`, { method: "POST" });
export const scheduleNewsletterCampaign = (id, scheduledAt) => request(`/api/newsletter/campaigns/${encodeURIComponent(id)}/schedule`, { method: "POST", body: JSON.stringify({ scheduledAt }) });
export const cancelNewsletterSchedule = (id) => request(`/api/newsletter/campaigns/${encodeURIComponent(id)}/cancel-schedule`, { method: "POST" });
export const sendNewsletterTest = (id, email) => request(`/api/newsletter/campaigns/${encodeURIComponent(id)}/test`, { method: "POST", body: JSON.stringify({ email }) });
