import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import NetworkBackground from "../components/ui/NetworkBackground";

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
  Lightbulb,
  Rocket,
  Search,
  BriefcaseBusiness,
  Microscope,
  CalendarDays,
  MapPin,
  Download,
} from "lucide-react";

import "./Home.css";


// ============================================================
// API
// ============================================================

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";


// ============================================================
// HERO IMAGES
// ============================================================

const HERO_IMAGES = [
  {
    src:
      "/assets/images/hero-partnership.webp",

    alt:
      "Continental Founders cross-continental partnership and collaboration",
  },

  {
    src:
      "/assets/images/hero-community.webp",

    alt:
      "Continental Founders community of founders, institutions, and partners",
  },

  {
    src:
      "/assets/images/hero-education.webp",

    alt:
      "University collaboration and education through Continental Founders",
  },

  {
    src:
      "/assets/images/hero-innovation.webp",

    alt:
      "Entrepreneurship and innovation within the Continental Founders ecosystem",
  },

  {
    src:
      "/assets/images/hero-opportunity.webp",

    alt:
      "Global opportunities connecting Africa and the United States",
  },
];


// ============================================================
// EVENT HELPERS
// ============================================================

function getEventDateValue(
  event
) {
  return (
    event?.eventDate ||
    event?.event_date ||
    event?.startDate ||
    event?.start_date ||
    event?.date ||
    null
  );
}


function getEventImage(
  event
) {
  return (
    event?.imageUrl ||
    event?.image_url ||
    event?.image ||
    event?.coverImage ||
    event?.cover_image ||
    ""
  );
}


function getEventLocation(
  event
) {
  return (
    event?.location ||
    event?.venue ||
    event?.city ||
    ""
  );
}


function getEventType(
  event
) {
  return (
    event?.type ||
    event?.category ||
    "Conference & Events"
  );
}


function getEventSlug(
  event
) {
  if (
    typeof event?.slug !==
    "string"
  ) {
    return "";
  }

  return event.slug.trim();
}


