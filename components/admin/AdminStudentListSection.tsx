"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import AdminStudentLessonSlots, { type AdminLessonSlotRow } from "@/components/admin/AdminStudentLessonSlots";
import AdminStudentCourseBillingForm from "@/components/admin/AdminStudentCourseBillingForm";
import { formatTimeForTimeInput } from "@/lib/time-hhmm";
import { weekdayLabelTr } from "@/lib/weekdays-tr";
import { STUDENT_COURSE_OPTIONS } from "@/lib/student-course-options";

export type AdminStudentListRow = {
  id: string;
  name: string;
  instrument: string;
  primaryTeacherId: string | null;
  primaryTeacherName: string | null;
  parentName: string | null;
  /** Form `defaultValue` için DB’deki ham değer */
  parentPhone: string | null;
  parentPhoneDisplay: string;
  courseFee: number | null;
  courseStartDate: string | null;
  paymentDueDay: number;
};

type TeacherOption = { id: string; name: string };

type FormAction = (formData: FormData) => void | Promise<void>;

const SUMMARY_TABLE_INITIAL = 10;

type Props = {
  students: AdminStudentListRow[];
  teachers: TeacherOption[];
  lessonSlots: AdminLessonSlotRow[];
  updateStudentCourseBilling: FormAction;
  deleteStudent: FormAction;
  addLessonSlotInline: FormAction;
  updateLessonSlotInline: FormAction;
  deleteLessonSlotInline: FormAction;
};

function PencilIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

type StudentEditPanelProps = {
  student: AdminStudentListRow;
  teachers: TeacherOption[];
  studentSlots: AdminLessonSlotRow[];
  updateStudentCourseBilling: FormAction;
  deleteStudent: FormAction;
  addLessonSlotInline: FormAction;
  updateLessonSlotInline: FormAction;
  deleteLessonSlotInline: FormAction;
};

function StudentEditPanel({
  student,
  teachers,
  studentSlots,
  updateStudentCourseBilling,
  deleteStudent,
  addLessonSlotInline,
  updateLessonSlotInline,
  deleteLessonSlotInline
}: StudentEditPanelProps) {
  return (
    <div className="space-y-6 border-l-2 border-brand-500/60 py-1 pl-4 sm:pl-5">
      <AdminStudentCourseBillingForm
        studentId={student.id}
        courseFee={student.courseFee}
        courseStartDate={student.courseStartDate}
        paymentDueDay={student.paymentDueDay}
        updateAction={updateStudentCourseBilling}
      />
      <AdminStudentLessonSlots
        layout="panelLead"
        studentId={student.id}
        primaryTeacherId={student.primaryTeacherId}
        teachers={teachers}
        slots={studentSlots}
        addLessonSlotInline={addLessonSlotInline}
        updateLessonSlotInline={updateLessonSlotInline}
        deleteLessonSlotInline={deleteLessonSlotInline}
      />

      <form
        action={deleteStudent}
        className="border-t border-zinc-800 pt-4"
        onSubmit={(e) => {
          if (
            !window.confirm(
              "Bu öğrencinin kaydını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz."
            )
          ) {
            e.preventDefault();
          }
        }}
      >
        <input type="hidden" name="id" value={student.id} />
        <button type="submit" className="rounded-lg bg-red-700 px-3 py-1.5">
          Öğrenciyi sil
        </button>
      </form>
    </div>
  );
}

function buildHaystack(s: AdminStudentListRow): string {
  const parts = [
    s.name,
    s.instrument,
    s.primaryTeacherName ?? "",
    s.parentName ?? "",
    s.parentPhoneDisplay,
    s.parentPhone ?? ""
  ];
  return parts.join(" ").toLocaleLowerCase("tr");
}

function digitsOnly(s: string): string {
  return s.replace(/\D/g, "");
}

function matchesSearch(s: AdminStudentListRow, rawQuery: string): boolean {
  const q = rawQuery.trim();
  if (q.length === 0) return true;
  const haystack = buildHaystack(s);
  const qLower = q.toLocaleLowerCase("tr");
  if (haystack.includes(qLower)) return true;
  const qd = digitsOnly(q);
  if (qd.length >= 3) {
    const phones = digitsOnly(s.parentPhoneDisplay);
    if (phones.includes(qd)) return true;
  }
  return false;
}

