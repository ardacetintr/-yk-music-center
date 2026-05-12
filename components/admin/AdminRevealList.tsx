"use client";

import { Children, useEffect, useMemo, useState, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** İlk ekranda gösterilecek öğe sayısı */
  initial?: number;
  /** Liste değişince tümünü gösterme durumunu sıfırlamak için */
  resetKey?: string;
  className?: string;
  expandLabel?: string;
  collapseLabel?: string;
};

export default function AdminRevealList({
  children,
  initial = 10,
  resetKey,
  className,
  expandLabel = "Tümünü görüntüle",
  collapseLabel = "Daha az göster"
}: Props) {
  const items = useMemo(() => Children.toArray(children), [children]);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    setShowAll(false);
  }, [resetKey]);

  const visible = showAll ? items : items.slice(0, initial);
  const hiddenCount = items.length - initial;

  return (
    <div className={className}>
      {visible}
      {items.length > initial ? (
        <div className="mt-2 flex justify-center border-t border-zinc-800/80 pt-2">
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="rounded-lg border border-zinc-600 bg-zinc-900/70 px-4 py-1.5 text-xs font-medium text-zinc-300 hover:border-brand-500/50 hover:bg-zinc-800 hover:text-zinc-100"
          >
            {showAll ? collapseLabel : `${expandLabel} (${hiddenCount} daha)`}
          </button>
        </div>
      ) : null}
    </div>
  );
}
