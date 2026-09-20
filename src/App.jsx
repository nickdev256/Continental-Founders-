import React, { useEffect } from "react";

import {
  Route,
  Routes,
  useLocation,
} from "react-router-dom";


// ============================================================
// PUBLIC LAYOUT
// ============================================================

import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import PageTransition from "./components/layout/PageTransition";


// ============================================================
// GLOBAL PUBLIC COMPONENTS
// ============================================================

import EthTechPopup from "./components/common/EthTechPopup";


// ============================================================
// PUBLIC PAGES
// ============================================================

import Home from "./pages/Home";
import About from "./pages/About";

import Ventures from "./pages/Ventures";
import VentureDetails from "./pages/VentureDetails";

import OurModel from "./pages/OurModel";
import StrategicPartners from "./pages/StrategicPartners";
import Universities from "./pages/Universities";


// ============================================================
// PARTNER SUBPAGES
// ============================================================

import USAfricaTradeNetwork from "./pages/USAfricaTradeNetwork";
import CorporatePartners from "./pages/CorporatePartners";
import GovernmentDevelopment from "./pages/GovernmentDevelopment";


// ============================================================
// OTHER PUBLIC PAGES
// ============================================================

import Programs from "./pages/Programs";
import Impact from "./pages/Impact";

import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";

import Insights from "./pages/Insights";
import InsightDetails from "./pages/InsightDetails";

import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";


// ============================================================
// ADMIN AUTH
// ============================================================

import AdminLogin from "./pages/admin/AdminLogin";
import AdminRegister from "./pages/admin/AdminRegister";
import AdminOtp from "./pages/admin/AdminOtp";


// ============================================================
// ADMIN / CMS
// ============================================================

import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";

import AdminVentures from "./pages/admin/AdminVentures";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminInsights from "./pages/admin/AdminInsights";
import AdminUniversities from "./pages/admin/AdminUniversities";

import AdminNewsletter from "./pages/admin/AdminNewsletter";
import AdminContacts from "./pages/admin/AdminContacts";

import AdminAbout from "./pages/admin/AdminAbout";
import AdminLeadership from "./pages/admin/AdminLeadership";


// ============================================================
// ADMIN PARTNER CMS
// ============================================================

import AdminUSAfricaTradeNetwork from "./pages/admin/AdminUSAfricaTradeNetwork";
import AdminCorporatePartners from "./pages/admin/AdminCorporatePartners";
import AdminGovernmentDevelopment from "./pages/admin/AdminGovernmentDevelopment";


// ============================================================
// ADMIN PROTECTION
// ============================================================

import ProtectedAdminRoute from "./components/admin/ProtectedAdminRoute";


// ============================================================
// GLOBAL SITE CONFIGURATION
// ============================================================

const SITE_NAME =
  "Continental Founders";

const SITE_URL =
  "https://www.continentalfounders.org";

const SOCIAL_IMAGE =
  `${SITE_URL}/assets/continental-founders-logo.png`;

const DEFAULT_TITLE =
  "Continental Founders | Connecting African Founders to Global Opportunity";

const DEFAULT_DESCRIPTION =
  "Continental Founders connects African founders with universities, mentors, business leaders, investors, markets, and global opportunity networks through entrepreneurship, collaboration, and venture development.";

const INDEX_ROBOTS =
  "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";

const NOINDEX_ROBOTS =
  "noindex, nofollow, noarchive";


// ============================================================
// STATIC SEO CONFIGURATION
// ============================================================

