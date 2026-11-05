import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import {
  ArrowDown,
  ArrowRight,
  Lightbulb,
  TrendingUp,
  Rocket,
  Compass,
  CheckCircle2,
  ChevronRight,
  X,
} from 'lucide-react';
import './FindYourLane.css';

const pathways = [
  {
    id: 'genesis',
    name: 'GENESIS',
    tagline: 'BUILD IT',
    audience: 'I HAVE AN IDEA',
    description:
      'You have been thinking about starting something, but are not sure how to turn your idea into a real business.',
    transformation:
      'Test your concept and build an actionable launch plan.',
    support:
      'Customer discovery, idea validation, and a practical first-step plan.',
    pain: 'Uncertainty and lack of direction',
    Icon: Lightbulb,
    className: 'genesis',
    to: '/genesis',
  },
  {
    id: 'ascend',
    name: 'ASCEND',
    tagline: 'PROVE IT',
    audience: "I'VE ALREADY STARTED",
    description:
      'You have started a business, product, or service. Now you need to strengthen demand and make better business decisions.',
    transformation:
      'Build evidence of demand and stronger business operations.',
    support:
      'Customer traction, sales, business decisions, and a stronger operating model.',
    pain: 'Inconsistent demand and weak systems',
    Icon: TrendingUp,
    className: 'ascend',
    to: '/ascend',
  },
  {
    id: 'horizon',
    name: 'HORIZON',
    tagline: 'SCALE IT',
    audience: "I'M READY FOR MORE",
    description:
      'Your business has made progress. You are ready to explore new markets, strategic partnerships, and stronger operations.',
    transformation:
      'Improve scale readiness and access to new opportunities.',
    support:
      'Market access, strategic partnerships, operational systems, and growth readiness.',
    pain: 'Expansion barriers and limited connections',
    Icon: Rocket,
    className: 'horizon',
    to: '/horizon',
  },
];

const questions = [
  {
    title: 'Where are you in your entrepreneurial journey?',
    options: [
      { label: 'I have an idea, but have not started yet.', value: 'genesis' },
      { label: 'I have started and need to build traction.', value: 'ascend' },
      { label: 'My business is operating and I want to grow.', value: 'horizon' },
      { label: "I'm not sure how to describe my stage.", value: 'unsure' },
    ],
  },
  {
    title: 'What is your biggest challenge right now?',
    options: [
      { label: 'Testing my idea and finding first customers.', value: 'genesis' },
      { label: 'Improving sales, demand, or business systems.', value: 'ascend' },
      { label: 'Reaching new markets or building partnerships.', value: 'horizon' },
      { label: 'I need help identifying my main challenge.', value: 'unsure' },
    ],
  },
  {
    title: 'What would you most like to accomplish in the next 6–12 months?',
    options: [
      { label: 'Turn my idea into a clear launch plan.', value: 'genesis' },
      { label: 'Build a stronger, more consistent business.', value: 'ascend' },
      { label: 'Prepare my business to expand.', value: 'horizon' },
      { label: 'Talk with someone about my goals.', value: 'unsure' },
    ],
  },
  {
    title: 'What type of support would help you most?',
    options: [
      { label: 'Guidance to start and validate an idea.', value: 'genesis' },
      { label: 'Support with customers, sales, and operations.', value: 'ascend' },
      { label: 'Connections, partnerships, and market access.', value: 'horizon' },
      { label: 'I am not sure yet.', value: 'unsure' },
    ],
  },
  {
    title: 'How confident are you about your next step?',
    options: [
      { label: 'I need help figuring out where to begin.', value: 'genesis' },
      { label: 'I know my next step, but need support to make progress.', value: 'ascend' },
      { label: 'I am ready to pursue a bigger opportunity.', value: 'horizon' },
      { label: 'I would like to discuss my options.', value: 'unsure' },
    ],
  },
];

const CONTACT_EMAIL = 'hello@continentalfounders.org';

// "GENESIS" → "Genesis" for headings and buttons
const titleCase = (name) =>
  name.charAt(0) + name.slice(1).toLowerCase();

