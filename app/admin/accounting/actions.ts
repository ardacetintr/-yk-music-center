"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatTurkeyMobileDisplay } from "@/lib/student-login-whatsapp";
import {
  buildPaymentReminderWhatsAppPayload,
  resolvePaymentRecipientPhone
} from "@/lib/payment-whatsapp";
import type { WhatsAppSendPayload } from "@/lib/whatsapp-url";
import {
  clampPaymentDueDay,
  getCurrentPaymentMonth,
  isPaidForCurrentMonth,
  isPaymentDueReached
} from "@/lib/payment-month";

const ACCOUNTING_PATH = "/admin/accounting";

async function ensureAdmin() {
  const session = await getServerSession();
  if (!session || session.role !== "ADMIN") {
    throw new Error("Yetkisiz işlem.");
  }
}

function revalidateAccounting() {
  revalidatePath(ACCOUNTING_PATH);
}

export async function updateStudentPaymentDueDay(formData: FormData) {
  await ensureAdmin();
  const studentId = String(formData.get("studentId") ?? "").trim();
  const dueDay = clampPaymentDueDay(Number(formData.get("paymentDueDay") ?? 1));
  if (!studentId) throw new Error("Öğrenci bulunamadı.");

  await prisma.student.update({
    where: { id: studentId },
    data: { paymentDueDay: dueDay }
  });
  revalidateAccounting();
}

export async function setStudentPaymentPaid(formData: FormData) {
  await ensureAdmin();
  const studentId = String(formData.get("studentId") ?? "").trim();
  const paid = String(formData.get("paid") ?? "") === "1";
  if (!studentId) throw new Error("Öğrenci bulunamadı.");

  await prisma.student.update({
    where: { id: studentId },
    data: { paymentPaidMonth: paid ? getCurrentPaymentMonth() : null }
  });
  revalidateAccounting();
}

export type PreparePaymentReminderWhatsAppResult =
  | { ok: true; send: WhatsAppSendPayload }
  | { ok: false; message: string };

export async function preparePaymentReminderWhatsApp(
  studentId: string
): Promise<PreparePaymentReminderWhatsAppResult> {
  await ensureAdmin();
  const id = String(studentId ?? "").trim();
  if (!id) return { ok: false, message: "Öğrenci bulunamadı." };

  const student = await prisma.student.findUnique({
    where: { id },
    include: { user: true }
  });
  if (!student) return { ok: false, message: "Öğrenci bulunamadı." };

  const phone = resolvePaymentRecipientPhone(student.parentPhone);
  if (!phone) {
    return {
      ok: false,
      message: "Veli telefonu eksik. Öğrenci kaydına veli numarası ekleyin."
    };
  }

  const send = buildPaymentReminderWhatsAppPayload({
    normalizedRecipientPhone: phone,
    studentName: student.user.name
  });

  return { ok: true, send };
}

export type PaymentReminderTarget = {
  studentId: string;
  studentName: string;
  parentName: string | null;
  parentPhoneDisplay: string;
  send: WhatsAppSendPayload;
};

export type PrepareDueTodayBulkResult =
  | {
      ok: true;
      targets: PaymentReminderTarget[];
      skipped: { studentName: string; reason: string }[];
    }
  | { ok: false; message: string };

export async function prepareDueTodayBulkPaymentReminders(): Promise<PrepareDueTodayBulkResult> {
  await ensureAdmin();

  const students = await prisma.student.findMany({
    include: { user: true },
    orderBy: { user: { name: "asc" } }
  });

  const targets: PaymentReminderTarget[] = [];
  const skipped: { studentName: string; reason: string }[] = [];

  for (const s of students) {
    const dueDay = s.paymentDueDay ?? 1;
    const due = isPaymentDueReached(dueDay);
    const paid = isPaidForCurrentMonth(s.paymentPaidMonth);
    const name = s.user.name;

    if (!due || paid) continue;

    const phone = resolvePaymentRecipientPhone(s.parentPhone);
    if (!phone) {
      skipped.push({ studentName: name, reason: "Veli telefonu yok" });
      continue;
    }

    targets.push({
      studentId: s.id,
      studentName: name,
      parentName: s.parentName,
      parentPhoneDisplay: formatTurkeyMobileDisplay(phone),
      send: buildPaymentReminderWhatsAppPayload({
        normalizedRecipientPhone: phone,
        studentName: name
      })
    });
  }

  return { ok: true, targets, skipped };
}

export async function preparePaymentRemindersForStudentIds(
  studentIds: string[]
): Promise<PrepareDueTodayBulkResult> {
  await ensureAdmin();
  const ids = [...new Set(studentIds.map((id) => id.trim()).filter(Boolean))];
  if (!ids.length) {
    return { ok: true, targets: [], skipped: [] };
  }

  const students = await prisma.student.findMany({
    where: { id: { in: ids } },
    include: { user: true },
    orderBy: { user: { name: "asc" } }
  });

  const targets: PaymentReminderTarget[] = [];
  const skipped: { studentName: string; reason: string }[] = [];

  for (const s of students) {
    const name = s.user.name;
    const phone = resolvePaymentRecipientPhone(s.parentPhone);
    if (!phone) {
      skipped.push({ studentName: name, reason: "Veli telefonu yok" });
      continue;
    }
    targets.push({
      studentId: s.id,
      studentName: name,
      parentName: s.parentName,
      parentPhoneDisplay: formatTurkeyMobileDisplay(phone),
      send: buildPaymentReminderWhatsAppPayload({
        normalizedRecipientPhone: phone,
        studentName: name
      })
    });
  }

  return { ok: true, targets, skipped };
}
