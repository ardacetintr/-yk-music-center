const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

const DOW_MAP: Record<string, number> = {
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
  Sun: 7
};

/** Bugünün tarihi YYYY-MM-DD (İstanbul). */
export function todayIsoInIstanbul(): string {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Istanbul" });
}

export function parseIsoDateOrToday(raw: string | undefined | null): string {
  const s = raw?.trim() ?? "";
  if (ISO_DATE.test(s)) return s;
  return todayIsoInIstanbul();
}

/** 1 = Pazartesi … 7 = Pazar (ders şablonu ile aynı). */
export function isoDateToSchemaDayOfWeek(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return 1;
  const weekday = new Date(Date.UTC(y, m - 1, d, 12, 0, 0)).toLocaleDateString("en-US", {
    weekday: "short",
    timeZone: "Europe/Istanbul"
  });
  return DOW_MAP[weekday] ?? 1;
}

export function addDaysToIsoDate(iso: string, delta: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + delta);
  return dt.toISOString().slice(0, 10);
}

export function formatIsoDateTr(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Intl.DateTimeFormat("tr-TR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC"
  }).format(new Date(Date.UTC(y, m - 1, d)));
}

export function compareTimeHHmm(a: string, b: string): number {
  return a.localeCompare(b);
}
