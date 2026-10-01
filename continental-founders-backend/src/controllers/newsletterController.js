const crypto = require("crypto");
const path = require("path");

const {
  supabaseAdmin,
} = require("../config/supabase");

const sendEmail = require("../utils/sendEmail");


/* ============================================================
   CFCV CONFIGURATION
============================================================ */

const CFCV_TABLE =
  "cfcv_applications";

const CFCV_RESUMES_BUCKET =
  String(
    process.env.CFCV_RESUMES_BUCKET ||
      "cfcv-resumes"
  ).trim();

const MAX_RESUME_SIZE =
  5 * 1024 * 1024;

const SIGNED_RESUME_URL_SECONDS =
  300;


/* ============================================================
   ALLOWED RESUME TYPES
============================================================ */

const ALLOWED_RESUME_TYPES =
  new Set([
    "application/pdf",

    "application/msword",

    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ]);

const ALLOWED_RESUME_EXTENSIONS =
  new Set([
    ".pdf",
    ".doc",
    ".docx",
  ]);


/* ============================================================
   VALID CFCV VALUES
============================================================ */

const VALID_GEOGRAPHIES =
  new Set([
    "Africa",
    "United States",
    "Diaspora",
  ]);

const VALID_VENTURE_STAGES =
  new Set([
    "Idea / problem / early concept",

    "MVP / prototype / pilot / early traction",

    "Operating business",
  ]);

const VALID_TEAM_STATUSES =
  new Set([
    "Individual founder",
    "Existing team",
  ]);

const VALID_YES_NO =
  new Set([
    "Yes",
    "No",
  ]);

const VALID_ADMISSIONS_STAGES =
  new Set([
    "applied",
    "assessment",
    "interview",
    "track_placement",
    "matching",
    "compatibility",
    "final_decision",
    "enrollment",
  ]);

const VALID_TRACKS =
  new Set([
    "Genesis",
    "Ascend",
    "Horizon",
  ]);

const VALID_MATCHING_STATUSES =
  new Set([
    "not_started",
    "required",
    "in_progress",
    "matched",
    "compatibility_sprint",
    "completed",
  ]);

const VALID_FINAL_DECISIONS =
  new Set([
    "ADMIT",
    "ADMIT WITH TRACK PLACEMENT",
    "MATCH REQUIRED",
    "WAITLIST",
    "NOT SELECTED",
  ]);

const VALID_STATUSES =
  new Set([
    "submitted",
    "under_review",
    "in_progress",
    "admitted",
    "waitlisted",
    "not_selected",
    "withdrawn",
  ]);

const VALID_INTERVIEW_STATUSES =
  new Set([
    "not_scheduled",
    "scheduled",
    "completed",
    "cancelled",
  ]);


/* ============================================================
   BASIC HELPERS
============================================================ */

function nowIso() {
  return new Date().toISOString();
}


function cleanString(
  value,
  fallback = ""
) {
  if (
    value === null ||
    value === undefined
  ) {
    return fallback;
  }

  return String(value).trim();
}


function cleanNullableString(
  value
) {
  const cleaned =
    cleanString(value);

  return cleaned || null;
}


function cleanEmail(
  value
) {
  return cleanString(value)
    .toLowerCase();
}


function isValidEmail(
  value
) {
  const email =
    cleanEmail(value);

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email
  );
}


