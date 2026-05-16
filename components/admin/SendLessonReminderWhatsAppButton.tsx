"use client";

import { useState } from "react";
import { prepareLessonReminderWhatsApp } from "@/app/admin/lesson-schedules/actions";
import { openWhatsAppTab } from "@/lib/whatsapp-queue";

type Props = {
  slotId: string;
  recipient: "student" | "teacher";
  /** Tablo satırları için daha küçük etiket ve padding */
  compact?: boolean;
  /** Dört parçalı işlem çubuğunda eşit hücre */
  segment?: boolean;
};

export default function SendLessonReminderWhatsAppButton({
  slotId,
  recipient,
  compact = false,
  segment = false
}: Props) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function onSend() {
    setPending(true);
    setError("");
    try {
      const res = await prepareLessonReminderWhatsApp(slotId, recipient);
      if (!res.ok) {
        setError(res.message);
        return;
      }
      openWhatsAppTab(res.send, `${slotId}_${recipient}`);
    } catch {
      setError("Mesaj hazırlanırken bir hata oluştu.");
    } finally {
      setPending(false);
    }
  }

  const label = segment
    ? recipient === "student"
      ? "Veli WA"
      : "Öğretmen WA"
    : recipient === "student"
      ? compact
        ? "Veli WA"
        : "Veliye WA"
      : compact
        ? "Öğrt. WA"
        : "Öğretmene WA";

  const segmentClass =
    "flex min-h-[22px] w-full items-center justify-center bg-[#25D366] px-0.5 py-0.5 text-center text-[10px] font-medium leading-snug text-white transition hover:bg-[#20BD5A] disabled:cursor-not-allowed disabled:opacity-50";

  if (segment) {
    return (
      <button
        type="button"
        onClick={onSend}
        disabled={pending}
        title={error || undefined}
        className={`${segmentClass} ${error ? "ring-1 ring-red-500/70 ring-inset" : ""}`}
      >
        {pending ? "…" : label}
      </button>
    );
  }

  return (
    <div className={`flex flex-col items-end ${compact ? "gap-0.5" : "gap-1"}`}>
      <button
        type="button"
        onClick={onSend}
        disabled={pending}
        className={
          compact
            ? "rounded border border-emerald-800/70 bg-emerald-950/40 px-1.5 py-0.5 text-[10px] leading-tight text-emerald-100 hover:bg-emerald-900/45 disabled:opacity-50"
            : "rounded-lg border border-emerald-800/80 bg-emerald-950/50 px-2 py-1 text-xs text-emerald-100 hover:bg-emerald-900/50 disabled:opacity-50"
        }
      >
        {pending ? "…" : label}
      </button>
      {error ? (
        <span
          className={`max-w-[10rem] text-right text-red-400 ${compact ? "text-[9px]" : "text-[11px]"}`}
        >
          {error}
        </span>
      ) : null}
    </div>
  );
}
