import { randomInt } from "node:crypto";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { forgotPasswordRequestSchema } from "@/lib/validations";
import { normalizePhone, toTurkeyE164 } from "@/lib/phone";
import { findAdminByLoginPhone } from "@/lib/auth-lookup";
import { sendVerificationSms } from "@/lib/sms";
import { readJsonBody, routeErrorResponse } from "@/lib/route-errors";
import { allowRateLimit, getClientIp } from "@/lib/rate-limit";

const GENERIC_OK =
  "Bu numara sistemde kayıtlı bir personel hesabına bağlıysa, doğrulama kodu SMS ile gönderilir.";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    if (!allowRateLimit(`forgot-pwd-req:${ip}`, 8, 60 * 60 * 1000)) {
      return NextResponse.json(
        { message: "Çok fazla istek. Lütfen daha sonra tekrar deneyin." },
        { status: 429 }
      );
    }

    const raw = await readJsonBody(request);
    if (!raw.ok) return raw.response;

    const parsed = forgotPasswordRequestSchema.parse(raw.body);
    const normalized = normalizePhone(parsed.phone);
    const user = await findAdminByLoginPhone(normalized);

    if (!user) {
      return NextResponse.json({ message: GENERIC_OK });
    }

    await prisma.passwordResetCode.deleteMany({
      where: { userId: user.id, consumed: false }
    });

    const code = String(randomInt(100000, 1000000));
    const codeHash = await bcrypt.hash(code, 10);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    const e164 = toTurkeyE164(normalized);
    const smsBody = `Öykü Music Center şifre sıfırlama kodunuz: ${code}. 15 dakika içinde geçerlidir.`;

    const sms = await sendVerificationSms(e164, smsBody);

    if (!sms.ok) {
      if (process.env.NODE_ENV === "development") {
        await prisma.passwordResetCode.create({
          data: { userId: user.id, codeHash, expiresAt }
        });
        return NextResponse.json({
          message:
            "Twilio yapılandırılmadığı için SMS gönderilemedi. Geliştirme ortamında doğrulama kodu yanıtta verilir.",
          devCode: code
        });
      }
      return NextResponse.json(
        {
          message:
            "SMS gönderilemedi. TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN ve TWILIO_FROM_NUMBER değerlerini .env dosyasına ekleyin."
        },
        { status: 503 }
      );
    }

    await prisma.passwordResetCode.create({
      data: { userId: user.id, codeHash, expiresAt }
    });

    return NextResponse.json({ message: GENERIC_OK });
  } catch (error) {
    return routeErrorResponse(error);
  }
}
