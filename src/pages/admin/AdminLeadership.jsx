import React, {
  useMemo,
  useState,
} from "react";

import {
  BriefcaseBusiness,
  ChevronRight,
  Mail,
  Plus,
  Search,
  UserRound,
  Users,
  X,
} from "lucide-react";

import "./AdminLeadership.css";


// ============================================================
// CONTINENTAL FOUNDERS
// ADMIN LEADERSHIP
// ============================================================

export default function AdminLeadership() {

  // ==========================================================
  // STATE
  // ==========================================================

  const [
    searchQuery,
    setSearchQuery,
  ] =
    useState("");


  const [
    selectedLeader,
    setSelectedLeader,
  ] =
    useState(null);


  // ==========================================================
  // LEADERSHIP DATA
  //
  // Keep empty until we connect this page to the backend.
  // ==========================================================

  const [
    leaders,
  ] =
    useState([]);


  // ==========================================================
  // FILTER LEADERS
  // ==========================================================

  const filteredLeaders =
    useMemo(
      () => {

        const query =
          searchQuery
            .trim()
            .toLowerCase();


        if (
          !query
        ) {

          return leaders;

        }


        return leaders.filter(
          (
            leader
          ) => {

            const searchableText = [
              leader.name,
              leader.fullName,
              leader.full_name,
              leader.title,
              leader.role,
              leader.position,
              leader.email,
              leader.bio,
              leader.status,
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
        leaders,
        searchQuery,
      ]
    );


  // ==========================================================
  // LEADER NAME
  // ==========================================================

  function getLeaderName(
    leader
  ) {

    return (
      leader?.name ||
      leader?.fullName ||
      leader?.full_name ||
      "Unnamed Leader"
    );

  }


  // ==========================================================
  // LEADER ROLE
  // ==========================================================

  function getLeaderRole(
    leader
  ) {

    return (
      leader?.title ||
      leader?.position ||
      leader?.role ||
      "Leadership Team"
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
      normalized === "published"
    ) {

      return "admin-leadership__status admin-leadership__status--active";

    }


    if (
      normalized === "draft"
    ) {

      return "admin-leadership__status admin-leadership__status--draft";

    }


    if (
      normalized === "inactive" ||
      normalized === "archived"
    ) {

      return "admin-leadership__status admin-leadership__status--inactive";

    }


    return "admin-leadership__status";

  }


  // ==========================================================
  // ACTIVE COUNT
  // ==========================================================

  const activeCount =
    leaders.filter(
      (
        leader
      ) => {

        const status =
          String(
            leader.status || ""
          ).toLowerCase();


        return (
          status === "active" ||
          status === "published"
        );

      }
    ).length;


  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <div className="admin-leadership">

      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <div className="admin-leadership__header">

        <div>

          <span className="admin-leadership__eyebrow">
            ORGANIZATION
          </span>


          <h1>
            Leadership
          </h1>


          <p>
            Manage the Continental Founders leadership
            team, founders, executive profiles,
            biographies, and website visibility.
          </p>

        </div>


        <button
          type="button"
          className="admin-leadership__create"
          onClick={() => {

            console.log(
              "Add leader"
            );

          }}
        >

          <Plus
            size={18}
            strokeWidth={1.8}
          />


          <span>
            Add Leader
          </span>

        </button>

      </div>


      {/* ======================================================
          SUMMARY CARDS
      ====================================================== */}

      <div className="admin-leadership__summary-grid">

        <div className="admin-leadership__summary-card">

          <div className="admin-leadership__summary-icon">

            <Users
              size={20}
              strokeWidth={1.6}
            />

          </div>


          <div>

            <strong>
              {leaders.length}
            </strong>

            <span>
              Leadership Profiles
            </span>

          </div>

        </div>


        <div className="admin-leadership__summary-card">

          <div className="admin-leadership__summary-icon">

            <UserRound
              size={20}
              strokeWidth={1.6}
            />

          </div>


          <div>

            <strong>
              {activeCount}
            </strong>

            <span>
              Active Profiles
            </span>

          </div>

        </div>


        <div className="admin-leadership__summary-card">

          <div className="admin-leadership__summary-icon">

            <BriefcaseBusiness
              size={20}
              strokeWidth={1.6}
            />

          </div>


          <div>

            <strong>

              {
                leaders.filter(
                  (
                    leader
                  ) => {

                    const role =
                      String(
                        leader.role ||
                        leader.title ||
                        leader.position ||
                        ""
                      ).toLowerCase();


                    return role.includes(
                      "founder"
                    );

                  }
                ).length
              }

            </strong>

            <span>
              Founders
            </span>

          </div>

        </div>

      </div>


      {/* ======================================================
          TOOLBAR
      ====================================================== */}

      <div className="admin-leadership__toolbar">

        <div className="admin-leadership__search">

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
            placeholder="Search leadership..."
            aria-label="Search leadership profiles"
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


        <div className="admin-leadership__count">

          {filteredLeaders.length}

          {" "}

          {filteredLeaders.length === 1
            ? "profile"
            : "profiles"}

        </div>

      </div>


      {/* ======================================================
          LEADERSHIP PANEL
      ====================================================== */}

      <section className="admin-leadership__panel">

        <div className="admin-leadership__table-header">

          <span>
            Leader
          </span>

          <span>
            Position
          </span>

          <span>
            Email
          </span>

          <span>
            Status
          </span>

          <span />

        </div>


        {filteredLeaders.length === 0 ? (

          <div className="admin-leadership__empty">

            <div className="admin-leadership__empty-icon">

              <Users
                size={28}
                strokeWidth={1.5}
              />

            </div>


            <h3>

              {searchQuery
                ? "No matching leadership profiles"
                : "No leadership profiles yet"}

            </h3>


            <p>

              {searchQuery
                ? "Try another name, position, email address, or keyword."
                : "Leadership profiles created through the Continental Founders CMS will appear here."}

            </p>


            {!searchQuery && (

              <button
                type="button"
                onClick={() => {

                  console.log(
                    "Add first leader"
                  );

                }}
              >

                <Plus
                  size={17}
                  strokeWidth={1.8}
                />

                Add first leadership profile

              </button>

            )}

          </div>

        ) : (

          <div className="admin-leadership__list">

            {filteredLeaders.map(
              (
                leader,
                index
              ) => {

                const leaderId =
                  leader.id ||
                  `${getLeaderName(leader)}-${index}`;


                return (

                  <button
                    key={
                      leaderId
                    }
                    type="button"
                    className="admin-leadership__row"
                    onClick={() =>
                      setSelectedLeader(
                        leader
                      )
                    }
                  >

                    <div className="admin-leadership__person">

                      <div className="admin-leadership__avatar">

                        {leader.image ||
                        leader.imageUrl ||
                        leader.image_url ? (

                          <img
                            src={
                              leader.image ||
                              leader.imageUrl ||
                              leader.image_url
                            }
                            alt={
                              getLeaderName(
                                leader
                              )
                            }
                          />

                        ) : (

                          <UserRound
                            size={18}
                            strokeWidth={1.6}
                          />

                        )}

                      </div>


                      <div>

                        <strong>
                          {getLeaderName(
                            leader
                          )}
                        </strong>


                        <span>
                          {leader.department ||
                            "Continental Founders"}
                        </span>

                      </div>

                    </div>


                    <div className="admin-leadership__role">

                      <BriefcaseBusiness
                        size={14}
                        strokeWidth={1.6}
                      />


                      <span>
                        {getLeaderRole(
                          leader
                        )}
                      </span>

                    </div>


                    <div className="admin-leadership__email">

                      <Mail
                        size={14}
                        strokeWidth={1.6}
                      />


                      <span>
                        {leader.email ||
                          "Not provided"}
                      </span>

                    </div>


                    <div>

                      <span
                        className={
                          getStatusClass(
                            leader.status
                          )
                        }
                      >

                        {leader.status ||
                          "Active"}

                      </span>

                    </div>


                    <div className="admin-leadership__arrow">

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
          LEADERSHIP DETAIL DRAWER
      ====================================================== */}

      {selectedLeader && (

        <div
          className="admin-leadership__overlay"
          onClick={() =>
            setSelectedLeader(
              null
            )
          }
          role="presentation"
        >

          <aside
            className="admin-leadership__drawer"
            onClick={(
              event
            ) =>
              event.stopPropagation()
            }
            aria-label="Leadership profile details"
          >

            <div className="admin-leadership__drawer-header">

              <div>

                <span className="admin-leadership__drawer-eyebrow">
                  LEADERSHIP PROFILE
                </span>


                <h2>
                  {getLeaderName(
                    selectedLeader
                  )}
                </h2>

              </div>


              <button
                type="button"
                className="admin-leadership__drawer-close"
                onClick={() =>
                  setSelectedLeader(
                    null
                  )
                }
                aria-label="Close leadership profile"
              >

                <X
                  size={20}
                  strokeWidth={1.7}
                />

              </button>

            </div>


            <div className="admin-leadership__drawer-body">

              {/* ===============================================
                  PROFILE
              =============================================== */}

              <div className="admin-leadership__profile">

                <div className="admin-leadership__profile-image">

                  {selectedLeader.image ||
                  selectedLeader.imageUrl ||
                  selectedLeader.image_url ? (

                    <img
                      src={
                        selectedLeader.image ||
                        selectedLeader.imageUrl ||
                        selectedLeader.image_url
                      }
                      alt={
                        getLeaderName(
                          selectedLeader
                        )
                      }
                    />

                  ) : (

                    <UserRound
                      size={36}
                      strokeWidth={1.4}
                    />

                  )}

                </div>


                <div>

                  <h3>
                    {getLeaderName(
                      selectedLeader
                    )}
                  </h3>


                  <p>
                    {getLeaderRole(
                      selectedLeader
                    )}
                  </p>

                </div>

              </div>


              {/* ===============================================
                  STATUS
              =============================================== */}

              <div className="admin-leadership__detail-row">

                <span>
                  Status
                </span>


                <span
                  className={
                    getStatusClass(
                      selectedLeader.status
                    )
                  }
                >

                  {selectedLeader.status ||
                    "Active"}

                </span>

              </div>


              {/* ===============================================
                  POSITION
              =============================================== */}

              <div className="admin-leadership__detail-card">

                <BriefcaseBusiness
                  size={18}
                  strokeWidth={1.6}
                />


                <div>

                  <span>
                    Position
                  </span>

                  <strong>
                    {getLeaderRole(
                      selectedLeader
                    )}
                  </strong>

                </div>

              </div>


              {/* ===============================================
                  EMAIL
              =============================================== */}

              <div className="admin-leadership__detail-card">

                <Mail
                  size={18}
                  strokeWidth={1.6}
                />


                <div>

                  <span>
                    Email
                  </span>


                  {selectedLeader.email ? (

                    <a
                      href={`mailto:${selectedLeader.email}`}
                    >
                      {selectedLeader.email}
                    </a>

                  ) : (

                    <strong>
                      Not provided
                    </strong>

                  )}

                </div>

              </div>


              {/* ===============================================
                  BIOGRAPHY
              =============================================== */}

              <div className="admin-leadership__bio">

                <span>
                  Biography
                </span>


                <p>

                  {selectedLeader.bio ||
                    selectedLeader.biography ||
                    "No biography has been added yet."}

                </p>

              </div>


              {/* ===============================================
                  ACTIONS
              =============================================== */}

              <div className="admin-leadership__drawer-actions">

                <button
                  type="button"
                  className="admin-leadership__edit"
                  onClick={() => {

                    console.log(
                      "Edit leadership profile:",
                      selectedLeader
                    );

                  }}
                >

                  Edit Profile

                </button>

              </div>

            </div>

          </aside>

        </div>

      )}

    </div>

  );

}