import { PrismaClient } from "@prisma/client";
import { applyResolvedDatabaseUrl } from "../lib/database-url";
import { hasLocalDbExport, importLocalDbExport } from "../prisma/import-local-export";

import "../prisma/load-env";

async function main() {
  const pgUrl = applyResolvedDatabaseUrl();
  if (!pgUrl) {
    console.log("Postgres URL yok — import atlandi.");
    return;
  }
  if (!hasLocalDbExport()) {
    console.log("prisma/data/local-db-export.json yok — import atlandi.");
    return;
  }

  const prisma = new PrismaClient();
  const result = await importLocalDbExport(prisma);
  await prisma.$disconnect();

  if (!result) {
    console.log("Export bos — import atlandi.");
    return;
  }

  console.log(
    `Import tamam: ${result.students} ogrenci, ${result.teachers} ogretmen, ${result.users} kullanici.`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
