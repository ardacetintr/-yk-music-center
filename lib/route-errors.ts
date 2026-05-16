import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";
import { getDatabaseEnvProblem } from "@/lib/database-env";

function zodUserMessage(err: ZodError): string {
  const flat = err.flatten().fieldErrors;
  if (flat.phone?.length) return "Telefon numarası geçersiz veya çok kısa (en az 10 hane).";
  if (flat.email?.length) return "Geçerli bir e-posta adresi girin.";
  if (flat.name?.length) return "Ad en az 2 karakter olmalıdır.";
  if (flat.instrument?.length) return "Enstrüman en az 2 karakter olmalıdır.";
  if (flat.instruments?.length) return flat.instruments[0] ?? "Branş bilgisini kontrol edin.";
  if (flat.parentName?.length) return "Veli adı soyadı en az 2 karakter olmalıdır.";
  if (flat.parentPhone?.length) return "Veli telefonu geçersiz veya çok kısa (en az 10 hane).";
  if (flat.experience?.length) return "Deneyim (yıl) bilgisini kontrol edin.";
  const form = err.flatten().formErrors;
  if (form.length) return form[0];
  return "Gönderilen bilgiler geçersiz.";
}

export function routeErrorResponse(error: unknown): NextResponse {
  const dbEnvProblem = getDatabaseEnvProblem();
  if (dbEnvProblem) {
    return NextResponse.json({ message: dbEnvProblem }, { status: 503 });
  }

  if (error instanceof ZodError) {
    return NextResponse.json({ message: zodUserMessage(error) }, { status: 422 });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      const targets = error.meta?.target;
      const t = Array.isArray(targets) ? targets.join(" ") : String(targets ?? "");
      const dupPhoneOrEmail = t.includes("email") || t.includes("phone");
      return NextResponse.json(
        {
          message: dupPhoneOrEmail
            ? "Bu telefon numarası ile zaten kayıt var."
            : "Bu kayıt benzersizlik kuralına takılıyor."
        },
        { status: 409 }
      );
    }
    if (error.code === "P1000") {
      return NextResponse.json(
        {
          message:
            "PostgreSQL kullanıcı adı veya şifresi hatalı (.env içindeki DATABASE_URL). Kurulumda belirlediğiniz postgres şifresini kullanın; şifrede @ : / # gibi karakterler varsa URL içinde kodlanmış olmalıdır."
        },
        { status: 503 }
      );
    }
    if (error.code === "P1001" || error.code === "P1017") {
      return NextResponse.json(
        {
          message:
            "Veritabanına bağlanılamıyor. PostgreSQL çalışıyor mu ve DATABASE_URL doğru mu kontrol edin."
        },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { message: "Veritabanı işlemi başarısız. Lütfen tekrar deneyin." },
      { status: 400 }
    );
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    const raw = error.message;
    if (raw.includes("P1000") || raw.toLowerCase().includes("authentication failed")) {
      return NextResponse.json(
        {
          message:
            "PostgreSQL kullanıcı adı veya şifresi hatalı (.env içindeki DATABASE_URL). pgAdmin veya kurulumda kullandığınız kullanıcı ve şifreyi yazın."
        },
        { status: 503 }
      );
    }
    if (raw.includes("DATABASE_URL") || raw.includes("Environment variable not found")) {
      const msg = getDatabaseEnvProblem();
      return NextResponse.json(
        { message: msg ?? "Veritabanı bağlantı ayarı eksik veya hatalı." },
        { status: 503 }
      );
    }
    return NextResponse.json(
      {
        message:
          "Veritabanı bağlantısı kurulamadı. Yerelde BASLA.cmd çalıştırın; canlı sitede TURSO-VERCEL-KURULUM.cmd adımlarını uygulayın."
      },
      { status: 503 }
    );
  }

  if (error instanceof Error && error.message.includes("P1000")) {
    return NextResponse.json(
      {
        message:
          "PostgreSQL şifresi veya kullanıcı adı yanlış. .env dosyasındaki DATABASE_URL içinde kullanıcı ve şifreyi güncelleyin (örnek: postgresql://postgres:SIFRENIZ@localhost:5432/music_center?schema=public)."
      },
      { status: 503 }
    );
  }

  if (error instanceof Error && error.message.includes("Environment variable not found: DATABASE_URL")) {
    const msg = getDatabaseEnvProblem();
    return NextResponse.json(
      { message: msg ?? "Veritabanı bağlantı ayarı eksik veya hatalı." },
      { status: 503 }
    );
  }

  return NextResponse.json({ message: "Beklenmeyen bir hata oluştu." }, { status: 500 });
}

export async function readJsonBody(request: Request): Promise<
  | { ok: true; body: unknown }
  | { ok: false; response: NextResponse }
> {
  const MAX_BYTES = 96 * 1024;
  const len = request.headers.get("content-length");
  if (len && Number(len) > MAX_BYTES) {
    return {
      ok: false,
      response: NextResponse.json({ message: "İstek gövdesi çok büyük." }, { status: 413 })
    };
  }
  try {
    const text = await request.text();
    if (text.length > MAX_BYTES) {
      return {
        ok: false,
        response: NextResponse.json({ message: "İstek gövdesi çok büyük." }, { status: 413 })
      };
    }
    if (!text.trim()) {
      return { ok: true, body: {} };
    }
    const body = JSON.parse(text) as unknown;
    return { ok: true, body };
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ message: "Geçersiz istek gövdesi." }, { status: 400 })
    };
  }
}
