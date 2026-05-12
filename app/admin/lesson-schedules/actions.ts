"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizePhone } from "@/lib/phone";
import { formatTurkeyMobileDisplay } from "@/lib/student-login-whatsapp";
import { weekdayLabelTr } from "@/lib/weekdays-tr";
import { LESSON_SCOPE_INDIVIDUAL } from "@/lib/lesson-schedule-scope";
import { normalizeTimeHHmm } from "@/lib/time-hhmm";

async function requireAdmin() {
  const session = await getServerSession();
  if (!session || session.role !== "ADMIN") {
    throw new Error("Yetkisiz işlem.");
  }
}

function revalidateLessonSchedulePaths() {
  revalidatePath("/admin/lesson-schedules");
  revalidatePath("/admin");
}

async function createLessonSlotFromForm(formData: FormData) {
  const studentId = String(formData.get("studentId") ?? "").trim();
  const dayRaw = Number(formData.get("dayOfWeek"));
  const startRaw = String(formData.get("startTime") ?? "");
  const endRaw = String(formData.get("endTime") ?? "").trim();
  const teacherRaw = String(formData.get("teacherId") ?? "").trim();
  const label = String(formData.get("label") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!studentId) throw new Error("Öğrenci seçin.");
  if (!Number.isInteger(dayRaw) || dayRaw < 1 || dayRaw > 7) throw new Error("Gün geçersiz.");

  const startTime = normalizeTimeHHmm(startRaw);
  const endTime = endRaw ? normalizeTimeHHmm(endRaw) : null;

  if (!teacherRaw) throw new Error("Öğretmen seçin.");
  const teacherId = teacherRaw;

  await prisma.studentLessonSlot.create({
    data: {
      studentId,
      scopeType: LESSON_SCOPE_INDIVIDUAL,
      dayOfWeek: dayRaw,
      startTime,
      endTime,
      teacherId,
      label,
      notes
    }
  });
}

async function updateLessonSlotFromForm(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  const studentId = String(formData.get("studentId") ?? "").trim();
  const dayRaw = Number(formData.get("dayOfWeek"));
  const startRaw = String(formData.get("startTime") ?? "");
  const endRaw = String(formData.get("endTime") ?? "").trim();
  const teacherRaw = String(formData.get("teacherId") ?? "").trim();
  const label = String(formData.get("label") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!id) throw new Error("Kayıt bulunamadı.");
  if (!studentId) throw new Error("Öğrenci seçin.");
  if (!Number.isInteger(dayRaw) || dayRaw < 1 || dayRaw > 7) throw new Error("Gün geçersiz.");

  const startTime = normalizeTimeHHmm(startRaw);
  const endTime = endRaw ? normalizeTimeHHmm(endRaw) : null;

  if (!teacherRaw) throw new Error("Öğretmen seçin.");
  const teacherId = teacherRaw;

  const existing = await prisma.studentLessonSlot.findUnique({ where: { id } });
  if (!existing) throw new Error("Ders kaydı bulunamadı.");

  const [student, teacher] = await Promise.all([
    prisma.student.findUnique({ where: { id: studentId } }),
    prisma.teacher.findUnique({ where: { id: teacherId } })
  ]);
  if (!student) throw new Error("Öğrenci bulunamadı.");
  if (!teacher) throw new Error("Öğretmen bulunamadı.");

  await prisma.studentLessonSlot.update({
    where: { id },
    data: {
      studentId,
      dayOfWeek: dayRaw,
      startTime,
      endTime,
      teacherId,
      label,
      notes
    }
  });
}

export async function addLessonSlot(formData: FormData) {
  await requireAdmin();
  await createLessonSlotFromForm(formData);
  revalidateLessonSchedulePaths();
  redirect("/admin/lesson-schedules?toast=created");
}

/** Yönetim paneli öğrenci kartı — yönlendirme yok */
export async function addLessonSlotInline(formData: FormData) {
  await requireAdmin();
  await createLessonSlotFromForm(formData);
  revalidateLessonSchedulePaths();
}

export async function updateLessonSlot(formData: FormData) {
  await requireAdmin();
  await updateLessonSlotFromForm(formData);
  revalidateLessonSchedulePaths();
  redirect("/admin/lesson-schedules?toast=updated");
}

