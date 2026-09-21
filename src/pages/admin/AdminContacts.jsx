import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  Building2,
  CalendarDays,
  ChevronRight,
  Inbox,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  RefreshCw,
  Search,
  UserRound,
  X,
} from "lucide-react";

import "./AdminContacts.css";


// ============================================================
// CONFIGURATION
// ============================================================

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000";


// ============================================================
// HELPERS
// ============================================================

function getContactName(contact) {
  const fullName = [
    contact?.firstName,
    contact?.first_name,
    contact?.lastName,
    contact?.last_name,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  return (
    fullName ||
    contact?.name ||
    contact?.fullName ||
    contact?.full_name ||
    "Website Visitor"
  );
}


function getContactDate(contact) {
  return (
    contact?.createdAt ||
    contact?.created_at ||
    contact?.submittedAt ||
    contact?.submitted_at ||
    null
  );
}


function formatDate(value) {
  if (!value) {
    return "Not available";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return String(value);
  }

  return date.toLocaleString(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}


function getSubject(contact) {
  return (
    contact?.subject ||
    contact?.partnership ||
    contact?.areaOfInterest ||
    contact?.area_of_interest ||
    "General Inquiry"
  );
}


function getCompany(contact) {
  return (
    contact?.company ||
    contact?.organization ||
    "—"
  );
}


function extractContacts(result) {
  if (
    Array.isArray(result)
  ) {
    return result;
  }

  if (
    Array.isArray(
      result?.contacts
    )
  ) {
    return result.contacts;
  }

  if (
    Array.isArray(
      result?.data
    )
  ) {
    return result.data;
  }

  if (
    Array.isArray(
      result?.data?.contacts
    )
  ) {
    return result.data.contacts;
  }

  if (
    Array.isArray(
      result?.inquiries
    )
  ) {
    return result.inquiries;
  }

  return [];
}


// ============================================================
// ADMIN CONTACTS
// ============================================================

export default function AdminContacts() {

  // ==========================================================
  // STATE
  // ==========================================================

  const [
    contacts,
    setContacts,
  ] =
    useState([]);


  const [
    searchQuery,
    setSearchQuery,
  ] =
    useState("");


  const [
    selectedContact,
    setSelectedContact,
  ] =
    useState(null);


  const [
    loading,
    setLoading,
  ] =
    useState(true);


  const [
    refreshing,
    setRefreshing,
  ] =
    useState(false);


  const [
    error,
    setError,
  ] =
    useState("");


  // ==========================================================
  // LOAD CONTACTS
  // ==========================================================

  const loadContacts =
    useCallback(
      async ({
        signal,
        refresh = false,
      } = {}) => {

        try {

          if (refresh) {
            setRefreshing(true);
          } else {
            setLoading(true);
          }

          setError("");


          const response =
            await fetch(
              `${API_URL}/api/contact`,
              {
                method: "GET",

                credentials:
                  "include",

                headers: {
                  Accept:
                    "application/json",
                },

                signal,
              }
            );


          const contentType =
            response.headers.get(
              "content-type"
            ) || "";


          let result = null;


          if (
            contentType.includes(
              "application/json"
            )
          ) {

            result =
              await response.json();

          } else {

            const text =
              await response.text();


            console.error(
              "Unexpected contacts response:",
              text
            );


            throw new Error(
              "The contact service returned an unexpected response."
            );

          }


          if (!response.ok) {

            throw new Error(
              result?.message ||
              result?.error ||
              `Unable to load contact inquiries. Status: ${response.status}`
            );

          }


          const records =
            extractContacts(
              result
            );


          setContacts(
            records
          );

        } catch (requestError) {

          if (
            requestError?.name ===
            "AbortError"
          ) {
            return;
          }


          console.error(
            "Admin contacts loading error:",
            requestError
          );


          setError(
            requestError?.message ||
            "Unable to load contact inquiries."
          );

        } finally {

          if (
            !signal?.aborted
          ) {

            setLoading(false);
            setRefreshing(false);

          }

        }

      },
      []
    );


  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {

    const controller =
      new AbortController();


    loadContacts({
      signal:
        controller.signal,
    });


    return () => {
      controller.abort();
    };

  }, [loadContacts]);


  // ==========================================================
  // CLOSE DRAWER WITH ESCAPE
  // ==========================================================

  useEffect(() => {

    if (!selectedContact) {
      return undefined;
    }


    const handleKeyDown = (
      event
    ) => {

      if (
        event.key ===
        "Escape"
      ) {

        setSelectedContact(
          null
        );

      }

    };


    document.addEventListener(
      "keydown",
      handleKeyDown
    );


    const previousOverflow =
      document.body.style.overflow;


    document.body.style.overflow =
      "hidden";


    return () => {

      document.removeEventListener(
        "keydown",
        handleKeyDown
      );


      document.body.style.overflow =
        previousOverflow;

    };

  }, [selectedContact]);


  // ==========================================================
  // FILTER CONTACTS
  // ==========================================================

  const filteredContacts =
    useMemo(() => {

      const query =
        searchQuery
          .trim()
          .toLowerCase();


      if (!query) {
        return contacts;
      }


      return contacts.filter(
        (contact) => {

          const searchableText = [
            getContactName(
              contact
            ),

            contact?.email,

            contact?.phone,

            getCompany(
              contact
            ),

            getSubject(
              contact
            ),

            contact?.message,

            contact?.country,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();


          return searchableText.includes(
            query
          );

        }
      );

    }, [
      contacts,
      searchQuery,
    ]);


  // ==========================================================
  // REFRESH
  // ==========================================================

  const handleRefresh =
    async () => {

      await loadContacts({
        refresh: true,
      });

    };


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="admin-contacts">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="admin-contacts__header">

        <div className="admin-contacts__heading">

          <span className="admin-contacts__eyebrow">
            WEBSITE INQUIRIES
          </span>


          <h1>
            Contact Messages
          </h1>


          <p>
            Review messages and inquiries submitted
            through the Continental Founders website.
          </p>

        </div>


        <div className="admin-contacts__header-actions">

          <button
            type="button"
            className="admin-contacts__refresh"
            onClick={
              handleRefresh
            }
            disabled={
              refreshing ||
              loading
            }
          >

            <RefreshCw
              size={16}
              strokeWidth={1.8}
              className={
                refreshing
                  ? "admin-contacts__spin"
                  : ""
              }
            />

            <span>
              {refreshing
                ? "Refreshing"
                : "Refresh"}
            </span>

          </button>


          <div className="admin-contacts__summary">

            <div className="admin-contacts__summary-icon">

              <MessageSquare
                size={19}
                strokeWidth={1.6}
              />

            </div>


            <div>

              <strong>
                {contacts.length}
              </strong>

              <span>
                Total inquiries
              </span>

            </div>

          </div>

        </div>

      </header>


      {/* =====================================================
          TOOLBAR
      ====================================================== */}

      <div className="admin-contacts__toolbar">

        <div className="admin-contacts__search">

          <Search
            size={17}
            strokeWidth={1.7}
            aria-hidden="true"
          />


          <input
            type="search"
            value={
              searchQuery
            }
            placeholder="Search name, email, company, subject..."
            aria-label="Search contact inquiries"
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
              className="admin-contacts__search-clear"
              onClick={() =>
                setSearchQuery("")
              }
              aria-label="Clear search"
            >

              <X
                size={15}
                strokeWidth={1.8}
              />

            </button>

          )}

        </div>


        <div className="admin-contacts__count">

          <span>
            {filteredContacts.length}
          </span>

          {filteredContacts.length === 1
            ? " message"
            : " messages"}

        </div>

      </div>


      {/* =====================================================
          ERROR
      ====================================================== */}

      {error && (

        <div
          className="admin-contacts__alert"
          role="alert"
        >

          <div className="admin-contacts__alert-icon">

            <AlertCircle
              size={19}
              strokeWidth={1.7}
            />

          </div>


          <div>

            <strong>
              Unable to load inquiries
            </strong>

            <p>
              {error}
            </p>

          </div>


          <button
            type="button"
            onClick={
              handleRefresh
            }
          >
            Try again
          </button>

        </div>

      )}


      {/* =====================================================
          CONTENT
      ====================================================== */}

      <div className="admin-contacts__content">

        <section className="admin-contacts__list-panel">

          {/* =================================================
              LOADING
          ================================================= */}

          {loading ? (

            <div className="admin-contacts__loading">

              <Loader2
                size={27}
                strokeWidth={1.6}
                className="admin-contacts__spin"
              />


              <strong>
                Loading inquiries
              </strong>


              <span>
                Retrieving website contact messages...
              </span>

            </div>

          ) : (

            <>

              {/* =============================================
                  DESKTOP HEADER
              ============================================= */}

              <div className="admin-contacts__list-header">

                <span>
                  Sender
                </span>

                <span>
                  Subject
                </span>

                <span>
                  Company
                </span>

                <span>
                  Received
                </span>

                <span />

              </div>


              {/* =============================================
                  EMPTY
              ============================================= */}

              {filteredContacts.length === 0 ? (

                <div className="admin-contacts__empty">

                  <div className="admin-contacts__empty-icon">

                    {searchQuery ? (

                      <Search
                        size={25}
                        strokeWidth={1.5}
                      />

                    ) : (

                      <Inbox
                        size={27}
                        strokeWidth={1.45}
                      />

                    )}

                  </div>


                  <h3>

                    {searchQuery
                      ? "No matching inquiries"
                      : "No contact inquiries yet"}

                  </h3>


                  <p>

                    {searchQuery
                      ? "Try searching with another name, email address, company, subject, or message."
                      : "New messages submitted through the Continental Founders contact form will appear here."}

                  </p>


                  {searchQuery && (

                    <button
                      type="button"
                      onClick={() =>
                        setSearchQuery("")
                      }
                    >
                      Clear search
                    </button>

                  )}

                </div>

              ) : (

                <div className="admin-contacts__list">

                  {filteredContacts.map(
                    (
                      contact,
                      index
                    ) => {

                      const contactId =
                        contact?.id ||
                        `${contact?.email || "contact"}-${index}`;


                      return (

                        <button
                          key={
                            contactId
                          }
                          type="button"
                          className="admin-contacts__row"
                          onClick={() =>
                            setSelectedContact(
                              contact
                            )
                          }
                        >

                          {/* SENDER */}

                          <div className="admin-contacts__person">

                            <div className="admin-contacts__avatar">

                              <UserRound
                                size={17}
                                strokeWidth={1.6}
                              />

                            </div>


                            <div className="admin-contacts__person-copy">

                              <strong>
                                {getContactName(
                                  contact
                                )}
                              </strong>


                              <span>
                                {contact?.email ||
                                  "No email provided"}
                              </span>

                            </div>

                          </div>


                          {/* SUBJECT */}

                          <div className="admin-contacts__subject">

                            <span className="admin-contacts__mobile-label">
                              Subject
                            </span>

                            <strong>
                              {getSubject(
                                contact
                              )}
                            </strong>

                          </div>


                          {/* COMPANY */}

                          <div className="admin-contacts__company">

                            <span className="admin-contacts__mobile-label">
                              Company
                            </span>

                            <span>
                              {getCompany(
                                contact
                              )}
                            </span>

                          </div>


                          {/* DATE */}

                          <div className="admin-contacts__date">

                            <span className="admin-contacts__mobile-label">
                              Received
                            </span>

                            <span>
                              {formatDate(
                                getContactDate(
                                  contact
                                )
                              )}
                            </span>

                          </div>


                          {/* ARROW */}

                          <div className="admin-contacts__arrow">

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

            </>

          )}

        </section>

      </div>


      {/* =====================================================
          MESSAGE DETAIL DRAWER
      ====================================================== */}

      {selectedContact && (

        <div
          className="admin-contacts__overlay"
          onMouseDown={(
            event
          ) => {

            if (
              event.target ===
              event.currentTarget
            ) {

              setSelectedContact(
                null
              );

            }

          }}
          role="presentation"
        >

          <aside
            className="admin-contacts__drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-inquiry-title"
          >

            {/* ===============================================
                DRAWER HEADER
            =============================================== */}

            <div className="admin-contacts__drawer-header">

              <div>

                <span className="admin-contacts__drawer-eyebrow">
                  CONTACT INQUIRY
                </span>


                <h2 id="contact-inquiry-title">
                  {getSubject(
                    selectedContact
                  )}
                </h2>

              </div>


              <button
                type="button"
                className="admin-contacts__drawer-close"
                onClick={() =>
                  setSelectedContact(
                    null
                  )
                }
                aria-label="Close inquiry"
              >

                <X
                  size={19}
                  strokeWidth={1.8}
                />

              </button>

            </div>


            {/* ===============================================
                DRAWER BODY
            =============================================== */}

            <div className="admin-contacts__drawer-body">

              {/* SENDER */}

              <div className="admin-contacts__detail-card">

                <div className="admin-contacts__detail-icon">

                  <UserRound
                    size={18}
                    strokeWidth={1.6}
                  />

                </div>


                <div>

                  <span>
                    Sender
                  </span>

                  <strong>
                    {getContactName(
                      selectedContact
                    )}
                  </strong>

                </div>

              </div>


              {/* EMAIL */}

              <div className="admin-contacts__detail-card">

                <div className="admin-contacts__detail-icon">

                  <Mail
                    size={18}
                    strokeWidth={1.6}
                  />

                </div>


                <div>

                  <span>
                    Email
                  </span>


                  {selectedContact?.email ? (

                    <a
                      href={`mailto:${selectedContact.email}`}
                    >
                      {selectedContact.email}
                    </a>

                  ) : (

                    <strong>
                      Not provided
                    </strong>

                  )}

                </div>

              </div>


              {/* PHONE */}

              <div className="admin-contacts__detail-card">

                <div className="admin-contacts__detail-icon">

                  <Phone
                    size={18}
                    strokeWidth={1.6}
                  />

                </div>


                <div>

                  <span>
                    Phone
                  </span>


                  {selectedContact?.phone ? (

                    <a
                      href={`tel:${selectedContact.phone}`}
                    >
                      {selectedContact.phone}
                    </a>

                  ) : (

                    <strong>
                      Not provided
                    </strong>

                  )}

                </div>

              </div>


              {/* COMPANY */}

              <div className="admin-contacts__detail-card">

                <div className="admin-contacts__detail-icon">

                  <Building2
                    size={18}
                    strokeWidth={1.6}
                  />

                </div>


                <div>

                  <span>
                    Company / Organization
                  </span>

                  <strong>
                    {getCompany(
                      selectedContact
                    ) === "—"
                      ? "Not provided"
                      : getCompany(
                          selectedContact
                        )}
                  </strong>

                </div>

              </div>


              {/* COUNTRY */}

              {selectedContact?.country && (

                <div className="admin-contacts__detail-card">

                  <div className="admin-contacts__detail-icon">

                    <Building2
                      size={18}
                      strokeWidth={1.6}
                    />

                  </div>


                  <div>

                    <span>
                      Country
                    </span>

                    <strong>
                      {selectedContact.country}
                    </strong>

                  </div>

                </div>

              )}


              {/* RECEIVED */}

              <div className="admin-contacts__detail-meta">

                <CalendarDays
                  size={16}
                  strokeWidth={1.6}
                />


                <div>

                  <span>
                    Received
                  </span>

                  <strong>
                    {formatDate(
                      getContactDate(
                        selectedContact
                      )
                    )}
                  </strong>

                </div>

              </div>


              {/* MESSAGE */}

              <div className="admin-contacts__message">

                <div className="admin-contacts__message-heading">

                  <MessageSquare
                    size={17}
                    strokeWidth={1.6}
                  />

                  <span>
                    Message
                  </span>

                </div>


                <p>
                  {selectedContact?.message ||
                    "No message content was provided."}
                </p>

              </div>


              {/* ACTIONS */}

              {selectedContact?.email && (

                <a
                  className="admin-contacts__reply"
                  href={`mailto:${selectedContact.email}?subject=${encodeURIComponent(
                    `Re: ${getSubject(
                      selectedContact
                    )}`
                  )}`}
                >

                  <Mail
                    size={16}
                    strokeWidth={1.8}
                  />

                  <span>
                    Reply by Email
                  </span>

                </a>

              )}

            </div>

          </aside>

        </div>

      )}

    </div>
  );
}