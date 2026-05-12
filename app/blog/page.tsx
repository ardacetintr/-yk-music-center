const posts = [
  "Evde günlük 20 dakikalık etkili piyano çalışma rutini",
  "Yeni başlayanlar için doğru gitar seçimi",
  "Çocuklarda müzik eğitiminin bilişsel gelişime etkisi"
];

export default function BlogPage() {
  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold">Blog</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {posts.map((post) => (
          <article key={post} className="card">
            <h2 className="text-xl font-semibold">{post}</h2>
            <p className="mt-2 text-zinc-300">Yakında detaylı içeriklerle yayında.</p>
          </article>
        ))}
      </div>
    </section>
  );
}
