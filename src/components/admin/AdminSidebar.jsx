import React, {
  useState,
  useEffect,
  useRef,
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
  ClipboardCheck,
  Images,
} from "lucide-react";
import "./AdminSidebar.css";
/* ============================================================
   API
= =========================================================== */
const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(/\/+$/, "");
/* ============================================================
   OVERVIEW NAVIGATION
= =========================================================== */
const overviewNavigation = [
  {
    label: "Dashboard",
    description:
      "Overview & activity",
    path: "/admin",
    icon: LayoutDashboard,
    end: true,
  },
];
/* ============================================================
   VENTURE & FELLOWSHIP
= =========================================================== */
const ventureNavigation = [
  {
    label: "Ventures",
    description:
      "Founders & venture profiles",
    path: "/admin/ventures",
    icon: BriefcaseBusiness,
  },
  {
    label: "CFCV Admissions",
    description:
      "Applications & fellowship admissions",
    path: "/admin/cfcv",
    icon: ClipboardCheck,
  },
];
/* ============================================================
   CONTENT & COMMUNICATIONS
= =========================================================== */
const contentNavigation = [
  {
    label: "Events",
    description:
      "Programs & conferences",
    path: "/admin/events",
    icon: CalendarDays,
  },
  {
    label: "Insights",
    description:
      "Articles & publications",
    path: "/admin/insights",
    icon: Newspaper,
  },
  {
    label: "Gallery",
    description:
      "Photos & media",
    path: "/admin/gallery",
    icon: Images,
  },
  {
    label: "Newsletter",
    description:
      "Subscribers & campaigns",
    path: "/admin/newsletter",
    icon: Mail,
  },
];
/* ============================================================
   RELATIONSHIPS
= =========================================================== */
const relationshipNavigation = [
  {
    label: "Contacts",
    description:
      "Messages & inquiries",
    path: "/admin/contacts",
    icon: MessageSquareText,
  },
  {
    label: "Universities",
    description:
      "Academic directory",
    path: "/admin/universities",
    icon: GraduationCap,
  },
];
/* ============================================================
   PARTNERSHIPS
= =========================================================== */
const partnerNavigation = [
  {
    label:
      "U.S.–Africa Trade Network",
    path:
      "/admin/partners/us-africa-trade-network",
    icon: Globe2,
  },
  {
    label:
      "Corporate Partners",
    path:
      "/admin/partners/corporate",
    icon: Building2,
  },
  {
    label:
      "Government & Development",
    path:
      "/admin/partners/government-development",
    icon: Landmark,
  },
];
/* ============================================================
   ORGANIZATION
= =========================================================== */
const organizationNavigation = [
  {
    label: "About",
    description:
      "Institutional content",
    path: "/admin/about",
    icon: FileText,
  },
  {
    label: "Leadership",
    description:
      "Team & governance",
    path: "/admin/leadership",
    icon: Users,
  },
];
/* ============================================================
   SIDEBAR
= =========================================================== */
export default function AdminSidebar({
  open = false,
  onClose,
}) {
  const navigate =
    useNavigate();
  const sidebarRef = useRef(null);
  const closeButtonRef = useRef(null);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 850px)").matches
  );

  useEffect(() => {
    const query = window.matchMedia("(max-width: 850px)");
    const update = () => setIsMobile(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const sidebar = sidebarRef.current;
    if (sidebar) sidebar.inert = isMobile && !open;
  }, [isMobile, open]);

  useEffect(() => {
    if (!isMobile || !open) return;
    const previousFocus = document.activeElement;
    closeButtonRef.current?.focus();
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose?.();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) {
        previousFocus.focus();
      }
    };
  }, [isMobile, open, onClose]);

  const [
    loggingOut,
    setLoggingOut,
  ] = useState(false);
  const [
    logoutError,
    setLogoutError,
  ] = useState("");
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
                {
                  item.description
                }
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
      ref={sidebarRef}
      id="admin-sidebar"
      aria-hidden={isMobile && !open ? true : undefined}
      className={
        open
          ? "admin-sidebar admin-sidebar--open"
          : "admin-sidebar"
      }
      aria-label="Continental Founders administration"
    >
      {/* ======================================================
          BRAND
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
          ref={closeButtonRef}
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
          Manage ventures, CFCV
          admissions, institutional
          content, partnerships, events,
          communications, universities,
          gallery and public-facing
          information.
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
          title: "OVERVIEW",
          items:
            overviewNavigation,
        })}
        {renderSection({
          title:
            "VENTURE & FELLOWSHIP",
          items:
            ventureNavigation,
        })}
        {renderSection({
          title:
            "CONTENT & COMMUNICATIONS",
          items:
            contentNavigation,
        })}
        {renderSection({
          title:
            "RELATIONSHIPS",
          items:
            relationshipNavigation,
        })}
        {renderSection({
          title:
            "PARTNERSHIPS",
          items:
            partnerNavigation,
          compact: true,
        })}
        {renderSection({
          title:
            "ORGANIZATION",
          items:
            organizationNavigation,
        })}
      </nav>
      {/* ======================================================
          BOTTOM AREA
      ====================================================== */}
      <footer className="admin-sidebar__bottom">
        {/* ====================================================
            PUBLIC QUICK ACCESS
        ==================================================== */}
        <div className="admin-sidebar__quick-actions">
          <Link
            to="/cfcv"
            className="admin-sidebar__utility-link"
            onClick={handleNavigation}
          >
            <ClipboardCheck
              size={16}
              strokeWidth={1.8}
            />
            <span>
              View CFCV
            </span>
          </Link>
          <Link
            to="/gallery"
            className="admin-sidebar__utility-link"
            onClick={handleNavigation}
          >
            <Images
              size={16}
              strokeWidth={1.8}
            />
            <span>
              View Gallery
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
              View Ventures
            </span>
          </Link>
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
              View Partners
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
        {/* ====================================================
            LOGOUT
        ==================================================== */}
        <div className="admin-sidebar__logout-wrap">
          <button
            type="button"
            className="admin-sidebar__logout"
            onClick={
              handleLogout
            }
            disabled={
              loggingOut
            }
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
        {/* ====================================================
            FOOTER COPY
        ==================================================== */}
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
