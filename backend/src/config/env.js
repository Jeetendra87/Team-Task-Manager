require("dotenv").config();

const required = ["MONGODB_URI", "JWT_SECRET"];
for (const key of required) {
  if (!process.env[key]) {
    // eslint-disable-next-line no-console
    console.error(`[config] missing required env var: ${key}`);
    process.exit(1);
  }
}

module.exports = {
  port: Number(process.env.PORT) || 4000,
  nodeEnv: process.env.NODE_ENV || "development",
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  corsOrigin: (process.env.CORS_ORIGIN || "http://localhost:5173")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
};
