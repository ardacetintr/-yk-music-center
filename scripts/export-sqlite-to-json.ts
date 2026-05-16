import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import initSqlJs, { type Database } from "sql.js";
import type { LocalDbExport } from "../prisma/import-local-export";

const SQLITE_PATH = join(process.cwd(), "prisma", "dev.db");
const OUT_DIR = join(process.cwd(), "prisma", "data");
const OUT_PATH = join(OUT_DIR, "local-db-export.json");

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
  if (!existsSync(SQLITE_PATH)) {
    console.error("prisma/dev.db bulunamadi.");
    process.exit(1);
  }

  const SQL = await initSqlJs();
  const sqlite = new SQL.Database(readFileSync(SQLITE_PATH));

  const payload: LocalDbExport = {
    users: queryAll(sqlite, `SELECT * FROM "User"`),
    teachers: queryAll(sqlite, `SELECT * FROM "Teacher"`),
    students: queryAll(sqlite, `SELECT * FROM "Student"`),
    courses: queryAll(sqlite, `SELECT * FROM "Course"`),
    enrollments: queryAll(sqlite, `SELECT * FROM "Enrollment"`),
    studentLessonSlots: queryAll(sqlite, `SELECT * FROM "StudentLessonSlot"`),
    studentAbsences: queryAll(sqlite, `SELECT * FROM "StudentAbsence"`),
    teacherApplications: queryAll(sqlite, `SELECT * FROM "TeacherApplication"`),
    passwordResetCodes: queryAll(sqlite, `SELECT * FROM "PasswordResetCode"`),
    attendanceLogs: queryAll(sqlite, `SELECT * FROM "AttendanceLog"`)
  };

  sqlite.close();
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(OUT_PATH, JSON.stringify(payload, null, 0), "utf8");

  console.log(
    `Export: ${payload.students.length} ogrenci, ${payload.teachers.length} ogretmen, ${payload.users.length} kullanici`
  );
  console.log(`Dosya: ${OUT_PATH}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
