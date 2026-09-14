import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Save,
  RefreshCw,
  Plus,
  Trash2,
  Globe2,
  Handshake,
  Building2,
  Users,
  Image as ImageIcon,
} from "lucide-react";

import "./AdminUSAfricaTradeNetwork.css";


const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";


const PAGE_SLUG =
  "us-africa-trade-network";


const FALLBACK_CONTENT = {

  hero: {
    eyebrow:
      "U.S.–AFRICA TRADE & BUSINESS NETWORK",

    titleLine1:
      "Bridging markets.",

    titleLine2:
      "Building opportunity.",

    titleHighlight:
      "Together.",

    description:
      "Connecting entrepreneurs, companies, and institutions across the United States and Africa to create real business opportunities, expand markets, and build lasting commercial relationships.",

    image:
      "/assets/images/us-africa/hero.jpg",

    primaryButtonText:
      "Explore Partnership",

    primaryButtonLink:
      "/contact",

    secondaryButtonText:
      "Learn More",
  },


  highlights: [
    {
      title:
        "Stronger Businesses",
    },
    {
      title:
        "Expanded Markets",
    },
    {
      title:
        "Lasting Impact",
    },
  ],


  sideMessage: [
    "PEOPLE",
    "MARKETS",
    "INVESTMENT",
    "OPPORTUNITY",
    "IMPACT",
  ],


  trust: {

    label:
      "Trusted by forward-thinking organizations",

    organizations: [
      "U.S. Chamber of Commerce",
      "AfCFTA",
      "World Bank Group",
      "African Union",
      "UNDP",
      "DFC",
    ],

  },


  intro: {

    eyebrow:
      "Cross-Border Opportunity",

    title:
      "Connecting ambitious founders with global markets.",

    paragraph1:
      "The U.S.–Africa Trade & Business Network creates a bridge between entrepreneurial ecosystems, business communities, and institutions across both markets.",

    paragraph2:
      "Through trusted relationships and strategic partnerships, we help founders move from introductions to commercial opportunities, partnerships, market entry, and long-term growth.",

    image:
      "/assets/images/us-africa/business-handshake.jpg",

    imageCaption:
      "Opportunity knows no borders",

    buttonText:
      "Our Approach",

    buttonLink:
      "/our-model",

  },


  stats: [
    {
      value:
        "2",

      label:
        "Continents",
    },
    {
      value:
        "1,000+",

      label:
        "Entrepreneurs & Businesses",
    },
    {
      value:
        "100+",

      label:
        "Partner Institutions",
    },
    {
      value:
        "Growing",

      label:
        "Opportunities",
    },
  ],


  features: {

    eyebrow:
      "What the Network Enables",

    title:
      "From connections to real-world impact.",

    description:
      "We help founders, companies, and institutions unlock practical opportunities through trusted relationships, market knowledge, and strategic collaboration.",

    items: [

      {
        title:
          "Market Access",

        description:
          "Understand new markets, identify opportunities, and expand globally.",

        image:
          "/assets/images/us-africa/market-access.jpg",
      },

      {
        title:
          "Business Connections",

        description:
          "Build meaningful relationships with industry leaders, buyers, suppliers, and strategic partners.",

        image:
          "/assets/images/us-africa/business-connections.jpg",
      },

      {
        title:
          "Trade & Investment Readiness",

        description:
          "Prepare for cross-border engagement and investment opportunities.",

        image:
          "/assets/images/us-africa/trade-readiness.jpg",
      },

      {
        title:
          "Knowledge Exchange",

        description:
          "Access market intelligence, industry expertise, and proven business practices.",

        image:
          "/assets/images/us-africa/knowledge-exchange.jpg",
      },

    ],

  },


  network: {

    eyebrow:
      "Who We Work With",

    titleLine1:
      "A diverse network.",

    titleLine2:
      "A shared vision.",

    description:
      "We collaborate with the people and institutions that make cross-border business possible.",

    items: [
      "Entrepreneurs & Founders",
      "Companies & Industry Leaders",
      "Trade Organizations",
      "Business Associations",
      "Universities & Institutions",
      "Economic Development Partners",
    ],

  },


  cta: {

    eyebrow:
      "Build With Us",

    titleLine1:
      "Let’s turn opportunity",

    titleLine2:
      "into lasting impact.",

    description:
      "Join Continental Founders in strengthening U.S.–Africa business connections and building a more prosperous future through markets, expertise, and commercial opportunity.",

    buttonText:
      "Explore Partnership",

    buttonLink:
      "/contact",

    image:
      "/assets/images/us-africa/final-cta.jpg",

  },

};


function deepClone(
  value
) {

  return JSON.parse(
    JSON.stringify(
      value
    )
  );

}


