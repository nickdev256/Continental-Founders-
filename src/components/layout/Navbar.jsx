import { useEffect, useState } from "react";

import {
  Menu,
  X,
  ArrowUpRight,
  ChevronDown,
  Search,
} from "lucide-react";

import {
  Link,
  NavLink,
  useLocation,
} from "react-router-dom";

import { navigation } from "../../data/navigation";

import "./Navbar.css";

export default function Navbar() {
  // =========================
  // MOBILE MENU
  // =========================
  const [open, setOpen] = useState(false);

  // =========================
  // MOBILE DROPDOWN
  // =========================
  const [mobileDropdown, setMobileDropdown] = useState(null);

  // =========================
  // SEARCH
  // =========================
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const location = useLocation();

  // =========================
  // WEBSITE SEARCH CONTENT
  // =========================
  const searchItems = [
    {
      title: "About Us",
      description:
        "Learn more about Continental Founders, our mission, vision, and purpose.",
      url: "/about",
    },
    {
      title: "Our Model",
      description:
        "Explore how Continental Founders connects universities, founders, partners, and institutions.",
      url: "/our-model",
    },
    {
      title: "University Partnerships",
      description:
        "Learn about university collaborations and institutional partnerships.",
      url: "/university-partnerships",
    },
    {
      title: "Sponsors & Partners",
      description:
        "Explore Continental Founders sponsors, strategic partners, and collaborators.",
      url: "/strategic-partners",
    },
    {
      title: "Events",
      description:
        "Discover upcoming events, gatherings, conferences, and founder activities.",
      url: "/events",
    },
    {
      title: "Insights",
      description:
        "Read Continental Founders insights, ideas, updates, and thought leadership.",
      url: "/insights",
    },
    {
      title: "Contact Us",
      description:
        "Get in touch with Continental Founders.",
      url: "/contact",
    },
  ];

  // =========================
  // FILTER SEARCH RESULTS
  // =========================
  const filteredResults = searchItems.filter((item) => {
    const query = searchQuery.toLowerCase().trim();

    if (!query) {
      return false;
    }

    return (
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query)
    );
  });

  // =========================
  // CLOSE MOBILE MENU
  // =========================
  const closeMenu = () => {
    setOpen(false);
    setMobileDropdown(null);
  };

  // =========================
  // CLOSE MENU WHEN PAGE CHANGES
  // =========================
  useEffect(() => {
    setOpen(false);
    setMobileDropdown(null);
  }, [location.pathname]);

  // =========================
  // PREVENT BODY SCROLL
  // =========================
  useEffect(() => {
    if (open) {
      document.body.classList.add("nav-open");
    } else {
      document.body.classList.remove("nav-open");
    }

    return () => {
      document.body.classList.remove("nav-open");
    };
  }, [open]);

  // =========================
  // CLOSE SEARCH
  // =========================
  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery("");
  };

  // =========================
  // TOGGLE MOBILE DROPDOWN
  // =========================
  const toggleMobileDropdown = (label) => {
    setMobileDropdown((current) =>
      current === label ? null : label
    );
  };

  return (
    <header className="navbar">
      {/* =====================================================
          TOP INSTITUTIONAL BAR
      ===================================================== */}

      <div className="navbar__top">
        <div className="navbar__top-inner">
          <div className="navbar__top-left">
            <span>Africa</span>

            <span className="navbar__top-divider">
              |
            </span>

            <span>United States</span>

            <span className="navbar__top-divider">
              |
            </span>

            <span>Global Partnerships</span>
          </div>

          <div className="navbar__top-right">
            <Link to="/contact">
              Contact
            </Link>

            <Link to="/strategic-partners">
              Strategic Partners
            </Link>

            <Link to="/university-partnerships">
              Universities
            </Link>
          </div>
        </div>
      </div>

      {/* =====================================================
          MAIN NAVIGATION
      ===================================================== */}

      <div className="navbar__main">
        <div className="navbar__inner">
          {/* =================================================
              BRAND
          ================================================= */}

          <Link
            to="/"
            className="navbar__brand"
            aria-label="Continental Founders home"
            onClick={closeMenu}
          >
            <img
              src="/assets/continental-founders-logo.png"
              alt="Continental Founders"
              className="navbar__logo"
            />
          </Link>

          {/* =================================================
              DESKTOP / MOBILE NAVIGATION
          ================================================= */}

          <nav
            id="primary-navigation"
            className={`navbar__nav ${
              open ? "is-open" : ""
            }`}
            aria-label="Primary navigation"
          >
            <div className="navbar__links">
              {navigation.map((item) => {
                // =========================================
                // DROPDOWN ITEM
                // =========================================

                if (item.children) {
                  const isOpen =
                    mobileDropdown === item.label;

                  return (
                    <div
                      key={item.path}
                      className={`navbar__dropdown ${
                        isOpen
                          ? "is-mobile-open"
                          : ""
                      }`}
                    >
                      <div className="navbar__dropdown-heading">
                        <NavLink
                          to={item.path}
                          className={({ isActive }) =>
                            `navbar__link navbar__dropdown-trigger ${
                              isActive
                                ? "is-active"
                                : ""
                            }`
                          }
                          onClick={() => {
                            if (
                              window.innerWidth <= 900
                            ) {
                              return;
                            }

                            closeMenu();
                          }}
                        >
                          <span>
                            {item.label}
                          </span>

                          <ChevronDown
                            className="navbar__dropdown-arrow"
                            size={14}
                            strokeWidth={1.7}
                          />
                        </NavLink>

                        <button
                          type="button"
                          className="navbar__mobile-dropdown-toggle"
                          onClick={() =>
                            toggleMobileDropdown(
                              item.label
                            )
                          }
                          aria-expanded={isOpen}
                          aria-label={`Toggle ${item.label} submenu`}
                        >
                          <ChevronDown
                            size={18}
                            strokeWidth={1.6}
                          />
                        </button>
                      </div>

                      <div className="navbar__dropdown-menu">
                        {item.children.map(
                          (child) => (
                            <NavLink
                              key={child.path}
                              to={child.path}
                              className={({
                                isActive,
                              }) =>
                                `navbar__dropdown-link ${
                                  isActive
                                    ? "is-active"
                                    : ""
                                }`
                              }
                              onClick={closeMenu}
                            >
                              <span>
                                {child.label}
                              </span>

                              <ArrowUpRight
                                size={14}
                                strokeWidth={1.6}
                              />
                            </NavLink>
                          )
                        )}
                      </div>
                    </div>
                  );
                }

                // =========================================
                // NORMAL ITEM
                // =========================================

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === "/"}
                    className={({ isActive }) =>
                      `navbar__link ${
                        isActive
                          ? "is-active"
                          : ""
                      }`
                    }
                    onClick={closeMenu}
                  >
                    <span>
                      {item.label}
                    </span>
                  </NavLink>
                );
              })}
            </div>

            {/* =================================================
                NAVIGATION ACTIONS
            ================================================= */}

            <div className="navbar__actions">
              <button
                type="button"
                className="navbar__search"
                aria-label="Search"
                onClick={() =>
                  setSearchOpen(true)
                }
              >
                <Search
                  size={18}
                  strokeWidth={1.6}
                />
              </button>

              <Link
                to="/contact"
                className="navbar__cta"
                onClick={closeMenu}
              >
                <span>
                  Schedule a Meeting
                </span>

                <ArrowUpRight
                  size={16}
                  strokeWidth={1.7}
                />
              </Link>
            </div>
          </nav>

          {/* =================================================
              MOBILE MENU BUTTON
          ================================================= */}

          <button
            type="button"
            className={`navbar__toggle ${
              open ? "is-open" : ""
            }`}
            onClick={() =>
              setOpen((current) => !current)
            }
            aria-expanded={open}
            aria-controls="primary-navigation"
            aria-label={
              open
                ? "Close navigation menu"
                : "Open navigation menu"
            }
          >
            {open ? (
              <X
                size={25}
                strokeWidth={1.5}
              />
            ) : (
              <Menu
                size={25}
                strokeWidth={1.5}
              />
            )}
          </button>
        </div>
      </div>

      {/* =====================================================
          SEARCH MODAL
      ===================================================== */}

      {searchOpen && (
        <div
          className="search-overlay"
          onClick={closeSearch}
        >
          <div
            className="search-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="search-header">
              <div className="search-input-wrapper">
                <Search
                  size={21}
                  strokeWidth={1.7}
                />

                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) =>
                    setSearchQuery(
                      e.target.value
                    )
                  }
                  placeholder="Search Continental Founders..."
                  autoFocus
                  aria-label="Search website"
                />
              </div>

              <button
                type="button"
                className="search-close"
                onClick={closeSearch}
                aria-label="Close search"
              >
                <X
                  size={22}
                  strokeWidth={1.7}
                />
              </button>
            </div>

            <div className="search-results">
              {!searchQuery.trim() && (
                <div className="search-empty">
                  <Search
                    size={34}
                    strokeWidth={1.4}
                  />

                  <h3>
                    Search Continental Founders
                  </h3>

                  <p>
                    Search our programs,
                    partnerships, events,
                    insights, and more.
                  </p>
                </div>
              )}

              {searchQuery.trim() &&
                filteredResults.length ===
                  0 && (
                  <div className="search-empty">
                    <h3>
                      No results found
                    </h3>

                    <p>
                      No results found for "
                      {searchQuery}".
                    </p>
                  </div>
                )}

              {filteredResults.length >
                0 && (
                <div className="search-result-list">
                  {filteredResults.map(
                    (item) => (
                      <Link
                        key={item.title}
                        to={item.url}
                        className="search-result"
                        onClick={closeSearch}
                      >
                        <div className="search-result-icon">
                          <Search
                            size={17}
                            strokeWidth={1.6}
                          />
                        </div>

                        <div>
                          <h4>
                            {item.title}
                          </h4>

                          <p>
                            {
                              item.description
                            }
                          </p>
                        </div>
                      </Link>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}