import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminSubNav from "@/components/admin/AdminSubNav";
import { greetingDisplayName } from "@/lib/display-name";
import { addStudentAbsence, deleteStudentAbsence } from "./actions";
import { getAdminLoadErrorMessage } from "@/lib/admin-load-error";

export default async function AdminAbsencesPage() {
  const session = await getServerSession();
  if (!session) redirect("/admin/login");
  if (session.role !== "ADMIN") redirect("/dashboard");

  const todayISO = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Istanbul" });

  let loadError: string | null = null;
  let students: Awaited<ReturnType<typeof prisma.student.findMany<{ include: { user: true } }>>> = [];
  let absences: Awaited<
    ReturnType<
      typeof prisma.studentAbsence.findMany<{ include: { student: { include: { user: true } } } }>
    >
  > = [];

  try {
    const [s, a] = await Promise.all([
      prisma.student.findMany({ include: { user: true }, orderBy: { user: { name: "asc" } } }),
      prisma.studentAbsence.findMany({
        include: { student: { include: { user: true } } },
        orderBy: [{ absenceDate: "desc" }, { createdAt: "desc" }],
        take: 200
      })
    ]);
    students = s;
    absences = a;
  } catch (e) {
    console.error(e);
    loadError = getAdminLoadErrorMessage();
  }

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
          <h1 className="text-2xl font-semibold">Devamsızlık</h1>
          <p className="mt-1 text-zinc-400">
            Öğrencilerin devamsızlık kayıtlarını tutun. Yoklama ile senkron çalışır; buradan eklenen
            kayıtlar ilgili günün yoklamasında gelmedi olarak görünür.
          </p>
        </div>
        <p className="text-sm text-zinc-500">{greetingDisplayName(session.name)}</p>
      </div>

      <AdminSubNav current="absences" />

      {loadError ? (
        <div className="rounded-xl border border-red-900/80 bg-red-950/40 px-4 py-3 text-sm text-red-200">
          {loadError}
        </div>
      ) : null}

      <section className="card space-y-4">
        <h2 className="text-lg font-semibold">Devamsızlık ekle</h2>
        <form action={addStudentAbsence} className="flex flex-col gap-3 md:flex-row md:flex-wrap md:items-end">
          <label className="flex min-w-[12rem] flex-1 flex-col gap-1 text-xs text-zinc-500">
            Öğrenci
            <select
              name="studentId"
              required
              className="rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100"
              defaultValue=""
            >
              <option value="" disabled>
                Seçin
              </option>
              {students.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.user.name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs text-zinc-500">
            Tarih
            <input
              type="date"
              name="absenceDate"
              required
              defaultValue={todayISO}
              className="rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100"
            />
          </label>
          <label className="flex min-w-[14rem] flex-[2] flex-col gap-1 text-xs text-zinc-500">
            Not (isteğe bağlı)
            <input
              name="notes"
              placeholder="Örn. Hastalık"
              className="rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-zinc-100"
            />
          </label>
          <button type="submit" className="rounded-lg bg-brand-600 px-6 py-2 font-medium hover:bg-brand-500">
            Kaydet
          </button>
        </form>
      </section>

      <section className="card">
        <h2 className="mb-3 text-lg font-semibold">Kayıtlar</h2>
        {absences.length === 0 ? (
          <p className="text-sm text-zinc-500">Henüz devamsızlık kaydı yok.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[28rem] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-xs uppercase tracking-wide text-zinc-500">
                  <th className="py-2 pr-3 font-medium">Öğrenci</th>
                  <th className="py-2 pr-3 font-medium">Tarih</th>
                  <th className="py-2 pr-3 font-medium">Not</th>
                  <th className="py-2 text-right font-medium">Sil</th>
                </tr>
              </thead>
              <tbody>
                {absences.map((row) => (
                  <tr key={row.id} className="border-b border-zinc-800/80">
                    <td className="py-2 pr-3 text-zinc-200">{row.student.user.name}</td>
                    <td className="py-2 pr-3 text-zinc-300">{formatTrDate(row.absenceDate)}</td>
                    <td className="max-w-[20rem] py-2 pr-3 text-xs text-zinc-500">{row.notes ?? "—"}</td>
                    <td className="py-2 text-right">
                      <form action={deleteStudentAbsence}>
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
