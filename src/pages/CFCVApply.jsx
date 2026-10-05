import { useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronLeft,
  Globe2,
  Loader2,
  Send,
  User,
  Users,
} from "lucide-react";

import { submitCfcvApplication } from "../services/cfcvApi";

import "./CFCVApply.css";

/* ============================================================
   RÉSUMÉ VALIDATION
============================================================ */

const RESUME_LIMIT = 5 * 1024 * 1024;

const RESUME_TYPES = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx:
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

function resumeError(file) {
  if (!file) {
    return "Please upload your résumé.";
  }

  if (!file.size) {
    return "Your résumé file is empty.";
  }

  if (file.size > RESUME_LIMIT) {
    return "Your résumé must be 5 MB or smaller.";
  }

  const extension = file.name
    .split(".")
    .pop()
    .toLowerCase();

  if (
    !RESUME_TYPES[extension] ||
    (file.type && file.type !== RESUME_TYPES[extension])
  ) {
    return "Please upload a PDF, DOC, or DOCX résumé.";
  }

  return "";
}

/* ============================================================
   SUBMISSION KEYS

   Store only the fingerprint and UUID in session storage.
   Answers and résumé contents are not stored.

   Identical answers and résumé reuse their submission key.
============================================================ */

async function submissionKeyFor(application, resume) {
  const bytes = new Uint8Array(
    await resume.arrayBuffer()
  );

  const fileDigest = await crypto.subtle.digest(
    "SHA-256",
    bytes
  );

  const hex = (buffer) =>
    Array.from(
      new Uint8Array(buffer),
      (value) =>
        value.toString(16).padStart(2, "0")
    ).join("");

  const fingerprintPayload = {
    application,
    fileName: resume.name,
    fileType: resume.type,
    fileDigest: hex(fileDigest),
  };

  const fingerprint = hex(
    await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(
        JSON.stringify(fingerprintPayload)
      )
    )
  );

  const storageKey =
    `cfcv:submission:${fingerprint}`;

  let key;

  try {
    key = sessionStorage.getItem(storageKey);
  } catch {
    // In-memory retries still work when storage is unavailable.
  }

  const validUuid =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!validUuid.test(key || "")) {
    key = crypto.randomUUID();

    try {
      sessionStorage.setItem(storageKey, key);
    } catch {
      // Session storage is optional.
    }
  }

  return key;
}

/* ============================================================
   APPLICATION STEPS
============================================================ */

const STEPS = [
  {
    id: 1,
    short: "Founder",
    title: "Founder Information",
  },
  {
    id: 2,
    short: "Venture",
    title: "Venture Information",
  },
  {
    id: 3,
    short: "Stage",
    title: "Venture Stage",
  },
  {
    id: 4,
    short: "Market",
    title: "Market & Team",
  },
  {
    id: 5,
    short: "Collaboration",
    title: "Cross-Continental Collaboration",
  },
  {
    id: 6,
    short: "Commitment",
    title: "Commitment & Goals",
  },
  {
    id: 7,
    short: "Review",
    title: "Review & Submit",
  },
];

/* ============================================================
   INITIAL FORM
============================================================ */

const INITIAL_FORM = {
  // Founder
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  country: "",
  city: "",
  geography: "",
  professionalBackground: "",
  relevantSkills: "",
  entrepreneurshipReason: "",

  // Venture
  ventureName: "",
  ventureDescription: "",
  problem: "",
  solution: "",
  sector: "",

  // Stage
  ventureStage: "",
  currentProgress: "",

  // Market and team
  targetMarket: "",
  customerDescription: "",
  teamStatus: "",
  teamDescription: "",

  // Cross-continental collaboration
  existingCrossContinentalTeam: "",
  collaboratorNeeds: "",
  marketKnowledge: "",
  geographicConnections: "",
  workingStyle: "",
  leadershipStrengths: "",
  longTermObjectives: "",

  // Commitment and goals
  timeCommitment: "",
  decisionMaking: "",
  ownershipExpectations: "",
  sixMonthGoals: "",

  // Final confirmation
  confirmation: false,
};

/* ============================================================
   SHARED COMPONENTS
============================================================ */

function Field({
  label,
  required = false,
  hint,
  children,
}) {
  return (
    <div className="cfcv-apply-field">
      <label>
        {label}

        {required && (
          <span
            className="cfcv-apply-required"
            aria-hidden="true"
          >
            *
          </span>
        )}
      </label>

      {hint && (
        <p className="cfcv-apply-field__hint">
          {hint}
        </p>
      )}

      {children}
    </div>
  );
}

function ReviewItem({ label, value }) {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  return (
    <div className="cfcv-review-item">
      <span>{label}</span>
      <p>{value}</p>
    </div>
  );
}

/* ============================================================
   PAGE
============================================================ */

