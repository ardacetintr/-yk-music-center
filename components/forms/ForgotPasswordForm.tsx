"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    setDevCode(null);

    const response = await fetch("/api/auth/forgot-password/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone })
    });
    const data = await response.json().catch(() => ({}));
    setLoading(false);

    if (!response.ok) {
      setError(typeof data.message === "string" ? data.message : "İşlem başarısız.");
      return;
    }

    setMessage(typeof data.message === "string" ? data.message : "");
    if (typeof data.devCode === "string") {
      setDevCode(data.devCode);
    }
    setStep(2);
  }

  async function verifyAndReset(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Şifreler eşleşmiyor.");
      return;
    }
    if (password.length < 6) {
      setError("Şifre en az 6 karakter olmalıdır.");
      return;
    }

    setLoading(true);
    const response = await fetch("/api/auth/forgot-password/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, code, password })
    });
    const data = await response.json().catch(() => ({}));
    setLoading(false);

    if (!response.ok) {
      setError(typeof data.message === "string" ? data.message : "İşlem başarısız.");
      return;
    }

    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="card login-form relative mx-auto flex min-h-[68vh] w-full max-w-xl flex-col items-center justify-center overflow-hidden py-8">
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
      <div className="relative z-10 mx-auto -mt-14 flex w-full max-w-md flex-col items-center space-y-3 px-4 pb-12 text-center">
        <h1 className="mb-1 text-center text-2xl font-semibold text-white">Şifremi unuttum</h1>
        <p className="text-sm text-zinc-400">
          Kayıtlı personel telefon numaranıza SMS ile doğrulama kodu gönderilir; kodu girip yeni şifre
          belirleyebilirsiniz.
        </p>

        {step === 1 ? (
          <form onSubmit={sendCode} className="flex w-full flex-col gap-3">
            <input
              value={phone}
              onChange={(ev) => setPhone(ev.target.value)}
              required
              placeholder="Telefon Numarası"
              className="login-input w-full rounded-lg border border-zinc-700 bg-black px-3 py-2 text-center"
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="login-primary-btn w-full rounded-lg bg-brand-600 px-3 py-2 font-medium hover:bg-brand-500 disabled:opacity-50"
            >
              {loading ? "Gönderiliyor..." : "Doğrulama kodu gönder"}
            </button>
          </form>
        ) : (
          <form onSubmit={verifyAndReset} className="flex w-full flex-col gap-3">
            {message ? (
              <p className="text-xs text-zinc-400">{message}</p>
            ) : null}
            <p className="text-xs text-zinc-500">
              Telefon: <span className="text-zinc-300">{phone}</span>
            </p>
            <input
              value={code}
              onChange={(ev) => setCode(ev.target.value.replace(/\D/g, "").slice(0, 6))}
              required
              inputMode="numeric"
              pattern="\d{6}"
              placeholder="SMS kodu (6 hane)"
              className="login-input w-full rounded-lg border border-zinc-700 bg-black px-3 py-2 text-center tracking-widest"
            />
            <input
              value={password}
              onChange={(ev) => setPassword(ev.target.value)}
              type="password"
              required
              minLength={6}
              placeholder="Yeni şifre"
              className="login-input w-full rounded-lg border border-zinc-700 bg-black px-3 py-2 text-center"
            />
            <input
              value={confirm}
              onChange={(ev) => setConfirm(ev.target.value)}
              type="password"
              required
              minLength={6}
              placeholder="Yeni şifre (tekrar)"
              className="login-input w-full rounded-lg border border-zinc-700 bg-black px-3 py-2 text-center"
            />
            {devCode && (
              <p className="rounded-lg border border-amber-600/50 bg-amber-950/40 px-3 py-2 text-sm text-amber-200">
                Geliştirme: SMS yok. Kod: <strong>{devCode}</strong>
              </p>
            )}
            {error && <p className="text-sm text-red-400">{error}</p>}
            {message && !error && <p className="text-sm text-emerald-400">{message}</p>}
            <button
              type="submit"
              disabled={loading}
              className="login-primary-btn w-full rounded-lg bg-brand-600 px-3 py-2 font-medium hover:bg-brand-500 disabled:opacity-50"
            >
              {loading ? "Kaydediliyor..." : "Şifreyi güncelle"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setError("");
                setMessage("");
                setDevCode(null);
                setCode("");
                setPassword("");
                setConfirm("");
              }}
              className="text-sm text-zinc-400 hover:text-zinc-300"
            >
              Telefonu değiştir
            </button>
          </form>
        )}

        <Link href="/admin/login" className="text-sm text-blue-400 hover:text-blue-300">
          Personel girişine dön
        </Link>
      </div>
      <div className="absolute bottom-0 left-0 right-0 rounded-b-2xl bg-black py-2 text-center text-sm font-semibold text-white">
        Yönetim paneli
      </div>
    </div>
  );
}
