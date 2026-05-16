"use client";

import { useMemo, useState } from "react";
import AccountingStudentTable, {
  type AccountingStudentRow
} from "@/components/admin/AccountingStudentTable";
import { matchesStudentNameSearch } from "@/lib/student-name-search";

type Props = {
  rows: AccountingStudentRow[];
  currentMonthLabel: string;
  title?: string;
};

export default function AccountingStudentsSection({
  rows,
  currentMonthLabel,
  title = "Öğrenci listesi"
}: Props) {
  const [nameQuery, setNameQuery] = useState("");

  const filteredRows = useMemo(() => {
    if (!nameQuery.trim()) return rows;
    return rows.filter((r) => matchesStudentNameSearch(r.name, nameQuery));
  }, [rows, nameQuery]);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-zinc-700/80 bg-zinc-900/50 p-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
          {title}
        </p>
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-zinc-200">Öğrenci ara (ad / soyad)</span>
          <input
            type="search"
            value={nameQuery}
            onChange={(e) => setNameQuery(e.target.value)}
            placeholder="Örn: Ahmet, Yılmaz…"
            className="w-full max-w-md rounded-lg border border-zinc-600 bg-zinc-950 px-4 py-2.5 text-base text-zinc-100 placeholder:text-zinc-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/40"
            autoComplete="off"
            spellCheck={false}
          />
        </label>
        {nameQuery.trim() ? (
          <p className="mt-2 text-xs text-zinc-400">
            {filteredRows.length} / {rows.length} öğrenci listeleniyor
          </p>
        ) : (
          <p className="mt-2 text-xs text-zinc-500">Toplam {rows.length} öğrenci</p>
        )}
      </div>

      {!rows.length ? (
        <p className="text-sm text-zinc-500">Kayıtlı öğrenci yok.</p>
      ) : !filteredRows.length ? (
        <p className="text-sm text-zinc-500">Aramanızla eşleşen öğrenci bulunamadı.</p>
      ) : (
        <AccountingStudentTable rows={filteredRows} currentMonthLabel={currentMonthLabel} />
      )}
    </div>
  );
}
