import React, {
  useMemo,
  useState,
} from "react";

import {
  Building2,
  ChevronRight,
  Mail,
  MessageSquare,
  Phone,
  Search,
  UserRound,
  X,
} from "lucide-react";

import "./AdminContacts.css";


// ============================================================
// CONTINENTAL FOUNDERS
// ADMIN CONTACT INQUIRIES
// ============================================================

export default function AdminContacts() {

  // ==========================================================
  // STATE
  // ==========================================================

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


  // ==========================================================
  // CONTACT DATA
  //
  // Keep this empty until we connect the page to the backend.
  // We will replace this with API data.
  // ==========================================================

  const [
    contacts,
  ] =
    useState([]);


  // ==========================================================
  // FILTER CONTACTS
  // ==========================================================

  const filteredContacts =
    useMemo(
      () => {

        const query =
          searchQuery
            .trim()
            .toLowerCase();


        if (
          !query
        ) {

          return contacts;

        }


        return contacts.filter(
          (
            contact
          ) => {

            const searchableText = [
              contact.firstName,
              contact.lastName,
              contact.email,
              contact.phone,
              contact.company,
              contact.subject,
              contact.message,
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
        contacts,
        searchQuery,
      ]
    );


  // ==========================================================
  // CONTACT NAME
  // ==========================================================

  function getContactName(
    contact
  ) {

    const fullName =
      [
        contact?.firstName,
        contact?.lastName,
      ]
        .filter(Boolean)
        .join(" ")
        .trim();


    return (
      fullName ||
      contact?.name ||
      "Website Visitor"
    );

  }


  // ==========================================================
  // FORMAT DATE
  // ==========================================================

  function formatDate(
    value
  ) {

    if (
      !value
    ) {

      return "Not available";

    }


    const date =
      new Date(
        value
      );


    if (
      Number.isNaN(
        date.getTime()
      )
    ) {

      return value;

    }


    return date.toLocaleString(
      undefined,
      {
        year:
          "numeric",

        month:
          "short",

        day:
          "numeric",

        hour:
          "2-digit",

        minute:
          "2-digit",
      }
    );

  }


  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <div className="admin-contacts">

      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <div className="admin-contacts__header">

        <div>

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


        <div className="admin-contacts__summary">

          <MessageSquare
            size={20}
            strokeWidth={1.6}
          />


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


      {/* ======================================================
          TOOLBAR
      ====================================================== */}

      <div className="admin-contacts__toolbar">

        <div className="admin-contacts__search">

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
            placeholder="Search contacts, companies, subjects..."
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


        <div className="admin-contacts__count">

          {filteredContacts.length}

          {" "}

          {filteredContacts.length === 1
            ? "message"
            : "messages"}

        </div>

      </div>


      {/* ======================================================
          CONTACT LIST
      ====================================================== */}

      <div className="admin-contacts__content">

        <section className="admin-contacts__list-panel">

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


          {filteredContacts.length === 0 ? (

            <div className="admin-contacts__empty">

              <div className="admin-contacts__empty-icon">

                <MessageSquare
                  size={26}
                  strokeWidth={1.5}
                />

              </div>


              <h3>

                {searchQuery
                  ? "No matching inquiries"
                  : "No contact inquiries yet"}

              </h3>


              <p>

                {searchQuery
                  ? "Try another name, email address, company, or subject."
                  : "Messages submitted through the Continental Founders contact form will appear here once we connect this page to the backend."}

              </p>

            </div>

          ) : (

            <div className="admin-contacts__list">

              {filteredContacts.map(
                (
                  contact,
                  index
                ) => {

                  const contactId =
                    contact.id ||
                    `${contact.email || "contact"}-${index}`;


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

                      <div className="admin-contacts__person">

                        <div className="admin-contacts__avatar">

                          <UserRound
                            size={17}
                            strokeWidth={1.6}
                          />

                        </div>


                        <div>

                          <strong>
                            {getContactName(
                              contact
                            )}
                          </strong>


                          <span>
                            {contact.email ||
                              "No email"}
                          </span>

                        </div>

                      </div>


                      <div className="admin-contacts__subject">

                        {contact.subject ||
                          "General Inquiry"}

                      </div>


                      <div className="admin-contacts__company">

                        {contact.company ||
                          "—"}

                      </div>


                      <div className="admin-contacts__date">

                        {formatDate(
                          contact.createdAt ||
                          contact.created_at
                        )}

                      </div>


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

        </section>

      </div>


      {/* ======================================================
          MESSAGE DETAIL DRAWER
      ====================================================== */}

      {selectedContact && (

        <div
          className="admin-contacts__overlay"
          onClick={() =>
            setSelectedContact(
              null
            )
          }
          role="presentation"
        >

          <aside
            className="admin-contacts__drawer"
            onClick={(
              event
            ) =>
              event.stopPropagation()
            }
            aria-label="Contact inquiry details"
          >

            <div className="admin-contacts__drawer-header">

              <div>

                <span className="admin-contacts__drawer-eyebrow">
                  CONTACT INQUIRY
                </span>


                <h2>
                  {selectedContact.subject ||
                    "General Inquiry"}
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
                  size={20}
                  strokeWidth={1.7}
                />

              </button>

            </div>


            <div className="admin-contacts__drawer-body">

              {/* ===============================================
                  SENDER
              =============================================== */}

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


              {/* ===============================================
                  EMAIL
              =============================================== */}

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

                  {selectedContact.email ? (

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


              {/* ===============================================
                  PHONE
              =============================================== */}

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

                  {selectedContact.phone ? (

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


              {/* ===============================================
                  COMPANY
              =============================================== */}

              <div className="admin-contacts__detail-card">

                <div className="admin-contacts__detail-icon">

                  <Building2
                    size={18}
                    strokeWidth={1.6}
                  />

                </div>


                <div>

                  <span>
                    Company
                  </span>

                  <strong>
                    {selectedContact.company ||
                      "Not provided"}
                  </strong>

                </div>

              </div>


              {/* ===============================================
                  RECEIVED
              =============================================== */}

              <div className="admin-contacts__detail-meta">

                <span>
                  Received
                </span>

                <strong>

                  {formatDate(
                    selectedContact.createdAt ||
                    selectedContact.created_at
                  )}

                </strong>

              </div>


              {/* ===============================================
                  MESSAGE
              =============================================== */}

              <div className="admin-contacts__message">

                <span>
                  Message
                </span>


                <p>
                  {selectedContact.message ||
                    "No message content was provided."}
                </p>

              </div>


              {/* ===============================================
                  REPLY
              =============================================== */}

              {selectedContact.email && (

                <a
                  className="admin-contacts__reply"
                  href={`mailto:${selectedContact.email}?subject=${encodeURIComponent(
                    `Re: ${
                      selectedContact.subject ||
                      "Continental Founders Inquiry"
                    }`
                  )}`}
                >

                  <Mail
                    size={17}
                    strokeWidth={1.7}
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