import React from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  Globe2,
  Users,
  Lightbulb,
  Handshake,
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
    text:
      "Creating opportunities for students, educators, researchers, and institutions to exchange knowledge and develop cross-cultural learning experiences.",
  },
  {
    number: "02",
    title: "Entrepreneurship",
    text:
      "Helping students and emerging entrepreneurs explore ideas, identify opportunities, and develop practical ventures across markets.",
  },
  {
    number: "03",
    title: "Innovation",
    text:
      "Encouraging collaboration around technology, research, creativity, and solutions to real-world challenges.",
  },
  {
    number: "04",
    title: "Leadership",
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

        <div className="about-hero__line about-hero__line--left" />
        <div className="about-hero__line about-hero__line--right" />

        <div className="container about-hero__inner">

          <div className="about-hero__main">

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

          </div>

        </div>

      </section>


      {/* ======================================================
          02 — MISSION
      ====================================================== */}

      <section className="about-purpose about-mission">

        <div className="container about-purpose__grid">

          <div className="about-section-label">

            <div className="about-kicker">
              <span />
              Our mission
            </div>

            <div className="purpose-globe">
              <Globe2 size={92} strokeWidth={0.7} />
            </div>

            <span className="section-number">
              02
            </span>

          </div>


          <div className="about-purpose__content">

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

          <div className="about-story__label">

            <div className="about-kicker">
              <span />
              Our story
            </div>

            <span className="about-story__number">
              03
            </span>

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
             

            {/* PHILOSOPHY */}

            <div className="about-story__quote">

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

        <div className="container about-approach__grid">

          <div className="about-approach__content">

            <div className="about-kicker">
              <span />
              Our approach
            </div>

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


          <div className="about-approach__image">

            <img
              src="/assets/images/about-campus.jpg"
              alt="University campus representing international education and partnership"
            />

          </div>

        </div>

      </section>


      {/* ======================================================
          05 — OUR BELIEF
      ====================================================== */}

      <section className="about-belief">

        <div className="container about-belief__grid">

          <div className="about-belief__visual">

            <div className="about-belief__circle">
              <Globe2
                size={86}
                strokeWidth={0.7}
              />
            </div>

            <div className="about-belief__line" />

            <span>
              Education × Opportunity × Perspective
            </span>

          </div>


          <div className="about-belief__content">

            <div className="about-kicker about-kicker--gold">
              <span />
              Our belief
            </div>

            <h2>
              Education should not end
              at the classroom door.
            </h2>

            <p>
              When students have access to different markets, cultures,
              institutions, mentors, investors, and ideas, they gain
              more than academic knowledge.
            </p>

            <p className="about-belief__large">
              They gain perspective.
            </p>

            <p className="about-belief__large">
              They gain networks.
            </p>

            <p className="about-belief__large">
              They gain the ability to see opportunities that may not
              be visible from a single vantage point.
            </p>

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

          <div className="about-centered-heading">

            <div className="about-kicker about-kicker--gold">
              <span />
              What we believe
              <span />
            </div>

            <h2>
              The standards we bring to partnership.
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

                <div className="principle-card__top">

                  <div>

                    <span className="principle-number">
                      {principle.number}
                    </span>

                    <span className="principle-dash" />

                  </div>

                  <ArrowUpRight
                    size={28}
                    strokeWidth={1.2}
                  />

                </div>


                <div>

                  <h3>
                    {principle.title}
                  </h3>

                  <p>
                    {principle.text}
                  </p>

                </div>

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

          <div className="leadership-heading">

            <div className="about-kicker about-kicker--gold">
              <span />
              Leadership
            </div>

            <span className="section-number">
              07
            </span>

            <h2>
              Experienced leaders helping shape
              what comes next.
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

                  <div className="leader-card__arrow">

                    <ArrowUpRight
                      size={18}
                      strokeWidth={1.4}
                    />

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


          {/* LEADERSHIP PHILOSOPHY */}

          <div className="leadership-closing">

            <div className="about-kicker">
              <span />
              Leadership philosophy
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
          08 — OUR NETWORK / OPPORTUNITY / VISION
      ====================================================== */}

      <section className="about-three-columns">

        <div className="container three-columns-grid">


          {/* NETWORK */}

          <article className="three-column-card">

            <div className="three-column-card__icon">
              <Users
                size={22}
                strokeWidth={1.4}
              />
            </div>

            <div className="about-kicker">
              <span />
              Our network
            </div>

            <h3>
              Partnership extends
              beyond institutions.
            </h3>

            <p>
              We are building a diverse ecosystem of universities,
              students, entrepreneurs, researchers, industry leaders,
              nonprofit organizations, government stakeholders,
              sponsors, and strategic partners.
            </p>

            <Link to="/network">
              Learn more about our network
              <ArrowUpRight size={15} />
            </Link>

          </article>


          {/* OPPORTUNITY */}

          <article className="three-column-card">

            <div className="three-column-card__icon">
              <Lightbulb
                size={22}
                strokeWidth={1.4}
              />
            </div>

            <div className="about-kicker">
              <span />
              The opportunity
            </div>

            <h3>
              Moving from connection
              to meaningful collaboration.
            </h3>

            <p>
              Through education, entrepreneurship, innovation,
              and leadership, we help relationships develop into
              programs, ventures, research initiatives, and
              practical opportunities.
            </p>

            <Link to="/our-model">
              Explore our approach
              <ArrowUpRight size={15} />
            </Link>

          </article>


          {/* VISION */}

          <article className="three-column-card">

            <div className="three-column-card__icon">
              <Globe2
                size={22}
                strokeWidth={1.4}
              />
            </div>

            <div className="about-kicker">
              <span />
              Our vision
            </div>

            <h3>
              A connected global
              ecosystem without borders.
            </h3>

            <p>
              We envision a future where universities, entrepreneurs,
              investors, and institutions across Africa and America
              collaborate to develop globally minded founders,
              innovators, and leaders.
            </p>

            <Link to="/vision">
              Read our full vision
              <ArrowUpRight size={15} />
            </Link>

          </article>

        </div>

      </section>


      {/* ======================================================
          09 — OPPORTUNITY AREAS
      ====================================================== */}

      <section className="about-opportunity">

        <div className="container">

          <div className="opportunity-heading">

            <div>

              <div className="about-kicker about-kicker--gold">
                <span />
                The opportunity
              </div>

              <span className="section-number">
                09
              </span>

              <h2>
                Moving from connection
                <br />
                to meaningful collaboration.
              </h2>

            </div>

          </div>


          <div className="opportunity-grid">

            {opportunity.map((item) => (

              <article
                className="opportunity-card"
                key={item.number}
              >

                <span className="opportunity-number">
                  {item.number}
                </span>

                <h3>
                  {item.title}
                </h3>

                <p>
                  {item.text}
                </p>

              </article>

            ))}

          </div>

        </div>

      </section>


      {/* ======================================================
          10 — OUR VISION
      ====================================================== */}

      <section className="about-vision">

        <div className="about-vision__glow" />

        <div className="container about-vision__grid">

          <div>

            <div className="about-kicker about-kicker--light">
              <span />
              Our vision
            </div>

            <span className="about-vision__number">
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

          </div>

        </div>

      </section>


      {/* ======================================================
          11 — FOUNDING PARTNERS
      ====================================================== */}

      <section className="about-founding">

        <div className="container about-founding__grid">

          <div>

            <div className="about-kicker about-kicker--light">
              <span />
              Founding partners
            </div>

            <span className="section-number section-number--light">
              11
            </span>

            <h2>
              Help shape the future
              <br />
              from the ground up.
            </h2>

          </div>


          <div>

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
              className="gold-button"
            >
              Become a founding partner
              <ArrowUpRight size={16} />
            </Link>

          </div>


          <div className="founding-map">

            <Globe2
              size={210}
              strokeWidth={0.45}
            />

          </div>

        </div>

      </section>


      {/* ======================================================
          12 — FINAL CTA
      ====================================================== */}

      <section className="about-final-cta">

        <div className="container about-final-cta__grid">

          <div className="final-cta-icon">

            <Handshake
              size={42}
              strokeWidth={1}
            />

          </div>


          <div>

            <div className="about-kicker about-kicker--gold">
              <span />
              Let's build together
            </div>

            <h2>
              Stronger together.
              <br />
              Better for both continents.
            </h2>

          </div>


          <div>

            <p>
              Whether you represent a university, organization,
              or community, we invite you to partner with us in
              building opportunity, creating impact, and preparing
              the next generation of leaders.
            </p>

            <Link
              to="/contact"
              className="outline-button"
            >
              Connect with our team
              <ArrowUpRight size={16} />
            </Link>

          </div>

        </div>

      </section>


      {/* ======================================================
          GLOBAL CTA
      ====================================================== */}

      <CTASection />

    </main>
  );
}