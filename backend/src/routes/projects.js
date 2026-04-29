const express = require("express");
const ctrl = require("../controllers/projectController");
const { requireAuth } = require("../middleware/auth");
const { requireRole } = require("../middleware/rbac");
const { validate } = require("../middleware/validate");
const {
  createProjectSchema,
  updateProjectSchema,
  memberSchema,
} = require("../validators/projectValidator");

const router = express.Router();
router.use(requireAuth);

router.get("/", ctrl.list);
router.get("/:id", ctrl.get);

// Only admins can create/update/delete projects.
router.post("/", requireRole("admin"), validate(createProjectSchema), ctrl.create);
router.put("/:id", requireRole("admin"), validate(updateProjectSchema), ctrl.update);
router.delete("/:id", requireRole("admin"), ctrl.remove);

router.post("/:id/members", requireRole("admin"), validate(memberSchema), ctrl.addMember);
router.delete("/:id/members/:userId", requireRole("admin"), ctrl.removeMember);

module.exports = router;
