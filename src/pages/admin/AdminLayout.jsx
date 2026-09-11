import React, {
  useState,
} from "react";

import {
  Outlet,
} from "react-router-dom";

import AdminSidebar from "../../components/admin/AdminSidebar";

import "./AdminLayout.css";


export default function AdminLayout() {

  const [
    sidebarOpen,
    setSidebarOpen,
  ] =
    useState(false);


  function openSidebar() {
    setSidebarOpen(true);
  }


  function closeSidebar() {
    setSidebarOpen(false);
  }


  return (
    <div className="admin-layout">

      {/* ================================================
          SIDEBAR
      ================================================= */}

      <AdminSidebar
        open={sidebarOpen}
        onClose={closeSidebar}
      />


      {/* ================================================
          MOBILE OVERLAY
      ================================================= */}

      {sidebarOpen && (

        <button
          type="button"
          className="admin-layout__overlay"
          onClick={closeSidebar}
          aria-label="Close admin navigation"
        />

      )}


      {/* ================================================
          MAIN AREA
      ================================================= */}

      <div className="admin-layout__main">


        {/* ==============================================
            TOPBAR
        =============================================== */}

        <header className="admin-layout__topbar">

          <div className="admin-layout__topbar-left">

            <button
              type="button"
              className="admin-layout__menu-button"
              onClick={openSidebar}
              aria-label="Open admin navigation"
            >
              <span />
              <span />
              <span />
            </button>


            <div>

              <span className="admin-layout__eyebrow">
                CONTINENTAL FOUNDERS
              </span>

              <h1 className="admin-layout__title">
                Content Management System
              </h1>

            </div>

          </div>


          <div className="admin-layout__topbar-right">

            <div className="admin-layout__status">

              <span className="admin-layout__status-dot" />

              <span>
                System Online
              </span>

            </div>


            <div className="admin-layout__profile">

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

            </div>

          </div>

        </header>


        {/* ==============================================
            PAGE CONTENT
        =============================================== */}

        <main className="admin-layout__content">

          <Outlet />

        </main>

      </div>

    </div>
  );
}