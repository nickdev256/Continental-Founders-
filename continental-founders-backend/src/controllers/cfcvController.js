const crypto = require("crypto");
const path = require("path");

const {
  supabaseAdmin,
} = require("../config/supabase");

/* ============================================================
   CONFIGURATION
============================================================ */

const CFCV_TABLE = "cfcv_applications";

const CFCV_RESUMES_BUCKET = String(
  process.env.CFCV_RESUMES_BUCKET || "cfcv-resumes"
).trim();

const MAX_RESUME_SIZE = 5 * 1024 * 1024;
const RESUME_SIGNED_URL_SECONDS = 5 * 60;

/* ============================================================
   VALID VALUES
============================================================ */

const VALID_GEOGRAPHIES = new Set([
  "Africa",
  "United States",
  "Diaspora",
]);

const VALID_VENTURE_STAGES = new Set([
  "Idea / problem / early concept",
  "MVP / prototype / pilot / early traction",
  "Operating business",
]);

const VALID_TEAM_STATUSES = new Set([
  "Individual founder",
  "Existing team",
]);

const VALID_YES_NO = new Set([
  "Yes",
  "No",
]);

const VALID_ADMISSIONS_STAGES = new Set([
  "applied",
  "assessment",
  "interview",
  "track_placement",
  "matching",
  "compatibility",
  "final_decision",
  "enrollment",
]);

const VALID_TRACKS = new Set([
  "Genesis",
  "Ascend",
  "Horizon",
]);

const VALID_MATCHING_STATUSES = new Set([
  "not_started",
  "required",
  "in_progress",
  "matched",
  "compatibility_sprint",
  "completed",
]);

const VALID_FINAL_DECISIONS = new Set([
  "ADMIT",
  "ADMIT WITH TRACK PLACEMENT",
  "MATCH REQUIRED",
  "WAITLIST",
  "NOT SELECTED",
]);

const VALID_STATUSES = new Set([
  "submitted",
  "under_review",
  "in_progress",
  "admitted",
  "waitlisted",
  "not_selected",
  "withdrawn",
]);

const VALID_INTERVIEW_STATUSES = new Set([
  "not_scheduled",
  "scheduled",
  "completed",
  "cancelled",
]);

const ALLOWED_RESUME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

/* ============================================================
   BASIC HELPERS
============================================================ */

function cleanString(value, maxLength = 5000) {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value).trim().slice(0, maxLength);
}

