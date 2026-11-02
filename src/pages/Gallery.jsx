import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Download,
  Expand,
  Image as ImageIcon,
  Images,
  LoaderCircle,
  RefreshCw,
  Search,
  X,
} from "lucide-react";

import { createPortal } from "react-dom";
import { Link } from "react-router-dom";

import "./Gallery.css";

// ============================================================
// API CONFIGURATION
// ============================================================

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000"
).replace(/\/+$/, "");

// ============================================================
// CONSTANTS
// ============================================================

const ALL_CATEGORY = "All";

// Photos shown at first, and added by each "Load more".
const PAGE_SIZE = 24;

// Our own event photos, shown in the hero slideshow.
const HERO_SLIDES = [
  "/assets/gallery/DZ9A1318 (1).webp",
  "/assets/gallery/DZ9A1311.webp",
  "/assets/gallery/DZ9A0696.webp",
  "/assets/gallery/DZ9A0973.webp",
];

// ============================================================
// HELPERS
// ============================================================

function cleanString(value) {
  return typeof value === "string"
    ? value.trim()
    : "";
}

function normalizeCategory(value) {
  return cleanString(value) || "General";
}

function normalizeGalleryItem(item) {
  if (!item || typeof item !== "object") {
    return null;
  }

  const imageUrl = cleanString(
    item.imageUrl ||
      item.image_url ||
      item.url ||
      item.publicUrl ||
      item.public_url
  );

  if (!imageUrl) {
    return null;
  }

  return {
    id: item.id || imageUrl,

    title: cleanString(item.title) || "Continental Founders",

    caption: cleanString(item.caption || item.description),

    category: normalizeCategory(item.category),

    imageUrl,

    downloadUrl:
      cleanString(item.downloadUrl || item.download_url) || imageUrl,

    altText:
      cleanString(item.altText || item.alt_text) ||
      cleanString(item.title) ||
      "Continental Founders gallery image",

    eventDate: item.eventDate || item.event_date || item.date || null,

    publishedAt:
      item.publishedAt ||
      item.published_at ||
      item.createdAt ||
      item.created_at ||
      null,

    sortOrder: Number(item.sortOrder ?? item.sort_order ?? 0) || 0,
  };
}

function normalizeGalleryResponse(payload) {
  let records = [];

  if (Array.isArray(payload)) {
    records = payload;
  } else if (Array.isArray(payload?.items)) {
    records = payload.items;
  } else if (Array.isArray(payload?.gallery)) {
    records = payload.gallery;
  } else if (Array.isArray(payload?.data)) {
    records = payload.data;
  } else if (Array.isArray(payload?.data?.items)) {
    records = payload.data.items;
  } else if (Array.isArray(payload?.data?.gallery)) {
    records = payload.data.gallery;
  }

  return records.map(normalizeGalleryItem).filter(Boolean);
}

