"use client";

import { useState } from "react";

export default function TeacherApplicationForm() {
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  async function onSubmit(formData: FormData) {
    setMessage("");
    setIsError(false);
    const body = Object.fromEntries(formData.entries());
    const response = await fetch("/api/teacher-applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const data = await response.json().catch(() => ({}));
    if (response.ok) {
      setMessage("Başvuru alındı.");
      setIsError(false);
    } else {
      setMessage(typeof data.message === "string" ? data.message : "Başvuru gönderilemedi.");
      setIsError(true);
    }
  }

  return (
    <form action={onSubmit} className="card max-w-2xl space-y-3">
      <h2 className="text-xl font-semibold">Öğretmen Başvuru Formu</h2>
      <input name="name" required placeholder="Ad Soyad" className="w-full rounded-lg border border-zinc-700 bg-black px-3 py-2" />
      <input name="email" type="email" required placeholder="E-posta" className="w-full rounded-lg border border-zinc-700 bg-black px-3 py-2" />
      <input name="phone" required placeholder="Telefon" className="w-full rounded-lg border border-zinc-700 bg-black px-3 py-2" />
      <input name="instrument" required placeholder="Enstrüman" className="w-full rounded-lg border border-zinc-700 bg-black px-3 py-2" />
      <input name="experience" required placeholder="Deneyim (yıl)" className="w-full rounded-lg border border-zinc-700 bg-black px-3 py-2" />
      <textarea name="bio" placeholder="Kısa özgeçmiş" className="w-full rounded-lg border border-zinc-700 bg-black px-3 py-2" />
      {message && (
        <p className={`text-sm ${isError ? "text-red-400" : "text-emerald-400"}`}>{message}</p>
      )}
      <button className="rounded-lg bg-brand-600 px-4 py-2 hover:bg-brand-500">Başvur</button>
    </form>
  );
}
