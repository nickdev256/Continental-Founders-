const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");


/* ============================================================
   ROUTES
============================================================ */

const authRoutes = require("./routes/authRoutes");
const contactRoutes = require("./routes/contactRoutes");
const partnershipRoutes = require("./routes/partnershipRoutes");
const newsletterRoutes = require("./routes/newsletterRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const eventsRoutes = require("./routes/eventsRoutes");

// Keep this filename lowercase because Git tracks it that way.
const insightsRoutes = require("./routes/insightsroutes");

const universityRoutes = require("./routes/universityRoutes");
const venturesRoutes = require("./routes/venturesRoutes");
const pagesRoutes = require("./routes/pagesRoutes");

// Gallery
const galleryRoutes = require("./routes/galleryRoutes");

// CFCV Fellowship Admissions
const cfcvRoutes = require("./routes/cfcvRoutes");

const {
  notFound,
  errorHandler,
} = require("./middleware/error");


/* ============================================================
   APP
============================================================ */

const app = express();

const isProduction =
  process.env.NODE_ENV === "production";

app.set("trust proxy", 1);

app.disable("x-powered-by");


/* ============================================================
   SECURITY HEADERS
============================================================ */

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },

    referrerPolicy: {
      policy:
        "strict-origin-when-cross-origin",
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


/* ============================================================
   CORS
============================================================ */

/*
 * CLIENT_URL can contain additional origins separated by commas.
 *
 * Example:
 *
 * CLIENT_URL=https://example.com,https://admin.example.com
 */

const configuredOrigins =
  (
    process.env.CLIENT_URL ||
    ""
  )
    .split(",")
    .map((url) =>
      url
        .trim()
        .replace(/\/+$/, "")
    )
    .filter(Boolean);


const defaultAllowedOrigins = [
  "http://localhost:5173",

  "http://127.0.0.1:5173",

  "https://continentalfounders.org",

  "https://www.continentalfounders.org",

  "https://continental-founders.vercel.app",
];


const allowedOrigins =
  new Set([
    ...defaultAllowedOrigins,

    ...configuredOrigins,
  ]);


const corsOptions = {
  origin(
    origin,
    callback
  ) {
    /*
     * Allow requests without an Origin header,
     * such as health checks and server-to-server requests.
     */

    if (!origin) {
      return callback(
        null,
        true
      );
    }


    const normalizedOrigin =
      origin
        .trim()
        .replace(/\/+$/, "");


    if (
      allowedOrigins.has(
        normalizedOrigin
      )
    ) {
      return callback(
        null,
        true
      );
    }


    console.warn(
      `[CORS] Blocked origin: ${normalizedOrigin}`
    );


    return callback(
      new Error(
        `Origin ${normalizedOrigin} is not allowed by CORS`
      )
    );
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
  ],


  exposedHeaders: [
    "Content-Length",
  ],


  maxAge: 86400,


  optionsSuccessStatus: 204,
};


/*
 * CORS must run before API routes.
 */

app.use(
  cors(corsOptions)
);


/* ============================================================
   REQUEST BODY PARSING
============================================================ */

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


app.use(
  cookieParser()
);


/* ============================================================
   ALLOWED HTTP METHODS
============================================================ */

const allowedMethods =
  new Set([
    "GET",
    "HEAD",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ]);


app.use(
  (
    req,
    res,
    next
  ) => {
    if (
      !allowedMethods.has(
        req.method
      )
    ) {
      return res
        .status(405)
        .json({
          success: false,

          message:
            "Method not allowed.",
        });
    }


    return next();
  }
);


/* ============================================================
   GLOBAL API RATE LIMIT
============================================================ */

const apiLimiter =
  rateLimit({
    windowMs:
      15 *
      60 *
      1000,

    limit: 500,

    standardHeaders: true,

    legacyHeaders: false,


    skip: (req) =>
      req.path ===
      "/health",


    message: {
      success: false,

      message:
        "Too many requests. Please try again later.",
    },
  });


app.use(
  "/api",
  apiLimiter
);


/* ============================================================
   PUBLIC FORM RATE LIMIT
============================================================ */

const publicFormLimiter =
  rateLimit({
    windowMs:
      15 *
      60 *
      1000,

    limit: 20,

    standardHeaders: true,

    legacyHeaders: false,


    message: {
      success: false,

      message:
        "Too many submissions. Please try again later.",
    },
  });


/* ============================================================
   NEWSLETTER RATE LIMIT
============================================================ */

const newsletterLimiter =
  rateLimit({
    windowMs:
      15 *
      60 *
      1000,

    limit: 15,

    standardHeaders: true,

    legacyHeaders: false,


    message: {
      success: false,

      message:
        "Too many newsletter requests. Please try again later.",
    },
  });


/* ============================================================
   CFCV APPLICATION RATE LIMIT
============================================================ */

/*
 * Separate limiter for fellowship applications.
 *
 * This protects the public application endpoint
 * from automated spam without affecting the
 * protected admin admissions endpoints.
 */

const cfcvApplicationLimiter =
  rateLimit({
    windowMs:
      30 *
      60 *
      1000,

    limit: 10,

    standardHeaders: true,

    legacyHeaders: false,


    message: {
      success: false,

      message:
        "Too many application submissions. Please wait and try again later.",
    },
  });


/* ============================================================
   NO-CACHE ADMIN / AUTH
============================================================ */

app.use(
  [
    "/api/auth",
    "/api/admin",
    "/api/gallery/admin",
    "/api/cfcv/admin",
  ],

  (
    req,
    res,
    next
  ) => {
    res.setHeader(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, private"
    );


    res.setHeader(
      "Pragma",
      "no-cache"
    );


    res.setHeader(
      "Expires",
      "0"
    );


    next();
  }
);


/* ============================================================
   HEALTH CHECK
============================================================ */

app.get(
  "/api/health",

  (
    req,
    res
  ) => {
    return res
      .status(200)
      .json({
        success: true,

        status: "ok",

        environment:
          isProduction
            ? "production"
            : "development",
      });
  }
);


/* ============================================================
   API ROUTES
============================================================ */

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


/* ============================================================
   GALLERY API
============================================================ */

app.use(
  "/api/gallery",
  galleryRoutes
);


/* ============================================================
   CFCV FELLOWSHIP ADMISSIONS API
============================================================ */

/*
 * Public:
 *
 * POST /api/cfcv/applications
 *
 *
 * Protected admin:
 *
 * GET   /api/cfcv/admin/stats
 * GET   /api/cfcv/admin/applications
 * GET   /api/cfcv/admin/applications/:id
 * PATCH /api/cfcv/admin/applications/:id
 */

app.use(
  "/api/cfcv/applications",
  cfcvApplicationLimiter
);

app.use(
  "/api/cfcv",
  cfcvRoutes
);


/* ============================================================
   ADMIN DASHBOARD
============================================================ */

app.use(
  "/api/admin/dashboard",
  dashboardRoutes
);


/* ============================================================
   API ROOT
============================================================ */

app.get(
  "/api",

  (
    req,
    res
  ) => {
    return res
      .status(200)
      .json({
        success: true,

        name:
          "Continental Founders API",

        status:
          "online",
      });
  }
);


/* ============================================================
   404
============================================================ */

app.use(
  notFound
);


/* ============================================================
   GLOBAL ERROR HANDLER
============================================================ */

app.use(
  errorHandler
);


/* ============================================================
   EXPORT APP
============================================================ */

module.exports = app;