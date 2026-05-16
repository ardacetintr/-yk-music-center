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
const hasTurso =
  dbUrl.startsWith("libsql:") &&
  Boolean(process.env.DATABASE_AUTH_TOKEN?.trim() || process.env.TURSO_AUTH_TOKEN?.trim());

if (!dbUrl || dbUrl.startsWith("file:")) {
  process.env.DATABASE_URL = "file:/tmp/yk-vercel-build.db";
} else {
  process.env.DATABASE_URL = dbUrl;
  if (!process.env.DATABASE_AUTH_TOKEN?.trim() && process.env.TURSO_AUTH_TOKEN?.trim()) {
    process.env.DATABASE_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN.trim();
  }
}

if (!process.env.JWT_SECRET?.trim()) {
  process.env.JWT_SECRET = "yk-music-center-vercel-default-jwt-secret-32chars";
}

execSync("npx prisma generate", { stdio: "inherit", env: process.env });

if (hasTurso) {
  console.log("Turso bulundu — veritabani tablolari ve seed calistiriliyor...");
  execSync("npx prisma db push --skip-generate", { stdio: "inherit", env: process.env });
  execSync("npm run prisma:seed", { stdio: "inherit", env: process.env });
} else {
  console.log(
    "Turso yok — build devam ediyor. Admin girisi yerlesik hesaplarla calisir; " +
      "ogrenci/ogretmen verisi icin sonra Turso ekleyebilirsiniz."
  );
}

execSync("npx next build", { stdio: "inherit", env: process.env });