function mergeContent(
  content = {}
) {

  return {

    ...deepClone(
      FALLBACK_CONTENT
    ),

    ...content,


    hero: {
      ...FALLBACK_CONTENT.hero,
      ...(content.hero || {}),
    },


    trust: {
      ...FALLBACK_CONTENT.trust,
      ...(content.trust || {}),

      organizations:
        Array.isArray(
          content.trust?.organizations
        )
          ? content.trust.organizations
          : deepClone(
              FALLBACK_CONTENT
                .trust
                .organizations
            ),
    },


    intro: {
      ...FALLBACK_CONTENT.intro,
      ...(content.intro || {}),
    },


    highlights:
      Array.isArray(
        content.highlights
      )
        ? content.highlights
        : deepClone(
            FALLBACK_CONTENT
              .highlights
          ),


    sideMessage:
      Array.isArray(
        content.sideMessage
      )
        ? content.sideMessage
        : deepClone(
            FALLBACK_CONTENT
              .sideMessage
          ),


    stats:
      Array.isArray(
        content.stats
      )
        ? content.stats
        : deepClone(
            FALLBACK_CONTENT
              .stats
          ),


    features: {

      ...FALLBACK_CONTENT.features,
      ...(content.features || {}),

      items:
        Array.isArray(
          content.features?.items
        )
          ? content.features.items
          : deepClone(
              FALLBACK_CONTENT
                .features
                .items
            ),

    },


    network: {

      ...FALLBACK_CONTENT.network,
      ...(content.network || {}),

      items:
        Array.isArray(
          content.network?.items
        )
          ? content.network.items
          : deepClone(
              FALLBACK_CONTENT
                .network
                .items
            ),

    },


    cta: {
      ...FALLBACK_CONTENT.cta,
      ...(content.cta || {}),
    },

  };

}


