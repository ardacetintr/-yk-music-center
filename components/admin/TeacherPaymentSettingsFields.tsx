"use client";

import { useState } from "react";
import {
  TEACHER_PAYMENT_MONTHLY,
  TEACHER_PAYMENT_WEEKLY,
  teacherRateToNumber,
  type TeacherPaymentPeriod,
  type TeacherPaymentRowInput
} from "@/lib/teacher-payment";
import { WEEKDAYS_TR_MON_FIRST } from "@/lib/weekdays-tr";

type Props = {
  teacher?: Pick<
    TeacherPaymentRowInput,
    | "paymentPeriod"
    | "ratePerLesson"
    | "paymentDueDayOfMonth"
    | "paymentDueDayOfWeek"
  > | null;
};

export default function TeacherPaymentSettingsFields({ teacher }: Props) {
  const initialPeriod = (teacher?.paymentPeriod === TEACHER_PAYMENT_WEEKLY
    ? TEACHER_PAYMENT_WEEKLY
    : TEACHER_PAYMENT_MONTHLY) as TeacherPaymentPeriod;

  const [period, setPeriod] = useState<TeacherPaymentPeriod>(initialPeriod);

  const rateNum = teacher ? teacherRateToNumber(teacher.ratePerLesson) : null;
  const defaultRate =
    rateNum != null && rateNum > 0
      ? String(rateNum).replace(".", ",")
      : "";

  return (
    <fieldset className="space-y-3 rounded-lg border border-zinc-800 bg-zinc-950/40 px-3 py-3">
      <legend className="px-1 text-xs font-medium text-zinc-400">Öğretmen ödemesi</legend>

      <label className="flex flex-col gap-1 text-xs text-zinc-500">
        Ödeme periyodu
        <select
          name="paymentPeriod"
          value={period}
          onChange={(e) => setPeriod(e.target.value as TeacherPaymentPeriod)}
          className="rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100"
        >
          <option value={TEACHER_PAYMENT_MONTHLY}>Aylık</option>
          <option value={TEACHER_PAYMENT_WEEKLY}>Haftalık</option>
        </select>
      </label>

      <label className="flex flex-col gap-1 text-xs text-zinc-500">
        Ders başı ücret (₺)
        <input
          name="ratePerLesson"
          inputMode="decimal"
          defaultValue={defaultRate}
          placeholder="Örn. 500"
          className="rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100"
        />
      </label>

      {period === TEACHER_PAYMENT_MONTHLY ? (
        <label className="flex flex-col gap-1 text-xs text-zinc-500">
          Ayın ödeme günü
          <select
            name="paymentDueDayOfMonth"
            defaultValue={String(teacher?.paymentDueDayOfMonth ?? 1)}
            className="rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100"
          >
            {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d}>
                Ayın {d}. günü
              </option>
            ))}
          </select>
        </label>
      ) : (
        <label className="flex flex-col gap-1 text-xs text-zinc-500">
          Haftanın ödeme günü
          <select
            name="paymentDueDayOfWeek"
            defaultValue={String(teacher?.paymentDueDayOfWeek ?? 5)}
            className="rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100"
          >
            {WEEKDAYS_TR_MON_FIRST.map((d) => (
              <option key={d.value} value={d.value}>
                Her {d.label}
              </option>
            ))}
          </select>
        </label>
      )}
    </fieldset>
  );
}
