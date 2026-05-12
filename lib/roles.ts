export const UserRole = {
  ADMIN: "ADMIN",
  TEACHER: "TEACHER",
  STUDENT: "STUDENT",
  PARENT: "PARENT"
} as const;

export type UserRoleValue = (typeof UserRole)[keyof typeof UserRole];
