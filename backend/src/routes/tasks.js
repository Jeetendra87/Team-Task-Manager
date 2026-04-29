const express = require("express");
const ctrl = require("../controllers/taskController");
const { requireAuth } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const {
  createTaskSchema,
  updateTaskSchema,
  commentSchema,
} = require("../validators/taskValidator");

const router = express.Router();
router.use(requireAuth);

router.get("/", ctrl.list);
router.get("/:id", ctrl.get);
router.post("/", validate(createTaskSchema), ctrl.create);
router.put("/:id", validate(updateTaskSchema), ctrl.update);
router.delete("/:id", ctrl.remove);

router.get("/:id/comments", ctrl.listComments);
router.post("/:id/comments", validate(commentSchema), ctrl.addComment);

module.exports = router;
