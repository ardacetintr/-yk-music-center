import { resolveDatabaseUrl } from "@/lib/database-url";

export function getAdminLoadErrorMessage(): string {
  if (process.env.VERCEL && !resolveDatabaseUrl()) {
    return (
      "Canlı site veritabanı bağlı değil. Vercel → Storage → Postgres → Create Database → " +
      "projeye bağlayın → Redeploy. Yerel öğrencileri aktarmak için VERITABANI-AKTAR.cmd çalıştırın."
    );
  }
  if (!resolveDatabaseUrl()) {
    return (
      "Veritabanı adresi eksik. VERITABANI-AKTAR.cmd dosyasını çalıştırın " +
      "(Vercel Postgres URL .env dosyasına yazılır)."
    );
  }
  return (
    "Veritabanına bağlanılamadı. VERITABANI-AKTAR.cmd çalıştırın veya BASLA.cmd ile yeniden başlatın."
  );
}
