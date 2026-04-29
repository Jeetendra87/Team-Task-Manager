const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 140 },
    description: { type: String, default: "", maxlength: 4000 },
    deadline: { type: Date, default: null },
    status: {
      type: String,
      enum: ["active", "completed"],
      default: "active",
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    members: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    ],
  },
  { timestamps: true }
);

projectSchema.index({ title: "text", description: "text" });

module.exports = mongoose.model("Project", projectSchema);
