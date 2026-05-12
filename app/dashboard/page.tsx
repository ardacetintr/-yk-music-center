import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import { greetingDisplayName } from "@/lib/display-name";
import AttendanceActions from "@/components/forms/AttendanceActions";

export default async function DashboardPage() {
  const session = await getServerSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="space-y-6">
      <section className="card">
        <h1 className="text-2xl font-semibold">
          Hoş geldin, {greetingDisplayName(session.name)}
        </h1>
        <p className="text-zinc-300">
          Rol:{" "}
          {session.role === "STUDENT"
            ? "Öğrenci"
            : session.role === "TEACHER"
              ? "Öğretmen"
              : session.role === "PARENT"
                ? "Veli"
                : session.role === "ADMIN"
                  ? "Yönetici"
                  : session.role}
        </p>
      </section>
      <AttendanceActions />
    </div>
  );
}
