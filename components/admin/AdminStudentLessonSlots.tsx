"use client";

import { useMemo } from "react";
import Link from "next/link";
import LessonSlotDersSelect from "@/components/forms/LessonSlotDersSelect";
import { formatTimeForTimeInput } from "@/lib/time-hhmm";
import { WEEKDAYS_TR_MON_FIRST, weekdayLabelTr } from "@/lib/weekdays-tr";

export type AdminLessonSlotRow = {
  id: string;
  studentId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string | null;
  teacherId: string | null;
  label: string | null;
  notes: string | null;
  /** Sunucudan gelen güncelleme zamanı — formun kayıttan sonra doğru varsayılanları alması için */
  updatedAt: string;
};

type TeacherOption = { id: string; name: string };

type FormAction = (formData: FormData) => void | Promise<void>;

type Props = {
  studentId: string;
  /** Kayıt formundaki ana öğretmen — ilk ders satırı için varsayılan */
  primaryTeacherId?: string | null;
  teachers: TeacherOption[];
  slots: AdminLessonSlotRow[];
  addLessonSlotInline: FormAction;
  updateLessonSlotInline: FormAction;
  deleteLessonSlotInline: FormAction;
  /** Öğrenci panelinde ders düzenlemesini en üstte göstermek için */
  layout?: "default" | "panelLead";
};