const SEO_ROUTES = {
  "/": {
    title:
      "Continental Founders | Connecting African Founders to Global Opportunity",

    description:
      "Continental Founders connects African founders with universities, mentors, business leaders, investors, markets, and global opportunity networks.",

    canonical: "/",

    breadcrumb: [],
  },


  "/about": {
    title:
      "About Continental Founders | Mission, Vision & Leadership",

    description:
      "Learn about Continental Founders, our mission, vision, leadership, principles, and commitment to connecting African founders with global knowledge, networks, markets, and opportunity.",

    canonical:
      "/about",

    breadcrumb: [
      {
        name: "About",
        path: "/about",
      },
    ],
  },


  "/ventures": {
    title:
      "African Ventures & Founders | Continental Founders",

    description:
      "Discover founders and ventures in the Continental Founders network building practical, scalable solutions across Africa and global markets.",

    canonical:
      "/ventures",

    breadcrumb: [
      {
        name: "Ventures",
        path: "/ventures",
      },
    ],
  },


  "/our-model": {
    title:
      "Venture Development Model | Continental Founders",

    description:
      "Explore how Continental Founders supports founders through Potential, Preparation, Execution, Evidence, and Opportunity.",

    canonical:
      "/our-model",

    breadcrumb: [
      {
        name: "Our Model",
        path: "/our-model",
      },
    ],
  },


  "/strategic-partners": {
    title:
      "Strategic Partnerships | Continental Founders",

    description:
      "Explore the Continental Founders partnership ecosystem connecting universities, corporations, institutions, experts, mentors, markets, and global opportunity networks.",

    canonical:
      "/strategic-partners",

    breadcrumb: [
      {
        name: "Strategic Partners",
        path: "/strategic-partners",
      },
    ],
  },


  "/universities": {
    title:
      "University Partnerships | Continental Founders",

    description:
      "Explore how Continental Founders connects universities, faculty, students, research expertise, and African entrepreneurs through meaningful global partnerships.",

    canonical:
      "/universities",

    breadcrumb: [
      {
        name: "Strategic Partners",
        path: "/strategic-partners",
      },
      {
        name: "Universities",
        path: "/universities",
      },
    ],
  },


  "/partners/us-africa-trade-network": {
    title:
      "U.S.–Africa Trade & Business Network | Continental Founders",

    description:
      "Explore the Continental Founders U.S.–Africa Trade & Business Network connecting founders, business leaders, markets, expertise, and commercial opportunity.",

    canonical:
      "/partners/us-africa-trade-network",

    breadcrumb: [
      {
        name: "Strategic Partners",
        path: "/strategic-partners",
      },
      {
        name:
          "U.S.–Africa Trade & Business Network",

        path:
          "/partners/us-africa-trade-network",
      },
    ],
  },


  "/partners/corporate": {
    title:
      "Corporate Partnerships | Continental Founders",

    description:
      "Explore corporate partnerships with Continental Founders supporting entrepreneurs through expertise, mentorship, technology, markets, business networks, and commercial collaboration.",

    canonical:
      "/partners/corporate",

    breadcrumb: [
      {
        name: "Strategic Partners",
        path: "/strategic-partners",
      },
      {
        name: "Corporate Partners",
        path: "/partners/corporate",
      },
    ],
  },


  "/partners/government-development": {
    title:
      "Government & Development Partnerships | Continental Founders",

    description:
      "Explore how Continental Founders works with government and development institutions to strengthen entrepreneurship, innovation, market access, and economic opportunity.",

    canonical:
      "/partners/government-development",

    breadcrumb: [
      {
        name: "Strategic Partners",
        path: "/strategic-partners",
      },
      {
        name:
          "Government & Development Institutions",

        path:
          "/partners/government-development",
      },
    ],
  },


  "/programs": {
    title:
      "Founder Programs | Continental Founders",

    description:
      "Explore Continental Founders programs connecting entrepreneurs with mentorship, universities, industry expertise, markets, business networks, and global opportunity.",

    canonical:
      "/programs",

    breadcrumb: [
      {
        name: "Programs",
        path: "/programs",
      },
    ],
  },


  "/impact": {
    title:
      "Our Impact | Continental Founders",

    description:
      "Explore the impact of Continental Founders across entrepreneurship, founder development, university partnerships, innovation, markets, and global opportunity networks.",

    canonical:
      "/impact",

    breadcrumb: [
      {
        name: "Impact",
        path: "/impact",
      },
    ],
  },


  "/events": {
    title:
      "Events | Continental Founders",

    description:
      "Discover Continental Founders events bringing together founders, universities, investors, business leaders, mentors, institutions, and strategic partners.",

    canonical:
      "/events",

    breadcrumb: [
      {
        name: "Events",
        path: "/events",
      },
    ],
  },


  "/insights": {
    title:
      "Entrepreneurship & Innovation Insights | Continental Founders",

    description:
      "Read Continental Founders insights on entrepreneurship, venture development, innovation, university partnerships, markets, leadership, and global opportunity.",

    canonical:
      "/insights",

    breadcrumb: [
      {
        name: "Insights",
        path: "/insights",
      },
    ],
  },


  "/contact": {
    title:
      "Contact Continental Founders",

    description:
      "Contact Continental Founders about partnerships, founder opportunities, university collaboration, strategic engagement, and participation in our global network.",

    canonical:
      "/contact",

    breadcrumb: [
      {
        name: "Contact",
        path: "/contact",
      },
    ],
  },
};


