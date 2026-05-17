import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizePhone } from "@/lib/phone";
import { greetingDisplayName } from "@/lib/display-name";
import { parseTeacherProfileFromForm } from "@/lib/teacher-profile-fields";
import { parseTeacherPaymentFromForm, teacherPaymentPrismaData } from "@/lib/teacher-payment";
import {
  courseFeeToNumber,
  parseStudentCourseBillingFromForm,
  studentCourseBillingPrismaData
} from "@/lib/student-course-billing";
import AdminOverviewAccordion from "@/components/admin/AdminOverviewAccordion";
import AdminStudentListSection from "@/components/admin/AdminStudentListSection";
import AdminTeacherListSection from "@/components/admin/AdminTeacherListSection";
import AdminSubNav from "@/components/admin/AdminSubNav";
import {
  addLessonSlotInline,
  deleteLessonSlotInline,
  updateLessonSlotInline
} from "@/app/admin/lesson-schedules/actions";
import { formatTurkeyMobileDisplay } from "@/lib/student-login-whatsapp";
import { getAdminLoadErrorMessage } from "@/lib/admin-load-error";
import { bootstrapProductionDatabaseIfNeeded } from "@/lib/bootstrap-production-db";
import { resolveDatabaseUrl } from "@/lib/database-url";
import AdminDbSyncBanner from "@/components/admin/AdminDbSyncBanner";
import { redirectWithAdminToast } from "@/lib/admin-toast-redirect";

type StudentWithUser = Prisma.StudentGetPayload<{ include: { user: true; primaryTeacher: { include: { user: true } } } }>;
type TeacherWithUser = Prisma.TeacherGetPayload<{ include: { user: true } }>;

async function updateTeacher(formData: FormData) {
  "use server";
  const id = String(formData.get("id") ?? "");
  const profile = parseTeacherProfileFromForm(formData);
  const payment = parseTeacherPaymentFromForm(formData);
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
      insuranceStartDate: profile.insuranceStartDate,
      ...teacherPaymentPrismaData(payment)
    }
  });
  redirectWithAdminToast("/admin", "teacher-updated");
}

async function updateStudentCourseBilling(formData: FormData) {
  "use server";
  const id = String(formData.get("studentId") ?? "").trim();
  if (!id) throw new Error("Öğrenci bulunamadı.");
  const billing = parseStudentCourseBillingFromForm(formData);
  await prisma.student.update({
    where: { id },
    data: studentCourseBillingPrismaData(billing)
  });
  redirectWithAdminToast("/admin", "student-billing-updated");
}

async function deleteStudent(formData: FormData) {
  "use server";
  const id = String(formData.get("id") || "");
  await prisma.student.delete({ where: { id } });
  redirectWithAdminToast("/admin", "student-deleted");
}

async function deleteTeacher(formData: FormData) {
  "use server";
  const id = String(formData.get("id") || "");
  await prisma.teacher.delete({ where: { id } });
  redirectWithAdminToast("/admin", "teacher-deleted");
}

export default async function AdminPage() {
  const session = await getServerSession();
  if (!session) redirect("/admin/login");
  if (session.role !== "ADMIN") redirect("/dashboard");

  await bootstrapProductionDatabaseIfNeeded();

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
  const teacherListRows = teachers.map((t) => ({
    id: t.id,
    phone: t.phone,
    phoneDisplay: formatTurkeyMobileDisplay(normalizePhone(t.phone)),
    name: t.user.name,
    instruments: t.instruments,
    tcKimlikNo: t.tcKimlikNo,
    fatherName: t.fatherName,
    address: t.address,
    birthDate: t.birthDate,
    birthPlace: t.birthPlace,
    employmentStartDate: t.employmentStartDate,
    insuranceStartDate: t.insuranceStartDate,
    paymentPeriod: t.paymentPeriod,
    ratePerLesson: t.ratePerLesson,
    paymentDueDayOfMonth: t.paymentDueDayOfMonth,
    paymentDueDayOfWeek: t.paymentDueDayOfWeek
  }));
  const studentListRows = students.map((s) => ({
    id: s.id,
    name: s.user.name,
    instrument: s.instrument,
    primaryTeacherId: s.primaryTeacherId,
    primaryTeacherName: s.primaryTeacher?.user.name ?? null,
    parentName: s.parentName,
    parentPhone: s.parentPhone,
    parentPhoneDisplay: s.parentPhone ? formatTurkeyMobileDisplay(normalizePhone(s.parentPhone)) : "",
    courseFee: courseFeeToNumber(s.courseFee),
    courseStartDate: s.courseStartDate,
    paymentDueDay: s.paymentDueDay ?? 1
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
        <AdminDbSyncBanner message={loadError} showSyncButton={Boolean(resolveDatabaseUrl())} />
      ) : null}

      <AdminSubNav current="overview" />

      <AdminOverviewAccordion>
        <section className="card">
          <h2 className="mb-3 text-lg font-semibold">Öğrenciler</h2>
          <AdminStudentListSection
            students={studentListRows}
            teachers={teacherSelectOptions}
            lessonSlots={lessonSlots}
            updateStudentCourseBilling={updateStudentCourseBilling}
            deleteStudent={deleteStudent}
            addLessonSlotInline={addLessonSlotInline}
            updateLessonSlotInline={updateLessonSlotInline}
            deleteLessonSlotInline={deleteLessonSlotInline}
          />
        </section>

        <section className="card">
          <h2 className="mb-3 text-lg font-semibold">Öğretmenler</h2>
          <AdminTeacherListSection
            teachers={teacherListRows}
            updateTeacher={updateTeacher}
            deleteTeacher={deleteTeacher}
          />
        </section>
      </AdminOverviewAccordion>
    </div>
  );
}