import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Download,
  Expand,
  Image as ImageIcon,
  LoaderCircle,
  RefreshCw,
  Search,
  X,
} from "lucide-react";

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


// ============================================================
// HELPERS
// ============================================================

function cleanString(value) {
  return typeof value === "string"
    ? value.trim()
    : "";
}


function normalizeCategory(value) {
  const category =
    cleanString(value);

  return category ||
    "General";
}


function normalizeGalleryItem(item) {
  if (
    !item ||
    typeof item !== "object"
  ) {
    return null;
  }

  const imageUrl =
    cleanString(
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
    id:
      item.id ||
      imageUrl,

    title:
      cleanString(
        item.title
      ) ||
      "Continental Founders",

    caption:
      cleanString(
        item.caption ||
        item.description
      ),

    category:
      normalizeCategory(
        item.category
      ),

    imageUrl,

    downloadUrl:
      cleanString(
        item.downloadUrl ||
        item.download_url
      ) ||
      imageUrl,

    altText:
      cleanString(
        item.altText ||
        item.alt_text
      ) ||
      cleanString(
        item.title
      ) ||
      "Continental Founders gallery image",

    eventDate:
      item.eventDate ||
      item.event_date ||
      item.date ||
      null,

    publishedAt:
      item.publishedAt ||
      item.published_at ||
      item.createdAt ||
      item.created_at ||
      null,

    sortOrder:
      Number(
        item.sortOrder ??
        item.sort_order ??
        0
      ) || 0,
  };
}


function normalizeGalleryResponse(
  payload
) {
  let records = [];

  if (Array.isArray(payload)) {
    records = payload;
  } else if (
    Array.isArray(
      payload?.items
    )
  ) {
    records =
      payload.items;
  } else if (
    Array.isArray(
      payload?.gallery
    )
  ) {
    records =
      payload.gallery;
  } else if (
    Array.isArray(
      payload?.data
    )
  ) {
    records =
      payload.data;
  } else if (
    Array.isArray(
      payload?.data?.items
    )
  ) {
    records =
      payload.data.items;
  } else if (
    Array.isArray(
      payload?.data?.gallery
    )
  ) {
    records =
      payload.data.gallery;
  }

  return records
    .map(
      normalizeGalleryItem
    )
    .filter(Boolean);
}


function formatDate(value) {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "en",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  ).format(date);
}


function createSafeFileName(
  title,
  imageUrl
) {
  const base =
    cleanString(title)
      .toLowerCase()
      .replace(
        /[^a-z0-9]+/g,
        "-"
      )
      .replace(
        /^-+|-+$/g,
        ""
      ) ||
    "continental-founders-photo";

  let extension = "jpg";

  try {
    const url =
      new URL(imageUrl);

    const match =
      url.pathname.match(
        /\.([a-zA-Z0-9]+)$/
      );

    if (match?.[1]) {
      const candidate =
        match[1]
          .toLowerCase();

      if (
        [
          "jpg",
          "jpeg",
          "png",
          "webp",
        ].includes(
          candidate
        )
      ) {
        extension =
          candidate;
      }
    }
  } catch {
    // Use jpg fallback.
  }

  return `${base}.${extension}`;
}


// ============================================================
// GALLERY PAGE
// ============================================================

