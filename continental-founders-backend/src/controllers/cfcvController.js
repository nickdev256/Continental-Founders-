const crypto = require("node:crypto");
const path = require("node:path");

const {
  supabaseAdmin: db,
} = require("../config/supabase");

// ============================================================
// CONFIGURATION
// ============================================================

const CFCV_TABLE = "cfcv_applications";
const HISTORY_TABLE = "cfcv_application_history";
const EMAIL_TABLE = "cfcv_email_jobs";

const RESUME_BUCKET = String(
  process.env.CFCV_RESUMES_BUCKET || "cfcv-resumes"
).trim();

const MAX_RESUME_SIZE = 5 * 1024 * 1024;

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// ============================================================
// VALID VALUES
// ============================================================

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

const VALID_YES_NO = new Set(["Yes", "No"]);

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

// ============================================================
// PUBLIC FORM FIELDS
//
// [database column, maximum text length]
// ============================================================

const PUBLIC_FIELDS = {
  firstName: ["first_name", 120],
  lastName: ["last_name", 120],
  email: ["email", 320],
  phone: ["phone", 50],
  country: ["country", 120],
  city: ["city", 120],
  geography: ["geography", 50],

  professionalBackground: [
    "professional_background",
    5000,
  ],

  relevantSkills: ["relevant_skills", 5000],

  entrepreneurshipReason: [
    "entrepreneurship_reason",
    5000,
  ],

  ventureName: ["venture_name", 200],
  sector: ["sector", 160],
  ventureDescription: ["venture_description", 5000],
  problem: ["problem", 5000],
  solution: ["solution", 5000],
  ventureStage: ["venture_stage", 120],
  currentProgress: ["current_progress", 5000],
  targetMarket: ["target_market", 5000],
  customerDescription: ["customer_description", 5000],

  teamStatus: ["team_status", 80],
  teamDescription: ["team_description", 5000],

  existingCrossContinentalTeam: [
    "existing_cross_continental_team",
    10,
  ],

  collaboratorNeeds: ["collaborator_needs", 5000],
  marketKnowledge: ["market_knowledge", 5000],

  geographicConnections: [
    "geographic_connections",
    5000,
  ],

  workingStyle: ["working_style", 5000],
  leadershipStrengths: ["leadership_strengths", 5000],
  longTermObjectives: ["long_term_objectives", 5000],
  timeCommitment: ["time_commitment", 5000],
  decisionMaking: ["decision_making", 5000],
  ownershipExpectations: ["ownership_expectations", 5000],
  sixMonthGoals: ["six_month_goals", 5000],
};

const REQUIRED_FIELDS = [
  "firstName",
  "lastName",
  "email",
  "country",
  "geography",
  "professionalBackground",
  "relevantSkills",
  "ventureDescription",
  "problem",
  "solution",
  "ventureStage",
  "currentProgress",
  "targetMarket",
  "teamStatus",
  "existingCrossContinentalTeam",
  "workingStyle",
  "longTermObjectives",
  "timeCommitment",
  "decisionMaking",
  "sixMonthGoals",
];

const REVIEW_ENUMS = {
  admissionsStage: [
    "admissions_stage",
    VALID_ADMISSIONS_STAGES,
  ],

  assignedTrack: [
    "assigned_track",
    VALID_TRACKS,
  ],

  matchingStatus: [
    "matching_status",
    VALID_MATCHING_STATUSES,
  ],

  interviewStatus: [
    "interview_status",
    VALID_INTERVIEW_STATUSES,
  ],

  finalDecision: [
    "final_decision",
    VALID_FINAL_DECISIONS,
  ],

  status: ["status", VALID_STATUSES],
};

const DECISION_STATUSES = {
  ADMIT: "admitted",
  "ADMIT WITH TRACK PLACEMENT": "admitted",
  "MATCH REQUIRED": "in_progress",
  WAITLIST: "waitlisted",
  "NOT SELECTED": "not_selected",
};

// ============================================================
// ERROR AND VALIDATION HELPERS
// ============================================================

