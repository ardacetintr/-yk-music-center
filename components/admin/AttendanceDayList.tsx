"use client";

import { useMemo, useTransition } from "react";
import { setLessonSessionAttendance } from "@/app/admin/attendance/actions";
import { useAdminToastOptional } from "@/components/admin/AdminToastProvider";
import { getTeacherScheduleColors } from "@/lib/teacher-schedule-colors";

export type AttendanceDayRow = {
  slotId: string;
  studentName: string;
  teacherId: string | null;
  teacherName: string | null;
  startTime: string;
  endTime: string | null;
  label: string | null;
  instrument: string;
  status: "PRESENT" | "ABSENT" | null;
};

type Props = {
  sessionDate: string;
  dateLabel: string;
  rows: AttendanceDayRow[];
};

function timeRange(start: string, end: string | null): string {
  return end ? `${start} – ${end}` : start;
}

function statusLabel(status: AttendanceDayRow["status"]): string {
  if (status === "PRESENT") return "Geldi";
  if (status === "ABSENT") return "Gelmedi";
  return "İşaretlenmedi";
}

function IconCheck({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-3.5 w-3.5 ${className ?? ""}`}
      aria-hidden
    >
      <path d="M3.5 8.5 6.5 11.5 12.5 4.5" />
    </svg>
  );
}

function IconCross({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      className={`h-3.5 w-3.5 ${className ?? ""}`}
      aria-hidden
    >
      <path d="M4.5 4.5 11.5 11.5M11.5 4.5 4.5 11.5" />
    </svg>
  );
}

const iconBtnBase =
  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition disabled:opacity-50";

function StatusBadge({ status }: { status: AttendanceDayRow["status"] }) {
  return (
    <span
      className={`inline-block shrink-0 rounded-md px-2 py-0.5 text-[10px] font-medium sm:text-xs ${
        status === "PRESENT"
          ? "bg-emerald-900/50 text-emerald-200"
          : status === "ABSENT"
            ? "bg-red-900/50 text-red-200"
            : "bg-zinc-800 text-zinc-400"
      }`}
    >
      {statusLabel(status)}
    </span>
  );
}

function AttendanceQuickActions({
  row,
  sessionDate,
  pending,
  run
}: {
  row: AttendanceDayRow;
  sessionDate: string;
  pending: boolean;
  run: (form: HTMLFormElement) => void;
}) {
  const isPresent = row.status === "PRESENT";
  const isAbsent = row.status === "ABSENT";

  return (
    <div className="flex flex-wrap items-center gap-1">
      <form
        action={setLessonSessionAttendance}
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const actionInput = form.elements.namedItem("action") as HTMLInputElement;
          actionInput.value = isPresent ? "clear" : "PRESENT";
          run(form);
        }}
      >
        <input type="hidden" name="lessonSlotId" value={row.slotId} />
        <input type="hidden" name="sessionDate" value={sessionDate} />
        <input type="hidden" name="action" value="PRESENT" />
        <button
          type="submit"
          disabled={pending}
          aria-label={isPresent ? "Geldi işaretini kaldır" : "Geldi olarak işaretle"}
          title={isPresent ? "Geldi işaretini kaldır" : "Geldi olarak işaretle"}
          className={`${iconBtnBase} ${
            isPresent
              ? "border-emerald-400 bg-emerald-600 text-white shadow-sm shadow-emerald-900/40"
              : "border-emerald-500/70 bg-transparent text-emerald-500/50 hover:border-emerald-400 hover:bg-emerald-950/60 hover:text-emerald-200"
          }`}
        >
          <IconCheck />
        </button>
      </form>
      <form
        action={setLessonSessionAttendance}
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const actionInput = form.elements.namedItem("action") as HTMLInputElement;
          actionInput.value = isAbsent ? "clear" : "ABSENT";
          run(form);
        }}
      >
        <input type="hidden" name="lessonSlotId" value={row.slotId} />
        <input type="hidden" name="sessionDate" value={sessionDate} />
        <input type="hidden" name="action" value="ABSENT" />
        <button
          type="submit"
          disabled={pending}
          aria-label={isAbsent ? "Gelmedi işaretini kaldır" : "Gelmedi olarak işaretle"}
          title={isAbsent ? "Gelmedi işaretini kaldır" : "Gelmedi olarak işaretle"}
          className={`${iconBtnBase} ${
            isAbsent
              ? "border-red-400 bg-red-600 text-white shadow-sm shadow-red-900/40"
              : "border-red-500/70 bg-transparent text-red-500/50 hover:border-red-400 hover:bg-red-950/60 hover:text-red-200"
          }`}
        >
          <IconCross />
        </button>
      </form>
    </div>
  );
}

function StatusWithActions({
  row,
  sessionDate,
  pending,
  run
}: {
  row: AttendanceDayRow;
  sessionDate: string;
  pending: boolean;
  run: (form: HTMLFormElement) => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-1.5">
      <StatusBadge status={row.status} />
      <AttendanceQuickActions row={row} sessionDate={sessionDate} pending={pending} run={run} />
    </div>
  );
}

function BulkColumn({
  title,
  tone,
  items,
  sessionDate,
  pending,
  run
}: {
  title: string;
  tone: "emerald" | "red" | "zinc";
  items: AttendanceDayRow[];
  sessionDate: string;
  pending: boolean;
  run: (form: HTMLFormElement) => void;
}) {
  const border =
    tone === "emerald"
      ? "border-emerald-500/35 bg-emerald-950/20"
      : tone === "red"
        ? "border-red-500/30 bg-red-950/15"
        : "border-zinc-700 bg-zinc-900/50";
  const heading =
    tone === "emerald" ? "text-emerald-300" : tone === "red" ? "text-red-300" : "text-zinc-400";

  return (
    <div className={`rounded-xl border p-3 ${border}`}>
      <h3 className={`text-sm font-semibold ${heading}`}>
        {title}{" "}
        <span className="font-normal text-zinc-500">({items.length})</span>
      </h3>
      {items.length === 0 ? (
        <p className="mt-2 text-xs text-zinc-600">—</p>
      ) : (
        <ul className="mt-2 max-h-72 space-y-1.5 overflow-y-auto">
          {items.map((r) => (
            <li
              key={r.slotId}
              className="flex flex-col gap-1.5 rounded-lg border border-zinc-800/60 bg-zinc-950/30 px-2 py-1.5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 text-xs leading-snug text-zinc-300">
                <span className="font-mono text-brand-300/90">{r.startTime}</span>{" "}
                <span className="font-medium text-zinc-100">{r.studentName}</span>
                {r.teacherName ? (
                  <span className="text-zinc-500"> · {r.teacherName}</span>
                ) : null}
              </div>
              <StatusWithActions row={r} sessionDate={sessionDate} pending={pending} run={run} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function AttendanceDayList({ sessionDate, dateLabel, rows }: Props) {
  const [pending, startTransition] = useTransition();
  const toast = useAdminToastOptional();

  function run(form: HTMLFormElement) {
    const fd = new FormData(form);
    startTransition(async () => {
      try {
        await setLessonSessionAttendance(fd);
        toast?.showToast("attendance-saved");
      } catch (e) {
        toast?.showToast(e instanceof Error ? e.message : "Kaydedilemedi.", "error");
      }
    });
  }

  const presentRows = useMemo(() => rows.filter((r) => r.status === "PRESENT"), [rows]);
  const absentRows = useMemo(() => rows.filter((r) => r.status === "ABSENT"), [rows]);
  const unmarkedRows = useMemo(() => rows.filter((r) => !r.status), [rows]);

  if (!rows.length) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 px-4 py-8 text-center text-sm text-zinc-500">
        <p className="font-medium text-zinc-400">{dateLabel}</p>
        <p className="mt-2">Bu gün için ders programında kayıtlı ders yok.</p>
        <p className="mt-1 text-xs">
          Ders eklemek için{" "}
          <a href="/admin/lesson-schedules" className="text-brand-400 hover:text-brand-300">
            Ders programı
          </a>{" "}
          sayfasını kullanın.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 text-xs text-zinc-500">
        <span>
          <span className="font-medium text-zinc-300">{rows.length}</span> ders
        </span>
        <span className="text-emerald-400/90">Geldi: {presentRows.length}</span>
        <span className="text-red-400/90">Gelmedi: {absentRows.length}</span>
        <span>İşaretlenmedi: {unmarkedRows.length}</span>
        {pending ? <span className="text-brand-400">Kaydediliyor…</span> : null}
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <BulkColumn
          title="Gelenler"
          tone="emerald"
          items={presentRows}
          sessionDate={sessionDate}
          pending={pending}
          run={run}
        />
        <BulkColumn
          title="Gelmeyenler"
          tone="red"
          items={absentRows}
          sessionDate={sessionDate}
          pending={pending}
          run={run}
        />
        <BulkColumn
          title="İşaretlenmeyenler"
          tone="zinc"
          items={unmarkedRows}
          sessionDate={sessionDate}
          pending={pending}
          run={run}
        />
      </div>

      <div className="overflow-x-auto rounded-xl border border-zinc-800">
        <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-950/80 text-xs uppercase tracking-wide text-zinc-500">
              <th className="px-3 py-2 font-medium">Saat</th>
              <th className="px-3 py-2 font-medium">Öğrenci</th>
              <th className="px-3 py-2 font-medium">Öğretmen</th>
              <th className="px-3 py-2 text-right font-medium">Durum / Yoklama</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const tc = getTeacherScheduleColors(row.teacherId, row.teacherName);
              return (
                <tr key={row.slotId} className="border-b border-zinc-800/80">
                  <td className="px-3 py-2 font-mono text-xs text-brand-300">
                    {timeRange(row.startTime, row.endTime)}
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-medium text-zinc-100">{row.studentName}</div>
                    <div className="text-[11px] text-zinc-500">
                      {row.instrument}
                      {row.label ? ` · ${row.label}` : ""}
                    </div>
                  </td>
                  <td className={`px-3 py-2 text-sm ${tc.teacherClass}`}>
                    {row.teacherName ?? "—"}
                  </td>
                  <td className="px-3 py-2">
                    <StatusWithActions
                      row={row}
                      sessionDate={sessionDate}
                      pending={pending}
                      run={run}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
