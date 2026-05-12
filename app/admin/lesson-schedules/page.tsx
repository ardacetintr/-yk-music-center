import type { Prisma } from "@prisma/client";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminSubNav from "@/components/admin/AdminSubNav";
import { greetingDisplayName } from "@/lib/display-name";
import { WEEKDAYS_TR_MON_FIRST, weekdayLabelTr } from "@/lib/weekdays-tr";
import { addLessonSlot } from "./actions";
import LessonSlotActionSegments from "@/components/admin/LessonSlotActionSegments";
import PlannedLessonSlotsReveal from "@/components/admin/PlannedLessonSlotsReveal";
import LessonScheduleProgramViews from "@/components/admin/LessonScheduleProgramViews";
import LessonSlotDersSelect from "@/components/forms/LessonSlotDersSelect";
import LessonSlotEditForm from "@/components/forms/LessonSlotEditForm";
import LessonScheduleFlashToast from "@/components/admin/LessonScheduleFlashToast";

function toastFromSearchParams(searchParams?: Record<string, string | string[] | undefined>) {
  const raw = searchParams?.toast;
  return typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : undefined;
}

type SlotWithRelations = Prisma.StudentLessonSlotGetPayload<{
  include: {
    student: { include: { user: true } };
    teacher: { include: { user: true } };
  };
}>;

