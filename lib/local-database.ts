import { execSync } from "node:child_process";

const globalForDb = globalThis as { __ykDbBootstrapped?: boolean };

/** Prisma: yol schema dosyasına (prisma/) göredir → prisma/dev.db */
export function getLocalDatabaseUrl(): string {
  return "file:./dev.db";
}

/** Yerel geliştirmede şema + seed (BASLA.cmd). */
export function bootstrapLocalDatabaseIfNeeded(): void {
  if (process.env.VERCEL === "1" || process.env.VERCEL === "true") return;
  if (globalForDb.__ykDbBootstrapped) return;
  globalForDb.__ykDbBootstrapped = true;

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
    console.error("[yk-music-center] Yerel veritabani:", err);
  }
}
