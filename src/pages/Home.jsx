import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import NetworkBackground from "../components/ui/NetworkBackground";
import NewsAnnouncements from "../components/sections/NewsAnnouncements";

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
  (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");


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

  const hasUserInteractedRef =
    useRef(false);


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
      // If no API URL is configured, keep the homepage usable
      // without attempting a localhost request that will fail.
      if (!API_URL) {
        setFeaturedEvent(null);
        setEventError("");
        setEventLoading(false);
        return;
      }

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


        // Keep the homepage usable when the CMS/API is temporarily offline.
        if (import.meta.env.DEV) {
          console.warn(
            "Homepage events are temporarily unavailable:",
            error?.message || error
          );
        }


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

    video.defaultMuted =
      false;

    // Force the browser to load the current source.
    video.load();


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
  // AUTOPLAY WITH SOUND WHEN VISIBLE
  // ==========================================================

  useEffect(() => {
    const video =
      videoRef.current;

    const frame =
      videoFrameRef.current;

    if (
      !video ||
      !frame
    ) {
      return undefined;
    }


    // Browsers require a user gesture before autoplay with sound.
    const playWithSound =
      async () => {
        const restoredVolume =
          previousVolume > 0
            ? previousVolume
            : 1;

        video.muted =
          false;

        video.defaultMuted =
          false;

        video.volume =
          restoredVolume;

        setIsMuted(
          false
        );

        setVolume(
          restoredVolume
        );

        if (
          video.paused
        ) {
          await video.play();
        }
      };


    const registerInteraction =
      async () => {
        hasUserInteractedRef.current =
          true;

        window.removeEventListener(
          "pointerdown",
          registerInteraction
        );

        window.removeEventListener(
          "keydown",
          registerInteraction
        );

        window.removeEventListener(
          "touchstart",
          registerInteraction
        );

        const rectangle =
          frame.getBoundingClientRect();

        const visibleHeight =
          Math.max(
            0,
            Math.min(
              rectangle.bottom,
              window.innerHeight
            ) -
              Math.max(
                rectangle.top,
                0
              )
          );

        const visibleRatio =
          rectangle.height > 0
            ? visibleHeight /
              rectangle.height
            : 0;

        if (
          visibleRatio >= 0.5
        ) {
          try {
            await playWithSound();
          } catch (error) {
            if (
              import.meta.env.DEV
            ) {
              console.warn(
                "Playback with sound was prevented:",
                error
              );
            }
          }
        }
      };


    window.addEventListener(
      "pointerdown",
      registerInteraction,
      {
        passive: true,
      }
    );

    window.addEventListener(
      "keydown",
      registerInteraction
    );

    window.addEventListener(
      "touchstart",
      registerInteraction,
      {
        passive: true,
      }
    );


    const observer =
      new IntersectionObserver(
        async (
          entries
        ) => {
          const entry =
            entries[0];

          if (
            entry.isIntersecting &&
            entry.intersectionRatio >= 0.5
          ) {
            // Never start muted. Wait for a valid browser gesture.
            if (
              !hasUserInteractedRef.current
            ) {
              return;
            }

            try {
              await playWithSound();
            } catch (error) {
              if (
                import.meta.env.DEV
              ) {
                console.warn(
                  "Autoplay with sound was prevented:",
                  error
                );
              }
            }
          } else if (
            !video.paused
          ) {
            video.pause();
          }
        },
        {
          threshold: [
            0,
            0.5,
            1,
          ],
        }
      );


    observer.observe(
      frame
    );


    return () => {
      observer.disconnect();

      window.removeEventListener(
        "pointerdown",
        registerInteraction
      );

      window.removeEventListener(
        "keydown",
        registerInteraction
      );

      window.removeEventListener(
        "touchstart",
        registerInteraction
      );

      video.pause();
    };
  }, [previousVolume]);


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
                  CONTINENTAL FOUNDERS
                </strong>

              </div>


              <h1 id="home-main-heading">

                Empowering Global Founders.
                <br />

                Building a More Inclusive,{" "}

                <em>
                  Prosperous World.
                </em>

              </h1>


              <p className="cf-home-hero__lead">
                Continental Founders is a nonprofit organization building an interconnected ecosystem where founders, researchers, universities, corporations, investors, diaspora leaders, and global partners work together to transform entrepreneurial potential into sustainable economic impact.
              </p>


              <div className="cf-actions">

                <Link
                  to="/contact"
                  className="cf-button cf-button--gold"
                >

                  <span>
                    Partner With Us
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
                    Explore Our Ecosystem
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
          02 — VISION + VIDEO
      ====================================================== */}

      <section
        className="cf-vision-section" 
        aria-labelledby="vision-heading"
      >

        <div className="cf-container cf-vision-grid">

          <div className="cf-vision-content">

            <div className="cf-section-marker cf-section-marker--light">

              <strong>
                FROM POTENTIAL TO GLOBAL IMPACT
              </strong>

            </div>


            <h2 id="vision-heading">
              We Build Founders. We Connect Ecosystems. We Create Opportunity.
            </h2>


            <p>
              Continental Founders operates at the intersection of entrepreneurship, research, global markets, investment, and economic development.
            </p>


            <p>
              Our integrated ecosystem connects founder development, research and evidence, market access, corporate partnerships, and investment helping founders build stronger businesses, enter new markets, form institutional relationships, attract investment, and create measurable economic impact.
            </p>


            <Link
              to="/about"
              className="cf-vision-link"
            >

              <span>
                Explore Our Ecosystem
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
              onClick={toggleVideo}
              onLoadedData={() => {
                const video = videoRef.current;
                if (video) {
                  setDuration(video.duration || 0);
                }
              }}
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
    QUICK HIGHLIGHTS