function fail(message, status = 400, fields = []) {
  const error = new Error(message);

  error.httpStatus = status;
  error.fields = fields;

  return error;
}

function respondError(res, error, fallback) {
  const status = error.httpStatus || 500;

  if (status >= 500) {
    console.error("[CFCV]", fallback, error);
  }

  return res.status(status).json({
    success: false,

    message:
      status < 500
        ? error.message
        : fallback,

    ...(error.fields?.length
      ? {
          fields: error.fields,

          ...(error.fields.length === 1
            ? { field: error.fields[0] }
            : {}),
        }
      : {}),
  });
}

function text(value, maximum, field) {
  if (value === undefined || value === null) {
    return "";
  }

  if (typeof value !== "string") {
    throw fail(`Invalid ${field}.`, 400, [field]);
  }

  const result = value.trim();

  if (result.length > maximum) {
    throw fail(
      `${field} must be ${maximum} characters or fewer.`,
      400,
      [field]
    );
  }

  return result;
}

function applicationId(req) {
  const id = req.params?.id;

  if (
    typeof id !== "string" ||
    !UUID.test(id)
  ) {
    throw fail("Invalid application ID.");
  }

  return id.toLowerCase();
}

// ============================================================
// PARSE AND VALIDATE PUBLIC APPLICATION
// ============================================================

function parseApplication(req) {
  let body;

  try {
    if (
      typeof req.body?.application !== "string"
    ) {
      throw new Error();
    }

    body = JSON.parse(req.body.application);
  } catch {
    throw fail(
      "The application form data is invalid.",
      400,
      ["application"]
    );
  }

  if (
    !body ||
    typeof body !== "object" ||
    Array.isArray(body)
  ) {
    throw fail(
      "The application form data is invalid.",
      400,
      ["application"]
    );
  }

  const fields = {};
  const payload = {};

  for (
    const [field, [column, maximum]]
    of Object.entries(PUBLIC_FIELDS)
  ) {
    fields[field] = text(
      body[field],
      maximum,
      field
    );

    payload[column] = fields[field];
  }

  payload.email = fields.email.toLowerCase();

  const missing = REQUIRED_FIELDS.filter(
    (field) => !fields[field]
  );

  if (missing.length) {
    throw fail(
      "Please complete all required application fields.",
      400,
      missing
    );
  }

  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      payload.email
    )
  ) {
    throw fail(
      "Please enter a valid email address.",
      400,
      ["email"]
    );
  }

  for (const [field, values] of [
    ["geography", VALID_GEOGRAPHIES],
    ["ventureStage", VALID_VENTURE_STAGES],
    ["teamStatus", VALID_TEAM_STATUSES],
    [
      "existingCrossContinentalTeam",
      VALID_YES_NO,
    ],
  ]) {
    if (!values.has(fields[field])) {
      throw fail(
        `Invalid ${field}.`,
        400,
        [field]
      );
    }
  }

  return { body, payload };
}

// ============================================================
// RÉSUMÉ FILE HELPERS
// ============================================================

function sanitizeFileName(value) {
  const original = path.basename(
    String(value || "resume").replace(/\\/g, "/")
  );

  const extension = path
    .extname(original)
    .toLowerCase();

  const base = path
    .basename(original, path.extname(original))
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^[-_]+|[-_]+$/g, "")
    .slice(0, 80);

  return `${base || "resume"}${extension}`;
}

