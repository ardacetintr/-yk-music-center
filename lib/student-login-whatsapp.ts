import { getPublicAppOrigin } from "@/lib/public-app-url";
import { normalizePhone } from "@/lib/phone";

/** normalizePhone çıktısı (10 hane, 5 ile başlar) → 0XXX XXX XX XX */
export function formatTurkeyMobileDisplay(normalized10: string): string {
  const d = normalized10.replace(/\D/g, "");
  if (d.length !== 10) return normalized10;
  return `0${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6, 8)} ${d.slice(8, 10)}`;
}

export function buildStudentLoginWhatsAppBody(params: {
  studentName: string;
  loginPageUrl: string;
  loginPhoneDisplay: string;
  plainPassword: string;
  /** Veliye gönderildiğinde metin ona göre düzenlenir (alıcı numarası veli olmalı). */
  audience?: "parent" | "student";
}): string {
  const {
    studentName,
    loginPageUrl,
    loginPhoneDisplay,
    plainPassword,
    audience = "parent"
  } = params;
  const senderRaw = process.env.WHATSAPP_SENDER_PHONE_E164?.trim() ?? "";
  const senderDisplay = senderRaw
    ? formatTurkeyMobileDisplay(normalizePhone(senderRaw))
    : "";
  const name = studentName.trim();
  const linesParent = [
    "Merhaba,",
    "",
    `${name} için Öykü Music Center öğrenci paneli giriş bilgileri:`,
    `• Giriş adresi: ${loginPageUrl}`,
    `• Kullanıcı adı (öğrencinin telefon numarası): ${loginPhoneDisplay}`,
    `• Şifre: ${plainPassword}`,
    "",
    "Girişte öğrenci telefon numarasını başında 0 veya ülke kodu ile birlikte girebilirsiniz.",
    "",
    "Bu şifreyi kimseyle paylaşmayın; güvenlik için ilk girişten sonra değiştirmenizi öneririz.",
    ...(senderDisplay ? ["", `Mesajı gönderen kurum hattı: ${senderDisplay}`] : [])
  ];
  const linesStudent = [
    `Merhaba ${name},`,
    "",
    "Öykü Music Center öğrenci paneli giriş bilgileriniz:",
    `• Giriş adresi: ${loginPageUrl}`,
    `• Kullanıcı adı (telefon numaranız): ${loginPhoneDisplay}`,
    `• Şifre: ${plainPassword}`,
    "",
    "Girişte telefon numaranızı başında 0 veya ülke kodu ile birlikte girebilirsiniz.",
    "",
    "Bu şifreyi kimseyle paylaşmayın; güvenliğiniz için ilk girişten sonra değiştirmenizi öneririz.",
    ...(senderDisplay ? ["", `Mesajı gönderen kurum hattı: ${senderDisplay}`] : [])
  ];
  return (audience === "student" ? linesStudent : linesParent).join("\n");
}

/** wa.me alıcısı: veli veya öğrenci (normalize edilmiş 10 hane TR cep). */
export function buildStudentLoginWhatsAppUrl(params: {
  /** Mesajın açılacağı WhatsApp numarası (veli için veli cep'i). */
  normalizedRecipientPhone: string;
  studentName: string;
  loginPhoneDisplay: string;
  plainPassword: string;
  loginPageUrl?: string;
  audience?: "parent" | "student";
}): string {
  const loginPageUrl = params.loginPageUrl ?? `${getPublicAppOrigin()}/admin/login`;
  const audience = params.audience ?? "parent";
  const body = buildStudentLoginWhatsAppBody({
    studentName: params.studentName,
    loginPageUrl,
    loginPhoneDisplay: params.loginPhoneDisplay,
    plainPassword: params.plainPassword,
    audience
  });
  const digits = params.normalizedRecipientPhone.replace(/\D/g, "");
  const waRecipient = digits.length === 10 ? `90${digits}` : digits.startsWith("90") ? digits : `90${digits}`;
  return `https://wa.me/${waRecipient.replace(/^\+/, "")}?text=${encodeURIComponent(body)}`;
}