====================================================== */}

<section className="cf-impact-highlights">
  <div className="cf-container">

    {/* =====================================================
        SECTION HEADER
    ====================================================== */}

    <header className="cf-impact-highlights__header">

      <span className="cf-impact-highlights__eyebrow">
        QUICK HIGHLIGHTS
      </span>

      <h2>
        Our Path to Global Impact
      </h2>

      <p>
        Connecting founder development, research, and market
        opportunity to build ventures prepared for lasting impact.
      </p>

    </header>


    {/* =====================================================
        HIGHLIGHTS
    ====================================================== */}

    <div className="cf-impact-highlights__grid">


      {/* =================================================
          01 — FOUNDER DEVELOPMENT

          Opens:
          Our Model
          /our-model
      ================================================== */}

      <article className="cf-impact-item">

        <span className="cf-impact-item__number">
          01
        </span>

        <h3>
          Founder Development
        </h3>

        <p>
          Equipping founders with the tools, networks, and support
          to develop, validate, and scale high-impact ventures.
        </p>

        <Link
          to="/our-model"
          className="cf-impact-item__link"
          aria-label="Explore the Continental Founders development model"
        >
          <span>Learn More</span>

          <ArrowRight
            size={17}
            aria-hidden="true"
          />
        </Link>

      </article>


      {/* =================================================
          02 — RESEARCH & EVIDENCE

          Opens:
          Universities
          /universities
      ================================================== */}

      <article className="cf-impact-item">

        <span className="cf-impact-item__number">
          02
        </span>

        <h3>
          Research &amp; Evidence
        </h3>

        <p>
          Generating evidence, insights, and practical solutions
          to inform stronger entrepreneurship ecosystems.
        </p>

        <Link
          to="/universities"
          className="cf-impact-item__link"
          aria-label="Explore Continental Founders university and research partnerships"
        >
          <span>Learn More</span>

          <ArrowRight
            size={17}
            aria-hidden="true"
          />
        </Link>

      </article>


      {/* =================================================
          03 — MARKET ACCESS

          Opens:
          U.S.–Africa Trade & Business Network
          /partners/us-africa-trade-network
      ================================================== */}

      <article className="cf-impact-item">

        <span className="cf-impact-item__number">
          03
        </span>

        <h3>
          Market Access
        </h3>

        <p>
          Creating connections, opening opportunities, and enabling
          global pathways for sustainable growth.
        </p>

        <Link
          to="/partners/us-africa-trade-network"
          className="cf-impact-item__link"
          aria-label="Explore the U.S.–Africa Trade and Business Network"
        >
          <span>Learn More</span>

          <ArrowRight
            size={17}
            aria-hidden="true"
          />
        </Link>

      </article>

    </div>

  </div>