function cleanEmail(value) {
  return cleanString(value, 320).toLowerCase();
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function parseBoolean(value) {
  if (typeof value === "boolean") {
    return value;
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return null;
}

function normalizeNullableDate(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
}

function getCurrentAdminId(req) {
  return req?.admin?.id || null;
}

/* ============================================================
   APPLICATION BODY PARSER

   multipart/form-data:
   application = JSON string
   resume      = uploaded file
============================================================ */

function parseApplicationBody(req) {
  const rawBody = req.body || {};

  if (typeof rawBody.application === "string") {
    try {
      const parsed = JSON.parse(rawBody.application);

      if (
        !parsed ||
        typeof parsed !== "object" ||
        Array.isArray(parsed)
      ) {
        throw new Error("Invalid application object.");
      }

      return parsed;
    } catch (error) {
      const parseError = new Error(
        "The application form data is invalid."
      );

      parseError.code = "INVALID_APPLICATION_JSON";

      throw parseError;
    }
  }

  if (
    rawBody.application &&
    typeof rawBody.application === "object" &&
    !Array.isArray(rawBody.application)
  ) {
    return rawBody.application;
  }

  return rawBody;
}

/* ============================================================
   FILE HELPERS
============================================================ */

function sanitizeFileName(fileName) {
  const original = path.basename(
    cleanString(fileName, 255) || "resume"
  );

  const extension = path
    .extname(original)
    .toLowerCase()
    .slice(0, 10);

  const baseName =
    path
      .basename(original, extension)
      .replace(/[^a-zA-Z0-9_-]+/g, "-")
      .replace(/^[-_]+|[-_]+$/g, "")
      .slice(0, 80) || "resume";

  return `${baseName}${extension}`;
}

function getAllowedExtensionForMime(mimeType) {
  switch (mimeType) {
    case "application/pdf":
      return ".pdf";

    case "application/msword":
      return ".doc";

    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return ".docx";

    default:
      return "";
  }
}

function validateResumeFile(file) {
  if (!file) {
    const error = new Error(
      "Please upload your résumé or CV."
    );

    error.code = "RESUME_REQUIRED";
    throw error;
  }

  if (
    !Buffer.isBuffer(file.buffer) ||
    file.buffer.length === 0
  ) {
    const error = new Error(
      "The uploaded résumé or CV is empty."
    );

    error.code = "EMPTY_RESUME";
    throw error;
  }

  if (file.size > MAX_RESUME_SIZE) {
    const error = new Error(
      "Your résumé or CV must not exceed 5 MB."
    );

    error.code = "RESUME_TOO_LARGE";
    throw error;
  }

  const mimeType = cleanString(
    file.mimetype,
    200
  ).toLowerCase();

  if (!ALLOWED_RESUME_TYPES.has(mimeType)) {
    const error = new Error(
      "Only PDF, DOC and DOCX résumé files are allowed."
    );

    error.code = "INVALID_RESUME_TYPE";
    throw error;
  }

  const expectedExtension =
    getAllowedExtensionForMime(mimeType);

  const actualExtension = path
    .extname(cleanString(file.originalname, 255))
    .toLowerCase();

  if (
    !expectedExtension ||
    actualExtension !== expectedExtension
  ) {
    const error = new Error(
      "The résumé file extension does not match its file type."
    );

    error.code = "INVALID_RESUME_EXTENSION";
    throw error;
  }

  return {
    mimeType,
    extension: expectedExtension,
  };
}

function createResumeStoragePath({
  applicationReference,
  originalName,
}) {
  const safeReference = cleanString(
    applicationReference,
    120
  )
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^[-_]+|[-_]+$/g, "");

  const safeName = sanitizeFileName(originalName);

  const uniqueId = crypto
    .randomBytes(12)
    .toString("hex");

  return [
    safeReference || "application",
    `${Date.now()}-${uniqueId}-${safeName}`,
  ].join("/");
}

/* ============================================================
   PRIVATE STORAGE HELPERS
============================================================ */

async function uploadResume({
  file,
  applicationReference,
}) {
  validateResumeFile(file);

  const storagePath = createResumeStoragePath({
    applicationReference,
    originalName: file.originalname,
  });

  const { error } = await supabaseAdmin.storage
    .from(CFCV_RESUMES_BUCKET)
    .upload(storagePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
      cacheControl: "3600",
    });

  if (error) {
    console.error("CFCV resume upload error:", error);

    const uploadError = new Error(
      "Your résumé or CV could not be uploaded."
    );

    uploadError.code = "RESUME_UPLOAD_FAILED";

    throw uploadError;
  }

  return storagePath;
}

async function removeResume(storagePath) {
  if (!storagePath) {
    return;
  }

  try {
    const { error } = await supabaseAdmin.storage
      .from(CFCV_RESUMES_BUCKET)
      .remove([storagePath]);

    if (error) {
      console.error(
        "CFCV resume cleanup error:",
        error
      );
    }
  } catch (error) {
    console.error(
      "CFCV resume cleanup error:",
      error
    );
  }
}

/* ============================================================
   APPLICATION REFERENCE
============================================================ */

async function generateApplicationReference() {
  const year = new Date().getFullYear();

  for (let attempt = 0; attempt < 10; attempt += 1) {
    const random = crypto
      .randomBytes(4)
      .toString("hex")
      .toUpperCase();

    const reference = `CFCV-${year}-${random}`;

    const { data, error } = await supabaseAdmin
      .from(CFCV_TABLE)
      .select("id")
      .eq("application_reference", reference)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return reference;
    }
  }

  throw new Error(
    "Unable to generate application reference."
  );
}

