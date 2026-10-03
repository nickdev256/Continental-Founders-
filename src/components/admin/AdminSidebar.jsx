import React, { useEffect, useRef, useState } from "react";

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

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

const ETH_TECH_ADMIN_URL =
  "https://app.pacetas.com/v2/location/y0gKe8UoL5xmijbdA9j0/dashboard";

const navigationSections = [
  {
    title: "Overview",
    items: [
      {
        label: "Dashboard",
        path: "/admin",
        icon: LayoutDashboard,
        end: true,
      },
    ],
  },
  {
    title: "Venture & Fellowship",
    items: [
      {
        label: "Ventures",
        path: "/admin/ventures",
        icon: BriefcaseBusiness,
      },
      {
        label: "CFCV Admissions",
        path: "/admin/cfcv",
        icon: ClipboardCheck,
      },
    ],
  },
  {
    title: "Content & Communications",
    items: [
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
        label: "Gallery",
        path: "/admin/gallery",
        icon: Images,
      },
      {
        label: "Newsletter",
        path: "/admin/newsletter",
        icon: Mail,
      },
    ],
  },
  {
    title: "Relationships",
    items: [
      {
        label: "Contacts",
        path: "/admin/contacts",
        icon: MessageSquareText,
      },
      {
        label: "Universities",
        path: "/admin/universities",
        icon: GraduationCap,
      },
    ],
  },
  {
    title: "Partnerships",
    items: [
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
    ],
  },
  {
    title: "Organization",
    items: [
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
    ],
  },
];

const publicShortcuts = [
  {
    label: "CFCV",
    path: "/cfcv",
    icon: ClipboardCheck,
  },
  {
    label: "Gallery",
    path: "/gallery",
    icon: Images,
  },
  {
    label: "Ventures",
    path: "/ventures",
    icon: BriefcaseBusiness,
  },
  {
    label: "Partners",
    path: "/strategic-partners",
    icon: Users,
  },
];

