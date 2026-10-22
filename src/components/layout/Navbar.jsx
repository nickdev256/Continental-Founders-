
import { useEffect, useRef, useState } from "react";
import {
  Menu,
  X,
  ChevronDown,
  Search,
  ArrowUpRight,
  FileText,
} from "lucide-react";
import {
  Link,
  NavLink,
  useLocation,
} from "react-router-dom";
import { navigation } from "../../data/navigation";
import "./Navbar.css";

const SUBSCRIPTION_URL = "https://ethtechsolutions.com/pricing";

const searchItems = [
  { title: "About", description: "Learn about Continental Founders.", path: "/about" },
  { title: "Fellowship Community", description: "Explore the fellowship community.", path: "/fellowship-community" },
  { title: "Apply to CF Fellows", description: "Apply to join CF Fellows.", path: "/cfcv/apply" },
  { title: "Partners", description: "Explore our strategic partnerships.", path: "/strategic-partners" },
  { title: "U.S.–Africa Trade & Business Network", description: "Explore our trade network.", path: "/partners/us-africa-trade-network" },
  { title: "Universities", description: "Explore university partnerships.", path: "/universities" },
  { title: "Corporate Partners", description: "Explore corporate partnerships.", path: "/partners/corporate" },
  { title: "Government & Development Institutions", description: "Explore institutional partnerships.", path: "/partners/government-development" },
  { title: "Events", description: "Discover events and gatherings.", path: "/events" },
  { title: "Insights", description: "Read our latest insights.", path: "/insights" },
  { title: "Gallery", description: "Explore our gallery.", path: "/gallery" },
  { title: "Contact", description: "Get in touch with our team.", path: "/contact" },
];

export default function Navbar() {
  const location = useLocation();
  const navRef = useRef(null);
  const searchRef = useRef(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const results = searchQuery.trim()
    ? searchItems.filter((item) =>
        `${item.title} ${item.description}`
          .toLowerCase()
          .includes(searchQuery.trim().toLowerCase())
      )
    : [];

  const closeMenus = () => {
    setMobileOpen(false);
    setActiveDropdown(null);
  };

  useEffect(() => {
    closeMenus();
    setSearchOpen(false);
    setSearchQuery("");
  }, [location.pathname]);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    if (!mobileOpen && !searchOpen) return;

    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
        setActiveDropdown(null);
        setSearchOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = oldOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileOpen, searchOpen]);

  const isItemActive = (item) => {
    if (item.path && location.pathname === item.path) return true;

    return item.children?.some(
      (child) => location.pathname === child.path
    ) || false;
  };

  return (
    <>
      <header className="navbar">
        {/* TOP UTILITY BAR */}
        <div className="navbar__top">
          <div className="navbar__top-inner">
            <div className="navbar__regions">
              <span>Africa</span>
              <span className="navbar__separator">|</span>
              <span>United States</span>
              <span className="navbar__separator">|</span>
              <span>Global Partnerships</span>
            </div>

            <div className="navbar__utility-links">
              <Link to="/contact">Contact</Link>
              <Link to="/strategic-partners">Partners</Link>
              <Link to="/universities">Universities</Link>
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
              onClick={closeMenus}
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
              inert={!mobileOpen && typeof window !== "undefined" && window.innerWidth <= 1100}
            >
              <div className="navbar__links">
                {navigation.map((item, index) => {
                  if (!item.children?.length) {
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                          `navbar__link ${isActive ? "is-active" : ""}`
                        }
                        onClick={closeMenus}
                      >
                        {item.label}
                      </NavLink>
                    );
                  }

                  const expanded = activeDropdown === item.label;
                  const active = isItemActive(item);
                  const submenuId = `navbar-dropdown-${index}`;

                  return (
                    <div
                      key={item.label}
                      className={`navbar__dropdown ${
                        expanded ? "is-expanded" : ""
                      } ${active ? "is-active" : ""}`}
                      onMouseEnter={() => {
                        if (window.innerWidth > 1100) {
                          setActiveDropdown(item.label);
                        }
                      }}
                      onMouseLeave={() => {
                        if (window.innerWidth > 1100) {
                          setActiveDropdown(null);
                        }
                      }}
                    >
                      <div className="navbar__dropdown-heading">
                        {item.path ? (
                          <NavLink
                            to={item.path}
                            className={`navbar__link navbar__dropdown-label ${
                              active ? "is-active" : ""
                            }`}
                            onClick={closeMenus}
                          >
                            {item.label}
                          </NavLink>
                        ) : (
                          <button
                            type="button"
                            className={`navbar__link navbar__dropdown-label ${
                              active ? "is-active" : ""
                            }`}
                            aria-expanded={expanded}
                            aria-controls={submenuId}
                            onClick={() =>
                              setActiveDropdown(expanded ? null : item.label)
                            }
                          >
                            {item.label}
                          </button>
                        )}

                        <button
                          type="button"
                          className="navbar__chevron"
                          aria-label={`${expanded ? "Close" : "Open"} ${item.label} dropdown`}
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
                        className="navbar__dropdown-menu"
                        id={submenuId}
                        hidden={!expanded}
                      >
                        {item.children.map((child) => (
                          <NavLink
                            key={child.path}
                            to={child.path}
                            className={({ isActive }) =>
                              `navbar__dropdown-link ${
                                isActive ? "is-active" : ""
                              }`
                            }
                            onClick={closeMenus}
                          >
                            <FileText size={19} aria-hidden="true" />
                            <span>{child.label}</span>
                            <ArrowUpRight
                              className="navbar__dropdown-arrow"
                              size={17}
                              aria-hidden="true"
                            />
                          </NavLink>
                        ))}
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
                  onClick={() => {
                    closeMenus();
                    setSearchOpen(true);
                  }}
                >
                  <Search size={19} />
                  <span className="navbar__search-label">Search</span>
                </button>

                <a
                  href={SUBSCRIPTION_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="navbar__subscribe"
                  onClick={closeMenus}
                >
                  Subscribe
                </a>

                {/* No standalone Apply to CFCV button */}
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
              {mobileOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>
      </header>

      {/* SEARCH MODAL */}
      {searchOpen && (
        <div
          className="navbar-search-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSearchOpen(false);
              setSearchQuery("");
            }
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
                onClick={() => {
                  setSearchOpen(false);
                  setSearchQuery("");
                }}
              >
                <X size={22} />
              </button>
            </div>

            <div className="navbar-search-results">
              {!searchQuery.trim() ? (
                <p className="navbar-search-empty">
                  Search our website, fellowship, partners and events.
                </p>
              ) : results.length ? (
                results.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="navbar-search-result"
                    onClick={() => {
                      setSearchOpen(false);
                      setSearchQuery("");
                    }}
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
