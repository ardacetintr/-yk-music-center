import { normalizePhone } from "@/lib/phone";

export function buildPaymentReminderWhatsAppBody(studentName: string): string {
  const name = studentName.trim();
  return [
    "Merhaba, Öykü Music Center'dan yazıyoruz. 😊",
    "",
    `Öğrencimiz ${name} için aylık ders ödemesinin günü gelmiştir. Uygun olduğunuzda ödemenizi gerçekleştirmenizi rica ederiz. Ödeme yaptıysanız bu mesajı dikkate almayınız.`,
    "",
    "İyi günler dileriz. 🎶"
  ].join("\n");
}

export function buildPaymentReminderWhatsAppUrl(params: {
  normalizedRecipientPhone: string;
  studentName: string;
}): string {
  const body = buildPaymentReminderWhatsAppBody(params.studentName);
  const digits = params.normalizedRecipientPhone.replace(/\D/g, "");
  const waRecipient =
    digits.length === 10 ? `90${digits}` : digits.startsWith("90") ? digits : `90${digits}`;
  return `https://wa.me/${waRecipient.replace(/^\+/, "")}?text=${encodeURIComponent(body)}`;
}

export function resolvePaymentRecipientPhone(parentPhone: string | null | undefined): string | null {
  const raw = parentPhone?.trim() ?? "";
  if (!raw) return null;
  const normalized = normalizePhone(raw);
  return normalized.length >= 10 ? normalized : null;
}
