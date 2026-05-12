import { teachers } from "@/lib/content";

export default function TeachersPage() {
  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold">Öğretmenlerimiz</h1>
      <p className="text-zinc-300">Alanında uzman eğitmen kadromuzla her yaşa ve seviyeye uygun dersler sunuyoruz.</p>
      <div className="grid gap-5 md:grid-cols-3">
        {teachers.map((teacher) => (
          <article key={teacher.id} className="card">
            <div className="mb-4 h-44 rounded-xl border border-zinc-700 bg-zinc-900/80" />
            <h2 className="text-xl font-semibold">{teacher.name}</h2>
            <p className="mt-2 text-sm text-brand-300">{teacher.specialty}</p>
            <p className="text-sm text-zinc-400">Deneyim: {teacher.experience}</p>
            <p className="mt-3 text-zinc-300">{teacher.bio}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