/* ============================================================
   NORMALIZE ADMIN RESPONSE

   Never expose the private resume_path.
============================================================ */

function normalizeApplication(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,

    applicationReference:
      row.application_reference,

    firstName: row.first_name,
    lastName: row.last_name,

    fullName: [
      row.first_name,
      row.last_name,
    ]
      .filter(Boolean)
      .join(" "),

    email: row.email,
    phone: row.phone || "",
    country: row.country,
    city: row.city || "",
    geography: row.geography,

    professionalBackground:
      row.professional_background,

    relevantSkills: row.relevant_skills,

    entrepreneurshipReason:
      row.entrepreneurship_reason || "",

    ventureName: row.venture_name || "",
    sector: row.sector || "",

    ventureDescription:
      row.venture_description,

    problem: row.problem,
    solution: row.solution,
    ventureStage: row.venture_stage,
    currentProgress: row.current_progress,
    targetMarket: row.target_market,

    customerDescription:
      row.customer_description || "",

    teamStatus: row.team_status,
    teamDescription: row.team_description || "",

    existingCrossContinentalTeam:
      row.existing_cross_continental_team,

    collaboratorNeeds:
      row.collaborator_needs || "",

    marketKnowledge:
      row.market_knowledge || "",

    geographicConnections:
      row.geographic_connections || "",

    workingStyle: row.working_style,

    leadershipStrengths:
      row.leadership_strengths || "",

    longTermObjectives:
      row.long_term_objectives,

    timeCommitment: row.time_commitment,
    decisionMaking: row.decision_making,

    ownershipExpectations:
      row.ownership_expectations || "",

    sixMonthGoals: row.six_month_goals,

    resumeAvailable: Boolean(row.resume_path),

    resumeFileName:
      row.resume_file_name || "",

    resumeMimeType:
      row.resume_mime_type || "",

    admissionsStage: row.admissions_stage,
    assignedTrack: row.assigned_track,

    matchingRequired:
      Boolean(row.matching_required),

    matchingStatus: row.matching_status,
    finalDecision: row.final_decision,

    reviewerNotes: row.reviewer_notes || "",
    interviewNotes: row.interview_notes || "",
    matchingNotes: row.matching_notes || "",
    decisionNotes: row.decision_notes || "",

    interviewRequired:
      Boolean(row.interview_required),

    interviewStatus: row.interview_status,
    interviewDate: row.interview_date,

    status: row.status,

    reviewedBy: row.reviewed_by,
    reviewedAt: row.reviewed_at,
    submittedAt: row.submitted_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/* ============================================================
   PUBLIC: CREATE APPLICATION
============================================================ */

async function createApplication(req, res) {
  let uploadedResumePath = null;

  try {
    let body;

    try {
      body = parseApplicationBody(req);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message:
          error.message ||
          "The application form data is invalid.",
      });
    }

    /* --------------------------------------------------------
       CLEAN PUBLIC FIELDS
    -------------------------------------------------------- */

    const firstName = cleanString(body.firstName, 120);
    const lastName = cleanString(body.lastName, 120);
    const email = cleanEmail(body.email);
    const phone = cleanString(body.phone, 50);
    const country = cleanString(body.country, 120);
    const city = cleanString(body.city, 120);
    const geography = cleanString(body.geography, 50);

    const professionalBackground = cleanString(
      body.professionalBackground
    );

    const relevantSkills = cleanString(
      body.relevantSkills
    );

    const entrepreneurshipReason = cleanString(
      body.entrepreneurshipReason
    );

    const ventureName = cleanString(
      body.ventureName,
      200
    );

    const sector = cleanString(body.sector, 160);

    const ventureDescription = cleanString(
      body.ventureDescription
    );

    const problem = cleanString(body.problem);
    const solution = cleanString(body.solution);

    const ventureStage = cleanString(
      body.ventureStage,
      120
    );

    const currentProgress = cleanString(
      body.currentProgress
    );

    const targetMarket = cleanString(
      body.targetMarket
    );

    const customerDescription = cleanString(
      body.customerDescription
    );

    const teamStatus = cleanString(
      body.teamStatus,
      80
    );

    const teamDescription = cleanString(
      body.teamDescription
    );

    const existingCrossContinentalTeam = cleanString(
      body.existingCrossContinentalTeam,
      10
    );

    const collaboratorNeeds = cleanString(
      body.collaboratorNeeds
    );

    const marketKnowledge = cleanString(
      body.marketKnowledge
    );

    const geographicConnections = cleanString(
      body.geographicConnections
    );

    const workingStyle = cleanString(
      body.workingStyle
    );

    const leadershipStrengths = cleanString(
      body.leadershipStrengths
    );

    const longTermObjectives = cleanString(
      body.longTermObjectives
    );

    const timeCommitment = cleanString(
      body.timeCommitment
    );

    const decisionMaking = cleanString(
      body.decisionMaking
    );

    const ownershipExpectations = cleanString(
      body.ownershipExpectations
    );

    const sixMonthGoals = cleanString(
      body.sixMonthGoals
    );

    /* --------------------------------------------------------
       REQUIRED FIELDS
    -------------------------------------------------------- */

    const requiredFields = {
      firstName,
      lastName,
      email,
      country,
      geography,
      professionalBackground,
      relevantSkills,
      ventureDescription,
      problem,
      solution,
      ventureStage,
      currentProgress,
      targetMarket,
      teamStatus,
      existingCrossContinentalTeam,
      workingStyle,
      longTermObjectives,
      timeCommitment,
      decisionMaking,
      sixMonthGoals,
    };

    const missingFields = Object.entries(
      requiredFields
    )
      .filter(([, value]) => !value)
      .map(([field]) => field);

    if (missingFields.length) {
      return res.status(400).json({
        success: false,
        message:
          "Please complete all required application fields.",
        fields: missingFields,
      });
    }

    /* --------------------------------------------------------
       FORMAT VALIDATION
    -------------------------------------------------------- */

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
        field: "email",
      });
    }

    if (!VALID_GEOGRAPHIES.has(geography)) {
      return res.status(400).json({
        success: false,
        message: "Invalid applicant geography.",
        field: "geography",
      });
    }

    if (!VALID_VENTURE_STAGES.has(ventureStage)) {
      return res.status(400).json({
        success: false,
        message: "Invalid venture stage.",
        field: "ventureStage",
      });
    }

    if (!VALID_TEAM_STATUSES.has(teamStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid team status.",
        field: "teamStatus",
      });
    }

    if (
      !VALID_YES_NO.has(
        existingCrossContinentalTeam
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid cross-continental team selection.",
        field: "existingCrossContinentalTeam",
      });
    }

    /* --------------------------------------------------------
       RESUME VALIDATION
    -------------------------------------------------------- */

    try {
      validateResumeFile(req.file);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message:
          error.message ||
          "Please upload a valid résumé or CV.",
        field: "resume",
      });
    }

    const applicationReference =
      await generateApplicationReference();

    uploadedResumePath = await uploadResume({
      file: req.file,
      applicationReference,
    });

    /* --------------------------------------------------------
       DATABASE PAYLOAD
    -------------------------------------------------------- */

    const payload = {
      application_reference: applicationReference,

      first_name: firstName,
      last_name: lastName,

      email,
      phone,
      country,
      city,
      geography,

      professional_background:
        professionalBackground,

      relevant_skills: relevantSkills,

      entrepreneurship_reason:
        entrepreneurshipReason,

      venture_name: ventureName,
      sector,

      venture_description: ventureDescription,

      problem,
      solution,

      venture_stage: ventureStage,
      current_progress: currentProgress,
      target_market: targetMarket,

      customer_description: customerDescription,

      team_status: teamStatus,
      team_description: teamDescription,

      existing_cross_continental_team:
        existingCrossContinentalTeam,

      collaborator_needs: collaboratorNeeds,
      market_knowledge: marketKnowledge,

      geographic_connections:
        geographicConnections,

      working_style: workingStyle,
      leadership_strengths: leadershipStrengths,

      long_term_objectives: longTermObjectives,

      time_commitment: timeCommitment,
      decision_making: decisionMaking,

      ownership_expectations:
        ownershipExpectations,

      six_month_goals: sixMonthGoals,

      // Private résumé metadata.
      resume_path: uploadedResumePath,

      resume_file_name: sanitizeFileName(
        req.file.originalname
      ),

      resume_mime_type: req.file.mimetype,

      // Admissions state is controlled by the server.
      admissions_stage: "applied",
      assigned_track: null,

      matching_required: false,
      matching_status: "not_started",

      final_decision: null,

      interview_required: false,
      interview_status: "not_scheduled",

      status: "submitted",
    };

    const { data, error } = await supabaseAdmin
      .from(CFCV_TABLE)
      .insert(payload)
      .select("*")
      .single();

    if (error) {
      console.error("CFCV insert error:", error);

      await removeResume(uploadedResumePath);
      uploadedResumePath = null;

      return res.status(500).json({
        success: false,
        message:
          "Your application could not be submitted.",
      });
    }

    // The résumé now belongs to the saved application.
    uploadedResumePath = null;

    return res.status(201).json({
      success: true,
      message:
        "Your CFCV application has been submitted successfully.",
      applicationReference:
        data.application_reference,
      submittedAt: data.submitted_at,
    });
  } catch (error) {
    console.error(
      "CFCV create application error:",
      error
    );

    if (uploadedResumePath) {
      await removeResume(uploadedResumePath);
    }

    const clientErrors = new Set([
      "RESUME_REQUIRED",
      "EMPTY_RESUME",
      "RESUME_TOO_LARGE",
      "INVALID_RESUME_TYPE",
      "INVALID_RESUME_EXTENSION",
      "INVALID_APPLICATION_JSON",
    ]);

    const statusCode = clientErrors.has(error?.code)
      ? 400
      : 500;

    return res.status(statusCode).json({
      success: false,
      message:
        statusCode === 400
          ? error.message
          : "Your application could not be submitted. Please try again.",
    });
  }
}

