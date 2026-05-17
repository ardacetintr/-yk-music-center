"use server";

import { getServerSession } from "@/lib/auth";
import { isAttendanceStatus } from "@/lib/attendance-status";
import {
  revalidateAttendanceAndAbsences,
  syncStudentAbsenceFromLessonAttendance
} from "@/lib/attendance-absence-sync";
import { parseIsoDateOrToday } from "@/lib/lesson-calendar";
import { prisma } from "@/lib/prisma";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

async function ensureAdmin() {
  const session = await getServerSession();
  if (!session || session.role !== "ADMIN") {
    throw new Error("Yetkisiz işlem.");
  }
}

export async function setLessonSessionAttendance(formData: FormData) {
  await ensureAdmin();

  const lessonSlotId = String(formData.get("lessonSlotId") ?? "").trim();
  const sessionDate = parseIsoDateOrToday(String(formData.get("sessionDate") ?? ""));
  const action = String(formData.get("action") ?? "").trim();

  if (!lessonSlotId) throw new Error("Ders kaydı bulunamadı.");
  if (!ISO_DATE.test(sessionDate)) throw new Error("Geçersiz tarih.");

  const slot = await prisma.studentLessonSlot.findUnique({
    where: { id: lessonSlotId },
    select: { studentId: true }
  });
  if (!slot) throw new Error("Ders kaydı bulunamadı.");

  if (action === "clear") {
    await prisma.lessonSessionAttendance.deleteMany({
      where: { lessonSlotId, sessionDate }
    });
    await syncStudentAbsenceFromLessonAttendance(slot.studentId, sessionDate, "clear");
    revalidateAttendanceAndAbsences(sessionDate);
    return;
  }

  if (!isAttendanceStatus(action)) {
    throw new Error("Geçersiz yoklama durumu.");
  }

  await prisma.lessonSessionAttendance.upsert({
    where: {
      lessonSlotId_sessionDate: { lessonSlotId, sessionDate }
    },
    create: {
      lessonSlotId,
      sessionDate,
      status: action
    },
    update: {
      status: action
    }
  });

  await syncStudentAbsenceFromLessonAttendance(slot.studentId, sessionDate, action);
  revalidateAttendanceAndAbsences(sessionDate);
}
