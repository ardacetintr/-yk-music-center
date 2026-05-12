const faq = [
  {
    q: "Dersler birebir mi grup mu?",
    a: "Hem birebir hem grup ders seçenekleri mevcuttur."
  },
  {
    q: "Online ders sistemi nasıl çalışıyor?",
    a: "Öğretmen panelinden oluşturulan bağlantılarla canlı derse giriş yapılır."
  },
  {
    q: "Ödeme seçenekleri neler?",
    a: "Kredi kartı, havale/EFT ve dönemlik ödeme planları desteklenir."
  }
];

export default function FaqPage() {
  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold">Sık Sorulan Sorular</h1>
      <div className="space-y-3">
        {faq.map((item) => (
          <article key={item.q} className="card">
            <h2 className="text-lg font-semibold">{item.q}</h2>
            <p className="mt-2 text-zinc-300">{item.a}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
