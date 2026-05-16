import { normalizePhone } from "@/lib/phone";
import {
  buildWhatsAppSendUrl,
  normalizeWhatsAppMessageText,
  toWhatsAppInternationalPhone,
  type WhatsAppSendPayload
} from "@/lib/whatsapp-url";

/** BMP semboller — wa.me önizlemede ? çıkan 4 baytlı emoji yerine. */
const ICON_SMILE = "\u263A"; // ☺
const ICON_MUSIC = "\u266B"; // ♫

export function buildPaymentReminderWhatsAppBody(studentName: string): string {
  const nameSurname = studentName.trim();
  return normalizeWhatsAppMessageText(
    [
      `Merhaba, Öykü Music Center'dan yazıyoruz. ${ICON_SMILE}`,
      "",
      `Öğrencimiz ${nameSurname} için aylık ders ödemesinin günü gelmiştir. Uygun olduğunuzda ödemenizi gerçekleştirmenizi rica ederiz. Ödeme yaptıysanız bu mesajı dikkate almayınız.`,
      "",
      `İyi günler dileriz. ${ICON_MUSIC}`
    ].join("\n")
  );
}

export function buildPaymentReminderWhatsAppPayload(params: {
  normalizedRecipientPhone: string;
  studentName: string;
}): WhatsAppSendPayload {
  return {
    phone: toWhatsAppInternationalPhone(params.normalizedRecipientPhone),
    text: buildPaymentReminderWhatsAppBody(params.studentName)
  };
}

/** @deprecated Tercih: payload + istemcide buildWhatsAppSendUrl */
export function buildPaymentReminderWhatsAppUrl(params: {
  normalizedRecipientPhone: string;
  studentName: string;
}): string {
  return buildWhatsAppSendUrl(buildPaymentReminderWhatsAppPayload(params));
}

export function resolvePaymentRecipientPhone(parentPhone: string | null | undefined): string | null {
  const raw = parentPhone?.trim() ?? "";
  if (!raw) return null;
  const normalized = normalizePhone(raw);
  return normalized.length >= 10 ? normalized : null;
}
