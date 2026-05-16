import { execSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";
import { applyResolvedDatabaseUrl, resolveDatabaseUrl } from "@/lib/database-url";
import { hasLocalDbExport, importLocalDbExport } from "@/prisma/import-local-export";

const globalForBootstrap = globalThis as { __ykProdDbBootstrapped?: boolean };

/** Canlıda Neon bağlı ama tablo/veri yoksa bir kez şema + 96 öğrenci import. */
export async function bootstrapProductionDatabaseIfNeeded(): Promise<void> {
  const onVercel = process.env.VERCEL === "1" || process.env.VERCEL === "true";
  if (!onVercel || globalForBootstrap.__ykProdDbBootstrapped) return;
  globalForBootstrap.__ykProdDbBootstrapped = true;

  applyResolvedDatabaseUrl();
  if (!resolveDatabaseUrl() || !hasLocalDbExport()) return;

  const prisma = new PrismaClient();
  try {
    let count = 0;
    try {
      count = await prisma.student.count();
    } catch {
      try {
        execSync("npx prisma db push --skip-generate --accept-data-loss", {
          cwd: process.cwd(),
          env: process.env,
          stdio: "pipe"
        });
        count = await prisma.student.count();
      } catch (e) {
        console.error("[yk-music-center] db push:", e);
        return;
      }
    }

    if (count > 0) return;

    const result = await importLocalDbExport(prisma);
    if (result) {
      console.log(
        `[yk-music-center] Canli import: ${result.students} ogrenci, ${result.teachers} ogretmen`
      );
    }
  } finally {
    await prisma.$disconnect();
  }
}
