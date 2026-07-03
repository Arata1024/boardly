import { Router } from "express";
import { z } from "zod";
import prisma from "../utils/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { loadOwnedProject } from "../utils/loadOwnedProject.js";

const router = Router();
router.use(requireAuth);

const taskUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  dueDate: z.string().datetime().optional().nullable(),
});

async function loadOwnedTask(taskId, userId) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) {
    const err = new Error("Task not found");
    err.status = 404;
    throw err;
  }
  // Ownership is checked through the parent project, since tasks don't
  // carry an ownerId of their own.
  await loadOwnedProject(task.projectId, userId);
  return task;
}

router.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    await loadOwnedTask(req.params.id, req.user.id);
    const data = taskUpdateSchema.parse(req.body);
    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: { ...data, dueDate: data.dueDate === undefined ? undefined : data.dueDate ? new Date(data.dueDate) : null },
    });
    res.json({ task });
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await loadOwnedTask(req.params.id, req.user.id);
    await prisma.task.delete({ where: { id: req.params.id } });
    res.status(204).send();
  })
);

export default router;
