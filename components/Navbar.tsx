import Link from "next/link";
import Image from "next/image";
import { getServerSession } from "@/lib/auth";
import NavbarMenu from "@/components/NavbarMenu";

export default async function Navbar() {
  const session = await getServerSession();

  return (
    <header className="liquid-glass-nav sticky top-0 z-20 border-b">
      <div className="container relative flex items-center justify-between py-4">
        <div className="flex items-center">
          <NavbarMenu isLoggedIn={Boolean(session)} isAdmin={session?.role === "ADMIN"} />
        </div>
        <Link href="/liquid" className="absolute left-1/2 -translate-x-1/2 -translate-y-0.5">
          <Image
            src="/logo-oyku.png"
            alt="Öykü Music Center"
            width={220}
            height={64}
            className="h-auto w-[135px] md:w-[165px]"
            priority
          />
        </Link>
        <div>
          {!session ? (
            <Link href="/admin/login" className="rounded-lg bg-brand-600 px-3 py-1.5 text-white hover:bg-brand-500">
              Giriş
            </Link>
          ) : (
            <form action="/api/auth/logout" method="post">
              <button className="rounded-lg border border-white/45 bg-white/35 px-3 py-1.5 text-zinc-900 backdrop-blur hover:bg-white/50" type="submit">
                Çıkış
              </button>
            </form>
          )}
        </div>
      </div>
    </header>
  );
}