/* ============================================================
   ADMIN: GET APPLICATIONS
============================================================ */

async function getApplications(req, res) {
  try {
    const status = cleanString(
      req.query.status,
      50
    );

    const admissionsStage = cleanString(
      req.query.admissionsStage,
      50
    );

    const track = cleanString(req.query.track, 50);

    const geography = cleanString(
      req.query.geography,
      50
    );

    const search = cleanString(
      req.query.search,
      200
    );

    let query = supabaseAdmin
      .from(CFCV_TABLE)
      .select("*")
      .order("submitted_at", {
        ascending: false,
      });

    if (status) {
      query = query.eq("status", status);
    }

    if (admissionsStage) {
      query = query.eq(
        "admissions_stage",
        admissionsStage
      );
    }

    if (track) {
      query = query.eq("assigned_track", track);
    }

    if (geography) {
      query = query.eq("geography", geography);
    }

    if (search) {
      const safeSearch = search
        .replace(/[%_]/g, "")
        .replace(/,/g, " ");

      if (safeSearch) {
        query = query.or(
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

    const { data, error } = await query;

    if (error) {
      console.error(
        "CFCV applications query error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Unable to load CFCV applications.",
      });
    }

    return res.json({
      success: true,
      count: data?.length || 0,
      applications: (data || []).map(
        normalizeApplication
      ),
    });
  } catch (error) {
    console.error("CFCV applications error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load CFCV applications.",
    });
  }
}

/* ============================================================
   ADMIN: GET ONE APPLICATION
============================================================ */

async function getApplicationById(req, res) {
  try {
    const id = cleanString(req.params.id, 100);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Application ID is required.",
      });
    }

    const { data, error } = await supabaseAdmin
      .from(CFCV_TABLE)
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error(
        "CFCV application query error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Unable to load application.",
      });
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Application not found.",
      });
    }

    return res.json({
      success: true,
      application: normalizeApplication(data),
    });
  } catch (error) {
    console.error("CFCV application error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load application.",
    });
  }
}