export default async function AdminLessonSchedulesPage({
  searchParams
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const session = await getServerSession();
  if (!session) redirect("/admin/login");
  if (session.role !== "ADMIN") redirect("/dashboard");

  let loadError: string | null = null;
  let students: Awaited<ReturnType<typeof prisma.student.findMany<{ include: { user: true } }>>> = [];
  let teachers: Awaited<ReturnType<typeof prisma.teacher.findMany<{ include: { user: true } }>>> = [];
  let slots: SlotWithRelations[] = [];

  try {
    const [s, t, sl] = await Promise.all([
      prisma.student.findMany({ include: { user: true }, orderBy: { user: { name: "asc" } } }),
      prisma.teacher.findMany({ include: { user: true }, orderBy: { user: { name: "asc" } } }),
      prisma.studentLessonSlot.findMany({
        include: {
          student: { include: { user: true } },
          teacher: { include: { user: true } }
        },
        orderBy: [
          { student: { user: { name: "asc" } } },
          { dayOfWeek: "asc" },
          { startTime: "asc" }
        ]
      })
    ]);
    students = s;
    teachers = t;
    slots = sl;
  } catch (e) {
    console.error(e);
    loadError =
      "Veritabanı hatası. `npx prisma db push` ve `npx prisma generate` çalıştırıp sunucuyu yeniden başlatın.";
  }

  function timeRange(slot: { startTime: string; endTime: string | null }) {
    return slot.endTime ? `${slot.startTime} – ${slot.endTime}` : slot.startTime;
  }

  const studentOptions = students.map((st) => ({ id: st.id, name: st.user.name }));
  const teacherOptions = teachers.map((th) => ({ id: th.id, name: th.user.name }));
  const toastKey = toastFromSearchParams(searchParams);

  return (
    <div className="space-y-6">
      <LessonScheduleFlashToast toastKey={toastKey} />
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs text-zinc-500">
            <Link href="/admin" className="text-brand-400 hover:text-brand-300">
              Yönetim
            </Link>
          </p>
          <h1 className="text-2xl font-semibold">Ders programı</h1>
          <p className="mt-1 text-zinc-400">
            Haftalık şablon oluşturun; çizelgede günlük, haftalık veya aylık görünümü kullanın.
          </p>
        </div>
        <p className="text-sm text-zinc-500">
          {greetingDisplayName(session.name)}
        </p>
      </div>

      <AdminSubNav current="schedule" />

      {loadError ? (
        <div className="rounded-xl border border-red-900/80 bg-red-950/40 px-4 py-3 text-sm text-red-200">
          {loadError}
        </div>
      ) : null}

      <section className="card space-y-4">
        <h2 className="text-lg font-semibold">Yeni ders satırı</h2>
        <form action={addLessonSlot} className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <label className="flex flex-col gap-1 text-xs text-zinc-500 md:col-span-2 lg:col-span-3">
            Öğrenci
            <select
              name="studentId"
              required
              className="rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100"
              defaultValue=""
            >
              <option value="" disabled>
                Seçin
              </option>
              {students.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.user.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs text-zinc-500">
            Gün
            <select
              name="dayOfWeek"
              required
              className="rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100"
            >
              {WEEKDAYS_TR_MON_FIRST.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 text-xs text-zinc-500">
            Başlangıç
            <input
              name="startTime"
              type="time"
              required
              className="rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs text-zinc-500">
            Bitiş (isteğe bağlı)
            <input
              name="endTime"
              type="time"
              className="rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100"
            />
          </label>

          <label className="flex flex-col gap-1 text-xs text-zinc-500 md:col-span-2 lg:col-span-2">
            Öğretmen (zorunlu)
            <select
              name="teacherId"
              required
              className="rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100"
              defaultValue=""
            >
              <option value="" disabled>
                Seçin
              </option>
              {teachers.map((th) => (
                <option key={th.id} value={th.id}>
                  {th.user.name}
                </option>
              ))}
            </select>
            <span className="text-[11px] text-zinc-500">
              Bu ders satırında seçtiğiniz öğrenci bu öğretmenden ders alır.
            </span>
          </label>

          <LessonSlotDersSelect defaultLabel={null} />

          <label className="flex flex-col gap-1 text-xs text-zinc-500 md:col-span-2 lg:col-span-3">
            Not (isteğe bağlı)
            <input
              name="notes"
              className="rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100"
            />
          </label>

          <div className="md:col-span-2 lg:col-span-3">
            <button type="submit" className="rounded-lg bg-brand-600 px-6 py-2 font-medium hover:bg-brand-500">
              Kaydet
            </button>
          </div>
        </form>
      </section>

      {!loadError ? (
        <section className="card space-y-4">
          <h2 className="text-lg font-semibold">Program çizelgesi</h2>
          <LessonScheduleProgramViews
            slots={slots.map((slot) => ({
              id: slot.id,
              studentId: slot.studentId,
              teacherId: slot.teacherId,
              dayOfWeek: slot.dayOfWeek,
              startTime: slot.startTime,
              endTime: slot.endTime,
              studentName: slot.student.user.name,
              teacherName: slot.teacher?.user.name ?? null,
              label: slot.label,
              notes: slot.notes
            }))}
          />
        </section>
      ) : null}

      <section className="card">
        <h2 className="mb-3 text-lg font-semibold">Planlanan dersler</h2>
        {slots.length === 0 ? (
          <p className="text-sm text-zinc-500">Henüz kayıt yok.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-xs uppercase tracking-wide text-zinc-500">
                  <th className="py-2 pr-3 font-medium">Öğrenci</th>
                  <th className="py-2 pr-3 font-medium">Gün</th>
                  <th className="py-2 pr-3 font-medium">Saat</th>
                  <th className="py-2 pr-3 font-medium">Öğretmen</th>
                  <th className="py-2 pr-3 font-medium">Not</th>
                  <th className="w-[1%] whitespace-nowrap py-2 pl-3 text-right font-medium">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody>
                <PlannedLessonSlotsReveal initialVisible={8} step={8} colSpan={6}>
                  {slots.map((slot) => (
                    <tr key={slot.id} className="border-b border-zinc-800/80">
                      <td className="py-2 pr-3 text-zinc-200">{slot.student.user.name}</td>
                      <td className="py-2 pr-3 text-zinc-300">{weekdayLabelTr(slot.dayOfWeek)}</td>
                      <td className="py-2 pr-3 font-mono text-xs text-zinc-300">{timeRange(slot)}</td>
                      <td className="py-2 pr-3 text-zinc-400">{slot.teacher?.user.name ?? "—"}</td>
                      <td className="max-w-[12rem] truncate py-2 pr-3 text-xs text-zinc-500">
                        {[slot.label, slot.notes].filter(Boolean).join(" · ") || "—"}
                      </td>
                      <td className="py-2 pl-3 align-top">
                        <LessonSlotActionSegments
                          slotId={slot.id}
                          hasTeacher={Boolean(slot.teacher)}
                          editForm={
                            <LessonSlotEditForm
                              key={`${slot.id}-${slot.updatedAt.toISOString()}`}
                              slotId={slot.id}
                              studentId={slot.studentId}
                              dayOfWeek={slot.dayOfWeek}
                              startTime={slot.startTime}
                              endTime={slot.endTime}
                              teacherId={slot.teacherId}
                              label={slot.label}
                              notes={slot.notes}
                              students={studentOptions}
                              teachers={teacherOptions}
                            />
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </PlannedLessonSlotsReveal>
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
