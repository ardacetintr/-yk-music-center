"use client";

import { useState } from "react";
import { isoDateInputValue } from "@/lib/date-input-value";

type Props = {
  studentId: string;
  courseFee: number | null;
  courseStartDate: string | null;
  paymentDueDay: number;
  updateAction: (formData: FormData) => void | Promise<void>;
};

export default function AdminStudentCourseBillingForm({
  studentId,
  courseFee,
  courseStartDate,
  paymentDueDay,
  updateAction
}: Props) {
  const [fee, setFee] = useState(
    courseFee != null && courseFee > 0 ? String(courseFee).replace(".", ",") : ""
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const fd = new FormData(e.currentTarget);
      await updateAction(fd);
      setMessage("Kaydedildi.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Kaydedilemedi.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-lg border border-zinc-800 bg-zinc-950/30 p-3">
      <p className="text-xs font-medium text-zinc-400">Kurs ücreti ve başlangıç</p>
      <input type="hidden" name="studentId" value={studentId} />
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="flex flex-col gap-0.5 text-xs text-zinc-500">
          Kurs ücreti (₺ / ay)
          <input
            name="courseFee"
            value={fee}
            onChange={(e) => setFee(e.target.value)}
            inputMode="decimal"
            placeholder="Örn. 3000"
            className="rounded-lg border border-zinc-700 bg-black px-3 py-1.5 text-sm text-zinc-100"
          />
        </label>
        <label className="flex flex-col gap-0.5 text-xs text-zinc-500">
          Kursa başlangıç tarihi
          <input
            type="date"
            name="courseStartDate"
            defaultValue={isoDateInputValue(courseStartDate)}
            className="rounded-lg border border-zinc-700 bg-black px-3 py-1.5 text-sm text-zinc-100"
          />
        </label>
      </div>
      <p className="text-[11px] text-zinc-500">
        Tahsilat günü: ayın <span className="text-zinc-300">{paymentDueDay}</span>. günü (başlangıç
        tarihine göre)
      </p>
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-brand-700 px-3 py-1.5 text-xs font-medium disabled:opacity-50"
        >
          {saving ? "…" : "Kaydet"}
        </button>
        {message ? (
          <span className={`text-xs ${message === "Kaydedildi." ? "text-emerald-400" : "text-red-400"}`}>
            {message}
          </span>
        ) : null}
      </div>
    </form>
  );
}
