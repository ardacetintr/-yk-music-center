const TZ = "Europe/Istanbul";

/** Türkiye takvimine göre YYYY-MM */
export function getCurrentPaymentMonth(date = new Date()): string {
  return date.toLocaleDateString("sv-SE", { timeZone: TZ, year: "numeric", month: "2-digit" });
}

/** Ayın günü (1–31), Türkiye */
export function getTodayDayOfMonth(date = new Date()): number {
  const d = Number(
    date.toLocaleDateString("sv-SE", { timeZone: TZ, day: "2-digit" })
  );
  return Number.isFinite(d) ? d : 1;
}

export function isPaidForCurrentMonth(paymentPaidMonth: string | null | undefined): boolean {
  if (!paymentPaidMonth?.trim()) return false;
  return paymentPaidMonth.trim() === getCurrentPaymentMonth();
}

/** Bu ay tahsilat günü gelmiş mi (bugün >= dueDay) */
export function isPaymentDueReached(dueDay: number, date = new Date()): boolean {
  const day = Math.min(31, Math.max(1, Math.floor(dueDay) || 1));
  return getTodayDayOfMonth(date) >= day;
}

export function clampPaymentDueDay(value: number): number {
  return Math.min(31, Math.max(1, Math.floor(value) || 1));
}