</section>


      {/* =====================================================
          03 — THE CONTINENTAL FOUNDERS DIFFERENCE
      ====================================================== */}

      <section
        className="cf-section cf-section-white"
        aria-labelledby="who-we-are-heading"
      >

        <div className="cf-container">

          <div className="cf-section-header">

            <div>
              

              <br/>
              <br/>  

              <span className="cf-eyebrow">
                THE CONTINENTAL FOUNDERS DIFFERENCE
              </span>

              <br/>

              

              <h2 id="who-we-are-heading">
                Africa + Diaspora
                <br />
                <em>+ Global Ecosystem.</em>
              </h2>
              <br/>
              <br/>

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
                One of the defining elements of Continental Founders is the deliberate connection between African founders and founders across the global African diaspora.
              </p>

              <p>
                These relationships create opportunities for knowledge exchange, cross-cultural learning, capstone collaborations, mentorship, joint ventures, market discovery, and long-term business partnerships.
              </p>

              <p>
                We are developing globally minded founders who understand how to lead across cultures, markets, institutions, and borders.
              </p>


              <Link
                to="/about"
                className="cf-text-link"
              >

                <span>
                  Discover Our Difference
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
          04 — OUR FLAGSHIP PROGRAM
      ====================================================== */}

      <section
        className="cf-section cf-section-soft"
        aria-labelledby="what-we-do-heading"
      >

        <div className="cf-container">

          <div className="cf-section-header">

            <br/>
            <br/>
            <br/>

            <div>

              <span className="cf-eyebrow">
                OUR FLAGSHIP PROGRAM
              </span>


              <h2 id="what-we-do-heading">
                Continental Founders Catalytic Ventures — <em>CFCV.</em>
              </h2>


              <p className="cf-section-intro">
                Continental Founders Catalytic Ventures (CFCV) is our flagship founder-development program, designed for diaspora and continental founders with the potential to build scalable, investment-ready, globally connected ventures.
              </p>

              <br />
              <br/>

            </div>

          </div>


          <div className="cf-program-grid">

            <ProgramCard
              number="01"
              title="Founder Development"
              text="Build solutions that matter and respond to real needs."
            />

            <ProgramCard
              number="02"
              title="Research & Evidence"
              text="Create pathways that connect founders with people, resources, markets, and opportunity."
            />

            <ProgramCard
              number="03"
              title="HORIZON — Launch. Invest. Globalize."
              text="Qualified ventures move toward larger markets, strategic partnerships, investment opportunities, and international expansion."
            />

            <ProgramCard
              number="04"
              title="Market Access"
              text="Support founders whose work can strengthen communities, industries, and economies."
            />

          </div>


          <div className="cf-centered-link">

            <Link
              to="/programs"
              className="cf-text-link"
            >

              <span>
                Explore CFCV
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
          05 — OUR MODEL
      ====================================================== */}

      <section
        className="cf-section cf-section-white"
        aria-labelledby="our-model-heading"
      >

        <div className="cf-container">

          <div className="cf-section-header">

            <div>
              <br/>
              <br/>
              <br/>

              <span className="cf-eyebrow">
                OUR MODEL
              </span>


              <h2 id="our-model-heading">
                From potential to{" "}
                <em>
                  global impact.
                </em>
              </h2>
              <br/>

            </div>

          </div>

          <br />


          <div className="cf-model-grid">

            <ModelStep
              number="01"
              icon={
                <Users />
              }
              title="DEVELOP"
              text="Founder development builds stronger leadership, ventures, business models, and operating foundations."
            />

            <ModelStep
              number="02"
              icon={
                <Search />
              }
              title="VALIDATE"
              text="Research, evidence, customer learning, and market feedback help founders test assumptions and strengthen their ventures."
            />

            <ModelStep
              number="03"
              icon={
                <Lightbulb />
              }
              title="CONNECT"
              text="Founders connect with universities, corporations, diaspora networks, markets, institutions, and strategic partners."
            />

            <ModelStep
              number="04"
              icon={
                <Rocket />
              }
              title="SCALE"
              text="Investment readiness, market access, procurement, partnerships, and capital help qualified ventures move toward growth and international expansion."
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
          06 — RESEARCH THAT STRENGTHENS ENTREPRENEURSHIP
      ====================================================== */}

      <section
        className="cf-section cf-section-soft"
        aria-labelledby="why-it-matters-heading"
      >

        <div className="cf-container">

          <div className="cf-section-header">

            <br/>
            <br/>

            <div>

              <span className="cf-eyebrow">
                RESEARCH THAT STRENGTHENS ENTREPRENEURSHIP
              </span>


              <h2 id="why-it-matters-heading">
                Research that strengthens{" "}
                <em>
                  entrepreneurship.
                </em>
              </h2>


              <p className="cf-section-intro">
                CF Research Division Evidence. Insight. Impact.
              </p>
              <br/>

            </div>

          </div>

          <br />


          <div className="cf-matters-grid">

            <Matter
              number="01"
              title="GENERATE EVIDENCE"
              text="Postdoctoral fellows, university partners, researchers, and practitioners study entrepreneurship, knowledge transfer, founder development, diaspora engagement, and venture growth."
            />

            <Matter
              number="02"
              title="INFORM STRATEGY"
              text="Evidence helps identify barriers to growth, understand knowledge-transfer models, evaluate program outcomes, and continuously improve CFCV."
            />

            <Matter
              number="03"
              title="UNIVERSITY CONSORTIUM"
              text="Academic partners can contribute mentorship, research rigor, ethics and IRB support, joint research, publications, and multidisciplinary expertise."
            />

            <Matter
              number="04"
              title="DRIVE IMPACT"
              text="Experience becomes evidence, and evidence improves the founder experience, strengthening programs and future founder cohorts."
            />

          </div>

        </div>

      </section>

      <br/>
      <br/>


      {/* =====================================================
          07 — CF RESEARCH DIVISION
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
                CF RESEARCH DIVISION
              </strong>

            </div>


            <h2 id="university-partnership-heading">
              Evidence. Insight. Impact.
            </h2>


            <p>
              Continental Founders is building research directly into the founder-development ecosystem through the CF Research Division.
            </p>


            <p>
              Through our proposed university consortium, academic partners can contribute mentorship, research rigor, ethics and IRB support, joint research, publications, and access to multidisciplinary expertise.
            </p>


            <Link
              to="/universities"
              className="cf-button cf-button--gold"
            >

              <span>
                Explore Founder Development
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

            <br/>
            <br/>

            <div>

              <span className="cf-eyebrow">
                AN ECOSYSTEM BUILT FOR COLLABORATION
              </span>


              <h2 id="ecosystem-heading">
                An ecosystem built for{" "}
                <em>
                  collaboration.
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
              title="Universities & Researchers"
              text="Academic partners generate knowledge, evidence, mentorship, research rigor, and multidisciplinary expertise."
            />

            <EcosystemCard
              icon={
                <Building2 />
              }
              title="Corporations"
              text="Corporate partners provide expertise, markets, procurement opportunities, technology, pilots, and commercial pathways."
            />

            <EcosystemCard
              icon={
                <Landmark />
              }
              title="Government & Institutions"
              text="Government and institutional partners help create pathways to markets, relationships, and economic development."
            />

            <EcosystemCard
              icon={
                <TrendingUp />
              }
              title="Investors"
              text="Capital partners provide investment, validation, strategic guidance, due diligence, syndication, and growth pathways."
            />

            <EcosystemCard
              icon={
                <BriefcaseBusiness />
              }
              title="Founders"
              text="Founders build the future through scalable ventures, innovative solutions, employment, and economic opportunity."
            />

            <EcosystemCard
              icon={
                <Microscope />
              }
              title="Diaspora & Global Partners"
              text="Diaspora leaders and global partners bridge countries, cultures, expertise, networks, markets, and opportunity."
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

      <br/>
      <br/>


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
                CORPORATE PARTNERS
              </strong>

            </div>


            <h2 id="strategic-partners-heading">
              Expertise. Markets.{" "}
              <em>
                Opportunities.
              </em>
            </h2>

            <br />


            <p>
              Corporations play an important role in transforming founder development into commercial opportunity. Continental Founders seeks relationships with corporations that can contribute more than sponsorship.
            </p>


            <p>
              Corporate partners can contribute industry expertise, procurement and supplier development, customer and distribution opportunities, innovation challenges, pilot programs, partnerships, technology and infrastructure, and executive mentorship.
            </p>


            <div className="cf-actions">

              <Link
                to="/strategic-partners"
                className="cf-button cf-button--gold"
              >

                <span>
                  Become a Corporate Partner
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

{/* ============================================================
    11 — NEWS & ANNOUNCEMENTS — CMS CONTENT
============================================================ */}

