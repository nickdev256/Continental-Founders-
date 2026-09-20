import React from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

const SITE_URL = "https://continentalfounders.org";

const DEFAULT_IMAGE =
  `${SITE_URL}/assets/continental-founders-logo.png`;

const seoConfig = {
  "/": {
    title:
      "Continental Founders | Connecting African Founders to Global Opportunity",

    description:
      "Continental Founders connects African founders with universities, mentors, business leaders, investors, markets, and global opportunity networks through entrepreneurship, collaboration, and venture development.",
  },

  "/about": {
    title:
      "About Continental Founders | Mission, Leadership & Vision",

    description:
      "Learn about Continental Founders, our mission, leadership, principles, and work connecting founders, institutions, universities, and opportunity across continents.",
  },

  "/ventures": {
    title:
      "Ventures | Continental Founders",

    description:
      "Explore ventures and founders participating in the Continental Founders ecosystem and building solutions across Africa and global markets.",
  },

  "/our-model": {
    title:
      "Our Model | Continental Founders",

    description:
      "Discover the Continental Founders venture development model, moving founders from potential through preparation, execution, evidence, and opportunity.",
  },

  "/university-partnerships": {
    title:
      "University Partnerships | Continental Founders",

    description:
      "Discover how Continental Founders connects universities, faculty, students, research, founders, and global opportunity.",
  },

  "/strategic-partners": {
    title:
      "Sponsors & Partners | Continental Founders",

    description:
      "Explore strategic partnership opportunities with Continental Founders across universities, businesses, institutions, sponsors, and global networks.",
  },

  "/partners/us-africa-trade-network": {
    title:
      "U.S.–Africa Trade & Business Network | Continental Founders",

    description:
      "Discover how Continental Founders builds commercial relationships and business connections between African and U.S. markets.",
  },

  "/partners/universities": {
    title:
      "University Partners | Continental Founders",

    description:
      "Explore university partnerships connecting academic expertise, research, faculty, students, founders, markets, and opportunity.",
  },

  "/partners/corporate": {
    title:
      "Corporate Partners | Continental Founders",

    description:
      "Learn how companies and business leaders can collaborate with Continental Founders to support founders, innovation, and market access.",
  },

  "/partners/government-development": {
    title:
      "Government & Development Institutions | Continental Founders",

    description:
      "Explore opportunities for governments and development institutions to collaborate with Continental Founders on entrepreneurship, innovation, and economic opportunity.",
  },

  "/programs": {
    title:
      "Programs | Continental Founders",

    description:
      "Explore Continental Founders programs designed to connect founders with expertise, mentorship, institutions, markets, and global opportunities.",
  },

  "/impact": {
    title:
      "Impact | Continental Founders",

    description:
      "Discover the impact of Continental Founders in entrepreneurship, education, innovation, leadership, partnerships, and founder development.",
  },

  "/events": {
    title:
      "Events | Continental Founders",

    description:
      "Explore Continental Founders events connecting founders, universities, business leaders, mentors, partners, and opportunity networks.",
  },

  "/insights": {
    title:
      "Insights | Continental Founders",

    description:
      "Read Continental Founders insights on entrepreneurship, innovation, founder development, partnerships, education, and global markets.",
  },

  "/contact": {
    title:
      "Contact Continental Founders",

    description:
      "Contact Continental Founders about founder programs, university partnerships, strategic collaboration, sponsorship, and other opportunities.",
  },
};

export default function SEOManager() {
  const location = useLocation();

  const pathname =
    location.pathname !== "/" && location.pathname.endsWith("/")
      ? location.pathname.slice(0, -1)
      : location.pathname;

  // ---------------------------------------------------------
  // STATIC PAGE SEO
  // ---------------------------------------------------------

  let seo = seoConfig[pathname];

  // ---------------------------------------------------------
  // DYNAMIC VENTURE DETAILS
  // ---------------------------------------------------------

  if (!seo && pathname.startsWith("/ventures/")) {
    seo = {
      title: "Venture | Continental Founders",

      description:
        "Explore a venture in the Continental Founders ecosystem and discover its work, growth journey, and opportunities.",

      type: "article",
    };
  }

  // ---------------------------------------------------------
  // DYNAMIC INSIGHT DETAILS
  // ---------------------------------------------------------

  if (!seo && pathname.startsWith("/insights/")) {
    seo = {
      title: "Insight | Continental Founders",

      description:
        "Read insights from Continental Founders on entrepreneurship, innovation, partnerships, education, founder development, and global opportunity.",

      type: "article",
    };
  }

  // ---------------------------------------------------------
  // FALLBACK
  // ---------------------------------------------------------

  if (!seo) {
    seo = {
      title: "Continental Founders",

      description:
        "Continental Founders connects African founders with universities, mentors, business leaders, investors, markets, and global opportunity networks.",
    };
  }

  // ---------------------------------------------------------
  // CANONICAL URL
  // ---------------------------------------------------------

  const canonical =
    pathname === "/"
      ? `${SITE_URL}/`
      : `${SITE_URL}${pathname}`;

  const type = seo.type || "website";

  return (
    <Helmet>
      {/* =====================================================
          PRIMARY SEO
      ====================================================== */}

      <title>{seo.title}</title>

      <meta
        name="description"
        content={seo.description}
      />

      <meta
        name="robots"
        content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
      />

      <meta
        name="googlebot"
        content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
      />

      {/* =====================================================
          CANONICAL
      ====================================================== */}

      <link
        rel="canonical"
        href={canonical}
      />

      {/* =====================================================
          OPEN GRAPH
      ====================================================== */}

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
        content={seo.title}
      />

      <meta
        property="og:description"
        content={seo.description}
      />

      <meta
        property="og:url"
        content={canonical}
      />

      <meta
        property="og:image"
        content={DEFAULT_IMAGE}
      />

      <meta
        property="og:image:secure_url"
        content={DEFAULT_IMAGE}
      />

      <meta
        property="og:image:type"
        content="image/png"
      />

      <meta
        property="og:image:alt"
        content="Continental Founders"
      />

      <meta
        property="og:locale"
        content="en_US"
      />

      {/* =====================================================
          X / TWITTER
      ====================================================== */}

      <meta
        name="twitter:card"
        content="summary_large_image"
      />

      <meta
        name="twitter:title"
        content={seo.title}
      />

      <meta
        name="twitter:description"
        content={seo.description}
      />

      <meta
        name="twitter:image"
        content={DEFAULT_IMAGE}
      />

      <meta
        name="twitter:image:alt"
        content="Continental Founders"
      />
    </Helmet>
  );
}