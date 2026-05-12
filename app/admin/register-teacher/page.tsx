import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import AdminAddTeacherForm from "@/components/forms/AdminAddTeacherForm";
import AdminSubNav from "@/components/admin/AdminSubNav";
import { greetingDisplayName } from "@/lib/display-name";
import { addTeacher } from "@/app/admin/register/actions";

export default async function AdminRegisterTeacherPage() {
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
          <h1 className="text-2xl font-semibold">Öğretmen Kaydı</h1>
          <p className="mt-1 text-zinc-400">Yeni öğretmen hesabı ve profil bilgilerini oluşturun.</p>
        </div>
        <p className="text-sm text-zinc-500">{greetingDisplayName(session.name)}</p>
      </div>

      <AdminSubNav current="register-teacher" />

      <AdminAddTeacherForm action={addTeacher} />
    </div>
  );
}
