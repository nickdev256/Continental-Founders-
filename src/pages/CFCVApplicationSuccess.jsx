import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ClipboardCopy,
  FileText,
  Globe2,
  Printer,
} from "lucide-react";

import "./CFCVApplicationSuccess.css";

/* ============================================================
   READ SUBMISSION RECEIPT

   CFCVApply.jsx passes:
   - applicationReference
   - submittedAt
   - applicantName
============================================================ */

function readReceipt(state) {
  if (!state || typeof state !== "object") {
    return null;
  }

  const reference =
    typeof state.applicationReference === "string"
      ? state.applicationReference.trim()
      : "";

  if (!reference || reference.length > 200) {
    return null;
  }

  const applicantName =
    typeof state.applicantName === "string"
      ? state.applicantName.trim().slice(0, 200)
      : "";

  const date =
    typeof state.submittedAt === "string" &&
    state.submittedAt.trim()
      ? new Date(state.submittedAt)
      : null;

  return {
    reference,
    applicantName,

    submittedAt:
      date && !Number.isNaN(date.getTime())
        ? date
        : null,
  };
}

/* ============================================================
   DATE FORMAT
============================================================ */

function formatDate(date) {
  if (!date) {
    return "";
  }

  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(date);
}

/* ============================================================
   PAGE
============================================================ */

