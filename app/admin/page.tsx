import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizePhone } from "@/lib/phone";
import { greetingDisplayName } from "@/lib/display-name";
import { isAllowedStudentCourse } from "@/lib/student-course-options";
import { TEACHER_BRANCH_OPTIONS, deserializeTeacherInstruments } from "@/lib/teacher-instruments";
import { parseTeacherProfileFromForm } from "@/lib/teacher-profile-fields";
import AdminRevealList from "@/components/admin/AdminRevealList";
import AdminStudentListSection from "@/components/admin/AdminStudentListSection";
import AdminSubNav from "@/components/admin/AdminSubNav";
import { isoDateInputValue } from "@/lib/date-input-value";
import {
  addLessonSlotInline,
  deleteLessonSlotInline,
  updateLessonSlotInline
} from "@/app/admin/lesson-schedules/actions";
import { formatTurkeyMobileDisplay } from "@/lib/student-login-whatsapp";
import { getAdminLoadErrorMessage } from "@/lib/admin-load-error";

type StudentWithUser = Prisma.StudentGetPayload<{ include: { user: true; primaryTeacher: { include: { user: true } } } }>;
type TeacherWithUser = Prisma.TeacherGetPayload<{ include: { user: true } }>;

async function updateTeacher(formData: FormData) {
  "use server";
  const id = String(formData.get("id") ?? "");
  const profile = parseTeacherProfileFromForm(formData);
  await prisma.teacher.update({
    where: { id },
    data: {
      instruments: profile.instrumentsJson,
      tcKimlikNo: profile.tcKimlikNo,
      fatherName: profile.fatherName,
      address: profile.address,
      birthDate: profile.birthDate,
      birthPlace: profile.birthPlace,
      employmentStartDate: profile.employmentStartDate,
      insuranceStartDate: profile.insuranceStartDate
    }
  });
  revalidatePath("/admin");
}

async function deleteStudent(formData: FormData) {
  "use server";
  const id = String(formData.get("id") || "");
  await prisma.student.delete({ where: { id } });
  revalidatePath("/admin");
}

async function deleteTeacher(formData: FormData) {
  "use server";
  const id = String(formData.get("id") || "");
  await prisma.teacher.delete({ where: { id } });
  revalidatePath("/admin");
}

