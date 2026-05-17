"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  deleteStudentMonthlyPayment,
  upsertStudentMonthlyPayment
} from "@/app/admin/accounting/ledger/actions";
import { formatTurkishMoney } from "@/lib/money";
import { useAdminToastOptional } from "@/components/admin/AdminToastProvider";

export type PaymentLedgerRow = {
  id: string;
  studentId: string;
  studentName: string;
  instrument: string;
  paymentMonth: string;
  paymentMonthLabel: string;
  amount: number;
  notes: string | null;
};

export type StudentOption = { id: string; name: string; courseFee: number | null };

type Props = {
  rows: PaymentLedgerRow[];
  students: StudentOption[];
  defaultMonth: string;
  filterMonth: string | null;
};

export default function AccountingPaymentLedger({
  rows,
  students,
  defaultMonth,
  filterMonth
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [amount, setAmount] = useState("");
  const toast = useAdminToastOptional();

  const monthValue = filterMonth ?? defaultMonth;

  function onStudentChange(id: string) {
    setStudentId(id);
    const st = students.find((s) => s.id === id);
    if (st?.courseFee != null && st.courseFee > 0) {
      setAmount(String(st.courseFee).replace(".", ","));
    }
  }

  const filtered = useMemo(() => {
    if (!filterMonth) return rows;
    return rows.filter((r) => r.paymentMonth === filterMonth);
  }, [rows, filterMonth]);

  const monthTotal = useMemo(
    () => filtered.reduce((sum, r) => sum + r.amount, 0),
    [filtered]
  );

  function setMonthFilter(month: string | null) {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    if (month) params.set("month", month);
    else params.delete("month");
    router.push(`/admin/accounting/ledger?${params.toString()}`);
  }

  async function onAdd(formData: FormData) {
    setPending(true);
    setError("");
    try {
      await upsertStudentMonthlyPayment(formData);
      toast?.showToast("payment-saved");
      setStudentId("");
      setAmount("");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Kaydedilemedi.";
      setError(msg);
      toast?.showToast(msg, "error");
    } finally {
      setPending(false);
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Bu ödeme kaydı silinsin mi?")) return;
    setPending(true);
    setError("");
    try {
      const fd = new FormData();
      fd.set("id", id);
      await deleteStudentMonthlyPayment(fd);
      toast?.showToast("payment-deleted");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Silinemedi.";
      setError(msg);
      toast?.showToast(msg, "error");
    } finally {
      setPending(false);
    }
  }

  const byStudent = useMemo(() => {
    const map = new Map<string, PaymentLedgerRow[]>();
    for (const r of filtered) {
      const list = map.get(r.studentId) ?? [];
      list.push(r);
      map.set(r.studentId, list);
    }
    return [...map.entries()].sort((a, b) =>
      (a[1][0]?.studentName ?? "").localeCompare(b[1][0]?.studentName ?? "", "tr")
    );
  }, [filtered]);

  return (
    <div className="space-y-6">
      <section className="card space-y-4">
        <h2 className="text-lg font-semibold">Yeni ödeme kaydı</h2>
        <form action={onAdd} className="grid gap-3 md:grid-cols-2 lg:grid-cols-5 lg:items-end">
          <label className="flex flex-col gap-1 text-xs text-zinc-500">
            Öğrenci
            <select
              name="studentId"
              required
              value={studentId}
              onChange={(e) => onStudentChange(e.target.value)}
              className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
            >
              <option value="">Seçin</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs text-zinc-500">
            Ay
            <input
              type="month"
              name="paymentMonth"
              defaultValue={monthValue}
              required
              className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-zinc-500">
            Tutar (₺)
            <input
              name="amount"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="1500"
              className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-zinc-500 lg:col-span-2">
            Not (isteğe bağlı)
            <input
              name="notes"
              placeholder="Nakit, havale…"
              className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
            />
          </label>
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500 disabled:opacity-50"
          >
            {pending ? "…" : "Kaydet"}
          </button>
        </form>
        {error ? <p className="text-sm text-red-400">{error}</p> : null}
      </section>

      <section className="card space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Ödeme listesi</h2>
            <p className="mt-1 text-sm text-zinc-400">
              {filterMonth ? (
                <>
                  Filtre: <span className="text-zinc-200">{filtered[0]?.paymentMonthLabel ?? filterMonth}</span>
                  {" · "}
                  Toplam: <span className="font-medium text-emerald-400">{formatTurkishMoney(monthTotal)}</span>
                </>
              ) : (
                <>Tüm aylar · {rows.length} kayıt</>
              )}
            </p>
          </div>
          <div className="flex flex-wrap items-end gap-2">
            <label className="flex flex-col gap-1 text-xs text-zinc-500">
              Aya göre filtrele
              <input
                type="month"
                value={filterMonth ?? ""}
                onChange={(e) => setMonthFilter(e.target.value || null)}
                className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100"
              />
            </label>
            {filterMonth ? (
              <button
                type="button"
                onClick={() => setMonthFilter(null)}
                className="rounded-lg border border-zinc-600 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
              >
                Tüm aylar
              </button>
            ) : null}
          </div>
        </div>

        {!filtered.length ? (
          <p className="text-sm text-zinc-500">Bu filtre için kayıt yok.</p>
        ) : filterMonth ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-xs uppercase text-zinc-500">
                  <th className="px-2 py-2">Öğrenci</th>
                  <th className="px-2 py-2">Tutar</th>
                  <th className="px-2 py-2">Not</th>
                  <th className="px-2 py-2 text-right">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80">
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td className="px-2 py-3">
                      <p className="font-medium text-zinc-100">{r.studentName}</p>
                      <p className="text-xs text-zinc-500">{r.instrument}</p>
                    </td>
                    <td className="px-2 py-3 font-medium text-emerald-300">
                      {formatTurkishMoney(r.amount)}
                    </td>
                    <td className="px-2 py-3 text-zinc-400">{r.notes ?? "—"}</td>
                    <td className="px-2 py-3 text-right">
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => onDelete(r.id)}
                        className="text-xs text-red-400 hover:text-red-300 disabled:opacity-50"
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="space-y-6">
            {byStudent.map(([studentId, payments]) => (
              <div key={studentId} className="rounded-lg border border-zinc-800 bg-zinc-950/30">
                <div className="border-b border-zinc-800 px-3 py-2">
                  <p className="font-medium text-zinc-100">{payments[0].studentName}</p>
                  <p className="text-xs text-zinc-500">{payments[0].instrument}</p>
                </div>
                <ul className="divide-y divide-zinc-800/60">
                  {payments
                    .sort((a, b) => b.paymentMonth.localeCompare(a.paymentMonth))
                    .map((p) => (
                      <li
                        key={p.id}
                        className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm"
                      >
                        <span className="text-zinc-400">{p.paymentMonthLabel}</span>
                        <span className="font-medium text-emerald-300">
                          {formatTurkishMoney(p.amount)}
                        </span>
                        {p.notes ? (
                          <span className="w-full text-xs text-zinc-500">{p.notes}</span>
                        ) : null}
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() => onDelete(p.id)}
                          className="text-xs text-red-400 hover:text-red-300"
                        >
                          Sil
                        </button>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
