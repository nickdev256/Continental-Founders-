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


// ============================================================
// PARTNER SUBPAGES
// ============================================================

import USAfricaTradeNetwork from "./pages/USAfricaTradeNetwork";

import Universities from "./pages/Universities";

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

import AdminEvents from "./pages/admin/AdminEvents";

import AdminInsights from "./pages/admin/AdminInsights";

import AdminUniversities from "./pages/admin/AdminUniversities";

import AdminNewsletter from "./pages/admin/AdminNewsletter";

import AdminContacts from "./pages/admin/AdminContacts";

import AdminAbout from "./pages/admin/AdminAbout";

import AdminLeadership from "./pages/admin/AdminLeadership";


// ============================================================
// ADMIN PROTECTION
// ============================================================

import ProtectedAdminRoute from "./components/admin/ProtectedAdminRoute";


// ============================================================
// SCROLL TO TOP ON ROUTE CHANGE
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

      <ScrollToTop />


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
              path="/partners/universities"
              element={
                <Universities />
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

                <Route
                  index
                  element={
                    <AdminDashboard />
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