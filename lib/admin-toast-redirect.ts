import type { Route } from "next";
import { redirect } from "next/navigation";

export function redirectWithAdminToast(path: string, toastKey: string): never {
  const sep = path.includes("?") ? "&" : "?";
  redirect(`${path}${sep}toast=${encodeURIComponent(toastKey)}` as Route);
}
