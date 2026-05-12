export const STUDENT_COURSE_OPTIONS = [
  "Elektro gitar",
  "Klasik Gitar",
  "Piyano",
  "Keman",
  "Bağlama",
  "Yan Flüt",
  "Flüt",
  "Ney",
  "Bateri",
  "Çello",
  "Şan Eğitimi"
] as const;

export function isAllowedStudentCourse(value: string): value is (typeof STUDENT_COURSE_OPTIONS)[number] {
  return (STUDENT_COURSE_OPTIONS as readonly string[]).includes(value);
}
