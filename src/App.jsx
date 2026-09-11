import React, { useEffect } from "react";
import {
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import PageTransition from "./components/layout/PageTransition";

import Home from "./pages/Home";
import About from "./pages/About";

import Ventures from "./pages/Ventures";
import VentureDetails from "./pages/VentureDetails";

import OurModel from "./pages/OurModel";

import StrategicPartners from "./pages/StrategicPartners";

/* ============================================================
   PARTNER SUBPAGES
============================================================ */

import USAfricaTradeNetwork from "./pages/USAfricaTradeNetwork";
import Universities from "./pages/Universities";
import CorporatePartners from "./pages/CorporatePartners";
import GovernmentDevelopment from "./pages/GovernmentDevelopment";

import Programs from "./pages/Programs";
import Impact from "./pages/Impact";

import Events from "./pages/Events";

import Insights from "./pages/Insights";
import InsightDetails from "./pages/InsightDetails";

import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";


/* ============================================================
   SCROLL TO TOP ON ROUTE CHANGE
============================================================ */

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant",
    });
  }, [pathname]);

  return null;
}


/* ============================================================
   APP
============================================================ */

export default function App() {
  return (
    <div className="site-shell">

      <ScrollToTop />

      <Navbar />

      <main id="main-content">

        <PageTransition>

          <Routes>

            {/* ==================================================
                HOME
            ================================================== */}

            <Route
              path="/"
              element={<Home />}
            />


            {/* ==================================================
                ABOUT
            ================================================== */}

            <Route
              path="/about"
              element={<About />}
            />


            {/* ==================================================
                VENTURES
            ================================================== */}

            <Route
              path="/ventures"
              element={<Ventures />}
            />

            <Route
              path="/ventures/:slug"
              element={<VentureDetails />}
            />


            {/* ==================================================
                OUR MODEL
            ================================================== */}

            <Route
              path="/our-model"
              element={<OurModel />}
            />


            {/* ==================================================
                PARTNERS
            ================================================== */}

            <Route
              path="/strategic-partners"
              element={<StrategicPartners />}
            />

            <Route
              path="/partners/us-africa-trade-network"
              element={<USAfricaTradeNetwork />}
            />

            <Route
              path="/partners/universities"
              element={<Universities />}
            />

            <Route
              path="/partners/corporate"
              element={<CorporatePartners />}
            />

            <Route
              path="/partners/government-development"
              element={<GovernmentDevelopment />}
            />


            {/* ==================================================
                PROGRAMS / IMPACT
            ================================================== */}

            <Route
              path="/programs"
              element={<Programs />}
            />

            <Route
              path="/impact"
              element={<Impact />}
            />


            {/* ==================================================
                EVENTS
            ================================================== */}

            <Route
              path="/events"
              element={<Events />}
            />


            {/* ==================================================
                INSIGHTS
            ================================================== */}

            <Route
              path="/insights"
              element={<Insights />}
            />

            <Route
              path="/insights/:slug"
              element={<InsightDetails />}
            />


            {/* ==================================================
                CONTACT
            ================================================== */}

            <Route
              path="/contact"
              element={<Contact />}
            />


            {/* ==================================================
                404
            ================================================== */}

            <Route
              path="*"
              element={<NotFound />}
            />

          </Routes>

        </PageTransition>

      </main>

      <Footer />

    </div>
  );
}