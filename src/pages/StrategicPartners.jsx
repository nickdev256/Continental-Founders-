import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  ClipboardCheck,
  Cpu,
  FlaskConical,
  Globe2,
  GraduationCap,
  HandCoins,
  Landmark,
  Lightbulb,
  Network,
  Users,
} from "lucide-react";

import { partnerTypes } from "../data/partners";

import "./StrategicPartners.css";


/* ============================================================
   CONTRIBUTIONS
============================================================ */

const contributions = [
  { label: "Expertise and technical knowledge", icon: Lightbulb },
  { label: "Research and innovation capacity", icon: FlaskConical },
  { label: "Funding or resource support", icon: HandCoins },
  { label: "Technology and infrastructure", icon: Cpu },
  { label: "Professional networks", icon: Network },
  { label: "Mentorship and leadership", icon: Users },
  { label: "Program implementation", icon: ClipboardCheck },
  { label: "Community and sector access", icon: Globe2 },
];


/* ============================================================
   PARTNER ECOSYSTEM
   Text lives in data/partners.js; photos, icons and colours
   match the Partners menu.
============================================================ */

const ecosystemMedia = {
  "/partners/us-africa-trade-network": {
    image: "/assets/images/us-africa/market-access.webp",
    imageAlt: "Cargo port at sunset with containers ready for export",
    icon: Globe2,
    color: "navy",
  },
  "/universities": {
    image: "/assets/images/universities/university-partnership.webp",
    imageAlt: "Students talking together outside a university building",
    icon: GraduationCap,
    color: "blue",
  },
  "/partners/corporate": {
    image: "/assets/images/us-africa/business-connections.webp",
    imageAlt: "Business leaders talking at a networking event",
    icon: Building2,
    color: "gold",
  },
  "/partners/government-development": {
    image: "/assets/images/us-africa/final-cta.webp",
    imageAlt: "A person looking over a growing African city at sunrise",
    icon: Landmark,
    color: "navy",
  },
};

const ecosystem = partnerTypes.map((partner) => ({
  ...partner,
  ...ecosystemMedia[partner.path],
}));


/* ============================================================
   STRATEGIC PARTNERS
============================================================ */

