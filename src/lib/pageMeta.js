// Detail pages (an event, insight or venture) call this once their data
// has loaded, so search results, browser tabs and link previews show that
// item's own title, summary and image instead of a generic one.
// App.jsx's SEOManager resets everything on the next page change.

const SITE_NAME = "Continental Founders";
const MAX_DESCRIPTION = 160;

function setMeta(attribute, key, content) {
  if (!content) return;

  let element = document.head.querySelector(`meta[${attribute}="${key}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.setAttribute("content", content);
}

// Plain text, trimmed to a search-snippet length on a word boundary.
function toSummary(text) {
  const plain = String(text || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (plain.length <= MAX_DESCRIPTION) return plain;

  return `${plain.slice(0, MAX_DESCRIPTION - 1).replace(/\s+\S*$/, "")}…`;
}

function toAbsoluteUrl(url) {
  if (!url) return "";
  try {
    return new URL(url, window.location.origin).href;
  } catch {
    return "";
  }
}

export function setPageMeta({ title, description, image }) {
  if (!title) return;

  const fullTitle = `${title} | ${SITE_NAME}`;
  const summary = toSummary(description);
  const imageUrl = toAbsoluteUrl(image);

  document.title = fullTitle;

  setMeta("name", "description", summary);
  setMeta("property", "og:title", fullTitle);
  setMeta("property", "og:description", summary);
  setMeta("property", "og:image", imageUrl);
  setMeta("name", "twitter:title", fullTitle);
  setMeta("name", "twitter:description", summary);
  setMeta("name", "twitter:image", imageUrl);
}

/**
 * Adds structured data (JSON-LD) for this page, such as an Event, so
 * search engines can show its date and place. Returns a cleanup that
 * removes it when the page is left.
 */
export function setPageSchema(data) {
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.dataset.pageSchema = "true";
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);

  return () => script.remove();
}
