import { existsSync, readFileSync } from "fs";
import { resolve } from "path";
import { bootstrapLocalDatabaseIfNeeded, getLocalDatabaseUrl } from "../lib/local-database";

const DEV_JWT_SECRET = "yk-music-center-dev-secret-min-32-chars-change-in-production";

/** tsx ile doğrudan seed çalıştırılırken Next.js .env yüklemez; kök .env okunur. */
export function loadRootEnv(): void {
  loadEnvFile(".env");
  loadEnvFile(".env.local");
}

function loadEnvFile(filename: string) {
  const envPath = resolve(process.cwd(), filename);
  if (!existsSync(envPath)) return;
  const lines = readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

/** Vercel entegrasyonlarının verdiği isimleri tek forma toplar. */
function normalizeDatabaseEnv(): void {
  if (!process.env.DATABASE_URL?.trim()) {
    const url =
      process.env.TURSO_DATABASE_URL ??
      process.env.TURSO_LIBSQL_URL ??
      process.env.POSTGRES_PRISMA_URL ??
      process.env.POSTGRES_URL;
    if (url?.trim()) process.env.DATABASE_URL = url.trim();
  }

  if (!process.env.DATABASE_AUTH_TOKEN?.trim()) {
    const token = process.env.TURSO_AUTH_TOKEN;
    if (token?.trim()) process.env.DATABASE_AUTH_TOKEN = token.trim();
  }
}

export function ensureAppEnv(): void {
  loadRootEnv();
  normalizeDatabaseEnv();

  const strictProd =
    process.env.VERCEL_ENV === "production" || process.env.ENFORCE_STRONG_JWT_SECRET === "1";

  if (!process.env.VERCEL) {
    const url = process.env.DATABASE_URL?.trim() ?? "";
    if (!url || url.startsWith("file:")) {
      process.env.DATABASE_URL = getLocalDatabaseUrl();
    }
    bootstrapLocalDatabaseIfNeeded();
  } else {
    const url = process.env.DATABASE_URL?.trim() ?? "";
    if (!url || url.startsWith("file:")) {
      // Vercel'de eski file:./dev.db ayari admin girisini bozar; admin DB kullanmaz.
      process.env.DATABASE_URL = "file:/tmp/yk-vercel-no-db.db";
    }
  }

  if (!process.env.JWT_SECRET?.trim() && !strictProd) {
    process.env.JWT_SECRET = DEV_JWT_SECRET;
  }
}

ensureAppEnv();
