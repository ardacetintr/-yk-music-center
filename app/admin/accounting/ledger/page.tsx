import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import AccountingPaymentLedger, {
  type PaymentLedgerRow
} from "@/components/admin/AccountingPaymentLedger";
import { getAdminLoadErrorMessage } from "@/lib/admin-load-error";
import { bootstrapProductionDatabaseIfNeeded } from "@/lib/bootstrap-production-db";
import { getCurrentPaymentMonth } from "@/lib/payment-month";

function formatMonthLabel(yyyyMm: string): string {
  const [y, m] = yyyyMm.split("-").map(Number);
  if (!y || !m) return yyyyMm;
  return new Intl.DateTimeFormat("tr-TR", {
    month: "long",
    year: "numeric",
    timeZone: "UTC"
  }).format(new Date(Date.UTC(y, m - 1, 1)));
}

type SearchParams = Promise<{ month?: string }>;

async function LedgerContent({ searchParams }: { searchParams: SearchParams }) {
  await bootstrapProductionDatabaseIfNeeded();
  const params = await searchParams;
  const defaultMonth = getCurrentPaymentMonth();
  const filterMonth =
    params.month && /^\d{4}-\d{2}$/.test(params.month) ? params.month : null;

  let loadError: string | null = null;
  let rows: PaymentLedgerRow[] = [];
  let students: { id: string; name: string }[] = [];

  try {
    if (!("studentMonthlyPayment" in prisma) || !prisma.studentMonthlyPayment) {
      throw new Error(
        "PRISMA_STALE: Ödeme kayıtları modülü yüklü değil. Sunucuyu durdurun (Ctrl+C), " +
          "npx prisma generate çalıştırın, ardından npm run dev ile yeniden başlatın."
      );
    }

    const [payments, studentList] = await Promise.all([
      prisma.studentMonthlyPayment.findMany({
        include: { student: { include: { user: true } } },
        orderBy: [{ paymentMonth: "desc" }, { student: { user: { name: "asc" } } }]
      }),
      prisma.student.findMany({
        include: { user: true },
        orderBy: { user: { name: "asc" } }
      })
    ]);

    students = studentList.map((s) => ({ id: s.id, name: s.user.name }));

    rows = payments.map((p) => ({
      id: p.id,
      studentId: p.studentId,
      studentName: p.student.user.name,
      instrument: p.student.instrument,
      paymentMonth: p.paymentMonth,
      paymentMonthLabel: formatMonthLabel(p.paymentMonth),
      amount: Number(p.amount),
      notes: p.notes
    }));
  } catch (e) {
    console.error(e);
    const msg = e instanceof Error ? e.message : "";
    loadError = msg.startsWith("PRISMA_STALE:")
      ? msg.replace(/^PRISMA_STALE:\s*/, "")
      : getAdminLoadErrorMessage();
  }

  if (loadError) {
    return (
      <div className="rounded-xl border border-red-900/80 bg-red-950/40 px-4 py-3 text-sm text-red-200">
        {loadError}
      </div>
    );
  }

  return (
    <AccountingPaymentLedger
      rows={rows}
      students={students}
      defaultMonth={defaultMonth}
      filterMonth={filterMonth}
    />
  );
}

export default function AccountingLedgerPage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  return (
    <Suspense fallback={<p className="text-sm text-zinc-500">Yükleniyor…</p>}>
      <LedgerContent searchParams={searchParams} />
    </Suspense>
  );
}
