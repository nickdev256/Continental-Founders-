import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  ChevronRight,
  Linkedin,
  Instagram,
  Youtube,
  Mail,
  Globe2,
} from "lucide-react";

import "./Footer.css";

/* ============================================================
   NAVIGATION
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
   FOOTER
============================================================ */

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="cf-footer">

      {/* ======================================================
          MAIN FOOTER
      ======================================================= */}

      <section className="cf-footer__main">

        <div className="cf-footer__container">

          <div className="cf-footer__top">

            {/* ==================================================
                BRAND
            =================================================== */}

            <div className="cf-footer__brand">

              <Link
                to="/"
                className="cf-footer__logo"
                aria-label="Continental Founders home"
              >
                <img
                  src="/assets/continental-founders-logo.png"
                  alt="Continental Founders"
                />
              </Link>

              <div className="cf-footer__tagline">
                CONNECT. COLLABORATE. CREATE IMPACT.
              </div>

              <p className="cf-footer__description">
                Continental Founders builds strategic partnerships
                between universities in the United States and Africa
                through entrepreneurship, innovation, and leadership
                development.
              </p>

              <div className="cf-footer__location">
                <div className="cf-footer__location-icon">
                  <Globe2 size={18} strokeWidth={1.7} />
                </div>

                <div>
                  <span>GLOBAL NETWORK</span>
                  <strong>United States × Africa</strong>
                </div>
              </div>

              <Link
                to="/contact"
                className="cf-footer__meeting"
              >
                <span>Schedule a Meeting</span>

                <span className="cf-footer__meeting-icon">
                  <ArrowUpRight
                    size={20}
                    strokeWidth={1.8}
                  />
                </span>
              </Link>

            </div>


            {/* ==================================================
                EXPLORE
            =================================================== */}

            <div className="cf-footer__column">

              <span className="cf-footer__column-label">
                01
              </span>

              <h3>Explore</h3>

              <nav
                className="cf-footer__links"
                aria-label="Explore"
              >
                {navigation.explore.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="cf-footer__link"
                  >
                    <span>{item.label}</span>

                    <ChevronRight
                      size={17}
                      strokeWidth={1.7}
                    />
                  </Link>
                ))}
              </nav>

            </div>


            {/* ==================================================
                RESOURCES
            =================================================== */}

            <div className="cf-footer__column">

              <span className="cf-footer__column-label">
                02
              </span>

              <h3>Resources</h3>

              <nav
                className="cf-footer__links"
                aria-label="Resources"
              >
                {navigation.resources.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="cf-footer__link"
                  >
                    <span>{item.label}</span>

                    <ChevronRight
                      size={17}
                      strokeWidth={1.7}
                    />
                  </Link>
                ))}
              </nav>

            </div>


            {/* ==================================================
                FOCUS
            =================================================== */}

            <div className="cf-footer__column cf-footer__focus">

              <span className="cf-footer__column-label">
                03
              </span>

              <h3>Our Focus</h3>

              <div className="cf-footer__focus-list">

                <div className="cf-footer__focus-item">
                  <span>01</span>
                  <p>Entrepreneurship</p>
                </div>

                <div className="cf-footer__focus-item">
                  <span>02</span>
                  <p>Innovation</p>
                </div>

                <div className="cf-footer__focus-item">
                  <span>03</span>
                  <p>Leadership Development</p>
                </div>

                <div className="cf-footer__focus-item">
                  <span>04</span>
                  <p>U.S.–Africa University Partnerships</p>
                </div>

              </div>

            </div>

          </div>


          {/* ==================================================
              PARTNERSHIP CTA
          =================================================== */}

          <div className="cf-footer__cta">

            <div className="cf-footer__cta-content">

              <span className="cf-footer__cta-label">
                BUILD WITH US
              </span>

              <h2>
                Let's create meaningful
                <em> opportunity together.</em>
              </h2>

              <p>
                Whether you represent a university, organization,
                sponsor, government institution, or innovation
                ecosystem, we would love to explore how we can
                work together.
              </p>

            </div>

            <Link
              to="/contact"
              className="cf-footer__cta-button"
            >
              <span>Start a Conversation</span>

              <ArrowUpRight
                size={21}
                strokeWidth={1.8}
              />
            </Link>

          </div>

        </div>

      </section>


      {/* ======================================================
          GLOBAL STATEMENT
      ======================================================= */}

      <section className="cf-footer__statement">

        <div className="cf-footer__statement-glow" />

        <div className="cf-footer__statement-container">

          <div className="cf-footer__statement-content">

            <div className="cf-footer__statement-label">
              <span className="cf-footer__pulse" />

              <span>
                UNITED STATES × AFRICA
              </span>
            </div>

            <h2>
              Connecting institutions.
              <br />
              <span>Creating opportunity.</span>
            </h2>

            <p>
              Building bridges between ideas, institutions,
              entrepreneurs, and future leaders across continents.
            </p>

          </div>


          <div className="cf-footer__statement-mark">

            <div className="cf-footer__continent usa">
              USA
            </div>

            <div className="cf-footer__connection">
              <span />
              <span />
            </div>

            <div className="cf-footer__continent africa">
              AFRICA
            </div>

          </div>

        </div>

      </section>


      {/* ======================================================
          BOTTOM
      ======================================================= */}

      <section className="cf-footer__bottom">

        <div className="cf-footer__container">

          <div className="cf-footer__bottom-content">

            {/* COPYRIGHT */}

            <div className="cf-footer__copyright">

              <span className="cf-footer__copyright-symbol">
                ©
              </span>

              <div>
                <strong>
                  {year} Continental Founders™
                </strong>

                <span>
                  All rights reserved.
                </span>
              </div>

            </div>


            {/* LEGAL */}

            <nav
              className="cf-footer__legal"
              aria-label="Legal"
            >

              <Link to="/privacy">
                Privacy
              </Link>

              <Link to="/terms">
                Terms
              </Link>

              <Link to="/accessibility">
                Accessibility
              </Link>

            </nav>


            {/* SOCIAL */}

            <div
              className="cf-footer__socials"
              aria-label="Social media"
            >

              {socials.map((social) => {

                const Icon = social.icon;

                return (
                  <a
                    key={social.label}
                    href={social.url}
                    className="cf-footer__social"
                    aria-label={social.label}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon
                      size={20}
                      strokeWidth={1.7}
                    />
                  </a>
                );

              })}

            </div>

          </div>

        </div>

      </section>

    </footer>
  );
}