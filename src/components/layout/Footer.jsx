import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  ChevronRight,
  Linkedin,
  Instagram,
  Youtube,
} from "lucide-react";

import "./Footer.css";

/* ============================================================
   FOOTER NAVIGATION
============================================================ */

const navigation = {
  explore: [
    {
      label: "About",
      path: "/about",
    },
    {
      label: "Our Model",
      path: "/our-model",
    },
    {
      label: "University Partnerships",
      path: "/university-partnerships",
    },
    {
      label: "Sponsors & Partners",
      path: "/strategic-partners",
    },
  ],

  resources: [
    {
      label: "Programs",
      path: "/programs",
    },
    {
      label: "Impact",
      path: "/impact",
    },
    {
      label: "Events",
      path: "/events",
    },
    {
      label: "Insights",
      path: "/insights",
    },
    {
      label: "Contact",
      path: "/contact",
    },
  ],
};


/* ============================================================
   SOCIAL MEDIA
============================================================ */

const socials = [
  {
    label: "LinkedIn",
    icon: Linkedin,
    url: "https://www.linkedin.com/",
  },
  {
    label: "Instagram",
    icon: Instagram,
    url: "https://www.instagram.com/",
  },
  {
    label: "YouTube",
    icon: Youtube,
    url: "https://www.youtube.com/",
  },
];


/* ============================================================
   FOOTER COMPONENT
============================================================ */

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">

      {/* ======================================================
          MAIN FOOTER
      ======================================================= */}

      <div className="site-footer__main">

        <div className="site-footer__container">

          <div className="site-footer__grid">


            {/* ==================================================
                BRAND
            =================================================== */}

            <div className="site-footer__brand">

              <Link
                to="/"
                className="site-footer__logo"
                aria-label="Continental Founders home"
              >

                <img
                  src="/assets/continental-founders-logo.png"
                  alt="Continental Founders"
                />

              </Link>


              <div className="site-footer__tagline">
                CONNECT. COLLABORATE. CREATE IMPACT.
              </div>


              <p className="site-footer__description">
                Building strategic partnerships between
                universities in the United States and Africa
                through entrepreneurship, innovation, and
                leadership development.
              </p>


              <Link
                to="/contact"
                className="site-footer__meeting"
              >

                <span>
                  Schedule a Meeting
                </span>

                <ArrowUpRight
                  size={23}
                  strokeWidth={1.5}
                />

              </Link>

            </div>


            {/* ==================================================
                EXPLORE
            =================================================== */}

            <div className="site-footer__column">

              <h3>
                Explore
              </h3>

              <span className="site-footer__column-line" />


              <nav
                className="site-footer__links"
                aria-label="Explore"
              >

                {navigation.explore.map((item) => (

                  <Link
                    key={item.path}
                    to={item.path}
                    className="site-footer__link"
                  >

                    <span>
                      {item.label}
                    </span>

                    <ChevronRight
                      size={18}
                      strokeWidth={1.5}
                    />

                  </Link>

                ))}

              </nav>

            </div>


            {/* ==================================================
                RESOURCES
            =================================================== */}

            <div className="site-footer__column">

              <h3>
                Resources
              </h3>

              <span className="site-footer__column-line" />


              <nav
                className="site-footer__links"
                aria-label="Resources"
              >

                {navigation.resources.map((item) => (

                  <Link
                    key={item.path}
                    to={item.path}
                    className="site-footer__link"
                  >

                    <span>
                      {item.label}
                    </span>

                    <ChevronRight
                      size={18}
                      strokeWidth={1.5}
                    />

                  </Link>

                ))}

              </nav>

            </div>


            {/* ==================================================
                OUR FOCUS
            =================================================== */}

            <div className="site-footer__column site-footer__focus">

              <h3>
                Our Focus
              </h3>

              <span className="site-footer__column-line" />


              <div className="site-footer__focus-list">

                <p>
                  Entrepreneurship
                </p>

                <p>
                  Innovation
                </p>

                <p>
                  Leadership Development
                </p>

                <p>
                  U.S.–Africa University Partnerships
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>


      {/* ======================================================
          INSTITUTIONAL STATEMENT
      ======================================================= */}

      <section className="site-footer__statement">

        <div className="site-footer__statement-container">


          {/* MAP / CONNECTION VISUAL */}

          <div className="site-footer__map">

            <div className="site-footer__map-inner">

              <span className="site-footer__map-label usa">
                USA
              </span>

              <span className="site-footer__map-label africa">
                AFRICA
              </span>


              <div className="site-footer__map-arc">

                <span />

              </div>

            </div>

          </div>


          {/* VERTICAL DIVIDER */}

          <div className="site-footer__statement-divider" />


          {/* STATEMENT */}

          <div className="site-footer__statement-content">

            <div className="site-footer__statement-label">

              <span className="site-footer__statement-dot" />

              <span>
                UNITED STATES × AFRICA
              </span>

            </div>


            <h2>
              Connecting institutions.
              <br />
              Creating opportunity.
            </h2>

          </div>


          {/* BACKGROUND GLOBE */}

          <div className="site-footer__globe">
            <div className="site-footer__globe-line globe-line-1" />
            <div className="site-footer__globe-line globe-line-2" />
            <div className="site-footer__globe-line globe-line-3" />
            <div className="site-footer__globe-line globe-line-4" />
          </div>

        </div>

      </section>


      {/* ======================================================
          BOTTOM FOOTER
      ======================================================= */}

      <div className="site-footer__bottom">

        <div className="site-footer__bottom-container">


          {/* COPYRIGHT */}

          <div className="site-footer__copyright">

            <div>
              <span className="copyright-symbol">
                ©
              </span>

              <span>
                {year} Continental Founders™
              </span>
            </div>

            <span className="site-footer__rights">
              All rights reserved.
            </span>

          </div>


          {/* LEGAL */}

          <nav
            className="site-footer__legal"
            aria-label="Legal"
          >

            <Link to="/privacy">
              Privacy
            </Link>

            <span>
              /
            </span>

            <Link to="/terms">
              Terms
            </Link>

            <span>
              /
            </span>

            <Link to="/accessibility">
              Accessibility
            </Link>

          </nav>


          {/* SOCIALS */}

          <div
            className="site-footer__socials"
            aria-label="Social media"
          >

            {socials.map((social) => {

              const Icon = social.icon;

              return (

                <a
                  key={social.label}
                  href={social.url}
                  className="site-footer__social"
                  aria-label={social.label}
                  target="_blank"
                  rel="noopener noreferrer"
                >

                  <Icon
                    size={24}
                    strokeWidth={1.5}
                  />

                </a>

              );

            })}

          </div>

        </div>

      </div>

    </footer>
  );
}