function formatDate(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

function createSafeFileName(title, imageUrl) {
  const base =
    cleanString(title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") ||
    "continental-founders-photo";

  let extension = "jpg";

  try {
    const url = new URL(imageUrl);
    const match = url.pathname.match(/\.([a-zA-Z0-9]+)$/);

    if (match?.[1]) {
      const candidate = match[1].toLowerCase();

      if (["jpg", "jpeg", "png", "webp"].includes(candidate)) {
        extension = candidate;
      }
    }
  } catch {
    // Use jpg fallback.
  }

  return `${base}.${extension}`;
}

// Tile shape from the photo's real proportions, once it has loaded.
function shapeFor(width, height) {
  if (!width || !height) return "";

  const ratio = width / height;

  if (ratio > 1.9) return "wide";
  if (ratio < 0.85) return "tall";
  return "";
}

// ============================================================
// GALLERY PAGE
// ============================================================

export default function Gallery() {
  // ----------------------------------------------------------
  // GALLERY DATA
  // ----------------------------------------------------------

  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ----------------------------------------------------------
  // FILTERS
  // ----------------------------------------------------------

  const [activeCategory, setActiveCategory] = useState(ALL_CATEGORY);
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Tile shapes keyed by photo id, filled in as photos load.
  const [shapes, setShapes] = useState({});

  // ----------------------------------------------------------
  // LIGHTBOX + DOWNLOAD
  // ----------------------------------------------------------

  const [selectedIndex, setSelectedIndex] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const lastFocusRef = useRef(null);
  const closeButtonRef = useRef(null);
  const thumbsRef = useRef(null);
  const swipeRef = useRef({ startX: 0, startY: 0, active: false });

  // ==========================================================
  // LOAD PUBLISHED GALLERY
  // ==========================================================

  const loadGallery = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/api/gallery/published`,
        {
          method: "GET",
          headers: { Accept: "application/json" },
        }
      );

      let payload = {};

      try {
        payload = await response.json();
      } catch {
        payload = {};
      }

      if (!response.ok) {
        throw new Error(
          payload?.message ||
            payload?.error ||
            "Unable to load the gallery."
        );
      }

      setGallery(normalizeGalleryResponse(payload));
    } catch (requestError) {
      console.error("Gallery loading error:", requestError);

      setGallery([]);

      // A network failure only says "Failed to fetch".
      setError(
        requestError instanceof TypeError
          ? "We could not reach the gallery right now. Please try again shortly."
          : requestError?.message || "Unable to load the gallery."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGallery();
  }, [loadGallery]);

  // ==========================================================
  // CATEGORIES (with photo counts)
  // ==========================================================

  const categories = useMemo(() => {
    const counts = new Map();

    gallery.forEach((item) => {
      counts.set(item.category, (counts.get(item.category) || 0) + 1);
    });

    return [
      { name: ALL_CATEGORY, count: gallery.length },
      ...Array.from(counts, ([name, count]) => ({ name, count })).sort(
        (a, b) => a.name.localeCompare(b.name)
      ),
    ];
  }, [gallery]);

  // ==========================================================
  // FILTERED GALLERY
  // ==========================================================

  const filteredGallery = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return gallery.filter((item) => {
      if (
        activeCategory !== ALL_CATEGORY &&
        item.category !== activeCategory
      ) {
        return false;
      }

      if (!query) {
        return true;
      }

      return [item.title, item.caption, item.category]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
  }, [gallery, activeCategory, searchQuery]);

  const visibleItems = filteredGallery.slice(0, visibleCount);
  const remaining = filteredGallery.length - visibleItems.length;
  const isFiltering =
    searchQuery.trim() !== "" || activeCategory !== ALL_CATEGORY;

  // A new search or category starts again from the first page.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [activeCategory, searchQuery]);

  function clearFilters() {
    setSearchQuery("");
    setActiveCategory(ALL_CATEGORY);
  }

  function rememberShape(id, image) {
    const shape = shapeFor(image.naturalWidth, image.naturalHeight);

    setShapes((current) =>
      current[id] === shape ? current : { ...current, [id]: shape }
    );
  }

  // ==========================================================
  // LIGHTBOX
  // ==========================================================

  const selectedItem =
    selectedIndex === null ? null : filteredGallery[selectedIndex];

  // Close if the open photo is filtered away.
  useEffect(() => {
    if (selectedIndex !== null && !filteredGallery[selectedIndex]) {
      setSelectedIndex(null);
    }
  }, [filteredGallery, selectedIndex]);

  function openLightbox(index, event) {
    lastFocusRef.current = event?.currentTarget || null;
    setSelectedIndex(index);
  }

  const closeLightbox = useCallback(() => {
    setSelectedIndex(null);
    lastFocusRef.current?.focus?.();
  }, []);

  const step = useCallback(
    (direction) => {
      const total = filteredGallery.length;

      if (total <= 1) return;

      setSelectedIndex((current) =>
        current === null ? 0 : (current + direction + total) % total
      );
    },
    [filteredGallery.length]
  );

  // Keyboard, scroll lock and focus while the viewer is open.
  useEffect(() => {
    if (!selectedItem) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowLeft") step(-1);
      if (event.key === "ArrowRight") step(1);
    };

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedItem, closeLightbox, step]);

  const lightboxOpen = Boolean(selectedItem);

  useEffect(() => {
    if (lightboxOpen) closeButtonRef.current?.focus();
  }, [lightboxOpen]);

  // Keep the active thumbnail in view.
  useEffect(() => {
    if (selectedIndex === null) return;

    thumbsRef.current
      ?.querySelector('[aria-current="true"]')
      ?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [selectedIndex]);

  // Swipe left or right on touch screens.
  function handleTouchStart(event) {
    const touch = event.touches[0];
    swipeRef.current = { startX: touch.clientX, startY: touch.clientY, active: true };
  }

  function handleTouchEnd(event) {
    const swipe = swipeRef.current;

    if (!swipe.active) return;

    swipe.active = false;

    const touch = event.changedTouches[0];
    const dx = touch.clientX - swipe.startX;
    const dy = touch.clientY - swipe.startY;

    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      step(dx < 0 ? 1 : -1);
    }
  }

  // ==========================================================
  // DOWNLOAD IMAGE
  // ==========================================================

  const handleDownload = async (item, event) => {
    event?.stopPropagation();

    if (!item?.downloadUrl) {
      return;
    }

    setDownloadingId(item.id);

    try {
      const response = await fetch(item.downloadUrl);

      if (!response.ok) {
        throw new Error("Unable to download image.");
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");

      anchor.href = objectUrl;
      anchor.download = createSafeFileName(item.title, item.downloadUrl);

      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      URL.revokeObjectURL(objectUrl);
    } catch (downloadError) {
      console.error("Gallery download error:", downloadError);

      window.open(item.downloadUrl, "_blank", "noopener,noreferrer");
    } finally {
      setDownloadingId(null);
    }
  };

  // ==========================================================
  // SCROLL REVEAL
  // Anything already above the fold (or skipped by a fast
  // jump) is shown at once.
  // ==========================================================

  const pageRef = useRef(null);

  useEffect(() => {
    const root = pageRef.current;

    if (
      !root ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return undefined;
    }

    root.classList.add("gl-page--reveal");

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

  // ==========================================================
  // RENDER
  // ==========================================================

  const collectionCount = categories.length - 1;

  return (
    <main className="gl-page" ref={pageRef}>

      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="gl-hero">

        <div className="gl-hero__slideshow" aria-hidden="true">
          {HERO_SLIDES.map((src) => (
            <img key={src} src={src} alt="" />
          ))}
        </div>

        <div className="gl-container gl-hero__inner">

          <div className="gl-hero__content">
            <span className="gl-eyebrow gl-eyebrow--light">Gallery</span>

            <h1>
              <span>Stories behind</span>{" "}
              <span>
                our <em>journey together.</em>
              </span>
            </h1>

            <p>
              Explore moments from Continental Founders events,
              founder programs, university engagements, partnerships,
              and community activities.
            </p>
          </div>

          {/* Live totals from the backend */}
          {!loading && !error && gallery.length > 0 && (
            <dl className="gl-hero__stats">
              <div>
                <dt>Photos</dt>
                <dd>{gallery.length}</dd>
              </div>

              <div>
                <dt>{collectionCount === 1 ? "Collection" : "Collections"}</dt>
                <dd>{collectionCount}</dd>
              </div>
            </dl>
          )}

        </div>

      </section>

      {/* =====================================================
          GALLERY
      ====================================================== */}

      <section className="gl-section" id="gallery-photos">

        <div className="gl-container">

          {/* Toolbar: only when there are photos to browse */}

          {gallery.length > 0 && (
            <div className="gl-toolbar">

              {categories.length > 2 && (
                <div
                  className="gl-categories"
                  role="group"
                  aria-label="Filter by collection"
                >
                  {categories.map(({ name, count }) => (
                    <button
                      key={name}
                      type="button"
                      className={activeCategory === name ? "is-active" : ""}
                      aria-pressed={activeCategory === name}
                      onClick={() => setActiveCategory(name)}
                    >
                      {name}
                      <span>{count}</span>
                    </button>
                  ))}
                </div>
              )}

              <label className="gl-search">
                <span className="gl-visually-hidden">Search gallery</span>

                <Search size={18} aria-hidden="true" />

                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search photos"
                  aria-label="Search gallery"
                />

                {searchQuery && (
                  <button
                    type="button"
                    className="gl-search__clear"
                    onClick={() => setSearchQuery("")}
                    aria-label="Clear gallery search"
                  >
                    <X size={16} aria-hidden="true" />
                  </button>
                )}
              </label>

            </div>
          )}

          {/* Result line when filtering */}

          {!loading && !error && isFiltering && filteredGallery.length > 0 && (
            <p className="gl-result" aria-live="polite">
              Showing {filteredGallery.length}{" "}
              {filteredGallery.length === 1 ? "photo" : "photos"}
              {activeCategory !== ALL_CATEGORY && (
                <> in <strong>{activeCategory}</strong></>
              )}
              <button type="button" onClick={clearFilters}>
                Clear
              </button>
            </p>
          )}

          {/* Loading: placeholder tiles in the shape of the wall */}

          {loading && (
            <div className="gl-grid" aria-busy="true" aria-live="polite">
              <span className="gl-visually-hidden">Loading gallery...</span>

              {Array.from({ length: 8 }, (_, index) => (
                <div
                  key={index}
                  className={`gl-tile gl-tile--skeleton${index === 0 ? " gl-tile--feature" : ""}`}
                  aria-hidden="true"
                />
              ))}
            </div>
          )}

          {/* Error */}

          {!loading && error && (
            <div className="gl-state gl-state--error" role="alert">
              <span className="gl-state__icon">
                <ImageIcon size={28} aria-hidden="true" />
              </span>

              <h2>Gallery unavailable</h2>

              <p>{error}</p>

              <button
                type="button"
                className="gl-button gl-button--navy"
                onClick={loadGallery}
              >
                <RefreshCw size={16} aria-hidden="true" />
                Try again
              </button>
            </div>
          )}

          {/* Empty: nothing published, or nothing matches */}

          {!loading && !error && filteredGallery.length === 0 && (
            <div className="gl-state">
              <span className="gl-state__icon">
                <Images size={28} aria-hidden="true" />
              </span>

              {gallery.length === 0 ? (
                <>
                  <h2>New photos are on the way.</h2>
                  <p>
                    Moments from our latest events and programs will
                    appear here as soon as they are published.
                  </p>
                </>
              ) : (
                <>
                  <h2>No matching photos.</h2>
                  <p>
                    No published images match your current search or
                    collection.
                  </p>

                  <button
                    type="button"
                    className="gl-button gl-button--navy"
                    onClick={clearFilters}
                  >
                    <X size={16} aria-hidden="true" />
                    Clear search
                  </button>
                </>
              )}
            </div>
          )}

          {/* Photo wall */}

          {!loading && !error && visibleItems.length > 0 && (
            <ul className="gl-grid">
              {visibleItems.map((item, index) => {
                const shape = shapes[item.id];
                const date = formatDate(item.eventDate || item.publishedAt);

                // The first photo leads the wall when nothing is filtered.
                const feature = index === 0 && !isFiltering && visibleItems.length > 4;

                return (
                  <li
                    key={item.id}
                    className={[
                      "gl-tile",
                      feature ? "gl-tile--feature" : shape ? `gl-tile--${shape}` : "",
                    ].join(" ")}
                  >
                    <button
                      type="button"
                      className="gl-tile__button"
                      onClick={(event) => openLightbox(index, event)}
                      aria-label={`Open photo: ${item.title}`}
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.altText}
                        loading={index < 8 ? "eager" : "lazy"}
                        decoding="async"
                        onLoad={(event) =>
                          rememberShape(item.id, event.currentTarget)
                        }
                      />

                      <span className="gl-tile__overlay">
                        <span className="gl-tile__category">{item.category}</span>
                        <strong>{item.title}</strong>
                        {date && <small>{date}</small>}
                      </span>

                      <span className="gl-tile__expand" aria-hidden="true">
                        <Expand size={18} />
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {remaining > 0 && !loading && !error && (
            <div className="gl-more">
              <button
                type="button"
                className="gl-button gl-button--outline"
                onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
              >
                Load more photos
                <span className="gl-more__count">{remaining}</span>
              </button>
            </div>
          )}

        </div>

      </section>

      {/* =====================================================
          CTA
      ====================================================== */}

      <section className="gl-cta">
        <div className="gl-container">
          <div className="gl-cta__card" data-reveal>
            <div>
              <span className="gl-eyebrow gl-eyebrow--light">Be Part of the Story</span>
              <h2>The next photo could include you.</h2>
              <p>
                Join a Continental Founders convening or talk to us
                about hosting one with your institution.
              </p>
            </div>

            <div className="gl-cta__actions">
              <Link to="/events" className="gl-button gl-button--gold">
                See upcoming events
                <ArrowRight size={18} aria-hidden="true" />
              </Link>

              <Link to="/contact" className="gl-button gl-button--ghost">
                Start a conversation
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          LIGHTBOX
      ====================================================== */}

      {/* Rendered on <body>: the page transition wrapper uses a
          transform, which would trap a fixed overlay inside it. */}
      {selectedItem && createPortal(
        <div
          className="gl-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`Photo viewer: ${selectedItem.title}`}
        >

          <div className="gl-lightbox__bar">
            <span className="gl-lightbox__counter">
              {selectedIndex + 1} / {filteredGallery.length}
            </span>

            <div className="gl-lightbox__tools">
              <button
                type="button"
                className="gl-lightbox__tool"
                onClick={(event) => handleDownload(selectedItem, event)}
                disabled={downloadingId === selectedItem.id}
              >
                {downloadingId === selectedItem.id ? (
                  <LoaderCircle className="gl-spin" size={18} aria-hidden="true" />
                ) : (
                  <Download size={18} aria-hidden="true" />
                )}
                <span>Download</span>
              </button>

              <button
                ref={closeButtonRef}
                type="button"
                className="gl-lightbox__tool gl-lightbox__tool--icon"
                onClick={closeLightbox}
                aria-label="Close photo viewer"
              >
                <X size={22} aria-hidden="true" />
              </button>
            </div>
          </div>

          <div
            className="gl-lightbox__stage"
            onClick={(event) => {
              if (event.target === event.currentTarget) closeLightbox();
            }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {filteredGallery.length > 1 && (
              <button
                type="button"
                className="gl-lightbox__nav gl-lightbox__nav--prev"
                onClick={() => step(-1)}
                aria-label="Previous photo"
              >
                <ArrowLeft size={22} aria-hidden="true" />
              </button>
            )}

            <img
              key={selectedItem.id}
              src={selectedItem.imageUrl}
              alt={selectedItem.altText}
            />

            {filteredGallery.length > 1 && (
              <button
                type="button"
                className="gl-lightbox__nav gl-lightbox__nav--next"
                onClick={() => step(1)}
                aria-label="Next photo"
              >
                <ArrowRight size={22} aria-hidden="true" />
              </button>
            )}
          </div>

          <div className="gl-lightbox__info">
            <div className="gl-lightbox__meta">
              <span className="gl-lightbox__category">{selectedItem.category}</span>

              {(selectedItem.eventDate || selectedItem.publishedAt) && (
                <span className="gl-lightbox__date">
                  <CalendarDays size={14} aria-hidden="true" />
                  {formatDate(selectedItem.eventDate || selectedItem.publishedAt)}
                </span>
              )}
            </div>

            <h2>{selectedItem.title}</h2>

            {selectedItem.caption && <p>{selectedItem.caption}</p>}
          </div>

          {filteredGallery.length > 1 && (
            <div className="gl-lightbox__thumbs" ref={thumbsRef}>
              {filteredGallery.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  aria-label={`Show photo ${index + 1}: ${item.title}`}
                  aria-current={index === selectedIndex}
                  onClick={() => setSelectedIndex(index)}
                >
                  <img src={item.imageUrl} alt="" loading="lazy" />
                </button>
              ))}
            </div>
          )}

        </div>,
        document.body
      )}

    </main>
  );
}
