import { revalidatePath } from "next/cache";
import { ATTENDANCE_ABSENT } from "@/lib/attendance-status";
import { isoDateToSchemaDayOfWeek } from "@/lib/lesson-calendar";
import { prisma } from "@/lib/prisma";

/** Devamsızlık listesinde yoklamadan otomatik oluşan kayıtlar (isteğe bağlı not). */
export const ATTENDANCE_ABSENCE_NOTE = "Yoklamadan (otomatik)";

export function revalidateAttendanceAndAbsences(sessionDate: string) {
  revalidatePath("/admin/attendance");
  revalidatePath(`/admin/attendance?date=${sessionDate}`);
  revalidatePath("/admin/absences");
}

async function studentHasAbsentLessonOnDate(studentId: string, sessionDate: string) {
  const dayOfWeek = isoDateToSchemaDayOfWeek(sessionDate);
  const slots = await prisma.studentLessonSlot.findMany({
    where: { studentId, dayOfWeek },
    select: { id: true }
  });
  if (slots.length === 0) return false;

  const absentCount = await prisma.lessonSessionAttendance.count({
    where: {
      lessonSlotId: { in: slots.map((s) => s.id) },
      sessionDate,
      status: ATTENDANCE_ABSENT
    }
  });
  return absentCount > 0;
}

/** Yoklama işaretine göre öğrenci devamsızlık kaydını günceller. */
export async function syncStudentAbsenceFromLessonAttendance(
  studentId: string,
  sessionDate: string,
  attendanceAction: "PRESENT" | "ABSENT" | "clear"
) {
  if (attendanceAction === "ABSENT") {
    const existing = await prisma.studentAbsence.findFirst({
      where: { studentId, absenceDate: sessionDate }
    });
    if (!existing) {
      await prisma.studentAbsence.create({
        data: {
          studentId,
          absenceDate: sessionDate,
          notes: ATTENDANCE_ABSENCE_NOTE
        }
      });
    }
    return;
  }

  const stillAbsent = await studentHasAbsentLessonOnDate(studentId, sessionDate);
  if (!stillAbsent) {
    await prisma.studentAbsence.deleteMany({
      where: { studentId, absenceDate: sessionDate }
    });
  }
}

/** Devamsızlık kaydı eklendiğinde o günün ders şablonlarına gelmedi işareti yazar. */
export async function syncLessonAttendanceFromStudentAbsence(
  studentId: string,
  absenceDate: string
) {
  const dayOfWeek = isoDateToSchemaDayOfWeek(absenceDate);
  const slots = await prisma.studentLessonSlot.findMany({
    where: { studentId, dayOfWeek },
    select: { id: true }
  });

  for (const slot of slots) {
    await prisma.lessonSessionAttendance.upsert({
      where: {
        lessonSlotId_sessionDate: { lessonSlotId: slot.id, sessionDate: absenceDate }
      },
      create: {
        lessonSlotId: slot.id,
        sessionDate: absenceDate,
        status: ATTENDANCE_ABSENT
      },
      update: { status: ATTENDANCE_ABSENT }
    });
  }
}

/** Devamsızlık kaydı silindiğinde o güne ait otomatik gelmedi işaretlerini kaldırır. */
export async function clearLessonAttendanceFromStudentAbsence(
  studentId: string,
  absenceDate: string
) {
  const dayOfWeek = isoDateToSchemaDayOfWeek(absenceDate);
  const slots = await prisma.studentLessonSlot.findMany({
    where: { studentId, dayOfWeek },
    select: { id: true }
  });
  const slotIds = slots.map((s) => s.id);
  if (slotIds.length === 0) return;

  await prisma.lessonSessionAttendance.deleteMany({
    where: {
      lessonSlotId: { in: slotIds },
      sessionDate: absenceDate,
      status: ATTENDANCE_ABSENT
    }
  });
}
