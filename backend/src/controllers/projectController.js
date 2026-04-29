const Project = require("../models/Project");
const Task = require("../models/Task");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const isAdmin = (user) => user.role === "admin";

// Caller may view projects they created OR are a member of (admins see all).
function visibilityFilter(user) {
  if (isAdmin(user)) return {};
  return { $or: [{ createdBy: user._id }, { members: user._id }] };
}

const populate = (q) =>
  q
    .populate("createdBy", "name email role")
    .populate("members", "name email role");

exports.list = asyncHandler(async (req, res) => {
  const { search, status } = req.query;
  const filter = { ...visibilityFilter(req.user) };
  if (status) filter.status = status;
  if (search) filter.$text = { $search: search };
  const projects = await populate(Project.find(filter).sort({ createdAt: -1 }));
  res.json({ projects });
});

exports.get = asyncHandler(async (req, res) => {
  const project = await populate(Project.findById(req.params.id));
  if (!project) throw new ApiError(404, "Project not found");
  if (!canRead(project, req.user)) throw new ApiError(403, "Forbidden");
  res.json({ project });
});

exports.create = asyncHandler(async (req, res) => {
  const data = req.body;
  // Ensure creator is always a member.
  const members = Array.from(
    new Set([...(data.members || []).map(String), req.user._id.toString()])
  );
  const project = await Project.create({
    ...data,
    members,
    createdBy: req.user._id,
  });
  const populated = await populate(Project.findById(project._id));
  res.status(201).json({ project: populated });
});

exports.update = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw new ApiError(404, "Project not found");
  if (!canModify(project, req.user)) throw new ApiError(403, "Forbidden");
  Object.assign(project, req.body);
  await project.save();
  const populated = await populate(Project.findById(project._id));
  res.json({ project: populated });
});

exports.remove = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw new ApiError(404, "Project not found");
  if (!canDelete(project, req.user)) throw new ApiError(403, "Forbidden");
  await Promise.all([
    Project.deleteOne({ _id: project._id }),
    Task.deleteMany({ project: project._id }),
  ]);
  res.status(204).end();
});

exports.addMember = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw new ApiError(404, "Project not found");
  if (!canModify(project, req.user)) throw new ApiError(403, "Forbidden");
  const { userId } = req.body;
  if (!project.members.some((m) => m.toString() === userId)) {
    project.members.push(userId);
    await project.save();
  }
  const populated = await populate(Project.findById(project._id));
  res.json({ project: populated });
});

exports.removeMember = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) throw new ApiError(404, "Project not found");
  if (!canModify(project, req.user)) throw new ApiError(403, "Forbidden");
  project.members = project.members.filter(
    (m) => m.toString() !== req.params.userId
  );
  await project.save();
  const populated = await populate(Project.findById(project._id));
  res.json({ project: populated });
});

function canRead(project, user) {
  if (isAdmin(user)) return true;
  const uid = user._id.toString();
  return (
    project.createdBy.toString() === uid ||
    project.members.some((m) => m.toString() === uid)
  );
}

function canModify(project, user) {
  if (isAdmin(user)) return true;
  return project.createdBy.toString() === user._id.toString();
}

function canDelete(project, user) {
  // Members never delete projects.
  return isAdmin(user) || project.createdBy.toString() === user._id.toString();
}

module.exports.canRead = canRead;
module.exports.canModify = canModify;
