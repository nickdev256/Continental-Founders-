const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");

// ============================================================
// ROUTES
// ============================================================

const authRoutes = require("./routes/authRoutes");
const contactRoutes = require("./routes/contactRoutes");
const partnershipRoutes = require("./routes/partnershipRoutes");
const newsletterRoutes = require("./routes/newsletterRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const eventsRoutes = require("./routes/eventsRoutes");

// Git currently tracks this filename in lowercase.
const insightsRoutes = require("./routes/insightsroutes");

const universityRoutes = require("./routes/universityRoutes");
const venturesRoutes = require("./routes/venturesRoutes");
const pagesRoutes = require("./routes/pagesRoutes");

// ============================================================
// ERROR MIDDLEWARE
// ============================================================

const {
  notFound,
  errorHandler,
} = require("./middleware/error");

// ============================================================
// APP
// ============================================================

const app = express();

const isProduction =
  process.env.NODE_ENV === "production";

// ============================================================
// TRUST PROXY
// Render runs the API behind a reverse proxy.
// ============================================================

app.set("trust proxy", 1);

// ============================================================
// DISABLE EXPRESS IDENTIFICATION
// ============================================================

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
// CORS
// ============================================================

const configuredOrigins = (
  process.env.CLIENT_URL || ""
)
  .split(",")
  .map((url) => url.trim())
  .filter(Boolean);

const developmentOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

const allowedOrigins = new Set([
  ...configuredOrigins,
  ...(isProduction ? [] : developmentOrigins),
]);

const corsOptions = {
  origin(origin, callback) {
    // Requests without an Origin header can include
    // server-to-server requests and monitoring.
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.has(origin)) {
      return callback(null, true);
    }

    console.warn(
      `[CORS] Blocked origin: ${origin}`
    );

    return callback(
      new Error("Origin not allowed by CORS")
    );
  },

  credentials: true,

  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
  ],

  maxAge: 86400,
};

app.use(cors(corsOptions));

// ============================================================
// REQUEST BODY LIMITS
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

// ============================================================
// COOKIE PARSER
// ============================================================

app.use(cookieParser());

// ============================================================
// REQUEST METHOD PROTECTION
// ============================================================

app.use((req, res, next) => {
  const allowedMethods = new Set([
    "GET",
    "HEAD",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ]);

  if (!allowedMethods.has(req.method)) {
    return res.status(405).json({
      success: false,
      message: "Method not allowed.",
    });
  }

  return next();
});

// ============================================================
// GLOBAL API RATE LIMIT
// Protects the API from basic request flooding.
// ============================================================

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  limit: 500,

  standardHeaders: true,
  legacyHeaders: false,

  skip: (req) =>
    req.path === "/health",

  message: {
    success: false,
    message:
      "Too many requests. Please try again later.",
  },
});

app.use("/api", apiLimiter);

// ============================================================
// PUBLIC FORM RATE LIMITER
// ============================================================

const publicFormLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  limit: 20,

  standardHeaders: true,
  legacyHeaders: false,

  message: {
    success: false,
    message:
      "Too many submissions. Please try again later.",
  },
});

// ============================================================
// NEWSLETTER RATE LIMITER
// ============================================================

const newsletterLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  limit: 15,

  standardHeaders: true,
  legacyHeaders: false,

  message: {
    success: false,
    message:
      "Too many newsletter requests. Please try again later.",
  },
});

// ============================================================
// NO-CACHE FOR AUTHENTICATION / ADMIN RESPONSES
// ============================================================

app.use(
  ["/api/auth", "/api/admin"],
  (req, res, next) => {
    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, private"
    );

    res.setHeader(
      "Pragma",
      "no-cache"
    );

    next();
  }
);

// ============================================================
// HEALTH CHECK
// Keep this intentionally minimal.
// ============================================================

app.get("/api/health", (req, res) => {
  return res.status(200).json({
    success: true,
    status: "ok",
  });
});

// ============================================================
// AUTHENTICATION
// ============================================================

app.use(
  "/api/auth",
  authRoutes
);

// ============================================================
// CONTACT
// ============================================================

app.use(
  "/api/contact",
  publicFormLimiter,
  contactRoutes
);

// ============================================================
// PARTNERSHIPS
// ============================================================

app.use(
  "/api/partnerships",
  publicFormLimiter,
  partnershipRoutes
);

// ============================================================
// NEWSLETTER
// ============================================================

app.use(
  "/api/newsletter",
  newsletterLimiter,
  newsletterRoutes
);

// ============================================================
// EVENTS
// ============================================================

app.use(
  "/api/events",
  eventsRoutes
);

// ============================================================
// INSIGHTS
// ============================================================

app.use(
  "/api/insights",
  insightsRoutes
);

// ============================================================
// UNIVERSITIES
// ============================================================

app.use(
  "/api/universities",
  universityRoutes
);

// ============================================================
// VENTURES
// ============================================================

app.use(
  "/api/ventures",
  venturesRoutes
);

// ============================================================
// CMS PAGES
// ============================================================

app.use(
  "/api/pages",
  pagesRoutes
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
// Don't expose an inventory of private/admin endpoints.
// ============================================================

app.get("/api", (req, res) => {
  return res.status(200).json({
    success: true,
    name: "Continental Founders API",
    status: "online",
  });
});

// ============================================================
// 404 HANDLER
// ============================================================

app.use(notFound);

// ============================================================
// GLOBAL ERROR HANDLER
// ============================================================

app.use(errorHandler);

// ============================================================
// EXPORT
// ============================================================

module.exports = app;