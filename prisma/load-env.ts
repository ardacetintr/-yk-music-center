import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

const DEV_DATABASE_URL = "file:./dev.db";
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

export function ensureAppEnv(): void {
  loadRootEnv();

  const strictProd =
    process.env.VERCEL_ENV === "production" || process.env.ENFORCE_STRONG_JWT_SECRET === "1";

  if (!process.env.DATABASE_URL?.trim() && !strictProd) {
    process.env.DATABASE_URL = DEV_DATABASE_URL;
  }

  if (!process.env.JWT_SECRET?.trim() && !strictProd) {
    process.env.JWT_SECRET = DEV_JWT_SECRET;
  }
}

ensureAppEnv();
