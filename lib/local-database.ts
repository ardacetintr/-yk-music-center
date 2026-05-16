import { existsSync } from "node:fs";
import { join } from "node:path";
import { applyResolvedDatabaseUrl, isPostgresDatabaseUrl } from "./database-url";

const globalForDb = globalThis as { __ykDbBootstrapped?: boolean };

const LOCAL_SQLITE = join(process.cwd(), "prisma", "dev.db");

export function hasLocalSqliteExport(): boolean {
  return existsSync(LOCAL_SQLITE);
}

/**
 * Yerel geliştirmede prisma import sırasında db push/seed ÇALIŞTIRMAZ
 * (sayfa açılışını dakikalarca kilitleyebilir). Kurulum: BASLA.cmd / setup-local.cmd.
 */
export function bootstrapLocalDatabaseIfNeeded(): void {
  if (process.env.VERCEL === "1" || process.env.VERCEL === "true") return;
  if (process.env.NEXT_PHASE) return;
  if (process.env.npm_lifecycle_event === "build") return;
  if (globalForDb.__ykDbBootstrapped) return;
  globalForDb.__ykDbBootstrapped = true;

  const url = applyResolvedDatabaseUrl();
  if (!url || !isPostgresDatabaseUrl(url)) {
    console.warn(
      "[yk-music-center] Canli site ile ayni veri icin .env dosyasina Postgres URL ekleyin. " +
        "VERITABANI-AKTAR.cmd veya BASLA.cmd"
    );
  }
}
