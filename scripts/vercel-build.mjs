import { execSync } from "node:child_process";

function pickDatabaseUrl() {
  return (
    process.env.DATABASE_URL?.trim() ||
    process.env.TURSO_DATABASE_URL?.trim() ||
    process.env.TURSO_LIBSQL_URL?.trim() ||
    process.env.POSTGRES_PRISMA_URL?.trim() ||
    process.env.POSTGRES_URL?.trim() ||
    ""
  );
}

const dbUrl = pickDatabaseUrl();
if (dbUrl) process.env.DATABASE_URL = dbUrl;

function fail(msg) {
  console.error(`\n${msg}\n`);
  process.exit(1);
}

if (!dbUrl) {
  fail(
    "Canlı veritabanı bağlı değil.\n" +
      "Vercel → projeniz → Storage (Postgres) veya Integrations (Turso) → bağlayın → Redeploy.\n" +
      "CANLI-SITE.cmd"
  );
}

if (dbUrl.startsWith("file:")) {
  fail("Yerel dosya veritabanı canlı sitede çalışmaz. Vercel Storage veya Turso kullanın.");
}

if (!dbUrl.startsWith("libsql:")) {
  fail(
    "Canlı site için Vercel'de Turso entegrasyonu gerekli.\n" +
      "Integrations → Turso → Add → Redeploy (CANLI-SITE.cmd)"
  );
}

if (dbUrl.startsWith("libsql:") && !process.env.DATABASE_AUTH_TOKEN?.trim()) {
  const token = process.env.TURSO_AUTH_TOKEN?.trim();
  if (token) process.env.DATABASE_AUTH_TOKEN = token;
  else fail("Turso token eksik. Vercel'de Turso entegrasyonunu bağlayın.");
}

if (process.env.VERCEL_ENV === "production" && !process.env.JWT_SECRET?.trim()) {
  fail("JWT_SECRET eksik. Vercel → Environment Variables → en az 32 karakter.");
}

execSync("npx prisma generate", { stdio: "inherit", env: process.env });
execSync("npx prisma db push --skip-generate", { stdio: "inherit", env: process.env });
execSync("npm run prisma:seed", { stdio: "inherit", env: process.env });
execSync("npx next build", { stdio: "inherit", env: process.env });
