import { getDatabaseEnvDiagnostics, resolveDatabaseUrl } from "@/lib/database-url";

export function getAdminLoadErrorMessage(): string {
  if (process.env.VERCEL && !resolveDatabaseUrl()) {
    const d = getDatabaseEnvDiagnostics();
    if (d.blockingFileDatabaseUrl && d.postgresKeys.length > 0) {
      return (
        "Neon bağlı görünüyor ama DATABASE_URL hâlâ file:./dev.db (yerel sqlite). " +
        "Vercel → Settings → Environment Variables → DATABASE_URL satırını silin veya Neon postgres adresiyle değiştirin → Redeploy."
      );
    }
    return (
      "Canlı sitede Postgres adresi okunamıyor. Neon projeye bağlı olsa bile Production ortamına " +
      "işlendiğinden emin olun (Integrations → Neon → Projects). Redeploy sonrası /admin → Verileri yükle."
    );
  }
  if (!resolveDatabaseUrl()) {
    return (
      "Veritabanı adresi eksik. Vercel Neon → DATABASE_URL → .env dosyasına yazın, " +
      "VERITABANI-AKTAR.cmd çalıştırın veya okul bilgisayarında BASLA.cmd (localhost/admin)."
    );
  }
  return (
    "Veritabanına bağlanılamadı veya tablolar eksik. Vercel’de Neon + Redeploy yapın; " +
    "admin panelinde «Verileri yükle» düğmesini deneyin."
  );
}
