const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const { signToken } = require("../utils/token");
const asyncHandler = require("../utils/asyncHandler");

const issue = (user) => ({
  token: signToken({ sub: user._id.toString(), role: user.role }),
  user: user.toSafeJSON(),
});

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, "An account with that email already exists");
  const user = await User.create({ name, email, password, role });
  res.status(201).json(issue(user));
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  if (!user) throw new ApiError(401, "Invalid email or password");
  const ok = await user.comparePassword(password);
  if (!ok) throw new ApiError(401, "Invalid email or password");
  res.json(issue(user));
});

exports.profile = asyncHandler(async (req, res) => {
  res.json({ user: req.user.toSafeJSON() });
});
