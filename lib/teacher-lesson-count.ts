import { ATTENDANCE_PRESENT } from "@/lib/attendance-status";
import { prisma } from "@/lib/prisma";

export async function countTeacherPresentLessons(
  teacherId: string,
  startDate: string,
  endDate: string
): Promise<number> {
  return prisma.lessonSessionAttendance.count({
    where: {
      status: ATTENDANCE_PRESENT,
      sessionDate: { gte: startDate, lte: endDate },
      lessonSlot: { teacherId }
    }
  });
}

export type TeacherLessonDetail = {
  sessionDate: string;
  startTime: string;
  studentName: string;
  instrument: string;
};

export async function listTeacherPresentLessons(
  teacherId: string,
  startDate: string,
  endDate: string
): Promise<TeacherLessonDetail[]> {
  const rows = await prisma.lessonSessionAttendance.findMany({
    where: {
      status: ATTENDANCE_PRESENT,
      sessionDate: { gte: startDate, lte: endDate },
      lessonSlot: { teacherId }
    },
    include: {
      lessonSlot: {
        include: {
          student: { include: { user: true } }
        }
      }
    },
    orderBy: [{ sessionDate: "desc" }, { lessonSlot: { startTime: "asc" } }]
  });

  return rows.map((r) => ({
    sessionDate: r.sessionDate,
    startTime: r.lessonSlot.startTime,
    studentName: r.lessonSlot.student.user.name,
    instrument: r.lessonSlot.student.instrument
  }));
}
