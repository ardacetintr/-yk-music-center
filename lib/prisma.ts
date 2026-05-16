import "../prisma/load-env";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL?.trim() ?? "";

  if (url.startsWith("libsql:")) {
    const libsql = createClient({
      url,
      authToken: process.env.DATABASE_AUTH_TOKEN
    });
    return new PrismaClient({
      adapter: new PrismaLibSQL(libsql),
      log: ["error"]
    });
  }

  return new PrismaClient({ log: ["error"] });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
