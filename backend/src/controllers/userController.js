const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

// Lightweight user directory for member-pickers and global search.
exports.list = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const filter = {};
  if (search) {
    const re = new RegExp(escape(search), "i");
    filter.$or = [{ name: re }, { email: re }];
  }
  const users = await User.find(filter).select("name email role").limit(50);
  res.json({ users });
});

function escape(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
