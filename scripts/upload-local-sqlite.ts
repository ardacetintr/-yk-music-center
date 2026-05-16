/**
 * Yerel prisma/dev.db (SQLite) → Postgres (.env DATABASE_URL)
 * Turso gerekmez. sql.js kullanir (native derleme yok).
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import initSqlJs, { type Database } from "sql.js";
import { PrismaClient } from "@prisma/client";
import { applyResolvedDatabaseUrl } from "../lib/database-url";

import "../prisma/load-env";

const SQLITE_PATH = join(process.cwd(), "prisma", "dev.db");

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

function queryAll(db: Database, sql: string): Record<string, unknown>[] {
  const result = db.exec(sql);
  if (!result[0]) return [];
  const { columns, values } = result[0];
  return values.map((row) => {
    const obj: Record<string, unknown> = {};
    columns.forEach((col, i) => {
      obj[col] = row[i];
    });
    return obj;
  });
}

async function main() {
  const pgUrl = applyResolvedDatabaseUrl();
  if (!pgUrl) {
    console.error(
      "\nHATA: Bu bilgisayardaki .env dosyasinda postgresql:// adresi yok.\n" +
        "Vercel Storage → Neon → Connection string → .env icine DATABASE_URL=... yazin.\n" +
        "(Vercel'deki kilitli DATABASE_URL'i kopyalayabilirsiniz; yerel .env ayri dosyadir.)\n"
    );
    process.exit(1);
  }

  if (!existsSync(SQLITE_PATH)) {
    console.log("Yerel prisma/dev.db yok. npm run db:setup ile baslayabilirsiniz.");
    return;
  }

  const SQL = await initSqlJs();
  const fileBuffer = readFileSync(SQLITE_PATH);
  const sqlite = new SQL.Database(fileBuffer);
  const prisma = new PrismaClient();

  console.log("Yerel veriler Postgres e aktariliyor...");

  const users = queryAll(sqlite, `SELECT * FROM "User"`);
  const teachers = queryAll(sqlite, `SELECT * FROM "Teacher"`);
  const students = queryAll(sqlite, `SELECT * FROM "Student"`);
  const slots = queryAll(sqlite, `SELECT * FROM "StudentLessonSlot"`);
  const absences = queryAll(sqlite, `SELECT * FROM "StudentAbsence"`);
  const courses = queryAll(sqlite, `SELECT * FROM "Course"`);
  const enrollments = queryAll(sqlite, `SELECT * FROM "Enrollment"`);
  const apps = queryAll(sqlite, `SELECT * FROM "TeacherApplication"`);
  const resets = queryAll(sqlite, `SELECT * FROM "PasswordResetCode"`);
  const attendance = queryAll(sqlite, `SELECT * FROM "AttendanceLog"`);

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
        paymentDueDay: 1,
        paymentPaidMonth: null,
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

  for (const sl of slots) {
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

  for (const a of absences) {
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

  for (const ap of apps) {
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

  for (const r of resets) {
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

  for (const att of attendance) {
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

  sqlite.close();
  await prisma.$disconnect();

  console.log(
    `\nTamam: ${users.length} kullanici, ${students.length} ogrenci, ${teachers.length} ogretmen aktarildi.\n`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
