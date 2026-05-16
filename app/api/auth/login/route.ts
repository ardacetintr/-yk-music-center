import { NextResponse } from "next/server";
import {
  comparePassword,
  createSession,
  setSessionCookie,
  type SessionPayload
} from "@/lib/auth";
import { tryPersonnelAdminLogin } from "@/lib/admin-personnel-login";
import { loginSchema } from "@/lib/validations";
import { normalizePhone } from "@/lib/phone";
import { findUserByLoginPhone } from "@/lib/auth-lookup";
import { foldTurkishCharsForPassword } from "@/lib/password-login-normalize";
import { readJsonBody, routeErrorResponse } from "@/lib/route-errors";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@/lib/roles";
import { allowRateLimit, getClientIp } from "@/lib/rate-limit";

type LoginUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  passwordHash: string;
};

async function resolveLoginUser(
  normalizedPhone: string,
  password: string | undefined
): Promise<LoginUser | "multi-parent" | "wrong-credentials" | null> {
  let user: LoginUser | null = null;

  try {
    let dbUser = await findUserByLoginPhone(normalizedPhone);

    if (!dbUser) {
      const byParent = await prisma.student.findMany({
        where: { parentPhone: normalizedPhone },
        include: { user: true }
      });
      if (byParent.length === 1) {
        dbUser = byParent[0].user;
      } else if (byParent.length > 1) {
        return "multi-parent";
      }
    }

    if (dbUser) {
      const skipPassword = dbUser.role === UserRole.STUDENT || dbUser.role === UserRole.TEACHER;
      if (skipPassword) {
        user = dbUser;
      } else {
        const pwd = password ?? "";
        if (pwd.length < 6) return "wrong-credentials";
        let valid = await comparePassword(pwd, dbUser.passwordHash);
        if (!valid) {
          const folded = foldTurkishCharsForPassword(pwd);
          if (folded !== pwd) {
            valid = await comparePassword(folded, dbUser.passwordHash);
          }
        }
        if (!valid) return "wrong-credentials";
        user = dbUser;
      }
    }
  } catch {
    user = null;
  }

  if (user) return user;

  const personnel = tryPersonnelAdminLogin(normalizedPhone, password ?? "");
  if (personnel) return personnel;

  return null;
}

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
    const result = await resolveLoginUser(normalizedPhone, parsed.password);

    if (result === "multi-parent") {
      return NextResponse.json(
        {
          message:
            "Bu veli numarasına bağlı birden fazla öğrenci kaydı var. Giriş için yöneticiye başvurun."
        },
        { status: 401 }
      );
    }

    if (!result || result === "wrong-credentials") {
      return NextResponse.json({ message: "Telefon veya şifre hatalı." }, { status: 401 });
    }

    const token = await createSession({
      userId: result.id,
      role: result.role as SessionPayload["role"],
      email: result.email,
      name: result.name
    });

    const response = NextResponse.json({ ok: true, role: result.role });
    setSessionCookie(response, token);
    return response;
  } catch (error) {
    return routeErrorResponse(error);
  }
}
