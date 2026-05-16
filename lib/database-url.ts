export function isPostgresDatabaseUrl(url: string | undefined): boolean {
  const u = url?.trim() ?? "";
  return u.startsWith("postgresql://") || u.startsWith("postgres://");
}

/** Vercel Postgres / Neon / elle girilen DATABASE_URL */
export function resolveDatabaseUrl(): string | null {
  const direct = process.env.DATABASE_URL?.trim();
  if (isPostgresDatabaseUrl(direct)) return direct!;

  const fromVercel =
    process.env.POSTGRES_PRISMA_URL?.trim() ||
    process.env.POSTGRES_URL?.trim() ||
    process.env.DATABASE_URL_UNPOOLED?.trim();

  if (isPostgresDatabaseUrl(fromVercel)) return fromVercel!;

  return null;
}

export function applyResolvedDatabaseUrl(): string | null {
  const url = resolveDatabaseUrl();
  if (url) process.env.DATABASE_URL = url;
  return url;
}
