import { execSync } from "node:child_process";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret";
process.env.DATABASE_URL = "file:./test.db";

// Rebuild a clean test database before the suite runs.
const dbFile = new URL("../prisma/test.db", import.meta.url);
if (fs.existsSync(dbFile)) fs.rmSync(dbFile);

// fileURLToPath (not raw .pathname) is required for this to work on
// Windows — .pathname on a file:// URL yields "/C:/Users/..." which is
// not a valid Windows path and breaks execSync's cwd option.
const backendDir = fileURLToPath(new URL("..", import.meta.url));

execSync("npx prisma db push --skip-generate", {
  cwd: backendDir,
  env: { ...process.env },
  stdio: "inherit",
});
