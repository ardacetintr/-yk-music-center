import { prisma } from "@/lib/prisma";
import AccountingDueTodayPanel from "@/components/admin/AccountingDueTodayPanel";
import AccountingStudentTable, {
  type AccountingStudentRow
} from "@/components/admin/AccountingStudentTable";
import { getAdminLoadErrorMessage } from "@/lib/admin-load-error";
import { bootstrapProductionDatabaseIfNeeded } from "@/lib/bootstrap-production-db";
import {
  getCurrentPaymentMonth,
  isPaidForCurrentMonth,
  isPaymentDueReached
} from "@/lib/payment-month";
import { normalizePhone } from "@/lib/phone";
import { formatTurkeyMobileDisplay } from "@/lib/student-login-whatsapp";
import { resolvePaymentRecipientPhone } from "@/lib/payment-whatsapp";

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
    const students = await prisma.student.findMany({
      include: { user: true },
      orderBy: { user: { name: "asc" } }
    });

    rows = students.map((s) => {
      const parentPhoneNorm = s.parentPhone ? normalizePhone(s.parentPhone) : "";
      const hasParentPhone = Boolean(resolvePaymentRecipientPhone(s.parentPhone));
      const isPaid = isPaidForCurrentMonth(s.paymentPaidMonth);
      const dueDay = s.paymentDueDay ?? 1;

      return {
        id: s.id,
        name: s.user.name,
        instrument: s.instrument,
        parentName: s.parentName,
        parentPhoneDisplay: parentPhoneNorm
          ? formatTurkeyMobileDisplay(parentPhoneNorm)
          : "",
        hasParentPhone,
        paymentDueDay: dueDay,
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

      <AccountingDueTodayPanel dueRows={dueTodayRows} currentMonthLabel={currentMonthLabel} />

      <section className="card space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold">Öğrenci ödemeleri — {currentMonthLabel}</h2>
          <p className="text-xs text-zinc-500">
            <span className="text-emerald-400">Ödendi</span> /{" "}
            <span className="text-red-400">Ödenmedi</span> — duruma tıklayarak değiştirin
          </p>
        </div>
        <AccountingStudentTable rows={rows} currentMonthLabel={currentMonthLabel} />
      </section>
    </>
  );
}
