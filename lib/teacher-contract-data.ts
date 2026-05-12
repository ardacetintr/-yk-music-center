import type { Teacher, User } from "@prisma/client";
import { normalizePhone } from "@/lib/phone";
import { formatTurkeyMobileDisplay } from "@/lib/student-login-whatsapp";
import { deserializeTeacherInstruments } from "@/lib/teacher-instruments";

/** Metin şablonunda `{alanAdı}` ile değiştirilecek alanlar (İngilizce + Türkçe takma adlar). */
export function buildTeacherContractMergeData(teacher: Teacher & { user: User }): Record<string, string> {
  const instruments = deserializeTeacherInstruments(teacher.instruments);
  const empty = (v: string | null | undefined) => (v == null || String(v).trim() === "" ? "" : String(v).trim());
  const formatDateDdMmYyyy = (v: string | null | undefined): string => {
    const raw = empty(v);
    if (!raw) return "";
    const ymd = raw.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
    if (ymd) {
      const yy = ymd[1];
      const mm = ymd[2].padStart(2, "0");
      const dd = ymd[3].padStart(2, "0");
      return `${dd}/${mm}/${yy}`;
    }
    const dmy = raw.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
    if (dmy) {
      const dd = dmy[1].padStart(2, "0");
      const mm = dmy[2].padStart(2, "0");
      const yy = dmy[3];
      return `${dd}/${mm}/${yy}`;
    }
    return raw;
  };

  const teacherName = empty(teacher.user.name);
  const phoneDisplay = formatTurkeyMobileDisplay(normalizePhone(teacher.phone));
  const tcKimlikNo = empty(teacher.tcKimlikNo);
  const fatherName = empty(teacher.fatherName);
  const address = empty(teacher.address);
  const birthDate = formatDateDdMmYyyy(teacher.birthDate);
  const birthPlace = empty(teacher.birthPlace);
  const employmentStartDate = formatDateDdMmYyyy(teacher.employmentStartDate);
  const insuranceStartDate = formatDateDdMmYyyy(teacher.insuranceStartDate);
  const instrumentsText = instruments.length ? instruments.join(", ") : "";
  const now = new Date();
  const generatedDate = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(
    2,
    "0"
  )}/${now.getFullYear()}`;

  const row: Record<string, string> = {
    teacherName,
    phone: phoneDisplay,
    tcKimlikNo,
    fatherName,
    address,
    birthDate,
    birthPlace,
    employmentStartDate,
    insuranceStartDate,
    instrumentsText,
    generatedDate,
    adSoyad: teacherName,
    cepTelefonu: phoneDisplay,
    babaAdi: fatherName,
    adres: address,
    dogumTarihi: birthDate,
    dogumYeri: birthPlace,
    iseBaslamaTarihi: employmentStartDate,
    sigortaBaslangicTarihi: insuranceStartDate,
    branslar: instrumentsText,
    belgeTarihi: generatedDate,
    Telefon: phoneDisplay,
    baslamaTarihi: employmentStartDate,
    sozlesmeTarihi: employmentStartDate,
    sözlesmeTarihi: employmentStartDate
  };

  return row;
}
