const { z } = require("zod");

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");

const createProjectSchema = z.object({
  title: z.string().trim().min(2).max(140),
  description: z.string().max(4000).optional().default(""),
  deadline: z.coerce.date().nullable().optional(),
  status: z.enum(["active", "completed"]).optional(),
  members: z.array(objectId).optional().default([]),
});

const updateProjectSchema = createProjectSchema.partial();

const memberSchema = z.object({ userId: objectId });

module.exports = { createProjectSchema, updateProjectSchema, memberSchema, objectId };
