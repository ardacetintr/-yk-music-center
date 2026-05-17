import { Prisma } from "@prisma/client";
import { parseTurkishMoneyInput } from "@/lib/money";
import { addDaysToIsoDate, isoDateToSchemaDayOfWeek } from "@/lib/lesson-calendar";
import { weekdayLabelTr } from "@/lib/weekdays-tr";

export const TEACHER_PAYMENT_WEEKLY = "WEEKLY" as const;
export const TEACHER_PAYMENT_MONTHLY = "MONTHLY" as const;

export type TeacherPaymentPeriod =
  | typeof TEACHER_PAYMENT_WEEKLY
  | typeof TEACHER_PAYMENT_MONTHLY;

export type TeacherPaymentSettings = {
  paymentPeriod: TeacherPaymentPeriod;
  ratePerLesson: number | null;
  paymentDueDayOfMonth: number | null;
  paymentDueDayOfWeek: number | null;
};

export type TeacherPaymentRowInput = {
  paymentPeriod: string;
  ratePerLesson: { toNumber?: () => number } | number | null;
  paymentDueDayOfMonth: number | null;
  paymentDueDayOfWeek: number | null;
};

export function isTeacherPaymentPeriod(value: string): value is TeacherPaymentPeriod {
  return value === TEACHER_PAYMENT_WEEKLY || value === TEACHER_PAYMENT_MONTHLY;
}

export function teacherRateToNumber(
  rate: TeacherPaymentRowInput["ratePerLesson"]
): number | null {
  if (rate == null) return null;
  if (typeof rate === "number") return rate;
  if (typeof rate.toNumber === "function") return rate.toNumber();
  return Number(rate);
}

export function parseTeacherPaymentFromForm(formData: FormData): TeacherPaymentSettings {
  const periodRaw = String(formData.get("paymentPeriod") ?? TEACHER_PAYMENT_MONTHLY).trim();
  if (!isTeacherPaymentPeriod(periodRaw)) {
    throw new Error("Ödeme periyodu geçersiz (haftalık veya aylık).");
  }

  const rateRaw = String(formData.get("ratePerLesson") ?? "").trim();
  let ratePerLesson: number | null = null;
  if (rateRaw !== "") {
    const parsed = parseTurkishMoneyInput(rateRaw);
    if (parsed === null || parsed <= 0) {
      throw new Error("Ders başı ücret geçerli bir tutar olmalıdır.");
    }
    ratePerLesson = parsed;
  }

  if (periodRaw === TEACHER_PAYMENT_MONTHLY) {
    const day = Number(formData.get("paymentDueDayOfMonth"));
    if (!Number.isInteger(day) || day < 1 || day > 31) {
      throw new Error("Ayın ödeme günü 1 ile 31 arasında olmalıdır.");
    }
    return {
      paymentPeriod: periodRaw,
      ratePerLesson,
      paymentDueDayOfMonth: day,
      paymentDueDayOfWeek: null
    };
  }

  const weekDay = Number(formData.get("paymentDueDayOfWeek"));
  if (!Number.isInteger(weekDay) || weekDay < 1 || weekDay > 7) {
    throw new Error("Haftanın ödeme gününü seçin.");
  }

  return {
    paymentPeriod: periodRaw,
    ratePerLesson,
    paymentDueDayOfMonth: null,
    paymentDueDayOfWeek: weekDay
  };
}

function clampIsoDayInMonth(year: number, month: number, day: number): string {
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const d = Math.min(day, lastDay);
  return `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

/** Ödeme dönemi (dahil): yoklamada PRESENT sayılan günler bu aralıkta. */
export function getTeacherPayPeriod(
  teacher: Pick<
    TeacherPaymentRowInput,
    "paymentPeriod" | "paymentDueDayOfMonth" | "paymentDueDayOfWeek"
  >,
  referenceIso: string
): { startDate: string; endDate: string } {
  if (teacher.paymentPeriod === TEACHER_PAYMENT_WEEKLY) {
    const due = teacher.paymentDueDayOfWeek ?? 5;
    const refDow = isoDateToSchemaDayOfWeek(referenceIso);
    let delta = refDow - due;
    if (delta < 0) delta += 7;
    const endDate = addDaysToIsoDate(referenceIso, -delta);
    const startDate = addDaysToIsoDate(endDate, -6);
    return { startDate, endDate };
  }

  const due = teacher.paymentDueDayOfMonth ?? 1;
  const [y, m, d] = referenceIso.split("-").map(Number);
  let endY = y;
  let endM = m;
  if (d < due) {
    endM -= 1;
    if (endM < 1) {
      endM = 12;
      endY -= 1;
    }
  }
  const endDate = clampIsoDayInMonth(endY, endM, due);

  let prevM = endM - 1;
  let prevY = endY;
  if (prevM < 1) {
    prevM = 12;
    prevY -= 1;
  }
  const prevEnd = clampIsoDayInMonth(prevY, prevM, due);
  const startDate = addDaysToIsoDate(prevEnd, 1);

  return { startDate, endDate };
}

export function isTeacherPaymentDueOnDate(
  teacher: Pick<
    TeacherPaymentRowInput,
    "paymentPeriod" | "paymentDueDayOfMonth" | "paymentDueDayOfWeek"
  >,
  isoDate: string
): boolean {
  if (teacher.paymentPeriod === TEACHER_PAYMENT_WEEKLY) {
    const due = teacher.paymentDueDayOfWeek ?? 5;
    return isoDateToSchemaDayOfWeek(isoDate) === due;
  }
  const due = teacher.paymentDueDayOfMonth ?? 1;
  const day = Number(isoDate.split("-")[2]);
  return day === due;
}

export function formatTeacherPaymentScheduleLabel(
  teacher: Pick<
    TeacherPaymentRowInput,
    "paymentPeriod" | "paymentDueDayOfMonth" | "paymentDueDayOfWeek"
  >
): string {
  if (teacher.paymentPeriod === TEACHER_PAYMENT_WEEKLY) {
    const d = teacher.paymentDueDayOfWeek ?? 5;
    return `Haftalık — her ${weekdayLabelTr(d)}`;
  }
  const d = teacher.paymentDueDayOfMonth ?? 1;
  return `Aylık — ayın ${d}. günü`;
}

export function teacherPaymentPrismaData(settings: TeacherPaymentSettings) {
  return {
    paymentPeriod: settings.paymentPeriod,
    ratePerLesson:
      settings.ratePerLesson != null ? new Prisma.Decimal(settings.ratePerLesson) : null,
    paymentDueDayOfMonth: settings.paymentDueDayOfMonth,
    paymentDueDayOfWeek: settings.paymentDueDayOfWeek
  };
}
