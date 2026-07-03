import { PrismaClient } from "@prisma/client";

// Reuse a single client instance (important with --watch / hot reload,
// otherwise each reload opens a new SQLite connection).
const prisma = globalThis.__prisma__ ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalThis.__prisma__ = prisma;

export default prisma;
