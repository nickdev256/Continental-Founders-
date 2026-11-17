import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, X } from "lucide-react";
import "./ApplyBar.css";

// Fellowship pages where a phone visitor is most likely ready to apply.
const PAGES = [
  "/cfcv",
  "/fellowship-community",
  "/find-your-lane",
  "/genesis",
  "/ascend",
  "/horizon",
];

/*
 * Phones only (see ApplyBar.css): a slim "Apply now" bar that slides up
 * once the visitor has scrolled past the hero, and steps aside while the
 * footer is on screen. It can be dismissed for the rest of the visit.
 */
export default function ApplyBar() {
  const { pathname } = useLocation();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(() => {
    try {
      return sessionStorage.getItem("cf:apply-bar-dismissed") === "1";
    } catch {
      return false;
    }
  });

  const enabled = PAGES.includes(pathname) && !dismissed;

  useEffect(() => {
    if (!enabled) {
      setVisible(false);
      return undefined;
    }

    let frame = 0;

    const update = () => {
      frame = 0;
      const footer = document.querySelector(".cf-footer");
      const footerInView =
        footer && footer.getBoundingClientRect().top < window.innerHeight;

      setVisible(window.scrollY > window.innerHeight * 0.7 && !footerInView);
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [enabled, pathname]);

  if (!enabled) return null;

  function dismiss() {
    setDismissed(true);
    try {
      sessionStorage.setItem("cf:apply-bar-dismissed", "1");
    } catch {
      // Storage blocked: it stays hidden until the page reloads.
    }
  }

  return (
    <div
      className={`cf-apply-bar${visible ? " is-visible" : ""}`}
      aria-hidden={!visible}
    >
      <div className="cf-apply-bar__text">
        <strong>CFCV Fellowship</strong>
        <span>6 months · Africa + U.S.</span>
      </div>

      <Link
        to="/cfcv/apply"
        className="cf-apply-bar__button"
        data-track="apply_click"
        data-track-label="phone apply bar"
        tabIndex={visible ? 0 : -1}
      >
        Apply now
        <ArrowRight size={16} aria-hidden="true" />
      </Link>

      <button
        type="button"
        className="cf-apply-bar__close"
        onClick={dismiss}
        aria-label="Hide the apply bar"
        tabIndex={visible ? 0 : -1}
      >
        <X size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
