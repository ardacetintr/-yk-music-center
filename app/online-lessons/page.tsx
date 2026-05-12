const items = [
  "Canlı ders (Zoom / Google Meet / dahili sistem)",
  "Ders kayıtlarına erişim (arşiv)",
  "PDF, nota ve video materyal paylaşımı"
];

export default function OnlineLessonsPage() {
  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold">Online Ders Sistemi</h1>
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
