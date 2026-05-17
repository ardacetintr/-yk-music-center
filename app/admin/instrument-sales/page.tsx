import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminSubNav from "@/components/admin/AdminSubNav";
import { greetingDisplayName } from "@/lib/display-name";
import { getAdminLoadErrorMessage } from "@/lib/admin-load-error";
import { bootstrapProductionDatabaseIfNeeded } from "@/lib/bootstrap-production-db";
import { formatTurkishMoney } from "@/lib/money";
import { addInstrumentSale, deleteInstrumentSale } from "./actions";

export default async function AdminInstrumentSalesPage() {
  const session = await getServerSession();
  if (!session) redirect("/admin/login");
  if (session.role !== "ADMIN") redirect("/dashboard");

  await bootstrapProductionDatabaseIfNeeded();

  const todayISO = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Istanbul" });

  let loadError: string | null = null;
  let sales: Awaited<ReturnType<typeof prisma.instrumentSale.findMany>> = [];

  try {
    sales = await prisma.instrumentSale.findMany({
      orderBy: [{ soldDate: "desc" }, { createdAt: "desc" }],
      take: 300
    });
  } catch (e) {
    console.error(e);
    loadError = getAdminLoadErrorMessage();
  }

  const totalRevenue = sales.reduce((sum, row) => sum + Number(row.price), 0);

  function formatTrDate(iso: string) {
    const [y, m, d] = iso.split("-").map(Number);
    if (!y || !m || !d) return iso;
    return new Intl.DateTimeFormat("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC"
    }).format(new Date(Date.UTC(y, m - 1, d)));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs text-zinc-500">
            <Link href="/admin" className="text-brand-400 hover:text-brand-300">
              Yönetim
            </Link>
          </p>
          <h1 className="text-2xl font-semibold">Enstrüman satışı</h1>
          <p className="mt-1 text-zinc-400">
            Satılan enstrümanları, müşteriyi ve fiyatı kaydedin.
          </p>
        </div>
        <p className="text-sm text-zinc-500">{greetingDisplayName(session.name)}</p>
      </div>

      <AdminSubNav current="instrument-sales" />

      {loadError ? (
        <div className="rounded-xl border border-red-900/80 bg-red-950/40 px-4 py-3 text-sm text-red-200">
          {loadError}
        </div>
      ) : null}

      {!loadError && sales.length > 0 ? (
        <p className="text-sm text-zinc-400">
          Listelenen kayıtların toplamı:{" "}
          <span className="font-medium text-emerald-300">{formatTurkishMoney(totalRevenue)}</span>
          <span className="text-zinc-600"> ({sales.length} satış)</span>
        </p>
      ) : null}

      <section className="card space-y-4">
        <h2 className="text-lg font-semibold">Satış ekle</h2>
        <form
          action={addInstrumentSale}
          className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-end"
        >
          <label className="flex min-w-[10rem] flex-1 flex-col gap-1 text-xs text-zinc-500">
            Enstrüman
            <input
              name="instrumentName"
              required
              placeholder="Örn. Klasik gitar"
              className="rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100"
            />
          </label>
          <label className="flex min-w-[10rem] flex-1 flex-col gap-1 text-xs text-zinc-500">
            Müşteri
            <input
              name="buyerName"
              required
              placeholder="Ad soyad"
              className="rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100"
            />
          </label>
          <label className="flex min-w-[7rem] flex-col gap-1 text-xs text-zinc-500">
            Fiyat (₺)
            <input
              name="price"
              required
              inputMode="decimal"
              placeholder="12.500"
              className="rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100"
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-zinc-500">
            Satış tarihi
            <input
              type="date"
              name="soldDate"
              required
              defaultValue={todayISO}
              className="rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100"
            />
          </label>
          <label className="flex min-w-[12rem] flex-[2] flex-col gap-1 text-xs text-zinc-500">
            Not (isteğe bağlı)
            <input
              name="notes"
              placeholder="Örn. Kılıf hediye"
              className="rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100"
            />
          </label>
          <button
            type="submit"
            className="rounded-lg bg-brand-600 px-6 py-2 font-medium hover:bg-brand-500"
          >
            Kaydet
          </button>
        </form>
      </section>

      <section className="card">
        <h2 className="mb-3 text-lg font-semibold">Satış kayıtları</h2>
        {sales.length === 0 ? (
          <p className="text-sm text-zinc-500">Henüz satış kaydı yok.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-xs uppercase tracking-wide text-zinc-500">
                  <th className="py-2 pr-3 font-medium">Tarih</th>
                  <th className="py-2 pr-3 font-medium">Enstrüman</th>
                  <th className="py-2 pr-3 font-medium">Müşteri</th>
                  <th className="py-2 pr-3 text-right font-medium">Fiyat</th>
                  <th className="py-2 pr-3 font-medium">Not</th>
                  <th className="py-2 text-right font-medium">Sil</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((row) => (
                  <tr key={row.id} className="border-b border-zinc-800/80">
                    <td className="py-2 pr-3 text-zinc-300">{formatTrDate(row.soldDate)}</td>
                    <td className="py-2 pr-3 font-medium text-zinc-100">{row.instrumentName}</td>
                    <td className="py-2 pr-3 text-zinc-200">{row.buyerName}</td>
                    <td className="py-2 pr-3 text-right tabular-nums text-emerald-300">
                      {formatTurkishMoney(Number(row.price))}
                    </td>
                    <td className="max-w-[14rem] py-2 pr-3 text-xs text-zinc-500">
                      {row.notes ?? "—"}
                    </td>
                    <td className="py-2 text-right">
                      <form action={deleteInstrumentSale}>
                        <input type="hidden" name="id" value={row.id} />
                        <button
                          type="submit"
                          className="rounded-lg bg-red-900/50 px-2 py-1 text-xs text-red-200 hover:bg-red-800/60"
                        >
                          Sil
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
