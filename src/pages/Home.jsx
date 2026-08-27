import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import {
  ArrowRight,
  ArrowUpRight,
  ArrowDown,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  GraduationCap,
  Building2,
  Landmark,
  TrendingUp,
  Users,
  Globe2,
  Lightbulb,
  Handshake,
  Rocket,
  Search,
  BriefcaseBusiness,
  Microscope,
  CalendarDays,
  Download,
  Mail,
} from "lucide-react";

import "./Home.css";

export default function Home() {
  const videoRef = useRef(null);
  const videoFrameRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [previousVolume, setPreviousVolume] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  /* ============================================================
     VIDEO EVENTS
  ============================================================ */

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    video.volume = 1;
    video.muted = false;

    const handlePlay = () => setIsPlaying(true);

    const handlePause = () => setIsPlaying(false);

    const handleEnded = () => setIsPlaying(false);

    const handleVolume = () => {
      setVolume(video.volume);

      setIsMuted(
        video.muted ||
        video.volume === 0
      );

      if (video.volume > 0) {
        setPreviousVolume(video.volume);
      }
    };

    const handleFullscreen = () => {
      setIsFullscreen(
        Boolean(
          document.fullscreenElement ||
          document.webkitFullscreenElement
        )
      );
    };

    video.addEventListener(
      "play",
      handlePlay
    );

    video.addEventListener(
      "pause",
      handlePause
    );

    video.addEventListener(
      "ended",
      handleEnded
    );

    video.addEventListener(
      "volumechange",
      handleVolume
    );

    document.addEventListener(
      "fullscreenchange",
      handleFullscreen
    );

    document.addEventListener(
      "webkitfullscreenchange",
      handleFullscreen
    );

    return () => {
      video.removeEventListener(
        "play",
        handlePlay
      );

      video.removeEventListener(
        "pause",
        handlePause
      );

      video.removeEventListener(
        "ended",
        handleEnded
      );

      video.removeEventListener(
        "volumechange",
        handleVolume
      );

      document.removeEventListener(
        "fullscreenchange",
        handleFullscreen
      );

      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreen
      );
    };
  }, []);


  /* ============================================================
     VIDEO PLAY / PAUSE
  ============================================================ */

  const toggleVideo = async () => {
    const video = videoRef.current;

    if (!video) return;

    try {
      if (video.paused) {
        await video.play();
      } else {
        video.pause();
      }
    } catch (error) {
      console.error(error);
    }
  };


  /* ============================================================
     VIDEO MUTE
  ============================================================ */

  const toggleMute = () => {
    const video = videoRef.current;

    if (!video) return;

    if (
      video.muted ||
      video.volume === 0
    ) {
      const restored =
        previousVolume || 1;

      video.volume = restored;
      video.muted = false;

      setVolume(restored);
      setIsMuted(false);
    } else {
      setPreviousVolume(
        video.volume
      );

      video.muted = true;

      setIsMuted(true);
    }
  };


  /* ============================================================
     VIDEO VOLUME
  ============================================================ */

  const changeVolume = (event) => {
    const value = Number(
      event.target.value
    );

    const safeValue = Math.min(
      1,
      Math.max(0, value)
    );

    const video = videoRef.current;

    if (!video) return;

    video.volume = safeValue;

    if (safeValue === 0) {
      video.muted = true;
      setIsMuted(true);
    } else {
      video.muted = false;
      setIsMuted(false);
      setPreviousVolume(
        safeValue
      );
    }

    setVolume(safeValue);
  };


  /* ============================================================
     VIDEO FULLSCREEN
  ============================================================ */

  const toggleFullscreen = async () => {
    const video = videoRef.current;
    const frame = videoFrameRef.current;

    if (!video) return;

    try {
      if (!document.fullscreenElement) {

        if (frame?.requestFullscreen) {
          await frame.requestFullscreen();
          return;
        }

        if (video.webkitEnterFullscreen) {
          video.webkitEnterFullscreen();
          return;
        }

      } else if (
        document.exitFullscreen
      ) {
        await document.exitFullscreen();
      }

    } catch (error) {
      console.error(error);
    }
  };


  return (
    <main className="cf-home">

      {/* ==========================================================
          01 — HERO
      ========================================================== */}

      <section
        className="
          cf-stack-section
          cf-stack-hero
        "
      >

        <div className="cf-hero">

          <div className="cf-hero__background" />

          <div className="cf-hero__overlay" />

          <div className="cf-container cf-hero__content">

            <div className="cf-hero__copy">

              <div className="cf-label cf-label--gold">

                <span />

                A Cross-Continental Initiative

              </div>

              <h1>

                Connecting Africa
                <br />

                and America through
                <br />

                education,
                <br />

                entrepreneurship,
                <br />

                innovation, and{" "}

                <span>
                  opportunity.
                </span>

              </h1>

              <p>
                Continental Founders™ is a
                newly established nonprofit
                building strategic partnerships
                between universities in Africa
                and the United States through
                entrepreneurship, innovation,
                leadership development, and
                meaningful collaboration.
              </p>

              <div className="cf-hero__buttons">

                <Link
                  to="/contact"
                  className="cf-button cf-button--gold"
                >
                  Schedule a Meeting
                  <CalendarDays size={16} />
                </Link>

                <Link
                  to="/our-model"
                  className="cf-button cf-button--outline"
                >
                  Explore Our Model
                  <ArrowUpRight size={16} />
                </Link>

              </div>

            </div>

          </div>


          {/* HERO BOTTOM */}

          <div className="cf-hero__bottom">

            <div className="cf-container cf-hero__bottom-grid">

              <div className="cf-hero-stat">

                <span>01</span>

                <div>

                  <strong>
                    University Partnerships
                  </strong>

                  <small>
                    Africa × United States
                  </small>

                </div>

              </div>


              <div className="cf-hero-stat">

                <span>02</span>

                <div>

                  <strong>
                    Innovation & Entrepreneurship
                  </strong>

                  <small>
                    Ideas into practical opportunities
                  </small>

                </div>

              </div>


              <div className="cf-hero-stat">

                <span>03</span>

                <div>

                  <strong>
                    Leadership Development
                  </strong>

                  <small>
                    Preparing the next generation
                  </small>

                </div>

              </div>

            </div>

          </div>


          <a
            href="#introduction"
            className="cf-hero__scroll"
            aria-label="Scroll to introduction"
          >
            <ArrowDown size={16} />
          </a>

        </div>

      </section>



      {/* ==========================================================
          02 — INTRODUCTION
      ========================================================== */}

      <section
        id="introduction"
        className="
          cf-stack-section
          cf-stack-introduction
        "
      >

        <div className="cf-introduction">

          <div className="cf-container cf-introduction__grid">


            <aside className="cf-introduction__aside">

              <div className="cf-section-index">

                <span>
                  01
                </span>

                <div className="cf-index-accent" />

              </div>


              <div className="cf-map">

                <img
                  src="/assets/images/africa-america-map.png"
                  alt="Africa and America connected through partnership"
                />

              </div>

            </aside>


            <div className="cf-introduction__content">

              <span className="cf-eyebrow">
                WHO WE ARE
              </span>

              <h2>
                Building strategic partnerships
                that create opportunity in both
                directions.
              </h2>


              <div className="cf-introduction__copy">

                <p>
                  Continental Founders™ brings
                  universities, students,
                  entrepreneurs, researchers,
                  businesses, government leaders,
                  investors, and other strategic
                  partners together across Africa
                  and the United States.
                </p>

                <p>
                  We are developing a collaborative
                  platform where institutions can
                  exchange knowledge, develop
                  entrepreneurial ideas, strengthen
                  leadership capacity, and create
                  practical pathways for meaningful
                  international collaboration.
                </p>

                <p>
                  At the heart of the initiative is
                  a simple principle: partnership
                  should create value for everyone
                  involved.
                </p>

              </div>


              <Link
                to="/about"
                className="cf-text-link"
              >

                <span>
                  Discover Our Story
                </span>

                <ArrowUpRight
                  size={17}
                  strokeWidth={1.6}
                />

              </Link>

            </div>

          </div>

        </div>

      </section>



      {/* ==========================================================
          03 — WHAT WE DO
      ========================================================== */}

      <section
        className="
          cf-stack-section
          cf-stack-program
        "
      >

        <div className="cf-program">

          <div className="cf-container">


            <div className="cf-program__intro">

              <div className="cf-program__index">

                <span>
                  02
                </span>

                <div className="cf-program__index-line">
                  <i />
                </div>

              </div>


              <div className="cf-program__intro-content">

                <span className="cf-eyebrow">
                  WHAT WE DO
                </span>

                <h2>
                  Creating pathways for
                  <em>
                    {" "}institutions, ideas,
                  </em>
                  {" "}and people to work
                  across borders.
                </h2>

                <p>
                  We connect universities,
                  entrepreneurs, businesses,
                  investors, government leaders,
                  and emerging leaders to create
                  meaningful opportunities between
                  Africa and the United States.
                </p>

              </div>

            </div>


            <div className="cf-program__cards">

              <ProgramCard
                number="01"
                icon={
                  <GraduationCap
                    size={30}
                    strokeWidth={1.5}
                  />
                }
                title="University Partnerships"
                text="We work with universities to build meaningful institutional relationships between Africa and the United States."
              />


              <ProgramCard
                number="02"
                icon={
                  <Lightbulb
                    size={30}
                    strokeWidth={1.5}
                  />
                }
                title="Innovation & Entrepreneurship"
                text="Students and partners explore opportunities, develop ideas, and transform practical challenges into entrepreneurial possibilities."
              />


              <ProgramCard
                number="03"
                icon={
                  <Handshake
                    size={30}
                    strokeWidth={1.5}
                  />
                }
                title="Strategic Collaboration"
                text="Businesses, government, investors, and institutions contribute expertise, resources, networks, and opportunities."
              />


              <ProgramCard
                number="04"
                icon={
                  <Globe2
                    size={30}
                    strokeWidth={1.5}
                  />
                }
                title="Leadership Development"
                text="We help prepare emerging leaders with international exposure, collaboration experience, and practical leadership opportunities."
              />

            </div>


            <div className="cf-program__footer">

              <Link
                to="/programs"
                className="cf-text-link"
              >

                <span>
                  Explore Our Programs
                </span>

                <ArrowUpRight
                  size={18}
                  strokeWidth={1.5}
                />

              </Link>

            </div>

          </div>

        </div>

      </section>



      {/* ==========================================================
          04 — VISION
      ========================================================== */}

      <section
        className="
          cf-stack-section
          cf-stack-vision
        "
      >

        <section className="cf-vision">

          <div className="cf-vision__content">

            <div className="cf-vision__copy">

              <div className="cf-label cf-label--gold">

                <span />

                Our Vision

              </div>

              <span className="cf-vision__number">
                03
              </span>

              <h2>

                A stronger
                <br />

                relationship between
                <br />

                Africa and America.

              </h2>

              <p>
                We envision a future where
                universities and institutions
                across both continents work
                together as equal partners to
                expand education, innovation,
                entrepreneurship, leadership,
                and opportunity.
              </p>

              <p>
                Continental Founders™ seeks to
                create relationships that move
                beyond traditional exchanges
                toward practical collaboration
                and long-term institutional
                impact.
              </p>

              <Link
                to="/about"
                className="cf-vision__link"
              >

                Learn More About Our Vision

                <ArrowUpRight size={15} />

              </Link>

            </div>


            <div
              className="cf-video"
              ref={videoFrameRef}
            >

              <video
                ref={videoRef}
                playsInline
                preload="metadata"
                className="cf-video__player"
              >

                <source
                  src="/assets/intro 1.mp4"
                  type="video/mp4"
                />

              </video>


              {!isPlaying && (

                <button
                  type="button"
                  className="cf-video__center-play"
                  onClick={toggleVideo}
                  aria-label="Play Continental Founders promotional video"
                >

                  <Play
                    size={29}
                    fill="currentColor"
                  />

                </button>

              )}


              <div className="cf-video__controls">

                <button
                  type="button"
                  onClick={toggleVideo}
                >

                  {isPlaying ? (
                    <Pause size={17} />
                  ) : (
                    <Play
                      size={17}
                      fill="currentColor"
                    />
                  )}

                </button>


                <button
                  type="button"
                  onClick={toggleMute}
                >

                  {isMuted ? (
                    <VolumeX size={18} />
                  ) : (
                    <Volume2 size={18} />
                  )}

                </button>


                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={
                    isMuted
                      ? 0
                      : volume
                  }
                  onChange={changeVolume}
                />


                <span className="cf-video__time">
                  0:00 / 1:38
                </span>


                <button
                  type="button"
                  onClick={toggleFullscreen}
                >

                  {isFullscreen ? (
                    <Minimize size={17} />
                  ) : (
                    <Maximize size={17} />
                  )}

                </button>

              </div>

            </div>

          </div>

        </section>

      </section>



      {/* ==========================================================
          05 — OUR MODEL
      ========================================================== */}

      <section
        className="
          cf-stack-section
          cf-stack-model
        "
      >

        <section className="cf-model">

          <div className="cf-container cf-model__grid">

            <div className="cf-model__intro">

              <span>
                04
              </span>

              <div className="cf-index-line">
                <i />
              </div>

              <h3>
                Our Model
              </h3>

              <p>
                From shared purpose
                <br />
                to practical
                <br />
                collaboration.
              </p>

            </div>


            <ModelStep
              icon={<Users size={24} />}
              title="CONNECT"
              text="Universities and strategic partners connect around shared goals, expertise, and opportunity."
            />


            <ModelStep
              icon={<Search size={24} />}
              title="EXPLORE"
              text="Students and institutions explore challenges, ideas, markets, research, and opportunities."
            />


            <ModelStep
              icon={<Lightbulb size={24} />}
              title="BUILD"
              text="Teams develop practical ideas through entrepreneurship, innovation, mentorship, and collaboration."
            />


            <ModelStep
              icon={<Rocket size={24} />}
              title="ADVANCE"
              text="Promising initiatives move forward through partnerships, resources, networks, and institutional support."
            />

          </div>


          <div className="cf-container cf-model__footer">

            <Link
              to="/our-model"
              className="cf-text-link cf-text-link--light"
            >

              Understand Our Model

              <ArrowUpRight size={15} />

            </Link>

          </div>

        </section>

      </section>



      {/* ==========================================================
          06 — WHY IT MATTERS
      ========================================================== */}

      <section
        className="
          cf-stack-section
          cf-stack-matters
        "
      >

        <section className="cf-matters">

          <div className="cf-container cf-matters__grid">

            <div className="cf-matters__intro">

              <span>
                05
              </span>

              <div className="cf-index-line">
                <i />
              </div>

              <h3>
                Why It Matters
              </h3>

              <p>
                Partnership should create
                lasting value, not simply
                another institutional connection.
              </p>

            </div>


            <Matter
              number="01"
              title="RECIPROCAL"
              text="African and American institutions bring knowledge, expertise, perspective, networks, and opportunity to one another."
            />


            <Matter
              number="02"
              title="PRACTICAL"
              text="The initiative focuses on practical collaboration, entrepreneurship, innovation, research, leadership, and measurable outcomes."
            />


            <Matter
              number="03"
              title="INCLUSIVE"
              text="Universities, businesses, government, investors, researchers, entrepreneurs, and students can each contribute to the ecosystem."
            />


            <Matter
              number="04"
              title="INSTITUTIONAL"
              text="The initiative is being developed around credible university and strategic partnerships designed for long-term institutional relationships."
            />

          </div>

        </section>

      </section>



      {/* ==========================================================
          07 — UNIVERSITY PARTNERSHIPS
      ========================================================== */}

      <section
        className="
          cf-stack-section
          cf-stack-founding
        "
      >

        <section className="cf-founding">

          <div className="cf-container cf-founding__grid">

            <div className="cf-founding__globe">

              <img
                src="/assets/images/global-network-globe.png"
                alt="Global network representing Continental Founders partnerships"
              />

            </div>


            <div className="cf-founding__content">

              <span>
                06
              </span>

              <div className="cf-index-line">
                <i />
              </div>

              <h3>
                University Partnerships
              </h3>

              <h2>
                Help shape the initiative
                <br />
                from the ground up.
              </h2>

            </div>


            <div className="cf-founding__copy">

              <p>
                Continental Founders™ is currently
                in its partnership development
                phase and is intentionally engaging
                universities interested in shaping
                the future of the initiative.
              </p>

              <p>
                Founding university partners will
                have an opportunity to contribute
                perspective, expertise, institutional
                context, and ideas as the academic
                framework and student experience
                continue to develop.
              </p>

            </div>


            <div className="cf-founding__action">

              <Link
                to="/university-partnerships"
                className="cf-button cf-button--gold"
              >

                Become a University Partner

                <ArrowUpRight size={15} />

              </Link>

            </div>

          </div>

        </section>

      </section>



      {/* ==========================================================
          08 — PARTNERSHIP ECOSYSTEM
      ========================================================== */}

      <section
        className="
          cf-stack-section
          cf-stack-ecosystem
        "
      >

        <section className="cf-ecosystem">

          <div className="cf-container cf-ecosystem__grid">

            <div className="cf-ecosystem__intro">

              <span>
                07
              </span>

              <div className="cf-index-line">
                <i />
              </div>

              <h3>
                Our Partnership
                <br />
                Ecosystem
              </h3>

              <p>
                A global network of institutions
                and organizations working toward
                shared opportunity.
              </p>

              <Link
                to="/strategic-partners"
                className="cf-text-link"
              >

                <span>
                  Explore Strategic Partnerships
                </span>

                <ArrowUpRight size={15} />

              </Link>

            </div>


            <EcosystemCard
              icon={<GraduationCap />}
              title="Universities"
              text="Academic institutions across Africa and the United States."
            />


            <EcosystemCard
              icon={<Building2 />}
              title="Businesses"
              text="Corporate partners supporting innovation, mentorship, and growth."
            />


            <EcosystemCard
              icon={<Landmark />}
              title="Government"
              text="Public sector leaders supporting policy, collaboration, and opportunity."
            />


            <EcosystemCard
              icon={<TrendingUp />}
              title="Investors"
              text="Partners supporting promising ventures, entrepreneurs, and innovation."
            />


            <EcosystemCard
              icon={<BriefcaseBusiness />}
              title="Entrepreneurs"
              text="Founders and innovators developing solutions and building opportunity."
            />


            <EcosystemCard
              icon={<Microscope />}
              title="Researchers"
              text="Experts contributing knowledge, research, ideas, and practical solutions."
            />

          </div>

        </section>

      </section>



      {/* ==========================================================
          09 — STRATEGIC PARTNERS
      ========================================================== */}

      <section
        className="
          cf-stack-section
          cf-stack-partners
        "
      >

        <section className="cf-partners">

          <div className="cf-container cf-partners__grid">


            <div className="cf-partners__visual">

              <div className="cf-partners__visual-frame">

                <img
                  src="/assets/images/ecosystem-globe.png"
                  alt="Continental Founders global partnership ecosystem"
                />

              </div>

            </div>


            <div className="cf-partners__content">

              <div className="cf-partners__number">

                <span>
                  08
                </span>

                <div className="cf-index-line">
                  <i />
                </div>

              </div>


              <div className="cf-eyebrow">
                SPONSORS &amp; STRATEGIC PARTNERS
              </div>


              <h2>

                Invest in a new
                generation of
                <span>
                  cross-continental
                  opportunity.
                </span>

              </h2>


              <p className="cf-partners__lead">

                Continental Founders™ brings
                universities, businesses,
                government, investors, and
                innovation leaders together to
                create meaningful opportunities
                across Africa and the United States.

              </p>


              <p className="cf-partners__description">

                Strategic partners can contribute
                expertise, funding, networks,
                mentorship, technology, research,
                and other resources that help
                strengthen the Continental Founders™
                ecosystem.

              </p>


              <div className="cf-partners__actions">

                <Link
                  to="/strategic-partners"
                  className="cf-button cf-button--gold"
                >

                  Become a Strategic Partner

                  <ArrowUpRight size={15} />

                </Link>


                <Link
                  to="/strategic-partners"
                  className="cf-text-link"
                >

                  Partnership Opportunities

                  <ArrowRight size={15} />

                </Link>

              </div>


              <div className="cf-partners__types">

                <span>
                  Expertise
                </span>

                <span>
                  Funding
                </span>

                <span>
                  Networks
                </span>

                <span>
                  Mentorship
                </span>

                <span>
                  Research
                </span>

              </div>

            </div>

          </div>

        </section>

      </section>



      {/* ==========================================================
          10 — CONFERENCE
      ========================================================== */}

      <section
        className="
          cf-stack-section
          cf-stack-conference
        "
      >

        <section className="cf-conference">

          <div className="cf-conference__globe">

            <Globe2
              size={320}
              strokeWidth={0.25}
            />

          </div>


          <div className="cf-container cf-conference__grid">

            <div className="cf-conference__label">

              <span>
                09
              </span>

              <div className="cf-index-line">
                <i />
              </div>

              <small>
                Conference & Events
              </small>

            </div>


            <div className="cf-conference__title">

              <h2>

                USA–AFRICA
                <br />
                CONFERENCE

              </h2>

              <p>
                UNGA WEEK · NEW YORK CITY
              </p>

              <span>

                Join the conversation as
                Continental Founders™ introduces
                its vision for a new generation of
                cross-continental education,
                entrepreneurship, leadership,
                commerce, and innovation.

              </span>

            </div>


            <div className="cf-conference__date">

              <strong>
                23
              </strong>

              <div>

                <span>
                  SEPTEMBER
                </span>

                <span>
                  2026
                </span>

              </div>


              <Link
                to="/events"
                className="cf-button cf-button--gold"
              >

                Event Information

                <ArrowUpRight size={15} />

              </Link>

            </div>

          </div>

        </section>

      </section>



      {/* ==========================================================
          11 — NEWS & UPDATES
      ========================================================== */}

      <section
        className="
          cf-stack-section
          cf-stack-insights
        "
      >

        <section className="cf-insights">

          <div className="cf-container cf-insights__grid">

            <div className="cf-insights__intro">

              <span>
                10
              </span>

              <div className="cf-index-line">
                <i />
              </div>

              <h3>
                News & Updates
              </h3>

              <p>
                Announcements,
                developments,
                partnerships,
                and milestones.
              </p>

              <Link
                to="/insights"
                className="cf-text-link"
              >

                View All Insights

                <ArrowUpRight size={15} />

              </Link>

            </div>


            <Insight
              image="/assets/images/university-partnerships.jpg"
              category="ANNOUNCEMENT"
              date="MAY 21, 2026"
              title="Continental Founders™ Begins University Partnership Development"
              text="The initiative begins conversations with institutions interested in shaping a new model for Africa–United States collaboration."
            />


            <Insight
              image="/assets/images/innovation-entrepreneurship.jpg"
              category="INSIGHT"
              date="APRIL 26, 2026"
              title="Why Cross-Continental Collaboration Matters"
              text="Exploring the opportunities created when universities and institutions work together across continents."
            />


            <Insight
              image="/assets/images/leadership-collaboration.jpg"
              category="PROGRAM UPDATE"
              date="APRIL 10, 2026"
              title="Building the Continental Founders™ Framework"
              text="Partner institutions and stakeholders contribute ideas toward the development of the initiative."
            />

          </div>

        </section>

      </section>



      {/* ==========================================================
          12 — MATERIALS
      ========================================================== */}

      <section
        className="
          cf-stack-section
          cf-stack-materials
        "
      >

        <section className="cf-materials">

          <div className="cf-container cf-materials__grid">

            <div>

              <span>
                PARTNERSHIP MATERIALS
              </span>

              <h2>
                Explore the opportunity
                to work with us.
              </h2>

            </div>


            <p>

              Access information about
              Continental Founders™, our
              partnership approach, and
              opportunities for universities,
              sponsors, and strategic partners.

            </p>


            <a
              href="/assets/documents/continental-founders-partnership.pdf"
              className="cf-button cf-button--gold"
              target="_blank"
              rel="noreferrer"
            >

              Download Partnership Materials

              <Download size={16} />

            </a>

          </div>

        </section>

      </section>



      {/* ==========================================================
          13 — FINAL CTA
      ========================================================== */}

      <section
        className="
          cf-stack-section
          cf-stack-final
        "
      >

        <section className="cf-final">

          <div className="cf-container">

            <span>
              11
            </span>

            <div className="cf-index-line">
              <i />
            </div>

            <h2>
              Let's Build Together
            </h2>

            <p>

              Stronger institutions.
              <br />

              Greater opportunity.
              <br />

              One shared direction.

            </p>


            <div className="cf-final__actions">

              <Link
                to="/contact"
                className="cf-button cf-button--gold"
              >

                Schedule a Meeting

                <CalendarDays size={16} />

              </Link>


              <Link
                to="/contact"
                className="cf-button cf-button--outline"
              >

                Contact Continental Founders™

                <Mail size={16} />

              </Link>

            </div>

          </div>

        </section>

      </section>

    </main>
  );
}



