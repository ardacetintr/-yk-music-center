import "../prisma/load-env";

/** Giriş öncesi veritabanı hazır mı? */
export function getDatabaseEnvProblem(): string | null {
  const url = process.env.DATABASE_URL?.trim();

  if (!url) {
    if (process.env.VERCEL) {
      return (
        "Canlı site henüz hazır değil. Vercel projenizde Storage veya Turso entegrasyonu " +
        "ekleyip yeniden deploy edin. Detay: CANLI-SITE.cmd"
      );
    }
    return "BASLA.cmd dosyasına çift tıklayıp sunucuyu başlatın, sonra tekrar deneyin.";
  }

  if (process.env.VERCEL && url.startsWith("file:")) {
    return "Canlı site için okul bilgisayarındaki dosya veritabanı kullanılamaz. CANLI-SITE.cmd dosyasına bakın.";
  }

  if (url.startsWith("libsql:") && !process.env.DATABASE_AUTH_TOKEN?.trim()) {
    return "Veritabanı token eksik. Vercel'de Turso entegrasyonunu bağlayın veya CANLI-SITE.cmd.";
  }

  return null;
}
