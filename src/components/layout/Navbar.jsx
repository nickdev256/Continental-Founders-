import { useCallback, useEffect, useRef, useState } from "react";
import {
  Menu,
  X,
  ChevronDown,
  Search,
  ArrowRight,
  ArrowUpRight,
} from "lucide-react";
import {
  Link,
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { navigation } from "../../data/navigation";
import "./Navbar.css";

const SUBSCRIPTION_URL = "https://ethtechsolutions.com/pricing";
// Subscribe button is shown but inactive for now; set to true to link it again.
const SUBSCRIBE_ACTIVE = false;
const ADMIN_LOGIN_PATH = "/admin/login";
const LOGO_CLICK_DELAY = 800;

const COMPACT_QUERY = "(max-width: 1100px)";

// Brand accent palette. Each section of the menu has its own colour.
const ACCENTS = {
  gold: "#c99220",
  navy: "#031b34",
  blue: "#2563c9",
  coral: "#e4572e",
  violet: "#6d4ae0",
};

const accent = (name) => ACCENTS[name] || ACCENTS.gold;

// Colours shown in the thin ribbon across the top of the site.
// White instead of navy, so it stays visible above the navy utility bar.
const RIBBON = [ACCENTS.gold, "#ffffff", ACCENTS.blue];

// Delay before a desktop menu closes, so the pointer can
// travel from the link down into the open panel.
const CLOSE_DELAY = 160;

// Every page in the navigation, for the search box.
const searchItems = navigation.flatMap((item) => [
  {
    title: item.label,
    description: item.description || item.intro || "",
    path: item.path,
  },
  ...(item.children || [])
    .filter((child) => child.path !== item.path)
    .map((child) => ({
      title: child.label,
      description: child.description,
      path: child.path,
    })),
]);

const isTouch = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(hover: none)").matches;

const isMac =
  typeof navigator !== "undefined" &&
  /Mac|iPhone|iPad/.test(navigator.platform);

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const headerRef = useRef(null);
  const navRef = useRef(null);
  const searchRef = useRef(null);
  const progressRef = useRef(null);
  const closeTimerRef = useRef(null);

  // Hidden admin access through three quick logo clicks.
  const logoClickCount = useRef(0);
  const logoClickTimer = useRef(null);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const [compact, setCompact] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia(COMPACT_QUERY).matches
  );

  const results = searchQuery.trim()
    ? searchItems.filter((item) =>
        `${item.title} ${item.description}`
          .toLowerCase()
          .includes(searchQuery.trim().toLowerCase())
      )
    : [];

  const cancelClose = () => {
    window.clearTimeout(closeTimerRef.current);
  };

  const closeMenus = useCallback(() => {
    window.clearTimeout(closeTimerRef.current);
    setMobileOpen(false);
    setActiveDropdown(null);
  }, []);

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery("");
  };

  useEffect(() => {
    closeMenus();
    closeSearch();
  }, [location.pathname, closeMenus]);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  // Track the mobile breakpoint.
  useEffect(() => {
    const query = window.matchMedia(COMPACT_QUERY);
    const update = () => {
      setCompact(query.matches);
      closeMenus();
    };

    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, [closeMenus]);

  // Shrink the header once the page scrolls, fill the reading
  // progress line, and tell the mobile menu where the header ends.
  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const max =
        document.documentElement.scrollHeight - window.innerHeight;

      // Different on/off points stop the header flickering
      // when it changes height near the threshold.
      setScrolled((wasScrolled) => (wasScrolled ? y > 8 : y > 80));

      if (progressRef.current) {
        const progress = max > 0 ? Math.min(y / max, 1) : 0;
        progressRef.current.style.transform = `scaleX(${progress})`;
      }

      if (headerRef.current) {
        const bottom = Math.max(
          0,
          Math.round(headerRef.current.getBoundingClientRect().bottom)
        );
        headerRef.current.style.setProperty("--nav-offset", `${bottom}px`);
      }
    };

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [location.pathname, scrolled, mobileOpen]);

  // Lock page scroll and listen for Escape while a menu is open.
  useEffect(() => {
    if (!mobileOpen && !searchOpen) return;

    // Lock <html>, not <body>: overflow on <body> would stop
    // the sticky header from sticking.
    const root = document.documentElement;
    const oldOverflow = root.style.overflow;
    root.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeMenus();
        closeSearch();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      root.style.overflow = oldOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileOpen, searchOpen, closeMenus]);

  // Close an open desktop menu on Escape or an outside click.
  useEffect(() => {
    if (!activeDropdown || compact) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setActiveDropdown(null);
    };

    const handlePointerDown = (event) => {
      if (!navRef.current?.contains(event.target)) {
        setActiveDropdown(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handlePointerDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [activeDropdown, compact]);

  // Ctrl/⌘ + K or "/" opens search.
  useEffect(() => {
    const handleShortcut = (event) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(
        event.target.tagName
      ) || event.target.isContentEditable;

      if (
        (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) ||
        (event.key === "/" && !typing)
      ) {
        event.preventDefault();
        closeMenus();
        setSearchOpen(true);
      }
    };

    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, [closeMenus]);

  useEffect(() => () => window.clearTimeout(closeTimerRef.current), []);

  useEffect(() => () => window.clearTimeout(logoClickTimer.current), []);

  // Three quick clicks on the logo open the existing admin login.
  const handleLogoClick = (event) => {
    logoClickCount.current += 1;
    window.clearTimeout(logoClickTimer.current);

    if (logoClickCount.current >= 3) {
      event.preventDefault();
      logoClickCount.current = 0;
      logoClickTimer.current = null;
      closeMenus();
      closeSearch();
      navigate(ADMIN_LOGIN_PATH);
      return;
    }

    logoClickTimer.current = window.setTimeout(() => {
      logoClickCount.current = 0;
      logoClickTimer.current = null;
    }, LOGO_CLICK_DELAY);

    closeMenus();
  };

  const isItemActive = (item) => {
    if (item.path && location.pathname === item.path) return true;

    return item.children?.some(
      (child) => location.pathname === child.path
    ) || false;
  };

  const openDropdown = (label) => {
    if (compact || isTouch()) return;
    cancelClose();
    setActiveDropdown(label);
  };

  const scheduleClose = () => {
    if (compact || isTouch()) return;
    cancelClose();
    closeTimerRef.current = window.setTimeout(
      () => setActiveDropdown(null),
      CLOSE_DELAY
    );
  };

  const desktopMenuOpen = Boolean(activeDropdown) && !compact;

  const headerClassName = [
    "navbar",
    scrolled ? "is-scrolled" : "",
    mobileOpen ? "is-menu-open" : "",
    desktopMenuOpen ? "is-mega-open" : "",
  ].filter(Boolean).join(" ");

  return (
    <>
      <header ref={headerRef} className={headerClassName}>
        {/* BRAND COLOUR RIBBON */}
        <div className="navbar__ribbon" aria-hidden="true">
          {RIBBON.map((color) => (
            <span key={color} style={{ background: color }} />
          ))}
        </div>

        {/* UTILITY BAR */}
        <div className="navbar__top">
          <div className="navbar__top-inner">
            <div className="navbar__utility-links">
              <span className="navbar__regions">Africa · United States</span>
              <Link to="/events">Events</Link>
              <Link to="/gallery">Gallery</Link>
              <Link to="/contact">Contact</Link>
            </div>
          </div>
        </div>

        {/* MAIN NAVIGATION */}
        <div className="navbar__main">
          <div className="navbar__inner">
            <Link
              to="/"
              className="navbar__brand"
              aria-label="Continental Founders home"
              onClick={handleLogoClick}
            >
              <img
                src="/assets/continental-founders-logo.webp"
                alt="Continental Founders"
                className="navbar__logo"
              />
            </Link>

            <nav
              ref={navRef}
              className={`navbar__nav ${mobileOpen ? "is-open" : ""}`}
              id="primary-navigation"
              aria-label="Main navigation"
              inert={compact && !mobileOpen}
            >
              <div className="navbar__links">
                {navigation.map((item, index) => {
                  if (!item.children?.length) {
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        style={{ "--i": index, "--accent": accent(item.accent) }}
                        className={({ isActive }) =>
                          `navbar__link navbar__item ${isActive ? "is-active" : ""}`
                        }
                        onClick={closeMenus}
                      >
                        {item.label}
                      </NavLink>
                    );
                  }

                  const expanded = activeDropdown === item.label;
                  const active = isItemActive(item);
                  const submenuId = `navbar-menu-${index}`;

                  return (
                    <div
                      key={item.label}
                      style={{ "--i": index, "--accent": accent(item.accent) }}
                      className={`navbar__dropdown navbar__item ${
                        expanded ? "is-expanded" : ""
                      } ${active ? "is-active" : ""}`}
                      onMouseEnter={() => openDropdown(item.label)}
                      onMouseLeave={scheduleClose}
                    >
                      <div className="navbar__dropdown-heading">
                        <NavLink
                          to={item.path}
                          className={`navbar__link navbar__dropdown-label ${
                            active ? "is-active" : ""
                          }`}
                          onClick={(event) => {
                            // Touch screens can't hover: the first tap
                            // opens the menu, the next one follows the link.
                            if (!compact && !expanded && isTouch()) {
                              event.preventDefault();
                              cancelClose();
                              setActiveDropdown(item.label);
                              return;
                            }
                            closeMenus();
                          }}
                        >
                          {item.label}
                        </NavLink>

                        <button
                          type="button"
                          className="navbar__chevron"
                          aria-label={`${expanded ? "Close" : "Open"} ${item.label} menu`}
                          aria-expanded={expanded}
                          aria-controls={submenuId}
                          onClick={() =>
                            setActiveDropdown(expanded ? null : item.label)
                          }
                        >
                          <ChevronDown size={16} />
                        </button>
                      </div>

                      <div
                        className="navbar__mega"
                        id={submenuId}
                        hidden={!expanded}
                      >
                        <div className="navbar__mega-inner">
                          <div className="navbar__mega-intro">
                            <span className="navbar__mega-eyebrow">
                              Explore
                            </span>
                            <h2>{item.label}</h2>
                            {item.intro && <p>{item.intro}</p>}
                            <Link
                              to={item.path}
                              className="navbar__mega-overview"
                              onClick={closeMenus}
                            >
                              View overview
                              <ArrowRight size={16} aria-hidden="true" />
                            </Link>
                          </div>

                          <div className="navbar__mega-links">
                            {item.children.map((child) => {
                              const Icon = child.icon;

                              return (
                                <NavLink
                                  key={child.path}
                                  style={{ "--tile": accent(child.color) }}
                                  to={child.path}
                                  end
                                  className={({ isActive }) =>
                                    `navbar__mega-link ${
                                      isActive ? "is-active" : ""
                                    }`
                                  }
                                  onClick={closeMenus}
                                >
                                  {Icon && (
                                    <span className="navbar__mega-icon">
                                      <Icon size={19} aria-hidden="true" />
                                    </span>
                                  )}
                                  <span className="navbar__mega-text">
                                    <strong>{child.label}</strong>
                                    {child.description && (
                                      <small>{child.description}</small>
                                    )}
                                  </span>
                                </NavLink>
                              );
                            })}
                          </div>

                          {item.feature && (
                            <Link
                              to={item.feature.path}
                              className="navbar__mega-feature"
                              onClick={closeMenus}
                            >
                              <img
                                src={item.feature.image}
                                alt=""
                                loading="lazy"
                              />
                              <span className="navbar__mega-feature-body">
                                <span className="navbar__mega-feature-eyebrow">
                                  {item.feature.eyebrow}
                                </span>
                                <span className="navbar__mega-feature-title">
                                  {item.feature.title}
                                </span>
                                <span className="navbar__mega-feature-cta">
                                  {item.feature.cta}
                                  <ArrowUpRight size={16} aria-hidden="true" />
                                </span>
                              </span>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* RIGHT-SIDE ACTIONS: SEARCH + SUBSCRIBE */}
              <div className="navbar__actions">
                <button
                  type="button"
                  className="navbar__search"
                  aria-label="Search website"
                  aria-keyshortcuts={isMac ? "Meta+K" : "Control+K"}
                  onClick={() => {
                    closeMenus();
                    setSearchOpen(true);
                  }}
                >
                  <Search size={17} aria-hidden="true" />
                  <span className="navbar__search-label">Search</span>
                </button>

                {SUBSCRIBE_ACTIVE ? (
                  <a
                    href={SUBSCRIPTION_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="navbar__subscribe"
                    onClick={closeMenus}
                  >
                    Subscribe
                  </a>
                ) : (
                  <button
                    type="button"
                    className="navbar__subscribe"
                    title="Coming soon"
                    disabled
                  >
                    Subscribe
                  </button>
                )}
              </div>
            </nav>

            <button
              type="button"
              className="navbar__mobile-toggle"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              aria-controls="primary-navigation"
              onClick={() => {
                setMobileOpen((value) => !value);
                setActiveDropdown(null);
              }}
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* READING PROGRESS */}
          <div className="navbar__progress" aria-hidden="true">
            <span ref={progressRef} />
          </div>
        </div>
      </header>

      {/* Dims the page behind an open desktop menu */}
      <div
        className={`navbar-scrim ${desktopMenuOpen ? "is-visible" : ""}`}
        aria-hidden="true"
        onMouseEnter={scheduleClose}
      />

      {/* SEARCH MODAL */}
      {searchOpen && (
        <div
          className="navbar-search-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeSearch();
          }}
        >
          <section
            className="navbar-search-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Search Continental Founders"
          >
            <div className="navbar-search-header">
              <Search size={21} aria-hidden="true" />
              <input
                ref={searchRef}
                type="search"
                placeholder="Search Continental Founders..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
              <button
                type="button"
                aria-label="Close search"
                onClick={closeSearch}
              >
                <X size={22} />
              </button>
            </div>

            <div className="navbar-search-results">
              {!searchQuery.trim() ? (
                <div className="navbar-search-suggestions">
                  <p className="navbar-search-hint">Popular pages</p>
                  {searchItems
                    .filter((item) =>
                      ["/cfcv", "/find-your-lane", "/strategic-partners", "/events"].includes(item.path)
                    )
                    .map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        className="navbar-search-result"
                        onClick={closeSearch}
                      >
                        <span>
                          <strong>{item.title}</strong>
                          <small>{item.description}</small>
                        </span>
                        <ArrowUpRight size={18} />
                      </Link>
                    ))}
                </div>
              ) : results.length ? (
                results.map((item) => (
                  <Link
                    key={`${item.title}-${item.path}`}
                    to={item.path}
                    className="navbar-search-result"
                    onClick={closeSearch}
                  >
                    <span>
                      <strong>{item.title}</strong>
                      <small>{item.description}</small>
                    </span>
                    <ArrowUpRight size={18} />
                  </Link>
                ))
              ) : (
                <p className="navbar-search-empty">
                  No results found. Try another keyword.
                </p>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
