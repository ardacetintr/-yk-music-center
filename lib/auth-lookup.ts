import { prisma } from "./prisma";
import { phoneToEmail } from "./phone";
import { UserRole } from "./roles";

/** Girişte telefon → tek `User` (e-posta alanı `telefon@phone.local` biçiminde). */
export async function findUserByLoginPhone(normalizedDigits: string) {
  return prisma.user.findUnique({
    where: { email: phoneToEmail(normalizedDigits) }
  });
}

export async function findAdminByLoginPhone(normalizedDigits: string) {
  const user = await findUserByLoginPhone(normalizedDigits);
  if (!user || user.role !== UserRole.ADMIN) return null;
  return user;
}
