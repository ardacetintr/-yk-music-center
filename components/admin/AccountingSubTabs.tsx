"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabClass = (active: boolean) =>
  [
    "rounded-lg px-3 py-1.5 text-sm font-medium transition",
    active
      ? "bg-brand-900/50 text-brand-100 ring-1 ring-brand-700/40"
      : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
  ].join(" ");

export default function AccountingSubTabs() {
  const pathname = usePathname();
  const isLedger = pathname?.startsWith("/admin/accounting/ledger");

  return (
    <nav className="flex flex-wrap gap-2 border-b border-zinc-800/80 pb-3">
      <Link href="/admin/accounting" className={tabClass(!isLedger)}>
        Tahsilat &amp; hatırlatma
      </Link>
      <Link href="/admin/accounting/ledger" className={tabClass(isLedger)}>
        Ödeme kayıtları
      </Link>
    </nav>
  );
}
