import "../prisma/load-env";
import { bootstrapLocalDatabaseIfNeeded } from "@/lib/local-database";
import { PrismaClient } from "@prisma/client";

bootstrapLocalDatabaseIfNeeded();

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ log: ["error"] });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
