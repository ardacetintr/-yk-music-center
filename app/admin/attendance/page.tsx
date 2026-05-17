import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminSubNav from "@/components/admin/AdminSubNav";
import AttendanceDayList, { type AttendanceDayRow } from "@/components/admin/AttendanceDayList";
import AttendanceDatePicker from "@/components/admin/AttendanceDatePicker";
import { greetingDisplayName } from "@/lib/display-name";
import { getAdminLoadErrorMessage } from "@/lib/admin-load-error";
import { bootstrapProductionDatabaseIfNeeded } from "@/lib/bootstrap-production-db";
import { ATTENDANCE_ABSENT, isAttendanceStatus } from "@/lib/attendance-status";
import {
  addDaysToIsoDate,
  compareTimeHHmm,
  formatIsoDateTr,
  isoDateToSchemaDayOfWeek,
  parseIsoDateOrToday,
  todayIsoInIstanbul
} from "@/lib/lesson-calendar";

export default async function AdminAttendancePage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getServerSession();
  if (!session) redirect("/admin/login");
  if (session.role !== "ADMIN") redirect("/dashboard");

  await bootstrapProductionDatabaseIfNeeded();

  const resolved = searchParams ? await searchParams : undefined;
  const rawDate = typeof resolved?.date === "string" ? resolved.date : undefined;
  const sessionDate = parseIsoDateOrToday(rawDate);
  const dayOfWeek = isoDateToSchemaDayOfWeek(sessionDate);
  const dateLabel = formatIsoDateTr(sessionDate);
  const isToday = sessionDate === todayIsoInIstanbul();

  const prevDate = addDaysToIsoDate(sessionDate, -1);
  const nextDate = addDaysToIsoDate(sessionDate, 1);

  let loadError: string | null = null;
  let rows: AttendanceDayRow[] = [];

  try {
    const studentIdsForDay = (
      await prisma.studentLessonSlot.findMany({
        where: { dayOfWeek },
        select: { studentId: true },
        distinct: ["studentId"]
      })
    ).map((s) => s.studentId);

    const [slots, records, absences] = await Promise.all([
      prisma.studentLessonSlot.findMany({
        where: { dayOfWeek },
        include: {
          student: { include: { user: true } },
          teacher: { include: { user: true } }
        }
      }),
      prisma.lessonSessionAttendance.findMany({
        where: { sessionDate }
      }),
      studentIdsForDay.length > 0
        ? prisma.studentAbsence.findMany({
            where: { absenceDate: sessionDate, studentId: { in: studentIdsForDay } }
          })
        : Promise.resolve([])
    ]);

    const recordBySlot = new Map(records.map((r) => [r.lessonSlotId, r]));
    const absentStudentIds = new Set(absences.map((a) => a.studentId));

    const sorted = [...slots].sort((a, b) => {
      const t = compareTimeHHmm(a.startTime, b.startTime);
      if (t !== 0) return t;
      return a.student.user.name.localeCompare(b.student.user.name, "tr");
    });

    rows = sorted.map((slot) => {
      const rec = recordBySlot.get(slot.id);
      let status: AttendanceDayRow["status"] = null;
      if (rec && isAttendanceStatus(rec.status)) {
        status = rec.status as AttendanceDayRow["status"];
      } else if (absentStudentIds.has(slot.studentId)) {
        status = ATTENDANCE_ABSENT;
      }

      return {
        slotId: slot.id,
        studentName: slot.student.user.name,
        teacherId: slot.teacherId,
        teacherName: slot.teacher?.user.name ?? null,
        startTime: slot.startTime,
        endTime: slot.endTime,
        label: slot.label,
        instrument: slot.student.instrument,
        status
      };
    });
  } catch (e) {
    console.error(e);
    loadError = getAdminLoadErrorMessage();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs text-zinc-500">
            <Link href="/admin" className="text-brand-400 hover:text-brand-300">
              Yönetim
            </Link>
          </p>
          <h1 className="text-2xl font-semibold">Yoklama</h1>
          <p className="mt-1 text-zinc-400">
            Seçilen günün ders programına göre geldi / gelmedi işaretleyin. Devamsızlık sekmesiyle
            senkron çalışır.
          </p>
        </div>
        <p className="text-sm text-zinc-500">{greetingDisplayName(session.name)}</p>
      </div>

      <AdminSubNav current="attendance" />

      {loadError ? (
        <div className="rounded-xl border border-red-900/80 bg-red-950/40 px-4 py-3 text-sm text-red-200">
          {loadError}
        </div>
      ) : null}

      <section className="card space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold capitalize text-zinc-100">{dateLabel}</h2>
            {isToday ? (
              <p className="mt-0.5 text-xs text-brand-400">Bugün</p>
            ) : (
              <p className="mt-0.5 text-xs text-zinc-500">{sessionDate}</p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/admin/attendance?date=${prevDate}`}
              className="rounded-lg border border-zinc-600 px-3 py-1.5 text-xs text-zinc-200 hover:bg-zinc-800"
            >
              ← Önceki gün
            </Link>
            {!isToday ? (
              <Link
                href="/admin/attendance"
                className="rounded-lg border border-brand-700/60 bg-brand-950/40 px-3 py-1.5 text-xs text-brand-200 hover:bg-brand-900/40"
              >
                Bugün
              </Link>
            ) : null}
            <Link
              href={`/admin/attendance?date=${nextDate}`}
              className="rounded-lg border border-zinc-600 px-3 py-1.5 text-xs text-zinc-200 hover:bg-zinc-800"
            >
              Sonraki gün →
            </Link>
          </div>
        </div>

        <AttendanceDatePicker sessionDate={sessionDate} />

        <p className="text-[11px] text-zinc-500">
          Liste yalnızca bu günün haftanın gününe denk gelen ders şablonlarını gösterir; saate göre sıralanır.
        </p>

        {!loadError ? (
          <AttendanceDayList sessionDate={sessionDate} dateLabel={dateLabel} rows={rows} />
        ) : null}
      </section>
    </div>
  );
}
