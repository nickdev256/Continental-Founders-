import React, {
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

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
      label: "Universities",
      path: "/partners/universities",
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

    // Replace with official Continental Founders
    // LinkedIn URL when available.
    url: "https://www.linkedin.com/",
  },
  {
    label: "Instagram",
    icon: Instagram,
    url:
      "https://www.instagram.com/continentalfounderstm/?hl=en",
  },
  {
    label: "YouTube",
    icon: Youtube,

    // Replace with official Continental Founders
    // YouTube URL when available.
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
  "U.S.–Africa Partnerships",
];


/* ============================================================
   FOOTER
============================================================ */

export default function Footer() {
  const year =
    new Date().getFullYear();


  /* ==========================================================
     NEWSLETTER STATE
  ========================================================== */

  const [
    email,
    setEmail,
  ] =
    useState("");


  const [
    submitting,
    setSubmitting,
  ] =
    useState(false);


  const [
    newsletterMessage,
    setNewsletterMessage,
  ] =
    useState("");


  const [
    newsletterError,
    setNewsletterError,
  ] =
    useState("");


  /* ==========================================================
     API
  ========================================================== */

  const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000";


  /* ==========================================================
     NEWSLETTER SUBMIT
  ========================================================== */

  async function handleNewsletterSubmit(
    event
  ) {
    event.preventDefault();


    /* --------------------------------------------------------
       CLEAN EMAIL
    -------------------------------------------------------- */

    const cleanEmail =
      email
        .trim()
        .toLowerCase();


    if (!cleanEmail) {
      setNewsletterMessage("");

      setNewsletterError(
        "Please enter your email address."
      );

      return;
    }


    /* --------------------------------------------------------
       BASIC EMAIL VALIDATION
    -------------------------------------------------------- */

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (
      !emailPattern.test(
        cleanEmail
      )
    ) {
      setNewsletterMessage("");

      setNewsletterError(
        "Please enter a valid email address."
      );

      return;
    }


    try {

      setSubmitting(true);

      setNewsletterMessage("");

      setNewsletterError("");


      /* ------------------------------------------------------
         SEND TO BACKEND
      ------------------------------------------------------ */

      const response =
        await fetch(
          `${API_URL}/api/newsletter/subscribe`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                email:
                  cleanEmail,
              }),
          }
        );


      /* ------------------------------------------------------
         READ RESPONSE SAFELY
      ------------------------------------------------------ */

      let result = {};


      try {
        result =
          await response.json();
      } catch {
        result = {};
      }


      /* ------------------------------------------------------
         BACKEND ERROR
      ------------------------------------------------------ */

      if (!response.ok) {
        throw new Error(
          result.message ||
          "We could not complete your subscription."
        );
      }


      /* ------------------------------------------------------
         SUCCESS
      ------------------------------------------------------ */

      setNewsletterMessage(
        result.message ||
        "Thank you for subscribing to Continental Founders."
      );


      setEmail("");

    } catch (error) {

      console.error(
        "Newsletter subscription error:",
        error
      );


      /* ------------------------------------------------------
         CONNECTION ERROR
      ------------------------------------------------------ */

      if (
        error instanceof TypeError &&
        error.message ===
          "Failed to fetch"
      ) {
        setNewsletterError(
          "We could not connect to the subscription service. Please try again shortly."
        );
      } else {
        setNewsletterError(
          error.message ||
          "We could not complete your subscription. Please try again."
        );
      }

    } finally {

      setSubmitting(false);

    }
  }


  /* ==========================================================
     FOOTER
  ========================================================== */

  return (
    <footer className="cf-footer">

      {/* ======================================================
          BACKGROUND
      ====================================================== */}

      <div
        className="cf-footer__background"
        aria-hidden="true"
      />


      {/* ======================================================
          MAIN FOOTER
      ====================================================== */}

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
                Continental Founders builds strategic
                relationships around founders,
                universities, businesses, professionals,
                institutions, and opportunity networks
                across Africa and the United States.
              </p>


              {/* ==============================================
                  GLOBAL NETWORK
              =============================================== */}

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


              {/* ==============================================
                  CTA
              =============================================== */}

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

              {/* ==============================================
                  EXPLORE
              =============================================== */}

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

                  {navigation.explore.map(
                    (item) => (

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

                    )
                  )}

                </nav>

              </div>


              {/* ==============================================
                  RESOURCES
              =============================================== */}

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

                  {navigation.resources.map(
                    (item) => (

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

                    )
                  )}

                </nav>

              </div>


              {/* ==============================================
                  OUR FOCUS
              =============================================== */}

              <div className="cf-footer__column">

                <span className="cf-footer__label">
                  03
                </span>

                <h3>
                  Our Focus
                </h3>

                <div className="cf-footer__gold-line" />


                <div className="cf-footer__focus">

                  {focusAreas.map(
                    (
                      area,
                      index
                    ) => (

                      <div
                        className="cf-footer__focus-item"
                        key={area}
                      >

                        <span>
                          {String(
                            index + 1
                          ).padStart(
                            2,
                            "0"
                          )}
                        </span>

                        <p>
                          {area}
                        </p>

                      </div>

                    )
                  )}

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
                  Get updates on programs,
                  partnerships, events, insights,
                  and opportunities across the
                  Continental Founders ecosystem.
                </p>

              </div>


              <form
                className="cf-footer__newsletter-form"
                onSubmit={
                  handleNewsletterSubmit
                }
                noValidate
              >

                <div className="cf-footer__input-wrap">

                  <input
                    type="email"
                    name="newsletterEmail"
                    value={email}
                    placeholder="Enter your email"
                    aria-label="Email address"
                    autoComplete="email"
                    disabled={submitting}
                    onChange={(event) => {

                      setEmail(
                        event.target.value
                      );

                      if (
                        newsletterError
                      ) {
                        setNewsletterError(
                          ""
                        );
                      }

                    }}
                    required
                  />

                </div>


                <button
                  type="submit"
                  disabled={
                    submitting ||
                    !email.trim()
                  }
                  aria-busy={
                    submitting
                  }
                >

                  <span>
                    {submitting
                      ? "Subscribing..."
                      : "Subscribe"}
                  </span>

                  <ArrowUpRight
                    size={19}
                    strokeWidth={1.8}
                  />

                </button>


                {/* ============================================
                    SUCCESS MESSAGE
                ============================================= */}

                {newsletterMessage && (

                  <p
                    className="cf-footer__newsletter-success"
                    role="status"
                    aria-live="polite"
                  >
                    {newsletterMessage}
                  </p>

                )}


                {/* ============================================
                    ERROR MESSAGE
                ============================================= */}

                {newsletterError && (

                  <p
                    className="cf-footer__newsletter-error"
                    role="alert"
                    aria-live="assertive"
                  >
                    {newsletterError}
                  </p>

                )}

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
      ====================================================== */}

      <section className="cf-footer__bottom">

        <div className="cf-footer__container">

          <div className="cf-footer__bottom-inner">

            {/* ================================================
                COPYRIGHT
            ================================================= */}

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


            {/* ================================================
                LEGAL
            ================================================= */}

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


            {/* ================================================
                SOCIAL MEDIA
            ================================================= */}

            <div
              className="cf-footer__socials"
              aria-label="Social media"
            >

              {socials.map(
                (social) => {

                  const Icon =
                    social.icon;

                  return (
                    <a
                      key={
                        social.label
                      }
                      href={
                        social.url
                      }
                      className="cf-footer__social"
                      aria-label={
                        social.label
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                    >

                      <Icon
                        size={19}
                        strokeWidth={1.6}
                      />

                    </a>
                  );

                }
              )}

            </div>


            {/* ================================================
                BRAND PHRASE
            ================================================= */}

            <div className="cf-footer__phrase">

              <span>
                IDEAS
              </span>

              <b>
                |
              </b>

              <span>
                PEOPLE
              </span>

              <b>
                |
              </b>

              <span>
                OPPORTUNITIES
              </span>

              <b>
                |
              </b>

              <span>
                IMPACT
              </span>

            </div>

          </div>

        </div>

      </section>

    </footer>
  );
}