function HeaderIntro() {
  return (
    <section className="fyl-hero">
      <div className="fyl-hero-media" aria-hidden="true">
        <img src="/assets/sd.webp" alt="" fetchPriority="high" />
      </div>

      <div className="fyl-container fyl-hero-content">
        <span className="fyl-eyebrow fyl-eyebrow-light">
          <Compass size={16} aria-hidden="true" />
          CONTINENTAL FOUNDERS
        </span>

        <h1>
          Find your <em>lane.</em>
        </h1>

        <p className="fyl-hero-lead">
          Your vision has a future. Your journey starts here.
        </p>

        <p className="fyl-hero-copy">
          Every founder starts somewhere. Tell us where you are today,
          and we’ll help you explore the support that fits your next step.
        </p>

        <div className="fyl-hero-actions">
          <a className="fyl-button fyl-button-gold" href="#choose-lane">
            Find your starting point
            <ArrowDown size={18} aria-hidden="true" />
          </a>

          <p className="fyl-hero-note">
            One cohort. Two continents. Three pathways. A shared future.
          </p>
        </div>
      </div>
    </section>
  );
}

function PathwayCard({ pathway, selected, onExplore }) {
  const Icon = pathway.Icon;

  return (
    <article
      className={`fyl-pathway-card ${pathway.className}${
        selected ? ' is-selected' : ''
      }`}
    >
      <div className="fyl-card-top">
        <span className="fyl-card-icon">
          <Icon size={24} aria-hidden="true" />
        </span>

        <span className="fyl-card-step">{pathway.tagline}</span>
      </div>

      <p className="fyl-card-audience">{pathway.audience}</p>

      <h3>{titleCase(pathway.name)}</h3>

      <p className="fyl-card-description">
        {pathway.description}
      </p>

      <div className="fyl-card-outcome">
        <span className="fyl-outcome-label">YOUR NEXT STEP</span>
        <p>{pathway.transformation}</p>
      </div>

      <button
        className="fyl-card-button"
        type="button"
        aria-expanded={selected}
        aria-controls="fyl-pathway-details"
        onClick={() => onExplore(pathway)}
      >
        Explore {titleCase(pathway.name)}
        <ArrowRight size={17} aria-hidden="true" />
      </button>
    </article>
  );
}

