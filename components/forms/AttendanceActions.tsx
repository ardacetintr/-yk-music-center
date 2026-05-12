"use client";

import { useState } from "react";

export default function AttendanceActions() {
  const [message, setMessage] = useState("");

  async function trigger(path: string) {
    const response = await fetch(path, { method: "POST" });
    setMessage(response.ok ? "İşlem başarılı." : "İşlem başarısız.");
  }

  return (
    <div className="card space-y-3">
      <h3 className="text-lg font-semibold">Giriş / Çıkış Takibi</h3>
      <div className="flex gap-3">
        <button onClick={() => trigger("/api/attendance/check-in")} className="rounded-lg bg-brand-600 px-4 py-2 hover:bg-brand-500">
          Giriş Yap
        </button>
        <button onClick={() => trigger("/api/attendance/check-out")} className="rounded-lg border border-zinc-700 bg-black px-4 py-2 hover:bg-zinc-900">
          Çıkış Yap
        </button>
      </div>
      {message && <p className="text-sm text-zinc-300">{message}</p>}
    </div>
  );
}
