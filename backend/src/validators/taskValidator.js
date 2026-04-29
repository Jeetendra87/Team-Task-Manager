const { z } = require("zod");
const { objectId } = require("./projectValidator");

const createTaskSchema = z.object({
  title: z.string().trim().min(2).max(200),
  description: z.string().max(8000).optional().default(""),
  priority: z.enum(["low", "medium", "high"]).optional().default("medium"),
  status: z.enum(["todo", "in_progress", "completed"]).optional().default("todo"),
  dueDate: z.coerce.date().nullable().optional(),
  project: objectId,
  assignedTo: objectId.nullable().optional(),
});

const updateTaskSchema = createTaskSchema.partial().extend({
  order: z.number().int().optional(),
});

const commentSchema = z.object({
  message: z.string().trim().min(1).max(4000),
});

module.exports = { createTaskSchema, updateTaskSchema, commentSchema };
