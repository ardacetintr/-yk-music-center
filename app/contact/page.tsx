export default function ContactPage() {
  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold">İletişim</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="card space-y-3 text-zinc-300">
          <p><strong>Adres:</strong> İstanbul / Türkiye</p>
          <p><strong>Telefon:</strong> +90 555 000 00 00</p>
          <p><strong>E-posta:</strong> iletisim@oykumusiccenter.com</p>
          <p><strong>Çalışma Saatleri:</strong> 09:00 - 21:00</p>
        </div>
        <form className="card space-y-3">
          <input placeholder="Ad Soyad" className="w-full rounded-lg border border-zinc-700 bg-black px-3 py-2" />
          <input placeholder="E-posta" className="w-full rounded-lg border border-zinc-700 bg-black px-3 py-2" />
          <textarea placeholder="Mesajınız" className="h-32 w-full rounded-lg border border-zinc-700 bg-black px-3 py-2" />
          <button type="button" className="rounded-lg bg-brand-600 px-4 py-2 hover:bg-brand-500">Gönder</button>
        </form>
      </div>
    </section>
  );
}
