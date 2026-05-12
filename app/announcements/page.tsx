const announcements = [
  "Yaz dönemi kayıtları başladı.",
  "Piyano atölyesi için kontenjanlar güncellendi.",
  "Mayıs ayı veli bilgilendirme toplantısı 18:00'de."
];

export default function AnnouncementsPage() {
  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold">Duyurular</h1>
      <div className="space-y-3">
        {announcements.map((item) => (
          <article key={item} className="card text-zinc-300">
            {item}
          </article>
        ))}
      </div>
    </section>
  );
}
