import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { teacherUpdateSchema } from "@/lib/validations";
import { phoneToEmail } from "@/lib/phone";
import { serializeTeacherInstruments } from "@/lib/teacher-instruments";
import { readJsonBody, routeErrorResponse } from "@/lib/route-errors";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.teacher.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ message: "Kayıt bulunamadı." }, { status: 404 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const raw = await readJsonBody(request);
    if (!raw.ok) return raw.response;
    const parsed = teacherUpdateSchema.parse(raw.body);

    const teacher = await prisma.teacher.findUnique({
      where: { id },
      select: { userId: true }
    });
    if (!teacher) {
      return NextResponse.json({ message: "Öğretmen bulunamadı." }, { status: 404 });
    }

    const data: {
      instruments?: string;
      tcKimlikNo?: string | null;
      fatherName?: string | null;
      address?: string | null;
      birthDate?: string | null;
      birthPlace?: string | null;
      employmentStartDate?: string | null;
      insuranceStartDate?: string | null;
      approved?: boolean;
      phone?: string;
    } = {};
    if (parsed.instruments !== undefined) {
      data.instruments = serializeTeacherInstruments(parsed.instruments);
    }
    if (parsed.tcKimlikNo !== undefined) data.tcKimlikNo = parsed.tcKimlikNo ?? null;
    if (parsed.fatherName !== undefined) data.fatherName = parsed.fatherName ?? null;
    if (parsed.address !== undefined) data.address = parsed.address ?? null;
    if (parsed.birthDate !== undefined) data.birthDate = parsed.birthDate ?? null;
    if (parsed.birthPlace !== undefined) data.birthPlace = parsed.birthPlace ?? null;
    if (parsed.employmentStartDate !== undefined) {
      data.employmentStartDate = parsed.employmentStartDate ?? null;
    }
    if (parsed.insuranceStartDate !== undefined) {
      data.insuranceStartDate = parsed.insuranceStartDate ?? null;
    }
    if (parsed.approved !== undefined) data.approved = parsed.approved;
    if (parsed.phone !== undefined) data.phone = parsed.phone;

    if (parsed.phone !== undefined) {
      await prisma.$transaction([
        prisma.user.update({
          where: { id: teacher.userId },
          data: { email: phoneToEmail(parsed.phone) }
        }),
        prisma.teacher.update({
          where: { id: id },
          data
        })
      ]);
    } else if (Object.keys(data).length > 0) {
      await prisma.teacher.update({
        where: { id: id },
        data
      });
    }

    const updated = await prisma.teacher.findUnique({
      where: { id: id },
      include: { user: true }
    });
    return NextResponse.json(updated);
  } catch (error) {
    return routeErrorResponse(error);
  }
}
