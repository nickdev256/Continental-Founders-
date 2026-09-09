const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");


// ============================================================
// ROUTES
// ============================================================

const authRoutes = require("./routes/authRoutes");
const contactRoutes = require("./routes/contactRoutes");
const partnershipRoutes = require("./routes/partnershipRoutes");
const newsletterRoutes = require("./routes/newsletterRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const eventsRoutes = require("./routes/eventsRoutes");
const insightsRoutes = require("./routes/insightsRoutes");
const universityRoutes = require("./routes/universityRoutes");


// ============================================================
// ERROR MIDDLEWARE
// ============================================================

const {
  notFound,
  errorHandler,
} = require("./middleware/error");


const app = express();


// ============================================================
// TRUST PROXY
// ============================================================

app.set("trust proxy", 1);


// ============================================================
// SECURITY
// ============================================================

app.use(
  helmet()
);


// ============================================================
// CORS
// ============================================================

const allowedOrigins = (
  process.env.CLIENT_URL ||
  "http://localhost:5173"
)
  .split(",")
  .map((url) => url.trim())
  .filter(Boolean);


app.use(
  cors({
    origin: (origin, callback) => {

      // Allow Postman, curl, server-to-server requests
      if (!origin) {
        return callback(null, true);
      }

      if (
        allowedOrigins.includes(origin)
      ) {
        return callback(null, true);
      }

      return callback(
        new Error(
          `Origin ${origin} is not allowed by CORS`
        )
      );
    },

    credentials: true,
  })
);


// ============================================================
// BODY PARSERS
// ============================================================

app.use(
  express.json({
    limit: "1mb",
  })
);


app.use(
  express.urlencoded({
    extended: true,
    limit: "1mb",
  })
);


// ============================================================
// RATE LIMITERS
// ============================================================

const publicFormLimiter =
  rateLimit({
    windowMs:
      15 * 60 * 1000,

    limit: 30,

    standardHeaders: true,

    legacyHeaders: false,

    message: {
      success: false,
      message:
        "Too many requests. Please try again shortly.",
    },
  });


// ============================================================
// HEALTH CHECK
// ============================================================

app.get(
  "/api/health",
  (req, res) => {

    return res.status(200).json({
      success: true,

      message:
        "Continental Founders API is running",

      environment:
        process.env.NODE_ENV ||
        "development",

      database:
        "Supabase",

      services: {
        auth: "/api/auth",
        contact: "/api/contact",
        partnerships: "/api/partnerships",
        newsletter: "/api/newsletter",
        events: "/api/events",
        insights: "/api/insights",
        universities: "/api/universities",
        adminDashboard:
          "/api/admin/dashboard",
      },
    });
  }
);


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
  publicFormLimiter,
  newsletterRoutes
);


// ============================================================
// EVENTS
// ============================================================
//
// GET /api/events
// GET /api/events/:slug
//
// ============================================================

app.use(
  "/api/events",
  eventsRoutes
);


// ============================================================
// INSIGHTS
// ============================================================
//
// GET /api/insights
// GET /api/insights/:slug
//
// ============================================================

app.use(
  "/api/insights",
  insightsRoutes
);


// ============================================================
// UNIVERSITIES
// ============================================================
//
// GET /api/universities
//
// Returns the Universities page content from Supabase.
//
// ============================================================

app.use(
  "/api/universities",
  universityRoutes
);


// ============================================================
// ADMIN DASHBOARD
// ============================================================

app.use(
  "/api/admin/dashboard",
  dashboardRoutes
);


// ============================================================
// 404 HANDLER
//
// Must stay after all routes
// ============================================================

app.use(
  notFound
);


// ============================================================
// GLOBAL ERROR HANDLER
//
// Must stay last
// ============================================================

app.use(
  errorHandler
);


// ============================================================
// EXPORT APP
// ============================================================

module.exports = app;