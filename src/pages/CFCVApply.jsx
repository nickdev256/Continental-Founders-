import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { Link, useNavigate } from "react-router-dom";

import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronLeft,
  Clock3,
  FileText,
  Globe2,
  Loader2,
  RotateCcw,
  Send,
  Target,
  TrendingUp,
  Upload,
  User,
  Users,
  X,
} from "lucide-react";

import { submitCfcvApplication } from "../services/cfcvApi";

import "./CFCVApply.css";
import { scrollToTarget } from "../lib/smoothScroll";
import { trackEvent } from "../lib/analytics";

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
   SCROLLING
   Step changes bring the top of the form into view instead of
   jumping back to the top of the page.
============================================================ */

function scrollToForm() {
  const target = document.getElementById("cfcv-apply-start");

  scrollToTarget(target || 0);
}

/* ============================================================
   CFF AT A GLANCE (same figures as the CFF page)
============================================================ */

const GLANCE = [
  { value: "6 months", label: "Intensive fellowship" },
  { value: "Up to 30", label: "Ventures across the cohort" },
  { value: "3 tracks", label: "Genesis · Ascend · Horizon" },
  { value: "Africa + U.S.", label: "And the diaspora" },
];

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
   DRAFT (autosave)
   Answers are kept in this browser so an applicant can finish
   later. The résumé file is never stored. The draft is removed
   once the application is submitted or the applicant starts fresh.
============================================================ */

const DRAFT_KEY = "cfcv:application-draft";

function hasAnswers(values) {
  return Object.entries(values).some(
    ([key, value]) =>
      key !== "confirmation" &&
      typeof value === "string" &&
      value.trim()
  );
}

function readDraft() {
  try {
    const saved = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
    if (!saved?.form) return null;

    // Only accept known fields with the expected type.
    const values = { ...INITIAL_FORM };
    Object.keys(INITIAL_FORM).forEach((key) => {
      if (typeof saved.form[key] === typeof INITIAL_FORM[key]) {
        values[key] = saved.form[key];
      }
    });
    values.confirmation = false;

    if (!hasAnswers(values)) return null;

    const step = Math.min(Math.max(Number(saved.step) || 1, 1), STEPS.length);
    return { form: values, step, savedAt: Number(saved.savedAt) || Date.now() };
  } catch {
    return null;
  }
}

function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    // Storage unavailable: nothing to clear.
  }
}

const formatSavedTime = (timestamp) =>
  new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

