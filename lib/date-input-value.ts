/** `<input type="date">` için yalnızca YYYY-AA-GG kabul edilir; aksi halde boş (runtime uyarı/hata önlenir). */
export function isoDateInputValue(value: string | null | undefined): string {
  const s = typeof value === "string" ? value.trim() : "";
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : "";
}
