import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { applyResolvedDatabaseUrl, isPostgresDatabaseUrl } from "./database-url";

const globalForDb = globalThis as { __ykDbBootstrapped?: boolean };

const LOCAL_SQLITE = join(process.cwd(), "prisma", "dev.db");

export function hasLocalSqliteExport(): boolean {
  return existsSync(LOCAL_SQLITE);
}

/** Yerel: Postgres URL varsa tablo + seed; yoksa sadece uyar. */
export function bootstrapLocalDatabaseIfNeeded(): void {
  if (process.env.VERCEL === "1" || process.env.VERCEL === "true") return;
  if (process.env.NEXT_PHASE) return;
  if (process.env.npm_lifecycle_event === "build") return;
  if (globalForDb.__ykDbBootstrapped) return;
  globalForDb.__ykDbBootstrapped = true;

  const url = applyResolvedDatabaseUrl();
  if (!url || !isPostgresDatabaseUrl(url)) {
    console.warn(
      "[yk-music-center] Canli site ile ayni veri icin .env dosyasina Vercel Postgres URL ekleyin. " +
        "VERITABANI-AKTAR.cmd dosyasina bakin."
    );
    return;
  }

  try {
    const env = { ...process.env, DATABASE_URL: url };
    execSync("npx prisma db push --skip-generate", { cwd: process.cwd(), env, stdio: "pipe" });
    execSync("npm run prisma:seed", { cwd: process.cwd(), env, stdio: "pipe" });
  } catch (err) {
    console.error("[yk-music-center] Veritabani:", err);
  }
}
