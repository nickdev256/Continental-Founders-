import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CheckCircle2,
  Download,
  Mail,
  RefreshCcw,
  Search,
  Trash2,
  UserCheck,
  UserX,
  Users,
  XCircle,
} from "lucide-react";

import {
  deleteNewsletterSubscriber,
  getNewsletterSubscribers,
  updateNewsletterSubscriber,
} from "../../services/adminApi";

import "./AdminNewsletter.css";


/* ============================================================
   DATE FORMATTER
============================================================ */

function formatDate(
  value
) {

  if (!value) {
    return "—";
  }


  const date =
    new Date(value);


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }


  return new Intl.DateTimeFormat(
    "en",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(date);
}


/* ============================================================
   SOURCE FORMATTER
============================================================ */

function formatSource(
  value
) {

  if (!value) {
    return "Website";
  }


  return String(value)
    .replace(
      /_/g,
      " "
    )
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase()
    );
}


/* ============================================================
   ADMIN NEWSLETTER
============================================================ */

export default function AdminNewsletter() {

  const [
    subscribers,
    setSubscribers,
  ] =
    useState([]);


  const [
    loading,
    setLoading,
  ] =
    useState(true);


  const [
    error,
    setError,
  ] =
    useState("");


  const [
    search,
    setSearch,
  ] =
    useState("");


  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState("all");


  const [
    updatingId,
    setUpdatingId,
  ] =
    useState(null);


  const [
    deletingId,
    setDeletingId,
  ] =
    useState(null);


  const [
    actionMessage,
    setActionMessage,
  ] =
    useState("");


  const [
    actionError,
    setActionError,
  ] =
    useState("");


  /* ==========================================================
     LOAD SUBSCRIBERS
  ========================================================== */

  const loadSubscribers =
    useCallback(
      async () => {

        try {

          setLoading(
            true
          );

          setError(
            ""
          );

          setActionError(
            ""
          );


          const result =
            await getNewsletterSubscribers();


          setSubscribers(
            Array.isArray(
              result?.subscribers
            )
              ? result.subscribers
              : []
          );

        } catch (
          requestError
        ) {

          console.error(
            "Newsletter subscribers error:",
            requestError
          );


          setError(
            requestError?.message ||
            "Failed to load newsletter subscribers."
          );

        } finally {

          setLoading(
            false
          );

        }

      },
      []
    );


  useEffect(
    () => {

      loadSubscribers();

    },
    [
      loadSubscribers,
    ]
  );


  /* ==========================================================
     STATISTICS
  ========================================================== */

  const statistics =
    useMemo(
      () => {

        const subscribed =
          subscribers.filter(
            (subscriber) =>
              subscriber.status ===
              "subscribed"
          ).length;


        const unsubscribed =
          subscribers.filter(
            (subscriber) =>
              subscriber.status ===
              "unsubscribed"
          ).length;


        return {

          total:
            subscribers.length,

          subscribed,

          unsubscribed,

        };

      },
      [
        subscribers,
      ]
    );


  /* ==========================================================
     FILTER
  ========================================================== */

  const filteredSubscribers =
    useMemo(
      () => {

        const term =
          search
            .trim()
            .toLowerCase();


        return subscribers.filter(
          (subscriber) => {

            const email =
              String(
                subscriber?.email ||
                ""
              ).toLowerCase();


            const source =
              String(
                subscriber?.source ||
                ""
              ).toLowerCase();


            const matchesSearch =
              !term ||
              email.includes(
                term
              ) ||
              source.includes(
                term
              );


            const matchesStatus =
              statusFilter ===
                "all" ||
              subscriber.status ===
                statusFilter;


            return (
              matchesSearch &&
              matchesStatus
            );

          }
        );

      },
      [
        subscribers,
        search,
        statusFilter,
      ]
    );


  /* ==========================================================
     CHANGE SUBSCRIBER STATUS
  ========================================================== */

  async function handleStatusChange(
    subscriber,
    nextStatus
  ) {

    if (
      !subscriber?.id ||
      !nextStatus
    ) {
      return;
    }


    if (
      subscriber.status ===
      nextStatus
    ) {
      return;
    }


    try {

      setUpdatingId(
        subscriber.id
      );

      setActionMessage(
        ""
      );

      setActionError(
        ""
      );


      const result =
        await updateNewsletterSubscriber(
          subscriber.id,
          nextStatus
        );


      const updatedSubscriber =
        result?.subscriber;


      if (
        !updatedSubscriber
      ) {

        throw new Error(
          "The server did not return the updated subscriber."
        );

      }


      setSubscribers(
        (current) =>
          current.map(
            (item) =>
              item.id ===
                subscriber.id
                ? updatedSubscriber
                : item
          )
      );


      setActionMessage(
        nextStatus ===
          "subscribed"
          ? `${subscriber.email} has been subscribed.`
          : `${subscriber.email} has been unsubscribed.`
      );

    } catch (
      requestError
    ) {

      console.error(
        "Newsletter subscriber update error:",
        requestError
      );


      setActionError(
        requestError?.message ||
        "Unable to update subscriber."
      );

    } finally {

      setUpdatingId(
        null
      );

    }

  }


  /* ==========================================================
     DELETE SUBSCRIBER
  ========================================================== */

  async function handleDeleteSubscriber(
    subscriber
  ) {

    if (
      !subscriber?.id
    ) {
      return;
    }


    const confirmed =
      window.confirm(
        `Delete ${subscriber.email} from the newsletter subscriber list?`
      );


    if (
      !confirmed
    ) {
      return;
    }


    try {

      setDeletingId(
        subscriber.id
      );

      setActionMessage(
        ""
      );

      setActionError(
        ""
      );


      await deleteNewsletterSubscriber(
        subscriber.id
      );


      setSubscribers(
        (current) =>
          current.filter(
            (item) =>
              item.id !==
              subscriber.id
          )
      );


      setActionMessage(
        `${subscriber.email} has been deleted.`
      );

    } catch (
      requestError
    ) {

      console.error(
        "Delete newsletter subscriber error:",
        requestError
      );


      setActionError(
        requestError?.message ||
        "Unable to delete subscriber."
      );

    } finally {

      setDeletingId(
        null
      );

    }

  }


  /* ==========================================================
     EXPORT CSV
  ========================================================== */

  function exportSubscribers() {

    if (
      filteredSubscribers.length ===
      0
    ) {
      return;
    }


    const headers = [
      "Email",
      "Status",
      "Source",
      "Subscribed At",
      "Unsubscribed At",
    ];


    const rows =
      filteredSubscribers.map(
        (subscriber) => [

          subscriber.email ||
            "",

          subscriber.status ||
            "",

          subscriber.source ||
            "",

          subscriber.subscribed_at ||
          subscriber.subscribedAt ||
            "",

          subscriber.unsubscribed_at ||
          subscriber.unsubscribedAt ||
            "",

        ]
      );


    const csv =
      [
        headers,
        ...rows,
      ]
        .map(
          (row) =>
            row
              .map(
                (value) =>
                  `"${String(
                    value
                  ).replace(
                    /"/g,
                    '""'
                  )}"`
              )
              .join(",")
        )
        .join("\n");


    const blob =
      new Blob(
        [
          csv,
        ],
        {
          type:
            "text/csv;charset=utf-8;",
        }
      );


    const url =
      URL.createObjectURL(
        blob
      );


    const link =
      document.createElement(
        "a"
      );


    link.href =
      url;


    link.download =
      `continental-founders-newsletter-${new Date()
        .toISOString()
        .slice(
          0,
          10
        )}.csv`;


    document.body.appendChild(
      link
    );


    link.click();


    link.remove();


    URL.revokeObjectURL(
      url
    );

  }


  /* ==========================================================
     RENDER
  ========================================================== */

  return (

    <section className="admin-newsletter">

      {/* ======================================================
          PAGE HEADER
      ====================================================== */}

      <header className="admin-newsletter__header">

        <div>

          <span className="admin-newsletter__eyebrow">
            COMMUNICATIONS
          </span>


          <h2>
            Newsletter Subscribers
          </h2>


          <p>
            View and manage people who
            subscribe to Continental
            Founders updates.
          </p>

        </div>


        <div className="admin-newsletter__header-actions">

          <button
            type="button"
            className="admin-newsletter__button admin-newsletter__button--secondary"
            onClick={
              loadSubscribers
            }
            disabled={
              loading
            }
          >

            <RefreshCcw
              size={17}
              strokeWidth={1.8}
            />


            <span>
              {loading
                ? "Refreshing..."
                : "Refresh"}
            </span>

          </button>


          <button
            type="button"
            className="admin-newsletter__button admin-newsletter__button--primary"
            onClick={
              exportSubscribers
            }
            disabled={
              filteredSubscribers.length ===
              0
            }
          >

            <Download
              size={17}
              strokeWidth={1.8}
            />


            <span>
              Export CSV
            </span>

          </button>

        </div>

      </header>


      {/* ======================================================
          STAT CARDS
      ====================================================== */}

      <div className="admin-newsletter__stats">

        <div className="admin-newsletter__stat">

          <div className="admin-newsletter__stat-icon">

            <Users
              size={22}
              strokeWidth={1.7}
            />

          </div>


          <div>

            <span>
              Total Subscribers
            </span>


            <strong>
              {statistics.total}
            </strong>

          </div>

        </div>


        <div className="admin-newsletter__stat">

          <div className="admin-newsletter__stat-icon">

            <CheckCircle2
              size={22}
              strokeWidth={1.7}
            />

          </div>


          <div>

            <span>
              Active
            </span>


            <strong>
              {statistics.subscribed}
            </strong>

          </div>

        </div>


        <div className="admin-newsletter__stat">

          <div className="admin-newsletter__stat-icon">

            <XCircle
              size={22}
              strokeWidth={1.7}
            />

          </div>


          <div>

            <span>
              Unsubscribed
            </span>


            <strong>
              {statistics.unsubscribed}
            </strong>

          </div>

        </div>

      </div>


      {/* ======================================================
          TOOLBAR
      ====================================================== */}

      <div className="admin-newsletter__toolbar">

        <div className="admin-newsletter__search">

          <Search
            size={18}
            strokeWidth={1.7}
          />


          <input
            type="search"
            value={
              search
            }
            placeholder="Search email or source..."
            aria-label="Search subscribers"
            onChange={(
              event
            ) =>
              setSearch(
                event.target.value
              )
            }
          />

        </div>


        <select
          value={
            statusFilter
          }
          onChange={(
            event
          ) =>
            setStatusFilter(
              event.target.value
            )
          }
          aria-label="Filter subscribers by status"
        >

          <option value="all">
            All Subscribers
          </option>

          <option value="subscribed">
            Subscribed
          </option>

          <option value="unsubscribed">
            Unsubscribed
          </option>

        </select>

      </div>


      {/* ======================================================
          ACTION MESSAGE
      ====================================================== */}

      {actionMessage && (

        <div className="admin-newsletter__message admin-newsletter__message--success">

          <CheckCircle2
            size={17}
          />

          <span>
            {actionMessage}
          </span>

        </div>

      )}


      {actionError && (

        <div className="admin-newsletter__message admin-newsletter__message--error">

          <XCircle
            size={17}
          />

          <span>
            {actionError}
          </span>

        </div>

      )}


      {/* ======================================================
          TABLE CARD
      ====================================================== */}

      <div className="admin-newsletter__table-card">

        {loading && (

          <div className="admin-newsletter__state">

            <RefreshCcw
              className="admin-newsletter__loading-icon"
              size={28}
            />


            <h3>
              Loading subscribers
            </h3>


            <p>
              Retrieving newsletter
              subscribers from the database.
            </p>

          </div>

        )}


        {!loading &&
          error && (

            <div className="admin-newsletter__state">

              <Mail
                size={30}
              />


              <h3>
                Unable to load subscribers
              </h3>


              <p>
                {error}
              </p>


              <button
                type="button"
                onClick={
                  loadSubscribers
                }
                className="admin-newsletter__button admin-newsletter__button--primary"
              >
                Try Again
              </button>

            </div>

          )}


        {!loading &&
          !error &&
          filteredSubscribers.length ===
            0 && (

            <div className="admin-newsletter__state">

              <Mail
                size={30}
              />


              <h3>
                No subscribers found
              </h3>


              <p>
                Newsletter subscribers will
                appear here after people
                subscribe through the website.
              </p>

            </div>

          )}


        {!loading &&
          !error &&
          filteredSubscribers.length >
            0 && (

            <div className="admin-newsletter__table-wrap">

              <table className="admin-newsletter__table">

                <thead>

                  <tr>

                    <th>
                      Subscriber
                    </th>

                    <th>
                      Status
                    </th>

                    <th>
                      Source
                    </th>

                    <th>
                      Date Subscribed
                    </th>

                    <th>
                      Actions
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {filteredSubscribers.map(
                    (
                      subscriber
                    ) => {

                      const isUpdating =
                        updatingId ===
                        subscriber.id;


                      const isDeleting =
                        deletingId ===
                        subscriber.id;


                      const isBusy =
                        isUpdating ||
                        isDeleting;


                      return (

                        <tr
                          key={
                            subscriber.id
                          }
                        >

                          {/* SUBSCRIBER */}

                          <td>

                            <div className="admin-newsletter__subscriber">

                              <div className="admin-newsletter__subscriber-icon">

                                <Mail
                                  size={17}
                                  strokeWidth={1.7}
                                />

                              </div>


                              <span>
                                {subscriber.email}
                              </span>

                            </div>

                          </td>


                          {/* STATUS */}

                          <td>

                            <span
                              className={`admin-newsletter__status admin-newsletter__status--${subscriber.status}`}
                            >
                              {
                                subscriber.status ===
                                "subscribed"
                                  ? "Subscribed"
                                  : "Unsubscribed"
                              }
                            </span>

                          </td>


                          {/* SOURCE */}

                          <td>

                            {formatSource(
                              subscriber.source
                            )}

                          </td>


                          {/* DATE */}

                          <td>

                            {formatDate(
                              subscriber.subscribed_at ||
                              subscriber.subscribedAt
                            )}

                          </td>


                          {/* ACTIONS */}

                          <td>

                            <div className="admin-newsletter__row-actions">

                              {subscriber.status ===
                              "subscribed" ? (

                                <button
                                  type="button"
                                  className="admin-newsletter__row-action"
                                  title="Unsubscribe"
                                  disabled={
                                    isBusy
                                  }
                                  onClick={() =>
                                    handleStatusChange(
                                      subscriber,
                                      "unsubscribed"
                                    )
                                  }
                                >

                                  <UserX
                                    size={16}
                                  />

                                  <span>
                                    {isUpdating
                                      ? "Updating..."
                                      : "Unsubscribe"}
                                  </span>

                                </button>

                              ) : (

                                <button
                                  type="button"
                                  className="admin-newsletter__row-action admin-newsletter__row-action--activate"
                                  title="Subscribe"
                                  disabled={
                                    isBusy
                                  }
                                  onClick={() =>
                                    handleStatusChange(
                                      subscriber,
                                      "subscribed"
                                    )
                                  }
                                >

                                  <UserCheck
                                    size={16}
                                  />

                                  <span>
                                    {isUpdating
                                      ? "Updating..."
                                      : "Subscribe"}
                                  </span>

                                </button>

                              )}


                              <button
                                type="button"
                                className="admin-newsletter__row-action admin-newsletter__row-action--delete"
                                title="Delete subscriber"
                                disabled={
                                  isBusy
                                }
                                onClick={() =>
                                  handleDeleteSubscriber(
                                    subscriber
                                  )
                                }
                              >

                                <Trash2
                                  size={16}
                                />

                                <span>
                                  {isDeleting
                                    ? "Deleting..."
                                    : "Delete"}
                                </span>

                              </button>

                            </div>

                          </td>

                        </tr>

                      );

                    }
                  )}

                </tbody>

              </table>

            </div>

          )}

      </div>

    </section>

  );

}