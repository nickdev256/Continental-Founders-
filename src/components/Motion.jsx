import { useLayoutEffect } from "react";
import { useLocation } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { scrollToTarget, startSmoothScroll } from "../lib/smoothScroll";
import { setupScrollScenes } from "../lib/scrollScenes";
import { animateFooter } from "../lib/footerMotion";

gsap.registerPlugin(ScrollTrigger, SplitText);
ScrollTrigger.config({ ignoreMobileResize: true });

// Development only: lets the browser console reach GSAP for testing.
if (import.meta.env.DEV) Object.assign(window, { gsap, ScrollTrigger });

const EASE = "power3.out";

// Never animate site chrome, forms, dialogs or scroll scenes (they run their own).
const SKIP =
  "header, nav, form, dialog, [role='dialog'], [data-motion-skip], [data-scene-active]";

// The photo layer behind a hero's text.
const HERO_MEDIA =
  "[class*='hero__media'], [class*='hero-media'], [class*='hero__background'], [class*='hero__bg'], [class*='hero-bg']";

const isGrid = (element) => {
  const display = getComputedStyle(element).display;
  return display === "grid" || display === "inline-grid";
};

// Blocks that rise into view: anything marked data-reveal, plus the
// items of every card grid. Grids already inside a revealed block are
// left alone so nothing animates twice.
function findBlocks(root, hero) {
  const blocks = new Set();
  const inBlock = (element) =>
    [...blocks].some((block) => block.contains(element));

  root.querySelectorAll("[data-reveal]").forEach((element) => {
    if (hero?.contains(element) || element.closest(SKIP)) return;

    if (isGrid(element) && element.children.length > 1) {
      [...element.children].forEach((child) => blocks.add(child));
    } else {
      blocks.add(element);
    }
  });

  root
    .querySelectorAll("section ul, section ol, section div")
    .forEach((element) => {
      if (
        element.children.length < 2 ||
        hero?.contains(element) ||
        element.closest(SKIP) ||
        inBlock(element) ||
        !isGrid(element)
      ) {
        return;
      }

      [...element.children].forEach((child) => {
        if (child.offsetWidth > 0) blocks.add(child);
      });
    });

  return [...blocks].filter((element) => !element.dataset.motion);
}

// Large standalone photos outside the hero and outside card grids.
function findPhotos(root, hero, blocks) {
  return [...root.querySelectorAll("section img")]
    .map((img) => img.closest("figure") || img.parentElement)
    .filter((frame, index, all) => {
      if (!frame || all.indexOf(frame) !== index) return false;
      if (frame.dataset.motion || hero?.contains(frame) || frame.closest(SKIP))
        return false;
      if (blocks.some((block) => block.contains(frame))) return false;
      return frame.offsetWidth >= 280 && frame.offsetHeight >= 200;
    });
}

/*
 * Site-wide motion with GSAP + ScrollTrigger + SplitText.
 * Rebuilt on every page change and cleaned up afterwards. Content that
 * arrives later from the backend is picked up as it appears.
 * Visitors who prefer reduced motion get the plain, still page.
 */
