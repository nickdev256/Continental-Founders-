const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");


// ============================================================
// ROUTES
// ============================================================

const authRoutes =
  require("./routes/authRoutes");

const contactRoutes =
  require("./routes/contactRoutes");

const partnershipRoutes =
  require("./routes/partnershipRoutes");

const newsletterRoutes =
  require("./routes/newsletterRoutes");

const dashboardRoutes =
  require("./routes/dashboardRoutes");

const eventsRoutes =
  require("./routes/eventsRoutes");

const insightsRoutes =
  require("./routes/insightsRoutes");

const universityRoutes =
  require("./routes/universityRoutes");


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

const app =
  express();


// ============================================================
// TRUST PROXY
// ============================================================

app.set(
  "trust proxy",
  1
);


// ============================================================
// SECURITY HEADERS
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
  .map((url) =>
    url.trim()
  )
  .filter(Boolean);


app.use(
  cors({
    origin: (
      origin,
      callback
    ) => {

      /*
        Allow tools such as Postman,
        server-to-server requests,
        and same-origin requests.
      */

      if (!origin) {

        return callback(
          null,
          true
        );

      }


      if (
        allowedOrigins.includes(
          origin
        )
      ) {

        return callback(
          null,
          true
        );

      }


      return callback(
        new Error(
          `Origin ${origin} is not allowed by CORS`
        )
      );

    },

    credentials:
      true,

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
  })
);


// ============================================================
// BODY PARSERS
// ============================================================

app.use(
  express.json({
    limit:
      "1mb",
  })
);


app.use(
  express.urlencoded({
    extended:
      true,

    limit:
      "1mb",
  })
);


// ============================================================
// COOKIE PARSER
// ============================================================

app.use(
  cookieParser()
);


// ============================================================
// RATE LIMITERS
// ============================================================

const publicFormLimiter =
  rateLimit({
    windowMs:
      15 * 60 * 1000,

    limit:
      30,

    standardHeaders:
      true,

    legacyHeaders:
      false,

    message: {
      success:
        false,

      message:
        "Too many requests. Please try again shortly.",
    },
  });


const newsletterLimiter =
  rateLimit({
    windowMs:
      15 * 60 * 1000,

    limit:
      20,

    standardHeaders:
      true,

    legacyHeaders:
      false,

    message: {
      success:
        false,

      message:
        "Too many newsletter requests. Please try again shortly.",
    },
  });


// ============================================================
// HEALTH CHECK
// ============================================================

app.get(
  "/api/health",
  (
    req,
    res
  ) => {

    return res
      .status(200)
      .json({
        success:
          true,

        message:
          "Continental Founders API is running",

        environment:
          process.env.NODE_ENV ||
          "development",

        database:
          "Supabase",

        services: {

          auth:
            "/api/auth",

          contact:
            "/api/contact",

          partnerships:
            "/api/partnerships",

          newsletter:
            "/api/newsletter",

          newsletterSubscribe:
            "/api/newsletter/subscribe",

          events:
            "/api/events",

          publishedEvents:
            "/api/events/published",

          insights:
            "/api/insights",

          publishedInsights:
            "/api/insights/published",

          universities:
            "/api/universities",

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
// ADMIN DASHBOARD
// ============================================================

app.use(
  "/api/admin/dashboard",
  dashboardRoutes
);


// ============================================================
// API ROOT
// ============================================================

app.get(
  "/api",
  (
    req,
    res
  ) => {

    return res
      .status(200)
      .json({
        success:
          true,

        name:
          "Continental Founders API",

        status:
          "online",

        endpoints: {

          health:
            "/api/health",

          auth:
            "/api/auth",

          contact:
            "/api/contact",

          partnerships:
            "/api/partnerships",

          newsletter:
            "/api/newsletter",

          events:
            "/api/events",

          publishedEvents:
            "/api/events/published",

          insights:
            "/api/insights",

          publishedInsights:
            "/api/insights/published",

          universities:
            "/api/universities",

          adminDashboard:
            "/api/admin/dashboard",
        },
      });

  }
);


// ============================================================
// 404 HANDLER
// ============================================================

app.use(
  notFound
);


// ============================================================
// GLOBAL ERROR HANDLER
// ============================================================

app.use(
  errorHandler
);


// ============================================================
// EXPORT
// ============================================================

module.exports =
  app;