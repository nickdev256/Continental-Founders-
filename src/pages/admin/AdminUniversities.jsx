import React, {
  useMemo,
  useState,
} from "react";

import {
  Building2,
  ChevronRight,
  GraduationCap,
  Link2,
  MapPin,
  Plus,
  Search,
  Users,
  X,
} from "lucide-react";

import "./AdminUniversities.css";


// ============================================================
// CONTINENTAL FOUNDERS
// ADMIN UNIVERSITIES
// ============================================================

export default function AdminUniversities() {

  // ==========================================================
  // STATE
  // ==========================================================

  const [
    searchQuery,
    setSearchQuery,
  ] =
    useState("");


  const [
    selectedUniversity,
    setSelectedUniversity,
  ] =
    useState(null);


  // ==========================================================
  // UNIVERSITY DATA
  //
  // Keep empty until connected to the backend API.
  // ==========================================================

  const [
    universities,
  ] =
    useState([]);


  // ==========================================================
  // FILTER UNIVERSITIES
  // ==========================================================

  const filteredUniversities =
    useMemo(
      () => {

        const query =
          searchQuery
            .trim()
            .toLowerCase();


        if (
          !query
        ) {

          return universities;

        }


        return universities.filter(
          (
            university
          ) => {

            const searchableText = [
              university.name,
              university.universityName,
              university.university_name,
              university.country,
              university.city,
              university.location,
              university.type,
              university.status,
              university.description,
              university.website,
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();


            return searchableText.includes(
              query
            );

          }
        );

      },
      [
        universities,
        searchQuery,
      ]
    );


  // ==========================================================
  // UNIVERSITY NAME
  // ==========================================================

  function getUniversityName(
    university
  ) {

    return (
      university?.name ||
      university?.universityName ||
      university?.university_name ||
      "Unnamed University"
    );

  }


  // ==========================================================
  // UNIVERSITY LOCATION
  // ==========================================================

  function getUniversityLocation(
    university
  ) {

    const combinedLocation =
      [
        university?.city,
        university?.country,
      ]
        .filter(Boolean)
        .join(", ")
        .trim();


    return (
      university?.location ||
      combinedLocation ||
      "Location not provided"
    );

  }


  // ==========================================================
  // STATUS CLASS
  // ==========================================================

  function getStatusClass(
    status
  ) {

    const normalized =
      String(
        status || ""
      )
        .trim()
        .toLowerCase();


    if (
      normalized === "active" ||
      normalized === "published" ||
      normalized === "partner"
    ) {

      return "admin-universities__status admin-universities__status--active";

    }


    if (
      normalized === "pending"
    ) {

      return "admin-universities__status admin-universities__status--pending";

    }


    if (
      normalized === "draft"
    ) {

      return "admin-universities__status admin-universities__status--draft";

    }


    if (
      normalized === "inactive" ||
      normalized === "archived"
    ) {

      return "admin-universities__status admin-universities__status--inactive";

    }


    return "admin-universities__status";

  }


  // ==========================================================
  // ACTIVE PARTNERS COUNT
  // ==========================================================

  const activeCount =
    universities.filter(
      (
        university
      ) => {

        const status =
          String(
            university.status || ""
          ).toLowerCase();


        return (
          status === "active" ||
          status === "published" ||
          status === "partner"
        );

      }
    ).length;


  // ==========================================================
  // PENDING COUNT
  // ==========================================================

  const pendingCount =
    universities.filter(
      (
        university
      ) =>
        String(
          university.status || ""
        ).toLowerCase() ===
        "pending"
    ).length;


  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <div className="admin-universities">

      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <div className="admin-universities__header">

        <div>

          <span className="admin-universities__eyebrow">
            PARTNER ECOSYSTEM
          </span>


          <h1>
            Universities
          </h1>


          <p>
            Manage university partnerships,
            academic institutions, research relationships,
            faculty engagement, and institutional collaboration.
          </p>

        </div>


        <button
          type="button"
          className="admin-universities__create"
          onClick={() => {

            console.log(
              "Add university"
            );

          }}
        >

          <Plus
            size={18}
            strokeWidth={1.8}
          />


          <span>
            Add University
          </span>

        </button>

      </div>


      {/* ======================================================
          SUMMARY
      ====================================================== */}

      <div className="admin-universities__summary-grid">

        <div className="admin-universities__summary-card">

          <div className="admin-universities__summary-icon">

            <GraduationCap
              size={21}
              strokeWidth={1.6}
            />

          </div>


          <div>

            <strong>
              {universities.length}
            </strong>

            <span>
              Total Universities
            </span>

          </div>

        </div>


        <div className="admin-universities__summary-card">

          <div className="admin-universities__summary-icon">

            <Building2
              size={21}
              strokeWidth={1.6}
            />

          </div>


          <div>

            <strong>
              {activeCount}
            </strong>

            <span>
              Active Partners
            </span>

          </div>

        </div>


        <div className="admin-universities__summary-card">

          <div className="admin-universities__summary-icon">

            <Users
              size={21}
              strokeWidth={1.6}
            />

          </div>


          <div>

            <strong>
              {pendingCount}
            </strong>

            <span>
              Pending
            </span>

          </div>

        </div>

      </div>


      {/* ======================================================
          TOOLBAR
      ====================================================== */}

      <div className="admin-universities__toolbar">

        <div className="admin-universities__search">

          <Search
            size={18}
            strokeWidth={1.6}
            aria-hidden="true"
          />


          <input
            type="search"
            value={
              searchQuery
            }
            placeholder="Search universities..."
            aria-label="Search universities"
            onChange={(
              event
            ) =>
              setSearchQuery(
                event.target.value
              )
            }
          />


          {searchQuery && (

            <button
              type="button"
              onClick={() =>
                setSearchQuery("")
              }
              aria-label="Clear search"
            >

              <X
                size={16}
                strokeWidth={1.7}
              />

            </button>

          )}

        </div>


        <div className="admin-universities__count">

          {filteredUniversities.length}

          {" "}

          {filteredUniversities.length === 1
            ? "university"
            : "universities"}

        </div>

      </div>


      {/* ======================================================
          UNIVERSITIES PANEL
      ====================================================== */}

      <section className="admin-universities__panel">

        <div className="admin-universities__table-header">

          <span>
            University
          </span>

          <span>
            Location
          </span>

          <span>
            Type
          </span>

          <span>
            Status
          </span>

          <span />

        </div>


        {filteredUniversities.length === 0 ? (

          <div className="admin-universities__empty">

            <div className="admin-universities__empty-icon">

              <GraduationCap
                size={30}
                strokeWidth={1.5}
              />

            </div>


            <h3>

              {searchQuery
                ? "No matching universities"
                : "No universities yet"}

            </h3>


            <p>

              {searchQuery
                ? "Try another university name, location, type, or status."
                : "University partners created through the Continental Founders CMS will appear here."}

            </p>


            {!searchQuery && (

              <button
                type="button"
                onClick={() => {

                  console.log(
                    "Add first university"
                  );

                }}
              >

                <Plus
                  size={17}
                  strokeWidth={1.8}
                />

                Add first university

              </button>

            )}

          </div>

        ) : (

          <div className="admin-universities__list">

            {filteredUniversities.map(
              (
                university,
                index
              ) => {

                const universityId =
                  university.id ||
                  `${getUniversityName(university)}-${index}`;


                return (

                  <button
                    key={
                      universityId
                    }
                    type="button"
                    className="admin-universities__row"
                    onClick={() =>
                      setSelectedUniversity(
                        university
                      )
                    }
                  >

                    <div className="admin-universities__university">

                      <div className="admin-universities__logo">

                        {university.logo ||
                        university.logoUrl ||
                        university.logo_url ? (

                          <img
                            src={
                              university.logo ||
                              university.logoUrl ||
                              university.logo_url
                            }
                            alt={`${getUniversityName(
                              university
                            )} logo`}
                          />

                        ) : (

                          <GraduationCap
                            size={19}
                            strokeWidth={1.6}
                          />

                        )}

                      </div>


                      <div>

                        <strong>
                          {getUniversityName(
                            university
                          )}
                        </strong>


                        <span>
                          {university.shortName ||
                            university.short_name ||
                            university.category ||
                            "University Partner"}
                        </span>

                      </div>

                    </div>


                    <div className="admin-universities__location">

                      <MapPin
                        size={14}
                        strokeWidth={1.6}
                      />


                      <span>
                        {getUniversityLocation(
                          university
                        )}
                      </span>

                    </div>


                    <div className="admin-universities__type">

                      <Building2
                        size={14}
                        strokeWidth={1.6}
                      />


                      <span>
                        {university.type ||
                          "University"}
                      </span>

                    </div>


                    <div>

                      <span
                        className={
                          getStatusClass(
                            university.status
                          )
                        }
                      >

                        {university.status ||
                          "Active"}

                      </span>

                    </div>


                    <div className="admin-universities__arrow">

                      <ChevronRight
                        size={17}
                        strokeWidth={1.7}
                      />

                    </div>

                  </button>

                );

              }
            )}

          </div>

        )}

      </section>


      {/* ======================================================
          UNIVERSITY DETAIL DRAWER
      ====================================================== */}

      {selectedUniversity && (

        <div
          className="admin-universities__overlay"
          onClick={() =>
            setSelectedUniversity(
              null
            )
          }
          role="presentation"
        >

          <aside
            className="admin-universities__drawer"
            onClick={(
              event
            ) =>
              event.stopPropagation()
            }
            aria-label="University details"
          >

            <div className="admin-universities__drawer-header">

              <div>

                <span className="admin-universities__drawer-eyebrow">
                  UNIVERSITY PARTNER
                </span>


                <h2>
                  {getUniversityName(
                    selectedUniversity
                  )}
                </h2>

              </div>


              <button
                type="button"
                className="admin-universities__drawer-close"
                onClick={() =>
                  setSelectedUniversity(
                    null
                  )
                }
                aria-label="Close university details"
              >

                <X
                  size={20}
                  strokeWidth={1.7}
                />

              </button>

            </div>


            <div className="admin-universities__drawer-body">

              {/* ===============================================
                  UNIVERSITY PROFILE
              =============================================== */}

              <div className="admin-universities__profile">

                <div className="admin-universities__profile-logo">

                  {selectedUniversity.logo ||
                  selectedUniversity.logoUrl ||
                  selectedUniversity.logo_url ? (

                    <img
                      src={
                        selectedUniversity.logo ||
                        selectedUniversity.logoUrl ||
                        selectedUniversity.logo_url
                      }
                      alt={`${getUniversityName(
                        selectedUniversity
                      )} logo`}
                    />

                  ) : (

                    <GraduationCap
                      size={40}
                      strokeWidth={1.4}
                    />

                  )}

                </div>


                <div>

                  <h3>
                    {getUniversityName(
                      selectedUniversity
                    )}
                  </h3>


                  <p>
                    {getUniversityLocation(
                      selectedUniversity
                    )}
                  </p>

                </div>

              </div>


              {/* ===============================================
                  STATUS
              =============================================== */}

              <div className="admin-universities__detail-row">

                <span>
                  Partnership Status
                </span>


                <span
                  className={
                    getStatusClass(
                      selectedUniversity.status
                    )
                  }
                >

                  {selectedUniversity.status ||
                    "Active"}

                </span>

              </div>


              {/* ===============================================
                  LOCATION
              =============================================== */}

              <div className="admin-universities__detail-card">

                <MapPin
                  size={18}
                  strokeWidth={1.6}
                />


                <div>

                  <span>
                    Location
                  </span>

                  <strong>
                    {getUniversityLocation(
                      selectedUniversity
                    )}
                  </strong>

                </div>

              </div>


              {/* ===============================================
                  TYPE
              =============================================== */}

              <div className="admin-universities__detail-card">

                <Building2
                  size={18}
                  strokeWidth={1.6}
                />


                <div>

                  <span>
                    Institution Type
                  </span>

                  <strong>
                    {selectedUniversity.type ||
                      "University"}
                  </strong>

                </div>

              </div>


              {/* ===============================================
                  WEBSITE
              =============================================== */}

              <div className="admin-universities__detail-card">

                <Link2
                  size={18}
                  strokeWidth={1.6}
                />


                <div>

                  <span>
                    Website
                  </span>


                  {selectedUniversity.website ? (

                    <a
                      href={
                        selectedUniversity.website
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {selectedUniversity.website}
                    </a>

                  ) : (

                    <strong>
                      Not provided
                    </strong>

                  )}

                </div>

              </div>


              {/* ===============================================
                  DESCRIPTION
              =============================================== */}

              <div className="admin-universities__description">

                <span>
                  Partnership Overview
                </span>


                <p>

                  {selectedUniversity.description ||
                    selectedUniversity.overview ||
                    "No university partnership description has been added yet."}

                </p>

              </div>


              {/* ===============================================
                  PARTICIPATION AREAS
              =============================================== */}

              <div className="admin-universities__participation">

                <span>
                  Participation Areas
                </span>


                <div className="admin-universities__participation-list">

                  {
                    Array.isArray(
                      selectedUniversity.participationAreas
                    ) &&
                    selectedUniversity.participationAreas.length > 0 ? (

                      selectedUniversity.participationAreas.map(
                        (
                          area,
                          index
                        ) => (

                          <div
                            key={`${area}-${index}`}
                            className="admin-universities__participation-item"
                          >

                            {area}

                          </div>

                        )
                      )

                    ) : (

                      <>
                        <div className="admin-universities__participation-item">
                          Faculty Expertise
                        </div>

                        <div className="admin-universities__participation-item">
                          Research Collaboration
                        </div>

                        <div className="admin-universities__participation-item">
                          Student Engagement
                        </div>

                        <div className="admin-universities__participation-item">
                          Institutional Partnerships
                        </div>
                      </>

                    )
                  }

                </div>

              </div>


              {/* ===============================================
                  ACTIONS
              =============================================== */}

              <div className="admin-universities__drawer-actions">

                <button
                  type="button"
                  className="admin-universities__edit"
                  onClick={() => {

                    console.log(
                      "Edit university:",
                      selectedUniversity
                    );

                  }}
                >

                  Edit University

                </button>

              </div>

            </div>

          </aside>

        </div>

      )}

    </div>

  );

}