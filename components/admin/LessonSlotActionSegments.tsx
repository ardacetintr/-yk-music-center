"use client";

import { useRef, type ReactNode } from "react";
import SendLessonReminderWhatsAppButton from "@/components/admin/SendLessonReminderWhatsAppButton";
import { deleteLessonSlot } from "@/app/admin/lesson-schedules/actions";

const segmentNeutral =
  "flex min-h-[22px] w-full cursor-pointer select-none items-center justify-center bg-zinc-950 px-0.5 py-0.5 text-center text-[10px] font-medium leading-snug text-zinc-400 transition hover:bg-zinc-900 hover:text-zinc-200";

const segmentDanger =
  "flex min-h-[22px] w-full items-center justify-center bg-zinc-950 px-0.5 py-0.5 text-center text-[10px] font-medium leading-tight text-red-300 transition hover:bg-red-950/45 disabled:opacity-45";

const segmentDisabled =
  "flex min-h-[22px] w-full cursor-not-allowed items-center justify-center bg-zinc-950 px-0.5 py-0.5 text-center text-[9px] leading-tight text-zinc-600";

type Props = {
  slotId: string;
  hasTeacher: boolean;
  editForm: ReactNode;
};

export default function LessonSlotActionSegments({ slotId, hasTeacher, editForm }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <>
      <div
        role="group"
        aria-label="Ders işlemleri"
        className="inline-grid w-[15rem] shrink-0 grid-cols-4 gap-px overflow-hidden rounded border border-zinc-600 bg-zinc-600"
      >
        <SendLessonReminderWhatsAppButton segment slotId={slotId} recipient="student" />
        {hasTeacher ? (
          <SendLessonReminderWhatsAppButton segment slotId={slotId} recipient="teacher" />
        ) : (
          <span className={segmentDisabled} title="Öğretmen yok">
            —
          </span>
        )}
        <button
          type="button"
          className={segmentNeutral}
          onClick={() => dialogRef.current?.showModal()}
        >
          Düzenle
        </button>
        <div className="min-h-[22px] min-w-0 bg-zinc-950">
          <form action={deleteLessonSlot} className="flex h-full min-h-[22px] w-full">
            <input type="hidden" name="id" value={slotId} />
            <button type="submit" className={`${segmentDanger} flex-1`}>
              Sil
            </button>
          </form>
        </div>
      </div>

      <dialog
        ref={dialogRef}
        onMouseDown={(e) => {
          const el = dialogRef.current;
          if (!el) return;
          const rect = el.getBoundingClientRect();
          const { clientX, clientY } = e;
          const outside =
            clientX < rect.left ||
            clientX > rect.right ||
            clientY < rect.top ||
            clientY > rect.bottom;
          if (outside) el.close();
        }}
        className="fixed left-1/2 top-1/2 z-50 max-h-[min(90vh,640px)] w-[min(92vw,26rem)] -translate-x-1/2 -translate-y-1/2 rounded-xl border border-zinc-700 bg-zinc-950 p-0 text-zinc-100 shadow-2xl open:flex open:flex-col [&::backdrop]:bg-black/65"
      >
        <div className="flex items-center justify-between border-b border-zinc-800 px-3 py-2">
          <span className="text-xs font-medium text-zinc-400">Dersi düzenle</span>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="rounded px-2 py-0.5 text-xs text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
          >
            Kapat
          </button>
        </div>
        <div className="overflow-y-auto p-3">{editForm}</div>
      </dialog>
    </>
  );
}
