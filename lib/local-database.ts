import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const globalForDb = globalThis as { __ykDbBootstrapped?: boolean };

/** Prisma schema prisma/ altında; dosya yolu mutlak olmalı. */
export function getLocalDatabaseUrl(): string {
  const dbPath = join(process.cwd(), "prisma", "dev.db");
  return `file:${dbPath.replace(/\\/g, "/")}`;
}

export function bootstrapLocalDatabaseIfNeeded(): void {
  if (process.env.VERCEL) return;
  if (globalForDb.__ykDbBootstrapped) return;
  globalForDb.__ykDbBootstrapped = true;

  const dbPath = join(process.cwd(), "prisma", "dev.db");
  if (existsSync(dbPath)) return;

  const url = getLocalDatabaseUrl();
  process.env.DATABASE_URL = url;

  try {
    const env = { ...process.env, DATABASE_URL: url };
    execSync("npx prisma db push --skip-generate", {
      cwd: process.cwd(),
      env,
      stdio: "pipe"
    });
    execSync("npm run prisma:seed", { cwd: process.cwd(), env, stdio: "pipe" });
  } catch (err) {
    console.error("[yk-music-center] Yerel veritabani kurulamadi:", err);
  }
}
