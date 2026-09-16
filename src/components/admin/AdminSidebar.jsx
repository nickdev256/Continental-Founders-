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
  Globe2,
  Building2,
  Landmark,
  ShieldCheck,
  ChevronRight,
  BriefcaseBusiness,
} from "lucide-react";

import "./AdminSidebar.css";


/* ============================================================
   API
============================================================ */

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";


/* ============================================================
   MANAGEMENT NAVIGATION
============================================================ */

const managementNavigation = [
  {
    label: "Dashboard",
    description: "Overview & activity",
    path: "/admin",
    icon: LayoutDashboard,
    end: true,
  },

  {
    label: "Ventures",
    description: "Founders & venture profiles",
    path: "/admin/ventures",
    icon: BriefcaseBusiness,
  },

  {
    label: "Events",
    description: "Programs & conferences",
    path: "/admin/events",
    icon: CalendarDays,
  },

  {
    label: "Insights",
    description: "Articles & publications",
    path: "/admin/insights",
    icon: Newspaper,
  },

  {
    label: "Universities",
    description: "Academic directory",
    path: "/admin/universities",
    icon: GraduationCap,
  },

  {
    label: "Newsletter",
    description: "Subscribers & campaigns",
    path: "/admin/newsletter",
    icon: Mail,
  },

  {
    label: "Contacts",
    description: "Messages & inquiries",
    path: "/admin/contacts",
    icon: MessageSquareText,
  },
];


/* ============================================================
   CONTENT NAVIGATION
============================================================ */

const contentNavigation = [
  {
    label: "About",
    description: "Institutional content",
    path: "/admin/about",
    icon: FileText,
  },

  {
    label: "Leadership",
    description: "Team & governance",
    path: "/admin/leadership",
    icon: Users,
  },
];


/* ============================================================
   PARTNERSHIPS NAVIGATION
============================================================ */

const partnerNavigation = [
  {
    label: "U.S.–Africa Trade Network",
    path: "/admin/partners/us-africa-trade-network",
    icon: Globe2,
  },

  {
    label: "Corporate Partners",
    path: "/admin/partners/corporate",
    icon: Building2,
  },

  {
    label: "Government & Development",
    path: "/admin/partners/government-development",
    icon: Landmark,
  },
];


/* ============================================================
   SIDEBAR
============================================================ */