function Assessment({ onClose, onRecommendation }) {
  const [answers, setAnswers] = useState({});
  const [step, setStep] = useState(0);
  const [finished, setFinished] = useState(false);

  const dialogRef = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  const current = questions[step];
  const progress = ((step + 1) / questions.length) * 100;

  const recommendation = useMemo(() => {
    const totals = {
      genesis: 0,
      ascend: 0,
      horizon: 0,
      unsure: 0,
    };

    Object.values(answers).forEach((answer) => {
      totals[answer] += 1;
    });

    const ranked = ['genesis', 'ascend', 'horizon'].sort(
      (a, b) => totals[b] - totals[a]
    );

    const winner = ranked[0];

    if (totals.unsure >= 2 || totals[winner] === 0) {
      return 'unsure';
    }

    return winner;
  }, [answers]);

  const recommended = pathways.find((item) => item.id === recommendation);

  // Escape closes, the page behind stays still, and focus
  // starts inside the dialog and returns afterwards.
  useEffect(() => {
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';
    dialogRef.current?.focus();

    function handleKey(event) {
      if (event.key === 'Escape') closeRef.current();
    }

    document.addEventListener('keydown', handleKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKey);
      previousFocus?.focus?.();
    };
  }, []);

  function choose(value) {
    setAnswers((previous) => ({
      ...previous,
      [step]: value,
    }));
  }

  function nextQuestion() {
    if (step < questions.length - 1) {
      setStep((previous) => previous + 1);
    } else {
      setFinished(true);
    }
  }

  function startAgain() {
    setAnswers({});
    setStep(0);
    setFinished(false);
  }

  // Rendered on <body> so the page transition's transform
  // cannot trap the fixed overlay inside the page.
  return createPortal(
    <div
      className="fyl-modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        ref={dialogRef}
        className="fyl-assessment"
        role="dialog"
        aria-modal="true"
        aria-labelledby="fyl-assessment-title"
        tabIndex={-1}
      >
        <button
          className="fyl-modal-close"
          type="button"
          onClick={onClose}
          aria-label="Close assessment"
        >
          <X size={20} aria-hidden="true" />
        </button>

        {!finished ? (
          <>
            <span className="fyl-eyebrow">
              <Compass size={15} aria-hidden="true" /> FIND YOUR LANE
            </span>

            <div className="fyl-progress-meta">
              <span>Question {step + 1} of {questions.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>

            <div
              className="fyl-progress"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(progress)}
              aria-label="Assessment progress"
            >
              <span style={{ width: `${progress}%` }} />
            </div>

            <h2 id="fyl-assessment-title">{current.title}</h2>

            <div
              className="fyl-answer-list"
              role="radiogroup"
              aria-labelledby="fyl-assessment-title"
            >
              {current.options.map((option) => (
                <label
                  className={`fyl-answer ${
                    answers[step] === option.value ? 'selected' : ''
                  }`}
                  key={option.label}
                >
                  <input
                    type="radio"
                    name={`question-${step}`}
                    value={option.value}
                    checked={answers[step] === option.value}
                    onChange={() => choose(option.value)}
                  />

                  <span>{option.label}</span>
                  <span className="fyl-radio-dot" aria-hidden="true" />
                </label>
              ))}
            </div>

            <div className="fyl-assessment-actions">
              <button
                className="fyl-text-button"
                type="button"
                disabled={step === 0}
                onClick={() => setStep((previous) => previous - 1)}
              >
                Back
              </button>

              <button
                className="fyl-button fyl-button-navy"
                type="button"
                disabled={answers[step] === undefined}
                onClick={nextQuestion}
              >
                {step === questions.length - 1
                  ? 'See recommendation'
                  : 'Next question'}
                <ArrowRight size={17} aria-hidden="true" />
              </button>
            </div>
          </>
        ) : (
          <div className="fyl-result">
            <span className="fyl-result-icon">
              <CheckCircle2 size={32} aria-hidden="true" />
            </span>

            <span className="fyl-eyebrow">
              YOUR PROVISIONAL STARTING POINT
            </span>

            <h2 id="fyl-assessment-title">
              {recommendation === 'unsure'
                ? 'Let’s explore your options together.'
                : `Explore ${titleCase(recommended.name)}.`}
            </h2>

            <p>
              {recommendation === 'unsure'
                ? 'Your journey may touch more than one pathway. Tell our team about your goals and challenges so we can help you identify a suitable starting point.'
                : recommended.support}
            </p>

            <p className="fyl-result-disclaimer">
              This is a guide, not an admissions decision or final placement.
              Our team can help you explore the right next step.
            </p>

            <div className="fyl-result-actions">
              <a
                className="fyl-button fyl-button-gold"
                href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
                  'Help me find my lane'
                )}&body=${encodeURIComponent(
                  `I completed the Find Your Lane assessment. My provisional recommendation is ${recommendation}. Please contact me to discuss next steps.`
                )}`}
              >
                Express your interest
                <ArrowRight size={17} aria-hidden="true" />
              </a>

              <button
                className="fyl-button fyl-button-outline"
                type="button"
                onClick={() => onRecommendation(recommendation)}
              >
                View pathway details
              </button>
            </div>

            <div className="fyl-result-links">
              <button
                className="fyl-text-button"
                type="button"
                onClick={startAgain}
              >
                Start again
              </button>

              <button
                className="fyl-text-button"
                type="button"
                onClick={onClose}
              >
                Close assessment
              </button>
            </div>
          </div>
        )}
      </section>
    </div>,
    document.body
  );
}

export default function FindYourLane() {
  const [assessmentOpen, setAssessmentOpen] = useState(false);
  const [selectedPathway, setSelectedPathway] = useState(null);

  function explorePathway(pathway) {
    setSelectedPathway(pathway);

    setTimeout(() => {
      document
        .getElementById('fyl-pathway-details')
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 0);
  }

  function viewRecommendation(id) {
    setAssessmentOpen(false);

    if (id === 'unsure') {
      document
        .getElementById('fyl-help')
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const pathway = pathways.find((item) => item.id === id);

    if (pathway) explorePathway(pathway);
  }

  const closeAssessment = () => setAssessmentOpen(false);

  return (
    <main className="find-your-lane-page">
      <HeaderIntro />

      <section className="fyl-section fyl-section-soft" id="choose-lane">
        <div className="fyl-container">
          <div className="fyl-section-heading">
            <span className="fyl-eyebrow">START WHERE YOU ARE</span>

            <h2>
              Which founder sounds <em>like you?</em>
            </h2>

            <p>
              You do not have to know every step. You just have to know
              where you are today.
            </p>
          </div>

          <div className="fyl-pathway-grid">
            {pathways.map((pathway) => (
              <PathwayCard
                key={pathway.id}
                pathway={pathway}
                selected={selectedPathway?.id === pathway.id}
                onExplore={explorePathway}
              />
            ))}
          </div>

          {selectedPathway && (
            <div
              className={`fyl-detail ${selectedPathway.className}`}
              id="fyl-pathway-details"
            >
              <div className="fyl-detail-mark">
                <selectedPathway.Icon size={28} aria-hidden="true" />
              </div>

              <div className="fyl-detail-copy">
                <span className="fyl-eyebrow">
                  {selectedPathway.name} · {selectedPathway.tagline}
                </span>

                <h2>{selectedPathway.transformation}</h2>
                <p>{selectedPathway.support}</p>

                <p>
                  <strong>Common challenge:</strong> {selectedPathway.pain}.
                </p>

                <p className="fyl-small-note">
                  Exploring this pathway is not final placement. Our team
                  will consider your readiness, goals, and support needs.
                </p>

                <div className="fyl-detail-actions">
                  <a
                    className="fyl-button fyl-button-gold"
                    href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
                      `Explore ${selectedPathway.name}`
                    )}&body=${encodeURIComponent(
                      `I would like to express interest in the ${selectedPathway.name} pathway. Please contact me about next steps.`
                    )}`}
                  >
                    Express your interest
                    <ArrowRight size={17} aria-hidden="true" />
                  </a>

                  <Link
                    className="fyl-button fyl-button-outline"
                    to={selectedPathway.to}
                  >
                    See the full {titleCase(selectedPathway.name)} pathway
                  </Link>

                  <button
                    className="fyl-text-button"
                    type="button"
                    onClick={() => setAssessmentOpen(true)}
                  >
                    Take the assessment
                  </button>
                </div>
              </div>

              <button
                className="fyl-detail-close"
                type="button"
                onClick={() => setSelectedPathway(null)}
                aria-label="Close pathway details"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
          )}

          <div className="fyl-unsure-card" id="fyl-help">
            <div className="fyl-unsure-icon">
              <Compass size={26} aria-hidden="true" />
            </div>

            <div className="fyl-unsure-copy">
              <span className="fyl-eyebrow fyl-eyebrow-light">
                NEED A LITTLE GUIDANCE?
              </span>
              <h3>Not sure where you fit?</h3>

              <p>
                You do not need to decide on your own. Answer a few quick
                questions about your experience, goals, and challenges.
              </p>
            </div>

            <button
              className="fyl-button fyl-button-gold"
              type="button"
              onClick={() => setAssessmentOpen(true)}
            >
              Help me find my lane
              <ArrowRight size={17} aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      <section className="fyl-section">
        <div className="fyl-container">
          <div className="fyl-section-heading">
            <span className="fyl-eyebrow">
              FROM CHALLENGE TO POSSIBILITY
            </span>

            <h2>
              Move from where you are to <em>what’s next.</em>
            </h2>
          </div>

          <div className="fyl-transformation-grid">
            {pathways.map((pathway, index) => {
              const Icon = pathway.Icon;

              return (
                <article
                  className={`fyl-transformation-card ${pathway.className}`}
                  key={pathway.id}
                >
                  <div className="fyl-transform-top">
                    <span className="fyl-mini-icon">
                      <Icon size={20} aria-hidden="true" />
                    </span>

                    <span className="fyl-transform-number" aria-hidden="true">
                      0{index + 1}
                    </span>
                  </div>

                  <h3>{titleCase(pathway.name)}</h3>

                  <div className="fyl-transform-row">
                    <p className="fyl-pain-label">THE CHALLENGE</p>
                    <p>{pathway.pain}</p>
                  </div>

                  <span className="fyl-transform-arrow" aria-hidden="true">
                    <ChevronRight size={18} />
                  </span>

                  <div className="fyl-transform-row fyl-transform-row-outcome">
                    <p className="fyl-pain-label">
                      THE INTENDED OUTCOME
                    </p>
                    <p>{pathway.transformation}</p>
                  </div>
                </article>
              );
            })}
          </div>

          <p className="fyl-disclaimer">
            These are intended learning and business-development outcomes,
            not guarantees of commercial success.
          </p>
        </div>
      </section>

      <section className="fyl-section fyl-bottom-section">
        <div className="fyl-container">
          <div className="fyl-bottom-cta">
            <div>
              <span className="fyl-eyebrow fyl-eyebrow-light">
                YOUR NEXT CHAPTER STARTS HERE
              </span>

              <h2>Every founder starts somewhere.</h2>

              <p>
                Discover the support that fits your next step—with guidance
                from a community that believes in your future.
              </p>
            </div>

            <button
              className="fyl-button fyl-button-gold"
              type="button"
              onClick={() => setAssessmentOpen(true)}
            >
              Find my lane
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>


      {assessmentOpen && (
        <Assessment
          onClose={closeAssessment}
          onRecommendation={viewRecommendation}
        />
      )}
    </main>
  );
}
