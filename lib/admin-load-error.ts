import { resolveDatabaseUrl } from "@/lib/database-url";

export function getAdminLoadErrorMessage(): string {
  if (process.env.VERCEL && !resolveDatabaseUrl()) {
    return (
      "Canlı site veritabanı bağlı değil. Vercel → Proje → Settings → Environment Variables: " +
      "DATABASE_URL=file:./dev.db varsa SİLİN. Integrations → Neon kurulu olmalı ve projeye bağlı olmalı → Redeploy. " +
      "Yerel öğrenciler deploy ile veya VERITABANI-AKTAR.cmd ile aktarılır."
    );
  }
  if (!resolveDatabaseUrl()) {
    return (
      "Veritabanı adresi eksik. Vercel Neon → DATABASE_URL veya POSTGRES_PRISMA_URL → .env dosyasına yazın, " +
      "VERITABANI-AKTAR.cmd çalıştırın."
    );
  }
  return (
    "Veritabanına bağlanılamadı veya tablolar eksik. Vercel’de Redeploy yapın; yerelde VERITABANI-AKTAR.cmd."
  );
}
