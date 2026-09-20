import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  ExternalLink,
  X,
} from "lucide-react";

import "./EthTechPopup.css";


// ============================================================
// CONFIGURATION
// ============================================================

// First appearance:
// Wait 5 seconds after website loads.
const FIRST_APPEAR_DELAY = 5000;

// How long the popup remains visible.
const VISIBLE_DURATION = 5000;

// After disappearing:
// Wait 10 seconds before showing again.
const HIDDEN_DURATION = 10000;

// Closing animation duration.
// Must match CSS exit animation.
const CLOSING_DURATION = 300;

const ETH_TECH_WEBSITE =
  "https://www.ethtechsolutions.com";


// ============================================================
// ETH TECH POPUP
// ============================================================

export default function EthTechPopup() {
  const [isVisible, setIsVisible] =
    useState(false);

  const [isClosing, setIsClosing] =
    useState(false);


  const showTimerRef =
    useRef(null);

  const hideTimerRef =
    useRef(null);

  const closeTimerRef =
    useRef(null);


  // ==========================================================
  // CLEAR TIMERS
  // ==========================================================

  const clearTimers = () => {
    if (showTimerRef.current) {
      window.clearTimeout(
        showTimerRef.current
      );
    }

    if (hideTimerRef.current) {
      window.clearTimeout(
        hideTimerRef.current
      );
    }

    if (closeTimerRef.current) {
      window.clearTimeout(
        closeTimerRef.current
      );
    }
  };


  // ==========================================================
  // SHOW POPUP
  // ==========================================================

  const showPopup = () => {
    setIsClosing(false);
    setIsVisible(true);


    // Stay visible for 5 seconds,
    // then begin closing.
    hideTimerRef.current =
      window.setTimeout(() => {
        hidePopup();
      }, VISIBLE_DURATION);
  };


  // ==========================================================
  // HIDE POPUP
  // ==========================================================

  const hidePopup = () => {
    setIsClosing(true);


    // Allow closing animation to finish.
    closeTimerRef.current =
      window.setTimeout(() => {
        setIsVisible(false);
        setIsClosing(false);


        // Wait 10 seconds before
        // showing popup again.
        showTimerRef.current =
          window.setTimeout(() => {
            showPopup();
          }, HIDDEN_DURATION);

      }, CLOSING_DURATION);
  };


  // ==========================================================
  // INITIAL TIMER
  // ==========================================================

  useEffect(() => {

    // First popup appears 5 seconds
    // after the website loads.
    showTimerRef.current =
      window.setTimeout(() => {
        showPopup();
      }, FIRST_APPEAR_DELAY);


    // Clean everything when component unmounts.
    return () => {
      clearTimers();
    };

  }, []);


  // ==========================================================
  // MANUAL CLOSE
  // ==========================================================

  const handleClose = (
    event
  ) => {
    event.preventDefault();
    event.stopPropagation();


    // Cancel automatic hide timer.
    if (hideTimerRef.current) {
      window.clearTimeout(
        hideTimerRef.current
      );
    }


    hidePopup();
  };


  // ==========================================================
  // DON'T RENDER WHILE HIDDEN
  // ==========================================================

  if (!isVisible) {
    return null;
  }


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <aside
      className={
        isClosing
          ? "eth-tech-popup eth-tech-popup--closing"
          : "eth-tech-popup"
      }
      aria-label="Website developed by Eth Tech Solutions"
    >

      {/* =====================================================
          CLOSE BUTTON
      ====================================================== */}

      <button
        type="button"
        className="eth-tech-popup__close"
        onClick={handleClose}
        aria-label="Close Eth Tech Solutions popup"
      >
        <X size={15} />
      </button>


      {/* =====================================================
          CLICKABLE ETH TECH PROMOTION
      ====================================================== */}

      <a
        href={ETH_TECH_WEBSITE}
        target="_blank"
        rel="noopener noreferrer"
        className="eth-tech-popup__link"
        aria-label="Visit Eth Tech Solutions website"
      >

        <span className="eth-tech-popup__eyebrow">
          Website developed by
        </span>


        {/* ===================================================
            LOGO
        ==================================================== */}

        <div className="eth-tech-popup__logo-wrap">

          <img
            src="/assets/eth-tech/eth-tech-logo.png"
            alt="Eth Tech Solutions"
            className="eth-tech-popup__logo"
          />

        </div>


        {/* ===================================================
            CTA
        ==================================================== */}

        <div className="eth-tech-popup__action">

          <span>
            Visit Eth Tech Solutions
          </span>

          <ExternalLink
            size={13}
            aria-hidden="true"
          />

        </div>

      </a>

    </aside>
  );
}