/* ============================================================
   ADMIN: GET PRIVATE RESUME

   The Supabase Storage bucket must remain PRIVATE.
============================================================ */

async function getApplicationResume(req, res) {
  try {
    const id = cleanString(req.params.id, 100);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Application ID is required.",
      });
    }

    const { data, error } = await supabaseAdmin
      .from(CFCV_TABLE)
      .select(
        [
          "id",
          "application_reference",
          "resume_path",
          "resume_file_name",
          "resume_mime_type",
        ].join(",")
      )
      .eq("id", id)
      .maybeSingle();

    if (error) {
      console.error(
        "CFCV resume application query error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to access the applicant résumé.",
      });
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Application not found.",
      });
    }

    if (!data.resume_path) {
      return res.status(404).json({
        success: false,
        message:
          "No résumé or CV is attached to this application.",
      });
    }

    const {
      data: signedData,
      error: signedError,
    } = await supabaseAdmin.storage
      .from(CFCV_RESUMES_BUCKET)
      .createSignedUrl(
        data.resume_path,
        RESUME_SIGNED_URL_SECONDS,
        {
          download:
            data.resume_file_name || "resume",
        }
      );

    if (signedError || !signedData?.signedUrl) {
      console.error(
        "CFCV resume signed URL error:",
        signedError
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to generate a secure résumé link.",
      });
    }

    res.set("Cache-Control", "no-store");

    return res.json({
      success: true,
      fileName: data.resume_file_name || "resume",
      mimeType: data.resume_mime_type || "",
      expiresIn: RESUME_SIGNED_URL_SECONDS,
      url: signedData.signedUrl,
    });
  } catch (error) {
    console.error("CFCV get resume error:", error);

    return res.status(500).json({
      success: false,
      message:
        "Unable to access the applicant résumé.",
    });
  }
}

