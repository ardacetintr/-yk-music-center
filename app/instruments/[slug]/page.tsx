import { notFound } from "next/navigation";
import { instruments } from "@/lib/content";

export default async function InstrumentDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const instrument = instruments.find((item) => item.slug === slug);
  if (!instrument) notFound();

  return (
    <section className="space-y-6">
      <h1 className="text-4xl font-bold">{instrument.name} Dersi</h1>
      <div className="card space-y-4">
        <p className="text-zinc-300">{instrument.description}</p>
        <ul className="space-y-2 text-zinc-300">
          <li>• Haftalık birebir veya grup ders seçenekleri</li>
          <li>• Düzenli performans değerlendirmesi</li>
          <li>• Konser ve atölye katılım fırsatları</li>
        </ul>
      </div>
    </section>
  );
}
