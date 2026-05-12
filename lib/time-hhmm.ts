/** `<input type="time" />` ve sunucu normalizasyonu için `HH:mm` (tek haneli saat / saniye destekli). */
export function formatTimeForTimeInput(raw: string | null | undefined): string {
  if (raw == null) return "";
  const trimmed = String(raw).trim();
  if (!trimmed) return "";
  const m = trimmed.match(/^(\d{1,2}):(\d{2})(?::\d{2})?/);
  if (!m) return "";
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (!Number.isFinite(h) || !Number.isFinite(min) || h < 0 || h > 23 || min < 0 || min > 59) {
    return "";
  }
  return `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
}

/** HTML `type="time"` veya benzeri giriş → HH:mm */
export function normalizeTimeHHmm(raw: string): string {
  const out = formatTimeForTimeInput(raw);
  if (!out) {
    throw new Error("Saat biçimi geçersiz (SS:dd).");
  }
  return out;
}
