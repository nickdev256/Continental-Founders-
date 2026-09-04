import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Globe2,
  Users,
  Lightbulb,
  Handshake,
  GraduationCap,
  Building2,
  Landmark,
  TrendingUp,
  Rocket,
} from "lucide-react";

import CTASection from "../components/sections/CTASection";

import "./About.css";

/* ============================================================
   PRINCIPLES
============================================================ */

const principles = [
  {
    number: "01",
    title: "Reciprocity",
    text:
      "Partnership should create meaningful value for institutions, people, and communities on both sides of the relationship.",
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
   LEADERSHIP
============================================================ */

const team = [
  {
    name: "Amb. Dr. Karen L. Booker",
    role: "Chair",
    image: "/assets/team/karen-booker.jpg",
    bio:
      "Amb. Dr. Karen L. Booker brings more than four decades of experience across management services, education, outreach, policy analysis, operational diagnosis, and organizational leadership. Her career includes program development, policy work, housing and real property operations, and educational and environmental health initiatives.",
  },
  {
    name: "Sharneise Allen",
    role: "Vice Chair, Operations",
    image: "/assets/team/sharneise-allen.jpg",
    bio:
      "Sharneise Allen is an education leader, entrepreneur, and youth development strategist with extensive experience designing transformational programs for students, educators, athletes, and communities. She works across entrepreneurship, financial literacy, leadership, SEL, workforce readiness, and sports-based mentorship.",
  },
  {
    name: "Dr. Zaneta Brown-Ingles",
    role: "Vice Chair, Strategic Relations",
    image: "/assets/team/zaneta-brown-ingles.jpg",
    bio:
      "Dr. Zaneta Brown-Ingles, Ed.D., is an educational leader, author, consultant, strategist, and advocate with more than 20 years of experience in K–12 education, literacy, leadership development, and strategic partnerships.",
  },
  {
    name: "Ashley Robinson-Spann, PhD",
    role: "Treasurer",
    image: "/assets/team/ashley-robinson-spann.jpg",
    bio:
      "Ashley Robinson-Spann, PhD, is a researcher, writer, strategist, and nonprofit leader focused on education, human development, community capacity-building, and organizational strategy. She is the Founder and Executive Director of Still Rising Institute.",
  },
];

/* ============================================================
   OPPORTUNITY AREAS
============================================================ */

const opportunity = [
  {
    number: "01",
    title: "Education",
    icon: <GraduationCap size={26} strokeWidth={1.4} />,
    text:
      "Creating opportunities for students, educators, researchers, and institutions to exchange knowledge and develop cross-cultural learning experiences.",
  },
  {
    number: "02",
    title: "Entrepreneurship",
    icon: <Rocket size={26} strokeWidth={1.4} />,
    text:
      "Helping students and emerging entrepreneurs explore ideas, identify opportunities, and develop practical ventures across markets.",
  },
  {
    number: "03",
    title: "Innovation",
    icon: <Lightbulb size={26} strokeWidth={1.4} />,
    text:
      "Encouraging collaboration around technology, research, creativity, and solutions to real-world challenges.",
  },
  {
    number: "04",
    title: "Leadership",
    icon: <Users size={26} strokeWidth={1.4} />,
    text:
      "Supporting globally minded leaders equipped to work across cultures, institutions, disciplines, and markets.",
  },
];

/* ============================================================
   ABOUT PAGE
============================================================ */

export default function About() {
  return (
    <main className="about-page">

      {/* ======================================================
          01 — HERO
      ====================================================== */}

      <section className="about-hero">


        <div className="about-hero__background">
          <img
            src="/assets/images/about-hero.jpg"
            alt=""
          />
        </div>

        <div className="about-hero__overlay" />

        {/* <div className="about-hero__line about-hero__line--left" />
        <div className="about-hero__line about-hero__line--right" /> */}

        <div className="container about-hero__inner">

          <div className="about-hero__content">


            <span className="about-kicker about-kicker--light">
              ABOUT CONTINENTAL FOUNDERS™
            </span>

            <div className="about-kicker about-kicker--light">
            About Continental Founders
            </div>


            <h1>
              Building bridges.
              <br />
              Creating opportunity.
              <br />
              Across continents.
            </h1>



            <div className="about-hero__number">
              
              
            </div>

          </div>

          <div className="about-hero__aside">

            <div className="gold-rule" />


            <p>
              Continental Founders is a nonprofit initiative building
              strategic relationships between universities, institutions,
              entrepreneurs, leaders, and communities across the United
              States and Africa.
            </p>

            <div className="about-hero__actions">

              <Link
                to="/contact"
                className="about-button about-button--gold"
              >
                Connect With Us
                <ArrowUpRight size={17} />
              </Link>

              <a
                href="#mission"
                className="about-button about-button--light"
              >
                Explore Our Story
                <ArrowUpRight size={17} />
              </a>

            </div>

          </div>

          <div className="about-hero__visual">

            <div className="about-hero__number">
              01
            </div>

            <div className="about-hero__globe">
              <Globe2
                size={250}
                strokeWidth={0.35}
              />
            </div>

            <span>
              AFRICA × UNITED STATES
            </span>

          </div>

        </div>

      </section>


      {/* ======================================================
          02 — MISSION
      ====================================================== */}

      <section
        id="mission"
        className="about-purpose about-mission"
      >

        <div className="container about-purpose__grid">

          <div className="about-purpose__visual">

            <div className="about-number">
              02
            </div>

            <div className="purpose-globe">
              <Globe2
                size={170}
                strokeWidth={0.45}
              />
            </div>

            <span className="about-visual-label">
              OUR MISSION
            </span>

          </div>


          <div className="about-purpose__content">

            <span className="about-kicker">
              OUR MISSION
            </span>

            <h2>
              Connecting universities and
              <br />
              emerging entrepreneurs across
              <br />
              Africa and America.
            </h2>

            <div className="about-purpose__copy">

              <p>
                Continental Founders connects universities and emerging
                entrepreneurs across Africa and America through experiential
                entrepreneurship, innovation, leadership development, and
                cross-cultural collaboration.
              </p>

              <p>
                Our mission is to create opportunities for participants to
                move beyond learning about entrepreneurship to actually
                building developing ideas into validated business concepts,
                strengthening their ability to execute, and creating the
                relationships, skills, and resources necessary to participate
                in the global economy.
              </p>

              <p>
                We work with universities, businesses, investors, government
                leaders, and strategic partners to create meaningful pathways
                between education, entrepreneurship, investment, and economic
                opportunity.
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* ======================================================
          03 — OUR STORY
      ====================================================== */}

      <section className="about-story">

        <div className="container about-story__grid">

          <div className="about-story__intro">

            <span className="about-kicker">
              OUR STORY
            </span>

            <span className="about-number">
              03
            </span>

            <div className="about-story__image">

              <img
                src="/assets/images/about-story.jpg"
                alt="Students and leaders collaborating"
              />

            </div>

          </div>


          <div className="about-story__content">

            <h2>
              The next generation of founders
              should not have to choose between
              learning from Africa and learning
              from America.
            </h2>

            <p>
              The idea behind Continental Founders began with a simple
              observation: the next generation of founders should have
              the opportunity to learn from both.
            </p>

            <p>
              Africa and the United States possess extraordinary and
              complementary strengths. Africa represents one of the
              world's most dynamic emerging markets and is home to a
              young generation of entrepreneurs, innovators, and future
              leaders. The United States offers extensive university,
              business, technology, investment, and entrepreneurial
              ecosystems.
            </p>

            <p>
              Yet too often, these ecosystems operate independently.
            </p>

            <p>
              Continental Founders was created to help bridge that divide.
            </p>

            <p>
              We are developing a new model of university collaboration
              that moves beyond traditional student exchange. The goal
              is not simply to send students across borders to study.
            </p>

            <p className="about-story__emphasis">
              The goal is to bring students, universities, businesses,
              and ecosystems together to build.
            </p>

            <p>
              Through cross-continental collaboration, participants have
              the opportunity to explore real world problems, develop
              solutions, test business concepts, engage with mentors and
              industry professionals, and build relationships that extend
              beyond the classroom.
             </p>
             

            <div className="about-story__quote">


              <span className="about-kicker about-kicker--gold">
                OUR PHILOSOPHY
              </span>

              <div className="about-kicker about-kicker--gold">

                              
                Our philosophy
              </div>


              <blockquote>
                We don't teach students to pitch.
                <br />
                We teach them to build.
              </blockquote>

              <p>
                Because a compelling pitch is only the beginning.
              </p>

            </div>


            <p>
              Investors don't fund ideas they fund founders who can execute.
            </p>

            <p>
              Continental Founders is therefore designed around what
              happens before and after the pitch: validating the
              opportunity, understanding the market, conducting due
              diligence, developing a viable business model, building
              an investor-ready foundation, and developing the confidence
              and capability to execute.
            </p>

            <p>
              We are intentionally building Continental Founders™ with
              university and strategic partners rather than assuming
              that a single institution can design the future alone.
            </p>

            <p>
              Our founding-stage approach creates an opportunity for
              universities in Africa and America to shape the academic
              experience, partnership model, entrepreneurial framework,
              and long-term impact together.
            </p>

            <p className="about-story__closing">
              The result we are working toward is more than an exchange.
              It is a cross-continental ecosystem for developing founders,
              creating opportunity, strengthening institutions, and
              connecting talent to the global economy.
            </p>

          </div>

        </div>

      </section>


      {/* ======================================================
          04 — OUR APPROACH
      ====================================================== */}

      <section className="about-approach">

        <div className="container">

          <div className="about-section-heading">

            <span className="about-kicker">
              OUR APPROACH
            </span>

            <span className="about-number">
              04
            </span>

            <h2>
              A relationship can
              <br />
              become an ecosystem.
            </h2>



            <div className="approach-points">

              <div className="approach-point">

                <div className="approach-point__icon">
                  <Users
                    size={19}
                    strokeWidth={1.5}
                  />
                </div>

                <p>
                  Africa and the United States are home to extraordinary
                  universities, educators, researchers, entrepreneurs,
                  institutions, and communities. Yet the right people and
                  organizations do not always have a clear pathway to one
                  another.
                </p>

              </div>


              <div className="approach-point">

                <div className="approach-point__icon">
                  <Handshake
                    size={19}
                    strokeWidth={1.5}
                  />
                </div>

                <p>
                  Continental Founders helps create that pathway through
                  strategic relationship building, institutional partnerships,
                  knowledge exchange, convenings, entrepreneurship,
                  innovation, and programs designed around shared goals.
                </p>

              </div>


              <div className="approach-point">

                <div className="approach-point__icon">
                  <Globe2
                    size={19}
                    strokeWidth={1.5}
                  />
                </div>

                <p>
                  Our approach is intentionally reciprocal. African and
                  American institutions can learn from one another, build
                  together, and create opportunities that extend beyond
                  traditional forms of international engagement.
                </p>

              </div>

            </div>


          </div>


          <div className="about-approach__grid">

            <div className="about-approach__image">

              <img
                src="/assets/images/about-campus.jpg"
                alt="University campus representing international education"
              />

            </div>


            <div className="about-approach__content">

              <ApproachItem
                icon={<Users />}
                title="Bring the right people together"
              >
                Africa and the United States are home to extraordinary
                universities, educators, researchers, entrepreneurs,
                institutions, and communities. Yet the right people and
                organizations do not always have a clear pathway to one
                another.
              </ApproachItem>


              <ApproachItem
                icon={<Handshake />}
                title="Create meaningful pathways"
              >
                Continental Founders™ helps create that pathway through
                strategic relationship building, institutional partnerships,
                knowledge exchange, convenings, entrepreneurship,
                innovation, and programs designed around shared goals.
              </ApproachItem>


              <ApproachItem
                icon={<Globe2 />}
                title="Build reciprocally"
              >
                Our approach is intentionally reciprocal. African and
                American institutions can learn from one another, build
                together, and create opportunities that extend beyond
                traditional forms of international engagement.
              </ApproachItem>

            </div>

          </div>

        </div>

      </section>


      {/* ======================================================
          05 — OUR BELIEF
      ====================================================== */}

      <section className="about-belief">

        <div className="container about-belief__grid">

          <div className="about-belief__visual">

            <span className="about-number">
              05
            </span>

            <div className="belief-orbit">
              <Globe2
                size={130}
                strokeWidth={0.4}
              />
            </div>

            <strong>
              EDUCATION
            </strong>

            <strong>
              OPPORTUNITY
            </strong>

            <strong>
              PERSPECTIVE
            </strong>

          </div>


          <div className="about-belief__content">

            <span className="about-kicker about-kicker--gold">
              OUR BELIEF
            </span>

            <h2>
              Education should not end
              at the classroom door.
            </h2>

            <p>
              When students have access to different markets, cultures,
              institutions, mentors, investors, and ideas, they gain
              more than academic knowledge.
            </p>

            <div className="belief-statements">

              <div>
                <span>01</span>
                <strong>They gain perspective.</strong>
              </div>

              <div>
                <span>02</span>
                <strong>They gain networks.</strong>
              </div>

              <div>
                <span>03</span>
                <strong>
                  They gain the ability to see opportunities that may
                  not be visible from a single vantage point.
                </strong>
              </div>

            </div>

            <p>
              And, most importantly, they gain the opportunity to build
              something that can travel beyond borders.
            </p>

            <p className="about-belief__closing">
              Continental Founders™ exists to help make that possible.
            </p>

          </div>

        </div>

      </section>


      {/* ======================================================
          06 — WHAT WE BELIEVE
      ====================================================== */}

      <section className="about-principles">

        <div className="container">

          <div className="about-section-heading about-section-heading--center">

            <span className="about-kicker about-kicker--gold">
              WHAT WE BELIEVE
            </span>

            <span className="about-number">
              06
            </span>

            <h2>
              The standards we bring
              <br />
              to partnership.
            </h2>

            <p>
              The way a partnership is built matters as much as the
              outcome it seeks.
            </p>

          </div>


          <div className="principles-grid">

            {principles.map((principle) => (

              <article
                className="principle-card"
                key={principle.number}
              >

                <span className="principle-card__number">
                  {principle.number}
                </span>

                <ArrowUpRight
                  className="principle-card__arrow"
                  size={25}
                  strokeWidth={1.2}
                />

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
          07 — LEADERSHIP
      ====================================================== */}

      <section className="about-leadership">

        <div className="container">

          <div className="about-section-heading">

            <span className="about-kicker about-kicker--gold">
              LEADERSHIP
            </span>

            <span className="about-number">
              07
            </span>

            <h2>
              Experienced leaders helping
              <br />
              shape what comes next.
            </h2>

            <p>
              Our leadership team brings diverse experience across
              education, nonprofit leadership, operations, strategic
              relations, research, policy, entrepreneurship, and
              community development.
            </p>

          </div>


          <div className="leadership-grid">

            {team.map((member, index) => (

              <article
                className="leader-card"
                key={member.name}
              >

                <div className="leader-card__image">

                  <img
                    src={member.image}
                    alt={`${member.name} — ${member.role}`}
                    loading={index === 0 ? "eager" : "lazy"}
                  />

                  <div className="leader-card__number">
                    0{index + 1}
                  </div>

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

                  <button
                    type="button"
                    className="leader-card__link"
                  >
                    View full biography
                    <ArrowUpRight size={15} />
                  </button>

                </div>

              </article>

            ))}

          </div>


          <div className="leadership-closing">

            <div>
              <span className="about-kicker">
                LEADERSHIP PHILOSOPHY
              </span>

              <span className="about-number">
                07A
              </span>
            </div>

            <div>

              <h3>
                Different expertise.
                <br />
                One shared direction.
              </h3>

              <p>
                Continental Founders brings together leadership
                perspectives from education, nonprofit development,
                operations, strategic relations, research,
                entrepreneurship, and institutional partnership.
                This collective experience strengthens our ability
                to develop relationships grounded in credibility,
                reciprocity, and practical opportunity.
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* ======================================================
          08 — NETWORK / OPPORTUNITY / VISION
      ====================================================== */}

      <section className="about-three-columns">

        <div className="container">

          <div className="about-section-heading about-section-heading--center">

            <span className="about-kicker">
              THE BIGGER PICTURE
            </span>

            <span className="about-number">
              08
            </span>

            <h2>
              Connection is only
              <br />
              the beginning.
            </h2>

          </div>


          <div className="three-columns-grid">

            <ThreeColumnCard
              icon={<Users />}
              eyebrow="OUR NETWORK"
              title="Partnership extends beyond institutions."
              text="We are building a diverse ecosystem of universities, students, entrepreneurs, researchers, industry leaders, nonprofit organizations, government stakeholders, sponsors, and strategic partners."
              link="/network"
              linkText="Learn more about our network"
            />


            <ThreeColumnCard
              icon={<Lightbulb />}
              eyebrow="THE OPPORTUNITY"
              title="Moving from connection to meaningful collaboration."
              text="Through education, entrepreneurship, innovation, and leadership, we help relationships develop into programs, ventures, research initiatives, and practical opportunities."
              link="/our-model"
              linkText="Explore our approach"
            />


            <ThreeColumnCard
              icon={<Globe2 />}
              eyebrow="OUR VISION"
              title="A connected global ecosystem without borders."
              text="We envision a future where universities, entrepreneurs, investors, and institutions across Africa and America collaborate to develop globally minded founders, innovators, and leaders."
              link="/vision"
              linkText="Read our full vision"
            />

          </div>

        </div>

      </section>


      {/* ======================================================
          09 — OPPORTUNITY AREAS
      ====================================================== */}

      <section className="about-opportunity">

        <div className="container">

          <div className="about-section-heading">

            <span className="about-kicker about-kicker--gold">
              THE OPPORTUNITY
            </span>

            <span className="about-number">
              09
            </span>

            <h2>
              Moving from connection
              <br />
              to meaningful collaboration.
            </h2>

          </div>


          <div className="opportunity-grid">

            {opportunity.map((item) => (

              <article
                className="opportunity-card"
                key={item.number}
              >

                <div className="opportunity-card__top">

                  <span>
                    {item.number}
                  </span>

                  <div className="opportunity-card__icon">
                    {item.icon}
                  </div>

                </div>

                <h3>
                  {item.title}
                </h3>

                <p>
                  {item.text}
                </p>

                <Link to="/programs">
                  Explore
                  <ArrowUpRight size={15} />
                </Link>

              </article>

            ))}

          </div>

        </div>

      </section>


      {/* ======================================================
          10 — OUR VISION
      ====================================================== */}

      <section className="about-vision">

        <div className="about-vision__background">

          <Globe2
            size={600}
            strokeWidth={0.18}
          />

        </div>

        <div className="container about-vision__grid">

          <div className="about-vision__intro">

            <span className="about-kicker about-kicker--light">
              OUR VISION
            </span>

            <span className="about-number about-number--light">
              10
            </span>

          </div>


          <div className="about-vision__content">

            <h2>
              Building a connected global ecosystem
              where opportunity knows no borders.
            </h2>

            <p className="about-vision__lead">
              To build a connected global ecosystem where universities,
              entrepreneurs, investors, and institutions across Africa
              and America collaborate to develop the next generation
              of globally minded founders, innovators, and leaders.
            </p>

            <p>
              We envision a future where geographic borders do not limit
              access to knowledge, opportunity, capital, or meaningful
              business relationships—and where cross-continental
              collaboration becomes a catalyst for economic growth
              and shared prosperity.
            </p>

            <Link
              to="/vision"
              className="about-button about-button--gold"
            >
              Explore Our Vision
              <ArrowUpRight size={17} />
            </Link>

          </div>

        </div>

      </section>


      {/* ======================================================
          11 — FOUNDING PARTNERS
      ====================================================== */}

      <section className="about-founding">

        <div className="container about-founding__grid">

          <div className="about-founding__visual">

            <Globe2
              size={290}
              strokeWidth={0.3}
            />

            <span>
              AFRICA × AMERICA
            </span>

          </div>


          <div className="about-founding__content">

            <span className="about-kicker about-kicker--gold">
              FOUNDING PARTNERS
            </span>

            <span className="about-number">
              11
            </span>

            <h2>
              Help shape the future
              <br />
              from the ground up.
            </h2>

            <p>
              Continental Founders™ is intentionally engaging
              universities and strategic organizations during
              the development phase of the initiative.
            </p>

            <p>
              Rather than presenting a finished model, we are
              inviting institutions and leaders whose expertise,
              context, and vision can help shape the framework,
              student experience, partnership structure, and
              long-term direction of the initiative.
            </p>

            <Link
              to="/contact"
              className="about-button about-button--gold"
            >
              Become a Founding Partner
              <ArrowUpRight size={17} />
            </Link>

          </div>

        </div>

      </section>


      {/* ======================================================
          12 — FINAL CTA
      ====================================================== */}

      <section className="about-final-cta">

        <div className="container about-final-cta__inner">

          <div className="final-cta-icon">

            <Handshake
              size={48}
              strokeWidth={1}
            />

          </div>

          <span className="about-kicker about-kicker--gold">
            LET'S BUILD TOGETHER
          </span>

          <span className="about-number">
            12
          </span>

          <h2>
            Stronger together.
            <br />
            Better for both continents.
          </h2>

          <p>
            Whether you represent a university, organization,
            or community, we invite you to partner with us in
            building opportunity, creating impact, and preparing
            the next generation of leaders.
          </p>

          <Link
            to="/contact"
            className="about-button about-button--gold"
          >
            Connect With Our Team
            <ArrowUpRight size={17} />
          </Link>

        </div>

      </section>


      {/* ======================================================
          GLOBAL CTA
      ====================================================== */}

      <CTASection />

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

      <div className="approach-item__icon">
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
   THREE COLUMN CARD
============================================================ */

function ThreeColumnCard({
  icon,
  eyebrow,
  title,
  text,
  link,
  linkText,
}) {
  return (
    <article className="three-column-card">

      <div className="three-column-card__icon">
        {icon}
      </div>

      <span className="about-kicker">
        {eyebrow}
      </span>

      <h3>
        {title}
      </h3>

      <p>
        {text}
      </p>

      <Link to={link}>
        {linkText}
        <ArrowUpRight size={15} />
      </Link>

    </article>
  );
}