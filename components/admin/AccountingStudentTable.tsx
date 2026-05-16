"use client";

import { useMemo, useState } from "react";
import {
  preparePaymentReminderWhatsApp,
  setStudentPaymentPaid,
  updateStudentPaymentDueDay
} from "@/app/admin/accounting/actions";

export type AccountingStudentRow = {
  id: string;
  name: string;
  instrument: string;
  parentName: string | null;
  parentPhoneDisplay: string;
  hasParentPhone: boolean;
  paymentDueDay: number;
  isPaid: boolean;
  isDueReached: boolean;
};

type Props = {
  rows: AccountingStudentRow[];
  currentMonthLabel: string;
  selectable?: boolean;
  selectedIds?: Set<string>;
  onToggleSelect?: (studentId: string, checked: boolean) => void;
  onToggleSelectAll?: (checked: boolean) => void;
};

export default function AccountingStudentTable({
  rows,
  currentMonthLabel,
  selectable = false,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll
}: Props) {
  const selectableWithPhone = useMemo(
    () => rows.filter((r) => r.hasParentPhone),
    [rows]
  );

  const allSelectableChecked =
    selectableWithPhone.length > 0 &&
    selectableWithPhone.every((r) => selectedIds?.has(r.id));

  if (!rows.length) {
    return <p className="text-sm text-zinc-500">Kayıtlı öğrenci yok.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[52rem] text-left text-sm">
        <thead>
          <tr className="border-b border-zinc-800 text-xs uppercase tracking-wide text-zinc-500">
            {selectable ? (
              <th className="w-10 px-2 py-2">
                <input
                  type="checkbox"
                  checked={allSelectableChecked}
                  onChange={(e) => onToggleSelectAll?.(e.target.checked)}
                  className="rounded border-zinc-600"
                  aria-label="Tümünü seç"
                  title="Telefonu olan tümünü seç"
                />
              </th>
            ) : null}
            <th className="px-2 py-2 font-medium">Öğrenci</th>
            <th className="px-2 py-2 font-medium">Veli</th>
            <th className="px-2 py-2 font-medium">Tahsilat günü</th>
            <th className="px-2 py-2 font-medium">{currentMonthLabel}</th>
            <th className="px-2 py-2 text-right font-medium">İşlem</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/80">
          {rows.map((row) => (
            <AccountingRow
              key={row.id}
              row={row}
              selectable={selectable}
              checked={selectedIds?.has(row.id) ?? false}
              onToggleSelect={onToggleSelect}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AccountingRow({
  row,
  selectable,
  checked,
  onToggleSelect
}: {
  row: AccountingStudentRow;
  selectable: boolean;
  checked: boolean;
  onToggleSelect?: (studentId: string, checked: boolean) => void;
}) {
  const [dueDay, setDueDay] = useState(String(row.paymentDueDay));
  const [savingDay, setSavingDay] = useState(false);
  const [togglingPaid, setTogglingPaid] = useState(false);
  const [waPending, setWaPending] = useState(false);
  const [error, setError] = useState("");

  async function saveDueDay() {
    const n = Number(dueDay);
    if (n === row.paymentDueDay) return;
    setSavingDay(true);
    setError("");
    try {
      const fd = new FormData();
      fd.set("studentId", row.id);
      fd.set("paymentDueDay", dueDay);
      await updateStudentPaymentDueDay(fd);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Kaydedilemedi.");
    } finally {
      setSavingDay(false);
    }
  }

  async function togglePaid() {
    setTogglingPaid(true);
    setError("");
    try {
      const fd = new FormData();
      fd.set("studentId", row.id);
      fd.set("paid", row.isPaid ? "0" : "1");
      await setStudentPaymentPaid(fd);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Güncellenemedi.");
    } finally {
      setTogglingPaid(false);
    }
  }

  async function sendWhatsApp() {
    setWaPending(true);
    setError("");
    try {
      const res = await preparePaymentReminderWhatsApp(row.id);
      if (!res.ok) {
        setError(res.message);
        return;
      }
      window.open(res.waUrl, "_blank", "noopener,noreferrer");
    } catch {
      setError("WhatsApp hazırlanamadı.");
    } finally {
      setWaPending(false);
    }
  }

  const rowHighlight = row.isDueReached && !row.isPaid ? "bg-amber-950/20" : "";

  return (
    <tr className={rowHighlight}>
      {selectable ? (
        <td className="px-2 py-3 align-top">
          <input
            type="checkbox"
            checked={checked}
            disabled={!row.hasParentPhone}
            onChange={(e) => onToggleSelect?.(row.id, e.target.checked)}
            className="rounded border-zinc-600 disabled:opacity-30"
            aria-label={`${row.name} seç`}
            title={row.hasParentPhone ? "Seç" : "Veli telefonu yok"}
          />
        </td>
      ) : null}
      <td className="px-2 py-3 align-top">
        <p className="font-medium text-zinc-100">{row.name}</p>
        <p className="text-xs text-zinc-500">{row.instrument}</p>
      </td>
      <td className="px-2 py-3 align-top text-zinc-300">
        {row.parentName ? <p>{row.parentName}</p> : <p className="text-zinc-600">—</p>}
        <p className="text-xs text-zinc-500">{row.parentPhoneDisplay || "Telefon yok"}</p>
      </td>
      <td className="px-2 py-3 align-top">
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500">Her ayın</span>
          <input
            type="number"
            min={1}
            max={31}
            value={dueDay}
            onChange={(e) => setDueDay(e.target.value)}
            onBlur={saveDueDay}
            disabled={savingDay}
            className="w-14 rounded border border-zinc-700 bg-zinc-950 px-2 py-1 text-center text-zinc-100"
            aria-label={`${row.name} tahsilat günü`}
          />
          <span className="text-xs text-zinc-500">. günü</span>
        </div>
      </td>
      <td className="px-2 py-3 align-top">
        <button
          type="button"
          onClick={togglePaid}
          disabled={togglingPaid}
          className={
            row.isPaid
              ? "rounded-lg border border-emerald-800/80 bg-emerald-950/60 px-3 py-1.5 text-xs font-semibold text-emerald-200 hover:bg-emerald-900/50 disabled:opacity-50"
              : "rounded-lg border border-red-900/80 bg-red-950/50 px-3 py-1.5 text-xs font-semibold text-red-200 hover:bg-red-900/45 disabled:opacity-50"
          }
        >
          {togglingPaid ? "…" : row.isPaid ? "Ödendi" : "Ödenmedi"}
        </button>
        {row.isDueReached && !row.isPaid ? (
          <p className="mt-1 text-[11px] text-amber-400/90">Tahsilat günü geldi</p>
        ) : null}
      </td>
      <td className="px-2 py-3 align-top text-right">
        <button
          type="button"
          onClick={sendWhatsApp}
          disabled={waPending || !row.hasParentPhone}
          title={
            row.hasParentPhone
              ? "Veliye ödeme hatırlatması (WhatsApp)"
              : "Veli telefonu gerekli"
          }
          className="rounded-lg bg-[#25D366] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#20BD5A] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {waPending ? "…" : "WhatsApp"}
        </button>
        {error ? <p className="mt-1 text-[11px] text-red-400">{error}</p> : null}
      </td>
    </tr>
  );
}
