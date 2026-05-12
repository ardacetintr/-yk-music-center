import Link from "next/link";
import { instruments } from "@/lib/content";

export default function InstrumentsPage() {
  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold">Enstrümanlar ve Dersler</h1>
      <p className="text-zinc-300">Her enstrüman için ayrı müfredat, seviye takibi ve öğretmen desteği.</p>
      <div className="grid gap-4 md:grid-cols-2">
        {instruments.map((item) => (
          <Link key={item.slug} href={`/instruments/${item.slug}`} className="card block">
            <h2 className="text-xl font-semibold">{item.name}</h2>
            <p className="mt-2 text-zinc-300">{item.description}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
