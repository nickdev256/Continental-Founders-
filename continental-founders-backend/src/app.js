const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimitModule = require("express-rate-limit");
const cookieParser = require("cookie-parser");

const rateLimit =
  rateLimitModule.rateLimit || rateLimitModule;

// ============================================================
// ROUTES
// ============================================================

const authRoutes = require("./routes/authRoutes");
const contactRoutes = require("./routes/contactRoutes");
const partnershipRoutes = require("./routes/partnershipRoutes");
const newsletterRoutes = require("./routes/newsletterRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const eventsRoutes = require("./routes/eventsRoutes");

// Preserve the lowercase filename used by your repository.
const insightsRoutes = require("./routes/insightsroutes");

const universityRoutes = require("./routes/universityRoutes");
const venturesRoutes = require("./routes/venturesRoutes");
const pagesRoutes = require("./routes/pagesRoutes");
const galleryRoutes = require("./routes/galleryRoutes");
const cfcvRoutes = require("./routes/cfcvRoutes");

const {
  notFound,
  errorHandler,
} = require("./middleware/error");

// ============================================================
// APPLICATION
// ============================================================

const app = express();

const isProduction =
  process.env.NODE_ENV === "production";

app.set("trust proxy", 1);

app.disable("x-powered-by");

// ============================================================
// SECURITY HEADERS
// ============================================================

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },

    referrerPolicy: {
      policy: "strict-origin-when-cross-origin",
    },

    hsts: isProduction
      ? {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: true,
        }
      : false,
  })
);

// ============================================================
// PRIVATE RESPONSE CACHE CONTROL
//
// Apply before middleware that can reject a request.
// ============================================================

app.use(
  [
    "/api/auth",
    "/api/admin",
    "/api/gallery/admin",
    "/api/cfcv/admin",
  ],
  (req, res, next) => {
    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, private"
    );

    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    next();
  }
);

// ============================================================
// CORS
//
// CLIENT_URL supports comma-separated frontend origins.
// Use origins without page paths.
// ============================================================

function normalizeOrigin(origin) {
  return origin.trim().replace(/\/+$/, "");
}

const configuredOrigins = String(
  process.env.CLIENT_URL || ""
)
  .split(",")
  .map(normalizeOrigin)
  .filter(Boolean);

const allowedOrigins = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173",

  "https://continentalfounders.org",
  "https://www.continentalfounders.org",

  "https://continental-founders.vercel.app",

  ...configuredOrigins,
]);

const corsOptions = {
  origin(origin, callback) {
    // Health checks and server-to-server requests
    // may legitimately have no Origin header.
    if (
      !origin
      || allowedOrigins.has(normalizeOrigin(origin))
    ) {
      return callback(null, true);
    }

    const error = new Error(
      "This origin is not allowed."
    );

    error.status = 403;
    error.statusCode = 403;

    return callback(error);
  },

  credentials: true,

  methods: [
    "GET",
    "HEAD",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Accept",
    "X-Requested-With",
    "Idempotency-Key",
  ],

  exposedHeaders: [
    "Content-Length",
    "Retry-After",
  ],

  maxAge: 86400,

  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

// ============================================================
// ALLOWED HTTP METHODS
// ============================================================

const allowedMethods = new Set([
  "GET",
  "HEAD",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "OPTIONS",
]);

app.use((req, res, next) => {
  if (!allowedMethods.has(req.method)) {
    res.setHeader(
      "Allow",
      [...allowedMethods].join(", ")
    );

    return res.status(405).json({
      success: false,
      message: "Method not allowed.",
    });
  }

  next();
});

// ============================================================
// GLOBAL API RATE LIMIT
//
// Apply before request body parsing.
// Exempt preflight requests and health GET/HEAD requests.
// ============================================================

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: 500,

  standardHeaders: true,
  legacyHeaders: false,

  skip: (req) =>
    req.method === "OPTIONS"
    || (
      (
        req.method === "GET"
        || req.method === "HEAD"
      )
      && /^\/health\/?$/i.test(req.path)
    ),

  message: {
    success: false,
    message:
      "Too many requests. Please try again later.",
  },
});

app.use("/api", apiLimiter);

// ============================================================
// REQUEST PARSING
//
// Multipart résumé uploads are handled by Multer
// inside cfcvRoutes.js.
// ============================================================

app.use(
  express.json({
    limit: "1mb",
    strict: true,
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb",
    parameterLimit: 100,
  })
);

app.use(cookieParser());

// ============================================================
// PUBLIC FORM RATE LIMITS
//
// Skip non-POST requests and protected /admin paths.
// The global API limiter still applies.
// ============================================================

function skipNonPublicPost(req) {
  return (
    req.method !== "POST"
    || /^\/admin(?:\/|$)/i.test(req.path)
  );
}

const publicFormLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: 20,

  standardHeaders: true,
  legacyHeaders: false,

  skip: skipNonPublicPost,

  message: {
    success: false,
    message:
      "Too many submissions. Please try again later.",
  },
});

const newsletterLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: 15,

  standardHeaders: true,
  legacyHeaders: false,

  skip: skipNonPublicPost,

  message: {
    success: false,
    message:
      "Too many newsletter requests. Please try again later.",
  },
});

const cfcvApplicationLimiter = rateLimit({
  windowMs: 30 * 60 * 1000,

  max: 10,

  standardHeaders: true,
  legacyHeaders: false,

  message: {
    success: false,
    message:
      "Too many application submissions. Please wait and try again later.",
  },
});

// ============================================================
// HEALTH CHECK
// ============================================================

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    status: "ok",

    environment: isProduction
      ? "production"
      : "development",
  });
});

// ============================================================
// EXISTING API ROUTES
// ============================================================

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/contact",
  publicFormLimiter,
  contactRoutes
);

app.use(
  "/api/partnerships",
  publicFormLimiter,
  partnershipRoutes
);

app.use(
  "/api/newsletter",
  newsletterLimiter,
  newsletterRoutes
);

app.use(
  "/api/events",
  eventsRoutes
);

app.use(
  "/api/insights",
  insightsRoutes
);

app.use(
  "/api/universities",
  universityRoutes
);

app.use(
  "/api/ventures",
  venturesRoutes
);

app.use(
  "/api/pages",
  pagesRoutes
);

app.use(
  "/api/gallery",
  galleryRoutes
);

// ============================================================
// CFCV FELLOWSHIP ADMISSIONS
//
// Only the public submission POST gets this limiter.
// Successful limiter checks continue to the mounted router.
// ============================================================

app.post(
  "/api/cfcv/applications",
  cfcvApplicationLimiter
);

app.use(
  "/api/cfcv",
  cfcvRoutes
);

// ============================================================
// ADMIN DASHBOARD
// ============================================================

app.use(
  "/api/admin/dashboard",
  dashboardRoutes
);

// ============================================================
// API ROOT
// ============================================================

app.get("/api", (req, res) => {
  res.status(200).json({
    success: true,
    name: "Continental Founders API",
    status: "online",
  });
});

// ============================================================
// NOT FOUND AND ERROR HANDLING
// ============================================================

app.use(notFound);

app.use(errorHandler);

// ============================================================
// EXPORT
//
// Start HTTP listening and the email worker from server.js.
// ============================================================

module.exports = app;