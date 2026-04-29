const env = require("../config/env");

// eslint-disable-next-line no-unused-vars
function errorHandler(err, _req, res, _next) {
  let status = err.statusCode || 500;
  let message = err.message || "Internal server error";
  let details = err.details;

  // Mongoose duplicate-key
  if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `Duplicate value for ${field}`;
  }

  // Mongoose validation
  if (err.name === "ValidationError") {
    status = 400;
    message = "Validation failed";
    details = Object.values(err.errors).map((e) => ({
      path: e.path,
      message: e.message,
    }));
  }

  // Bad ObjectId in route param
  if (err.name === "CastError") {
    status = 400;
    message = `Invalid ${err.path}`;
  }

  if (status >= 500) {
    // eslint-disable-next-line no-console
    console.error("[error]", err);
  }

  const body = { error: message };
  if (details) body.details = details;
  if (env.nodeEnv !== "production" && status >= 500) body.stack = err.stack;

  res.status(status).json(body);
}

module.exports = errorHandler;
