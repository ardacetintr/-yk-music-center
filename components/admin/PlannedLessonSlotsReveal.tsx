"use client";

import { Children, useMemo, useState, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** İlk görünen satır sayısı */
  initialVisible?: number;
  /** Her tıklamada eklenecek satır sayısı */
  step?: number;
  /** “Daha fazla” satırı için tablo sütun sayısı (colSpan) */
  colSpan?: number;
};

export default function PlannedLessonSlotsReveal({
  children,
  initialVisible = 8,
  step = 8,
  colSpan = 6
}: Props) {
  const rows = useMemo(() => Children.toArray(children), [children]);
  const [visible, setVisible] = useState(initialVisible);

  const cappedVisible = Math.min(visible, rows.length);
  const shown = rows.slice(0, cappedVisible);
  const remaining = rows.length - cappedVisible;

  return (
    <>
      {shown}
      {remaining > 0 ? (
        <tr className="border-b border-zinc-800/40 bg-zinc-950/25">
          <td colSpan={colSpan} className="py-2.5 text-center">
            <button
              type="button"
              onClick={() => setVisible((v) => Math.min(v + step, rows.length))}
              className="rounded-lg border border-zinc-600 bg-zinc-900/70 px-4 py-1.5 text-xs font-medium text-zinc-300 hover:border-brand-500/50 hover:bg-zinc-800 hover:text-zinc-100"
            >
              Daha fazla göster ({remaining})
            </button>
          </td>
        </tr>
      ) : null}
    </>
  );
}
