export default function AdminLoading() {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-zinc-400">
      <p className="text-sm">Yönetim paneli yükleniyor…</p>
      <p className="text-xs text-zinc-500">Veritabanından öğrenci listesi alınıyor</p>
    </div>
  );
}
