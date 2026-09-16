import React, {
  useEffect,
} from "react";

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

import Insights from "./pages/Insights";
import InsightDetails from "./pages/InsightDetails";

import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";


// ============================================================
// ADMIN AUTH PAGES
// ============================================================

import AdminLogin from "./pages/admin/AdminLogin";
import AdminRegister from "./pages/admin/AdminRegister";
import AdminOtp from "./pages/admin/AdminOtp";


// ============================================================
// ADMIN / CMS PAGES
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
// ADMIN PARTNER CMS PAGES
// ============================================================

import AdminUSAfricaTradeNetwork from "./pages/admin/AdminUSAfricaTradeNetwork";
import AdminCorporatePartners from "./pages/admin/AdminCorporatePartners";
import AdminGovernmentDevelopment from "./pages/admin/AdminGovernmentDevelopment";


// ============================================================
// ADMIN PROTECTION
// ============================================================

import ProtectedAdminRoute from "./components/admin/ProtectedAdminRoute";


// ============================================================
// SITE CONFIGURATION
// ============================================================

const SITE_NAME = "Continental Founders";

const SITE_URL =
  "https://continentalfounders.org";

const DEFAULT_TITLE =
  "Continental Founders | Connecting African Founders to Global Opportunity";

const DEFAULT_DESCRIPTION =
  "Continental Founders connects African founders with universities, mentors, business leaders, investors, markets, and global opportunity networks through entrepreneurship, collaboration, and venture development.";


// ============================================================
// SEO CONFIGURATION
// ============================================================

const SEO_ROUTES = {
  "/": {
    title:
      "Continental Founders | Connecting African Founders to Global Opportunity",

    description:
      "Continental Founders connects African founders with universities, mentors, business leaders, investors, markets, and global opportunity networks.",

    canonical:
      "/",
  },

  "/about": {
    title:
      "About | Continental Founders",

    description:
      "Learn about Continental Founders, our mission, vision, leadership, and commitment to connecting African founders with global knowledge, networks, markets, and opportunity.",

    canonical:
      "/about",
  },

  "/ventures": {
    title:
      "Ventures | Continental Founders",

    description:
      "Discover ventures in the Continental Founders network and the entrepreneurs building practical, scalable solutions across Africa and global markets.",

    canonical:
      "/ventures",
  },

  "/our-model": {
    title:
      "Our Model | Continental Founders",

    description:
      "Explore the Continental Founders model and how founders progress from potential to preparation, execution, evidence, and opportunity.",

    canonical:
      "/our-model",
  },

  "/universities": {
    title:
      "University Partnerships | Continental Founders",

    description:
      "Explore how Continental Founders connects universities, faculty, students, research expertise, and entrepreneurs through meaningful global partnerships.",

    canonical:
      "/universities",
  },

  "/strategic-partners": {
    title:
      "Strategic Partners | Continental Founders",

    description:
      "Discover the strategic partnership ecosystem connecting Continental Founders with universities, corporations, institutions, experts, and opportunity networks.",

    canonical:
      "/strategic-partners",
  },

  "/partners/us-africa-trade-network": {
    title:
      "U.S.–Africa Trade & Business Network | Continental Founders",

    description:
      "Explore the Continental Founders U.S.–Africa Trade & Business Network, connecting founders, business leaders, markets, expertise, and commercial opportunity.",

    canonical:
      "/partners/us-africa-trade-network",
  },

  "/partners/corporate": {
    title:
      "Corporate Partners | Continental Founders",

    description:
      "Explore corporate partnership opportunities with Continental Founders and support founders through expertise, markets, mentorship, technology, and commercial collaboration.",

    canonical:
      "/partners/corporate",
  },

  "/partners/government-development": {
    title:
      "Government & Development Institutions | Continental Founders",

    description:
      "Explore how Continental Founders works with government and development institutions to strengthen entrepreneurship, innovation, market access, and economic opportunity.",

    canonical:
      "/partners/government-development",
  },

  "/programs": {
    title:
      "Programs | Continental Founders",

    description:
      "Explore Continental Founders programs designed to connect entrepreneurs with mentorship, expertise, universities, markets, business networks, and opportunity.",

    canonical:
      "/programs",
  },

  "/impact": {
    title:
      "Impact | Continental Founders",

    description:
      "Explore the impact of Continental Founders across entrepreneurship, partnerships, founder development, universities, markets, and global opportunity networks.",

    canonical:
      "/impact",
  },

  "/events": {
    title:
      "Events | Continental Founders",

    description:
      "Discover Continental Founders events bringing together founders, universities, investors, business leaders, mentors, institutions, and strategic partners.",

    canonical:
      "/events",
  },

  "/insights": {
    title:
      "Insights | Continental Founders",

    description:
      "Read Continental Founders insights on entrepreneurship, venture development, innovation, university partnerships, markets, leadership, and global opportunity.",

    canonical:
      "/insights",
  },

  "/contact": {
    title:
      "Contact | Continental Founders",

    description:
      "Contact Continental Founders to discuss partnerships, founder opportunities, university collaboration, strategic engagement, and participation in our global network.",

    canonical:
      "/contact",
  },
};


