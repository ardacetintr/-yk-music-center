import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import AdminSubNav from "@/components/admin/AdminSubNav";
import AccountingSubTabs from "@/components/admin/AccountingSubTabs";
import { greetingDisplayName } from "@/lib/display-name";

export default async function AccountingLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  if (!session) redirect("/admin/login");
  if (session.role !== "ADMIN") redirect("/dashboard");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs text-zinc-500">
            <Link href="/admin" className="text-brand-400 hover:text-brand-300">
              Yönetim
            </Link>
          </p>
          <h1 className="text-2xl font-semibold">Muhasebe</h1>
          <p className="mt-1 text-zinc-400">Tahsilat takibi ve ay bazlı ödeme kayıtları.</p>
        </div>
        <p className="text-sm text-zinc-500">{greetingDisplayName(session.name)}</p>
      </div>

      <AdminSubNav current="accounting" />
      <AccountingSubTabs />
      {children}
    </div>
  );
}