// Check DOCX ZIP directory names without decompressing
// user-controlled data.
function hasDocxEntries(buffer) {
  const minimum = Math.max(
    0,
    buffer.length - 65557
  );

  for (
    let end = buffer.length - 22;
    end >= minimum;
    end -= 1
  ) {
    if (
      buffer.readUInt32LE(end) !== 0x06054b50
    ) {
      continue;
    }

    if (
      end + 22 + buffer.readUInt16LE(end + 20)
      !== buffer.length
    ) {
      continue;
    }

    if (
      buffer.readUInt16LE(end + 4) ||
      buffer.readUInt16LE(end + 6)
    ) {
      return false;
    }

    const count = buffer.readUInt16LE(end + 10);
    const size = buffer.readUInt32LE(end + 12);

    let offset = buffer.readUInt32LE(end + 16);

    const limit = offset + size;

    if (
      !count ||
      count === 65535 ||
      limit > end
    ) {
      return false;
    }

    const names = new Set();

    for (
      let index = 0;
      index < count;
      index += 1
    ) {
      if (
        offset + 46 > limit ||
        buffer.readUInt32LE(offset) !== 0x02014b50
      ) {
        return false;
      }

      if (
        buffer.readUInt16LE(offset + 8) & 1
      ) {
        return false;
      }

      const length = buffer.readUInt16LE(
        offset + 28
      );

      const extra = buffer.readUInt16LE(
        offset + 30
      );

      const comment = buffer.readUInt16LE(
        offset + 32
      );

      const next =
        offset + 46 + length + extra + comment;

      if (next > limit) {
        return false;
      }

      const local = buffer.readUInt32LE(
        offset + 42
      );

      if (
        local + 30 > buffer.length ||
        buffer.readUInt32LE(local) !== 0x04034b50
      ) {
        return false;
      }

      names.add(
        buffer.toString(
          "utf8",
          offset + 46,
          offset + 46 + length
        )
      );

      offset = next;
    }

    return (
      offset === limit &&
      names.has("[Content_Types].xml") &&
      names.has("word/document.xml")
    );
  }

  return false;
}

function validateResume(file) {
  if (
    !file ||
    !Buffer.isBuffer(file.buffer) ||
    !file.buffer.length
  ) {
    throw fail(
      "Choose a non-empty résumé file.",
      400,
      ["resume"]
    );
  }

  if (
    file.buffer.length > MAX_RESUME_SIZE ||
    file.size > MAX_RESUME_SIZE
  ) {
    throw fail(
      "Your résumé must be 5 MB or smaller.",
      400,
      ["resume"]
    );
  }

  const mimeType = String(
    file.mimetype || ""
  )
    .trim()
    .toLowerCase();

  const extensions = {
    "application/pdf": ".pdf",
    "application/msword": ".doc",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      ".docx",
  };

  const extension = path
    .extname(file.originalname || "")
    .toLowerCase();

  if (
    !extensions[mimeType] ||
    extensions[mimeType] !== extension
  ) {
    throw fail(
      "Only matching PDF, DOC or DOCX résumé files are allowed.",
      400,
      ["resume"]
    );
  }

  const buffer = file.buffer;

  const signatureValid =
    extension === ".pdf"
      ? buffer.subarray(0, 5).equals(
          Buffer.from("%PDF-")
        )
      : extension === ".doc"
        ? buffer.subarray(0, 8).equals(
            Buffer.from(
              "d0cf11e0a1b11ae1",
              "hex"
            )
          )
        : hasDocxEntries(buffer);

  if (!signatureValid) {
    throw fail(
      "The résumé contents do not match its file type.",
      400,
      ["resume"]
    );
  }

  return mimeType;
}

// ============================================================
// STABLE SUBMISSION HASH
// ============================================================

function stableJson(value) {
  if (Array.isArray(value)) {
    return `[${value.map(stableJson).join(",")}]`;
  }

  if (
    value &&
    typeof value === "object"
  ) {
    return `{${Object.keys(value)
      .sort()
      .map(
        (key) =>
          `${JSON.stringify(key)}:${stableJson(value[key])}`
      )
      .join(",")}}`;
  }

  return JSON.stringify(value);
}

function submissionHash(body, file, mimeType) {
  const metadata = {
    application: body,
    resumeName: file.originalname,
    resumeType: mimeType,

    resumeHash: crypto
      .createHash("sha256")
      .update(file.buffer)
      .digest("hex"),
  };

  return crypto
    .createHash("sha256")
    .update(stableJson(metadata))
    .digest("hex");
}

// ============================================================
// NORMALIZE ADMIN RESPONSE
//
// Do not expose storage paths or submission hashes.
// ============================================================