export default function AdminSidebar({
  open = false,
  onClose,
}) {
  const navigate = useNavigate();

  const sidebarRef = useRef(null);
  const closeButtonRef = useRef(null);
  const onCloseRef = useRef(onClose);

  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");
  const [logoFailed, setLogoFailed] = useState(false);

  const [isMobile, setIsMobile] = useState(() => {
    return (
      typeof window !== "undefined" &&
      window.matchMedia("(max-width: 850px)").matches
    );
  });

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 850px)");

    function updateViewport() {
      setIsMobile(query.matches);
    }

    updateViewport();

    query.addEventListener("change", updateViewport);

    return () => {
      query.removeEventListener("change", updateViewport);
    };
  }, []);

  useEffect(() => {
    if (sidebarRef.current) {
      sidebarRef.current.inert = isMobile && !open;
    }
  }, [isMobile, open]);

  useEffect(() => {
    if (!isMobile || !open) {
      return;
    }

    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current?.();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const elements = Array.from(
        sidebarRef.current?.querySelectorAll(
          'a[href], button:not([disabled]), [tabindex="0"]'
        ) || []
      ).filter((element) => element.getClientRects().length > 0);

      if (!elements.length) {
        return;
      }

      const firstElement = elements[0];
      const lastElement = elements[elements.length - 1];
      const activeElement = document.activeElement;

      if (!sidebarRef.current?.contains(activeElement)) {
        event.preventDefault();
        firstElement.focus();
      } else if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);

      if (
        previousFocus instanceof HTMLElement &&
        previousFocus.isConnected
      ) {
        previousFocus.focus();
      }
    };
  }, [isMobile, open]);

  function handleNavigation() {
    onCloseRef.current?.();
  }

  function clearLocalAuthState() {
    localStorage.removeItem("cf_admin_user");
    localStorage.removeItem("cf_admin_token");

    sessionStorage.removeItem("cf_pending_admin_email");
    sessionStorage.removeItem("cf_otp_purpose");
  }

  async function handleLogout() {
    if (loggingOut) {
      return;
    }

    setLoggingOut(true);
    setLogoutError("");

    try {
      const response = await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        let result = {};

        try {
          result = await response.json();
        } catch {
          result = {};
        }

        throw new Error(
          result?.message || "Unable to sign out. Please try again."
        );
      }

      clearLocalAuthState();
      handleNavigation();

      navigate("/admin/login", {
        replace: true,
      });
    } catch (error) {
      console.error("Admin logout error:", error);

      setLogoutError(
        error?.message || "Unable to sign out. Please try again."
      );
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <>
      {isMobile && open && (
        <div
          className="admin-sidebar__overlay"
          onClick={handleNavigation}
          aria-hidden="true"
        />
      )}

      <aside
        ref={sidebarRef}
        id="admin-sidebar"
        className={[
          "admin-sidebar",
          open ? "admin-sidebar--open" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-label="Continental Founders administration"
        aria-hidden={isMobile && !open ? true : undefined}
      >
        <header className="admin-sidebar__header">
          <Link
            to="/"
            className="admin-sidebar__brand"
            onClick={handleNavigation}
            aria-label="Continental Founders home"
          >
            {logoFailed ? (
              <span className="admin-sidebar__wordmark">
                CONTINENTAL <span>FOUNDERS</span>
              </span>
            ) : (
              <img
                src="/assets/continental-founders-logo.webp"
                alt="Continental Founders"
                className="admin-sidebar__logo"
                onError={() => setLogoFailed(true)}
              />
            )}
          </Link>

          <button
            ref={closeButtonRef}
            type="button"
            className="admin-sidebar__close"
            onClick={handleNavigation}
            aria-label="Close administration menu"
          >
            <X size={20} />
          </button>

          <div className="admin-sidebar__workspace">
            <ShieldCheck size={12} aria-hidden="true" />
            <span>Admin Workspace</span>
          </div>
        </header>

        <nav
          className="admin-sidebar__nav"
          aria-label="CMS navigation"
        >
          {navigationSections.map((section, sectionIndex) => (
            <section
              key={section.title}
              className="admin-sidebar__section"
              aria-labelledby={`admin-nav-section-${sectionIndex}`}
            >
              <h2
                id={`admin-nav-section-${sectionIndex}`}
                className="admin-sidebar__section-title"
              >
                {section.title}
              </h2>

              <div className="admin-sidebar__section-links">
                {section.items.map((item) => {
                  const Icon = item.icon;

                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      end={item.end}
                      onClick={handleNavigation}
                      className={({ isActive }) =>
                        [
                          "admin-sidebar__link",
                          isActive
                            ? "admin-sidebar__link--active"
                            : "",
                        ]
                          .filter(Boolean)
                          .join(" ")
                      }
                    >
                      <Icon
                        className="admin-sidebar__link-icon"
                        size={18}
                        strokeWidth={1.7}
                        aria-hidden="true"
                      />

                      <span className="admin-sidebar__link-title">
                        {item.label}
                      </span>

                      <ChevronRight
                        className="admin-sidebar__link-chevron"
                        size={14}
                        strokeWidth={1.7}
                        aria-hidden="true"
                      />
                    </NavLink>
                  );
                })}
              </div>
            </section>
          ))}
        </nav>

        <footer className="admin-sidebar__bottom">
          <div className="admin-sidebar__quick-actions">
            {publicShortcuts.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="admin-sidebar__shortcut"
                  onClick={handleNavigation}
                  aria-label={`View ${item.label}`}
                >
                  <Icon
                    size={17}
                    strokeWidth={1.7}
                    aria-hidden="true"
                  />

                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <Link
            to="/"
            className="admin-sidebar__website"
            onClick={handleNavigation}
          >
            <Globe2 size={17} aria-hidden="true" />
            <span>View Public Website</span>
            <ExternalLink size={15} aria-hidden="true" />
          </Link>

          <a
            href={ETH_TECH_ADMIN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="admin-sidebar__eth-admin"
            onClick={handleNavigation}
            aria-label="Open Eth Tech Admin in a new tab"
          >
            <ShieldCheck size={19} aria-hidden="true" />
            <span>Eth Tech Admin</span>
            <ExternalLink size={15} aria-hidden="true" />
          </a>

          <div className="admin-sidebar__account">
            <div
              className="admin-sidebar__avatar"
              aria-hidden="true"
            >
              <Users size={19} strokeWidth={1.7} />
            </div>

            <div className="admin-sidebar__account-info">
              <span className="admin-sidebar__account-name">
                Administrator
              </span>

              <span className="admin-sidebar__account-status">
                <span aria-hidden="true" />
                Secure session
              </span>
            </div>

            <button
              type="button"
              className="admin-sidebar__logout"
              onClick={handleLogout}
              disabled={loggingOut}
              aria-label={loggingOut ? "Signing out" : "Sign out"}
              title={loggingOut ? "Signing out…" : "Sign out"}
            >
              <LogOut
                size={18}
                strokeWidth={1.7}
                aria-hidden="true"
              />
            </button>
          </div>

          {logoutError && (
            <p
              className="admin-sidebar__error"
              role="alert"
            >
              {logoutError}
            </p>
          )}
        </footer>
      </aside>
    </>
  );
}