/* ============================================================
   PROGRAM CARD
============================================================ */

function ProgramCard({
  number,
  icon,
  title,
  text,
}) {
  return (
    <article className="cf-program-card">

      <div className="cf-program-card__icon">
        {icon}
      </div>

      <span className="cf-program-card__number">
        {number}
      </span>

      <h3>
        {title}
      </h3>

      <p>
        {text}
      </p>

    </article>
  );
}



/* ============================================================
   MODEL STEP
============================================================ */

function ModelStep({
  icon,
  title,
  text,
}) {
  return (
    <article className="cf-model-step">

      <div className="cf-model-step__icon">
        {icon}
      </div>

      <span className="cf-model-step__arrow">
        →
      </span>

      <h4>
        {title}
      </h4>

      <p>
        {text}
      </p>

    </article>
  );
}



/* ============================================================
   MATTER
============================================================ */

function Matter({
  number,
  title,
  text,
}) {
  return (
    <article className="cf-matter">

      <span>
        {number}
      </span>

      <h3>
        {title}
      </h3>

      <p>
        {text}
      </p>

    </article>
  );
}



/* ============================================================
   ECOSYSTEM CARD
============================================================ */

function EcosystemCard({
  icon,
  title,
  text,
}) {
  return (
    <article className="cf-ecosystem-card">

      <div className="cf-ecosystem-card__icon">
        {icon}
      </div>

      <h3>
        {title}
      </h3>

      <p>
        {text}
      </p>

    </article>
  );
}



/* ============================================================
   INSIGHT
============================================================ */

function Insight({
  image,
  category,
  date,
  title,
  text,
}) {
  return (
    <article className="cf-insight">

      <div className="cf-insight__image">

        <img
          src={image}
          alt={title}
          loading="lazy"
        />

      </div>


      <div className="cf-insight__meta">

        <span>
          {category}
        </span>

        <span>
          {date}
        </span>

      </div>


      <h3>
        {title}
      </h3>


      <p>
        {text}
      </p>


      <Link
        to="/insights"
        className="cf-insight__link"
      >

        Read More

        <ArrowUpRight size={14} />

      </Link>

    </article>
  );
}