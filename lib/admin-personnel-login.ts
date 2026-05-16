import {
  foldTurkishCharsForPassword,
  normalizeLoginPasswordInput
} from "@/lib/password-login-normalize";
import { normalizePhone, phoneToEmail } from "@/lib/phone";
import { UserRole } from "@/lib/roles";

/** seed.ts ile aynı personel — veritabani yokken admin girisi. */
const PERSONNEL = [
  { id: "admin-personnel-savas", name: "Savaş Aydoğdu", phoneInput: "05064363881", password: "savasay1305" },
  { id: "admin-personnel-burcu", name: "Burcu Aydoğdu", phoneInput: "05535932301", password: "burcuay1407" }
] as const;

function passwordMatches(input: string, expected: string): boolean {
  const a = foldTurkishCharsForPassword(normalizeLoginPasswordInput(input));
  const b = foldTurkishCharsForPassword(normalizeLoginPasswordInput(expected));
  return a === b;
}

export type PersonnelLoginUser = {
  id: string;
  email: string;
  name: string;
  role: typeof UserRole.ADMIN;
  passwordHash: string;
};

/** Veritabani olmadan personel admin girisi (yedek). */
export function tryPersonnelAdminLogin(
  phone: string,
  password: string
): PersonnelLoginUser | null {
  const normalized = normalizePhone(phone);
  const person = PERSONNEL.find((p) => normalizePhone(p.phoneInput) === normalized);
  if (!person) return null;
  if (!password || password.length < 6) return null;
  if (!passwordMatches(password, person.password)) return null;

  return {
    id: person.id,
    email: phoneToEmail(normalized),
    name: person.name,
    role: UserRole.ADMIN,
    passwordHash: ""
  };
}
