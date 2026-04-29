const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const env = require("./config/env");
const errorHandler = require("./middleware/errorHandler");
const notFound = require("./middleware/notFound");

const authRoutes = require("./routes/auth");
const projectRoutes = require("./routes/projects");
const taskRoutes = require("./routes/tasks");
const dashboardRoutes = require("./routes/dashboard");
const userRoutes = require("./routes/users");

const app = express();

app.set("trust proxy", 1);
app.use(helmet());
app.use(
  cors({
    origin(origin, cb) {
      // Allow same-origin / curl (no Origin) and any whitelisted origin.
      if (!origin || env.corsOrigin.includes(origin) || env.corsOrigin.includes("*")) {
        return cb(null, true);
      }
      cb(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
if (env.nodeEnv !== "test") app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));

// Global rate limit (auth has its own stricter one).
app.use(
  "/api",
  rateLimit({
    windowMs: 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.get("/health", (_req, res) => res.json({ ok: true, env: env.nodeEnv }));

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", userRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
