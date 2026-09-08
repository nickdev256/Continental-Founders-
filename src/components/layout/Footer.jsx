import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  ChevronRight,
  Linkedin,
  Instagram,
  Youtube,
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
   FOCUS AREAS
============================================================ */

const focusAreas = [
  "Entrepreneurship",
  "Innovation",
  "Leadership Development",
  "U.S.–Africa University Partnerships",
];


/* ============================================================
   FOOTER
============================================================ */

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="cf-footer">

      {/* ======================================================
          BACKGROUND
      ======================================================= */}

      <div className="cf-footer__background" aria-hidden="true" />


      {/* ======================================================
          MAIN FOOTER
      ======================================================= */}

      <section className="cf-footer__main">

        <div className="cf-footer__container">

          <div className="cf-footer__layout">

            {/* ==================================================
                BRAND AREA
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


              <span className="cf-footer__eyebrow">
                CONNECT. COLLABORATE. CREATE IMPACT.
              </span>


              <p className="cf-footer__description">
                Continental Founders builds strategic partnerships
                between universities in the United States and Africa
                through entrepreneurship, innovation, and leadership
                development.
              </p>


              {/* GLOBAL NETWORK */}

              <div className="cf-footer__location">

                <span className="cf-footer__location-icon">
                  <Globe2
                    size={20}
                    strokeWidth={1.6}
                  />
                </span>

                <div>

                  <span className="cf-footer__location-label">
                    GLOBAL NETWORK
                  </span>

                  <strong>
                    United States × Africa
                  </strong>

                </div>

              </div>


              {/* CTA */}

              <Link
                to="/contact"
                className="cf-footer__meeting"
              >

                <span>
                  Schedule a Meeting
                </span>

                <span className="cf-footer__meeting-arrow">
                  <ArrowUpRight
                    size={22}
                    strokeWidth={1.8}
                  />
                </span>

              </Link>

            </div>


            {/* ==================================================
                NAVIGATION
            =================================================== */}

            <div className="cf-footer__navigation">

              {/* EXPLORE */}

              <div className="cf-footer__column">

                <span className="cf-footer__label">
                  01
                </span>

                <h3>
                  Explore
                </h3>

                <div className="cf-footer__gold-line" />

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

                      <span>
                        {item.label}
                      </span>

                      <ChevronRight
                        size={17}
                        strokeWidth={1.5}
                      />

                    </Link>

                  ))}

                </nav>

              </div>


              {/* RESOURCES */}

              <div className="cf-footer__column">

                <span className="cf-footer__label">
                  02
                </span>

                <h3>
                  Resources
                </h3>

                <div className="cf-footer__gold-line" />

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

                      <span>
                        {item.label}
                      </span>

                      <ChevronRight
                        size={17}
                        strokeWidth={1.5}
                      />

                    </Link>

                  ))}

                </nav>

              </div>


              {/* OUR FOCUS */}

              <div className="cf-footer__column">

                <span className="cf-footer__label">
                  03
                </span>

                <h3>
                  Our Focus
                </h3>

                <div className="cf-footer__gold-line" />

                <div className="cf-footer__focus">

                  {focusAreas.map((area, index) => (

                    <div
                      className="cf-footer__focus-item"
                      key={area}
                    >

                      <span>
                        0{index + 1}
                      </span>

                      <p>
                        {area}
                      </p>

                    </div>

                  ))}

                </div>

              </div>

            </div>

            {/* ==================================================
    NEWSLETTER
=================================================== */}

<div className="cf-footer__newsletter">

  <div className="cf-footer__newsletter-content">

    <span className="cf-footer__newsletter-label">
      STAY CONNECTED
    </span>

    <h3>
      Subscribe for More Information
    </h3>

    <p>
      Get updates on programs, partnerships, events, and
      opportunities connecting Africa and the United States.
    </p>

  </div>


  <form className="cf-footer__newsletter-form">

    <div className="cf-footer__input-wrap">

      <span className="cf-footer__input-icon">
        
      </span>

      <input
        type="email"
        placeholder="Enter your email"
        aria-label="Email address"
        required
      />

    </div>

    <button type="submit">
      <span>Subscribe</span>

      <ArrowUpRight
        size={19}
        strokeWidth={1.8}
      />
    </button>

  </form>

</div>

          </div>

          


          {/* ==================================================
              CLOSING STATEMENT
          =================================================== */}

          <div className="cf-footer__statement">

            <span>
              Building a Brighter Future Together
            </span>

            <i />

          </div>

        </div>

      </section>


      


      {/* ======================================================
          BOTTOM BAR
      ======================================================= */}

      <section className="cf-footer__bottom">

        <div className="cf-footer__container">

          <div className="cf-footer__bottom-inner">

            {/* COPYRIGHT */}

            <div className="cf-footer__copyright">

              <span>
                © {year} Continental Founders™
              </span>

              <span className="cf-footer__copyright-separator">
                |
              </span>

              <span>
                All rights reserved.
              </span>

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
                      size={19}
                      strokeWidth={1.6}
                    />

                  </a>
                );

              })}

            </div>

            


            {/* BRAND PHRASE */}

            <div className="cf-footer__phrase">

              <span>IDEAS</span>
              <b>|</b>
              <span>PEOPLE</span>
              <b>|</b>
              <span>OPPORTUNITIES</span>
              <b>|</b>
              <span>IMPACT</span>

            </div>

          </div>

        </div>

      </section>

    </footer>




  );

}




