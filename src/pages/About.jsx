import React, {
  useEffect,
  useRef,
} from "react";

import { Link } from "react-router-dom";

import {
  ArrowRight,
  ArrowUpRight,
  ArrowLeftRight,
  Compass,
  Globe2,
  GraduationCap,
  Handshake,
  Lightbulb,
  Rocket,
  Users,
} from "lucide-react";

import "./About.css";

/* ============================================================
   PRINCIPLES
============================================================ */

const principles = [
  {
    number: "01",
    title: "Reciprocity",
    text:
      "Partnership should create meaningful value for institutions, founders, professionals, and communities across the relationship.",
  },
  {
    number: "02",
    title: "Intentionality",
    text:
      "We focus on clear purpose, relevant stakeholders, and practical pathways that can turn relationships into meaningful action.",
  },
  {
    number: "03",
    title: "Stewardship",
    text:
      "Trust is built through responsible communication, thoughtful coordination, accountability, and consistent follow-through.",
  },
  {
    number: "04",
    title: "Learning",
    text:
      "Strong partnerships evolve. We create space for reflection, adaptation, knowledge exchange, and continuous improvement.",
  },
];

/* ============================================================
   LEADERSHIP TEAM
   Photos are 800px WebP copies of the originals in
   /assets/team (the originals were ~2 MB each).
============================================================ */

const team = [
  {
    name: "Amb. Dr. Karen L. Booker",
    role: "Chair",
    image: "/assets/team/karen-booker-800.webp",
    bio:
      "Amb. Dr. Karen L. Booker brings more than four decades of experience across management services, education, outreach, policy analysis, operational diagnosis, and organizational leadership. Her career includes program development, policy work, housing and real property operations, and educational and environmental health initiatives.",
    socials: {
      linkedin: "https://www.linkedin.com/in/dr-karen-l-booker-cit-ccc/",
      instagram: "https://www.instagram.com/klynn1156?utm_source=ig_web_button_share_sheet&stkn=ZDNlZDc0MzIxNw==",
      facebook: "https://www.facebook.com/klynn1156",
    },
  },
  {
    name: "Sharneise Allen",
    role: "Vice Chair, Operations",
    image: "/assets/team/sharneise-allen-800.webp",
    bio:
      "Sharneise Allen is an education leader, entrepreneur, and youth development strategist with extensive experience designing transformational programs for students, educators, athletes, and communities. She works across entrepreneurship, financial literacy, leadership, SEL, workforce readiness, and sports-based mentorship.",
    socials: {
      linkedin: "https://www.linkedin.com/in/sharneiseallen/",
      instagram: "",
      facebook: "",
    },
  },
  {
    name: "Dr. Zaneta Brown-Ingles",
    role: "Vice Chair, Strategic Relations",
    image: "/assets/team/zaneta-brown-ingles-800.webp",
    bio:
      "Dr. Zaneta Brown-Ingles, Ed.D., is an educational leader, author, consultant, strategist, and advocate with more than 20 years of experience in K–12 education, literacy, leadership development, and strategic partnerships.",
    socials: {
      linkedin: "",
      instagram: "",
      facebook: "",
    },
  },
  {
    name: "Ashley Robinson-Spann, PhD",
    role: "Treasurer",
    image: "/assets/team/ashley-robinson-spann-800.webp",
    bio:
      "Ashley Robinson-Spann, PhD, is a researcher, writer, strategist, and nonprofit leader focused on education, human development, community capacity-building, and organizational strategy. She is the Founder and Executive Director of Still Rising Institute.",
    socials: {
      linkedin: "https://www.linkedin.com/in/arobinsonspann/",
      instagram: "",
      facebook: "",
    },
  },
];

const socialIcons = [
  { key: "linkedin", label: "LinkedIn", image: "/assets/link.webp" },
  { key: "instagram", label: "Instagram", image: "/assets/ig.webp" },
  { key: "facebook", label: "Facebook", image: "/assets/fb.webp" },
];

/* ============================================================
   OPPORTUNITY AREAS
============================================================ */

const opportunity = [
  {
    number: "01",
    title: "Education",
    icon: GraduationCap,
    path: "/universities",
    text:
      "Connecting founders, students, educators, researchers, and institutions through knowledge exchange, mentorship, and cross-cultural learning.",
  },
  {
    number: "02",
    title: "Entrepreneurship",
    icon: Rocket,
    path: "/cfcv",
    text:
      "Helping founders validate ideas, develop practical ventures, strengthen execution, and build sustainable enterprises.",
  },
  {
    number: "03",
    title: "Innovation",
    icon: Lightbulb,
    path: "/insights",
    text:
      "Connecting technology, research, creativity, and market needs to develop solutions to real-world challenges.",
  },
  {
    number: "04",
    title: "Leadership",
    icon: Compass,
    path: "/fellowship-community",
    text:
      "Developing globally minded founders and leaders prepared to work across cultures, institutions, industries, and markets.",
  },
];

