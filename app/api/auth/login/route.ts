import { NextResponse } from "next/server";
import {
  comparePassword,
  createSession,
  setSessionCookie,
  type SessionPayload
} from "@/lib/auth";
import { loginSchema } from "@/lib/validations";
import { normalizePhone } from "@/lib/phone";
import { findUserByLoginPhone } from "@/lib/auth-lookup";
import { foldTurkishCharsForPassword } from "@/lib/password-login-normalize";
import { readJsonBody, routeErrorResponse } from "@/lib/route-errors";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@/lib/roles";
import { allowRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    if (!allowRateLimit(`login:${ip}`, 40, 15 * 60 * 1000)) {
      return NextResponse.json(
        { message: "Çok fazla giriş denemesi. Lütfen bir süre sonra tekrar deneyin." },
        { status: 429 }
      );
    }

    const raw = await readJsonBody(request);
    if (!raw.ok) return raw.response;
    const parsed = loginSchema.parse(raw.body);

    const normalizedPhone = normalizePhone(parsed.phone);
    let user = await findUserByLoginPhone(normalizedPhone);

    if (!user) {
      const byParent = await prisma.student.findMany({
        where: { parentPhone: normalizedPhone },
        include: { user: true }
      });
      if (byParent.length === 1) {
        user = byParent[0].user;
      } else if (byParent.length > 1) {
        return NextResponse.json(
          {
            message:
              "Bu veli numarasına bağlı birden fazla öğrenci kaydı var. Giriş için yöneticiye başvurun."
          },
          { status: 401 }
        );
      }
    }

    if (!user) {
      return NextResponse.json({ message: "Telefon veya şifre hatalı." }, { status: 401 });
    }

    const skipPassword = user.role === UserRole.STUDENT || user.role === UserRole.TEACHER;

    let valid = skipPassword;
    if (!skipPassword) {
      const pwd = parsed.password ?? "";
      if (pwd.length < 6) {
        return NextResponse.json(
          { message: "Yönetici girişi için şifre gereklidir (en az 6 karakter)." },
          { status: 401 }
        );
      }
      valid = await comparePassword(pwd, user.passwordHash);
      if (!valid) {
        const folded = foldTurkishCharsForPassword(pwd);
        if (folded !== pwd) {
          valid = await comparePassword(folded, user.passwordHash);
        }
      }
    }

    if (!valid) {
      return NextResponse.json({ message: "Telefon veya şifre hatalı." }, { status: 401 });
    }

    const token = await createSession({
      userId: user.id,
      role: user.role as SessionPayload["role"],
      email: user.email,
      name: user.name
    });

    const response = NextResponse.json({ ok: true, role: user.role });
    setSessionCookie(response, token);
    return response;
  } catch (error) {
    return routeErrorResponse(error);
  }
}