export async function updateLessonSlotInline(formData: FormData) {
  await requireAdmin();
  await updateLessonSlotFromForm(formData);
  revalidateLessonSchedulePaths();
}

async function deleteLessonSlotById(id: string) {
  if (!id) throw new Error("Kayıt bulunamadı.");
  await prisma.studentLessonSlot.delete({ where: { id } });
}

export async function deleteLessonSlot(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  await deleteLessonSlotById(id);
  revalidateLessonSchedulePaths();
  redirect("/admin/lesson-schedules?toast=deleted");
}

export async function deleteLessonSlotInline(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  await deleteLessonSlotById(id);
  revalidateLessonSchedulePaths();
}

export type PrepareLessonReminderWhatsAppResult =
  | { ok: true; waUrl: string }
  | { ok: false; message: string };

function toWaRecipient(normalizedPhone: string): string {
  const digits = normalizedPhone.replace(/\D/g, "");
  return digits.length === 10 ? `90${digits}` : digits.startsWith("90") ? digits : `90${digits}`;
}

function timeRange(startTime: string, endTime: string | null): string {
  return endTime ? `${startTime} - ${endTime}` : startTime;
}

export async function prepareLessonReminderWhatsApp(
  slotId: string,
  recipient: "student" | "teacher"
): Promise<PrepareLessonReminderWhatsAppResult> {
  await requireAdmin();
  const id = String(slotId ?? "").trim();
  if (!id) return { ok: false, message: "Ders kaydı bulunamadı." };

  const slot = await prisma.studentLessonSlot.findUnique({
    where: { id },
    include: {
      student: { include: { user: true } },
      teacher: { include: { user: true } }
    }
  });
  if (!slot) return { ok: false, message: "Ders kaydı bulunamadı." };

  if (recipient === "teacher" && !slot.teacher) {
    return { ok: false, message: "Bu ders için öğretmen atanmamış." };
  }

  let targetPhoneRaw = "";
  if (recipient === "teacher") {
    targetPhoneRaw = slot.teacher?.phone ?? "";
  } else {
    const pp = slot.student.parentPhone?.trim() ?? "";
    targetPhoneRaw = pp || "";
  }
  const targetPhone = normalizePhone(targetPhoneRaw);
  if (recipient !== "teacher" && targetPhone.length < 10) {
    return {
      ok: false,
      message:
        "Veli telefonu eksik veya geçersiz. Hatırlatma veliye gönderilir; öğrenci kaydına veli numarasını ekleyin."
    };
  }
  if (recipient === "teacher" && targetPhone.length < 10) {
    return { ok: false, message: "Telefon numarası geçersiz." };
  }

  const studentName = slot.student.user.name;
  const teacherName = slot.teacher?.user.name ?? "—";
  const dayLabel = weekdayLabelTr(slot.dayOfWeek);
  const hour = timeRange(slot.startTime, slot.endTime);
  const body =
    recipient === "student"
      ? [
          "Merhaba,",
          "",
          `${studentName} için ders hatırlatması:`,
          `• Gün: ${dayLabel}`,
          `• Saat: ${hour}`,
          `• Öğretmen: ${teacherName}`,
          ...(slot.label ? [`• Ders: ${slot.label}`] : []),
          ...(slot.notes ? [`• Not: ${slot.notes}`] : [])
        ].join("\n")
      : [
          `Merhaba ${teacherName},`,
          "",
          "Ders hatırlatması:",
          `• Öğrenci: ${studentName}`,
          `• Gün: ${dayLabel}`,
          `• Saat: ${hour}`,
          ...(normalizePhone(slot.student.parentPhone ?? "").length >= 10
            ? [
                `• Veli telefonu: ${formatTurkeyMobileDisplay(
                  normalizePhone(slot.student.parentPhone ?? "")
                )}`
              ]
            : []),
          ...(slot.label ? [`• Ders: ${slot.label}`] : []),
          ...(slot.notes ? [`• Not: ${slot.notes}`] : [])
        ].join("\n");

  const waUrl = `https://wa.me/${toWaRecipient(targetPhone)}?text=${encodeURIComponent(body)}`;
  return { ok: true, waUrl };
}
