import { updateLessonSlot } from "@/app/admin/lesson-schedules/actions";
import LessonSlotDersSelect from "@/components/forms/LessonSlotDersSelect";
import { formatTimeForTimeInput } from "@/lib/time-hhmm";
import { WEEKDAYS_TR_MON_FIRST } from "@/lib/weekdays-tr";

export type LessonSlotEditFormProps = {
  slotId: string;
  studentId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string | null;
  /** Kayıtta öğretmen yoksa boş; güncellemede seçim zorunlu */
  teacherId: string | null;
  label: string | null;
  notes: string | null;
  students: readonly { id: string; name: string }[];
  teachers: readonly { id: string; name: string }[];
};

export default function LessonSlotEditForm({
  slotId,
  studentId,
  dayOfWeek,
  startTime,
  endTime,
  teacherId,
  label,
  notes,
  students,
  teachers
}: LessonSlotEditFormProps) {
  return (
    <form
      action={updateLessonSlot}
      className="grid gap-3 border-t border-zinc-800 pt-3 md:grid-cols-2 lg:grid-cols-4"
    >
      <input type="hidden" name="id" value={slotId} />

      <label className="flex flex-col gap-1 text-xs text-zinc-500 lg:col-span-2">
        Öğrenci
        <select
          name="studentId"
          required
          defaultValue={studentId}
          className="rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100"
        >
          {students.map((st) => (
            <option key={st.id} value={st.id}>
              {st.name}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-xs text-zinc-500">
        Gün
        <select
          name="dayOfWeek"
          required
          defaultValue={dayOfWeek}
          className="rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100"
        >
          {WEEKDAYS_TR_MON_FIRST.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1 text-xs text-zinc-500">
        Başlangıç
        <input
          name="startTime"
          type="time"
          required
          defaultValue={formatTimeForTimeInput(startTime)}
          className="rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100"
        />
      </label>

      <label className="flex flex-col gap-1 text-xs text-zinc-500">
        Bitiş (isteğe bağlı)
        <input
          name="endTime"
          type="time"
          defaultValue={formatTimeForTimeInput(endTime)}
          className="rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100"
        />
      </label>

      <label className="flex flex-col gap-1 text-xs text-zinc-500 lg:col-span-2">
        Öğretmen
        <select
          name="teacherId"
          required
          defaultValue={teacherId ?? ""}
          className="rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100"
        >
          <option value="" disabled>
            Seçin
          </option>
          {teacherId && !teachers.some((t) => t.id === teacherId) ? (
            <option value={teacherId}>Kayıtlı öğretmen (listeden çıkmış)</option>
          ) : null}
          {teachers.map((th) => (
            <option key={th.id} value={th.id}>
              {th.name}
            </option>
          ))}
        </select>
      </label>

      <LessonSlotDersSelect defaultLabel={label} />

      <label className="flex flex-col gap-1 text-xs text-zinc-500 lg:col-span-2">
        Not
        <input
          name="notes"
          defaultValue={notes ?? ""}
          className="rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100"
        />
      </label>

      <div className="flex items-end lg:col-span-4">
        <button
          type="submit"
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium hover:bg-brand-500"
        >
          Güncelle
        </button>
      </div>
    </form>
  );
}
