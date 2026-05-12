"use client";

import { useState } from "react";

export default function StudentRegistrationForm() {
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [formKey, setFormKey] = useState(0);

  async function onSubmit(formData: FormData) {
    setMessage("");
    setIsError(false);
    const body = Object.fromEntries(formData.entries());
    const response = await fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    const data = await response.json().catch(() => ({}));
    if (response.ok) {
      setMessage("Kayıt oluşturuldu.");
      setIsError(false);
      setFormKey((k) => k + 1);
    } else {
      setMessage(typeof data.message === "string" ? data.message : "Kayıt oluşturulamadı.");
      setIsError(true);
    }
  }

  return (
    <div className="card max-w-2xl space-y-3">
      <h2 className="text-xl font-semibold">Öğrenci Kayıt Formu</h2>
      {message ? (
        <p
          className={`rounded-lg border px-3 py-2 text-sm ${
            isError
              ? "border-red-900/60 bg-red-950/50 text-red-200"
              : "border-emerald-900/60 bg-emerald-950/50 text-emerald-200"
          }`}
        >
          {message}
        </p>
      ) : null}
      <form key={formKey} action={onSubmit} className="space-y-3">
        <input name="name" required placeholder="Ad Soyad" className="w-full rounded-lg border border-zinc-700 bg-black px-3 py-2" />
        <input name="instrument" required placeholder="Enstrüman" className="w-full rounded-lg border border-zinc-700 bg-black px-3 py-2" />
        <input
          name="parentName"
          placeholder="Veli adı soyadı (isteğe bağlı)"
          className="w-full rounded-lg border border-zinc-700 bg-black px-3 py-2"
        />
        <input
          name="parentPhone"
          type="tel"
          required
          placeholder="Veli telefon numarası (zorunlu)"
          className="w-full rounded-lg border border-zinc-700 bg-black px-3 py-2"
        />
        <button type="submit" className="rounded-lg bg-brand-600 px-4 py-2 hover:bg-brand-500">
          Kaydet
        </button>
      </form>
    </div>
  );
}
