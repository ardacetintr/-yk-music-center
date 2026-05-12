/** Rakamları çıkarır; Türkiye cep için +90 / 0 önekini kaldırarak tek biçimde (10 hane, 5 ile başlar) saklar. */
export function normalizePhone(input: string) {
  let digits = input.replace(/\D/g, "");
  for (;;) {
    if (digits.startsWith("90") && digits.length >= 12) {
      digits = digits.slice(2);
      continue;
    }
    if (digits.startsWith("0") && digits.length >= 11) {
      digits = digits.slice(1);
      continue;
    }
    break;
  }
  return digits;
}

export function phoneToEmail(phone: string) {
  const normalized = normalizePhone(phone);
  return `${normalized}@phone.local`;
}

/** normalizePhone çıktısı (10 hane 5…) için Twilio E.164: +905551234567 */
export function toTurkeyE164(normalizedPhone: string): string {
  const d = normalizedPhone.replace(/\D/g, "");
  if (d.length === 10 && d.startsWith("5")) {
    return `+90${d}`;
  }
  if (d.startsWith("90") && d.length >= 12) {
    return `+${d}`;
  }
  return `+${d}`;
}
