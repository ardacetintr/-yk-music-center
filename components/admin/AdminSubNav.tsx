"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Tab =
  | "overview"
  | "schedule"
  | "absences"
  | "accounting"
  | "register-student"
  | "register-teacher";

const tabClass = (active: boolean) =>
  [
    "rounded-lg px-3 py-1.5 text-sm font-medium transition",
    active
      ? "bg-brand-900/50 text-brand-100 ring-1 ring-brand-700/40"
      : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
  ].join(" ");

const kayitButtonClass = (open: boolean) =>
  [
    "rounded-lg border-2 border-white px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition",
    "bg-red-600 hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white",
    open ? "bg-red-500 ring-2 ring-white/90 ring-offset-2 ring-offset-zinc-950" : ""
  ]
    .filter(Boolean)
    .join(" ");

export default function AdminSubNav({ current }: { current: Tab }) {
  const [kayitOpen, setKayitOpen] = useState(false);
  const kayitRef = useRef<HTMLDivElement>(null);
  const kayitRouteActive =
    current === "register-student" || current === "register-teacher";

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setKayitOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (!kayitRef.current?.contains(e.target as Node)) {
        setKayitOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  return (
    <nav className="flex flex-wrap items-center gap-2 border-b border-zinc-800 pb-4">
      <div className="flex flex-wrap gap-2">
        <Link href="/admin" className={tabClass(current === "overview")}>
          Panel
        </Link>
        <Link href="/admin/lesson-schedules" className={tabClass(current === "schedule")}>
          Ders programı
        </Link>
        <Link href="/admin/absences" className={tabClass(current === "absences")}>
          Devamsızlık
        </Link>
        <Link href="/admin/accounting" className={tabClass(current === "accounting")}>
          Muhasebe
        </Link>

        <div className="relative" ref={kayitRef}>
          <button
            type="button"
            onClick={() => setKayitOpen((o) => !o)}
            className={kayitButtonClass(kayitOpen || kayitRouteActive)}
            aria-expanded={kayitOpen || kayitRouteActive}
            aria-haspopup="menu"
          >
            Kayıt
          </button>
          {kayitOpen ? (
            <div
              className="absolute left-0 top-[calc(100%+0.35rem)] z-40 min-w-[12.5rem] rounded-lg border border-zinc-700 bg-zinc-950 py-1 shadow-xl ring-1 ring-black/40 sm:left-auto sm:right-0"
              role="menu"
            >
              <Link
                href="/admin/register-student"
                role="menuitem"
                className="block px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800 hover:text-zinc-50"
                onClick={() => setKayitOpen(false)}
              >
                Öğrenci Kaydı
              </Link>
              <Link
                href="/admin/register-teacher"
                role="menuitem"
                className="block px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800 hover:text-zinc-50"
                onClick={() => setKayitOpen(false)}
              >
                Öğretmen Kaydı
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </nav>
  );
}
