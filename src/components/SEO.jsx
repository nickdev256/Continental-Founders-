import React from "react";
import { Helmet } from "react-helmet-async";

const SITE_URL = "https://continentalfounders.org";

const DEFAULT_TITLE =
  "Continental Founders | Connecting African Founders to Global Opportunity";

const DEFAULT_DESCRIPTION =
  "Continental Founders connects African founders with universities, mentors, business leaders, investors, markets, and global opportunity networks through entrepreneurship, collaboration, and venture development.";

const DEFAULT_IMAGE =
  `${SITE_URL}/assets/continental-founders-logo.png`;

export default function SEO({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  path = "/",
  image = DEFAULT_IMAGE,
  type = "website",
  noIndex = false,
}) {
  const normalizedPath =
    path === "/" ? "/" : `/${path.replace(/^\/+|\/+$/g, "")}`;

  const canonicalUrl =
    normalizedPath === "/"
      ? `${SITE_URL}/`
      : `${SITE_URL}${normalizedPath}`;

  const imageUrl = image.startsWith("http")
    ? image
    : `${SITE_URL}${image.startsWith("/") ? image : `/${image}`}`;

  const robots = noIndex
    ? "noindex, nofollow"
    : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";

  return (
    <Helmet>
      {/* Primary SEO */}
      <title>{title}</title>

      <meta
        name="description"
        content={description}
      />

      <meta
        name="robots"
        content={robots}
      />

      <meta
        name="googlebot"
        content={robots}
      />

      {/* Canonical */}
      <link
        rel="canonical"
        href={canonicalUrl}
      />

      {/* Open Graph */}
      <meta
        property="og:type"
        content={type}
      />

      <meta
        property="og:site_name"
        content="Continental Founders"
      />

      <meta
        property="og:title"
        content={title}
      />

      <meta
        property="og:description"
        content={description}
      />

      <meta
        property="og:url"
        content={canonicalUrl}
      />

      <meta
        property="og:image"
        content={imageUrl}
      />

      <meta
        property="og:image:secure_url"
        content={imageUrl}
      />

      <meta
        property="og:image:alt"
        content="Continental Founders"
      />

      <meta
        property="og:locale"
        content="en_US"
      />

      {/* X / Twitter */}
      <meta
        name="twitter:card"
        content="summary_large_image"
      />

      <meta
        name="twitter:title"
        content={title}
      />

      <meta
        name="twitter:description"
        content={description}
      />

      <meta
        name="twitter:image"
        content={imageUrl}
      />

      <meta
        name="twitter:image:alt"
        content="Continental Founders"
      />
    </Helmet>
  );
}