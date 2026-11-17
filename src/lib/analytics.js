// Visit and conversion tracking.
//
// Off by default. It switches on when ONE of these is set in the
// hosting environment (e.g. Vercel → Settings → Environment Variables):
//   VITE_PLAUSIBLE_DOMAIN = www.continentalfounders.org   (no cookies)
//   VITE_GA_ID            = G-XXXXXXXXXX                  (Google Analytics 4)
// The Privacy page reads `analyticsProvider` so its wording always
// matches what is actually running.

const GA_ID = import.meta.env.VITE_GA_ID || "";
const PLAUSIBLE_DOMAIN = import.meta.env.VITE_PLAUSIBLE_DOMAIN || "";

export const analyticsProvider = PLAUSIBLE_DOMAIN
  ? "plausible"
  : GA_ID
    ? "google"
    : null;

let started = false;

function loadScript(src, attributes = {}) {
  const script = document.createElement("script");
  script.async = true;
  script.src = src;
  Object.entries(attributes).forEach(([key, value]) => script.setAttribute(key, value));
  document.head.appendChild(script);
}

/** Loads the analytics script once, if a provider is configured. */
export function startAnalytics() {
  if (started || !analyticsProvider || import.meta.env.DEV) return;
  started = true;

  if (analyticsProvider === "plausible") {
    window.plausible =
      window.plausible ||
      function plausible(...args) {
        (window.plausible.q = window.plausible.q || []).push(args);
      };
    loadScript("https://plausible.io/js/script.manual.js", {
      "data-domain": PLAUSIBLE_DOMAIN,
    });
  } else {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };
    window.gtag("js", new Date());
    // Page views are sent on each route change, not just the first load.
    window.gtag("config", GA_ID, { send_page_view: false });
    loadScript(`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`);
  }

  trackClicks();
}

/** Records an event such as "application_submit". */
export function trackEvent(name, properties = {}) {
  if (!started) return;

  if (analyticsProvider === "plausible") {
    window.plausible?.(name, { props: properties });
  } else {
    window.gtag?.("event", name, properties);
  }
}

/** Records a page view (called on every route change). */
export function trackPageView() {
  if (!started) return;

  if (analyticsProvider === "plausible") {
    window.plausible?.("pageview", { u: window.location.href });
  } else {
    window.gtag?.("event", "page_view", {
      page_location: window.location.href,
      page_path: window.location.pathname,
      page_title: document.title,
    });
  }
}

// Clicks worth counting, without wiring every button by hand:
// any link to the application, anything marked data-track, and
// links that leave the site (event registration, social profiles).
function trackClicks() {
  document.addEventListener(
    "click",
    (event) => {
      const link = event.target.closest?.("a, button");
      if (!link) return;

      const label = (link.dataset.trackLabel || link.textContent || "").trim().slice(0, 60);
      const href = link.getAttribute("href") || "";

      if (link.dataset.track) {
        trackEvent(link.dataset.track, { label });
      } else if (href.startsWith("/cfcv/apply")) {
        trackEvent("apply_click", { label, page: window.location.pathname });
      } else if (/^https?:\/\//.test(href) && !href.includes(window.location.host)) {
        trackEvent("outbound_click", { url: href });
      }
    },
    { capture: true }
  );
}
