import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminAddStudentForm from "@/components/forms/AdminAddStudentForm";
import AdminSubNav from "@/components/admin/AdminSubNav";
import { greetingDisplayName } from "@/lib/display-name";
import { addStudent } from "@/app/admin/register/actions";

export default async function AdminRegisterStudentPage() {
  const session = await getServerSession();
  if (!session) redirect("/admin/login");
  if (session.role !== "ADMIN") redirect("/dashboard");

  let loadError: string | null = null;
  let teachers: Awaited<ReturnType<typeof prisma.teacher.findMany<{ include: { user: true } }>>> = [];

  try {
    teachers = await prisma.teacher.findMany({
      include: { user: true },
      orderBy: { user: { name: "asc" } },
    });
  } catch (e) {
    console.error(e);
    loadError =
      "Veritabanı hatası. `npx prisma db push` ve `npx prisma generate` çalıştırıp sunucuyu yeniden başlatın.";
  }

  const teacherSelectOptions = teachers.map((t) => ({ id: t.id, name: t.user.name }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs text-zinc-500">
            <Link href="/admin" className="text-brand-400 hover:text-brand-300">
              Yönetim
            </Link>
          </p>
          <h1 className="text-2xl font-semibold">Öğrenci Kaydı</h1>
          <p className="mt-1 text-zinc-400">Yeni öğrenci hesabı ve kayıt bilgilerini oluşturun.</p>
        </div>
        <p className="text-sm text-zinc-500">{greetingDisplayName(session.name)}</p>
      </div>

      <AdminSubNav current="register-student" />

      {loadError ? (
        <div className="rounded-xl border border-red-900/80 bg-red-950/40 px-4 py-3 text-sm text-red-200">
          {loadError}
        </div>
      ) : (
        <AdminAddStudentForm action={addStudent} teachers={teacherSelectOptions} />
      )}
    </div>
  );
}
