"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

type AccordionContextValue = {
  openKey: string | null;
  toggleKey: (key: string) => void;
  closePanel: () => void;
  isOpen: (key: string) => boolean;
};

const AdminOverviewAccordionContext = createContext<AccordionContextValue | null>(null);

export function useAdminOverviewAccordion() {
  const ctx = useContext(AdminOverviewAccordionContext);
  if (!ctx) {
    throw new Error("useAdminOverviewAccordion yalnızca AdminOverviewAccordion içinde kullanılabilir.");
  }
  return ctx;
}

export function useAdminOverviewAccordionOptional() {
  return useContext(AdminOverviewAccordionContext);
}

export default function AdminOverviewAccordion({ children }: { children: ReactNode }) {
  const [openKey, setOpenKey] = useState<string | null>(null);

  const toggleKey = useCallback((key: string) => {
    setOpenKey((prev) => (prev === key ? null : key));
  }, []);

  const closePanel = useCallback(() => {
    setOpenKey(null);
  }, []);

  const isOpen = useCallback((key: string) => openKey === key, [openKey]);

  return (
    <AdminOverviewAccordionContext.Provider value={{ openKey, toggleKey, closePanel, isOpen }}>
      {children}
    </AdminOverviewAccordionContext.Provider>
  );
}