function CFCVApply() {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] =
    useState(1);

  const [form, setForm] =
    useState(INITIAL_FORM);

  const [errors, setErrors] =
    useState({});

  const [resume, setResume] =
    useState(null);

  const [submitting, setSubmitting] =
    useState(false);

  const [submitError, setSubmitError] =
    useState("");

  const [retryPending, setRetryPending] =
    useState(false);

  const attemptRef = useRef(null);
  const submittingRef = useRef(false);
  const confirmedRef = useRef(null);

  /* ==========================================================
     DERIVED VALUES
  ========================================================== */

  const currentStepData =
    STEPS.find(
      (step) => step.id === currentStep
    ) || STEPS[0];

  const progress =
    ((currentStep - 1) /
      (STEPS.length - 1)) *
    100;

  const founderName = useMemo(
    () =>
      [form.firstName, form.lastName]
        .filter(Boolean)
        .join(" "),
    [form.firstName, form.lastName]
  );

  /* ==========================================================
     INPUT HANDLING
  ========================================================== */

  function handleChange(event) {
    if (
      submittingRef.current ||
      attemptRef.current
    ) {
      return;
    }

    const {
      name,
      value,
      type,
      checked,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));

    setSubmitError("");
  }

  function handleResumeChange(event) {
    if (
      submittingRef.current ||
      attemptRef.current
    ) {
      return;
    }

    const file =
      event.target.files?.[0] || null;

    const message = resumeError(file);

    setResume(message ? null : file);

    setErrors((previous) => ({
      ...previous,
      resume: message,
    }));

    if (message) {
      event.target.value = "";
    }

    setSubmitError("");
  }

  /* ==========================================================
     VALIDATION
  ========================================================== */

  function validateStep(step) {
    const nextErrors = {};

    if (step === 1) {
      if (!form.firstName.trim()) {
        nextErrors.firstName =
          "First name is required.";
      }

      if (!form.lastName.trim()) {
        nextErrors.lastName =
          "Last name is required.";
      }

      if (!form.email.trim()) {
        nextErrors.email =
          "Email address is required.";
      } else if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          form.email
        )
      ) {
        nextErrors.email =
          "Enter a valid email address.";
      }

      if (!form.country.trim()) {
        nextErrors.country =
          "Country is required.";
      }

      if (!form.geography) {
        nextErrors.geography =
          "Select the geography that applies to you.";
      }

      if (
        !form.professionalBackground.trim()
      ) {
        nextErrors.professionalBackground =
          "Please describe your background.";
      }

      if (!form.relevantSkills.trim()) {
        nextErrors.relevantSkills =
          "Please describe your relevant skills and experience.";
      }
    }

    if (step === 2) {
      if (!form.ventureDescription.trim()) {
        nextErrors.ventureDescription =
          "Please describe your venture or idea.";
      }

      if (!form.problem.trim()) {
        nextErrors.problem =
          "Please describe the problem you are addressing.";
      }

      if (!form.solution.trim()) {
        nextErrors.solution =
          "Please describe your proposed or current solution.";
      }
    }

    if (step === 3) {
      if (!form.ventureStage) {
        nextErrors.ventureStage =
          "Select your venture's current stage.";
      }

      if (!form.currentProgress.trim()) {
        nextErrors.currentProgress =
          "Please describe your current progress.";
      }
    }

    if (step === 4) {
      if (!form.targetMarket.trim()) {
        nextErrors.targetMarket =
          "Please describe your target market.";
      }

      if (!form.teamStatus) {
        nextErrors.teamStatus =
          "Select your current team status.";
      }
    }

    if (step === 5) {
      if (
        !form.existingCrossContinentalTeam
      ) {
        nextErrors.existingCrossContinentalTeam =
          "Please select an option.";
      }

      if (!form.workingStyle.trim()) {
        nextErrors.workingStyle =
          "Please describe your working style.";
      }

      if (
        !form.longTermObjectives.trim()
      ) {
        nextErrors.longTermObjectives =
          "Please describe your long-term objectives.";
      }
    }

    if (step === 6) {
      if (!form.timeCommitment.trim()) {
        nextErrors.timeCommitment =
          "Please describe the time you can commit.";
      }

      if (!form.decisionMaking.trim()) {
        nextErrors.decisionMaking =
          "Please describe how you approach disagreement and decision-making.";
      }

      if (!form.sixMonthGoals.trim()) {
        nextErrors.sixMonthGoals =
          "Please describe what success would look like after six months.";
      }
    }

    if (step === 7) {
      const message = resumeError(resume);

      if (message) {
        nextErrors.resume = message;
      }

      if (!form.confirmation) {
        nextErrors.confirmation =
          "Please confirm the information before submitting.";
      }
    }

    setErrors(nextErrors);

    return (
      Object.keys(nextErrors).length === 0
    );
  }

  /* ==========================================================
     NAVIGATION
  ========================================================== */

  function nextStep() {
    if (
      submittingRef.current ||
      attemptRef.current
    ) {
      return;
    }

    if (!validateStep(currentStep)) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    setCurrentStep((previous) =>
      Math.min(
        previous + 1,
        STEPS.length
      )
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function previousStep() {
    if (
      submittingRef.current ||
      attemptRef.current
    ) {
      return;
    }

    setErrors({});
    setSubmitError("");

    setCurrentStep((previous) =>
      Math.max(previous - 1, 1)
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function goToStep(step) {
    if (
      submittingRef.current ||
      attemptRef.current
    ) {
      return;
    }

    if (step >= currentStep) {
      return;
    }

    setErrors({});
    setCurrentStep(step);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /* ==========================================================
     SUBMISSION

     The API helper sends multipart FormData:
       application   JSON application data
       submissionKey UUID
       resume        File

     There are no automatic retries.
  ========================================================== */

  async function handleSubmit(event) {
    event.preventDefault();

    if (submittingRef.current) {
      return;
    }

    if (currentStep !== 7) {
      nextStep();
      return;
    }

    if (!attemptRef.current) {
      for (
        let step = 1;
        step <= STEPS.length;
        step += 1
      ) {
        if (!validateStep(step)) {
          setCurrentStep(step);

          window.scrollTo({
            top: 0,
            behavior: "smooth",
          });

          return;
        }
      }
    }

    submittingRef.current = true;
    setSubmitting(true);
    setSubmitError("");

    try {
      const application = {
        firstName:
          form.firstName.trim(),

        lastName:
          form.lastName.trim(),

        email:
          form.email.trim().toLowerCase(),

        phone:
          form.phone.trim(),

        country:
          form.country.trim(),

        city:
          form.city.trim(),

        geography:
          form.geography,

        professionalBackground:
          form.professionalBackground.trim(),

        relevantSkills:
          form.relevantSkills.trim(),

        entrepreneurshipReason:
          form.entrepreneurshipReason.trim(),

        ventureName:
          form.ventureName.trim(),

        ventureDescription:
          form.ventureDescription.trim(),

        problem:
          form.problem.trim(),

        solution:
          form.solution.trim(),

        sector:
          form.sector.trim(),

        ventureStage:
          form.ventureStage,

        currentProgress:
          form.currentProgress.trim(),

        targetMarket:
          form.targetMarket.trim(),

        customerDescription:
          form.customerDescription.trim(),

        teamStatus:
          form.teamStatus,

        teamDescription:
          form.teamDescription.trim(),

        existingCrossContinentalTeam:
          form.existingCrossContinentalTeam,

        collaboratorNeeds:
          form.collaboratorNeeds.trim(),

        marketKnowledge:
          form.marketKnowledge.trim(),

        geographicConnections:
          form.geographicConnections.trim(),

        workingStyle:
          form.workingStyle.trim(),

        leadershipStrengths:
          form.leadershipStrengths.trim(),

        longTermObjectives:
          form.longTermObjectives.trim(),

        timeCommitment:
          form.timeCommitment.trim(),

        decisionMaking:
          form.decisionMaking.trim(),

        ownershipExpectations:
          form.ownershipExpectations.trim(),

        sixMonthGoals:
          form.sixMonthGoals.trim(),
      };

      if (!attemptRef.current) {
        attemptRef.current = {
          application,
          resume,

          submissionKey:
            await submissionKeyFor(
              application,
              resume
            ),
        };
      }

      setRetryPending(true);

      // Retain the exact request after an uncertain response.
      // Never rotate its key on network errors, timeout,
      // server errors, or submission conflicts.
      const data =
        confirmedRef.current ||
        (await submitCfcvApplication(
          attemptRef.current
        ));

      if (
        !data?.success ||
        !data?.applicationReference
      ) {
        throw new Error(
          "The server did not confirm submission. Retry to check this same application."
        );
      }

      confirmedRef.current = data;

      const submitted =
        attemptRef.current.application;

      navigate(
        "/cfcv/application-success",
        {
          replace: true,

          state: {
            applicationReference:
              data.applicationReference,

            submittedAt:
              data.submittedAt ||
              new Date().toISOString(),

            applicantName: [
              submitted.firstName,
              submitted.lastName,
            ]
              .filter(Boolean)
              .join(" "),
          },
        }
      );
    } catch (error) {
      const status = Number(
        error?.status ||
        error?.statusCode ||
        0
      );

      const details =
        error?.details ||
        error?.data ||
        {};

      const fields =
        error?.fields ||
        details.fields ||
        [];

      const field =
        error?.field ||
        details.field;

      if (Array.isArray(fields)) {
        setErrors((current) => ({
          ...current,

          ...Object.fromEntries(
            fields
              .filter(
                (value) =>
                  typeof value === "string"
              )
              .map((value) => [
                value,
                "Please check this field.",
              ])
          ),
        }));
      }

      if (field) {
        setErrors((current) => ({
          ...current,
          [field]: error.message,
        }));
      }

      if (
        status === 400 ||
        status === 422
      ) {
        // A definitive validation rejection permits correction.
        // The fingerprint mapping remains available so an
        // unchanged request still reuses its original key.
        attemptRef.current = null;
        setRetryPending(false);

        setSubmitError(
          error?.message ||
          "Please check your application details."
        );
      } else if (
        status === 409 ||
        error?.code === "CONFLICT"
      ) {
        setSubmitError(
          "The server reported a submission conflict. Your submission key has been retained. Contact Continental Founders to confirm your application before starting another one."
        );
      } else {
        setSubmitError(
          (
            error?.message ||
            "We could not confirm your application."
          ) +
          " Use Retry Submission to resend the same application safely."
        );
      }
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <main className="cfcv-apply-page">
      {/* HERO */}

      <section className="cfcv-apply-hero">
        <div className="cfcv-apply-container">
          <Link
            to="/cfcv"
            className="cfcv-apply-back"
          >
            <ArrowLeft size={16} />
            CFCV Fellowship
          </Link>

          <div className="cfcv-apply-hero__content">
            <div>
              <span className="cfcv-apply-eyebrow">
                CONTINENTAL FOUNDERS
              </span>

              <h1>
                CFCV Fellowship
                <br />
                <em>Application</em>
              </h1>
            </div>

            <div className="cfcv-apply-hero__summary">
              <Globe2 size={26} />

              <p>
                CFCV brings together founders in
                Africa and the United States/diaspora
                to build commercially viable
                businesses together.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* APPLICATION */}

      <section className="cfcv-apply-main">
        <div className="cfcv-apply-container">
          {/* PROGRESS */}

          <div className="cfcv-apply-progress">
            <div className="cfcv-apply-progress__top">
              <div>
                <span>
                  STEP {currentStep} OF{" "}
                  {STEPS.length}
                </span>

                <strong>
                  {currentStepData.title}
                </strong>
              </div>

              <span>
                {Math.round(progress)}%
              </span>
            </div>

            <div className="cfcv-apply-progress__bar">
              <span
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>

            <div className="cfcv-apply-progress__steps">
              {STEPS.map((step) => {
                const complete =
                  step.id < currentStep;

                const active =
                  step.id === currentStep;

                return (
                  <button
                    key={step.id}
                    type="button"
                    disabled={
                      step.id > currentStep
                    }
                    onClick={() =>
                      goToStep(step.id)
                    }
                    className={[
                      complete
                        ? "is-complete"
                        : "",
                      active
                        ? "is-active"
                        : "",
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    <span>
                      {complete ? (
                        <Check size={14} />
                      ) : (
                        step.id
                      )}
                    </span>

                    <small>
                      {step.short}
                    </small>
                  </button>
                );
              })}
            </div>
          </div>

          <form
            className="cfcv-apply-form"
            onSubmit={handleSubmit}
            noValidate
          >
            <fieldset
              disabled={
                submitting || retryPending
              }
              style={{
                display: "contents",
                border: 0,
                padding: 0,
                margin: 0,
                minWidth: 0,
              }}
            >
              {/* STEP 1 — FOUNDER */}

              {currentStep === 1 && (
                <section className="cfcv-apply-step">
                  <header>
                    <span>01</span>

                    <div>
                      <h2>
                        Founder Information
                      </h2>

                      <p>
                        Tell us about your background,
                        experience, and the geography
                        from which you are applying.
                      </p>
                    </div>
                  </header>

                  <div className="cfcv-apply-grid">
                    <Field
                      label="First Name"
                      required
                    >
                      <input
                        type="text"
                        name="firstName"
                        value={form.firstName}
                        onChange={handleChange}
                        autoComplete="given-name"
                      />

                      {errors.firstName && (
                        <span className="cfcv-apply-error">
                          {errors.firstName}
                        </span>
                      )}
                    </Field>

                    <Field
                      label="Last Name"
                      required
                    >
                      <input
                        type="text"
                        name="lastName"
                        value={form.lastName}
                        onChange={handleChange}
                        autoComplete="family-name"
                      />

                      {errors.lastName && (
                        <span className="cfcv-apply-error">
                          {errors.lastName}
                        </span>
                      )}
                    </Field>

                    <Field
                      label="Email Address"
                      required
                    >
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        autoComplete="email"
                      />

                      {errors.email && (
                        <span className="cfcv-apply-error">
                          {errors.email}
                        </span>
                      )}
                    </Field>

                    <Field label="Phone Number">
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        autoComplete="tel"
                      />
                    </Field>

                    <Field
                      label="Country"
                      required
                    >
                      <input
                        type="text"
                        name="country"
                        value={form.country}
                        onChange={handleChange}
                        autoComplete="country-name"
                      />

                      {errors.country && (
                        <span className="cfcv-apply-error">
                          {errors.country}
                        </span>
                      )}
                    </Field>

                    <Field label="City">
                      <input
                        type="text"
                        name="city"
                        value={form.city}
                        onChange={handleChange}
                        autoComplete="address-level2"
                      />
                    </Field>

                    <Field
                      label="Applicant Geography"
                      required
                    >
                      <select
                        name="geography"
                        value={form.geography}
                        onChange={handleChange}
                      >
                        <option value="">
                          Select
                        </option>

                        <option value="Africa">
                          Africa
                        </option>

                        <option value="United States">
                          United States
                        </option>

                        <option value="Diaspora">
                          Diaspora
                        </option>
                      </select>

                      {errors.geography && (
                        <span className="cfcv-apply-error">
                          {errors.geography}
                        </span>
                      )}
                    </Field>

                    <div className="cfcv-apply-grid__full">
                      <Field
                        label="Professional / Founder Background"
                        required
                      >
                        <textarea
                          name="professionalBackground"
                          value={
                            form.professionalBackground
                          }
                          onChange={handleChange}
                          rows={5}
                        />

                        {errors.professionalBackground && (
                          <span className="cfcv-apply-error">
                            {errors.professionalBackground}
                          </span>
                        )}
                      </Field>
                    </div>

                    <div className="cfcv-apply-grid__full">
                      <Field
                        label="Relevant Skills and Experience"
                        required
                      >
                        <textarea
                          name="relevantSkills"
                          value={form.relevantSkills}
                          onChange={handleChange}
                          rows={5}
                        />

                        {errors.relevantSkills && (
                          <span className="cfcv-apply-error">
                            {errors.relevantSkills}
                          </span>
                        )}
                      </Field>
                    </div>

                    <div className="cfcv-apply-grid__full">
                      <Field label="Why entrepreneurship and why this problem?">
                        <textarea
                          name="entrepreneurshipReason"
                          value={
                            form.entrepreneurshipReason
                          }
                          onChange={handleChange}
                          rows={5}
                        />
                      </Field>
                    </div>
                  </div>
                </section>
              )}

              {/* STEP 2 — VENTURE */}

              {currentStep === 2 && (
                <section className="cfcv-apply-step">
                  <header>
                    <span>02</span>

                    <div>
                      <h2>
                        Venture Information
                      </h2>

                      <p>
                        Tell us about the venture
                        or idea you are building.
                      </p>
                    </div>
                  </header>

                  <div className="cfcv-apply-grid">
                    <Field label="Venture Name">
                      <input
                        type="text"
                        name="ventureName"
                        value={form.ventureName}
                        onChange={handleChange}
                      />
                    </Field>

                    <Field label="Sector / Industry">
                      <input
                        type="text"
                        name="sector"
                        value={form.sector}
                        onChange={handleChange}
                      />
                    </Field>

                    <div className="cfcv-apply-grid__full">
                      <Field
                        label="Describe your venture or idea"
                        required
                      >
                        <textarea
                          name="ventureDescription"
                          value={
                            form.ventureDescription
                          }
                          onChange={handleChange}
                          rows={6}
                        />

                        {errors.ventureDescription && (
                          <span className="cfcv-apply-error">
                            {errors.ventureDescription}
                          </span>
                        )}
                      </Field>
                    </div>

                    <div className="cfcv-apply-grid__full">
                      <Field
                        label="What problem are you addressing?"
                        required
                      >
                        <textarea
                          name="problem"
                          value={form.problem}
                          onChange={handleChange}
                          rows={5}
                        />

                        {errors.problem && (
                          <span className="cfcv-apply-error">
                            {errors.problem}
                          </span>
                        )}
                      </Field>
                    </div>

                    <div className="cfcv-apply-grid__full">
                      <Field
                        label="Describe your proposed or current solution"
                        required
                      >
                        <textarea
                          name="solution"
                          value={form.solution}
                          onChange={handleChange}
                          rows={5}
                        />

                        {errors.solution && (
                          <span className="cfcv-apply-error">
                            {errors.solution}
                          </span>
                        )}
                      </Field>
                    </div>
                  </div>
                </section>
              )}

              {/* STEP 3 — STAGE */}

              {currentStep === 3 && (
                <section className="cfcv-apply-step">
                  <header>
                    <span>03</span>

                    <div>
                      <h2>
                        Venture Stage
                      </h2>

                      <p>
                        CFCV uses venture development
                        stage to determine appropriate
                        track placement.
                      </p>
                    </div>
                  </header>

                  <div className="cfcv-stage-options">
                    {[
                      {
                        value:
                          "Idea / problem / early concept",
                        title:
                          "Idea / Problem / Early Concept",
                        text:
                          "You are developing or validating an early venture concept.",
                      },
                      {
                        value:
                          "MVP / prototype / pilot / early traction",
                        title:
                          "MVP / Prototype / Pilot / Early Traction",
                        text:
                          "You have begun building or testing the venture.",
                      },
                      {
                        value:
                          "Operating business",
                        title:
                          "Operating Business",
                        text:
                          "Your venture has customers, revenue, contracts, pilots, or partnerships.",
                      },
                    ].map((option) => (
                      <label
                        key={option.value}
                        className={[
                          "cfcv-stage-option",
                          form.ventureStage ===
                          option.value
                            ? "is-selected"
                            : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        <input
                          type="radio"
                          name="ventureStage"
                          value={option.value}
                          checked={
                            form.ventureStage ===
                            option.value
                          }
                          onChange={handleChange}
                        />

                        <span className="cfcv-stage-option__check">
                          <CheckCircle2 size={20} />
                        </span>

                        <strong>
                          {option.title}
                        </strong>

                        <p>
                          {option.text}
                        </p>
                      </label>
                    ))}
                  </div>

                  {errors.ventureStage && (
                    <span className="cfcv-apply-error">
                      {errors.ventureStage}
                    </span>
                  )}

                  <div className="cfcv-apply-single-field">
                    <Field
                      label="Describe your current progress"
                      required
                    >
                      <textarea
                        name="currentProgress"
                        value={form.currentProgress}
                        onChange={handleChange}
                        rows={6}
                      />

                      {errors.currentProgress && (
                        <span className="cfcv-apply-error">
                          {errors.currentProgress}
                        </span>
                      )}
                    </Field>
                  </div>

                  <div className="cfcv-apply-note">
                    <strong>
                      Track placement
                    </strong>

                    <p>
                      Applicants do not select their
                      final CFCV track. Placement in
                      Genesis, Ascend, or Horizon is
                      determined through the admissions
                      process based on business readiness.
                    </p>
                  </div>
                </section>
              )}

              {/* STEP 4 — MARKET AND TEAM */}

              {currentStep === 4 && (
                <section className="cfcv-apply-step">
                  <header>
                    <span>04</span>

                    <div>
                      <h2>
                        Market & Team
                      </h2>

                      <p>
                        Tell us about your target
                        market and current founding team.
                      </p>
                    </div>
                  </header>

                  <div className="cfcv-apply-grid">
                    <div className="cfcv-apply-grid__full">
                      <Field
                        label="Target Market"
                        required
                      >
                        <textarea
                          name="targetMarket"
                          value={form.targetMarket}
                          onChange={handleChange}
                          rows={5}
                        />

                        {errors.targetMarket && (
                          <span className="cfcv-apply-error">
                            {errors.targetMarket}
                          </span>
                        )}
                      </Field>
                    </div>

                    <div className="cfcv-apply-grid__full">
                      <Field label="Describe your target customers or users">
                        <textarea
                          name="customerDescription"
                          value={
                            form.customerDescription
                          }
                          onChange={handleChange}
                          rows={5}
                        />
                      </Field>
                    </div>

                    <Field
                      label="Current Team Status"
                      required
                    >
                      <select
                        name="teamStatus"
                        value={form.teamStatus}
                        onChange={handleChange}
                      >
                        <option value="">
                          Select
                        </option>

                        <option value="Individual founder">
                          Individual founder
                        </option>

                        <option value="Existing team">
                          Existing team
                        </option>
                      </select>

                      {errors.teamStatus && (
                        <span className="cfcv-apply-error">
                          {errors.teamStatus}
                        </span>
                      )}
                    </Field>

                    <div className="cfcv-apply-grid__full">
                      <Field label="Describe your current team">
                        <textarea
                          name="teamDescription"
                          value={form.teamDescription}
                          onChange={handleChange}
                          rows={5}
                        />
                      </Field>
                    </div>
                  </div>
                </section>
              )}

              {/* STEP 5 — COLLABORATION */}

              {currentStep === 5 && (
                <section className="cfcv-apply-step">
                  <header>
                    <span>05</span>

                    <div>
                      <h2>
                        Cross-Continental Collaboration
                      </h2>

                      <p>
                        CFCV ventures ultimately connect
                        Africa and the U.S./diaspora
                        through meaningful participation.
                      </p>
                    </div>
                  </header>

                  <div className="cfcv-apply-grid">
                    <Field
                      label="Do you already have a team connecting Africa and the U.S./diaspora?"
                      required
                    >
                      <select
                        name="existingCrossContinentalTeam"
                        value={
                          form.existingCrossContinentalTeam
                        }
                        onChange={handleChange}
                      >
                        <option value="">
                          Select
                        </option>

                        <option value="Yes">
                          Yes
                        </option>

                        <option value="No">
                          No
                        </option>
                      </select>

                      {errors.existingCrossContinentalTeam && (
                        <span className="cfcv-apply-error">
                          {errors.existingCrossContinentalTeam}
                        </span>
                      )}
                    </Field>

                    <div className="cfcv-apply-grid__full">
                      <Field label="What would you need from a cross-continental collaborator?">
                        <textarea
                          name="collaboratorNeeds"
                          value={form.collaboratorNeeds}
                          onChange={handleChange}
                          rows={5}
                        />
                      </Field>
                    </div>

                    <div className="cfcv-apply-grid__full">
                      <Field label="Describe relevant market knowledge you bring">
                        <textarea
                          name="marketKnowledge"
                          value={form.marketKnowledge}
                          onChange={handleChange}
                          rows={5}
                        />
                      </Field>
                    </div>

                    <div className="cfcv-apply-grid__full">
                      <Field label="Describe any relevant geographic connections">
                        <textarea
                          name="geographicConnections"
                          value={
                            form.geographicConnections
                          }
                          onChange={handleChange}
                          rows={5}
                        />
                      </Field>
                    </div>

                    <div className="cfcv-apply-grid__full">
                      <Field
                        label="Describe your personality and working style"
                        required
                      >
                        <textarea
                          name="workingStyle"
                          value={form.workingStyle}
                          onChange={handleChange}
                          rows={5}
                        />

                        {errors.workingStyle && (
                          <span className="cfcv-apply-error">
                            {errors.workingStyle}
                          </span>
                        )}
                      </Field>
                    </div>

                    <div className="cfcv-apply-grid__full">
                      <Field label="What leadership strengths do you bring?">
                        <textarea
                          name="leadershipStrengths"
                          value={
                            form.leadershipStrengths
                          }
                          onChange={handleChange}
                          rows={5}
                        />
                      </Field>
                    </div>

                    <div className="cfcv-apply-grid__full">
                      <Field
                        label="What are your long-term objectives?"
                        required
                      >
                        <textarea
                          name="longTermObjectives"
                          value={
                            form.longTermObjectives
                          }
                          onChange={handleChange}
                          rows={5}
                        />

                        {errors.longTermObjectives && (
                          <span className="cfcv-apply-error">
                            {errors.longTermObjectives}
                          </span>
                        )}
                      </Field>
                    </div>
                  </div>
                </section>
              )}

              {/* STEP 6 — COMMITMENT */}

              {currentStep === 6 && (
                <section className="cfcv-apply-step">
                  <header>
                    <span>06</span>

                    <div>
                      <h2>
                        Commitment & Goals
                      </h2>

                      <p>
                        Tell us about your availability,
                        approach to working with others,
                        and what you want to achieve.
                      </p>
                    </div>
                  </header>

                  <div className="cfcv-apply-grid">
                    <div className="cfcv-apply-grid__full">
                      <Field
                        label="How much time can you commit?"
                        required
                      >
                        <textarea
                          name="timeCommitment"
                          value={form.timeCommitment}
                          onChange={handleChange}
                          rows={4}
                        />

                        {errors.timeCommitment && (
                          <span className="cfcv-apply-error">
                            {errors.timeCommitment}
                          </span>
                        )}
                      </Field>
                    </div>

                    <div className="cfcv-apply-grid__full">
                      <Field
                        label="How do you approach disagreement and decision-making?"
                        required
                      >
                        <textarea
                          name="decisionMaking"
                          value={form.decisionMaking}
                          onChange={handleChange}
                          rows={5}
                        />

                        {errors.decisionMaking && (
                          <span className="cfcv-apply-error">
                            {errors.decisionMaking}
                          </span>
                        )}
                      </Field>
                    </div>

                    <div className="cfcv-apply-grid__full">
                      <Field label="What are your expectations regarding ownership and the future of the company?">
                        <textarea
                          name="ownershipExpectations"
                          value={
                            form.ownershipExpectations
                          }
                          onChange={handleChange}
                          rows={5}
                        />
                      </Field>
                    </div>

                    <div className="cfcv-apply-grid__full">
                      <Field
                        label="What does success look like six months from now?"
                        required
                      >
                        <textarea
                          name="sixMonthGoals"
                          value={form.sixMonthGoals}
                          onChange={handleChange}
                          rows={6}
                        />

                        {errors.sixMonthGoals && (
                          <span className="cfcv-apply-error">
                            {errors.sixMonthGoals}
                          </span>
                        )}
                      </Field>
                    </div>
                  </div>
                </section>
              )}

              {/* STEP 7 — REVIEW */}

              {currentStep === 7 && (
                <section className="cfcv-apply-step">
                  <header>
                    <span>07</span>

                    <div>
                      <h2>
                        Review & Submit
                      </h2>

                      <p>
                        Review your application before
                        submitting it to Continental Founders.
                      </p>
                    </div>
                  </header>

                  <div className="cfcv-review">
                    <section>
                      <div className="cfcv-review__heading">
                        <div>
                          <User size={18} />

                          <h3>
                            Founder Information
                          </h3>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            goToStep(1)
                          }
                        >
                          Edit
                        </button>
                      </div>

                      <div className="cfcv-review__grid">
                        <ReviewItem
                          label="Founder"
                          value={founderName}
                        />

                        <ReviewItem
                          label="Email"
                          value={form.email}
                        />

                        <ReviewItem
                          label="Phone"
                          value={form.phone}
                        />

                        <ReviewItem
                          label="Country"
                          value={form.country}
                        />

                        <ReviewItem
                          label="City"
                          value={form.city}
                        />

                        <ReviewItem
                          label="Geography"
                          value={form.geography}
                        />

                        <ReviewItem
                          label="Background"
                          value={
                            form.professionalBackground
                          }
                        />

                        <ReviewItem
                          label="Skills & Experience"
                          value={form.relevantSkills}
                        />
                      </div>
                    </section>

                    <section>
                      <div className="cfcv-review__heading">
                        <div>
                          <Globe2 size={18} />

                          <h3>
                            Venture
                          </h3>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            goToStep(2)
                          }
                        >
                          Edit
                        </button>
                      </div>

                      <div className="cfcv-review__grid">
                        <ReviewItem
                          label="Venture Name"
                          value={form.ventureName}
                        />

                        <ReviewItem
                          label="Sector"
                          value={form.sector}
                        />

                        <ReviewItem
                          label="Venture / Idea"
                          value={
                            form.ventureDescription
                          }
                        />

                        <ReviewItem
                          label="Problem"
                          value={form.problem}
                        />

                        <ReviewItem
                          label="Solution"
                          value={form.solution}
                        />

                        <ReviewItem
                          label="Current Stage"
                          value={form.ventureStage}
                        />

                        <ReviewItem
                          label="Current Progress"
                          value={form.currentProgress}
                        />

                        <ReviewItem
                          label="Target Market"
                          value={form.targetMarket}
                        />
                      </div>
                    </section>

                    <section>
                      <div className="cfcv-review__heading">
                        <div>
                          <Users size={18} />

                          <h3>
                            Team & Collaboration
                          </h3>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            goToStep(5)
                          }
                        >
                          Edit
                        </button>
                      </div>

                      <div className="cfcv-review__grid">
                        <ReviewItem
                          label="Team Status"
                          value={form.teamStatus}
                        />

                        <ReviewItem
                          label="Current Team"
                          value={form.teamDescription}
                        />

                        <ReviewItem
                          label="Cross-Continental Team"
                          value={
                            form.existingCrossContinentalTeam
                          }
                        />

                        <ReviewItem
                          label="Collaborator Needs"
                          value={form.collaboratorNeeds}
                        />

                        <ReviewItem
                          label="Working Style"
                          value={form.workingStyle}
                        />

                        <ReviewItem
                          label="Leadership Strengths"
                          value={
                            form.leadershipStrengths
                          }
                        />
                      </div>
                    </section>

                    <section>
                      <div className="cfcv-review__heading">
                        <div>
                          <CheckCircle2 size={18} />

                          <h3>
                            Commitment & Goals
                          </h3>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            goToStep(6)
                          }
                        >
                          Edit
                        </button>
                      </div>

                      <div className="cfcv-review__grid">
                        <ReviewItem
                          label="Time Commitment"
                          value={form.timeCommitment}
                        />

                        <ReviewItem
                          label="Decision-Making"
                          value={form.decisionMaking}
                        />

                        <ReviewItem
                          label="Ownership Expectations"
                          value={
                            form.ownershipExpectations
                          }
                        />

                        <ReviewItem
                          label="Six-Month Goals"
                          value={form.sixMonthGoals}
                        />
                      </div>
                    </section>
                  </div>

                  <Field
                    label="Résumé / CV"
                    required
                    hint="PDF, DOC, or DOCX. Maximum 5 MB."
                  >
                    <input
                      type="file"
                      name="resume"
                      aria-label="Résumé / CV"
                      accept=".pdf,.doc,.docx"
                      onChange={handleResumeChange}
                      aria-invalid={
                        Boolean(errors.resume)
                      }
                      aria-describedby="cfcv-resume-message"
                    />

                    <span id="cfcv-resume-message">
                      {errors.resume ? (
                        <span
                          className="cfcv-apply-error"
                          role="alert"
                        >
                          {errors.resume}
                        </span>
                      ) : resume ? (
                        `Selected: ${resume.name}`
                      ) : (
                        "Choose your résumé before submitting."
                      )}
                    </span>
                  </Field>

                  <label className="cfcv-apply-confirmation">
                    <input
                      type="checkbox"
                      name="confirmation"
                      checked={form.confirmation}
                      onChange={handleChange}
                    />

                    <span>
                      I confirm that the information
                      in this application is accurate
                      to the best of my knowledge.
                    </span>
                  </label>

                  {errors.confirmation && (
                    <span className="cfcv-apply-error">
                      {errors.confirmation}
                    </span>
                  )}

                  {submitError && (
                    <div
                      className="cfcv-apply-submit-error"
                      role="alert"
                    >
                      {submitError}
                    </div>
                  )}
                </section>
              )}
            </fieldset>

            {retryPending && !submitting && (
              <p role="status">
                Your application is awaiting confirmation.
                Retry sends the same details and résumé.
              </p>
            )}

            {/* FOOTER ACTIONS */}

            <div className="cfcv-apply-actions">
              <div>
                {currentStep > 1 && (
                  <button
                    type="button"
                    className="cfcv-apply-button cfcv-apply-button--secondary"
                    onClick={previousStep}
                    disabled={
                      submitting || retryPending
                    }
                  >
                    <ChevronLeft size={18} />
                    Previous
                  </button>
                )}
              </div>

              <div>
                {currentStep < STEPS.length ? (
                  <button
                    type="button"
                    className="cfcv-apply-button cfcv-apply-button--primary"
                    onClick={nextStep}
                  >
                    Continue
                    <ArrowRight size={18} />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="cfcv-apply-button cfcv-apply-button--primary"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2
                          className="cfcv-apply-spinner"
                          size={18}
                        />

                        Submitting...
                      </>
                    ) : (
                      <>
                        {retryPending
                          ? "Retry Submission"
                          : "Submit Application"}

                        <Send size={17} />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}

export default CFCVApply;