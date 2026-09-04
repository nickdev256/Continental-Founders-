import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import {
  ArrowRight,
  ArrowUpRight,
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
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  /*
  ============================================================
  VIDEO EVENTS
  ============================================================
  */

  useEffect(() => {
    const video = videoRef.current;

    if (!video) return;

    video.volume = 1;
    video.muted = false;

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration || 0);
    };

    const handleVolumeChange = () => {
      setVolume(video.volume);

      setIsMuted(
        video.muted ||
          video.volume === 0
      );

      if (
        !video.muted &&
        video.volume > 0
      ) {
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
      "timeupdate",
      handleTimeUpdate
    );

    video.addEventListener(
      "loadedmetadata",
      handleLoadedMetadata
    );

    video.addEventListener(
      "volumechange",
      handleVolumeChange
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
        "timeupdate",
        handleTimeUpdate
      );

      video.removeEventListener(
        "loadedmetadata",
        handleLoadedMetadata
      );

      video.removeEventListener(
        "volumechange",
        handleVolumeChange
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

  /*
  ============================================================
  VIDEO PLAY / PAUSE
  ============================================================
  */

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
      console.error(
        "Unable to control video:",
        error
      );
    }
  };

  /*
  ============================================================
  VIDEO MUTE
  ============================================================
  */

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

  /*
  ============================================================
  VIDEO VOLUME
  ============================================================
  */

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

  /*
  ============================================================
  VIDEO SEEK
  ============================================================
  */

  const changeVideoTime = (event) => {
    const value = Number(
      event.target.value
    );

    const video = videoRef.current;

    if (!video) return;

    video.currentTime = value;

    setCurrentTime(value);
  };

  /*
  ============================================================
  FULLSCREEN
  ============================================================
  */

  const toggleFullscreen = async () => {
    const video = videoRef.current;
    const frame = videoFrameRef.current;

    if (!video) return;

    try {
      if (!document.fullscreenElement) {
        if (
          frame &&
          frame.requestFullscreen
        ) {
          await frame.requestFullscreen();
          return;
        }

        if (
          video.webkitEnterFullscreen
        ) {
          video.webkitEnterFullscreen();
        }
      } else if (
        document.exitFullscreen
      ) {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error(
        "Fullscreen error:",
        error
      );
    }
  };

  /*
  ============================================================
  FORMAT VIDEO TIME
  ============================================================
  */

  const formatTime = (time) => {
    if (!Number.isFinite(time)) {
      return "0:00";
    }

    const minutes = Math.floor(
      time / 60
    );

    const seconds = Math.floor(
      time % 60
    )
      .toString()
      .padStart(2, "0");

    return `${minutes}:${seconds}`;
  };

  return (
    <main className="cf-home">

      {/* =========================================================
          01 — HERO
      ========================================================= */}

      <section className="cf-home-hero">

        <div className="cf-container cf-home-hero__container">

          <div className="cf-home-hero__main">

            {/* =================================================
                HERO CONTENT
            ================================================= */}

            <div className="cf-home-hero__content">

              <div className="cf-section-marker">

                <span>01</span>

                <i />

                <strong>
                  A CROSS-CONTINENTAL INITIATIVE
                </strong>

              </div>


              <h1>
                Connecting Africa
                <br />

                and America through
                <br />

                <span>education,</span>
                <br />

                entrepreneurship,
                <br />

                innovation, and{" "}

                <em>opportunity.</em>
              </h1>


              <p className="cf-home-hero__lead">
                Continental Founders is a newly
                established nonprofit building
                strategic partnerships between
                universities in Africa and the
                United States through
                entrepreneurship, innovation,
                leadership development, and
                meaningful collaboration.
              </p>


              <div className="cf-actions">

                <Link
                  to="/contact"
                  className="cf-button cf-button--gold"
                >
                  <span>
                    Schedule a Meeting
                  </span>

                  <CalendarDays
                    size={18}
                    strokeWidth={1.7}
                  />
                </Link>


                <Link
                  to="/our-model"
                  className="cf-button cf-button--outline-dark"
                >
                  <span>
                    Explore Our Model
                  </span>

                  <ArrowRight
                    size={18}
                    strokeWidth={1.7}
                  />
                </Link>

              </div>

            </div>


            {/* =================================================
                HERO IMAGE
            ================================================= */}

          


              <div className="cf-home-hero__visual-caption">

                <span>
                  AFRICA
                </span>

                <i />

                <span>
                  UNITED STATES
                </span>

              </div>

            </div>

          </div>

        

      </section>


      {/* =========================================================
          QUICK HIGHLIGHTS
      ========================================================= */}

      <div className="cf-quick-bar">

        <div className="cf-container cf-quick-bar__grid">

          <QuickHighlight
            number="01"
            icon={<GraduationCap />}
            title="University Partnerships"
            text="Africa × United States"
          />

          <QuickHighlight
            number="02"
            icon={<Lightbulb />}
            title="Innovation & Entrepreneurship"
            text="Ideas into practical opportunities"
          />

          <QuickHighlight
            number="03"
            icon={<Users />}
            title="Leadership Development"
            text="Preparing the next generation"
          />

        </div>

      </div>


      {/* =========================================================
          02 — WHO WE ARE
      ========================================================= */}

      <section className="cf-section cf-section-white">

        <div className="cf-container">

          <div className="cf-section-header">

            <SectionNumber number="02" />

            <div>

              <span className="cf-eyebrow">
                WHO WE ARE
              </span>

              <h2>
                Building strategic
                partnerships that create{" "}
                <em>opportunity</em> in both
                directions.
              </h2>

            </div>

          </div>


          <div className="cf-who-grid">

            <div className="cf-who-visual">

              <img
                src="/assets/images/africa-america-map.png"
                alt="Africa and America connected through partnership"
                loading="lazy"
              />

            </div>


            <div className="cf-who-content">

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


              <Link
                to="/about"
                className="cf-text-link"
              >
                <span>
                  Discover Our Story
                </span>

                <ArrowRight size={17} />
              </Link>

            </div>

          </div>

        </div>

      </section>


      {/* =========================================================
          03 — WHAT WE DO
      ========================================================= */}

      <section className="cf-section cf-section-soft">

        <div className="cf-container">

          <div className="cf-section-header">

            <SectionNumber number="03" />

            <div>

              <span className="cf-eyebrow">
                WHAT WE DO
              </span>

              <h2>
                Creating pathways for{" "}
                <em>
                  institutions, ideas,
                </em>{" "}
                and people to work across
                borders.
              </h2>

              <p className="cf-section-intro">
                We connect universities,
                entrepreneurs, businesses,
                investors, government leaders,
                and emerging leaders to create
                meaningful opportunities between
                Africa and the United States.
              </p>

            </div>

          </div>


          <div className="cf-program-grid">

            <ProgramCard
              number="01"
              icon={<GraduationCap />}
              title="University Partnerships"
              text="We work with universities to build meaningful institutional relationships between Africa and the United States."
            />

            <ProgramCard
              number="02"
              icon={<Lightbulb />}
              title="Innovation & Entrepreneurship"
              text="Students and partners explore opportunities, develop ideas, and transform practical challenges into entrepreneurial possibilities."
            />

            <ProgramCard
              number="03"
              icon={<Handshake />}
              title="Strategic Collaboration"
              text="Businesses, government, investors, and institutions contribute expertise, resources, networks, and opportunities."
            />

            <ProgramCard
              number="04"
              icon={<Globe2 />}
              title="Leadership Development"
              text="We help prepare emerging leaders with international exposure, collaboration experience, and practical leadership opportunities."
            />

          </div>


          <div className="cf-centered-link">

            <Link
              to="/programs"
              className="cf-text-link"
            >
              <span>
                Explore Our Programs
              </span>

              <ArrowRight size={17} />
            </Link>

          </div>

        </div>

      </section>


      {/* =========================================================
          04 — VISION + VIDEO
      ========================================================= */}

      <section className="cf-vision-section">

        <div className="cf-container cf-vision-grid">

          <div className="cf-vision-content">

            <div className="cf-section-marker cf-section-marker--light">

              <span>04</span>

              <i />

              <strong>
                OUR VISION
              </strong>

            </div>


            <h2>
              A stronger relationship
              between Africa and America.
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
              className="cf-vision-link"
            >
              <span>
                Learn More About Our Vision
              </span>

              <ArrowRight size={17} />
            </Link>

          </div>


          {/* VIDEO */}

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

              Your browser does not
              support HTML5 video.
            </video>


            {!isPlaying && (
              <button
                type="button"
                className="cf-video__play"
                onClick={toggleVideo}
                aria-label="Play video"
              >
                <Play
                  size={34}
                  fill="currentColor"
                />
              </button>
            )}


            <div className="cf-video__controls">

              <button
                type="button"
                onClick={toggleVideo}
                aria-label={
                  isPlaying
                    ? "Pause video"
                    : "Play video"
                }
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
                aria-label={
                  isMuted
                    ? "Unmute video"
                    : "Mute video"
                }
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
                aria-label="Volume"
              />


              <input
                type="range"
                className="cf-video__progress"
                min="0"
                max={duration || 0}
                step="0.01"
                value={currentTime}
                onChange={changeVideoTime}
                aria-label="Video progress"
              />


              <span>
                {formatTime(currentTime)}
                {" / "}
                {formatTime(duration)}
              </span>


              <button
                type="button"
                onClick={toggleFullscreen}
                aria-label="Fullscreen"
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


      {/* =========================================================
          05 — OUR MODEL
      ========================================================= */}

      <section className="cf-section cf-section-white">

        <div className="cf-container">

          <div className="cf-section-header">

            <SectionNumber number="05" />

            <div>

              <span className="cf-eyebrow">
                OUR MODEL
              </span>

              <h2>
                From shared purpose to{" "}
                <em>
                  practical collaboration.
                </em>
              </h2>

            </div>

          </div>


          <div className="cf-model-grid">

            <ModelStep
              number="01"
              icon={<Users />}
              title="CONNECT"
              text="Universities and strategic partners connect around shared goals, expertise, and opportunity."
            />

            <ModelStep
              number="02"
              icon={<Search />}
              title="EXPLORE"
              text="Students and institutions explore challenges, ideas, markets, research, and opportunities."
            />

            <ModelStep
              number="03"
              icon={<Lightbulb />}
              title="BUILD"
              text="Teams develop practical ideas through entrepreneurship, innovation, mentorship, and collaboration."
            />

            <ModelStep
              number="04"
              icon={<Rocket />}
              title="ADVANCE"
              text="Promising initiatives move forward through partnerships, resources, networks, and institutional support."
            />

          </div>


          <div className="cf-centered-link">

            <Link
              to="/our-model"
              className="cf-text-link"
            >
              <span>
                Understand Our Model
              </span>

              <ArrowRight size={17} />
            </Link>

          </div>

        </div>

      </section>


      {/* =========================================================
          06 — WHY IT MATTERS
      ========================================================= */}

      <section className="cf-section cf-section-soft">

        <div className="cf-container">

          <div className="cf-section-header">

            <SectionNumber number="06" />

            <div>

              <span className="cf-eyebrow">
                WHY IT MATTERS
              </span>

              <h2>
                Partnership should create{" "}
                <em>
                  lasting value.
                </em>
              </h2>

              <p className="cf-section-intro">
                Not simply another institutional
                connection.
              </p>

            </div>

          </div>


          <div className="cf-matters-grid">

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

        </div>

      </section>


      {/* =========================================================
          07 — UNIVERSITY PARTNERSHIPS
      ========================================================= */}

      <section className="cf-partnership-section">

        <div className="cf-container cf-partnership-grid">

          <div className="cf-partnership-image">

            <img
              src="/assets/images/global-network-globe.png"
              alt="Global university partnership network"
              loading="lazy"
            />

          </div>


          <div className="cf-partnership-content">

            <div className="cf-section-marker">

              <span>07</span>

              <i />

              <strong>
                UNIVERSITY PARTNERSHIPS
              </strong>

            </div>


            <h2>
              Help shape the initiative
              from the ground up.
            </h2>


            <p>
              Continental Founders™ is currently
              in its partnership development phase
              and is intentionally engaging
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


            <Link
              to="/university-partnerships"
              className="cf-button cf-button--gold"
            >
              <span>
                Become a University Partner
              </span>

              <ArrowRight size={17} />
            </Link>

          </div>

        </div>

      </section>


      {/* =========================================================
          08 — ECOSYSTEM
      ========================================================= */}

      <section className="cf-section cf-section-white">

        <div className="cf-container">

          <div className="cf-section-header">

            <SectionNumber number="08" />

            <div>

              <span className="cf-eyebrow">
                OUR PARTNERSHIP ECOSYSTEM
              </span>

              <h2>
                A global network of
                institutions working toward{" "}
                <em>
                  shared opportunity.
                </em>
              </h2>

            </div>

          </div>


          <div className="cf-ecosystem-grid">

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


          <div className="cf-centered-link">

            <Link
              to="/strategic-partners"
              className="cf-text-link"
            >
              <span>
                Explore Strategic Partnerships
              </span>

              <ArrowRight size={17} />
            </Link>

          </div>

        </div>

      </section>


      {/* =========================================================
          09 — STRATEGIC PARTNERS
      ========================================================= */}

      <section className="cf-strategic-section">

        <div className="cf-container cf-strategic-grid">

          <div className="cf-strategic-content">

            <div className="cf-section-marker cf-section-marker--light">

              <span>09</span>

              <i />

              <strong>
                SPONSORS & STRATEGIC PARTNERS
              </strong>

            </div>


            <h2>
              Invest in a new generation
              of{" "}
              <em>
                cross-continental opportunity.
              </em>
            </h2>


            <p>
              Continental Founders™ brings
              universities, businesses,
              government, investors, and
              innovation leaders together to
              create meaningful opportunities
              across Africa and the United States.
            </p>


            <p>
              Strategic partners can contribute
              expertise, funding, networks,
              mentorship, technology, research,
              and other resources that help
              strengthen the Continental Founders™
              ecosystem.
            </p>


            <div className="cf-actions">

              <Link
                to="/strategic-partners"
                className="cf-button cf-button--gold"
              >
                <span>
                  Become a Strategic Partner
                </span>

                <ArrowUpRight size={17} />
              </Link>


              <Link
                to="/strategic-partners"
                className="cf-vision-link"
              >
                <span>
                  Partnership Opportunities
                </span>

                <ArrowRight size={17} />
              </Link>

            </div>

          </div>


          <div className="cf-strategic-visual">

            <img
              src="/assets/images/ecosystem-globe.png"
              alt="Continental Founders partnership ecosystem"
              loading="lazy"
            />

          </div>

        </div>

      </section>


      {/* =========================================================
          10 — CONFERENCE
      ========================================================= */}

      <section className="cf-conference-section">

        <div className="cf-container cf-conference-grid">

          <div className="cf-conference-info">

            <div className="cf-section-marker">

              <span>10</span>

              <i />

              <strong>
                CONFERENCE & EVENTS
              </strong>

            </div>


            <h2>
              USA–AFRICA
              <br />
              <em>
                CONFERENCE
              </em>
            </h2>


            <span className="cf-conference-location">
              UNGA WEEK · NEW YORK CITY
            </span>


            <p>
              Join the conversation as
              Continental Founders™ introduces
              its vision for a new generation of
              cross-continental education,
              entrepreneurship, leadership,
              commerce, and innovation.
            </p>


            <Link
              to="/events"
              className="cf-button cf-button--gold"
            >
              <span>
                Event Information
              </span>

              <ArrowUpRight size={17} />
            </Link>

          </div>


          <div className="cf-conference-date">

            <strong>
              23
            </strong>

            <span>
              SEPTEMBER
            </span>

            <span>
              2026
            </span>

          </div>

        </div>

      </section>


      {/* =========================================================
          11 — NEWS
      ========================================================= */}

      <section className="cf-section cf-section-soft">

        <div className="cf-container">

          <div className="cf-section-header">

            <SectionNumber number="11" />

            <div>

              <span className="cf-eyebrow">
                NEWS & UPDATES
              </span>

              <h2>
                Announcements,
                developments, and{" "}
                <em>
                  milestones.
                </em>
              </h2>

            </div>

          </div>


          <div className="cf-news-grid">

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


          <div className="cf-centered-link">

            <Link
              to="/insights"
              className="cf-text-link"
            >
              <span>
                View All Insights
              </span>

              <ArrowRight size={17} />
            </Link>

          </div>

        </div>

      </section>


      {/* =========================================================
          PARTNERSHIP MATERIALS
      ========================================================= */}

      <section className="cf-materials-section">

        <div className="cf-container cf-materials-grid">

          <div>

            <span className="cf-eyebrow">
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
            <span>
              Download Partnership Materials
            </span>

            <Download size={17} />
          </a>

        </div>

      </section>


      {/* =========================================================
          12 — FINAL CTA
      ========================================================= */}

      <section className="cf-final-section">

        <div className="cf-container">

          <div className="cf-section-marker cf-section-marker--light">

            <span>12</span>

            <i />

            <strong>
              CONTINENTAL FOUNDERS™
            </strong>

          </div>


          <h2>
            Let's Build
            <br />
            <em>
              Together.
            </em>
          </h2>


          <p>
            Stronger institutions.
            <br />
            Greater opportunity.
            <br />
            One shared direction.
          </p>


          <div className="cf-actions">

            <Link
              to="/contact"
              className="cf-button cf-button--gold"
            >
              <span>
                Schedule a Meeting
              </span>

              <CalendarDays size={17} />
            </Link>


            <Link
              to="/contact"
              className="cf-button cf-button--outline-light"
            >
              <span>
                Contact Continental Founders™
              </span>

              <Mail size={17} />
            </Link>

          </div>

        </div>

      </section>

    </main>
  );
}


/* ============================================================
   QUICK HIGHLIGHT
============================================================ */

function QuickHighlight({
  number,
  icon,
  title,
  text,
}) {
  return (
    <div className="cf-quick-item">

      <div className="cf-quick-icon">
        {icon}
      </div>

      <span className="cf-quick-number">
        {number}
      </span>

      <div className="cf-quick-content">

        <strong>
          {title}
        </strong>

        <small>
          {text}
        </small>

      </div>

    </div>
  );
}


/* ============================================================
   SECTION NUMBER
============================================================ */

function SectionNumber({
  number,
}) {
  return (
    <div className="cf-section-number">

      <span>
        {number}
      </span>

      <i />

    </div>
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

      <div className="cf-card-top">

        <div className="cf-card-icon">
          {icon}
        </div>

        <span>
          {number}
        </span>

      </div>


      <h3>
        {title}
      </h3>


      <p>
        {text}
      </p>


      <span className="cf-card-arrow">
        <ArrowUpRight size={17} />
      </span>

    </article>
  );
}


/* ============================================================
   MODEL STEP
============================================================ */

function ModelStep({
  number,
  icon,
  title,
  text,
}) {
  return (
    <article className="cf-model-step">

      <div className="cf-model-step__top">

        <span>
          {number}
        </span>

        <div className="cf-model-icon">
          {icon}
        </div>

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
   MATTER
============================================================ */

function Matter({
  number,
  title,
  text,
}) {
  return (
    <article className="cf-matter">

      <span className="cf-matter-number">
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

      <div className="cf-ecosystem-icon">
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
   INSIGHT / NEWS CARD
============================================================ */

function Insight({
  image,
  category,
  date,
  title,
  text,
}) {
  return (
    <article className="cf-news-card">

      <div className="cf-news-image">

        <img
          src={image}
          alt={title}
          loading="lazy"
        />

      </div>


      <div className="cf-news-meta">

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
        className="cf-text-link"
      >
        <span>
          Read More
        </span>

        <ArrowUpRight size={16} />
      </Link>

    </article>
  );
}