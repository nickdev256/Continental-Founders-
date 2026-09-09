import React from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Building2,
  GraduationCap,
  Lightbulb,
  Users,
} from "lucide-react";

import { Link } from "react-router-dom";

import SectionHeading from "../components/ui/SectionHeading";
import MediaSplit from "../components/sections/MediaSplit";
import CTASection from "../components/sections/CTASection";

import "./Universities.css";


/* ============================================================
   UNIVERSITY OUTCOMES
============================================================ */

const outcomes = [
  {
    number: "01",
    icon: BookOpen,
    title: "Research Relationships",
    text:
      "Connect faculty, researchers, founders, and academic communities around areas of shared research and commercial interest.",
  },

  {
    number: "02",
    icon: Users,
    title: "Faculty Engagement",
    text:
      "Create structured opportunities for professors and faculty members to contribute expertise, mentorship, research insight, and practical guidance.",
  },

  {
    number: "03",
    icon: GraduationCap,
    title: "Student Opportunity",
    text:
      "Create pathways for students to engage with founders, institutions, industries, ideas, and professional networks across markets.",
  },

  {
    number: "04",
    icon: Building2,
    title: "Institutional Learning",
    text:
      "Enable universities to develop stronger global relationships while learning from institutions, founders, industries, and markets.",
  },
];


/* ============================================================
   WAYS UNIVERSITIES CAN PARTICIPATE
============================================================ */

const participationAreas = [
  {
    number: "01",
    title: "Faculty Expertise",
    text:
      "Professors and specialists can contribute knowledge and practical insight to founders working through real venture challenges.",
  },

  {
    number: "02",
    title: "Research Collaboration",
    text:
      "Connect relevant research, academic resources, and institutional knowledge with emerging commercial opportunities.",
  },

  {
    number: "03",
    title: "Student Engagement",
    text:
      "Create opportunities for students to gain exposure to entrepreneurship, international collaboration, research, and real-world venture development.",
  },

  {
    number: "04",
    title: "Institutional Partnerships",
    text:
      "Build relationships between universities and aligned institutions across Africa, the United States, and the wider global ecosystem.",
  },
];


/* ============================================================
   PARTNER ECOSYSTEM
============================================================ */

const partnerEcosystem = [
  {
    number: "01",
    title: "U.S.–Africa Trade & Business Network",
    text:
      "Connect academic expertise with broader trade, market, business, and commercial networks.",
    path: "/partners/us-africa-trade-network",
  },

  {
    number: "02",
    title: "Corporate Partners",
    text:
      "Engage companies and industry leaders who can contribute expertise, mentorship, market insight, and commercial opportunity.",
    path: "/partners/corporate",
  },

  {
    number: "03",
    title: "Government & Development Institutions",
    text:
      "Connect institutional knowledge with organizations supporting economic development, entrepreneurship, and market access.",
    path: "/partners/government-development",
  },
];


/* ============================================================
   UNIVERSITIES PAGE
============================================================ */

