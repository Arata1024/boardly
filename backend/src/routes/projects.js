import { Router } from "express";
import { z } from "zod";
import prisma from "../utils/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/errorHandler.js";
import { loadOwnedProject } from "../utils/loadOwnedProject.js";

const router = Router();
router.use(requireAuth);

const projectCreateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
});

const projectUpdateSchema = projectCreateSchema.partial();

// List only the current user's projects — this is the tenant-isolation
// boundary: nothing here is ever scoped by anything other than ownerId.
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const projects = await prisma.project.findMany({
      where: { ownerId: req.user.id },
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { tasks: true } } },
    });
    res.json({ projects });
  })
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const data = projectCreateSchema.parse(req.body);
    const project = await prisma.project.create({
      data: { ...data, ownerId: req.user.id },
    });
    res.status(201).json({ project });
  })
);

router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const project = await loadOwnedProject(req.params.id, req.user.id);
    res.json({ project });
  })
);

router.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    await loadOwnedProject(req.params.id, req.user.id);
    const data = projectUpdateSchema.parse(req.body);
    const project = await prisma.project.update({ where: { id: req.params.id }, data });
    res.json({ project });
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    await loadOwnedProject(req.params.id, req.user.id);
    await prisma.project.delete({ where: { id: req.params.id } });
    res.status(204).send();
  })
);

// Tasks nested under a project
router.get(
  "/:id/tasks",
  asyncHandler(async (req, res) => {
    await loadOwnedProject(req.params.id, req.user.id);
    const tasks = await prisma.task.findMany({
      where: { projectId: req.params.id },
      orderBy: { createdAt: "asc" },
    });
    res.json({ tasks });
  })
);

const taskCreateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "DONE"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  dueDate: z.string().datetime().optional().nullable(),
});

router.post(
  "/:id/tasks",
  asyncHandler(async (req, res) => {
    await loadOwnedProject(req.params.id, req.user.id);
    const data = taskCreateSchema.parse(req.body);
    const task = await prisma.task.create({
      data: { ...data, dueDate: data.dueDate ? new Date(data.dueDate) : null, projectId: req.params.id },
    });
    res.status(201).json({ task });
  })
);

// Basic dashboard stats: status breakdown, overdue count, priority spread.
router.get(
  "/:id/stats",
  asyncHandler(async (req, res) => {
    await loadOwnedProject(req.params.id, req.user.id);
    const tasks = await prisma.task.findMany({ where: { projectId: req.params.id } });

    const now = new Date();
    const byStatus = { TODO: 0, IN_PROGRESS: 0, DONE: 0 };
    const byPriority = { LOW: 0, MEDIUM: 0, HIGH: 0, URGENT: 0 };
    let overdue = 0;

    for (const task of tasks) {
      byStatus[task.status]++;
      byPriority[task.priority]++;
      if (task.dueDate && task.status !== "DONE" && new Date(task.dueDate) < now) overdue++;
    }

    res.json({
      total: tasks.length,
      byStatus,
      byPriority,
      overdue,
    });
  })
);

export default router;
