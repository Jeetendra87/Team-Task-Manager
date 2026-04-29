const express = require("express");
const rateLimit = require("express-rate-limit");
const ctrl = require("../controllers/authController");
const { validate } = require("../middleware/validate");
const { requireAuth } = require("../middleware/auth");
const { registerSchema, loginSchema } = require("../validators/authValidator");

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many auth attempts, try again later" },
});

router.post("/register", authLimiter, validate(registerSchema), ctrl.register);
router.post("/login", authLimiter, validate(loginSchema), ctrl.login);
router.get("/profile", requireAuth, ctrl.profile);

module.exports = router;
