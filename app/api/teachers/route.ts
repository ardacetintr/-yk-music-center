import { NextResponse } from "next/server";
import { UserRole } from "@/lib/roles";
import { prisma } from "@/lib/prisma";
import { hashPlaceholderUserPassword } from "@/lib/auth";
import { teacherCreateSchema } from "@/lib/validations";
import { normalizePhone, phoneToEmail } from "@/lib/phone";
import { attachTeacherRowToAdminUser } from "@/lib/link-teacher-to-admin-user";
import { serializeTeacherInstruments } from "@/lib/teacher-instruments";
import { readJsonBody, routeErrorResponse } from "@/lib/route-errors";

export async function GET() {
  const teachers = await prisma.teacher.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json(teachers);
}

export async function POST(request: Request) {
  try {
    const raw = await readJsonBody(request);
    if (!raw.ok) return raw.response;
    const parsed = teacherCreateSchema.parse(raw.body);
    const normalizedPhone = normalizePhone(parsed.phone);
    const email = phoneToEmail(normalizedPhone);
    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing?.role === UserRole.ADMIN) {
      const profile = {
        instrumentsJson: serializeTeacherInstruments(parsed.instruments),
        tcKimlikNo: parsed.tcKimlikNo ?? null,
        fatherName: parsed.fatherName ?? null,
        address: parsed.address ?? null,
        birthDate: parsed.birthDate ?? null,
        birthPlace: parsed.birthPlace ?? null,
        employmentStartDate: parsed.employmentStartDate ?? null,
        insuranceStartDate: parsed.insuranceStartDate ?? null
      };
      const attached = await attachTeacherRowToAdminUser({
        userId: existing.id,
        name: parsed.name,
        phone: normalizedPhone,
        profile
      });
      if (!attached.ok) {
        return NextResponse.json(
          { message: "Bu numara zaten yönetici ve öğretmen olarak kayıtlı." },
          { status: 409 }
        );
      }
      const teacher = await prisma.teacher.findUnique({
        where: { userId: existing.id },
        include: { user: true }
      });
      return NextResponse.json(teacher, { status: 201 });
    }

    if (existing) {
      return NextResponse.json(
        { message: "Bu telefon numarası ile zaten kayıt var." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPlaceholderUserPassword();

    const user = await prisma.user.create({
      data: {
        name: parsed.name,
        email,
        passwordHash,
        role: UserRole.TEACHER
      }
    });

    const teacher = await prisma.teacher.create({
      data: {
        userId: user.id,
        phone: normalizedPhone,
        instruments: serializeTeacherInstruments(parsed.instruments),
        tcKimlikNo: parsed.tcKimlikNo ?? null,
        fatherName: parsed.fatherName ?? null,
        address: parsed.address ?? null,
        birthDate: parsed.birthDate ?? null,
        birthPlace: parsed.birthPlace ?? null,
        employmentStartDate: parsed.employmentStartDate ?? null,
        insuranceStartDate: parsed.insuranceStartDate ?? null,
        approved: true
      }
    });

    return NextResponse.json(teacher, { status: 201 });
  } catch (error) {
    return routeErrorResponse(error);
  }
}
