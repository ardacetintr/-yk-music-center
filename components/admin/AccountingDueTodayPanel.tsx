"use client";

import { useCallback, useMemo, useState } from "react";
import {
  prepareDueTodayBulkPaymentReminders,
  preparePaymentRemindersForStudentIds,
  type PaymentReminderTarget
} from "@/app/admin/accounting/actions";
import AccountingStudentTable, {
  type AccountingStudentRow
} from "@/components/admin/AccountingStudentTable";

type Props = {
  dueRows: AccountingStudentRow[];
  currentMonthLabel: string;
};

export default function AccountingDueTodayPanel({ dueRows, currentMonthLabel }: Props) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [targets, setTargets] = useState<PaymentReminderTarget[] | null>(null);
  const [queueIndex, setQueueIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const withPhone = useMemo(() => dueRows.filter((r) => r.hasParentPhone), [dueRows]);
  const selectedWithPhone = useMemo(
    () => dueRows.filter((r) => selectedIds.has(r.id) && r.hasParentPhone),
    [dueRows, selectedIds]
  );

  const onToggleSelect = useCallback((studentId: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(studentId);
      else next.delete(studentId);
      return next;
    });
  }, []);

  const onToggleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelectedIds(new Set(withPhone.map((r) => r.id)));
      } else {
        setSelectedIds(new Set());
      }
    },
    [withPhone]
  );

  function resetQueue() {
    setTargets(null);
    setQueueIndex(0);
    setDone(false);
    setError("");
  }

  function startQueue(list: PaymentReminderTarget[]) {
    if (!list.length) {
      setError("Gönderilecek veli yok.");
      return;
    }
    setTargets(list);
    setQueueIndex(0);
    setDone(false);
    window.open(list[0].waUrl, "_blank", "noopener,noreferrer");
  }

  async function sendToAll() {
    setLoading(true);
    resetQueue();
    try {
      const res = await prepareDueTodayBulkPaymentReminders();
      if (!res.ok) {
        setError(res.message);
        return;
      }
      startQueue(res.targets);
    } catch {
      setError("Liste hazırlanamadı.");
    } finally {
      setLoading(false);
    }
  }

  async function sendToSelected() {
    if (!selectedWithPhone.length) {
      setError("En az bir öğrenci seçin (veli telefonu olan).");
      return;
    }
    setLoading(true);
    resetQueue();
    try {
      const res = await preparePaymentRemindersForStudentIds(
        selectedWithPhone.map((r) => r.id)
      );
      if (!res.ok) {
        setError(res.message);
        return;
      }
      if (res.skipped.length) {
        setError(
          `Atlanan: ${res.skipped.map((s) => s.studentName).join(", ")}`
        );
      }
      startQueue(res.targets);
    } catch {
      setError("Seçilenler hazırlanamadı.");
    } finally {
      setLoading(false);
    }
  }

  function openNext() {
    if (!targets?.length) return;
    const next = queueIndex + 1;
    if (next >= targets.length) {
      setDone(true);
      return;
    }
    setQueueIndex(next);
    window.open(targets[next].waUrl, "_blank", "noopener,noreferrer");
  }

  const current = targets?.[queueIndex];
  const total = targets?.length ?? 0;

  if (!dueRows.length) {
    return (
      <section className="card border border-zinc-800 bg-zinc-950/30">
        <h2 className="text-lg font-semibold text-zinc-200">Bugün tahsilat günü gelenler</h2>
        <p className="mt-2 text-sm text-zinc-500">
          Bu ay için tahsilat günü gelmiş ve ödenmemiş öğrenci yok.
        </p>
      </section>
    );
  }

  return (
    <section className="card space-y-4 border border-amber-900/50 bg-amber-950/15">
      <div>
        <h2 className="text-lg font-semibold text-amber-100">Bugün tahsilat günü gelenler</h2>
        <p className="mt-1 text-sm text-zinc-400">
          {dueRows.length} öğrenci · Tahsilat gününü düzenleyebilir, ödeme durumunu işaretleyebilirsiniz.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={sendToAll}
          disabled={loading || withPhone.length === 0}
          className="rounded-xl bg-[#25D366] px-4 py-2 text-sm font-semibold text-white hover:bg-[#20BD5A] disabled:opacity-50"
        >
          {loading ? "…" : `Hepsine WhatsApp (${withPhone.length})`}
        </button>
        <button
          type="button"
          onClick={sendToSelected}
          disabled={loading || selectedWithPhone.length === 0}
          className="rounded-xl border border-[#25D366]/70 bg-[#25D366]/10 px-4 py-2 text-sm font-semibold text-[#5ee87a] hover:bg-[#25D366]/20 disabled:opacity-50"
        >
          Seçilenlere WhatsApp ({selectedWithPhone.length})
        </button>
      </div>

      <p className="text-xs text-zinc-500">
        Kutudan seçin → «Seçilenlere» veya listedeki herkes için «Hepsine». Her pencerede WhatsApp&apos;ta
        Gönder&apos;e basın.
      </p>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      {targets && total > 0 ? (
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 px-4 py-3">
          <p className="text-sm text-zinc-300">
            {done ? (
              <span className="text-emerald-400">Tamamlandı ({total} sohbet).</span>
            ) : (
              <>
                Sıra {queueIndex + 1}/{total}
                {current ? (
                  <> — <span className="text-amber-200">{current.studentName}</span></>
                ) : null}
              </>
            )}
          </p>
          {!done && queueIndex < total - 1 ? (
            <button
              type="button"
              onClick={openNext}
              className="mt-2 rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-100 hover:bg-zinc-700"
            >
              Sonraki veli →
            </button>
          ) : null}
        </div>
      ) : null}

      <AccountingStudentTable
        rows={dueRows}
        currentMonthLabel={currentMonthLabel}
        selectable
        selectedIds={selectedIds}
        onToggleSelect={onToggleSelect}
        onToggleSelectAll={onToggleSelectAll}
      />
    </section>
  );
}