function escapeHtml(
  value
) {
  return String(
    value ?? ""
  )
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


function parseBoolean(
  value,
  fallback = false
) {
  if (
    value === true ||
    value === "true" ||
    value === 1 ||
    value === "1"
  ) {
    return true;
  }

  if (
    value === false ||
    value === "false" ||
    value === 0 ||
    value === "0"
  ) {
    return false;
  }

  return fallback;
}


function normalizeNullableDate(
  value
) {
  if (!value) {
    return null;
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  return date.toISOString();
}


function getCurrentAdminId(
  req
) {
  return (
    req?.admin?.id ||
    req?.user?.id ||
    null
  );
}


/* ============================================================
   SERVER ERROR
============================================================ */

function sendServerError(
  res,
  error,
  fallbackMessage =
    "Something went wrong."
) {
  console.error(
    "[CFCV]",
    error
  );

  return res
    .status(500)
    .json({
      success: false,

      message:
        error?.message ||
        fallbackMessage,
    });
}


/* ============================================================
   APPLICATION BODY PARSER

   Supports:
   application=<JSON string>

   from multipart/form-data.

   It also supports normal JSON requests for compatibility.
============================================================ */

function parseApplicationBody(
  req
) {
  const body =
    req?.body || {};

  if (
    typeof body.application ===
    "string"
  ) {
    try {
      return JSON.parse(
        body.application
      );
    } catch {
      const error =
        new Error(
          "The application form data is invalid."
        );

      error.statusCode = 400;

      throw error;
    }
  }

  if (
    body.application &&
    typeof body.application ===
      "object"
  ) {
    return body.application;
  }

  return body;
}


/* ============================================================
   RESUME HELPERS
============================================================ */

function getResumeExtension(
  file
) {
  const originalName =
    cleanString(
      file?.originalname
    );

  let extension =
    path
      .extname(
        originalName
      )
      .toLowerCase();

  if (
    ALLOWED_RESUME_EXTENSIONS.has(
      extension
    )
  ) {
    return extension;
  }

  const mimeType =
    cleanString(
      file?.mimetype
    ).toLowerCase();

  if (
    mimeType ===
    "application/pdf"
  ) {
    return ".pdf";
  }

  if (
    mimeType ===
    "application/msword"
  ) {
    return ".doc";
  }

  if (
    mimeType ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    return ".docx";
  }

  return "";
}


function validateResumeFile(
  file
) {
  if (!file) {
    return {
      valid: false,

      message:
        "Please upload your résumé or CV.",
    };
  }

  if (
    !Buffer.isBuffer(
      file.buffer
    ) ||
    file.buffer.length === 0
  ) {
    return {
      valid: false,

      message:
        "The uploaded résumé or CV is empty.",
    };
  }

  if (
    file.buffer.length >
    MAX_RESUME_SIZE
  ) {
    return {
      valid: false,

      message:
        "Your résumé or CV must not exceed 5 MB.",
    };
  }

  const mimeType =
    cleanString(
      file.mimetype
    ).toLowerCase();

  if (
    !ALLOWED_RESUME_TYPES.has(
      mimeType
    )
  ) {
    return {
      valid: false,

      message:
        "Only PDF, DOC and DOCX résumé files are allowed.",
    };
  }

  const extension =
    getResumeExtension(
      file
    );

  if (
    !extension ||
    !ALLOWED_RESUME_EXTENSIONS.has(
      extension
    )
  ) {
    return {
      valid: false,

      message:
        "Unable to determine the résumé file format.",
    };
  }

  return {
    valid: true,
    extension,
    mimeType,
  };
}


/* ============================================================
   CLEAN STORAGE FILE NAME
============================================================ */

function sanitizeFileName(
  value
) {
  const original =
    cleanString(
      value,
      "resume"
    );

  return original
    .replace(
      /[^a-zA-Z0-9._-]/g,
      "-"
    )
    .replace(
      /-+/g,
      "-"
    )
    .slice(
      0,
      120
    );
}


/* ============================================================
   APPLICATION REFERENCE
============================================================ */

async function generateApplicationReference() {
  const year =
    new Date().getFullYear();

  for (
    let attempt = 0;
    attempt < 10;
    attempt += 1
  ) {
    const token =
      crypto
        .randomBytes(4)
        .toString("hex")
        .toUpperCase();

    const reference =
      `CFCV-${year}-${token}`;

    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from(
          CFCV_TABLE
        )
        .select(
          "id"
        )
        .eq(
          "application_reference",
          reference
        )
        .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return reference;
    }
  }

  throw new Error(
    "Unable to generate a unique application reference."
  );
}


/* ============================================================
   NORMALIZE APPLICATION
============================================================ */

function normalizeApplication(
  row
) {
  if (!row) {
    return null;
  }

  return {
    id:
      row.id,

    applicationReference:
      row.application_reference,

    firstName:
      row.first_name || "",

    lastName:
      row.last_name || "",

    email:
      row.email || "",

    phone:
      row.phone || "",

    country:
      row.country || "",

    city:
      row.city || "",

    geography:
      row.geography || "",

    professionalBackground:
      row.professional_background ||
      "",

    relevantSkills:
      row.relevant_skills || "",

    entrepreneurshipReason:
      row.entrepreneurship_reason ||
      "",

    ventureName:
      row.venture_name || "",

    sector:
      row.sector || "",

    ventureDescription:
      row.venture_description ||
      "",

    problem:
      row.problem || "",

    solution:
      row.solution || "",

    ventureStage:
      row.venture_stage || "",

    currentProgress:
      row.current_progress || "",

    targetMarket:
      row.target_market || "",

    customerDescription:
      row.customer_description ||
      "",

    teamStatus:
      row.team_status || "",

    teamDescription:
      row.team_description || "",

    existingCrossContinentalTeam:
      row.existing_cross_continental_team ||
      "",

    collaboratorNeeds:
      row.collaborator_needs || "",

    marketKnowledge:
      row.market_knowledge || "",

    geographicConnections:
      row.geographic_connections ||
      "",

    workingStyle:
      row.working_style || "",

    leadershipStrengths:
      row.leadership_strengths ||
      "",

    longTermObjectives:
      row.long_term_objectives ||
      "",

    timeCommitment:
      row.time_commitment || "",

    decisionMaking:
      row.decision_making || "",

    ownershipExpectations:
      row.ownership_expectations ||
      "",

    sixMonthGoals:
      row.six_month_goals || "",

    resumeFileName:
      row.resume_file_name || "",

    resumeMimeType:
      row.resume_mime_type || "",

    hasResume:
      Boolean(
        row.resume_path
      ),

    admissionsStage:
      row.admissions_stage ||
      "applied",

    assignedTrack:
      row.assigned_track ||
      null,

    matchingRequired:
      Boolean(
        row.matching_required
      ),

    matchingStatus:
      row.matching_status ||
      "not_started",

    finalDecision:
      row.final_decision ||
      null,

    reviewerNotes:
      row.reviewer_notes || "",

    interviewNotes:
      row.interview_notes || "",

    matchingNotes:
      row.matching_notes || "",

    decisionNotes:
      row.decision_notes || "",

    interviewRequired:
      Boolean(
        row.interview_required
      ),

    interviewStatus:
      row.interview_status ||
      "not_scheduled",

    interviewDate:
      row.interview_date ||
      null,

    status:
      row.status ||
      "submitted",

    reviewedBy:
      row.reviewed_by ||
      null,

    reviewedAt:
      row.reviewed_at ||
      null,

    submittedAt:
      row.submitted_at ||
      null,

    createdAt:
      row.created_at ||
      null,

    updatedAt:
      row.updated_at ||
      null,
  };
}


/* ============================================================
   VALIDATE PUBLIC APPLICATION
============================================================ */

function validatePublicApplication(
  application
) {
  const errors = [];

  const firstName =
    cleanString(
      application.firstName
    );

  const lastName =
    cleanString(
      application.lastName
    );

  const email =
    cleanEmail(
      application.email
    );

  const country =
    cleanString(
      application.country
    );

  const geography =
    cleanString(
      application.geography
    );

  const professionalBackground =
    cleanString(
      application.professionalBackground
    );

  const relevantSkills =
    cleanString(
      application.relevantSkills
    );

  const ventureDescription =
    cleanString(
      application.ventureDescription
    );

  const problem =
    cleanString(
      application.problem
    );

  const solution =
    cleanString(
      application.solution
    );

  const ventureStage =
    cleanString(
      application.ventureStage
    );

  const currentProgress =
    cleanString(
      application.currentProgress
    );

  const targetMarket =
    cleanString(
      application.targetMarket
    );

  const teamStatus =
    cleanString(
      application.teamStatus
    );

  const existingCrossContinentalTeam =
    cleanString(
      application.existingCrossContinentalTeam
    );

  const workingStyle =
    cleanString(
      application.workingStyle
    );

  const longTermObjectives =
    cleanString(
      application.longTermObjectives
    );

  const timeCommitment =
    cleanString(
      application.timeCommitment
    );

  const decisionMaking =
    cleanString(
      application.decisionMaking
    );

  const sixMonthGoals =
    cleanString(
      application.sixMonthGoals
    );


  if (!firstName) {
    errors.push(
      "First name is required."
    );
  }

  if (!lastName) {
    errors.push(
      "Last name is required."
    );
  }

  if (
    !email ||
    !isValidEmail(email)
  ) {
    errors.push(
      "A valid email address is required."
    );
  }

  if (!country) {
    errors.push(
      "Country is required."
    );
  }

  if (
    !VALID_GEOGRAPHIES.has(
      geography
    )
  ) {
    errors.push(
      "Please select a valid geographic location."
    );
  }

  if (!professionalBackground) {
    errors.push(
      "Professional background is required."
    );
  }

  if (!relevantSkills) {
    errors.push(
      "Relevant skills are required."
    );
  }

  if (!ventureDescription) {
    errors.push(
      "Venture description is required."
    );
  }

  if (!problem) {
    errors.push(
      "Please describe the problem your venture addresses."
    );
  }

  if (!solution) {
    errors.push(
      "Please describe your proposed solution."
    );
  }

  if (
    !VALID_VENTURE_STAGES.has(
      ventureStage
    )
  ) {
    errors.push(
      "Please select a valid venture stage."
    );
  }

  if (!currentProgress) {
    errors.push(
      "Current venture progress is required."
    );
  }

  if (!targetMarket) {
    errors.push(
      "Target market is required."
    );
  }

  if (
    !VALID_TEAM_STATUSES.has(
      teamStatus
    )
  ) {
    errors.push(
      "Please select a valid team status."
    );
  }

  if (
    !VALID_YES_NO.has(
      existingCrossContinentalTeam
    )
  ) {
    errors.push(
      "Please indicate whether you already have a cross-continental team."
    );
  }

  if (!workingStyle) {
    errors.push(
      "Working style is required."
    );
  }

  if (!longTermObjectives) {
    errors.push(
      "Long-term objectives are required."
    );
  }

  if (!timeCommitment) {
    errors.push(
      "Time commitment is required."
    );
  }

  if (!decisionMaking) {
    errors.push(
      "Decision-making approach is required."
    );
  }

  if (!sixMonthGoals) {
    errors.push(
      "Six-month goals are required."
    );
  }

  return errors;
}


/* ============================================================
   CREATE RESUME STORAGE PATH
============================================================ */

function buildResumeStoragePath(
  applicationReference,
  file,
  extension
) {
  const safeName =
    sanitizeFileName(
      path.basename(
        cleanString(
          file?.originalname,
          `resume${extension}`
        ),
        path.extname(
          cleanString(
            file?.originalname
          )
        )
      )
    );

  const randomId =
    crypto.randomUUID();

  return [
    applicationReference,
    `${randomId}-${safeName}${extension}`,
  ].join("/");
}


/* ============================================================
   REMOVE RESUME SAFELY
============================================================ */

async function safelyRemoveResume(
  storagePath
) {
  if (!storagePath) {
    return;
  }

  try {
    const {
      error,
    } =
      await supabaseAdmin
        .storage
        .from(
          CFCV_RESUMES_BUCKET
        )
        .remove([
          storagePath,
        ]);

    if (error) {
      console.error(
        "[CFCV] Unable to remove résumé:",
        error
      );
    }
  } catch (error) {
    console.error(
      "[CFCV] Résumé cleanup error:",
      error
    );
  }
}


/* ============================================================
   ADMIN NOTIFICATION EMAIL
============================================================ */

function getCfcvNotificationEmail() {
  return cleanEmail(
    process.env.CFCV_NOTIFICATION_EMAIL ||
      process.env.ADMIN_NOTIFICATION_EMAIL ||
      process.env.CONTACT_NOTIFICATION_EMAIL ||
      process.env.CONTACT_EMAIL ||
      ""
  );
}


function buildAdminNotificationHtml({
  applicationReference,
  application,
  submittedAt,
}) {
  const fullName =
    `${cleanString(
      application.firstName
    )} ${cleanString(
      application.lastName
    )}`.trim();

  return `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1"
    />
    <title>New CFCV Application</title>
  </head>

  <body
    style="
      margin:0;
      padding:0;
      background:#f4f6f8;
      font-family:Arial,sans-serif;
      color:#172033;
    "
  >
    <table
      role="presentation"
      width="100%"
      cellspacing="0"
      cellpadding="0"
      border="0"
    >
      <tr>
        <td
          align="center"
          style="padding:32px 16px;"
        >
          <table
            role="presentation"
            width="680"
            cellspacing="0"
            cellpadding="0"
            border="0"
            style="
              width:100%;
              max-width:680px;
              background:#ffffff;
              border-radius:16px;
              overflow:hidden;
            "
          >
            <tr>
              <td
                style="
                  padding:28px 32px;
                  background:#0d2238;
                  color:#ffffff;
                "
              >
                <div
                  style="
                    font-size:13px;
                    font-weight:700;
                    letter-spacing:1.2px;
                    text-transform:uppercase;
                    color:#d6b45b;
                  "
                >
                  Continental Founders
                </div>

                <h1
                  style="
                    margin:10px 0 0;
                    font-size:26px;
                    line-height:34px;
                  "
                >
                  New CFCV Fellowship Application
                </h1>
              </td>
            </tr>

            <tr>
              <td
                style="
                  padding:30px 32px;
                  font-size:15px;
                  line-height:24px;
                "
              >
                <p
                  style="
                    margin:0 0 20px;
                  "
                >
                  A new application has been submitted
                  through the CFCV Fellowship application.
                </p>

                <table
                  role="presentation"
                  width="100%"
                  cellspacing="0"
                  cellpadding="0"
                  border="0"
                  style="
                    border-collapse:collapse;
                  "
                >
                  <tr>
                    <td
                      style="
                        padding:9px 0;
                        font-weight:700;
                        width:190px;
                      "
                    >
                      Application Reference
                    </td>

                    <td
                      style="
                        padding:9px 0;
                      "
                    >
                      ${escapeHtml(
                        applicationReference
                      )}
                    </td>
                  </tr>

                  <tr>
                    <td
                      style="
                        padding:9px 0;
                        font-weight:700;
                      "
                    >
                      Applicant
                    </td>

                    <td
                      style="
                        padding:9px 0;
                      "
                    >
                      ${escapeHtml(
                        fullName
                      )}
                    </td>
                  </tr>

                  <tr>
                    <td
                      style="
                        padding:9px 0;
                        font-weight:700;
                      "
                    >
                      Email
                    </td>

                    <td
                      style="
                        padding:9px 0;
                      "
                    >
                      ${escapeHtml(
                        application.email
                      )}
                    </td>
                  </tr>

                  <tr>
                    <td
                      style="
                        padding:9px 0;
                        font-weight:700;
                      "
                    >
                      Country
                    </td>

                    <td
                      style="
                        padding:9px 0;
                      "
                    >
                      ${escapeHtml(
                        application.country
                      )}
                    </td>
                  </tr>

                  <tr>
                    <td
                      style="
                        padding:9px 0;
                        font-weight:700;
                      "
                    >
                      Geography
                    </td>

                    <td
                      style="
                        padding:9px 0;
                      "
                    >
                      ${escapeHtml(
                        application.geography
                      )}
                    </td>
                  </tr>

                  <tr>
                    <td
                      style="
                        padding:9px 0;
                        font-weight:700;
                      "
                    >
                      Venture
                    </td>

                    <td
                      style="
                        padding:9px 0;
                      "
                    >
                      ${escapeHtml(
                        application.ventureName ||
                          "Not provided"
                      )}
                    </td>
                  </tr>

                  <tr>
                    <td
                      style="
                        padding:9px 0;
                        font-weight:700;
                      "
                    >
                      Sector
                    </td>

                    <td
                      style="
                        padding:9px 0;
                      "
                    >
                      ${escapeHtml(
                        application.sector ||
                          "Not provided"
                      )}
                    </td>
                  </tr>

                  <tr>
                    <td
                      style="
                        padding:9px 0;
                        font-weight:700;
                      "
                    >
                      Venture Stage
                    </td>

                    <td
                      style="
                        padding:9px 0;
                      "
                    >
                      ${escapeHtml(
                        application.ventureStage
                      )}
                    </td>
                  </tr>

                  <tr>
                    <td
                      style="
                        padding:9px 0;
                        font-weight:700;
                      "
                    >
                      Team Status
                    </td>

                    <td
                      style="
                        padding:9px 0;
                      "
                    >
                      ${escapeHtml(
                        application.teamStatus
                      )}
                    </td>
                  </tr>

                  <tr>
                    <td
                      style="
                        padding:9px 0;
                        font-weight:700;
                      "
                    >
                      Submitted
                    </td>

                    <td
                      style="
                        padding:9px 0;
                      "
                    >
                      ${escapeHtml(
                        submittedAt
                      )}
                    </td>
                  </tr>
                </table>

                <p
                  style="
                    margin:24px 0 0;
                    padding:16px;
                    background:#f7f8fa;
                    border-radius:10px;
                  "
                >
                  The applicant's résumé/CV has been
                  stored privately. Open the CFCV
                  Admissions CMS to review the complete
                  application and access the résumé.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `.trim();
}


function buildAdminNotificationText({
  applicationReference,
  application,
  submittedAt,
}) {
  const fullName =
    `${cleanString(
      application.firstName
    )} ${cleanString(
      application.lastName
    )}`.trim();

  return [
    "New CFCV Fellowship Application",
    "",
    `Application Reference: ${applicationReference}`,
    `Applicant: ${fullName}`,
    `Email: ${application.email}`,
    `Country: ${application.country}`,
    `Geography: ${application.geography}`,
    `Venture: ${application.ventureName || "Not provided"}`,
    `Sector: ${application.sector || "Not provided"}`,
    `Venture Stage: ${application.ventureStage}`,
    `Team Status: ${application.teamStatus}`,
    `Submitted: ${submittedAt}`,
    "",
    "The applicant's résumé/CV is stored privately and can be accessed through the CFCV Admissions CMS.",
  ].join("\n");
}


/* ============================================================
   SEND ADMIN NOTIFICATION SAFELY

   Email failure must NOT delete or reject an application that
   has already been stored successfully.
============================================================ */

async function safelySendAdminNotification({
  applicationReference,
  application,
  submittedAt,
}) {
  const notificationEmail =
    getCfcvNotificationEmail();

  if (!notificationEmail) {
    console.warn(
      "[CFCV] No CFCV notification email is configured. Application saved without email notification."
    );

    return {
      sent: false,
      reason:
        "notification_email_not_configured",
    };
  }

  try {
    const result =
      await sendEmail({
        to:
          notificationEmail,

        subject:
          `New CFCV Application — ${applicationReference}`,

        html:
          buildAdminNotificationHtml({
            applicationReference,
            application,
            submittedAt,
          }),

        text:
          buildAdminNotificationText({
            applicationReference,
            application,
            submittedAt,
          }),
      });

    if (
      result &&
      result.success === false
    ) {
      console.error(
        "[CFCV] Application notification email was rejected:",
        result
      );

      return {
        sent: false,
        reason:
          result.message ||
          result.error ||
          "email_provider_rejected",
      };
    }

    return {
      sent: true,

      providerMessageId:
        result?.messageId ||
        result?.id ||
        result?.data?.id ||
        null,
    };
  } catch (error) {
    console.error(
      "[CFCV] Unable to send application notification email:",
      error
    );

    return {
      sent: false,
      reason:
        error?.message ||
        "email_send_failed",
    };
  }
}


/* ============================================================
   CREATE PUBLIC APPLICATION
============================================================ */

async function createApplication(
  req,
  res
) {
  let uploadedResumePath =
    null;

  try {
    const application =
      parseApplicationBody(
        req
      );

    const validationErrors =
      validatePublicApplication(
        application
      );

    if (
      validationErrors.length >
      0
    ) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            validationErrors[0],

          errors:
            validationErrors,
        });
    }


    /* --------------------------------------------------------
       RESUME VALIDATION
    --------------------------------------------------------- */

    const resumeFile =
      req.file;

    const resumeValidation =
      validateResumeFile(
        resumeFile
      );

    if (
      !resumeValidation.valid
    ) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            resumeValidation.message,
        });
    }


    /* --------------------------------------------------------
       APPLICATION REFERENCE
    --------------------------------------------------------- */

    const applicationReference =
      await generateApplicationReference();


    /* --------------------------------------------------------
       UPLOAD PRIVATE RESUME
    --------------------------------------------------------- */

    const resumeStoragePath =
      buildResumeStoragePath(
        applicationReference,
        resumeFile,
        resumeValidation.extension
      );

    const {
      data: uploadData,
      error: uploadError,
    } =
      await supabaseAdmin
        .storage
        .from(
          CFCV_RESUMES_BUCKET
        )
        .upload(
          resumeStoragePath,
          resumeFile.buffer,
          {
            contentType:
              resumeValidation.mimeType,

            cacheControl:
              "3600",

            upsert:
              false,
          }
        );

    if (uploadError) {
      console.error(
        "[CFCV] Résumé upload error:",
        uploadError
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            "We could not securely upload your résumé or CV. Please try again.",
        });
    }

    uploadedResumePath =
      uploadData?.path ||
      resumeStoragePath;


    /* --------------------------------------------------------
       DATABASE PAYLOAD

       Admissions decisions are intentionally controlled by
       the backend and cannot be supplied by the applicant.
    --------------------------------------------------------- */

    const submittedAt =
      nowIso();

    const payload = {
      application_reference:
        applicationReference,

      first_name:
        cleanString(
          application.firstName
        ),

      last_name:
        cleanString(
          application.lastName
        ),

      email:
        cleanEmail(
          application.email
        ),

      phone:
        cleanString(
          application.phone
        ),

      country:
        cleanString(
          application.country
        ),

      city:
        cleanString(
          application.city
        ),

      geography:
        cleanString(
          application.geography
        ),

      professional_background:
        cleanString(
          application.professionalBackground
        ),

      relevant_skills:
        cleanString(
          application.relevantSkills
        ),

      entrepreneurship_reason:
        cleanString(
          application.entrepreneurshipReason
        ),

      venture_name:
        cleanString(
          application.ventureName
        ),

      sector:
        cleanString(
          application.sector
        ),

      venture_description:
        cleanString(
          application.ventureDescription
        ),

      problem:
        cleanString(
          application.problem
        ),

      solution:
        cleanString(
          application.solution
        ),

      venture_stage:
        cleanString(
          application.ventureStage
        ),

      current_progress:
        cleanString(
          application.currentProgress
        ),

      target_market:
        cleanString(
          application.targetMarket
        ),

      customer_description:
        cleanString(
          application.customerDescription
        ),

      team_status:
        cleanString(
          application.teamStatus
        ),

      team_description:
        cleanString(
          application.teamDescription
        ),

      existing_cross_continental_team:
        cleanString(
          application.existingCrossContinentalTeam
        ),

      collaborator_needs:
        cleanString(
          application.collaboratorNeeds
        ),

      market_knowledge:
        cleanString(
          application.marketKnowledge
        ),

      geographic_connections:
        cleanString(
          application.geographicConnections
        ),

      working_style:
        cleanString(
          application.workingStyle
        ),

      leadership_strengths:
        cleanString(
          application.leadershipStrengths
        ),

      long_term_objectives:
        cleanString(
          application.longTermObjectives
        ),

      time_commitment:
        cleanString(
          application.timeCommitment
        ),

      decision_making:
        cleanString(
          application.decisionMaking
        ),

      ownership_expectations:
        cleanString(
          application.ownershipExpectations
        ),

      six_month_goals:
        cleanString(
          application.sixMonthGoals
        ),


      /* ------------------------------------------------------
         PRIVATE RESUME METADATA

         No public URL is stored.
      ------------------------------------------------------- */

      resume_path:
        uploadedResumePath,

      resume_file_name:
        cleanString(
          resumeFile.originalname
        ),

      resume_mime_type:
        resumeValidation.mimeType,


      /* ------------------------------------------------------
         SERVER-CONTROLLED ADMISSIONS FIELDS
      ------------------------------------------------------- */

      admissions_stage:
        "applied",

      assigned_track:
        null,

      matching_required:
        false,

      matching_status:
        "not_started",

      final_decision:
        null,

      reviewer_notes:
        "",

      interview_notes:
        "",

      matching_notes:
        "",

      decision_notes:
        "",

      interview_required:
        false,

      interview_status:
        "not_scheduled",

      interview_date:
        null,

      status:
        "submitted",

      reviewed_by:
        null,

      reviewed_at:
        null,

      submitted_at:
        submittedAt,

      created_at:
        submittedAt,

      updated_at:
        submittedAt,
    };


    /* --------------------------------------------------------
       SAVE APPLICATION
    --------------------------------------------------------- */

    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from(
          CFCV_TABLE
        )
        .insert(
          payload
        )
        .select("*")
        .single();

    if (error) {
      await safelyRemoveResume(
        uploadedResumePath
      );

      uploadedResumePath =
        null;

      throw error;
    }


    /* --------------------------------------------------------
       EMAIL CLIENT / ADMIN

       Application is already safely stored. Email failure
       therefore does not reject the application.
    --------------------------------------------------------- */

    const notification =
      await safelySendAdminNotification({
        applicationReference,
        application,
        submittedAt,
      });


    /* --------------------------------------------------------
       RESPONSE
    --------------------------------------------------------- */

    return res
      .status(201)
      .json({
        success: true,

        message:
          "Your CFCV application has been submitted successfully.",

        applicationReference,

        submittedAt,

        application:
          normalizeApplication(
            data
          ),

        notificationSent:
          notification.sent,
      });
  } catch (error) {
    if (uploadedResumePath) {
      await safelyRemoveResume(
        uploadedResumePath
      );
    }

    if (
      error?.statusCode ===
      400
    ) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            error.message,
        });
    }

    return sendServerError(
      res,
      error,
      "Unable to submit your CFCV application."
    );
  }
}


