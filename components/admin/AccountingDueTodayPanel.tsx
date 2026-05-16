"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AccountingStudentTable, {
  type AccountingStudentRow
} from "@/components/admin/AccountingStudentTable";
import {
  advanceBulkWhatsAppSession,
  createBulkWhatsAppSession,
  openWhatsAppTab,
  type BulkWhatsAppSession,
  type WhatsAppQueueTarget
} from "@/lib/whatsapp-queue";
import { matchesStudentNameSearch } from "@/lib/student-name-search";

type Props = {
  dueRows: AccountingStudentRow[];
  currentMonthLabel: string;
};

function rowsToTargets(rows: AccountingStudentRow[]): WhatsAppQueueTarget[] {
  return rows
    .filter((r) => r.waReminder)
    .map((r) => ({
      id: r.id,
      label: r.name,
      send: r.waReminder!
    }));
}

export default function AccountingDueTodayPanel({ dueRows, currentMonthLabel }: Props) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [targets, setTargets] = useState<WhatsAppQueueTarget[] | null>(null);
  const [queueIndex, setQueueIndex] = useState(0);
  const [popupNote, setPopupNote] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const bulkSessionRef = useRef<BulkWhatsAppSession | null>(null);
  const [nameQuery, setNameQuery] = useState("");

  const filteredDueRows = useMemo(() => {
    if (!nameQuery.trim()) return dueRows;
    return dueRows.filter((r) => matchesStudentNameSearch(r.name, nameQuery));
  }, [dueRows, nameQuery]);

  const withPhone = useMemo(
    () => filteredDueRows.filter((r) => r.hasParentPhone),
    [filteredDueRows]
  );
  const selectedWithPhone = useMemo(
    () => filteredDueRows.filter((r) => selectedIds.has(r.id) && r.hasParentPhone),
    [filteredDueRows, selectedIds]
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

  function stopBulkSession() {
    bulkSessionRef.current = null;
  }

  function resetQueue() {
    stopBulkSession();
    setTargets(null);
    setQueueIndex(0);
    setDone(false);
    setError("");
    setPopupNote("");
  }

  function startBulkSend(list: WhatsAppQueueTarget[]) {
    if (!list.length) {
      setError("Gönderilecek veli yok.");
      return;
    }

    setTargets(list);
    setQueueIndex(0);
    setDone(false);
    setError("");

    if (list.length === 1) {
      stopBulkSession();
      openWhatsAppTab(list[0].send, list[0].id);
      setPopupNote("WhatsApp açıldı. Mesajı kontrol edip Gönder'e basın.");
      return;
    }

    const session = createBulkWhatsAppSession(list);
    if (!session) return;
    bulkSessionRef.current = session;
    openWhatsAppTab(list[0].send, list[0].id);
    setPopupNote(
      `${list.length} veli sırayla açılacak. 1/${list.length} — ${list[0].label}: WhatsApp'ta Gönder'e basın, ` +
        "sonra bu sekmeye (yönetim) geri dönün; sıradaki veli otomatik açılır."
    );
  }

  useEffect(() => {
    function onReturnToTab() {
      if (document.visibilityState !== "visible") return;
      const session = bulkSessionRef.current;
      if (!session || session.targets.length <= 1) return;

      const result = advanceBulkWhatsAppSession(session);
      if (!result.opened && !result.finished) return;

      bulkSessionRef.current = result.session;

      if (result.opened) {
        setQueueIndex(result.session.index);
        const total = result.session.targets.length;
        const n = result.session.index + 1;
        setPopupNote(
          `${n}/${total} — ${result.opened.label}: Gönder'e basıp tekrar bu sekmeye dönün` +
            (result.finished ? " (son veli)." : ".")
        );
      }

      if (result.finished) {
        stopBulkSession();
        setDone(true);
        setPopupNote(`Tamamlandı: ${session.targets.length} veliye sıra ile WhatsApp açıldı.`);
      }
    }

    document.addEventListener("visibilitychange", onReturnToTab);
    window.addEventListener("focus", onReturnToTab);
    return () => {
      document.removeEventListener("visibilitychange", onReturnToTab);
      window.removeEventListener("focus", onReturnToTab);
    };
  }, []);

  function sendToAll() {
    resetQueue();
    startBulkSend(rowsToTargets(withPhone));
  }

  function sendToSelected() {
    if (!selectedWithPhone.length) {
      setError("En az bir öğrenci seçin (veli telefonu olan).");
      return;
    }
    resetQueue();
    startBulkSend(rowsToTargets(selectedWithPhone));
  }

  function openNextManual() {
    if (!targets?.length) return;
    const next = queueIndex + 1;
    if (next >= targets.length) {
      stopBulkSession();
      setDone(true);
      return;
    }
    const target = targets[next];
    openWhatsAppTab(target.send, `${target.id}_manual_${next}`);
    setQueueIndex(next);
    if (bulkSessionRef.current) {
      bulkSessionRef.current = {
        ...bulkSessionRef.current,
        index: next,
        lastOpenedAt: Date.now()
      };
    }
    setPopupNote(`${next + 1}/${targets.length} — ${target.label} (manuel)`);
    if (next >= targets.length - 1) {
      stopBulkSession();
      setDone(true);
    }
  }

  function openOne(target: WhatsAppQueueTarget) {
    openWhatsAppTab(target.send, `${target.id}_one`);
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

      <label className="block rounded-xl border border-amber-800/40 bg-zinc-950/40 p-3">
        <span className="text-sm font-medium text-amber-100">Öğrenci ara (ad / soyad)</span>
        <input
          type="search"
          value={nameQuery}
          onChange={(e) => setNameQuery(e.target.value)}
          placeholder="Bu listede ara…"
          className="mt-2 w-full max-w-md rounded-lg border border-zinc-600 bg-zinc-950 px-4 py-2.5 text-base text-zinc-100 placeholder:text-zinc-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500/40"
          autoComplete="off"
          spellCheck={false}
        />
        {nameQuery.trim() ? (
          <p className="mt-1.5 text-xs text-zinc-400">
            {filteredDueRows.length} / {dueRows.length} öğrenci
          </p>
        ) : null}
      </label>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={sendToAll}
          disabled={withPhone.length === 0}
          className="rounded-xl bg-[#25D366] px-4 py-2 text-sm font-semibold text-white hover:bg-[#20BD5A] disabled:opacity-50"
        >
          Hepsine WhatsApp ({withPhone.length})
        </button>
        <button
          type="button"
          onClick={sendToSelected}
          disabled={selectedWithPhone.length === 0}
          className="rounded-xl border border-[#25D366]/70 bg-[#25D366]/10 px-4 py-2 text-sm font-semibold text-[#5ee87a] hover:bg-[#25D366]/20 disabled:opacity-50"
        >
          Seçilenlere WhatsApp ({selectedWithPhone.length})
        </button>
        {targets && !done ? (
          <button
            type="button"
            onClick={resetQueue}
            className="rounded-xl border border-zinc-600 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800"
          >
            Sırayı iptal
          </button>
        ) : null}
      </div>

      <p className="text-xs text-zinc-500">
        Birden fazla seçimde tarayıcı tek seferde tüm sekmeleri açmayabilir.{" "}
        <strong className="text-zinc-400">Her velide Gönder&apos;e basın</strong>, sonra yönetim sekmesine
        dönün — sıradaki veli otomatik açılır. İsterseniz «Sonraki veli» ile de ilerleyin.
      </p>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}
      {popupNote ? (
        <p className="rounded-lg border border-emerald-900/50 bg-emerald-950/30 px-3 py-2 text-sm text-emerald-200/90">
          {popupNote}
        </p>
      ) : null}

      {targets && total > 0 ? (
        <div className="space-y-3 rounded-lg border border-zinc-800 bg-zinc-950/50 px-4 py-3">
          <p className="text-sm text-zinc-300">
            {done ? (
              <span className="text-emerald-400">Tamamlandı ({total} veli).</span>
            ) : (
              <>
                Sıra {queueIndex + 1}/{total}
                {current ? (
                  <>
                    {" "}
                    — <span className="text-amber-200">{current.label}</span>
                  </>
                ) : null}
              </>
            )}
          </p>

          <ul className="max-h-48 space-y-1 overflow-y-auto text-sm">
            {targets.map((t, i) => (
              <li key={t.id} className="flex items-center justify-between gap-2">
                <span
                  className={
                    i === queueIndex && !done ? "font-medium text-amber-200" : "text-zinc-400"
                  }
                >
                  {i + 1}. {t.label}
                  {i < queueIndex || done ? (
                    <span className="ml-1 text-emerald-500/80">✓</span>
                  ) : null}
                </span>
                <button
                  type="button"
                  onClick={() => openOne(t)}
                  className="shrink-0 rounded border border-zinc-600 px-2 py-0.5 text-xs text-zinc-200 hover:bg-zinc-800"
                >
                  Aç
                </button>
              </li>
            ))}
          </ul>

          {!done && queueIndex < total - 1 ? (
            <button
              type="button"
              onClick={openNextManual}
              className="rounded-lg border border-[#25D366]/50 bg-[#25D366]/10 px-3 py-1.5 text-sm font-medium text-[#5ee87a] hover:bg-[#25D366]/20"
            >
              Sonraki veli → (manuel)
            </button>
          ) : null}
        </div>
      ) : null}

      {!filteredDueRows.length && nameQuery.trim() ? (
        <p className="text-sm text-zinc-500">Aramanızla eşleşen öğrenci yok.</p>
      ) : (
        <AccountingStudentTable
          rows={filteredDueRows}
          currentMonthLabel={currentMonthLabel}
          selectable
          selectedIds={selectedIds}
          onToggleSelect={onToggleSelect}
          onToggleSelectAll={onToggleSelectAll}
        />
      )}
    </section>
  );
}