// ============================================================
// META TAG HELPER
// ============================================================

function setMetaTag(
  selector,
  attribute,
  value
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

    const [
      key,
      name,
    ] =
      attribute;

    element.setAttribute(
      key,
      name
    );

    document.head.appendChild(
      element
    );
  }

  element.setAttribute(
    "content",
    value
  );
}


// ============================================================
// CANONICAL HELPER
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


// ============================================================
// SEO MANAGER
// ============================================================

function SEOManager() {
  const {
    pathname,
  } =
    useLocation();


  useEffect(
    () => {
      // ======================================================
      // ADMIN PAGES
      // Never allow CMS/auth pages into search engines.
      // ======================================================

      if (
        pathname === "/admin" ||
        pathname.startsWith(
          "/admin/"
        )
      ) {
        document.title =
          `Admin | ${SITE_NAME}`;

        setMetaTag(
          'meta[name="robots"]',
          [
            "name",
            "robots",
          ],
          "noindex, nofollow, noarchive"
        );

        setMetaTag(
          'meta[name="googlebot"]',
          [
            "name",
            "googlebot",
          ],
          "noindex, nofollow, noarchive"
        );

        return;
      }


      // ======================================================
      // DYNAMIC VENTURE PAGE
      // Page itself can replace this with venture-specific SEO.
      // ======================================================

      if (
        pathname.startsWith(
          "/ventures/"
        )
      ) {
        document.title =
          `Venture | ${SITE_NAME}`;

        const canonicalUrl =
          `${SITE_URL}${pathname}`;

        setMetaTag(
          'meta[name="description"]',
          [
            "name",
            "description",
          ],
          "Explore a venture in the Continental Founders network and discover the founders, solutions, markets, and opportunities behind the business."
        );

        setMetaTag(
          'meta[name="robots"]',
          [
            "name",
            "robots",
          ],
          "index, follow"
        );

        setMetaTag(
          'meta[name="googlebot"]',
          [
            "name",
            "googlebot",
          ],
          "index, follow"
        );

        setMetaTag(
          'meta[property="og:title"]',
          [
            "property",
            "og:title",
          ],
          `Venture | ${SITE_NAME}`
        );

        setMetaTag(
          'meta[property="og:description"]',
          [
            "property",
            "og:description",
          ],
          "Explore a venture in the Continental Founders network."
        );

        setMetaTag(
          'meta[property="og:url"]',
          [
            "property",
            "og:url",
          ],
          canonicalUrl
        );

        setCanonical(
          canonicalUrl
        );

        return;
      }


      // ======================================================
      // DYNAMIC INSIGHT PAGE
      // Page itself can replace this with article-specific SEO.
      // ======================================================

      if (
        pathname.startsWith(
          "/insights/"
        )
      ) {
        document.title =
          `Insight | ${SITE_NAME}`;

        const canonicalUrl =
          `${SITE_URL}${pathname}`;

        setMetaTag(
          'meta[name="description"]',
          [
            "name",
            "description",
          ],
          "Read insights from Continental Founders on entrepreneurship, innovation, venture development, markets, partnerships, and global opportunity."
        );

        setMetaTag(
          'meta[name="robots"]',
          [
            "name",
            "robots",
          ],
          "index, follow"
        );

        setMetaTag(
          'meta[name="googlebot"]',
          [
            "name",
            "googlebot",
          ],
          "index, follow"
        );

        setMetaTag(
          'meta[property="og:title"]',
          [
            "property",
            "og:title",
          ],
          `Insight | ${SITE_NAME}`
        );

        setMetaTag(
          'meta[property="og:description"]',
          [
            "property",
            "og:description",
          ],
          "Read insights from Continental Founders."
        );

        setMetaTag(
          'meta[property="og:url"]',
          [
            "property",
            "og:url",
          ],
          canonicalUrl
        );

        setCanonical(
          canonicalUrl
        );

        return;
      }


      // ======================================================
      // STATIC PUBLIC PAGES
      // ======================================================

      const seo =
        SEO_ROUTES[pathname];


      // ======================================================
      // UNKNOWN / 404 PAGE
      // ======================================================

      if (!seo) {
        document.title =
          `Page Not Found | ${SITE_NAME}`;

        setMetaTag(
          'meta[name="description"]',
          [
            "name",
            "description",
          ],
          DEFAULT_DESCRIPTION
        );

        setMetaTag(
          'meta[name="robots"]',
          [
            "name",
            "robots",
          ],
          "noindex, follow"
        );

        setMetaTag(
          'meta[name="googlebot"]',
          [
            "name",
            "googlebot",
          ],
          "noindex, follow"
        );

        return;
      }


      // ======================================================
      // APPLY PUBLIC PAGE SEO
      // ======================================================

      const title =
        seo.title ||
        DEFAULT_TITLE;

      const description =
        seo.description ||
        DEFAULT_DESCRIPTION;

      const canonicalUrl =
        `${SITE_URL}${seo.canonical}`;


      document.title =
        title;


      // Description
      setMetaTag(
        'meta[name="description"]',
        [
          "name",
          "description",
        ],
        description
      );


      // Robots
      setMetaTag(
        'meta[name="robots"]',
        [
          "name",
          "robots",
        ],
        "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
      );


      setMetaTag(
        'meta[name="googlebot"]',
        [
          "name",
          "googlebot",
        ],
        "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
      );


      // Canonical
      setCanonical(
        canonicalUrl
      );


      // ======================================================
      // OPEN GRAPH
      // ======================================================

      setMetaTag(
        'meta[property="og:type"]',
        [
          "property",
          "og:type",
        ],
        "website"
      );


      setMetaTag(
        'meta[property="og:site_name"]',
        [
          "property",
          "og:site_name",
        ],
        SITE_NAME
      );


      setMetaTag(
        'meta[property="og:title"]',
        [
          "property",
          "og:title",
        ],
        title
      );


      setMetaTag(
        'meta[property="og:description"]',
        [
          "property",
          "og:description",
        ],
        description
      );


      setMetaTag(
        'meta[property="og:url"]',
        [
          "property",
          "og:url",
        ],
        canonicalUrl
      );


      // ======================================================
      // TWITTER / X
      // ======================================================

      setMetaTag(
        'meta[name="twitter:title"]',
        [
          "name",
          "twitter:title",
        ],
        title
      );


      setMetaTag(
        'meta[name="twitter:description"]',
        [
          "name",
          "twitter:description",
        ],
        description
      );

    },
    [
      pathname,
    ]
  );


  return null;
}


