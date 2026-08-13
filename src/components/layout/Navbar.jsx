import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { navigation } from "../../data/navigation";
import "./Navbar.css";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <Link className="navbar__brand" to="/" onClick={close} aria-label="Continental Founders home">
          <img src="/assets/continental-founders-logo.png" alt="Continental Founders™" />
        </Link>

        <button
          className="navbar__toggle"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="primary-navigation"
          aria-label={open ? "Close navigation" : "Open navigation"}
        >
          {open ? <X size={23} /> : <Menu size={23} />}
        </button>

        <nav id="primary-navigation" className={`navbar__nav ${open ? "is-open" : ""}`}>
          <div className="navbar__links">
            {navigation.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => isActive ? "navbar__link is-active" : "navbar__link"}
                onClick={close}
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          <Link className="button button--nav" to="/contact" onClick={close}>
            Partner With Us <ArrowUpRight size={16} />
          </Link>
        </nav>
      </div>
    </header>
  );
}