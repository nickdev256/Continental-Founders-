const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");

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

const { notFound, errorHandler } = require("./middleware/error");

const app = express();
const isProduction = process.env.NODE_ENV === "production";

app.set("trust proxy", 1);
app.disable("x-powered-by");

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

// CLIENT_URL can contain additional origins separated by commas.
// Example:
// CLIENT_URL=https://another-site.example,https://admin.example
const configuredOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((url) => url.trim().replace(/\/+$/, ""))
  .filter(Boolean);

const defaultAllowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://continentalfounders.org",
  "https://www.continentalfounders.org",
  "https://continental-founders.vercel.app",
];

const allowedOrigins = new Set([
  ...defaultAllowedOrigins,
  ...configuredOrigins,
]);

const corsOptions = {
  origin(origin, callback) {
    // Allow requests without an Origin header, such as health checks.
    if (!origin) {
      return callback(null, true);
    }

    const normalizedOrigin = origin.trim().replace(/\/+$/, "");

    if (allowedOrigins.has(normalizedOrigin)) {
      return callback(null, true);
    }

    console.warn(`[CORS] Blocked origin: ${normalizedOrigin}`);
    return callback(
      new Error(`Origin ${normalizedOrigin} is not allowed by CORS`)
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

  exposedHeaders: ["Content-Length"],
  maxAge: 86400,
  optionsSuccessStatus: 204,
};

// CORS must run before the API routes.
app.use(cors(corsOptions));

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
    return res.status(405).json({
      success: false,
      message: "Method not allowed.",
    });
  }

  return next();
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 500,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === "/health",
  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

app.use("/api", apiLimiter);

const publicFormLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many submissions. Please try again later.",
  },
});

const newsletterLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many newsletter requests. Please try again later.",
  },
});

app.use(["/api/auth", "/api/admin"], (req, res, next) => {
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, private"
  );
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

app.get("/api/health", (req, res) => {
  return res.status(200).json({
    success: true,
    status: "ok",
    environment: isProduction ? "production" : "development",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/contact", publicFormLimiter, contactRoutes);
app.use("/api/partnerships", publicFormLimiter, partnershipRoutes);
app.use("/api/newsletter", newsletterLimiter, newsletterRoutes);
app.use("/api/events", eventsRoutes);
app.use("/api/insights", insightsRoutes);
app.use("/api/universities", universityRoutes);
app.use("/api/ventures", venturesRoutes);
app.use("/api/pages", pagesRoutes);
app.use("/api/admin/dashboard", dashboardRoutes);

app.get("/api", (req, res) => {
  return res.status(200).json({
    success: true,
    name: "Continental Founders API",
    status: "online",
  });
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;