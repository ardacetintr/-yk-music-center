/** "1234.5" veya "1.234,50" → number (TL) */
export function parseTurkishMoneyInput(raw: string): number | null {
  const t = raw.trim().replace(/\s/g, "");
  if (!t) return null;
  const normalized = t.includes(",")
    ? t.replace(/\./g, "").replace(",", ".")
    : t.replace(/,/g, "");
  const n = Number(normalized);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100) / 100;
}

export function formatTurkishMoney(amount: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
}
