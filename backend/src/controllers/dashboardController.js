const Project = require("../models/Project");
const Task = require("../models/Task");
const asyncHandler = require("../utils/asyncHandler");

const isAdmin = (u) => u.role === "admin";

exports.stats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const projectFilter = isAdmin(req.user)
    ? {}
    : { $or: [{ createdBy: userId }, { members: userId }] };

  const projects = await Project.find(projectFilter).select("_id status");
  const projectIds = projects.map((p) => p._id);

  const taskFilter = { project: { $in: projectIds } };

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalTasks,
    completedTasks,
    inProgressTasks,
    todoTasks,
    overdueTasks,
    myTasks,
    weekly,
    byPriority,
    perProject,
  ] = await Promise.all([
    Task.countDocuments(taskFilter),
    Task.countDocuments({ ...taskFilter, status: "completed" }),
    Task.countDocuments({ ...taskFilter, status: "in_progress" }),
    Task.countDocuments({ ...taskFilter, status: "todo" }),
    Task.countDocuments({
      ...taskFilter,
      status: { $ne: "completed" },
      dueDate: { $ne: null, $lt: now },
    }),
    Task.countDocuments({ ...taskFilter, assignedTo: userId }),
    Task.aggregate([
      {
        $match: {
          ...taskFilter,
          status: "completed",
          updatedAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Task.aggregate([
      { $match: taskFilter },
      { $group: { _id: "$priority", count: { $sum: 1 } } },
    ]),
    Task.aggregate([
      { $match: taskFilter },
      {
        $group: {
          _id: "$project",
          total: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
        },
      },
      {
        $lookup: {
          from: "projects",
          localField: "_id",
          foreignField: "_id",
          as: "project",
        },
      },
      { $unwind: "$project" },
      {
        $project: {
          _id: 0,
          projectId: "$_id",
          title: "$project.title",
          total: 1,
          completed: 1,
        },
      },
      { $sort: { total: -1 } },
      { $limit: 8 },
    ]),
  ]);

  // Fill the weekly series with zeros for missing days.
  const weeklySeries = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    const found = weekly.find((w) => w._id === key);
    weeklySeries.push({ date: key, completed: found ? found.count : 0 });
  }

  const teamPerformance = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  res.json({
    totals: {
      projects: projects.length,
      activeProjects: projects.filter((p) => p.status === "active").length,
      completedProjects: projects.filter((p) => p.status === "completed").length,
      tasks: totalTasks,
      completedTasks,
      inProgressTasks,
      pendingTasks: todoTasks + inProgressTasks,
      overdueTasks,
      myTasks,
      teamPerformance,
    },
    charts: {
      statusBreakdown: [
        { status: "todo", count: todoTasks },
        { status: "in_progress", count: inProgressTasks },
        { status: "completed", count: completedTasks },
      ],
      priorityBreakdown: ["low", "medium", "high"].map((p) => ({
        priority: p,
        count: byPriority.find((b) => b._id === p)?.count || 0,
      })),
      perProject,
      weekly: weeklySeries,
    },
  });
});
