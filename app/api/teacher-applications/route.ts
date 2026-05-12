import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { teacherApplicationSchema } from "@/lib/validations";
import { readJsonBody, routeErrorResponse } from "@/lib/route-errors";

export async function GET() {
  const applications = await prisma.teacherApplication.findMany({
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json(applications);
}

export async function POST(request: Request) {
  try {
    const raw = await readJsonBody(request);
    if (!raw.ok) return raw.response;
    const parsed = teacherApplicationSchema.parse(raw.body);
    const application = await prisma.teacherApplication.create({ data: parsed });
    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    return routeErrorResponse(error);
  }
}