export default function AdminStudentLessonSlots({
  studentId,
  primaryTeacherId = null,
  teachers,
  slots,
  addLessonSlotInline,
  updateLessonSlotInline,
  deleteLessonSlotInline,
  layout = "default"
}: Props) {
  const isPanelLead = layout === "panelLead";

  const defaultNewTeacher = useMemo(() => {
    if (primaryTeacherId && teachers.some((t) => t.id === primaryTeacherId)) {
      return primaryTeacherId;
    }
    return "";
  }, [primaryTeacherId, teachers]);

  return (
    <div
      className={
        isPanelLead
          ? "space-y-4"
          : "mt-4 space-y-4 border-t border-zinc-800 pt-4"
      }
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0 flex-1">
          <h4
            className={
              isPanelLead
                ? "text-sm font-semibold text-zinc-100"
                : "text-xs font-semibold uppercase tracking-wide text-zinc-500"
            }
          >
            {isPanelLead ? "Ders günü, saati ve öğretmen" : "Haftalık ders programı"}
          </h4>
        </div>
        <Link
          href="/admin/lesson-schedules"
          className="shrink-0 text-xs text-brand-400 hover:text-brand-300"
        >
          Tam ders programı →
        </Link>
      </div>

      {slots.length === 0 ? (
        <div className="rounded-lg border border-zinc-800/90 bg-zinc-950/40 p-3">
          <p className="mb-2 text-xs text-zinc-500">
            Henüz ders satırı yok. Aşağıdan gün, saat ve öğretmeni girip ilk satırı ekleyebilirsiniz.
          </p>
          <form
            action={addLessonSlotInline}
            className="grid gap-2 sm:grid-cols-2 lg:grid-cols-6 lg:items-end"
          >
            <input type="hidden" name="studentId" value={studentId} />
            <label className="flex flex-col gap-0.5 text-xs text-zinc-500">
              Gün
              <select
                name="dayOfWeek"
                required
                defaultValue={1}
                className="rounded-lg border border-zinc-700 bg-black px-2 py-1.5 text-sm text-zinc-100"
              >
                {WEEKDAYS_TR_MON_FIRST.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-0.5 text-xs text-zinc-500">
              Başlangıç
              <input
                name="startTime"
                type="time"
                required
                className="rounded-lg border border-zinc-700 bg-black px-2 py-1.5 text-sm text-zinc-100"
              />
            </label>
            <label className="flex flex-col gap-0.5 text-xs text-zinc-500">
              Bitiş (isteğe bağlı)
              <input
                name="endTime"
                type="time"
                className="rounded-lg border border-zinc-700 bg-black px-2 py-1.5 text-sm text-zinc-100"
              />
            </label>
            <label className="flex min-w-0 flex-col gap-0.5 text-xs text-zinc-500 sm:col-span-2">
              Öğretmen
              <select
                name="teacherId"
                required
                defaultValue={defaultNewTeacher}
                className="rounded-lg border border-zinc-700 bg-black px-2 py-1.5 text-sm text-zinc-100"
              >
                <option value="" disabled>
                  Seçin
                </option>
                {teachers.map((th) => (
                  <option key={th.id} value={th.id}>
                    {th.name}
                  </option>
                ))}
              </select>
            </label>
            <LessonSlotDersSelect
              defaultLabel={null}
              labelClassName="flex flex-col gap-0.5 text-xs text-zinc-500"
              selectClassName="rounded-lg border border-zinc-700 bg-black px-2 py-1.5 text-sm text-zinc-100"
            />
            <label className="flex flex-col gap-0.5 text-xs text-zinc-500 sm:col-span-2">
              Not
              <input
                name="notes"
                className="rounded-lg border border-zinc-700 bg-black px-2 py-1.5 text-sm text-zinc-100"
              />
            </label>
            <div className="flex flex-wrap items-center gap-2 lg:col-span-6">
              <button type="submit" className="rounded-lg bg-brand-700 px-3 py-1.5 text-sm">
                Ders ekle
              </button>
            </div>
          </form>
        </div>
      ) : (
        <ul className="space-y-3">
          {slots.map((slot) => {
            const teacherName =
              slot.teacherId != null ? teachers.find((t) => t.id === slot.teacherId)?.name ?? null : null;
            return (
              <li
                key={slot.id}
                className="rounded-lg border border-zinc-800/90 bg-zinc-950/40 p-3"
              >
                <p className="mb-2 text-xs text-zinc-500">
                  <span className="font-medium text-zinc-400">Kayıt:</span>{" "}
                  {weekdayLabelTr(slot.dayOfWeek)} · {formatTimeForTimeInput(slot.startTime)}
                  {slot.endTime ? ` – ${formatTimeForTimeInput(slot.endTime)}` : ""}
                  {teacherName ? ` · ${teacherName}` : slot.teacherId ? " · (öğretmen listede yok)" : " · öğretmen atanmamış"}
                </p>
                <form
                  key={`${slot.id}-${slot.updatedAt}`}
                  action={updateLessonSlotInline}
                  className="grid gap-2 sm:grid-cols-2 lg:grid-cols-6 lg:items-end"
                >
                  <input type="hidden" name="id" value={slot.id} />
                  <input type="hidden" name="studentId" value={studentId} />
                  <label className="flex flex-col gap-0.5 text-xs text-zinc-500">
                    Gün
                    <select
                      name="dayOfWeek"
                      required
                      defaultValue={slot.dayOfWeek}
                      className="rounded-lg border border-zinc-700 bg-black px-2 py-1.5 text-sm text-zinc-100"
                    >
                      {WEEKDAYS_TR_MON_FIRST.map((d) => (
                        <option key={d.value} value={d.value}>
                          {d.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-0.5 text-xs text-zinc-500">
                    Başlangıç
                    <input
                      name="startTime"
                      type="time"
                      required
                      defaultValue={formatTimeForTimeInput(slot.startTime)}
                      className="rounded-lg border border-zinc-700 bg-black px-2 py-1.5 text-sm text-zinc-100"
                    />
                  </label>
                  <label className="flex flex-col gap-0.5 text-xs text-zinc-500">
                    Bitiş (isteğe bağlı)
                    <input
                      name="endTime"
                      type="time"
                      defaultValue={formatTimeForTimeInput(slot.endTime)}
                      className="rounded-lg border border-zinc-700 bg-black px-2 py-1.5 text-sm text-zinc-100"
                    />
                  </label>
                  <label className="flex min-w-0 flex-col gap-0.5 text-xs text-zinc-500 sm:col-span-2">
                    Öğretmen
                    <select
                      name="teacherId"
                      required
                      defaultValue={slot.teacherId ?? ""}
                      className="rounded-lg border border-zinc-700 bg-black px-2 py-1.5 text-sm text-zinc-100"
                    >
                      <option value="" disabled>
                        Seçin
                      </option>
                      {slot.teacherId && !teachers.some((t) => t.id === slot.teacherId) ? (
                        <option value={slot.teacherId}>Kayıtlı öğretmen (listeden çıkmış)</option>
                      ) : null}
                      {teachers.map((th) => (
                        <option key={th.id} value={th.id}>
                          {th.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <LessonSlotDersSelect
                    defaultLabel={slot.label}
                    labelClassName="flex flex-col gap-0.5 text-xs text-zinc-500"
                    selectClassName="rounded-lg border border-zinc-700 bg-black px-2 py-1.5 text-sm text-zinc-100"
                  />
                  <label className="flex flex-col gap-0.5 text-xs text-zinc-500 sm:col-span-2">
                    Not
                    <input
                      name="notes"
                      defaultValue={slot.notes ?? ""}
                      className="rounded-lg border border-zinc-700 bg-black px-2 py-1.5 text-sm text-zinc-100"
                    />
                  </label>
                  <div className="flex flex-wrap items-center gap-2 lg:col-span-6">
                    <button type="submit" className="rounded-lg bg-brand-700 px-3 py-1.5 text-sm">
                      Dersi güncelle
                    </button>
                  </div>
                </form>
                <form action={deleteLessonSlotInline} className="mt-2">
                  <input type="hidden" name="id" value={slot.id} />
                  <button
                    type="submit"
                    className="text-xs text-red-400/90 underline decoration-red-400/50 hover:text-red-300"
                  >
                    Bu ders satırını sil
                  </button>
                </form>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