function normalizeApplication(row) {
  const result = {
    id: row.id,
    applicationReference:
      row.application_reference,
  };

  for (
    const [field, [column]]
    of Object.entries(PUBLIC_FIELDS)
  ) {
    result[field] = row[column] ?? "";
  }

  Object.assign(result, {
    fullName: [
      row.first_name,
      row.last_name,
    ]
      .filter(Boolean)
      .join(" "),

    resumeAvailable: Boolean(row.resume_path),
    resumeFileName: row.resume_file_name || "",
    resumeMimeType: row.resume_mime_type || "",

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

    version: row.version,
  });

  return result;
}

// ============================================================
// SUBMISSION RETRY HELPERS
// ============================================================

async function findSubmission(key) {
  const { data, error } = await db
    .from(CFCV_TABLE)
    .select(
      "id,submission_hash,application_reference,submitted_at,resume_path"
    )
    .eq("submission_key", key)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

function receipt(
  res,
  row,
  hash,
  replayed
) {
  if (row.submission_hash !== hash) {
    throw fail(
      "This submission key was already used for different application details. Keep the original submission key when retrying the original application.",
      409
    );
  }

  return res
    .status(replayed ? 200 : 201)
    .json({
      success: true,

      message: replayed
        ? "Your application was already submitted."
        : "Your CFCV application has been submitted successfully.",

      applicationReference:
        row.application_reference,

      submittedAt: row.submitted_at,
      replayed,
    });
}

async function removeUnusedResume(storagePath) {
  try {
    const { error } = await db.storage
      .from(RESUME_BUCKET)
      .remove([storagePath]);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error(
      "[CFCV] Unused résumé cleanup failed:",
      error
    );
  }
}

// ============================================================
// PUBLIC: CREATE APPLICATION
// ============================================================

async function createApplication(req, res) {
  try {
    const key = req.body?.submissionKey;

    if (
      typeof key !== "string" ||
      !UUID.test(key)
    ) {
      throw fail(
        "A valid submission key is required.",
        400,
        ["submissionKey"]
      );
    }

    const submissionKey = key.toLowerCase();

    const { body, payload } =
      parseApplication(req);

    const mimeType = validateResume(req.file);

    const hash = submissionHash(
      body,
      req.file,
      mimeType
    );

    const existing = await findSubmission(
      submissionKey
    );

    if (existing) {
      return receipt(
        res,
        existing,
        hash,
        true
      );
    }

    const reference =
      `CFCV-${new Date().getUTCFullYear()}-${crypto
        .randomBytes(8)
        .toString("hex")
        .toUpperCase()}`;

    const storagePath =
      `${reference}/${crypto.randomUUID()}-${sanitizeFileName(
        req.file.originalname
      )}`;

    const { error: uploadError } =
      await db.storage
        .from(RESUME_BUCKET)
        .upload(
          storagePath,
          req.file.buffer,
          {
            contentType: mimeType,
            upsert: false,
            cacheControl: "0",
          }
        );

    if (uploadError) {
      throw uploadError;
    }

    const record = {
      ...payload,

      application_reference: reference,

      submission_key: submissionKey,
      submission_hash: hash,

      resume_path: storagePath,

      resume_file_name: sanitizeFileName(
        req.file.originalname
      ),

      resume_mime_type: mimeType,

      admissions_stage: "applied",
      assigned_track: null,

      matching_required: false,
      matching_status: "not_started",

      final_decision: null,

      interview_required: false,
      interview_status: "not_scheduled",

      status: "submitted",
      version: 1,
    };

    // UNIQUE submission_key arbitrates concurrent retries.
    //
    // Resolve uncertain inserts by reading the same key.
    // Never remove a résumé if its insert may have committed.

    let data;
    let insertError;

    try {
      const result = await db
        .from(CFCV_TABLE)
        .insert(record)
        .select(
          "id,submission_hash,application_reference,submitted_at,resume_path"
        )
        .single();

      data = result.data;
      insertError = result.error;
    } catch (error) {
      insertError = error;
    }

    if (insertError || !data) {
      const saved = await findSubmission(
        submissionKey
      );

      if (saved) {
        if (
          saved.resume_path !== storagePath
        ) {
          await removeUnusedResume(
            storagePath
          );
        }

        return receipt(
          res,
          saved,
          hash,
          true
        );
      }

      // A unique-constraint rejection is definitive.
      if (
        insertError?.code === "23505"
      ) {
        await removeUnusedResume(
          storagePath
        );
      }

      throw (
        insertError ||
        new Error(
          "The database did not confirm submission."
        )
      );
    }

    return receipt(
      res,
      data,
      hash,
      false
    );
  } catch (error) {
    return respondError(
      res,
      error,
      "Your application could not be confirmed. Retry with the same submission key and unchanged application."
    );
  }
}

// ============================================================
// READ APPLICATION
// ============================================================

async function readApplication(id) {
  const { data, error } = await db
    .from(CFCV_TABLE)
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    throw fail(
      "Application not found.",
      404
    );
  }

  return data;
}

