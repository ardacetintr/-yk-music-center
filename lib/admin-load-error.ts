import { resolveDatabaseUrl } from "@/lib/database-url";

export function getAdminLoadErrorMessage(): string {
  if (process.env.VERCEL && !resolveDatabaseUrl()) {
    return (
      "Canlı sitede veritabanı bağlı değil (Neon Postgres gerekir, Turso değil). " +
      "Vercel → Integrations → Neon kurun ve projeye bağlayın. " +
      "Settings → Environment Variables: DATABASE_URL=file:./dev.db varsa silin → Redeploy. " +
      "Sonra /admin sayfasını yenileyin; öğrenciler otomatik yüklenir."
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
