import { execSync } from "node:child_process";

if (!process.env.DATABASE_URL?.trim() || process.env.DATABASE_URL.startsWith("file:")) {
  process.env.DATABASE_URL = "file:/tmp/yk-vercel-build.db";
}

if (!process.env.JWT_SECRET?.trim()) {
  process.env.JWT_SECRET = "yk-music-center-vercel-default-jwt-secret-32chars";
}

console.log("1/2 prisma generate...");
execSync("npx prisma generate", { stdio: "inherit", env: process.env });

console.log("2/2 next build...");
execSync("npx next build", { stdio: "inherit", env: process.env });

console.log("Build tamam.");
