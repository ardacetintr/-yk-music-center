import { execSync } from "node:child_process";

if (!process.env.DATABASE_URL?.trim()) {
  process.env.DATABASE_URL = "file:./prisma/vercel-build.db";
}

execSync("npx prisma generate", { stdio: "inherit", env: process.env });
execSync("npx next build", { stdio: "inherit", env: process.env });
