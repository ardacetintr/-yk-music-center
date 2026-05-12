"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "@/lib/auth";
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

  await prisma.studentAbsence.create({
    data: { studentId, absenceDate, notes }
  });
  revalidatePath("/admin/absences");
}

export async function deleteStudentAbsence(formData: FormData) {
  await ensureAdmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) throw new Error("Kayıt bulunamadı.");
  await prisma.studentAbsence.delete({ where: { id } });
  revalidatePath("/admin/absences");
}