/* ============================================================
   GET APPLICATIONS - ADMIN
============================================================ */

async function getApplications(
  req,
  res
) {
  try {
    const status =
      cleanString(
        req.query?.status
      );

    const admissionsStage =
      cleanString(
        req.query?.admissionsStage ||
        req.query?.admissions_stage
      );

    const track =
      cleanString(
        req.query?.track
      );

    const geography =
      cleanString(
        req.query?.geography
      );

    const search =
      cleanString(
        req.query?.search
      );


    let query =
      supabaseAdmin
        .from(
          CFCV_TABLE
        )
        .select("*");


    if (status) {
      if (
        !VALID_STATUSES.has(
          status
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Invalid application status.",
          });
      }

      query =
        query.eq(
          "status",
          status
        );
    }


    if (admissionsStage) {
      if (
        !VALID_ADMISSIONS_STAGES.has(
          admissionsStage
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Invalid admissions stage.",
          });
      }

      query =
        query.eq(
          "admissions_stage",
          admissionsStage
        );
    }


    if (track) {
      if (
        !VALID_TRACKS.has(
          track
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Invalid CFCV track.",
          });
      }

      query =
        query.eq(
          "assigned_track",
          track
        );
    }


    if (geography) {
      if (
        !VALID_GEOGRAPHIES.has(
          geography
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Invalid geography.",
          });
      }

      query =
        query.eq(
          "geography",
          geography
        );
    }


    if (search) {
      const safeSearch =
        search
          .replace(/[%(),]/g, " ")
          .replace(/\s+/g, " ")
          .trim();

      if (safeSearch) {
        query =
          query.or(
            [
              `first_name.ilike.%${safeSearch}%`,
              `last_name.ilike.%${safeSearch}%`,
              `email.ilike.%${safeSearch}%`,
              `venture_name.ilike.%${safeSearch}%`,
              `application_reference.ilike.%${safeSearch}%`,
            ].join(",")
          );
      }
    }


    const {
      data,
      error,
    } =
      await query
        .order(
          "submitted_at",
          {
            ascending:
              false,
          }
        );

    if (error) {
      throw error;
    }


    const applications =
      (data || []).map(
        normalizeApplication
      );


    return res
      .status(200)
      .json({
        success: true,

        applications,

        count:
          applications.length,
      });
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Unable to load CFCV applications."
    );
  }
}


