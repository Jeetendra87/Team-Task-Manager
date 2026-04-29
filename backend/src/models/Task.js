const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    description: { type: String, default: "", maxlength: 8000 },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
      index: true,
    },
    status: {
      type: String,
      enum: ["todo", "in_progress", "completed"],
      default: "todo",
      index: true,
    },
    dueDate: { type: Date, default: null, index: true },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

taskSchema.index({ title: "text", description: "text" });

module.exports = mongoose.model("Task", taskSchema);