/* ============================================================
   ON-PAGE NAVIGATION
============================================================ */

const sections = [
  { id: "mission", label: "Mission" },
  { id: "vision", label: "Vision" },
  { id: "story", label: "Our story" },
  { id: "approach", label: "Approach" },
  { id: "principles", label: "Principles" },
  { id: "leadership", label: "Leadership" },
];

/* ============================================================
   ABOUT PAGE
============================================================ */

export default function About() {
  const pageRef = useRef(null);

  // Reveal sections as they scroll into view. Anything already
  // above the fold (or skipped by a fast jump) is shown at once.
  useEffect(() => {
    const root = pageRef.current;

    if (
      !root ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return undefined;
    }

    root.classList.add("about-page--reveal");

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
    <main
      className="about-page"
      ref={pageRef}
    >

      {/* ======================================================
          01 — HERO
      ====================================================== */}

      <section className="about-hero">

        <div
          className="about-hero__background"
          aria-hidden="true"
        >
          <img
            src="/assets/a.webp"
            alt=""
            fetchPriority="high"
          />
        </div>

        <div
          className="about-hero__overlay"
          aria-hidden="true"
        />

        <div className="about-container about-hero__inner">

          <div className="about-hero__content">

            <span className="about-pill">
              ABOUT CONTINENTAL FOUNDERS
            </span>

            <h1>
              The Founder Is
              <br />
              the Infrastructure.
              <br />
              <em>Building across continents.</em>
            </h1>

            <p className="about-hero__lead">
              Strengthening founders and connecting African and diaspora
              talent, institutions, and global opportunity to build
              sustainable enterprises and lasting economic value.
            </p>

            <div className="about-actions">

              <Link
                to="/contact"
                className="about-button about-button--gold"
              >
                Connect with us
                <ArrowUpRight size={17} aria-hidden="true" />
              </Link>

              <a
                href="#story"
                className="about-button about-button--glass"
              >
                Discover our story
                <ArrowRight size={17} aria-hidden="true" />
              </a>

            </div>

          </div>


          {/* On this page */}
          <nav
            className="about-hero__jump"
            aria-label="On this page"
          >

            <span>On this page</span>

            <ul>
              {sections.map((section) => (
                <li key={section.id}>
                  <a href={`#${section.id}`}>
                    {section.label}
                  </a>
                </li>
              ))}
            </ul>

          </nav>

        </div>

      </section>


      {/* ======================================================
          02 — MISSION
      ====================================================== */}

      <section
        id="mission"
        className="about-section about-section--white"
      >

        <div
          className="about-container about-split"
          data-reveal
        >

          <figure className="about-media">

            <img
              src="/assets/images/university-partnerships.webp"
              alt="Partners shaking hands across the table"
              loading="lazy"
            />

            <figcaption className="about-media__tag">
              OUR MISSION
            </figcaption>

          </figure>


          <div className="about-copy">

            <span className="about-kicker">
              OUR PURPOSE
            </span>

            <h2>
              Investing in the people
              <br />
              who build what comes next.
              <br />
              <em>Across continents.</em>
            </h2>

            <p>
              Continental Founders is a nonprofit organization focused
              on strengthening the people, relationships, and institutional
              ecosystems that enable founders to build sustainable
              enterprises and participate more fully in Africa’s economic
              future.
            </p>

            <p>
              We believe that if we want stronger economies, we must
              build stronger enterprises and if we want stronger
              enterprises, we must invest in the people capable of
              building them. We invest in founders through knowledge,
              relationships, mentorship, market access, and practical
              pathways from potential to execution.
            </p>

            <p>
              We bring together African and diaspora founders,
              universities, researchers, corporations, investors,
              mentors, and institutions to turn access into an ecosystem
              where founders can learn, build, collaborate, and grow.
            </p>

          </div>

        </div>

      </section>


      {/* ======================================================
          03 — OUR VISION
      ====================================================== */}

      <section
        id="vision"
        className="about-section about-section--soft"
      >

        <div
          className="about-container about-split about-split--reverse"
          data-reveal
        >

          <figure className="about-media">

            <img
              src="/assets/images/hero-opportunity.webp"
              alt="Continental Founders team collaborating"
              loading="lazy"
            />

          </figure>


          <div className="about-copy">

            <span className="about-kicker">
              OUR VISION
            </span>

            <h2>
              A connected ecosystem where
              founders can build beyond
              <em> geographic boundaries.</em>
            </h2>

            <p className="about-copy__lead">
              We envision African and diaspora founders, universities,
              investors, businesses, and institutions building together
              to develop stronger ventures, globally capable leaders,
              and meaningful economic opportunity.
            </p>

            <p>
              We see a future where geography does not unnecessarily
              limit access to knowledge, relationships, expertise,
              markets, or capital pathways and where cross-continental
              collaboration strengthens businesses, institutions,
              and economies.
            </p>

            <div className="about-actions">
              <Link
                to="/our-model"
                className="about-button about-button--gold"
              >
                Explore our model
                <ArrowUpRight size={17} aria-hidden="true" />
              </Link>
            </div>

          </div>

        </div>

      </section>


      {/* ======================================================
          04 — OUR STORY
      ====================================================== */}

      <section
        id="story"
        className="about-section about-section--white"
      >

        <div className="about-container about-story">

          <aside className="about-story__aside">

            <div className="about-story__sticky">

              <span className="about-kicker">
                OUR STORY
              </span>

              <figure className="about-story__image">
                <img
                  src="/assets/oo.webp"
                  alt="Students and leaders collaborating"
                  loading="lazy"
                />
              </figure>

            </div>

          </aside>


          <div className="about-story__content">

            <header
              className="about-story__header"
              data-reveal
            >

              <span className="about-kicker">
                THE BEGINNING
              </span>

              <h2>
                Talent is everywhere.
                <br />
                Access is not.
                <br />
                <em>Founders should be able to build together.</em>
              </h2>

            </header>


            <div className="about-story__block" data-reveal>

              <span className="about-story__label">
                THE IDEA
              </span>

              <p>
                Continental Founders began with a simple conviction:
                founders should be able to draw on the complementary
                strengths, knowledge, and opportunities of Africa
                and its diaspora.
              </p>

              <p>
                Talent, ambition, and ideas exist everywhere.
                Access to the right relationships, research, markets,
                expertise, capital pathways, and opportunities does not.
                Continental Founders was created to help close that gap.
              </p>

            </div>


            <div className="about-story__block" data-reveal>

              <span className="about-story__label">
                TWO CONTINENTS. COMPLEMENTARY STRENGTHS.
              </span>

              <p>
                Across Africa, founders bring deep market knowledge,
                innovation, and an understanding of local opportunities
                and challenges.
              </p>

              <p>
                Across the diaspora are founders, executives, and
                professionals with experience in global markets,
                technology, research, finance, institutions, and
                entrepreneurship.
              </p>

              <p className="about-story__short">
                Each brings valuable strengths. Continental Founders
                creates pathways for them to learn from one another
                and build together.
              </p>

            </div>


            <div className="about-story__statement" data-reveal>

              <span className="about-story__label">
                WHY CONTINENTAL FOUNDERS
              </span>

              <h3>
                We are building the bridge between African
                innovation, diaspora capability, and global opportunity.
              </h3>

            </div>


            <div className="about-story__block" data-reveal>

              <span className="about-story__label">
                A NEW MODEL OF COLLABORATION
              </span>

              <p>
                Continental Founders exists to connect these strengths
                through meaningful, reciprocal collaboration.
              </p>

              <p>
                We are building a model that moves beyond networking
                and classroom-based entrepreneurship toward practical
                founder development, institutional relationships,
                and enterprise-building.
              </p>

              <p>
                The goal is not simply to bring people together.
                It is to create the conditions for founders to build.
              </p>

              <p className="about-story__emphasis">
                We bring founders, universities, businesses,
                expertise, markets, and opportunity networks together
                to build stronger enterprises.
              </p>

              <p>
                Through collaboration, founders can explore real
                problems, validate opportunities, engage mentors,
                access research and expertise, and develop relationships
                that extend beyond a program or classroom.
              </p>

            </div>


            <div className="about-story__philosophy" data-reveal>

              <div className="about-story__philosophy-top">

                <span className="about-kicker about-kicker--light">
                  OUR PHILOSOPHY
                </span>

                <span
                  className="about-story__philosophy-mark"
                  aria-hidden="true"
                >
                  “
                </span>

              </div>

              <blockquote>
                We don't invest in a pitch alone.
                <br />
                <strong>We help founders learn to build.</strong>
              </blockquote>

              <p>
                Because a compelling pitch is only the beginning
                of a sustainable enterprise.
              </p>

            </div>


            <div className="about-story__closing" data-reveal>

              <span className="about-story__label">
                WHERE WE ARE GOING
              </span>

              <p>
                We are working toward a cross-continental ecosystem
                that develops founders, strengthens institutions,
                supports business growth, and connects talent
                to global opportunity.
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* ======================================================
          05 — OUR APPROACH
      ====================================================== */}

      <section
        id="approach"
        className="about-section about-section--soft"
      >

        <div
          className="about-container"
          data-reveal
        >

          <div className="about-heading">

            <span className="about-kicker">
              OUR APPROACH
            </span>

            <h2>
              We turn access
              <br />
              <em>into an ecosystem.</em>
            </h2>

          </div>


          <div className="about-split about-split--approach">

            <figure className="about-media">
              <img
                src="/assets/images/about-campus.webp"
                alt="University and institutional environment"
                loading="lazy"
              />
            </figure>


            <div className="about-approach__list">

              <ApproachItem
                icon={<Users />}
                title="Bring the right people together"
              >
                Across Africa and the diaspora are founders, universities,
                researchers, investors, businesses, and institutions.
                We help create clear pathways for the right people
                and organizations to connect.
              </ApproachItem>


              <ApproachItem
                icon={<Handshake />}
                title="Turn relationships into founder outcomes"
              >
                We create practical pathways through mentorship,
                institutional partnerships, entrepreneurship, innovation,
                market access, and programs designed around shared goals.
              </ApproachItem>


              <ApproachItem
                icon={<ArrowLeftRight />}
                title="Build reciprocally"
              >
                Our approach is reciprocal: African and diaspora
                founders, institutions, and professionals can learn
                from one another, build together, and create lasting
                opportunities beyond traditional exchange.
              </ApproachItem>

            </div>

          </div>

        </div>

      </section>


      {/* ======================================================
          06 — OUR BELIEF
      ====================================================== */}

      <section className="about-section about-section--white">

        <div
          className="about-container about-split"
          data-reveal
        >

          <figure className="about-media">

            <img
              src="/assets/images/leadership_collaboration_full_HD.webp"
              alt="Founders working together"
              loading="lazy"
            />

          </figure>


          <div className="about-copy">

            <span className="about-kicker">
              OUR BELIEF
            </span>

            <h2>
              Strong enterprises
              <br />
              <em>begin with people.</em>
            </h2>

            <p>
              Founders need
              knowledge, relationships, mentorship, research, markets,
              capital pathways, and the opportunity to put their
              capabilities into action.
            </p>


            <ol className="about-belief__list">

              <li>
                <span>01</span>
                <strong>Access expands perspective.</strong>
              </li>

              <li>
                <span>02</span>
                <strong>Relationships expand possibility.</strong>
              </li>

              <li>
                <span>03</span>
                <strong>Execution turns potential into evidence.</strong>
              </li>

            </ol>


            <p>
              When founders can access the right expertise,
              relationships, markets, and resources, they are better
              positioned to move from potential to preparation,
              execution, evidence, and sustainable opportunity.
            </p>

            <p className="about-belief__closing">
              Continental Founders exists to develop founders,
              connect the ecosystem, and build pathways to enterprise.
            </p>

          </div>

        </div>

      </section>


      {/* ======================================================
          07 — WHAT WE BELIEVE
      ====================================================== */}

      <section
        id="principles"
        className="about-section about-section--soft"
      >

        <div
          className="about-container"
          data-reveal
        >

          <div className="about-heading about-heading--center">

            <span className="about-kicker">
              WHAT WE BELIEVE
            </span>

            <h2>
              The principles that
              <br />
              <em>guide our work.</em>
            </h2>

            <p>
              Strong founder ecosystems depend on trust, reciprocity,
              intentionality, stewardship, and continuous learning.
            </p>

          </div>


          <div className="about-grid about-grid--4">

            {principles.map((principle) => (

              <article
                className="about-card principle-card"
                key={principle.number}
              >

                <span className="about-card__number">
                  {principle.number}
                </span>

                <h3>
                  {principle.title}
                </h3>

                <p>
                  {principle.text}
                </p>

              </article>

            ))}

          </div>

        </div>

      </section>


      {/* ======================================================
          08 — LEADERSHIP
      ====================================================== */}

      <section
        id="leadership"
        className="about-section about-section--white"
      >

        <div
          className="about-container"
          data-reveal
        >

          <div className="about-heading">

            <span className="about-kicker">
              LEADERSHIP
            </span>

            <h2>
              Experienced leaders helping
              <br />
              <em>shape what comes next.</em>
            </h2>

            <p>
              Our leadership team brings diverse experience across
              education, nonprofit leadership, operations, strategic
              relations, research, policy, entrepreneurship, and
              community development.
            </p>

          </div>


          <div className="about-grid leadership-grid">

            {team.map((member, index) => (

              <LeaderCard
                key={member.name}
                member={member}
                eager={index === 0}
              />

            ))}

          </div>


        </div>

      </section>


      {/* ======================================================
          10 — OPPORTUNITY AREAS
      ====================================================== */}

      <section className="about-section about-section--white">

        <div
          className="about-container"
          data-reveal
        >

          <div className="about-heading">

            <span className="about-kicker">
              THE OPPORTUNITY
            </span>

            <h2>
              From founder potential
              <br />
              <em>to meaningful enterprise.</em>
            </h2>

          </div>


          <div className="about-grid about-grid--4">

            {opportunity.map((item) => {
              const Icon = item.icon;

              return (

                <article
                  className="about-card opportunity-card"
                  key={item.number}
                >

                  <div className="about-card__top">

                    <span className="about-card__icon">
                      <Icon aria-hidden="true" />
                    </span>

                    <span className="about-card__number">
                      {item.number}
                    </span>

                  </div>

                  <h3>
                    {item.title}
                  </h3>

                  <p>
                    {item.text}
                  </p>

                  <Link
                    to={item.path}
                    className="about-link"
                    aria-label={`Explore ${item.title}`}
                  >
                    Explore
                    <ArrowRight size={15} aria-hidden="true" />
                  </Link>

                </article>

              );
            })}

          </div>

        </div>

      </section>


      {/* ======================================================
          11 — FOUNDING PARTNERS
      ====================================================== */}

      <section className="about-founding">

        <div
          className="about-container about-founding__grid"
          data-reveal
        >

          <div
            className="about-founding__visual"
            aria-hidden="true"
          >

            <div className="about-founding__ring">
              <Globe2 strokeWidth={0.6} />
            </div>

            <span>
              AFRICA × UNITED STATES
            </span>

          </div>


          <div className="about-founding__content">

            <span className="about-kicker about-kicker--light">
              FOUNDING PARTNERS
            </span>

            <h2>
              Help build the ecosystem
              <br />
              <em>founders need.</em>
            </h2>

            <p>
              Continental Founders is engaging universities, businesses,
              professionals, and strategic institutions as we build
              this founder-centered ecosystem.
            </p>

            <p>
              We invite partners whose expertise, relationships, and
              perspectives can strengthen the founder experience,
              partnership model, commercial pathways, and long-term
              direction of Continental Founders.
            </p>

            <div className="about-actions">
              <Link
                to="/contact"
                className="about-button about-button--gold"
              >
                Become a founding partner
                <ArrowUpRight size={17} aria-hidden="true" />
              </Link>
            </div>

          </div>

        </div>

      </section>


    </main>
  );
}