export default function Universities() {
  return (
    <>
      {/* ======================================================
          HERO
      ====================================================== */}

      <section className="page-hero universities-hero">
        <div className="container page-hero__inner">
          <div className="universities-hero__content">
            <span className="eyebrow eyebrow--light">
              Universities
            </span>

            <h1>
              Connecting academic expertise with founders,
              markets, and opportunity.
            </h1>
          </div>

          <div className="page-hero__aside">
            <p>
              Continental Founders brings universities into a
              wider ecosystem where faculty expertise, research,
              students, founders, industry, and institutions can
              contribute to meaningful commercial collaboration.
            </p>

            <Link
              to="/contact"
              className="universities-hero__link"
            >
              Explore Partnership
              <ArrowUpRight
                size={17}
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>
      </section>


      {/* ======================================================
          INTRODUCTION
      ====================================================== */}

      <section className="section university-opening">
        <div className="container university-opening__grid">
          <div>
            <span className="eyebrow">
              For Universities
            </span>
          </div>

          <div>
            <h2 className="display">
              Academic knowledge becomes more powerful when it
              moves beyond the institution.
            </h2>

            <p>
              Universities hold extraordinary concentrations of
              knowledge, research, expertise, students, and
              professional networks. Continental Founders creates
              pathways for those resources to engage with founders
              and ventures working on real opportunities.
            </p>

            <p>
              The objective is not simply to create another
              institutional relationship. It is to identify where
              academic capability can contribute meaningful value,
              where universities can learn from emerging markets
              and entrepreneurs, and where collaboration can grow
              into lasting institutional engagement.
            </p>
          </div>
        </div>
      </section>


      {/* ======================================================
          MEDIA / PARTNERSHIP VALUE
      ====================================================== */}

      <MediaSplit
        eyebrow="What Partnership Can Unlock"
        title="A broader academic and commercial network."
        text={[
          "University partnerships can create access to research, faculty expertise, student perspectives, professional networks, emerging ventures, industries, and new markets.",
          "Continental Founders is focused on reciprocal relationships where universities contribute knowledge while gaining meaningful opportunities for learning, research, engagement, and global collaboration.",
        ]}
        image="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1500&q=85"
        imageAlt="Students walking across a university campus"
      />


      {/* ======================================================
          POTENTIAL OUTCOMES
      ====================================================== */}

      <section className="section section--light universities-outcomes">
        <div className="container">
          <SectionHeading
            eyebrow="Potential Outcomes"
            title="One relationship can create multiple pathways for collaboration."
            text="University engagement can begin with a focused opportunity and develop into deeper academic, research, student, and institutional relationships."
          />

          <div className="outcome-grid">
            {outcomes.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.title}
                  className="university-outcome-card"
                >
                  <div className="university-outcome-card__top">
                    <span>
                      {item.number}
                    </span>

                    <Icon
                      size={22}
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                  </div>

                  <h3>
                    {item.title}
                  </h3>

                  <p>
                    {item.text}
                  </p>

                  <ArrowUpRight
                    className="university-outcome-card__arrow"
                    size={18}
                    strokeWidth={1.6}
                    aria-hidden="true"
                  />
                </article>
              );
            })}
          </div>
        </div>
      </section>


      {/* ======================================================
          HOW UNIVERSITIES PARTICIPATE
      ====================================================== */}

      <section className="section universities-participation">
        <div className="container">
          <SectionHeading
            eyebrow="Ways To Participate"
            title="Universities can contribute far beyond traditional academic partnership."
            text="Continental Founders creates multiple points of engagement so institutions can participate where their expertise and priorities are most relevant."
          />

          <div className="universities-participation__grid">
            {participationAreas.map((item) => (
              <article
                key={item.title}
                className="universities-participation__item"
              >
                <span className="universities-participation__number">
                  {item.number}
                </span>

                <div>
                  <h3>
                    {item.title}
                  </h3>

                  <p>
                    {item.text}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>


      {/* ======================================================
          FELLOWSHIP CONNECTION
      ====================================================== */}

      <section className="universities-fellowship">
        <div className="container universities-fellowship__grid">
          <div className="universities-fellowship__label">
            <span className="eyebrow eyebrow--light">
              Founder Engagement
            </span>

            <Lightbulb
              size={34}
              strokeWidth={1.3}
              aria-hidden="true"
            />
          </div>

          <div className="universities-fellowship__content">
            <h2>
              Put academic expertise behind founders who are
              actively building.
            </h2>

            <p>
              Through the Continental Founders ecosystem,
              universities can engage founders as they develop,
              validate, execute, and strengthen their ventures.
              Faculty expertise and research can become part of a
              practical process focused on solving real problems
              and creating commercial evidence.
            </p>

            <div className="universities-fellowship__journey">
              <span>Potential</span>
              <ArrowRight size={15} />
              <span>Preparation</span>
              <ArrowRight size={15} />
              <span>Execution</span>
              <ArrowRight size={15} />
              <span>Evidence</span>
              <ArrowRight size={15} />
              <span>Opportunity</span>
            </div>

            <Link
              to="/our-model"
              className="universities-text-link"
            >
              Explore Our Model
              <ArrowUpRight
                size={17}
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>
      </section>


      {/* ======================================================
          PARTNER ECOSYSTEM
      ====================================================== */}

      <section className="section universities-ecosystem">
        <div className="container">
          <SectionHeading
            eyebrow="The Wider Ecosystem"
            title="Universities are one part of a connected partnership network."
            text="Continental Founders brings academic institutions together with trade networks, corporations, government, and development institutions around founders and commercial opportunity."
          />

          <div className="universities-ecosystem__grid">
            {partnerEcosystem.map((partner) => (
              <Link
                key={partner.path}
                to={partner.path}
                className="universities-ecosystem__card"
              >
                <span className="universities-ecosystem__number">
                  {partner.number}
                </span>

                <h3>
                  {partner.title}
                </h3>

                <p>
                  {partner.text}
                </p>

                <div className="universities-ecosystem__link">
                  Explore Partnership

                  <ArrowUpRight
                    size={17}
                    strokeWidth={1.6}
                    aria-hidden="true"
                  />
                </div>
              </Link>
            ))}
          </div>


          <div className="universities-ecosystem__all">
            <Link
              to="/strategic-partners"
              className="universities-text-link"
            >
              View All Partners
              <ArrowUpRight
                size={17}
                aria-hidden="true"
              />
            </Link>
          </div>
        </div>
      </section>


      {/* ======================================================
          FINAL CTA
      ====================================================== */}

      <CTASection
        eyebrow="For University Leaders"
        title="Explore what your institution could contribute."
        text="Share your institution, priority areas, expertise, geography, and the type of collaboration you are exploring. Continental Founders can help identify where your institution fits within the wider ecosystem."
      />
    </>
  );
}