// ============================================================
// PATH HELPERS
// ============================================================

function normalizePath(pathname) {
  if (
    !pathname ||
    pathname === "/"
  ) {
    return "/";
  }

  return pathname.replace(
    /\/+$/,
    ""
  );
}


function buildCanonicalUrl(path) {
  if (
    !path ||
    path === "/"
  ) {
    return `${SITE_URL}/`;
  }

  const cleanPath =
    path.startsWith("/")
      ? path
      : `/${path}`;

  return `${SITE_URL}${cleanPath}`;
}


// ============================================================
// META HELPERS
// ============================================================

function setMetaTag(
  selector,
  attributeName,
  attributeValue,
  content
) {
  let element =
    document.head.querySelector(
      selector
    );

  if (!element) {
    element =
      document.createElement(
        "meta"
      );

    element.setAttribute(
      attributeName,
      attributeValue
    );

    document.head.appendChild(
      element
    );
  }

  element.setAttribute(
    "content",
    content
  );
}


function removeMetaTag(
  selector
) {
  const element =
    document.head.querySelector(
      selector
    );

  if (element) {
    element.remove();
  }
}


// ============================================================
// CANONICAL
// ============================================================

function setCanonical(url) {
  let canonical =
    document.head.querySelector(
      'link[rel="canonical"]'
    );

  if (!canonical) {
    canonical =
      document.createElement(
        "link"
      );

    canonical.setAttribute(
      "rel",
      "canonical"
    );

    document.head.appendChild(
      canonical
    );
  }

  canonical.setAttribute(
    "href",
    url
  );
}


function removeCanonical() {
  const canonical =
    document.head.querySelector(
      'link[rel="canonical"]'
    );

  if (canonical) {
    canonical.remove();
  }
}


// ============================================================
// DESCRIPTION
// ============================================================

function setDescription(
  description
) {
  setMetaTag(
    'meta[name="description"]',
    "name",
    "description",
    description
  );
}


// ============================================================
// ROBOTS
// ============================================================

function setRobots(value) {
  setMetaTag(
    'meta[name="robots"]',
    "name",
    "robots",
    value
  );

  setMetaTag(
    'meta[name="googlebot"]',
    "name",
    "googlebot",
    value
  );
}


// ============================================================
// OPEN GRAPH
// ============================================================

function setOpenGraph({
  title,
  description,
  canonicalUrl,
  type = "website",
  image = SOCIAL_IMAGE,
}) {
  setMetaTag(
    'meta[property="og:type"]',
    "property",
    "og:type",
    type
  );

  setMetaTag(
    'meta[property="og:site_name"]',
    "property",
    "og:site_name",
    SITE_NAME
  );

  setMetaTag(
    'meta[property="og:title"]',
    "property",
    "og:title",
    title
  );

  setMetaTag(
    'meta[property="og:description"]',
    "property",
    "og:description",
    description
  );

  setMetaTag(
    'meta[property="og:url"]',
    "property",
    "og:url",
    canonicalUrl
  );

  setMetaTag(
    'meta[property="og:image"]',
    "property",
    "og:image",
    image
  );

  setMetaTag(
    'meta[property="og:image:secure_url"]',
    "property",
    "og:image:secure_url",
    image
  );

  setMetaTag(
    'meta[property="og:image:type"]',
    "property",
    "og:image:type",
    "image/png"
  );

  setMetaTag(
    'meta[property="og:image:alt"]',
    "property",
    "og:image:alt",
    "Continental Founders logo"
  );

  setMetaTag(
    'meta[property="og:locale"]',
    "property",
    "og:locale",
    "en_US"
  );
}