export default function CFCVApplicationSuccess() {
  const location = useLocation();

  const receipt = readReceipt(location.state);

  const [copyStatus, setCopyStatus] =
    useState("");

  const [copying, setCopying] =
    useState(false);

  /* ==========================================================
     COPY REFERENCE
  ========================================================== */

  async function copyReference() {
    if (!receipt || copying) {
      return;
    }

    setCopying(true);
    setCopyStatus("");

    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard unavailable");
      }

      await navigator.clipboard.writeText(
        receipt.reference
      );

      setCopyStatus(
        "Application reference copied."
      );
    } catch {
      setCopyStatus(
        "Unable to copy automatically. Select the reference above and copy it manually."
      );
    } finally {
      setCopying(false);
    }
  }

  /* ==========================================================
     MISSING RECEIPT

     Visiting this URL directly must not imply that an
     application was submitted.

     This page never submits or retries an application.
  ========================================================== */

  if (!receipt) {
    return (
      <main className="cfcv-success-page">
        <section className="cfcv-success-hero">
          <div className="cfcv-success-container">
            <Link
              to="/cfcv"
              className="cfcv-success-back"
            >
              <ArrowLeft size={16} />
              CFCV Fellowship
            </Link>

            <span className="cfcv-success-eyebrow">
              CONTINENTAL FOUNDERS
            </span>

            <h1>
              Application confirmation
            </h1>

            <p>
              Submission details are not available
              in this visit.
            </p>
          </div>
        </section>

        <section className="cfcv-success-main">
          <div className="cfcv-success-container">
            <div className="cfcv-success-card">
              <div
                className="cfcv-success-icon"
                aria-hidden="true"
              >
                <FileText size={34} />
              </div>

              <h2>
                No confirmation details available
              </h2>

              <p>
                This page alone cannot confirm whether
                your application was submitted. If you
                already received an application reference,
                keep it for future correspondence.
              </p>

              <p>
                If your submission was interrupted,
                return to the application in your
                original tab and use Retry Submission
                when available.
              </p>

              <div className="cfcv-success-actions">
                <Link
                  to="/cfcv"
                  className="cfcv-success-button cfcv-success-button--primary"
                >
                  View the Fellowship
                  <ArrowRight size={18} />
                </Link>

                <Link
                  to="/"
                  className="cfcv-success-button cfcv-success-button--secondary"
                >
                  Return Home
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    );
  }

  /* ==========================================================
     SUBMISSION CONFIRMATION
  ========================================================== */

  return (
    <main className="cfcv-success-page">
      {/* HERO */}

      <section className="cfcv-success-hero">
        <div className="cfcv-success-container">
          <Link
            to="/cfcv"
            className="cfcv-success-back"
          >
            <ArrowLeft size={16} />
            CFCV Fellowship
          </Link>

          <span className="cfcv-success-eyebrow">
            CONTINENTAL FOUNDERS
          </span>

          <h1>
            Your next chapter
            <br />
            <em>starts here.</em>
          </h1>

          <p>
            Your CFCV Fellowship application
            has been received.
          </p>
        </div>
      </section>

      {/* CONFIRMATION CARD */}

      <section className="cfcv-success-main">
        <div className="cfcv-success-container">
          <div className="cfcv-success-card">
            <div
              className="cfcv-success-icon"
              aria-hidden="true"
            >
              <CheckCircle2 size={38} />
            </div>

            <span className="cfcv-success-label">
              APPLICATION RECEIVED
            </span>

            <h2>
              {receipt.applicantName
                ? `Thank you, ${receipt.applicantName}.`
                : "Thank you for applying."}
            </h2>

            <p className="cfcv-success-intro">
              Your application has been submitted
              for review. Please save your application
              reference for future correspondence.
            </p>

            {/* RECEIPT */}

            <div className="cfcv-success-receipt">
              <div className="cfcv-success-reference">
                <span>
                  Application reference
                </span>

                <strong>
                  {receipt.reference}
                </strong>
              </div>

              {receipt.submittedAt && (
                <div className="cfcv-success-date">
                  <span>
                    Submitted
                  </span>

                  <time
                    dateTime={
                      receipt.submittedAt.toISOString()
                    }
                  >
                    {formatDate(receipt.submittedAt)}
                  </time>
                </div>
              )}

              <div className="cfcv-success-receipt-actions">
                <button
                  type="button"
                  className="cfcv-success-button cfcv-success-button--secondary"
                  onClick={copyReference}
                  disabled={copying}
                >
                  {copyStatus ===
                  "Application reference copied." ? (
                    <Check size={17} />
                  ) : (
                    <ClipboardCopy size={17} />
                  )}

                  {copying
                    ? "Copying..."
                    : "Copy Reference"}
                </button>

                <button
                  type="button"
                  className="cfcv-success-button cfcv-success-button--secondary"
                  onClick={() => window.print()}
                >
                  <Printer size={17} />
                  Print Confirmation
                </button>
              </div>

              <p
                className="cfcv-success-copy-status"
                role="status"
                aria-live="polite"
                aria-atomic="true"
              >
                {copyStatus}
              </p>
            </div>

            {/* NEXT STEPS */}

            <section
              className="cfcv-success-next"
              aria-labelledby="cfcv-success-next-title"
            >
              <h3 id="cfcv-success-next-title">
                What happens next?
              </h3>

              <ol className="cfcv-success-steps">
                <li>
                  <span aria-hidden="true">
                    01
                  </span>

                  <div>
                    <h4>
                      Application review
                    </h4>

                    <p>
                      The admissions team will review
                      your founder background, venture,
                      and fellowship goals.
                    </p>
                  </div>
                </li>

                <li>
                  <span aria-hidden="true">
                    02
                  </span>

                  <div>
                    <h4>
                      Further communication
                    </h4>

                    <p>
                      Watch the email address you supplied
                      for any requests for further
                      information or updates. Check your
                      spam folder too.
                    </p>
                  </div>
                </li>

                <li>
                  <span aria-hidden="true">
                    03
                  </span>

                  <div>
                    <h4>
                      Admissions and track placement
                    </h4>

                    <p>
                      If admitted, placement in Genesis,
                      Ascend, or Horizon will be determined
                      through the admissions process based
                      on business readiness.
                    </p>
                  </div>
                </li>
              </ol>
            </section>

            {/* RECEIPT DOES NOT MEAN ADMISSION */}

            <div className="cfcv-success-note">
              <Globe2
                size={21}
                aria-hidden="true"
              />

              <p>
                Submission confirms receipt of your
                application. It does not constitute
                admission to the CFCV Fellowship.
              </p>
            </div>

            {/* NAVIGATION */}

            <div className="cfcv-success-actions">
              <Link
                to="/cfcv"
                className="cfcv-success-button cfcv-success-button--primary"
              >
                Explore the Fellowship
                <ArrowRight size={18} />
              </Link>

              <Link
                to="/"
                className="cfcv-success-button cfcv-success-button--secondary"
              >
                Return Home
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}