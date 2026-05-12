import { STUDENT_COURSE_OPTIONS } from "@/lib/student-course-options";

type Props = {
  /** `StudentLessonSlot.label` — kurs adı veya eski serbest metin */
  defaultLabel: string | null;
  labelClassName?: string;
  selectClassName?: string;
};

/** Ders programı formları: `name="label"` ile kurs seçimi (DB alanı aynı). */
export default function LessonSlotDersSelect({
  defaultLabel,
  labelClassName = "flex flex-col gap-1 text-xs text-zinc-500",
  selectClassName = "rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100"
}: Props) {
  const raw = defaultLabel?.trim() ?? "";
  const inList = raw !== "" && (STUDENT_COURSE_OPTIONS as readonly string[]).includes(raw);

  return (
    <label className={labelClassName}>
      Ders (isteğe bağlı)
      <select name="label" defaultValue={raw} className={selectClassName}>
        <option value="">—</option>
        {STUDENT_COURSE_OPTIONS.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
        {raw && !inList ? (
          <option value={raw}>
            {raw} (kayıtlı)
          </option>
        ) : null}
      </select>
    </label>
  );
}
