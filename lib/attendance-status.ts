export const ATTENDANCE_PRESENT = "PRESENT" as const;
export const ATTENDANCE_ABSENT = "ABSENT" as const;

export type AttendanceStatusValue = typeof ATTENDANCE_PRESENT | typeof ATTENDANCE_ABSENT;

export function isAttendanceStatus(value: string): value is AttendanceStatusValue {
  return value === ATTENDANCE_PRESENT || value === ATTENDANCE_ABSENT;
}