/* ============================================================
   APPROACH ITEM
============================================================ */

function ApproachItem({
  icon,
  title,
  children,
}) {
  return (
    <article className="approach-item">

      <div
        className="approach-item__icon"
        aria-hidden="true"
      >
        {icon}
      </div>

      <div>

        <h3>
          {title}
        </h3>

        <p>
          {children}
        </p>

      </div>

    </article>
  );
}


/* ============================================================
   LEADER CARD
   All three social icons always show; the ones without an
   address yet are shown but not clickable.
============================================================ */

function LeaderCard({
  member,
  eager,
}) {
  return (
    <article className="leader-card">

      <div className="leader-card__image">
        <img
          src={member.image}
          alt={`${member.name} — ${member.role}`}
          loading={eager ? "eager" : "lazy"}
        />
      </div>

      <div className="leader-card__content">

        <span className="leader-card__role">
          {member.role}
        </span>

        <h3>
          {member.name}
        </h3>

        <p>
          {member.bio}
        </p>

        <div className="leader-card__footer">

          {member.socials?.linkedin && (
            <a
              href={member.socials.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="about-link"
            >
              View full biography
              <ArrowUpRight size={15} aria-hidden="true" />
            </a>
          )}

          <ul className="leader-card__socials">
            {socialIcons.map((social) => {
              const url = member.socials?.[social.key];

              const icon = (
                <img
                  src={social.image}
                  alt=""
                  width="18"
                  height="18"
                />
              );

              return (
                <li key={social.key}>
                  {url ? (
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="leader-card__social"
                      aria-label={`${member.name} on ${social.label}`}
                    >
                      {icon}
                    </a>
                  ) : (
                    <span
                      className="leader-card__social leader-card__social--empty"
                      title={social.label}
                      aria-hidden="true"
                    >
                      {icon}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>

        </div>

      </div>

    </article>
  );
}
