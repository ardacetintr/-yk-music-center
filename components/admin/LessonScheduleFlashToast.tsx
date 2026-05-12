"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

const MESSAGES: Record<string, string> = {
  created: "Ders satırı oluşturuldu.",
  updated: "Ders kaydı güncellendi.",
  deleted: "Ders kaydı silindi."
};

function normalizeToast(raw: string | undefined): string | undefined {
  if (!raw || typeof raw !== "string") return undefined;
  const k = raw.trim();
  return MESSAGES[k] ? k : undefined;
}

type Props = {
  toastKey?: string;
};

export default function LessonScheduleFlashToast({ toastKey }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const key = normalizeToast(toastKey);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!key) return;
    setMsg(MESSAGES[key]);
    router.replace(pathname, { scroll: false });
  }, [key, pathname, router]);

  useEffect(() => {
    if (!msg) return;
    const t = window.setTimeout(() => setMsg(null), 4200);
    return () => window.clearTimeout(t);
  }, [msg]);

  if (!msg) return null;

  return (
    <div
      role="status"
      className="fixed bottom-6 left-1/2 z-[100] max-w-[min(92vw,24rem)] -translate-x-1/2 rounded-xl border border-brand-500/40 bg-zinc-950/95 px-4 py-3 text-center text-sm text-zinc-100 shadow-2xl backdrop-blur-sm animate-[welcomeFadeUp_0.35s_ease-out_forwards]"
    >
      {msg}
    </div>
  );
}
