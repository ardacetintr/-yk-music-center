"use client";

import { useMemo, useState } from "react";
import { getTeacherScheduleColors } from "@/lib/teacher-schedule-colors";
import { WEEKDAYS_TR_MON_FIRST, weekdayLabelTr } from "@/lib/weekdays-tr";

export type ScheduleSlotPayload = {
  id: string;
  studentId: string;
  teacherId: string | null;
  dayOfWeek: number;
  startTime: string;
  endTime: string | null;
  studentName: string;
  teacherName: string | null;
  label: string | null;
  notes: string | null;
};

function jsDateToSchemaDayOfWeek(d: Date): number {
  const day = d.getDay();
  return day === 0 ? 7 : day;
}

function startOfWeekMonday(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  const dow = x.getDay();
  const diff = dow === 0 ? -6 : 1 - dow;
  x.setDate(x.getDate() + diff);
  return x;
}

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function formatShortDate(d: Date): string {
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
}

function formatWeekRange(weekStart: Date): string {
  const weekEnd = addDays(weekStart, 6);
  return `${formatShortDate(weekStart)} – ${formatWeekRangeEnd(weekEnd)}`;
}

function formatWeekRangeEnd(d: Date): string {
  return d.toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" });
}

function formatDayTitle(d: Date): string {
  return d.toLocaleDateString("tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

function timeRange(slot: Pick<ScheduleSlotPayload, "startTime" | "endTime">): string {
  return slot.endTime ? `${slot.startTime} – ${slot.endTime}` : slot.startTime;
}

function compareTime(a: ScheduleSlotPayload, b: ScheduleSlotPayload): number {
  return a.startTime.localeCompare(b.startTime);
}

const MONTHS_TR = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık"
];

function calendarMonthCells(year: number, monthIndex: number): Array<Date | null> {
  const first = new Date(year, monthIndex, 1);
  const pad = jsDateToSchemaDayOfWeek(first) - 1;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const cells: Array<Date | null> = [];
  for (let i = 0; i < pad; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, monthIndex, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function slotsForDay(slots: ScheduleSlotPayload[], dayOfWeek: number): ScheduleSlotPayload[] {
  return slots.filter((s) => s.dayOfWeek === dayOfWeek).sort(compareTime);
}

type Props = { slots: ScheduleSlotPayload[] };

type ViewMode = "daily" | "weekly" | "monthly";

export default function LessonScheduleProgramViews({ slots }: Props) {
  const [mode, setMode] = useState<ViewMode>("weekly");
  const [filterStudentId, setFilterStudentId] = useState("");
  const [filterTeacherId, setFilterTeacherId] = useState("");
  const [dayAnchor, setDayAnchor] = useState(() => startOfDay(new Date()));
  const [weekAnchor, setWeekAnchor] = useState(() => startOfWeekMonday(new Date()));
  const [monthAnchor, setMonthAnchor] = useState(() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), 1);
  });

  const studentFilterOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of slots) {
      map.set(s.studentId, s.studentName);
    }
    return [...map.entries()]
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name, "tr"));
  }, [slots]);

  const teacherFilterOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of slots) {
      if (s.teacherId && s.teacherName) {
        map.set(s.teacherId, s.teacherName);
      }
    }
    return [...map.entries()]
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name, "tr"));
  }, [slots]);

  const filteredSlots = useMemo(() => {
    return slots.filter((s) => {
      if (filterStudentId && s.studentId !== filterStudentId) return false;
      if (filterTeacherId && s.teacherId !== filterTeacherId) return false;
      return true;
    });
  }, [slots, filterStudentId, filterTeacherId]);

  const weekStart = useMemo(() => startOfWeekMonday(weekAnchor), [weekAnchor]);
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  const monthCells = useMemo(
    () => calendarMonthCells(monthAnchor.getFullYear(), monthAnchor.getMonth()),
    [monthAnchor]
  );

  const monthTitle = `${MONTHS_TR[monthAnchor.getMonth()]} ${monthAnchor.getFullYear()}`;
  const hasSlots = slots.length > 0;
  const filterActive = Boolean(filterStudentId || filterTeacherId);
  const dowForDay = jsDateToSchemaDayOfWeek(dayAnchor);
  const daySlots = useMemo(() => slotsForDay(filteredSlots, dowForDay), [filteredSlots, dowForDay]);

  const slotCard = (s: ScheduleSlotPayload) => {
    const c = getTeacherScheduleColors(s.teacherId, s.teacherName);
    return (
    <div
      key={s.id}
      className={`rounded-md border px-2 py-1.5 text-[11px] leading-snug ${c.cardClass}`}
    >
        <div className={`font-mono text-[10px] ${c.timeClass}`}>{timeRange(s)}</div>
        <div className={`font-medium ${c.studentClass}`}>{s.studentName}</div>
        {s.teacherName ? <div className={c.teacherClass}>{s.teacherName}</div> : null}
        {s.label ? <div className={c.labelClass}>{s.label}</div> : null}
      </div>
    );
  };

  const slotCardCompact = (s: ScheduleSlotPayload, cellKey: string) => {
    const c = getTeacherScheduleColors(s.teacherId, s.teacherName);
    return (
      <div
        key={`${s.id}-${cellKey}`}
        className={`rounded border px-1 py-0.5 leading-tight text-[10px] ${c.cardClass}`}
      >
        <span className={`font-mono ${c.timeClass}`}>{timeRange(s)}</span>
        <span className={`mt-0.5 block font-medium ${c.studentClass}`}>{s.studentName}</span>
        {s.teacherName ? (
          <span className={`mt-0.5 block text-[9px] ${c.teacherClass}`}>{s.teacherName}</span>
        ) : null}
      </div>
    );
  };


  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-zinc-500">Görünüm:</span>
          <div className="inline-flex rounded-lg border border-zinc-700 p-0.5">
            <button
              type="button"
              onClick={() => setMode("daily")}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                mode === "daily"
                  ? "bg-brand-600 text-white"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Günlük
            </button>
            <button
              type="button"
              onClick={() => setMode("weekly")}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                mode === "weekly"
                  ? "bg-brand-600 text-white"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Haftalık
            </button>
            <button
              type="button"
              onClick={() => setMode("monthly")}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                mode === "monthly"
                  ? "bg-brand-600 text-white"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Aylık
            </button>
          </div>
        </div>

        {hasSlots ? (
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end">
            <label className="flex min-w-[10rem] flex-col gap-0.5 text-xs text-zinc-500">
              Öğrenci
              <select
                value={filterStudentId}
                onChange={(e) => setFilterStudentId(e.target.value)}
                className="rounded-lg border border-zinc-700 bg-black px-2 py-1.5 text-sm text-zinc-100"
              >
                <option value="">Tümü</option>
                {studentFilterOptions.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex min-w-[10rem] flex-col gap-0.5 text-xs text-zinc-500">
              Öğretmen
              <select
                value={filterTeacherId}
                onChange={(e) => setFilterTeacherId(e.target.value)}
                className="rounded-lg border border-zinc-700 bg-black px-2 py-1.5 text-sm text-zinc-100"
              >
                <option value="">Tümü</option>
                {teacherFilterOptions.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ) : null}
      </div>

      {hasSlots && teacherFilterOptions.length > 0 ? (
        <div className="flex flex-wrap gap-2 rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2">
          <span className="w-full text-[11px] font-medium text-zinc-500">Öğretmen renkleri</span>
          {teacherFilterOptions.map((o) => {
            const c = getTeacherScheduleColors(o.id, o.name);
            return (
              <span
                key={o.id}
                className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] ${c.cardClass}`}
              >
                <span className={`h-2 w-2 shrink-0 rounded-full ring-1 ${c.legendDotClass}`} />
                <span className={c.teacherClass}>{o.name}</span>
              </span>
            );
          })}
        </div>
      ) : null}

      {!hasSlots ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 px-4 py-6 text-center text-sm text-zinc-500">
          Çizelge için önce ders satırı ekleyin. Kayıtlar eklendikten sonra burada günlük, haftalık ve aylık görünümde
          listelenecek.
        </div>
      ) : null}

      {hasSlots && filterActive && filteredSlots.length === 0 ? (
        <p className="rounded-lg border border-zinc-700/80 bg-zinc-950/50 px-3 py-2 text-xs text-zinc-400">
          Seçilen öğrenci veya öğretmen filtresine uyan ders satırı yok.
        </p>
      ) : null}

      {hasSlots && mode === "daily" ? (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setDayAnchor(addDays(dayAnchor, -1))}
              className="rounded-lg border border-zinc-600 px-3 py-1.5 text-xs text-zinc-200 hover:bg-zinc-800"
            >
              ← Önceki gün
            </button>
            <p className="text-center text-sm font-medium capitalize text-zinc-200">{formatDayTitle(dayAnchor)}</p>
            <button
              type="button"
              onClick={() => setDayAnchor(addDays(dayAnchor, 1))}
              className="rounded-lg border border-zinc-600 px-3 py-1.5 text-xs text-zinc-200 hover:bg-zinc-800"
            >
              Sonraki gün →
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-zinc-800">
            <div className="mx-auto max-w-xl">
              <div className="border-b border-zinc-800 bg-zinc-950/80 px-3 py-2 text-center">
                <div className="text-sm font-medium text-brand-300">{weekdayLabelTr(dowForDay)}</div>
                <div className="text-xs text-zinc-500">{formatShortDate(dayAnchor)}</div>
              </div>
              <div className="flex min-h-[12rem] flex-col gap-1.5 bg-zinc-900/50 p-3">
                {daySlots.length === 0 ? (
                  <span className="text-center text-sm text-zinc-500">
                    Bu gün için şablonda ders yok
                    {filterActive ? " (veya filtreye uyan kayıt yok)." : "."}
                  </span>
                ) : (
                  daySlots.map((s) => slotCard(s))
                )}
              </div>
            </div>
          </div>
          <p className="text-[11px] text-zinc-500">
            Günlük görünüm, haftalık şablonda seçilen takvim gününe denk gelen haftanın gününe göre dersleri listeler.
          </p>
        </div>
      ) : null}

      {hasSlots && mode === "weekly" ? (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setWeekAnchor(addDays(weekStart, -7))}
              className="rounded-lg border border-zinc-600 px-3 py-1.5 text-xs text-zinc-200 hover:bg-zinc-800"
            >
              ← Önceki hafta
            </button>
            <p className="text-center text-sm font-medium text-zinc-200">{formatWeekRange(weekStart)}</p>
            <button
              type="button"
              onClick={() => setWeekAnchor(addDays(weekStart, 7))}
              className="rounded-lg border border-zinc-600 px-3 py-1.5 text-xs text-zinc-200 hover:bg-zinc-800"
            >
              Sonraki hafta →
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-zinc-800">
            <div className="grid min-w-[52rem] grid-cols-7 divide-x divide-zinc-800 bg-zinc-900/50">
              {weekDays.map((date, i) => {
                const dow = i + 1;
                const daySlotsWeekly = slotsForDay(filteredSlots, dow);
                return (
                  <div key={dow} className="flex min-h-[12rem] flex-col border-b border-zinc-800">
                    <div className="border-b border-zinc-800 bg-zinc-950/80 px-2 py-2 text-center">
                      <div className="text-[11px] font-medium text-brand-300">{weekdayLabelTr(dow)}</div>
                      <div className="text-xs text-zinc-500">{formatShortDate(date)}</div>
                    </div>
                    <div className="flex flex-1 flex-col gap-1.5 p-2">
                      {daySlotsWeekly.length === 0 ? (
                        <span className="text-[11px] text-zinc-600">—</span>
                      ) : (
                        daySlotsWeekly.map((s) => slotCard(s))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <p className="text-[11px] text-zinc-500">
            Haftalık program tekrarlayan şablondur (Pazartesi–Pazar). Tarihler seçilen haftayı gösterir.
          </p>
        </div>
      ) : null}

      {hasSlots && mode === "monthly" ? (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={() =>
                setMonthAnchor(new Date(monthAnchor.getFullYear(), monthAnchor.getMonth() - 1, 1))
              }
              className="rounded-lg border border-zinc-600 px-3 py-1.5 text-xs text-zinc-200 hover:bg-zinc-800"
            >
              ← Önceki ay
            </button>
            <p className="text-center text-sm font-medium capitalize text-zinc-200">{monthTitle}</p>
            <button
              type="button"
              onClick={() =>
                setMonthAnchor(new Date(monthAnchor.getFullYear(), monthAnchor.getMonth() + 1, 1))
              }
              className="rounded-lg border border-zinc-600 px-3 py-1.5 text-xs text-zinc-200 hover:bg-zinc-800"
            >
              Sonraki ay →
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-zinc-800">
            <table className="w-full min-w-[36rem] border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-950/90">
                  {WEEKDAYS_TR_MON_FIRST.map((d) => (
                    <th key={d.value} className="px-2 py-2 text-center font-medium text-zinc-400">
                      {d.label.slice(0, 3)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: Math.ceil(monthCells.length / 7) }, (_, row) => (
                  <tr key={row} className="border-b border-zinc-800/80 align-top">
                    {monthCells.slice(row * 7, row * 7 + 7).map((cell, colIdx) => {
                      const key = cell
                        ? `${cell.getFullYear()}-${cell.getMonth()}-${cell.getDate()}`
                        : `empty-${row}-${colIdx}`;
                      if (!cell) {
                        return (
                          <td key={key} className="min-h-[5rem] bg-zinc-950/30 p-1">
                            <span className="sr-only">Boş</span>
                          </td>
                        );
                      }
                      const dow = jsDateToSchemaDayOfWeek(cell);
                      const cellSlots = slotsForDay(filteredSlots, dow);
                      const today = new Date();
                      const isToday =
                        cell.getDate() === today.getDate() &&
                        cell.getMonth() === today.getMonth() &&
                        cell.getFullYear() === today.getFullYear();

                      return (
                        <td
                          key={key}
                          className={`min-h-[5rem] border-l border-zinc-800/60 p-1 ${
                            isToday ? "bg-brand-950/25" : "bg-zinc-900/40"
                          }`}
                        >
                          <div
                            className={`mb-1 text-center text-[11px] font-semibold ${
                              isToday ? "text-brand-300" : "text-zinc-400"
                            }`}
                          >
                            {cell.getDate()}
                          </div>
                          <div className="flex flex-col gap-1">
                            {cellSlots.map((s) => slotCardCompact(s, key))}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-zinc-500">
            Aylık görünümde her güne, o günün haftanın hangi günü olduğuna göre şablondaki dersler yazılır.
          </p>
        </div>
      ) : null}
    </div>
  );
}