export default function StrategicPartners() {
  // Reveal sections as they scroll into view. Anything already
  // above the fold (or skipped by a fast jump) is shown at once.
  const pageRef = useRef(null);

  useEffect(() => {
    const root = pageRef.current;

    if (
      !root ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return undefined;
    }

    root.classList.add("sp-page--reveal");

    let pending = [...root.querySelectorAll("[data-reveal]")];
    let frame = 0;

    const reveal = () => {
      frame = 0;
      const limit = window.innerHeight * 0.92;

      pending = pending.filter((element) => {
        if (element.getBoundingClientRect().top < limit) {
          element.classList.add("is-visible");
          return false;
        }

        return true;
      });

      if (!pending.length) {
        window.removeEventListener("scroll", schedule);
        window.removeEventListener("resize", schedule);
      }
    };

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(reveal);
    };

    reveal();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return (
    <main className="sp-page" ref={pageRef}>

      {/* ======================================================
          HERO
      ====================================================== */}

      <section className="sp-hero">
        <div className="sp-hero__background" aria-hidden="true">
          <img
            src="/assets/b.webp"
            alt=""
            fetchPriority="high"
          />
        </div>

        <div className="sp-container sp-hero__inner">
          <div className="sp-hero__content">
            <span className="sp-eyebrow sp-eyebrow--light">
              Strategic Partners
            </span>

            <h1>
              Bring capability, networks, and purpose{" "}
              <em>together.</em>
            </h1>

            <p>
              We connect institutions with organizations whose
              expertise, resources, and networks can strengthen
              shared priorities.
            </p>

            <div className="sp-hero__actions">
              <a href="#sp-ecosystem" className="sp-button sp-button--gold">
                Explore the partner ecosystem
                <ArrowRight size={18} aria-hidden="true" />
              </a>

              <Link to="/contact" className="sp-button sp-button--ghost">
                Become a partner
              </Link>
            </div>
          </div>

          <nav className="sp-hero__types" aria-label="Partner types">
            {ecosystem.map(({ title, path, icon: Icon, color }) => (
              <Link
                key={path}
                to={path}
                className={`sp-hero__type sp-tone--${color}`}
              >
                <span className="sp-hero__type-icon">
                  <Icon size={18} aria-hidden="true" />
                </span>
                <span>{title}</span>
                <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            ))}
          </nav>
        </div>
      </section>


      {/* ======================================================
          OPENING
      ====================================================== */}

      <section className="sp-section sp-opening">
        <div className="sp-container sp-opening__grid" data-reveal>
          <span className="sp-eyebrow">Beyond the University</span>

          <div className="sp-opening__content">
            <h2>
              The right strategic partner can turn an idea into
              an ecosystem.
            </h2>

            <p>
              Strategic partnerships can bring together
              complementary capabilities. The opportunity is to
              connect those capabilities around a clear objective
              rather than creating relationships for their own
              sake.
            </p>
          </div>
        </div>
      </section>


      {/* ======================================================
          BROADER NETWORK
      ====================================================== */}

      <section className="sp-section sp-network">
        <div className="sp-container sp-network__grid">
          <div className="sp-network__content" data-reveal>
            <span className="sp-eyebrow">A broader network</span>

            <h2>Different institutions. Shared opportunity.</h2>

            <p>
              Foundations, nonprofits, corporations, research
              institutions, professional networks, and other
              organizations can contribute resources or expertise
              that universities cannot create alone.
            </p>

            <p>
              We look for alignment between what a partner can
              contribute and what the wider collaboration is trying
              to accomplish.
            </p>
          </div>

          <figure className="sp-network__media" data-reveal>
            <img
              src="/assets/images/hero-education.webp"
              alt="Partners and founders gathered at a Continental Founders event"
              loading="lazy"
            />
          </figure>
        </div>
      </section>


      {/* ======================================================
          CONTRIBUTIONS
      ====================================================== */}

      <section className="sp-section sp-section--soft sp-contributions">
        <div className="sp-container">
          <header className="sp-heading" data-reveal>
            <span className="sp-eyebrow">Who can contribute</span>
            <h2>Partnership takes many forms.</h2>
            <p>
              A strategic partner does not need to look like a
              university. The key question is whether the
              relationship can create useful shared value.
            </p>
          </header>

          <ul className="sp-contributions__grid" data-reveal>
            {contributions.map(({ label, icon: Icon }, index) => (
              <li className="sp-contribution" key={label}>
                <span className="sp-contribution__icon">
                  <Icon size={22} aria-hidden="true" />
                </span>

                <span className="sp-contribution__number">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <p>{label}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>


      {/* ======================================================
          PARTNER ECOSYSTEM
      ====================================================== */}

      <section className="sp-section sp-ecosystem" id="sp-ecosystem">
        <div className="sp-container">
          <header className="sp-heading" data-reveal>
            <span className="sp-eyebrow">Partner ecosystem</span>
            <h2>A network designed around complementarity.</h2>
          </header>

          <div className="sp-ecosystem__grid" data-reveal>
            {ecosystem.map(
              ({ title, description, path, image, imageAlt, icon: Icon, color }) => (
                <Link
                  key={path}
                  to={path}
                  className={`sp-partner sp-tone--${color}`}
                >
                  <div className="sp-partner__media">
                    <img src={image} alt={imageAlt} loading="lazy" />

                    <span className="sp-partner__icon">
                      <Icon size={20} aria-hidden="true" />
                    </span>
                  </div>

                  <div className="sp-partner__body">
                    <h3>{title}</h3>
                    <p>{description}</p>

                    <span className="sp-partner__link">
                      Learn more
                      <ArrowRight size={16} aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              )
            )}
          </div>
        </div>
      </section>


      {/* ======================================================
          CALL TO ACTION
      ====================================================== */}

      <section className="sp-cta">
        <div className="sp-container">
          <div className="sp-cta__card" data-reveal>
            <div>
              <span className="sp-eyebrow sp-eyebrow--light">
                Partner with us
              </span>

              <h2>Bring what you do best. We’ll connect it to founders who need it.</h2>
            </div>

            <div className="sp-cta__actions">
              <Link to="/contact" className="sp-button sp-button--gold">
                Start a conversation
                <ArrowRight size={18} aria-hidden="true" />
              </Link>

              <Link to="/about" className="sp-button sp-button--ghost">
                About Continental Founders
              </Link>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
