export const LESSON_SCOPE_INDIVIDUAL = "INDIVIDUAL";
export const LESSON_SCOPE_INSTITUTION = "INSTITUTION";

export type LessonScopeType =
  | typeof LESSON_SCOPE_INDIVIDUAL
  | typeof LESSON_SCOPE_INSTITUTION;

export function isLessonScope(value: string): value is LessonScopeType {
  return value === LESSON_SCOPE_INDIVIDUAL || value === LESSON_SCOPE_INSTITUTION;
}

export function lessonScopeLabelTr(scope: string): string {
  if (scope === LESSON_SCOPE_INSTITUTION) return "Kurum adına";
  return "Bireysel";
}
