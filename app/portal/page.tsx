const items = [
  "Giriş sistemi (öğrenci veya veli hesabı)",
  "Ders programı görüntüleme",
  "Devamsızlık ve yoklama takibi",
  "Öğretmen notları ve değerlendirmeler",
  "Ödeme geçmişi ve fatura görüntüleme",
  "Online ödeme (kredi kartı / havale)",
  "Ders kayıt ve iptal talebi"
];

export default function PortalPage() {
  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold">Öğrenci & Veli Paneli</h1>
      <div className="card">
        <ul className="space-y-2 text-zinc-300">
          {items.map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
