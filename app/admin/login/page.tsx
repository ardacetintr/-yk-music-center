import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth";
import AdminLoginForm from "@/components/forms/AdminLoginForm";

export default async function AdminLoginPage() {
  const session = await getServerSession();
  if (session?.role === "ADMIN") {
    redirect("/admin");
  }

  return (
    <div className="flex min-h-[calc(100vh-220px)] items-center justify-center">
      <AdminLoginForm />
    </div>
  );
}
