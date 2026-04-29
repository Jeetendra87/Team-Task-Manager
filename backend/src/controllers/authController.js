const crypto = require("crypto");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const { signToken } = require("../utils/token");
const asyncHandler = require("../utils/asyncHandler");
const { sendMail } = require("../utils/mailer");
const env = require("../config/env");

const issue = (user) => ({
  token: signToken({ sub: user._id.toString(), role: user.role }),
  user: user.toSafeJSON(),
});

const hashToken = (raw) => crypto.createHash("sha256").update(raw).digest("hex");

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

// Always returns the same generic message so attackers can't enumerate accounts.
exports.forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const generic = {
    message:
      "If an account exists for that email, a reset link has been sent.",
  };

  const user = await User.findOne({ email });
  if (!user) return res.json(generic);

  const rawToken = crypto.randomBytes(32).toString("hex");
  user.passwordResetToken = hashToken(rawToken);
  user.passwordResetExpires = new Date(
    Date.now() + env.passwordResetTtlMinutes * 60 * 1000
  );
  await user.save();

  const resetUrl = `${env.appUrl.replace(/\/$/, "")}/reset-password?token=${rawToken}`;
  const ttl = env.passwordResetTtlMinutes;

  const text = `Hi ${user.name},

We received a request to reset your Team Task Manager password.
Use the link below within ${ttl} minutes:

${resetUrl}

If you didn't request this, you can safely ignore this email.`;

  const html = `<div style="font-family:system-ui,Segoe UI,Arial,sans-serif;max-width:520px;margin:auto;color:#0f172a">
    <h2 style="margin:0 0 12px">Reset your password</h2>
    <p>Hi ${user.name},</p>
    <p>We received a request to reset your Team Task Manager password. This link expires in <strong>${ttl} minutes</strong>.</p>
    <p style="margin:24px 0">
      <a href="${resetUrl}" style="background:#2541ef;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;display:inline-block;font-weight:600">Reset password</a>
    </p>
    <p style="font-size:12px;color:#64748b">Or paste this URL into your browser:<br/><span style="word-break:break-all">${resetUrl}</span></p>
    <p style="font-size:12px;color:#64748b">If you didn't request this, you can safely ignore this email.</p>
  </div>`;

  const result = await sendMail({
    to: user.email,
    subject: "Reset your Team Task Manager password",
    text,
    html,
  });

  // In non-production, expose the link so dev can test without SMTP.
  if (env.nodeEnv !== "production" && !result.delivered) {
    return res.json({ ...generic, devResetUrl: resetUrl });
  }

  res.json(generic);
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  const user = await User.findOne({
    passwordResetToken: hashToken(token),
    passwordResetExpires: { $gt: new Date() },
  }).select("+password +passwordResetToken +passwordResetExpires");

  if (!user) throw new ApiError(400, "Reset link is invalid or has expired");

  user.password = password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  res.json(issue(user));
});
