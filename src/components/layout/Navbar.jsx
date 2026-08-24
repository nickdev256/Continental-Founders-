import React, { useEffect, useState } from "react";
import {
  Menu,
  X,
  ArrowUpRight,
  ChevronRight,
} from "lucide-react";
import {
  Link,
  NavLink,
  useLocation,
} from "react-router-dom";

import { navigation } from "../../data/navigation";
import "./Navbar.css";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const closeMenu = () => {
    setOpen(false);
  };

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

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

  return (
    <header className="navbar">

      {/* =====================================================
          NAVBAR INNER
      ===================================================== */}

      <div className="navbar__inner">

        {/* ===================================================
            BRAND
        =================================================== */}

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


        {/* ===================================================
            DESKTOP NAVIGATION
        =================================================== */}

        <nav
          id="primary-navigation"
          className={`navbar__nav ${
            open ? "is-open" : ""
          }`}
          aria-label="Primary navigation"
        >

          <div className="navbar__links">

            {navigation.map((item) => (

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

                <span>
                  {item.label}
                </span>

                {/* Mobile arrow */}
                <ChevronRight
                  className="navbar__mobile-arrow"
                  size={17}
                  strokeWidth={1.5}
                />

              </NavLink>

            ))}

          </div>


          {/* =================================================
              SCHEDULE A MEETING
          ================================================= */}

          <Link
            to="/contact"
            className="navbar__cta"
            onClick={closeMenu}
          >

            <span>
              Schedule a Meeting
            </span>

            <ArrowUpRight
              size={17}
              strokeWidth={1.6}
            />

          </Link>

        </nav>


        {/* ===================================================
            MOBILE MENU BUTTON
        =================================================== */}

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
              size={24}
              strokeWidth={1.5}
            />
          ) : (
            <Menu
              size={24}
              strokeWidth={1.5}
            />
          )}

        </button>

      </div>

    </header>
  );
}