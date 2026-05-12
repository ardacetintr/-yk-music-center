import { randomInt } from "node:crypto";
import { suggestPasswordFromFullName } from "@/lib/suggest-password-from-name";

/** Öğrenci girişi için yeni düz metin şifre (hash’lenmiş hali DB’de saklanır). */
export function generateNewStudentPortalPassword(fullName: string): string {
  const base = suggestPasswordFromFullName(fullName);
  const n = randomInt(1000, 9999);
  if (base && base.length >= 4) {
    return `${base}${n}`.slice(0, 32);
  }
  return `ykmc${randomInt(100000, 999999)}`;
}