// ============================================================
// X / TWITTER
// ============================================================

function setTwitterMeta({
  title,
  description,
  image = SOCIAL_IMAGE,
}) {
  setMetaTag(
    'meta[name="twitter:card"]',
    "name",
    "twitter:card",
    "summary_large_image"
  );

  setMetaTag(
    'meta[name="twitter:title"]',
    "name",
    "twitter:title",
    title
  );

  setMetaTag(
    'meta[name="twitter:description"]',
    "name",
    "twitter:description",
    description
  );

  setMetaTag(
    'meta[name="twitter:image"]',
    "name",
    "twitter:image",
    image
  );

  setMetaTag(
    'meta[name="twitter:image:alt"]',
    "name",
    "twitter:image:alt",
    "Continental Founders logo"
  );
}


// ============================================================
// STRUCTURED DATA HELPERS
// ============================================================

function setStructuredData(
  id,
  data
) {
  let script =
    document.getElementById(id);

  if (!script) {
    script =
      document.createElement(
        "script"
      );

    script.id = id;

    script.type =
      "application/ld+json";

    document.head.appendChild(
      script
    );
  }

  script.textContent =
    JSON.stringify(data);
}


function removeStructuredData(
  id
) {
  const script =
    document.getElementById(id);

  if (script) {
    script.remove();
  }
}


// ============================================================
// BREADCRUMB STRUCTURED DATA
// ============================================================

function setBreadcrumbData(
  items = []
) {
  if (
    !items ||
    items.length === 0
  ) {
    removeStructuredData(
      "cf-breadcrumb-schema"
    );

    return;
  }

  const breadcrumbItems = [
    {
      name:
        "Continental Founders",

      path:
        "/",
    },

    ...items,
  ];


  const data = {
    "@context":
      "https://schema.org",

    "@type":
      "BreadcrumbList",

    itemListElement:
      breadcrumbItems.map(
        (
          item,
          index
        ) => ({
          "@type":
            "ListItem",

          position:
            index + 1,

          name:
            item.name,

          item:
            buildCanonicalUrl(
              item.path
            ),
        })
      ),
  };


  setStructuredData(
    "cf-breadcrumb-schema",
    data
  );
}


// ============================================================
// ORGANIZATION STRUCTURED DATA
// ============================================================

function setOrganizationData() {
  const data = {
    "@context":
      "https://schema.org",

    "@type":
      "Organization",

    "@id":
      `${SITE_URL}/#organization`,

    name:
      SITE_NAME,

    url:
      `${SITE_URL}/`,

    logo:
      SOCIAL_IMAGE,

    description:
      DEFAULT_DESCRIPTION,

    areaServed: [
      {
        "@type":
          "Continent",

        name:
          "Africa",
      },

      {
        "@type":
          "Country",

        name:
          "United States",
      },
    ],

    knowsAbout: [
      "Entrepreneurship",
      "Venture Development",
      "Innovation",
      "University Partnerships",
      "Founder Development",
      "Mentorship",
      "Business Partnerships",
      "Market Access",
      "Leadership Development",
      "International Collaboration",
    ],
  };


  setStructuredData(
    "cf-organization-schema",
    data
  );
}


// ============================================================
// WEBSITE STRUCTURED DATA
// ============================================================

function setWebsiteData() {
  const data = {
    "@context":
      "https://schema.org",

    "@type":
      "WebSite",

    "@id":
      `${SITE_URL}/#website`,

    url:
      `${SITE_URL}/`,

    name:
      SITE_NAME,

    description:
      DEFAULT_DESCRIPTION,

    publisher: {
      "@id":
        `${SITE_URL}/#organization`,
    },

    inLanguage:
      "en-US",
  };


  setStructuredData(
    "cf-website-schema",
    data
  );
}


