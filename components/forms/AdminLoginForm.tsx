"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function AdminLoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(formData: FormData) {
    setLoading(true);
    setError("");

    const body = {
      phone: String(formData.get("phone") || ""),
      password: String(formData.get("password") || "")
    };

    const response = await fetch("/api/auth/login", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    setLoading(false);

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      setError(
        typeof data.message === "string"
          ? data.message
          : "Giriş başarısız. Bilgileri kontrol edin."
      );
      return;
    }

    const role = typeof data.role === "string" ? data.role : "";
    if (role === "ADMIN") {
      router.push("/hosgeldin");
    } else {
      router.push("/dashboard");
    }
    router.refresh();
  }

  return (
    <form
      action={onSubmit}
      className="card login-form relative mx-auto flex min-h-[68vh] w-full max-w-xl flex-col items-center justify-center overflow-hidden py-8"
    >
      <div className="pointer-events-none absolute -top-5 w-full max-w-md px-4">
        <Image
          src="/Adobe Express - file.png"
          alt="Tempo OBS"
          width={220}
          height={72}
          className="login-tempo-logo mx-auto h-auto w-[230px]"
          priority
        />
      </div>
      <div className="relative z-10 mx-auto -mt-14 flex w-full max-w-md flex-col items-center space-y-3 pb-12 text-center">
        <h1 className="-mt-1 mb-0 text-center text-2xl font-semibold text-white">Giriş</h1>
        <input
          name="phone"
          required
          autoComplete="username"
          placeholder="Telefon Numarası"
          className="login-input w-full rounded-lg border border-zinc-700 bg-black px-3 py-2 text-center"
        />
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Şifre (yalnızca yönetici hesabı için)"
          className="login-input w-full rounded-lg border border-zinc-700 bg-black px-3 py-2 text-center"
        />
        {error && <p className="text-center text-sm text-red-400">{error}</p>}
        <button
          disabled={loading}
          className="login-primary-btn w-full rounded-lg bg-brand-600 px-3 py-2 font-medium hover:bg-brand-500 disabled:opacity-50"
        >
          {loading ? "Giriş yapılıyor..." : "Giriş"}
        </button>
        <Link href="/admin/forgot-password" className="text-sm text-blue-400 hover:text-blue-300">
          Şifremi Unuttum
        </Link>
      </div>
      <div className="absolute bottom-0 left-0 right-0 rounded-b-2xl bg-black py-2 text-center text-sm font-semibold text-white">
        Öğrenci ve personel
      </div>
    </form>
  );
}
