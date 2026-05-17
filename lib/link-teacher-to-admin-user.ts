import { prisma } from "@/lib/prisma";
import {
  defaultTeacherPaymentSettings,
  teacherPaymentPrismaData,
  type TeacherPaymentSettings
} from "@/lib/teacher-payment";

/** `Teacher` tablosu için ortak alanlar (JSON enstrüman listesi dahil). */
export type TeacherRowProfileInput = {
  instrumentsJson: string;
  tcKimlikNo: string | null;
  fatherName: string | null;
  address: string | null;
  birthDate: string | null;
  birthPlace: string | null;
  employmentStartDate: string | null;
  insuranceStartDate: string | null;
};

/**
 * Aynı telefonla giriş yapan yönetici için ayrı `User` açmadan öğretmen profili ekler.
 * Oturum rolü ADMIN kalır; öğretmen listesi ve branş bilgisi `Teacher` üzerinden kullanılır.
 */
export async function attachTeacherRowToAdminUser(params: {
  userId: string;
  name: string;
  phone: string;
  profile: TeacherRowProfileInput;
  payment?: TeacherPaymentSettings;
}): Promise<{ ok: true } | { ok: false; reason: "already_teacher" }> {
  const existingTeacher = await prisma.teacher.findUnique({
    where: { userId: params.userId }
  });
  if (existingTeacher) {
    return { ok: false, reason: "already_teacher" };
  }

  const { profile } = params;
  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: params.userId },
      data: { name: params.name }
    });
    await tx.teacher.create({
      data: {
        userId: params.userId,
        phone: params.phone,
        instruments: profile.instrumentsJson,
        tcKimlikNo: profile.tcKimlikNo,
        fatherName: profile.fatherName,
        address: profile.address,
        birthDate: profile.birthDate,
        birthPlace: profile.birthPlace,
        employmentStartDate: profile.employmentStartDate,
        insuranceStartDate: profile.insuranceStartDate,
        approved: true,
        ...teacherPaymentPrismaData(params.payment ?? defaultTeacherPaymentSettings())
      }
    });
  });

  return { ok: true };
}