function formatEventDate(
  event
) {
  const value =
    getEventDateValue(
      event
    );

  if (!value) {
    return null;
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  return {
    day:
      date.toLocaleDateString(
        "en-US",
        {
          day: "2-digit",
        }
      ),

    month:
      date
        .toLocaleDateString(
          "en-US",
          {
            month: "long",
          }
        )
        .toUpperCase(),

    year:
      String(
        date.getFullYear()
      ),

    full:
      date.toLocaleDateString(
        "en-US",
        {
          weekday:
            "long",

          month:
            "long",

          day:
            "numeric",

          year:
            "numeric",
        }
      ),
  };
}


// ============================================================
// HOME
// ============================================================

export default function Home() {
  const videoRef =
    useRef(null);

  const videoFrameRef =
    useRef(null);


  // ==========================================================
  // VIDEO STATE
  // ==========================================================

  const [
    isPlaying,
    setIsPlaying,
  ] =
    useState(false);

  const [
    isMuted,
    setIsMuted,
  ] =
    useState(false);

  const [
    volume,
    setVolume,
  ] =
    useState(1);

  const [
    previousVolume,
    setPreviousVolume,
  ] =
    useState(1);

  const [
    isFullscreen,
    setIsFullscreen,
  ] =
    useState(false);

  const [
    duration,
    setDuration,
  ] =
    useState(0);

  const [
    currentTime,
    setCurrentTime,
  ] =
    useState(0);


  // ==========================================================
  // HERO SLIDER STATE
  // ==========================================================

  const [
    currentHero,
    setCurrentHero,
  ] =
    useState(0);


  // ==========================================================
  // CMS EVENT STATE
  // ==========================================================

  const [
    featuredEvent,
    setFeaturedEvent,
  ] =
    useState(null);

  const [
    eventLoading,
    setEventLoading,
  ] =
    useState(true);

  const [
    eventError,
    setEventError,
  ] =
    useState("");


  // ==========================================================
  // HERO IMAGE SLIDER
  // ==========================================================

  useEffect(() => {
    const heroInterval =
      window.setInterval(
        () => {
          setCurrentHero(
            (previous) =>
              (previous + 1) %
              HERO_IMAGES.length
          );
        },
        5000
      );

    return () => {
      window.clearInterval(
        heroInterval
      );
    };
  }, []);


  // ==========================================================
  // LOAD HOMEPAGE EVENT FROM CMS
  // ==========================================================

  useEffect(() => {
    const controller =
      new AbortController();


    async function loadFeaturedEvent() {
      try {
        setEventLoading(
          true
        );

        setEventError(
          ""
        );


        const response =
          await fetch(
            `${API_URL}/api/events/published`,
            {
              method:
                "GET",

              headers: {
                Accept:
                  "application/json",
              },

              signal:
                controller.signal,
            }
          );


        const contentType =
          response.headers.get(
            "content-type"
          ) || "";


        if (
          !contentType.includes(
            "application/json"
          )
        ) {
          const text =
            await response.text();

          console.error(
            "Unexpected homepage events response:",
            text
          );

          throw new Error(
            "The events service returned an unexpected response."
          );
        }


        const result =
          await response.json();


        if (!response.ok) {
          throw new Error(
            result?.message ||
            result?.error ||
            "Unable to load events."
          );
        }


        const eventData =
          Array.isArray(
            result?.events
          )
            ? result.events
            : Array.isArray(
                result?.data
              )
              ? result.data
              : Array.isArray(
                  result?.data?.events
                )
                ? result.data.events
                : [];


        const eventsWithDates =
          eventData
            .map(
              (event) => {
                const value =
                  getEventDateValue(
                    event
                  );

                const timestamp =
                  value
                    ? new Date(
                        value
                      ).getTime()
                    : Number.NaN;

                return {
                  event,
                  timestamp,
                };
              }
            )
            .filter(
              ({
                timestamp,
              }) =>
                Number.isFinite(
                  timestamp
                )
            )
            .sort(
              (
                first,
                second
              ) =>
                first.timestamp -
                second.timestamp
            );


        const now =
          Date.now();


        const nextEvent =
          eventsWithDates.find(
            ({
              timestamp,
            }) =>
              timestamp >= now
          );


        /*
        --------------------------------------------------------
        IMPORTANT

        Homepage normally shows the nearest upcoming event.

        If there are published records but every event has
        already passed, we do NOT show an old conference as
        an upcoming event. The homepage instead displays the
        "new events coming soon" state.
        --------------------------------------------------------
        */

        setFeaturedEvent(
          nextEvent?.event ||
          null
        );
      } catch (error) {
        if (
          error?.name ===
          "AbortError"
        ) {
          return;
        }


        console.error(
          "Homepage event loading error:",
          error
        );


        setFeaturedEvent(
          null
        );


        setEventError(
          error?.message ||
          "Unable to load the upcoming event."
        );
      } finally {
        if (
          !controller.signal
            .aborted
        ) {
          setEventLoading(
            false
          );
        }
      }
    }


    loadFeaturedEvent();


    return () => {
      controller.abort();
    };
  }, []);


  // ==========================================================
  // VIDEO EVENTS
  // ==========================================================

  useEffect(() => {
    const video =
      videoRef.current;

    if (!video) {
      return undefined;
    }


    video.volume =
      1;

    video.muted =
      false;


    const handlePlay =
      () => {
        setIsPlaying(
          true
        );
      };


    const handlePause =
      () => {
        setIsPlaying(
          false
        );
      };


    const handleEnded =
      () => {
        setIsPlaying(
          false
        );
      };


    const handleTimeUpdate =
      () => {
        setCurrentTime(
          video.currentTime
        );
      };


    const handleLoadedMetadata =
      () => {
        setDuration(
          video.duration ||
          0
        );
      };


    const handleVolumeChange =
      () => {
        setVolume(
          video.volume
        );

        setIsMuted(
          video.muted ||
          video.volume === 0
        );

        if (
          !video.muted &&
          video.volume > 0
        ) {
          setPreviousVolume(
            video.volume
          );
        }
      };


    const handleFullscreen =
      () => {
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


  // ==========================================================
  // VIDEO PLAY / PAUSE
  // ==========================================================

  const toggleVideo =
    async () => {
      const video =
        videoRef.current;

      if (!video) {
        return;
      }

      try {
        if (
          video.paused
        ) {
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


  // ==========================================================
  // VIDEO MUTE
  // ==========================================================

  const toggleMute =
    () => {
      const video =
        videoRef.current;

      if (!video) {
        return;
      }


      if (
        video.muted ||
        video.volume === 0
      ) {
        const restored =
          previousVolume ||
          1;

        video.volume =
          restored;

        video.muted =
          false;

        setVolume(
          restored
        );

        setIsMuted(
          false
        );
      } else {
        setPreviousVolume(
          video.volume
        );

        video.muted =
          true;

        setIsMuted(
          true
        );
      }
    };


  // ==========================================================
  // VIDEO VOLUME
  // ==========================================================

  const changeVolume =
    (event) => {
      const value =
        Number(
          event.target.value
        );

      const safeValue =
        Math.min(
          1,
          Math.max(
            0,
            value
          )
        );

      const video =
        videoRef.current;

      if (!video) {
        return;
      }


      video.volume =
        safeValue;


      if (
        safeValue === 0
      ) {
        video.muted =
          true;

        setIsMuted(
          true
        );
      } else {
        video.muted =
          false;

        setIsMuted(
          false
        );

        setPreviousVolume(
          safeValue
        );
      }


      setVolume(
        safeValue
      );
    };


  // ==========================================================
  // VIDEO SEEK
  // ==========================================================

  const changeVideoTime =
    (event) => {
      const value =
        Number(
          event.target.value
        );

      const video =
        videoRef.current;

      if (!video) {
        return;
      }


      video.currentTime =
        value;

      setCurrentTime(
        value
      );
    };


  // ==========================================================
  // FULLSCREEN
  // ==========================================================

  const toggleFullscreen =
    async () => {
      const video =
        videoRef.current;

      const frame =
        videoFrameRef.current;

      if (!video) {
        return;
      }


      try {
        if (
          !document.fullscreenElement
        ) {
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


  // ==========================================================
  // FORMAT VIDEO TIME
  // ==========================================================

  const formatTime =
    (time) => {
      if (
        !Number.isFinite(
          time
        )
      ) {
        return "0:00";
      }


      const minutes =
        Math.floor(
          time / 60
        );


      const seconds =
        Math.floor(
          time % 60
        )
          .toString()
          .padStart(
            2,
            "0"
          );


      return `${minutes}:${seconds}`;
    };


  // ==========================================================
  // FEATURED EVENT VALUES
  // ==========================================================

  const featuredEventDate =
    formatEventDate(
      featuredEvent
    );

  const featuredEventImage =
    getEventImage(
      featuredEvent
    );

  const featuredEventLocation =
    getEventLocation(
      featuredEvent
    );

  const featuredEventType =
    getEventType(
      featuredEvent
    );

  const featuredEventSlug =
    getEventSlug(
      featuredEvent
    );

  const featuredEventPath =
    featuredEventSlug
      ? `/events/${encodeURIComponent(
          featuredEventSlug
        )}`
      : "/events";


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <main className="cf-home">

      {/* =====================================================
          01 — HERO
      ====================================================== */}

      <section
        className="cf-home-hero"
        aria-labelledby="home-main-heading"
      >

        <NetworkBackground />


        <div className="cf-container cf-home-hero__container">

          <div className="cf-home-hero__main">

            <div className="cf-home-hero__content">

              <div className="cf-section-marker">

                <strong>
                  A CROSS-CONTINENTAL INITIATIVE
                </strong>

              </div>


              <h1 id="home-main-heading">

                Bridging Africa
                <br />

                and America through
                <br />

                <span>
                  education,
                </span>

                <br />

                innovation, &{" "}

                <em>
                  opportunity.
                </em>

              </h1>


              <p className="cf-home-hero__lead">
                Continental Founders is a
                cross-continental nonprofit
                initiative connecting founders,
                universities, businesses,
                institutions, and opportunity
                networks across Africa and the
                United States through
                entrepreneurship, innovation,
                education, leadership development,
                and strategic collaboration.
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
                    aria-hidden="true"
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
                    aria-hidden="true"
                  />

                </Link>

              </div>

            </div>


            <div className="cf-home-hero__visual">

              <div className="cf-home-hero__slides">

                {HERO_IMAGES.map(
                  (
                    image,
                    index
                  ) => (
                    <img
                      key={
                        image.src
                      }
                      src={
                        image.src
                      }
                      alt={
                        index ===
                        currentHero
                          ? image.alt
                          : ""
                      }
                      aria-hidden={
                        index !==
                        currentHero
                      }
                      className={
                        index ===
                        currentHero
                          ? "cf-home-hero__slide cf-home-hero__slide--active"
                          : "cf-home-hero__slide"
                      }
                    />
                  )
                )}

              </div>


              <div
                className="cf-home-hero__overlay"
                aria-hidden="true"
              />


              <div className="cf-home-hero__visual-caption">

                <span>
                  AFRICA
                </span>

                <i aria-hidden="true" />

                <span>
                  UNITED STATES
                </span>

              </div>


              <div
                className="cf-home-hero__dots"
                aria-label="Hero images"
              >

                {HERO_IMAGES.map(
                  (
                    image,
                    index
                  ) => (
                    <button
                      key={
                        image.src
                      }
                      type="button"
                      className={
                        index ===
                        currentHero
                          ? "active"
                          : ""
                      }
                      onClick={() =>
                        setCurrentHero(
                          index
                        )
                      }
                      aria-label={`Show hero image ${index + 1}`}
                      aria-current={
                        index ===
                        currentHero
                          ? "true"
                          : undefined
                      }
                    />
                  )
                )}

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          QUICK HIGHLIGHTS
      ====================================================== */}

      <div className="cf-quick-bar">

        <div className="cf-container cf-quick-bar__grid">

          <QuickHighlight
            number="01"
            title="University Partnerships"
            text="Africa × United States"
          />

          <QuickHighlight
            number="02"
            title="Innovation & Entrepreneurship"
            text="Ideas into practical opportunities"
          />

          <QuickHighlight
            number="03"
            title="Leadership Development"
            text="Preparing the next generation"
          />

        </div>

      </div>


      {/* =====================================================
          02 — WHO WE ARE
      ====================================================== */}

      <section
        className="cf-section cf-section-white"
        aria-labelledby="who-we-are-heading"
      >

        <div className="cf-container">

          <div className="cf-section-header">

            <div>

              <span className="cf-eyebrow">
                WHO WE ARE
              </span>

              <h2 id="who-we-are-heading">
                Building strategic
                partnerships that create{" "}
                <em>
                  opportunity
                </em>{" "}
                in both directions.
              </h2>

            </div>

          </div>


          <div className="cf-who-grid">

            <div className="cf-who-visual">

              <img
                src="/assets/images/africa-america-map.webp"
                alt="Africa and the United States connected through Continental Founders partnerships"
                loading="lazy"
                decoding="async"
              />

            </div>


            <div className="cf-who-content">

              <p>
                Continental Founders brings
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

                <ArrowRight
                  size={17}
                  aria-hidden="true"
                />

              </Link>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          03 — WHAT WE DO
      ====================================================== */}

      <section
        className="cf-section cf-section-soft"
        aria-labelledby="what-we-do-heading"
      >

        <div className="cf-container">

          <div className="cf-section-header">

            <div>

              <span className="cf-eyebrow">
                WHAT WE DO
              </span>


              <h2 id="what-we-do-heading">
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

              <br />

            </div>

          </div>


          <div className="cf-program-grid">

            <ProgramCard
              number="01"
              title="University Partnerships"
              text="We work with universities to build meaningful institutional relationships between Africa and the United States."
            />

            <ProgramCard
              number="02"
              title="Innovation & Entrepreneurship"
              text="Students and partners explore opportunities, develop ideas, and transform practical challenges into entrepreneurial possibilities."
            />

            <ProgramCard
              number="03"
              title="Strategic Collaboration"
              text="Businesses, government, investors, and institutions contribute expertise, resources, networks, and opportunities."
            />

            <ProgramCard
              number="04"
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

              <ArrowRight
                size={17}
                aria-hidden="true"
              />

            </Link>

          </div>

        </div>

      </section>


      {/* =====================================================
          04 — VISION + VIDEO
      ====================================================== */}

      <section
        className="cf-vision-section"
        aria-labelledby="vision-heading"
      >

        <div className="cf-container cf-vision-grid">

          <div className="cf-vision-content">

            <div className="cf-section-marker cf-section-marker--light">

              <strong>
                OUR VISION
              </strong>

            </div>


            <h2 id="vision-heading">
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
              Continental Founders seeks to
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

              <ArrowRight
                size={17}
                aria-hidden="true"
              />

            </Link>

          </div>


          <div
            className="cf-video"
            ref={
              videoFrameRef
            }
          >

            <video
              ref={
                videoRef
              }
              playsInline
              preload="metadata"
              className="cf-video__player"
              aria-label="Continental Founders video"
            >

              <source
                src="/assets/eth tech.mp4"
                type="video/mp4"
              />

              Your browser does not
              support HTML5 video.

            </video>


            {!isPlaying && (
              <button
                type="button"
                className="cf-video__play"
                onClick={
                  toggleVideo
                }
                aria-label="Play Continental Founders video"
              >

                <Play
                  size={34}
                  fill="currentColor"
                  aria-hidden="true"
                />

              </button>
            )}


            <div className="cf-video__controls">

              <button
                type="button"
                onClick={
                  toggleVideo
                }
                aria-label={
                  isPlaying
                    ? "Pause video"
                    : "Play video"
                }
              >

                {isPlaying ? (
                  <Pause
                    size={17}
                    aria-hidden="true"
                  />
                ) : (
                  <Play
                    size={17}
                    fill="currentColor"
                    aria-hidden="true"
                  />
                )}

              </button>


              <button
                type="button"
                onClick={
                  toggleMute
                }
                aria-label={
                  isMuted
                    ? "Unmute video"
                    : "Mute video"
                }
              >

                {isMuted ? (
                  <VolumeX
                    size={18}
                    aria-hidden="true"
                  />
                ) : (
                  <Volume2
                    size={18}
                    aria-hidden="true"
                  />
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
                onChange={
                  changeVolume
                }
                aria-label="Video volume"
              />


              <input
                type="range"
                className="cf-video__progress"
                min="0"
                max={
                  duration || 0
                }
                step="0.01"
                value={
                  currentTime
                }
                onChange={
                  changeVideoTime
                }
                aria-label="Video progress"
              />


              <span>
                {formatTime(
                  currentTime
                )}

                {" / "}

                {formatTime(
                  duration
                )}
              </span>


              <button
                type="button"
                onClick={
                  toggleFullscreen
                }
                aria-label={
                  isFullscreen
                    ? "Exit fullscreen"
                    : "Enter fullscreen"
                }
              >

                {isFullscreen ? (
                  <Minimize
                    size={17}
                    aria-hidden="true"
                  />
                ) : (
                  <Maximize
                    size={17}
                    aria-hidden="true"
                  />
                )}

              </button>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          05 — OUR MODEL
      ====================================================== */}

      <section
        className="cf-section cf-section-white"
        aria-labelledby="our-model-heading"
      >

        <div className="cf-container">

          <div className="cf-section-header">

            <div>

              <span className="cf-eyebrow">
                OUR MODEL
              </span>


              <h2 id="our-model-heading">
                From shared purpose to{" "}
                <em>
                  practical collaboration.
                </em>
              </h2>

            </div>

          </div>

          <br />


          <div className="cf-model-grid">

            <ModelStep
              number="01"
              icon={
                <Users />
              }
              title="CONNECT"
              text="Universities and strategic partners connect around shared goals, expertise, and opportunity."
            />

            <ModelStep
              number="02"
              icon={
                <Search />
              }
              title="EXPLORE"
              text="Students and institutions explore challenges, ideas, markets, research, and opportunities."
            />

            <ModelStep
              number="03"
              icon={
                <Lightbulb />
              }
              title="BUILD"
              text="Teams develop practical ideas through entrepreneurship, innovation, mentorship, and collaboration."
            />

            <ModelStep
              number="04"
              icon={
                <Rocket />
              }
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

              <ArrowRight
                size={17}
                aria-hidden="true"
              />

            </Link>

          </div>

        </div>

      </section>


      {/* =====================================================
          06 — WHY IT MATTERS
      ====================================================== */}

      <section
        className="cf-section cf-section-soft"
        aria-labelledby="why-it-matters-heading"
      >

        <div className="cf-container">

          <div className="cf-section-header">

            <div>

              <span className="cf-eyebrow">
                WHY IT MATTERS
              </span>


              <h2 id="why-it-matters-heading">
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

          <br />


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


      {/* =====================================================
          07 — UNIVERSITY PARTNERSHIPS
      ====================================================== */}

      <section
        className="cf-partnership-section"
        aria-labelledby="university-partnership-heading"
      >

        <div className="cf-container cf-partnership-grid">

          <div className="cf-partnership-image">

            <img
              src="/assets/images/global-network-globe.webp"
              alt="Continental Founders global university partnership network"
              loading="lazy"
              decoding="async"
            />

          </div>


          <div className="cf-partnership-content">

            <div className="cf-section-marker">

              <strong>
                UNIVERSITY PARTNERSHIPS
              </strong>

            </div>


            <h2 id="university-partnership-heading">
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
              to="/universities"
              className="cf-button cf-button--gold"
            >

              <span>
                Explore University Partnerships
              </span>

              <ArrowRight
                size={17}
                aria-hidden="true"
              />

            </Link>

          </div>

        </div>

      </section>


      {/* =====================================================
          08 — ECOSYSTEM
      ====================================================== */}

      <section
        className="cf-section cf-section-white"
        aria-labelledby="ecosystem-heading"
      >

        <div className="cf-container">

          <div className="cf-section-header">

            <div>

              <span className="cf-eyebrow">
                OUR PARTNERSHIP ECOSYSTEM
              </span>


              <h2 id="ecosystem-heading">
                A global network of
                institutions working toward{" "}
                <em>
                  shared opportunity.
                </em>
              </h2>

            </div>

          </div>

          <br />


          <div className="cf-ecosystem-grid">

            <EcosystemCard
              icon={
                <GraduationCap />
              }
              title="Universities"
              text="Academic institutions across Africa and the United States."
            />

            <EcosystemCard
              icon={
                <Building2 />
              }
              title="Businesses"
              text="Corporate partners supporting innovation, mentorship, and growth."
            />

            <EcosystemCard
              icon={
                <Landmark />
              }
              title="Government"
              text="Public sector leaders supporting policy, collaboration, and opportunity."
            />

            <EcosystemCard
              icon={
                <TrendingUp />
              }
              title="Investors"
              text="Partners supporting promising ventures, entrepreneurs, and innovation."
            />

            <EcosystemCard
              icon={
                <BriefcaseBusiness />
              }
              title="Entrepreneurs"
              text="Founders and innovators developing solutions and building opportunity."
            />

            <EcosystemCard
              icon={
                <Microscope />
              }
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

              <ArrowRight
                size={17}
                aria-hidden="true"
              />

            </Link>

          </div>

        </div>

      </section>


      {/* =====================================================
          09 — STRATEGIC PARTNERS
      ====================================================== */}

      <section
        className="cf-strategic-section"
        aria-labelledby="strategic-partners-heading"
      >

        <div className="cf-container cf-strategic-grid">

          <div className="cf-strategic-content">

            <div className="cf-section-marker cf-section-marker--light">

              <strong>
                SPONSORS & STRATEGIC PARTNERS
              </strong>

            </div>


            <h2 id="strategic-partners-heading">
              Invest in a new generation
              of{" "}
              <em>
                cross-continental opportunity.
              </em>
            </h2>

            <br />


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

                <ArrowUpRight
                  size={17}
                  aria-hidden="true"
                />

              </Link>

            </div>

          </div>


          <div className="cf-strategic-visual">

            <img
              src="/assets/images/ecosystem-globe.webp"
              alt="Continental Founders partnership ecosystem"
              loading="lazy"
              decoding="async"
            />

          </div>

        </div>

      </section>


      {/* =====================================================
          10 — CONFERENCE & EVENTS — CMS POWERED
      ====================================================== */}

      <section
        className="cf-conference-section"
        aria-labelledby="conference-heading"
      >

        {eventLoading ? (

          <div className="cf-container cf-conference-grid">

            <div className="cf-conference-info">

              <div className="cf-section-marker">

                <strong>
                  CONFERENCE & EVENTS
                </strong>

              </div>


              <h2 id="conference-heading">
                Upcoming
                <br />

                <em>
                  programming.
                </em>
              </h2>


              <p>
                Loading the latest Continental
                Founders event.
              </p>

            </div>


            <div
              className="cf-conference-date"
              aria-hidden="true"
            >

              <CalendarDays
                size={42}
                strokeWidth={1.4}
              />

              <span>
                LOADING
              </span>

            </div>

          </div>

        ) : featuredEvent ? (

          <div className="cf-container cf-conference-grid">

            <div className="cf-conference-info">

              <div className="cf-section-marker">

                <strong>
                  {featuredEventType.toUpperCase()}
                </strong>

              </div>


              <h2 id="conference-heading">
                {featuredEvent.title}
              </h2>


              {featuredEventLocation && (

                <div className="cf-conference-location">

                  <MapPin
                    size={16}
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />

                  <span>
                    {featuredEventLocation}
                  </span>

                </div>

              )}


              {featuredEventDate && (

                <div className="cf-conference-location">

                  <CalendarDays
                    size={16}
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />

                  <span>
                    {featuredEventDate.full}
                  </span>

                </div>

              )}


              {featuredEvent.description && (

                <p>
                  {featuredEvent.description}
                </p>

              )}

              <br />


              <div className="cf-actions">

                <Link
                  to={
                    featuredEventPath
                  }
                  className="cf-button cf-button--gold"
                >

                  <span>
                    View Event Details
                  </span>

                  <ArrowUpRight
                    size={17}
                    aria-hidden="true"
                  />

                </Link>


                <Link
                  to="/events"
                  className="cf-text-link"
                >

                  <span>
                    All Events
                  </span>

                  <ArrowRight
                    size={17}
                    aria-hidden="true"
                  />

                </Link>

              </div>

            </div>


            <div className="cf-conference-feature">

              {featuredEventImage && (

                <Link
                  to={
                    featuredEventPath
                  }
                  className="cf-conference-feature__image"
                  aria-label={`View ${featuredEvent.title}`}
                >

                  <img
                    src={
                      featuredEventImage
                    }
                    alt={
                      featuredEvent.title
                    }
                    loading="lazy"
                    decoding="async"
                    onError={(
                      event
                    ) => {
                      event.currentTarget
                        .style
                        .display =
                        "none";
                    }}
                  />

                </Link>

              )}


              <div
                className="cf-conference-date"
                aria-label={
                  featuredEventDate?.full ||
                  "Event date to be announced"
                }
              >

                {featuredEventDate ? (
                  <>

                    <strong>
                      {featuredEventDate.day}
                    </strong>

                    <span>
                      {featuredEventDate.month}
                    </span>

                    <span>
                      {featuredEventDate.year}
                    </span>

                  </>
                ) : (
                  <>

                    <CalendarDays
                      size={38}
                      strokeWidth={1.4}
                      aria-hidden="true"
                    />

                    <span>
                      DATE
                    </span>

                    <span>
                      TBA
                    </span>

                  </>
                )}

              </div>

            </div>

          </div>

        ) : (

          <div className="cf-container cf-conference-grid">

            <div className="cf-conference-info">

              <div className="cf-section-marker">

                <strong>
                  CONFERENCE & EVENTS
                </strong>

              </div>


              <h2 id="conference-heading">
                New events
                <br />

                <em>
                  are coming.
                </em>
              </h2>


              <p>
                {eventError
                  ? "Our latest event information is temporarily unavailable. Visit the events page for current programming."
                  : "Upcoming Continental Founders conferences, forums, roundtables, and convenings will appear here when they are published."}
              </p>

              <br />


              <Link
                to="/events"
                className="cf-button cf-button--gold"
              >

                <span>
                  Explore Events
                </span>

                <ArrowUpRight
                  size={17}
                  aria-hidden="true"
                />

              </Link>

            </div>


            <div
              className="cf-conference-date"
              aria-label="New events coming soon"
            >

              <CalendarDays
                size={42}
                strokeWidth={1.4}
                aria-hidden="true"
              />

              <span>
                COMING
              </span>

              <span>
                SOON
              </span>

            </div>

          </div>

        )}

      </section>


      {/* =====================================================
          11 — NEWS & INSIGHTS
      ====================================================== */}

      <section
        className="cf-section cf-section-soft"
        aria-labelledby="news-heading"
      >

        <div className="cf-container">

          <div className="cf-section-header">

            <div>

              <span className="cf-eyebrow">
                NEWS & UPDATES
              </span>


              <h2 id="news-heading">
                Announcements,
                developments, and{" "}
                <em>
                  milestones.
                </em>
              </h2>

            </div>

          </div>

          <br />


          <div className="cf-news-grid">

            <Insight
              image="/assets/images/insights/university-partnerships.webp"
              category="ANNOUNCEMENT"
              date="MAY 21, 2026"
              title="Continental Founders™ Begins University Partnership Development"
              text="The initiative begins conversations with institutions interested in shaping a new model for Africa–United States collaboration."
            />

            <Insight
              image="/assets/images/insights/innovation-entrepreneurship.webp"
              category="INSIGHT"
              date="APRIL 26, 2026"
              title="Why Cross-Continental Collaboration Matters"
              text="Exploring the opportunities created when universities and institutions work together across continents."
            />

            <Insight
              image="/assets/images/insights/leadership-collaboration.webp"
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

              <ArrowRight
                size={17}
                aria-hidden="true"
              />

            </Link>

          </div>

        </div>

      </section>


      {/* =====================================================
          12 — EXPLORE CONTINENTAL FOUNDERS
      ====================================================== */}

      <section
        className="cf-section cf-section-white"
        aria-labelledby="explore-heading"
      >

        <div className="cf-container">

          <div className="cf-section-header">

            <div>

              <span className="cf-eyebrow">
                EXPLORE CONTINENTAL FOUNDERS
              </span>


              <h2 id="explore-heading">
                Discover our mission,
                model, ventures, partnerships,
                and{" "}
                <em>
                  opportunities.
                </em>
              </h2>


              <p className="cf-section-intro">
                Explore the major areas of
                Continental Founders and learn
                how founders, universities,
                businesses, institutions, and
                strategic partners can connect.
              </p>

            </div>

          </div>

          <br />


          <div className="cf-program-grid">

            <HomePageLink
              title="About Continental Founders"
              text="Learn about our mission, vision, leadership, principles, and the story behind Continental Founders."
              to="/about"
            />

            <HomePageLink
              title="Ventures & Founders"
              text="Discover ventures and entrepreneurs building practical and scalable solutions."
              to="/ventures"
            />

            <HomePageLink
              title="Our Model"
              text="Understand how Continental Founders connects people, institutions, markets, knowledge, and opportunity."
              to="/our-model"
            />

            <HomePageLink
              title="University Partnerships"
              text="Explore collaboration opportunities for universities, faculty, researchers, students, and academic institutions."
              to="/universities"
            />

            <HomePageLink
              title="Strategic Partners"
              text="Explore opportunities for businesses, sponsors, institutions, experts, and development partners."
              to="/strategic-partners"
            />

            <HomePageLink
              title="Programs"
              text="Explore programs connecting founders with mentorship, universities, expertise, networks, markets, and opportunity."
              to="/programs"
            />

            <HomePageLink
              title="Events"
              text="Discover Continental Founders conferences, events, forums, and convenings."
              to="/events"
            />

            <HomePageLink
              title="Insights"
              text="Read Continental Founders news, announcements, ideas, perspectives, and updates."
              to="/insights"
            />

          </div>


          <div className="cf-centered-link">

            <Link
              to="/contact"
              className="cf-text-link"
            >

              <span>
                Contact Continental Founders
              </span>

              <ArrowRight
                size={17}
                aria-hidden="true"
              />

            </Link>

          </div>

        </div>

      </section>


      {/* =====================================================
          13 — PARTNERSHIP MATERIALS
      ====================================================== */}

      <section
        className="cf-materials-section"
        aria-labelledby="partnership-materials-heading"
      >

        <div className="cf-container cf-materials-grid">

          <div>

            <span className="cf-eyebrow">
              PARTNERSHIP MATERIALS
            </span>


            <h2 id="partnership-materials-heading">
              Explore the opportunity
              to work with us.
            </h2>

          </div>


          <p>
            Access information about
            Continental Founders, our
            partnership approach, and
            opportunities for universities,
            sponsors, and strategic partners.
          </p>


          <a
            href="/assets/documents/continental-founders-partnership.pdf"
            className="cf-button cf-button--gold"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Download Continental Founders partnership materials PDF"
          >

            <span>
              Download Partnership Materials
            </span>

            <Download
              size={17}
              aria-hidden="true"
            />

          </a>

        </div>

      </section>

    </main>
  );
}


// ============================================================
// QUICK HIGHLIGHT
// ============================================================

function QuickHighlight({
  number,
  icon,
  title,
  text,
}) {
  return (
    <div className="cf-quick-item">

      {icon && (
        <div
          className="cf-quick-icon"
          aria-hidden="true"
        >
          {icon}
        </div>
      )}


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


// ============================================================
// PROGRAM CARD
// ============================================================

function ProgramCard({
  number,
  title,
  text,
}) {
  return (
    <article className="cf-program-card">

      <span className="cf-program-number">
        {number}
      </span>


      <h3 className="cf-program-title">
        {title}
      </h3>


      <p className="cf-program-text">
        {text}
      </p>

    </article>
  );
}


// ============================================================
// MODEL STEP
// ============================================================

function ModelStep({
  number,
  icon,
  title,
  text,
}) {
  return (
    <article className="cf-model-step">

      <div className="cf-model-step__top">

        <div
          className="cf-model-icon"
          aria-hidden="true"
        >
          {icon}
        </div>

        <span className="sr-only">
          Step {number}
        </span>

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


// ============================================================
// MATTER
// ============================================================

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


// ============================================================
// ECOSYSTEM CARD
// ============================================================

function EcosystemCard({
  icon,
  title,
  text,
}) {
  return (
    <article className="cf-ecosystem-card">

      <div
        className="cf-ecosystem-icon"
        aria-hidden="true"
      >
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


// ============================================================
// INSIGHT
// ============================================================

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
          decoding="async"
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
        aria-label={`Read more about ${title}`}
      >

        <span>
          Read More
        </span>

        <ArrowUpRight
          size={16}
          aria-hidden="true"
        />

      </Link>

    </article>
  );
}


// ============================================================
// HOMEPAGE INTERNAL LINK
// ============================================================

function HomePageLink({
  title,
  text,
  to,
}) {
  return (
    <article className="cf-program-card">

      <h3 className="cf-program-title">

        <Link to={to}>
          {title}
        </Link>

      </h3>


      <p className="cf-program-text">
        {text}
      </p>


      <Link
        to={to}
        className="cf-text-link"
        aria-label={`Learn more about ${title}`}
      >

        <span>
          Learn More
        </span>

        <ArrowRight
          size={17}
          aria-hidden="true"
        />

      </Link>

    </article>
  );
}