const formatSavedDate = (timestamp) =>
  new Date(timestamp).toLocaleString([], {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

const formatFileSize = (bytes) =>
  bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;

/* ============================================================
   FIELD NAMES (error summary) AND CHOICES
============================================================ */

const FIELD_LABELS = {
  firstName: "First name",
  lastName: "Last name",
  email: "Email address",
  country: "Country",
  geography: "Applicant geography",
  professionalBackground: "Professional / founder background",
  relevantSkills: "Relevant skills and experience",
  ventureDescription: "Your venture or idea",
  problem: "The problem you are addressing",
  solution: "Your solution",
  ventureStage: "Venture stage",
  currentProgress: "Current progress",
  targetMarket: "Target market",
  teamStatus: "Current team status",
  existingCrossContinentalTeam: "Cross-continental team",
  workingStyle: "Personality and working style",
  longTermObjectives: "Long-term objectives",
  timeCommitment: "Time commitment",
  decisionMaking: "Disagreement and decision-making",
  sixMonthGoals: "Success in six months",
  resume: "Résumé / CV",
  confirmation: "Confirmation",
};

// Values are sent to the backend as-is; keep them unchanged.
const CHOICES = {
  geography: ["Africa", "United States", "Diaspora"],
  teamStatus: ["Individual founder", "Existing team"],
  existingCrossContinentalTeam: ["Yes", "No"],
};

const countWords = (text) => (text.trim() ? text.trim().split(/\s+/).length : 0);

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

function WordCount({ value }) {
  const words = countWords(value);

  return (
    <span className="cfcv-apply-count" aria-hidden="true">
      {words} {words === 1 ? "word" : "words"}
    </span>
  );
}

// Clickable option cards in place of a dropdown.
function ChoiceGroup({ name, value, options, onChange, invalid }) {
  return (
    <div
      className={`cfcv-apply-choices${invalid ? " is-invalid" : ""}`}
      role="radiogroup"
      aria-label={FIELD_LABELS[name]}
    >
      {options.map((option) => (
        <label
          key={option}
          className={value === option ? "is-selected" : undefined}
        >
          <input
            type="radio"
            name={name}
            value={option}
            checked={value === option}
            onChange={onChange}
          />
          <span className="cfcv-apply-choices__dot" aria-hidden="true">
            <Check size={12} strokeWidth={3} />
          </span>
          {option}
        </label>
      ))}
    </div>
  );
}

/* ============================================================
   PAGE
============================================================ */

/* ============================================================
   VALIDATION
   Pure, so it can check a whole step, a single field when the
   applicant leaves it, or every step before submitting.
============================================================ */

function getStepErrors(step, form, resume) {
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


  return nextErrors;
}

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

  const [draftOffer, setDraftOffer] =
    useState(() => readDraft());

  const [savedAt, setSavedAt] =
    useState(null);

  const [showSummary, setShowSummary] =
    useState(false);

  const [returnToReview, setReturnToReview] =
    useState(false);

  const [dragging, setDragging] =
    useState(false);

  const attemptRef = useRef(null);
  const submittingRef = useRef(false);
  const confirmedRef = useRef(null);
  const formRef = useRef(null);
  const touchedRef = useRef(new Set());
  const startedRef = useRef(false);
  const previousStepRef = useRef(1);

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

  const errorList = Object.entries(errors).filter(
    ([, message]) => message
  );

  // Every answer, grouped by step, for the review page.
  const reviewSections = [
    {
      step: 1,
      title: "Founder Information",
      icon: User,
      items: [
        ["Founder", founderName],
        ["Email", form.email],
        ["Phone", form.phone],
        ["Country", form.country],
        ["City", form.city],
        ["Geography", form.geography],
        ["Background", form.professionalBackground],
        ["Skills & Experience", form.relevantSkills],
        ["Why entrepreneurship", form.entrepreneurshipReason],
      ],
    },
    {
      step: 2,
      title: "Venture",
      icon: Globe2,
      items: [
        ["Venture Name", form.ventureName],
        ["Sector", form.sector],
        ["Venture / Idea", form.ventureDescription],
        ["Problem", form.problem],
        ["Solution", form.solution],
      ],
    },
    {
      step: 3,
      title: "Venture Stage",
      icon: TrendingUp,
      items: [
        ["Current Stage", form.ventureStage],
        ["Current Progress", form.currentProgress],
      ],
    },
    {
      step: 4,
      title: "Market & Team",
      icon: Target,
      items: [
        ["Target Market", form.targetMarket],
        ["Target Customers", form.customerDescription],
        ["Team Status", form.teamStatus],
        ["Current Team", form.teamDescription],
      ],
    },
    {
      step: 5,
      title: "Cross-Continental Collaboration",
      icon: Users,
      items: [
        ["Cross-Continental Team", form.existingCrossContinentalTeam],
        ["Collaborator Needs", form.collaboratorNeeds],
        ["Market Knowledge", form.marketKnowledge],
        ["Geographic Connections", form.geographicConnections],
        ["Working Style", form.workingStyle],
        ["Leadership Strengths", form.leadershipStrengths],
        ["Long-Term Objectives", form.longTermObjectives],
      ],
    },
    {
      step: 6,
      title: "Commitment & Goals",
      icon: CheckCircle2,
      items: [
        ["Time Commitment", form.timeCommitment],
        ["Decision-Making", form.decisionMaking],
        ["Ownership Expectations", form.ownershipExpectations],
        ["Six-Month Goals", form.sixMonthGoals],
      ],
    },
  ];

  /* ==========================================================
     AUTOSAVE
     Saves shortly after the applicant stops typing. Paused while
     the "continue where you left off" choice is on screen so an
     empty form never overwrites a saved draft.
  ========================================================== */

  useEffect(() => {
    if (draftOffer || !hasAnswers(form)) return undefined;

    const timer = setTimeout(() => {
      try {
        const at = Date.now();
        localStorage.setItem(
          DRAFT_KEY,
          JSON.stringify({
            form: { ...form, confirmation: false },
            step: currentStep,
            savedAt: at,
          })
        );
        setSavedAt(at);
      } catch {
        // Storage full or blocked: the form still works.
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [form, currentStep, draftOffer]);

  function resumeDraft() {
    setForm(draftOffer.form);
    setCurrentStep(draftOffer.step);
    setSavedAt(draftOffer.savedAt);
    setDraftOffer(null);
    scrollToForm();
  }

  function startFresh() {
    clearDraft();
    setDraftOffer(null);
  }

  /* ==========================================================
     STEP TRANSITIONS
     The new step slides in from the side it came from.
  ========================================================== */

  useEffect(() => {
    const direction =
      currentStep >= previousStepRef.current ? 1 : -1;
    const changed = currentStep !== previousStepRef.current;

    previousStepRef.current = currentStep;

    if (currentStep === STEPS.length) setReturnToReview(false);

    const step = formRef.current?.querySelector(".cfcv-apply-step");

    if (
      !changed ||
      !step ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return undefined;
    }

    const tween = gsap.fromTo(
      step,
      { autoAlpha: 0, x: 32 * direction },
      {
        autoAlpha: 1,
        x: 0,
        duration: 0.45,
        ease: "power3.out",
        clearProps: "opacity,visibility,transform",
      }
    );

    return () => tween.kill();
  }, [currentStep]);

  /* ==========================================================
     ERROR SUMMARY AND FIELD CHECKS
  ========================================================== */

  function focusField(name) {
    const field = formRef.current?.querySelector(`[name="${name}"]`);
    if (!field) return;

    scrollToTarget(field, { block: "center" });
    setTimeout(() => field.focus({ preventScroll: true }), 450);
  }

  // A field the applicant has typed in is checked when they leave it.
  function handleBlur(event) {
    const { name } = event.target;
    if (!name || !touchedRef.current.has(name)) return;

    const message = getStepErrors(currentStep, form, resume)[name] || "";

    setErrors((previous) =>
      previous[name] === message
        ? previous
        : { ...previous, [name]: message }
    );
  }

  function editFromReview(step) {
    setReturnToReview(true);
    goToStep(step);
  }

  // After an edit, check the remaining steps and go straight back.
  function backToReview() {
    if (submittingRef.current || attemptRef.current) return;

    for (let step = currentStep; step < STEPS.length; step += 1) {
      if (!validateStep(step)) {
        setCurrentStep(step);
        scrollToForm();
        return;
      }
    }

    setShowSummary(false);
    setCurrentStep(STEPS.length);
    scrollToForm();
  }

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

    touchedRef.current.add(name);

    if (!startedRef.current) {
      startedRef.current = true;
      trackEvent("application_start");
    }

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

  function acceptResume(file) {
    if (
      submittingRef.current ||
      attemptRef.current
    ) {
      return false;
    }

    const message = resumeError(file);

    setResume(message ? null : file);

    setErrors((previous) => ({
      ...previous,
      resume: message,
    }));

    setSubmitError("");

    return !message;
  }

  function handleResumeChange(event) {
    const accepted = acceptResume(
      event.target.files?.[0] || null
    );

    if (!accepted) {
      event.target.value = "";
    }
  }

  function handleResumeDrop(event) {
    event.preventDefault();
    setDragging(false);
    acceptResume(event.dataTransfer.files?.[0] || null);
  }

  function removeResume() {
    if (submittingRef.current || attemptRef.current) return;

    setResume(null);
    setErrors((previous) => ({ ...previous, resume: "" }));
  }

  /* ==========================================================
     VALIDATION
  ========================================================== */

  function validateStep(step) {
    const nextErrors = getStepErrors(step, form, resume);
    const valid = Object.keys(nextErrors).length === 0;

    setErrors(nextErrors);
    setShowSummary(!valid);

    return valid;
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
      scrollToForm();

      return;
    }

    setShowSummary(false);

    setCurrentStep((previous) =>
      Math.min(
        previous + 1,
        STEPS.length
      )
    );

    scrollToForm();
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
    setShowSummary(false);

    setCurrentStep((previous) =>
      Math.max(previous - 1, 1)
    );

    scrollToForm();
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
    setShowSummary(false);
    setCurrentStep(step);

    scrollToForm();
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

          scrollToForm();

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

      clearDraft();
      trackEvent("application_submit", {
        geography: attemptRef.current.application.geography,
        stage: attemptRef.current.application.ventureStage,
      });

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
        <div
          className="cfcv-apply-hero__background"
          aria-hidden="true"
        >
          <img
            src="/assets/c.webp"
            alt=""
            fetchPriority="high"
          />
        </div>

        <div className="cfcv-apply-container">
          <Link
            to="/cfcv"
            className="cfcv-apply-back"
          >
            <ArrowLeft size={16} />
            CFF
          </Link>

          <div className="cfcv-apply-hero__content">
            <div>
              <span className="cfcv-apply-eyebrow"> 
                CONTINENTAL FOUNDERS
              </span>

              <h1>
                CFF 
                <br />
                <em>Application</em>
              </h1>
            </div>

            <div className="cfcv-apply-hero__summary">
              <Globe2 size={26} />

              <p>
                CFF brings together founders in
                Africa and the United States/diaspora
                to build commercially viable
                businesses together.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* APPLICATION */}

      <section
        className="cfcv-apply-main"
        id="cfcv-apply-start"
      >
        <div className="cfcv-apply-container cfcv-apply-layout">
          <aside className="cfcv-apply-aside">
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

            <p className="cfcv-apply-progress__meta">
              <span>
                <Clock3 size={14} aria-hidden="true" />
                About 15–20 minutes
              </span>

              {savedAt && (
                <span className="cfcv-apply-saved" role="status">
                  <Check size={14} aria-hidden="true" />
                  Saved {formatSavedTime(savedAt)}
                </span>
              )}
            </p>

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

          <div className="cfcv-apply-glance">
            <span>CFF at a glance</span>

            <ul>
              {GLANCE.map((item) => (
                <li key={item.value}>
                  <strong>{item.value}</strong>
                  <small>{item.label}</small>
                </li>
              ))}
            </ul>
          </div>
          </aside>

          <form
            ref={formRef}
            className="cfcv-apply-form"
            onSubmit={handleSubmit}
            onBlur={handleBlur}
            noValidate
          >
            {draftOffer && (
              <div className="cfcv-apply-draft" role="status">
                <span className="cfcv-apply-draft__icon" aria-hidden="true">
                  <RotateCcw size={20} />
                </span>

                <div className="cfcv-apply-draft__text">
                  <strong>Welcome back. Your saved answers are ready.</strong>
                  <p>
                    Last saved {formatSavedDate(draftOffer.savedAt)}. Your CV
                    isn't saved, so you'll attach it again at the end.
                  </p>
                </div>

                <div className="cfcv-apply-draft__actions">
                  <button
                    type="button"
                    className="cfcv-apply-button cfcv-apply-button--primary"
                    onClick={resumeDraft}
                  >
                    Continue where I left off
                  </button>

                  <button
                    type="button"
                    className="cfcv-apply-button cfcv-apply-button--secondary"
                    onClick={startFresh}
                  >
                    Start fresh
                  </button>
                </div>
              </div>
            )}

            {showSummary && errorList.length > 0 && (
              <div className="cfcv-apply-summary" role="alert">
                <AlertCircle size={20} aria-hidden="true" />

                <div>
                  <strong>
                    Please check {errorList.length}{" "}
                    {errorList.length === 1 ? "answer" : "answers"} before
                    continuing
                  </strong>

                  <ul>
                    {errorList.map(([name, message]) => (
                      <li key={name}>
                        <button type="button" onClick={() => focusField(name)}>
                          {FIELD_LABELS[name] || name}
                        </button>
                        <span>{message}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
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
                      <ChoiceGroup
                        name="geography"
                        value={form.geography}
                        options={CHOICES.geography}
                        onChange={handleChange}
                        invalid={Boolean(errors.geography)}
                      />

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

                        <WordCount value={form.professionalBackground} />

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

                        <WordCount value={form.relevantSkills} />

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

                        <WordCount value={form.entrepreneurshipReason} />
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

                        <WordCount value={form.ventureDescription} />

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

                        <WordCount value={form.problem} />

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

                        <WordCount value={form.solution} />

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
                        CFF uses venture development
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

                      <WordCount value={form.currentProgress} />

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
                      final CFF track. Placement in
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

                        <WordCount value={form.targetMarket} />

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

                        <WordCount value={form.customerDescription} />
                      </Field>
                    </div>

                    <Field
                      label="Current Team Status"
                      required
                    >
                      <ChoiceGroup
                        name="teamStatus"
                        value={form.teamStatus}
                        options={CHOICES.teamStatus}
                        onChange={handleChange}
                        invalid={Boolean(errors.teamStatus)}
                      />

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

                        <WordCount value={form.teamDescription} />
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
                        CFF ventures ultimately connect
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
                      <ChoiceGroup
                        name="existingCrossContinentalTeam"
                        value={form.existingCrossContinentalTeam}
                        options={CHOICES.existingCrossContinentalTeam}
                        onChange={handleChange}
                        invalid={Boolean(errors.existingCrossContinentalTeam)}
                      />

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

                        <WordCount value={form.collaboratorNeeds} />
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

                        <WordCount value={form.marketKnowledge} />
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

                        <WordCount value={form.geographicConnections} />
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

                        <WordCount value={form.workingStyle} />

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

                        <WordCount value={form.leadershipStrengths} />
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

                        <WordCount value={form.longTermObjectives} />

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

                        <WordCount value={form.timeCommitment} />

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

                        <WordCount value={form.decisionMaking} />

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

                        <WordCount value={form.ownershipExpectations} />
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

                        <WordCount value={form.sixMonthGoals} />

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
                    {reviewSections.map(({ step, title, icon: Icon, items }) => (
                      <section key={step}>
                        <div className="cfcv-review__heading">
                          <div>
                            <Icon size={18} />

                            <h3>
                              {title}
                            </h3>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              editFromReview(step)
                            }
                            aria-label={`Edit ${title}`}
                          >
                            Edit
                          </button>
                        </div>

                        <div className="cfcv-review__grid">
                          {items.map(([label, value]) => (
                            <ReviewItem
                              key={label}
                              label={label}
                              value={value}
                            />
                          ))}
                        </div>
                      </section>
                    ))}
                  </div>

                  <Field
                    label="Résumé / CV"
                    required
                  >
                    {resume ? (
                      <div className="cfcv-apply-file">
                        <span className="cfcv-apply-file__icon" aria-hidden="true">
                          <FileText size={20} />
                        </span>

                        <span className="cfcv-apply-file__meta">
                          <strong>{resume.name}</strong>
                          <small>{formatFileSize(resume.size)} · Ready to submit</small>
                        </span>

                        <button
                          type="button"
                          onClick={removeResume}
                          aria-label="Remove résumé"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <label
                        className={[
                          "cfcv-apply-drop",
                          dragging ? "is-dragging" : "",
                          errors.resume ? "has-error" : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        onDragOver={(event) => {
                          event.preventDefault();
                          setDragging(true);
                        }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={handleResumeDrop}
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

                        <span className="cfcv-apply-drop__icon" aria-hidden="true">
                          <Upload size={22} />
                        </span>

                        <strong>
                          Drag your CV here, or <u>browse files</u>
                        </strong>

                        <small>PDF, DOC, or DOCX, up to 5 MB</small>
                      </label>
                    )}

                    <span id="cfcv-resume-message">
                      {errors.resume && (
                        <span
                          className="cfcv-apply-error"
                          role="alert"
                        >
                          {errors.resume}
                        </span>
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
                {currentStep < STEPS.length && returnToReview ? (
                  <div className="cfcv-apply-actions__pair">
                    <button
                      type="button"
                      className="cfcv-apply-button cfcv-apply-button--secondary"
                      onClick={nextStep}
                    >
                      Continue
                    </button>

                    <button
                      type="button"
                      className="cfcv-apply-button cfcv-apply-button--primary"
                      onClick={backToReview}
                    >
                      Back to review
                      <ArrowRight size={18} />
                    </button>
                  </div>
                ) : currentStep < STEPS.length ? (
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