export default function AdminUSAfricaTradeNetwork() {

  const [
    title,
    setTitle,
  ] =
    useState(
      "U.S.–Africa Trade & Business Network"
    );


  const [
    status,
    setStatus,
  ] =
    useState(
      "published"
    );


  const [
    content,
    setContent,
  ] =
    useState(
      deepClone(
        FALLBACK_CONTENT
      )
    );


  const [
    loading,
    setLoading,
  ] =
    useState(true);


  const [
    saving,
    setSaving,
  ] =
    useState(false);


  const [
    error,
    setError,
  ] =
    useState("");


  const [
    success,
    setSuccess,
  ] =
    useState("");


  const [
    lastUpdated,
    setLastUpdated,
  ] =
    useState(null);


  /* ============================================================
     LOAD
  ============================================================ */

  const loadPage =
    useCallback(
      async () => {

        try {

          setLoading(true);
          setError("");
          setSuccess("");


          const response =
            await fetch(
              `${API_URL}/api/pages/admin/${PAGE_SLUG}`,
              {
                method:
                  "GET",

                credentials:
                  "include",

                headers: {
                  Accept:
                    "application/json",
                },
              }
            );


          const result =
            await response.json();


          if (
            !response.ok
          ) {

            throw new Error(
              result.message ||
              "Unable to load page."
            );

          }


          const page =
            result.page;


          setTitle(
            page?.title ||
            "U.S.–Africa Trade & Business Network"
          );


          setStatus(
            page?.status ||
            "draft"
          );


          setContent(
            mergeContent(
              page?.content ||
              {}
            )
          );


          setLastUpdated(
            page?.updatedAt ||
            null
          );

        } catch (
          requestError
        ) {

          console.error(
            "Load U.S.–Africa CMS page error:",
            requestError
          );


          setError(
            requestError.message ||
            "Unable to load CMS page."
          );

        } finally {

          setLoading(false);

        }

      },
      []
    );


  useEffect(
    () => {

      loadPage();

    },
    [
      loadPage,
    ]
  );


  /* ============================================================
     SAVE
  ============================================================ */

  async function handleSave(
    event
  ) {

    event.preventDefault();


    try {

      setSaving(true);
      setError("");
      setSuccess("");


      const response =
        await fetch(
          `${API_URL}/api/pages/admin/${PAGE_SLUG}`,
          {
            method:
              "PATCH",

            credentials:
              "include",

            headers: {
              "Content-Type":
                "application/json",

              Accept:
                "application/json",
            },

            body:
              JSON.stringify({
                title,
                status,
                content,
              }),
          }
        );


      const result =
        await response.json();


      if (
        !response.ok
      ) {

        throw new Error(
          result.message ||
          "Unable to save changes."
        );

      }


      setTitle(
        result.page?.title ||
        title
      );


      setStatus(
        result.page?.status ||
        status
      );


      setContent(
        mergeContent(
          result.page?.content ||
          content
        )
      );


      setLastUpdated(
        result.page?.updatedAt ||
        new Date()
          .toISOString()
      );


      setSuccess(
        "U.S.–Africa Trade Network page saved successfully."
      );

    } catch (
      saveError
    ) {

      console.error(
        "Save U.S.–Africa CMS page error:",
        saveError
      );


      setError(
        saveError.message ||
        "Unable to save page."
      );

    } finally {

      setSaving(false);

    }

  }


  /* ============================================================
     GENERAL UPDATE HELPERS
  ============================================================ */

  function updateSectionField(
    section,
    field,
    value
  ) {

    setContent(
      (
        current
      ) => ({

        ...current,

        [section]: {

          ...current[section],

          [field]:
            value,

        },

      })
    );

  }


  function updateArrayItemField(
    section,
    index,
    field,
    value
  ) {

    setContent(
      (
        current
      ) => {

        const items =
          [
            ...(
              current[section]?.items ||
              []
            ),
          ];


        items[index] = {

          ...items[index],

          [field]:
            value,

        };


        return {

          ...current,

          [section]: {

            ...current[section],

            items,

          },

        };

      }
    );

  }


  function updateSimpleArrayItem(
    section,
    index,
    value
  ) {

    setContent(
      (
        current
      ) => {

        const items =
          [
            ...(
              current[section]?.items ||
              []
            ),
          ];


        items[index] =
          value;


        return {

          ...current,

          [section]: {

            ...current[section],

            items,

          },

        };

      }
    );

  }


  /* ============================================================
     HIGHLIGHTS
  ============================================================ */

  function updateHighlight(
    index,
    value
  ) {

    setContent(
      (
        current
      ) => {

        const highlights =
          [
            ...current.highlights,
          ];


        highlights[index] = {

          ...highlights[index],

          title:
            value,

        };


        return {

          ...current,

          highlights,

        };

      }
    );

  }


  function addHighlight() {

    setContent(
      (
        current
      ) => ({

        ...current,

        highlights: [
          ...current.highlights,

          {
            title:
              "New Highlight",
          },
        ],

      })
    );

  }


  function removeHighlight(
    index
  ) {

    setContent(
      (
        current
      ) => ({

        ...current,

        highlights:
          current.highlights.filter(
            (
              _,
              itemIndex
            ) =>
              itemIndex !==
              index
          ),

      })
    );

  }


  /* ============================================================
     STATS
  ============================================================ */

  function updateStat(
    index,
    field,
    value
  ) {

    setContent(
      (
        current
      ) => {

        const stats =
          [
            ...current.stats,
          ];


        stats[index] = {

          ...stats[index],

          [field]:
            value,

        };


        return {

          ...current,

          stats,

        };

      }
    );

  }


  function addStat() {

    setContent(
      (
        current
      ) => ({

        ...current,

        stats: [
          ...current.stats,

          {
            value:
              "0",

            label:
              "New Statistic",
          },
        ],

      })
    );

  }


  function removeStat(
    index
  ) {

    setContent(
      (
        current
      ) => ({

        ...current,

        stats:
          current.stats.filter(
            (
              _,
              itemIndex
            ) =>
              itemIndex !==
              index
          ),

      })
    );

  }


  /* ============================================================
     FEATURES
  ============================================================ */

  function addFeature() {

    setContent(
      (
        current
      ) => ({

        ...current,

        features: {

          ...current.features,

          items: [
            ...current.features.items,

            {
              title:
                "New Feature",

              description:
                "Add feature description.",

              image:
                "",
            },

          ],

        },

      })
    );

  }


  function removeFeature(
    index
  ) {

    setContent(
      (
        current
      ) => ({

        ...current,

        features: {

          ...current.features,

          items:
            current.features.items.filter(
              (
                _,
                itemIndex
              ) =>
                itemIndex !==
                index
            ),

        },

      })
    );

  }


  /* ============================================================
     TRUST ORGANIZATIONS
  ============================================================ */

  function updateOrganization(
    index,
    value
  ) {

    setContent(
      (
        current
      ) => {

        const organizations =
          [
            ...current.trust.organizations,
          ];


        organizations[index] =
          value;


        return {

          ...current,

          trust: {

            ...current.trust,

            organizations,

          },

        };

      }
    );

  }


  function addOrganization() {

    setContent(
      (
        current
      ) => ({

        ...current,

        trust: {

          ...current.trust,

          organizations: [
            ...current.trust.organizations,
            "New Organization",
          ],

        },

      })
    );

  }


  function removeOrganization(
    index
  ) {

    setContent(
      (
        current
      ) => ({

        ...current,

        trust: {

          ...current.trust,

          organizations:
            current.trust.organizations.filter(
              (
                _,
                itemIndex
              ) =>
                itemIndex !==
                index
            ),

        },

      })
    );

  }


  /* ============================================================
     NETWORK ITEMS
  ============================================================ */

  function addNetworkItem() {

    setContent(
      (
        current
      ) => ({

        ...current,

        network: {

          ...current.network,

          items: [
            ...current.network.items,
            "New Network Group",
          ],

        },

      })
    );

  }


  function removeNetworkItem(
    index
  ) {

    setContent(
      (
        current
      ) => ({

        ...current,

        network: {

          ...current.network,

          items:
            current.network.items.filter(
              (
                _,
                itemIndex
              ) =>
                itemIndex !==
                index
            ),

        },

      })
    );

  }


  const formattedUpdatedAt =
    useMemo(
      () => {

        if (!lastUpdated) {
          return "Not available";
        }


        try {

          return new Date(
            lastUpdated
          ).toLocaleString();

        } catch {

          return lastUpdated;

        }

      },
      [
        lastUpdated,
      ]
    );


  if (loading) {

    return (

      <div className="trade-admin-state">

        <RefreshCw
          size={22}
          className="trade-admin-spin"
        />

        <span>
          Loading U.S.–Africa page...
        </span>

      </div>

    );

  }


  return (

    <div className="trade-admin-page">

      <form
        onSubmit={
          handleSave
        }
      >

        {/* ====================================================
            HEADER
        ===================================================== */}

        <div className="trade-admin-header">

          <div>

            <span className="trade-admin-kicker">
              Partners CMS
            </span>

            <h1>
              U.S.–Africa Trade & Business Network
            </h1>

            <p>
              Manage the public U.S.–Africa Trade Network page,
              including content, statistics, organizations and images.
            </p>

          </div>


          <div className="trade-admin-header__actions">

            <button
              type="button"
              className="trade-admin-button trade-admin-button--secondary"
              onClick={
                loadPage
              }
              disabled={
                saving
              }
            >

              <RefreshCw
                size={17}
              />

              Reload

            </button>


            <button
              type="submit"
              className="trade-admin-button trade-admin-button--primary"
              disabled={
                saving
              }
            >

              {saving ? (

                <RefreshCw
                  size={17}
                  className="trade-admin-spin"
                />

              ) : (

                <Save
                  size={17}
                />

              )}

              {saving
                ? "Saving..."
                : "Save Changes"}

            </button>

          </div>

        </div>


        {/* ====================================================
            MESSAGES
        ===================================================== */}

        {error && (

          <div className="trade-admin-alert trade-admin-alert--error">
            {error}
          </div>

        )}


        {success && (

          <div className="trade-admin-alert trade-admin-alert--success">
            {success}
          </div>

        )}


        {/* ====================================================
            PAGE SETTINGS
        ===================================================== */}

        <section className="trade-admin-section">

          <div className="trade-admin-section__heading">

            <div className="trade-admin-section__icon">
              <Globe2
                size={20}
              />
            </div>

            <div>

              <h2>
                Page Settings
              </h2>

              <p>
                Control the page title and publishing status.
              </p>

            </div>

          </div>


          <div className="trade-admin-grid trade-admin-grid--2">

            <label className="trade-admin-field">

              <span>
                Internal Page Title
              </span>

              <input
                type="text"
                value={
                  title
                }
                onChange={
                  (
                    event
                  ) =>
                    setTitle(
                      event.target.value
                    )
                }
              />

            </label>


            <label className="trade-admin-field">

              <span>
                Status
              </span>

              <select
                value={
                  status
                }
                onChange={
                  (
                    event
                  ) =>
                    setStatus(
                      event.target.value
                    )
                }
              >

                <option value="draft">
                  Draft
                </option>

                <option value="published">
                  Published
                </option>

                <option value="archived">
                  Archived
                </option>

              </select>

            </label>

          </div>


          <div className="trade-admin-meta">
            Last updated: {formattedUpdatedAt}
          </div>

        </section>


        {/* ====================================================
            HERO
        ===================================================== */}

        <section className="trade-admin-section">

          <div className="trade-admin-section__heading">

            <div className="trade-admin-section__icon">
              <Handshake
                size={20}
              />
            </div>

            <div>

              <h2>
                Hero Section
              </h2>

              <p>
                Edit the main headline, description, buttons and image.
              </p>

            </div>

          </div>


          <div className="trade-admin-grid trade-admin-grid--2">

            <label className="trade-admin-field">

              <span>
                Eyebrow
              </span>

              <input
                type="text"
                value={
                  content.hero.eyebrow
                }
                onChange={
                  (
                    event
                  ) =>
                    updateSectionField(
                      "hero",
                      "eyebrow",
                      event.target.value
                    )
                }
              />

            </label>


            <label className="trade-admin-field">

              <span>
                Hero Image
              </span>

              <input
                type="text"
                value={
                  content.hero.image
                }
                onChange={
                  (
                    event
                  ) =>
                    updateSectionField(
                      "hero",
                      "image",
                      event.target.value
                    )
                }
              />

            </label>


            <label className="trade-admin-field">

              <span>
                Title Line 1
              </span>

              <input
                type="text"
                value={
                  content.hero.titleLine1
                }
                onChange={
                  (
                    event
                  ) =>
                    updateSectionField(
                      "hero",
                      "titleLine1",
                      event.target.value
                    )
                }
              />

            </label>


            <label className="trade-admin-field">

              <span>
                Title Line 2
              </span>

              <input
                type="text"
                value={
                  content.hero.titleLine2
                }
                onChange={
                  (
                    event
                  ) =>
                    updateSectionField(
                      "hero",
                      "titleLine2",
                      event.target.value
                    )
                }
              />

            </label>


            <label className="trade-admin-field">

              <span>
                Highlighted Title
              </span>

              <input
                type="text"
                value={
                  content.hero.titleHighlight
                }
                onChange={
                  (
                    event
                  ) =>
                    updateSectionField(
                      "hero",
                      "titleHighlight",
                      event.target.value
                    )
                }
              />

            </label>


            <label className="trade-admin-field">

              <span>
                Primary Button Text
              </span>

              <input
                type="text"
                value={
                  content.hero.primaryButtonText
                }
                onChange={
                  (
                    event
                  ) =>
                    updateSectionField(
                      "hero",
                      "primaryButtonText",
                      event.target.value
                    )
                }
              />

            </label>


            <label className="trade-admin-field">

              <span>
                Primary Button Link
              </span>

              <input
                type="text"
                value={
                  content.hero.primaryButtonLink
                }
                onChange={
                  (
                    event
                  ) =>
                    updateSectionField(
                      "hero",
                      "primaryButtonLink",
                      event.target.value
                    )
                }
              />

            </label>


            <label className="trade-admin-field">

              <span>
                Secondary Button Text
              </span>

              <input
                type="text"
                value={
                  content.hero.secondaryButtonText
                }
                onChange={
                  (
                    event
                  ) =>
                    updateSectionField(
                      "hero",
                      "secondaryButtonText",
                      event.target.value
                    )
                }
              />

            </label>

          </div>


          <label className="trade-admin-field">

            <span>
              Hero Description
            </span>

            <textarea
              rows="5"
              value={
                content.hero.description
              }
              onChange={
                (
                  event
                ) =>
                  updateSectionField(
                    "hero",
                    "description",
                    event.target.value
                  )
              }
            />

          </label>


          {content.hero.image && (

            <div className="trade-admin-image-preview">

              <img
                src={
                  content.hero.image
                }
                alt=""
              />

            </div>

          )}

        </section>


        {/* ====================================================
            HIGHLIGHTS
        ===================================================== */}

        <section className="trade-admin-section">

          <div className="trade-admin-section__heading">

            <div className="trade-admin-section__icon">
              <Building2
                size={20}
              />
            </div>

            <div>

              <h2>
                Hero Highlights
              </h2>

              <p>
                Manage the short value statements displayed under the hero.
              </p>

            </div>

          </div>


          <div className="trade-admin-repeat">

            {content.highlights.map(
              (
                item,
                index
              ) => (

                <div
                  className="trade-admin-repeat__row"
                  key={
                    `highlight-${index}`
                  }
                >

                  <input
                    type="text"
                    value={
                      item.title
                    }
                    onChange={
                      (
                        event
                      ) =>
                        updateHighlight(
                          index,
                          event.target.value
                        )
                    }
                  />

                  <button
                    type="button"
                    className="trade-admin-icon-button trade-admin-icon-button--danger"
                    onClick={
                      () =>
                        removeHighlight(
                          index
                        )
                    }
                  >

                    <Trash2
                      size={17}
                    />

                  </button>

                </div>

              )
            )}

          </div>


          <button
            type="button"
            className="trade-admin-add-button"
            onClick={
              addHighlight
            }
          >

            <Plus
              size={17}
            />

            Add Highlight

          </button>

        </section>


        {/* ====================================================
            TRUST ORGANIZATIONS
        ===================================================== */}

        <section className="trade-admin-section">

          <div className="trade-admin-section__heading">

            <div className="trade-admin-section__icon">
              <Users
                size={20}
              />
            </div>

            <div>

              <h2>
                Organization Strip
              </h2>

              <p>
                Manage the organizations shown beneath the hero.
                Only display organizations that Continental Founders
                is authorized to present in this context.
              </p>

            </div>

          </div>


          <label className="trade-admin-field">

            <span>
              Section Label
            </span>

            <input
              type="text"
              value={
                content.trust.label
              }
              onChange={
                (
                  event
                ) =>
                  updateSectionField(
                    "trust",
                    "label",
                    event.target.value
                  )
              }
            />

          </label>


          <div className="trade-admin-repeat">

            {content.trust.organizations.map(
              (
                organization,
                index
              ) => (

                <div
                  className="trade-admin-repeat__row"
                  key={
                    `organization-${index}`
                  }
                >

                  <input
                    type="text"
                    value={
                      organization
                    }
                    onChange={
                      (
                        event
                      ) =>
                        updateOrganization(
                          index,
                          event.target.value
                        )
                    }
                  />

                  <button
                    type="button"
                    className="trade-admin-icon-button trade-admin-icon-button--danger"
                    onClick={
                      () =>
                        removeOrganization(
                          index
                        )
                    }
                  >

                    <Trash2
                      size={17}
                    />

                  </button>

                </div>

              )
            )}

          </div>


          <button
            type="button"
            className="trade-admin-add-button"
            onClick={
              addOrganization
            }
          >

            <Plus
              size={17}
            />

            Add Organization

          </button>

        </section>


        {/* ====================================================
            INTRO
        ===================================================== */}

        <section className="trade-admin-section">

          <div className="trade-admin-section__heading">

            <div className="trade-admin-section__icon">
              <Globe2
                size={20}
              />
            </div>

            <div>

              <h2>
                Cross-Border Opportunity
              </h2>

              <p>
                Manage the introductory business opportunity section.
              </p>

            </div>

          </div>


          <div className="trade-admin-grid trade-admin-grid--2">

            <label className="trade-admin-field">

              <span>
                Eyebrow
              </span>

              <input
                type="text"
                value={
                  content.intro.eyebrow
                }
                onChange={
                  (
                    event
                  ) =>
                    updateSectionField(
                      "intro",
                      "eyebrow",
                      event.target.value
                    )
                }
              />

            </label>


            <label className="trade-admin-field">

              <span>
                Image
              </span>

              <input
                type="text"
                value={
                  content.intro.image
                }
                onChange={
                  (
                    event
                  ) =>
                    updateSectionField(
                      "intro",
                      "image",
                      event.target.value
                    )
                }
              />

            </label>


            <label className="trade-admin-field trade-admin-field--full">

              <span>
                Heading
              </span>

              <input
                type="text"
                value={
                  content.intro.title
                }
                onChange={
                  (
                    event
                  ) =>
                    updateSectionField(
                      "intro",
                      "title",
                      event.target.value
                    )
                }
              />

            </label>


            <label className="trade-admin-field">

              <span>
                Image Caption
              </span>

              <input
                type="text"
                value={
                  content.intro.imageCaption
                }
                onChange={
                  (
                    event
                  ) =>
                    updateSectionField(
                      "intro",
                      "imageCaption",
                      event.target.value
                    )
                }
              />

            </label>


            <label className="trade-admin-field">

              <span>
                Button Text
              </span>

              <input
                type="text"
                value={
                  content.intro.buttonText
                }
                onChange={
                  (
                    event
                  ) =>
                    updateSectionField(
                      "intro",
                      "buttonText",
                      event.target.value
                    )
                }
              />

            </label>


            <label className="trade-admin-field">

              <span>
                Button Link
              </span>

              <input
                type="text"
                value={
                  content.intro.buttonLink
                }
                onChange={
                  (
                    event
                  ) =>
                    updateSectionField(
                      "intro",
                      "buttonLink",
                      event.target.value
                    )
                }
              />

            </label>

          </div>


          <label className="trade-admin-field">

            <span>
              Paragraph 1
            </span>

            <textarea
              rows="5"
              value={
                content.intro.paragraph1
              }
              onChange={
                (
                  event
                ) =>
                  updateSectionField(
                    "intro",
                    "paragraph1",
                    event.target.value
                  )
              }
            />

          </label>


          <label className="trade-admin-field">

            <span>
              Paragraph 2
            </span>

            <textarea
              rows="5"
              value={
                content.intro.paragraph2
              }
              onChange={
                (
                  event
                ) =>
                  updateSectionField(
                    "intro",
                    "paragraph2",
                    event.target.value
                  )
              }
            />

          </label>

        </section>


        {/* ====================================================
            STATS
        ===================================================== */}

        <section className="trade-admin-section">

          <div className="trade-admin-section__heading">

            <div className="trade-admin-section__icon">
              <Globe2
                size={20}
              />
            </div>

            <div>

              <h2>
                Statistics
              </h2>

              <p>
                Edit the statistics shown beside the opportunity section.
              </p>

            </div>

          </div>


          <div className="trade-admin-card-grid">

            {content.stats.map(
              (
                stat,
                index
              ) => (

                <div
                  className="trade-admin-mini-card"
                  key={
                    `stat-${index}`
                  }
                >

                  <label className="trade-admin-field">

                    <span>
                      Value
                    </span>

                    <input
                      type="text"
                      value={
                        stat.value
                      }
                      onChange={
                        (
                          event
                        ) =>
                          updateStat(
                            index,
                            "value",
                            event.target.value
                          )
                      }
                    />

                  </label>


                  <label className="trade-admin-field">

                    <span>
                      Label
                    </span>

                    <input
                      type="text"
                      value={
                        stat.label
                      }
                      onChange={
                        (
                          event
                        ) =>
                          updateStat(
                            index,
                            "label",
                            event.target.value
                          )
                      }
                    />

                  </label>


                  <button
                    type="button"
                    className="trade-admin-delete-row"
                    onClick={
                      () =>
                        removeStat(
                          index
                        )
                    }
                  >

                    <Trash2
                      size={15}
                    />

                    Remove

                  </button>

                </div>

              )
            )}

          </div>


          <button
            type="button"
            className="trade-admin-add-button"
            onClick={
              addStat
            }
          >

            <Plus
              size={17}
            />

            Add Statistic

          </button>

        </section>


        {/* ====================================================
            FEATURES
        ===================================================== */}

        <section className="trade-admin-section">

          <div className="trade-admin-section__heading">

            <div className="trade-admin-section__icon">
              <Building2
                size={20}
              />
            </div>

            <div>

              <h2>
                What the Network Enables
              </h2>

              <p>
                Manage the commercial opportunity cards.
              </p>

            </div>

          </div>


          <div className="trade-admin-grid trade-admin-grid--2">

            <label className="trade-admin-field">

              <span>
                Eyebrow
              </span>

              <input
                type="text"
                value={
                  content.features.eyebrow
                }
                onChange={
                  (
                    event
                  ) =>
                    updateSectionField(
                      "features",
                      "eyebrow",
                      event.target.value
                    )
                }
              />

            </label>


            <label className="trade-admin-field">

              <span>
                Heading
              </span>

              <input
                type="text"
                value={
                  content.features.title
                }
                onChange={
                  (
                    event
                  ) =>
                    updateSectionField(
                      "features",
                      "title",
                      event.target.value
                    )
                }
              />

            </label>

          </div>


          <label className="trade-admin-field">

            <span>
              Description
            </span>

            <textarea
              rows="4"
              value={
                content.features.description
              }
              onChange={
                (
                  event
                ) =>
                  updateSectionField(
                    "features",
                    "description",
                    event.target.value
                  )
              }
            />

          </label>


          <div className="trade-admin-card-grid">

            {content.features.items.map(
              (
                item,
                index
              ) => (

                <div
                  className="trade-admin-mini-card"
                  key={
                    `feature-${index}`
                  }
                >

                  <label className="trade-admin-field">

                    <span>
                      Title
                    </span>

                    <input
                      type="text"
                      value={
                        item.title
                      }
                      onChange={
                        (
                          event
                        ) =>
                          updateArrayItemField(
                            "features",
                            index,
                            "title",
                            event.target.value
                          )
                      }
                    />

                  </label>


                  <label className="trade-admin-field">

                    <span>
                      Description
                    </span>

                    <textarea
                      rows="4"
                      value={
                        item.description
                      }
                      onChange={
                        (
                          event
                        ) =>
                          updateArrayItemField(
                            "features",
                            index,
                            "description",
                            event.target.value
                          )
                      }
                    />

                  </label>


                  <label className="trade-admin-field">

                    <span>
                      Image
                    </span>

                    <input
                      type="text"
                      value={
                        item.image
                      }
                      onChange={
                        (
                          event
                        ) =>
                          updateArrayItemField(
                            "features",
                            index,
                            "image",
                            event.target.value
                          )
                      }
                    />

                  </label>


                  {item.image && (

                    <div className="trade-admin-small-image">

                      <img
                        src={
                          item.image
                        }
                        alt=""
                      />

                    </div>

                  )}


                  <button
                    type="button"
                    className="trade-admin-delete-row"
                    onClick={
                      () =>
                        removeFeature(
                          index
                        )
                    }
                  >

                    <Trash2
                      size={15}
                    />

                    Remove

                  </button>

                </div>

              )
            )}

          </div>


          <button
            type="button"
            className="trade-admin-add-button"
            onClick={
              addFeature
            }
          >

            <Plus
              size={17}
            />

            Add Feature

          </button>

        </section>


        {/* ====================================================
            NETWORK
        ===================================================== */}

        <section className="trade-admin-section">

          <div className="trade-admin-section__heading">

            <div className="trade-admin-section__icon">
              <Users
                size={20}
              />
            </div>

            <div>

              <h2>
                Who We Work With
              </h2>

              <p>
                Manage the groups represented in the network.
              </p>

            </div>

          </div>


          <div className="trade-admin-grid trade-admin-grid--2">

            <label className="trade-admin-field">

              <span>
                Eyebrow
              </span>

              <input
                type="text"
                value={
                  content.network.eyebrow
                }
                onChange={
                  (
                    event
                  ) =>
                    updateSectionField(
                      "network",
                      "eyebrow",
                      event.target.value
                    )
                }
              />

            </label>


            <label className="trade-admin-field">

              <span>
                Title Line 1
              </span>

              <input
                type="text"
                value={
                  content.network.titleLine1
                }
                onChange={
                  (
                    event
                  ) =>
                    updateSectionField(
                      "network",
                      "titleLine1",
                      event.target.value
                    )
                }
              />

            </label>


            <label className="trade-admin-field">

              <span>
                Title Line 2
              </span>

              <input
                type="text"
                value={
                  content.network.titleLine2
                }
                onChange={
                  (
                    event
                  ) =>
                    updateSectionField(
                      "network",
                      "titleLine2",
                      event.target.value
                    )
                }
              />

            </label>

          </div>


          <label className="trade-admin-field">

            <span>
              Description
            </span>

            <textarea
              rows="4"
              value={
                content.network.description
              }
              onChange={
                (
                  event
                ) =>
                  updateSectionField(
                    "network",
                    "description",
                    event.target.value
                  )
              }
            />

          </label>


          <div className="trade-admin-repeat">

            {content.network.items.map(
              (
                item,
                index
              ) => (

                <div
                  className="trade-admin-repeat__row"
                  key={
                    `network-${index}`
                  }
                >

                  <input
                    type="text"
                    value={
                      item
                    }
                    onChange={
                      (
                        event
                      ) =>
                        updateSimpleArrayItem(
                          "network",
                          index,
                          event.target.value
                        )
                    }
                  />

                  <button
                    type="button"
                    className="trade-admin-icon-button trade-admin-icon-button--danger"
                    onClick={
                      () =>
                        removeNetworkItem(
                          index
                        )
                    }
                  >

                    <Trash2
                      size={17}
                    />

                  </button>

                </div>

              )
            )}

          </div>


          <button
            type="button"
            className="trade-admin-add-button"
            onClick={
              addNetworkItem
            }
          >

            <Plus
              size={17}
            />

            Add Group

          </button>

        </section>


        {/* ====================================================
            CTA
        ===================================================== */}

        <section className="trade-admin-section">

          <div className="trade-admin-section__heading">

            <div className="trade-admin-section__icon">
              <ImageIcon
                size={20}
              />
            </div>

            <div>

              <h2>
                Final CTA
              </h2>

              <p>
                Manage the final call-to-action section.
              </p>

            </div>

          </div>


          <div className="trade-admin-grid trade-admin-grid--2">

            <label className="trade-admin-field">

              <span>
                Eyebrow
              </span>

              <input
                type="text"
                value={
                  content.cta.eyebrow
                }
                onChange={
                  (
                    event
                  ) =>
                    updateSectionField(
                      "cta",
                      "eyebrow",
                      event.target.value
                    )
                }
              />

            </label>


            <label className="trade-admin-field">

              <span>
                Background Image
              </span>

              <input
                type="text"
                value={
                  content.cta.image
                }
                onChange={
                  (
                    event
                  ) =>
                    updateSectionField(
                      "cta",
                      "image",
                      event.target.value
                    )
                }
              />

            </label>


            <label className="trade-admin-field">

              <span>
                Title Line 1
              </span>

              <input
                type="text"
                value={
                  content.cta.titleLine1
                }
                onChange={
                  (
                    event
                  ) =>
                    updateSectionField(
                      "cta",
                      "titleLine1",
                      event.target.value
                    )
                }
              />

            </label>


            <label className="trade-admin-field">

              <span>
                Title Line 2
              </span>

              <input
                type="text"
                value={
                  content.cta.titleLine2
                }
                onChange={
                  (
                    event
                  ) =>
                    updateSectionField(
                      "cta",
                      "titleLine2",
                      event.target.value
                    )
                }
              />

            </label>


            <label className="trade-admin-field">

              <span>
                Button Text
              </span>

              <input
                type="text"
                value={
                  content.cta.buttonText
                }
                onChange={
                  (
                    event
                  ) =>
                    updateSectionField(
                      "cta",
                      "buttonText",
                      event.target.value
                    )
                }
              />

            </label>


            <label className="trade-admin-field">

              <span>
                Button Link
              </span>

              <input
                type="text"
                value={
                  content.cta.buttonLink
                }
                onChange={
                  (
                    event
                  ) =>
                    updateSectionField(
                      "cta",
                      "buttonLink",
                      event.target.value
                    )
                }
              />

            </label>

          </div>


          <label className="trade-admin-field">

            <span>
              Description
            </span>

            <textarea
              rows="5"
              value={
                content.cta.description
              }
              onChange={
                (
                  event
                ) =>
                  updateSectionField(
                    "cta",
                    "description",
                    event.target.value
                  )
              }
            />

          </label>


          {content.cta.image && (

            <div className="trade-admin-image-preview">

              <img
                src={
                  content.cta.image
                }
                alt=""
              />

            </div>

          )}

        </section>


        {/* ====================================================
            SAVE FOOTER
        ===================================================== */}

        <div className="trade-admin-save-footer">

          <div>

            <strong>
              Page status:
            </strong>

            {" "}

            {status}

          </div>


          <button
            type="submit"
            className="trade-admin-button trade-admin-button--primary"
            disabled={
              saving
            }
          >

            {saving ? (

              <RefreshCw
                size={17}
                className="trade-admin-spin"
              />

            ) : (

              <Save
                size={17}
              />

            )}

            {saving
              ? "Saving..."
              : "Save Changes"}

          </button>

        </div>

      </form>

    </div>

  );

}