// ============================================================
// ADMIN: APPLICATION LIST
// ============================================================

async function getApplications(req, res) {
  try {
    const filters = req.query || {};

    const page = Number(
      filters.page ?? 1
    );

    const pageSize = Number(
      filters.pageSize ?? 25
    );

    if (
      !Number.isSafeInteger(page) ||
      page < 1 ||
      !Number.isInteger(pageSize) ||
      pageSize < 1 ||
      pageSize > 100 ||
      !Number.isSafeInteger(page * pageSize)
    ) {
      throw fail(
        "Use a valid page and a pageSize between 1 and 100."
      );
    }

    let query = db
      .from(CFCV_TABLE)
      .select("*", {
        count: "exact",
      });

    for (
      const [field, column, values]
      of [
        ["status", "status", VALID_STATUSES],
        [
          "admissionsStage",
          "admissions_stage",
          VALID_ADMISSIONS_STAGES,
        ],
        [
          "track",
          "assigned_track",
          VALID_TRACKS,
        ],
        [
          "geography",
          "geography",
          VALID_GEOGRAPHIES,
        ],
      ]
    ) {
      if (filters[field]) {
        const value = text(
          filters[field],
          80,
          field
        );

        if (!values.has(value)) {
          throw fail(
            `Invalid ${field} filter.`
          );
        }

        query = query.eq(
          column,
          value
        );
      }
    }

    const search = text(
      filters.search,
      200,
      "search"
    )
      .replace(
        /[^\p{L}\p{N}\s@.+_-]/gu,
        " "
      )
      .replace(/[%_]/g, " ")
      .trim();

    if (search) {
      query = query.or(
        [
          "first_name",
          "last_name",
          "email",
          "venture_name",
          "application_reference",
        ]
          .map(
            (column) =>
              `${column}.ilike.%${search}%`
          )
          .join(",")
      );
    }

    const {
      data,
      count,
      error,
    } = await query
      .order("submitted_at", {
        ascending: false,
      })
      .order("id", {
        ascending: false,
      })
      .range(
        (page - 1) * pageSize,
        page * pageSize - 1
      );

    if (error) {
      throw error;
    }

    return res.json({
      success: true,

      count: count || 0,

      applications: (data || []).map(
        normalizeApplication
      ),

      pagination: {
        page,
        pageSize,
        total: count || 0,

        totalPages: Math.ceil(
          (count || 0) / pageSize
        ),
      },
    });
  } catch (error) {
    return respondError(
      res,
      error,
      "Unable to load CFCV applications."
    );
  }
}

// ============================================================
// ADMIN: APPLICATION DETAILS
// ============================================================

async function getApplicationById(req, res) {
  try {
    const row = await readApplication(
      applicationId(req)
    );

    return res.json({
      success: true,
      application:
        normalizeApplication(row),
    });
  } catch (error) {
    return respondError(
      res,
      error,
      "Unable to load application."
    );
  }
}

// ============================================================
// ADMIN: PRIVATE RÉSUMÉ LINK
// ============================================================

