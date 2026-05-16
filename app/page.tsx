import Image from "next/image";
import Link from "next/link";
import HomeWelcome from "@/components/HomeWelcome";

export default function HomePage() {
  return (
    <section className="space-y-6">
      <HomeWelcome />
      <div className="relative z-10 space-y-6">
        <div className="card hero-card hero-apple relative overflow-hidden py-24">
          <Image
            src="/Gemini_Generated_Image_616kg5616kg5616k.png"
            alt="Müzik sınıfı"
            fill
            sizes="(max-width: 768px) 100vw, 1152px"
            quality={70}
            className="hero-image object-cover opacity-30"
            priority
          />
          <div className="hero-overlay absolute inset-0 bg-black/30" />
          <div className="relative z-10 text-center">
            <p className="mx-auto inline-flex rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-white/90">
              Tempo Bilgi Sistemi
            </p>
            <h1 className="mx-auto mt-4 max-w-4xl text-4xl font-semibold tracking-tight md:text-6xl">
              Eğitimi Bir Adım İleri Taşıyoruz
            </h1>
            <div className="hero-info-box mx-auto mt-8 max-w-4xl rounded-3xl border border-white/25 bg-black/55 p-7 text-left">
              <h2 className="hero-info-title text-center text-2xl font-semibold text-white">
                Karşınızda <span className="text-brand-500">Tempo</span> Bilgi Sistemi!
              </h2>
              <p className="mt-3 text-zinc-200 font-semibold">
                Tempo ile öğrenciler, veliler ve öğretmenler için aldığınız hizmet ve eğitim için aradığınız tüm
                bilgiler her daim elinizin altında.
              </p>
              <ul className="mt-3 space-y-3 text-zinc-200">
                <li>• Öğrenciler ders saatlerine ve ders içeriklerine erişim sağlayabilir.</li>
                <li>
                  • Veliler öğrencisinin kurs katılım ve devam bilgilerine, ders saatlerine, öğretmen bilgilerine ve
                  erişim sağlayabilir.
                </li>
                <li>• Öğretmenlerimiz, Tempo bilgi sistemimiz üzerinden haftalık ders programlarına erişebilir.</li>
              </ul>
              <div className="mt-4 flex justify-end">
                <Link
                  href="/register/student"
                  className="inline-flex items-center gap-2 text-lg font-medium text-brand-500 transition hover:text-brand-400"
                >
                  Hemen kaydolun
                  <span aria-hidden>→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <article className="card">
            <h2 className="mb-3 text-2xl font-semibold">Duyurular</h2>
            <p className="text-zinc-300">
              Yeni dönem kayıtları, etkinlik tarihleri ve kurum içi bilgilendirmeler bu alanda paylaşılacak.
            </p>
          </article>
          <article className="card">
            <h2 className="mb-3 text-2xl font-semibold">Blog</h2>
            <p className="text-zinc-300">
              Müzik eğitimi, pratik önerileri, enstrüman bakımı ve başarı hikayeleri için blog içerikleri burada olacak.
            </p>
          </article>
        </div>
        <div className="card">
          <h2 className="mb-2 text-2xl font-semibold">Öykü Music Center Ankara</h2>
          <p className="mb-4 text-zinc-300">
            Kardelen Mah. 2091 Cad. Aşağı Emekevler Sitesi No: 4/3, Batıkent - Yenimahalle - Ankara
          </p>
          <div className="overflow-hidden rounded-xl border border-zinc-800">
            <iframe
              title="Öykü Music Center Ankara Konumu"
              src="https://www.google.com/maps?q=Kardelen%20Mah.%202091%20Cad.%20Asagi%20Emekevler%20Sitesi%20No%204%2F3%20Batikent%20Yenimahalle%20Ankara&output=embed"
              className="h-[360px] w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
