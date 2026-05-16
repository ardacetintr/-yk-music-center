import { getDatabaseEnvDiagnostics, resolveDatabaseUrl } from "@/lib/database-url";

export function getAdminLoadErrorMessage(): string {
  if (process.env.VERCEL && !resolveDatabaseUrl()) {
    const d = getDatabaseEnvDiagnostics();
    if (d.blockingFileDatabaseUrl && d.postgresKeys.length > 0) {
      return (
        "Neon bağlı ama DATABASE_URL kilitli ve hâlâ file:./dev.db. " +
        "Vercel → Storage → Neon → Projects: projeyi çıkarıp tekrar bağlayın → Redeploy. " +
        "(Kilitli satırı elle silmeye gerek yok; Neon yeniden bağlanınca postgresql olur.)"
      );
    }
    if (d.postgresKeys.length === 0) {
      return (
        "Canlı sitede hiç Postgres adresi yok (veri Neon'da duruyor, Vercel bağlanmıyor). " +
        "Vercel → Settings → Environment Variables → Add → Name: YK_DATABASE_URL → " +
        "Value: .env dosyanızdaki postgresql://... (green-star) → sadece Production → Save → Redeploy."
      );
    }
    return (
      "Canlı sitede Postgres okunamıyor. Integrations → Neon → Projects → Production işaretli olsun " +
      "veya YK_DATABASE_URL ekleyin (yukarıdaki gibi) → Redeploy."
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
