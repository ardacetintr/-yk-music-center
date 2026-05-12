import { NextResponse } from "next/server";
import { UserRole } from "@/lib/roles";
import { prisma } from "@/lib/prisma";
import { hashPlaceholderUserPassword } from "@/lib/auth";
import { studentRegistrationSchema } from "@/lib/validations";
import { normalizePhone } from "@/lib/phone";
import { readJsonBody, routeErrorResponse } from "@/lib/route-errors";
import { randomUUID } from "node:crypto";

export async function GET() {
  const students = await prisma.student.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json(students);
}

export async function POST(request: Request) {
  try {
    const raw = await readJsonBody(request);
    if (!raw.ok) return raw.response;
    const parsed = studentRegistrationSchema.parse(raw.body);
    const parentPhone = normalizePhone(parsed.parentPhone);
    const passwordHash = await hashPlaceholderUserPassword();
    const email = `stud_${randomUUID().replace(/-/g, "")}@internal.local`;

    const user = await prisma.user.create({
      data: {
        name: parsed.name,
        email,
        passwordHash,
        role: UserRole.STUDENT
      }
    });

    const student = await prisma.student.create({
      data: {
        userId: user.id,
        instrument: parsed.instrument,
        parentName: parsed.parentName ?? null,
        parentPhone
      }
    });

    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    return routeErrorResponse(error);
  }
}
