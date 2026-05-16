/**
 * prisma/data/neon-backup-eski.json (veya local-db-export.json) → .env DATABASE_URL
 */
import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { PrismaClient } from "@prisma/client";
import { applyResolvedDatabaseUrl } from "../lib/database-url";
import {
  importLocalDbExport,
  readLocalDbExport,
  type LocalDbExport
} from "../prisma/import-local-export";

import "../prisma/load-env";

const NEON_BACKUP = join(process.cwd(), "prisma", "data", "neon-backup-eski.json");

async function main() {
  const url = applyResolvedDatabaseUrl();
  if (!url) {
    console.error("HATA: .env icinde postgresql DATABASE_URL yok.");
    process.exit(1);
  }

  let data: LocalDbExport | null = null;
  if (existsSync(NEON_BACKUP)) {
    data = JSON.parse(readFileSync(NEON_BACKUP, "utf8")) as LocalDbExport;
    console.log("Yedek: neon-backup-eski.json");
  } else {
    data = readLocalDbExport();
    console.log("Yedek: local-db-export.json");
  }

  if (!data?.users?.length) {
    console.error("Yedek dosyada veri yok.");
    process.exit(1);
  }

  console.log(
    `${data.students.length} ogrenci, ${data.teachers.length} ogretmen yuklenecek...`
  );
  console.log("Hedef:", url.replace(/:[^:@]+@/, ":****@"));

  execSync("npx prisma db push --skip-generate --accept-data-loss", {
    cwd: process.cwd(),
    env: { ...process.env, DATABASE_URL: url },
    stdio: "inherit"
  });

  const prisma = new PrismaClient();
  try {
    const result = await importLocalDbExport(prisma, data);
    if (!result) {
      console.error("Import basarisiz.");
      process.exit(1);
    }
    console.log(
      `Tamam: ${result.students} ogrenci, ${result.teachers} ogretmen, ${result.users} kullanici.`
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
