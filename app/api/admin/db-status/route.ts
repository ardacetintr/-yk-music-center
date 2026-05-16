import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "@/lib/auth";
import { applyResolvedDatabaseUrl, getDatabaseEnvDiagnostics } from "@/lib/database-url";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  applyResolvedDatabaseUrl();
  const env = getDatabaseEnvDiagnostics();

  let studentCount: number | null = null;
  let dbError: string | null = null;

  if (env.resolved) {
    const prisma = new PrismaClient();
    try {
      studentCount = await prisma.student.count();
    } catch (e) {
      dbError = e instanceof Error ? e.message : "Bağlantı hatası";
    } finally {
      await prisma.$disconnect();
    }
  }

  let hint = "";
  if (!env.resolved) {
    if (env.blockingFileDatabaseUrl && env.postgresKeys.length) {
      hint =
        "Neon bağlı görünüyor ama DATABASE_URL hâlâ file:./dev.db. Vercel → Settings → Environment Variables → DATABASE_URL satırını silin veya Neon postgres adresiyle değiştirin → Redeploy.";
    } else if (env.postgresKeys.length) {
      hint = "Postgres anahtarları var ama çözülemedi. Redeploy deneyin.";
    } else {
      hint =
        "Production'da postgres env yok. Vercel → Environment Variables → YK_DATABASE_URL = green-star postgresql adresi (Production) → Redeploy.";
    }
  } else if (studentCount === 0) {
    hint = "Bağlantı tamam; öğrenci yok. Admin panelinde «Verileri yükle» düğmesine basın.";
  }

  return NextResponse.json({
    ok: true,
    env,
    studentCount,
    dbError,
    hint
  });
}
