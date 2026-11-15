// Scroll-driven sections (desktop only):
//   data-scroll-steps         steps light up one by one while the section is pinned
//   data-scroll-steps="line"  ...and the line joining them fills as you go
//   data-scroll-horizontal    a row of cards slides sideways while you scroll down
// Runs inside Motion's gsap.matchMedia context, so every tween, pin and
// inline style it creates is undone when the page changes.
import { gsap } from "gsap";

// A pinned section fills the window so nothing shows above or below it.
function fillWindow(section) {
  gsap.set(section, {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  });
}

function fitsWindow(section) {
  return section.offsetHeight <= window.innerHeight * 0.95;
}

function setupSteps(list, cleanups) {
  const steps = [...list.children].filter((child) => !child.classList.contains("scene-progress"));
  if (steps.length < 3) return;

  const section = list.closest("section") || list.parentElement;
  const pin = fitsWindow(section);

  list.dataset.sceneActive = "1";
  cleanups.push(() => delete list.dataset.sceneActive);

  let bar = null;
  if (list.dataset.scrollSteps === "line") {
    bar = document.createElement("span");
    bar.className = "scene-progress";
    bar.setAttribute("aria-hidden", "true");
    // First in the list so the step circles paint on top of it.
    list.prepend(bar);
    cleanups.push(() => bar.remove());
  }

  if (pin) fillWindow(section);

  const timeline = gsap.timeline({
    scrollTrigger: pin
      ? {
          trigger: section,
          start: "top top",
          end: () => `+=${steps.length * window.innerHeight * 0.32}`,
          pin: true,
          scrub: 0.6,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        }
      : { trigger: list, start: "top 78%", end: "bottom 50%", scrub: 0.6 },
  });

  timeline.fromTo(
    steps,
    { autoAlpha: 0.22, y: 26 },
    { autoAlpha: 1, y: 0, duration: 1, stagger: 1, ease: "none" },
    0
  );

  if (bar) {
    timeline.fromTo(
      bar,
      { scaleX: 0 },
      { scaleX: 1, duration: steps.length, ease: "none" },
      0
    );
  }
}

function setupHorizontal(track, cleanups) {
  const section = track.closest("section");
  if (!section || track.children.length < 3) return;

  // CSS lays the cards out in one row while this is on.
  track.dataset.sceneActive = "1";
  track.dataset.horizontal = "on";
  cleanups.push(() => {
    delete track.dataset.sceneActive;
    delete track.dataset.horizontal;
  });

  const container = track.parentElement;
  const distance = () => Math.max(0, track.scrollWidth - container.clientWidth);
  if (!distance() || !fitsWindow(section)) {
    delete track.dataset.horizontal;
    return;
  }

  gsap.set(section, { overflow: "hidden" });
  fillWindow(section);

  gsap.to(track, {
    x: () => -distance(),
    ease: "none",
    scrollTrigger: {
      trigger: section,
      start: "top top",
      end: () => `+=${distance()}`,
      pin: true,
      scrub: 0.6,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  });
}

/** Sets up every scroll scene on the page; returns a cleanup function. */
export function setupScrollScenes(page) {
  const cleanups = [];

  page.querySelectorAll("[data-scroll-steps]").forEach((list) => setupSteps(list, cleanups));
  page.querySelectorAll("[data-scroll-horizontal]").forEach((track) => setupHorizontal(track, cleanups));

  return () => cleanups.forEach((cleanup) => cleanup());
}
