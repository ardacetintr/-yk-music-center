"use client";

import { useFormState } from "react-dom";
import { useEffect, useRef, useState } from "react";
import type { AdminFormActionState } from "@/lib/admin-form-action-state";
import { STUDENT_COURSE_OPTIONS } from "@/lib/student-course-options";
import { useAdminToastOptional } from "@/components/admin/AdminToastProvider";

type Props = {
  action: (
    prevState: AdminFormActionState | null,
    formData: FormData
  ) => Promise<AdminFormActionState>;
  teachers: Array<{ id: string; name: string }>;
};

export default function AdminAddStudentForm({ action, teachers }: Props) {
  const [state, formAction] = useFormState(action, null);
  const [name, setName] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const toast = useAdminToastOptional();

  useEffect(() => {
    if (state?.ok) {
      formRef.current?.reset();
      setName("");
      toast?.showToast("student-created");
    } else if (state?.ok === false) {
      toast?.showToast(state.message, "error");
    }
  }, [state, toast]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="card flex min-h-0 w-full flex-1 flex-col space-y-2"
    >
      <h2 className="text-lg font-semibold">Öğrenci Kaydı</h2>
      <input
        name="name"
        required
        placeholder="Ad Soyad"
        autoComplete="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded-lg border border-zinc-700 bg-black px-3 py-2"
      />
      <select
        name="instrument"
        required
        defaultValue=""
        className="w-full rounded-lg border border-zinc-700 bg-black px-3 py-2"
      >
        <option value="" disabled>
          Kurs seçin
        </option>
        {STUDENT_COURSE_OPTIONS.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <select
        name="primaryTeacherId"
        defaultValue=""
        className="w-full rounded-lg border border-zinc-700 bg-black px-3 py-2"
      >
        <option value="">Öğretmen seçin (isteğe bağlı)</option>
        {teachers.map((t) => (
          <option key={t.id} value={t.id}>
            {t.name}
          </option>
        ))}
      </select>
      {teachers.length === 0 ? (
        <p className="text-xs text-amber-300/90">
          Öğretmen listesi boş görünüyor. Önce öğretmen ekleyin veya sayfayı yenileyin.
        </p>
      ) : null}
      <fieldset className="space-y-2 rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2">
        <legend className="px-1 text-xs text-zinc-500">Kurs ücreti ve başlangıç</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="flex flex-col gap-0.5 text-xs text-zinc-500">
            Kurs ücreti (₺ / ay)
            <input
              name="courseFee"
              inputMode="decimal"
              placeholder="Örn. 3000"
              className="w-full rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm"
            />
          </label>
          <label className="flex flex-col gap-0.5 text-xs text-zinc-500">
            Kursa başlangıç tarihi
            <input
              type="date"
              name="courseStartDate"
              className="w-full rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100"
            />
          </label>
        </div>
        <p className="text-[11px] text-zinc-600">
          Tahsilat günü, başlangıç tarihinin ayın gününe göre belirlenir.
        </p>
      </fieldset>
      <div className="flex flex-col gap-2">
        <input
          name="parentName"
          autoComplete="name"
          placeholder="Veli adı soyadı (isteğe bağlı)"
          className="w-full rounded-lg border border-zinc-700 bg-black px-3 py-2"
        />
        <input
          name="parentPhone"
          type="tel"
          required
          autoComplete="tel"
          placeholder="Veli telefon numarası (zorunlu — öğrenci girişi bu numara ile yapılır)"
          className="w-full rounded-lg border border-zinc-700 bg-black px-3 py-2"
        />
      </div>
      <div className="mt-auto flex w-full justify-center pt-10 pb-1">
        <button type="submit" className="min-w-[10rem] rounded-lg bg-brand-600 px-8 py-2.5 font-medium">
          Ekle
        </button>
      </div>
    </form>
  );
}
