import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "@/lib/auth";
import { buildTeacherContractMergeData } from "@/lib/teacher-contract-data";
import { resolveTeacherContractTemplatePath } from "@/lib/teacher-contract-template-path";
import { fillTeacherContractTemplate } from "@/lib/teacher-contract-fill-text";
import { filledContractTextToDocxBuffer } from "@/lib/teacher-contract-build-docx";
import { filledContractTextToPdfBuffer } from "@/lib/teacher-contract-build-pdf";
import { bufferToResponseBody } from "@/lib/binary-body";
import { access } from "fs/promises";
import { constants as FsConstants } from "fs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Güvenlik:
 * - Yalnızca ADMIN oturumu (JWT çerezi).
 * - Şablon göreli path; mutlak path / kaçış yok.
 * - Çıktı no-store; dosya adında kullanıcı girdisi yok (cuid ile ASCII ad).
 * - Hata gövdelerinde KVKK için ayrıntı sızmaz.
 */

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ message: "Bu işlem için yetkiniz yok." }, { status: 403 });
  }

  const { id } = await params;
  const teacherId = id?.trim();
  if (!teacherId) {
    return NextResponse.json({ message: "Geçersiz istek." }, { status: 400 });
  }

  const url = new URL(request.url);
  const formatRaw = url.searchParams.get("format")?.trim().toLowerCase() ?? "docx";
  const format = formatRaw === "pdf" ? "pdf" : formatRaw === "docx" ? "docx" : null;
  if (!format) {
    return NextResponse.json(
      { message: "Geçersiz biçim. `format=docx` veya `format=pdf` kullanın." },
      { status: 400 }
    );
  }

  const tpl = resolveTeacherContractTemplatePath();
  if (!tpl.ok) {
    return NextResponse.json(
      { message: "Şablon yolu güvenlik politikasına uygun değil. Yöneticiye bildirin." },
      { status: 500 }
    );
  }

  try {
    await access(tpl.absolutePath, FsConstants.R_OK);
  } catch {
    return NextResponse.json(
      {
        message:
          "İş sözleşmesi metin şablonu bulunamadı. `private/teacher-contract-template.txt` dosyasını ekleyin veya TEACHER_CONTRACT_TEMPLATE_PATH ile göreli .txt yolu verin.",
      },
      { status: 404 }
    );
  }

  const teacher = await prisma.teacher.findUnique({
    where: { id: teacherId },
    include: { user: true },
  });

  if (!teacher) {
    return NextResponse.json({ message: "Öğretmen bulunamadı." }, { status: 404 });
  }

  let buffer: Buffer;
  let contentType: string;
  let filenameSuffix: string;

  try {
    const templateText = await readFile(tpl.absolutePath, "utf8");
    const data = buildTeacherContractMergeData(teacher);
    const filled = fillTeacherContractTemplate(templateText, data);

    if (format === "pdf") {
      buffer = await filledContractTextToPdfBuffer(filled);
      contentType = "application/pdf";
      filenameSuffix = "pdf";
    } else {
      buffer = await filledContractTextToDocxBuffer(filled);
      contentType =
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      filenameSuffix = "docx";
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    console.error("teacher-contract GET: üretim hatası", msg || "unknown", e);
    if (msg === "PDFMAKE_ROBOTO_FONTS_MISSING") {
      return NextResponse.json(
        {
          message:
            "PDF oluşturulamadı: pdfmake yazı tipi dosyaları bulunamadı. Proje kökünde `npm install` çalıştırıp sunucuyu yeniden başlatın.",
        },
        { status: 500 }
      );
    }
    return NextResponse.json(
      {
        message:
          "Sözleşme oluşturulamadı. Şablonun UTF-8 .txt olduğundan ve yer tutucuların SOZLESME-SABLON-ALANLARI.txt ile eşleştiğinden emin olun. Bağımlılıklar için `npm install` gerekebilir.",
      },
      { status: 500 }
    );
  }

  const safeFile = `is-sozlesmesi-${teacherId.slice(-12)}.${filenameSuffix}`;

  return new NextResponse(bufferToResponseBody(buffer), {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${safeFile}"`,
      "Cache-Control": "no-store, private",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
