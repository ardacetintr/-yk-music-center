import Link from "next/link";
import { getServerSession } from "@/lib/auth";
import { greetingDisplayName } from "@/lib/display-name";

export default async function HomeWelcome() {
  const session = await getServerSession();
  if (!session) return null;

  return (
    <div className="card border-brand-600/35 bg-gradient-to-br from-brand-950/50 to-zinc-950/80 px-5 py-4">
      <p className="text-lg font-semibold text-white">
        Hoş geldin,{" "}
        <span className="text-brand-600">{greetingDisplayName(session.name)}</span>
      </p>
      <p className="mt-1 text-sm text-zinc-400">
        Tempo bilgi sistemine hoş geldiniz.
      </p>
      {session.role === "ADMIN" && (
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/admin"
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-500"
          >
            Yönetim paneli
          </Link>
        </div>
      )}
    </div>
  );
}
