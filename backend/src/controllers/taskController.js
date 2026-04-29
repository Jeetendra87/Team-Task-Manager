const Task = require("../models/Task");
const Project = require("../models/Project");
const Comment = require("../models/Comment");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const { canRead, canModify } = require("./projectController");

const isAdmin = (u) => u.role === "admin";

const populate = (q) =>
  q
    .populate("assignedTo", "name email role")
    .populate("createdBy", "name email role")
    .populate("project", "title status");

async function loadProjectFor(taskOrId, user, { write = false } = {}) {
  const projectId =
    typeof taskOrId === "string" ? taskOrId : taskOrId.project?._id || taskOrId.project;
  const project = await Project.findById(projectId);
  if (!project) throw new ApiError(404, "Project not found");
  const allowed = write ? canModify(project, user) || isMemberAndOwnTask : canRead(project, user);
  if (!allowed) throw new ApiError(403, "Forbidden");
  return project;
}

// Reusable check: allow if member of the project (for read).
function isMemberAndOwnTask() {
  return false; // unused fallback; specific handlers below do their own checks
}

exports.list = asyncHandler(async (req, res) => {
  const { project, status, priority, assignedTo, search, mine } = req.query;
  const filter = {};
  if (project) {
    const p = await Project.findById(project);
    if (!p) throw new ApiError(404, "Project not found");
    if (!canRead(p, req.user)) throw new ApiError(403, "Forbidden");
    filter.project = project;
  } else if (!isAdmin(req.user)) {
    // Non-admins without a project filter only see projects they belong to.
    const projects = await Project.find({
      $or: [{ createdBy: req.user._id }, { members: req.user._id }],
    }).select("_id");
    filter.project = { $in: projects.map((p) => p._id) };
  }
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (assignedTo) filter.assignedTo = assignedTo;
  if (mine === "true") filter.assignedTo = req.user._id;
  if (search) filter.$text = { $search: search };

  const tasks = await populate(Task.find(filter).sort({ order: 1, createdAt: -1 }));
  res.json({ tasks });
});

exports.get = asyncHandler(async (req, res) => {
  const task = await populate(Task.findById(req.params.id));
  if (!task) throw new ApiError(404, "Task not found");
  const project = await Project.findById(task.project._id || task.project);
  if (!project || !canRead(project, req.user)) throw new ApiError(403, "Forbidden");
  res.json({ task });
});

exports.create = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.body.project);
  if (!project) throw new ApiError(404, "Project not found");
  // Only admins or project creators can create tasks; members cannot create.
  if (!canModify(project, req.user)) throw new ApiError(403, "Forbidden");
  const task = await Task.create({ ...req.body, createdBy: req.user._id });
  const populated = await populate(Task.findById(task._id));
  res.status(201).json({ task: populated });
});

exports.update = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) throw new ApiError(404, "Task not found");
  const project = await Project.findById(task.project);
  if (!project) throw new ApiError(404, "Project not found");

  const isProjectAdmin = canModify(project, req.user);
  const isAssignee = task.assignedTo && task.assignedTo.toString() === req.user._id.toString();

  // Members may only update status of tasks assigned to them.
  if (!isProjectAdmin) {
    if (!isAssignee) throw new ApiError(403, "Forbidden");
    const allowedKeys = new Set(["status", "order"]);
    for (const key of Object.keys(req.body)) {
      if (!allowedKeys.has(key)) {
        throw new ApiError(403, `Members may only change: ${[...allowedKeys].join(", ")}`);
      }
    }
  }

  Object.assign(task, req.body);
  await task.save();
  const populated = await populate(Task.findById(task._id));
  res.json({ task: populated });
});

exports.remove = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) throw new ApiError(404, "Task not found");
  const project = await Project.findById(task.project);
  if (!project) throw new ApiError(404, "Project not found");
  if (!canModify(project, req.user)) throw new ApiError(403, "Forbidden");
  await Promise.all([
    Task.deleteOne({ _id: task._id }),
    Comment.deleteMany({ task: task._id }),
  ]);
  res.status(204).end();
});

exports.listComments = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) throw new ApiError(404, "Task not found");
  const project = await Project.findById(task.project);
  if (!project || !canRead(project, req.user)) throw new ApiError(403, "Forbidden");
  const comments = await Comment.find({ task: task._id })
    .populate("author", "name email role")
    .sort({ createdAt: 1 });
  res.json({ comments });
});

exports.addComment = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) throw new ApiError(404, "Task not found");
  const project = await Project.findById(task.project);
  if (!project || !canRead(project, req.user)) throw new ApiError(403, "Forbidden");
  const comment = await Comment.create({
    task: task._id,
    author: req.user._id,
    message: req.body.message,
  });
  const populated = await Comment.findById(comment._id).populate(
    "author",
    "name email role"
  );
  res.status(201).json({ comment: populated });
});
