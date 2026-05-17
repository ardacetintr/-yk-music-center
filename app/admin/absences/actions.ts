"use server";

import { getServerSession } from "@/lib/auth";
import { redirectWithAdminToast } from "@/lib/admin-toast-redirect";
import {
  clearLessonAttendanceFromStudentAbsence,
  syncLessonAttendanceFromStudentAbsence
} from "@/lib/attendance-absence-sync";
import { prisma } from "@/lib/prisma";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

async function ensureAdmin() {
  const session = await getServerSession();
  if (!session || session.role !== "ADMIN") {
    throw new Error("Yetkisiz işlem.");
  }
}

export async function addStudentAbsence(formData: FormData) {
  await ensureAdmin();
  const studentId = String(formData.get("studentId") ?? "").trim();
  const absenceDate = String(formData.get("absenceDate") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!studentId) throw new Error("Öğrenci seçin.");
  if (!ISO_DATE.test(absenceDate)) throw new Error("Tarih YYYY-AA-GG olmalıdır.");

  const existing = await prisma.studentAbsence.findFirst({
    where: { studentId, absenceDate }
  });
  if (!existing) {
    await prisma.studentAbsence.create({
      data: { studentId, absenceDate, notes }
    });
  }

  await syncLessonAttendanceFromStudentAbsence(studentId, absenceDate);
  redirectWithAdminToast("/admin/absences", "absence-added");
}

export async function deleteStudentAbsence(formData: FormData) {
  await ensureAdmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) throw new Error("Kayıt bulunamadı.");

  const row = await prisma.studentAbsence.findUnique({
    where: { id },
    select: { studentId: true, absenceDate: true }
  });
  if (!row) throw new Error("Kayıt bulunamadı.");

  await prisma.studentAbsence.delete({ where: { id } });
  await clearLessonAttendanceFromStudentAbsence(row.studentId, row.absenceDate);
  redirectWithAdminToast("/admin/absences", "absence-deleted");
}
