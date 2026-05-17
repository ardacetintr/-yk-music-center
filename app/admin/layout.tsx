import { Suspense } from "react";
import AdminToastProvider from "@/components/admin/AdminToastProvider";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <AdminToastProvider>{children}</AdminToastProvider>
    </Suspense>
  );
}
