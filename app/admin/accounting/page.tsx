import { prisma } from "@/lib/prisma";
import AccountingDueTodayPanel from "@/components/admin/AccountingDueTodayPanel";
import AccountingStudentsSection from "@/components/admin/AccountingStudentsSection";
import type { AccountingStudentRow } from "@/components/admin/AccountingStudentTable";
import { getAdminLoadErrorMessage } from "@/lib/admin-load-error";
import { bootstrapProductionDatabaseIfNeeded } from "@/lib/bootstrap-production-db";
import {
  getCurrentPaymentMonth,
  isPaidFromLedgerSet,
  isPaymentDueReached
} from "@/lib/payment-month";
import { courseFeeToNumber } from "@/lib/student-course-billing";
import { formatTurkeyMobileDisplay } from "@/lib/student-login-whatsapp";
import {
  buildPaymentReminderWhatsAppPayload,
  resolvePaymentRecipientPhone
} from "@/lib/payment-whatsapp";

function formatMonthLabel(yyyyMm: string): string {
  const [y, m] = yyyyMm.split("-").map(Number);
  if (!y || !m) return yyyyMm;
  return new Intl.DateTimeFormat("tr-TR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC"
  }).format(new Date(Date.UTC(y, m - 1, 1)));
}

export default async function AdminAccountingPage() {
  await bootstrapProductionDatabaseIfNeeded();

  const currentMonth = getCurrentPaymentMonth();
  const currentMonthLabel = formatMonthLabel(currentMonth);

  let loadError: string | null = null;
  let rows: AccountingStudentRow[] = [];

  try {
    const [students, monthPayments] = await Promise.all([
      prisma.student.findMany({
        include: { user: true },
        orderBy: { user: { name: "asc" } }
      }),
      prisma.studentMonthlyPayment.findMany({
        where: { paymentMonth: currentMonth },
        select: { studentId: true }
      })
    ]);

    const paidStudentIds = new Set(monthPayments.map((p) => p.studentId));

    rows = students.map((s) => {
      const recipientPhone = resolvePaymentRecipientPhone(s.parentPhone);
      const parentPhoneNorm = recipientPhone ?? "";
      const hasParentPhone = Boolean(recipientPhone);
      const isPaid = isPaidFromLedgerSet(paidStudentIds, s.id);
      const dueDay = s.paymentDueDay ?? 1;
      const studentName = s.user.name;

      return {
        id: s.id,
        name: studentName,
        instrument: s.instrument,
        parentName: s.parentName,
        parentPhoneDisplay: parentPhoneNorm
          ? formatTurkeyMobileDisplay(parentPhoneNorm)
          : "",
        hasParentPhone,
        waReminder: recipientPhone
          ? buildPaymentReminderWhatsAppPayload({
              normalizedRecipientPhone: recipientPhone,
              studentName
            })
          : null,
        paymentDueDay: dueDay,
        courseFee: courseFeeToNumber(s.courseFee),
        courseStartDate: s.courseStartDate,
        isPaid,
        isDueReached: isPaymentDueReached(dueDay)
      };
    });
  } catch (e) {
    console.error(e);
    loadError = getAdminLoadErrorMessage();
  }

  const paidCount = rows.filter((r) => r.isPaid).length;
  const unpaidCount = rows.length - paidCount;
  const dueTodayRows = rows.filter((r) => r.isDueReached && !r.isPaid);
  const dueTodayCount = dueTodayRows.length;

  return (
    <>
      {loadError ? (
        <div className="rounded-xl border border-red-900/80 bg-red-950/40 px-4 py-3 text-sm text-red-200">
          {loadError}
        </div>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 px-4 py-3">
          <p className="text-xs text-zinc-500">Bu ay ödenen</p>
          <p className="text-2xl font-semibold text-emerald-400">{paidCount}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 px-4 py-3">
          <p className="text-xs text-zinc-500">Bu ay ödenmeyen</p>
          <p className="text-2xl font-semibold text-red-400">{unpaidCount}</p>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 px-4 py-3">
          <p className="text-xs text-zinc-500">Tahsilat günü gelmiş</p>
          <p className="text-2xl font-semibold text-amber-400">{dueTodayCount}</p>
        </div>
      </section>

      <section className="card space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold">Öğrenci ödemeleri — {currentMonthLabel}</h2>
          <p className="text-xs text-zinc-500">
            Ödendi durumu yalnızca{" "}
            <span className="text-zinc-300">Ödeme kayıtları</span> sekmesinden eklenen kayıtlara göre
            güncellenir.
          </p>
        </div>
        <AccountingStudentsSection
          rows={rows}
          currentMonthLabel={currentMonthLabel}
          title="Tüm öğrenciler"
        />
      </section>

      <AccountingDueTodayPanel dueRows={dueTodayRows} currentMonthLabel={currentMonthLabel} />
    </>
  );
}
