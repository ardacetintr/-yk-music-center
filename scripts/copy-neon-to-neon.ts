/**
 * Eski Neon (patient-silence) → yeni Neon (green-star)
 * Yedek: prisma/data/neon-backup-eski.json
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { PrismaClient } from "@prisma/client";
import {
  exportAllFromPrisma,
  importLocalDbExport,
  type LocalDbExport
} from "../prisma/import-local-export";

const BACKUP_FILE = join(process.cwd(), "prisma", "data", "neon-backup-eski.json");
const OLD_ENV_FILE = join(process.cwd(), ".env.backup-neon-eski");

function readDatabaseUrlFromFile(path: string): string | null {
  if (!existsSync(path)) return null;
  const line = readFileSync(path, "utf8")
    .split(/\r?\n/)
    .find((l) => l.trim().startsWith("DATABASE_URL="));
  if (!line) return null;
  let val = line.slice("DATABASE_URL=".length).trim();
  if (
    (val.startsWith('"') && val.endsWith('"')) ||
    (val.startsWith("'") && val.endsWith("'"))
  ) {
    val = val.slice(1, -1);
  }
  return val.startsWith("postgresql://") || val.startsWith("postgres://") ? val : null;
}

function readNewUrl(): string | null {
  const fromEnv = join(process.cwd(), ".env");
  return readDatabaseUrlFromFile(fromEnv);
}

async function pushSchema(url: string) {
  execSync("npx prisma db push --skip-generate --accept-data-loss", {
    cwd: process.cwd(),
    env: { ...process.env, DATABASE_URL: url },
    stdio: "inherit"
  });
}

async function main() {
  const oldUrl = readDatabaseUrlFromFile(OLD_ENV_FILE);
  const newUrl = readNewUrl();

  if (!oldUrl) {
    console.error("HATA: .env.backup-neon-eski icinde eski DATABASE_URL yok.");
    process.exit(1);
  }
  if (!newUrl) {
    console.error("HATA: .env icinde yeni postgresql DATABASE_URL yok.");
    process.exit(1);
  }

  console.log("1/4 Eski Neon'dan veri okunuyor (patient-silence)...");
  const oldDb = new PrismaClient({ datasources: { db: { url: oldUrl } } });
  let snapshot: LocalDbExport;
  try {
    snapshot = await exportAllFromPrisma(oldDb);
  } catch (e) {
    console.error("Eski Neon okunamadi:", e);
    process.exit(1);
  } finally {
    await oldDb.$disconnect();
  }

  mkdirSync(join(process.cwd(), "prisma", "data"), { recursive: true });
  writeFileSync(BACKUP_FILE, JSON.stringify(snapshot), "utf8");
  console.log(
    `   Yedek dosya: ${BACKUP_FILE}\n` +
      `   ${snapshot.students.length} ogrenci, ${snapshot.teachers.length} ogretmen, ${snapshot.users.length} kullanici`
  );

  if (!snapshot.users.length) {
    console.log("Eski Neon bos — yerel dev.db icin VERITABANI-AKTAR.cmd kullanin.");
    return;
  }

  console.log("2/4 Yeni Neon'da tablolar (green-star)...");
  await pushSchema(newUrl);

  console.log("3/4 Yeni Neon'a aktariliyor...");
  const newDb = new PrismaClient({ datasources: { db: { url: newUrl } } });
  try {
    const result = await importLocalDbExport(newDb, snapshot);
    if (!result) {
      console.error("Import basarisiz.");
      process.exit(1);
    }
    console.log(
      `4/4 Tamam: ${result.students} ogrenci, ${result.teachers} ogretmen yeni Neon'da.\n` +
        `Vercel'de de ayni green-star veritabani bagli olmali → Redeploy.`
    );
  } finally {
    await newDb.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
