import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { PrismaClient } from "@prisma/client";

const EXPORT_PATH = join(process.cwd(), "prisma", "data", "local-db-export.json");

export type LocalDbExport = {
  users: Record<string, unknown>[];
  teachers: Record<string, unknown>[];
  students: Record<string, unknown>[];
  courses: Record<string, unknown>[];
  enrollments: Record<string, unknown>[];
  studentLessonSlots: Record<string, unknown>[];
  studentAbsences: Record<string, unknown>[];
  teacherApplications: Record<string, unknown>[];
  passwordResetCodes: Record<string, unknown>[];
  attendanceLogs: Record<string, unknown>[];
};

function asDate(v: unknown): Date {
  if (v instanceof Date) return v;
  if (typeof v === "number") return new Date(v);
  if (typeof v === "string") return new Date(v);
  return new Date();
}

function asBool(v: unknown): boolean {
  if (typeof v === "boolean") return v;
  return v === 1 || v === "1" || v === "true";
}

export function hasLocalDbExport(): boolean {
  return existsSync(EXPORT_PATH);
}

export function readLocalDbExport(): LocalDbExport | null {
  if (!hasLocalDbExport()) return null;
  return JSON.parse(readFileSync(EXPORT_PATH, "utf8")) as LocalDbExport;
}

/** Yerel sqlite export → Postgres (mevcut veriyi siler, export ile doldurur). */
export async function importLocalDbExport(prisma: PrismaClient): Promise<{
  users: number;
  students: number;
  teachers: number;
} | null> {
  const data = readLocalDbExport();
  if (!data?.users?.length) return null;

  const {
    users,
    teachers,
    students,
    courses,
    enrollments,
    studentLessonSlots,
    studentAbsences,
    teacherApplications,
    passwordResetCodes,
    attendanceLogs
  } = data;

  await prisma.$transaction([
    prisma.enrollment.deleteMany(),
    prisma.studentLessonSlot.deleteMany(),
    prisma.studentAbsence.deleteMany(),
    prisma.course.deleteMany(),
    prisma.student.deleteMany(),
    prisma.teacher.deleteMany(),
    prisma.passwordResetCode.deleteMany(),
    prisma.attendanceLog.deleteMany(),
    prisma.teacherApplication.deleteMany(),
    prisma.user.deleteMany()
  ]);

  for (const u of users) {
    await prisma.user.create({
      data: {
        id: String(u.id),
        email: String(u.email),
        name: String(u.name),
        passwordHash: String(u.passwordHash),
        role: String(u.role),
        createdAt: asDate(u.createdAt),
        updatedAt: asDate(u.updatedAt)
      }
    });
  }

  for (const t of teachers) {
    await prisma.teacher.create({
      data: {
        id: String(t.id),
        userId: String(t.userId),
        phone: String(t.phone),
        instruments: String(t.instruments),
        tcKimlikNo: t.tcKimlikNo != null ? String(t.tcKimlikNo) : null,
        fatherName: t.fatherName != null ? String(t.fatherName) : null,
        address: t.address != null ? String(t.address) : null,
        birthDate: t.birthDate != null ? String(t.birthDate) : null,
        birthPlace: t.birthPlace != null ? String(t.birthPlace) : null,
        employmentStartDate:
          t.employmentStartDate != null ? String(t.employmentStartDate) : null,
        insuranceStartDate: t.insuranceStartDate != null ? String(t.insuranceStartDate) : null,
        approved: asBool(t.approved),
        createdAt: asDate(t.createdAt)
      }
    });
  }

  for (const s of students) {
    await prisma.student.create({
      data: {
        id: String(s.id),
        userId: String(s.userId),
        phone: String(s.phone ?? ""),
        instrument: String(s.instrument),
        parentName: s.parentName != null ? String(s.parentName) : null,
        parentPhone: s.parentPhone != null ? String(s.parentPhone) : null,
        primaryTeacherId: s.primaryTeacherId != null ? String(s.primaryTeacherId) : null,
        createdAt: asDate(s.createdAt)
      }
    });
  }

  for (const c of courses) {
    await prisma.course.create({
      data: {
        id: String(c.id),
        name: String(c.name),
        instrument: String(c.instrument),
        teacherId: String(c.teacherId)
      }
    });
  }

  for (const e of enrollments) {
    await prisma.enrollment.create({
      data: {
        id: String(e.id),
        studentId: String(e.studentId),
        courseId: String(e.courseId),
        createdAt: asDate(e.createdAt)
      }
    });
  }

  for (const sl of studentLessonSlots) {
    await prisma.studentLessonSlot.create({
      data: {
        id: String(sl.id),
        studentId: String(sl.studentId),
        scopeType: String(sl.scopeType),
        dayOfWeek: Number(sl.dayOfWeek),
        startTime: String(sl.startTime),
        endTime: sl.endTime != null ? String(sl.endTime) : null,
        teacherId: sl.teacherId != null ? String(sl.teacherId) : null,
        label: sl.label != null ? String(sl.label) : null,
        notes: sl.notes != null ? String(sl.notes) : null,
        createdAt: asDate(sl.createdAt),
        updatedAt: asDate(sl.updatedAt)
      }
    });
  }

  for (const a of studentAbsences) {
    await prisma.studentAbsence.create({
      data: {
        id: String(a.id),
        studentId: String(a.studentId),
        absenceDate: String(a.absenceDate),
        notes: a.notes != null ? String(a.notes) : null,
        createdAt: asDate(a.createdAt)
      }
    });
  }

  for (const ap of teacherApplications) {
    await prisma.teacherApplication.create({
      data: {
        id: String(ap.id),
        name: String(ap.name),
        email: String(ap.email),
        phone: String(ap.phone),
        instrument: String(ap.instrument),
        experience: Number(ap.experience),
        bio: ap.bio != null ? String(ap.bio) : null,
        status: String(ap.status),
        createdAt: asDate(ap.createdAt)
      }
    });
  }

  for (const r of passwordResetCodes) {
    await prisma.passwordResetCode.create({
      data: {
        id: String(r.id),
        userId: String(r.userId),
        codeHash: String(r.codeHash),
        expiresAt: asDate(r.expiresAt),
        consumed: asBool(r.consumed),
        createdAt: asDate(r.createdAt)
      }
    });
  }

  for (const att of attendanceLogs) {
    await prisma.attendanceLog.create({
      data: {
        id: String(att.id),
        userId: String(att.userId),
        date: asDate(att.date),
        checkIn: att.checkIn != null ? asDate(att.checkIn) : null,
        checkOut: att.checkOut != null ? asDate(att.checkOut) : null
      }
    });
  }

  return { users: users.length, students: students.length, teachers: teachers.length };
}
