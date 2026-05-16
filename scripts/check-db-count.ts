import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { PrismaClient } from "@prisma/client";

const envPath = resolve(process.cwd(), ".env");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const eq = t.indexOf("=");
    if (eq <= 0) continue;
    const key = t.slice(0, eq).trim();
    let val = t.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    process.env[key] = val;
  }
}

async function main() {
  const url = process.env.DATABASE_URL ?? "";
  const prisma = new PrismaClient();
  const [students, teachers, users] = await Promise.all([
    prisma.student.count(),
    prisma.teacher.count(),
    prisma.user.count()
  ]);
  await prisma.$disconnect();
  console.log("DB:", url.includes("green-star") ? "green-star (yeni)" : "diger");
  console.log("ogrenci:", students);
  console.log("ogretmen:", teachers);
  console.log("kullanici:", users);
}

main().catch((e) => {
  console.error("HATA:", e instanceof Error ? e.message : e);
  process.exit(1);
});
