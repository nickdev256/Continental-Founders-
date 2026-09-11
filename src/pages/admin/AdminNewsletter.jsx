import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Mail,
  Search,
  RefreshCcw,
  Users,
  CheckCircle2,
  XCircle,
  Download,
} from "lucide-react";

import {
  getNewsletterSubscribers,
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


  /* ==========================================================
     LOAD SUBSCRIBERS
  ========================================================== */

  async function loadSubscribers() {

    try {

      setLoading(true);

      setError("");


      const result =
        await getNewsletterSubscribers();


      setSubscribers(
        Array.isArray(
          result.subscribers
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
        requestError.message ||
        "Failed to load newsletter subscribers."
      );

    } finally {

      setLoading(false);

    }

  }


  useEffect(() => {

    loadSubscribers();

  }, []);


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

            const matchesSearch =
              !term ||
              subscriber.email
                ?.toLowerCase()
                .includes(term);


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
    ];


    const rows =
      filteredSubscribers.map(
        (subscriber) => [
          subscriber.email || "",
          subscriber.status || "",
          subscriber.source || "",
          subscriber.subscribed_at || "",
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
            subscribed to Continental
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
              Refresh
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
              {
                statistics.total
              }
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
              {
                statistics.subscribed
              }
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
              {
                statistics.unsubscribed
              }
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
            placeholder="Search by email..."
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

                </tr>

              </thead>


              <tbody>

                {filteredSubscribers.map(
                  (
                    subscriber
                  ) => (

                    <tr
                      key={
                        subscriber.id
                      }
                    >

                      <td>

                        <div className="admin-newsletter__subscriber">

                          <div className="admin-newsletter__subscriber-icon">

                            <Mail
                              size={17}
                              strokeWidth={1.7}
                            />

                          </div>

                          <span>
                            {
                              subscriber.email
                            }
                          </span>

                        </div>

                      </td>


                      <td>

                        <span
                          className={`admin-newsletter__status admin-newsletter__status--${subscriber.status}`}
                        >
                          {
                            subscriber.status
                          }
                        </span>

                      </td>


                      <td>
                        {
                          subscriber.source ||
                          "Website"
                        }
                      </td>


                      <td>
                        {
                          formatDate(
                            subscriber.subscribed_at
                          )
                        }
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </section>
  );
}