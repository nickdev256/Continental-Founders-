import React from "react";
import { Link } from "react-router-dom";

import {
  ArrowUpRight,
  Globe2,
  Users,
  Lightbulb,
  Handshake,
  GraduationCap,
  Rocket,
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
    icon: (
      <GraduationCap
        size={26}
        strokeWidth={1.4}
      />
    ),
    text:
      "Creating opportunities for founders, students, educators, researchers, and institutions to exchange knowledge and develop meaningful cross-cultural learning experiences.",
  },
  {
    number: "02",
    title: "Entrepreneurship",
    icon: (
      <Rocket
        size={26}
        strokeWidth={1.4}
      />
    ),
    text:
      "Helping emerging entrepreneurs explore opportunities, develop practical ventures, validate business ideas, and strengthen their ability to execute.",
  },
  {
    number: "03",
    title: "Innovation",
    icon: (
      <Lightbulb
        size={26}
        strokeWidth={1.4}
      />
    ),
    text:
      "Encouraging collaboration around technology, research, creativity, market needs, and solutions to real-world challenges.",
  },
  {
    number: "04",
    title: "Leadership",
    icon: (
      <Users
        size={26}
        strokeWidth={1.4}
      />
    ),
    text:
      "Supporting globally minded leaders equipped to work across cultures, institutions, industries, disciplines, and markets.",
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

        <div className="container about-hero__inner">

          <div className="about-hero__content">

            <span className="about-kicker about-kicker--light">
              ABOUT CONTINENTAL FOUNDERS™
            </span>

            <h1>
              Building bridges.
              <br />
              Creating opportunity.
              <br />
              Across continents.
            </h1>

          </div>


          <div className="about-hero__aside">

            <div className="gold-rule" />

            <p>
              Continental Founders is a nonprofit initiative building
              strategic relationships between founders, universities,
              institutions, businesses, investors, leaders, and communities
              across Africa and the United States.
            </p>


            <div className="about-hero__actions">

              <Link
                to="/contact"
                className="about-button about-button--gold"
              >
                Connect With Us

                <ArrowUpRight
                  size={17}
                />
              </Link>


              <a
                href="#mission"
                className="about-button about-button--light"
              >
                Explore Our Story

                <ArrowUpRight
                  size={17}
                />
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
              Connecting founders,
              <br />
              institutions, and opportunity
              <br />
              across continents.
            </h2>


            <div className="about-purpose__copy">

              <p>
                Continental Founders connects founders, universities,
                entrepreneurs, professionals, businesses, and strategic
                institutions across Africa and the United States through
                entrepreneurship, innovation, leadership development,
                knowledge exchange, and commercial collaboration.
              </p>

              <p>
                Our mission is to create opportunities for participants to
                move beyond learning about entrepreneurship to actually
                building ventures—developing ideas into validated business
                concepts, strengthening their ability to execute, and creating
                the relationships, skills, and resources necessary to
                participate in the global economy.
              </p>

              <p>
                We work with universities, businesses, investors, government
                leaders, mentors, industry professionals, and strategic
                partners to create meaningful pathways between education,
                entrepreneurship, markets, investment, and economic
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
                alt="Founders, students, and leaders collaborating"
              />

            </div>

          </div>


          <div className="about-story__content">

            <h2>
              The next generation of founders
              should have access to the strengths
              of both Africa and America.
            </h2>

            <p>
              Continental Founders began with a simple observation:
              talent, ambition, knowledge, and ideas exist everywhere,
              but access to the right relationships, markets, expertise,
              research, capital pathways, and opportunity is not always
              equally distributed.
            </p>

            <p>
              Africa and the United States possess extraordinary and
              complementary strengths. Africa represents one of the
              world's most dynamic emerging markets and is home to a
              young generation of entrepreneurs, innovators, and future
              leaders.
            </p>

            <p>
              The United States offers extensive university, business,
              technology, investment, research, and entrepreneurial
              ecosystems.
            </p>

            <p>
              Yet too often, these ecosystems operate independently.
            </p>

            <p>
              Continental Founders was created to help bridge that divide.
            </p>

            <p>
              We are developing a model of cross-continental collaboration
              that moves beyond traditional exchange, networking, and
              classroom-based entrepreneurship.
            </p>

            <p>
              The goal is not simply to bring people across borders or
              place institutions in the same room.
            </p>

            <p className="about-story__emphasis">
              The goal is to bring founders, universities, businesses,
              expertise, markets, and opportunity networks together
              to build.
            </p>

            <p>
              Through cross-continental collaboration, founders and
              participants can explore real-world problems, develop
              solutions, validate opportunities, engage mentors and
              industry professionals, access research and expertise,
              and build relationships that extend beyond the classroom.
            </p>


            <div className="about-story__quote">

              <span className="about-kicker about-kicker--gold">
                OUR PHILOSOPHY
              </span>

              <blockquote>
                We don't teach founders to pitch.
                <br />
                We help them learn to build.
              </blockquote>

              <p>
                Because a compelling pitch is only the beginning.
              </p>

            </div>


            <p className="about-story__emphasis">
              Investors do not simply fund ideas. They back founders
              who can demonstrate the ability to execute.
            </p>

            <p>
              Continental Founders is therefore designed around what
              happens before and after the pitch: validating the
              opportunity, understanding the market, conducting due
              diligence, developing a viable business model, strengthening
              execution, building an investor-ready foundation, and
              developing the confidence and capability to move forward.
            </p>

            <p>
              We are intentionally building Continental Founders™ with
              university, corporate, institutional, and strategic partners
              rather than assuming that a single organization can design
              the future alone.
            </p>

            <p>
              Our founding-stage approach creates an opportunity for
              institutions across Africa and the United States to help
              shape the founder experience, partnership model,
              entrepreneurial framework, and long-term impact together.
            </p>

            <p className="about-story__closing">
              The result we are working toward is more than an exchange.
              It is a cross-continental ecosystem for developing founders,
              creating opportunity, strengthening institutions, supporting
              business growth, and connecting talent to the global economy.
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

          </div>


          <div className="about-approach__grid">

            <div className="about-approach__image">

              <img
                src="/assets/images/about-campus.jpg"
                alt="University and institutional environment"
              />

            </div>


            <div className="about-approach__content">

              <ApproachItem
                icon={<Users />}
                title="Bring the right people together"
              >
                Africa and the United States are home to extraordinary
                founders, universities, educators, researchers,
                entrepreneurs, investors, businesses, institutions,
                and communities. Yet the right people and organizations
                do not always have a clear pathway to one another.
              </ApproachItem>


              <ApproachItem
                icon={<Handshake />}
                title="Create meaningful pathways"
              >
                Continental Founders™ creates structured pathways through
                strategic relationship building, institutional partnerships,
                mentorship, entrepreneurship, innovation, convenings,
                market access, and programs designed around shared goals.
              </ApproachItem>


              <ApproachItem
                icon={<Globe2 />}
                title="Build reciprocally"
              >
                Our approach is intentionally reciprocal. African and
                American institutions, businesses, professionals, and
                founders can learn from one another, build together,
                and create opportunities that move beyond traditional
                forms of international engagement.
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
              KNOWLEDGE
            </strong>

            <strong>
              OPPORTUNITY
            </strong>

            <strong>
              ACCESS
            </strong>

          </div>


          <div className="about-belief__content">

            <span className="about-kicker about-kicker--gold">
              OUR BELIEF
            </span>

            <h2>
              Talent is everywhere.
              <br />
              Access is not.
            </h2>

            <p>
              Building a successful venture takes more than ambition.
              Founders need access to knowledge, markets, experienced
              professionals, research, mentorship, relationships,
              capital pathways, and opportunity.
            </p>


            <div className="belief-statements">

              <div>
                <span>
                  01
                </span>

                <strong>
                  Access expands perspective.
                </strong>
              </div>


              <div>
                <span>
                  02
                </span>

                <strong>
                  Relationships expand possibility.
                </strong>
              </div>


              <div>
                <span>
                  03
                </span>

                <strong>
                  Execution turns potential into evidence.
                </strong>
              </div>

            </div>


            <p>
              When founders are surrounded by the right expertise,
              relationships, markets, and resources, they are better
              positioned to move from potential to preparation,
              execution, evidence, and opportunity.
            </p>

            <p className="about-belief__closing">
              Continental Founders™ exists to help build that ecosystem.
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
              The way a partnership is built matters as much as
              the opportunity it seeks to create.
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
                    loading={
                      index === 0
                        ? "eager"
                        : "lazy"
                    }
                  />

                  <div className="leader-card__number">
                    {String(index + 1).padStart(2, "0")}
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

                    <ArrowUpRight
                      size={15}
                    />
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
          08 — ECOSYSTEM / OPPORTUNITY / VISION
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
              eyebrow="OUR ECOSYSTEM"
              title="Partnership extends beyond institutions."
              text="We are building a diverse ecosystem of founders, universities, researchers, industry leaders, investors, businesses, government institutions, sponsors, mentors, and strategic partners."
              link="/strategic-partners"
              linkText="Explore our partner ecosystem"
            />


            <ThreeColumnCard
              icon={<Lightbulb />}
              eyebrow="THE OPPORTUNITY"
              title="Moving from connection to meaningful collaboration."
              text="We create pathways for relationships to develop into founder support, research, mentorship, commercial opportunities, innovation, market relationships, and practical collaboration."
              link="/our-model"
              linkText="Explore our model"
            />


            <ThreeColumnCard
              icon={<Globe2 />}
              eyebrow="OUR VISION"
              title="A connected global ecosystem where opportunity can move."
              text="We envision universities, founders, investors, businesses, and institutions across Africa and the United States collaborating to build stronger ventures, relationships, and markets."
              link="/our-model"
              linkText="See how the model works"
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

                <Link to="/our-model">

                  Explore

                  <ArrowUpRight
                    size={15}
                  />

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
              Building a global ecosystem
              where opportunity is not limited
              by geography.
            </h2>

            <p className="about-vision__lead">
              We envision universities, founders, investors,
              companies, professionals, and institutions across
              Africa and the United States collaborating to develop
              stronger ventures, globally minded leaders, and
              meaningful commercial opportunity.
            </p>

            <p>
              Our vision is a future where geographic borders do not
              unnecessarily limit access to knowledge, relationships,
              markets, expertise, capital pathways, or opportunity—and
              where cross-continental collaboration can become a catalyst
              for stronger businesses, institutions, and economies.
            </p>


            <Link
              to="/our-model"
              className="about-button about-button--gold"
            >
              Explore Our Model

              <ArrowUpRight
                size={17}
              />
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
              AFRICA × UNITED STATES
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
              universities, businesses, professionals, and strategic
              institutions during the development of the initiative.
            </p>

            <p>
              Rather than assuming that one organization should shape
              the ecosystem alone, we are inviting institutions and
              leaders whose expertise, relationships, context, and
              perspective can help strengthen the partnership model,
              founder experience, commercial pathways, and long-term
              direction of Continental Founders.
            </p>


            <Link
              to="/contact"
              className="about-button about-button--gold"
            >
              Become a Founding Partner

              <ArrowUpRight
                size={17}
              />
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
            Stronger relationships.
            <br />
            Greater opportunity.
          </h2>

          <p>
            Whether you represent a university, company,
            investment network, public institution, foundation,
            professional community, or entrepreneurial ecosystem,
            there may be a meaningful role for you in what
            Continental Founders is building.
          </p>

          <Link
            to="/contact"
            className="about-button about-button--gold"
          >
            Connect With Our Team

            <ArrowUpRight
              size={17}
            />
          </Link>

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

        <ArrowUpRight
          size={15}
        />

      </Link>

    </article>
  );
}