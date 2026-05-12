import { isAllowedStudentCourse, STUDENT_COURSE_OPTIONS } from "@/lib/student-course-options";

/** Öğrenci kurs listesi ile aynı branşlar. */
export const TEACHER_BRANCH_OPTIONS = STUDENT_COURSE_OPTIONS;

export function serializeTeacherInstruments(selected: string[]): string {
  const unique = [...new Set(selected)].filter((s) => isAllowedStudentCourse(s)).sort();
  return JSON.stringify(unique);
}

/** DB'deki JSON dizisi veya eski tek metin `instrument` kalıntısı. */
export function deserializeTeacherInstruments(raw: string | null | undefined): string[] {
  const text = typeof raw === "string" ? raw : raw != null ? String(raw) : "";
  const trimmed = text.trim();
  if (trimmed === "") return [];
  try {
    const arr = JSON.parse(trimmed) as unknown;
    if (Array.isArray(arr)) {
      return [...new Set(arr.filter((x): x is string => typeof x === "string"))];
    }
  } catch {
    /* tek satır branş */
  }
  return trimmed ? [trimmed] : [];
}

export function parseInstrumentSelectionsFromForm(formData: FormData): string[] {
  const vals = formData.getAll("instruments").map(String).filter(Boolean);
  const ok = vals.filter((x) => isAllowedStudentCourse(x));
  return [...new Set(ok)];
}
