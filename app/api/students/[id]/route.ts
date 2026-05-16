import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { studentUpdateSchema } from "@/lib/validations";
import { readJsonBody, routeErrorResponse } from "@/lib/route-errors";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.student.delete({ where: { id } });
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
    const parsed = studentUpdateSchema.parse(raw.body);

    const student = await prisma.student.findUnique({
      where: { id },
      select: { userId: true }
    });
    if (!student) {
      return NextResponse.json({ message: "Öğrenci bulunamadı." }, { status: 404 });
    }

    const data: {
      instrument?: string;
      parentName?: string | null;
      parentPhone?: string | null;
    } = {};
    if (parsed.instrument !== undefined) data.instrument = parsed.instrument;
    if (parsed.parentName !== undefined) data.parentName = parsed.parentName;
    if (parsed.parentPhone !== undefined) data.parentPhone = parsed.parentPhone;

    if (Object.keys(data).length > 0) {
      await prisma.student.update({
        where: { id },
        data
      });
    }

    const updated = await prisma.student.findUnique({
      where: { id },
      include: { user: true }
    });
    return NextResponse.json(updated);
  } catch (error) {
    return routeErrorResponse(error);
  }
}
