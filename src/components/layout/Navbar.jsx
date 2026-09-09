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
  /* ==========================================================
     STATE
  ========================================================== */

  const [open, setOpen] = useState(false);
  const [mobileDropdown, setMobileDropdown] = useState(null);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const location = useLocation();


  /* ==========================================================
     WEBSITE SEARCH CONTENT
  ========================================================== */

  const searchItems = [
    {
      title: "About Us",
      description:
        "Learn more about Continental Founders, our mission, vision, purpose, and global ecosystem.",
      url: "/about",
    },

    {
      title: "Our Model",
      description:
        "Explore how Continental Founders brings founders, universities, industry, expertise, markets, and opportunity together.",
      url: "/our-model",
    },

    {
      title: "Partners",
      description:
        "Explore the Continental Founders partnership ecosystem and opportunities for collaboration.",
      url: "/strategic-partners",
    },

    {
      title: "U.S.–Africa Trade & Business Network",
      description:
        "Explore trade, business relationships, market access, investor connections, and commercial engagement between Africa and the United States.",
      url: "/partners/us-africa-trade-network",
    },

    {
      title: "Universities",
      description:
        "Explore university partnerships, faculty expertise, research collaboration, student engagement, and global learning opportunities.",
      url: "/partners/universities",
    },

    {
      title: "Corporate Partners",
      description:
        "Explore corporate collaboration, industry expertise, mentorship, sponsorship, procurement, and commercial opportunities.",
      url: "/partners/corporate",
    },

    {
      title: "Government & Development Institutions",
      description:
        "Explore collaboration with government and development institutions around policy, programs, market access, and economic opportunity.",
      url: "/partners/government-development",
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
        "Get in touch with Continental Founders and explore opportunities to participate.",
      url: "/contact",
    },
  ];


  /* ==========================================================
     FILTER SEARCH RESULTS
  ========================================================== */

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


  /* ==========================================================
     CLOSE MOBILE MENU
  ========================================================== */

  const closeMenu = () => {
    setOpen(false);
    setMobileDropdown(null);
  };


  /* ==========================================================
     CLOSE MENU WHEN ROUTE CHANGES
  ========================================================== */

  useEffect(() => {
    setOpen(false);
    setMobileDropdown(null);
    setSearchOpen(false);
    setSearchQuery("");
  }, [location.pathname]);


  /* ==========================================================
     PREVENT BODY SCROLL
  ========================================================== */

  useEffect(() => {
    if (open || searchOpen) {
      document.body.classList.add("nav-open");
    } else {
      document.body.classList.remove("nav-open");
    }

    return () => {
      document.body.classList.remove("nav-open");
    };
  }, [open, searchOpen]);


  /* ==========================================================
     CLOSE SEARCH
  ========================================================== */

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery("");
  };


  /* ==========================================================
     OPEN SEARCH
  ========================================================== */

  const openSearch = () => {
    setOpen(false);
    setMobileDropdown(null);
    setSearchOpen(true);
  };


  /* ==========================================================
     MOBILE DROPDOWN
  ========================================================== */

  const toggleMobileDropdown = (label) => {
    setMobileDropdown((current) =>
      current === label ? null : label
    );
  };


  /* ==========================================================
     ACTIVE DROPDOWN CHECK

     Keeps "Partners" highlighted while viewing any of its
     four subpages.
  ========================================================== */

  const isDropdownActive = (item) => {
    if (location.pathname === item.path) {
      return true;
    }

    return item.children?.some((child) => {
      return (
        location.pathname === child.path ||
        location.pathname.startsWith(`${child.path}/`)
      );
    });
  };


  /* ==========================================================
     KEYBOARD SUPPORT FOR SEARCH
  ========================================================== */

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        if (searchOpen) {
          closeSearch();
        }

        if (open) {
          closeMenu();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [searchOpen, open]);


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
              Partners
            </Link>

            <Link to="/partners/universities">
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
              NAVIGATION
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

                /* =============================================
                   DROPDOWN ITEM
                ============================================= */

                if (item.children?.length) {
                  const isMobileOpen =
                    mobileDropdown === item.label;

                  const dropdownActive =
                    isDropdownActive(item);

                  return (
                    <div
                      key={item.path}
                      className={`navbar__dropdown ${
                        isMobileOpen
                          ? "is-mobile-open"
                          : ""
                      } ${
                        dropdownActive
                          ? "is-active"
                          : ""
                      }`}
                    >

                      <div className="navbar__dropdown-heading">

                        <NavLink
                          to={item.path}
                          className={() =>
                            `navbar__link navbar__dropdown-trigger ${
                              dropdownActive
                                ? "is-active"
                                : ""
                            }`
                          }
                          onClick={() => {
                            if (window.innerWidth > 900) {
                              closeMenu();
                            }
                          }}
                        >
                          <span>
                            {item.label}
                          </span>

                          <ChevronDown
                            className="navbar__dropdown-arrow"
                            size={14}
                            strokeWidth={1.7}
                            aria-hidden="true"
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
                          aria-expanded={isMobileOpen}
                          aria-label={`Toggle ${item.label} submenu`}
                        >
                          <ChevronDown
                            size={18}
                            strokeWidth={1.6}
                            aria-hidden="true"
                          />
                        </button>

                      </div>


                      {/* =======================================
                          DROPDOWN MENU
                      ======================================= */}

                      <div className="navbar__dropdown-menu">

                        {item.children.map((child) => (
                          <NavLink
                            key={child.path}
                            to={child.path}
                            className={({ isActive }) =>
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
                              aria-hidden="true"
                            />
                          </NavLink>
                        ))}

                      </div>

                    </div>
                  );
                }


                /* =============================================
                   NORMAL NAVIGATION ITEM
                ============================================= */

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
                aria-label="Search Continental Founders"
                onClick={openSearch}
              >
                <Search
                  size={18}
                  strokeWidth={1.6}
                  aria-hidden="true"
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
                  aria-hidden="true"
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
                aria-hidden="true"
              />
            ) : (
              <Menu
                size={25}
                strokeWidth={1.5}
                aria-hidden="true"
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
          role="presentation"
        >

          <div
            className="search-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
            role="dialog"
            aria-modal="true"
            aria-label="Search Continental Founders"
          >

            {/* =================================================
                SEARCH HEADER
            ================================================= */}

            <div className="search-header">

              <div className="search-input-wrapper">

                <Search
                  size={21}
                  strokeWidth={1.7}
                  aria-hidden="true"
                />

                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) =>
                    setSearchQuery(
                      event.target.value
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
                  aria-hidden="true"
                />
              </button>

            </div>


            {/* =================================================
                SEARCH RESULTS
            ================================================= */}

            <div className="search-results">

              {!searchQuery.trim() && (
                <div className="search-empty">

                  <Search
                    size={34}
                    strokeWidth={1.4}
                    aria-hidden="true"
                  />

                  <h3>
                    Search Continental Founders
                  </h3>

                  <p>
                    Search our partnerships,
                    events, insights, model,
                    and more.
                  </p>

                </div>
              )}


              {searchQuery.trim() &&
                filteredResults.length === 0 && (
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


              {filteredResults.length > 0 && (
                <div className="search-result-list">

                  {filteredResults.map((item) => (
                    <Link
                      key={item.url}
                      to={item.url}
                      className="search-result"
                      onClick={closeSearch}
                    >

                      <div className="search-result-icon">
                        <Search
                          size={17}
                          strokeWidth={1.6}
                          aria-hidden="true"
                        />
                      </div>


                      <div>
                        <h4>
                          {item.title}
                        </h4>

                        <p>
                          {item.description}
                        </p>
                      </div>

                    </Link>
                  ))}

                </div>
              )}

            </div>

          </div>
        </div>
      )}

    </header>
  );
}