async function getApplicationResume(req, res) {
  try {
    const row = await readApplication(
      applicationId(req)
    );

    if (!row.resume_path) {
      throw fail(
        "No résumé is available for this application.",
        404
      );
    }

    const { data, error } =
      await db.storage
        .from(RESUME_BUCKET)
        .createSignedUrl(
          row.resume_path,
          300,
          {
            download:
              row.resume_file_name ||
              "resume",
          }
        );

    if (error) {
      throw error;
    }

    if (!data?.signedUrl) {
      throw new Error(
        "Missing signed URL."
      );
    }

    return res.json({
      success: true,

      url: data.signedUrl,
      signedUrl: data.signedUrl,

      fileName:
        row.resume_file_name || "resume",

      mimeType:
        row.resume_mime_type || "",

      expiresIn: 300,
    });
  } catch (error) {
    return respondError(
      res,
      error,
      "Unable to access the résumé."
    );
  }
}

// ============================================================
// VALIDATE PROPOSED ADMIN REVIEW
// ============================================================

function buildReview(body, current) {
  if (
    !body ||
    typeof body !== "object" ||
    Array.isArray(body)
  ) {
    throw fail(
      "Invalid review data."
    );
  }

  if (
    !Number.isSafeInteger(
      body.expectedVersion
    ) ||
    body.expectedVersion < 1
  ) {
    throw fail(
      "Reload the application before saving. Its version is required."
    );
  }

  if (
    body.expectedVersion !== current.version
  ) {
    throw fail(
      "This application changed. Reload it before saving again.",
      409
    );
  }

  const updates = {};

  for (
    const [field, [column, values]]
    of Object.entries(REVIEW_ENUMS)
  ) {
    if (
      body[field] === undefined
    ) {
      continue;
    }

    const nullable =
      field === "assignedTrack" ||
      field === "finalDecision";

    if (
      nullable &&
      (
        body[field] === null ||
        body[field] === ""
      )
    ) {
      updates[column] = null;
    } else {
      const value = text(
        body[field],
        80,
        field
      );

      if (!values.has(value)) {
        throw fail(
          `Invalid ${field}.`,
          400,
          [field]
        );
      }

      updates[column] = value;
    }
  }

  for (const [field, column] of [
    ["matchingRequired", "matching_required"],
    ["interviewRequired", "interview_required"],
  ]) {
    if (
      body[field] === undefined
    ) {
      continue;
    }

    if (
      typeof body[field] !== "boolean"
    ) {
      throw fail(
        `Invalid ${field}.`,
        400,
        [field]
      );
    }

    updates[column] = body[field];
  }

  if (
    body.interviewDate !== undefined
  ) {
    if (
      body.interviewDate === null ||
      body.interviewDate === ""
    ) {
      updates.interview_date = null;
    } else {
      if (
        typeof body.interviewDate !== "string" ||
        !Number.isFinite(
          Date.parse(body.interviewDate)
        )
      ) {
        throw fail(
          "Invalid interview date.",
          400,
          ["interviewDate"]
        );
      }

      updates.interview_date = new Date(
        body.interviewDate
      ).toISOString();
    }
  }

  for (const [field, column] of [
    ["reviewerNotes", "reviewer_notes"],
    ["interviewNotes", "interview_notes"],
    ["matchingNotes", "matching_notes"],
    ["decisionNotes", "decision_notes"],
  ]) {
    if (
      body[field] !== undefined
    ) {
      updates[column] = text(
        body[field],
        10000,
        field
      );
    }
  }

  const next = {
    ...current,
    ...updates,
  };

  if (
    next.final_decision &&
    next.status !== "withdrawn"
  ) {
    next.status =
      DECISION_STATUSES[
        next.final_decision
      ];

    updates.status = next.status;
  }

  if (
    next.final_decision ===
      "ADMIT WITH TRACK PLACEMENT" &&
    !next.assigned_track
  ) {
    throw fail(
      "Select Genesis, Ascend or Horizon before admitting with track placement.",
      400,
      ["assignedTrack"]
    );
  }

  if (
    body.notifyApplicant !== undefined &&
    typeof body.notifyApplicant !== "boolean"
  ) {
    throw fail(
      "Invalid notifyApplicant value.",
      400,
      ["notifyApplicant"]
    );
  }

  const notify =
    body.notifyApplicant === true;

  const message = text(
    body.applicantMessage,
    5000,
    "applicantMessage"
  );

  if (
    !Object.keys(updates).length
  ) {
    throw fail(
      "No valid application updates were provided."
    );
  }

  return {
    updates,
    next,
    notify,
    message,
  };
}

