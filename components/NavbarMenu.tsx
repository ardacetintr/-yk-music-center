"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Props = {
  isLoggedIn: boolean;
  isAdmin: boolean;
};

export default function NavbarMenu({ isLoggedIn, isAdmin }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  if (pathname === "/liquid") {
    return null;
  }

  const closeMenu = () => setOpen(false);

  return (
    <div ref={rootRef} className="relative flex h-full items-center">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex h-10 w-10 items-center justify-center text-brand-600"
        aria-expanded={open}
        aria-label="Menüyü aç"
      >
        <svg viewBox="0 0 24 24" className="h-8 w-8 fill-none stroke-current" strokeWidth="2.5">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>

      {open && (
        <nav className="absolute left-0 top-full mt-5 w-72 rounded-xl border border-zinc-300 bg-white p-3 text-sm text-zinc-900 shadow-2xl">
          <div className="grid gap-2">
            <div className="group relative">
              <button type="button" className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left hover:bg-zinc-100">
                Akademik
                <span>›</span>
              </button>
              <div className="invisible absolute left-full top-0 z-10 ml-2 w-56 rounded-xl border border-zinc-300 bg-white p-2 opacity-0 shadow-2xl transition group-hover:visible group-hover:opacity-100">
                <div className="grid gap-1">
                  <Link href="/teachers" onClick={closeMenu} className="rounded-md px-2 py-2 hover:bg-zinc-100">Öğretmenler</Link>
                  <Link href="/blog" onClick={closeMenu} className="rounded-md px-2 py-2 hover:bg-zinc-100">Blog</Link>
                  <Link href="/announcements" onClick={closeMenu} className="rounded-md px-2 py-2 hover:bg-zinc-100">Duyurular</Link>
                </div>
              </div>
            </div>

            <div className="group relative">
              <button type="button" className="flex w-full items-center justify-between rounded-md px-2 py-2 text-left hover:bg-zinc-100">
                Başvuru Yap
                <span>›</span>
              </button>
              <div className="invisible absolute left-full top-0 z-10 ml-2 w-56 rounded-xl border border-zinc-300 bg-white p-2 opacity-0 shadow-2xl transition group-hover:visible group-hover:opacity-100">
                <div className="grid gap-1">
                  <Link href="/apply/teacher" onClick={closeMenu} className="rounded-md px-2 py-2 hover:bg-zinc-100">Öğretmen Kayıt</Link>
                  <Link href="/register/student" onClick={closeMenu} className="rounded-md px-2 py-2 hover:bg-zinc-100">Öğrenci Kayıt</Link>
                </div>
              </div>
            </div>

            <Link href="/online-lessons" onClick={closeMenu} className="flex w-full items-center justify-between rounded-md px-2 py-2 hover:bg-zinc-100">
              Canlı Ders
            </Link>
            {isLoggedIn && (
              <Link href="/dashboard" onClick={closeMenu} className="flex w-full items-center justify-between rounded-md px-2 py-2 hover:bg-zinc-100">
                Panel
              </Link>
            )}
            {isAdmin && (
              <>
                <Link href="/admin" onClick={closeMenu} className="flex w-full items-center justify-between rounded-md px-2 py-2 hover:bg-zinc-100">
                  Yönetim
                </Link>
                <Link
                  href="/admin/lesson-schedules"
                  onClick={closeMenu}
                  className="flex w-full items-center justify-between rounded-md px-2 py-2 hover:bg-zinc-100"
                >
                  Haftalık ders programı
                </Link>
                <Link
                  href="/admin/attendance"
                  onClick={closeMenu}
                  className="flex w-full items-center justify-between rounded-md px-2 py-2 hover:bg-zinc-100"
                >
                  Yoklama
                </Link>
                <Link
                  href="/admin/absences"
                  onClick={closeMenu}
                  className="flex w-full items-center justify-between rounded-md px-2 py-2 hover:bg-zinc-100"
                >
                  Devamsızlık
                </Link>
                <Link
                  href="/admin/teacher-payments"
                  onClick={closeMenu}
                  className="flex w-full items-center justify-between rounded-md px-2 py-2 hover:bg-zinc-100"
                >
                  Öğretmen ödemeleri
                </Link>
                <Link
                  href="/admin/instrument-sales"
                  onClick={closeMenu}
                  className="flex w-full items-center justify-between rounded-md px-2 py-2 hover:bg-zinc-100"
                >
                  Enstrüman satışı
                </Link>
              </>
            )}
          </div>
        </nav>
      )}
    </div>
  );
}
