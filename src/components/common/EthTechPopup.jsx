import React, {
  useCallback,
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
// Wait 5 seconds after the website loads.
const FIRST_APPEAR_DELAY = 5000;

// Popup stays visible for 15 seconds.
const VISIBLE_DURATION = 15000;

// Popup stays hidden for 10 seconds.
const HIDDEN_DURATION = 10000;

// Closing animation duration.
// Keep this synchronized with the CSS exit animation.
const CLOSING_DURATION = 300;

// Eth Tech Solutions website.
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


  // ==========================================================
  // TIMER REFERENCES
  // ==========================================================

  const showTimerRef =
    useRef(null);

  const hideTimerRef =
    useRef(null);

  const closeTimerRef =
    useRef(null);

  const mountedRef =
    useRef(false);


  // ==========================================================
  // CLEAR INDIVIDUAL TIMER
  // ==========================================================

  const clearTimer = (
    timerRef
  ) => {
    if (timerRef.current !== null) {
      window.clearTimeout(
        timerRef.current
      );

      timerRef.current = null;
    }
  };


  // ==========================================================
  // CLEAR ALL TIMERS
  // ==========================================================

  const clearAllTimers =
    useCallback(() => {
      clearTimer(
        showTimerRef
      );

      clearTimer(
        hideTimerRef
      );

      clearTimer(
        closeTimerRef
      );
    }, []);


  // ==========================================================
  // SCHEDULE NEXT APPEARANCE
  // ==========================================================

  const scheduleNextAppearance =
    useCallback((delay) => {
      clearTimer(
        showTimerRef
      );


      showTimerRef.current =
        window.setTimeout(() => {
          if (!mountedRef.current) {
            return;
          }


          setIsClosing(false);
          setIsVisible(true);


          // ================================================
          // KEEP POPUP VISIBLE FOR 15 SECONDS
          // ================================================

          clearTimer(
            hideTimerRef
          );


          hideTimerRef.current =
            window.setTimeout(() => {
              if (!mountedRef.current) {
                return;
              }


              // Begin closing animation.
              setIsClosing(true);


              // ============================================
              // WAIT FOR CLOSING ANIMATION
              // ============================================

              clearTimer(
                closeTimerRef
              );


              closeTimerRef.current =
                window.setTimeout(() => {
                  if (!mountedRef.current) {
                    return;
                  }


                  setIsVisible(false);
                  setIsClosing(false);


                  // ========================================
                  // HIDDEN FOR 10 SECONDS
                  // THEN START AGAIN
                  // ========================================

                  scheduleNextAppearance(
                    HIDDEN_DURATION
                  );

                }, CLOSING_DURATION);

            }, VISIBLE_DURATION);

        }, delay);

    }, []);


  // ==========================================================
  // INITIAL POPUP CYCLE
  // ==========================================================

  useEffect(() => {
    mountedRef.current = true;


    // First popup appears after 5 seconds.
    scheduleNextAppearance(
      FIRST_APPEAR_DELAY
    );


    // ========================================================
    // CLEANUP
    // ========================================================

    return () => {
      mountedRef.current = false;

      clearAllTimers();
    };

  }, [
    clearAllTimers,
    scheduleNextAppearance,
  ]);


  // ==========================================================
  // MANUAL CLOSE
  // ==========================================================

  const handleClose = (
    event
  ) => {
    event.preventDefault();
    event.stopPropagation();


    // Stop the automatic visible timer.
    clearTimer(
      hideTimerRef
    );


    // Prevent duplicate close timers.
    clearTimer(
      closeTimerRef
    );


    // Start closing animation.
    setIsClosing(true);


    closeTimerRef.current =
      window.setTimeout(() => {
        if (!mountedRef.current) {
          return;
        }


        setIsVisible(false);
        setIsClosing(false);


        // If visitor closes it manually,
        // wait 10 seconds before showing again.
        scheduleNextAppearance(
          HIDDEN_DURATION
        );

      }, CLOSING_DURATION);
  };


  // ==========================================================
  // DO NOT RENDER WHILE HIDDEN
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
        <X
          size={15}
          aria-hidden="true"
        />
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

        {/* ===================================================
            LABEL
        ==================================================== */}

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