/* ============================================================
   GET SINGLE APPLICATION - ADMIN
============================================================ */

async function getApplicationById(
  req,
  res
) {
  try {
    const id =
      cleanString(
        req.params?.id
      );

    if (!id) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "Application ID is required.",
        });
    }


    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from(
          CFCV_TABLE
        )
        .select("*")
        .eq(
          "id",
          id
        )
        .maybeSingle();


    if (error) {
      throw error;
    }


    if (!data) {
      return res
        .status(404)
        .json({
          success: false,

          message:
            "CFCV application not found.",
        });
    }


    return res
      .status(200)
      .json({
        success: true,

        application:
          normalizeApplication(
            data
          ),
      });
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Unable to load the CFCV application."
    );
  }
}


/* ============================================================
   GET PRIVATE RESUME SIGNED URL - ADMIN

   IMPORTANT:
   This endpoint must be behind requireAdmin in cfcvRoutes.js.
============================================================ */

async function getApplicationResume(
  req,
  res
) {
  try {
    const id =
      cleanString(
        req.params?.id
      );

    if (!id) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "Application ID is required.",
        });
    }


    const {
      data: application,
      error,
    } =
      await supabaseAdmin
        .from(
          CFCV_TABLE
        )
        .select(
          "id,application_reference,resume_path,resume_file_name,resume_mime_type"
        )
        .eq(
          "id",
          id
        )
        .maybeSingle();


    if (error) {
      throw error;
    }


    if (!application) {
      return res
        .status(404)
        .json({
          success: false,

          message:
            "CFCV application not found.",
        });
    }


    if (
      !application.resume_path
    ) {
      return res
        .status(404)
        .json({
          success: false,

          message:
            "No résumé or CV is attached to this application.",
        });
    }


    const {
      data: signedData,
      error: signedError,
    } =
      await supabaseAdmin
        .storage
        .from(
          CFCV_RESUMES_BUCKET
        )
        .createSignedUrl(
          application.resume_path,
          SIGNED_RESUME_URL_SECONDS,
          {
            download:
              application.resume_file_name ||
              "resume",
          }
        );


    if (signedError) {
      throw signedError;
    }


    if (
      !signedData?.signedUrl
    ) {
      throw new Error(
        "Unable to create a secure résumé download link."
      );
    }


    return res
      .status(200)
      .json({
        success: true,

        applicationReference:
          application.application_reference,

        fileName:
          application.resume_file_name ||
          "resume",

        mimeType:
          application.resume_mime_type ||
          "",

        url:
          signedData.signedUrl,

        signedUrl:
          signedData.signedUrl,

        expiresIn:
          SIGNED_RESUME_URL_SECONDS,
      });
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Unable to access the applicant résumé."
    );
  }
}


