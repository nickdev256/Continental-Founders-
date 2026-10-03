import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Menu,
  X,
  ArrowUpRight,
  ChevronDown,
  Search,
  Rocket,
} from "lucide-react";

import {
  Link,
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { navigation } from "../../data/navigation";

import "./Navbar.css";

const SUBSCRIPTION_URL =
  "https://ethtechsolutions.com/pricing";

const MOBILE_QUERY = "(max-width: 1024px)";

const searchItems = [
  {
    title: "About Continental Founders",
    description:
      "Learn about our mission, vision, leadership and global ecosystem.",
    url: "/about",
  },
  {
    title: "Ventures",
    description:
      "Discover founders and ventures across Africa and global markets.",
    url: "/ventures",
  },
  {
    title: "Our Model",
    description:
      "Explore Potential, Preparation, Execution, Evidence and Opportunity.",
    url: "/our-model",
  },
  {
    title: "CFCV Fellowship",
    description:
      "Explore our six-month cross-continental venture-development fellowship.",
    url: "/cfcv",
    cfcv: true,
  },
  {
    title: "Apply to CFCV",
    description:
      "Start your application to the CFCV fellowship.",
    url: "/cfcv/apply",
    cfcv: true,
  },
  {
    title: "Strategic Partners",
    description:
      "Explore institutional and commercial collaboration.",
    url: "/strategic-partners",
  },
  {
    title: "U.S.–Africa Trade & Business Network",
    description:
      "Explore business relationships and market access between Africa and the United States.",
    url: "/partners/us-africa-trade-network",
  },
  {
    title: "University Partnerships",
    description:
      "Explore research, faculty expertise and student engagement.",
    url: "/universities",
  },
  {
    title: "Corporate Partners",
    description:
      "Explore corporate collaboration, mentorship and sponsorship.",
    url: "/partners/corporate",
  },
  {
    title: "Government & Development Institutions",
    description:
      "Explore entrepreneurship and economic opportunity partnerships.",
    url: "/partners/government-development",
  },
  {
    title: "Programs",
    description:
      "Explore founder programs, expertise, markets and opportunities.",
    url: "/programs",
  },
  {
    title: "Impact",
    description:
      "Explore our impact across entrepreneurship and innovation.",
    url: "/impact",
  },
  {
    title: "Events",
    description:
      "Discover events, gatherings and conferences.",
    url: "/events",
  },
  {
    title: "Insights",
    description:
      "Read articles on entrepreneurship, leadership and markets.",
    url: "/insights",
  },
  {
    title: "Gallery",
    description:
      "Explore photos from our events, programs and activities.",
    url: "/gallery",
  },
  {
    title: "Contact Continental Founders",
    description:
      "Contact us about partnerships and founder opportunities.",
    url: "/contact",
  },
  {
    title: "Subscribe",
    description:
      "View subscription plans on Eth Tech Solutions. Opens in a new tab.",
    url: SUBSCRIPTION_URL,
    external: true,
  },
];

function matchesPath(pathname, path) {
  return (
    pathname === path ||
    (path !== "/" && pathname.startsWith(`${path}/`))
  );
}

function isCFCVPath(path) {
  return path === "/cfcv" || path?.startsWith("/cfcv/");
}

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  const navRef = useRef(null);
  const menuButtonRef = useRef(null);
  const searchModalRef = useRef(null);
  const searchInputRef = useRef(null);

  const logoClickRef = useRef({
    count: 0,
    lastClick: 0,
  });

  const [open, setOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia(MOBILE_QUERY).matches
      : false
  );

  const query = searchQuery.trim().toLowerCase();

  const filteredResults = query
    ? searchItems.filter((item) =>
        `${item.title} ${item.description}`
          .toLowerCase()
          .includes(query)
      )
    : [];

  function closeMenu() {
    setOpen(false);
    setActiveDropdown(null);
  }

  function closeSearch() {
    setSearchOpen(false);
    setSearchQuery("");
  }

  function openSearch() {
    closeMenu();
    setSearchOpen(true);
  }

  function toggleDropdown(label) {
    setActiveDropdown((current) =>
      current === label ? null : label
    );
  }

  function handleLogoClick(event) {
    const now = Date.now();
    const previous = logoClickRef.current;

    const count =
      now - previous.lastClick <= 1500
        ? previous.count + 1
        : 1;

    logoClickRef.current = {
      count,
      lastClick: now,
    };

    closeMenu();
    closeSearch();

    if (count >= 3) {
      event.preventDefault();

      logoClickRef.current = {
        count: 0,
        lastClick: 0,
      };

      navigate("/admin/login");
    }
  }

  useEffect(() => {
    const media = window.matchMedia(MOBILE_QUERY);

    function handleResize() {
      setIsMobile(media.matches);
      setOpen(false);
      setActiveDropdown(null);
    }

    setIsMobile(media.matches);
    media.addEventListener("change", handleResize);

    return () => {
      media.removeEventListener("change", handleResize);
    };
  }, []);

  useEffect(() => {
    setOpen(false);
    setActiveDropdown(null);
    setSearchOpen(false);
    setSearchQuery("");
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (navRef.current) {
      navRef.current.inert = isMobile && !open;
    }
  }, [isMobile, open]);

  useEffect(() => {
    const shouldLock = searchOpen || (isMobile && open);

    if (!shouldLock) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobile, open, searchOpen]);

  useEffect(() => {
    if (!searchOpen) {
      return;
    }

    const previousFocus = document.activeElement;
    searchInputRef.current?.focus();

    return () => {
      if (
        previousFocus instanceof HTMLElement &&
        previousFocus.isConnected &&
        previousFocus.getClientRects().length > 0 &&
        !previousFocus.closest("[inert]")
      ) {
        previousFocus.focus();
      }
    };
  }, [searchOpen]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setActiveDropdown(null);

        if (searchOpen) {
          setSearchOpen(false);
          setSearchQuery("");
        } else if (open) {
          setOpen(false);
          menuButtonRef.current?.focus();
        }

        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      let candidates = [];

      if (searchOpen) {
        candidates = Array.from(
          searchModalRef.current?.querySelectorAll(
            'a[href], button:not([disabled]), input'
          ) || []
        );
      } else if (isMobile && open) {
        candidates = [
          menuButtonRef.current,
          ...Array.from(
            navRef.current?.querySelectorAll(
              'a[href], button:not([disabled])'
            ) || []
          ),
        ];
      } else {
        return;
      }

      const elements = candidates.filter(
        (element) =>
          element &&
          element.getClientRects().length > 0 &&
          !element.closest("[hidden], [inert]")
      );

      if (!elements.length) {
        return;
      }

      const first = elements[0];
      const last = elements[elements.length - 1];
      const current = document.activeElement;

      if (!elements.includes(current)) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && current === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && current === last) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobile, open, searchOpen]);

  function renderSearchResult(item) {
    const content = (
      <>
        <span className="search-result-icon">
          {item.cfcv ? (
            <Rocket size={19} aria-hidden="true" />
          ) : item.external ? (
            <ArrowUpRight size={19} aria-hidden="true" />
          ) : (
            <Search size={19} aria-hidden="true" />
          )}
        </span>

        <span className="search-result-content">
          <span className="search-result-title">
            {item.title}
          </span>

          <span className="search-result-description">
            {item.description}
          </span>
        </span>
      </>
    );

    if (item.external) {
      return (
        <a
          key={item.url}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className="search-result"
          onClick={closeSearch}
        >
          {content}
        </a>
      );
    }

    return (
      <Link
        key={item.url}
        to={item.url}
        className="search-result"
        onClick={closeSearch}
      >
        {content}
      </Link>
    );
  }

  return (
    <>
      <header className="navbar">
        <div className="navbar__top">
          <div className="navbar__top-inner">
            <div className="navbar__top-left">
              <span>Africa</span>
              <span className="navbar__top-divider">|</span>
              <span>United States</span>
              <span className="navbar__top-divider">|</span>
              <span>Global Partnerships</span>
            </div>

            <div className="navbar__top-right">
              <Link to="/contact">Contact</Link>
              <Link to="/strategic-partners">Partners</Link>
              <Link to="/universities">Universities</Link>
            </div>
          </div>
        </div>

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
                draggable={false}
              />
            </Link>

            <nav
              ref={navRef}
              id="primary-navigation"
              className={`navbar__nav ${open ? "is-open" : ""}`}
              aria-label="Primary navigation"
              aria-hidden={isMobile && !open ? true : undefined}
            >
              <div className="navbar__links">
                {navigation.map((item, index) => {
                  if (!item.children?.length) {
                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === "/"}
                        className={({ isActive }) =>
                          `navbar__link ${
                            isActive ? "is-active" : ""
                          }`
                        }
                        onClick={closeMenu}
                      >
                        <span>{item.label}</span>
                      </NavLink>
                    );
                  }

                  const expanded =
                    activeDropdown === item.label;

                  const active =
                    matchesPath(location.pathname, item.path) ||
                    item.children.some((child) =>
                      matchesPath(location.pathname, child.path)
                    );

                  const submenuId = `navbar-submenu-${index}`;

                  return (
                    <div
                      key={item.path}
                      className={[
                        "navbar__dropdown",
                        expanded ? "is-expanded" : "",
                        active ? "is-active" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      onMouseEnter={() => {
                        if (!isMobile) {
                          setActiveDropdown(item.label);
                        }
                      }}
                      onMouseLeave={(event) => {
                        if (
                          !isMobile &&
                          !event.currentTarget.contains(
                            document.activeElement
                          )
                        ) {
                          setActiveDropdown(null);
                        }
                      }}
                      onBlur={(event) => {
                        if (
                          !event.currentTarget.contains(
                            event.relatedTarget
                          )
                        ) {
                          setActiveDropdown((current) =>
                            current === item.label ? null : current
                          );
                        }
                      }}
                    >
                      <div className="navbar__dropdown-heading">
                        <NavLink
                          to={item.path}
                          className={[
                            "navbar__link",
                            "navbar__dropdown-trigger",
                            active ? "is-active" : "",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                          onClick={closeMenu}
                        >
                          <span>{item.label}</span>
                        </NavLink>

                        <button
                          type="button"
                          className="navbar__dropdown-toggle"
                          onClick={() => toggleDropdown(item.label)}
                          aria-expanded={expanded}
                          aria-controls={submenuId}
                          aria-label={`${
                            expanded ? "Close" : "Open"
                          } ${item.label} submenu`}
                        >
                          <ChevronDown
                            size={16}
                            strokeWidth={1.7}
                            aria-hidden="true"
                          />
                        </button>
                      </div>

                      <div
                        id={submenuId}
                        className="navbar__dropdown-menu"
                        hidden={!expanded}
                      >
                        {item.children.map((child) => (
                          <NavLink
                            key={child.path}
                            to={child.path}
                            end
                            className={({ isActive }) =>
                              [
                                "navbar__dropdown-link",
                                isActive ? "is-active" : "",
                                isCFCVPath(child.path)
                                  ? "navbar__dropdown-link--cfcv"
                                  : "",
                              ]
                                .filter(Boolean)
                                .join(" ")
                            }
                            onClick={closeMenu}
                          >
                            <span className="navbar__dropdown-link-content">
                              {isCFCVPath(child.path) && (
                                <Rocket
                                  size={15}
                                  strokeWidth={1.8}
                                  aria-hidden="true"
                                />
                              )}

                              <span>{child.label}</span>
                            </span>

                            <ArrowUpRight
                              size={14}
                              aria-hidden="true"
                            />
                          </NavLink>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

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
                  <span className="navbar__search-label">
                    Search website
                  </span>
                </button>

                <a
                  href={SUBSCRIPTION_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="navbar__subscribe"
                  onClick={closeMenu}
                  aria-label="Subscribe — opens Eth Tech Solutions pricing in a new tab"
                  title="View subscription plans on Eth Tech Solutions"
                >
                  <span>Subscribe</span>
                  <ArrowUpRight size={16} aria-hidden="true" />
                </a>

                <Link
                  to="/cfcv/apply"
                  className="navbar__cta navbar__cta--cfcv"
                  onClick={closeMenu}
                >
                  <Rocket size={16} aria-hidden="true" />
                  <span>Apply to CFCV</span>
                  <ArrowUpRight size={16} aria-hidden="true" />
                </Link>
              </div>
            </nav>

            <button
              ref={menuButtonRef}
              type="button"
              className="navbar__toggle"
              onClick={() => {
                setOpen((current) => !current);
                setActiveDropdown(null);
              }}
              aria-expanded={open}
              aria-controls="primary-navigation"
              aria-label={
                open ? "Close navigation menu" : "Open navigation menu"
              }
            >
              {open ? (
                <X size={25} aria-hidden="true" />
              ) : (
                <Menu size={25} aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </header>

      {searchOpen && (
        <div
          className="search-overlay"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              closeSearch();
            }
          }}
        >
          <div
            ref={searchModalRef}
            className="search-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Search Continental Founders"
          >
            <div className="search-header">
              <div className="search-input-wrapper">
                <Search size={21} aria-hidden="true" />

                <input
                  ref={searchInputRef}
                  type="search"
                  value={searchQuery}
                  onChange={(event) =>
                    setSearchQuery(event.target.value)
                  }
                  placeholder="Search the website…"
                  aria-label="Search the website"
                />
              </div>

              <button
                type="button"
                className="search-close"
                onClick={closeSearch}
                aria-label="Close search"
              >
                <X size={21} aria-hidden="true" />
              </button>
            </div>

            <div className="search-results">
              {!query ? (
                <div className="search-empty">
                  <Search size={30} aria-hidden="true" />
                  <h3>What are you looking for?</h3>
                  <p>
                    Search ventures, fellowships, partners,
                    events and more.
                  </p>
                </div>
              ) : filteredResults.length ? (
                <div className="search-result-list">
                  {filteredResults.map(renderSearchResult)}
                </div>
              ) : (
                <div className="search-empty" role="status">
                  <Search size={30} aria-hidden="true" />
                  <h3>No results found</h3>
                  <p>Try another keyword.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}