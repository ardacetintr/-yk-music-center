"use client";

export default function AdminError({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto max-w-lg rounded-xl border border-red-900/80 bg-red-950/40 px-5 py-6 text-red-100">
      <h2 className="text-lg font-semibold text-white">Yönetim paneli yüklenemedi</h2>
      <p className="mt-2 text-sm leading-relaxed text-red-200/95">{error.message}</p>
      <p className="mt-3 text-xs text-red-300/90">
        Veritabanı hatasıysa proje kökünde{" "}
        <code className="rounded bg-black/40 px-1 py-0.5 font-mono text-[11px]">npx prisma db push</code> çalıştırın.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500"
      >
        Tekrar dene
      </button>
    </div>
  );
}
