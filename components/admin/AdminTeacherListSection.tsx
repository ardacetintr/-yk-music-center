"use client";

import AdminRevealList from "@/components/admin/AdminRevealList";
import TeacherPaymentSettingsFields from "@/components/admin/TeacherPaymentSettingsFields";
import { useAdminOverviewAccordion } from "@/components/admin/AdminOverviewAccordion";
import { isoDateInputValue } from "@/lib/date-input-value";
import { teacherPanelKey } from "@/lib/admin-panel-key";
import { isAllowedStudentCourse } from "@/lib/student-course-options";
import { TEACHER_BRANCH_OPTIONS, deserializeTeacherInstruments } from "@/lib/teacher-instruments";

export type AdminTeacherListRow = {
  id: string;
  phone: string;
  phoneDisplay: string;
  name: string;
  instruments: string;
  tcKimlikNo: string | null;
  fatherName: string | null;
  address: string | null;
  birthDate: string | null;
  birthPlace: string | null;
  employmentStartDate: string | null;
  insuranceStartDate: string | null;
  paymentPeriod: string;
  ratePerLesson: { toNumber?: () => number } | number | null;
  paymentDueDayOfMonth: number | null;
  paymentDueDayOfWeek: number | null;
};

type FormAction = (formData: FormData) => void | Promise<void>;

type Props = {
  teachers: AdminTeacherListRow[];
  updateTeacher: FormAction;
  deleteTeacher: FormAction;
};

export default function AdminTeacherListSection({
  teachers,
  updateTeacher,
  deleteTeacher
}: Props) {
  const { toggleKey, isOpen } = useAdminOverviewAccordion();

  if (teachers.length === 0) {
    return <p className="text-sm text-zinc-500">Henüz kayıtlı öğretmen yok.</p>;
  }

  return (
    <AdminRevealList
      className="space-y-2 text-sm text-zinc-300"
      initial={10}
      resetKey={teachers.map((t) => t.id).join("|")}
    >
      {teachers.map((teacher) => {
        const panelKey = teacherPanelKey(teacher.id);
        const open = isOpen(panelKey);
        const selectedBranches = deserializeTeacherInstruments(teacher.instruments);
        const legacyBranches = [
          ...new Set(selectedBranches.filter((b) => !isAllowedStudentCourse(b)))
        ];

        return (
          <div
            key={teacher.id}
            className={`rounded-lg border p-3 ${
              open ? "border-brand-500/40 bg-zinc-900/35" : "border-zinc-800 bg-zinc-950/20"
            }`}
          >
            <button
              type="button"
              aria-expanded={open}
              onClick={() => toggleKey(panelKey)}
              className="w-full cursor-pointer text-left font-medium text-zinc-200 hover:text-zinc-50"
            >
              {teacher.name} — {teacher.phoneDisplay}
            </button>
            {open ? (
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

                <TeacherPaymentSettingsFields teacher={teacher} />

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
            ) : null}
          </div>
        );
      })}
    </AdminRevealList>
  );
}
