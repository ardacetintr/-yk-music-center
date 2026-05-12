export const WEEKDAYS_TR_MON_FIRST = [
  { value: 1, label: "Pazartesi" },
  { value: 2, label: "Salı" },
  { value: 3, label: "Çarşamba" },
  { value: 4, label: "Perşembe" },
  { value: 5, label: "Cuma" },
  { value: 6, label: "Cumartesi" },
  { value: 7, label: "Pazar" }
] as const;

export function weekdayLabelTr(dayOfWeek: number): string {
  const row = WEEKDAYS_TR_MON_FIRST.find((d) => d.value === dayOfWeek);
  return row?.label ?? `Gün ${dayOfWeek}`;
}