/* ============================================================
   ADMIN: UPDATE APPLICATION
============================================================ */

async function updateApplication(req, res) {
  try {
    const id = cleanString(req.params.id, 100);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Application ID is required.",
      });
    }

    const body = req.body || {};
    const updates = {};

    /* --------------------------------------------------------
       ADMISSIONS STAGE
    -------------------------------------------------------- */

    if (body.admissionsStage !== undefined) {
      const value = cleanString(
        body.admissionsStage,
        50
      );

      if (!VALID_ADMISSIONS_STAGES.has(value)) {
        return res.status(400).json({
          success: false,
          message: "Invalid admissions stage.",
        });
      }

      updates.admissions_stage = value;
    }

    /* --------------------------------------------------------
       TRACK PLACEMENT
    -------------------------------------------------------- */

    if (body.assignedTrack !== undefined) {
      if (
        body.assignedTrack === null ||
        body.assignedTrack === ""
      ) {
        updates.assigned_track = null;
      } else {
        const value = cleanString(
          body.assignedTrack,
          50
        );

        if (!VALID_TRACKS.has(value)) {
          return res.status(400).json({
            success: false,
            message: "Invalid CFCV track.",
          });
        }

        updates.assigned_track = value;
      }
    }

    /* --------------------------------------------------------
       MATCHING
    -------------------------------------------------------- */

    if (body.matchingRequired !== undefined) {
      const value = parseBoolean(
        body.matchingRequired
      );

      if (value === null) {
        return res.status(400).json({
          success: false,
          message: "Invalid matchingRequired value.",
        });
      }

      updates.matching_required = value;
    }

    if (body.matchingStatus !== undefined) {
      const value = cleanString(
        body.matchingStatus,
        50
      );

      if (!VALID_MATCHING_STATUSES.has(value)) {
        return res.status(400).json({
          success: false,
          message: "Invalid matching status.",
        });
      }

      updates.matching_status = value;
    }

    /* --------------------------------------------------------
       INTERVIEW
    -------------------------------------------------------- */

    if (body.interviewRequired !== undefined) {
      const value = parseBoolean(
        body.interviewRequired
      );

      if (value === null) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid interviewRequired value.",
        });
      }

      updates.interview_required = value;
    }

    if (body.interviewStatus !== undefined) {
      const value = cleanString(
        body.interviewStatus,
        50
      );

      if (!VALID_INTERVIEW_STATUSES.has(value)) {
        return res.status(400).json({
          success: false,
          message: "Invalid interview status.",
        });
      }

      updates.interview_status = value;
    }

    if (body.interviewDate !== undefined) {
      if (!body.interviewDate) {
        updates.interview_date = null;
      } else {
        const normalized = normalizeNullableDate(
          body.interviewDate
        );

        if (!normalized) {
          return res.status(400).json({
            success: false,
            message: "Invalid interview date.",
          });
        }

        updates.interview_date = normalized;
      }
    }

    /* --------------------------------------------------------
       FINAL DECISION
    -------------------------------------------------------- */

    if (body.finalDecision !== undefined) {
      if (
        body.finalDecision === null ||
        body.finalDecision === ""
      ) {
        updates.final_decision = null;
      } else {
        const value = cleanString(
          body.finalDecision,
          80
        );

        if (!VALID_FINAL_DECISIONS.has(value)) {
          return res.status(400).json({
            success: false,
            message:
              "Invalid final admissions decision.",
          });
        }

        updates.final_decision = value;
      }
    }

    /* --------------------------------------------------------
       APPLICATION STATUS
    -------------------------------------------------------- */

    if (body.status !== undefined) {
      const value = cleanString(body.status, 50);

      if (!VALID_STATUSES.has(value)) {
        return res.status(400).json({
          success: false,
          message: "Invalid application status.",
        });
      }

      updates.status = value;
    }

    /* --------------------------------------------------------
       INTERNAL NOTES
    -------------------------------------------------------- */

    if (body.reviewerNotes !== undefined) {
      updates.reviewer_notes = cleanString(
        body.reviewerNotes,
        10000
      );
    }

    if (body.interviewNotes !== undefined) {
      updates.interview_notes = cleanString(
        body.interviewNotes,
        10000
      );
    }

    if (body.matchingNotes !== undefined) {
      updates.matching_notes = cleanString(
        body.matchingNotes,
        10000
      );
    }

    if (body.decisionNotes !== undefined) {
      updates.decision_notes = cleanString(
        body.decisionNotes,
        10000
      );
    }

    /* --------------------------------------------------------
       ALIGN DECISION AND STATUS
    -------------------------------------------------------- */

    const decisionStatuses = {
      ADMIT: "admitted",
      "ADMIT WITH TRACK PLACEMENT": "admitted",
      "MATCH REQUIRED": "in_progress",
      WAITLIST: "waitlisted",
      "NOT SELECTED": "not_selected",
    };

    // Explicit withdrawal takes precedence.
    if (
      updates.final_decision &&
      updates.status !== "withdrawn"
    ) {
      updates.status =
        decisionStatuses[updates.final_decision];
    }

    /* --------------------------------------------------------
       REQUIRE A TRACK FOR TRACK-PLACEMENT ADMISSION
    -------------------------------------------------------- */

    if (
      updates.final_decision ===
      "ADMIT WITH TRACK PLACEMENT"
    ) {
      const {
        data: current,
        error: readError,
      } = await supabaseAdmin
        .from(CFCV_TABLE)
        .select("assigned_track")
        .eq("id", id)
        .maybeSingle();

      if (readError) {
        throw readError;
      }

      if (!current) {
        return res.status(404).json({
          success: false,
          message: "Application not found.",
        });
      }

      const track =
        Object.prototype.hasOwnProperty.call(
          updates,
          "assigned_track"
        )
          ? updates.assigned_track
          : current.assigned_track;

      if (!track) {
        return res.status(400).json({
          success: false,
          message:
            "Select Genesis, Ascend or Horizon before admitting with track placement.",
          field: "assignedTrack",
        });
      }
    }

    /* --------------------------------------------------------
       NOTHING TO UPDATE
    -------------------------------------------------------- */

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "No valid application updates were provided.",
      });
    }

    /* --------------------------------------------------------
       REVIEW METADATA
    -------------------------------------------------------- */

    const adminId = getCurrentAdminId(req);

    if (adminId) {
      updates.reviewed_by = adminId;
      updates.reviewed_at =
        new Date().toISOString();
    }

    /* --------------------------------------------------------
       SAVE UPDATE
    -------------------------------------------------------- */

    const { data, error } = await supabaseAdmin
      .from(CFCV_TABLE)
      .update(updates)
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (error) {
      console.error("CFCV update error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to update application.",
      });
    }

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Application not found.",
      });
    }

    return res.json({
      success: true,
      message:
        "Application updated successfully.",
      application: normalizeApplication(data),
    });
  } catch (error) {
    console.error(
      "CFCV update application error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to update application.",
    });
  }
}

