import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminSubNav from "@/components/admin/AdminSubNav";
import { greetingDisplayName } from "@/lib/display-name";
import { getAdminLoadErrorMessage } from "@/lib/admin-load-error";
import { bootstrapProductionDatabaseIfNeeded } from "@/lib/bootstrap-production-db";
import { formatIsoDateTr, parseIsoDateOrToday, todayIsoInIstanbul } from "@/lib/lesson-calendar";
import { formatTurkishMoney } from "@/lib/money";
import {
  countTeacherPresentLessons,
  listTeacherPresentLessons
} from "@/lib/teacher-lesson-count";
import {
  formatTeacherPaymentScheduleLabel,
  getTeacherPayPeriod,
  isTeacherPaymentDueOnDate,
  teacherRateToNumber
} from "@/lib/teacher-payment";

export default async function AdminTeacherPaymentsPage({
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
  const referenceDate = parseIsoDateOrToday(rawDate);
  const todayISO = todayIsoInIstanbul();
  const dateLabel = formatIsoDateTr(referenceDate);

  let loadError: string | null = null;
  type TeacherRow = Awaited<
    ReturnType<typeof prisma.teacher.findMany<{ include: { user: true } }>>
  >[number];

  let teachers: TeacherRow[] = [];
  let rows: {
    teacher: TeacherRow;
    periodStart: string;
    periodEnd: string;
    lessonCount: number;
    rate: number | null;
    total: number | null;
    dueToday: boolean;
    lessons: Awaited<ReturnType<typeof listTeacherPresentLessons>>;
  }[] = [];

  try {
    teachers = await prisma.teacher.findMany({
      include: { user: true },
      orderBy: { user: { name: "asc" } }
    });

    rows = await Promise.all(
      teachers.map(async (teacher) => {
        const { startDate, endDate } = getTeacherPayPeriod(teacher, referenceDate);
        const lessonCount = await countTeacherPresentLessons(teacher.id, startDate, endDate);
        const rate = teacherRateToNumber(teacher.ratePerLesson);
        const total = rate != null && rate > 0 ? lessonCount * rate : null;
        const dueToday = isTeacherPaymentDueOnDate(teacher, referenceDate);
        const lessons =
          lessonCount > 0
            ? await listTeacherPresentLessons(teacher.id, startDate, endDate)
            : [];

        return {
          teacher,
          periodStart: startDate,
          periodEnd: endDate,
          lessonCount,
          rate,
          total,
          dueToday,
          lessons
        };
      })
    );
  } catch (e) {
    console.error(e);
    loadError = getAdminLoadErrorMessage();
  }

  const dueRows = rows.filter((r) => r.dueToday);
  const grandTotal = rows.reduce((sum, r) => sum + (r.total ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs text-zinc-500">
            <Link href="/admin" className="text-brand-400 hover:text-brand-300">
              Yönetim
            </Link>
          </p>
          <h1 className="text-2xl font-semibold">Öğretmen ödemeleri</h1>
          <p className="mt-1 text-zinc-400">
            Yoklamada <span className="text-emerald-400/90">geldi</span> işaretlenen dersler, öğretmenin
            ders programındaki slotlarına göre sayılır.
          </p>
        </div>
        <p className="text-sm text-zinc-500">{greetingDisplayName(session.name)}</p>
      </div>

      <AdminSubNav current="teacher-payments" />

      {loadError ? (
        <div className="rounded-xl border border-red-900/80 bg-red-950/40 px-4 py-3 text-sm text-red-200">
          {loadError}
        </div>
      ) : null}

      <section className="card space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold capitalize text-zinc-100">{dateLabel}</h2>
            <p className="mt-0.5 text-xs text-zinc-500">
              Dönem sonu: {referenceDate}
              {referenceDate === todayISO ? (
                <span className="ml-2 text-brand-400">Bugün</span>
              ) : null}
            </p>
          </div>
          <form method="get" className="flex items-end gap-2">
            <label className="flex flex-col gap-1 text-xs text-zinc-500">
              Tarih
              <input
                type="date"
                name="date"
                defaultValue={referenceDate}
                className="rounded-lg border border-zinc-700 bg-black px-3 py-1.5 text-sm text-zinc-100"
              />
            </label>
            <button
              type="submit"
              className="rounded-lg border border-zinc-600 px-3 py-1.5 text-xs text-zinc-200 hover:bg-zinc-800"
            >
              Göster
            </button>
            {referenceDate !== todayISO ? (
              <Link
                href="/admin/teacher-payments"
                className="rounded-lg border border-brand-700/60 bg-brand-950/40 px-3 py-1.5 text-xs text-brand-200 hover:bg-brand-900/40"
              >
                Bugün
              </Link>
            ) : null}
          </form>
        </div>

        {!loadError && dueRows.length > 0 ? (
          <p className="rounded-lg border border-amber-800/50 bg-amber-950/30 px-3 py-2 text-sm text-amber-100">
            <span className="font-medium">{dueRows.length} öğretmen</span> için bugün ödeme günü. Toplam
            ödeme: <span className="font-medium">{formatTurkishMoney(dueRows.reduce((s, r) => s + (r.total ?? 0), 0))}</span>
          </p>
        ) : null}

        {!loadError && rows.length > 0 ? (
          <p className="text-xs text-zinc-500">
            Tüm öğretmenler (bu dönem): {formatTurkishMoney(grandTotal)}
          </p>
        ) : null}
      </section>

      {!loadError ? (
        <section className="space-y-3">
          {rows.length === 0 ? (
            <p className="card text-sm text-zinc-500">Kayıtlı öğretmen yok.</p>
          ) : (
            rows.map((row) => (
              <details
                key={row.teacher.id}
                className={`card overflow-hidden ${row.dueToday ? "ring-1 ring-amber-600/50" : ""}`}
                open={row.dueToday}
              >
                <summary className="cursor-pointer list-none">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-zinc-100">{row.teacher.user.name}</p>
                      <p className="mt-0.5 text-xs text-zinc-500">
                        {formatTeacherPaymentScheduleLabel(row.teacher)}
                        {row.rate != null ? (
                          <span className="text-zinc-400">
                            {" "}
                            · ders başı {formatTurkishMoney(row.rate)}
                          </span>
                        ) : (
                          <span className="text-amber-400/90"> · ücret tanımlı değil</span>
                        )}
                      </p>
                      <p className="mt-1 text-[11px] text-zinc-600">
                        Dönem: {row.periodStart} — {row.periodEnd}
                      </p>
                    </div>
                    <div className="text-right">
                      {row.dueToday ? (
                        <span className="mb-1 inline-block rounded-full bg-amber-900/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-amber-200">
                          Ödeme günü
                        </span>
                      ) : null}
                      <p className="text-2xl font-semibold tabular-nums text-emerald-300">
                        {row.total != null ? formatTurkishMoney(row.total) : "—"}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {row.lessonCount} ders (geldi)
                      </p>
                    </div>
                  </div>
                </summary>

                {row.lessons.length > 0 ? (
                  <div className="mt-4 overflow-x-auto border-t border-zinc-800 pt-3">
                    <table className="w-full min-w-[24rem] text-left text-xs">
                      <thead>
                        <tr className="text-zinc-500">
                          <th className="py-1 pr-3 font-medium">Tarih</th>
                          <th className="py-1 pr-3 font-medium">Saat</th>
                          <th className="py-1 pr-3 font-medium">Öğrenci</th>
                          <th className="py-1 font-medium">Enstrüman</th>
                        </tr>
                      </thead>
                      <tbody>
                        {row.lessons.map((lesson, i) => (
                          <tr key={`${lesson.sessionDate}-${lesson.startTime}-${i}`} className="border-t border-zinc-800/60 text-zinc-300">
                            <td className="py-1.5 pr-3">{lesson.sessionDate}</td>
                            <td className="py-1.5 pr-3">{lesson.startTime}</td>
                            <td className="py-1.5 pr-3">{lesson.studentName}</td>
                            <td className="py-1.5">{lesson.instrument}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="mt-3 border-t border-zinc-800 pt-3 text-xs text-zinc-500">
                    Bu dönemde yoklamada geldi işaretli ders yok.
                  </p>
                )}
              </details>
            ))
          )}
        </section>
      ) : null}

      <p className="text-[11px] text-zinc-600">
        Ödeme periyodu ve ders ücretini{" "}
        <Link href="/admin" className="text-brand-400 hover:text-brand-300">
          Panel → Öğretmenler
        </Link>{" "}
        veya{" "}
        <Link href="/admin/register-teacher" className="text-brand-400 hover:text-brand-300">
          Öğretmen kaydı
        </Link>{" "}
        bölümünden düzenleyebilirsiniz.
      </p>
    </div>
  );
}
