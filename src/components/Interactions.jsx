import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { gsap } from "gsap";

/*
 * Pointer interactions for desktop mice and trackpads:
 *   - a gold cursor (dot + trailing ring) that grows over links and buttons
 *     and reads "View" over clickable photos
 *   - main buttons pull gently toward the pointer (magnetic)
 *   - cards tilt slightly toward the pointer, with a soft light following it
 * Touch screens, the admin area and visitors who prefer reduced motion
 * keep the normal cursor and static elements.
 */

const FINE_POINTER = "(hover: hover) and (pointer: fine)";
const REDUCED = "(prefers-reduced-motion: reduce)";

const LINKS = "a, button, [role='button'], summary, label[for], select";
const TEXT_FIELDS = "input:not([type='checkbox']):not([type='radio']):not([type='submit']):not([type='button']), textarea, [contenteditable='true']";
const BUTTONS = "a[class*='button'], button[class*='button'], a[class*='btn'], button[class*='btn'], a[class*='__cta'], .navbar__subscribe, .cf-footer__meeting, .cf-footer__social, .cf-footer__top";
const NO_FX = "nav, header, footer, form, [role='dialog'], [data-no-fx]";

// Cards: rounded boxes with a surface, sized like a card.
function isCard(element) {
  if (element.tagName === "SECTION" || element.closest(NO_FX)) return false;

  const { width, height } = element.getBoundingClientRect();
  if (width < 200 || width > 720 || height < 140 || height > 760) return false;

  const style = getComputedStyle(element);
  if (parseFloat(style.borderTopLeftRadius) < 12) return false;

  const hasSurface =
    style.backgroundColor !== "rgba(0, 0, 0, 0)" ||
    style.borderTopWidth !== "0px" ||
    style.boxShadow !== "none";

  return hasSurface && element.closest("main") !== null;
}

function findCard(target) {
  for (let node = target; node && node !== document.body; node = node.parentElement) {
    if (node.tagName === "MAIN") return null;
    if (isCard(node)) return node;
  }
  return null;
}

// Photos that open something when clicked.
const isClickablePhoto = (target) =>
  target.tagName === "IMG" && Boolean(target.closest("a, button"));

export default function Interactions() {
  const { pathname } = useLocation();
  const enabled = !pathname.startsWith("/admin");

  useEffect(() => {
    if (
      !enabled ||
      !window.matchMedia(FINE_POINTER).matches ||
      window.matchMedia(REDUCED).matches
    ) {
      return undefined;
    }

    /* ---------- cursor ---------- */

    const cursor = document.createElement("div");
    cursor.className = "cf-cursor";
    cursor.setAttribute("aria-hidden", "true");
    cursor.innerHTML =
      '<span class="cf-cursor__ring"><span class="cf-cursor__label">View</span></span><span class="cf-cursor__dot"></span>';
    document.body.appendChild(cursor);
    document.documentElement.classList.add("has-cf-cursor");

    const ring = cursor.querySelector(".cf-cursor__ring");
    const dot = cursor.querySelector(".cf-cursor__dot");

    const ringX = gsap.quickTo(ring, "x", { duration: 0.45, ease: "power3.out" });
    const ringY = gsap.quickTo(ring, "y", { duration: 0.45, ease: "power3.out" });
    const dotX = gsap.quickTo(dot, "x", { duration: 0.08, ease: "power2.out" });
    const dotY = gsap.quickTo(dot, "y", { duration: 0.08, ease: "power2.out" });

    let state = "";
    const setState = (next) => {
      if (next === state) return;
      state = next;
      cursor.dataset.state = next;
    };

    /* ---------- magnetic buttons + tilting cards ---------- */

    let magnet = null;
    let card = null;

    const releaseMagnet = () => {
      if (!magnet) return;
      gsap.to(magnet, { translate: "0px 0px", duration: 0.6, ease: "elastic.out(1, 0.45)" });
      magnet = null;
    };

    const releaseCard = () => {
      if (!card) return;
      const leaving = card;
      gsap.to(leaving, {
        rotationX: 0,
        rotationY: 0,
        y: 0,
        duration: 0.6,
        ease: "power3.out",
        clearProps: "transform",
      });
      leaving.querySelector(":scope > .cf-card-light")?.remove();
      card = null;
    };

    const onMove = (event) => {
      const { clientX: x, clientY: y, target } = event;

      cursor.classList.add("is-visible");
      ringX(x);
      ringY(y);
      dotX(x);
      dotY(y);

      // Cursor appearance
      if (target.closest?.(TEXT_FIELDS)) setState("text");
      else if (isClickablePhoto(target)) setState("view");
      else if (target.closest?.(LINKS)) setState("link");
      else setState("");

      // Magnetic buttons
      const button = target.closest?.(BUTTONS);
      if (button && !button.closest("nav, header, form") && !button.disabled) {
        if (magnet !== button) {
          releaseMagnet();
          magnet = button;
        }
        const box = button.getBoundingClientRect();
        const pullX = (x - (box.left + box.width / 2)) * 0.28;
        const pullY = (y - (box.top + box.height / 2)) * 0.38;
        gsap.to(button, {
          translate: `${gsap.utils.clamp(-14, 14, pullX)}px ${gsap.utils.clamp(-10, 10, pullY)}px`,
          duration: 0.35,
          ease: "power3.out",
          overwrite: "auto",
        });
      } else {
        releaseMagnet();
      }

      // Tilting cards
      const nextCard = findCard(target);

      if (nextCard !== card) {
        releaseCard();
        if (nextCard) {
          card = nextCard;
          gsap.set(card, { transformPerspective: 900 });
          if (getComputedStyle(card).position === "static") card.style.position = "relative";
          const light = document.createElement("span");
          light.className = "cf-card-light";
          light.setAttribute("aria-hidden", "true");
          card.appendChild(light);
        }
      }

      if (card) {
        const box = card.getBoundingClientRect();
        const px = (x - box.left) / box.width;
        const py = (y - box.top) / box.height;
        gsap.to(card, {
          rotationY: (px - 0.5) * 6,
          rotationX: (0.5 - py) * 6,
          y: -4,
          duration: 0.5,
          ease: "power3.out",
          overwrite: "auto",
        });
        card.style.setProperty("--light-x", `${px * 100}%`);
        card.style.setProperty("--light-y", `${py * 100}%`);
      }
    };

    const onLeaveWindow = () => {
      cursor.classList.remove("is-visible");
      releaseMagnet();
      releaseCard();
    };

    const onDown = () => cursor.classList.add("is-pressed");
    const onUp = () => cursor.classList.remove("is-pressed");

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeaveWindow);
    document.documentElement.addEventListener("mouseleave", onLeaveWindow);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("blur", onLeaveWindow);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeaveWindow);
      document.documentElement.removeEventListener("mouseleave", onLeaveWindow);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("blur", onLeaveWindow);
      releaseMagnet();
      releaseCard();
      document.documentElement.classList.remove("has-cf-cursor");
      cursor.remove();
    };
  }, [enabled]);

  // A new page: drop any tilt or pull left on elements from the old one.
  useEffect(() => {
    document.querySelectorAll(".cf-card-light").forEach((light) => light.remove());
  }, [pathname]);

  return null;
}