<NewsAnnouncements />


      {/* =====================================================
          12 — THE CONTINENTAL FOUNDERS FLYWHEEL
      ====================================================== */}

      <section
        className="cf-section cf-section-white"
        aria-labelledby="explore-heading"
      >

        <div className="cf-container">

          <div className="cf-section-header">
            <br/>
            <br/>
            <br/>

            <div>

              <span className="cf-eyebrow">
                THE CONTINENTAL FOUNDERS FLYWHEEL
              </span>


              <h2 id="explore-heading">
                Research. Develop. Connect.
                Invest. Measure.{" "}
                <em>
                  Improve.
                </em>
              </h2>


              <p className="cf-section-intro">
                Our ecosystem is intentionally circular: research strengthens founder development, founder development produces stronger ventures, real-world outcomes generate new evidence, and that evidence returns to improve future programs and founder cohorts.
              </p>

            </div>

          </div>

          <br />
          <br/>


          <div className="cf-program-grid">

            <HomePageLink
              title="Founder Development"
              text="Develop globally ready leaders and stronger ventures through structured founder development."
              to="/about"
            />

            <HomePageLink
              title="Research & Evidence"
              text="Generate evidence that informs strategy, improves programs, and strengthens the founder experience."
              to="/ventures"
            />

            <HomePageLink
              title="Market Access"
              text="Connect qualified founders with procurement, customers, diaspora networks, institutions, and global markets."
              to="/our-model"
            />

            <HomePageLink
              title="Founder Development"
              text="Explore collaboration opportunities for universities, faculty, researchers, students, and academic institutions."
              to="/universities"
            />

            <HomePageLink
              title="Investment"
              text="Prepare ventures for appropriate capital, investor relationships, due diligence, validation, and growth."
              to="/strategic-partners"
            />

            <HomePageLink
              title="Measure Outcomes"
              text="Track revenue, capital, contracts, customers, jobs, partnerships, markets entered, and international growth."
              to="/programs"
            />

            <HomePageLink
              title="Improve"
              text="Turn founder experience and measurable outcomes into evidence that strengthens future cohorts."
              to="/events"
            />

            <HomePageLink
              title="Greater Impact"
              text="Build an entrepreneurial ecosystem that becomes stronger with every founder, partner, and cycle of learning."
              to="/insights"
            />

          </div>


          <div className="cf-centered-link">

            <Link
              to="/contact"
              className="cf-text-link"
            >

              <br/>
              

              <span>
                
                Build With Us
              </span>

              <ArrowRight
                size={17}
                aria-hidden="true"
              />

            </Link>

          </div>

        </div>

      </section>

      <br/>
      <br/>


      {/* =====================================================
          13 — BUILD WITH US
      ====================================================== */}

      <section
        className="cf-materials-section"
        aria-labelledby="partnership-materials-heading"
      >

        <div className="cf-container cf-materials-grid">

          <div>

            <span className="cf-eyebrow">
              BUILD WITH US
            </span>


            <h2 id="partnership-materials-heading">
              The next generation of global founders is already emerging.
            </h2>

          </div>


          <p>
            Across Africa and throughout the diaspora, entrepreneurs are developing solutions, creating businesses, generating employment, and imagining industries that can transform communities and economies. Continental Founders invites universities, researchers, corporations, investors, governments, foundations, diaspora organizations, mentors, and ecosystem builders to become part of this work.
          </p>


          <a
            href="/assets/documents/continental-founders-partnership.pdf"
            className="cf-button cf-button--gold"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Download Continental Founders partnership materials PDF"
          >

            <span>
              Support Continental Founders
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
