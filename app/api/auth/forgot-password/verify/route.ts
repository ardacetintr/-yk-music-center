import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { forgotPasswordVerifySchema } from "@/lib/validations";
import { normalizePhone } from "@/lib/phone";
import { findAdminByLoginPhone } from "@/lib/auth-lookup";
import { readJsonBody, routeErrorResponse } from "@/lib/route-errors";
import { allowRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    if (!allowRateLimit(`forgot-pwd-verify:${ip}`, 20, 15 * 60 * 1000)) {
      return NextResponse.json(
        { message: "Çok fazla deneme. Lütfen bir süre sonra tekrar deneyin." },
        { status: 429 }
      );
    }

    const raw = await readJsonBody(request);
    if (!raw.ok) return raw.response;

    const parsed = forgotPasswordVerifySchema.parse(raw.body);
    const normalized = normalizePhone(parsed.phone);
    const user = await findAdminByLoginPhone(normalized);

    if (!user) {
      return NextResponse.json(
        { message: "Kullanıcı bulunamadı veya kod geçersiz." },
        { status: 400 }
      );
    }

    const pending = await prisma.passwordResetCode.findMany({
      where: {
        userId: user.id,
        consumed: false,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: "desc" }
    });

    let matchedId: string | null = null;
    for (const row of pending) {
      const ok = await bcrypt.compare(parsed.code, row.codeHash);
      if (ok) {
        matchedId = row.id;
        break;
      }
    }

    if (!matchedId) {
      return NextResponse.json(
        { message: "Kod hatalı veya süresi dolmuş. Yeni kod isteyin." },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(parsed.password);

    await prisma.$transaction(async (tx) => {
      await tx.passwordResetCode.update({
        where: { id: matchedId },
        data: { consumed: true }
      });
      await tx.passwordResetCode.deleteMany({
        where: { userId: user.id, consumed: false }
      });
      await tx.user.update({
        where: { id: user.id },
        data: { passwordHash }
      });
    });

    return NextResponse.json({ message: "Şifreniz güncellendi. Giriş yapabilirsiniz." });
  } catch (error) {
    return routeErrorResponse(error);
  }
}