// ============================================================
// WEB PAGE STRUCTURED DATA
// ============================================================

function setWebPageData({
  title,
  description,
  canonicalUrl,
  type = "WebPage",
}) {
  const data = {
    "@context":
      "https://schema.org",

    "@type":
      type,

    "@id":
      `${canonicalUrl}#webpage`,

    url:
      canonicalUrl,

    name:
      title,

    description,

    isPartOf: {
      "@id":
        `${SITE_URL}/#website`,
    },

    about: {
      "@id":
        `${SITE_URL}/#organization`,
    },

    publisher: {
      "@id":
        `${SITE_URL}/#organization`,
    },

    inLanguage:
      "en-US",
  };


  setStructuredData(
    "cf-webpage-schema",
    data
  );
}


// ============================================================
// APPLY PUBLIC SEO
// ============================================================

function applyPublicSEO({
  title,
  description,
  canonicalUrl,
  type = "website",
  schemaType = "WebPage",
  image = SOCIAL_IMAGE,
  breadcrumbs = [],
}) {
  const finalTitle =
    title ||
    DEFAULT_TITLE;

  const finalDescription =
    description ||
    DEFAULT_DESCRIPTION;


  document.title =
    finalTitle;


  setDescription(
    finalDescription
  );


  setRobots(
    INDEX_ROBOTS
  );


  setCanonical(
    canonicalUrl
  );


  setOpenGraph({
    title:
      finalTitle,

    description:
      finalDescription,

    canonicalUrl,

    type,

    image,
  });


  setTwitterMeta({
    title:
      finalTitle,

    description:
      finalDescription,

    image,
  });


  setOrganizationData();

  setWebsiteData();


  setWebPageData({
    title:
      finalTitle,

    description:
      finalDescription,

    canonicalUrl,

    type:
      schemaType,
  });


  setBreadcrumbData(
    breadcrumbs
  );
}


// ============================================================
// APPLY NOINDEX SEO
// ============================================================

function applyNoIndexSEO({
  title,
  description,
  robots = NOINDEX_ROBOTS,
}) {
  document.title =
    title;


  setDescription(
    description
  );


  setRobots(
    robots
  );


  removeCanonical();


  removeMetaTag(
    'meta[property="og:url"]'
  );

  removeMetaTag(
    'meta[property="og:title"]'
  );

  removeMetaTag(
    'meta[property="og:description"]'
  );

  removeMetaTag(
    'meta[property="og:image"]'
  );

  removeMetaTag(
    'meta[property="og:image:secure_url"]'
  );

  removeMetaTag(
    'meta[name="twitter:title"]'
  );

  removeMetaTag(
    'meta[name="twitter:description"]'
  );

  removeMetaTag(
    'meta[name="twitter:image"]'
  );


  removeStructuredData(
    "cf-breadcrumb-schema"
  );

  removeStructuredData(
    "cf-webpage-schema"
  );
}


// ============================================================
// GLOBAL SEO MANAGER
// ============================================================

