// Smooth scrolling with Lenis, driven by GSAP's clock so ScrollTrigger
// animations stay perfectly in step with the scroll position.
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let lenis = null;
let tick = null;
let lockObserver = null;

const reduceMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Menus and dialogs lock the page by setting overflow: hidden on <html>
// or <body>. Lenis scrolls the window itself, so it has to pause too.
function isPageLocked() {
  return [document.documentElement, document.body].some(
    (node) => node.style.overflow === "hidden"
  );
}

// Same-page links such as "#ventures" glide to their section.
function handleHashLink(event) {
  if (event.defaultPrevented || event.button !== 0) return;
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

  const link = event.target.closest?.("a[href^='#']");
  const id = link?.getAttribute("href").slice(1);
  const target = id && document.getElementById(id);
  if (!target) return;

  event.preventDefault();
  scrollToTarget(target);
}

function watchScrollLocks() {
  lockObserver = new MutationObserver(() => {
    if (!lenis) return;
    if (isPageLocked()) lenis.stop();
    else lenis.start();
  });

  [document.documentElement, document.body].forEach((node) =>
    lockObserver.observe(node, { attributes: true, attributeFilter: ["style"] })
  );
}

/** Starts smooth scrolling (skipped for visitors who prefer reduced motion). */
export function startSmoothScroll() {
  if (lenis || reduceMotion()) return lenis;

  lenis = new Lenis({
    autoRaf: false,
    lerp: 0.1,
    anchors: false,
    // Scrollable panels (tables, lists) keep scrolling natively.
    allowNestedScroll: true,
    // Scrollable menus, dialogs and lists keep their own native scrolling.
    prevent: (node) =>
      Boolean(
        node.closest?.(
          "[data-lenis-prevent], [role='dialog'], .fyl-modal-backdrop, .navbar__nav, .navbar__mega"
        )
      ),
  });

  lenis.on("scroll", ScrollTrigger.update);
  tick = (time) => lenis?.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  watchScrollLocks();
  document.addEventListener("click", handleHashLink);

  // Safety net: Lenis takes over the mouse wheel, so if GSAP's clock never
  // runs (some hidden or background views) hand scrolling back to the browser.
  const startFrame = gsap.ticker.frame;
  setTimeout(() => {
    if (lenis && gsap.ticker.frame === startFrame) stopSmoothScroll();
  }, 2500);

  // Development only: lets the browser console reach Lenis for testing.
  if (import.meta.env.DEV) window.lenis = lenis;
  return lenis;
}

export function stopSmoothScroll() {
  if (tick) gsap.ticker.remove(tick);
  lockObserver?.disconnect();
  document.removeEventListener("click", handleHashLink);
  lenis?.destroy();
  lenis = null;
  tick = null;
  lockObserver = null;
}

// Distance from the top of the page, ignoring animation transforms
// (a section mid fade-in would otherwise be measured in the wrong place).
function layoutTop(element) {
  let top = 0;
  for (let node = element; node; node = node.offsetParent) top += node.offsetTop;
  return top;
}

// Room for the sticky navbar when scrolling to a section.
function headerOffset() {
  const header = document.querySelector(".navbar");
  return header ? header.getBoundingClientRect().height + 16 : 0;
}

/**
 * Scrolls to an element, a selector or a position. Uses Lenis when it is
 * running, otherwise the browser's own scrolling.
 * `block: "center"` centres the element in the window instead.
 */
export function scrollToTarget(
  target,
  { offset, immediate = false, block = "start" } = {}
) {
  if (target == null) return;

  const element =
    typeof target === "string" ? document.querySelector(target) : target;

  let top;

  if (typeof element === "number") {
    top = element;
  } else if (element) {
    top =
      block === "center"
        ? layoutTop(element) - (window.innerHeight - element.offsetHeight) / 2
        : layoutTop(element) - (offset ?? headerOffset());
  } else {
    return;
  }

  top = Math.max(0, top);

  if (lenis) {
    lenis.scrollTo(top, { immediate, force: true });
    return;
  }

  window.scrollTo({
    top,
    behavior: immediate || reduceMotion() ? "auto" : "smooth",
  });
}
