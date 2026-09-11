import React, {
  useState,
} from "react";

import {
  NavLink,
  Link,
  useNavigate,
} from "react-router-dom";

import {
  LayoutDashboard,
  CalendarDays,
  Newspaper,
  GraduationCap,
  Mail,
  MessageSquareText,
  FileText,
  Users,
  ExternalLink,
  LogOut,
  X,
} from "lucide-react";

import "./AdminSidebar.css";


/* ============================================================
   API
============================================================ */

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";


/* ============================================================
   NAVIGATION
============================================================ */

const adminNavigation = [
  {
    label: "Dashboard",
    path: "/admin",
    icon: LayoutDashboard,
    end: true,
  },

  {
    label: "Events",
    path: "/admin/events",
    icon: CalendarDays,
  },

  {
    label: "Insights",
    path: "/admin/insights",
    icon: Newspaper,
  },

  {
    label: "Universities",
    path: "/admin/universities",
    icon: GraduationCap,
  },

  {
    label: "Newsletter",
    path: "/admin/newsletter",
    icon: Mail,
  },

  {
    label: "Contacts",
    path: "/admin/contacts",
    icon: MessageSquareText,
  },

  {
    label: "About",
    path: "/admin/about",
    icon: FileText,
  },

  {
    label: "Leadership",
    path: "/admin/leadership",
    icon: Users,
  },
];


/* ============================================================
   SIDEBAR
============================================================ */

export default function AdminSidebar({
  open,
  onClose,
}) {

  const navigate =
    useNavigate();


  const [
    loggingOut,
    setLoggingOut,
  ] =
    useState(false);


  const [
    logoutError,
    setLogoutError,
  ] =
    useState("");


  /* ==========================================================
     LOGOUT
  ========================================================== */

  async function handleLogout() {

    if (loggingOut) {
      return;
    }


    setLoggingOut(true);
    setLogoutError("");


    try {

      const response =
        await fetch(
          `${API_URL}/api/auth/logout`,
          {
            method:
              "POST",

            credentials:
              "include",

            headers: {
              Accept:
                "application/json",
            },
          }
        );


      let result =
        null;


      try {

        result =
          await response.json();

      } catch {

        result =
          null;

      }


      if (!response.ok) {

        throw new Error(
          result?.message ||
          "Unable to sign out."
        );

      }


      /* ======================================================
         CLEAR FRONTEND AUTH STATE

         The real authentication session is the HttpOnly
         cookie cleared by the backend.
      ====================================================== */

      localStorage.removeItem(
        "cf_admin_user"
      );

      localStorage.removeItem(
        "cf_admin_token"
      );

      sessionStorage.removeItem(
        "cf_pending_admin_email"
      );

      sessionStorage.removeItem(
        "cf_otp_purpose"
      );


      if (onClose) {
        onClose();
      }


      navigate(
        "/admin/login",
        {
          replace:
            true,
        }
      );

    } catch (
      error
    ) {

      console.error(
        "Admin logout error:",
        error
      );


      /*
        Even if the backend request fails,
        remove stale frontend state.

        Do not treat localStorage as the
        real authentication session.
      */

      localStorage.removeItem(
        "cf_admin_user"
      );

      localStorage.removeItem(
        "cf_admin_token"
      );


      setLogoutError(
        error.message ||
        "Unable to sign out. Please try again."
      );

    } finally {

      setLoggingOut(false);

    }

  }


  /* ==========================================================
     RENDER
  ========================================================== */

  return (

    <aside
      className={
        open
          ? "admin-sidebar admin-sidebar--open"
          : "admin-sidebar"
      }
    >

      {/* ================================================
          HEADER
      ================================================= */}

      <div className="admin-sidebar__header">

        <Link
          to="/"
          className="admin-sidebar__logo"
          onClick={onClose}
        >

          <img
            src="/assets/continental-founders-logo.png"
            alt="Continental Founders"
          />

        </Link>


        <button
          type="button"
          className="admin-sidebar__close"
          onClick={onClose}
          aria-label="Close admin navigation"
        >

          <X
            size={22}
            strokeWidth={1.8}
          />

        </button>

      </div>


      {/* ================================================
          CMS TITLE
      ================================================= */}

      <div className="admin-sidebar__identity">

        <span>
          ADMINISTRATION
        </span>

        <h2>
          Content Management
        </h2>

        <p>
          Manage Continental Founders website
          content and engagement.
        </p>

      </div>


      {/* ================================================
          NAVIGATION
      ================================================= */}

      <nav
        className="admin-sidebar__nav"
        aria-label="Admin navigation"
      >

        <span className="admin-sidebar__nav-label">
          MANAGEMENT
        </span>


        {adminNavigation.map(
          (item) => {

            const Icon =
              item.icon;


            return (

              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={onClose}
                className={({
                  isActive,
                }) =>
                  isActive
                    ? "admin-sidebar__link admin-sidebar__link--active"
                    : "admin-sidebar__link"
                }
              >

                <span className="admin-sidebar__link-icon">

                  <Icon
                    size={18}
                    strokeWidth={1.7}
                  />

                </span>


                <span>
                  {item.label}
                </span>

              </NavLink>

            );

          }
        )}

      </nav>


      {/* ================================================
          BOTTOM
      ================================================= */}

      <div className="admin-sidebar__bottom">

        <Link
          to="/"
          className="admin-sidebar__website"
          onClick={onClose}
        >

          <ExternalLink
            size={17}
            strokeWidth={1.7}
          />

          <span>
            View Public Website
          </span>

        </Link>


        {/* ==============================================
            LOGOUT
        =============================================== */}

        <button
          type="button"
          className="admin-sidebar__logout"
          onClick={handleLogout}
          disabled={loggingOut}
        >

          <LogOut
            size={17}
            strokeWidth={1.8}
          />

          <span>
            {
              loggingOut
                ? "Signing Out..."
                : "Sign Out"
            }
          </span>

        </button>


        {
          logoutError &&
          (
            <p
              className="admin-sidebar__logout-error"
              role="alert"
            >
              {logoutError}
            </p>
          )
        }


        <div className="admin-sidebar__footer-copy">

          <span>
            Continental Founders™
          </span>

          <small>
            CMS Administration
          </small>

        </div>

      </div>

    </aside>

  );

}