/* ============================================================
   UPDATE APPLICATION - ADMIN
============================================================ */

async function updateApplication(
  req,
  res
) {
  try {
    const id =
      cleanString(
        req.params?.id
      );

    if (!id) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "Application ID is required.",
        });
    }


    const {
      data: existing,
      error: existingError,
    } =
      await supabaseAdmin
        .from(
          CFCV_TABLE
        )
        .select("*")
        .eq(
          "id",
          id
        )
        .maybeSingle();


    if (existingError) {
      throw existingError;
    }


    if (!existing) {
      return res
        .status(404)
        .json({
          success: false,

          message:
            "CFCV application not found.",
        });
    }


    const updates = {
      updated_at:
        nowIso(),

      reviewed_at:
        nowIso(),

      reviewed_by:
        getCurrentAdminId(
          req
        ),
    };


    /* --------------------------------------------------------
       ADMISSIONS STAGE
    --------------------------------------------------------- */

    if (
      req.body?.admissionsStage !==
        undefined ||
      req.body?.admissions_stage !==
        undefined
    ) {
      const value =
        cleanString(
          req.body
            ?.admissionsStage ??
          req.body
            ?.admissions_stage
        );

      if (
        !VALID_ADMISSIONS_STAGES.has(
          value
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Invalid admissions stage.",
          });
      }

      updates.admissions_stage =
        value;
    }


    /* --------------------------------------------------------
       TRACK PLACEMENT
    --------------------------------------------------------- */

    if (
      req.body?.assignedTrack !==
        undefined ||
      req.body?.assigned_track !==
        undefined
    ) {
      const value =
        cleanNullableString(
          req.body
            ?.assignedTrack ??
          req.body
            ?.assigned_track
        );

      if (
        value &&
        !VALID_TRACKS.has(
          value
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Invalid CFCV track.",
          });
      }

      updates.assigned_track =
        value;
    }


    /* --------------------------------------------------------
       MATCHING REQUIRED
    --------------------------------------------------------- */

    if (
      req.body?.matchingRequired !==
        undefined ||
      req.body?.matching_required !==
        undefined
    ) {
      updates.matching_required =
        parseBoolean(
          req.body
            ?.matchingRequired ??
          req.body
            ?.matching_required,
          false
        );
    }


    /* --------------------------------------------------------
       MATCHING STATUS
    --------------------------------------------------------- */

    if (
      req.body?.matchingStatus !==
        undefined ||
      req.body?.matching_status !==
        undefined
    ) {
      const value =
        cleanString(
          req.body
            ?.matchingStatus ??
          req.body
            ?.matching_status
        );

      if (
        !VALID_MATCHING_STATUSES.has(
          value
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Invalid matching status.",
          });
      }

      updates.matching_status =
        value;
    }


    /* --------------------------------------------------------
       FINAL DECISION
    --------------------------------------------------------- */

    if (
      req.body?.finalDecision !==
        undefined ||
      req.body?.final_decision !==
        undefined
    ) {
      const value =
        cleanNullableString(
          req.body
            ?.finalDecision ??
          req.body
            ?.final_decision
        );

      if (
        value &&
        !VALID_FINAL_DECISIONS.has(
          value
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Invalid final admissions decision.",
          });
      }

      updates.final_decision =
        value;
    }


    /* --------------------------------------------------------
       APPLICATION STATUS
    --------------------------------------------------------- */

    if (
      req.body?.status !==
      undefined
    ) {
      const value =
        cleanString(
          req.body.status
        );

      if (
        !VALID_STATUSES.has(
          value
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Invalid application status.",
          });
      }

      updates.status =
        value;
    }


    /* --------------------------------------------------------
       INTERVIEW REQUIRED
    --------------------------------------------------------- */

    if (
      req.body?.interviewRequired !==
        undefined ||
      req.body?.interview_required !==
        undefined
    ) {
      updates.interview_required =
        parseBoolean(
          req.body
            ?.interviewRequired ??
          req.body
            ?.interview_required,
          false
        );
    }


    /* --------------------------------------------------------
       INTERVIEW STATUS
    --------------------------------------------------------- */

    if (
      req.body?.interviewStatus !==
        undefined ||
      req.body?.interview_status !==
        undefined
    ) {
      const value =
        cleanString(
          req.body
            ?.interviewStatus ??
          req.body
            ?.interview_status
        );

      if (
        !VALID_INTERVIEW_STATUSES.has(
          value
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Invalid interview status.",
          });
      }

      updates.interview_status =
        value;
    }


    /* --------------------------------------------------------
       INTERVIEW DATE
    --------------------------------------------------------- */

    if (
      req.body?.interviewDate !==
        undefined ||
      req.body?.interview_date !==
        undefined
    ) {
      const rawValue =
        req.body
          ?.interviewDate ??
        req.body
          ?.interview_date;

      if (
        rawValue === null ||
        rawValue === ""
      ) {
        updates.interview_date =
          null;
      } else {
        const normalizedDate =
          normalizeNullableDate(
            rawValue
          );

        if (!normalizedDate) {
          return res
            .status(400)
            .json({
              success: false,

              message:
                "Invalid interview date.",
            });
        }

        updates.interview_date =
          normalizedDate;
      }
    }


    /* --------------------------------------------------------
       REVIEWER NOTES
    --------------------------------------------------------- */

    if (
      req.body?.reviewerNotes !==
        undefined ||
      req.body?.reviewer_notes !==
        undefined
    ) {
      updates.reviewer_notes =
        cleanString(
          req.body
            ?.reviewerNotes ??
          req.body
            ?.reviewer_notes
        );
    }


    /* --------------------------------------------------------
       INTERVIEW NOTES
    --------------------------------------------------------- */

    if (
      req.body?.interviewNotes !==
        undefined ||
      req.body?.interview_notes !==
        undefined
    ) {
      updates.interview_notes =
        cleanString(
          req.body
            ?.interviewNotes ??
          req.body
            ?.interview_notes
        );
    }


    /* --------------------------------------------------------
       MATCHING NOTES
    --------------------------------------------------------- */

    if (
      req.body?.matchingNotes !==
        undefined ||
      req.body?.matching_notes !==
        undefined
    ) {
      updates.matching_notes =
        cleanString(
          req.body
            ?.matchingNotes ??
          req.body
            ?.matching_notes
        );
    }


    /* --------------------------------------------------------
       DECISION NOTES
    --------------------------------------------------------- */

    if (
      req.body?.decisionNotes !==
        undefined ||
      req.body?.decision_notes !==
        undefined
    ) {
      updates.decision_notes =
        cleanString(
          req.body
            ?.decisionNotes ??
          req.body
            ?.decision_notes
        );
    }


    /* --------------------------------------------------------
       UPDATE DATABASE
    --------------------------------------------------------- */

    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from(
          CFCV_TABLE
        )
        .update(
          updates
        )
        .eq(
          "id",
          id
        )
        .select("*")
        .single();


    if (error) {
      throw error;
    }


    return res
      .status(200)
      .json({
        success: true,

        message:
          "CFCV application updated successfully.",

        application:
          normalizeApplication(
            data
          ),
      });
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Unable to update the CFCV application."
    );
  }
}


