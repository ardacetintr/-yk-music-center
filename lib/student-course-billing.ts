import { Prisma } from "@prisma/client";
import { parseTurkishMoneyInput } from "@/lib/money";
import { clampPaymentDueDay } from "@/lib/payment-month";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export type ParsedStudentCourseBilling = {
  courseFee: number | null;
  courseStartDate: string | null;
  paymentDueDay: number;
};

/** Kurs başlangıç tarihinin gününden aylık tahsilat günü (1–31). */
export function paymentDueDayFromCourseStartDate(isoDate: string): number {
  const day = Number(isoDate.split("-")[2]);
  return clampPaymentDueDay(Number.isFinite(day) ? day : 1);
}

export function parseStudentCourseBillingFromForm(formData: FormData): ParsedStudentCourseBilling {
  const feeRaw = String(formData.get("courseFee") ?? "").trim();
  let courseFee: number | null = null;
  if (feeRaw !== "") {
    const parsed = parseTurkishMoneyInput(feeRaw);
    if (parsed === null || parsed <= 0) {
      throw new Error("Kurs ücreti geçerli bir tutar olmalıdır.");
    }
    courseFee = parsed;
  }

  const startRaw = String(formData.get("courseStartDate") ?? "").trim();
  let courseStartDate: string | null = null;
  if (startRaw !== "") {
    if (!ISO_DATE.test(startRaw)) {
      throw new Error("Kurs başlangıç tarihi YYYY-AA-GG olmalıdır.");
    }
    courseStartDate = startRaw;
  }

  const paymentDueDay = courseStartDate
    ? paymentDueDayFromCourseStartDate(courseStartDate)
    : clampPaymentDueDay(Number(formData.get("paymentDueDay") ?? 1));

  return { courseFee, courseStartDate, paymentDueDay };
}

export function studentCourseBillingPrismaData(billing: ParsedStudentCourseBilling) {
  return {
    courseFee: billing.courseFee != null ? new Prisma.Decimal(billing.courseFee) : null,
    courseStartDate: billing.courseStartDate,
    paymentDueDay: billing.paymentDueDay
  };
}

export function courseFeeToNumber(
  fee: { toNumber?: () => number } | number | null | undefined
): number | null {
  if (fee == null) return null;
  if (typeof fee === "number") return fee;
  if (typeof fee.toNumber === "function") return fee.toNumber();
  const n = Number(fee);
  return Number.isFinite(n) ? n : null;
}