export default async function AdminPage() {
  const session = await getServerSession();
  if (!session) redirect("/admin/login");
  if (session.role !== "ADMIN") redirect("/dashboard");

  let students: StudentWithUser[];
  let teachers: TeacherWithUser[];
  let loadError: string | null = null;

  const [studentsRes, teachersRes, slotsRes] = await Promise.allSettled([
    prisma.student.findMany({
      include: { user: true, primaryTeacher: { include: { user: true } } },
      orderBy: { createdAt: "desc" }
    }),
    prisma.teacher.findMany({ include: { user: true }, orderBy: { createdAt: "desc" } }),
    prisma.studentLessonSlot.findMany({
      select: {
        id: true,
        studentId: true,
        dayOfWeek: true,
        startTime: true,
        endTime: true,
        teacherId: true,
        label: true,
        notes: true,
        updatedAt: true
      },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }]
    })
  ]);

  let lessonSlots: {
    id: string;
    studentId: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string | null;
    teacherId: string | null;
    label: string | null;
    notes: string | null;
    updatedAt: string;
  }[] = [];

  students = studentsRes.status === "fulfilled" ? studentsRes.value : [];
  teachers = teachersRes.status === "fulfilled" ? teachersRes.value : [];
  lessonSlots =
    slotsRes.status === "fulfilled"
      ? slotsRes.value.map((s) => ({
          ...s,
          updatedAt: s.updatedAt.toISOString()
        }))
      : [];

  if (studentsRes.status === "rejected" || teachersRes.status === "rejected" || slotsRes.status === "rejected") {
    console.error("admin page load errors", {
      students: studentsRes.status === "rejected" ? studentsRes.reason : null,
      teachers: teachersRes.status === "rejected" ? teachersRes.reason : null,
      slots: slotsRes.status === "rejected" ? slotsRes.reason : null
    });
    loadError = getAdminLoadErrorMessage();
  }

  const teacherSelectOptions = teachers.map((t) => ({ id: t.id, name: t.user.name }));
  const studentListRows = students.map((s) => ({
    id: s.id,
    name: s.user.name,
    instrument: s.instrument,
    primaryTeacherId: s.primaryTeacherId,
    primaryTeacherName: s.primaryTeacher?.user.name ?? null,
    parentName: s.parentName,
    parentPhone: s.parentPhone,
    parentPhoneDisplay: s.parentPhone ? formatTurkeyMobileDisplay(normalizePhone(s.parentPhone)) : ""
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Yönetim Paneli</h1>
        <p className="mt-1 text-zinc-400">
          Hoş geldin,{" "}
          <span className="font-medium text-brand-600">{greetingDisplayName(session.name)}</span>
        </p>
      </div>
      {loadError ? (
        <div className="rounded-xl border border-red-900/80 bg-red-950/40 px-4 py-3 text-sm text-red-200">
          {loadError}
        </div>
      ) : null}

      <AdminSubNav current="overview" />

      <section className="card">
        <h2 className="mb-3 text-lg font-semibold">Öğrenciler</h2>
        <AdminStudentListSection
          students={studentListRows}
          teachers={teacherSelectOptions}
          lessonSlots={lessonSlots}
          deleteStudent={deleteStudent}
          addLessonSlotInline={addLessonSlotInline}
          updateLessonSlotInline={updateLessonSlotInline}
          deleteLessonSlotInline={deleteLessonSlotInline}
        />
      </section>

      <section className="card">
        <h2 className="mb-3 text-lg font-semibold">Öğretmenler</h2>
        <AdminRevealList
          className="space-y-2 text-sm text-zinc-300"
          initial={10}
          resetKey={teachers.map((t) => t.id).join("|")}
        >
          {teachers.map((teacher) => {
            const selectedBranches = deserializeTeacherInstruments(teacher.instruments);
            const legacyBranches = [
              ...new Set(selectedBranches.filter((b) => !isAllowedStudentCourse(b)))
            ];
            return (
              <details key={teacher.id} className="rounded-lg border border-zinc-800 bg-zinc-950/20 p-3">
                <summary className="cursor-pointer list-none font-medium text-zinc-200">
                  {teacher.user.name} — {formatTurkeyMobileDisplay(normalizePhone(teacher.phone))}
                </summary>
                <form action={updateTeacher} className="mt-3 space-y-3">
                  <input type="hidden" name="id" value={teacher.id} />

                  <fieldset className="space-y-2 rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2">
                    <legend className="px-1 text-xs text-zinc-500">Branşlar</legend>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 sm:grid-cols-3">
                      {legacyBranches.map((opt, idx) => (
                        <label
                          key={`${teacher.id}-legacy-${idx}-${opt}`}
                          className="flex cursor-pointer items-center gap-2 text-sm text-amber-200/90"
                        >
                          <input
                            type="checkbox"
                            name="instruments"
                            value={opt}
                            defaultChecked
                            className="rounded border-zinc-600"
                          />
                          <span className="leading-tight">{opt} (kayıtlı)</span>
                        </label>
                      ))}
                      {TEACHER_BRANCH_OPTIONS.map((opt) => (
                        <label key={opt} className="flex cursor-pointer items-center gap-2 text-sm text-zinc-300">
                          <input
                            type="checkbox"
                            name="instruments"
                            value={opt}
                            defaultChecked={selectedBranches.includes(opt)}
                            className="rounded border-zinc-600"
                          />
                          <span className="leading-tight">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>

                  <div className="grid gap-2 sm:grid-cols-2">
                    <label className="flex flex-col gap-0.5 text-xs text-zinc-500">
                      T.C. Kimlik No
                      <input
                        name="tcKimlikNo"
                        inputMode="numeric"
                        defaultValue={teacher.tcKimlikNo ?? ""}
                        placeholder="İsteğe bağlı"
                        className="rounded-lg border border-zinc-700 bg-black px-3 py-1.5 text-sm text-zinc-100"
                      />
                    </label>
                    <label className="flex flex-col gap-0.5 text-xs text-zinc-500">
                      Baba adı
                      <input
                        name="fatherName"
                        defaultValue={teacher.fatherName ?? ""}
                        placeholder="İsteğe bağlı"
                        className="rounded-lg border border-zinc-700 bg-black px-3 py-1.5 text-sm text-zinc-100"
                      />
                    </label>
                  </div>

                  <label className="flex flex-col gap-0.5 text-xs text-zinc-500">
                    Adres
                    <textarea
                      name="address"
                      rows={2}
                      defaultValue={teacher.address ?? ""}
                      placeholder="İsteğe bağlı"
                      className="rounded-lg border border-zinc-700 bg-black px-3 py-1.5 text-sm text-zinc-100"
                    />
                  </label>

                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    <label className="flex flex-col gap-0.5 text-xs text-zinc-500">
                      Doğum tarihi
                      <input
                        type="date"
                        name="birthDate"
                        defaultValue={isoDateInputValue(teacher.birthDate)}
                        className="rounded-lg border border-zinc-700 bg-black px-3 py-1.5 text-sm text-zinc-100"
                      />
                    </label>
                    <label className="flex flex-col gap-0.5 text-xs text-zinc-500">
                      Doğum yeri
                      <input
                        name="birthPlace"
                        defaultValue={teacher.birthPlace ?? ""}
                        placeholder="İsteğe bağlı"
                        className="rounded-lg border border-zinc-700 bg-black px-3 py-1.5 text-sm text-zinc-100"
                      />
                    </label>
                    <label className="flex flex-col gap-0.5 text-xs text-zinc-500">
                      İşe başlama
                      <input
                        type="date"
                        name="employmentStartDate"
                        defaultValue={isoDateInputValue(teacher.employmentStartDate)}
                        className="rounded-lg border border-zinc-700 bg-black px-3 py-1.5 text-sm text-zinc-100"
                      />
                    </label>
                    <label className="flex flex-col gap-0.5 text-xs text-zinc-500">
                      Sigorta başlangıcı
                      <input
                        type="date"
                        name="insuranceStartDate"
                        defaultValue={isoDateInputValue(teacher.insuranceStartDate)}
                        className="rounded-lg border border-zinc-700 bg-black px-3 py-1.5 text-sm text-zinc-100"
                      />
                    </label>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button type="submit" className="rounded-lg bg-brand-700 px-3 py-1.5">
                      Güncelle
                    </button>
                    <a
                      href={`/api/admin/teachers/${teacher.id}/contract?format=docx`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Metin şablonu: private/teacher-contract-template.txt"
                      className="rounded-lg border border-zinc-600 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-800"
                    >
                      Sözleşme (.docx)
                    </a>
                    <a
                      href={`/api/admin/teachers/${teacher.id}/contract?format=pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Aynı metin, PDF olarak"
                      className="rounded-lg border border-zinc-600 bg-zinc-900 px-3 py-1.5 text-xs font-medium text-zinc-200 hover:bg-zinc-800"
                    >
                      Sözleşme (PDF)
                    </a>
                    <button formAction={deleteTeacher} type="submit" className="rounded-lg bg-red-700 px-3 py-1.5">
                      Sil
                    </button>
                  </div>
                </form>
              </details>
            );
          })}
        </AdminRevealList>
      </section>
    </div>
  );
}
