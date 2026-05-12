import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";

export async function POST() {
  const session = await getServerSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existing = await prisma.attendanceLog.findFirst({
    where: { userId: session.userId, date: { gte: today } },
    orderBy: { date: "desc" }
  });

  if (!existing || !existing.checkIn) {
    return NextResponse.json({ error: "Check-in required" }, { status: 400 });
  }

  if (existing.checkOut) {
    return NextResponse.json({ error: "Already checked out" }, { status: 400 });
  }

  const log = await prisma.attendanceLog.update({
    where: { id: existing.id },
    data: { checkOut: new Date() }
  });

  return NextResponse.json(log);
}
