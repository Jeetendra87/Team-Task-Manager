const express = require("express");
const ctrl = require("../controllers/userController");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();
router.use(requireAuth);
router.get("/", ctrl.list);

module.exports = router;