// ============================================================
// SCROLL TO TOP
// ============================================================

function ScrollToTop() {
  const {
    pathname,
  } =
    useLocation();


  useEffect(
    () => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant",
      });
    },
    [
      pathname,
    ]
  );


  return null;
}


// ============================================================
// APP
// ============================================================

export default function App() {
  const {
    pathname,
  } =
    useLocation();


  // ==========================================================
  // ADMIN ROUTE CHECK
  // ==========================================================

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

      {/* ======================================================
          GLOBAL HELPERS
      ====================================================== */}

      <ScrollToTop />

      <SEOManager />


      {/* ======================================================
          PUBLIC NAVBAR
      ====================================================== */}

      {!isAdminRoute && (
        <Navbar />
      )}


      {/* ======================================================
          ROUTES
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

            {/* ==================================================
                HOME
            ================================================== */}

            <Route
              path="/"
              element={
                <Home />
              }
            />


            {/* ==================================================
                ABOUT
            ================================================== */}

            <Route
              path="/about"
              element={
                <About />
              }
            />


            {/* ==================================================
                VENTURES
            ================================================== */}

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


            {/* ==================================================
                OUR MODEL
            ================================================== */}

            <Route
              path="/our-model"
              element={
                <OurModel />
              }
            />


            {/* ==================================================
                UNIVERSITIES
            ================================================== */}

            <Route
              path="/universities"
              element={
                <Universities />
              }
            />


            {/* ==================================================
                PARTNERS
            ================================================== */}

            <Route
              path="/strategic-partners"
              element={
                <StrategicPartners />
              }
            />

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


            {/* ==================================================
                PROGRAMS
            ================================================== */}

            <Route
              path="/programs"
              element={
                <Programs />
              }
            />


            {/* ==================================================
                IMPACT
            ================================================== */}

            <Route
              path="/impact"
              element={
                <Impact />
              }
            />


            {/* ==================================================
                EVENTS
            ================================================== */}

            <Route
              path="/events"
              element={
                <Events />
              }
            />


            {/* ==================================================
                INSIGHTS
            ================================================== */}

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


            {/* ==================================================
                CONTACT
            ================================================== */}

            <Route
              path="/contact"
              element={
                <Contact />
              }
            />


            {/* ==================================================
                ADMIN REGISTER
            ================================================== */}

            <Route
              path="/admin/register"
              element={
                <AdminRegister />
              }
            />


            {/* ==================================================
                ADMIN LOGIN
            ================================================== */}

            <Route
              path="/admin/login"
              element={
                <AdminLogin />
              }
            />


            {/* ==================================================
                ADMIN OTP
            ================================================== */}

            <Route
              path="/admin/verify-otp"
              element={
                <AdminOtp />
              }
            />


            {/* ==================================================
                PROTECTED ADMIN ROUTES
            ================================================== */}

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

                {/* ==============================================
                    DASHBOARD
                ============================================== */}

                <Route
                  index
                  element={
                    <AdminDashboard />
                  }
                />


                {/* ==============================================
                    VENTURES
                ============================================== */}

                <Route
                  path="ventures"
                  element={
                    <AdminVentures />
                  }
                />


                {/* ==============================================
                    EVENTS
                ============================================== */}

                <Route
                  path="events"
                  element={
                    <AdminEvents />
                  }
                />


                {/* ==============================================
                    INSIGHTS
                ============================================== */}

                <Route
                  path="insights"
                  element={
                    <AdminInsights />
                  }
                />


                {/* ==============================================
                    UNIVERSITIES
                ============================================== */}

                <Route
                  path="universities"
                  element={
                    <AdminUniversities />
                  }
                />


                {/* ==============================================
                    PARTNER CMS
                ============================================== */}

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


                {/* ==============================================
                    NEWSLETTER
                ============================================== */}

                <Route
                  path="newsletter"
                  element={
                    <AdminNewsletter />
                  }
                />


                {/* ==============================================
                    CONTACTS
                ============================================== */}

                <Route
                  path="contacts"
                  element={
                    <AdminContacts />
                  }
                />


                {/* ==============================================
                    ABOUT
                ============================================== */}

                <Route
                  path="about"
                  element={
                    <AdminAbout />
                  }
                />


                {/* ==============================================
                    LEADERSHIP
                ============================================== */}

                <Route
                  path="leadership"
                  element={
                    <AdminLeadership />
                  }
                />

              </Route>

            </Route>


            {/* ==================================================
                404
            ================================================== */}

            <Route
              path="*"
              element={
                <NotFound />
              }
            />

          </Routes>

        </PageTransition>

      </main>


      {/* ======================================================
          PUBLIC FOOTER
      ====================================================== */}

      {!isAdminRoute && (
        <Footer />
      )}

    </div>
  );
}