export default function Gallery() {
  const [
    gallery,
    setGallery,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    activeCategory,
    setActiveCategory,
  ] = useState(
    ALL_CATEGORY
  );

  const [
    searchQuery,
    setSearchQuery,
  ] = useState("");

  const [
    selectedIndex,
    setSelectedIndex,
  ] = useState(null);

  const [
    downloadingId,
    setDownloadingId,
  ] = useState(null);


  // ==========================================================
  // LOAD PUBLISHED GALLERY
  // ==========================================================

  const loadGallery =
    async () => {
      setLoading(true);
      setError("");

      try {
        const response =
          await fetch(
            `${API_URL}/api/gallery/published`,
            {
              method: "GET",

              headers: {
                Accept:
                  "application/json",
              },
            }
          );

        let payload = {};

        try {
          payload =
            await response.json();
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

        const normalized =
          normalizeGalleryResponse(
            payload
          );

        setGallery(
          normalized
        );
      } catch (requestError) {
        console.error(
          "Gallery loading error:",
          requestError
        );

        setGallery([]);

        setError(
          requestError?.message ||
          "Unable to load the gallery."
        );
      } finally {
        setLoading(false);
      }
    };


  useEffect(() => {
    loadGallery();
  }, []);


  // ==========================================================
  // CATEGORIES
  // ==========================================================

  const categories =
    useMemo(() => {
      const unique =
        new Set();

      gallery.forEach(
        (item) => {
          if (
            item.category
          ) {
            unique.add(
              item.category
            );
          }
        }
      );

      return [
        ALL_CATEGORY,
        ...Array.from(
          unique
        ).sort(
          (a, b) =>
            a.localeCompare(b)
        ),
      ];
    }, [gallery]);


  // ==========================================================
  // FILTERED GALLERY
  // ==========================================================

  const filteredGallery =
    useMemo(() => {
      const query =
        searchQuery
          .trim()
          .toLowerCase();

      return gallery.filter(
        (item) => {
          const matchesCategory =
            activeCategory ===
              ALL_CATEGORY ||
            item.category ===
              activeCategory;

          if (
            !matchesCategory
          ) {
            return false;
          }

          if (!query) {
            return true;
          }

          const searchable =
            [
              item.title,
              item.caption,
              item.category,
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();

          return searchable.includes(
            query
          );
        }
      );
    }, [
      gallery,
      activeCategory,
      searchQuery,
    ]);


  // ==========================================================
  // KEEP LIGHTBOX INDEX VALID
  // ==========================================================

  useEffect(() => {
    if (
      selectedIndex === null
    ) {
      return;
    }

    if (
      filteredGallery.length ===
      0
    ) {
      setSelectedIndex(null);
      return;
    }

    if (
      selectedIndex >=
      filteredGallery.length
    ) {
      setSelectedIndex(0);
    }
  }, [
    filteredGallery,
    selectedIndex,
  ]);


  const selectedItem =
    selectedIndex === null
      ? null
      : filteredGallery[
          selectedIndex
        ];


  // ==========================================================
  // LIGHTBOX
  // ==========================================================

  const openLightbox = (
    index
  ) => {
    setSelectedIndex(
      index
    );
  };


  const closeLightbox = () => {
    setSelectedIndex(null);
  };


  const showPrevious = () => {
    if (
      filteredGallery.length <=
      1
    ) {
      return;
    }

    setSelectedIndex(
      (current) => {
        if (
          current === null
        ) {
          return 0;
        }

        return (
          current -
          1 +
          filteredGallery.length
        ) %
          filteredGallery.length;
      }
    );
  };


  const showNext = () => {
    if (
      filteredGallery.length <=
      1
    ) {
      return;
    }

    setSelectedIndex(
      (current) => {
        if (
          current === null
        ) {
          return 0;
        }

        return (
          current + 1
        ) %
          filteredGallery.length;
      }
    );
  };


  // ==========================================================
  // KEYBOARD LIGHTBOX CONTROLS
  // ==========================================================

  useEffect(() => {
    if (!selectedItem) {
      return undefined;
    }

    const handleKeyDown = (
      event
    ) => {
      if (
        event.key ===
        "Escape"
      ) {
        closeLightbox();
      }

      if (
        event.key ===
        "ArrowLeft"
      ) {
        showPrevious();
      }

      if (
        event.key ===
        "ArrowRight"
      ) {
        showNext();
      }
    };

    document.body.style.overflow =
      "hidden";

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.body.style.overflow =
        "";

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [
    selectedItem,
    filteredGallery.length,
  ]);


  // ==========================================================
  // DOWNLOAD IMAGE
  // ==========================================================

  const handleDownload =
    async (
      item,
      event
    ) => {
      event?.stopPropagation();

      if (!item?.downloadUrl) {
        return;
      }

      setDownloadingId(
        item.id
      );

      try {
        const response =
          await fetch(
            item.downloadUrl
          );

        if (!response.ok) {
          throw new Error(
            "Unable to download image."
          );
        }

        const blob =
          await response.blob();

        const objectUrl =
          URL.createObjectURL(
            blob
          );

        const anchor =
          document.createElement(
            "a"
          );

        anchor.href =
          objectUrl;

        anchor.download =
          createSafeFileName(
            item.title,
            item.downloadUrl
          );

        document.body.appendChild(
          anchor
        );

        anchor.click();

        anchor.remove();

        URL.revokeObjectURL(
          objectUrl
        );
      } catch (
        downloadError
      ) {
        console.error(
          "Gallery download error:",
          downloadError
        );

        /*
         * Some external/CDN image hosts
         * may block fetch() because of CORS.
         *
         * Opening the original asset is a
         * graceful fallback.
         */

        window.open(
          item.downloadUrl,
          "_blank",
          "noopener,noreferrer"
        );
      } finally {
        setDownloadingId(
          null
        );
      }
    };


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="gallery-page">

      {/* =====================================================
          HERO
      ====================================================== */}

      <section className="gallery-hero">
        <div className="gallery-hero__overlay" />

        <div className="gallery-hero__content">
          <div className="gallery-hero__eyebrow">
            <span />

            <p>
              Gallery
            </p>
          </div>

          <h1>
            Moments That Move
            <br />
            Opportunity Forward
          </h1>

          <p className="gallery-hero__description">
            Explore moments from
            Continental Founders events,
            founder programs, university
            engagements, partnerships,
            and community activities.
          </p>
        </div>

        <div
          className="gallery-hero__mark"
          aria-hidden="true"
        >
          <span>
            People
          </span>

          <span>
            Partnerships
          </span>

          <span>
            Ideas
          </span>

          <span>
            Opportunity
          </span>
        </div>
      </section>


      {/* =====================================================
          GALLERY CONTENT
      ====================================================== */}

      <section className="gallery-content">

        <div className="gallery-container">

          {/* =================================================
              TOOLBAR
          ================================================= */}

          <div className="gallery-toolbar">

            <div
              className="gallery-categories"
              aria-label="Gallery categories"
            >
              {categories.map(
                (category) => (
                  <button
                    key={
                      category
                    }
                    type="button"
                    className={
                      activeCategory ===
                      category
                        ? "gallery-category is-active"
                        : "gallery-category"
                    }
                    onClick={() =>
                      setActiveCategory(
                        category
                      )
                    }
                  >
                    {category}
                  </button>
                )
              )}
            </div>


            <div className="gallery-search">
              <Search
                size={19}
                strokeWidth={1.8}
                aria-hidden="true"
              />

              <input
                type="search"
                value={
                  searchQuery
                }
                onChange={(
                  event
                ) =>
                  setSearchQuery(
                    event.target.value
                  )
                }
                placeholder="Search gallery..."
                aria-label="Search gallery"
              />

              {searchQuery && (
                <button
                  type="button"
                  className="gallery-search__clear"
                  onClick={() =>
                    setSearchQuery(
                      ""
                    )
                  }
                  aria-label="Clear gallery search"
                >
                  <X
                    size={16}
                    aria-hidden="true"
                  />
                </button>
              )}
            </div>

          </div>


          {/* =================================================
              LOADING
          ================================================= */}

          {loading && (
            <div className="gallery-state">
              <LoaderCircle
                className="gallery-state__spinner"
                size={34}
                strokeWidth={1.7}
                aria-hidden="true"
              />

              <h2>
                Loading gallery
              </h2>

              <p>
                Gathering the latest
                Continental Founders
                moments.
              </p>
            </div>
          )}


          {/* =================================================
              ERROR
          ================================================= */}

          {!loading &&
            error && (
              <div className="gallery-state gallery-state--error">
                <ImageIcon
                  size={36}
                  strokeWidth={1.5}
                  aria-hidden="true"
                />

                <h2>
                  Gallery unavailable
                </h2>

                <p>
                  {error}
                </p>

                <button
                  type="button"
                  onClick={
                    loadGallery
                  }
                >
                  <RefreshCw
                    size={17}
                    aria-hidden="true"
                  />

                  Try Again
                </button>
              </div>
            )}


          {/* =================================================
              EMPTY
          ================================================= */}

          {!loading &&
            !error &&
            filteredGallery.length ===
              0 && (
              <div className="gallery-state">
                <ImageIcon
                  size={38}
                  strokeWidth={1.4}
                  aria-hidden="true"
                />

                <h2>
                  No photos found
                </h2>

                <p>
                  {gallery.length ===
                  0
                    ? "Published gallery photos will appear here."
                    : "Try another category or search term."}
                </p>
              </div>
            )}


          {/* =================================================
              PHOTO GRID
          ================================================= */}

          {!loading &&
            !error &&
            filteredGallery.length >
              0 && (
              <div className="gallery-grid">

                {filteredGallery.map(
                  (
                    item,
                    index
                  ) => {
                    const displayDate =
                      formatDate(
                        item.eventDate ||
                        item.publishedAt
                      );

                    return (
                      <article
                        className="gallery-card"
                        key={
                          item.id
                        }
                      >

                        <button
                          type="button"
                          className="gallery-card__image-button"
                          onClick={() =>
                            openLightbox(
                              index
                            )
                          }
                          aria-label={`Open ${item.title}`}
                        >
                          <img
                            src={
                              item.imageUrl
                            }
                            alt={
                              item.altText
                            }
                            className="gallery-card__image"
                            loading="lazy"
                          />

                          <div className="gallery-card__image-overlay">
                            <Expand
                              size={24}
                              strokeWidth={1.6}
                              aria-hidden="true"
                            />
                          </div>

                          <span className="gallery-card__category">
                            {
                              item.category
                            }
                          </span>
                        </button>


                        <div className="gallery-card__body">

                          <div className="gallery-card__text">
                            <h2>
                              {
                                item.title
                              }
                            </h2>

                            {displayDate && (
                              <div className="gallery-card__date">
                                <CalendarDays
                                  size={14}
                                  strokeWidth={1.7}
                                  aria-hidden="true"
                                />

                                <span>
                                  {
                                    displayDate
                                  }
                                </span>
                              </div>
                            )}

                            {item.caption && (
                              <p>
                                {
                                  item.caption
                                }
                              </p>
                            )}
                          </div>


                          <button
                            type="button"
                            className="gallery-card__download"
                            onClick={(
                              event
                            ) =>
                              handleDownload(
                                item,
                                event
                              )
                            }
                            disabled={
                              downloadingId ===
                              item.id
                            }
                            aria-label={`Download ${item.title}`}
                            title="Download photo"
                          >
                            {downloadingId ===
                            item.id ? (
                              <LoaderCircle
                                className="gallery-card__download-spinner"
                                size={19}
                                strokeWidth={1.8}
                                aria-hidden="true"
                              />
                            ) : (
                              <Download
                                size={19}
                                strokeWidth={1.8}
                                aria-hidden="true"
                              />
                            )}
                          </button>

                        </div>

                      </article>
                    );
                  }
                )}

              </div>
            )}

        </div>

      </section>


      {/* =====================================================
          LIGHTBOX
      ====================================================== */}

      {selectedItem && (
        <div
          className="gallery-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Gallery image viewer"
          onClick={
            closeLightbox
          }
        >

          <button
            type="button"
            className="gallery-lightbox__close"
            onClick={
              closeLightbox
            }
            aria-label="Close image viewer"
          >
            <X
              size={25}
              strokeWidth={1.7}
              aria-hidden="true"
            />
          </button>


          {filteredGallery.length >
            1 && (
            <button
              type="button"
              className="gallery-lightbox__navigation gallery-lightbox__navigation--previous"
              onClick={(
                event
              ) => {
                event.stopPropagation();
                showPrevious();
              }}
              aria-label="Previous image"
            >
              <ArrowLeft
                size={25}
                strokeWidth={1.6}
                aria-hidden="true"
              />
            </button>
          )}


          <div
            className="gallery-lightbox__content"
            onClick={(
              event
            ) =>
              event.stopPropagation()
            }
          >

            <div className="gallery-lightbox__image-wrapper">
              <img
                src={
                  selectedItem.imageUrl
                }
                alt={
                  selectedItem.altText
                }
              />
            </div>


            <div className="gallery-lightbox__information">

              <div className="gallery-lightbox__meta">
                <span className="gallery-lightbox__category">
                  {
                    selectedItem.category
                  }
                </span>

                {(selectedItem.eventDate ||
                  selectedItem.publishedAt) && (
                  <span className="gallery-lightbox__date">
                    <CalendarDays
                      size={14}
                      strokeWidth={1.7}
                      aria-hidden="true"
                    />

                    {formatDate(
                      selectedItem.eventDate ||
                      selectedItem.publishedAt
                    )}
                  </span>
                )}
              </div>


              <div className="gallery-lightbox__title-row">

                <div>
                  <h2>
                    {
                      selectedItem.title
                    }
                  </h2>

                  {selectedItem.caption && (
                    <p>
                      {
                        selectedItem.caption
                      }
                    </p>
                  )}
                </div>


                <button
                  type="button"
                  className="gallery-lightbox__download"
                  onClick={(
                    event
                  ) =>
                    handleDownload(
                      selectedItem,
                      event
                    )
                  }
                  disabled={
                    downloadingId ===
                    selectedItem.id
                  }
                >
                  {downloadingId ===
                  selectedItem.id ? (
                    <LoaderCircle
                      className="gallery-card__download-spinner"
                      size={18}
                      aria-hidden="true"
                    />
                  ) : (
                    <Download
                      size={18}
                      aria-hidden="true"
                    />
                  )}

                  <span>
                    Download
                  </span>
                </button>

              </div>


              <div className="gallery-lightbox__counter">
                {selectedIndex + 1}
                {" / "}
                {
                  filteredGallery.length
                }
              </div>

            </div>

          </div>


          {filteredGallery.length >
            1 && (
            <button
              type="button"
              className="gallery-lightbox__navigation gallery-lightbox__navigation--next"
              onClick={(
                event
              ) => {
                event.stopPropagation();
                showNext();
              }}
              aria-label="Next image"
            >
              <ArrowRight
                size={25}
                strokeWidth={1.6}
                aria-hidden="true"
              />
            </button>
          )}

        </div>
      )}

    </div>
  );
}