/* ============================================================
   APPLICATION STATS - ADMIN
============================================================ */

async function getApplicationStats(
  req,
  res
) {
  try {
    const {
      data,
      error,
    } =
      await supabaseAdmin
        .from(
          CFCV_TABLE
        )
        .select(
          "id,status,admissions_stage,assigned_track,matching_required,final_decision,interview_required,interview_status"
        );


    if (error) {
      throw error;
    }


    const applications =
      data || [];


    const totalApplications =
      applications.length;


    const submitted =
      applications.filter(
        (item) =>
          item.status ===
          "submitted"
      ).length;


    const underReview =
      applications.filter(
        (item) =>
          item.status ===
          "under_review"
      ).length;


    const interviews =
      applications.filter(
        (item) =>
          item.interview_required ===
            true ||
          [
            "scheduled",
            "completed",
          ].includes(
            item.interview_status
          )
      ).length;


    const matchingRequired =
      applications.filter(
        (item) =>
          item.matching_required ===
            true ||
          item.final_decision ===
            "MATCH REQUIRED"
      ).length;


    const admitted =
      applications.filter(
        (item) =>
          item.final_decision ===
            "ADMIT" ||
          item.final_decision ===
            "ADMIT WITH TRACK PLACEMENT"
      ).length;


    const waitlisted =
      applications.filter(
        (item) =>
          item.final_decision ===
          "WAITLIST"
      ).length;


    const genesis =
      applications.filter(
        (item) =>
          item.assigned_track ===
          "Genesis"
      ).length;


    const ascend =
      applications.filter(
        (item) =>
          item.assigned_track ===
          "Ascend"
      ).length;


    const horizon =
      applications.filter(
        (item) =>
          item.assigned_track ===
          "Horizon"
      ).length;


    const cohortCapacity =
      30;


    const remainingCapacity =
      Math.max(
        cohortCapacity -
          admitted,
        0
      );


    return res
      .status(200)
      .json({
        success: true,

        stats: {
          totalApplications,

          submitted,

          underReview,

          interviews,

          matchingRequired,

          admitted,

          waitlisted,

          genesis,

          ascend,

          horizon,

          cohortCapacity,

          remainingCapacity,
        },


        /* ----------------------------------------------------
           Compatibility fields for simpler admin dashboards
        ----------------------------------------------------- */

        totalApplications,

        submitted,

        underReview,

        interviews,

        matchingRequired,

        admitted,

        waitlisted,

        genesis,

        ascend,

        horizon,

        cohortCapacity,

        remainingCapacity,
      });
  } catch (error) {
    return sendServerError(
      res,
      error,
      "Unable to load CFCV application statistics."
    );
  }
}


/* ============================================================
   EXPORTS
============================================================ */

module.exports = {
  /*
   * Public
   */
  createApplication,

  /*
   * Admin
   */
  getApplications,
  getApplicationById,
  getApplicationResume,
  updateApplication,
  getApplicationStats,
};