export default function AdminSidebar({
  open = false,
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
     CLEAR LOCAL AUTH
  ========================================================== */

  function clearLocalAuthState() {
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
  }


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
            method: "POST",

            credentials:
              "include",

            headers: {
              Accept:
                "application/json",
            },
          }
        );


      let result = null;

      try {
        result =
          await response.json();
      } catch {
        result = null;
      }


      if (!response.ok) {
        throw new Error(
          result?.message ||
          "Unable to sign out securely."
        );
      }


      clearLocalAuthState();


      if (onClose) {
        onClose();
      }


      navigate(
        "/admin/login",
        {
          replace: true,
        }
      );
    } catch (error) {
      console.error(
        "Admin logout error:",
        error
      );


      clearLocalAuthState();


      setLogoutError(
        error?.message ||
        "Unable to sign out. Please try again."
      );


      navigate(
        "/admin/login",
        {
          replace: true,
        }
      );
    } finally {
      setLoggingOut(false);
    }
  }


  /* ==========================================================
     CLOSE AFTER NAVIGATION
  ========================================================== */

  function handleNavigation() {
    if (onClose) {
      onClose();
    }
  }


  /* ==========================================================
     NAVIGATION ITEM
  ========================================================== */

  function renderNavItem(
    item,
    compact = false
  ) {
    const Icon =
      item.icon;


    return (
      <NavLink
        key={item.path}
        to={item.path}
        end={item.end}
        onClick={handleNavigation}
        className={({
          isActive,
        }) =>
          [
            "admin-sidebar__link",

            compact
              ? "admin-sidebar__link--compact"
              : "",

            isActive
              ? "admin-sidebar__link--active"
              : "",
          ]
            .filter(Boolean)
            .join(" ")
        }
      >

        <span
          className="admin-sidebar__link-icon"
          aria-hidden="true"
        >
          <Icon
            size={17}
            strokeWidth={1.8}
          />
        </span>


        <span className="admin-sidebar__link-content">

          <span className="admin-sidebar__link-title">
            {item.label}
          </span>


          {item.description &&
            !compact && (

            <span className="admin-sidebar__link-description">
              {item.description}
            </span>

          )}

        </span>


        <ChevronRight
          className="admin-sidebar__link-chevron"
          size={14}
          strokeWidth={1.8}
          aria-hidden="true"
        />

      </NavLink>
    );
  }


  /* ==========================================================
     NAVIGATION SECTION
  ========================================================== */

  function renderSection({
    title,
    items,
    compact = false,
  }) {
    return (
      <div className="admin-sidebar__section">

        <div className="admin-sidebar__section-header">

          <span>
            {title}
          </span>

          <span
            className="admin-sidebar__section-line"
            aria-hidden="true"
          />

        </div>


        <div className="admin-sidebar__section-links">

          {items.map(
            (item) =>
              renderNavItem(
                item,
                compact
              )
          )}

        </div>

      </div>
    );
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
      aria-label="Continental Founders administration"
    >

      {/* ======================================================
          LOGO
      ====================================================== */}

      <header className="admin-sidebar__header">

        <Link
          to="/"
          className="admin-sidebar__brand"
          onClick={handleNavigation}
          aria-label="Continental Founders home"
        >
          <img
            src="/assets/continental-founders-logo.webp"
            alt="Continental Founders"
            className="admin-sidebar__logo"
          />
        </Link>


        <button
          type="button"
          className="admin-sidebar__close"
          onClick={onClose}
          aria-label="Close administration menu"
        >
          <X
            size={20}
            strokeWidth={1.8}
          />
        </button>

      </header>


      {/* ======================================================
          ADMIN IDENTITY
      ====================================================== */}

      <div className="admin-sidebar__identity">

        <div className="admin-sidebar__identity-top">

          <ShieldCheck
            className="admin-sidebar__identity-icon"
            size={17}
            strokeWidth={1.8}
          />

          <span className="admin-sidebar__eyebrow">
            ADMINISTRATION
          </span>

        </div>


        <h1>
          Content Management
        </h1>


        <p>
          Manage ventures, institutional content,
          partnerships, events, communications,
          universities, and public-facing information.
        </p>

      </div>


      {/* ======================================================
          NAVIGATION
      ====================================================== */}

      <nav
        className="admin-sidebar__nav"
        aria-label="CMS navigation"
      >

        {renderSection({
          title:
            "MANAGEMENT",

          items:
            managementNavigation,
        })}


        {renderSection({
          title:
            "CONTENT",

          items:
            contentNavigation,
        })}


        {renderSection({
          title:
            "PARTNERSHIPS",

          items:
            partnerNavigation,

          compact:
            true,
        })}

      </nav>


      {/* ======================================================
          BOTTOM AREA
      ====================================================== */}

      <footer className="admin-sidebar__bottom">

        <div className="admin-sidebar__quick-actions">

          <Link
            to="/strategic-partners"
            className="admin-sidebar__utility-link"
            onClick={handleNavigation}
          >
            <ExternalLink
              size={16}
              strokeWidth={1.8}
            />

            <span>
              View Partners Page
            </span>
          </Link>


          <Link
            to="/ventures"
            className="admin-sidebar__utility-link"
            onClick={handleNavigation}
          >
            <BriefcaseBusiness
              size={16}
              strokeWidth={1.8}
            />

            <span>
              View Ventures Page
            </span>
          </Link>


          <Link
            to="/"
            className="admin-sidebar__utility-link"
            onClick={handleNavigation}
          >
            <ExternalLink
              size={16}
              strokeWidth={1.8}
            />

            <span>
              View Public Website
            </span>
          </Link>

        </div>


        <div className="admin-sidebar__logout-wrap">

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
              {loggingOut
                ? "Signing out..."
                : "Sign out"}
            </span>
          </button>


          {logoutError && (

            <p
              className="admin-sidebar__logout-error"
              role="alert"
            >
              {logoutError}
            </p>

          )}

        </div>


        <div className="admin-sidebar__footer-copy">

          <strong>
            Continental Founders™
          </strong>

          <span>
            Secure CMS Administration
          </span>

        </div>

      </footer>

    </aside>
  );
}