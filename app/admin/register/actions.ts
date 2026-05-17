"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { UserRole } from "@/lib/roles";
import type { AdminFormActionState } from "@/lib/admin-form-action-state";
import { hashPlaceholderUserPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizePhone, phoneToEmail } from "@/lib/phone";
import { isAllowedStudentCourse } from "@/lib/student-course-options";
import { parseTeacherProfileFromForm } from "@/lib/teacher-profile-fields";
import { parseTeacherPaymentFromForm, teacherPaymentPrismaData } from "@/lib/teacher-payment";
import { attachTeacherRowToAdminUser } from "@/lib/link-teacher-to-admin-user";
import { randomUUID } from "node:crypto";

function revalidateAdminRegisterPaths() {
  revalidatePath("/admin");
  revalidatePath("/admin/register-student");
  revalidatePath("/admin/register-teacher");
}

export async function addStudent(
  _prev: AdminFormActionState | null,
  formData: FormData
): Promise<AdminFormActionState> {
  const name = String(formData.get("name") || "");
  const instrument = String(formData.get("instrument") || "");
  const primaryTeacherRaw = String(formData.get("primaryTeacherId") ?? "").trim();
  if (!isAllowedStudentCourse(instrument)) {
    return { ok: false, message: "Geçersiz kurs." };
  }
  const parentNameRaw = String(formData.get("parentName") || "").trim();
  let parentName: string | null = null;
  if (parentNameRaw) {
    if (parentNameRaw.length < 2) {
      return { ok: false, message: "Veli adı soyadı en az 2 karakter olmalıdır." };
    }
    parentName = parentNameRaw;
  }
  const parentRaw = String(formData.get("parentPhone") || "").trim();
  const parentPhone = normalizePhone(parentRaw);
  if (parentPhone.length < 10) {
    return { ok: false, message: "Veli telefonu zorunludur (en az 10 hane)." };
  }

  const primaryTeacherId = primaryTeacherRaw || null;
  if (primaryTeacherId) {
    const teacherExists = await prisma.teacher.findUnique({ where: { id: primaryTeacherId }, select: { id: true } });
    if (!teacherExists) {
      return { ok: false, message: "Seçilen öğretmen bulunamadı." };
    }
  }

  const email = `stud_${randomUUID().replace(/-/g, "")}@internal.local`;

  try {
    const passwordHash = await hashPlaceholderUserPassword();
    const user = await prisma.user.create({
      data: { name, email, passwordHash, role: UserRole.STUDENT },
    });
    await prisma.student.create({
      data: {
        userId: user.id,
        instrument,
        parentName,
        parentPhone,
        primaryTeacherId,
      },
    });
    revalidateAdminRegisterPaths();
    return { ok: true };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return {
        ok: false,
        message: "Kayıt oluşturulamadı (benzersiz alan çakışması). Sayfayı yenileyip tekrar deneyin.",
      };
    }
    console.error(e);
    return { ok: false, message: "Öğrenci eklenirken bir hata oluştu." };
  }
}

export async function addTeacher(
  _prev: AdminFormActionState | null,
  formData: FormData
): Promise<AdminFormActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const phone = normalizePhone(String(formData.get("phone") ?? ""));
  if (name.length < 2) {
    return { ok: false, message: "Ad en az 2 karakter olmalıdır." };
  }
  if (phone.length < 10) {
    return { ok: false, message: "Telefon numarası geçersiz (en az 10 hane)." };
  }

  const email = phoneToEmail(phone);
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    if (existing.role === UserRole.ADMIN) {
      let profile;
      let payment;
      try {
        profile = parseTeacherProfileFromForm(formData);
        payment = parseTeacherPaymentFromForm(formData);
      } catch (e) {
        return {
          ok: false,
          message: e instanceof Error ? e.message : "Form doğrulanamadı.",
        };
      }
      const attached = await attachTeacherRowToAdminUser({
        userId: existing.id,
        name,
        phone,
        profile,
        payment,
      });
      if (!attached.ok) {
        return {
          ok: false,
          message:
            "Bu numara zaten yönetici ve öğretmen olarak kayıtlı. Öğretmen bilgilerini listeden düzenleyin.",
        };
      }
      revalidateAdminRegisterPaths();
      return { ok: true };
    }
    const roleLabel =
      existing.role === UserRole.STUDENT
        ? "öğrenci"
        : existing.role === UserRole.TEACHER
          ? "öğretmen"
          : "kullanıcı";
    return {
      ok: false,
      message: `Bu cep telefonu zaten kayıtlı (${roleLabel}). Aynı numara ile ikinci hesap açılamaz; mevcut kaydı güncelleyin veya farklı numara kullanın.`,
    };
  }

  let profile;
  let payment;
  try {
    profile = parseTeacherProfileFromForm(formData);
    payment = parseTeacherPaymentFromForm(formData);
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "Form doğrulanamadı.",
    };
  }

  try {
    const passwordHash = await hashPlaceholderUserPassword();
    const user = await prisma.user.create({
      data: { name, email, passwordHash, role: UserRole.TEACHER },
    });
    await prisma.teacher.create({
      data: {
        userId: user.id,
        phone,
        instruments: profile.instrumentsJson,
        tcKimlikNo: profile.tcKimlikNo,
        fatherName: profile.fatherName,
        address: profile.address,
        birthDate: profile.birthDate,
        birthPlace: profile.birthPlace,
        employmentStartDate: profile.employmentStartDate,
        insuranceStartDate: profile.insuranceStartDate,
        approved: true,
        ...teacherPaymentPrismaData(payment),
      },
    });
    revalidateAdminRegisterPaths();
    return { ok: true };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return {
        ok: false,
        message:
          "Bu telefon veya e-posta zaten kullanılıyor. Numarayı kontrol edin veya mevcut kaydı güncelleyin.",
      };
    }
    console.error(e);
    return { ok: false, message: "Öğretmen eklenirken bir hata oluştu." };
  }
}
