"use client";

import { useFormState } from "react-dom";
import { useState } from "react";
import type { AdminFormActionState } from "@/lib/admin-form-action-state";
import { TEACHER_BRANCH_OPTIONS } from "@/lib/teacher-instruments";

type Props = {
  action: (
    prevState: AdminFormActionState | null,
    formData: FormData
  ) => Promise<AdminFormActionState>;
};

export default function AdminAddTeacherForm({ action }: Props) {
  const [state, formAction] = useFormState(action, null);
  const [name, setName] = useState("");

  return (
    <form action={formAction} className="card flex min-h-0 w-full flex-1 flex-col space-y-2">
      <h2 className="text-lg font-semibold">Öğretmen Kaydı</h2>
      {state?.ok === false ? (
        <p className="rounded-lg border border-red-900/60 bg-red-950/50 px-3 py-2 text-sm text-red-200">
          {state.message}
        </p>
      ) : null}
      <input
        name="name"
        required
        placeholder="Ad Soyad"
        autoComplete="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded-lg border border-zinc-700 bg-black px-3 py-2"
      />
      <input
        name="phone"
        required
        placeholder="Cep telefonu"
        autoComplete="tel"
        className="w-full rounded-lg border border-zinc-700 bg-black px-3 py-2"
      />

      <fieldset className="space-y-2 rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-2">
        <legend className="px-1 text-xs text-zinc-500">Branşlar (birden fazla seçilebilir)</legend>
        <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 sm:grid-cols-3">
          {TEACHER_BRANCH_OPTIONS.map((opt) => (
            <label key={opt} className="flex cursor-pointer items-center gap-2 text-sm text-zinc-300">
              <input type="checkbox" name="instruments" value={opt} className="rounded border-zinc-600" />
              <span className="leading-tight">{opt}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <input
        name="tcKimlikNo"
        inputMode="numeric"
        autoComplete="off"
        placeholder="T.C. Kimlik No"
        className="w-full rounded-lg border border-zinc-700 bg-black px-3 py-2"
      />
      <input
        name="fatherName"
        autoComplete="off"
        placeholder="Baba adı"
        className="w-full rounded-lg border border-zinc-700 bg-black px-3 py-2"
      />
      <textarea
        name="address"
        rows={2}
        placeholder="Adres"
        className="w-full rounded-lg border border-zinc-700 bg-black px-3 py-2"
      />

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <label className="flex flex-col gap-0.5 text-xs text-zinc-500">
          Doğum tarihi
          <input type="date" name="birthDate" className="rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100" />
        </label>
        <label className="flex flex-col gap-0.5 text-xs text-zinc-500">
          Doğum yeri
          <input name="birthPlace" placeholder="İl / ilçe" className="rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100" />
        </label>
        <label className="flex flex-col gap-0.5 text-xs text-zinc-500">
          İşe başlama tarihi
          <input type="date" name="employmentStartDate" className="rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100" />
        </label>
        <label className="flex flex-col gap-0.5 text-xs text-zinc-500">
          Sigorta başlangıç tarihi
          <input type="date" name="insuranceStartDate" className="rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100" />
        </label>
      </div>

      <div className="mt-auto flex w-full justify-center pt-4 pb-1">
        <button type="submit" className="min-w-[10rem] rounded-lg bg-brand-600 px-8 py-2.5 font-medium">
          Ekle
        </button>
      </div>
    </form>
  );
}
