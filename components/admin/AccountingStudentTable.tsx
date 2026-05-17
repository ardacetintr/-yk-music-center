"use client";

import { useMemo } from "react";
import { formatTurkishMoney } from "@/lib/money";
import { openWhatsAppTab } from "@/lib/whatsapp-queue";
import type { WhatsAppSendPayload } from "@/lib/whatsapp-url";

export type AccountingStudentRow = {
  id: string;
  name: string;
  instrument: string;
  parentName: string | null;
  parentPhoneDisplay: string;
  hasParentPhone: boolean;
  waReminder: WhatsAppSendPayload | null;
  paymentDueDay: number;
  courseFee: number | null;
  courseStartDate: string | null;
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
      <table className="w-full min-w-[56rem] text-left text-sm">
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
            <th className="px-2 py-2 font-medium">Kurs ücreti</th>
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
  const rowHighlight = row.isDueReached && !row.isPaid ? "bg-amber-950/20" : "";

  function sendWhatsApp() {
    if (!row.waReminder) return;
    openWhatsAppTab(row.waReminder, row.id);
  }

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
      <td className="px-2 py-3 align-top tabular-nums text-zinc-200">
        {row.courseFee != null && row.courseFee > 0 ? (
          formatTurkishMoney(row.courseFee)
        ) : (
          <span className="text-zinc-600">—</span>
        )}
      </td>
      <td className="px-2 py-3 align-top text-zinc-300">
        <p className="text-sm">Ayın {row.paymentDueDay}. günü</p>
        {row.courseStartDate ? (
          <p className="mt-0.5 text-[11px] text-zinc-500">Başlangıç: {row.courseStartDate}</p>
        ) : null}
      </td>
      <td className="px-2 py-3 align-top">
        <span
          className={
            row.isPaid
              ? "inline-block rounded-lg border border-emerald-800/80 bg-emerald-950/60 px-3 py-1.5 text-xs font-semibold text-emerald-200"
              : "inline-block rounded-lg border border-red-900/80 bg-red-950/50 px-3 py-1.5 text-xs font-semibold text-red-200"
          }
        >
          {row.isPaid ? "Ödendi" : "Ödenmedi"}
        </span>
        {row.isDueReached && !row.isPaid ? (
          <p className="mt-1 text-[11px] text-amber-400/90">Tahsilat günü geldi</p>
        ) : null}
        {!row.isPaid ? (
          <p className="mt-1 text-[10px] text-zinc-600">
            Ödeme kaydı → Ödeme kayıtları sekmesi
          </p>
        ) : null}
      </td>
      <td className="px-2 py-3 align-top text-right">
        <button
          type="button"
          onClick={sendWhatsApp}
          disabled={!row.hasParentPhone}
          title={
            row.hasParentPhone
              ? "Veliye ödeme hatırlatması (WhatsApp)"
              : "Veli telefonu gerekli"
          }
          className="rounded-lg bg-[#25D366] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#20BD5A] disabled:cursor-not-allowed disabled:opacity-40"
        >
          WhatsApp
        </button>
      </td>
    </tr>
  );
}
