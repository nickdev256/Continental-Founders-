import React, {
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  ArrowUp,
  ArrowUpRight,
  ArrowRight,
  Globe2,
  Mail,
} from "lucide-react";

import "./Footer.css";
import { TbBrandThreejs } from "react-icons/tb";


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
      path: "/universities",
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
    image: "/assets/link.webp",
    // Public company page (the old link pointed to the admin dashboard)
    url: "https://www.linkedin.com/company/145206611/",
  },
  {
    label: "Instagram",
    image: "/assets/ig.webp",
    url: "https://www.instagram.com/continentalfounderstm/",
  },
  {
    label: "Facebook",
    image: "/assets/fb.webp",
    // TODO: replace with the real Facebook page address
    url: "https://www.facebook.com/YOUR_PAGE",
  },
  {
    label: "YouTube",
    image: "/assets/ut.webp",
    url: "https://www.youtube.com/@ContinentalFounders",
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
   API
============================================================ */

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";


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


    if (
      !cleanEmail
    ) {

      setNewsletterMessage(
        ""
      );

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

      setNewsletterMessage(
        ""
      );

      setNewsletterError(
        "Please enter a valid email address."
      );

      return;

    }


    try {

      setSubmitting(
        true
      );

      setNewsletterMessage(
        ""
      );

      setNewsletterError(
        ""
      );


      /* ------------------------------------------------------
         SEND TO BACKEND
      ------------------------------------------------------ */

      const response =
        await fetch(
          `${API_URL}/api/newsletter/subscribe`,
          {

            method:
              "POST",

            headers: {
              Accept:
                "application/json",

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
         READ RESPONSE
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

      if (
        !response.ok
      ) {

        throw new Error(
          result?.message ||
          "We could not complete your subscription."
        );

      }


      /* ------------------------------------------------------
         SUCCESS
      ------------------------------------------------------ */

      setNewsletterMessage(
        result?.message ||
        "Thank you for subscribing to Continental Founders."
      );


      setEmail(
        ""
      );

    } catch (
      error
    ) {

      console.error(
        "Newsletter subscription error:",
        error
      );


      if (
        error instanceof TypeError
      ) {

        setNewsletterError(
          "We could not connect to the subscription service. Please try again shortly."
        );

      } else {

        setNewsletterError(
          error?.message ||
          "We could not complete your subscription. Please try again."
        );

      }

    } finally {

      setSubmitting(
        false
      );

    }

  }


  /* ==========================================================
     RENDER
  ========================================================== */

  return (

    <footer className="cf-footer">

      <div
        className="cf-footer__background"
        aria-hidden="true"
      />


      <div className="cf-footer__container">

        {/* ====================================================
            MAIN: BRAND + LINK COLUMNS
        ===================================================== */}

        <div className="cf-footer__main">

          <div className="cf-footer__brand">

            <Link
              to="/"
              className="cf-footer__logo"
              aria-label="Continental Founders home"
            >

              <img
                src="/assets/logoo-trimmed.webp"
                alt="Continental Founders"
                width="339"
                height="280"
                loading="lazy"
              />
             

            </Link>


            <span className="cf-footer__eyebrow">
              CONNECT. COLLABORATE. CREATE IMPACT.
            </span>


            <p className="cf-footer__description">
              Continental Founders builds strategic relationships around
              founders, universities, businesses, professionals,
              institutions, and opportunity networks across Africa and
              the United States.
            </p>


            <div className="cf-footer__location">

              <span
                className="cf-footer__location-icon"
                aria-hidden="true"
              >

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


            <Link
              to="/contact"
              className="cf-footer__meeting"
            >

              <span>
                Schedule a Meeting
              </span>

              <ArrowUpRight
                size={18}
                strokeWidth={2}
                aria-hidden="true"
              />

            </Link>

          </div>


          <div className="cf-footer__navigation">

            <FooterLinks
              title="Explore"
              items={
                navigation.explore
              }
            />


            <FooterLinks
              title="Resources"
              items={
                navigation.resources
              }
            />


            <div className="cf-footer__column cf-footer__column--focus">

              <h3>
                Our Focus
              </h3>


              <ol className="cf-footer__focus">

                {focusAreas.map(
                  (
                    area,
                    index
                  ) => (

                    <li
                      className="cf-footer__focus-item"
                      key={
                        area
                      }
                    >

                      <span aria-hidden="true">

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

                    </li>

                  )
                )}

              </ol>

            </div>

          </div>


          {/* ====================================================
              NEWSLETTER BAND
          ===================================================== */}

          <section
            className="cf-footer__newsletter"
            id="newsletter"
            aria-labelledby="footer-newsletter-heading"
          >

            <div className="cf-footer__newsletter-content">

              <span className="cf-footer__newsletter-label">
                STAY CONNECTED
              </span>


              <h2 id="footer-newsletter-heading">
                Subscribe for More Information
              </h2>


              <p>
                Get updates on programs, partnerships, events, insights,
                and opportunities across the Continental Founders ecosystem.
              </p>

            </div>


            <form
              className="cf-footer__newsletter-form"
              onSubmit={
                handleNewsletterSubmit
              }
              noValidate
            >

              <div className="cf-footer__field">

                <div className="cf-footer__input-wrap">

                  <Mail
                    className="cf-footer__input-icon"
                    size={18}
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />

                  <input
                    type="email"
                    name="newsletterEmail"
                    value={
                      email
                    }
                    placeholder="Enter your email"
                    aria-label="Email address"
                    autoComplete="email"
                    disabled={
                      submitting
                    }
                    onChange={(
                      event
                    ) => {

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


                      if (
                        newsletterMessage
                      ) {

                        setNewsletterMessage(
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
                    size={18}
                    strokeWidth={2}
                    aria-hidden="true"
                  />

                </button>

              </div>


              {newsletterMessage && (

                <p
                  className="cf-footer__newsletter-success"
                  role="status"
                  aria-live="polite"
                >

                  {newsletterMessage}

                </p>

              )}


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

          </section>

        </div>


        {/* ====================================================
            CLOSING STATEMENT
        ===================================================== */}

        <p className="cf-footer__statement">
          Building a Brighter Future <em>Together</em>
        </p>

      </div>


      {/* ======================================================
          BOTTOM BAR
      ====================================================== */}

      <div className="cf-footer__bottom">

        <div className="cf-footer__container">

          <div className="cf-footer__bottom-inner">

            <p className="cf-footer__copyright">

              <span>
                © {year} Continental Founders™
              </span>


              <span
                className="cf-footer__copyright-separator"
                aria-hidden="true"
              >
                |
              </span>


              <span>
                All rights reserved.
              </span>

            </p>


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


            <div className="cf-footer__bottom-actions">

              <ul
                className="cf-footer__socials"
                aria-label="Social media"
              >

                {socials.map(
                  (social) => (

                    <li key={social.label}>

                      <a
                        href={
                          social.url
                        }
                        className="cf-footer__social"
                        aria-label={`Continental Founders on ${social.label}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >

                        <img
                          src={
                            social.image
                          }
                          alt=""
                          width="24"
                          height="24"
                          loading="lazy"
                        />

                      </a>

                    </li>

                  )
                )}

              </ul>


              <button
                type="button"
                className="cf-footer__top"
                onClick={() =>
                  window.scrollTo({
                    top: 0,
                    behavior: "smooth",
                  })
                }
              >

                <span>
                  Back to top
                </span>

                <ArrowUp
                  size={16}
                  strokeWidth={2}
                  aria-hidden="true"
                />

              </button>

            </div>

          </div>


          <p className="cf-footer__credit">
            Website developed by{" "}
            <a
              href="https://www.ethtechsolutions.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              Eth Tech Solutions
            </a>
          </p>

        </div>

      </div>

    </footer>

  );

}


/* ============================================================
   LINK COLUMN
============================================================ */

function FooterLinks({
  title,
  items,
}) {

  return (

    <div className="cf-footer__column">

      <h3>
        {title}
      </h3>


      <nav aria-label={title}>

        <ul className="cf-footer__links">

          {items.map(
            (item) => (

              <li key={item.path}>

                <Link
                  to={
                    item.path
                  }
                  className="cf-footer__link"
                >

                  <span>
                    {item.label}
                  </span>

                  <ArrowRight
                    size={15}
                    strokeWidth={2}
                    aria-hidden="true"
                  />

                </Link>

              </li>

            )
          )}

        </ul>

      </nav>

    </div>

  );

}
