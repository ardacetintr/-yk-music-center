"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  message: string;
  showSyncButton: boolean;
};

type DbStatus = {
  env?: {
    resolved?: boolean;
    resolvedFromKey?: string | null;
    postgresKeys?: string[];
    blockingFileDatabaseUrl?: boolean;
    vercelEnv?: string;
  };
  studentCount?: number | null;
  hint?: string;
};

export default function AdminDbSyncBanner({ message, showSyncButton }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [diag, setDiag] = useState<DbStatus | null>(null);

  useEffect(() => {
    fetch("/api/admin/db-status", { credentials: "same-origin" })
      .then((r) => r.json())
      .then((d) => {
        if (d?.ok) setDiag(d);
      })
      .catch(() => {});
  }, []);

  async function syncDatabase() {
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch("/api/admin/sync-database", {
        method: "POST",
        credentials: "same-origin"
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus(typeof data.message === "string" ? data.message : "Yükleme başarısız.");
        return;
      }
      setStatus(typeof data.message === "string" ? data.message : "Tamam.");
      router.refresh();
    } catch {
      setStatus("Bağlantı hatası.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-amber-900/80 bg-amber-950/40 px-4 py-3 text-sm text-amber-100">
      <p>{message}</p>
      {diag?.hint ? <p className="mt-2 text-xs text-amber-200/80">{diag.hint}</p> : null}
      {diag?.env?.postgresKeys?.length ? (
        <p className="mt-1 text-xs text-amber-200/60">
          Bulunan anahtarlar: {diag.env.postgresKeys.join(", ")}
          {diag.env.resolvedFromKey ? ` · Kullanılan: ${diag.env.resolvedFromKey}` : ""}
        </p>
      ) : null}
      {showSyncButton ? (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={syncDatabase}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-500 disabled:opacity-50"
          >
            {loading ? "Yükleniyor…" : "Verileri yükle (96 öğrenci)"}
          </button>
          {status ? <p className="text-xs text-amber-200/90">{status}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