// ============================================================
// APPLICANT MESSAGE
//
// Internal review notes are never included.
// ============================================================

function applicantMessage(row, custom) {
  if (custom) {
    return custom;
  }

  switch (row.status) {
    case "admitted":
      return (
        `Your application has been admitted${
          row.assigned_track
            ? ` to the ${row.assigned_track} track`
            : ""
        }. Our admissions team will contact you about the next steps.`
      );

    case "waitlisted":
      return (
        "Your application has been placed on the waitlist. Our admissions team will contact you if a place becomes available."
      );

    case "not_selected":
      return (
        "Thank you for applying. Your application has not been selected for this cohort."
      );

    case "withdrawn":
      return (
        "Your application has been marked as withdrawn."
      );

    default:
      return (
        `Your application is being reviewed. Current admissions stage: ${
          String(
            row.admissions_stage || "applied"
          ).replace(/_/g, " ")
        }. Our admissions team will contact you about any next steps.`
      );
  }
}

// ============================================================
// ADMIN: EMAIL PREVIEW
//
// Does not save or send.
// ============================================================

async function previewApplicationEmail(req, res) {
  try {
    const current = await readApplication(
      applicationId(req)
    );

    const review = buildReview(
      req.body,
      current
    );

    const message = applicantMessage(
      review.next,
      review.message
    );

    const subject =
      `CFCV application update — ${current.application_reference}`;

    const bodyText =
      `Hello ${current.first_name || "Applicant"},\n\n` +
      `Application reference: ${current.application_reference}\n\n` +
      `${message}\n\n` +
      "Continental Founders Admissions";

    return res.json({
      success: true,

      preview: {
        to: current.email,
        recipient: current.email,
        subject,
        text: bodyText,
        bodyText,
      },

      applicantMessage: message,
    });
  } catch (error) {
    return respondError(
      res,
      error,
      "Unable to preview the applicant email."
    );
  }
}

// ============================================================
// ADMIN: SAVE REVIEW
//
// Atomic database transaction:
// application + history + optional email queue.
// ============================================================

async function updateApplication(req, res) {
  try {
    const id = applicationId(req);

    const current = await readApplication(id);

    const review = buildReview(
      req.body,
      current
    );

    const actorId = req.admin?.id;

    if (!actorId) {
      throw fail(
        "An authenticated admin is required.",
        401
      );
    }

    // No direct-update fallback.
    const { data, error } = await db.rpc(
      "cfcv_save_review",
      {
        p_application_id: id,

        p_expected_version:
          req.body.expectedVersion,

        p_updates: review.updates,
        p_actor_id: actorId,
        p_notify: review.notify,

        p_message: applicantMessage(
          review.next,
          review.message
        ),
      }
    );

    if (error) {
      if (
        error.code === "40001"
      ) {
        throw fail(
          "This application changed. Reload it before saving again.",
          409
        );
      }

      if (
        error.code === "P0002"
      ) {
        throw fail(
          "Application not found.",
          404
        );
      }

      if (
        [
          "22023",
          "23514",
          "23502",
          "22P02",
          "23503",
        ].includes(error.code)
      ) {
        throw fail(
          "The review data is invalid. Check the selected fields and try again."
        );
      }

      throw error;
    }

    const result = Array.isArray(data)
      ? data[0]
      : data;

    const saved =
      result?.application || result;

    if (
      !saved?.id ||
      saved.id !== id ||
      !Number.isInteger(saved.version) ||
      saved.version <= req.body.expectedVersion
    ) {
      throw new Error(
        "The database did not confirm the review update."
      );
    }

    return res.json({
      success: true,

      application:
        normalizeApplication(saved),

      message: review.notify
        ? "Review saved and applicant email queued."
        : "Application updated successfully.",

      emailQueued: review.notify,
    });
  } catch (error) {
    return respondError(
      res,
      error,
      "The review update could not be confirmed. Reload the application before trying again."
    );
  }
}

