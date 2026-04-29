/* eslint-disable no-console */
const mongoose = require("mongoose");
const env = require("../config/env");
const { connectDB } = require("../config/db");
const User = require("../models/User");
const Project = require("../models/Project");
const Task = require("../models/Task");

async function run() {
  await connectDB();

  await Promise.all([
    User.deleteMany({}),
    Project.deleteMany({}),
    Task.deleteMany({}),
  ]);

  const admin = await User.create({
    name: "Ada Admin",
    email: "admin@example.com",
    password: "Password123",
    role: "admin",
  });
  const member = await User.create({
    name: "Mona Member",
    email: "member@example.com",
    password: "Password123",
    role: "member",
  });

  const project = await Project.create({
    title: "Launch Marketing Site",
    description: "Build and launch v1 of the marketing site.",
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    createdBy: admin._id,
    members: [admin._id, member._id],
  });

  await Task.insertMany([
    {
      title: "Design hero section",
      description: "Wireframe + mockup",
      priority: "high",
      status: "in_progress",
      project: project._id,
      assignedTo: member._id,
      createdBy: admin._id,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Set up CI/CD",
      priority: "medium",
      status: "todo",
      project: project._id,
      assignedTo: admin._id,
      createdBy: admin._id,
    },
    {
      title: "Write landing copy",
      priority: "low",
      status: "completed",
      project: project._id,
      assignedTo: member._id,
      createdBy: admin._id,
    },
  ]);

  console.log("Seed complete:");
  console.log("  admin@example.com / Password123 (admin)");
  console.log("  member@example.com / Password123 (member)");
  console.log(`  env: ${env.nodeEnv}`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
