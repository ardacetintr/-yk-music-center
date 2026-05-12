import { z } from "zod";
import { normalizePhone } from "./phone";
import { isAllowedStudentCourse } from "./student-course-options";

/** Ham girişi normalize edip en az 10 hane kontrol eder (cep için tipik: 10 hane). */
const phoneField = z.preprocess(
  (val) => (typeof val === "string" ? normalizePhone(val.trim()) : ""),
  z.string().min(10)
);

/** PATCH vb.: alan yoksa veya boşsa geç; doluysa normalize et ve en az 10 hane. */
const optionalNormalizedPhone = z
  .string()
  .optional()
  .transform((s) => {
    if (s === undefined || s.trim() === "") return undefined;
    return normalizePhone(s);
  })
  .refine((s) => s === undefined || s.length >= 10);

const optionalParentName = z
  .string()
  .optional()
  .transform((s) => {
    if (s === undefined || s.trim() === "") return undefined;
    return s.trim();
  })
  .refine((s) => s === undefined || s.length >= 2, { message: "Veli adı en az 2 karakter olmalıdır." });

export const loginSchema = z.object({
  phone: phoneField,
  password: z
    .string()
    .optional()
    .transform((s) => (typeof s === "string" ? s.normalize("NFKC").trim() : ""))
});

export const forgotPasswordRequestSchema = z.object({
  phone: phoneField
});

export const forgotPasswordVerifySchema = z.object({
  phone: phoneField,
  code: z.string().regex(/^\d{6}$/, "Doğrulama kodu 6 rakam olmalıdır."),
  password: z.string().min(6)
});

export const studentRegistrationSchema = z.object({
  name: z.string().min(2),
  instrument: z.string().min(2),
  parentName: optionalParentName,
  parentPhone: phoneField
});

const teacherInstrumentsField = z
  .array(z.string())
  .min(1, "En az bir branş seçmelisiniz.")
  .refine((arr) => arr.every((x) => isAllowedStudentCourse(x)), {
    message: "Geçersiz branş seçimi."
  });

const optionalTrimmedNullable = z.preprocess((val) => {
  if (val === undefined || val === null || val === "") return undefined;
  const s = String(val).trim();
  return s === "" ? undefined : s;
}, z.string().optional());

const optionalIsoDateNullable = z.preprocess((val) => {
  if (val === undefined || val === null || val === "") return undefined;
  const s = String(val).trim();
  return s === "" ? undefined : s;
}, z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tarih YYYY-AA-GG olmalıdır.").optional());

const optionalTcKimlikNullable = z.preprocess((val) => {
  if (val === undefined || val === null || val === "") return undefined;
  const d = String(val).replace(/\D/g, "");
  return d === "" ? undefined : d;
}, z.string().length(11, "T.C. Kimlik No 11 hane olmalıdır.").optional());

export const teacherCreateSchema = z.object({
  name: z.string().min(2),
  phone: phoneField,
  instruments: teacherInstrumentsField,
  tcKimlikNo: optionalTcKimlikNullable,
  fatherName: optionalTrimmedNullable,
  address: optionalTrimmedNullable,
  birthDate: optionalIsoDateNullable,
  birthPlace: optionalTrimmedNullable,
  employmentStartDate: optionalIsoDateNullable,
  insuranceStartDate: optionalIsoDateNullable
});

export const teacherApplicationSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: phoneField,
  instrument: z.string().min(2),
  bio: z.string().optional(),
  experience: z.coerce.number().int().min(0)
});

export const studentUpdateSchema = z.object({
  instrument: z.string().min(2).optional(),
  parentName: z
    .union([z.string(), z.null()])
    .optional()
    .transform((v) => {
      if (v === undefined) return undefined;
      if (v === null || (typeof v === "string" && v.trim() === "")) return null;
      return v.trim();
    })
    .refine((v) => v === undefined || v === null || v.length >= 2, {
      message: "Veli adı en az 2 karakter olmalıdır."
    }),
  parentPhone: z
    .union([z.string(), z.null()])
    .optional()
    .transform((v) => {
      if (v === undefined) return undefined;
      if (v === null || (typeof v === "string" && v.trim() === "")) return null;
      return normalizePhone(v);
    })
    .refine((v) => v === undefined || v === null || v.length >= 10, {
      message: "Veli telefonu geçersiz."
    })
});

export const teacherUpdateSchema = z.object({
  phone: optionalNormalizedPhone,
  instruments: teacherInstrumentsField.optional(),
  tcKimlikNo: optionalTcKimlikNullable,
  fatherName: optionalTrimmedNullable,
  address: optionalTrimmedNullable,
  birthDate: optionalIsoDateNullable,
  birthPlace: optionalTrimmedNullable,
  employmentStartDate: optionalIsoDateNullable,
  insuranceStartDate: optionalIsoDateNullable,
  approved: z.boolean().optional()
});