// ============================================================
// REMOVE PRIVATE METADATA FROM HISTORY SNAPSHOTS
// ============================================================

function hidePrivateFields(value) {
  if (Array.isArray(value)) {
    return value.map(
      hidePrivateFields
    );
  }

  if (
    value &&
    typeof value === "object"
  ) {
    return Object.fromEntries(
      Object.entries(value)
        .filter(
          ([key]) =>
            ![
              "resume_path",
              "submission_key",
              "submission_hash",
            ].includes(key)
        )
        .map(
          ([key, item]) => [
            key,
            hidePrivateFields(item),
          ]
        )
    );
  }

  return value;
}

// ============================================================
// ADMIN: REVIEW HISTORY
// ============================================================

async function getApplicationHistory(req, res) {
  try {
    const id = applicationId(req);

    await readApplication(id);

    const { data, error } = await db
      .from(HISTORY_TABLE)
      .select("*")
      .eq("application_id", id)
      .order("created_at", {
        ascending: false,
      })
      .limit(200);

    if (error) {
      throw error;
    }

    return res.json({
      success: true,
      history:
        hidePrivateFields(data || []),
    });
  } catch (error) {
    return respondError(
      res,
      error,
      "Unable to load application history."
    );
  }
}

// ============================================================
// ADMIN: EMAIL QUEUE STATUS
// ============================================================

async function getApplicationEmails(req, res) {
  try {
    const id = applicationId(req);

    await readApplication(id);

    const { data, error } = await db
      .from(EMAIL_TABLE)
      .select(
        "id,event_key,recipient,subject,body_text,status,attempts,first_attempt_at,next_attempt_at,provider_message_id,accepted_at,last_error,created_at"
      )
      .eq("application_id", id)
      .order("created_at", {
        ascending: false,
      })
      .limit(200);

    if (error) {
      throw error;
    }

    return res.json({
      success: true,
      emails: data || [],
    });
  } catch (error) {
    return respondError(
      res,
      error,
      "Unable to load application emails."
    );
  }
}

// ============================================================
// ADMIN: STATISTICS
// ============================================================

async function getApplicationStats(req, res) {
  try {
    const rows = [];
    const pageSize = 500;

    for (
      let offset = 0;
      ;
      offset += pageSize
    ) {
      const { data, error } = await db
        .from(CFCV_TABLE)
        .select(
          "id,status,admissions_stage,assigned_track,matching_required,final_decision"
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

      rows.push(...(data || []));

      if (
        (data || []).length < pageSize
      ) {
        break;
      }
    }

    const effectiveStatus = (row) =>
      row.status === "withdrawn"
        ? "withdrawn"
        : DECISION_STATUSES[
            row.final_decision
          ] || row.status;

    const countStatus = (status) =>
      rows.filter(
        (row) =>
          effectiveStatus(row) === status
      ).length;

    const capacity = Number(
      process.env.CFCV_COHORT_CAPACITY ?? 30
    );

    const cohortCapacity =
      Number.isInteger(capacity) &&
      capacity >= 0
        ? capacity
        : 30;

    const stats = {
      totalApplications: rows.length,

      submitted:
        countStatus("submitted"),

      underReview:
        countStatus("under_review"),

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

      admitted:
        countStatus("admitted"),

      waitlisted:
        countStatus("waitlisted"),

      genesis: rows.filter(
        (row) =>
          row.assigned_track === "Genesis"
      ).length,

      ascend: rows.filter(
        (row) =>
          row.assigned_track === "Ascend"
      ).length,

      horizon: rows.filter(
        (row) =>
          row.assigned_track === "Horizon"
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
    return respondError(
      res,
      error,
      "Unable to load CFCV statistics."
    );
  }
}

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  createApplication,
  getApplications,
  getApplicationById,
  getApplicationResume,
  updateApplication,
  getApplicationStats,
  getApplicationHistory,
  getApplicationEmails,
  previewApplicationEmail,
};