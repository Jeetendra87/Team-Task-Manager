const ApiError = require("../utils/ApiError");
const { verifyToken } = require("../utils/token");
const User = require("../models/User");

async function requireAuth(req, _res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) throw new ApiError(401, "Authentication required");

    let payload;
    try {
      payload = verifyToken(token);
    } catch {
      throw new ApiError(401, "Invalid or expired token");
    }

    const user = await User.findById(payload.sub);
    if (!user) throw new ApiError(401, "User no longer exists");

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = { requireAuth };
