"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode
} from "react";
import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { adminToastMessage } from "@/lib/admin-toast";

export type AdminToastVariant = "success" | "error";

type ToastState = {
  message: string;
  variant: AdminToastVariant;
};

type AdminToastContextValue = {
  showToast: (keyOrMessage: string, variant?: AdminToastVariant) => void;
};

const AdminToastContext = createContext<AdminToastContextValue | null>(null);

export function useAdminToast() {
  const ctx = useContext(AdminToastContext);
  if (!ctx) {
    throw new Error("useAdminToast yalnızca AdminToastProvider içinde kullanılabilir.");
  }
  return ctx;
}

/** Provider dışında güvenli kullanım (isteğe bağlı toast). */
export function useAdminToastOptional() {
  return useContext(AdminToastContext);
}

const EVENT_NAME = "yk-admin-toast";

export function dispatchAdminToast(keyOrMessage: string, variant: AdminToastVariant = "success") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { keyOrMessage, variant } }));
}

export default function AdminToastProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = useCallback((keyOrMessage: string, variant: AdminToastVariant = "success") => {
    const mapped = adminToastMessage(keyOrMessage);
    setToast({
      message: mapped ?? keyOrMessage,
      variant
    });
  }, []);

  useEffect(() => {
    const onEvent = (e: Event) => {
      const detail = (e as CustomEvent<{ keyOrMessage: string; variant: AdminToastVariant }>).detail;
      if (!detail?.keyOrMessage) return;
      const mapped = adminToastMessage(detail.keyOrMessage);
      setToast({
        message: mapped ?? detail.keyOrMessage,
        variant: detail.variant ?? "success"
      });
    };
    window.addEventListener(EVENT_NAME, onEvent);
    return () => window.removeEventListener(EVENT_NAME, onEvent);
  }, []);

  useEffect(() => {
    const key = searchParams.get("toast");
    const message = adminToastMessage(key);
    if (!message) return;

    setToast({ message, variant: "success" });

    const params = new URLSearchParams(searchParams.toString());
    params.delete("toast");
    const next = params.toString();
    router.replace((next ? `${pathname}?${next}` : pathname) as Route, { scroll: false });
  }, [searchParams, pathname, router]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 4200);
    return () => window.clearTimeout(t);
  }, [toast]);

  return (
    <AdminToastContext.Provider value={{ showToast }}>
      {children}
      {toast ? (
        <div
          role="status"
          aria-live="polite"
          className={`fixed bottom-6 left-1/2 z-[200] max-w-[min(92vw,26rem)] -translate-x-1/2 rounded-xl border px-4 py-3 text-center text-sm shadow-2xl backdrop-blur-sm animate-[adminToastIn_0.35s_ease-out_forwards] ${
            toast.variant === "error"
              ? "border-red-500/50 bg-red-950/95 text-red-100"
              : "border-brand-500/40 bg-zinc-950/95 text-zinc-100"
          }`}
        >
          {toast.message}
        </div>
      ) : null}
    </AdminToastContext.Provider>
  );
}