function SEOManager() {
  const { pathname } =
    useLocation();


  useEffect(() => {
    const cleanPath =
      normalizePath(
        pathname
      );


    // ========================================================
    // ADMIN
    // ========================================================

    if (
      cleanPath === "/admin" ||
      cleanPath.startsWith(
        "/admin/"
      )
    ) {
      applyNoIndexSEO({
        title:
          `Admin | ${SITE_NAME}`,

        description:
          "Continental Founders administration.",

        robots:
          NOINDEX_ROBOTS,
      });

      return;
    }


    // ========================================================
    // DYNAMIC VENTURE
    // ========================================================

    if (
      cleanPath.startsWith(
        "/ventures/"
      )
    ) {
      applyPublicSEO({
        title:
          `Venture | ${SITE_NAME}`,

        description:
          "Explore a venture in the Continental Founders network and discover the founders, solutions, markets, and opportunities behind the business.",

        canonicalUrl:
          buildCanonicalUrl(
            cleanPath
          ),

        type:
          "website",

        schemaType:
          "WebPage",

        breadcrumbs: [
          {
            name:
              "Ventures",

            path:
              "/ventures",
          },

          {
            name:
              "Venture",

            path:
              cleanPath,
          },
        ],
      });

      return;
    }


    // ========================================================
    // DYNAMIC EVENT
    // ========================================================

    if (
      cleanPath.startsWith(
        "/events/"
      )
    ) {
      applyPublicSEO({
        title:
          `Event | ${SITE_NAME}`,

        description:
          "Explore a Continental Founders event bringing together founders, universities, business leaders, mentors, institutions, and strategic partners.",

        canonicalUrl:
          buildCanonicalUrl(
            cleanPath
          ),

        type:
          "website",

        schemaType:
          "WebPage",

        breadcrumbs: [
          {
            name:
              "Events",

            path:
              "/events",
          },

          {
            name:
              "Event",

            path:
              cleanPath,
          },
        ],
      });

      return;
    }


    // ========================================================
    // DYNAMIC INSIGHT
    // ========================================================

    if (
      cleanPath.startsWith(
        "/insights/"
      )
    ) {
      applyPublicSEO({
        title:
          `Insight | ${SITE_NAME}`,

        description:
          "Read insights from Continental Founders on entrepreneurship, innovation, venture development, markets, partnerships, leadership, and global opportunity.",

        canonicalUrl:
          buildCanonicalUrl(
            cleanPath
          ),

        type:
          "article",

        schemaType:
          "Article",

        breadcrumbs: [
          {
            name:
              "Insights",

            path:
              "/insights",
          },

          {
            name:
              "Insight",

            path:
              cleanPath,
          },
        ],
      });

      return;
    }


    // ========================================================
    // STATIC PAGE
    // ========================================================

    const seo =
      SEO_ROUTES[
        cleanPath
      ];


    // ========================================================
    // 404
    // ========================================================

    if (!seo) {
      applyNoIndexSEO({
        title:
          `Page Not Found | ${SITE_NAME}`,

        description:
          "The requested page could not be found on the Continental Founders website.",

        robots:
          "noindex, follow",
      });

      return;
    }


    // ========================================================
    // APPLY STATIC SEO
    // ========================================================

    applyPublicSEO({
      title:
        seo.title,

      description:
        seo.description,

      canonicalUrl:
        buildCanonicalUrl(
          seo.canonical
        ),

      breadcrumbs:
        seo.breadcrumb ||
        [],
    });

  }, [pathname]);


  return null;
}


// ============================================================
// SCROLL TO TOP
// ============================================================

function ScrollToTop() {
  const { pathname } =
    useLocation();


  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  }, [pathname]);


  return null;
}


// ============================================================
// APP
// ============================================================

