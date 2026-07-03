import prisma from "./prisma.js";

// Loads a project by id and throws a 404/403-shaped error if it doesn't
// exist or doesn't belong to the requesting user. Centralized here so every
// route that touches a project (or its tasks) enforces tenant isolation the
// same way, rather than each handler re-implementing the ownership check.
export async function loadOwnedProject(projectId, userId) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });

  if (!project) {
    const err = new Error("Project not found");
    err.status = 404;
    throw err;
  }

  if (project.ownerId !== userId) {
    const err = new Error("You do not have access to this project");
    err.status = 403;
    throw err;
  }

  return project;
}