export default function AdminStudentListSection({
  students,
  teachers,
  lessonSlots,
  updateStudentCourseBilling,
  deleteStudent,
  addLessonSlotInline,
  updateLessonSlotInline,
  deleteLessonSlotInline
}: Props) {
  const [query, setQuery] = useState("");
  const [course, setCourse] = useState("");
  const [teacherFilter, setTeacherFilter] = useState("");
  const [openEditStudentId, setOpenEditStudentId] = useState<string | null>(null);
  const [summaryShowAll, setSummaryShowAll] = useState(false);

  const slotsByStudentId = useMemo(() => {
    const m = new Map<string, AdminLessonSlotRow[]>();
    for (const slot of lessonSlots) {
      const list = m.get(slot.studentId) ?? [];
      list.push(slot);
      m.set(slot.studentId, list);
    }
    return m;
  }, [lessonSlots]);

  const filtered = useMemo(() => {
    return students.filter((s) => {
      if (!matchesSearch(s, query)) return false;
      if (course && s.instrument !== course) return false;
      if (teacherFilter === "__none__") {
        if (s.primaryTeacherId) return false;
      } else if (teacherFilter && s.primaryTeacherId !== teacherFilter) {
        return false;
      }
      return true;
    });
  }, [students, query, course, teacherFilter]);

  useEffect(() => {
    if (openEditStudentId && !filtered.some((s) => s.id === openEditStudentId)) {
      setOpenEditStudentId(null);
    }
  }, [filtered, openEditStudentId]);

  useEffect(() => {
    setSummaryShowAll(false);
  }, [query, course, teacherFilter, students.length]);

  const summaryTableRows = useMemo(() => {
    if (summaryShowAll) return filtered;
    return filtered.slice(0, SUMMARY_TABLE_INITIAL);
  }, [filtered, summaryShowAll]);

  useEffect(() => {
    if (!summaryShowAll && openEditStudentId) {
      const head = filtered.slice(0, SUMMARY_TABLE_INITIAL);
      if (!head.some((s) => s.id === openEditStudentId)) {
        setOpenEditStudentId(null);
      }
    }
  }, [summaryShowAll, filtered, openEditStudentId]);

  if (students.length === 0) {
    return <p className="text-sm text-zinc-500">Henüz kayıtlı öğrenci yok.</p>;
  }

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 rounded-lg border border-zinc-800 bg-zinc-950/40 p-3 sm:flex-row sm:flex-wrap sm:items-end">
        <label className="flex min-w-[12rem] flex-1 flex-col gap-1 text-xs text-zinc-500">
          Ara (ad, veli telefonu, kurs, öğretmen, veli)
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Örn. Ayşe, 532, Piyano…"
            className="rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100"
          />
        </label>
        <label className="flex w-full min-w-[10rem] flex-col gap-1 text-xs text-zinc-500 sm:w-44">
          Kurs
          <select
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            className="rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100"
          >
            <option value="">Tümü</option>
            {STUDENT_COURSE_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="flex w-full min-w-[10rem] flex-col gap-1 text-xs text-zinc-500 sm:w-52">
          Öğretmen
          <select
            value={teacherFilter}
            onChange={(e) => setTeacherFilter(e.target.value)}
            className="rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100"
          >
            <option value="">Tümü</option>
            <option value="__none__">Atanmamış</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
        <p className="text-xs text-zinc-500 sm:ml-auto sm:pb-2">
          {filtered.length} / {students.length} öğrenci
        </p>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-950/30 p-3">
        {filtered.length === 0 ? (
          <p className="text-sm text-zinc-500">Filtrelere uyan öğrenci yok.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[min(100%,30rem)] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-xs uppercase tracking-wide text-zinc-500">
                  <th className="py-2 pr-3 font-medium">Ad Soyad</th>
                  <th className="py-2 pr-3 font-medium">Kurs</th>
                  <th className="py-2 pr-3 font-medium">Öğretmen</th>
                  <th className="py-2 pr-3 font-medium">Veli telefonu</th>
                  <th className="w-[1%] whitespace-nowrap py-2 text-right font-medium">Düzenle</th>
                </tr>
              </thead>
              <tbody>
                {summaryTableRows.map((s) => {
                  const studentSlots = slotsByStudentId.get(s.id) ?? [];
                  const firstSlot = studentSlots[0];
                  const scheduleBrief = firstSlot
                    ? `${weekdayLabelTr(firstSlot.dayOfWeek)} ${formatTimeForTimeInput(firstSlot.startTime)}${
                        firstSlot.endTime ? `–${formatTimeForTimeInput(firstSlot.endTime)}` : ""
                      }${studentSlots.length > 1 ? ` (+${studentSlots.length - 1} ders)` : ""}`
                    : null;
                  const isOpen = openEditStudentId === s.id;
                  return (
                    <Fragment key={s.id}>
                      <tr
                        className={`border-b border-zinc-800/80 ${
                          isOpen ? "bg-zinc-900/35" : ""
                        }`}
                      >
                        <td className="py-2 pr-3 align-top">
                          <div className="font-medium text-zinc-200">{s.name}</div>
                          {scheduleBrief ? (
                            <div className="mt-0.5 text-[11px] leading-snug text-zinc-500">
                              <span className="text-zinc-600">Ders:</span> {scheduleBrief}
                            </div>
                          ) : null}
                        </td>
                        <td className="py-2 pr-3 align-top text-zinc-300">{s.instrument}</td>
                        <td
                          className="max-w-[10rem] truncate py-2 pr-3 align-top text-zinc-400"
                          title={s.primaryTeacherName ?? ""}
                        >
                          {s.primaryTeacherName ?? "—"}
                        </td>
                        <td className="py-2 pr-3 align-top font-mono text-xs text-zinc-300">
                          {s.parentPhoneDisplay || "—"}
                        </td>
                        <td className="py-2 text-right align-top">
                          <button
                            type="button"
                            aria-expanded={isOpen}
                            aria-controls={`student-edit-${s.id}`}
                            id={`student-edit-trigger-${s.id}`}
                            title={isOpen ? "Düzenlemeyi kapat" : "Kaydı düzenle"}
                            onClick={() =>
                              setOpenEditStudentId((prev) => (prev === s.id ? null : s.id))
                            }
                            className={`inline-flex h-9 w-9 items-center justify-center rounded-lg border transition ${
                              isOpen
                                ? "border-brand-500/70 bg-brand-950/40 text-brand-200"
                                : "border-zinc-600 bg-zinc-900/60 text-zinc-300 hover:border-brand-500/50 hover:bg-zinc-800 hover:text-zinc-100"
                            }`}
                          >
                            <PencilIcon className="h-4 w-4" />
                            <span className="sr-only">
                              {isOpen ? "Düzenlemeyi kapat" : `${s.name} kaydını düzenle`}
                            </span>
                          </button>
                        </td>
                      </tr>
                      {isOpen ? (
                        <tr className="border-b border-zinc-800/80 bg-zinc-950/60">
                          <td colSpan={5} className="px-3 py-4 sm:px-4">
                            <div
                              id={`student-edit-${s.id}`}
                              role="region"
                              aria-labelledby={`student-edit-trigger-${s.id}`}
                            >
                              <StudentEditPanel
                                student={s}
                                teachers={teachers}
                                studentSlots={studentSlots}
                                updateStudentCourseBilling={updateStudentCourseBilling}
                                deleteStudent={deleteStudent}
                                addLessonSlotInline={addLessonSlotInline}
                                updateLessonSlotInline={updateLessonSlotInline}
                                deleteLessonSlotInline={deleteLessonSlotInline}
                              />
                            </div>
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  );
                })}
              </tbody>
              {filtered.length > SUMMARY_TABLE_INITIAL ? (
                <tbody>
                  <tr className="border-b border-zinc-800/40 bg-zinc-950/25">
                    <td colSpan={5} className="py-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => setSummaryShowAll((v) => !v)}
                        className="rounded-lg border border-zinc-600 bg-zinc-900/70 px-4 py-1.5 text-xs font-medium text-zinc-300 hover:border-brand-500/50 hover:bg-zinc-800 hover:text-zinc-100"
                      >
                        {summaryShowAll
                          ? "Daha az göster"
                          : `Tümünü görüntüle (${filtered.length - SUMMARY_TABLE_INITIAL} daha)`}
                      </button>
                    </td>
                  </tr>
                </tbody>
              ) : null}
            </table>
          </div>
        )}
      </div>
    </>
  );
}