export default function Motion() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    startSmoothScroll();
  }, []);

  useLayoutEffect(() => {
    // Start at the top before positions are measured.
    scrollToTarget(0, { immediate: true });

    // The admin area stays still.
    if (pathname.startsWith("/admin")) return undefined;

    const mm = gsap.matchMedia();

    const start = () =>
      mm.add(
      {
        motion: "(prefers-reduced-motion: no-preference)",
        desktop: "(min-width: 1101px)",
      },
      (context) => {
        if (!context.conditions.motion) return undefined;

        const page = document.querySelector(".page-transition");
        if (!page) return undefined;

        // Pinned and sideways sections on large screens; on phones and
        // tablets the same content simply rises into view.
        const cleanScenes = context.conditions.desktop
          ? setupScrollScenes(page)
          : () => {};

        // The footer lives outside the page, so it gets its own sequence.
        const cleanFooter = animateFooter(document.querySelector(".cf-footer"));

        // The hero banner is the first section of every page.
        const hero =
          page.querySelector("main > section") || page.querySelector("section");
        const splits = [];

        // Page transition: the new page rises and fades in.
        gsap.from(page, {
          autoAlpha: 0,
          y: 20,
          duration: 0.6,
          ease: EASE,
          clearProps: "opacity,visibility,transform",
        });

        // Headlines: each line slides up from behind a mask.
        const splitLines = (heading, inHero) => {
          heading.dataset.motion = "1";
          splits.push(
            SplitText.create(heading, {
              type: "lines",
              mask: "lines",
              autoSplit: true,
              onSplit: (self) =>
                gsap.from(self.lines, {
                  yPercent: 110,
                  duration: inHero ? 1.1 : 0.9,
                  stagger: 0.1,
                  ease: "power4.out",
                  delay: inHero ? 0.2 : 0,
                  // Put the original heading back once it has landed, so the
                  // line masks can never clip descenders or italic letters.
                  onComplete: () => self.revert(),
                  scrollTrigger: inHero
                    ? undefined
                    : { trigger: heading, start: "clamp(top 90%)", once: true },
                }),
            }),
          );
        };

        // Hero: headline lines rise, then the rest of the text and buttons follow.
        if (hero) {
          const heading = hero.querySelector("h1");
          if (heading) splitLines(heading, true);

          const candidates = [
            ...hero.querySelectorAll(
              "h1 ~ *, [class*='eyebrow'], [class*='aside'], [class*='belief'], [class*='visual']",
            ),
          ].filter(
            (element) =>
              !element.closest(HERO_MEDIA) && !element.contains(heading),
          );

          // Skip anything already inside another animated element.
          const copy = candidates.filter(
            (element) =>
              !candidates.some(
                (other) => other !== element && other.contains(element),
              ),
          );

          if (copy.length) {
            gsap.from(copy, {
              autoAlpha: 0,
              y: 24,
              duration: 0.9,
              stagger: 0.08,
              ease: EASE,
              delay: 0.45,
              clearProps: "opacity,visibility,transform",
            });
          }

          // The photo drifts slower than the page as you scroll past.
          const media = hero.querySelector(HERO_MEDIA);
          if (media) {
            gsap.fromTo(
              media,
              { yPercent: 0 },
              {
                yPercent: 18,
                ease: "none",
                immediateRender: false,
                scrollTrigger: {
                  trigger: hero,
                  start: "top top",
                  end: "bottom top",
                  scrub: true,
                },
              },
            );
          }
        }

        const scan = () => {
          // Section headings
          page.querySelectorAll("main section h2").forEach((heading) => {
            if (
              heading.dataset.motion ||
              hero?.contains(heading) ||
              heading.closest(SKIP)
            )
              return;
            if (!heading.textContent.trim()) return;
            splitLines(heading, false);
          });

          // Cards and blocks rise in batches, staggered left to right.
          const blocks = findBlocks(page, hero);
          blocks.forEach((block) => {
            block.dataset.motion = "1";
          });

          if (blocks.length) {
            gsap.set(blocks, { autoAlpha: 0, y: 32 });
            ScrollTrigger.batch(blocks, {
              start: "clamp(top 92%)",
              once: true,
              onEnter: (batch) =>
                gsap.to(batch, {
                  autoAlpha: 1,
                  y: 0,
                  duration: 0.85,
                  stagger: 0.08,
                  ease: EASE,
                  overwrite: true,
                  // Hand control back to CSS so hover effects keep working.
                  clearProps: "opacity,visibility,transform",
                }),
            });
          }

          // Photos wipe open from the bottom, with a slow settle on the image.
          findPhotos(page, hero, blocks).forEach((frame) => {
            frame.dataset.motion = "1";
            const trigger = {
              trigger: frame,
              start: "clamp(top 88%)",
              once: true,
            };

            gsap.fromTo(
              frame,
              { clipPath: "inset(100% 0% 0% 0%)" },
              {
                clipPath: "inset(0% 0% 0% 0%)",
                duration: 1.2,
                ease: "power3.inOut",
                scrollTrigger: trigger,
                clearProps: "clipPath",
              },
            );

            const img =
              frame.tagName === "IMG" ? null : frame.querySelector("img");
            if (img) {
              gsap.fromTo(
                img,
                { scale: 1.15 },
                {
                  scale: 1,
                  duration: 1.6,
                  ease: EASE,
                  scrollTrigger: trigger,
                  clearProps: "scale",
                },
              );
            }
          });

          ScrollTrigger.sort();
          ScrollTrigger.refresh();
        };

        scan();

        // Events, insights, gallery and ventures load from the backend after
        // the page appears; animate them as they arrive.
        let pending = 0;
        const observer = new MutationObserver(() => {
          clearTimeout(pending);
          pending = setTimeout(scan, 120);
        });
        observer.observe(page, { childList: true, subtree: true });

        // Recalculate positions once late images and fonts have settled.
        const refresh = () => ScrollTrigger.refresh();
        window.addEventListener("load", refresh);
        const timer = setTimeout(refresh, 900);

        return () => {
          observer.disconnect();
          clearTimeout(pending);
          clearTimeout(timer);
          window.removeEventListener("load", refresh);
          splits.forEach((split) => split.revert());
          cleanScenes();
          cleanFooter();
          page.querySelectorAll("[data-motion]").forEach((element) => {
            delete element.dataset.motion;
          });
        };
      },
    );

    // Pages load on demand, so wait until this one has rendered
    // before looking for its hero, headings and cards.
    const routeRoot = document.querySelector(".page-transition");
    const rendered = () => routeRoot?.querySelector("main, section");
    let waiting = null;

    if (rendered()) {
      start();
    } else if (routeRoot) {
      waiting = new MutationObserver(() => {
        if (!rendered()) return;
        waiting.disconnect();
        waiting = null;
        start();
      });
      waiting.observe(routeRoot, { childList: true, subtree: true });
    }

    // Safety net: if the browser never runs animation frames (some hidden or
    // background views), drop the animations so the page is never left invisible.
    const startFrame = gsap.ticker.frame;
    const safety = setTimeout(() => {
      if (gsap.ticker.frame === startFrame) mm.revert();
    }, 2500);

    return () => {
      waiting?.disconnect();
      clearTimeout(safety);
      mm.revert();
    };
  }, [pathname]);

  return null;
}
