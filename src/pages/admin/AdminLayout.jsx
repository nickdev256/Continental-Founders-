import React, {
  useMemo,
  useState,
} from "react";

import {
  ChevronDown,
  Menu,
} from "lucide-react";

import {
  Outlet,
  useLocation,
} from "react-router-dom";

import AdminSidebar from "../../components/admin/AdminSidebar";

import "./AdminLayout.css";


export default function AdminLayout() {

  const [
    sidebarOpen,
    setSidebarOpen,
  ] =
    useState(false);


  const {
    pathname,
  } =
    useLocation();


  function openSidebar() {
    setSidebarOpen(true);
  }


  function closeSidebar() {
    setSidebarOpen(false);
  }


  /* ==========================================================
     CURRENT PAGE TITLE
  ========================================================== */

  const currentSection =
    useMemo(
      () => {

        const routeTitles = {

          "/admin":
            "Dashboard",

          "/admin/events":
            "Events Management",

          "/admin/insights":
            "Insights Management",

          "/admin/universities":
            "Universities Directory",

          "/admin/newsletter":
            "Newsletter Management",

          "/admin/contacts":
            "Contact Submissions",

          "/admin/about":
            "About Page",

          "/admin/leadership":
            "Leadership Management",

          "/admin/partners/us-africa-trade-network":
            "U.S.–Africa Trade Network",

          "/admin/partners/universities":
            "Universities Page",

          "/admin/partners/corporate":
            "Corporate Partners",

          "/admin/partners/government-development":
            "Government & Development",

        };


        return (
          routeTitles[pathname] ||
          "Content Management System"
        );

      },
      [
        pathname,
      ]
    );


  return (

    <div className="admin-layout">

      {/* ======================================================
          SIDEBAR
      ======================================================= */}

      <AdminSidebar
        open={sidebarOpen}
        onClose={closeSidebar}
      />


      {/* ======================================================
          MOBILE OVERLAY
      ======================================================= */}

      {sidebarOpen && (

        <button
          type="button"
          className="admin-layout__overlay"
          onClick={closeSidebar}
          aria-label="Close admin navigation"
        />

      )}


      {/* ======================================================
          MAIN
      ======================================================= */}

      <div className="admin-layout__main">


        {/* ====================================================
            TOPBAR
        ===================================================== */}

        <header className="admin-layout__topbar">

          <div className="admin-layout__topbar-left">

            <button
              type="button"
              className="admin-layout__menu-button"
              onClick={openSidebar}
              aria-label="Open admin navigation"
            >

              <Menu
                size={24}
                strokeWidth={1.8}
              />

            </button>


            <div className="admin-layout__brand">

              <span>
                CONTINENTAL FOUNDERS
              </span>

            </div>


            <span className="admin-layout__page-title">
              {currentSection}
            </span>

          </div>


          <div className="admin-layout__topbar-right">

            {/* =================================================
                SYSTEM STATUS
            ================================================== */}

            <div className="admin-layout__status">

              <span className="admin-layout__status-dot" />

              <span>
                System Online
              </span>

            </div>


            <div className="admin-layout__divider" />


            {/* =================================================
                PROFILE
            ================================================== */}

            <button
              type="button"
              className="admin-layout__profile"
              aria-label="Administrator profile"
            >

              <div className="admin-layout__avatar">
                CF
              </div>


              <div className="admin-layout__profile-copy">

                <strong>
                  Administrator
                </strong>

                <span>
                  CMS Access
                </span>

              </div>


              <ChevronDown
                className="admin-layout__profile-chevron"
                size={16}
                strokeWidth={1.8}
              />

            </button>

          </div>

        </header>


        {/* ====================================================
            PAGE CONTENT
        ===================================================== */}

        <main className="admin-layout__content">

          <Outlet />

        </main>

      </div>

    </div>

  );

}