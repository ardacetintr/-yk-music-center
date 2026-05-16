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

/** Neon özel önek kullanırsa (ör. NEON_DATABASE_URL) veya elle eklenen diğer anahtarlar */
function findPostgresUrlInAllEnv(onVercel: boolean): string | null {
  const preferredKeyHints = [
    "YK_DATABASE_URL",
    "MUSIC_CENTER_DATABASE_URL",
    "POSTGRES_PRISMA_URL",
    "POSTGRES_URL",
    "DATABASE_URL_UNPOOLED",
    "NEON_DATABASE_URL",
    "DATABASE_URL"
  ];

  const entries = Object.entries(process.env).filter(
    ([, v]) => v && isPostgresDatabaseUrl(v) && !(onVercel && isLocalFileDatabaseUrl(v))
  ) as [string, string][];

  if (!entries.length) return null;

  for (const hint of preferredKeyHints) {
    const hit = entries.find(([k]) => k === hint || k.endsWith(`_${hint}`));
    if (hit) return hit[1].trim();
  }

  const scored = entries
    .map(([key, value]) => {
      let score = 0;
      const upper = key.toUpperCase();
      if (upper.includes("PRISMA")) score += 4;
      if (upper.includes("POSTGRES") || upper.includes("NEON")) score += 3;
      if (upper.includes("DATABASE")) score += 2;
      if (upper.includes("POOLED") || value.includes("-pooler")) score += 1;
      if (upper.includes("UNPOOLED")) score -= 1;
      return { key, value: value.trim(), score };
    })
    .sort((a, b) => b.score - a.score);

  return scored[0]?.value ?? null;
}

/** Vercel Neon / Postgres / elle girilen adres */
export function resolveDatabaseUrl(): string | null {
  const onVercel = process.env.VERCEL === "1" || process.env.VERCEL === "true";

  // Vercel'de DATABASE_URL kilitli/file iken elle eklenen yedek (Production'a yazilir)
  const candidates = [
    process.env.YK_DATABASE_URL,
    process.env.MUSIC_CENTER_DATABASE_URL,
    process.env.POSTGRES_PRISMA_URL,
    process.env.POSTGRES_URL,
    process.env.POSTGRES_URL_NON_POOLING,
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

  const fromScan = findPostgresUrlInAllEnv(onVercel);
  if (fromScan) return fromScan;

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

/** Admin tanı — şifre göstermez */
export function getDatabaseEnvDiagnostics(): {
  onVercel: boolean;
  vercelEnv: string | undefined;
  resolved: boolean;
  resolvedFromKey: string | null;
  postgresKeys: string[];
  blockingFileDatabaseUrl: boolean;
} {
  const onVercel = process.env.VERCEL === "1" || process.env.VERCEL === "true";
  const postgresKeys: string[] = [];
  let blockingFileDatabaseUrl = false;

  for (const [key, value] of Object.entries(process.env)) {
    if (!value?.trim()) continue;
    if (key === "DATABASE_URL" && isLocalFileDatabaseUrl(value)) {
      blockingFileDatabaseUrl = true;
    }
    if (isPostgresDatabaseUrl(value)) postgresKeys.push(key);
  }

  const resolvedUrl = resolveDatabaseUrl();
  let resolvedFromKey: string | null = null;
  if (resolvedUrl) {
    for (const [key, value] of Object.entries(process.env)) {
      if (value?.trim() === resolvedUrl) {
        resolvedFromKey = key;
        break;
      }
    }
  }

  return {
    onVercel,
    vercelEnv: process.env.VERCEL_ENV,
    resolved: Boolean(resolvedUrl),
    resolvedFromKey,
    postgresKeys: postgresKeys.sort(),
    blockingFileDatabaseUrl
  };
}
