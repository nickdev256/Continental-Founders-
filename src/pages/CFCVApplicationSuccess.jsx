import { Link, useLocation } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  Globe2,
  Home,
} from "lucide-react";

import "./CFCVApplicationSuccess.css";


function CFCVApplicationSuccess() {
  const location = useLocation();

  const {
    applicationReference = "",
    submittedAt = "",
    applicantName = "",
  } = location.state || {};


  const formattedDate = submittedAt
    ? new Intl.DateTimeFormat(
        undefined,
        {
          year: "numeric",
          month: "long",
          day: "numeric",
        }
      ).format(
        new Date(submittedAt)
      )
    : "";


  return (
    <main className="cfcv-success-page">

      {/* ======================================================
          HERO / SUCCESS
      ====================================================== */}

      <section className="cfcv-success-hero">

        <div className="cfcv-success-container">

          <Link
            to="/cfcv"
            className="cfcv-success-brand"
          >
            <Globe2 size={18} />

            Continental Founders
          </Link>


          <div className="cfcv-success-card">

            <div
              className="cfcv-success-icon"
              aria-hidden="true"
            >
              <CheckCircle2 size={44} />
            </div>


            <span className="cfcv-success-eyebrow">
              CFCV FELLOWSHIP
            </span>


            <h1>
              Application
              <br />

              <em>Submitted</em>
            </h1>


            <p className="cfcv-success-intro">
              {applicantName
                ? `Thank you, ${applicantName}. Your application has been received by Continental Founders.`
                : "Your application has been received by Continental Founders."}
            </p>


            {applicationReference && (
              <div className="cfcv-success-reference">

                <span>
                  Application Reference
                </span>

                <strong>
                  {applicationReference}
                </strong>

                <p>
                  Keep this reference for your
                  records.
                </p>

              </div>
            )}


            {formattedDate && (
              <p className="cfcv-success-date">
                Submitted {formattedDate}
              </p>
            )}


            <div className="cfcv-success-divider" />


            <div className="cfcv-success-next">

              <div className="cfcv-success-next__icon">
                <ClipboardCheck size={22} />
              </div>


              <div>

                <span>
                  WHAT HAPPENS NEXT
                </span>

                <h2>
                  Your application enters the
                  admissions process.
                </h2>

                <p>
                  CFCV applications move through
                  assessment, founder interviews,
                  track placement and, where
                  required, cross-continental
                  matching before final admissions
                  decisions are made.
                </p>

              </div>

            </div>


            <div className="cfcv-success-actions">

              <Link
                to="/cfcv"
                className="cfcv-success-button cfcv-success-button--primary"
              >
                Return to CFCV

                <ArrowRight size={17} />
              </Link>


              <Link
                to="/"
                className="cfcv-success-button cfcv-success-button--secondary"
              >
                <Home size={17} />

                Home
              </Link>

            </div>

          </div>

        </div>

      </section>

    </main>
  );
}


export default CFCVApplicationSuccess;