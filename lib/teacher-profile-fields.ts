import {
  parseInstrumentSelectionsFromForm,
  serializeTeacherInstruments
} from "@/lib/teacher-instruments";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

export function optionalTrimmed(formData: FormData, key: string): string | null {
  const v = String(formData.get(key) ?? "").trim();
  return v === "" ? null : v;
}

export function optionalIsoDate(formData: FormData, key: string): string | null {
  const v = String(formData.get(key) ?? "").trim();
  if (v === "") return null;
  if (!ISO_DATE.test(v)) {
    throw new Error("Tarih alanları YYYY-AA-GG biçiminde olmalıdır.");
  }
  return v;
}

/** Sadece rakam; boş ise null, doluysa tam 11 hane. */
export function optionalTcKimlik(formData: FormData): string | null {
  const raw = String(formData.get("tcKimlikNo") ?? "").replace(/\D/g, "");
  if (raw === "") return null;
  if (raw.length !== 11) {
    throw new Error("T.C. Kimlik No 11 hane olmalıdır.");
  }
  return raw;
}

export type ParsedTeacherProfileFromForm = {
  instrumentsJson: string;
  tcKimlikNo: string | null;
  fatherName: string | null;
  address: string | null;
  birthDate: string | null;
  birthPlace: string | null;
  employmentStartDate: string | null;
  insuranceStartDate: string | null;
};

export function parseTeacherProfileFromForm(formData: FormData): ParsedTeacherProfileFromForm {
  const picked = parseInstrumentSelectionsFromForm(formData);
  if (picked.length === 0) {
    throw new Error("En az bir branş seçmelisiniz.");
  }
  return {
    instrumentsJson: serializeTeacherInstruments(picked),
    tcKimlikNo: optionalTcKimlik(formData),
    fatherName: optionalTrimmed(formData, "fatherName"),
    address: optionalTrimmed(formData, "address"),
    birthDate: optionalIsoDate(formData, "birthDate"),
    birthPlace: optionalTrimmed(formData, "birthPlace"),
    employmentStartDate: optionalIsoDate(formData, "employmentStartDate"),
    insuranceStartDate: optionalIsoDate(formData, "insuranceStartDate")
  };
}
