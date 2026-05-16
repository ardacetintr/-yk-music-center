import { execSync } from "node:child_process";

function pickPostgresUrl() {
  const skipFile = (u) =>
    u && !u.startsWith("file:") && !u.startsWith("sqlite:");
  const candidates = [
    process.env.YK_DATABASE_URL,
    process.env.MUSIC_CENTER_DATABASE_URL,
    process.env.POSTGRES_PRISMA_URL,
    process.env.POSTGRES_URL,
    process.env.DATABASE_URL_UNPOOLED,
    process.env.NEON_DATABASE_URL,
    process.env.DATABASE_URL
  ];
  for (const raw of candidates) {
    const u = raw?.trim();
    if (!skipFile(u)) continue;
    if (u.startsWith("postgresql://") || u.startsWith("postgres://")) return u;
  }
  const host = process.env.PGHOST?.trim();
  const user = process.env.PGUSER?.trim();
  const password = process.env.PGPASSWORD?.trim();
  const database = process.env.PGDATABASE?.trim();
  if (host && user && password && database) {
    const port = process.env.PGPORT?.trim() || "5432";
    return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${database}?sslmode=require`;
  }
  return null;
}

const pgUrl = pickPostgresUrl();

if (!process.env.JWT_SECRET?.trim()) {
  process.env.JWT_SECRET = "yk-music-center-vercel-default-jwt-secret-32chars";
}

const genEnv = { ...process.env };
if (pgUrl) {
  genEnv.DATABASE_URL = pgUrl;
} else {
  genEnv.DATABASE_URL =
    "postgresql://placeholder:placeholder@localhost:5432/placeholder?schema=public";
}

console.log("1/2 prisma generate...");
execSync("npx prisma generate", { stdio: "inherit", env: genEnv });

const nextEnv = { ...process.env };
if (pgUrl) {
  nextEnv.DATABASE_URL = pgUrl;
  console.log("Postgres bulundu — tablolar ve seed...");
  try {
    execSync("npx prisma db push --skip-generate --accept-data-loss", {
      stdio: "inherit",
      env: nextEnv
    });
    execSync("npm run prisma:seed", { stdio: "inherit", env: nextEnv });
    try {
      execSync("npm run db:import-export", { stdio: "inherit", env: nextEnv });
    } catch (e) {
      console.warn("Yerel ogrenci import uyarisi:", e.message ?? e);
    }
  } catch (e) {
    console.warn("DB push/seed uyarisi:", e.message ?? e);
  }
} else {
  delete nextEnv.DATABASE_URL;
  console.log("Postgres yok — Vercel Integrations → Neon → projeye baglayin, Redeploy.");
}

console.log("2/2 next build...");
execSync("npx next build", { stdio: "inherit", env: nextEnv });

console.log("Build tamam.");
