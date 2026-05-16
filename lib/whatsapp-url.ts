/** WhatsApp wa.me / api.whatsapp.com — telefon + metin (URL tıklamada istemcide üretilir). */
export type WhatsAppSendPayload = {
  /** Uluslararası rakamlar, örn. 905551234567 */
  phone: string;
  text: string;
};

export function normalizeWhatsAppMessageText(text: string): string {
  return text.normalize("NFC");
}

/** Tam bağlantı (sunucu veya istemci); metin NFC + encodeURIComponent. */
export function buildWhatsAppSendUrl(payload: WhatsAppSendPayload): string {
  const phone = payload.phone.replace(/\D/g, "").replace(/^\+/, "");
  const text = normalizeWhatsAppMessageText(payload.text);
  return `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(text)}`;
}

/** 10 haneli TR cep → 90… */
export function toWhatsAppInternationalPhone(normalized10OrMore: string): string {
  const digits = normalized10OrMore.replace(/\D/g, "");
  if (digits.length === 10) return `90${digits}`;
  if (digits.startsWith("90")) return digits;
  return `90${digits}`;
}
