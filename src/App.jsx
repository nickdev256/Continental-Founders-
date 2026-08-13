import React, { useEffect } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Home from "./pages/Home";
import About from "./pages/About";
import OurModel from "./pages/OurModel";
import UniversityPartnerships from "./pages/UniversityPartnerships";
import StrategicPartners from "./pages/StrategicPartners";
import Programs from "./pages/Programs";
import Impact from "./pages/Impact";
import Events from "./pages/Events";
import Insights from "./pages/Insights";
import InsightDetails from "./pages/InsightDetails";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
}

export default function App() {
  return (
    <div className="site-shell">
      <ScrollToTop />
      <Navbar />
      <main id="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/our-model" element={<OurModel />} />
          <Route path="/university-partnerships" element={<UniversityPartnerships />} />
          <Route path="/strategic-partners" element={<StrategicPartners />} />
          <Route path="/programs" element={<Programs />} />
          <Route path="/impact" element={<Impact />} />
          <Route path="/events" element={<Events />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/insights/:slug" element={<InsightDetails />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}