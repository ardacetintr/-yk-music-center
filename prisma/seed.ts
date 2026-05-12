import "./load-env";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/auth";
import {
  foldTurkishCharsForPassword,
  normalizeLoginPasswordInput
} from "../lib/password-login-normalize";
import { UserRole } from "../lib/roles";
import { normalizePhone, phoneToEmail } from "../lib/phone";
import { randomUUID } from "node:crypto";

const prisma = new PrismaClient();

/** Personel (/admin/login). Şifreleri üretimde güvenli kasaya taşıyın. */
const PERSONNEL = [
  {
    name: "Savaş Aydoğdu",
    phoneInput: "05064363881",
    password: "savasay1305"
  },
  {
    name: "Burcu Aydoğdu",
    phoneInput: "05535932301",
    password: "burcuay1407"
  }
] as const;

const DEMO_STUDENT_USER_EMAIL = "seed-demo-student@internal.local";

async function main() {
  const placeholderStudentPw = await hashPassword(`__disabled__${randomUUID()}`);
  const placeholderTeacherPw = await hashPassword(`__disabled__${randomUUID()}`);

  await prisma.user.deleteMany({
    where: { email: phoneToEmail("5550000000") }
  });

  for (const legacyPhone of ["5551001001", "5551001002"] as const) {
    await prisma.user.deleteMany({
      where: { email: phoneToEmail(legacyPhone) }
    });
  }

  for (const person of PERSONNEL) {
    const phone = normalizePhone(person.phoneInput);
    const passwordCanonical = foldTurkishCharsForPassword(normalizeLoginPasswordInput(person.password));
    const passwordHash = await hashPassword(passwordCanonical);
    await prisma.user.upsert({
      where: { email: phoneToEmail(phone) },
      update: {
        name: person.name,
        passwordHash,
        role: UserRole.ADMIN
      },
      create: {
        email: phoneToEmail(phone),
        name: person.name,
        role: UserRole.ADMIN,
        passwordHash
      }
    });
  }

  const teacherPhone = "5551112233";
  const parentPhone = "5558880000";

  const teacherUser = await prisma.user.upsert({
    where: { email: phoneToEmail(teacherPhone) },
    update: {},
    create: {
      email: phoneToEmail(teacherPhone),
      name: "Demo Teacher",
      role: UserRole.TEACHER,
      passwordHash: placeholderTeacherPw
    }
  });

  const studentUser = await prisma.user.upsert({
    where: { email: DEMO_STUDENT_USER_EMAIL },
    update: {
      name: "Demo Student",
      passwordHash: placeholderStudentPw,
      role: UserRole.STUDENT
    },
    create: {
      email: DEMO_STUDENT_USER_EMAIL,
      name: "Demo Student",
      role: UserRole.STUDENT,
      passwordHash: placeholderStudentPw
    }
  });

  await prisma.teacher.upsert({
    where: { userId: teacherUser.id },
    update: {},
    create: {
      userId: teacherUser.id,
      phone: teacherPhone,
      instruments: JSON.stringify(["Piyano"]),
      tcKimlikNo: null,
      fatherName: null,
      address: null,
      birthDate: null,
      birthPlace: null,
      employmentStartDate: null,
      insuranceStartDate: null,
      approved: true
    }
  });

  await prisma.student.upsert({
    where: { userId: studentUser.id },
    update: {
      instrument: "Guitar",
      parentName: "Demo Veli",
      parentPhone
    },
    create: {
      userId: studentUser.id,
      instrument: "Guitar",
      parentName: "Demo Veli",
      parentPhone
    }
  });

  console.log("Seed tamam. Personel:", PERSONNEL.map((p) => p.name).join(", "));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