/* ============================================================
   ADMIN: APPLICATION STATISTICS
============================================================ */

async function getApplicationStats(req, res) {
  try {
    const rows = [];
    const pageSize = 500;

    // Read every page to avoid an unpaginated result cap.
    for (
      let offset = 0;
      ;
      offset += pageSize
    ) {
      const { data, error } = await supabaseAdmin
        .from(CFCV_TABLE)
        .select(
          [
            "id",
            "status",
            "admissions_stage",
            "assigned_track",
            "matching_required",
            "final_decision",
          ].join(",")
        )
        .order("id", {
          ascending: true,
        })
        .range(
          offset,
          offset + pageSize - 1
        );

      if (error) {
        throw error;
      }

      const page = data || [];

      rows.push(...page);

      if (page.length < pageSize) {
        break;
      }
    }

    const effectiveStatus = (row) => {
      if (row.status === "withdrawn") {
        return "withdrawn";
      }

      const decisionStatuses = {
        ADMIT: "admitted",
        "ADMIT WITH TRACK PLACEMENT": "admitted",
        "MATCH REQUIRED": "in_progress",
        WAITLIST: "waitlisted",
        "NOT SELECTED": "not_selected",
      };

      return (
        decisionStatuses[row.final_decision] ||
        row.status
      );
    };

    const countStatus = (value) =>
      rows.filter(
        (row) => effectiveStatus(row) === value
      ).length;

    const configuredCapacity = Number(
      process.env.CFCV_COHORT_CAPACITY ?? 30
    );

    const cohortCapacity =
      Number.isInteger(configuredCapacity) &&
      configuredCapacity >= 0
        ? configuredCapacity
        : 30;

    const stats = {
      totalApplications: rows.length,

      submitted: countStatus("submitted"),

      underReview: countStatus("under_review"),

      interviews: rows.filter(
        (row) =>
          row.admissions_stage === "interview" &&
          row.status !== "withdrawn"
      ).length,

      matchingRequired: rows.filter(
        (row) =>
          row.matching_required &&
          row.status !== "withdrawn"
      ).length,

      admitted: countStatus("admitted"),

      waitlisted: countStatus("waitlisted"),

      genesis: rows.filter(
        (row) => row.assigned_track === "Genesis"
      ).length,

      ascend: rows.filter(
        (row) => row.assigned_track === "Ascend"
      ).length,

      horizon: rows.filter(
        (row) => row.assigned_track === "Horizon"
      ).length,

      cohortCapacity,
    };

    stats.remainingCapacity = Math.max(
      cohortCapacity - stats.admitted,
      0
    );

    return res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("CFCV stats error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load CFCV statistics.",
    });
  }
}

/* ============================================================
   EXPORTS
============================================================ */

module.exports = {
  createApplication,
  getApplications,
  getApplicationById,
  getApplicationResume,
  updateApplication,
  getApplicationStats,
};