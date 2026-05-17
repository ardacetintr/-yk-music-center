/** URL ?toast= veya istemci bildirim anahtarları */
export const ADMIN_TOAST_MESSAGES: Record<string, string> = {
  "student-created": "Öğrenci kaydı oluşturuldu.",
  "student-updated": "Öğrenci bilgileri güncellendi.",
  "student-deleted": "Öğrenci kaydı silindi.",
  "student-billing-updated": "Kurs ücreti ve başlangıç tarihi kaydedildi.",
  "teacher-created": "Öğretmen kaydı oluşturuldu.",
  "teacher-updated": "Öğretmen bilgileri güncellendi.",
  "teacher-deleted": "Öğretmen kaydı silindi.",
  "attendance-saved": "Yoklama kaydedildi.",
  "absence-added": "Devamsızlık kaydı eklendi.",
  "absence-deleted": "Devamsızlık kaydı silindi.",
  "payment-saved": "Ödeme kaydı kaydedildi.",
  "payment-deleted": "Ödeme kaydı silindi.",
  "instrument-sale-added": "Enstrüman satışı kaydedildi.",
  "instrument-sale-deleted": "Satış kaydı silindi.",
  created: "Ders satırı oluşturuldu.",
  updated: "Ders kaydı güncellendi.",
  deleted: "Ders kaydı silindi."
};

export function adminToastMessage(key: string | undefined | null): string | null {
  if (!key || typeof key !== "string") return null;
  const k = key.trim();
  return ADMIN_TOAST_MESSAGES[k] ?? null;
}

export function adminToastFromSearchParams(
  searchParams?: Record<string, string | string[] | undefined>
): string | undefined {
  const raw = searchParams?.toast;
  if (typeof raw === "string") return raw;
  if (Array.isArray(raw)) return raw[0];
  return undefined;
}
