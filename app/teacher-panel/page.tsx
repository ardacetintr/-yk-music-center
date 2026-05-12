const items = [
  "Öğrenci listesi ve detayları",
  "Ders programı yönetimi",
  "Yoklama girişi",
  "Öğrenci değerlendirme / not girişi",
  "Online ders bağlantısı (Zoom / dahili)",
  "Veli ve öğrenci ile mesajlaşma"
];

export default function TeacherPanelPage() {
  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold">Öğretmen Paneli</h1>
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
