export function isPostgresDatabaseUrl(url: string | undefined): boolean {
  const u = url?.trim() ?? "";
  return u.startsWith("postgresql://") || u.startsWith("postgres://");
}

function isLocalFileDatabaseUrl(url: string | undefined): boolean {
  const u = url?.trim() ?? "";
  return u.startsWith("file:") || u.startsWith("sqlite:");
}

function buildUrlFromPgEnv(): string | null {
  const host = process.env.PGHOST?.trim();
  const user = process.env.PGUSER?.trim();
  const password = process.env.PGPASSWORD?.trim();
  const database = process.env.PGDATABASE?.trim();
  if (!host || !user || !password || !database) return null;
  const port = process.env.PGPORT?.trim() || "5432";
  const encUser = encodeURIComponent(user);
  const encPass = encodeURIComponent(password);
  return `postgresql://${encUser}:${encPass}@${host}:${port}/${database}?sslmode=require`;
}

/** Vercel Neon / Postgres / elle girilen adres */
export function resolveDatabaseUrl(): string | null {
  const onVercel = process.env.VERCEL === "1" || process.env.VERCEL === "true";

  const candidates = [
    process.env.POSTGRES_PRISMA_URL,
    process.env.POSTGRES_URL,
    process.env.DATABASE_URL_UNPOOLED,
    process.env.NEON_DATABASE_URL,
    process.env.DATABASE_URL
  ];

  for (const raw of candidates) {
    const u = raw?.trim();
    if (!u) continue;
    if (onVercel && isLocalFileDatabaseUrl(u)) continue;
    if (isPostgresDatabaseUrl(u)) return u;
  }

  const fromPg = buildUrlFromPgEnv();
  if (fromPg) return fromPg;

  if (!onVercel) {
    const direct = process.env.DATABASE_URL?.trim();
    if (direct && !isLocalFileDatabaseUrl(direct) && isPostgresDatabaseUrl(direct)) return direct;
  }

  return null;
}

export function applyResolvedDatabaseUrl(): string | null {
  const url = resolveDatabaseUrl();
  if (url) {
    process.env.DATABASE_URL = url;
    return url;
  }

  const onVercel = process.env.VERCEL === "1" || process.env.VERCEL === "true";
  if (onVercel && isLocalFileDatabaseUrl(process.env.DATABASE_URL)) {
    delete process.env.DATABASE_URL;
  }

  return null;
}
