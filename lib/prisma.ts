import "../prisma/load-env";
import { bootstrapLocalDatabaseIfNeeded } from "@/lib/local-database";
import { PrismaClient } from "@prisma/client";

bootstrapLocalDatabaseIfNeeded();

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createPrismaClient() {
  return new PrismaClient({ log: ["error"] });
}

/** Şema güncellenince eski singleton'da yeni modeller olmayabilir; yeniden oluştur. */
function getPrismaClient(): PrismaClient {
  const cached = globalForPrisma.prisma;
  if (cached && "studentMonthlyPayment" in cached) {
    return cached;
  }
  const client = createPrismaClient();
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }
  return client;
}

export const prisma = getPrismaClient();