export default function App() {
  const { pathname } =
    useLocation();


  const isAdminRoute =
    pathname === "/admin" ||
    pathname.startsWith(
      "/admin/"
    );


  return (
    <div
      className={
        isAdminRoute
          ? "site-shell site-shell--admin"
          : "site-shell"
      }
    >

      <ScrollToTop />

      <SEOManager />


      {/* =====================================================
          PUBLIC NAVIGATION
      ====================================================== */}

      {!isAdminRoute && (
        <Navbar />
      )}


      {/* =====================================================
          MAIN APPLICATION
      ====================================================== */}

      <main
        id="main-content"
        className={
          isAdminRoute
            ? "main-content main-content--admin"
            : "main-content"
        }
      >

        <PageTransition>

          <Routes>

            {/* =================================================
                HOME
            ================================================= */}

            <Route
              path="/"
              element={
                <Home />
              }
            />


            {/* =================================================
                ABOUT
            ================================================= */}

            <Route
              path="/about"
              element={
                <About />
              }
            />


            {/* =================================================
                VENTURES
            ================================================= */}

            <Route
              path="/ventures"
              element={
                <Ventures />
              }
            />

            <Route
              path="/ventures/:slug"
              element={
                <VentureDetails />
              }
            />


            {/* =================================================
                OUR MODEL
            ================================================= */}

            <Route
              path="/our-model"
              element={
                <OurModel />
              }
            />


            {/* =================================================
                UNIVERSITIES
            ================================================= */}

            <Route
              path="/universities"
              element={
                <Universities />
              }
            />


            {/* =================================================
                STRATEGIC PARTNERS
            ================================================= */}

            <Route
              path="/strategic-partners"
              element={
                <StrategicPartners />
              }
            />


            {/* =================================================
                PARTNER SUBPAGES
            ================================================= */}

            <Route
              path="/partners/us-africa-trade-network"
              element={
                <USAfricaTradeNetwork />
              }
            />

            <Route
              path="/partners/corporate"
              element={
                <CorporatePartners />
              }
            />

            <Route
              path="/partners/government-development"
              element={
                <GovernmentDevelopment />
              }
            />


            {/* =================================================
                PROGRAMS
            ================================================= */}

            <Route
              path="/programs"
              element={
                <Programs />
              }
            />


            {/* =================================================
                IMPACT
            ================================================= */}

            <Route
              path="/impact"
              element={
                <Impact />
              }
            />


            {/* =================================================
                EVENTS
            ================================================= */}

            <Route
              path="/events"
              element={
                <Events />
              }
            />

            <Route
              path="/events/:slug"
              element={
                <EventDetails />
              }
            />


            {/* =================================================
                INSIGHTS
            ================================================= */}

            <Route
              path="/insights"
              element={
                <Insights />
              }
            />

            <Route
              path="/insights/:slug"
              element={
                <InsightDetails />
              }
            />


            {/* =================================================
                CONTACT
            ================================================= */}

            <Route
              path="/contact"
              element={
                <Contact />
              }
            />


            {/* =================================================
                ADMIN AUTH
            ================================================= */}

            <Route
              path="/admin/register"
              element={
                <AdminRegister />
              }
            />

            <Route
              path="/admin/login"
              element={
                <AdminLogin />
              }
            />

            <Route
              path="/admin/verify-otp"
              element={
                <AdminOtp />
              }
            />


            {/* =================================================
                PROTECTED ADMIN
            ================================================= */}

            <Route
              element={
                <ProtectedAdminRoute />
              }
            >

              <Route
                path="/admin"
                element={
                  <AdminLayout />
                }
              >

                <Route
                  index
                  element={
                    <AdminDashboard />
                  }
                />

                <Route
                  path="ventures"
                  element={
                    <AdminVentures />
                  }
                />

                <Route
                  path="events"
                  element={
                    <AdminEvents />
                  }
                />

                <Route
                  path="insights"
                  element={
                    <AdminInsights />
                  }
                />

                <Route
                  path="universities"
                  element={
                    <AdminUniversities />
                  }
                />

                <Route
                  path="partners/us-africa-trade-network"
                  element={
                    <AdminUSAfricaTradeNetwork />
                  }
                />

                <Route
                  path="partners/corporate"
                  element={
                    <AdminCorporatePartners />
                  }
                />

                <Route
                  path="partners/government-development"
                  element={
                    <AdminGovernmentDevelopment />
                  }
                />

                <Route
                  path="newsletter"
                  element={
                    <AdminNewsletter />
                  }
                />

                <Route
                  path="contacts"
                  element={
                    <AdminContacts />
                  }
                />

                <Route
                  path="about"
                  element={
                    <AdminAbout />
                  }
                />

                <Route
                  path="leadership"
                  element={
                    <AdminLeadership />
                  }
                />

              </Route>

            </Route>


            {/* =================================================
                404
            ================================================= */}

            <Route
              path="*"
              element={
                <NotFound />
              }
            />

          </Routes>

        </PageTransition>

      </main>


      {/* =====================================================
          PUBLIC FOOTER
      ====================================================== */}

      {!isAdminRoute && (
        <Footer />
      )}


      {/* =====================================================
          ETH TECH SOLUTIONS PROMOTIONAL POPUP

          - Public website only
          - Appears after delay configured inside EthTechPopup
          - Never appears in the admin dashboard
          - Clicking it opens Eth Tech Solutions
      ====================================================== */}

      {!isAdminRoute && (
        <EthTechPopup />
      )}

    </div>
  );
}