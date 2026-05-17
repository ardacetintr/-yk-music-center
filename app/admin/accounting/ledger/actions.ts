"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseTurkishMoneyInput } from "@/lib/money";
import { getCurrentPaymentMonth } from "@/lib/payment-month";

const LEDGER_PATH = "/admin/accounting/ledger";

async function ensureAdmin() {
  const session = await getServerSession();
  if (!session || session.role !== "ADMIN") {
    throw new Error("Yetkisiz işlem.");
  }
}

function revalidateLedger() {
  revalidatePath(LEDGER_PATH);
  revalidatePath("/admin/accounting");
}

const MONTH_RE = /^\d{4}-\d{2}$/;

function parseMonth(raw: string): string {
  const t = raw.trim();
  if (MONTH_RE.test(t)) return t;
  return getCurrentPaymentMonth();
}

export async function upsertStudentMonthlyPayment(formData: FormData) {
  await ensureAdmin();
  const studentId = String(formData.get("studentId") ?? "").trim();
  const paymentMonth = parseMonth(String(formData.get("paymentMonth") ?? ""));
  const amountRaw = String(formData.get("amount") ?? "");
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const id = String(formData.get("id") ?? "").trim();

  if (!studentId) throw new Error("Öğrenci seçin.");

  const amount = parseTurkishMoneyInput(amountRaw);
  if (amount === null || amount <= 0) throw new Error("Geçerli bir tutar girin.");

  const data = {
    studentId,
    paymentMonth,
    amount: new Prisma.Decimal(amount),
    notes
  };

  if (id) {
    await prisma.studentMonthlyPayment.update({
      where: { id },
      data
    });
  } else {
    await prisma.studentMonthlyPayment.upsert({
      where: {
        studentId_paymentMonth: { studentId, paymentMonth }
      },
      create: data,
      update: { amount: data.amount, notes: data.notes }
    });
  }

  const currentMonth = getCurrentPaymentMonth();
  if (paymentMonth === currentMonth) {
    await prisma.student.update({
      where: { id: studentId },
      data: { paymentPaidMonth: paymentMonth }
    });
  }

  revalidateLedger();
}

export async function deleteStudentMonthlyPayment(formData: FormData) {
  await ensureAdmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) throw new Error("Kayıt bulunamadı.");

  const row = await prisma.studentMonthlyPayment.findUnique({
    where: { id },
    select: { studentId: true, paymentMonth: true }
  });
  if (!row) throw new Error("Kayıt bulunamadı.");

  await prisma.studentMonthlyPayment.delete({ where: { id } });

  const currentMonth = getCurrentPaymentMonth();
  if (row.paymentMonth === currentMonth) {
    const stillPaid = await prisma.studentMonthlyPayment.findFirst({
      where: { studentId: row.studentId, paymentMonth: currentMonth }
    });
    await prisma.student.update({
      where: { id: row.studentId },
      data: { paymentPaidMonth: stillPaid ? currentMonth : null }
    });
  }

  revalidateLedger();
}
