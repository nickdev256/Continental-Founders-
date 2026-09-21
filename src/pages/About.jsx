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
    Linkedin,
  Instagram,
  Facebook,
  
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
============================================================ */

const team = [
 {
  name: "Amb. Dr. Karen L. Booker",
  role: "Chair",
  image: "/assets/team/karen-booker.jpg",
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
    image: "/assets/team/sharneise-allen.webp",
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
    image: "/assets/team/zaneta-brown-ingles.webp",
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
    image: "/assets/team/ashley-robinson-spann.webp",
    bio:
      "Ashley Robinson-Spann, PhD, is a researcher, writer, strategist, and nonprofit leader focused on education, human development, community capacity-building, and organizational strategy. She is the Founder and Executive Director of Still Rising Institute.",
    socials: {
      linkedin: "https://www.linkedin.com/in/arobinsonspann/",
      instagram: "",
      facebook: "",
    },
  },
];

/* ============================================================
   OPPORTUNITY AREAS
============================================================ */

const opportunity = [
  {
    number: "01",
    title: "Education",
    icon: "/assets/1.webp",
    text:
      "Connecting founders, students, educators, researchers, and institutions through knowledge exchange, mentorship, and cross-cultural learning.",
  },
  {
    number: "02",
    title: "Entrepreneurship",
   icon: "/assets/2.webp",
    text:
      "Helping founders validate ideas, develop practical ventures, strengthen execution, and build sustainable enterprises.",
  },
  {
    number: "03",
    title: "Innovation",
    icon: "/assets/3.webp",
    text:
      "Connecting technology, research, creativity, and market needs to develop solutions to real-world challenges.",
  },
  {
    number: "04",
    title: "Leadership",
    icon: "/assets/4.webp",
    text:
      "Developing globally minded founders and leaders prepared to work across cultures, institutions, industries, and markets.",
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

        <div
          className="about-hero__background"
          aria-hidden="true"
        >
          <img
            src="/assets/images/about-hero.jpg"
            alt=""
          />
        </div>

        <div
          className="about-hero__overlay"
          aria-hidden="true"
        />

        <div className="container about-hero__inner">

          <div className="about-hero__content">

            <div className="about-hero__eyebrow">
              <span className="about-hero__eyebrow-line" />
              <span>ABOUT CONTINENTAL FOUNDERS</span>
            </div>

            <h1>
              The Founder Is
              <br />
              the Infrastructure.
              <br />
              <span>Building across continents.</span>
            </h1>

            <p className="about-hero__lead">
              Strengthening founders and connecting African and diaspora
              talent, institutions, and global opportunity to build
              sustainable enterprises and lasting economic value.
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
                className="about-button about-button--glass"
              >
                Discover Our Story
                <ArrowUpRight size={17} />
              </a>

            </div>

          </div>

          <div className="about-hero__visual">

            <div className="about-hero__number">
             
            </div>

            

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
              OUR MISSION
            </div>

            <div className="purpose-globe">
              <img
                src="/assets/w.webp"
                alt="Continental collaboration"
              />
            </div>

            <span className="about-visual-label">
             
            </span>

          </div>


          <div className="about-purpose__content">

            <span className="about-kicker">
              OUR PURPOSE
            </span>

            <h2>
              Investing in the people
              <br />
              who build what comes next.
              <br />
              Across continents.
            </h2>

            <div className="about-purpose__copy">

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

        </div>

      </section>



      {/* ======================================================
          10 — OUR VISION
      ====================================================== */}

      <div className="section-line"></div>

      <section className="about-vision">




        <div className="container about-vision__grid">

          <div className="about-vision__intro">

            <span className="about-kicker about-kicker--light">
              OUR VISION
            </span>

       <div className="about-vision__background">
  <img
    src="/assets/u.webp"
    alt=""
  />
</div>
           

          </div>


          <div className="about-vision__content">

            <h2>
              A connected ecosystem where
              founders can build beyond
              geographic boundaries.
            </h2>
            <br />

            <p className="about-vision__lead">
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


            <Link
              to="/our-model"
              className="about-button about-button--gold"
            >
              Explore Our Model

              <ArrowUpRight size={17} />

            </Link>

          </div>

        </div>

      </section>


      {/* ======================================================
          03 — OUR STORY
      ====================================================== */}

      <section className="about-story">

        <div className="container about-story__grid">

          {/* LEFT STORY PANEL */}

          <aside className="about-story__aside">

            <div className="about-story__aside-inner">

              <div className="about-story__meta">

                <span className="about-kicker">
                  OUR STORY
                </span>

                <span className="about-story__number">
                  
                </span>
                

              </div>

              <div className="about-story__image">

                <img
                  src="/assets/oo.webp"
                  alt="Students and leaders collaborating"
                />

              </div>

              <div className="about-story__caption">
                
              </div>

            </div>

          </aside>


          {/* MAIN CONTENT */}

          <div className="about-story__content">

            <div className="about-story__header">

              <span className="about-story__eyebrow">
                THE BEGINNING
              </span>

              <h2>
                Talent is everywhere.
                <br />
                Access is not.
                <br />
                Founders should be able to build together.
              </h2>

            </div>


            <div className="about-story__body">
              
              

              {/* THE IDEA */}

              <div className="about-story__block">
             

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


              {/* TWO CONTINENTS */}

              <div className="about-story__block">

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


              {/* STATEMENT */}

              <div className="about-story__statement">

                <span>
                  WHY CONTINENTAL FOUNDERS
                </span>

                <h3>
                  We are building the bridge between African
                  innovation, diaspora capability, and global opportunity.
                </h3>

              </div>


              {/* NEW MODEL */}

              <div className="about-story__block">

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


              {/* PHILOSOPHY */}

              <div className="about-story__philosophy">

                <div className="about-story__philosophy-top">

                  <span className="about-kicker about-kicker--gold">
                    OUR PHILOSOPHY
                  </span>

                  <span className="about-story__philosophy-mark">
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


              {/* BUILDING BEYOND THE PITCH */}

              <div className="about-story__block">

                <span className="about-story__label">
                  BUILDING BEYOND THE PITCH
                </span>

                <p>
                  A compelling idea matters but founders also need
                  the ability to validate, execute, adapt, and grow.
                </p>

                <p>
                  Our focus extends beyond the pitch: understanding
                  markets, validating opportunities, developing viable
                  business models, strengthening execution, building
                  investor readiness, and developing the confidence
                  and capability to move forward.
                </p>

              </div>


              {/* BUILDING TOGETHER */}

              <div className="about-story__block">

                <span className="about-story__label">
                  BUILDING TOGETHER
                </span>

                <p>
                  Continental Founders is being built with university,
                  corporate, institutional, and strategic partners.
                  No single organization can build the future alone.
                </p>

                <p>
                  We invite partners across Africa and the United States
                  to help shape the founder experience, partnership model,
                  entrepreneurial framework, and long-term impact.
                </p>

              </div>


              {/* CLOSING */}

              <div className="about-story__closing">

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
              
            </span>

            <h2>
              We turn access
              <br />
              into an ecosystem.
            </h2>

          </div>


          <div className="about-approach__grid">

            <div className="about-approach__image">

              <img
                src="/assets/images/about-campus.webp"
                alt="University and institutional environment"
              />

            </div>


            <div className="about-approach__content">

              <ApproachItem
                
                title="Bring the right people together"
              >
                Across Africa and the diaspora are founders, universities,
                researchers, investors, businesses, and institutions.
                We help create clear pathways for the right people
                and organizations to connect.
              </ApproachItem>


              <ApproachItem
              
                
                title="Turn relationships into founder outcomes"
              >
                We create practical pathways through mentorship,
                institutional partnerships, entrepreneurship, innovation,
                market access, and programs designed around shared goals.
              </ApproachItem>


              <ApproachItem
                
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
          05 — OUR BELIEF
      ====================================================== */}

      <section className="about-belief">

        <div className="container about-belief__grid">

          <div className="about-belief__visual">

            <span className="about-number">
             
            </span>

           <div className="belief-orbit">
  <img
    src="/assets/qq.webp"
    alt="Our belief"
  />
</div>

           

          </div>


          <div className="about-belief__content">

            <span className="about-kicker about-kicker--gold">
              OUR BELIEF
            </span>

            <h2>
              The Founder Is
              <br />
              the Infrastructure.
            </h2>

            <p>
              Strong enterprises begin with people. Founders need
              knowledge, relationships, mentorship, research, markets,
              capital pathways, and the opportunity to put their
              capabilities into action.
            </p>


            <div className="belief-statements">

              <div>
                <span>01 </span>
                <strong>
                  Access expands perspective.
                </strong>
              </div>

              <div>
                <span>02 </span>
                <strong>
                  Relationships expand possibility.
                </strong>
              </div>

              <div>
                <span>03 </span>
                <strong>
                  Execution turns potential into evidence.
                </strong>
              </div>

            </div>
            <br />


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
          06 — WHAT WE BELIEVE
      ====================================================== */}

 <section className="about-principles">

  <div className="container">

    <div className="about-section-heading about-section-heading--center">

      <span className="about-kicker about-kicker--gold">
        WHAT WE BELIEVE
      </span>

      <h2>
        The principles that
        <br />
        guide our work.
      </h2>

      <p>
        Strong founder ecosystems depend on trust, reciprocity,
        intentionality, stewardship, and continuous learning.
      </p>

    </div>

    <br />

    <div className="principles-grid">

      {principles.map((principle) => (

        <article
          className="principle-card"
          key={principle.number}
        >

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

    <br />
    <br />
    <br />


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

            

           <a
  href={member.socials?.linkedin || "#"}
  target="_blank"
  rel="noopener noreferrer"
  className="leader-card__link"
  onClick={(e) => {
    if (!member.socials?.linkedin) {
      e.preventDefault();
    }
  }}
>
  View full biography
  <ArrowUpRight size={15} />
</a>





{/* social Media */}
<div className="leader-card__socials">

  {/* LINKEDIN */}
  {member.socials?.linkedin ? (
    <a
      href={member.socials.linkedin}
      target="_blank"
      rel="noopener noreferrer"
      className="leader-card__social"
      aria-label={`${member.name} on LinkedIn`}
      title="LinkedIn"
    >
      <img
        src="/assets/link.png"
        alt="LinkedIn"
        className="leader-card__social-icon"
      />
    </a>
  ) : (
    <span className="leader-card__social" title="LinkedIn">
      <img
        src="/assets/link.png"
        alt="LinkedIn"
        className="leader-card__social-icon"
      />
    </span>
  )}

  {/* INSTAGRAM */}
  {member.socials?.instagram ? (
    <a
      href={member.socials.instagram}
      target="_blank"
      rel="noopener noreferrer"
      className="leader-card__social"
      aria-label={`${member.name} on Instagram`}
      title="Instagram"
    >
      <img
        src="/assets/ig.png"
        alt="Instagram"
        className="leader-card__social-icon"
      />
    </a>
  ) : (
    <span className="leader-card__social" title="Instagram">
      <img
        src="/assets/ig.png"
        alt="Instagram"
        className="leader-card__social-icon"
      />
    </span>
  )}

  {/* FACEBOOK */}
  {member.socials?.facebook ? (
    <a
      href={member.socials.facebook}
      target="_blank"
      rel="noopener noreferrer"
      className="leader-card__social"
      aria-label={`${member.name} on Facebook`}
      title="Facebook"
    >
      <img
        src="/assets/fb.png"
        alt="Facebook"
        className="leader-card__social-icon"
      />
    </a>
  ) : (
    <span className="leader-card__social" title="Facebook">
      <img
        src="/assets/fb.png"
        alt="Facebook"
        className="leader-card__social-icon"
      />
    </span>
  )}

</div>






          </div>

        </article>

      ))}

    </div>

    <div className="leadership-closing">

      <div>

        <span className="about-kicker">
          LEADERSHIP PHILOSOPHY
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
          08 — THE BIGGER PICTURE
      ====================================================== */}

      <section className="about-three-columns">

        <div className="container">

          <div className="about-section-heading about-section-heading--center">

            <span className="about-kicker">
              THE BIGGER PICTURE
            </span>

           

            <h2>
              Connection is only
              <br />
              the beginning of building.
            </h2>

          </div>


          <br />


          <div className="three-columns-grid">

            <ThreeColumnCard
              icon={<Users />}
              eyebrow="OUR ECOSYSTEM"
              title="Partnership extends beyond institutions."
              text="We connect founders, universities, researchers, industry leaders, investors, businesses, public institutions, mentors, and strategic partners in a shared ecosystem."
              link="/strategic-partners"
              linkText="Explore our partner ecosystem"
            />


            <ThreeColumnCard
              icon={<Lightbulb />}
              eyebrow="THE OPPORTUNITY"
              title="Moving from connection to meaningful collaboration."
              text="We turn relationships into practical pathways for founder support, research, mentorship, innovation, market access, and commercial collaboration."
              link="/our-model"
              linkText="Explore our model"
            />


            <ThreeColumnCard
              icon={<Globe2 />}
              eyebrow="OUR VISION"
              title="A connected global ecosystem where opportunity can move."
              text="We envision African and diaspora founders and institutions collaborating to build stronger ventures, trusted relationships, and connected markets."
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

           

            <h2>
              From founder potential
              <br />
              to meaningful enterprise.
            </h2>

          </div>

          <br />


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
  <img src={item.icon} alt={item.title} />
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

                  <ArrowUpRight size={15} />

                </Link>

              </article>

            ))}

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

            

            <h2>
              Help build the ecosystem
              <br />
              founders need.
            </h2>
            <br />

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

          <div className="">

          

          </div>

          <span className="about-kicker about-kicker--gold">
            LET'S BUILD TOGETHER
          </span>

          

          <h2>
            Invest in founders.
            <br />
            Build what comes next.
          </h2>

          <br />

          <p>
            Mentor a founder. Open a door. Share your expertise.
            Fund an opportunity. Create a market connection.
            Whether you are a university, company, investor,
            institution, or founder, there is a place for you
            in the ecosystem we are building.
          </p> 
          <br />

          <Link
            to="/contact"
            className="about-button about-button--gold"
          >
            Build With Us

            <ArrowUpRight size={17} />

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

        <ArrowUpRight size={15} />

      </Link>

    </article>
  );
}