// Footer motion. The footer stays mounted between pages, so Motion calls
// this on every page change inside its gsap.matchMedia context; reverting
// that context resets the footer, ready to play again on the next page.
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";

const EASE = "power3.out";

/** Animates the footer as it scrolls into view; returns a cleanup function. */
export function animateFooter(footer) {
  if (!footer) return () => {};

  const q = (selector) => gsap.utils.toArray(footer.querySelectorAll(selector));
  let split = null;

  // The faint photo behind the footer drifts up into place while scrolling.
  const background = footer.querySelector(".cf-footer__background");
  if (background) {
    gsap.fromTo(
      background,
      { yPercent: 12, scale: 1.08 },
      {
        yPercent: 0,
        scale: 1,
        ease: "none",
        scrollTrigger: { trigger: footer, start: "top bottom", end: "bottom bottom", scrub: true },
      }
    );
  }

  const timeline = gsap.timeline({
    defaults: { ease: EASE, duration: 0.8 },
    scrollTrigger: { trigger: footer, start: "clamp(top 85%)", once: true },
  });

  // Brand column: logo settles in, then the text and meeting button rise.
  timeline
    .from(q(".cf-footer__logo"), { autoAlpha: 0, y: 24, scale: 0.94, duration: 0.9, clearProps: "opacity,visibility,transform" })
    .from(
      q(".cf-footer__eyebrow, .cf-footer__description, .cf-footer__location, .cf-footer__meeting"),
      { autoAlpha: 0, y: 22, stagger: 0.08, clearProps: "opacity,visibility,transform" },
      "-=0.6"
    );

  // Link columns: headings first, then each list of links slides in.
  q(".cf-footer__column").forEach((column, index) => {
    const heading = column.firstElementChild;
    const links = column.querySelectorAll("li");
    const at = 0.25 + index * 0.12;

    if (heading) {
      timeline.from(heading, { autoAlpha: 0, y: 16, clearProps: "opacity,visibility,transform" }, at);
    }
    if (links.length) {
      timeline.from(
        links,
        { autoAlpha: 0, x: -14, stagger: 0.05, duration: 0.6, clearProps: "opacity,visibility,transform" },
        at + 0.12
      );
    }
  });

  // "Our focus" items and the newsletter card.
  timeline
    .from(q(".cf-footer__focus-item"), { autoAlpha: 0, x: -14, stagger: 0.06, duration: 0.6, clearProps: "opacity,visibility,transform" }, 0.45)
    .from(q(".cf-footer__newsletter"), { autoAlpha: 0, y: 36, scale: 0.97, duration: 1, clearProps: "opacity,visibility,transform" }, 0.35);

  // Closing statement: words rise one by one from behind a mask, then
  // the original line is put back so nothing stays clipped.
  const statement = footer.querySelector(".cf-footer__statement");
  if (statement) {
    split = SplitText.create(statement, { type: "words", mask: "words" });
    timeline.from(
      split.words,
      {
        yPercent: 110,
        stagger: 0.07,
        duration: 0.9,
        ease: "power4.out",
        onComplete: () => {
          split?.revert();
          split = null;
        },
      },
      0.7
    );
  }

  // Bottom bar: the row fades up and the social icons pop in.
  timeline
    .from(q(".cf-footer__copyright, .cf-footer__legal, .cf-footer__credit"), { autoAlpha: 0, y: 12, stagger: 0.06, duration: 0.6, clearProps: "opacity,visibility,transform" }, 1)
    .from(q(".cf-footer__social"), { autoAlpha: 0, scale: 0.5, stagger: 0.06, duration: 0.55, ease: "back.out(2.2)", clearProps: "opacity,visibility,transform" }, 1.05)
    .from(q(".cf-footer__top"), { autoAlpha: 0, y: 12, duration: 0.6, clearProps: "opacity,visibility,transform" }, 1.15);

  return () => {
    split?.revert();
    split = null;
  };
}
