import { NextResponse } from "next/server";
import { execSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "@/lib/auth";
import { applyResolvedDatabaseUrl, resolveDatabaseUrl } from "@/lib/database-url";
import { hasLocalDbExport, importLocalDbExport } from "@/prisma/import-local-export";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST() {
  const session = await getServerSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ ok: false, message: "Yetkisiz" }, { status: 401 });
  }

  applyResolvedDatabaseUrl();
  const url = resolveDatabaseUrl();
  if (!url) {
    return NextResponse.json({
      ok: false,
      message:
        "Postgres bağlı değil. Vercel → Integrations → Neon → projeye bağlayın. " +
        "Settings → Environment Variables içinde DATABASE_URL=file:./dev.db varsa silin → Redeploy."
    });
  }

  if (!hasLocalDbExport()) {
    return NextResponse.json({ ok: false, message: "Export dosyası bulunamadı." }, { status: 500 });
  }

  try {
    execSync("npx prisma db push --skip-generate --accept-data-loss", {
      cwd: process.cwd(),
      env: process.env,
      stdio: "pipe"
    });
  } catch (e) {
    console.error("sync-database db push:", e);
    return NextResponse.json({ ok: false, message: "Tablolar oluşturulamadı." }, { status: 500 });
  }

  const prisma = new PrismaClient();
  try {
    const result = await importLocalDbExport(prisma);
    if (!result) {
      return NextResponse.json({ ok: false, message: "Import boş." }, { status: 500 });
    }
    return NextResponse.json({
      ok: true,
      message: `${result.students} öğrenci, ${result.teachers} öğretmen yüklendi.`,
      ...result
    });
  } catch (e) {
    console.error("sync-database import:", e);
    return NextResponse.json({ ok: false, message: "Import başarısız." }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
