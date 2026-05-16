/** Admin sayfalarında veritabanı okunamadığında gösterilecek metin. */
export function getAdminLoadErrorMessage(): string {
  if (process.env.VERCEL) {
    return (
      "Canlı sitede öğrenci/öğretmen listesi için henüz veritabanı bağlı değil. " +
      "Giriş yaptınız; tam panel için okul bilgisayarında BASLA.cmd kullanın " +
      "(http://localhost:3000/admin) veya Vercel → Integrations → Turso ekleyin."
    );
  }
  return (
    "Veritabanı güncellenemedi. BASLA.cmd penceresini kapatıp (Ctrl+C) yeniden açın. " +
    "Sorun sürerse proje klasöründe: npm run db:setup"
  );
}
